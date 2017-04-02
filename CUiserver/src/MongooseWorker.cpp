/*
 * MongooseWorker.cpp
 *
 *  Created on: Mar 31, 2017
 *      Author: michelo
 */

#include "MongooseWorker.h"

MongooseWorker::MongooseWorker() {
	// TODO Auto-generated constructor stub

}

MongooseWorker::~MongooseWorker() {
	// TODO Auto-generated destructor stub
}

int process(MongooseEvent ev){
	if(ev.ev==MG_EV_HTTP_REQUEST){
		struct http_message*hm =(struct http_message*)ev.evdata;
		std::stringstream ss;
		ss<<" sono il thread:"<<m_thread.get_id();
		mg_send_head(ev.mgc,200,strlen(ss.str().c_str()-,"Content-Type: text/plain"));
		mg_printf(ev,mgc,"%s",ss.str().c_str());
	}
}
