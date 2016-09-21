#ifdef _MSC_VER
#include <windows.h>
#else
#include <unistd.h>
#endif
#include <stdlib.h>
#include <signal.h>
#include <mongoose/Server.h>
#include <mongoose/WebController.h>

#include "ChaosWebController.h"

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
std::map<std::string, ::driver::misc::ChaosController*> ChaosWebController::devs;

#define CUIServerLAPP_		LAPP_ << "[CUIServer] "
#define CUIServerLDBG_		LDBG_ << "[CUIServer "<< __PRETTY_FUNCTION__<<" ]"
#define CUIServerLERR_		LERR_ << "[CUIServer "<< __PRETTY_FUNCTION__<<" ]"
ChaosWebController::ChaosWebController() {
    mds_timeout = MDS_TIMEOUT;
    naccess=0;
    tot_us =0;
    refresh=0;
}

void ChaosWebController::setMDSTimeout(int timeo) {
    mds_timeout = timeo;
}


void ChaosWebController::addDevice(std::string name, ::driver::misc::ChaosController*d) {
    devs[name] = d;
}




#define CALC_EXEC_TIME \
tot_us +=(reqtime -boost::posix_time::microsec_clock::local_time().time_of_day().total_microseconds());\
if(naccess%500 ==0){\
refresh=tot_us/500;\
tot_us=0;\
CUIServerLDBG_ << " Profiling: N accesses:"<<naccess<<" response time:"<<refresh<<" us";}


void ChaosWebController::handleCU(Request &request, StreamResponse &response) {
    CDataWrapper*data = NULL;
    
    ::driver::misc::ChaosController* controller = NULL;
    std::string cmd, parm,dev_param;
    dev_param = request.get("dev");
    cmd = request.get("cmd");
    parm = request.get("parm");
    std::string cmd_schedule = request.get("sched");
    std::string cmd_prio = request.get("prio");
    std::string cmd_mode = request.get("mode");
    uint64_t reqtime=boost::posix_time::microsec_clock::local_time().time_of_day().total_microseconds();
    response.setHeader("Access-Control-Allow-Origin", "*");
    naccess++;
    std::vector<std::string>dev_v;
    boost::split(dev_v,dev_param,boost::is_any_of(","));
    
    std::stringstream answer_multi;
    if(dev_v.size()>1){
        answer_multi<<"{[";
    }
    
    for(std::vector<std::string>::iterator idevname=dev_v.begin();idevname!=dev_v.end();idevname++){
        std::string ret;
        if (!(*idevname).empty() && !cmd.empty()) {
            
            if (devs.count(*idevname) > 0) {
                controller = devs[*idevname];
                
            } else {
                controller = new ::driver::misc::ChaosController();
                if (controller == NULL) {
                    response << "{}";
                    CALC_EXEC_TIME;
                    return;
                }
                if(controller->init(*idevname,DEFAULT_TIMEOUT_FOR_CONTROLLER)!=0){
                    response << controller->getJsonState();
                    CALC_EXEC_TIME;
                    return;
                }
                addDevice(*idevname,controller);
            }
            
            if(controller->get(cmd,(char*)parm.c_str(),0,atoi(cmd_prio.c_str()),atoi(cmd_schedule.c_str()),atoi(cmd_mode.c_str()),0,ret)!=::driver::misc::ChaosController::CHAOS_DEV_OK){
                CUIServerLERR_<<"An error occurred during get:"<<controller->getJsonState();
            }
            
            
            
            if(dev_v.size()==1){
                response << ret;
                CALC_EXEC_TIME;
                return;
            } else {
                if((idevname+1) == dev_v.end()){
                    answer_multi<<ret<<"]}";
                }else {
                    answer_multi<<ret<<",";
                }
            }
        }
    }
    //CUIServerLDBG_<<"["<<devname<<"]: \""<<oout<<"\"";
    response << answer_multi.str();
    CALC_EXEC_TIME;
    
    
}

void ChaosWebController::setup() {
    addRoute("GET", "/CU", ChaosWebController, handleCU);
}
