#ifdef _MSC_VER
#include <windows.h>
#else
#include <unistd.h>
#endif
#include <stdlib.h>
#include <signal.h>
#include <chaos/ui_toolkit/ChaosUIToolkit.h>
/*
#include <ChaosMetadataServiceClient/ChaosMetadataServiceClient.h>
#include <ChaosMetadataServiceClient/api_proxy/unit_server/NewUS.h>
#include <ChaosMetadataServiceClient/api_proxy/unit_server/DeleteUS.h>

#include <ChaosMetadataServiceClient/api_proxy/unit_server/ManageCUType.h>

#include <ChaosMetadataServiceClient/api_proxy/control_unit/SetInstanceDescription.h>
#include <ChaosMetadataServiceClient/api_proxy/control_unit/Delete.h>
#include <ChaosMetadataServiceClient/api_proxy/control_unit/DeleteInstance.h>
*/
#include <mongoose/Server.h>
#include <mongoose/WebController.h>
#include "ChaosWebController.h"
using namespace std;
using namespace Mongoose;
using namespace chaos::ui;
//using namespace chaos::metadata_service_client;

int main(int argc,char**argv)
{ 
    int server_port = 8080;     
    ChaosUIToolkit::getInstance()->getGlobalConfigurationInstance()->addOption("server_port", po::value<int>(&server_port)->default_value(8080), "The server port");
    ChaosUIToolkit::getInstance()->init(argc, argv);
   // ChaosMetadataServiceClient::getInstance()->init(argc, argv);

    ChaosWebController myController;
    cout<<"Opening "<<argv[0]<<" on port:"<<server_port<<endl;
    Server server(server_port);
    server.setOption("Access-Control-Allow-Origin","*");
   
    server.registerController(&myController);
    
    server.start(); 

    while (1) {
#ifdef WIN32
		Sleep(10000);
#else
        sleep(10);
#endif
    }
}
