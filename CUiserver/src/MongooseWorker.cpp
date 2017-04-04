/*
 * MongooseWorker.cpp
 *
 *  Created on: Mar 31, 2017
 *      Author: michelo
 */

#include "MongooseWorker.h"
static void ev_handler(struct mg_connection *nc, int ev, void *p) {
	DPRINT("WORKER conn:0x%x ev:%d",nc,ev);
  if (ev == MG_EV_HTTP_REQUEST) {



	  struct http_message*hm =(struct http_message*)p;
	  std::stringstream ss;
	  ss<<" sono il thread:0x"<<std::hex<<nc;
	  DPRINT("answer:%s",ss.str().c_str());
	  mg_send_head(nc,200,strlen(ss.str().c_str()),"Content-Type: text/plain");
	  mg_printf(nc,"%s",ss.str().c_str());
	  sleep(60);

  } else if(ev>0){
	  DPRINT("event %d nc 0x%x, flag 0x%x iface 0x%x", ev,nc,nc->flags, nc->iface->vtable);
  }
}
MongooseWorker::MongooseWorker(struct mg_mgr* _mgr,struct mg_connection* _nc):mgr(_mgr),nc(_nc){
	// TODO Auto-generated constructor stub
	std::stringstream ss;
	ss<<"Worker thread:"<<getWorkerID()<<" Manager 0x"<<std::hex<<_mgr<<" conn 0x"<<_nc;
	DPRINT("%s",ss.str().c_str());
	sock_t sock = nc->sock;
	nc= mg_add_sock(_mgr,dup(sock),ev_handler);
	if(nc==NULL){
		std::stringstream ss;
		ss<<"cannot bind worker";
		throw std::logic_error(ss.str().c_str());
	}	mg_set_protocol_http_websocket(nc);
}

MongooseWorker::~MongooseWorker() {
	// TODO Auto-generated destructor stub
	mg_mgr_free(mgr);
}

int MongooseWorker::process(){
	mg_mgr_poll(mgr, 1000);
}
