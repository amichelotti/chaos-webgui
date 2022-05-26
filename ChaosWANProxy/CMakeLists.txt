
cmake_minimum_required(VERSION 2.9)
IF(NOT CHAOS_BUNDLE)
  MESSAGE(STATUS "Adding WAN interface dependencies")
  
ENDIF()
find_package(chaos MODULE REQUIRED)
include_directories(../../ ${chaos_INCLUDE_DIRS})

SET(wp_src main.cpp		main.cpp
						ChaosWANProxy.cpp
						DefaultWANInterfaceHandler.cpp)

SET(wp_src ${wp_src}	wan_interface/AbstractWANInterface.cpp
						wan_interface/AbstractWANInterfaceResponse.cpp
						wan_interface/BaseWANInterfaceHandler.cpp)

SET(wp_src ${wp_src}	# wan_interface/http/HTTPWANInterface.cpp
wan_interface/http/HTTPServedBoostInterface.cpp wan_interface/http/HTTPUIInterface.cpp
						wan_interface/http/HTTPWANInterfaceRequest.cpp
						wan_interface/http/HTTPWANInterfaceStringResponse.cpp
						wan_interface/http/mongoose.cpp)


SET(wp_src ${wp_src}	api/AbstractApi.cpp
						api/AbstractApiGroup.cpp
						api/PersistenceAccessor.cpp
						api/producer/ProducerGroup.cpp
						api/producer/ProducerRegisterDatasetApi.cpp
						api/producer/ProducerInsertDatasetApi.cpp
                        api/producer/ProducerRegisterJsonApi.cpp
                        api/producer/ProducerInsertJsonApi.cpp
						api/producer/ProducerGetLastDatasetApi.cpp
						api/consumer/ConsumerGroup.cpp
						api/consumer/ConsumerCUApi.cpp
						api/consumer/ConsumerMDSApi.cpp
                                                api/grafana/GrafanaSearch.cpp
                                                api/grafana/GrafanaQuery.cpp
                                                api/grafana/GrafanaAnnotations.cpp
                                                api/grafana/GrafanaGroup.cpp
						)

SET(wp_src ${wp_src}	persistence/AbstractPersistenceDriver.cpp
						persistence/DefaultPersistenceDriver.cpp)

	MESG("Add Served")

ExternalProject_Add(
					Served
					GIT_REPOSITORY https://github.com/amichelotti/served.git
					GIT_TAG master
					PREFIX "${CMAKE_BINARY_DIR}/ext_dep/served-prefix"
					SOURCE_DIR "${CMAKE_BINARY_DIR}/ext_dep/served-src"
					BINARY_DIR "${CMAKE_BINARY_DIR}/ext_dep/served-src"
					CMAKE_ARGS -DCMAKE_INSTALL_PREFIX:PATH=${CMAKE_INSTALL_PREFIX}
					LOG_DOWNLOAD ON
					LOG_CONFIGURE ON
					LOG_BUILD ON)


ADD_EXECUTABLE(ChaosWANProxy ${wp_src})
ADD_DEFINITIONS(-DMONGOOSE_ENABLE_THREADS)
IF(BUILD_FORCE_STATIC)
  SET(CMAKE_EXE_LINKER_FLAGS "-static -Wl,--whole-archive -lchaos_common -Wl,--no-whole-archive")
ENDIF()

TARGET_LINK_LIBRARIES(ChaosWANProxy chaos_cds chaos_common chaos_metadata_service_client  chaos_driver_misc common_misc_scheduler common_debug served ${FrameworkLib})
#INSTALL_TARGETS(/bin ChaosWANProxy)
INSTALL(TARGETS ChaosWANProxy
        DESTINATION "bin"
        PERMISSIONS OWNER_WRITE OWNER_READ OWNER_EXECUTE GROUP_READ GROUP_WRITE GROUP_EXECUTE WORLD_READ WORLD_EXECUTE)
