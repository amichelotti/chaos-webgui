var strLenForm = document.getElementById('AttrStrLen');
var attrTypeForm= document.getElementById('AttrType');
var addButton = document.getElementById('AddAttribute');
var nameForm = document.getElementById('AttrName');
var descForm = document.getElementById('AttrDesc');
var attrDirForm= document.getElementById('AttrDir');
var checkBoxHandler=document.getElementById("addHandler");
var checkBoxVector=document.getElementById('isVector');
var VectorLenForm = document.getElementById('VectorLength');
window.addEventListener("onload",InitPage());

function InitPage()
{
    
    checkBoxHandler.checked=false;
    
}

function  manageHandlerCheckBox(directionlistbox) {
    if (directionlistbox.selectedIndex!=-1)
    {
        if (directionlistbox.value == "Output")
        {
            checkBoxHandler.value=false;
            checkBoxHandler.disabled=true;
        }
        else
        {
            checkBoxHandler.disabled=false;
        }
    }
    else
    {
        checkBoxHandler.value=false;
        checkBoxHandler.disabled=true;
    }

}

function stringContains(testString,charVector)
{
    for (var ch=0;ch < testString.length;ch++)
    {
        var chTest=testString[ch];
        for (var k in charVector)
        {
            if (chTest==charVector[k])
               return true;
        }
    }
    return false;
}


function checkCorrectDatasetAttribute() {
    var nome=nameForm.value;
    if (!isCorrectCNameVariable(nome))
    {
        alert(nome+" is not a correct value for variable");
        return false;
    }
    if (checkBoxHandler.checked)
    {
        var textBoxH=document.getElementById('customHandler');
        var radioselection=document.getElementsByName('handlerSource');
        var isCustom=radioselection[0].checked;
        if (isCustom)
        {
            if (!isCorrectCNameVariable(textBoxH.value))
            {
                alert(textBoxH.value+" is not a correct value for handler name");
                return false;
            }

        }
    }
    //check if this name is already present
    var datasetList=retrieveFromJson("DataSet");
   
    for (var att in datasetList)
    {
        
        var attParsed=JSON.parse(datasetList[att]);
        if (attParsed.Name == nome)
        {
            alert(nome+" already present in a DataSet");
            return false;
        }
    }
    return true;
}

function addToDataset()
{

    if (!checkCorrectDatasetAttribute())
    {
        return;
    }
    var newVar= new datasetVariable(nameForm.value,descForm.value);
    newVar.Type=attrTypeForm.value;
    newVar.DataDirection=attrDirForm.value;
    if (checkBoxHandler.checked)
    {
        var listboxH=document.getElementById('comboHandler');
        var textBoxH=document.getElementById('customHandler');
        var radioselection=document.getElementsByName('handlerSource');
        var isCustom=radioselection[0].checked;
        newVar.HaveHandler=(isCustom)?  textBoxH.value : listboxH.value;
    }
    else {        newVar.HaveHandler=""; }
    newVar.DataLen= (newVar.Type=="TYPE_STRING")? strLenForm.value   : 0;
    if (checkBoxVector.checked)
    {
        newVar.SizeVector=parseInt(VectorLenForm.value);
    }
    else
    {
        newVar.SizeVector=0;
    }
    //retrieving CU;
    var toAdd=JSON.stringify(newVar);
    var currentCU=localStorage.getItem('controlUnit');
    try
    {
        var obj=JSON.parse(currentCU);
        var listAtt=obj.DataSet;
        
        if (listAtt==null)
        {
            obj.DataSet=[];
            obj.DataSet.push(toAdd);
        }
        else
        {
            obj.DataSet.push(toAdd);
        }
        var stringed=JSON.stringify(obj);
        alert("added");
        localStorage.setItem("controlUnit",stringed);
    }
    catch (e)
    {
        CUNameForm.value=currentCU;
    }
}


function disablestrLenForm()
{
    var x=attrTypeForm.value;
    if (x=="TYPE_STRING")
    {
        strLenForm.disabled=false;
    }
    else
    {
        strLenForm.disabled=true;
    }

}

function showVectorLength(checkboxElem) {

    var vecLenForm=document.getElementById('VectorLength');
    var labelLenForm=document.getElementById('labelVLen');
    var checked=checkboxElem.checked;

    if (checked == true)
    {

        vecLenForm.hidden=false;
        labelLenForm.hidden=false;

    }
    else
    {

        vecLenForm.hidden=true;
        labelLenForm.hidden=true;
    }
}

function radioSelectHandler() {
    var listboxH=document.getElementById('comboHandler');
    var textBoxH=document.getElementById('customHandler');
    var labelCustomHandler=document.getElementById("labelCustomHandler")
    var radioselection=document.getElementsByName('handlerSource');
    var isCustom=radioselection[0].checked;
    if (isCustom)
        {
            textBoxH.hidden=false;
            labelCustomHandler.hidden=false;
            listboxH.hidden=true;
        }
        else
        {
            listboxH.hidden=false;
            textBoxH.hidden=true;
            labelCustomHandler.hidden=true;
        }
        showHandlerCombo(checkBoxHandler,true);
}


function showHandlerCombo(checkboxElem, fromRadio) {
    if (fromRadio==null)
        fromRadio=false;
    
    var vecLenForm=document.getElementById('comboHandler');
    var customHandlerForm=document.getElementById('customHandler');
    var labelLenForm=document.getElementById('labelHandler');
    var labelCommandHandler=document.getElementById('labelCommandHandler');
    var  radioselection=document.getElementsByName('handlerSource');

    var checked=checkboxElem.checked;
   
    if (checked == true)
    {
        var AttrType=attrTypeForm.value;
        AttrType=AttrType.substring(5);
        AttrType=AttrType.toLowerCase();
        var length = vecLenForm.options.length;
        for (i = 0; i <= length; i++) {
            vecLenForm.options[i] = null;
        }
        var cmdList=retrieveFromJson("Commands");
        
        for (var i in cmdList)
        {
            var cmdJ=cmdList[i];
            if (!cmdJ.Default)
            {
                if (cmdJ.Parameters.length==1)
                {
                    var paramsOfCommand= getParamsTypeString(cmdJ);
                    if (paramsOfCommand.includes(AttrType))
                    {
                        var opt = document.createElement('option');
                        opt.value = cmdJ.Name;
                        opt.innerHTML = cmdJ.Name;
                        vecLenForm.appendChild(opt);
                    }
                }
            }
        }
        


        /*************************** */
        labelLenForm.hidden=false;
        labelCommandHandler.hidden=false;
        radioselection[0].hidden=false;
        
        if (!fromRadio)
            radioselection[0].checked=true;
        var isCustom=radioselection[0].checked;
        radioselection[1].hidden=false;
        var labelCustomHandler=document.getElementById('labelCustomHandler');
        if (isCustom)
        {
            customHandlerForm.hidden=false;
            labelCustomHandler.hidden=false;
            
        }
        else
        {
            
            vecLenForm.hidden=false;
        }
        
        //thecombo.value="Geppetto";
    }
    else
    {
        customHandlerForm.hidden=true;
        labelCustomHandler.hidden=true;
        labelLenForm.hidden=true;
        labelCommandHandler.hidden=true;
        vecLenForm.hidden=true;
        radioselection[0].hidden=true;
        radioselection[1].hidden=true;
    }
}

addButton.onclick = addToDataset;