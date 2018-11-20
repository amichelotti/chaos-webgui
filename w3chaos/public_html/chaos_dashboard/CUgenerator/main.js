
var CUNameForm = document.getElementById('CUName');
var CUPrefixForm = document.getElementById('CUPrefix');
var DriverNameForm = document.getElementById('DriverName');
var OffsetFromDriverForm=document.getElementById('OffsetFromDriver');
var OffsetFromCommonForm=document.getElementById('OffsetFromCommon');
var createButton = document.getElementById('Create');
var clearButton =  document.getElementById('ClearCU');
var updateButton =  document.getElementById('UpdateCU');

var UploadJSONButton =  document.getElementById('UploadJSON');
var downLinkJson=document.getElementById('lnkDownloadJSON');




if(localStorage.getItem('controlUnit')) {

    setDownloadJSONDescription();
    retrieveCU();
}






function retrieveCU() {
    //window.alert ("retrieveCU");
    var currentCU=localStorage.getItem('controlUnit');
    if (currentCU == null)
        return null;
    try
    {
       
        var obj=JSON.parse(currentCU);
        CUNameForm.value=obj.Name;
        CUPrefixForm.value=obj.Prefix;
        if (obj.OffsetFromDriver!=null)
            OffsetFromDriverForm.value=obj.OffsetFromDriver;
        if (obj.OffsetFromCommon!=null)
            OffsetFromCommonForm.value=obj.OffsetFromCommon;
        if (obj.DriverName != null) DriverNameForm.value=obj.DriverName;
    }
    catch (e)
    {
        alert("EXCEPTIONMAIN "+e.fileName+ " "+ e.lineNumber);
        //CUNameForm.value=currentCU;
    }
   
}

function checkCorrectCUData()
{
    CUNameForm.value=CUNameForm.value.trim();
    CUPrefixForm.value=CUPrefixForm.value.trim();
    DriverNameForm.value=DriverNameForm.value.trim();
    OffsetFromDriverForm.value=OffsetFromDriverForm.value.trim();
    OffsetFromCommonForm.value=OffsetFromCommonForm.value.trim();
    var CUName=CUNameForm.value;
    var CUPrefix=CUPrefixForm.value;
    var DriverName=DriverNameForm.value;
    if (!isCorrectCNameVariable(CUName))
    {
        alert(CUName+ " is not a valid name for a control Unit");
        return false;
    }
    if (!isCorrectCNameVariable(CUPrefix))
    {
        alert(CUPrefix+ " is not a valid name for prefix");
        return false;
    }
    if (!isCorrectCNameVariable(DriverName))
    {
        alert(DriverName+ " is not a valid name for a driver");
        return false;
    }
    if (!isRelativePath(OffsetFromDriverForm.value))
    {
        alert(OffsetFromDriverForm.value+ " is not a valid path for Driver Offset Path");
        return false;
    }
    if (!isRelativePath(OffsetFromCommonForm.value))
    {
        alert(OffsetFromCommonForm.value+ " is not a valid path for Common Offset Path");
        return false;
    }
    return true;
}


function createCU() {
    if (!checkCorrectCUData())
    {
        alert( "Data not correct. Abort Creating");
                return;
    }
    if (confirm ("are you sure?"))
    {
        var name= document.getElementById('CUName').value;
        var prefix = document.getElementById('CUPrefix').value;
        var currentCU= new controlUnit();
        
        currentCU.Name=name;
        currentCU.Prefix=prefix;
        currentCU.OffsetFromDriver=OffsetFromDriverForm.value;
        currentCU.OffsetFromCommon=OffsetFromCommonForm.value;
        currentCU.DriverName=DriverNameForm.value;
        localStorage.setItem("controlUnit",JSON.stringify(currentCU));
        document.getElementById('CUName').value=currentCU.Name;
        document.getElementById('CUPrefix').value=currentCU.Prefix;
        AddDefaultsOnCU();
        

    }
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
    var DrvErr=new ChaosAlarms("driver_command_error","default driver communication error",true);
    
   
    if (!theCU.HaveAlarm(DrvErr))
    {
        
        var alarmsList=retrieveFromJson("Alarms");
        alarmsList.push(DrvErr);
        UpdateJsonCU("Alarms",alarmsList);
        //CU.Alarms.push(DrvErr);
    }


}




function deleteCU() {
    if (confirm("this would erase the current Control Unit. Are you sure?"))
    {
        localStorage.removeItem("controlUnit");
        document.getElementById('CUName').value="";
        document.getElementById('CUPrefix').value="";
    }
    
}
function updateCU() {
    var currentCU=localStorage.getItem('controlUnit');
    if (currentCU!=null)
    {
        
        try
        {
            var obj=JSON.parse(currentCU);
            if (!checkCorrectCUData())
            {
                alert( "Data not correct. Abort updating");
                return;
            }
            obj.Name=CUNameForm.value;
            obj.Prefix=CUPrefixForm.value;
            obj.OffsetFromDriver=OffsetFromDriverForm.value;
            obj.OffsetFromCommon=OffsetFromCommonForm.value;
            obj.DriverName=DriverNameForm.value;
            var toPutBack=JSON.stringify(obj);
            localStorage.setItem('controlUnit',toPutBack);
        }
        catch (e) { alert(e);}
    }
}


function startDownloadJSON()
{
    lnkDownloadJSON.click();
}
function setDownloadJSONDescription()
{
    var currentCU=localStorage.getItem('controlUnit');
    if (currentCU == null)
    {
        lnkDownloadJSON.hidden=true;
        return null;
    }
    var obj=JSON.parse(currentCU);
    lnkDownloadJSON.hidden=false;
    const blb = new Blob([currentCU], {type: "text/plain"});
    var    objectURL = URL.createObjectURL(blb);
    //objectURL = URL.createObjectURL(currentCU);
    lnkDownloadJSON.href=objectURL;
    lnkDownloadJSON.download=obj.Name+".JSON";
   
   // alert("jh")
    //document.getElementById("lnkDownload").href = objectURL;
    //document.getElementById("lnkDownload").download=zipname;
    
}


function myFunc(evt) {
    var file=evt.target.files[0];
    //var fileName = this.files[0].name;
   
    var r = new FileReader();
    r.onload = (function(file) {
        
                    return function(e) {
                        var contents = e.target.result;
                        try
                        {
                        var obj=JSON.parse(contents);
                        var currentCU=CUcreate(obj);
                        localStorage.setItem("controlUnit",contents);
                        alert( currentCU.Name+ " successfully loaded");
                        retrieveCU();
                        }
                        catch(ex) {alert("EXCEPTION: "+ex);}
                        return contents;
                    };
    })(file);
    r.readAsText(file);

}
createButton.onclick = createCU;
clearButton.onclick = deleteCU;
updateButton.onclick=updateCU;
UploadJSONButton.addEventListener('change',myFunc,false);
