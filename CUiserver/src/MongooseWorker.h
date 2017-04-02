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

class MongooseWorker:public ::common::misc::scheduler::Worker<MongooseEvent> {

public:
	MongooseWorker(boost::lockfree::queue<MongooseEvent>& q):::common::misc::scheduler::Worker<MongooseEvent>(q){}
	virtual ~MongooseWorker();

	int process(MongooseEvent ev);

};

#endif /* SRC_MONGOOSEWORKER_H_ */
