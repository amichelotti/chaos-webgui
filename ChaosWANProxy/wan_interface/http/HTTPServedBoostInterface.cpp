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
#include <boost/regex.hpp>
#include <boost/format.hpp>
#include <boost/lexical_cast.hpp>
#include <boost/algorithm/string/replace.hpp>

#include <boost/algorithm/string.hpp>

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
static const boost::regex REG_API_URL_FORMAT(API_PATH_REGEX_V1("((/[a-zA-Z0-9_]+))*")); //"/api/v1((/[a-zA-Z0-9_]+))*"
int HTTPServedBoostInterface::chaos_thread_number=1;
int HTTPServedBoostInterface::sched_alloc=0;
std::map<std::string, ::driver::misc::ChaosController *> HTTPServedBoostInterface::devs;
std::vector< ::common::misc::scheduler::Scheduler* > HTTPServedBoostInterface::sched_cu_v;
ChaosSharedMutex HTTPServedBoostInterface::devio_mutex;
boost::mutex HTTPServedBoostInterface::devurl_mutex;
::driver::misc::ChaosController* HTTPServedBoostInterface::info=NULL;

uint64_t HTTPServedBoostInterface::last_check_activity = 0;

std::map<std::string,ConnectedClientInfo> HTTPServedBoostInterface::clientInfo;
 boost::mutex HTTPServedBoostInterface::clientMapMutex;
HTTPServedBoostInterface* ServerMutexWrap::parent=NULL;
/**
 * The handlers below are written in C to do the binding of the C mongoose with
 * the C++ API
 */
ChaosSharedMutex http_mutex;


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
        boost::mutex::scoped_lock ll(clientMapMutex);
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
    boost::mutex::scoped_lock ll(clientMapMutex);

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

            HTTWAN_INTERFACE_DBG_<<" POST /CU"<<req.body();
            (*ServerMutexWrap::parent->counter_post_uptr)++;

            ServerMutexWrap::parent->process(res,req);
            (*ServerMutexWrap::parent->answer_kb_uptr)+=(res.body_size()*1.0/1024.0);
            ServerMutexWrap::parent->updateClientInfoPost(req.source(),tmp,(res.body_size()*1.0/1024.0));

		}).get([](served::response & res, const served::request & req) {
            ConnectedClientInfo tmp;

            HTTWAN_INTERFACE_DBG_<<" GET /CU"<<req.body();
            (*ServerMutexWrap::parent->counter_get_uptr)++;
            ServerMutexWrap::parent->updateClientInfoPre(req.source(),tmp);

            ServerMutexWrap::parent->process(res,req);
            (*ServerMutexWrap::parent->answer_kb_uptr)+=(res.body_size()*1.0/1024.0);
            ServerMutexWrap::parent->updateClientInfoPost(req.source(),tmp,(res.body_size()*1.0/1024.0));

		});;

    mux.handle("/MDS")
		.post([](served::response & res, const served::request & req) {
            ConnectedClientInfo tmp;

            HTTWAN_INTERFACE_DBG_<<" POST /MDS"<<req.body();
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
                boost::mutex::scoped_lock ll(clientMapMutex);

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
                boost::mutex::scoped_lock ll(clientMapMutex);

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

	// Create the server and run with 10 handler threads.
	
    //allcoate each server for every thread
    
    sched_cu_v.resize(chaos_thread_number);
    for (int cnt = 0; cnt < chaos_thread_number; cnt++)
    {
        sched_cu_v[cnt] = new ::common::misc::scheduler::Scheduler();
    }
    sched_alloc = 0;
    last_check_activity = TimingUtil::getTimeStampInMicroseconds();
}

//inherited method
void HTTPServedBoostInterface::start()
{

    run = true;
    HTTWAN_INTERFACE_APP_ << " Starting...";
    AsyncCentralManager::getInstance()->addTimer(this, CHECK_ACTIVITY_CU, CHECK_ACTIVITY_CU);

    
    for (std::vector<::common::misc::scheduler::Scheduler *>::iterator i = sched_cu_v.begin(); i != sched_cu_v.end(); i++)
    {
        (*i)->start();
    }
    if(server){
        delete server;
        server=NULL;
    }
    char port[256];
    sprintf(port,"%d",service_port);
    server =new served::net::server("0.0.0.0",port,mux); // all interfaces
	server->run(chaos_thread_number);
}

//inherited method
void HTTPServedBoostInterface::stop() 
{
    run = false;
    for (std::vector<::common::misc::scheduler::Scheduler *>::iterator i = sched_cu_v.begin(); i != sched_cu_v.end(); i++)
    {
        (*i)->stop();
    }
    server->stop();
}

//inherited method
void HTTPServedBoostInterface::deinit()
{
    AsyncCentralManager::getInstance()->removeTimer(this);

    //clear the service url
    service_port = 0;
    for (int cnt = 0; cnt < chaos_thread_number; cnt++)
    {
        if (sched_cu_v[cnt])
        {
            delete (sched_cu_v[cnt]);
        }
        sched_cu_v[cnt] = NULL;
    }
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

static std::map<std::string, std::string> mappify(const std::string &s)
{
    std::map<std::string, std::string> m;
    std::vector<std::string> api_token_list0;
    boost::regex regx("([a-zA-Z_]+)=(.+)");
    try
    {
        /*
        std::istringstream iss(s);
        std::vector<std::string> api_token_list0((std::istream_iterator<WordDelimitedBy<'&'>>(iss)),
                                 std::istream_iterator<WordDelimitedBy<'&'>>());
                                 */          
        boost::split(api_token_list0, s, boost::is_any_of("&"));

        for (std::vector<std::string>::iterator i = api_token_list0.begin(); i != api_token_list0.end(); i++)
        {
            boost::match_results<std::string::const_iterator> what;
            std::string::const_iterator startPos = (*i).begin();
            std::string::const_iterator endPos = (*i).end();
            while (boost::regex_search(startPos, endPos, what, regx))
            {
                m[what[1]] = what[2];
                startPos = what[0].second;
            }
        }
    }
    catch (boost::bad_expression &ex)
    {
        LERR_ << ex.what();
    }

    return m;
}
int HTTPServedBoostInterface::removeFromQueue(const std::string &devname)
{
    int cntt = 0;
    for (int cnt = 0; cnt < chaos_thread_number; cnt++)
    {
        if (sched_cu_v[cnt]->remove(devname))
        {
            cntt++;
            HTTWAN_INTERFACE_DBG_ << "* removing \"" << devname << "\" from scheduler " << cnt << " inst:" << cntt;
        }
    }
    return cntt;
}
int HTTPServedBoostInterface::removeDevice(const std::string &devname)
{

    std::map<std::string, ::driver::misc::ChaosController *>::iterator i = devs.find(devname);
    if (i != devs.end())
    {

        //        boost::mutex::scoped_lock l(devio_mutex);
        HTTWAN_INTERFACE_DBG_ << "* removing \"" << devname << "\" from known devices";
        ChaosWriteLock ll(devio_mutex);
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
  //  HTTPWANInterfaceStringResponse response("text/html");
    //response.addHeaderKeyValue("Access-Control-Allow-Origin", "*");
    std::stringstream ss;
    served::method method=request.method();
    std::map<std::string, std::string> request_param;
    std::string query;
    if (method == served::method::GET ){
        query=decode(request.url().query());

        request_param=mappify(query);
    } else if(method == served::method::POST){
        query=request.body();
        request_param=mappify(query);

    } else {
                HTTWAN_INTERFACE_ERR_  << "UNSUPPORTED METHOD:" << method_to_string(method);
                res.set_status(served::status_4XX::METHOD_NOT_ALLOWED);
                return 1;
    }
    if(request_param.size()==0){
                HTTWAN_INTERFACE_ERR_  << "Malformed Query:" << query;
                res.set_status(served::status_4XX::BAD_REQUEST);
                return 1;

    }
    res.set_header("Access-Control-Allow-Origin","*");
   /* for ( const auto & query_param : request.query ){
				ss << "Key: " << query_param.first << ", Value: " << query_param.second << "\n";
	}
    HTTWAN_INTERFACE_DBG_<<" process params:"<<ss.str();
    */
    ::driver::misc::ChaosController *controller = NULL;

    //scsan for content type request

    //	const std::string api_uri = url.substr(strlen(API_PREFIX_V1)+1);
    //const bool        json    = checkForContentType(connection,"application/json");
    try
    {
        
        boost::mutex::scoped_lock lurl(devurl_mutex);
            //remove the prefix and tokenize the url
        std::vector<std::string> devToRemove;
        std::string cmd, parm, dev_param;
        dev_param = request_param["dev"];
        cmd = request_param["cmd"];
        parm = request_param["parm"];
        std::string cmd_schedule = request_param["sched"];
        std::string cmd_prio = request_param["prio"];
        std::string cmd_mode = request_param["mode"];
        bool always_vector = true;
        if (cmd.find("query") != std::string::npos)
        {
            always_vector = false;
        }
        std::vector<std::string> dev_v;
        boost::split(dev_v, dev_param, boost::is_any_of(","));
        std::stringstream answer_multi;
        if (dev_param.size() == 0)
        {
           // ChaosReadLock l(devio_mutex);
            std::string ret;
            if (info->get(cmd, (char *)parm.c_str(), 0, atoi(cmd_prio.c_str()), atoi(cmd_schedule.c_str()), atoi(cmd_mode.c_str()), 0, ret) != ::driver::misc::ChaosController::CHAOS_DEV_OK)
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
                ChaosWriteLock l(devio_mutex);

                if (devs.find(*idevname) == devs.end())
                {
                     HTTWAN_INTERFACE_DBG_ << "* Creating controller for \"" << *idevname << "\"";
                    controller = new ::driver::misc::ChaosController();
                    if (controller)
                    {
                        if (controller->init(*idevname, DEFAULT_TIMEOUT_FOR_CONTROLLER) != 0)
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
                            if(info->searchAlive(*idevname).size()>0){
                                sched_cu_v[sched_alloc++ % chaos_thread_number]->add(*idevname, controller);
                            } else {
                                devToRemove.push_back(*idevname);
                            }
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
                ChaosReadLock l(devio_mutex);
                std::map<std::string, ::driver::misc::ChaosController *>::iterator dd = devs.find(*idevname);
                if (dd != devs.end())
                {
                    controller = dd->second;
                    if (controller->get(cmd, (char *)parm.c_str(), 0, atoi(cmd_prio.c_str()), atoi(cmd_schedule.c_str()), atoi(cmd_mode.c_str()), 0, ret) != ::driver::misc::ChaosController::CHAOS_DEV_OK)
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
            for (std::vector<std::string>::iterator idevname = devToRemove.begin(); idevname != devToRemove.end(); idevname++){
                ChaosWriteLock l(devio_mutex);
                std::map<std::string, ::driver::misc::ChaosController *>::iterator dd =devs.find(*idevname);
                if(dd !=devs.end()){
                    delete (dd->second);
                    devs.erase(dd);
                }
            }

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
        boost::mutex::scoped_lock lurl(devurl_mutex);
        execution_time_end = TimingUtil::getTimeStampInMicroseconds();

        uint64_t duration = execution_time_end - execution_time_start;
        DEBUG_CODE(HTTWAN_INTERFACE_DBG_  << "Execution time is:" << duration * 1.0 / 1000.0 << " ms";)
        *answer_ms_uptr=duration * 1.0 / 1000.0;
    }
    return 1; //
}
void HTTPServedBoostInterface::checkActivity()
{
    int64_t now = TimingUtil::getTimeStampInMicroseconds();
    /* if((now-last_check_activity)<CHECK_ACTIVITY_CU){
        return;
    }
    HTTWAN_INTERFACE_DBG_<<" checking activity after:"<<(1.0*(now-last_check_activity)/1000000.0)<<" s";
    last_check_activity = now;
    */
    HTTWAN_INTERFACE_APP_ << "checkActivity - STARTS";
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
    }*/
   // std::vector<std::string> alive=info->searchAllAlive();
    {
        boost::mutex::scoped_lock ll(clientMapMutex);
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
        ChaosReadLock l(devio_mutex);
        i = devs.begin();
    }
    // remove not alive first;
    int cnt=devs.size();
    *monitored_objects_uptr=cnt;

    //std::vector<std::string> controller_toremove;

    while (i != devs.end()){
   /*     if(std::find(alive.begin(),alive.end(),i->first)==alive.end()){
            HTTWAN_INTERFACE_DBG_ << "* removing from update queue \"" << i->first << "\" because not alive"<<cnt;
            removeFromQueue(i->first);
            controller_toremove.push_back(i->first);  
        }*/
        if ((i->second->lastAccess() > 0)){
            int64_t elapsed = (now - (i->second)->lastAccess());
            if ((elapsed > PRUNE_NOT_ACCESSED_CU)){
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
    }

    /*for(std::vector<std::string>::iterator i=controller_toremove.begin();i!=controller_toremove.end();i++){
            std::map<std::string, ::driver::misc::ChaosController *>::iterator j=devs.find(*i);
            if(j!=devs.end()){
                 ::driver::misc::ChaosController *tmp = j->second;

                
                    if(devio_mutex.try_lock()){
                        //ChaosWriteLock ll(devio_mutex);

                        devs.erase(j);
                        HTTWAN_INTERFACE_DBG_ << "* removing \"" << j->first << "\" from known devices remaining "<<devs.size()<<"/"<<cnt;
                        delete tmp;
                        devio_mutex.unlock();
                    }

                
            }

    }*/
   
    HTTWAN_INTERFACE_APP_ << "checkActivity ENDS remaining dev:"<<devs.size()<<" balance:"<<(int)(cnt-devs.size());

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
                boost::algorithm::split(api_token_list,
                                        query,
                                        boost::algorithm::is_any_of("&"),
                                        boost::algorithm::token_compress_on);
                HTTWAN_INTERFACE_DBG_ << "GET api:" <<api_uri<< " query:" << query;
            }
            else
            {
                boost::algorithm::split(api_token_list,
                                        api_uri,
                                        boost::algorithm::is_any_of("/"),
                                        boost::algorithm::token_compress_on);
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
            DEBUG_CODE(HTTWAN_INTERFACE_DBG_ << "Execution time is:" << duration << " microseconds";)
	      *answer_ms_uptr=duration * 1.0 / 1000.0;
            return 1; //
        }
        boost::algorithm::split(api_token_list,
                                api_uri,
                                boost::algorithm::is_any_of("/"),
                                boost::algorithm::token_compress_on);

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
