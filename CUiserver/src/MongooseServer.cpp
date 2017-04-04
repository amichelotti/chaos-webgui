/*
 * MongooseServer.cpp
 *
 *  Created on: Mar 31, 2017
 *      Author: michelo
 */

#include "MongooseServer.h"
#include "MongooseEvent.h"
#include <stdexcept>
#include <boost/bind.hpp>

boost::lockfree::queue<MongooseEvent > MongooseServer::m_queue(100);


static void ev_handler(struct mg_connection *nc, int ev, void *p) {
  if (ev == MG_EV_HTTP_REQUEST) {



	/*
	  struct http_message*hm =(struct http_message*)p;
	  std::stringstream ss;
	  ss<<" sono il thread:0x"<<std::hex<<nc;
	  DPRINT("answer:%s",ss.str().c_str());
	  mg_send_head(nc,200,strlen(ss.str().c_str()),"Content-Type: text/plain");
	  mg_printf(nc,"%s",ss.str().c_str());
	  sleep(60);
	  */
	  DPRINT("SERVER event %d nc 0x%x, flag 0x%x iface 0x%x", ev,nc,nc->flags, nc->iface->vtable);
  } else if(ev>0){
	  DPRINT("SERVER event %d nc 0x%x, flag 0x%x iface 0x%x", ev,nc,nc->flags, nc->iface->vtable);
  }
}

MongooseServer::MongooseServer(const std::string& por,int nthrea):port(por),nthread(nthrea) {
	v_worker.resize(nthrea);
	mg_mgr_init(&mgr,NULL);
	run = 0;
	nc= mg_bind(&mgr, port.c_str(), ev_handler);
	if(nc==NULL){
		std::stringstream ss;
		ss<<"cannot bind port:"<<port;
		throw std::logic_error(ss.str().c_str());
	}
	mg_set_protocol_http_websocket(nc);
	//mg_enable_multithreading(nc);
	for(int cnt=0;cnt<nthread;cnt++){
		struct mg_mgr mg;
		mg_mgr_init(&mg,NULL);
		v_worker[cnt] = new MongooseWorker(&mg,nc);
	}
}

MongooseServer::~MongooseServer() {
	// TODO Auto-generated destructor stub

	stop();
	for(int cnt=0;cnt<nthread;cnt++){
		if(v_worker[cnt]){
			v_worker[cnt]->stop();
			delete v_worker[cnt];
		}
	}

	mg_mgr_free(&mgr);

}
void MongooseServer::pushInQueue(MongooseEvent &ev){
	m_queue.push(ev);
}

int MongooseServer::start(){
	run=1;
	for(int cnt=0;cnt<nthread;cnt++){
		v_worker[cnt]->start();

	}
	while(run){
		mg_mgr_poll(&mgr, 1000);
	}
}
int MongooseServer::stop(){
	run =0;
	for(int cnt=0;cnt<nthread;cnt++){
			v_worker[cnt]->stop();

	}

}
