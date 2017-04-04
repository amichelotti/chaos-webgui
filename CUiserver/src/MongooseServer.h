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

	static boost::lockfree::queue<MongooseEvent > m_queue;
	int nthread;
	const std::string port;

	std::vector<MongooseWorker*> v_worker;
	struct mg_mgr mgr;
	struct mg_connection *nc;
	int run;
public:
	MongooseServer(const std::string& port,int nthread=1);
	virtual ~MongooseServer();

	static void pushInQueue(MongooseEvent& ev);
	int start();
	int stop();

};

#endif /* SRC_MONGOOSESERVER_H_ */
