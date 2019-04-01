function DEFINES() {
   
};
DEFINES.DEFAULTWAITONCOMMAND=" ChaosUniquePtr<chaos::common::batch_command::CommandState> cmd_state;\n" +
"do { \n" +
"cmd_state = getStateForCommandID(cmd_id);\n" +
"if (!cmd_state.get()) break;\n" +
"switch (cmd_state->last_event) {\n" +
"case BatchCommandEventType::EVT_QUEUED:\n" +
"SCCUAPP << cmd_id << \" -> QUEUED\";\n" +
"break;\n" +
"case BatchCommandEventType::EVT_RUNNING:\n" +
"SCCUAPP << cmd_id << \" -> RUNNING\"; \n" +
"break;\n" +
"case BatchCommandEventType::EVT_WAITING:\n" +
"SCCUAPP << cmd_id << \" -> WAITING\";\n" +
"break;\n" +
"case BatchCommandEventType::EVT_PAUSED:\n" +
"SCCUAPP << cmd_id << \" -> PAUSED\";\n" +
"break;\n" +
"case BatchCommandEventType::EVT_KILLED:\n" +
"SCCUAPP << cmd_id << \" -> KILLED\";\n" +
"break;\n" +
"case BatchCommandEventType::EVT_COMPLETED:\n" +
"SCCUAPP << cmd_id << \" -> COMPLETED\";\n" +
"break;\n" +
"case BatchCommandEventType::EVT_FAULT:\n" +
"    SCCUAPP << cmd_id << \" -> FAULT\";\n" +
"break;\n}\n" +
"usleep(500000);\n" +
"} while (cmd_state->last_event != BatchCommandEventType::EVT_COMPLETED &&\n" +
"        cmd_state->last_event != BatchCommandEventType::EVT_FAULT &&\n" +
"    cmd_state->last_event != BatchCommandEventType::EVT_KILLED);\n" +
"return (cmd_state.get() &&\n" +
"cmd_state->last_event == BatchCommandEventType::EVT_COMPLETED);\n";

DEFINES.LICENSE_TEXT = "\nCopyright 2013 INFN, National Institute of Nuclear Physics\n" +
"Licensed under the Apache License, Version 2.0 (the \"License\")\n" +
"you may not use this file except in compliance with the License.\n" +
"      You may obtain a copy of the License at\n\n" +
"http://www.apache.org/licenses/LICENSE-2.0\n\n" +
 "Unless required by applicable law or agreed to in writing, software\n" +
  "distributed under the License is distributed on an \"AS IS\" BASIS,\n" +
  "WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n" +
   "See the License for the specific language governing permissions and\n" +
   "limitations under the License.\n";
DEFINES.DEFAULTCMDINCLUDES = "#include <cmath>\n#include  <boost/format.hpp>\n#include <boost/lexical_cast.hpp>\n#include <sstream>";
DEFINES.SCDEFAULTINCLUDES = "#include <chaos/cu_toolkit/control_manager/SCAbstractControlUnit.h>";
DEFINES.SCSOURCEDEFAULTINCLUDES = "#include <boost/format.hpp>\n#include <boost/lexical_cast.hpp>\n#include <common/debug/core/debug.h>";
DEFINES.SCSOURCEDEFAULTNAMESPACES = "using namespace chaos;\nusing namespace chaos::common::data;\nusing namespace chaos::common::batch_command;\nusing namespace chaos::cu::control_manager::slow_command;\nusing namespace chaos::cu::driver_manager::driver;\nusing namespace chaos::cu::control_manager;";
DEFINES.INTDEFAULTINCLUDES = "#include <iostream>\n#include <chaos/cu_toolkit/driver_manager/driver/DriverTypes.h>\n#include <chaos/cu_toolkit/driver_manager/driver/DriverAccessor.h>\n#include <common/debug/core/debug.h>\n#include <stdint.h>";
DEFINES.ABSTDEFAULTINCLUDES = "#include <inttypes.h>\n#include <string>";
DEFINES.DD_DEFAULTINCLUDES = "#include <string>\n#include <boost/regex.hpp>\n#include <chaos/cu_toolkit/driver_manager/driver/AbstractDriverPlugin.h>";


module.exports = DEFINES;