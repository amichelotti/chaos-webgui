cmake_minimum_required(VERSION 2.6)
include($ENV{CHAOS_BUNDLE}/tools/project_template/CMakeChaos.txt)
SET(CUISERVER src/main.cpp src/ChaosController.cpp)

ADD_EXECUTABLE(CUIserver ${CUISERVER})


TARGET_LINK_LIBRARIES(CUIserver mongoose chaos_uitoolkit chaos_common common_debug ${FrameworkLib})

INSTALL_TARGETS(/bin CUIserver)



