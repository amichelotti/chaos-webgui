#ifdef _MSC_VER
#includdddsdsdse <windows.h>
#else
#include <unistd.h>
#endif
#include <stdlib.h>
#include <signal.h>
#include <mongoose/Server.h>
#include <mongoose/WebController.h>

#include "ChaosController.h"

#include <common/debug/core/debug.h>
#include <sstream>
#include <vector>
#include <boost/algorithm/string.hpp>
using namespace std;
using namespace Mongoose;
using namespace chaos::ui;
using namespace chaos::common::data;
using namespace chaos::common::batch_command;
using namespace chaos;
std::map<std::string, InfoDevice*> ChaosController::devs;


ChaosController::ChaosController() {
    mds_timeout = MDS_TIMEOUT;
    naccess=0;
    tot_us =0;
    refresh=0;
}

void ChaosController::setMDSTimeout(int timeo) {
    mds_timeout = timeo;
}

int ChaosController::sendAttr(DeviceController *controller, std::string cmd_alias_str, char*param) {

    int err = controller->setAttributeToValue(cmd_alias_str.c_str(), param, false);
    return err;

}

int ChaosController::sendCmd(DeviceController *controller, std::string& cmd_alias_str, char*param, Request & request, dev_info_status&status) {
    int err;
    uint64_t cmd_id_tmp;
    uint32_t schedule_delay = 0, prio = 50, mode = 0;

    std::auto_ptr<CDataWrapper> data_wrapper;
    std::string cmd_schedule, cmd_prio, cmd_mode;
    cmd_schedule = request.get("sched");
    cmd_prio = request.get("prio");
    cmd_mode = request.get("mode");

    if (param) {
        data_wrapper.reset(new CDataWrapper());
        if (data_wrapper.get())
            data_wrapper->setSerializedJsonData(param);
        else
            return -1001;
    }
    if (!cmd_schedule.empty()) {
        schedule_delay = atoi(cmd_schedule.c_str());
    }
    if (!cmd_prio.empty()) {
        prio = atoi(cmd_prio.c_str());
    }
    if (!cmd_mode.empty()) {
        mode = atoi(cmd_mode.c_str());

    }
  //  LAPP_ << "command before:" << cmd_alias_str;
    err = controller->submitSlowControlCommand(cmd_alias_str,
            (mode == 0) ? SubmissionRuleType::SUBMIT_AND_Stack : SubmissionRuleType::SUBMIT_AND_Kill,
            prio,
            cmd_id_tmp,
            0,
            schedule_delay,
            0,
            data_wrapper.get());

    std::stringstream ss;
      chaos::common::batch_command::CommandState command_state;
    command_state.command_id=cmd_id_tmp;

    err+=controller->getCommandState(command_state);
    ss << "command:\"" << cmd_alias_str << "\" params:\"" << param << "\" prio:" << prio << " schedule:" << schedule_delay << " mode:" << mode << " error:"<<err<< " fault code:"<<command_state.fault_description.code<<" fault desc:"<<command_state.fault_description.description;
    status.append_log(ss.str().c_str());
//    LAPP_ << "command after:" << ss.str().c_str();
    return err;
}

void ChaosController::addDevice(std::string name, InfoDevice*d) {
    devs[name] = d;
}

void ChaosController::removeDevice(std::string name) {
    std::map<std::string, InfoDevice*>::iterator idevs;
    idevs = devs.find(name);
    if (idevs != devs.end()) {
        CUIServerLDBG_ << "removing device :"<<idevs->second->devname;
        if(idevs->second->dev)
            delete(idevs->second->dev);
        idevs->second->dev =0;
        
        delete(idevs->second);
        devs.erase(idevs);
    }

}
void ChaosController::refreshDevice(std::string name) {
    std::map<std::string, InfoDevice*>::iterator idevs;
    idevs = devs.find(name);
    if (idevs != devs.end()) {
        CUIServerLDBG_ << "refreshing device :"<<idevs->second->devname;
    if(idevs->second->dev)
          delete(idevs->second->dev);
        idevs->second->dev=HLDataApi::getInstance()->getControllerForDeviceID(idevs->second->devname, idevs->second->defaultTimeout);
         idevs->second->dev->setRequestTimeWaith(idevs->second->defaultTimeout);
         idevs->second->dev->setupTracking();
    
    }

}
                    



                    
CDataWrapper* ChaosController::fetchDataSet(DeviceController *ctrl) {
    CDataWrapper* data = NULL;
    try {
        if (ctrl) {
            ctrl->fetchCurrentDeviceValue();

        } else {
           CUIServerLERR_ << "Error fetching";

            return NULL;
        }
        data = ctrl->getCurrentData();
        if (data == NULL) {
           CUIServerLERR_ << "No data";

            return NULL;
        }




    } catch (CException& e) {

        DERR("Exception reading dataset:%s", e.what());

        return NULL;
    }



    return data;
}

int ChaosController::checkError(int err, InfoDevice*idev, dev_info_status&status) {

    if (err == ErrorCode::EC_TIMEOUT) {
        std::stringstream st;
        idev->timeouts++;
        idev->totTimeout++;

        st << "Timeout getting State " + idev->devname + " tot timeout:" << idev->totTimeout << " consecutive:" << idev->timeouts << " current timeout:" << idev->defaultTimeout;
        idev->defaultTimeout += MDS_STEP_TIMEOUT;
        status.append_log(st.str());
        if (idev->timeouts > MDS_RETRY) {
            status.append_error("Timeout getting State " + idev->devname);
            return 0;
        }
    } else if (err != 0) {
        status.append_error("Error in:" + idev->devname);
    }
    return err;
}

uint64_t ChaosController::updateState(InfoDevice*idev,dev_info_status&status,CUStateKey::ControlUnitState&devstate){
     uint64_t heart= idev->dev->getState(devstate);
     if (heart==0){ 
         status.append_error("cannot access to HB");
        return 0;
      }
      if((heart - idev->htimestamp)>HEART_BEAT_MAX){
          std::stringstream ss;
          ss<<"device is dead "<< (heart - idev->htimestamp)<<" ms of inactivity, removing";
            status.append_error(ss.str());
            //status.insert_json(idev->out);
          
            return 0;
        }
        idev->htimestamp= heart;
        status.status(devstate);

        return heart;
}
#define CALC_EXEC_TIME \
    tot_us +=(reqtime -boost::posix_time::microsec_clock::local_time().time_of_day().total_microseconds());\
    if(naccess%500 ==0){\
        refresh=tot_us/500;\
        tot_us=0;\
        CUIServerLDBG_ << " Profiling: N accesses:"<<naccess<<" response time:"<<refresh<<" us";}

CDataWrapper* ChaosController::normalizeToJson(CDataWrapper*src,std::map<std::string,int>& list){
    if(list.empty())
        return src;
    std::vector<std::string> contained_key;
    std::map<std::string,int>::iterator rkey;
    src->getAllKey(contained_key);
    data_out.reset();
    for(std::vector<std::string>::iterator k=contained_key.begin();k!=contained_key.end();k++){
        if((rkey=list.find(*k))!=list.end()){
            if(rkey->second == DataType::SUB_TYPE_DOUBLE){
       //        CUIServerLDBG_ << " replace data key:"<<rkey->first;
                int cnt;
                double *data=(double*)src->getRawValuePtr(rkey->first);
                int size=src->getValueSize(rkey->first);
                int elems=size/sizeof(double);
                for(cnt=0;cnt<elems;cnt++){
                    data_out.appendDoubleToArray(data[cnt]);
                }
                data_out.finalizeArrayForKey(rkey->first);
            
            } else if(rkey->second == DataType::SUB_TYPE_INT32){
                 int cnt;
                int32_t *data=(int32_t*)src->getRawValuePtr(rkey->first);
                int size=src->getValueSize(rkey->first);
                int elems=size/sizeof(int32_t);
                for(cnt=0;cnt<elems;cnt++){
                    data_out.appendInt32ToArray(data[cnt]);
                }
                data_out.finalizeArrayForKey(rkey->first);
            } else if(rkey->second == DataType::SUB_TYPE_INT64){
                 int cnt;
                int64_t *data=(int64_t*)src->getRawValuePtr(rkey->first);
                int size=src->getValueSize(rkey->first);
                int elems=size/sizeof(int64_t);
                for(cnt=0;cnt<elems;cnt++){
                    data_out.appendInt64ToArray(data[cnt]);
                }
                data_out.finalizeArrayForKey(rkey->first);
            } else {
               // LDBG_ << "adding not translated key:"<<*k<<" json:"<<src->getCSDataValue(*k)->getJSONString();
                data_out.appendAllElement(*src->getCSDataValue(*k));
                src->copyKeyTo(*k,data_out);
            }
        } else {
            //LDBG_ << "adding normal key:"<<*k<<" json:"<<src->getCSDataValue(*k)->getJSONString();
            src->copyKeyTo(*k,data_out);
            
        }
    }
    return &data_out;
}

void ChaosController::handleCU(Request &request, StreamResponse &response) {
    InfoDevice *idev = NULL;
    CDataWrapper*data = NULL;
    
    chaos::ui::DeviceController* controller = NULL;
    std::string cmd, parm,dev_param;
    std::string&devname =dev_param;
    dev_info_status status;
    dev_param = request.get("dev");
    cmd = request.get("cmd");
    parm = request.get("parm");
    uint64_t reqtime=boost::posix_time::microsec_clock::local_time().time_of_day().total_microseconds();
    response.setHeader("Access-Control-Allow-Origin", "*");
    naccess++;
    std::vector<std::string>dev_v;
    boost::split(dev_v,dev_param,boost::is_any_of(","));
 
    //std::stringstream sl;
    //sl <<"dev:"<<devname<<" cmd:"<<cmd <<" parm:"<<parm<< " reqTime:" <<dec<<reqtime;
   // status.append_log(sl.str());
    std::stringstream answer_multi;
    if(dev_v.size()>1){
       
        answer_multi<<"{[";
    }
    for(std::vector<std::string>::iterator idevname=dev_v.begin();idevname!=dev_v.end();idevname++){
        devname=*idevname;
    
        if (!devname.empty() && !cmd.empty()) {
            CUStateKey::ControlUnitState deviceState;
            int err;

            if (devs.count(devname) > 0) {
                idev = devs[devname];
                if (idev) {
                    controller = idev->dev;
                }
                //      status.append_log("retriving controller for:"+devname);
            } else {
                try {
                    controller = HLDataApi::getInstance()->getControllerForDeviceID(devname, mds_timeout);
                    status.append_log("creating new controller for:" + devname);
                } catch (CException e) {
                    status.append_error(e.what());
                }
                if (controller == NULL) {
                    status.append_error("cannot allocate new controller for:" + devname);
                    response << status.getData()->getJSONString();
                    CALC_EXEC_TIME;
                    return;
                }
                idev = new InfoDevice();
                if (idev != NULL) {
                    uint64_t ret;
                    idev->dev = controller;
                    idev->timeouts = 0;
                    idev->lastState = -1;
                    idev->totTimeout= 0;
                    idev->defaultTimeout = mds_timeout;
                    idev->devname = devname;
                    idev->wostate = 0;
                    idev->nextState = -1;
                    idev->nReq=0;
                    idev->tot_req_time=0;

                    // try to get state
                    controller->setRequestTimeWaith(idev->defaultTimeout);
                    controller->setupTracking();
                    ret = controller->getState(deviceState);
                    idev->lastState = deviceState;
                    idev->nextState = deviceState;
                    status.status(deviceState);
                    idev->htimestamp = ret;
                    CUIServerLDBG_ << "caching device " << devname;
                    idev->firstReq=reqtime;
                    std::vector<chaos::common::data::RangeValueInfo> vi=controller->getDeviceValuesInfo();
                    for(std::vector<chaos::common::data::RangeValueInfo>::iterator i=vi.begin();i!=vi.end();i++){
                        if((i->valueType==DataType::TYPE_BYTEARRAY) && (i->binType!=DataType::SUB_TYPE_NONE)){
                            idev->binaryToTranslate.insert(std::make_pair(i->name,i->binType));
                            CUIServerLDBG_ << i->name<<" is binary of type:"<<i->binType;
                        }
                    }
                    addDevice(devname, idev);
                } else {
                    status.append_error("cannot allocate new info controller for:" + devname);

                   // status.insert_json(idev->out);
                    response << status.getData()->getJSONString();
                    CALC_EXEC_TIME;
                    return;

                }


            }

            controller->setRequestTimeWaith(idev->defaultTimeout);


            if (idev->wostate == 0) {

                if((reqtime - idev->last_access) > (idev->defaultTimeout*1000)){
                    uint64_t heart;
                    if((heart=updateState(idev,status,deviceState))==0){
                        CUIServerLERR_<<" ["<<idev->devname<<"] HB expired, removing device";
                        removeDevice(idev->devname);
                        response << status.getData()->getJSONString();
                        CALC_EXEC_TIME;
                        return;
                    }  
                    
                    idev->timeouts = 0;
                    idev->lastState = deviceState;
                    //CUIServerLDBG_<<" ["<<idev->devname<<"] [nacc:"<<idev->nReq<<"] state:"<<deviceState<<" desired state:"<<idev->nextState<<" HB:"<<heart<<" LA:"<<(reqtime - idev->last_access) <<" us ago"<<" refresh rate:"<<idev->refresh<< " us, default timeout:"<<idev->defaultTimeout;
                    idev->last_access = reqtime;

                    if(deviceState==CUStateKey::RECOVERABLE_ERROR){
                       CDataWrapper*data=controller->fetchCurrentDatatasetFromDomain(chaos::ui::DatasetDomainHealth);
                       std::string ll;
                       if(data->hasKey("nh_led")){
                           ll=std::string("domain:")+data->getCStringValue("nh_led");
                       }
                       if(data->hasKey("nh_lem")){
                           ll= ll +std::string(" msg:")+data->getCStringValue("nh_lem");
                       }
                       status.append_error(ll);
                       response << status.getData()->getJSONString();
                       CALC_EXEC_TIME;
                        return;
                    }
                    if ((idev->nextState > 0)&&(idev->lastState != idev->nextState)) {
                        CUIServerLDBG_ << "%% warning current state:" << idev->lastState << " different from destination state:" << idev->nextState;
                    }
                }
            } else if (cmd == "status") {
                DPRINT("fetch dataset of %s (stateless)\n", devname.c_str());
                err = 0;
                status.status(CUStateKey::START);
                idev->lastState = CUStateKey::START;
                status.append_log("stateless device");

                if(data= fetchDataSet(controller)){
                   data->appendAllElement(*status.getData());
                } else {
                    data = status.getData();
                }

                //idev->update(data);
                response << status.getData()->getJSONString();
                CALC_EXEC_TIME;
                   return;
            }

            if (cmd == "init") {
                idev->wostate = 0;

               if(updateState(idev,status,deviceState)==0){
                        removeDevice(idev->devname);
                        response << status.getData()->getJSONString();
                        CALC_EXEC_TIME;
                        return;
                }
               if(deviceState!=CUStateKey::INIT){
                    status.append_log("init device:" + devname);
                    err = controller->initDevice();
                    if(err!=0){
                        removeDevice(idev->devname);
                        response << status.getData()->getJSONString();
                        CALC_EXEC_TIME;
                        return;
                    }
                    idev->nextState = CUStateKey::INIT;
               } else {
                    status.append_log("device:" + devname+ " already initialized");
               }
            } else if (cmd == "start") {
                idev->wostate = 0;
                 if(updateState(idev,status,deviceState)==0){
                        removeDevice(idev->devname);
                        response << status.getData()->getJSONString();
                        CALC_EXEC_TIME
                        return;
                }

                if (deviceState != CUStateKey::START) {
                    status.append_log("starting device:" + devname);
                    err=controller->startDevice();
                    if(err!=0){
                        removeDevice(idev->devname);
                        response << status.getData()->getJSONString();
                        CALC_EXEC_TIME;
                        return;
                    }
                     idev->nextState = CUStateKey::START;

                } else {
                    status.append_log("device:" + devname+ " already started");
                }


            } else if (cmd == "stop") {
                idev->wostate = 0;
                if(updateState(idev,status,deviceState)==0){
                        removeDevice(idev->devname);
                        response << status.getData()->getJSONString();
                        CALC_EXEC_TIME;
                        return;
                }
                if (deviceState != CUStateKey::STOP) {
                    status.append_log("stopping device:" + devname);
                    err=controller->stopDevice();
                    if(err!=0){
                        removeDevice(idev->devname);
                        response << status.getData()->getJSONString();
                        CALC_EXEC_TIME;
                        return;
                    }
                    idev->nextState = CUStateKey::STOP;

                } else {
                    status.append_log("device:" + devname+ " already stopped");
                }
            } else if (cmd == "deinit") {
                idev->wostate = 0;
                if(updateState(idev,status,deviceState)==0){
                        removeDevice(idev->devname);
                        response << status.getData()->getJSONString();
                        CALC_EXEC_TIME;
                        return;
                }
                if (deviceState != CUStateKey::DEINIT) {
                    status.append_log("deinit device:" + devname);
                    err=controller->deinitDevice();
                    if(err!=0){
                        status.append_error("error deinitializing:"+devname);
                        removeDevice(idev->devname);
                        response << status.getData()->getJSONString();
                        CALC_EXEC_TIME;
                        return;
                    }
                    idev->nextState = CUStateKey::DEINIT;

                } else {
                    status.append_log("device:" + devname+ " already deinitialized");
                }
            } else if (cmd == "sched" && !parm.empty()) {
                status.append_log("sched device:" + devname);
                err = controller->setScheduleDelay(atol((char*) parm.c_str()));
                if(err!=0){
                    status.append_error("error set scheduling:"+devname);
                    removeDevice(idev->devname);
                    response << status.getData()->getJSONString();
                    CALC_EXEC_TIME;
                    return;
                }
            } else if (cmd == "channel" && !parm.empty()) {
               // status.append_log("return channel :" + parm);
                CDataWrapper*data=controller->fetchCurrentDatatasetFromDomain((chaos::ui::DatasetDomain)atoi((char*) parm.c_str()));
                if(data){
                     data->appendAllElement(*status.getData());
                     response << data->getJSONString();
                     CALC_EXEC_TIME;
                     return;
                }

            } else if (cmd == "attr") {
                status.append_log("send attr:\"" + cmd + "\" args: \"" + parm + "\" to device:" + devname);
                err = sendAttr(controller, cmd, (char*) (parm.empty() ? "" : parm.c_str()));
                if(err!=0){
                    status.append_error("error setting attrbute:"+devname+"/"+parm);
                    removeDevice(idev->devname);
                    response << status.getData()->getJSONString();
                    CALC_EXEC_TIME;
                    return;
                }
            } else if (cmd == "recover") {
                status.append_log("send recover from error:\"" + devname);
                err = controller->recoverDeviceFromError();
                if(err!=0){
                    status.append_error("error recovering from error "+devname);
                    removeDevice(idev->devname);
                    response << status.getData()->getJSONString();
                    CALC_EXEC_TIME;
                    return;
                }
            } else if (cmd == "restore"  && !parm.empty()) {
                status.append_log("send restore on \"" + devname+ "\" tag:\""+parm+"\"");
                err = controller->restoreDeviceToTag(parm);
                if(err!=0){
                    status.append_error("error setting restoring:\""+devname+"\" with tag:\""+parm+"\"");
                    removeDevice(idev->devname);
                    response << status.getData()->getJSONString();
                    CALC_EXEC_TIME;
                    return;
                }
            } else if (cmd != "status") {
                status.append_log("send cmd:\"" + cmd + "\" args: \"" + parm + "\" to device:" + devname);
                err = sendCmd(controller, cmd, (char*) (parm.empty() ? "" : parm.c_str()), request, status);
                 if(err!=0){
                    refreshDevice(idev->devname);
                    err = sendCmd(idev->dev, cmd, (char*) (parm.empty() ? "" : parm.c_str()), request, status);
                    if(err!=0){
                        status.append_error("error sending command:"+cmd+" "+parm+ " to:"+devname);
                        removeDevice(idev->devname);
                    }

                    response << status.getData()->getJSONString();
                    CALC_EXEC_TIME;
                    return;
                }
            } 


       /*     if (checkError(err, idev, status)) {

                CUIServerLERR_<<"error removing device from cache:"<<devname;
                removeDevice(devname);
                status.append_log("timeout or error removing from cache");
             //   status.insert_json(idev->out);
                response << status.getData()->getJSONString();
                return;
            }
    */
            if(idev->lastReq>0)
                idev->tot_req_time+=reqtime-idev->lastReq;

            idev->lastReq= reqtime;
            idev->nReq++;
            if(idev->nReq%CALC_AVERAGE_REFRESH == 0){
                idev->refresh = idev->tot_req_time/CALC_AVERAGE_REFRESH;
                idev->tot_req_time=0;
            }

            if((data=fetchDataSet(controller))==NULL){
               status.append_error("error fetching dataset of:"+devname);

               data = status.getData();
               status.append_log("removing from cache");

               removeDevice(devname);

            } else {
                idev->timestamp = data->getInt64Value("dpck_ats");
                status.status((CUStateKey::ControlUnitState)idev->lastState);
               
                data->appendAllElement(*status.getData());
                
            }
        } else {
            status.append_error(" cmd or device not specified");
            response<<status.getData()->getJSONString();
            CALC_EXEC_TIME;
            return;
        }
    
   // status.insert_json(idev->out);
    //  LDBG_<<"device:"<<devname<<":\""<<jsondest<<"\"";
       
    //const char*json=normalizeToJson(data,idev->binaryToTranslate)->getJSONString().c_str();
        if(dev_v.size()==1){
            response<<normalizeToJson(data,idev->binaryToTranslate)->getJSONString();
            CALC_EXEC_TIME;
            return;
        } else {
            if((idevname+1) == dev_v.end()){
                answer_multi<<normalizeToJson(data,idev->binaryToTranslate)->getJSONString()<<"]}";
            }else {
                answer_multi<<normalizeToJson(data,idev->binaryToTranslate)->getJSONString()<<",";
            }
        }
    }
    //CUIServerLDBG_<<"["<<devname<<"]: \""<<oout<<"\"";
    response << answer_multi.str();
    CALC_EXEC_TIME;
    

}

void ChaosController::setup() {
    addRoute("GET", "/CU", ChaosController, handleCU);
}
