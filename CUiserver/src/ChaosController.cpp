#ifdef _MSC_VER
#include <windows.h>
#else
#include <unistd.h>
#endif
#include <stdlib.h>
#include <signal.h>
#include <mongoose/Server.h>
#include <mongoose/WebController.h>
#
#include "ChaosController.h"
#include "dev_status.h"
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
    
    chaos::ui::DeviceController* controller = NULL;
    std::string devname,cmd,parm;
    dev_info_status status;
    devname =request.get("dev");
    cmd = request.get("cmd");
    parm = request.get("parm");

    if(!devname.empty() && ! cmd.empty()){
        CUStateKey::ControlUnitState deviceState;
        int err;

        if(devs.count(devname)>0){
            controller = devs[devname];
        } else {
            try {
                controller = HLDataApi::getInstance()->getControllerForDeviceID(devname, mds_timeout);
                if(controller==NULL){
                    status.append_error("cannot allocate new controller");
                }
            } catch(CException e){
                status.append_error(e.what());
            }
            devs[devname]=controller;
        }

        controller->setRequestTimeWaith(mds_timeout);
        err=controller->getState(deviceState);

        if(err == ErrorCode::EC_TIMEOUT){            
            status.append_error("Timeout getting State "+devname);
            status.insert_json(result);
            response<<result;
            return ;
        }
        status.status(deviceState);
        controller->setRequestTimeWaith(mds_timeout);
        controller->setupTracking();
        if(cmd=="init"){
            err = controller->initDevice();
        } else if(cmd =="start"){            
            err = controller->startDevice();
        } else if(cmd=="stop"){
            err = controller->stopDevice();
        } else if(cmd =="deinit"){
            err= controller->deinitDevice();
        } else if(!parm.empty()){
           err= sendCmd(controller,cmd,(char*)parm.c_str());
        }

        if(err == ErrorCode::EC_TIMEOUT){
            status.append_error("Timeout  :"+devname);
            status.insert_json(result);
            response<<result;
            return ;
        } else if(err !=0){
             status.append_error("Error in:"+devname);
             status.insert_json(result);
             response<<result;
            return ;
        }
        fetchDataSet(controller,result,sizeof(result));
    }
    response<<result;

}

void ChaosController::setup(){
            addRoute("GET", "/CU", ChaosController, handleCU);
}


