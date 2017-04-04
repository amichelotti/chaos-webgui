cmake_minimum_required(VERSION 2.8)
project(CUIserver)
SET(CUISERVER src/main.cpp src/MongooseWorker.cpp src/MongooseServer.cpp src/mongoose.c)
ADD_DEFINITIONS(-O2 -DDEBUG  -DMG_ENABLE_THREADS -DCS_ENABLE_STDIO)
ADD_EXECUTABLE(CUIserver ${CUISERVER})


IF(BUILD_FORCE_STATIC)
  SET(CMAKE_EXE_LINKER_FLAGS "-static -Wl,--whole-archive -lchaos_common -Wl,--no-whole-archive")
TARGET_LINK_LIBRARIES(${PROJECT_NAME} profiler chaos_metadata_service_client chaos_driver_misc common_debug ${FrameworkLib})
ELSE()
if(${CMAKE_BUILD_TYPE} MATCHES "PROFILE")
ADD_DEFINITIONS(-DGOOGLE_PROFILE)
TARGET_LINK_LIBRARIES(${PROJECT_NAME} profiler chaos_metadata_service_client chaos_driver_misc common_misc_scheduler chaos_common common_debug ${FrameworkLib})
ELSE() 
TARGET_LINK_LIBRARIES(${PROJECT_NAME} chaos_metadata_service_client  chaos_driver_misc common_misc_scheduler  chaos_common common_debug ${FrameworkLib})
ENDIF()
ENDIF()


INSTALL_TARGETS(/bin ${PROJECT_NAME})



