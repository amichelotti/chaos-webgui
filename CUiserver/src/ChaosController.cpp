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
#include "dev_status.h"
#include "common/debug/debug.h"
using namespace std;
using namespace Mongoose;
using namespace chaos::ui;
using namespace chaos;
std::map<std::string,chaos::ui::DeviceController*> ChaosController::devs;
void ChaosController::setMDSTimeout(int timeo){
  mds_timeout = timeo;
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

void ChaosController::addDevice(std::string name,chaos::ui::DeviceController*d){
     devs[name]=d;
}

void ChaosController::removeDevice(std::string name){
      std::map<std::string,chaos::ui::DeviceController*>::iterator idevs;
      idevs = devs.find(name);
      if(idevs!=devs.end()){
          HLDataApi::getInstance()->disposeDeviceControllerPtr(idevs->second);
          
          devs.erase(idevs);
      }

}
int ChaosController::fetchDataSet(DeviceController *ctrl,char*jsondest,int size){
  CDataWrapper* data;
  try{
    if(ctrl){
      ctrl->fetchCurrentDeviceValue();
    } else {
      return -2;
    }
    data = ctrl->getCurrentData();
    if(data==NULL){
	
      return -3;
    }
  }
  catch (CException& e) {

    return -4;
  }
  strncpy(jsondest,data->getJSONString().c_str(),size);
     
  return 0;
}
  
void ChaosController::handleCU(Request &request, StreamResponse &response){
  char result[4096];
  *result=0;  
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
      controller = devs[devname];
      status.append_log("retriving controller for:"+devname);
    } else {
      try {
	controller = HLDataApi::getInstance()->getControllerForDeviceID(devname, mds_timeout);
	status.append_log("creating new controller for:"+devname);
      } catch(CException e){
	status.append_error(e.what());
      }
      if(controller==NULL){
	status.append_error("cannot allocate new controller for:"+devname);
	status.insert_json(result);
	response<<result;
	return ;
      }
      addDevice(devname,controller);
      
    }

    controller->setRequestTimeWaith(mds_timeout);
    err=controller->getState(deviceState);
    
    if(err == ErrorCode::EC_TIMEOUT){            
      
      status.append_error("Timeout getting State "+devname);
      removeDevice(devname);
      status.insert_json(result);
      response<<result;
      return ;
    }
    status.status(deviceState);
    controller->setRequestTimeWaith(mds_timeout);
    controller->setupTracking();
    if(cmd=="init"){
      status.append_log("init device:"+devname);
      err = controller->initDevice();
    } else if(cmd =="start"){            
      status.append_log("starting device:"+devname);
      err = controller->startDevice();
    } else if(cmd=="stop"){
      status.append_log("stopping device:"+devname);
      err = controller->stopDevice();
    } else if(cmd =="deinit"){
      status.append_log("deinit device:"+devname);
      err= controller->deinitDevice();
    } else if(cmd =="sched" && !parm.empty()){
      status.append_log("sched device:"+devname);
      err=  controller->setScheduleDelay(atol((char*)parm.c_str()));
    } else if(cmd !="status") {
      status.append_log("send cmd:\""+cmd +"\" args: \""+ parm +"\" to device:"+devname);
      err= sendCmd(controller,cmd,(char*)(parm.empty()?"":parm.c_str()));
    }

    if(err == ErrorCode::EC_TIMEOUT){
      status.append_error("Timeout  :"+devname);
      status.insert_json(result);
      response<<result;
      removeDevice(devname);
      return ;
    } else if(err !=0){
      status.append_error("Error in:"+devname);
      status.insert_json(result);
      response<<result;
      return ;
    }
    fetchDataSet(controller,result,sizeof(result));
  }
  status.insert_json(result);
  response<<result;

}

void ChaosController::setup(){
  addRoute("GET", "/CU", ChaosController, handleCU);
}


