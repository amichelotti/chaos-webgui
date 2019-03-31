var textBoxAlName=document.getElementById('AlarmName');
var textBoxAlDesc=document.getElementById('AlarmDesc');
var radioCUAlarm=document.getElementById('radioCUAlarm');
var buttonAddAlarm=document.getElementById('AddAlarm');


var textBoxEnuValue=    document.getElementById("EnumValue");
var textBoxEnuName=     document.getElementById('EnumName');
var textAreaEnumElements=document.getElementById('EnumBox');
var textAreaEnumList=    document.getElementById('EnuList');
var checkBoxIsBitwise= document.getElementById('bitwiseOrdering');

var buttonInsertElement=document.getElementById('InsertEnuValue');
var buttonRemoveElement=document.getElementById('RemoveEnuValue');
var buttonMoveUp=document.getElementById('MoveUp');
var buttonMoveDown=document.getElementById('MoveDown');
var buttonAddEnumeration=document.getElementById('AddEnumToClass');

window.addEventListener("onload",InitPage());
buttonAddAlarm.onclick=AddAlarm;
buttonInsertElement.onclick=InsertElementToEnum;
buttonRemoveElement.onclick=RemoveElementFromEnum;
buttonMoveUp.onclick=MoveUpValue;
buttonMoveDown.onclick=MoveDownValue;
buttonAddEnumeration.onclick=AddEnuToClass;
textAreaEnumList.onselect=ShowCurrentEnum;



function ShowCurrentEnum() {
    var sel=getSelection(textAreaEnumList);
    var CUEnumerations=retrieveFromJson('AbstractEnumerations');
    if (CUEnumerations!= null)
    {
        for (k in CUEnumerations)
        {
            var EN=CUEnumerations[k];
            if (EN.Name == sel)
            {
                textBoxEnuName.value=EN.Name;
                checkBoxIsBitwise.checked=EN.BitwiseOrdered;
                textAreaEnumElements.value="";
                for (v in EN.Values)
                {
                    textAreaEnumElements.value+=EN.Values[v]+"\n";
                }
            }
        }
    }
}
function AddEnuToClass() {
    alert("checking Enum correctness");
    var myEnum=new ChaosEnumerations(textBoxEnuName.value,checkBoxIsBitwise.checked);
    var lines = textAreaEnumElements.value.split("\n");
    for (var k in lines)
    {
        if (lines[k].length>0)
        {
            myEnum.Values.push(lines[k]);
        }
    }
    var currentCU=localStorage.getItem('controlUnit');
    if (currentCU == null)
    {
        alert("Cannot add enumeration to Undefined Control Unit");
        return;
    }
    var CUobject=JSON.parse(currentCU);
    try 
    {
        if (CUobject.AbstractEnumerations==null)
        {
            CUobject.AbstractEnumerations=[];
        }
        var updated=false;
        for (var ll in CUobject.AbstractEnumerations)
        {
            var EN=CUobject.AbstractEnumerations[ll];
            if (EN.Name==myEnum.Name)
            {
                CUobject.AbstractEnumerations[ll]=myEnum;
                alert("Enum "+myEnum.Name+" updated");
                updated=true;
            }
        }
        if (!updated)
            CUobject.AbstractEnumerations.push(myEnum);
        var stringedCU = JSON.stringify(CUobject);
        localStorage.setItem('controlUnit',stringedCU);
        if (!updated)
            alert("Enum added");
        UpdateEnumList(textAreaEnumList);
        textAreaEnumElements.value="";
    }
    catch (e) {alert("EXCEPTION "+e)}

}

function MoveDownValue() {
    var indexInit=textAreaEnumElements.selectionStart;
    var lines = textAreaEnumElements.value.split("\n");
    var countedChars=0;
    var count=0;
    for (var k=0; k< lines.length;++k)
    {
        if (lines[k].length==0)
        {
           lines.splice(k,1);
           k--;
        }
    }
    //alert("lines: "+lines.length);
    for ( count=0; count < lines.length; count++)
    {
        countedChars+=lines[count].length;
        if (countedChars > indexInit)
        {
            if (count< lines.length-1)
            {
                var tmpLine=lines[count+1];
                lines[count+1]=lines[count];
                lines[count]=tmpLine;
            }
            break;
        }
    }
    textAreaEnumElements.value="";
    for (var i=0;i<lines.length;i++)
    {
        textAreaEnumElements.value+=lines[i]+"\r\n";
    }
   
}
function MoveUpValue() {
    var indexInit=textAreaEnumElements.selectionStart;
    var lines = textAreaEnumElements.value.split("\n");
    var countedChars=0;
    var count=0;
    for (var ll=0; ll< lines.length;++ll)
    {
        if (lines[ll].length==0)
        {
           lines.splice(ll,1);
           ll--;
        }
    }
    for ( count=0; count < lines.length; count++)
    {
        countedChars+=lines[count].length;
        if (countedChars > indexInit)
        {
            if (count>0)
            {
                var tmpLine=lines[count-1];
                lines[count-1]=lines[count];
                lines[count]=tmpLine;
            }
            break;
        }
    }
    textAreaEnumElements.value="";
    for (var i=0;i<lines.length;i++)
    {
        textAreaEnumElements.value+=lines[i]+"\r\n";
    }
   
}

function RemoveElementFromEnum() {
    var indexInit=textAreaEnumElements.selectionStart;
    var lines = textAreaEnumElements.value.split("\n");
    var countedChars=0;
    var nameToShow="";
    var count=0;
    for ( count=0; count < lines.length; count++)
    {
        countedChars+=lines[count].length;
        if (countedChars > indexInit)
        {
            nameToShow=lines[count].split(' ')[0];
            break;
        }
    }
    if (nameToShow!="")
    {
        
        lines.splice(count,1);
        textAreaEnumElements.value="";
        for (var i=0;i<lines.length;i++)
        {
            textAreaEnumElements.value+=lines[i]+"\r\n";
        }
        
    }
}

function InsertElementToEnum() {
    alert('checking correctness '+textBoxEnuValue.value);
    textAreaEnumElements.value+=textBoxEnuValue.value+"\n";
}

function InitPage() {
    textBoxAlName.value="";
    textBoxAlDesc.value="";
    radioCUAlarm.checked=true;
    textBoxEnuValue.value="";
    textBoxEnuName.value="";
    UpdateEnumList(textAreaEnumList);
    //textAreaEnumElements.value="";
}

function AddAlarm() {
    alert("checking correctness ");
    var theAlarm=new ChaosAlarms(textBoxAlName.value,textBoxAlDesc.value,radioCUAlarm.checked);
    var currentCU=localStorage.getItem('controlUnit');
    if (currentCU == null)
    {
        alert("Cannot add command to Undefined Control Unit");
        return;
    }
    var CUobject=JSON.parse(currentCU);
    try 
    {
        if (CUobject.Alarms==null)
        {
            CUobject.Alarms=[];
        }
        CUobject.Alarms.push(theAlarm);
        var stringedCU = JSON.stringify(CUobject);
        localStorage.setItem('controlUnit',stringedCU);
        alert("Alarm added");
    }
    catch (e) {alert("EXCEPTION "+e)}

   
}