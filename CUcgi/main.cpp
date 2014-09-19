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
	 

#define MDS "mdsserver:5000"
using namespace std;
using namespace std;
using namespace chaos;
using namespace chaos::ui;
using namespace boost;
/*
 
 */

int initChaosToolkit(const char* mds){
    char tmpInitString[256];
    int err;

 
      //log-on-console=true\nlog-level=debug
      sprintf(tmpInitString, "metadata-server=%s\n", mds);
      err = initToolkit(tmpInitString);
      if (err != 0) {
	DPRINT("Error initToolkit %d\n", err);
	return 0;
      }
      DPRINT("Toolkit initialised \"%s\"\n",tmpInitString);
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
               controller->deinitDevice();
            }
        } catch (CException& e) {
            DPRINT("eccezione %s\n",e.what());
            err = e.errorCode;
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
      strcpy(jsondest,"no data");
      if(ctrl){
          ctrl->fetchCurrentDeviceValue();
      } else {
          return -2;
      }
      data = ctrl->getCurrentData();
      if(data==NULL){
	cout<<"## cannot fetch"<<endl;
	return -3;
      }
      
      strncpy(jsondest,data->getJSONString().c_str(),size);
     
      return 0;
    }
    
 


int main(int argc, char** argv) {
    Cgicc form;
    char result[4096];
    DeviceController* dev=NULL;
    form_iterator init =form.getElement("InitID");
    form_iterator start =form.getElement("StartID");
    form_iterator stop =form.getElement("StopID");
    form_iterator deinit =form.getElement("DeInitID");

    form_iterator device =form.getElement("dev"); // dev=device_name, cmd:
    form_iterator command =form.getElement("cmd"); // dev=device_name, cmd:
    form_iterator param =form.getElement("param"); // dev=device_name, cmd:

    std::string cmd,parm;
      // Send HTTP header
    cout << "Content-Type: text/plain\n\n";
        initChaosToolkit(MDS);
      // Set up the HTML document
     if(init != form.getElements().end()) {
         cout<<"do init "<<(**init).c_str()<<endl;
         dev =initDevice((**init).c_str(),1000);
     } else if(start!= form.getElements().end()) {
         cout<<"do start "<<(**start).c_str()<<endl;
         dev =startDevice((**start).c_str(),1000);
     } else if(stop!= form.getElements().end()) {
         cout<<"do stop "<<(**stop).c_str()<<endl;
         dev =stopDevice((**stop).c_str(),1000);
     } else if(deinit!= form.getElements().end()) {
         cout<<"do deinit "<<(**deinit).c_str()<<endl;
         dev =deinitDevice((**deinit).c_str(),1000);
     }else{
         if(device!=form.getElements().end()){
             dev = getDevice((**device).c_str());
         }
         if(command!=form.getElements().end()){
             cmd = **command;
         }
         
         if(param!=form.getElements().end()){
             parm = **param;
         }
     }
    
   
    if(dev){
        if(!cmd.empty()){
            cout<<"do command " + cmd + " param="+parm.c_str()<<endl;
            sendCmd(dev,cmd,(char*)parm.c_str());
        }
        fetchDataSet(dev,result,sizeof(result));
        cout<<result<<endl;
    }
    
#if 0
    cout<<"{";
    for(int cnt=0;cnt<6;cnt++){
        cout<<"\""<<dataset[cnt]<<"\":"<<(rand()*1.0/RAND_MAX)*200;
        if(cnt<5)cout<<",";
    }
    cout<<"}"<<endl;
#endif
     // Close the HTML document
  //    cout << body() << html();
    return 0;
}

