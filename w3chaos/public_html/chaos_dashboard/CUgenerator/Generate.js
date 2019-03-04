var buttonGenerate = document.getElementById('buttonGenerate');
var checkboxGenerateDriver = document.getElementById('GenerateDriver');
var checkboxGenerateIntermediateMakeLists=document.getElementById('GenerateIntermediateMakelists');
var checkBoxDebugLog = document.getElementById('DebugLog');
buttonGenerate.onclick=GenerateCUCode;
var toDownload = document.getElementById('lnkDownload');
var checkedListBox = document.getElementById('checkedListBoxToPush');
var labCheckedListBox = document.getElementById('labelChkPush');
var fieldSelect = document.getElementById('pushSelection');
var labfieldSelect = document.getElementById('labelPushSel');
var rootChaosPath = document.getElementById('RemoteRootPath');

var ptOparamInterface=[];
var ptNeededOPar=[];
var ptIparamInterface=[];
var ptNeededIPar=[];
var zip;
toDownload.hidden=true;
InitPage();


function InitPage() {
    var lastRoot=localStorage.getItem('lastRootPath');
    if (lastRoot!=null)
        rootChaosPath.value=lastRoot;
}

function ShowFieldSets() {
    checkedListBox.hidden=false;
    labCheckedListBox.hidden=false;
    fieldSelect.hidden=false;
    labfieldSelect.hidden=false;
}
function excludeCMakeLists() {
    var checkState=document.getElementById("ExcludeCMakeLists").checked;
    var inputs=checkedListBox.getElementsByTagName("input");
    for (var i=0; i < inputs.length;i++)
    {
        if (inputs[i].value.includes("CMakeLists.txt") && checkState==true)
        {
            inputs[i].checked=false;
        }
    }
}

function checkOnlyCU() {
    var inputs=checkedListBox.getElementsByTagName("input");
    for (var i=0; i < inputs.length;i++)
    {
        if (inputs[i].value.startsWith("driver"))
            inputs[i].checked=true;
        else
            inputs[i].checked=false;
        
        if (inputs[i].value.startsWith("common") && (inputs[i].value.includes("core/Abstract")))
        {
            inputs[i].checked=true;

        }
    }
    excludeCMakeLists();
}

function checkOnlyLowDriver() {
    var inputs=checkedListBox.getElementsByTagName("input");
    for (var i=0; i < inputs.length;i++)
    {
        if (inputs[i].value.startsWith("common"))
            inputs[i].checked=true;
        else
            inputs[i].checked=false;
    }
    excludeCMakeLists();
}


function checkAll(check) {
    var inputs=checkedListBox.getElementsByTagName("input");
    for (var i=0; i < inputs.length;i++)
    {
        inputs[i].checked=check;
    }
    excludeCMakeLists();
}


function radioSelectHandler() {
    var radioselection=document.getElementsByName('selectionKind');
    var whatChecked=-1;
    for (var i in radioselection)
    {
        if (radioselection[i].checked)
        {
            whatChecked=i;
            break;
        }
    }
    if (whatChecked!=-1)
    {
        if (radioselection[whatChecked].id=="radioclearAll") 
        {
            checkAll(false);
        }
        if (radioselection[whatChecked].id=="radioOnlyCU") 
        {
            checkOnlyCU();
        }
        if (radioselection[whatChecked].id=="radioOnlyCommon") 
        {
            checkOnlyLowDriver();
        }
        if (radioselection[whatChecked].id=="radioCheckAll") 
        {
            checkAll(true);
        }

    }

}



function AddCheckBox(filename) {
    var lbl=document.createElement('label');
    var uid=guid();
    lbl.htmlFor=uid;
    lbl.innerHTML=filename+"<br/>";
    var opt = document.createElement('input');
    opt.type="checkbox";
    opt.value = filename;
    opt.id=uid;
    opt.checked=true;
    opt.innerHTML = filename;
    checkedListBox.appendChild(opt);
    checkedListBox.appendChild(lbl);
}


function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  

function getStandardNameForTypedVariable(type) {
    var  ret;
    ret=type.trim();
    ret=ret.replace('&','E');
    ret=ret.replace('*','P');
    ret=ret.replace(' ','_');
    ret = ret.replace('<','_');
    ret = ret.replace('>', '_');
    return ret;
}


function  getInterfaceVariable(type,output,count) 
{
    var j=0;
    var list;
   // alert("getInterfaceVariable called for "+type+ " asoutput="+output)
    list = (output) ? ptOparamInterface : ptIparamInterface ;
    for (var  ivariable in list)
    {
      var variable=list[ivariable];
      //alert("getInterfaceVariable: "+variable)
      var typ = "";
      var nm = "";
      var typeAndName=variable.split(' ');
      if (typeAndName.length < 2)
        return "";
      if (typeAndName.length == 2)
      {
        typ=typeAndName[0].replace(' ',"");
        nm=typeAndName[1].replace(' ',"");
      }
      if (typeAndName.Length > 2)
      {
        nm=typeAndName[typeAndName.length-1];
        for (var i = 0; i < typeAndName.length - 1; i++)
        {
            typ += (typeAndName[i].replace(' ',"") + " ");
        }
      }
      typ=typ.trim(' ');
      if ((typ == type) && (nm != "timeout") )
      {
              if (j == count)
              {
                  if (nm.includes('<'))
                  {
                      nm = nm.replace('<', '_');
                      nm = nm.replace('>', '_');
                  }
                  return nm;
              }
              else
                  j++;
      }
    }
    return "";
  }

function errorHandler(e) {
    var msg = '';
  
    switch (e.code) {
      case FileError.QUOTA_EXCEEDED_ERR:
        msg = 'QUOTA_EXCEEDED_ERR';
        break;
      case FileError.NOT_FOUND_ERR:
        msg = 'NOT_FOUND_ERR';
        break;
      case FileError.SECURITY_ERR:
        msg = 'SECURITY_ERR';
        break;
      case FileError.INVALID_MODIFICATION_ERR:
        msg = 'INVALID_MODIFICATION_ERR';
        break;
      case FileError.INVALID_STATE_ERR:
        msg = 'INVALID_STATE_ERR';
        break;
      default:
        msg = 'Unknown Error';
        break;
    }
  
    alert('Error: ' + msg);
  }

function AddInterfaceCall(wr,CU,cmd) {
    if (cmd.Default || !(cmd.isInterfaceCommand))
          return;
      
    for (var ipar in cmd.Parameters)
    {
        var par=CPARcreate(cmd.Parameters[ipar]);
        if (getRetrievingDataWrapperFunction(par.Type) == "")
        {
            alert("Cannot connect to Interface cmd " + cmd.Name + "cannot extract parameter " + par.Name + " from CDataWrapper", "Error");
            return;
        }
    }
    //driver_command_error will be
    var DrvErr=new ChaosAlarms("driver_command_error","default driver communication error",true);
    if (CU.HaveAlarm(DrvErr))
        wr.WriteLine("setStateVariableSeverity(StateVariableTypeAlarmCU,\"" + DrvErr.Name + "\",chaos::common::alarm::MultiSeverityAlarmLevelClear);");
    for (var ipar2 in cmd.Parameters)
    {
        var par=CPARcreate(cmd.Parameters[ipar2]);
        wr.WriteLine("if(!data || !data->hasKey(" + par.getParamAlias(CU.Prefix, cmd.Name) + "))");
        wr.WriteLine("{"); wr.addIndent();
        wr.WriteLine("SCLERR_ << \"" + par.Name + " not present in CDataWrapper\";");
        wr.WriteLine("metadataLogging(chaos::common::metadata_logging::StandardLoggingChannel::LogLevelError,\"" + par.Name + " not present in CDataWrapper\" );");
        //inserting error
        wr.WriteLine("setWorkState(false);");
        wr.WriteLine("BC_FAULT_RUNNING_PROPERTY");
        wr.WriteLine("return;");
        wr.delIndent();
        wr.WriteLine("}");
        var typeToDeclare;
        if (par.Type.includes("string") || par.Type.startsWith("vector"))
        {
          typeToDeclare="std::"+par.Type;
        }
        else
        {
            typeToDeclare=par.Type;
        }
        wr.WriteLine(typeToDeclare + " tmp_" + par.Name + "=data->" + getRetrievingDataWrapperFunction(par.Type) + "(" + par.getParamAlias(CU.Prefix, cmd.Name) + ");\n");
    }
    //EXCLUDE IF NO DRIVER
    if (checkboxGenerateDriver.checked == false)
    {
        wr.WriteLine("/* REMOVE COMMENT IF YOU ADD DRIVER");
    }
    wr.WriteLine("int err=0;");
    wr.Write("if ((err="+ CU.getAbstractDriver() +"->"+cmd.Name+"("  );
    var first=true;
    for (var ipar3 in cmd.Parameters)
    {
        par=cmd.Parameters[ipar3];
        if (first)
            first=false;
        else
            wr.WriteNoInd(',');
        wr.WriteNoInd("tmp_"+par.Name);
    }
    wr.WriteLineNoInd(")) != 0)" );
    wr.WriteLine("{"); wr.addIndent();
    wr.WriteLine("metadataLogging(chaos::common::metadata_logging::StandardLoggingChannel::LogLevelError,\" command "+cmd.Name+" not acknowledged\");" );
    if (CU.HaveAlarm(DrvErr))
        wr.WriteLine("setStateVariableSeverity(StateVariableTypeAlarmCU,\"" + DrvErr.Name + "\",chaos::common::alarm::MultiSeverityAlarmLevelHigh);");
    wr.delIndent(); wr.WriteLine("}");
    if (checkboxGenerateDriver.checked == false)
    {
        wr.WriteLine("REMOVE COMMENT IF YOU ADD DRIVER    */");
    }
    //EXCLUDE UNTIL HERE
    wr.WriteLine("setWorkState(true);");
  }

function AddDefaultsOnCU() {
    var tmpstr=localStorage.getItem('controlUnit');
    if (tmpstr==null)
        return;
    var theCU=CUcreate(JSON.parse(tmpstr));
    var defaultCommand=new CUCommand();
    defaultCommand.Name="Default";
    defaultCommand.Description="Default command executed when no other commands in queue";
    defaultCommand.Default=true;
    defaultCommand.isInterfaceCommand=true;
    defaultCommand.Parameters=[];
    var cmdList=retrieveFromJson("Commands");
    var defaultIsPresent=false;
    for (var i in cmdList)
    {
        var cmd=cmdList[i];
        if (cmd.Name==defaultCommand.Name)
        {
            defaultIsPresent=true;
            break;
        }
    }
    if (!defaultIsPresent)
    {
        cmdList.push(defaultCommand);
        UpdateJsonCU("Commands",cmdList);
    }
    var datasetList=retrieveFromJson("DataSet");
    var defaultAttribute= new datasetVariable("status_id","default status attribute");
    defaultAttribute.Type="TYPE_INT32";
    defaultAttribute.DataDirection="Output";
    defaultAttribute.HaveHandler="";
    defaultAttribute.DataLen=0;
    defaultAttribute.SizeVector=0;
   
    if (!theCU.HaveInDataSet(defaultAttribute))
    {
        datasetList.push(JSON.stringify(defaultAttribute));
        UpdateJsonCU("DataSet",datasetList);
    }
    defaultAttribute.Name="alarms";
    defaultAttribute.Description="default alarms attribute";
    defaultAttribute.Type="TYPE_INT64";
    if (!theCU.HaveInDataSet(defaultAttribute))
    {
        datasetList.push(JSON.stringify(defaultAttribute));
        UpdateJsonCU("DataSet",datasetList);
    }
    defaultAttribute.Name="driver_timeout";
    defaultAttribute.Description="custom user timeout in milliseconds for commands";
    defaultAttribute.Type="TYPE_INT32";
    defaultAttribute.DataDirection="Input";
    if (!theCU.HaveInDataSet(defaultAttribute))
    {
        datasetList.push(JSON.stringify(defaultAttribute));
        UpdateJsonCU("DataSet",datasetList);
    }


}

function PrintHeaderFile(writer,nameFile) {
    if (writer != null)
    {
    writer.WriteLine("/*");
    writer.WriteLine(nameFile);
    writer.WriteLine("!CHAOS");
    writer.WriteLine("Created by CUGenerator");
    writer.WriteLine(DEFINES.LICENSE_TEXT+"*/");

    }
}

function  GenerateSCCUSource() {
    var writer;
    try
    {
        var currentCU=localStorage.getItem('controlUnit');
        if (currentCU==null)
            return "";
        var CUJ =JSON.parse(currentCU);
        var CU=CUcreate(CUJ);
        var ClassName="SC"+CU.Name+"ControlUnit";
        var relative=CU.OffsetFromDriver;
        var completefilename="driver/"+relative+CU.Name+"/core/"+ClassName+".cpp";
         writer=new FileWriter("",ClassName+".cpp");
        PrintHeaderFile(writer, ClassName + ".cpp");
        writer.WriteLine("#include \"" + ClassName + ".h\"");
        writer.WriteLine(DEFINES.SCSOURCEDEFAULTINCLUDES);
        writer.WriteLine("#include <chaos/cu_toolkit/windowsCompliant.h>");
        for (var i in CU.Commands)
        {
            var ptCmd = CU.Commands[i];
            if  (ptCmd.isInterfaceCommand==false)
                continue;
            writer.WriteLine("#include \"Cmd" + CU.Prefix + ptCmd.Name + ".h\"");
        }
        writer.WriteLine(DEFINES.SCSOURCEDEFAULTNAMESPACES);
        writer.WriteLine("#define SCCUAPP INFO_LOG(" + ClassName + ")");
        writer.WriteLine("#define SCCUDBG DBG_LOG(" + ClassName + ")");
        writer.WriteLine("#define SCCUERR ERR_LOG(" + ClassName + ")\n\n");
        writer.WriteLine("PUBLISHABLE_CONTROL_UNIT_IMPLEMENTATION(::driver::" + CU.getNameSpace() + "::" + ClassName + ")\n");
        writer.WriteLine("/*Construct a new CU with an identifier*/");
        writer.WriteLine("::driver::" + CU.getNameSpace() + "::" + ClassName + "::" + ClassName + "(const string &_control_unit_id,\n\t\t\tconst string &_control_unit_param,const ControlUnitDriverList &_control_unit_drivers)");
        writer.WriteLine(":  chaos::cu::control_manager::SCAbstractControlUnit(_control_unit_id,\n\t\t\t _control_unit_param, _control_unit_drivers) {");
        writer.addIndent();
        writer.WriteLine(CU.getAbstractDriver() + " = NULL;");
        writer.delIndent();
        writer.WriteLine("}");
        writer.WriteLine("/*Base Destructor*/");
        writer.WriteLine("::driver::" + CU.getNameSpace() + "::" + ClassName + "::~" + ClassName + "() {");
        writer.addIndent();
        writer.WriteLine("if (" + CU.getAbstractDriver() + ") {");
        writer.addIndent();
        writer.WriteLine("delete (" + CU.getAbstractDriver() + ");");
        writer.delIndent(); writer.WriteLine("}");
        writer.delIndent(); writer.WriteLine("}");
        //////HANDLERS
        writer.WriteLine("//handlers");
        var handlerNames =[];
        for (var i in CU.DataSet)
        {
            var AttribJ = JSON.parse(CU.DataSet[i]);
            var Attrib=DTcreate(AttribJ);
            if ((Attrib.HaveHandler != "") && Attrib.IsInput())
            {
                var cmdToSearch = Attrib.HaveHandler;
                var isAcommand = false;
                var pointedCommand = null;
                for (var j in CU.Commands)
                {
                    var cmd = CU.Commands[j];
                    if (cmdToSearch == cmd.Name)
                    {
                        isAcommand = true;
                        pointedCommand = cmd;
                        break;
                    }
                }
                var handlerName=isAcommand?   "handler_"+Attrib.Name : Attrib.HaveHandler ;
                if (handlerNames.includes(handlerName))
                    continue;
                else
                    handlerNames.push(handlerName);

                writer.Write("bool ::driver::" + CU.getNameSpace() + "::" + ClassName + "::"+handlerName + "(const std::string &name, ");
                var inputType=DeduceCPPType(Attrib.Type);
                if (inputType=="")
                {
                    alert("Cannot deduce CPP Type from " +Attrib.Type," Fatal Error");
                    return ["",""];
                }
                writer.WriteLineNoInd(DeduceCPPType(Attrib.Type) + " value, uint32_t size) ");
                writer.WriteLine("{"); writer.addIndent();
                if (!isAcommand)
                {
                    writer.WriteLine("SCCUAPP << \"" + handlerName + ":\"<< \" VALUE:\"<<value;");
                    writer.WriteLine("return true;");
                }
                else
                {
                    writer.WriteLine("int ret;");
                    writer.WriteLine("SCCUAPP << \"" + handlerName + ":\"<< \" VALUE:\"<<value;");
                    if (!pointedCommand.isInterfaceCommand)
                    {
                        writer.WriteLine("ret=" + CU.getAbstractDriver() + "->" + pointedCommand.Name + "(value);");
                        var DrvErr = new ChaosAlarms("driver_command_error","",true);
                        if (CU.HaveAlarm(DrvErr))
                        {
                            writer.WriteLine("if (ret!=0) {"); writer.addIndent();
                            writer.WriteLine("setStateVariableSeverity(StateVariableTypeAlarmCU,\"" + DrvErr.Name + "\",chaos::common::alarm::MultiSeverityAlarmLevelHigh);");
                            writer.delIndent(); writer.WriteLine("}");
                        }
                        writer.WriteLine("return (ret==0);");
                    }
                    else //è di interfaccia
                    {
                            var parJ= pointedCommand.Parameters[0];
                            var par =CPARcreate(parJ);
                            var parAlias=par.getParamAlias(CU.Prefix,pointedCommand.Name);
                            writer.WriteLine("uint64_t cmd_id;");
                            writer.WriteLine("std::auto_ptr<CDataWrapper> cmd_pack(new CDataWrapper());");
                            writer.WriteLine("cmd_pack->" + getAddingDataWrapperFunction(inputType) + "(" + parAlias + ",value);");
                            writer.WriteLine("submitBatchCommand(" + getCommandAlias(CU.Prefix,pointedCommand.Name) + ",");
                            writer.WriteLine("cmd_pack.release(),");
                            writer.WriteLine("cmd_id,");writer.WriteLine("0,");writer.WriteLine("50,");
                            writer.WriteLine("SubmissionRuleType::SUBMIT_NORMAL);");
                            writer.WriteLine("return (ret==chaos::ErrorCode::EC_NO_ERROR);");
                    }
                }
                writer.delIndent(); writer.WriteLine("}");
            }
        }
        writer.WriteLine("//end handlers");
        ///END HANDLERS
        //ActionAndDataset
        writer.WriteLine("void ::driver::" + CU.getNameSpace() + "::" + ClassName + "::unitDefineActionAndDataset()  {");
        writer.addIndent();
        for (var i in  CU.Commands)
        {
            var ptCmd = CU.Commands[i];
            if (!ptCmd.isInterfaceCommand)
                continue;
            var cmdName = "Cmd" + CU.Prefix + ptCmd.Name;
            writer.Write("installCommand(BATCH_COMMAND_GET_DESCRIPTION(" + cmdName + ")");
            if (ptCmd.Default)
                writer.WriteLineNoInd(",true);");
            else
                writer.WriteLineNoInd(");");
        }
        //DRIVER INITIALIZATION MOVED HERE FOR ADMITTING Dataset variables from driver.
        if (checkboxGenerateDriver.checked == false)
            writer.WriteLine("/* //Uncomment when you want to connect the driver");

        writer.WriteLine("chaos::cu::driver_manager::driver::DriverAccessor *" + CU.getAccessor() + " = getAccessoInstanceByIndex(0);");
        writer.WriteLine("if (" + CU.getAccessor() + " == NULL ) {");
        writer.addIndent();
        writer.WriteLine("throw chaos::CException(-1, \"Cannot retrieve the requested driver\", __FUNCTION__);");
        writer.delIndent(); writer.WriteLine("}");
        writer.WriteLine(CU.getAbstractDriver() + " = new chaos::driver::" + CU.getNameSpace() + "::Chaos" + CU.Name + "Interface(" + CU.getAccessor() + ");");
        writer.WriteLine("if (" + CU.getAbstractDriver() + " == NULL) {");
        writer.addIndent();
        writer.WriteLine("throw chaos::CException(-2, \"Cannot allocate driver resources\", __FUNCTION__);");
        writer.delIndent(); writer.WriteLine("}");
        if (checkboxGenerateDriver.checked == false)
           writer.WriteLine("*/ //Uncomment when you want to connect the driver");
        for (var  i in CU.DataSet)
        {
            var ptDataJ = JSON.parse(CU.DataSet[i]);
            var ptData=DTcreate(ptDataJ);
            if (ptData.IsVector() == false)
            {
                writer.WriteLine("addAttributeToDataSet(\"" + ptData.Name + "\",");
                writer.WriteLine("\t\t\t\t\t\t\"" + ptData.Description + "\",");
                writer.WriteLine("\t\t\t\t\t\tDataType::" + ptData.Type + ",");
                if (ptData.Type == "TYPE_STRING" )
                    writer.WriteLine("\t\t\t\t\t\tDataType::" + ptData.DataDirection + ", " + ptData.DataLen+ ");");
                else
                    writer.WriteLine("\t\t\t\t\t\tDataType::" + ptData.DataDirection + ");");
            }
            else //IS VECTOR
            {
                writer.WriteLine("addBinaryAttributeAsSubtypeToDataSet(\"" + ptData.Name + "\",");
                writer.WriteLine("\t\t\t\t\t\t\"" + ptData.Description + "\",");
                writer.WriteLine("\t\t\t\t\t\tchaos::DataType::SUB_" + ptData.Type + ",");
                writer.WriteLine("\t\t\t\t\t\t" + ptData.SizeVector + "*sizeof(" + getCNameForChaosType(ptData.Type) + "),");
                writer.WriteLine("\t\t\t\t\t\tchaos::DataType::" + ptData.DataDirection + ");");
            }//END IS VECTOR
        }
        //printing handlers linking
        for (var i  in CU.DataSet)
        {
            var Attrib = DTcreate(JSON.parse(CU.DataSet[i]));
            if ((Attrib.HaveHandler != "") && Attrib.IsInput())
            {
                
                var handlerName = CU.getFunctionNameForHandlingAttribute(Attrib);
                writer.WriteLine("addHandlerOnInputAttributeName< ::driver::" + CU.getNameSpace() + "::" + ClassName + ","+DeduceCPPType(Attrib.Type)+">(this,");
                writer.addIndent();
                writer.WriteLine("&::driver::" + CU.getNameSpace() + "::" + ClassName + "::" + handlerName + ",");
                writer.WriteLine("\"" + Attrib.Name + "\");");
                writer.delIndent();
            }
        }
        //adding alarms declaration
        for (var i in CU.Alarms)
        {
            var alarm=CU.Alarms[i];
            var typeOfAlarm=alarm.CUAlarm? "StateVariableTypeAlarmCU" : "StateVariableTypeAlarmDEV" ;
            writer.WriteLine("addStateVariable("+typeOfAlarm+",\""+alarm.Name+"\",");
            writer.WriteLine("\t\""+alarm.Description+"\");" );
        }
        writer.delIndent(); writer.WriteLine("}");
        //Others
        writer.WriteLine("void ::driver::" + CU.getNameSpace() + "::" + ClassName + "::unitDefineCustomAttribute() {");
        writer.WriteLine("}");
        writer.WriteLine( "// Abstract method for the initialization of the control unit");
        writer.WriteLine("void ::driver::" + CU.getNameSpace() + "::" + ClassName + "::unitInit() {");
        writer.WriteLine("}");
        writer.WriteLine("// Abstract method for the start of the control unit");
        writer.WriteLine("void ::driver::" + CU.getNameSpace() + "::" + ClassName + "::unitStart() {");
        writer.WriteLine("}");

        writer.WriteLine("// Abstract method for the stop of the control unit");
        writer.WriteLine("void ::driver::" + CU.getNameSpace() + "::" + ClassName + "::unitStop()  {");
        writer.WriteLine("}");
        writer.WriteLine("// Abstract method for deinit the control unit");
        writer.WriteLine("void ::driver::" + CU.getNameSpace() + "::" + ClassName + "::unitDeinit() {"); writer.addIndent();
        writer.WriteLine("SCCUAPP << \"deinitializing \";");
        //writer.WriteLine(CU.getNameSpace() + "_drv->deinit();");
        writer.delIndent(); writer.WriteLine("}");
        writer.WriteLine("	//! restore the control unit to snapshot");
        writer.WriteLine("#define RESTORE_LAPP SCCUAPP << \"[RESTORE-\" <<getCUID() << \"] \"");
        writer.WriteLine("#define RESTORE_LERR SCCUERR << \"[RESTORE-\" <<getCUID() << \"] \"");
        writer.WriteLine("bool ::driver::" + CU.getNameSpace() + "::" + ClassName + "::unitRestoreToSnapshot(chaos::cu::control_manager::AbstractSharedDomainCache *const snapshot_cache)  {");
        writer.addIndent();
        writer.WriteLine("return false;");
        writer.delIndent(); writer.WriteLine("}");

        writer.WriteLine("bool ::driver::" + CU.getNameSpace() + "::" + ClassName + "::waitOnCommandID(uint64_t cmd_id) {"); 
        writer.addIndent();
        writer.WriteLine(DEFINES.DEFAULTWAITONCOMMAND);

        writer.delIndent(); writer.WriteLine("}");
    }
    catch (e) {alert("EXC "+e);}
    var toRet=writer.getFileContent();
    var flName=writer.FileName;
    var rett=[flName,toRet,completefilename];
    return rett;
}

function GenerateSCCUHeader()
{
    var writer;
    var completefilename;
    try
    {
    var currentCU=localStorage.getItem('controlUnit');
    if (currentCU==null)
        return "";
    var CU =JSON.parse(currentCU);
    var abstractDriver=CU.Name.toLowerCase()+"_drv";
    var ClassName="SC"+CU.Name+"ControlUnit";
    var relative=CU.OffsetFromDriver;
    completefilename="driver/"+relative+CU.Name+"/core/"+ClassName+".h";
    writer=new FileWriter("",ClassName+".h");
    writer.WriteLine("/*");
    writer.WriteLine(ClassName + ".h");
    writer.WriteLine("!CHAOS");
    writer.WriteLine("Created by CUGenerator");
    writer.WriteLine(DEFINES.LICENSE_TEXT + "*/");
    /****************************************************************/
    writer.WriteLine("#ifndef __" + CU.Name + "__" + ClassName + "__");
    writer.WriteLine("#define __" + CU.Name + "__" + ClassName + "__\n");
    writer.WriteLine(DEFINES.SCDEFAULTINCLUDES);
    writer.WriteLine("#include <driver/" + relative + CU.Name + "/core/Chaos" + CU.Name + "Interface.h>");
    writer.WriteLine("using namespace chaos;");
    writer.WriteLine("namespace driver {");
    writer.addIndent();
    writer.WriteLine("namespace " + CU.Name.toLowerCase() + " {");
    writer.addIndent();
    writer.WriteLine("class " + ClassName + ": public chaos::cu::control_manager::SCAbstractControlUnit {");
    writer.addIndent();
    writer.WriteLine("PUBLISHABLE_CONTROL_UNIT_INTERFACE(SC" + CU.Name + "ControlUnit)");
    writer.WriteLine("std::string device_hw;");
    writer.WriteLine("chaos::driver::" + CU.Name.toLowerCase() + "::Chaos" + CU.Name + "Interface *" + abstractDriver + ";");
    writer.WriteLine("bool waitOnCommandID(uint64_t command_id);");
    writer.delIndent();
    writer.WriteLine("protected:");writer.addIndent();
    writer.WriteLine("/* Define the Control Unit Dataset and Actions */");
    writer.WriteLine("void unitDefineActionAndDataset();");
    writer.WriteLine("void unitDefineCustomAttribute();");
    writer.WriteLine("/*(Optional) Initialize the Control Unit and all driver, with received param from MetadataServer*/");
    writer.WriteLine("void unitInit();");
    writer.WriteLine( "/*(Optional) Execute the work, this is called with a determined delay, it must be as fast as possible*/");
    writer.WriteLine( "void unitStart();");
    writer.WriteLine( "/*(Optional) The Control Unit will be stopped*/");
    writer.WriteLine( "void unitStop();");
    writer.WriteLine( "/*(Optional) The Control Unit will be deinitialized and disposed*/");
    writer.WriteLine( "void unitDeinit();");
    writer.WriteLine( "//!restore method");
    writer.WriteLine( "bool unitRestoreToSnapshot(chaos::cu::control_manager::AbstractSharedDomainCache * const snapshot_cache);");
    writer.WriteLine("// handler declaration");
    var ds=retrieveFromJson("DataSet");
    var CUobj=CUcreate(CU);
    var handlerNames =[];
    for (var i in ds)
    {
       //alert(ds[i]);
        var AttribJ=JSON.parse(ds[i]);
        var Attrib=DTcreate(AttribJ);
        
        if ((Attrib.HaveHandler != "") && Attrib.IsInput() )
        {
            var handlerName=CUobj.getFunctionNameForHandlingAttribute(Attrib);
            if (handlerNames.includes(handlerName))
                continue;
            else
                handlerNames.push(handlerName);
            writer.WriteLine("bool " + handlerName + "(const std::string &name," +DeduceCPPType(Attrib.Type) + " value,uint32_t size);");
        }
    }
    writer.WriteLine("//end handler declaration");
    writer.delIndent();
    writer.WriteLine("public:");
    writer.addIndent();
    writer.WriteLine("/*Construct a new CU with an identifier*/");
    writer.WriteLine(ClassName + "(const std::string& _control_unit_id,const std::string& _control_unit_param,const ControlUnitDriverList& _control_unit_drivers);");
    writer.WriteLine("/*Base Destructor*/");
    writer.WriteLine("~" + ClassName + "();");
   
    writer.delIndent();
    writer.WriteLine("};");
    writer.delIndent();

    writer.WriteLine("}");
    writer.delIndent();
    writer.WriteLine("}");
    writer.WriteLine("#endif");
    }
    catch (e) {alert("EXC "+e);}
    var toRet=writer.getFileContent();
    var flName=writer.FileName;
    var rett=[flName,toRet,completefilename];
    



    return rett;

}

function CreateAbstractClassHeader() {
    try
    {
        var currentCU=localStorage.getItem('controlUnit');
        if (currentCU==null)
            return "";
        var CU =CUcreate(JSON.parse(currentCU));
        var  ClassName="Abstract"+CU.Name;
        var completefilename="common/"+CU.OffsetFromCommon+CU.Name+"/core/"+ClassName+".h";
        var writer=new FileWriter("",ClassName+".h");
        PrintHeaderFile(writer,ClassName+".h");
        writer.WriteLine(DEFINES.ABSTDEFAULTINCLUDES );
        writer.WriteLine("#ifndef __common_"+ClassName+"_h__" );
        writer.WriteLine("#define __common_"+ClassName+"_h__" );
        writer.WriteLine("namespace common {" ); writer.addIndent();
        writer.WriteLine("namespace "+CU.getNameSpace()+" {" ); writer.addIndent();
        //ENUMERAZIONI CUSTOM
        for (var i in CU.AbstractEnumerations )
        {
            var en= CU.AbstractEnumerations[i];
            var pos=0;
            writer.WriteLine("typedef enum {");
            writer.addIndent();
            for (var  ival in (en.Values) )
            {
                var val=en.Values[ival];
                if (pos > 0)
                    writer.WriteLineNoInd(",");

                writer.Write(CU.Name.toUpperCase()+"_"+val);
                if (en.BitwiseOrdered)
                {
                    var vv=1 << pos;
                    writer.WriteNoInd(" = 0x"+ vv.toString(16));
                }
                pos++;
            }
            writer.WriteLine("");
            writer.delIndent();writer.WriteLine("} "+ en.Name+";");
        }
        //CLASSE
        writer.WriteLine("class "+ClassName+" {" ); 
        writer.WriteLine("  public:" );
        writer.addIndent();
        writer.WriteLine(ClassName+"() {};"  );
        writer.WriteLine("virtual ~"+ClassName+"() {};" );
        for (var  iCmd in CU.Commands)
        {
            var Cmd=CMDcreate(CU.Commands[iCmd]);
            if (Cmd.Default)
            {
                continue;
            }
            writer.Write("virtual " + Cmd.CreateFunctionPrototype());
            writer.WriteLineNoInd("=0;");
        }
        writer.delIndent();writer.WriteLine("};");
        writer.delIndent();writer.WriteLine("}");
        writer.delIndent();writer.WriteLine("}//common");
        writer.WriteLine("#endif" );
    }
    catch(e) {alert("EXC "+e);}
    var toRet=writer.getFileContent();
    var flName=writer.FileName;
    var rett=[flName,toRet,completefilename];
    return rett;
}

function CalculateInterfaceParamStruct() {
    var typeOfParameters=[];
    ptIparamInterface.length=0;
    ptOparamInterface.length=0;
    var currentCU=localStorage.getItem('controlUnit');
    if (currentCU==null)
    {
        throw "Cannot generate! Control Unit doesn't exist";
    }
       
    var CU =CUcreate(JSON.parse(currentCU));
    //adding default int32 for input: timeout
    ptIparamInterface.push("uint32_t timeout");
    //int64 default for oParam for default getFeatures: inserire default?????
    ptOparamInterface.push("int64_t int64_t1");
    //int32 default for oParam result field
    ptOparamInterface.push("int32_t result");
    
    for (var  iCmd in CU.Commands)
    {
        var cmd=CMDcreate(CU.Commands[iCmd]);
        var  typeOfCmdParameters=[];
        for (var iparam in cmd.Parameters)
        {
           
            var param=cmd.Parameters[iparam];
            //alert("Calculating interfaceParamStruct ALEDEBUG: "+param.Name+" " +param.Type)
            var found=false;
            for (var  iElem in typeOfCmdParameters)
            {
                var Elem=NTPcreate(typeOfCmdParameters[iElem]);
                if (Elem.Type == param.Type)
                {
                    //alert("actually needed: "+typeOfCmdParameters[iElem].needed);
                    found=true;
                    typeOfCmdParameters[iElem].needed++;
                   
                }
            }
            if (!found)
            {
                var  Element =new NumberForTypePair();
                Element.Type=param.Type;
                Element.needed=1;
               
                typeOfCmdParameters.push(Element);
            }
        }
        for (var  iElem in typeOfCmdParameters)
        {
            
            var Elem=typeOfCmdParameters[iElem];
            
            var found=false;
            for (var  iElem2 in typeOfParameters)
            {
                var Elem2=typeOfParameters[iElem2];
                if (Elem.Type == Elem2.Type)
                {
                    found=true;
                    //alert("already found incrementing needed")
                    typeOfParameters[iElem2].needed= Math.max(Elem.needed,Elem2.needed);
                    break;
                }
            }
            if (!found)
            {
                
                var  Element =new NumberForTypePair();
                Element.Type=Elem.Type;
                Element.needed=Elem.needed;
                //alert("ALEDEBUG real push in typeOfParameters "+Elem.Type);
                typeOfParameters.push(Element);
            }
        }
        typeOfCmdParameters.length=0;
    }
    //string creation
    for (var  ie in typeOfParameters) 
    {
        var Elem=NTPcreate(typeOfParameters[ie]);
        var  whereToAdd;
        var NeededWhereToAdd;
        var  correctedType=getStandardNameForTypedVariable(Elem.Type);

        if (Elem.Type.includes("&") || Elem.Type.includes("*") )
        {
            whereToAdd=ptOparamInterface;
            NeededWhereToAdd=ptNeededOPar;
           // alert("adding out");
           // alert("before pushing "+ptNeededOPar);

        }
        else
        {
            whereToAdd=ptIparamInterface;
            NeededWhereToAdd=ptNeededIPar;
            //alert("adding in");
            //alert("before pushing "+ptNeededOPar);
        }
        NeededWhereToAdd.push(Elem);
        //alert("ptNeededO="+ptNeededOPar+"\nNeededWhere="+NeededWhereToAdd);
        //alert("ptNeededI="+ptNeededIPar+"\nNeededWhere="+NeededWhereToAdd);
        for (var i=0; i < Elem.needed;i++)
        {
            
            whereToAdd.push( Elem.Type+ " "+correctedType+(i+1) );
        }
    }
    return;

}



function CreateInterfaceHeader() {
    var writer;
    try
    {
        var currentCU=localStorage.getItem('controlUnit');
        if (currentCU==null)
            return "";
        var CU =CUcreate(JSON.parse(currentCU));
        var  ClassName="Chaos"+CU.Name+ "Interface";
        var relativeCommon=CU.OffsetFromCommon;
        var completefilename="driver/"+CU.OffsetFromDriver+CU.Name+"/core/"+ClassName+".h";
        writer=new FileWriter("",ClassName+".h");
        PrintHeaderFile(writer,ClassName+".h");
        writer.WriteLine("#ifndef __"+ClassName+"__");
        writer.WriteLine("#define __"+ClassName+"__");
        writer.WriteLine(DEFINES.INTDEFAULTINCLUDES);
        writer.WriteLine("#include <common/"+relativeCommon+CU.Name+"/core/Abstract"+CU.Name+".h>" );
        writer.WriteLine("namespace chaos_driver=::chaos::cu::driver_manager::driver;" );
        writer.WriteLine("namespace chaos {"); writer.addIndent();
        writer.WriteLine("namespace driver {"); writer.addIndent();
        writer.WriteLine("#define MAX_STR_SIZE 256");
        writer.WriteLine("namespace "+CU.getNameSpace()+" {" ); writer.addIndent();
        writer.WriteLine("typedef enum {" );writer.addIndent();
        var lastCmd = CU.Commands[CU.Commands.length - 1];

        for (var  iCmd in CU.Commands)
        {
            var cmd=CU.Commands[iCmd];
            if (cmd.Default)
                continue;
            writer.Write(getOpCode(cmd));
            if (cmd.Name != lastCmd.Name)
                writer.WriteLineNoInd(",");
            else
                writer.WriteLineNoInd("");
        }
        writer.delIndent();writer.WriteLine("} Chaos"+CU.Name+"Opcode;");
        if (ptIparamInterface.length>0)
        {
            writer.WriteLine("typedef struct {" ); writer.addIndent();
            for (var  Iparam in ptIparamInterface)
            {
                var param=ptIparamInterface[Iparam];
                
                var  tmp=param.replace('&',' ');
                 if (tmp.includes("string")|| tmp.startsWith("vector<"))
                    writer.WriteLine("std::" +tmp+";");
                else
                    writer.WriteLine(tmp+";" );
                //alert("orig param is "+param+ " while tmp "+tmp)
            }
            writer.delIndent();writer.WriteLine("} "+CU.getNameSpace() +"_iparams_t;");
        }
        if (ptOparamInterface.length>0)
        {
            writer.WriteLine("typedef struct {" ); writer.addIndent();
            for (var  p in ptOparamInterface)
            {
                var param=ptOparamInterface[p];
                var  tmp=param.replace('&',' ');
                tmp = tmp.replace('*', ' ');
                if (tmp.includes("string") || tmp.startsWith("vector<"))
                    writer.WriteLine("std::" +tmp+";");
                else
                    writer.WriteLine(tmp+";" );
                //alert("orig OUT param is "+param+ " while tmp "+tmp)
            }
            writer.delIndent();writer.WriteLine("} "+CU.getNameSpace() +"_oparams_t;");
        }
        //wrapper interface
        writer.WriteLine("//wrapper interface");
        writer.WriteLine("class "+ClassName +":public ::common::"+ CU.getNameSpace()+"::Abstract"+CU.Name+ " {"); writer.addIndent();
        writer.WriteLine("protected:" );
        writer.WriteLine("chaos_driver::DrvMsg message;");
        writer.WriteLine("public: " );
        writer.WriteLine(ClassName +"(chaos_driver::DriverAccessor*_accessor):accessor(_accessor){};" );
        writer.WriteLine("chaos_driver::DriverAccessor* accessor;" );
        for (var  icmd in CU.Commands)
        {
            var cmd=CMDcreate( CU.Commands[icmd] );
            if (cmd.Default)
                continue;
            writer.WriteLine(cmd.CreateFunctionPrototype()+";" );
        }
        writer.delIndent();writer.WriteLine("};");
        writer.delIndent();writer.WriteLine("}");
        writer.delIndent();writer.WriteLine("}//driver");
        writer.delIndent();writer.WriteLine("}//chaos");
        writer.WriteLine("namespace chaos_"+CU.getNameSpace()+"_dd = chaos::driver::"+CU.getNameSpace()+";" );
        writer.WriteLine("#endif");
    }
    catch(e) {alert("IntfEXC "+e);}
    var toRet=writer.getFileContent();
    var flName=writer.FileName;
    var rett=[flName,toRet,completefilename];
    return rett;
}

function CreateInterfaceSource() {
    var writer;
    try
    {
        var currentCU=localStorage.getItem('controlUnit');
        if (currentCU==null)
            return "";
        var CU =CUcreate(JSON.parse(currentCU));
        var  ClassName="Chaos"+CU.Name+ "Interface";
        writer=new FileWriter("",ClassName+".cpp");
        var completefilename="driver/"+CU.OffsetFromDriver+CU.Name+"/core/"+ClassName+".cpp";
        PrintHeaderFile(writer,ClassName+".cpp");
        writer.WriteLine("#include \""+ClassName+".h\"" );
        writer.WriteLine("using namespace chaos::driver::"+ CU.getNameSpace()+";" );
        CU.PrintStandardPrepareInterfaceMacro(writer);
        writer.WriteLine("#define WRITE_OP_TIM(op,timeout) \\");
        writer.WriteLine("PREPARE_OP_RET_INT_TIMEOUT(op,timeout); \\");
        writer.WriteLine("accessor->send(&message);\\");
        writer.WriteLine("return ret.result;\n");
        CU.PrintInterfaceMacros(writer);

       /* bool alreadygetFeatures=false;
        foreach (CUCommand  cmd in CU.ptDriverCommandList)
        {
            if (cmd.name=="getFeatures")
            {
                alreadygetFeatures=true;
                break;
            }
        }
        if (!alreadygetFeatures)
        {
            //writer.WriteLine( "uint64_t "+ClassName+"::getFeatures() {return 0;};" );
        /*CUCommand  newCommand= new(CUCommand);
        newCommand.name="getFeatures";
        newCommand.description="return the driver features";
        newCommand.isDefault=false;
        newCommand.isInterfaceCommand=false;
        CU.ptDriverCommandList.Add(newCommand);
        } */
        for (var  icmd in CU.Commands)
        {
            var cmd=CMDcreate(CU.Commands[icmd]);
            if (cmd.Default || (!cmd.isInterfaceCommand))//solo comandi di interfaccia
                continue;
            writer.WriteLine(cmd.CreateFunctionPrototype(ClassName) + " {");
            writer.addIndent();
            var  parString=getParamsTypeString(cmd);
            writer.Write("WRITE_OP");
            var  types=parString.split(' ');
            for (var i=0; i < types.length; i++)
            {
                if (types[i] != "")
                writer.WriteNoInd("_"+getParamTypeForMacro(types[i]));
            }
            writer.WriteNoInd("_TIM("+getOpCode(cmd) );
            for (var i=0; i < cmd.Parameters.length; i++)
            {
                var  par=cmd.Parameters[i];
                writer.WriteNoInd(","+par.Name);
            }
            writer.WriteLineNoInd(",0);");//instead of timeout put 0
            //+parString.ToUpper() );
            writer.delIndent();writer.WriteLine("} " );
        }
        //READ
        for (var  iCmd in CU.Commands)
        {
            var cmd=CMDcreate(CU.Commands[iCmd]);
            if (cmd.Default)
                continue;
            if (cmd.isInterfaceCommand)
                continue;
            writer.WriteLine(cmd.CreateFunctionPrototype(ClassName) + " {");
            writer.addIndent();
		    var parString=getParamsTypeString(cmd);
			writer.Write("READ_OP");
            var  types=parString.split(' ');
            for (var i=0; i < types.length; i++)
            {
                if (types[i] != "")
                {//trimming
                    var  tp=types[i].replace('&',"").replace('*',"");
                    tp=tp.replace('<', '_');
                    tp=tp.replace('>', '_');
                    writer.WriteNoInd("_"+tp.toUpperCase());
                }
            }
            writer.WriteNoInd("_TIM("+getOpCode(cmd));
            for ( i=0; i < cmd.Parameters.length; i++)
            {
                var  par=cmd.Parameters[i];

                writer.WriteNoInd(","+par.Name);
            }
            writer.WriteLineNoInd(",0);");
            writer.delIndent();
            writer.WriteLine("} " );
		}

    }
    catch(e) {alert("EXC "+e);}
    var toRet=writer.getFileContent();
    var flName=writer.FileName;
    var rett=[flName,toRet,completefilename];
    return rett;
}

function CreateAbstractCommandHeader(){
    var writer;
    var completefilename;
    try
    {
        var currentCU=localStorage.getItem('controlUnit');
        if (currentCU==null)
            return "";
        var CU =CUcreate(JSON.parse(currentCU));
        var ClassName="Abstract"+CU.Name+ "Command";
        var relative=CU.OffsetFromDriver;
        completefilename="driver/"+CU.OffsetFromDriver+CU.Name+"/core/"+ClassName+".h";
        writer=new FileWriter("",ClassName+".h");
        this.PrintHeaderFile(writer,ClassName+".h");
        writer.WriteLine("#ifndef __"+ClassName+"__");
        writer.WriteLine("#define __"+ClassName+"__");
        writer.WriteLine("#include \"" + CU.Name+"Constants.h\"" );
        writer.WriteLine("#include <driver/" +relative+CU.Name +"/core/Chaos"+CU.Name+"Interface.h>" );
        writer.WriteLine("#include <chaos/cu_toolkit/control_manager/slow_command/SlowCommand.h>\n" );
        writer.WriteLine("namespace c_data = chaos::common::data;" );
        writer.WriteLine("namespace ccc_slow_command = chaos::cu::control_manager::slow_command;" );
        writer.WriteLine("namespace driver {" ); writer.addIndent();
        writer.WriteLine("namespace "+CU.getNameSpace() + "{" ); writer.addIndent();
        writer.WriteLine("class "+ClassName + ": public ccc_slow_command::SlowCommand {" );
        writer.WriteLine("public:" ); writer.addIndent();
        writer.WriteLine(ClassName+"();" );
        writer.WriteLine("~"+ClassName+"();" );
        writer.delIndent(); writer.WriteLine("protected: " ); writer.addIndent();
        writer.WriteLine("//common members" );
        //!VANNO REALMENTE DICHIARATI NEL COMANDO ASTRATTO?
        //writer.WriteLine("char		*o_status;" );
        stdDat=new datasetVariable("status_id","");
        if (CU.HaveInDataSet(stdDat))
            {writer.WriteLine("int32_t	*o_status_id;" );}
        stdDat.Name="alarms";
        if (CU.HaveInDataSet(stdDat))
            {writer.WriteLine("uint64_t	*o_alarms;" );}
        writer.WriteLine("//reference of the chaos abstraction of driver" );
        writer.WriteLine("chaos::driver::" +CU.getNameSpace() +"::Chaos" +CU.Name +"Interface *"+CU.getAbstractDriver() +";" );
        writer.WriteLine("//implemented handler" );
        //! E QUESTO? A CHE SERVE?
        writer.WriteLine("uint8_t implementedHandler();" );
        writer.WriteLine("void ccHandler();" );
        writer.WriteLine("void setHandler(c_data::CDataWrapper *data);" );
        //!setWorkState serve ancora?
        writer.WriteLine("void setWorkState(bool working);" );
        writer.delIndent(); writer.WriteLine("};// "+ClassName );
		writer.delIndent(); writer.WriteLine("}// "+CU.getNameSpace() );
		writer.delIndent(); writer.WriteLine("}" );
		writer.WriteLine("#endif");
    }
    catch(e) {alert("EXC "+e);}
    var toRet=writer.getFileContent();
    var flName=writer.FileName;
    var rett=[flName,toRet,completefilename];
    return rett;
}

function CreateAbstractCommandSource() {
    var writer;
    var completefilename;
    try
    {
        var currentCU=localStorage.getItem('controlUnit');
        if (currentCU==null)
            return "";
        var CU =CUcreate(JSON.parse(currentCU));
        var ClassName="Abstract"+CU.Name+ "Command";
        var relative=CU.OffsetFromDriver;
        completefilename="driver/"+CU.OffsetFromDriver+CU.Name+"/core/"+ClassName+".cpp";
        writer=new FileWriter("",ClassName+".cpp");
        this.PrintHeaderFile(writer,ClassName+".cpp");
        writer.WriteLine("#include \""+ClassName+".h\"" );
        writer.WriteLine("#include <boost/format.hpp>" );
        writer.WriteLine("#define CMDCUINFO_ INFO_LOG(" +ClassName +")" );
        writer.WriteLine("#define CMDCUDBG_ DBG_LOG(" +ClassName +")" );
        writer.WriteLine("#define CMDCUERR_ ERR_LOG(" +ClassName +")" );
        writer.WriteLine("using namespace driver::"+CU.getNameSpace() +";" );
        writer.WriteLine("namespace chaos_batch = chaos::common::batch_command;" );
        writer.WriteLine("using namespace chaos::cu::control_manager;" );
        //costruttore
        writer.WriteLine(ClassName+"::"+ClassName+"() {" ); writer.addIndent();
        writer.WriteLine(CU.getAbstractDriver() + " = NULL;" );
        writer.delIndent();writer.WriteLine("}" );
        //distruttore
        writer.WriteLine(ClassName+"::~"+ClassName+"() {");  writer.addIndent();
        writer.WriteLine("if("+CU.getAbstractDriver() + ")" ); writer.addIndent();
        writer.WriteLine("delete(" +CU.getAbstractDriver() +");" );writer.delIndent();
        writer.WriteLine(CU.getAbstractDriver() + " = NULL;" );
        writer.delIndent();writer.WriteLine("}" );
        //set handler
		writer.WriteLine("void "+ClassName+"::setHandler(c_data::CDataWrapper *data) {" ); writer.addIndent();
        writer.WriteLine("CMDCUDBG_ << \"loading pointer for output channel\"; ");
         //default pointers TODO BETTER
        writer.WriteLine("//get pointer to the output dataset variable");
        stdDat=new datasetVariable("status_id","");
        if (CU.HaveInDataSet(stdDat))
        {
            writer.WriteLine("o_status_id = getAttributeCache()->getRWPtr<int32_t>(DOMAIN_OUTPUT, \"status_id\");");
        }
        stdDat.Name="alarms";
        if (CU.HaveInDataSet(stdDat))
        {
            writer.WriteLine("o_alarms = getAttributeCache()->getRWPtr<uint64_t>(DOMAIN_OUTPUT, \"alarms\"); ");
        }
        //default timeout for commands
        writer.WriteLine("//setting default timeout (usec) ");
        writer.WriteLine("const int32_t *userTimeout=getAttributeCache()->getROPtr<int32_t>(DOMAIN_INPUT,\"driver_timeout\");");
        writer.WriteLine("if (*userTimeout > 0)"); writer.addIndent();
        writer.WriteLine("setFeatures(chaos_batch::features::FeaturesFlagTypes::FF_SET_COMMAND_TIMEOUT,(uint32_t) (*userTimeout)*1000);")
        writer.delIndent();writer.WriteLine("else");writer.addIndent();
        writer.WriteLine("setFeatures(chaos_batch::features::FeaturesFlagTypes::FF_SET_COMMAND_TIMEOUT,(uint32_t) 10000000);");
        writer.delIndent();
        writer.WriteLine("chaos::cu::driver_manager::driver::DriverAccessor *"+CU.getAccessor()+" = driverAccessorsErogator->getAccessoInstanceByIndex(0);" );
        writer.WriteLine("if(" +CU.getAccessor()+ " != NULL) {" );writer.addIndent();
        writer.WriteLine("if(" +CU.getAbstractDriver()+ " == NULL) {" );writer.addIndent();
        writer.WriteLine(CU.getAbstractDriver()+ " = new chaos::driver::"+CU.getNameSpace()+"::Chaos"+CU.Name+"Interface("+CU.getAccessor()+");" );
        writer.delIndent();writer.WriteLine("}" );
        writer.delIndent();writer.WriteLine("}" );
        writer.delIndent();writer.WriteLine("}" );
        writer.WriteLine("// return the implemented handler" );
        writer.WriteLine("uint8_t "+ClassName+"::implementedHandler() {" );writer.addIndent();
        writer.WriteLine("return  chaos_batch::HandlerType::HT_Set | chaos_batch::HandlerType::HT_Correlation;");
        writer.delIndent();writer.WriteLine("}" );
        writer.WriteLine("void "+ClassName+"::ccHandler() {\n" );
        writer.WriteLine("}" );
        writer.WriteLine("void "+ClassName+"::setWorkState(bool working_flag) {" );writer.addIndent();
        writer.WriteLine("setBusyFlag(working_flag);");
        writer.delIndent();writer.WriteLine("}\n" );
    }
    catch(e) {alert("EXC "+e);}
    var toRet=writer.getFileContent();
    var flName=writer.FileName;
    var rett=[flName,toRet,completefilename];
    return rett;

}

function CreateConstantFile() {
    var writer;
    try
    {
        var currentCU=localStorage.getItem('controlUnit');
        if (currentCU==null)
            return "";
        var CU =CUcreate(JSON.parse(currentCU));
        var ClassName=CU.Name+ "Constants";
        var completefilename="driver/"+CU.OffsetFromDriver+CU.Name+"/core/"+ClassName+".h";
        writer=new FileWriter("",ClassName+".h");
        PrintHeaderFile(writer,ClassName+".h");
        writer.WriteLine("#ifndef "+CU.Name+"_"+ClassName+"_h");
        writer.WriteLine("#define "+CU.Name+"_"+ClassName+"_h");
        writer.WriteLine("namespace driver {"); writer.addIndent();
        writer.WriteLine("namespace "+CU.getNameSpace()+ " {" ); writer.addIndent();
        writer.WriteLine("#define TROW_ERROR(n,m,d) throw chaos::CException(n, m, d);" );
        writer.WriteLine("#define LOG_TAIL(n) \"[\" << #n << \"] - \" << getDeviceID() << \" - [\" << getUID() << \"] - \" ");
        for (var  icmd in CU.Commands) 
        {
            var cmd=CU.Commands[icmd];
            writer.WriteLine("const char* const "+getCommandAlias(CU.Prefix,cmd.Name)+" = \""+cmd.Name+"\";" );
            for (var  ipar in cmd.Parameters)
            {
                var par=CPARcreate(cmd.Parameters[ipar]);
                writer.WriteLine("const char* const "+ par.getParamAlias(CU.Prefix,cmd.Name) + " = \""+par.Name+"\";" );
            }
        }
        /*Non dovrebbe più essere necessario
        foreach (CUCommand  cmd in CU.ptCUCommandList) 
        {
            if (CU.ptDriverCommandList.Contains(cmd))
                continue;
            writer.WriteLine("const char* const "+cmd.getCommandAlias(CU.PrefixName)+" = \""+cmd.name+"\";" );
            foreach (CMDParameter  par in cmd.ptParameters)
            {
                writer.WriteLine("const char* const "+ par.getParamAlias(CU.PrefixName,cmd.name) + " = \""+par.name+"\";" );
            }
        }
        */
       writer.WriteLine("#define DEFAULT_COMMAND_TIMEOUT_MS   10000" );
       writer.delIndent(); writer.WriteLine("}" );
       writer.delIndent(); writer.WriteLine("}" );
       writer.WriteLine("#endif");
    }
    catch(e) {alert("EXC "+e);}
    var toRet=writer.getFileContent();
    var flName=writer.FileName;
    var rett=[flName,toRet,completefilename];
    return rett;
}

function CreateDeviceDriverHeader() {
    var writer;
    try
    {
        var currentCU=localStorage.getItem('controlUnit');
        if (currentCU==null)
            return "";
        var CU =CUcreate(JSON.parse(currentCU));
        var ClassName="Chaos"+CU.Name+ "DD";
        var  relativeCommon=CU.OffsetFromCommon;
        var completefilename="driver/"+CU.OffsetFromDriver+CU.Name+"/core/"+ClassName+".h";
        writer=new FileWriter("",ClassName+".h");
        PrintHeaderFile(writer,ClassName+".h");
        writer.WriteLine("#ifndef __driver_"+ClassName+"_h__" );
        writer.WriteLine("#define __driver_"+ClassName+"_h__" );
        writer.WriteLine("#include <chaos/cu_toolkit/driver_manager/driver/AbstractDriverPlugin.h>" );
        writer.WriteLine("#include <common/"+relativeCommon+CU.Name+"/core/Abstract"+CU.Name+".h>" );
        writer.WriteLine("DEFINE_CU_DRIVER_DEFINITION_PROTOTYPE("+ClassName+")" );
        writer.WriteLine("namespace cu_driver = chaos::cu::driver_manager::driver;" );
        writer.WriteLine("namespace chaos {" ); writer.addIndent();
        writer.WriteLine("namespace driver {" ); writer.addIndent();
        writer.WriteLine("namespace "+CU.getNameSpace() + " {" ); writer.addIndent();
        writer.WriteLine("    /*         driver definition            */ " );
        writer.WriteLine("class "+ClassName+": ADD_CU_DRIVER_PLUGIN_SUPERCLASS{" ); 
        writer.WriteLine("protected: ");writer.addIndent();
        writer.WriteLine("::common::"+CU.getNameSpace()+"::Abstract"+CU.Name+"* devicedriver;" );
        writer.delIndent();
        writer.WriteLine("public: ");writer.addIndent();
        writer.WriteLine(ClassName+"();" );
        writer.WriteLine("~"+ClassName+"();" );
        writer.WriteLine(" //! Execute a command");
        writer.WriteLine("cu_driver::MsgManagmentResultType::MsgManagmentResult execOpcode(cu_driver::DrvMsgPtr cmd);" );
        writer.WriteLine("void driverDeinit();" );
        writer.delIndent(); writer.WriteLine("}; //"+ClassName);
        writer.delIndent(); writer.WriteLine("} //"+CU.getNameSpace() );
        writer.delIndent(); writer.WriteLine("}" );
        writer.delIndent(); writer.WriteLine("}" );
        writer.WriteLine("#endif");
        
    }
    catch(e) {alert("EXC "+e);}
    var toRet=writer.getFileContent();
    var flName=writer.FileName;
    var rett=[flName,toRet,completefilename];
    return rett;
}
function CreateDeviceDriverSource() {
    var writer;
    try
    {
        var currentCU=localStorage.getItem('controlUnit');
        if (currentCU==null)
            return "";
        var CU =CUcreate(JSON.parse(currentCU));
        var ClassName="Chaos"+CU.Name+ "DD";
        var relative=CU.OffsetFromDriver;
        var completefilename="driver/"+CU.OffsetFromDriver+CU.Name+"/core/"+ClassName+".cpp";
        writer=new FileWriter("",ClassName+".cpp");
        PrintHeaderFile(writer,ClassName+".cpp");
        writer.WriteLine( "#include \""+ClassName+".h\"");
        writer.WriteLine( DEFINES.DD_DEFAULTINCLUDES );
        writer.WriteLine( "// including interface" );
        writer.WriteLine( "#include \"driver/"+relative+CU.Name+"/core/Chaos"+CU.Name+"Interface.h\"" );
        writer.WriteLine( "#define ACLAPP	LAPP_ << \"[Chaos"+CU.Name+"DD] \"" );
        writer.WriteLine( "#define ACDBG	LDBG_ << \"[Chaos"+CU.Name+"DD] \"" );
        writer.WriteLine( "#define ACERR	LERR_ << \"[Chaos"+CU.Name+"DD] \"" );
        writer.WriteLine( "using namespace chaos::driver::"+CU.getNameSpace()+";" );
        writer.WriteLine( "//default constructor definition" );
        writer.WriteLine( "DEFAULT_CU_DRIVER_PLUGIN_CONSTRUCTOR_WITH_NS(chaos::driver::"+CU.getNameSpace()+", "+ClassName+") {" );
        writer.addIndent();
        writer.WriteLine( "devicedriver = NULL;" );
        writer.delIndent(); writer.WriteLine( "}" );
        writer.WriteLine( ClassName +"::~"+ClassName+"() {" );
        writer.WriteLine( "}" );
        writer.WriteLine( "void "+ClassName+"::driverDeinit() {" ); writer.addIndent();
        writer.WriteLine( " if(devicedriver) {" ); writer.addIndent();
        writer.WriteLine( "delete devicedriver;");
        writer.delIndent(); writer.WriteLine( "}" );
        writer.WriteLine( "devicedriver = NULL;" );
        writer.delIndent(); writer.WriteLine( "}" );
        writer.WriteLine( "cu_driver::MsgManagmentResultType::MsgManagmentResult "+ClassName+"::execOpcode(cu_driver::DrvMsgPtr cmd){" );
        writer.addIndent();
        writer.WriteLine( " cu_driver::MsgManagmentResultType::MsgManagmentResult result = cu_driver::MsgManagmentResultType::MMR_EXECUTED;" );
        writer.WriteLine( CU.getNameSpace()+"_iparams_t *in = ("+CU.getNameSpace()+"_iparams_t *)cmd->inputData;" );
        writer.WriteLine( CU.getNameSpace()+"_oparams_t *out = ("+CU.getNameSpace()+"_oparams_t *)cmd->resultData;" );
        if (CU.Commands.length>0)
        {
            writer.WriteLine("switch(cmd->opcode){" );
            writer.addIndent();
        }
        for (var icmd in CU.Commands)
        {
            var cmd=CMDcreate(CU.Commands[icmd]);
            if (cmd.Default)
                continue;
            var counterType=0;
            writer.WriteLine("case "+getOpCode(cmd)+": {" ); writer.addIndent();
            //writer.WriteLine("ACDBG << \"Received "+getOpCode(cmd)+"\";");
            writer.Write("out->result=devicedriver->"+cmd.Name+"(");
            var first=true;
            var  lastParType="";
            for (var   ipar in cmd.Parameters)
            {
                var par=CPARcreate(cmd.Parameters[ipar]);
                if (lastParType != par.Type)
                    counterType=0;
                
               // if (par.Type=="int32_t")
                 //   alert(cmd.Name + "----" +par.Name);
                var needed=CU.getNumberOfNeededInterfaceVariable(par.Type,par.isOutput(),ptNeededOPar,ptNeededIPar);
                if (needed == 0)
                    alert("Warning. No variable of type "+par.Type,"Error");
                if (!first)
                    writer.WriteNoInd(",");
                else
                    first = false;
                if (par.isOutput())
                {
                    if (par.isPointer())
                        writer.WriteNoInd("&out->");
                    else
                        writer.WriteNoInd("out->");
                    writer.WriteNoInd(getInterfaceVariable(par.Type,true, counterType));
                }
                else
                {
                    writer.WriteNoInd("in->");
                    writer.WriteNoInd(getInterfaceVariable(par.Type,false,counterType));
                }
                if (needed > counterType+1)
					counterType++;
				else
				    counterType=0;
				lastParType=par.Type;
			}
            writer.WriteLineNoInd( ");");
            writer.WriteLine("ACDBG << \"Sent to driver command "+cmd.Name+" result is \" << out->result;");
    		writer.WriteLine("} break;" ); writer.delIndent();
        }
        writer.delIndent(); writer.WriteLine("}");
        writer.WriteLine("return result;");
        writer.delIndent(); writer.WriteLine("}");
    }
    catch(e) {alert("EXC "+e);}
    var toRet=writer.getFileContent();
    var flName=writer.FileName;
    var rett=[flName,toRet,completefilename];
    return rett;
}
function CreateCommandHeader(cmd) {
    var writer;
    try
    {
        var currentCU=localStorage.getItem('controlUnit');
        if (currentCU==null)
            return "";
        var CU =CUcreate(JSON.parse(currentCU));
        var ClassName="Cmd"+CU.Prefix+ cmd.Name ;
        var completefilename="driver/"+CU.OffsetFromDriver+CU.Name+"/core/"+ClassName+".h";
        writer=new FileWriter("",ClassName+".h");
        PrintHeaderFile(writer,ClassName+".h");
        writer.WriteLine("#ifndef __"+CU.Name+"__"+ClassName+"_h__" );
        writer.WriteLine("#define __"+CU.Name+"__"+ClassName+"_h__" );
        writer.WriteLine("#include \"Abstract"+CU.Name+"Command.h\"" );
        writer.WriteLine("#include <bitset>" );
        writer.WriteLine("namespace c_data = chaos::common::data;" );
        writer.WriteLine("namespace ccc_slow_command = chaos::cu::control_manager::slow_command;" );
        writer.WriteLine("namespace driver {"); writer.addIndent();
        writer.WriteLine("namespace "+CU.getNameSpace()+" {"); writer.addIndent();
        writer.WriteLine("DEFINE_BATCH_COMMAND_CLASS("+ClassName+",Abstract"+CU.Name+"Command) {");writer.addIndent();
        writer.WriteLine("//implemented handler");
        writer.PrintFunctionPrototype("uint8_t","implementedHandler","");
        writer.WriteLine("//initial set handler");
        writer.PrintFunctionPrototype("void","setHandler","c_data::CDataWrapper *data");
        writer.WriteLine("//custom acquire handler");
        writer.PrintFunctionPrototype("void","acquireHandler","");
        writer.WriteLine("//correlation and commit handler");
        writer.PrintFunctionPrototype("void","ccHandler","");
        writer.WriteLine("//manage the timeout ");
        writer.PrintFunctionPrototype("bool","timeoutHandler","");
        writer.delIndent(); writer.WriteLine("};" );
        writer.delIndent(); writer.WriteLine("}" );
        writer.delIndent(); writer.WriteLine("}" );
        writer.WriteLine("#endif" );
    }
    catch(e) {alert("EXC "+e);}
    var toRet=writer.getFileContent();
    var flName=writer.FileName;
    var rett=[flName,toRet,completefilename];
    return rett;
}
function CreateCommandSource(cmd) {
    var writer;
    try
    {
        var currentCU=localStorage.getItem('controlUnit');
        if (currentCU==null)
            return "";
        var CU =CUcreate(JSON.parse(currentCU));
        var ClassName="Cmd"+CU.Prefix+ cmd.Name ;
        var completefilename="driver/"+CU.OffsetFromDriver+CU.Name+"/core/"+ClassName+".cpp";
        writer=new FileWriter("",ClassName+".cpp");
        PrintHeaderFile(writer,ClassName+".cpp");
        writer.WriteLine("#include \""+ClassName+".h\"\n");
        writer.WriteLine(DEFINES.DEFAULTCMDINCLUDES);
        writer.WriteLine("#define SCLAPP_ INFO_LOG("+ClassName+") << \"[\" << getDeviceID() << \"] \"");
        writer.WriteLine("#define SCLDBG_ DBG_LOG("+ClassName+") << \"[\" << getDeviceID() << \"] \"");
        writer.WriteLine("#define SCLERR_ ERR_LOG("+ClassName+") << \"[\" << getDeviceID() << \"] \"");
        writer.WriteLine("namespace own = driver::"+CU.getNameSpace()+";");
        writer.WriteLine("namespace c_data =  chaos::common::data;");
        writer.WriteLine("namespace chaos_batch = chaos::common::batch_command;");
        writer.WriteLine("using namespace chaos::cu::control_manager;");
        
        if (!cmd.Default)
        writer.WriteLine("BATCH_COMMAND_OPEN_DESCRIPTION_ALIAS(driver::"+CU.getNameSpace()+"::,"+ClassName+","+getCommandAlias(CU.Prefix,cmd.Name)+",");//CMD_ACT_MOVE_RELATIVE_ALIAS,
        else
        writer.WriteLine("BATCH_COMMAND_OPEN_DESCRIPTION(driver::" + CU.getNameSpace() + "::," + ClassName   + ",");//DEFAULT NO ALIAS
        writer.addIndent(3);
        writer.WriteLine("\""+cmd.Description+"\",");
        writer.WriteLine("\""+guid()+"\")");
        writer.delIndent(3);
        for (var  iparam in cmd.Parameters)
        {
            var param=CPARcreate(cmd.Parameters[iparam]);
            var  parType;
            if (param.Type.includes("_t"))
                parType=param.Type.substring(0,param.Type.length-2);
            else
                parType=param.Type;
            writer.Write("BATCH_COMMAND_ADD_"+parType.toUpperCase()+"_PARAM("+param.getParamAlias(CU.Prefix,cmd.Name)+",\""+param.Description+"\",chaos::common::batch_command::BatchCommandAndParameterDescriptionkey::");
            if (param.Mandatory)
                writer.WriteLineNoInd("BC_PARAMETER_FLAG_MANDATORY)");
            else
            {
                alert("Not mandatory parameters still not implemented in CUGenerator.Will be set to mandatory","Warning");
                writer.WriteLineNoInd("BC_PARAMETER_FLAG_MANDATORY)");
            }
        }
        writer.WriteLine("BATCH_COMMAND_CLOSE_DESCRIPTION()\n\n");
        writer.WriteLine("// return the implemented handler");
        writer.WriteLine("uint8_t own::"+ClassName+"::implementedHandler(){"); writer.addIndent();
        writer.WriteLine("return      Abstract"+CU.Name+"Command::implementedHandler()|chaos_batch::HandlerType::HT_Acquisition;");
        writer.delIndent(); writer.WriteLine("}" );
        writer.WriteLine("// empty set handler");
        writer.WriteLine("void own::"+ClassName+"::setHandler(c_data::CDataWrapper *data) {");  writer.addIndent();
        writer.WriteLine("Abstract"+CU.Name+"Command::setHandler(data);");
        if (cmd.Default)
        {
            writer.WriteLine("clearFeatures(chaos_batch::features::FeaturesFlagTypes::FF_SET_COMMAND_TIMEOUT);");
            writer.WriteLine("setBusyFlag(false);");
        }
        writer.WriteLine("SCLAPP_ << \"Set Handler " + cmd.Name + " \"; ");
        AddInterfaceCall(writer,CU,cmd);
		writer.WriteLine( "BC_NORMAL_RUNNING_PROPERTY" );
        writer.delIndent(); writer.WriteLine("}");
        writer.WriteLine("// empty acquire handler");
        writer.WriteLine("void own::" + ClassName + "::acquireHandler() {"); writer.addIndent();
        if (!cmd.Default)
            writer.WriteLine("SCLDBG_ << \"Acquire Handler " + cmd.Name + " \"; ");
        else
        {
            if (checkBoxDebugLog.checked)
            {//TODO CHECK SE SI RIMUOVE VARIABILE DI DEFAULT
               // writer.WriteLine("SCLDBG_ << \"o_status: \" << o_status;");
               stdDat=new datasetVariable("status_id","");
                if (CU.HaveInDataSet(stdDat))
                {
                    writer.WriteLine("SCLDBG_ << \"o_status_id: \" << *o_status_id;");
                }
                stdDat.Name="alarms";
                if (CU.HaveInDataSet(stdDat))
                {
                    writer.WriteLine("SCLDBG_ << \"o_alarms: \" << *o_alarms;");
                }

            }
            writer.WriteLine("getAttributeCache()->setOutputDomainAsChanged();");
        }
        writer.delIndent();  writer.WriteLine("}");
        writer.WriteLine("// empty correlation handler");
        writer.WriteLine("void own::"+ClassName+"::ccHandler() {"); writer.addIndent();
        if (cmd.Default == false)
        writer.WriteLine("BC_END_RUNNING_PROPERTY;");
        writer.delIndent();  writer.WriteLine("}");
        writer.WriteLine("// empty timeout handler");
        writer.WriteLine("bool own::"+ClassName+"::timeoutHandler() {");writer.addIndent();
        writer.WriteLine("SCLDBG_ << \"Timeout Handler " + cmd.Name + " \"; ");
        writer.WriteLine("return false;");
        writer.delIndent();  writer.WriteLine("}");
    
        
    }
    catch(e) {alert("EXC "+e);}
    var toRet=writer.getFileContent();
    var flName=writer.FileName;
    var rett=[flName,toRet,completefilename];
    return rett;
}

function CreateCMakeLists() {
    var  writer;
    try
    {
        var currentCU=localStorage.getItem('controlUnit');
        if (currentCU==null)
            return "";
        var CU =CUcreate(JSON.parse(currentCU));
        var relative=CU.OffsetFromDriver;
        var num= relative.split('/').length -1;
        var  backDirs="../";
		for (var i =0; i < num;i++)
            backDirs+="../";
        var completefilename="driver/"+CU.OffsetFromDriver+CU.Name+"/CMakeLists.txt";
        writer=new FileWriter("","CMakeLists.txt");
        writer.WriteLine("cmake_minimum_required(VERSION 2.8)" );
        writer.WriteLine("project(chaos_driver_"+CU.getNameSpace()+")" );
        writer.WriteLine("find_package(chaos MODULE REQUIRED)" );
        writer.WriteLine("include_directories("+backDirs+" ${chaos_INCLUDE_DIRS})" );
    
     
        writer.WriteLine("FILE(GLOB core_src core/*.cpp)" );
        writer.WriteLine("SET(DRIVERS_LIB )" );
        if (checkboxGenerateDriver.checked==true)
            writer.WriteLine("add_subdirectory(models)");
        writer.WriteLine("MESSAGE(STATUS \"Libraries ${DRIVERS_LIB}\")" );
        writer.WriteLine("IF(BUILD_FORCE_STATIC)" );
        writer.WriteLine("ADD_LIBRARY(${PROJECT_NAME} STATIC ${core_src})" );
        
        writer.WriteLine("ELSE()" );
        writer.WriteLine("ADD_LIBRARY(${PROJECT_NAME}  SHARED ${core_src})" );
        writer.WriteLine("ENDIF()" );
        writer.WriteLine("TARGET_LINK_LIBRARIES(${PROJECT_NAME} chaos_cutoolkit chaos_common common_debug  chaos_cutoolkit ${FrameworkLib})" );
        writer.WriteLine("FILE(GLOB files \"core/*.h\")" );
        writer.WriteLine("INSTALL(FILES ${files} DESTINATION include/driver/"+relative+CU.Name+"/core)" );
        
        writer.WriteLine("INSTALL(TARGETS ${PROJECT_NAME}");
        writer.WriteLine("\tDESTINATION \"lib\"");
        writer.WriteLine("PERMISSIONS OWNER_WRITE OWNER_READ GROUP_READ WORLD_READ)");
	}
    catch(e) {alert("EXC "+e);}
    var toRet=writer.getFileContent();
    var flName=writer.FileName;
    var rett=[flName,toRet,completefilename];
    return rett;
}

function CreateDriverConnectionHeader(){
    var wr;
    try
    {
        var currentCU=localStorage.getItem('controlUnit');
        if (currentCU==null)
            return "";
        var CU =CUcreate(JSON.parse(currentCU));
        var ClassName=CU.DriverName+"DD";
        var relative = CU.OffsetFromDriver;
        var completefilename="driver/"+CU.OffsetFromDriver+CU.Name+"/models/"+CU.DriverName+"/"+ClassName+".h";
        wr=new FileWriter("",ClassName+".h");
        PrintHeaderFile(wr,ClassName+".h");
        wr.WriteLine("#ifndef __driver_" + ClassName + "_h__");
        wr.WriteLine("#define __driver_" + ClassName + "_h__");
        wr.WriteLine("#ifndef DRLAPP");
        wr.WriteLine("#define DRLAPP LAPP_ << \"["+ClassName+"]\"" );
        wr.WriteLine("#endif" );
        wr.WriteLine("#include <chaos/cu_toolkit/driver_manager/driver/AbstractDriverPlugin.h>");
        wr.WriteLine("#include <driver/"+relative+CU.Name+"/core/Chaos"+CU.Name+"DD.h>");
        wr.WriteLine("DEFINE_CU_DRIVER_DEFINITION_PROTOTYPE(" + ClassName + ")");
        wr.WriteLine("namespace cu_driver = chaos::cu::driver_manager::driver;");
        wr.WriteLine("namespace chaos {"); wr.addIndent();
        wr.WriteLine("namespace driver {");wr.addIndent();
        wr.WriteLine("namespace "+ CU.getNameSpace()+ "{");wr.addIndent();
        wr.WriteLine("class " + ClassName + ": public Chaos" + CU.Name + "DD{"); wr.addIndent();
        wr.WriteLine("void driverInit(const char *initParameter);");
        wr.WriteLine("void driverInit(const chaos::common::data::CDataWrapper& json);");
        wr.delIndent(); wr.WriteLine("public:");wr.addIndent();
        wr.WriteLine(ClassName + "();");
        wr.WriteLine("~"+ ClassName + "();");
        wr.delIndent(); wr.WriteLine("};//end class");
        wr.delIndent(); wr.WriteLine("} //namespace " + CU.getNameSpace());
        wr.delIndent(); wr.WriteLine("} //namespace driver");
        wr.delIndent(); wr.WriteLine("} //namespace chaos");
        wr.WriteLine("#endif");

    }
    catch(e) {alert("EXC "+e);}
    var toRet=wr.getFileContent();
    var flName=wr.FileName;
    var rett=[flName,toRet,completefilename];
    return rett;
}
function CreateDriverConnectionSource() {
    var wr;
    try
    {
        var currentCU=localStorage.getItem('controlUnit');
        if (currentCU==null)
            return "";
        var CU =CUcreate(JSON.parse(currentCU));
        var ClassName=CU.DriverName+"DD";
        var relative = CU.OffsetFromDriver;
        var relativeCommon=CU.OffsetFromCommon;
        var completefilename="driver/"+CU.OffsetFromDriver+CU.Name+"/models/"+CU.DriverName+"/"+ClassName+".cpp";
        wr=new FileWriter("",ClassName+".cpp");
        PrintHeaderFile(wr,ClassName+".cpp");
        wr.WriteLine("#include \"" + ClassName + ".h\"");
        wr.WriteLine("#include \"driver/"+ relative+CU.Name+"/core/Chaos"+CU.Name+"Interface.h\"");
        wr.WriteLine("#include <common/" + relativeCommon + CU.Name + "/models/" + CU.DriverName + "/" + CU.DriverName + ".h>");
        wr.WriteLine("#include <common/misc/driver/ConfigDriverMacro.h>");
        wr.WriteLine("OPEN_CU_DRIVER_PLUGIN_CLASS_DEFINITION(" + ClassName + ",1.0.0, chaos::driver::" + CU.getNameSpace() + "::" + ClassName + ")");
        wr.WriteLine("REGISTER_CU_DRIVER_PLUGIN_CLASS_INIT_ATTRIBUTE(chaos::driver::" + CU.getNameSpace() + "::" + ClassName + ", http_address/dnsname:port)");
        wr.WriteLine("CLOSE_CU_DRIVER_PLUGIN_CLASS_DEFINITION");
        wr.WriteLine("OPEN_REGISTER_PLUGIN");
        var completeClassName="chaos::driver::" + CU.getNameSpace() + "::" + ClassName;
        wr.WriteLine("REGISTER_PLUGIN(" +completeClassName+ ")");
        wr.WriteLine("CLOSE_REGISTER_PLUGIN");
        wr.WriteLine(completeClassName + "::" + ClassName + "() {"); wr.addIndent();
        wr.WriteLine("devicedriver = NULL;");
        wr.delIndent(); wr.WriteLine("}");
        wr.WriteLine(completeClassName + "::~" + ClassName + "() {"); wr.addIndent();
        wr.delIndent(); wr.WriteLine("}");
        wr.WriteLine("#ifdef CHAOS");
        wr.WriteLine("void "+ completeClassName + "::driverInit(const chaos::common::data::CDataWrapper& json) {"); wr.addIndent();
        wr.WriteLine( "DRLAPP<< \"Initializing " + ClassName + " HL Driver with CDataWrapper \"<<std::endl;");
        wr.WriteLine( "if (devicedriver) {"); wr.addIndent();
        wr.WriteLine( "throw chaos::CException(1,\"Already Initialized \",\"" + ClassName + "::driverInit\");");
        wr.delIndent(); wr.WriteLine("}");
        wr.WriteLine( "devicedriver= new ::common::" + CU.getNameSpace() + "::models::" + CU.DriverName + "(json);");
        wr.WriteLine( "if (devicedriver==NULL)");
        wr.WriteLine( "{"); wr.addIndent();
        wr.WriteLine( "throw chaos::CException(1,\"Cannot allocate resources for " + CU.DriverName + "\",\"" + ClassName + "::driverInit\");");
        wr.delIndent(); wr.WriteLine("}");
        wr.delIndent(); wr.WriteLine("}");
        wr.WriteLine( "#endif");
        wr.WriteLine( "void " + completeClassName + "::driverInit(const char* initParameter) {"); wr.addIndent();
        wr.WriteLine( "DRLAPP<< \"Initializing " + ClassName + " HL Driver with string \"<< initParameter <<std::endl;");
        wr.WriteLine( "if (devicedriver) {"); wr.addIndent();
        wr.WriteLine( "throw chaos::CException(1,\"Already Initialized \",\"" + ClassName + "::driverInit\");");
        wr.delIndent(); wr.WriteLine("}");
        wr.WriteLine( "devicedriver= new ::common::" + CU.getNameSpace() + "::models::" + CU.DriverName + "(initParameter);");
        wr.WriteLine( "if (devicedriver==NULL)");
        wr.WriteLine( "{"); wr.addIndent();
        wr.WriteLine( "throw chaos::CException(1,\"Cannot allocate resources for " + CU.DriverName + "\",\"" + ClassName + "::driverInit\");");
        wr.delIndent(); wr.WriteLine("}");
        wr.delIndent(); wr.WriteLine("}");
    }
    catch(e) {alert("EXC "+e);}
    var toRet=wr.getFileContent();
    var flName=wr.FileName;
    var rett=[flName,toRet,completefilename];
    return rett;
}

function CreateDriverConnectionMakelist(){
    var wr;
    try
    {
        var currentCU=localStorage.getItem('controlUnit');
        if (currentCU==null)
            return "";
        var CU =CUcreate(JSON.parse(currentCU));
        var relative = CU.OffsetFromDriver;
        var completefilename="driver/"+CU.OffsetFromDriver+CU.Name+"/models/"+CU.DriverName+"/CMakeLists.txt";
        wr=new FileWriter("","CMakeLists.txt");

        wr.WriteLine("cmake_minimum_required(VERSION 2.8)");
        wr.WriteLine( "project(chaos_driver_" +CU.getNameSpace()+"_"+ CU.DriverName + ")");
        wr.WriteLine( "FILE(GLOB src *.cpp)");
        wr.WriteLine( "ADD_LIBRARY(${PROJECT_NAME} ${src})");
        wr.WriteLine( "TARGET_LINK_LIBRARIES(${PROJECT_NAME} common_" + CU.getNameSpace() + "_" + CU.DriverName + ")");
        wr.WriteLine( "SET (DRIVERS_LIB ${DRIVERS_LIB} ${PROJECT_NAME} PARENT_SCOPE)");
        wr.WriteLine( "FILE(GLOB src *.h)");
        wr.WriteLine( "FILE(GLOB files \"*.h\")");
        wr.WriteLine( "INSTALL(FILES ${files} DESTINATION include/driver/" + relative + CU.getNameSpace() + "/models/" + CU.DriverName + "/)");
        wr.WriteLine( "INSTALL_TARGETS(/lib ${PROJECT_NAME})");
    }
    catch(e) {alert("EXC "+e);}
    var toRet=wr.getFileContent();
    var flName=wr.FileName;
    var rett=[flName,toRet,completefilename];
    return rett;
}

function CreateIntermediateMakeList(subToAdd,driverOrCommon) {
    var wr;
    var completefilename="";
    try
    {
        var currentCU=localStorage.getItem('controlUnit');
        if (currentCU==null)
            return "";
        var CU =CUcreate(JSON.parse(currentCU));

        
        if (driverOrCommon=="DRV")
        {
            completefilename="driver/"+CU.OffsetFromDriver+CU.Name+"/models/CMakeLists.txt";
        }
        else
        {
            completefilename="common/"+CU.OffsetFromCommon+CU.Name+"/models/CMakeLists.txt";
        }
        wr=new FileWriter("","CMakeLists.txt");
        wr.WriteLine("cmake_minimum_required(VERSION 2.6)");
        wr.WriteLine("add_subdirectory(" + subToAdd + ")");
        wr.WriteLine("SET(DRIVERS_LIB ${DRIVERS_LIB} PARENT_SCOPE)");
    }
    catch(e) {alert("EXC "+e);}
    var toRet=wr.getFileContent();
    var flName=wr.FileName;
    var rett=[flName,toRet,completefilename];
    return rett;

}

function createCommonDirCMakeList() {
    var wr;
    var completefilename;
    try
    {
        var currentCU=localStorage.getItem('controlUnit');
        if (currentCU==null)
            return "";
        var CU =CUcreate(JSON.parse(currentCU));
        completefilename="common/"+CU.OffsetFromCommon+CU.Name+"/CMakeLists.txt";
        wr=new FileWriter("","CMakeLists.txt");
        wr.WriteLine( "cmake_minimum_required(VERSION 2.8)");
        wr.WriteLine("project(common_" + CU.getNameSpace() + ")");
        wr.WriteLine( "find_package(Boost MODULE REQUIRED REQUIRED COMPONENTS program_options system)");
        wr.WriteLine("FILE(GLOB core_src core/*.h)");
        wr.WriteLine("INSTALL(FILES ${core_src} DESTINATION include/common/" + CU.Name + "/core)");
        wr.WriteLine( "add_subdirectory(models)");
    }
    catch(e) {alert("EXC "+e);}
    var toRet=wr.getFileContent();
    var flName=wr.FileName;
    var rett=[flName,toRet,completefilename];
    return rett;
}

function createCommonDRVCMakeList() {
    var wr;
    var completefilename;
    try
    {
        var currentCU=localStorage.getItem('controlUnit');
        if (currentCU==null)
            return "";
        var CU =CUcreate(JSON.parse(currentCU));
        var ClassName= CU.DriverName;
        var relative=CU.OffsetFromCommon;
        completefilename="common/"+CU.OffsetFromCommon+CU.Name+"/models/"+CU.DriverName+"/CMakeLists.txt";
        wr=new FileWriter("","CMakeLists.txt");
        wr.WriteLine( "cmake_minimum_required(VERSION 2.8)");
        wr.WriteLine( "project(common_" + CU.getNameSpace() + "_" + ClassName + ")");
        wr.WriteLine( "find_package(chaos)");
        wr.WriteLine( "ADD_DEFINITIONS(-DDEBUG -fpermissive)");
        wr.WriteLine( "FILE(GLOB src *.cpp)");
        wr.WriteLine( "ADD_LIBRARY(${PROJECT_NAME} STATIC ${src} )");
        wr.WriteLine( "TARGET_LINK_LIBRARIES(${PROJECT_NAME} common_debug chaos_common )");
        wr.WriteLine( "FILE(GLOB model_src *.h)");
        wr.WriteLine( "INSTALL(FILES ${model_src} DESTINATION include/common/" +relative+ CU.Name + "/models/" + CU.DriverName + ")");
        wr.WriteLine( "INSTALL_TARGETS(/lib ${PROJECT_NAME})");
    }
    catch(e) {alert("EXC "+e);}
    var toRet=wr.getFileContent();
    var flName=wr.FileName;
    var rett=[flName,toRet,completefilename];
    return rett;
}

function CreateCommonDriverHeader() {
    var wr;
    var completefilename;
    try
    {
        var currentCU=localStorage.getItem('controlUnit');
        if (currentCU==null)
            return "";
        var CU =CUcreate(JSON.parse(currentCU));
        var ClassName=CU.DriverName;
        var relative = CU.OffsetFromCommon;
        completefilename="common/"+CU.OffsetFromCommon+CU.Name+"/models/"+CU.DriverName+"/"+ClassName+".h";
        wr=new FileWriter("",ClassName+".h");
        PrintHeaderFile(wr,ClassName+".h");
        wr.WriteLine( "#ifndef __"+CU.Name+"__" + ClassName + "__");
        wr.WriteLine( "#define __" + CU.Name + "__" + ClassName + "__");
        wr.WriteLine( "#include <common/"+relative+CU.Name+"/core/Abstract"+CU.Name+".h>");
        //others include?
        wr.WriteLine("#ifdef CHAOS" );
        wr.WriteLine( "#include <chaos/common/data/CDataWrapper.h>");
        wr.WriteLine("#endif" );
        wr.WriteLine("namespace common {" ); wr.addIndent();
        wr.WriteLine("namespace "+CU.getNameSpace() +" {" );  wr.addIndent();
        wr.WriteLine( "namespace models {");  wr.addIndent();
        wr.WriteLine("class "+CU.DriverName+": public Abstract"+CU.Name+" {");  wr.addIndent();
        wr.WriteLine("public:" );
        wr.WriteLine(CU.DriverName+"(const std::string Parameters);" );
        wr.WriteLine("#ifdef CHAOS" );
        wr.WriteLine(CU.DriverName+"(const chaos::common::data::CDataWrapper& config);");
        wr.WriteLine("#endif" );
        wr.WriteLine("~"+CU.DriverName+"();" );
        for (var icmd in CU.Commands)
        {
            var cmd=CMDcreate(CU.Commands[icmd]);
            if (cmd.Default)
            {
                continue;
            }
            wr.WriteLine(cmd.CreateFunctionPrototype()+";");
        }
        wr.delIndent();wr.WriteLine("};//end class" );
        wr.delIndent(); wr.WriteLine( "}//end namespace models");
        wr.delIndent();wr.WriteLine("}//end namespace "+CU.getNameSpace() );
        wr.delIndent();wr.WriteLine("}//end namespace common" );

        wr.WriteLine( "#endif //__" + CU.Name + "__" + ClassName + "__");


    }
    catch(e) {alert("EXC "+e);}
    var toRet=wr.getFileContent();
    var flName=wr.FileName;
    var rett=[flName,toRet,completefilename];
    return rett;

}

function CreateCommonDriverSource() {
    var wr;
    var completefilename;
    try
    {
        var currentCU=localStorage.getItem('controlUnit');
        if (currentCU==null)
            return "";
        var CU =CUcreate(JSON.parse(currentCU));
        var ClassName=CU.DriverName;
        var relative = CU.OffsetFromCommon;
        completefilename="common/"+CU.OffsetFromCommon+CU.Name+"/models/"+CU.DriverName+"/"+ClassName+".cpp";
        wr=new FileWriter("",ClassName+".cpp");
        PrintHeaderFile(wr,ClassName+".cpp");
        wr.WriteLine( "#include <common/debug/core/debug.h>");
        wr.WriteLine( "#ifdef CHAOS");
        wr.WriteLine( "#include <chaos/common/data/CDataWrapper.h>");
        wr.WriteLine( "#endif");
        wr.WriteLine( "#include \"" + CU.DriverName+".h\"");
        wr.WriteLine( "using namespace common::" + CU.getNameSpace() + ";");
        wr.WriteLine( "using namespace common::" + CU.getNameSpace() + "::models;");
        //outside !CHAOS constructor with string
        wr.WriteLine( CU.DriverName + "::" + CU.DriverName + "(const std::string Parameters) {"); wr.addIndent();
        wr.delIndent(); wr.WriteLine( "}");
        wr.WriteLine("#ifdef CHAOS");
        //chaos constructor with CDataWrapper
        wr.WriteLine( CU.DriverName + "::" + CU.DriverName + "(const chaos::common::data::CDataWrapper &config) { "); wr.addIndent();
        wr.delIndent(); wr.WriteLine( "}");
        wr.WriteLine("#endif");
        // empty destructor
        wr.WriteLine( CU.DriverName + "::~" + CU.DriverName + "() {"); wr.addIndent();
        wr.delIndent(); wr.WriteLine( "}");
        for(var  icmd in CU.Commands)
        {
            var cmd=CMDcreate(CU.Commands[icmd]);
            if (cmd.Default)
            {
                continue;
            }
            wr.WriteLine( cmd.CreateFunctionPrototype(CU.DriverName) + " {");  wr.addIndent();
            wr.WriteLine( "return 0;");
            wr.delIndent(); wr.WriteLine( "}");

        }
    }
    catch(e) {alert("EXC "+e);}
    var toRet=wr.getFileContent();
    var flName=wr.FileName;
    var rett=[flName,toRet,completefilename];
    return rett;

}

function AddInstallScript(){
    var wr;

    var completefilename="";
    
    var rootPath=rootChaosPath.value;
    if (!rootPath.endsWith('/') )
    {
        alert("Error: invalid remote !Chaos path. Cannot create script");
        return;
    }
    else
    {
        localStorage.setItem("lastRootPath",rootPath);
    }
    try
    {
        var currentCU=localStorage.getItem('controlUnit');
        if (currentCU==null)
            return ;
        var CU =CUcreate(JSON.parse(currentCU));
        var driverfolder=rootPath+"driver/"+CU.OffsetFromDriver+CU.Name+"/";
        var commonfolder=rootPath+"common/"+CU.OffsetFromCommon+CU.Name+"/";
        wr=new FileWriter("","installControlUnit.sh");
        var inputs=checkedListBox.getElementsByTagName("input");
        wr.WriteLine("#!/bin/sh");
        wr.WriteLine("printf \"Creating folders\n\" ");
        
        wr.WriteLine("mkdir -p "+driverfolder);
        wr.WriteLine("mkdir -p "+driverfolder+"core/");
        if (checkboxGenerateDriver.checked)
        {
            wr.WriteLine("mkdir -p "+driverfolder+"models/");
            wr.WriteLine("mkdir -p "+driverfolder+"models/"+CU.DriverName+"/");
        }
        wr.WriteLine("mkdir -p "+commonfolder);
        wr.WriteLine("mkdir -p "+commonfolder+"core/");
        if (checkboxGenerateDriver.checked)
        {
            wr.WriteLine("mkdir -p "+commonfolder+"models/");
            wr.WriteLine("mkdir -p "+commonfolder+"models/"+CU.DriverName+"/");
        }
        //wr.WriteLine("errs=0");
        for (var i=0; i < inputs.length;i++)
        {
            if (inputs[i].checked==true)
            {
                var localPlace="";
                var relativePlace= inputs[i].value;
                var fileName=relativePlace.substring(relativePlace.lastIndexOf('/')+1);
                if ((relativePlace.startsWith("driver")) && (relativePlace.includes(CU.Name+"/core/")))
                {
                    localPlace="core/"+fileName;
                }
                else if ((relativePlace.startsWith("common")) && (relativePlace.includes(CU.Name+"/core/")))
                {
                    localPlace="common/core/"+fileName;
                }
                else if ((relativePlace.startsWith("driver")) && (relativePlace.includes("/models/"+CU.DriverName+"/"))   )
                {
                    localPlace="models/"+CU.DriverName+"/"+fileName;
                }
                else if ((relativePlace.startsWith("driver")) && (relativePlace.endsWith(CU.Name+"/CMakeLists.txt")) )
                {
                    localPlace=fileName;
                }
                else if ((relativePlace.startsWith("common")) && (relativePlace.includes("/models/"+CU.DriverName+"/")))
                {
                    localPlace="common/models/"+CU.DriverName+"/"+fileName;
                }
                else if ((relativePlace.startsWith("driver")) && (relativePlace.endsWith("models/CMakeLists.txt")) )
                {
                    localPlace="models/"+fileName;
                }
                else if ((relativePlace.startsWith("common")) && (relativePlace.endsWith("models/CMakeLists.txt")) )
                {
                    localPlace="common/models/"+fileName;
                }
                else if ((relativePlace.startsWith("common")) && (relativePlace.endsWith(CU.Name+"/CMakeLists.txt")) )
                {
                    localPlace="common/"+fileName;
                }

                if (localPlace=="")
                {
                    alert("file "+ relativePlace+" don't know where to put");
                }
                else
                {
                    wr.WriteLine("printf \"cp "+localPlace +" "+rootPath+relativePlace+"\n\"");
                    wr.WriteLine("cp "+localPlace+ " \t"+rootPath+relativePlace);
                    //wr.WriteLine("errs+=EXIT_STATUS")
                }

            }
        }
        if (zip != null)
        {
            zip.file("installCU.sh",wr.getFileContent());
            zip.generateAsync({type:"blob"}).then(function(content){
                try{
                    var zipname=retrieveFromJson("Name");
                    if (zipname!=null)
                     zipname+=".zip";
                    else return;
                 objectURL = URL.createObjectURL(content);
                 document.getElementById("lnkDownload").href = objectURL;
                 document.getElementById("lnkDownload").download=zipname;
                 document.getElementById("lnkDownload").hidden=false;
                 alert("Script successfully added to download");
                }
                catch(e) {alert("ZIPEXC "+e);}
            });
        }
        else
        {
            alert("nowhere to add");
        }
    }
    catch(e) {alert("EXC "+e);}
    var toRet=wr.getFileContent();
    //alert(toRet);
    var flName=wr.FileName;
    var rett=[flName,toRet,completefilename];
    
    return rett;
}

function GenerateCUCode() {
   ptNeededIPar.length=0;
   ptNeededOPar.length=0;
   zip= new JSZip();
   var driver=zip.folder("core");
   var common=zip.folder("common");
   var commonCore=common.folder("core");
   var ccTest=localStorage.getItem('controlUnit');
   if (ccTest==null)
   {
       alert("Cannot generate! Control Unit doesn't exist");
       throw "Cannot generate! Control Unit doesn't exist";
   }
   checkedListBox.innerHTML="";
   ShowFieldSets();
   AddDefaultsOnCU();
   CalculateInterfaceParamStruct();
   var SCCUFileh= GenerateSCCUHeader();
   driver.file(SCCUFileh[0],SCCUFileh[1]);
   AddCheckBox(SCCUFileh[2]);
  
   
   //alert (SCCUFileh[0]+"\n\n"+SCCUFileh[1]);
   var SCCUFileCPP= GenerateSCCUSource();
   driver.file(SCCUFileCPP[0],SCCUFileCPP[1]);
   AddCheckBox(SCCUFileCPP[2]); 
   //alert (SCCUFileCPP[0]+"\n\n"+SCCUFileCPP[1]);
   var AbstractClassH = CreateAbstractClassHeader();
   commonCore.file(AbstractClassH[0],AbstractClassH[1]);
   AddCheckBox(AbstractClassH[2]); 
  //alert (AbstractClassH[0]+"\n\n"+AbstractClassH[1]);
   var InterfaceH = CreateInterfaceHeader();
   driver.file(InterfaceH[0],InterfaceH[1]);
   AddCheckBox(InterfaceH[2]); 
   //alert (InterfaceH[0]+"\n\n"+InterfaceH[1]);
   var InterfaceCPP = CreateInterfaceSource();
   driver.file(InterfaceCPP[0],InterfaceCPP[1]);
   AddCheckBox(InterfaceCPP[2]); 
   //alert (InterfaceCPP[0]+"\n\n"+InterfaceCPP[1]);
   var AbstractCmdH =CreateAbstractCommandHeader();
   driver.file(AbstractCmdH[0],AbstractCmdH[1]);
   AddCheckBox(AbstractCmdH[2]); 
   //alert (AbstractCmdH[0]+"\n\n"+AbstractCmdH[1]);
   var AbstractCmdCPP =CreateAbstractCommandSource();
   driver.file(AbstractCmdCPP[0],AbstractCmdCPP[1]);
   AddCheckBox(AbstractCmdCPP[2]); 
   //alert (AbstractCmdCPP[0]+"\n\n"+AbstractCmdCPP[1]);
   var ConstantH=CreateConstantFile();
   driver.file(ConstantH[0],ConstantH[1]);
   AddCheckBox(ConstantH[2]); 
   //alert (ConstantH[0]+"\n\n"+ConstantH[1]);
   var ChaosDDH=CreateDeviceDriverHeader();
   driver.file(ChaosDDH[0],ChaosDDH[1]);
   AddCheckBox(ChaosDDH[2]); 
   //alert (ChaosDDH[0]+"\n\n"+ChaosDDH[1]);
   var ChaosDDCPP=CreateDeviceDriverSource();
   //alert (ChaosDDCPP[0]+"\n\n"+ChaosDDCPP[1]);
   driver.file(ChaosDDCPP[0],ChaosDDCPP[1]);
   AddCheckBox(ChaosDDCPP[2]); 

   var coms=retrieveFromJson("Commands");
   if (coms!= null)
   {
       for (var icmd in coms)
       {
           var theCmd=CMDcreate(coms[icmd]);
           if (theCmd.isInterfaceCommand)
           {
                var cmdH=CreateCommandHeader(theCmd);
                //alert(cmdH[0]+"\n\n"+cmdH[1]);
                driver.file(cmdH[0],cmdH[1]);
                AddCheckBox(cmdH[2]);
                var cmdCPP=CreateCommandSource(theCmd);
                //alert(cmdCPP[0]+"\n\n"+cmdCPP[1]);
                driver.file(cmdCPP[0],cmdCPP[1]);
                AddCheckBox(cmdCPP[2]);
           }
       }
    }
    var DRVMAKELIST=CreateCMakeLists();
    //alert(DRVMAKELIST[0]+"\n\n"+DRVMAKELIST[1]);
    zip.file(DRVMAKELIST[0],DRVMAKELIST[1]);
    AddCheckBox(DRVMAKELIST[2]);
    if (checkboxGenerateDriver.checked)
    {
        
        var drvModels=zip.folder("models");
        var drvName=retrieveFromJson("DriverName");
        var drvModel = drvModels.folder(drvName);
       
        //driver connection on driver/offset/CUName/models/ModelsName/
        var drvConnectionH=CreateDriverConnectionHeader();
        //alert(drvConnectionH[0]+"\n\n"+drvConnectionH[1]);
        drvModel.file(drvConnectionH[0],drvConnectionH[1]);
        AddCheckBox(drvConnectionH[2]);
        var drvConnectionCPP=CreateDriverConnectionSource();
        //alert(drvConnectionCPP[0]+"\n\n"+drvConnectionCPP[1]);
        drvModel.file(drvConnectionCPP[0],drvConnectionCPP[1]);
        AddCheckBox(drvConnectionCPP[2]);
        var drvConnMakeList=CreateDriverConnectionMakelist();
        //alert(drvConnMakeList[0]+"\n\n"+drvConnMakeList[1]);
        drvModel.file(drvConnMakeList[0],drvConnMakeList[1]);
        AddCheckBox(drvConnMakeList[2]);
        if (checkboxGenerateIntermediateMakeLists.checked)
        {
            var tmpCMakeList=CreateIntermediateMakeList(drvName,"DRV");
            //alert(tmpCMakeList[0]+"\n\n"+tmpCMakeList[1]);
            drvModels.file(tmpCMakeList[0],tmpCMakeList[1]);
            AddCheckBox(tmpCMakeList[2]);
        }
        var commCMakeList=createCommonDirCMakeList();
        //alert(commCMakeList[0]+"\n\n"+commCMakeList[1]);
        common.file(commCMakeList[0],commCMakeList[1]);
        AddCheckBox(commCMakeList[2]);
        var commonModels=common.folder("models");
        var commonModel=commonModels.folder(drvName);
        var commDRVCMAKE=createCommonDRVCMakeList();
        //alert(commDRVCMAKE[0]+"\n\n"+commDRVCMAKE[1]);
        commonModel.file(commDRVCMAKE[0],commDRVCMAKE[1]);
        AddCheckBox(commDRVCMAKE[2]);
        var commDrvH=CreateCommonDriverHeader();
        //alert(commDrvH[0]+"\n\n"+commDrvH[1]);
        commonModel.file(commDrvH[0],commDrvH[1]);
        AddCheckBox(commDrvH[2]);
        var commDrvCPP=CreateCommonDriverSource();
        //alert(commDrvCPP[0]+"\n\n"+commDrvCPP[1]);
        commonModel.file(commDrvCPP[0],commDrvCPP[1]);
        AddCheckBox(commDrvCPP[2]);
        if (checkboxGenerateIntermediateMakeLists.checked)
        {
            var modCMakeList=CreateIntermediateMakeList(drvName,"COM");
            //alert(modCMakeList[0]+"\n\n"+modCMakeList[1]);
            commonModels.file(modCMakeList[0],modCMakeList[1]);
            AddCheckBox(modCMakeList[2]);
        }
        alert("control Unit Successfully Created. Please Download");



    }


    zip.generateAsync({type:"blob"}).then(function(content){
    try{
        var zipname=retrieveFromJson("Name");
        if (zipname!=null)
         zipname+=".zip";
        else return;
     objectURL = URL.createObjectURL(content);
     document.getElementById("lnkDownload").href = objectURL;
     document.getElementById("lnkDownload").download=zipname;
     document.getElementById("lnkDownload").hidden=false;
    
    }
    catch(e) {alert( "exc "+e);}
 });
  
}

