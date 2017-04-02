/*
 * MongooseServer.cpp
 *
 *  Created on: Mar 31, 2017
 *      Author: michelo
 */

#include "MongooseServer.h"
#include <stdexcept>

static void ev_handler(struct mg_connection *nc, int ev, void *p) {
  if (ev == MG_EV_HTTP_REQUEST) {
  }
}

MongooseServer::MongooseServer(const std::string& por,int nthrea):port(por),nhtread(nthrea) {
	v_worker.resize(nthrea);
	mg_mgr_init(&mgr,NULL);
	run = 0;
	nc= mg_bind(&mgr, port.c_str(), ev_handler);
	if(nc==NULL){
		throw std::logic_error::logic_error("cannot bind port:"+port);
	}
	mg_set_protocol_http_websocket(nc);
	for(int cnt=0;cnt<nthread;cnt++){
		v_worker[cnt] = new MongooseWorker(m_queue);
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

int MongooseServer::run(){
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
