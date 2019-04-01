var CmdParTypeBox= document.getElementById('paramType');
var groupBoxKindOfParam= document.getElementById('passingPar');
var buttonAddParameter= document.getElementById('AddParameter');
var buttonRemoveParameter= document.getElementById('RemoveParameter');
var textAreaCurPar= document.getElementById('CommandParametersTextBox');
var buttonAddCommand=document.getElementById('AddCommand');
var checkBoxOnlyDriver=document.getElementById('onlyDriver');
var textBoxCmdName=document.getElementById('CommandName');
var textBoxCmdDesc=document.getElementById('CommandDesc');
window.addEventListener("onload",InitPage());


function clearAll()
{
    localStorage.removeItem("currentParamList");
    textAreaCurPar.value="";
}

function InitPage()
{
    checkBoxOnlyDriver.checked=false;
    buttonRemoveParameter.disabled=true;
    this.clearAll();

}
function remSelOpt(inp1, sel1)
{
 len1 = sel1.options.length;
 for (i=0;i<len1 ;i++ )
 {
  if (sel1.options[i].value == inp1)
  {
   sel1.options[i] = null;
    //or
  //sel1.remove(i);
    break;
  }
 }
}

function AddParameterToCommand() {
    var textBoxParName=document.getElementById('ParamName');
    var textBoxParDesc=document.getElementById('ParamDesc');
    var checkBoxMandatory=document.getElementById('mandatory');
    var radioAsRef=document.getElementById('radioAsReference');
    var radioAsPoint=document.getElementById('radioAsPointer');

    var nome=textBoxParName.value;
    var desc=textBoxParDesc.value;
    var mandat=checkBoxMandatory.checked;
    var isOnlyDriver=checkBoxOnlyDriver.checked;
    var tipo=CmdParTypeBox.value;
    tipo=tipo.replace("&lt;","<");
    tipo=tipo.replace("&gt;",">");
    if (isOnlyDriver)
    {
        if (radioAsRef.checked)
        {
            tipo+="&";
        }
        else if (radioAsPoint.checked)
        {
            tipo+="*";
        }

    }
    var parToAdd= new CmdParameter(nome,desc,tipo,mandat);
    var jsonizedPar=JSON.stringify(parToAdd);
    var listOfParams=localStorage.getItem("currentParamList");
    //alert("checking param correctness");
    if (!isCorrectCNameVariable(nome))
    {
        alert("Invalid parameter name");
        return;
    }
    if (listOfParams==null)
    {
        var toAdd=[];
        toAdd.push(jsonizedPar);
        localStorage.setItem("currentParamList",JSON.stringify(toAdd));
    }
    else
    {
        var obj=JSON.parse(listOfParams);
        if (ExistParam(parToAdd.Name))
        {
            alert("command parameter " +parToAdd.Name + " already present");
            return;
        }
        obj.push(jsonizedPar);
        localStorage.setItem("currentParamList",JSON.stringify(obj));
    }
    //var retrieved=localStorage.getItem("currentParamList");
    //alert(retrieved);
    textAreaCurPar.value+= CmdParameterToString(parToAdd) +"\r\n";
}

function ExistParam(parname) {
    var listOfParams=localStorage.getItem("currentParamList");
    if (listOfParams == null) 
    {
        //buttonRemoveParameter.disabled=true;
        return false;
    }
    var obj=JSON.parse(listOfParams);
    for(var k in obj)
    {
        var JsonObj= JSON.parse(obj[k]);
        if (JsonObj.Name == parname)
        {
            return true;
        }
    }
    return false;

}
function checkRemoveParButton(textareaForm) {
    var start = textAreaCurPar.selectionStart;
    var finish = textAreaCurPar.selectionEnd;
    var sel = textAreaCurPar.value.substring(start, finish);
    
    //var listOfParams=localStorage.getItem("currentParamList");
    if (ExistParam(sel))
    {
        buttonRemoveParameter.disabled=false;
    }
    else
    {
        buttonRemoveParameter.disabled=true;
    }
    return;
}

function manageOnlyDriverCheckbox(checkBoxOnlyDriver) {
   
  if (checkBoxOnlyDriver.checked) 
  {
    CmdParTypeBox= document.getElementById('paramType');
    var opt = document.createElement('option');
    opt.value = "vector&lt;int32_t&gt;";
    opt.innerHTML = "std::vector&lt;int32_t&gt;";
    CmdParTypeBox.appendChild(opt);
    var optint64= document.createElement('option');
    optint64.value = "vector&lt;int64_t&gt;";
    optint64.innerHTML = "std::vector&lt;int64_t&gt;";
    CmdParTypeBox.appendChild(optint64);
    var optdouble= document.createElement('option');
    optdouble.value = "vector&lt;double&gt;";
    optdouble.innerHTML = "std::vector&lt;double&gt;";
    CmdParTypeBox.appendChild(optdouble);

    groupBoxKindOfParam.hidden=false;




  }
  else
  {
    remSelOpt("vector&lt;int32_t&gt;",CmdParTypeBox);
    remSelOpt("vector&lt;int64_t&gt;",CmdParTypeBox);
    remSelOpt("vector&lt;double&gt;",CmdParTypeBox);
    groupBoxKindOfParam.hidden=true;

  }

};
function UpdateTextAreaParams()
{
    textAreaCurPar.value="";
    var listOfParams=localStorage.getItem("currentParamList");
    if (listOfParams == null) 
    {
        return;
    }
    try
    {
        var obj=JSON.parse(listOfParams);
        for(var k in obj)
        {
            var JsonObj= JSON.parse(obj[k]);
            textAreaCurPar.value+= CmdParameterToString(JsonObj) +"\r\n";
        }
    }
    catch
    {
        alert("EXCEPTION "+ listOfParams);
    }

}

function RemoveParameterToCommand() {
    var start = textAreaCurPar.selectionStart;
    var finish = textAreaCurPar.selectionEnd;
    var sel = textAreaCurPar.value.substring(start, finish);
    if (ExistParam(sel))
    {
        if (confirm("You want to remove param "+sel + " from Command. Are you sure?"))
        {
            var listOfParams=localStorage.getItem("currentParamList");
            var obj=JSON.parse(listOfParams);
            //alert("obj before is: "+obj);
            for( var k in obj)
            {
                var JsonObj= JSON.parse(obj[k]);
                if (JsonObj.Name == sel)
                {
                    //alert("found "+JsonObj.Name + " at "+k);
                    obj.splice(k, 1);
                }
            }
            //alert("obj is: "+obj);
            var updatedListOfParams=obj;
            localStorage.setItem('currentParamList',JSON.stringify(updatedListOfParams));
            alert("param "+sel+ " removed");
            UpdateTextAreaParams();
        }
    }
}

function AddCommandToCU() {
    if (!isCorrectCNameVariable(textBoxCmdName.value))
    {
        alert(textBoxCmdName.value+ " is not a valid name for a command");
        return;
    }
    var myCommand=new CUCommand();
    myCommand.Name=textBoxCmdName.value;
    myCommand.Description=textBoxCmdDesc.value;
    myCommand.Default=false;
    myCommand.isInterfaceCommand=(checkBoxOnlyDriver.checked==false);
    myCommand.Parameters=[];
    var listOfParams=localStorage.getItem("currentParamList");
    if (listOfParams == null)
    {
       
    }
    else
    {
        var jsonizedparams=JSON.parse(listOfParams);
        for(var k in jsonizedparams)
        {
            var JsonObj= JSON.parse(jsonizedparams[k]);
            myCommand.Parameters.push(JsonObj);
        }
    }
    //alert(JSON.stringify(myCommand));
    var currentCU=localStorage.getItem('controlUnit');
    if (currentCU == null)
    {
        alert("Cannot add command to Undefined Control Unit");
        return;
    }
    var CUobject=JSON.parse(currentCU);
    for (var iter in CUobject.Commands)
    {
        var cmd=CUobject.Commands[iter];
        if (cmd.Name==myCommand.Name)
        {
            alert("Command "+cmd.Name+" is already present in "+CUobject.Name);
            return;
        }
    }
    CUobject.Commands.push(myCommand);
    var stringedCU = JSON.stringify(CUobject);
    localStorage.setItem('controlUnit',stringedCU);
    alert("Command added");


}


buttonAddParameter.onclick=AddParameterToCommand;
buttonRemoveParameter.onclick=RemoveParameterToCommand;
buttonAddCommand.onclick=AddCommandToCU;
