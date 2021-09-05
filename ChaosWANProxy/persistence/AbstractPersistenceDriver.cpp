//
//  AbstractPersistenceDriver.cpp
//  CHAOSFramework
//
//  Created by Claudio Bisegni on 14/01/15.
//  Copyright (c) 2015 INFN. All rights reserved.
//

#include "AbstractPersistenceDriver.h"

using namespace chaos::wan_proxy::persistence;

AbstractPersistenceDriver::AbstractPersistenceDriver(const std::string& name):
NamedService(name) {
	
}
chaos::common::data::CDWUniquePtr AbstractPersistenceDriver::getServerConfig() const {
    return best_available_da_ptr->clone();
}

AbstractPersistenceDriver::~AbstractPersistenceDriver() {
	
}