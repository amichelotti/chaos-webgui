#ifdef _MSC_VER
#include <windows.h>
#else
#include <unistd.h>
#endif
#include <stdlib.h>
#include <signal.h>

#include <ChaosMetadataServiceClient/ChaosMetadataServiceClient.h>
#include "MongooseServer.h"

#ifdef GOOGLE_PROFILE
#include <gperftools/profiler.h>
#else
#define ProfilerStart(x)
#define ProfilerStop()
#endif
using namespace std;
using namespace chaos::metadata_service_client;

int main(int argc,char**argv)
{ 
    std::string server_port = "8080";
    std::string nthreads="10";

  //  ChaosUIToolkit::getInstance()->getGlobalConfigurationInstance()->addOption("server_port", po::value<int>(&server_port)->default_value(8080), "The server port");
   // ChaosUIToolkit::getInstance()->init(argc, argv);
    ChaosMetadataServiceClient::getInstance()->getGlobalConfigurationInstance()->addOption("rest-port", po::value<std::string>(&server_port)->default_value("8081"), "The server port");
    ChaosMetadataServiceClient::getInstance()->getGlobalConfigurationInstance()->addOption("rest-threads", po::value<std::string>(&nthreads)->default_value(nthreads), "Worker threads");

    ChaosMetadataServiceClient::getInstance()->init(argc, argv);

    cout<<"Opening "<<argv[0]<<" on port:"<<server_port<<endl;
    MongooseServer server(server_port,atoi(nthreads.c_str()));
    server.start(); 

}
