#ifdef _MSC_VER
#include <windows.h>
#else
#include <unistd.h>
#endif
#include <stdlib.h>
#include <signal.h>
#include <chaos/ui_toolkit/ChaosUIToolkit.h>

#include <mongoose/Server.h>
#include <mongoose/WebController.h>
#include "ChaosController.h"
using namespace std;
using namespace Mongoose;
using namespace chaos::ui;

int main(int argc,char**argv)
{
    int server_port = 8080;     
    ChaosUIToolkit::getInstance()->getGlobalConfigurationInstance()->addOption("server_port", po::value<int>(&server_port)->default_value(8080), "The server port");
    ChaosUIToolkit::getInstance()->init(argc, argv);

    ChaosController myController;
    cout<<"Opening "<<argv[0]<<" on port:"<<server_port<<endl;
    Server server(server_port);
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
