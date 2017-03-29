#ifdef _MSC_VER
#include <windows.h>
#else
#include <unistd.h>
#endif
#include <stdlib.h>
#include <signal.h>

#include <ChaosMetadataServiceClient/ChaosMetadataServiceClient.h>
#include <mongoose/Server.h>
#include <mongoose/WebController.h>
#include "ChaosWebController.h"
#ifdef GOOGLE_PROFILE
#include <gperftools/profiler.h>
#else
#define ProfilerStart(x)
#define ProfilerStop()
#endif
using namespace std;
using namespace Mongoose;
using namespace chaos::ui;
using namespace chaos::metadata_service_client;

int main(int argc,char**argv)
{ 
    int server_port = 8080;     
    std::string nthreads="50";

  //  ChaosUIToolkit::getInstance()->getGlobalConfigurationInstance()->addOption("server_port", po::value<int>(&server_port)->default_value(8080), "The server port");
   // ChaosUIToolkit::getInstance()->init(argc, argv);
    ChaosMetadataServiceClient::getInstance()->getGlobalConfigurationInstance()->addOption("rest-port", po::value<int>(&server_port)->default_value(8080), "The server port");
    ChaosMetadataServiceClient::getInstance()->getGlobalConfigurationInstance()->addOption("rest-threads", po::value<std::string>(&nthreads)->default_value(nthreads), "Worker threads");

    ChaosMetadataServiceClient::getInstance()->init(argc, argv);

    ChaosWebController myController;
    cout<<"Opening "<<argv[0]<<" on port:"<<server_port<<endl;
    Server server(server_port);
    server.setOption("Access-Control-Allow-Origin","*");
    server.setOption("num_threads",nthreads.c_str());
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
