/*
 * Copyright 2012, 2017 INFN
 *
 * Licensed under the EUPL, Version 1.2 or – as soon they
 * will be approved by the European Commission - subsequent
 * versions of the EUPL (the "Licence");
 * You may not use this work except in compliance with the
 * Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in
 * writing, software distributed under the Licence is
 * distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied.
 * See the Licence for the specific language governing
 * permissions and limitations under the Licence.
 */
#include "AbstractApiGroup.h"


using namespace chaos::wan_proxy::api;



AbstractApiGroup::AbstractApiGroup(const std::string& name,
								   persistence::AbstractPersistenceDriver *_persistence_driver):
PersistenceAccessor(_persistence_driver),
NamedService(name){}

//! default destructor
AbstractApiGroup::~AbstractApiGroup() {}

void AbstractApiGroup::removeAllApi() {
	api_map.clear();
}

//! remove by name
void AbstractApiGroup::removeApiByName(const std::string api_name) {
	// call hash map method for remove an element by name
	api_map.erase(api_name);
}

#pragma mark Private Method

int AbstractApiGroup::callApi(std::vector<std::string>& api_tokens,
							  const Json::Value& input_data,
							  std::map<std::string, std::string>& output_header,
							  Json::Value& output_data) {
	int err = 0;
    if(api_tokens.size()==0){
        // call group.
        return err;
    }
	//the first element is the api name (the group as benn deleted by the Handler
	const std::string& api_name = api_tokens.front();

	AbstractApi *api_selected = NULL;
	ApiHashMapIterator api_iter = api_map.find(api_name);
	if(api_iter == api_map.end()) {
		//error or not found
	} else {
		//remove the group name
		api_tokens.erase(api_tokens.begin());
		
		//forward call to the found group
		err = api_selected->execute(api_tokens,
									input_data,
									output_header,
									output_data);
	}
	return err;
}
