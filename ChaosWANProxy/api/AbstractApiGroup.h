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
#ifndef __CHAOSFramework__AbstractApiGroup__
#define __CHAOSFramework__AbstractApiGroup__

#include "AbstractApi.h"
#include "PersistenceAccessor.h"

#include <string>

#include <chaos/common/chaos_types.h>
#include <chaos/common/utility/NamedService.h>
#include <chaos/common/utility/ObjectInstancer.h>

#include <json/json.h>

namespace chaos
{
namespace wan_proxy
{
namespace api
{

CHAOS_DEFINE_MAP_FOR_TYPE(std::string, ChaosSharedPtr<chaos::wan_proxy::api::AbstractApi>, ApiHashMap);
//! define the abstract group of api
class AbstractApiGroup : public PersistenceAccessor,
						 public chaos::common::utility::NamedService
{
	ApiHashMap api_map;

  protected:
	template <typename A>
	void addApi()
	{
		ChaosUniquePtr<INSTANCER_P1(A, AbstractApi, persistence::AbstractPersistenceDriver *)> i(ALLOCATE_INSTANCER_P1(A, AbstractApi, persistence::AbstractPersistenceDriver *));
		ChaosSharedPtr<AbstractApi> instance(i->getInstance(getPersistenceDriver()));
		if (instance)
		{
			api_map.insert(ApiHashMapPair(instance->getName(), instance));
		}
	}

  public:
	//! construct the group with a name
	AbstractApiGroup(const std::string &name,
					 persistence::AbstractPersistenceDriver *_persistence_driver);

	//! default destructor
	virtual ~AbstractApiGroup();

	//! remove all api
	void removeAllApi();

	//! remove by name
	void removeApiByName(const std::string name);

	int callApi(std::vector<std::string> &api_tokens,
				const Json::Value &input_data,
				std::map<std::string, std::string> &output_header,
				Json::Value &output_data);
};
} // namespace api
} // namespace wan_proxy
} // namespace chaos

#endif /* defined(__CHAOSFramework__AbstractApiGroup__) */
