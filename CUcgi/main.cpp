/* 
 * File:   main.cpp
 * Author: michelo
 *
 * Created on May 27, 2014, 2:03 PM
 */

#include <iostream>
#include <vector>
#include <string>

#include "cgicc/CgiDefs.h"
#include "cgicc/Cgicc.h"
#include "cgicc/HTTPHTMLHeader.h"
#include "cgicc/HTMLClasses.h"

#include <chaos/ui_toolkit/ChaosUIToolkit.h>
#include <chaos/ui_toolkit/LowLevelApi/LLRpcApi.h>
#include <chaos/ui_toolkit/ChaosUIToolkitCWrapper.h>
#include <chaos/ui_toolkit/HighLevelApi/HLDataApi.h>
#include <chaos/ui_toolkit/HighLevelApi/DeviceController.h>

#include <chaos/common/data/CDataWrapper.h>
#include <chaos/ui_toolkit/ChaosUIToolkitCWrapper.h>

#include <stdio.h>
#include <stdlib.h>
#include "common/debug/debug.h"

using namespace std;
using namespace cgicc;     // Or reference as cgicc::Cgicc formData; below in object instantiation.
	 
#define TIMEOUT 60000

#define MDS "mdsserver:5000"
using namespace std;
using namespace std;
using namespace chaos;
using namespace chaos::ui;
using namespace boost;
/*
 
 */

struct dev_info_status{
  char dev_status[256];
  char error_status[256];
  char log_status[256];
  dev_info_status(){*dev_status=0;*error_status=0;*log_status=0;}

  void status(CUStateKey::ControlUnitState deviceState){
    if(deviceState==CUStateKey::DEINIT){
      strcpy(dev_status,"deinit");
    } else if(deviceState == CUStateKey::INIT){
        strcpy(dev_status,"init");
    } else if(deviceState == CUStateKey::START){
        strcpy(dev_status,"start");
    } else if(deviceState == CUStateKey::STOP){
          strcpy(dev_status,"stop");
    } else {
        strcpy(dev_status,"uknown");
    }
  }
  void append_log(std::string log){
    snprintf(log_status,sizeof(log_status),"%s%s;",log_status,log.c_str());
 
  }
  void append_error(std::string log){
    snprintf(error_status,sizeof(error_status),"%s%s;",error_status,log.c_str());
 
  }
  void insert_json(char*json){
    int some_item=0;
    int open_brace=0;
    if(json==NULL) return;
    if(*json==0){
        sprintf(json,"{\"dev_status\":\"%s\",\"error_status\":\"%s\",\"log_status\":\"%s\"}",dev_status,error_status,log_status);
	return;
    }
    while(*json!=0){
        
      if(*json=='{'){
          char temp[4096];
          strncpy(temp,json+1,4096);
	sprintf(json,"{\"dev_status\":\"%s\",\"error_status\":\"%s\",\"log_status\":\"%s\",%s",dev_status,error_status,log_status,temp);
	return;
      } 
        json++;
    }
  }
};


int initChaosToolkit(const char* mds){
    char tmpInitString[256];
    int err;

 
      //log-on-console=true\nlog-level=debug
      sprintf(tmpInitString, "metadata-server=%s\n", mds);
      err = initToolkit(tmpInitString);
      if (err != 0) {
	//DPRINT("Error initToolkit %d\n", err);
	return 0;
      }
      //DPRINT("Toolkit initialised \"%s\"\n",tmpInitString);
      return 1;
       
}
 DeviceController *getDevice(const char* name){
     DeviceController *controller = NULL;
     controller = HLDataApi::getInstance()->getControllerForDeviceID(name);
     return controller;
 }
 
 
 DeviceController *initDevice(const char* name,int timeout){
     int err;
   DeviceController *controller = NULL;

    try{
            controller = HLDataApi::getInstance()->getControllerForDeviceID(name);
            if(controller) {
                int err=0;
                    //activate the traking
                controller->setupTracking();
                controller->setRequestTimeWaith(timeout);
                controller->initDevice();
               // controller->startDevice();
            } 
        } catch (CException& e) {
            DPRINT("eccezione %s\n",e.what());
            err = e.errorCode;
            return 0;
        }
   
    return controller;
  }

 DeviceController *startDevice(const char* name,int timeout){
     int err;
   DeviceController *controller = NULL;

    try{
            controller = HLDataApi::getInstance()->getControllerForDeviceID(name);
            if(controller) {
                int err=0;
                    //activate the traking
                controller->setupTracking();
                controller->setRequestTimeWaith(timeout);
                //controller->initDevice();
                controller->startDevice();
            }
        } catch (CException& e) {
            DPRINT("eccezione %s\n",e.what());
            err = e.errorCode;
            return 0;
        }
   
    return controller;
  }
 
 DeviceController *stopDevice(const char* name,int timeout){
     int err;
   DeviceController *controller = NULL;

    try{
            controller = HLDataApi::getInstance()->getControllerForDeviceID(name);
            if(controller) {
                int err=0;
                    //activate the traking
                //controller->setupTracking();
                //controller->setRequestTimeWaith(timeout);
                //controller->initDevice();
               controller->stopDevice();
            }
        } catch (CException& e) {
            DPRINT("eccezione %s\n",e.what());
            err = e.errorCode;
            return 0;
        }
   
    return controller;
  }
 
 DeviceController *deinitDevice(const char* name,int timeout){
   DeviceController *controller = NULL;

    try{
            controller = HLDataApi::getInstance()->getControllerForDeviceID(name);
            if(controller) {
                int err=0;
                    //activate the traking
                //controller->setupTracking();
                controller->setRequestTimeWaith(timeout);
                //controller->initDevice();
               controller->deinitDevice();
            }
        } catch (CException& e) {
            DPRINT("eccezione %s\n",e.what());
            return 0;
        }
   
    return controller;
  }
  int sendCmd(DeviceController *controller ,std::string cmd_alias_str,char*param){
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
  int fetchDataSet(DeviceController *ctrl,char*jsondest,int size){
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
    
 


int main(int argc, char** argv) {
    Cgicc form;
    char result[4096];
    DeviceController* dev=NULL;
    *result = 0;
    int doinit=0,dostart=0,dodeinit=0,dostop=0;
    form_iterator init =form.getElement("InitID");
    form_iterator start =form.getElement("StartID");
    form_iterator stop =form.getElement("StopID");
    form_iterator deinit =form.getElement("DeInitID");
    form_iterator status =form.getElement("status");

    form_iterator device =form.getElement("dev"); // dev=device_name, cmd:
    form_iterator command =form.getElement("cmd"); // dev=device_name, cmd:
    form_iterator param =form.getElement("parm"); // dev=device_name, cmd:
    form_iterator sched =form.getElement("sched");

    std::string cmd,parm,scheduling;
    const char *dev_name=NULL;
    dev_info_status dev_info;
    int update =0;
    
      // Send HTTP header
    cout << cgicc::HTTPHTMLHeader() << endl;

    //cout << "Content-Type: text/plain\n\nCharSet:UTF-8\n\n";
    if(initChaosToolkit(MDS)<=0){
        dev_info.append_error("cannot initialize toolkit");
        dev_info.insert_json(result);
        cout<<result<<endl;
        return -1;
     }
      // Set up the HTML document
    
     if(init != form.getElements().end()) {
       dev_name = (**init).c_str();
       
       dev_info.append_log("do init:" +(**init));
       doinit = 1;
      
     } else if(start!= form.getElements().end()) {
       dev_name = (**start).c_str();
       dev_info.append_log("do start:"+(**start));
       dostart=1;
     } else if(stop!= form.getElements().end()) {
       dev_name = (**stop).c_str();
       dev_info.append_log("do stop:"+(**stop));
       dostop =1;
     } else if(deinit!= form.getElements().end()) {
       dev_name =(**deinit).c_str();
       dev_info.append_log("do deinit:"+(**deinit));
       dodeinit=1;	

     } else if (status!=form.getElements().end()){
         dev_name = (**status).c_str();
         dev_info.append_log("do update status");
         update =1;
     } else{
         if(device!=form.getElements().end()){
	   dev_name = (**device).c_str();
	   dev_info.append_log("do update:"+(**device));
             update=2;
         }
         
         if(command!=form.getElements().end()){
             cmd = **command;
	     dev_info.append_log("do command:"+cmd);
         }
         
         if(param!=form.getElements().end()){
             parm = **param;
              dev_info.append_log(parm);
         }
         if(sched!=form.getElements().end()){
             scheduling = **sched;
             dev_info.append_log("do scheduling:"+scheduling);
         }
     }
    
    
    if(dev_name){
        try {
            dev = HLDataApi::getInstance()->getControllerForDeviceID(dev_name,TIMEOUT);
        }  catch (CException& e) {
          //  cout<< "error:"<<e.errorCode<<endl;
            if(e.errorCode==-2){
                 dev_info.append_log(string(dev_name) + " maybe :" + e.errorMessage);
                dev_info.insert_json(result);
                cout<<result<<endl;
                return 0;
            }
            /*if(e.errorCode==-3)*/{
             dev_info.append_error("exception " +string(dev_name) + ":" + e.errorMessage);
             dev_info.insert_json(result);
             cout<<result<<endl;
            return 0;
            }
        }

        if(dev==0){
          dev_info.append_error("cannot find device:"+string(dev_name));
          dev_info.insert_json(result);
          cout<<result<<endl;
          return 0;
        }
    }
   
   
    if(dev && dev_name){
        CUStateKey::ControlUnitState deviceState;
        int err;
        dev->setRequestTimeWaith(TIMEOUT);
        err=dev->getState(deviceState);
        if(err == ErrorCode::EC_TIMEOUT){
             dev_info.append_error("Timeout getting State "+string(dev_name));
             dev_info.insert_json(result);
             cout<<result<<endl;
            return 0;
        } 
        dev_info.status(deviceState);

        dev->setRequestTimeWaith(TIMEOUT);
        dev->setupTracking();
        if(doinit){
            err = dev->initDevice();
        }
        
        if(dostart){
           
            err = dev->startDevice();
        }
         if(dostop){
            err = dev->stopDevice();
        }
        if(dodeinit){
            err= dev->deinitDevice();
        }
        
        if(err == ErrorCode::EC_TIMEOUT){
            dev_info.append_error("Timeout  :"+string(dev_name));
            dev_info.insert_json(result);
            cout<<result<<endl;
            return 0;
        } else if(err !=0){
             dev_info.append_error("Error in:"+string(dev_name));
             dev_info.insert_json(result);
             cout<<result<<endl;
            return 0;
        }
        
        
        
        
        
        if(update==2){
            if(deviceState==CUStateKey::DEINIT){
                
                if(dev->initDevice()!=0){
                  dev_info.append_log("force init");
                  dev_info.append_error("Error forcining init:"+string(dev_name));
                  dev_info.insert_json(result);
                  cout<<result<<endl;
                  return 0;
                }
                
                 
            } 
            if(dev->startDevice()!=0){
                  dev_info.append_log("force start");
                  dev_info.append_error("Error forcining start:"+string(dev_name));
                  dev_info.insert_json(result);
                  cout<<result<<endl;
                  return 0;
             }
            }
            if(!scheduling.empty()){
                std::string l = "set scheduling delay" + scheduling;
                dev_info.append_log(l.c_str());
                dev->setScheduleDelay(atol((char*)scheduling.c_str()));
            }
            if(!cmd.empty()){
              //  cout<<"do command " + cmd + " param="+parm.c_str()<<endl;
                sendCmd(dev,cmd,(char*)parm.c_str());
            }
            fetchDataSet(dev,result,sizeof(result));
               
        
    }
    
    dev_info.insert_json(result);
    cout<<result<<endl;

    return 0;
}

