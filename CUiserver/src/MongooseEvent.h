/*
 * MongooseEvent.h
 *
 *  Created on: Mar 31, 2017
 *      Author: michelo
 */

#ifndef SRC_MONGOOSEEVENT_H_
#define SRC_MONGOOSEEVENT_H_
#include "mongoose.h"
struct MongooseEvent {
	struct mg_connection *mgc;
	int ev;
	void*evdata;
	MongooseEvent(struct mg_connection*nc,int evn, void*ev_data){
		mgc= nc;
		ev=evn;
		evdata=ev_data;
	}

};

#endif /* SRC_MONGOOSEEVENT_H_ */
