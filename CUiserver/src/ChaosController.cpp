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
using namespace chaos::common::batch_command;
using namespace chaos;
std::map<std::string, InfoDevice*> ChaosController::devs;


ChaosController::ChaosController() {
    mds_timeout = MDS_TIMEOUT;

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

    ss << "command:\"" << cmd_alias_str << "\" params:\"" << param << "\" prio:" << prio << " schedule:" << schedule_delay << " mode:" << mode;
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

        HLDataApi::getInstance()->disposeDeviceControllerPtr(idevs->second->dev);
        delete(idevs->second);
        devs.erase(idevs);
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

void ChaosController::handleCU(Request &request, StreamResponse &response) {
    InfoDevice *idev = NULL;
    CDataWrapper*data = NULL;
    chaos::ui::DeviceController* controller = NULL;
    std::string devname, cmd, parm;
    dev_info_status status;
    devname = request.get("dev");
    cmd = request.get("cmd");
    parm = request.get("parm");
    uint64_t reqtime=boost::posix_time::microsec_clock::local_time().time_of_day().total_microseconds();
    response.setHeader("Access-Control-Allow-Origin", "*");
    //std::stringstream sl;
    //sl <<"dev:"<<devname<<" cmd:"<<cmd <<" parm:"<<parm<< " reqTime:" <<dec<<reqtime;
   // status.append_log(sl.str());
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
                return;
            }
            idev = new InfoDevice();
            if (idev != NULL) {
                idev->dev = controller;
                idev->timeouts = 0;
                idev->lastState = -1;
                idev->totTimeout = 0;
                idev->defaultTimeout = mds_timeout;
                idev->devname = devname;
                idev->wostate = 0;
                idev->nextState = -1;
                // try to get state
                controller->setRequestTimeWaith(idev->defaultTimeout);
                controller->setupTracking();
                err = controller->getState(deviceState);
                if (checkError(err, idev, status)) {
                    // try to fetch data
                    if ((data=fetchDataSet(controller)) != 0) {
                        // fetch ok
                        idev->wostate = 1;

                        status.append_log("is http device:" + devname);
                        status.status(CUStateKey::START);
                        idev->lastState = CUStateKey::START;

                        CUIServerLDBG_ << devname << " is a http device";
                    }
                }

                CUIServerLDBG_ << "caching device " << devname;
                idev->firstReq=reqtime;
                addDevice(devname, idev);
            } else {
                status.append_error("cannot allocate new info controller for:" + devname);

               // status.insert_json(idev->out);
                response << status.getData()->getJSONString();
                return;

            }


        }

        controller->setRequestTimeWaith(idev->defaultTimeout);
        if (idev->wostate == 0) {
            err = controller->getState(deviceState);
            if (checkError(err, idev, status)) {
                status.append_error("error getting state for:"+devname);
                removeDevice(devname);
                //status.insert_json(idev->out);
                response << status.getData()->getJSONString();
                return;
            }

            idev->timeouts = 0;
            status.status(deviceState);
            idev->lastState = deviceState;

            if ((idev->nextState > 0)&&(idev->lastState != idev->nextState)) {
                LDBG_ << "%% warning current state:" << idev->lastState << " different from destination state:" << idev->nextState;
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
               return;
        }

        controller->setupTracking();
        if (cmd == "init") {
            status.append_log("init device:" + devname);
            err = controller->initDevice();
            idev->wostate = 0;
            idev->nextState = CUStateKey::INIT;
        } else if (cmd == "start") {
            idev->wostate = 0;
            idev->nextState = CUStateKey::START;
            if (deviceState != CUStateKey::INIT) {
                controller->initDevice();
            }

            if (idev->lastState != idev->nextState) {

                err = controller->startDevice();
                status.append_log("starting device:" + devname);
            } else {
                CUIServerLDBG_ << devname << " already in start err:" << err ;
            }

        } else if (cmd == "stop") {
            idev->wostate = 0;
            idev->nextState = CUStateKey::STOP;
            if (idev->lastState != idev->nextState) {
                status.append_log("stopping device:" + devname);
                err = controller->stopDevice();
            }
        } else if (cmd == "deinit") {
            idev->wostate = 0;
            idev->nextState = CUStateKey::DEINIT;
            if (idev->lastState != idev->nextState) {
                status.append_log("deinit device:" + devname);
                err = controller->deinitDevice();
            }
        } else if (cmd == "sched" && !parm.empty()) {
            status.append_log("sched device:" + devname);
            err = controller->setScheduleDelay(atol((char*) parm.c_str()));
        } else if (cmd == "attr") {
            status.append_log("send attr:\"" + cmd + "\" args: \"" + parm + "\" to device:" + devname);
            err = sendAttr(controller, cmd, (char*) (parm.empty() ? "" : parm.c_str()));
        } else if (cmd != "status") {
            status.append_log("send cmd:\"" + cmd + "\" args: \"" + parm + "\" to device:" + devname);
            err = sendCmd(controller, cmd, (char*) (parm.empty() ? "" : parm.c_str()), request, status);
        } else {
            if (idev->wostate == 0) {
                switch (deviceState) {
                    case CUStateKey::DEINIT:
                    {
                        LDBG_ << "Force " << devname << " in init from deinit";
                        err = controller->initDevice();
                        break;
                    }
                    case CUStateKey::INIT:
                    {
                        LDBG_ << "Force " << devname << " in start from init";

                        err = controller->startDevice();
                        break;
                    }
                }
            }
        }


        if (checkError(err, idev, status)) {

            CUIServerLERR_<<"error removing device from cache:"<<devname;
            removeDevice(devname);
            status.append_log("timeout or error removing from cache");
         //   status.insert_json(idev->out);
            response << status.getData()->getJSONString();
            return;
        }

        idev->lastReq= reqtime;

        if((data=fetchDataSet(controller))==NULL){
           status.append_error(" error fetching dataset of:"+devname);
           data = status.getData();

        } else {
            data->appendAllElement(*status.getData());
        }
    } else {
        status.append_error(" cmd or device not specified");
        response<<status.getData()->getJSONString();
        return;
    }

   // status.insert_json(idev->out);
    //  LDBG_<<"device:"<<devname<<":\""<<jsondest<<"\"";

    response << data->getJSONString();


}

void ChaosController::setup() {
    addRoute("GET", "/CU", ChaosController, handleCU);
}
