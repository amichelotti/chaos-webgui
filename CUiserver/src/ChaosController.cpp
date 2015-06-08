#ifdef _MSC_VER
#include <windows.h>
#else
#include <unistd.h>
#endif
#include <stdlib.h>
#include <signal.h>
#include <mongoose/Server.h>
#include <mongoose/WebController.h>

#include "ChaosController.h"

#include "common/debug/debug.h"
#include <sstream>
using namespace std;
using namespace Mongoose;
using namespace chaos::ui;
using namespace chaos::common::data;
using namespace chaos;
std::map<std::string,InfoDevice*> ChaosController::devs;
ChaosController::ChaosController(){
    mds_timeout = MDS_TIMEOUT;
    jsondest=(char*)malloc(MAX_STRING);
    size_json=MAX_STRING;
    if(jsondest==NULL){
        throw CException(-1,"cannot allocate resources","ChaosController()");
    }
     *jsondest=0;
}

void ChaosController::setMDSTimeout(int timeo){
  mds_timeout = timeo;
}

int ChaosController::sendAttr(DeviceController *controller ,std::string cmd_alias_str,char*param){

  int err = controller->setAttributeToValue(cmd_alias_str.c_str(), param, false);
  return err;

}
int ChaosController::sendCmd(DeviceController *controller ,std::string cmd_alias_str,char*param){
  int err;
  uint64_t cmd_id_tmp;
  std::auto_ptr<chaos::common::data::CDataWrapper> data_wrapper;

  if(param) {
    data_wrapper.reset(new chaos::common::data::CDataWrapper());
    if(data_wrapper.get())
      data_wrapper->setSerializedJsonData(param);
    else
      return -1001;
  }

  err = controller->submitSlowControlCommand(cmd_alias_str,
					     static_cast<chaos::common::batch_command::SubmissionRuleType::SubmissionRule>(0),
					     50,
					     cmd_id_tmp,
					     0,
					     0,
					     0,
					     data_wrapper.get());

  return err;
}


void ChaosController::addDevice(std::string name,InfoDevice*d){
     devs[name]=d;
}

void ChaosController::removeDevice(std::string name){
      std::map<std::string,InfoDevice*>::iterator idevs;
      idevs = devs.find(name);
      if(idevs!=devs.end()){

	HLDataApi::getInstance()->disposeDeviceControllerPtr(idevs->second->dev);
	delete(idevs->second);
	devs.erase(idevs);
      }

}
CDataWrapper* ChaosController::fetchDataSet(DeviceController *ctrl){
  CDataWrapper* data=NULL;
  try{
    if(ctrl){
      ctrl->fetchCurrentDeviceValue();
    } else {
      return NULL;
    }
    data = ctrl->getCurrentData();
    if(data==NULL){

      return NULL;
    }
    
    if(data->getJSONString().size()+MAX_STRING>size_json){
        jsondest=(char*)realloc(jsondest,data->getJSONString().size()+MAX_STRING);
        if(jsondest==NULL){
           throw CException(-1,"cannot allocate resources","fetching dataset");

        }
        size_json = data->getJSONString().size()+MAX_STRING;
    }
    strncpy(jsondest,data->getJSONString().c_str(),size_json);

    
  }
  catch (CException& e) {
	DERR("Exception reading dataset:%s",e.what());
     
    return NULL;
  }
  
 

  return data;
}


int ChaosController::checkError(int err,InfoDevice*idev,dev_info_status&status){

  if(err == ErrorCode::EC_TIMEOUT){
    std::stringstream st;
    idev->timeouts++;
    idev->totTimeout++;

    st<<"Timeout getting State "+idev->devname+ " tot timeout:" <<idev->totTimeout<<" consecutive:"<< idev->timeouts<<" current timeout:"<<idev->defaultTimeout;
    idev->defaultTimeout+=MDS_STEP_TIMEOUT;
    status.append_log(st.str());
    if(idev->timeouts> MDS_RETRY){
      status.append_error("Timeout getting State "+idev->devname);
      return 0;
    }
  } else if(err !=0){
    status.append_error("Error in:"+idev->devname);
  }
  return err;
}
void ChaosController::handleCU(Request &request, StreamResponse &response){
  *jsondest=0;
  InfoDevice *idev=NULL;
  chaos::ui::DeviceController* controller = NULL;
  std::string devname,cmd,parm;
  dev_info_status status;
  devname =request.get("dev");
  cmd = request.get("cmd");
  parm = request.get("parm");
  response.setHeader("Access-Control-Allow-Origin","*");
  if(!devname.empty() && ! cmd.empty()){
    CUStateKey::ControlUnitState deviceState;
    int err;

    if(devs.count(devname)>0){
      idev = devs[devname];
      if(idev){
	controller = idev->dev;
      }
      //      status.append_log("retriving controller for:"+devname);
    } else {
      try {
	controller = HLDataApi::getInstance()->getControllerForDeviceID(devname, mds_timeout);
	status.append_log("creating new controller for:"+devname);
      } catch(CException e){
	status.append_error(e.what());
      }
      if(controller==NULL){
	status.append_error("cannot allocate new controller for:"+devname);
	status.insert_json(jsondest);
	response<<jsondest;
	return ;
      }
      idev = new InfoDevice();
      if(idev!=NULL){
	idev->dev = controller;
	idev->timeouts= 0 ;
	idev->lastState = -1;
	idev->totTimeout=0;
	idev->defaultTimeout=mds_timeout;
	idev->devname = devname;
	idev->wostate=0;
	// try to get state
	controller->setRequestTimeWaith(idev->defaultTimeout);
	controller->setupTracking();
	err=controller->getState(deviceState);
	if(checkError(err,idev,status)){
	  // try to fetch data
	  if((fetchDataSet(controller))!=0){
	    // fetch ok
	    idev->wostate=1;
            
	    status.append_log("is http device:"+devname);
	    status.status(CUStateKey::START);
	    idev->lastState=CUStateKey::START;

	    CUIServerLDBG_<<devname <<" is a http device";
	  }
	}

	CUIServerLDBG_<<"caching device "<<devname;
	addDevice(devname,idev);
      } else {
	status.append_error("cannot allocate new info controller for:"+devname);
	
	status.insert_json(jsondest);
	response<<jsondest;
	return ;

      }


    }

    controller->setRequestTimeWaith(idev->defaultTimeout);
    if(idev->wostate==0){
      err=controller->getState(deviceState);
      if(checkError(err,idev,status)){
	DERR("error getting state %s, removing from cache...",devname.c_str());
      	removeDevice(devname);
	status.insert_json(jsondest);
	response<<jsondest;
	return;
    }

      idev->timeouts= 0 ;
      status.status(deviceState);
      idev->lastState = deviceState;
    } else {
      DPRINT("fetch dataset of %s (stateless)\n",devname.c_str());
      err=0;
      status.status(CUStateKey::START);
      idev->lastState=CUStateKey::START;
      fetchDataSet(controller);
      status.insert_json(jsondest);
      response<<jsondest;
      return;
    }

    controller->setupTracking();
    if(cmd=="init"){
      status.append_log("init device:"+devname);
      err = controller->initDevice();
      idev->wostate=0;
    } else if(cmd =="start"){
        idev->wostate=0;
        if(deviceState!=CUStateKey::INIT){
            controller->initDevice();
        }
      status.append_log("starting device:"+devname);
      err = controller->startDevice();
    } else if(cmd=="stop"){
        idev->wostate=0;
      status.append_log("stopping device:"+devname);
      err = controller->stopDevice();
    } else if(cmd =="deinit"){
        idev->wostate=0;
      status.append_log("deinit device:"+devname);
      err= controller->deinitDevice();
    } else if(cmd =="sched" && !parm.empty()){
      status.append_log("sched device:"+devname);
      err=  controller->setScheduleDelay(atol((char*)parm.c_str()));
    }else if(cmd =="attr") {
      status.append_log("send attr:\""+cmd +"\" args: \""+ parm +"\" to device:"+devname);
      err= sendAttr(controller,cmd,(char*)(parm.empty()?"":parm.c_str()));
    } else if(cmd !="status") {
      status.append_log("send cmd:\""+cmd +"\" args: \""+ parm +"\" to device:"+devname);
      err= sendCmd(controller,cmd,(char*)(parm.empty()?"":parm.c_str()));
    } else {
           if(idev->wostate==0){
               switch(deviceState){
                   case CUStateKey::DEINIT:{
                       LDBG_<<"Force "<<devname<<" in init from deinit";
                       err = controller->initDevice();
                       break;
                   }
                   case CUStateKey::INIT:{
                        LDBG_<<"Force "<<devname<<" in start from init";

                       err = controller->startDevice();
                       break;
                   }   
               }
           }
    }


    if(checkError(err,idev,status)){
      DERR("error removing device from cache:%s",devname.c_str());
      removeDevice(devname);
      status.insert_json(jsondest);
      response<<jsondest;
      return;
    }
    fetchDataSet(controller);
  }
  status.insert_json(jsondest);
  response<<jsondest;

}

void ChaosController::setup(){
  addRoute("GET", "/CU", ChaosController, handleCU);
}
