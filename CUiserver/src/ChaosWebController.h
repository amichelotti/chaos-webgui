
#ifdef _MSC_VER
#include <windows.h>
#else
#include <unistd.h>
#endif
#include <stdlib.h>
#include <signal.h>
#include <mongoose/Server.h>
#include <mongoose/WebController.h>

#include <map>
#include <driver/misc/core/ChaosController.h>
using namespace std;
using namespace Mongoose;
using namespace chaos::ui;
using namespace chaos;
#define MDS_TIMEOUT 3000
#define MDS_STEP_TIMEOUT 1000
#define MDS_RETRY 3
#define HEART_BEAT_MAX 60000000
#define CALC_AVERAGE_REFRESH 5

class ChaosWebController : public WebController
{
private:
    static std::map<std::string,::driver::misc::ChaosController*> devs;
    int mds_timeout;
    uint64_t naccess;
    uint64_t tot_us;
    uint64_t refresh;
    
    public: 
        ChaosWebController();
        void handleCU(Request &request, StreamResponse &response);
        void setup();
        void setMDSTimeout(int timeo);
        static void addDevice(std::string,::driver::misc::ChaosController*);
        static void removeDevice(std::string);


};

