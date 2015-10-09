/*
 * File:   dev_status.h
 * Author: michelo
 *
 * Created on October 6, 2014, 12:43 PM
 */

#ifndef DEV_STATUS_H
#define	DEV_STATUS_H

#include "common/debug/debug.h"
#include <chaos/common/chaos_constants.h>
#include <chaos/common/data/CDataWrapper.h>

#define MAX_STRING 1024
using namespace chaos;
using namespace chaos::common::data;

#define CUIServerLAPP_		LAPP_ << "[CUIServer] " << __PRETTY_FUNCTION__
#define CUIServerLDBG_		LDBG_ << "[CUIServer] "<< __PRETTY_FUNCTION__
#define CUIServerLERR_		LERR_ << "[CUIServer] "<< __PRETTY_FUNCTION__

struct dev_info_status {
    char dev_status[256];
    char error_status[256];
    char log_status[256];
    std::auto_ptr<chaos::common::data::CDataWrapper> data_wrapper;
    dev_info_status() {
        *dev_status = 0;
        *error_status = 0;
        *log_status = 0;
        data_wrapper.reset(new chaos::common::data::CDataWrapper());
    }

    void status(CUStateKey::ControlUnitState deviceState) {
        if (deviceState == CUStateKey::DEINIT) {
            strcpy(dev_status, "deinit");
        } else if (deviceState == CUStateKey::INIT) {
            strcpy(dev_status, "init");
        } else if (deviceState == CUStateKey::START) {
            strcpy(dev_status, "start");
        } else if (deviceState == CUStateKey::STOP) {
            strcpy(dev_status, "stop");
        } else if (deviceState == CUStateKey::FATAL_ERROR) {
            strcpy(dev_status, "fatal error");
        }  else if (deviceState == CUStateKey::RECOVERABLE_ERROR) {
            strcpy(dev_status, "recoverable error");
        } else {
            strcpy(dev_status, "uknown");
        }
    }

    void append_log(std::string log) {
        CUIServerLAPP_ << log;
        snprintf(log_status, sizeof (log_status), "%s%s;", log_status, log.c_str());

    }

    void append_error(std::string log) {
        CUIServerLERR_ << log;
        snprintf(error_status, sizeof (error_status), "%s%s;", error_status, log.c_str());

    }

    void insert_json(char*json) {
        if (json == NULL) return;

        if (*json == 0) {
            sprintf(json, "{\"dev_status\":\"%s\",\"error_status\":\"%s\",\"log_status\":\"%s\"}", dev_status, error_status, log_status);
            return;
        }

        char *t = strstr(json,",\"dev_status");
        if(t==NULL){

            while (*json != 0) {

                if (*json == '}') {
                    t = json;
                }
                json++;
            }
        }
        if (t) sprintf(t, ",\"dev_status\":\"%s\",\"error_status\":\"%s\",\"log_status\":\"%s\"}", dev_status, error_status, log_status);
    }

    CDataWrapper * getData(){
         data_wrapper->addStringValue("dev_status",std::string(dev_status));
     data_wrapper->addStringValue("log_status",std::string(log_status));
     data_wrapper->addStringValue("error_status",std::string(error_status));

        return data_wrapper.get();
    }
};



#endif	/* DEV_STATUS_H */
