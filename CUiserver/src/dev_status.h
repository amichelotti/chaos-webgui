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
 using   namespace chaos;
 #define CUIServerLAPP_		LAPP_ << "[CUIServer] "
#define CUIServerLDBG_		LDBG_ << "[CUIServer] "
#define CUIServerLERR_		LERR_ << "[CUIServer] "

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
      CUIServerLAPP_<<log;
    snprintf(log_status,sizeof(log_status),"%s%s;",log_status,log.c_str());
 
  }
  void append_error(std::string log){
    CUIServerLERR_<<log;
    snprintf(error_status,sizeof(error_status),"%s%s;",error_status,log.c_str());
 
  }
  void insert_json(char*json){
    
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



#endif	/* DEV_STATUS_H */

