cmake_minimum_required(VERSION 2.6)
include($ENV{CHAOS_BUNDLE}/tools/project_template/CMakeChaos.txt)
SET(CUISERVER src/main.cpp src/ChaosController.cpp)
ADD_DEFINITIONS(-O2 -DDEBUG)
ADD_EXECUTABLE(CUIserver ${CUISERVER})

IF(BUILD_FORCE_STATIC)
  SET(CMAKE_EXE_LINKER_FLAGS "-static -Wl,--whole-archive -lchaos_common -Wl,--no-whole-archive")
TARGET_LINK_LIBRARIES(CUIserver mongoose chaos_uitoolkit common_debug ${FrameworkLib})
ELSE()
TARGET_LINK_LIBRARIES(CUIserver mongoose chaos_uitoolkit chaos_common common_debug ${FrameworkLib})
ENDIF()


INSTALL_TARGETS(/bin CUIserver)



