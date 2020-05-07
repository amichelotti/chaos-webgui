/*
 * Copyright 2012, 2017 INFN
 *
 * Licensed under the EUPL, Version 1.2 or – as soon they
 * will be approved by the European Commission - subsequent
 * versions of the EUPL (the "Licence");
 * You may not use this work except in compliance with the
 * Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in
 * writing, software distributed under the Licence is
 * distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied.
 * See the Licence for the specific language governing
 * permissions and limitations under the Licence.
 */

#ifndef __CHAOSFramework__HTTPServedBoostInterface__
#define __CHAOSFramework__HTTPServedBoostInterface__
#include <driver/misc/core/ChaosController.h>
#include "../AbstractWANInterface.h"

#include <chaos/common/utility/ObjectFactoryRegister.h>
#include <common/misc/scheduler/Scheduler.h>
#include <boost/thread.hpp>
#include <boost/atomic.hpp>
#include <boost/thread/mutex.hpp>
#include <served/served.hpp>
#if CHAOS_PROMETHEUS
#include <chaos/common/metric/metric.h>
#endif
namespace chaos {
    
    //forward declaration
    namespace common {
        namespace data {
            class CDataWrapper;
        }
    }


    namespace wan_proxy {
        namespace wan_interface {
            namespace http {
                

                //!interface param key
                static const char * const	OPT_HTTP_PORT			= "HTTP_wi_port";
                //!
                static const char * const	OPT_HTTP_THREAD_NUMBER  = "HTTP_wi_thread_number";
                static const char * const	OPT_CHAOS_THREAD_NUMBER  = "CHAOS_thread_number";
                class HTTPServedBoostInterface;
                struct ConnectedClientInfo{
                    std::string src;
                    std::string lastQuery;
                    uint64_t ops;
                    uint64_t lastConnection;
                    double avgTimeConn;
                    double avgTimeExec;

                    double kbOps;
                    ConnectedClientInfo():ops(0),lastConnection(0),kbOps(0),avgTimeExec(0),avgTimeConn(0){};
                    std::string getJson();
                };
class ServerMutexWrap:public served::multiplexer{
    protected:
    public:
        static HTTPServedBoostInterface*parent;
        ServerMutexWrap(){}
};
                /*
                 Class that implement the Chaos RPC server using HTTP
                 */
                DECLARE_CLASS_FACTORY(HTTPServedBoostInterface, AbstractWANInterface) {
                    REGISTER_AND_DEFINE_DERIVED_CLASS_FACTORY_HELPER(HTTPServedBoostInterface)
                    
                    HTTPServedBoostInterface(const string& alias);
                    ~HTTPServedBoostInterface();
                    
                    bool run;
                    
                    int thread_number;
                    static int chaos_thread_number;
                    
                     
                    std::string basePath;
                    //!poll the http server in a thread
                    static std::map<std::string,::driver::misc::ChaosController*> devs;

                    static ::driver::misc::ChaosController* info;
                    static std::vector< ::common::misc::scheduler::Scheduler* > sched_cu_v;
                    static int sched_alloc;
                    ServerMutexWrap mux;
                    served::net::server* server;
                    static void addDevice(std::string,::driver::misc::ChaosController*);
                    int removeDevice(const std::string&);
                    int removeFromQueue(const std::string&);

                    static ChaosSharedMutex devio_mutex;
                    static boost::mutex devurl_mutex;
                    static uint64_t last_check_activity;
                    void updateClientInfoPre(const std::string& key,ConnectedClientInfo&src);
                    void updateClientInfoPost(const std::string& key,ConnectedClientInfo&src,double kb);

                    void checkActivity();
                    static boost::mutex clientMapMutex;
                    boost::thread check_th;
                    bool check_enabled;
                public:
                    static std::map<std::string,ConnectedClientInfo> clientInfo;
                     int process(served::response & res, const served::request & req);
                     int processRest(served::response & res, const served::request & req);
                    #if CHAOS_PROMETHEUS
        //custom driver metrics
                    chaos::common::metric::GaugeUniquePtr counter_post_uptr;
                    chaos::common::metric::GaugeUniquePtr counter_get_uptr;
                    chaos::common::metric::GaugeUniquePtr counter_mds_post_uptr;
                    chaos::common::metric::GaugeUniquePtr counter_mds_get_uptr;
                    chaos::common::metric::GaugeUniquePtr counter_json_post_uptr;
                    chaos::common::metric::GaugeUniquePtr counter_json_get_uptr;
                    chaos::common::metric::GaugeUniquePtr monitored_objects_uptr;
                    chaos::common::metric::GaugeUniquePtr answer_ms_uptr;
                    chaos::common::metric::GaugeUniquePtr answer_kb_uptr;
                    chaos::common::metric::GaugeUniquePtr concurrent_clients_uptr;


                    #else

                        ChaosUniquePtr<uint32_t> counter_post_uptr;
                        ChaosUniquePtr<uint32_t> counter_get_uptr;
                        ChaosUniquePtr<uint32_t> concurrent_clients_uptr;

                        ChaosUniquePtr<uint32_t> counter_mds_post_uptr;
                        ChaosUniquePtr<uint32_t> counter_mds_get_uptr;
                        ChaosUniquePtr<uint32_t> counter_json_post_uptr;
                        ChaosUniquePtr<uint32_t> counter_json_get_uptr;
                        ChaosUniquePtr<uint32_t> monitored_objects_uptr;
                        ChaosUniquePtr<double> answer_ms_uptr;
                        ChaosUniquePtr<double> answer_kb_uptr;

                    #endif

                protected:
                    void timeout();
                    //inherited method
                    void init(void*) ;
                    
                    //inherited method
                    void start() ;
                    
                    //inherited method
                    void stop() ;
                    
                    //inherited method
                    void deinit();
                };
            }
        }
    }
}

#endif /* defined(__CHAOSFramework__HTTPServedBoostInterface__) */
