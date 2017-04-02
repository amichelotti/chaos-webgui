/*
 * MongooseServer.h
 *
 *  Created on: Mar 31, 2017
 *      Author: michelo
 */

#ifndef SRC_MONGOOSESERVER_H_
#define SRC_MONGOOSESERVER_H_
#include "MongooseWorker.h"

class MongooseServer {

	boost::lockfree::queue<MongooseEvent> m_queue;
	int nhtread;
	const std::string port;

	std::vector<MongooseWorker*> v_worker;
	struct mg_mgr mgr;
	struct mg_connection *nc;
	int run;
public:
	MongooseServer(const std::string& port,int nthread=1);
	virtual ~MongooseServer();

	int run();
	int stop();

};

#endif /* SRC_MONGOOSESERVER_H_ */
