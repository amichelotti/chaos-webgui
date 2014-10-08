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
using namespace std;
using namespace Mongoose;
using namespace chaos::ui;
using namespace chaos;
#define MDS_TIMEOUT 10000
class ChaosController : public WebController
{
private:
    static std::map<std::string,chaos::ui::DeviceController*> devs; 
    int mds_timeout;
    int sendCmd(chaos::ui::DeviceController *controller ,std::string cmd_alias_str,char*param);
    int fetchDataSet(DeviceController *ctrl,char*jsondest,int size);
    public: 
        ChaosController(){mds_timeout = MDS_TIMEOUT;}
        void handleCU(Request &request, StreamResponse &response);
        void setMDSTimeout(int timeo);
        void setup();
};

