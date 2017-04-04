/*
 * MongooseWorker.h
 *
 *  Created on: Mar 31, 2017
 *      Author: michelo
 */

#ifndef SRC_MONGOOSEWORKER_H_
#define SRC_MONGOOSEWORKER_H_
#include "MongooseEvent.h"
#include <common/misc/scheduler/Worker.h>
#include <boost/lockfree/queue.hpp>

class MongooseWorker:public ::common::misc::scheduler::Worker {

	struct mg_mgr* mgr;
	struct mg_connection* nc;

public:
	MongooseWorker(struct mg_mgr* mgr,struct mg_connection *nc);
	virtual ~MongooseWorker();

	int process();

};

#endif /* SRC_MONGOOSEWORKER_H_ */
