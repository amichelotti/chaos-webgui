cmake_minimum_required(VERSION 2.8)
project(CUIserver)
SET(CUISERVER src/main.cpp src/ChaosWebController.cpp)
ADD_DEFINITIONS(-O2 -DDEBUG)
ADD_EXECUTABLE(CUIserver ${CUISERVER})
CheckConfigureBuild(mongoose mongoose-cpp "-DHAS_JSONCPP=ON;-DENABLE_PIC=ON" https://github.com/amichelotti )

IF(BUILD_FORCE_STATIC)
  SET(CMAKE_EXE_LINKER_FLAGS "-static -Wl,--whole-archive -lchaos_common -Wl,--no-whole-archive")
TARGET_LINK_LIBRARIES(${PROJECT_NAME} mongoose profiler chaos_metadata_service_client chaos_driver_misc common_debug ${FrameworkLib})
ELSE()
if(${CMAKE_BUILD_TYPE} MATCHES "PROFILE")
ADD_DEFINITIONS(-DGOOGLE_PROFILE)
TARGET_LINK_LIBRARIES(${PROJECT_NAME} mongoose profiler  chaos_metadata_service_client chaos_driver_misc chaos_common common_debug ${FrameworkLib})
ELSE() 
TARGET_LINK_LIBRARIES(${PROJECT_NAME} mongoose chaos_metadata_service_client  chaos_driver_misc  chaos_common common_debug ${FrameworkLib})
ENDIF()
ENDIF()



INSTALL(TARGETS ${PROJECT_NAME}
        DESTINATION "bin"
        PERMISSIONS OWNER_WRITE OWNER_READ OWNER_EXECUTE GROUP_READ GROUP_WRITE GROUP_EXECUTE WORLD_READ WORLD_EXECUTE)



