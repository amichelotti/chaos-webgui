
#ifdef _MSC_VER
#include <windows.h>
#else
#include <unistd.h>
#endif
#include <stdlib.h>
#include <signal.h>
#include <mongoose/Server.h>
#include <mongoose/WebController.h>
#include <chaos/ui_toolkit/ChaosUIToolkit.h>
#include <chaos/ui_toolkit/LowLevelApi/LLRpcApi.h>
#include <chaos/ui_toolkit/ChaosUIToolkitCWrapper.h>
#include <chaos/ui_toolkit/HighLevelApi/HLDataApi.h>
#include <chaos/ui_toolkit/HighLevelApi/DeviceController.h>
#include <map>
#include "dev_status.h"
using namespace std;
using namespace Mongoose;
using namespace chaos::ui;
using namespace chaos;
#define MDS_TIMEOUT 3000
#define MDS_STEP_TIMEOUT 1000
#define MDS_RETRY 3
#define HEART_BEAT_MAX 60000000
#define CALC_AVERAGE_REFRESH 5
struct InfoDevice {
  chaos::ui::DeviceController* dev;
  std::string devname;
  int timeouts;
  int totTimeout;
  int lastState;
  int defaultTimeout;
  int wostate;// without state
  int nextState;
  uint64_t lastReq;
  uint64_t nReq;
  uint64_t tot_req_time;
  uint64_t refresh;
  uint64_t firstReq;
  uint64_t timestamp;
  uint64_t htimestamp;
  uint64_t last_access;
  std::map<std::string,int> binaryToTranslate;
  InfoDevice(){lastReq=0;nextState=-1;timestamp=0;lastState=-1;firstReq=0;last_access=0;}
 ~InfoDevice(){}
 
};

class ChaosController : public WebController
{
private:
    static std::map<std::string,InfoDevice*> devs; 
    int mds_timeout;
    uint64_t naccess;
    uint64_t tot_us;
    uint64_t refresh;
    
    int sendCmd(chaos::ui::DeviceController *controller ,std::string& cmd_alias_str,char*param,Request & request,dev_info_status&status);
    int sendAttr(DeviceController *controller ,std::string cmd_alias_str,char*param);
    CDataWrapper* fetchDataSet(DeviceController *ctrl);
    CDataWrapper* normalizeToJson(CDataWrapper*src,std::map<std::string,int>& list);
    CDataWrapper data_out;
    uint64_t updateState(InfoDevice*dev,dev_info_status&status,CUStateKey::ControlUnitState&devstate);
    public: 
        ChaosController();
        void handleCU(Request &request, StreamResponse &response);
        void setMDSTimeout(int timeo);
	int checkError(int err,InfoDevice*,dev_info_status&st);
        void setup();
        static void addDevice(std::string,InfoDevice*);
        static void removeDevice(std::string);
        static void refreshDevice(std::string);


};

