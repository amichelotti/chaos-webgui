var textBoxCUName= document.getElementById('rCUName');
var textBoxCUPrefix =document.getElementById('rPrefix'); 
var textBoxDriverOffset= document.getElementById('txtBoxDriverOffset');
var textBoxCommonOffset= document.getElementById('txtBoxCommonOffset');
var textBoxDriverName= document.getElementById('txtBoxDriverName');
var textAreaDataset=document.getElementById('DatasetBox');
var textAreaCommands=document.getElementById('CommandsBox');
var textAreaAlarms=document.getElementById('AlarmsBox');
var textAreaEnums=document.getElementById('EnumListBox');
//buttons
var buttonRemoveAttribute= document.getElementById('RemoveAttribute');
var buttonRemoveCommand= document.getElementById('RemoveCommand');
var buttonRemoveAlarm= document.getElementById('RemoveAlarm');
var buttonRemoveEnum= document.getElementById('RemoveEnum');

window.addEventListener("onload",InitPage());
buttonRemoveAttribute.onclick=RemoveAttribute;
buttonRemoveCommand.onclick=RemoveCommand;
buttonRemoveAlarm.onclick=RemoveAlarm;
buttonRemoveEnum.onclick=RemoveEnum;

function RemoveEnum() {
    var sel=getSelection(textAreaEnums);
    var JsonEnum=retrieveFromJson('AbstractEnumerations');
    for (var k in JsonEnum)
    {
        var Enu=JsonEnum[k];
        if (Enu.Name==sel)
        {
            if (confirm("Remove Enum "+Enu.Name + ". Continue?"))
            {
                JsonEnum.splice(k, 1);
                UpdateJsonCU('AbstractEnumerations',JsonEnum);
                InitPage();
            }

        }

    }
}

function RemoveAlarm() {
    var sel=getSelection(textAreaAlarms);
    var JsonAlarms=retrieveFromJson('Alarms');
    for (var k in JsonAlarms)
    {
        
        var ALA=JsonAlarms[k];
        
        if (ALA.Name==sel)
        {
            if (confirm("Remove alarm "+ALA.Name + ". Continue?"))
            {
                JsonAlarms.splice(k, 1);
                UpdateJsonCU('Alarms',JsonAlarms);
                InitPage();
            }

        }
    }
}
function RemoveAttribute() {
    var sel=getSelection(textAreaDataset);
    var JsonAttributes=retrieveFromJson('DataSet');
    for (var k in JsonAttributes)
    {
        var Attrib=JSON.parse(JsonAttributes[k]);
        if (Attrib.Name==sel)
        {
            if (confirm("Remove attribute "+Attrib.Name + ". Continue?"))
            {
                JsonAttributes.splice(k, 1);
                UpdateJsonCU('DataSet',JsonAttributes);
                InitPage();
            }

        }
    }

}

function RemoveCommand() {
    var sel=getSelection(textAreaCommands);
    var JsonCommands=retrieveFromJson('Commands');
    
    for (var k in JsonCommands)
    {
        var CMD=JsonCommands[k];
        if (CMD.Name==sel)
        {
            if (confirm("Remove command "+CMD.Name + ". Continue?"))
            {
                JsonCommands.splice(k, 1);
                UpdateJsonCU('Commands',JsonCommands);
                InitPage();
            }

        }
    }
}

function clearAll() {
    textAreaDataset.value="";
    textAreaCommands.value="";
    textBoxCUName.value="";
    textBoxCUPrefix.value="";
    textAreaAlarms.value="";
}

function InitPage() {
    clearAll();
    UpdateEnumList(textAreaEnums);
    var currentCU=localStorage.getItem('controlUnit');
    if (currentCU != null)
    {
        try
        {
            var theJson=JSON.parse(currentCU);
            textBoxCUName.value=theJson.Name;
            textBoxCUPrefix.value= theJson.Prefix;
            textBoxDriverOffset.value=theJson.OffsetFromDriver;
            textBoxCommonOffset.value=theJson.OffsetFromCommon;
            textBoxDriverName.value=theJson.DriverName;



            for(var k in theJson.DataSet) {
                var JsonObj= JSON.parse(theJson.DataSet[k]);
                var thestr=DataSetToString(JsonObj);
                textAreaDataset.value+= thestr+"\r\n";
            };
            for(var k in theJson.Commands) {
                var command=theJson.Commands[k];
                var thestr=CUCommandToString(command);
                textAreaCommands.value+= thestr+"\r\n";
            };
            for(var k in theJson.Alarms) {
                var alarm=theJson.Alarms[k];
                var thestr=ChaosAlarmsToString(alarm);
                textAreaAlarms.value+= thestr+"\r\n";
            };


        }
        catch (e)
        {
            alert(e);
        }
    }

}