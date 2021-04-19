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
#include "DefaultPersistenceDriver.h"
#include <chaos/common/healt_system/HealtManager.h>
#include <chaos_metadata_service_client/ChaosMetadataServiceClient.h>

#include <chaos/common/utility/UUIDUtil.h>
#include <chaos/common/network/URL.h>
#include <chaos/common/chaos_constants.h>


#define DPD_LAPP INFO_LOG(DefaultPersistenceDriver)
#define DPD_LDBG DBG_LOG(DefaultPersistenceDriver)
#define DPD_LERR ERR_LOG(DefaultPersistenceDriver)

#define MDS_TIMEOUT 5000

using namespace chaos::wan_proxy::persistence;

using namespace chaos::common::data;
using namespace chaos::common::utility;
using namespace chaos::common::network;
using namespace chaos::common::direct_io;
using namespace chaos::common::direct_io::channel;
using namespace chaos::common::healt_system;
using namespace chaos::metadata_service_client;

/*---------------------------------------------------------------------------------

 ---------------------------------------------------------------------------------*/
DefaultPersistenceDriver::DefaultPersistenceDriver(NetworkBroker *_network_broker):
    AbstractPersistenceDriver("DefaultPersistenceDriver"),
    network_broker(_network_broker),
    direct_io_client(NULL),
    mds_message_channel(NULL),
    connection_feeder("DefaultPersistenceDriver", this) {


}

/*---------------------------------------------------------------------------------

 ---------------------------------------------------------------------------------*/
DefaultPersistenceDriver::~DefaultPersistenceDriver() {

}

void DefaultPersistenceDriver::init(void *init_data){

    //! get the mds message channel
    mds_message_channel = network_broker->getMetadataserverMessageChannel();
    if(!mds_message_channel) throw chaos::CException(-1, "No mds channel found", __PRETTY_FUNCTION__);

    //! get the direct io client
    direct_io_client = network_broker->getSharedDirectIOClientInstance();
    ChaosMetadataServiceClient::getInstance()->init();
    ChaosMetadataServiceClient::getInstance()->start();
    ioLiveDataDriver=ChaosMetadataServiceClient::getInstance()->getDataProxyChannelNewInstance();
    if(!ioLiveDataDriver){
        throw chaos::CException(-1, "No LIVE Channel created", "DefaultPersistenceDriver()");
    }

    if(!mds_message_channel->getDataDriverBestConfiguration(best_available_da_ptr, 5000)){
        ioLiveDataDriver->updateConfiguration(best_available_da_ptr.get());
    }
    //InizializableService::initImplementation(direct_io_client,
    //init_data,
    //direct_io_client->getName(),
    // __PRETTY_FUNCTION__);
}

void DefaultPersistenceDriver::deinit()  {

    connection_feeder.clear();

    //if(direct_io_client) {
    //CHAOS_NOT_THROW(InizializableService::deinitImplementation(direct_io_client,
    //														   direct_io_client->getName(),
    //														   __PRETTY_FUNCTION__);)
    //delete(direct_io_client);
    //}

    if(mds_message_channel) network_broker->disposeMessageChannel(mds_message_channel);
}

/*---------------------------------------------------------------------------------

 ---------------------------------------------------------------------------------*/
void DefaultPersistenceDriver::clear() {
    connection_feeder.clear();
}

/*---------------------------------------------------------------------------------

 ---------------------------------------------------------------------------------*/
void DefaultPersistenceDriver::addServerList(const std::vector<std::string>& _cds_address_list) {
    //checkif someone has passed us the device indetification
    DPD_LAPP << "Scan the direction address";


    if(!mds_message_channel->getDataDriverBestConfiguration(best_available_da_ptr, 5000)){
        if(best_available_da_ptr.get()!=NULL){
            DPD_LDBG <<best_available_da_ptr->getJSONString();
            ChaosSharedPtr<chaos::common::data::CMultiTypeDataArrayWrapper> liveMemAddrConfig=best_available_da_ptr->getVectorValue(DataServiceNodeDefinitionKey::DS_DIRECT_IO_FULL_ADDRESS_LIST);
            if(liveMemAddrConfig.get()){
                size_t numerbOfserverAddressConfigured = liveMemAddrConfig->size();
                for ( int idx = 0; idx < numerbOfserverAddressConfigured; idx++ ){
                    std::string serverDesc = liveMemAddrConfig->getStringElementAtIndex(idx);
                    connection_feeder.addURL(serverDesc);
                }
            }
        }
    }
    //mds_message_channel->ge
    //	connection_feeder.addURL()

    for (std::vector<std::string>::const_iterator it = _cds_address_list.begin();
         it != _cds_address_list.end();
         it++ ){
        if(!common::direct_io::DirectIOClient::checkURL(*it)) {
            DPD_LDBG << "Data proxy server description " << *it << " non well formed";
            continue;
        }
        //add new url to connection feeder
        connection_feeder.addURL(chaos::common::network::URL(*it));
    }

}

/*---------------------------------------------------------------------------------

 ---------------------------------------------------------------------------------*/
void DefaultPersistenceDriver::disposeService(void *service_ptr) {
    if(!service_ptr) return;
    DirectIOChannelsInfo	*info = static_cast<DirectIOChannelsInfo*>(service_ptr);

    if(info->device_client_channel) info->connection->releaseChannelInstance(info->device_client_channel);
    direct_io_client->releaseConnection(info->connection);
    delete(info);
}

/*---------------------------------------------------------------------------------

 ---------------------------------------------------------------------------------*/
void* DefaultPersistenceDriver::serviceForURL(const common::network::URL& url, uint32_t service_index) {
    DPD_LDBG << "Add connection for " << url.getURL();
    DirectIOChannelsInfo * clients_channel = NULL;
    chaos_direct_io::DirectIOClientConnection *tmp_connection = direct_io_client->getNewConnection(url.getURL());
    if(tmp_connection) {
        clients_channel = new DirectIOChannelsInfo();
        clients_channel->connection = tmp_connection;

        //allocate the client channel
        clients_channel->device_client_channel = (DirectIODeviceClientChannel*)tmp_connection->getNewChannelInstance("DirectIODeviceClientChannel");
        if(!clients_channel->device_client_channel) {
            DPD_LDBG << "Error creating client device channel for " << url.getURL();

            //release conenction
            direct_io_client->releaseConnection(tmp_connection);

            //relase struct
            delete(clients_channel);
            return NULL;
        }

        //set this driver instance as event handler for connection
        clients_channel->connection->setEventHandler(this);
        //!put the index in the conenction so we can found it wen we receive event from it
        clients_channel->connection->setCustomStringIdentification(boost::lexical_cast<std::string>(service_index));
    } else {
        DPD_LERR << "Error creating client connection for " << url.getURL();
    }
    return clients_channel;
}

/*---------------------------------------------------------------------------------

 ---------------------------------------------------------------------------------*/
void DefaultPersistenceDriver::handleEvent(DirectIOClientConnection *client_connection,
                                           DirectIOClientConnectionStateType::DirectIOClientConnectionStateType event) {
    //if the channel has bee disconnected turn the relative index offline, if onli reput it online
    boost::unique_lock<boost::shared_mutex>(mutext_feeder);
    uint32_t service_index = boost::lexical_cast<uint32_t>(client_connection->getCustomStringIdentification());
    DEBUG_CODE(DPD_LDBG << "Manage event for service with index " << service_index << " and url " << client_connection->getURL();)
            switch(event) {
        case chaos_direct_io::DirectIOClientConnectionStateType::DirectIOClientConnectionEventConnected:
            connection_feeder.setURLOnline(service_index);
            break;

        case chaos_direct_io::DirectIOClientConnectionStateType::DirectIOClientConnectionEventDisconnected:
            connection_feeder.setURLOffline(service_index);
            break;
    }
}
static ChaosSharedMutex devio_mutex;

// push a dataset
int DefaultPersistenceDriver::pushNewDataset(const std::string& producer_key,
                                             CDataWrapper *new_dataset,
                                             int store_hint) {
    CHAOS_ASSERT(new_dataset)
            int err = 0;
    //ad producer key
    DirectIOChannelsInfo	*next_client = static_cast<DirectIOChannelsInfo*>(connection_feeder.getService());
    boost::shared_lock<boost::shared_mutex> ll(next_client->connection_mutex);


    if(next_client==NULL) {
        DPD_LERR << "No available socket->loose packet";
        return -1;
    }
    ChaosWriteLock l(devio_mutex);

    uint64_t ts=chaos::common::utility::TimingUtil::getTimeStamp();
    std::map<std::string,cuids_t>::iterator i_cuid=m_cuid.find(producer_key);
    std::lock_guard<std::mutex> kk(i_cuid->second.lock);
    new_dataset->addStringValue(chaos::DataPackCommonKey::DPCK_DEVICE_ID, producer_key);

    new_dataset->addInt32Value(chaos::DataPackCommonKey::DPCK_DATASET_TYPE, chaos::DataPackCommonKey::DPCK_DATASET_TYPE_OUTPUT);
    if(!new_dataset->hasKey(chaos::DataPackCommonKey::DPCK_TIMESTAMP)){
        // add timestamp of the datapack
        i_cuid->second.ts=ts;
        new_dataset->addInt64Value(chaos::DataPackCommonKey::DPCK_TIMESTAMP, i_cuid->second.ts);
    } else {
        i_cuid->second.ts=new_dataset->getInt64Value(chaos::DataPackCommonKey::DPCK_TIMESTAMP);
    }
  
    /*if(store_hint==0){
        store_hint=i_cuid->second.storage_type;
    }*/
    if(!new_dataset->hasKey(chaos::DataPackCommonKey::DPCK_SEQ_ID)){
        i_cuid->second.pckid++;
        new_dataset->addInt64Value(chaos::DataPackCommonKey::DPCK_SEQ_ID,i_cuid->second.pckid );
        i_cuid->second.npcks=i_cuid->second.pckid;
    } else {
        // to evaluate push rate
        i_cuid->second.pckid= new_dataset->getInt64Value(chaos::DataPackCommonKey::DPCK_SEQ_ID);
        i_cuid->second.npcks=std::max(i_cuid->second.npcks,i_cuid->second.pckid);
      //  DPD_LDBG << i_cuid->second.ts <<"] "<<producer_key<<" seq:"<< i_cuid->second.pckid;
    }
   
    if(!new_dataset->hasKey(chaos::ControlUnitNodeDefinitionKey::CONTROL_UNIT_RUN_ID)){
        new_dataset->addInt64Value(chaos::ControlUnitNodeDefinitionKey::CONTROL_UNIT_RUN_ID,i_cuid->second.runid );
    }
    ChaosUniquePtr<SerializationBuffer> serialization(new_dataset->getBSONData());
    //	DPD_LDBG <<" PUSHING:"<<new_dataset->getJSONString();
    serialization->disposeOnDelete = !next_client;
    if(next_client) {

        //free the packet
        serialization->disposeOnDelete = false;
        uint32_t size=serialization->getBufferLen();
        if((err =(int)next_client->device_client_channel->storeAndCacheDataOutputChannel(producer_key+ chaos::DataPackPrefixID::OUTPUT_DATASET_POSTFIX,
                                                                                         (void*)serialization->getBufferPtr(),
                                                                                         (uint32_t)size,
                                                                                         (chaos::DataServiceNodeDefinitionType::DSStorageType)store_hint))) {
            DPD_LERR << "Error storing dataset with code:" << err;
        } else {
            i_cuid->second.pckts_size+=size;

        }
    }
    #if 0
    if(i_cuid!=m_cuid.end()){
        if((ts - i_cuid->second.last_ts) >=chaos::common::constants::CUTimersTimeoutinMSec*100 /*(HEALT_FIRE_TIMEOUT / HEALT_FIRE_SLOTS)*1000*/ ){
           //re-add node
         DPD_LDBG << "["<<producer_key<<"] Re-adding to health after "<<(ts - i_cuid->second.last_ts)<<" ms";

            HealtManager::getInstance()->addNewNode(producer_key);
        }

    }
    #endif
    return err;
}

// get a dataset
int DefaultPersistenceDriver::getLastDataset(const std::string& producer_key,
                                             chaos::common::data::CDataWrapper **last_dataset) {
    int err = 0;
    uint32_t size = 0;
    char* result = NULL;
    DirectIOChannelsInfo	*next_client = static_cast<DirectIOChannelsInfo*>(connection_feeder.getService());
    if(!next_client) return err;

    boost::shared_lock<boost::shared_mutex>(next_client->connection_mutex);
    next_client->device_client_channel->requestLastOutputData(producer_key, &result, size);
    *last_dataset = new CDataWrapper(result);
    return err;
}

//! register the dataset of ap roducer
int DefaultPersistenceDriver::registerDataset(const std::string& producer_key,
                                              chaos::common::data::CDataWrapper& last_dataset) {
    CHAOS_ASSERT(mds_message_channel);
    int ret;
    CDWUniquePtr dd(new CDataWrapper());
    last_dataset.copyAllTo(*dd.get());
    dd->addStringValue(chaos::NodeDefinitionKey::NODE_UNIQUE_ID, producer_key);
    dd->addStringValue(chaos::NodeDefinitionKey::NODE_RPC_DOMAIN, chaos::common::utility::UUIDUtil::generateUUIDLite());
    dd->addStringValue(chaos::NodeDefinitionKey::NODE_RPC_ADDR, network_broker->getRPCUrl());
    dd->addStringValue("mds_control_key","none");
    if((ret=mds_message_channel->sendNodeRegistration(MOVE(dd), true, 10000)) ==0){
        CDWUniquePtr mdsPack(new CDataWrapper());
        mdsPack->addStringValue(chaos::NodeDefinitionKey::NODE_UNIQUE_ID, producer_key);
        mdsPack->addStringValue(chaos::NodeDefinitionKey::NODE_TYPE, chaos::NodeType::NODE_TYPE_CONTROL_UNIT);
        ret = mds_message_channel->sendNodeLoadCompletion(MOVE(mdsPack), true, 10000);
        
        HealtManager::getInstance()->addNewNode(producer_key);
        HealtManager::getInstance()->addNodeMetric(producer_key,
                                                   chaos::ControlUnitHealtDefinitionValue::CU_HEALT_OUTPUT_DATASET_PUSH_RATE,
                                                   chaos::DataType::TYPE_DOUBLE);
        HealtManager::getInstance()->addNodeMetric(producer_key,
                                                   chaos::ControlUnitHealtDefinitionValue::CU_HEALT_OUTPUT_DATASET_PUSH_SIZE,
                                                   chaos::DataType::TYPE_INT32);
        HealtManager::getInstance()->addNodeMetricValue(producer_key,
                                                        NodeHealtDefinitionKey::NODE_HEALT_STATUS,
                                                        NodeHealtDefinitionValue::NODE_HEALT_STATUS_START,
                                                        true);

        std::map<std::string,cuids_t>::iterator i_cuid=m_cuid.find(producer_key);
        if(i_cuid==m_cuid.end()){
            DEBUG_CODE(DPD_LDBG << "Adding new device:"<<producer_key);
            m_cuid[producer_key].pckid=0;
             m_cuid[producer_key].last_ts=0;
             m_cuid[producer_key].ts=m_cuid[producer_key].runid=chaos::common::utility::TimingUtil::getTimeStamp();
            m_cuid[producer_key].last_npcks=m_cuid[producer_key].npcks=0;
           m_cuid[producer_key].last_sampled_ts=0;
            m_cuid[producer_key].freq=0;
            m_cuid[producer_key].pckts_size=0;
            m_cuid[producer_key].healt_update=chaos::common::constants::CUTimersTimeoutinMSec;
           /* if(last_dataset.hasKey(chaos::DataServiceNodeDefinitionKey::DS_STORAGE_TYPE)&&last_dataset.isInt32Value(chaos::DataServiceNodeDefinitionKey::DS_STORAGE_TYPE)){
               tt.storage_type=last_dataset.getInt32Value(chaos::DataServiceNodeDefinitionKey::DS_STORAGE_TYPE);
            } else {
               tt.storage_type=3;
            }*/

        }
     chaos::common::async_central::AsyncCentralManager::getInstance()->addTimer(this, chaos::common::constants::CUTimersTimeoutinMSec, chaos::common::constants::CUTimersTimeoutinMSec);

    }

    return ret;
}
void DefaultPersistenceDriver::timeout(){
    //uint64_t rate_acq_ts = TimingUtil::getTimeStamp();
    int64_t now=chaos::common::utility::TimingUtil::getTimeStamp();
    for(std::map<std::string,cuids_t>::iterator i_cuid=m_cuid.begin();i_cuid!=m_cuid.end();i_cuid++){
       
        double time_offset = (double(now - i_cuid->second.last_sampled_ts))/1000.0; //time in seconds
        uint32_t pckts=(i_cuid->second.npcks -i_cuid->second.last_npcks);
        double output_ds_rate = (double)pckts/time_offset; //rate in seconds
        uint32_t size_pcks= (pckts>0)?i_cuid->second.pckts_size/pckts:0;
        if(pckts){
            i_cuid->second.freq=output_ds_rate;
            i_cuid->second.last_sampled_ts=now;
            i_cuid->second.last_npcks = i_cuid->second.npcks;
        HealtManager::getInstance()->addNodeMetricValue(i_cuid->first,
                                                        chaos::ControlUnitHealtDefinitionValue::CU_HEALT_OUTPUT_DATASET_PUSH_RATE,
                                                        i_cuid->second.freq,false);
        HealtManager::getInstance()->addNodeMetricValue(i_cuid->first,
                                                        chaos::ControlUnitHealtDefinitionValue::CU_HEALT_OUTPUT_DATASET_PUSH_SIZE,
                                                       (int32_t)size_pcks,false);                                                
        }
        DPD_LDBG << "Health :"<<i_cuid->first<<" rate:"<<  i_cuid->second.freq << " size"<<size_pcks<<" pkts:"<<pckts<<" at:"<<common::utility::TimingUtil::toString(now)<<" last pack:"<<common::utility::TimingUtil::toString(i_cuid->second.ts)<<" previous pack was:"<<common::utility::TimingUtil::toString(i_cuid->second.last_ts);
        
        if((i_cuid->second.last_ts>0)&&((now - i_cuid->second.last_ts) >=chaos::common::constants::CUTimersTimeoutinMSec*100 )){
            DPD_LDBG << "["<<i_cuid->first<<"] Elapsed "<<(now - i_cuid->second.last_ts)<<" ms, Removing from health";

            HealtManager::getInstance()->removeNode(i_cuid->first);

        }
        if(pckts>0){
             i_cuid->second.last_ts=i_cuid->second.ts;
             i_cuid->second.pckts_size=0;

        }
       

        HealtManager::getInstance()->publishNodeHealt(i_cuid->first);
    }
   

}
void DefaultPersistenceDriver::searchMetrics(const std::string&search_string,ChaosStringVector& metrics,bool alive){
    ChaosStringVector node_tmp;
    metrics.clear();
    if(mds_message_channel->searchNode(search_string,
                                       chaos::NodeType::NodeSearchType::node_type_cu,
                                       alive,
                                       0,
                                       10000,
                                       node_tmp,
                                       5000)==0){
        for(ChaosStringVector::iterator i=node_tmp.begin();node_tmp.end()!=i;i++){
            size_t value_len;
            const int dt[]={
                DataPackCommonKey::DPCK_DATASET_TYPE_OUTPUT,
                DataPackCommonKey::DPCK_DATASET_TYPE_INPUT};
            for(int cnt=0;cnt<sizeof(dt)/sizeof(int);cnt++){
                std::string lkey=*i+chaos::datasetTypeToPostfix(dt[cnt]);
                char *value = ioLiveDataDriver->retriveRawData(lkey,(size_t*)&value_len);
                if(value){
                    chaos::common::data::CDataWrapper *tmp = new CDataWrapper(value);
                    ChaosStringVector ds;
                    tmp->getAllKey(ds);
                    for(ChaosStringVector::iterator ii=ds.begin();ds.end()!=ii;ii++){
                        std::string metric=*i+"/"+chaos::datasetTypeToHuman(dt[cnt])+"/"+*ii;
                        metrics.push_back(metric);
                    }
                    free(value);
                    delete(tmp);
                }
            }

        }
    }
}

chaos::common::data::CDWShrdPtr DefaultPersistenceDriver::searchMetrics(const std::string&search_string,bool alive){
    chaos::common::data::CDWShrdPtr ret(new CDataWrapper());
   
    ChaosStringVector node_tmp;
    if(mds_message_channel->searchNode(search_string,
                                       chaos::NodeType::NodeSearchType::node_type_cu,
                                       alive,
                                       0,
                                       10000,
                                       node_tmp,
                                       5000)==0){
        for(ChaosStringVector::iterator i=node_tmp.begin();node_tmp.end()!=i;i++){


            CDWUniquePtr out;
            DEBUG_CODE(DPD_LDBG << "finding description of:"<<*i);

            if (mds_message_channel->getFullNodeDescription(*i, out, MDS_TIMEOUT) == 0) {

                if(out.get() && (out->hasKey(chaos::ControlUnitNodeDefinitionKey::CONTROL_UNIT_DATASET_DESCRIPTION))&&(out->isCDataWrapperValue(chaos::ControlUnitNodeDefinitionKey::CONTROL_UNIT_DATASET_DESCRIPTION))){
                    chaos::common::data::CDWUniquePtr ds(out->getCSDataValue(chaos::ControlUnitNodeDefinitionKey::CONTROL_UNIT_DATASET_DESCRIPTION));
                    ChaosSharedPtr<chaos::common::data::CMultiTypeDataArrayWrapper> w =ds->getVectorValue(chaos::ControlUnitNodeDefinitionKey::CONTROL_UNIT_DATASET_DESCRIPTION);
                    for(int idx=0;idx<w->size();idx++){
                        chaos::common::data::CDWUniquePtr ws(w->getCDataWrapperElementAtIndex(idx));
                        ret->appendCDataWrapperToArray(*(ws.get()));
                    }
                    ret->finalizeArrayForKey(*i);

                    //          DEBUG_CODE(DPD_LDBG << "adding:"<<ret->getCompliantJSONString());

                    /*if(ds->hasKey(chaos::ControlUnitNodeDefinitionKey::CONTROL_UNIT_DATASET_DESCRIPTION)&&ds->isVector(chaos::ControlUnitNodeDefinitionKey::CONTROL_UNIT_DATASET_DESCRIPTION) ){
                        ChaosUniquePtr<CMultiTypeDataArrayWrapper> dw(ds->getVectorValue(chaos::ControlUnitNodeDefinitionKey::CONTROL_UNIT_DATASET_DESCRIPTION));
                        for (int idx = 0; idx < dw->size(); idx++) {

                        }
                    }*/

                }
              
            }
        }

    }
    return ret;
}

void allocateMetrics(uint64_t ts,chaos::common::data::CDWShrdPtr ds,std::map<std::string,std::vector<std::string> >::iterator i,metrics_results_t& res,int limit){
    //uint64_t ts=0;
    /* if(ds->hasKey(chaos::DataPackCommonKey::DPCK_TIMESTAMP)){
    ts=ds->getInt64Value(chaos::DataPackCommonKey::DPCK_TIMESTAMP);
  }*/

    for(std::vector<std::string>::iterator j=i->second.begin();j!=i->second.end();j++){
        if(ds->hasKey(*j)){
            metric_t tmp;
            tmp.milli_ts=ts;
            std::string metric_name=i->first+"/"+*j;
            if(ds->isVector(*j)){
               ChaosSharedPtr<chaos::common::data::CMultiTypeDataArrayWrapper> w=ds->getVectorValue(*j);
                int step=1;
                int size=w->size();
                if(w->size()>limit){
                    step=(w->size()-limit)/limit;
                    if(step==0){
                        step=1;
                        size=limit;
                    }
                }
                for(int cnt=0;cnt<size;cnt+=step){
                    tmp.idx=cnt;
                    if(w->isDoubleElementAtIndex(cnt)){
                        tmp.value=w->getDoubleElementAtIndex(cnt);
                        res[metric_name].push_back(tmp);
                    }
                    if(w->isInt32ElementAtIndex(cnt)){
                        tmp.value=w->getInt32ElementAtIndex(cnt);
                        res[metric_name].push_back(tmp);
                    }

                    if(w->isInt64ElementAtIndex(cnt)){
                        tmp.value=w->getInt64ElementAtIndex(cnt);
                        res[metric_name].push_back(tmp);
                    }
                    if(w->isBoolElementAtIndex(cnt)){
                        tmp.value=w->getBoolElementAtIndex(cnt);
                        res[metric_name].push_back(tmp);
                    }
                }
            } else {
                using namespace chaos::DataType;
                tmp.idx=0;
                if(ds->isDoubleValue(*j)){
                    tmp.value=ds->getDoubleValue(*j);
                    res[metric_name].push_back(tmp);

                } else if(ds->isBoolValue(*j)){
                    tmp.value=ds->getBoolValue(*j);
                    res[metric_name].push_back(tmp);

                } else if(ds->isInt32Value(*j)){
                    tmp.value=ds->getInt32Value(*j);
                    res[metric_name].push_back(tmp);
                } else if(ds->isInt64Value(*j)){
                    tmp.value=ds->getInt64Value(*j);
                    res[metric_name].push_back(tmp);
                } else if(ds->isBinaryValue(*j)){
                    uint32_t sizeb=0;
                    chaos::DataType::BinarySubtype ret=ds->getBinarySubtype(*j);
                    unsigned char *buf=(unsigned char*)ds->getBinaryValue(*j,sizeb);
                    int wsize=1;
                    switch(ret){
                        case SUB_TYPE_BOOLEAN:
                        case SUB_TYPE_CHAR:
                        case SUB_TYPE_INT8:
                        wsize=1;
                        break;
                        case SUB_TYPE_INT16:
                            wsize=sizeof(int16_t);
                        break;
                        case SUB_TYPE_INT32:
                            wsize=sizeof(int32_t);

                        break;
                        case SUB_TYPE_INT64:
                            wsize=sizeof(int64_t);

                        break;
                        case SUB_TYPE_DOUBLE:
                            wsize=sizeof(double);

                        break;
                    }
                     int step=1;
                    int size=sizeb/wsize;
                    if(size>limit){
                        step=(size-limit)/limit;
                        if(step==0){
                            step=1;
                            size=limit;
                        }
                    }   
                for(int cnt=0;cnt<size;cnt+=step){
                    tmp.idx=cnt;
                    switch(ret){
                        case SUB_TYPE_BOOLEAN:
                        case SUB_TYPE_CHAR:
                        case SUB_TYPE_INT8:
                            tmp.value=buf[cnt];
                            res[metric_name].push_back(tmp);

                        break;
                        case SUB_TYPE_INT16:
                            tmp.value=((int16_t*)buf)[cnt];
                            res[metric_name].push_back(tmp);
                        break;
                        case SUB_TYPE_INT32:
                            tmp.value=((int32_t*)buf)[cnt];
                            res[metric_name].push_back(tmp);
                        break;
                        case SUB_TYPE_INT64:
                            tmp.value=((int64_t*)buf)[cnt];
                            res[metric_name].push_back(tmp);
                        break;
                        case SUB_TYPE_DOUBLE:
                            tmp.value=((double*)buf)[cnt];
                            res[metric_name].push_back(tmp);

                        break;
                    }
                }
            }
        }
    }
    }
}
int DefaultPersistenceDriver::queryMetrics(const std::string& start,const std::string& end,const std::vector<std::string>& metrics_name,metrics_results_t& res,int limit){
    int ret=0;
    boost::regex expr("(.*)/(.*)$");
    uint64_t start_t=chaos::common::utility::TimingUtil::getTimestampFromString(start);
    uint64_t end_t=chaos::common::utility::TimingUtil::getTimestampFromString(end);
    std::map<std::string,std::vector<std::string> > accesses;
    res.clear();
    for ( int index = 0; index < metrics_name.size(); ++index ){
        std::string tname=metrics_name[index];
        DPD_LDBG << "Target:"<<tname;

        boost::cmatch what;
        if(regex_match(tname.c_str(), what, expr)){
            std::map<std::string,std::vector<std::string> >::iterator i=accesses.find(what[1]);
            if(i!=accesses.end()){
                DPD_LDBG << " variable:"<<what[2]<< " adding to access:"<<i->first;

                i->second.push_back(what[2]);
            } else {
                DPD_LDBG << " variable:"<<what[2]<< " to new access:"<<what[1];
                accesses[what[1]].push_back(what[2]);
            }
        }
    }

    // perform queries
    for(std::map<std::string,std::vector<std::string> >::iterator i=accesses.begin();i!=accesses.end();i++){
        boost::cmatch what;

        if(regex_match(i->first.c_str(), what, expr)){
            std::string cuname=what[1];
            std::string dir=what[2];
            DPD_LDBG << " access CU:"<<cuname<<" channel:"<<dir<< " # vars:"<<i->second.size();
            int type =HumanTodatasetType(dir);
            std::string dst=cuname+chaos::datasetTypeToPostfix(type);

            if((end_t - start_t )<=1000){
                DPD_LDBG << " perform LIVE query to:"<<dst<<" start:"<<start_t<<" end:"<<end_t<<" limit:"<<limit;
                CDataWrapper* dss=NULL;
                if(getLastDataset(dst,&dss)==0){
                    if(dss){
                       ChaosSharedPtr<CDataWrapper>ds(dss);

                        allocateMetrics(start_t,ds,i,res,limit);
                    }
                }
                return ret;
                // go live
            }
            DPD_LDBG << " perform query to:"<<dst<<" start:"<<start_t<<" end:"<<end_t<<" limit:"<<limit;
            chaos::common::io::QueryCursor *pnt=ioLiveDataDriver->performQuery(dst,start_t,end_t,100);
            if(pnt ){
                int cnt=0;
                while(pnt->hasNext()&& cnt++<limit){
                    chaos::common::data::CDWShrdPtr ds(pnt->next());
                    if(ds->hasKey(chaos::DataPackCommonKey::DPCK_TIMESTAMP)){
                        start_t=ds->getInt64Value(chaos::DataPackCommonKey::DPCK_TIMESTAMP);
                    }

                    allocateMetrics(start_t,ds,i,res,limit);
                }
                ioLiveDataDriver->releaseQuery(pnt);
            }
        }
    }

    return ret;
}
