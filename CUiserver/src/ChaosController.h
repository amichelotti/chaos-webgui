
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
#define MAX_STRING 1024
struct InfoDevice {
  chaos::ui::DeviceController* dev;
  std::string devname;
  int timeouts;
  int totTimeout;
  int lastState;
  int defaultTimeout;
  int wostate;// without state
};

class ChaosController : public WebController
{
private:
    static std::map<std::string,InfoDevice*> devs; 
    int mds_timeout;
    int sendCmd(chaos::ui::DeviceController *controller ,std::string cmd_alias_str,char*param);
    int sendAttr(DeviceController *controller ,std::string cmd_alias_str,char*param);
    CDataWrapper* fetchDataSet(DeviceController *ctrl);
    char *jsondest;
    int size_json;
    public: 
        ChaosController();
        void handleCU(Request &request, StreamResponse &response);
        void setMDSTimeout(int timeo);
	int checkError(int err,InfoDevice*,dev_info_status&st);
        void setup();
        static void addDevice(std::string,InfoDevice*);
        static void removeDevice(std::string);

};

