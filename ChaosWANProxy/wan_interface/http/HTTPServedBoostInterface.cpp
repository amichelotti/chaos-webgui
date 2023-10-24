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

#include "HTTPServedBoostInterface.h"
#include "HTTPWANInterfaceStringResponse.h"
#include <map>
#include <vector>
#include <chaos/common/async_central/async_central.h>
#include <chaos/common/utility/TimingUtil.h>
#include <regex>
#include <boost/format.hpp>
#include <boost/algorithm/string/replace.hpp>
#include <sstream>
//#include <boost/algorithm/string.hpp>
#include <chaos/common/ChaosCommon.h>
#include <json/writer.h>
#include <json/json.h>
#if CHAOS_PROMETHEUS
using namespace chaos::common::metric;
#endif
using namespace chaos;
using namespace chaos::common::data;
using namespace chaos::common::utility;
using namespace chaos::wan_proxy::wan_interface;
using namespace chaos::wan_proxy::wan_interface::http;
using namespace chaos::common::async_central;

#define API_PREFIX_V1 "/api/v1"
#define API_PATH_REGEX_V1(p) API_PREFIX_V1 p

#define HTTWANINTERFACE_LOG_HEAD "[HTTPServedBoostInterface" << current_index << "] -"
#define LOG_CONNECTION "[" << request.source()<<"] "

#define HTTWAN_INTERFACE_APP_ INFO_LOG(HTTPServedBoostInterface)
#define HTTWAN_INTERFACE_DBG_ DBG_LOG(HTTPServedBoostInterface)
#define HTTWAN_INTERFACE_ERR_ ERR_LOG(HTTPServedBoostInterface)
int HTTPServedBoostInterface::chaos_thread_number=1;
int HTTPServedBoostInterface::sched_alloc=0;
std::map<std::string, ::driver::misc::ChaosController *> HTTPServedBoostInterface::devs;
//std::vector< ::common::misc::scheduler::Scheduler* > HTTPServedBoostInterface::sched_cu_v;
ChaosMutex HTTPServedBoostInterface::devio_mutex;
ChaosMutex HTTPServedBoostInterface::devurl_mutex;
::driver::misc::ChaosController* HTTPServedBoostInterface::info=NULL;

uint64_t HTTPServedBoostInterface::last_check_activity = 0;

std::map<std::string,ConnectedClientInfo> HTTPServedBoostInterface::clientInfo;
ChaosMutex HTTPServedBoostInterface::clientMapMutex;
HTTPServedBoostInterface* ServerMutexWrap::parent=NULL;
/**
 * The handlers below are written in C to do the binding of the C mongoose with
 * the C++ API
 */
ChaosSharedMutex http_mutex;

static std::map<std::string, std::string> mappify(const std::string &s)
{
    std::map<std::string, std::string> m;
    std::regex regx("([a-zA-Z_]+)=(.+)");
    try
    {
        std::smatch mres;
        if(std::regex_search(s,mres,std::regex("^cmd=(.+)&parm=(.+)"),std::regex_constants::match_any)){
            if(s.size()>20000){
                HTTWAN_INTERFACE_DBG_<<" match 1"<<mres[1]<<" 2:"<<mres[2];

            }
            m["cmd"]=mres[1];
            m["parm"]=mres[2];
            return m;
        } else if(std::regex_search(s,mres,std::regex("^dev=(.+)&cmd=(.+)&parm=(.+)"))){
            m["dev"]=mres[1];
            m["cmd"]=mres[2];
            m["parm"]=mres[3];
            return m;
        }
        /*
        std::istringstream iss(s);
        std::vector<std::string> api_token_list0((std::istream_iterator<WordDelimitedBy<'&'>>(iss)),
                                 std::istream_iterator<WordDelimitedBy<'&'>>());
                                 */          
        std::vector<std::string> api_token_list0;
        //boost::split(api_token_list0, s, boost::is_any_of("&"));
        api_token_list0=chaos::split(s,"&");
        for (std::vector<std::string>::iterator i = api_token_list0.begin(); i != api_token_list0.end(); i++)
        {
            std::match_results<std::string::const_iterator> what;
            std::string::const_iterator startPos = (*i).begin();
            std::string::const_iterator endPos = (*i).end();
            while (std::regex_search(startPos, endPos, what, regx))
            {
                m[what[1]] = what[2];
                startPos = what[0].second;
            }
        }
    }
    catch (const std::regex_error &ex)
    {
        LERR_ << ex.what();
    }

    return m;
}
std::string ConnectedClientInfo::getJson(){
    chaos::common::data::CDataWrapper cw;
    cw.addStringValue("client",src);
    cw.addDoubleValue("kb",kbOps);
    cw.addInt64Value("lastConnection",lastConnection);
    cw.addInt64Value("ops",ops);
    cw.addDoubleValue("avgTimeConn",avgTimeConn);
    cw.addDoubleValue("avgTimeExec",avgTimeExec);
    return cw.getCompliantJSONString();

}

/*static int event_handler(struct mg_connection *connection, enum mg_event ev)
{

    if ((ev == MG_REQUEST) && (connection->server_param != NULL))
    {
        HTTPServedBoostInterface *ptr=(HTTPServedBoostInterface *)connection->server_param;
        if ((strstr(connection->uri, API_PREFIX_V1)) && ptr->handle(connection))
        {
            ptr->processRest(connection);
        }
        else
        {

            ptr->process(connection);
        }
        return MG_MORE;
    } else if(ev == MG_POLL){
        if(connection->server_param==0){
            return MG_TRUE;
        }
    }
    else if (ev == MG_AUTH)
    {
        return MG_TRUE;
    }
    return MG_FALSE;
}

static void flush_response(struct mg_connection *connection,
                           AbstractWANInterfaceResponse *response)
{
    CHAOS_ASSERT(connection && response)
    mg_send_status(connection, response->getCode());

    for (std::map<std::string, std::string>::const_iterator it = response->getHeader().begin();
         it != response->getHeader().end();
         it++)
    {
        mg_send_header(connection, it->first.c_str(), it->second.c_str());
    }

    uint32_t body_len = 0;
    const char *body = response->getBody(body_len);
    mg_send_data(connection, body, body_len);
    connection->server_param=0;
}
*/
DEFINE_CLASS_FACTORY(HTTPServedBoostInterface, AbstractWANInterface);
HTTPServedBoostInterface::HTTPServedBoostInterface(const string &alias) : AbstractWANInterface(alias),
                                                        run(false),
                                                        thread_number(1),server(NULL)
{
    if(info==NULL){
        info = new ::driver::misc::ChaosController();
    }
    ServerMutexWrap::parent=this;

#ifdef CHAOS_PROMETHEUS
    chaos::common::metric::MetricManager::getInstance()->createGaugeFamily("webui_gauge_ops", "Realtine performance information");
    chaos::common::metric::MetricManager::getInstance()->createGaugeFamily("webui_gauge_mon", "Reatime live monitoring");
    //add custom driver metric
    counter_post_uptr = MetricManager::getInstance()->getNewGaugeFromFamily("webui_gauge_ops", {{"type","rest_ctrl_post"}});
    counter_get_uptr= MetricManager::getInstance()->getNewGaugeFromFamily("webui_gauge_ops",{{"type","rest_ctrl_get"}});
    counter_mds_post_uptr = MetricManager::getInstance()->getNewGaugeFromFamily("webui_gauge_ops", {{"type","rest_admin_post"}});
    counter_mds_get_uptr= MetricManager::getInstance()->getNewGaugeFromFamily("webui_gauge_ops",{{"type","rest_admin_get"}});
    counter_json_post_uptr = MetricManager::getInstance()->getNewGaugeFromFamily("webui_gauge_ops",{{"type","rest_json_post"}});
    counter_json_get_uptr= MetricManager::getInstance()->getNewGaugeFromFamily("webui_gauge_ops",{{"type","rest_json_get"}});
    monitored_objects_uptr=MetricManager::getInstance()->getNewGaugeFromFamily("webui_gauge_mon",{{"type","monitored_chaos_objects"}});
    answer_ms_uptr=MetricManager::getInstance()->getNewGaugeFromFamily("webui_gauge_mon",{{"type","answer_ms"}});
    answer_kb_uptr=MetricManager::getInstance()->getNewGaugeFromFamily("webui_gauge_mon",{{"type","answer_kb"}});
    concurrent_clients_uptr=MetricManager::getInstance()->getNewGaugeFromFamily("webui_gauge_mon",{{"type","concurrent_clients"}});

#else
    counter_post_uptr.reset(new uint32_t);
    counter_get_uptr.reset(new uint32_t);
    counter_mds_post_uptr.reset(new uint32_t);
    counter_mds_get_uptr.reset(new uint32_t);
    counter_json_post_uptr.reset(new uint32_t);
    counter_json_get_uptr.reset(new uint32_t);
    monitored_objects_uptr.reset(new uint32_t);
    answer_ms_uptr.reset(new double);
    answer_kb_uptr.reset(new double);
    concurrent_clients_uptr.reset(new uint32_t);


#endif
    *counter_post_uptr=0;
    *counter_get_uptr=0;
    *counter_mds_post_uptr=0;
    *counter_mds_get_uptr=0;
    *counter_json_post_uptr=0;
    *counter_json_get_uptr=0;
    *monitored_objects_uptr=0;
    *answer_ms_uptr=0;
    *answer_kb_uptr=0;
    *concurrent_clients_uptr=0;

}

HTTPServedBoostInterface::~HTTPServedBoostInterface() {}

void HTTPServedBoostInterface::timeout()
{
    HTTPServedBoostInterface::checkActivity();
}


void HTTPServedBoostInterface::updateClientInfoPre(const std::string& key,ConnectedClientInfo&src){
    {
      //  ChaosLockGuard ll(clientMapMutex);
    if(HTTPServedBoostInterface::clientInfo.find(key)!=HTTPServedBoostInterface::clientInfo.end()){
                src=HTTPServedBoostInterface::clientInfo[key];
                
    } else {
        src.src=key;
    }
    }
    src.ops++;
    
    src.avgTimeConn=(TimingUtil::getTimeStampInMicroseconds()-src.lastConnection)*1.0/src.ops;
    src.lastConnection=TimingUtil::getTimeStampInMicroseconds();
            
}
void HTTPServedBoostInterface::updateClientInfoPost(const std::string& key,ConnectedClientInfo&src,double kb){

    src.avgTimeExec=(TimingUtil::getTimeStampInMicroseconds()-src.lastConnection)*1.0/src.ops;
    src.kbOps+=kb;
   // ChaosLockGuard ll(clientMapMutex);

    HTTPServedBoostInterface::clientInfo[key]=src;
}

//inherited method
void HTTPServedBoostInterface::init(void *init_data) 
{
    signal(SIGPIPE, SIG_IGN);
    //! forward message to superclass

    AbstractWANInterface::init(init_data);
    //clear in case last deinit fails

    //check for parameter
    if (getParameter()[OPT_HTTP_PORT].isNull() ||
        !getParameter()[OPT_HTTP_PORT].isInt())
    {
        std::string err = "Port for http interface as not be set!";
        HTTWAN_INTERFACE_ERR_ << err;
        throw chaos::CException(-1, err, __PRETTY_FUNCTION__);
    }
    else
    {
        service_port = getParameter()[OPT_HTTP_PORT].asInt();
    }

    if (getParameter()[OPT_HTTP_THREAD_NUMBER].isNull() ||
        !getParameter()[OPT_HTTP_THREAD_NUMBER].isInt())
    {
        thread_number = 1;
    }
    else
    {
        thread_number = getParameter()[OPT_HTTP_THREAD_NUMBER].asInt();
    }

    if (getParameter()[OPT_CHAOS_THREAD_NUMBER].isNull() ||
        !getParameter()[OPT_CHAOS_THREAD_NUMBER].isInt())
    {
        chaos_thread_number = 1;
    }
    else
    {
        chaos_thread_number = getParameter()[OPT_CHAOS_THREAD_NUMBER].asInt();
    }
    HTTWAN_INTERFACE_APP_ << "HTTP server listen on port: " << service_port;
    HTTWAN_INTERFACE_APP_ << "HTTP server thread used: " << thread_number;
    HTTWAN_INTERFACE_APP_ << "CHAOS client threads used: " << chaos_thread_number;


// GET /hello
/*    mux.handle("/CU")
		.get([](served::response & res, const served::request & req) {
            HTTWAN_INTERFACE_DBG_<<" GET /CU"<<req.body();

            process(res,req);
		});
    mux.handle("/MDS")
		.get([](served::response & res, const served::request & req) {
            HTTWAN_INTERFACE_DBG_<<" GET /MDS"<<req.body();

            process(res,req);
		});

	mux.handle(API_PREFIX_V1)
		.get([](served::response & res, const served::request & req) {
            processRest(res,req);
		});
*/

mux.handle(API_PREFIX_V1)
		.post([](served::response & res, const served::request & req) {
            ConnectedClientInfo tmp;
            
            ServerMutexWrap::parent->updateClientInfoPre(req.source(),tmp);
            (*ServerMutexWrap::parent->counter_json_post_uptr)++;
            ServerMutexWrap::parent->processRest(res,req);

            (*ServerMutexWrap::parent->answer_kb_uptr)+=(res.body_size()*1.0/1024.0);
            ServerMutexWrap::parent->updateClientInfoPost(req.source(),tmp,(res.body_size()*1.0/1024.0));

		}).get([](served::response & res, const served::request & req) {
            ConnectedClientInfo tmp;

            (*ServerMutexWrap::parent->counter_json_get_uptr)++;
            ServerMutexWrap::parent->updateClientInfoPre(req.source(),tmp);

            ServerMutexWrap::parent->processRest(res,req);
            (*ServerMutexWrap::parent->answer_kb_uptr)+=(res.body_size()*1.0/1024.0);
            ServerMutexWrap::parent->updateClientInfoPost(req.source(),tmp,(res.body_size()*1.0/1024.0));

            
		});;
    mux.handle("/CU").post([](served::response & res, const served::request & req) {
            ConnectedClientInfo tmp;
            ServerMutexWrap::parent->updateClientInfoPre(req.source(),tmp);
            if(req.body().size()<1024){
                HTTWAN_INTERFACE_DBG_<<" POST /CU "<<req.body();
            } else {
                HTTWAN_INTERFACE_DBG_<<" POST /CU "<<req.body().substr(0,1024)<<".... "<<req.body().size();
            }
            
            (*ServerMutexWrap::parent->counter_post_uptr)++;

            ServerMutexWrap::parent->process(res,req);
            (*ServerMutexWrap::parent->answer_kb_uptr)+=(res.body_size()*1.0/1024.0);
            ServerMutexWrap::parent->updateClientInfoPost(req.source(),tmp,(res.body_size()*1.0/1024.0));

		}).get([](served::response & res, const served::request & req) {
            ConnectedClientInfo tmp;

            HTTWAN_INTERFACE_DBG_<<" GET /CU "<<req.body();
            (*ServerMutexWrap::parent->counter_get_uptr)++;
            ServerMutexWrap::parent->updateClientInfoPre(req.source(),tmp);

            ServerMutexWrap::parent->process(res,req);
            (*ServerMutexWrap::parent->answer_kb_uptr)+=(res.body_size()*1.0/1024.0);
            ServerMutexWrap::parent->updateClientInfoPost(req.source(),tmp,(res.body_size()*1.0/1024.0));

		});;

    mux.handle("/MDS")
		.post([](served::response & res, const served::request & req) {
            ConnectedClientInfo tmp;
            if(req.body().size()<1024){
                HTTWAN_INTERFACE_DBG_<<" POST /MDS "<<req.body();
            } else {
                HTTWAN_INTERFACE_DBG_<<" POST /MDS "<<req.body().substr(0,1024)<<".... "<<req.body().size();;
            }
            (*ServerMutexWrap::parent->counter_mds_post_uptr)++;
            ServerMutexWrap::parent->updateClientInfoPre(req.source(),tmp);

            ServerMutexWrap::parent->process(res,req);
            (*ServerMutexWrap::parent->answer_kb_uptr)+=(res.body_size()*1.0/1024.0);
            ServerMutexWrap::parent->updateClientInfoPost(req.source(),tmp,(res.body_size()*1.0/1024.0));


		}).get([](served::response & res, const served::request & req) {
            ConnectedClientInfo tmp;

            HTTWAN_INTERFACE_DBG_<<" GET /CU"<<req.body();
            (*ServerMutexWrap::parent->counter_mds_get_uptr)++;
            ServerMutexWrap::parent->updateClientInfoPre(req.source(),tmp);

            ServerMutexWrap::parent->process(res,req);
            (*ServerMutexWrap::parent->answer_kb_uptr)+=(res.body_size()*1.0/1024.0);
            ServerMutexWrap::parent->updateClientInfoPost(req.source(),tmp,(res.body_size()*1.0/1024.0));

		});;


    mux.handle("/clients")
		.post([](served::response & res, const served::request & req) {
            ConnectedClientInfo tmp;

            (*ServerMutexWrap::parent->counter_mds_post_uptr)++;
            HTTWAN_INTERFACE_DBG_<<" GET /clients:"<<req.source();
            ServerMutexWrap::parent->updateClientInfoPre(req.source(),tmp);

            std::stringstream ss;
            ss<<"[";
            {
               // ChaosLockGuard ll(clientMapMutex);

            for(auto i = clientInfo.begin();i!=clientInfo.end();){
                ss<<i->second.getJson();
                if(++i != clientInfo.end()){
                    ss<<",";
                }
            }
            }
            ss<<"]";
            res<<ss.str();
            res.set_header("Access-Control-Allow-Origin","*");
            res.set_status(served::status_2XX::OK);
            (*ServerMutexWrap::parent->answer_kb_uptr)+=(res.body_size()*1.0/1024.0);
            ServerMutexWrap::parent->updateClientInfoPost(req.source(),tmp,(res.body_size()*1.0/1024.0));

		}).get([](served::response & res, const served::request & req) {
            ConnectedClientInfo tmp;

            std::stringstream ss;
            HTTWAN_INTERFACE_DBG_<<" POST /clients:"<<req.source();
            ServerMutexWrap::parent->updateClientInfoPre(req.source(),tmp);

            (*ServerMutexWrap::parent->counter_mds_get_uptr)++;

            ss<<"[";
            {
              //  ChaosLockGuard ll(clientMapMutex);

            for(auto i = clientInfo.begin();i!=clientInfo.end();){
                ss<<i->second.getJson();
                
                if(++i != clientInfo.end()){
                    ss<<",";
                }
            }
            }
            ss<<"]";
            res<<ss.str();
            res.set_header("Access-Control-Allow-Origin","*");
            res.set_status(served::status_2XX::OK);
             (*ServerMutexWrap::parent->answer_kb_uptr)+=(res.body_size()*1.0/1024.0);
            ServerMutexWrap::parent->updateClientInfoPost(req.source(),tmp,(res.body_size()*1.0/1024.0));


		});;

    mux.handle("/proxy").post([](served::response & res, const served::request & req) {
            ConnectedClientInfo tmp;
            std::stringstream out;
            std::map<std::string, std::string> request_param=mappify(req.body());

            chaos::common::data::CDataWrapper r;
            try{
             r.setSerializedJsonData(req.body().c_str());
            } catch(...){
                    HTTWAN_INTERFACE_ERR_<<" Invalid JSON:"<<req.body();
                    return;
            }
            if(r.hasKey("server")&&r.hasKey("api")){
                HTTWAN_INTERFACE_DBG_<<"PROXING POST /proxy "<<r.getJSONString();
                chaos::common::http::HttpPost client;

                int ret=client.post(r.getStringValue("server"),r.getStringValue("api"),req.body(),out);
                res<<out.str();
                res.set_header("Access-Control-Allow-Origin","*");
                res.set_status(ret);
                
                HTTWAN_INTERFACE_DBG_<<ret<<"] POST "<<request_param["server"]<<"/proxy/"<<request_param["api"]<<"request:"<<req.body()<<" Answer ["<<out.str().size()<<"]";

                return;
            }
            HTTWAN_INTERFACE_ERR_<<" POST /proxy:"<<req.source()<<" missing 'server' or 'api' keys";

            res.set_status(served::status_4XX::BAD_REQUEST);


		});       

	// Create the server and run with 10 handler threads.
	
    //allcoate each server for every thread
   #if 0 
    sched_cu_v.resize(chaos_thread_number);
    for (int cnt = 0; cnt < chaos_thread_number; cnt++)
    {
        sched_cu_v[cnt] = new ::common::misc::scheduler::Scheduler();
    }
    #endif
    sched_alloc = 0;
    last_check_activity = TimingUtil::getTimeStampInMicroseconds();
}

//inherited method
void HTTPServedBoostInterface::start()
{

    run = true;
   // AsyncCentralManager::getInstance()->addTimer(this, CHECK_ACTIVITY_CU, CHECK_ACTIVITY_CU);

    #if 0
    for (std::vector<::common::misc::scheduler::Scheduler *>::iterator i = sched_cu_v.begin(); i != sched_cu_v.end(); i++)
    {
        (*i)->start();
    }
    #endif
    if(server){
        delete server;
        server=NULL;
    }

    char port[256];
    sprintf(port,"%d",service_port);
    check_enabled=true;
    check_th = boost::thread(&HTTPServedBoostInterface::checkActivity,this);
    server =new served::net::server("0.0.0.0",port,mux);
    while(check_enabled&& server){
        HTTWAN_INTERFACE_APP_ << " Starting REST Service on:"<<port<<", threads "<<chaos_thread_number;

	    server->run(chaos_thread_number);
        server->stop();
        HTTWAN_INTERFACE_APP_ << " EXIT REST Service threads, restarting ...";
        delete server;
        server =new served::net::server("0.0.0.0",port,mux);

    }
    HTTWAN_INTERFACE_APP_ << " EXIT REST Service";

    run=false;
}

//inherited method
void HTTPServedBoostInterface::stop() 
{
    HTTWAN_INTERFACE_APP_ << " STOP";
    check_enabled=false;

    run = false;
#if 0
    for (std::vector<::common::misc::scheduler::Scheduler *>::iterator i = sched_cu_v.begin(); i != sched_cu_v.end(); i++)
    {
        (*i)->stop();
    }
#endif
    check_th.join();
    server->stop();
}

//inherited method
void HTTPServedBoostInterface::deinit()
{
    AsyncCentralManager::getInstance()->removeTimer(this);

    //clear the service url
    service_port = 0;
   /* for (int cnt = 0; cnt < chaos_thread_number; cnt++)
    {
        if (sched_cu_v[cnt])
        {
            delete (sched_cu_v[cnt]);
        }
        sched_cu_v[cnt] = NULL;
    }*/
    server->stop();
    delete server;
    server=NULL;
}

void HTTPServedBoostInterface::addDevice(std::string name, ::driver::misc::ChaosController *d)
{
    devs[name] = d;
}
template<char delimiter>
class WordDelimitedBy : public std::string
{};


int HTTPServedBoostInterface::removeFromQueue(const std::string &devname)
{
    int cntt = 0;
    for (int cnt = 0; cnt < chaos_thread_number; cnt++)
    {
      /*  if (sched_cu_v[cnt]->remove(devname))
        {
            cntt++;
            HTTWAN_INTERFACE_DBG_ << "* removing \"" << devname << "\" from scheduler " << cnt << " inst:" << cntt;
        }*/
    }
    return cntt;
}
int HTTPServedBoostInterface::removeDevice(const std::string &devname)
{

    std::map<std::string, ::driver::misc::ChaosController *>::iterator i = devs.find(devname);
    if (i != devs.end())
    {


        HTTWAN_INTERFACE_DBG_ << "* removing \"" << devname << "\" from known devices";
        ChaosLockGuard ll(devio_mutex);
        devs.erase(i);
        delete i->second;

        return 1;
    }
    return 0;
}
    
static std::string decode(const std::string& s) {
        std::ostringstream oss;
        for (int i = 0; i < s.size(); ++i) {
            char c = s[i];
            if (c == '%') {
                int d;
                std::istringstream iss(s.substr(i+1, 2));
                iss >> std::hex >> d;
                oss << static_cast<char>(d);
                i += 2;
            } else {
                oss << c;
            }
        }
        return oss.str();
    }
int HTTPServedBoostInterface::process(served::response & res, const served::request & request)
{
    int err = 0;
    uint64_t execution_time_start = TimingUtil::getTimeStampInMicroseconds();
    uint64_t execution_time_end = 0;
    std::string cmd, parm, dev_param;
    std::vector<std::string> dev_v;

  //  HTTPWANInterfaceStringResponse response("text/html");
    //response.addHeaderKeyValue("Access-Control-Allow-Origin", "*");
    std::stringstream ss;
    served::method method=request.method();
    std::map<std::string, std::string> request_param;
    int cmd_schedule=0,cmd_prio=0,cmd_mode=0 ;
    std::string query;

    if (method == served::method::GET ){
        query=decode(request.url().query());

        request_param=mappify(query);
        if(request_param.size()==0){
                HTTWAN_INTERFACE_ERR_  << "Malformed Query:" << query;
                res.set_status(served::status_4XX::BAD_REQUEST);
                return 1;

        }
        if(request_param.count("dev")){
            dev_param = request_param["dev"];
           // boost::split(dev_v, dev_param, boost::is_any_of(","));
            dev_v=chaos::split(dev_param,":");
        }
        if(request_param.count("cmd")){
            cmd = request_param["cmd"];
        }
        if(request_param.count("parm")){
            parm = request_param["parm"];
        }
        if(request_param.count("sched")){
            cmd_schedule=atoi( request_param["sched"].c_str());

        }
        if(request_param.count("prio")){
            cmd_prio = atoi(request_param["prio"].c_str());

        }
        if(request_param.count("mode")){
            cmd_mode = atoi(request_param["mode"].c_str());

        }

        
    } else if(method == served::method::POST){
        Json::Reader json_reader;
        Json::Value json_parameter;

        query=request.body();
        if (!json_reader.parse(query, json_parameter)) {
                HTTWAN_INTERFACE_ERR_  << "BAD JSON QUERY:" << json_parameter;
                HTTWAN_INTERFACE_ERR_  << "Malformed Query:" << query;
                res.set_status(served::status_4XX::BAD_REQUEST);
                return 1;
               
        }
        if(!json_parameter["dev"].isNull()){
            if(json_parameter["dev"].isArray()){
            for (Json::ValueIterator it = json_parameter["dev"].begin();it != json_parameter["dev"].end(); ++it) {
                if (it->isString()) {
                    dev_v.push_back(it->asString());
                } else {
                    HTTWAN_INTERFACE_ERR_  << "'dev' field must be an array of strings, json:" << json_parameter;
                    res.set_status(served::status_4XX::BAD_REQUEST);
                    return 1;
                }
               
            }
            } else if(json_parameter["dev"].isString()){
                dev_v.push_back(json_parameter["dev"].asString());

            }
        } 

        
        if(json_parameter["cmd"].isString()){
            cmd = json_parameter["cmd"].asString();
        }
        if(!json_parameter["parm"].isNull()){
            //Json::StreamWriterBuilder wbuilder("");
            Json::FastWriter json_writer;
            parm=json_writer.write(json_parameter["parm"]);
            //qwbuilder["indentation"] = "";       // Optional
           // parm =Json::writeString(wbuilder,json_parameter["parm"]);//json_parameter["parm"].toStyledString();
        }
        if(json_parameter["sched"].isInt()){
            cmd_schedule=json_parameter["sched"].asInt();

        }
         if(json_parameter["prio"].isInt()){
            cmd_prio=json_parameter["prio"].asInt();

        }
         if(json_parameter["mode"].isInt()){
            cmd_mode=json_parameter["mode"].asInt();

        }
       



    } else {
                HTTWAN_INTERFACE_ERR_  << "UNSUPPORTED METHOD:" << method_to_string(method);
                res.set_status(served::status_4XX::METHOD_NOT_ALLOWED);
                return 1;
    }
    
    res.set_header("Access-Control-Allow-Origin","*");
   /* for ( const auto & query_param : request.query ){
				ss << "Key: " << query_param.first << ", Value: " << query_param.second << "\n";
	}
    HTTWAN_INTERFACE_DBG_<<" process params:"<<ss.str();
    */
    ::driver::misc::ChaosController *controller = NULL;

    
    try
    {
        
            //remove the prefix and tokenize the url
        std::vector<std::string> devToRemove;
        
        
        bool always_vector = true;
        if (cmd.find("query") != std::string::npos)
        {
            always_vector = false;
        }
        std::stringstream answer_multi;
        if (dev_v.size() == 0)
        {
           // ChaosReadLock l(devio_mutex);
            std::string ret;
            if (info->get(cmd, (char *)parm.c_str(), 0, cmd_prio, cmd_schedule, cmd_mode, 0, ret) != ::driver::misc::ChaosController::CHAOS_DEV_OK)
            {
                HTTWAN_INTERFACE_ERR_  << LOG_CONNECTION <<"An error occurred during get without dev:" << info->getJsonState();
               // response.setCode(400);
               res.set_status(served::status_4XX::EXPECTATION_FAILED);
               
            }
            else
            {
               res.set_status(served::status_2XX::OK);
            }
            res << ret;
        }
        else
        {
            res.set_status(served::status_2XX::OK);
            if (dev_v.size() > 1 || always_vector)
            {
                answer_multi << "[";
            }
            // creation
            for (std::vector<std::string>::iterator idevname = dev_v.begin(); idevname != dev_v.end(); idevname++)
            {
                if ((*idevname).empty() || cmd.empty())
                {
                    continue;
                }
                //ChaosWriteLock l(devio_mutex);

                if (devs.find(*idevname) == devs.end())
                {
                     HTTWAN_INTERFACE_DBG_ << "* Creating controller for \"" << *idevname << "\"";
                    controller = new ::driver::misc::ChaosController();
                    if (controller)
                    {
                        if (controller->init(*idevname, chaos::RpcConfigurationKey::GlobalRPCTimeoutinMSec) != 0)
                        {
                            HTTWAN_INTERFACE_ERR_ << LOG_CONNECTION <<"cannot init controller for " << *idevname << "\"";
                            //  response << "{}";
                            //response.setCode(400);
                            delete controller;
                            //flush_response(connection, &response);
                            //return 1;
                        }
                        else
                        {
                            HTTWAN_INTERFACE_DBG_ << "* adding device \"" << *idevname << "\"";
                            addDevice(*idevname, controller);
                          //  sched_cu_v[sched_alloc++ % chaos_thread_number]->add(*idevname, controller);

                            
                        }
                    }
                }
            }
            ///
            for (std::vector<std::string>::iterator idevname = dev_v.begin(); idevname != dev_v.end(); idevname++)
            {
                std::string ret;

                if ((*idevname).empty() || cmd.empty())
                {
                    continue;
                }
               // ChaosReadLock l(devio_mutex);
                std::map<std::string, ::driver::misc::ChaosController *>::iterator dd = devs.find(*idevname);
                if (dd != devs.end())
                {
                    controller = dd->second;
                    if (controller->get(cmd, (char *)parm.c_str(), 0, cmd_prio,cmd_schedule, cmd_mode, 0, ret) != ::driver::misc::ChaosController::CHAOS_DEV_OK)
                    {
                        HTTWAN_INTERFACE_ERR_  << LOG_CONNECTION <<"An error occurred during get of:\"" << *idevname << "\"";
                        res.set_status(400);
                    }
                }
                if ((idevname + 1) == dev_v.end())
                {
                    if (dev_v.size() > 1 || always_vector)
                    {
                        answer_multi << ret << "]";
                    }
                    else
                    {
                        answer_multi << ret;
                    }
                }
                else
                {
                    answer_multi << ret << ",";
                }
            }
            res << answer_multi.str();
        
            /***** CHECK FOR DEVICES NOT ACCESSED IN xx MIN**/
        }
    }
    catch (std::exception e)
    {
        HTTWAN_INTERFACE_ERR_  <<LOG_CONNECTION << "An exception occurred:" << e.what();
        res << "{}";
        res.set_status(served::status_4XX::EXPECTATION_FAILED);
    }
    catch (...)
    {
        HTTWAN_INTERFACE_ERR_  <<LOG_CONNECTION << "Uknown exception occurred:";
        res << "{}";
        res.set_status(served::status_4XX::EXPECTATION_FAILED);
    }
    {

       // ChaosLockGuard lurl(devurl_mutex);
        execution_time_end = TimingUtil::getTimeStampInMicroseconds();

        uint64_t duration = execution_time_end - execution_time_start;
        DEBUG_CODE(HTTWAN_INTERFACE_DBG_  << "Execution time is:" << duration * 1.0 / 1000.0 << " ms";)
        *answer_ms_uptr=duration * 1.0 / 1000.0;
    }
    return 1; //
}
void HTTPServedBoostInterface::checkActivity()
{
    HTTWAN_INTERFACE_APP_ << "checkActivity - THREAD STARTS";

    while(check_enabled){

    int64_t now = TimingUtil::getTimeStampInMicroseconds();
    /* if((now-last_check_activity)<CHECK_ACTIVITY_CU){
        return;
    }
    HTTWAN_INTERFACE_DBG_<<" checking activity after:"<<(1.0*(now-last_check_activity)/1000000.0)<<" s";
    last_check_activity = now;
    */
  //  HTTWAN_INTERFACE_APP_ << "checkActivity - STARTS";
    /*
    for (std::map<std::string, ::driver::misc::ChaosController *>::iterator i = devs.begin(); i != devs.end(); i++)
    {
        if ((i->second->lastAccess() > 0))
        {
            int64_t elapsed = (now - (i->second)->lastAccess());
            if ((elapsed > PRUNE_NOT_ACCESSED_CU)){
                HTTWAN_INTERFACE_DBG_ << "* pruning \"" << i->first << "\" because elapsed " << ((1.0 * elapsed) / 1000000.0) << " s last time access:" << ((i->second)->lastAccess() / 1000000.0) << " s ago";
                removeFromQueue(i->first);
            }
        }
    }
        for (std::vector<std::string>::iterator idevname = devToRemove.begin(); idevname != devToRemove.end(); idevname++){
                ChaosWriteLock l(devio_mutex);
                std::map<std::string, ::driver::misc::ChaosController *>::iterator dd =devs.find(*idevname);
                if(dd !=devs.end()){
                    delete (dd->second);
                    devs.erase(dd);
                }
            }

    */
  /*    {
        ChaosLockGuard ll(clientMapMutex);
        for(auto i=clientInfo.begin();i!=clientInfo.end();){
            if(now - i->second.lastConnection > (1000*CHECK_ACTIVITY_CU )){
                HTTWAN_INTERFACE_DBG_<< " * removing client \""<<i->second.src<<" from known clients";
                i=clientInfo.erase(i);
            } else {
                HTTWAN_INTERFACE_DBG_<< " * connected client \""<<i->second.src<<" ops:"<<i->second.ops<<" kb:"<<i->second.kbOps<<" average conn time:"<<i->second.avgTimeConn<<" us, average exec time:"<<i->second.avgTimeExec<<" us";

                ++i;
            }
        }

    }
    *concurrent_clients_uptr=clientInfo.size();

    std::map<std::string, ::driver::misc::ChaosController *>::iterator i;
    {
        ChaosLockGuard l(devio_mutex);
        i = devs.begin();
    }
    // remove not alive first;
    int cnt=devs.size();
    *monitored_objects_uptr=cnt;

    //std::vector<std::string> controller_toremove;
    std::vector<std::string> alive=info->searchAlive("");

    while (i != devs.end()){
        bool dev_alive=true;
        if(std::find(alive.begin(),alive.end(),i->first)==alive.end()){
            HTTWAN_INTERFACE_DBG_ << "* device  \"" << i->first << "\" is not alive";
            dev_alive=false; 
        } else {
            uint64_t healt=i->second->getCachedHealthTimeStamp();
            uint64_t nowms=now/1000;
            if((healt>0)&&(nowms> healt)&&((nowms-healt)>(2*CHECK_ACTIVITY_CU))){
                dev_alive=false;
                HTTWAN_INTERFACE_DBG_ << "* device \""<<i->first<<"\" does not update live since  "<<(nowms-healt)<<" ms ago, last healt:"<<healt; 
            }
            // check also if driver is linked to a live cu
        }
        if ((i->second->lastAccess() > 0)||(dev_alive == false)){
            int64_t elapsed = (now - (i->second)->lastAccess());
            if ((elapsed > PRUNE_NOT_ACCESSED_CU)||(dev_alive == false)){
                if(devio_mutex.try_lock()){
                    std::string name=i->first;
                    ::driver::misc::ChaosController *tmp = i->second;
                    devs.erase(i++);
                    devio_mutex.unlock();
                    HTTWAN_INTERFACE_DBG_ << "* pruning \"" << name << "\" because elapsed " << ((1.0 * elapsed) / 1000000.0) << " s last time access:" << (tmp->lastAccess() / 1000000.0) << " s ago";
                    removeFromQueue(name);
                    delete tmp;

                    
                    continue;
                }

            }
        }

        i++;
    }*/

    
    HTTWAN_INTERFACE_APP_ << "checkActivity ENDS remaining dev:"<<devs.size();
    boost::this_thread::sleep_for(boost::chrono::milliseconds{CHECK_ACTIVITY_CU});

    }
    HTTWAN_INTERFACE_APP_ << "checkActivity - THREAD EXITS";

}

                    

int HTTPServedBoostInterface::processRest(served::response & res, const served::request & request)
{
   CHAOS_ASSERT(handler)
    int err = 0;
    uint64_t execution_time_start = TimingUtil::getTimeStampInMicroseconds();
    uint64_t execution_time_end = 0;
    Json::Value json_request;
    Json::Value json_response;
    Json::StyledWriter json_writer;
    Json::Reader json_reader;
//    HTTPWANInterfaceStringResponse response("application/json");
    res.set_header("Content-Type","application/json");  
    //scsan for content type request
    const std::string api_uri = request.url().path().substr(strlen(API_PREFIX_V1) + 1);

    //const std::string api_uri = request.url().path();
    const bool json = true; 
    //remove the prefix and tokenize the url
    std::vector<std::string> api_token_list;
    served::method method=request.method();
    std::string query;
    std::map<std::string,std::string> headers;

    try
    {
        if (method == served::method::GET)
        {
            query=request.url().query();

            if (query.size())
            {
                /*boost::algorithm::split(api_token_list,
                                        query,
                                        boost::algorithm::is_any_of("&"),
                                        boost::algorithm::token_compress_on);*/
                api_token_list=chaos::split(query,"&");
                HTTWAN_INTERFACE_DBG_ << "GET api:" <<api_uri<< " query:" << query;
            }
            else
            {
               /* boost::algorithm::split(api_token_list,
                                        api_uri,
                                        boost::algorithm::is_any_of("/"),
                                        boost::algorithm::token_compress_on);*/
                api_token_list=chaos::split(api_uri,"/");

                HTTWAN_INTERFACE_DBG_ << "GET api:" << api_uri << " content:" << query << " EMPTY QUERY";
            }
            if ((err = handler->handleCall(1, api_token_list, json_request,
                                           headers,
                                           json_response)))
            {
                HTTWAN_INTERFACE_ERR_ << LOG_CONNECTION <<" Error on api call :" << api_uri;
                //return the error for the api call
                res.set_status(served::status_4XX::EXPECTATION_FAILED);
                json_response["error"] = err;
                json_response["error_message"].append("Call Error");
            }
            else
            {
                //return the infromation of api call success
                res.set_status(served::status_2XX::OK);
                //   json_response["error"] = 0;
            }
            res << json_writer.write(json_response);
            execution_time_end = TimingUtil::getTimeStampInMicroseconds();
            uint64_t duration = execution_time_end - execution_time_start;
          //  DEBUG_CODE(HTTWAN_INTERFACE_DBG_ << "Execution time is:" << duration << " microseconds";)
	      *answer_ms_uptr=duration * 1.0 / 1000.0;
            return 1; //
        }
       /* boost::algorithm::split(api_token_list,
                                api_uri,
                                boost::algorithm::is_any_of("/"),
                                boost::algorithm::token_compress_on);
                                */
        api_token_list=chaos::split(api_uri,"/");
        //check if we havethe domain and api name in the uri and the content is json
        if (api_token_list.size() >= 2 &&
            json)
        {
            if (json_reader.parse(request.body(), json_request))
            {
                //print the received JSON document
              //  DEBUG_CODE(HTTWAN_INTERFACE_DBG_ << LOG_CONNECTION <<"["<<api_uri<<"] Received JSON pack:" << json_writer.write(json_request);)

                //call the handler
                if ((err = handler->handleCall(1,
                                               api_token_list,
                                               json_request,
                                               headers,
                                               json_response)))
                {
                    std::string content_data=request.body();
                    HTTWAN_INTERFACE_ERR_ << "Error on api call :" << api_uri << (content_data.size() ? (" with message data: " + content_data) : " with no message data");
                    //return the error for the api call
                    res.set_status(served::status_4XX::EXPECTATION_FAILED);
                    json_response["error"] = err;
                    json_response["error_message"].append("Call Error");
                }
                else
                {
                    //return the infromation of api call success
                res.set_status(served::status_2XX::OK);
                    //json_response["error"] = 0;
                }
            }
            else
            {
                res.set_status(served::status_4XX::EXPECTATION_FAILED);
                json_response["error"] = -1;
                json_response["error_message"].append("Error parsing the json post data");
                HTTWAN_INTERFACE_ERR_ << LOG_CONNECTION <<"Error decoding the request:" << json_writer.write(json_response) << " BODY:'" << request.body() << "'";
            }
        }
        else
        {
            //return the error for bad json or invalid url
            res.set_status(served::status_4XX::EXPECTATION_FAILED);
            json_response["error"] = -1;
            if (api_token_list.size() < 2)
            {
                json_response["error_message"].append("The uri need to contains either the domain and name of the api ex: http[s]://host:port/api/vx/domain/name(/param)*");
            }
            if (!json)
            {
                json_response["error_message"].append("The content of the request need to be json");
            }
            HTTWAN_INTERFACE_ERR_ << LOG_CONNECTION <<"Error decoding the request:" << json_writer.write(json_response) << " BODY:'" << request.body() << "'";
        }
    }
    catch (std::exception e)
    {
        HTTWAN_INTERFACE_ERR_  << "An exception occurred:" << e.what();
        res << "{}";
        res.set_status(served::status_4XX::EXPECTATION_FAILED);
    }
    catch (...)
    {
        HTTWAN_INTERFACE_ERR_ << LOG_CONNECTION << "Uknown exception occurred:";
        res << "{}";
        res.set_status(served::status_4XX::EXPECTATION_FAILED);
    }

    res << json_writer.write(json_response);
    execution_time_end = TimingUtil::getTimeStampInMicroseconds();
    uint64_t duration = execution_time_end - execution_time_start;
    DEBUG_CODE(HTTWAN_INTERFACE_DBG_ << "Execution time is:" << duration << " microseconds";)
      *answer_ms_uptr=duration * 1.0 / 1000.0;
    return 1; //
}
