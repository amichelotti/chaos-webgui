

class controlUnit {
    //Name
    //Prefix
    //OffsetFromDriver
    //OffsetFromCommon
    //DriverName
    //DataSet
    //Commands
    //Alarms
    //AbstractEnumerations
    constructor()
    {
        this.DataSet=[];
        this.Commands=[];
        this.Alarms=[];
        this.AbstractEnumerations=[];
    }
    getNumberOfNeededInterfaceVariable(type,output,ptNeededOPar,ptNeededIPar) {
      
      var ret = 0;
      var list;
      /*var strg="called for type "+type;
      strg+=(output)? " asOutput(Opar)":" asInput(Ipar)";
      strg+="\nIparList:\n";
     

      for (var i in ptNeededIPar)
      {
        var pair=NTPcreate(ptNeededIPar[i]);
        strg+=pair.Type + " NEEDED:"+pair.needed+"\n";
      }
      strg+="\nOparList:\n";
      for (var i in ptNeededOPar)
      {
        var pair=NTPcreate(ptNeededOPar[i]);
        strg+=pair.Type + " NEEDED:"+pair.needed+"\n";
      }
      alert(strg);*/
      list = (output) ? ptNeededOPar : ptNeededIPar;
      for (var ipair in list)
      {
         var pair=NTPcreate(list[ipair]);
         if (pair.Type == type)
              return pair.needed;
      }
      return ret;
    }
    




    PrintInterfaceMacros(writer)
    {
			 //Write (input) Macros
			 var necessaryMacros=[];
			 for (var  icmd in this.Commands)
			 {
         var cmd=CMDcreate(this.Commands[icmd]);
         if (!cmd.isInterfaceCommand)
            continue;
				 for (var  ipar in cmd.Parameters)
				 {
           var par=cmd.Parameters[ipar];
					 var parStr=getParamsTypeString(cmd);
					 if ((parStr!="") && (!necessaryMacros.includes(parStr)))
						 necessaryMacros.push(parStr);
				 }
       }
       
			 for (var  IparString in necessaryMacros)
			 {
         var parString=necessaryMacros[IparString];
				 var  alreadyAdded=[];
				 writer.Write("#define WRITE_OP");
				 var  types=parString.split(" ");
				 for (var i=0; i < types.length; i++)
					 writer.WriteNoInd("_"+getParamTypeForMacro(types[i]));
				 writer.WriteNoInd("_TIM(op");
				 for (var i=0; i < types.length; i++)
				 {
					 if (alreadyAdded.includes(types[i]))
						 continue;
					 else
						 alreadyAdded.push(types[i]);
					 var prmter=getDefaultVarNameForParam(parString,types[i],false);
					 for (var l=0;l< prmter.length;l++)
						writer.WriteNoInd(",VAR_"+prmter[l]);
				 }
				 writer.WriteLineNoInd(",timeout)\\");
				 writer.WriteLine("PREPARE_OP_RET_INT_TIMEOUT(op,timeout); \\");
				 
				 alreadyAdded.length=0;
				 for (var i=0; i < types.length; i++)
				 {
					 if (alreadyAdded.includes(types[i]))
						 continue;
					 else
						 alreadyAdded.push(types[i]);
					   var prmter=getDefaultVarNameForParam(parString,types[i],false);
					   for (var l=0;l< prmter.length;l++)
					   {
						   writer.WriteLine("idata."+prmter[l]+"=VAR_"+prmter[l] +";\\" );
					   }

				 }
         writer.WriteLine("accessor->send(&message);\\");
				 writer.WriteLine("return ret.result;");
				 writer.WriteLine();
			 }
			 //Read (output) Macros
			 necessaryMacros.length=0;
			 for (var  icmd in this.Commands)
			 {
         var cmd=CMDcreate(this.Commands[icmd]);
         if (cmd.isInterfaceCommand)
				 		 continue;
				 else
				 {
					 for (var  ip in cmd.Parameters)
					 {
						 var  parString=getParamsTypeString(cmd);
						 if ((parString!="") && (!necessaryMacros.includes(parString)))
							 necessaryMacros.push(parString);
					 }
				 }
       }
			 for (var  iparString in necessaryMacros)
			 {
         var parString=necessaryMacros[iparString];
			   var alreadyAdded=[];
				 writer.Write("#define READ_OP");
         var types=parString.split(" ");
         
				 for (var i=0; i < types.length; i++)
				 {
          
					 var  tipo;
					 tipo=types[i];
					 if (tipo.includes("&") )
						tipo=tipo.replace("&","");
					 if (tipo.includes("*"))
						tipo=tipo.replace("*","");
					 writer.WriteNoInd("_" +getParamTypeForMacro(tipo));
				 }
				 writer.WriteNoInd("_TIM(op");
				 for (var i=0; i < types.length; i++)
				 {
          
           if (alreadyAdded.includes(types[i]))
           {
            
             continue;
           }
           else
           {
             alreadyAdded.push(types[i]);
           }
					  //se è un parametro di output passare true
            var  prmter=getDefaultVarNameForParam(parString,types[i],true);
					  for (var l=0;l< prmter.length;l++)
					  {
						 writer.WriteNoInd(",VAR_"+prmter[l]);
					  }
				 }
				 writer.WriteLineNoInd(",timeout)\\");
				 writer.WriteLine("PREPARE_OP_RET_INT_TIMEOUT(op,timeout); \\");
				 writer.WriteLine("accessor->send(&message);\\");
				 alreadyAdded.length=0;
				 for (var i=0; i < types.length; i++)
				 {
					  if (alreadyAdded.includes(types[i]))
						 continue;
					 else
						 alreadyAdded.push(types[i]);
					 var prmter=getDefaultVarNameForParam(parString,types[i],true);
					  for (var l=0;l< prmter.length;l++)
					  {
             var addStar = NeedAStar(prmter[l]);
						 writer.WriteLine(addStar+"VAR_"+prmter[l]+"="+"ret."+prmter[l] +";\\" );
					  }
				 }
				 writer.WriteLine("return ret.result;");
				 writer.WriteLine("");
			 }
		 }
    PrintStandardPrepareInterfaceMacro(writer) {
      writer.WriteLine("#define PREPARE_OP_RET_INT_TIMEOUT(op,tim) \\");
      writer.WriteLine(this.getNameSpace() + "_oparams_t ret;\\");
      writer.WriteLine(this.getNameSpace() + "_iparams_t idata;\\");
      writer.WriteLine("message.opcode = op; \\");
      writer.WriteLine("message.inputData=(void*)&idata;\\");
      writer.WriteLine("idata.timeout=tim;\\");
      writer.WriteLine("message.inputDataLength=sizeof(" + this.getNameSpace() + "_iparams_t);\\");
      writer.WriteLine("message.resultDataLength=sizeof(" + this.getNameSpace() + "_oparams_t);\\");
      writer.WriteLine("message.resultData = (void*)&ret;\\\n");
  }

    HaveInDataSet(dtvar) {
      for (var i in this.DataSet)
      {
        var cur=JSON.parse(this.DataSet[i]);
        if (cur.Name == dtvar.Name)
            return true;
      }
      return false;
    }
    HaveAlarm(Alarm) {
      for (var i in this.Alarms)
      {
        var cur=this.Alarms[i];
        if (cur.Name == Alarm.Name)
           return true;

      }
      return false;
    }



    getNameSpace() {
      return this.Name.toLowerCase();
    }
    getAccessor() { return this.Name.toLowerCase()+"_accessor";}
    getAbstractDriver() { return this.Name.toLowerCase()+"_drv";}
    getFunctionNameForHandlingAttribute(Attrib) {
      
      var cmdToSearch = Attrib.HaveHandler;
      var isAcommand = false;
      for (var  i in this.Commands)
      {
        var cmd=this.Commands[i];
        /*if (cmd.isInterfaceCommand==true)
        {
          continue;
        }*/

          if (cmdToSearch == cmd.Name)
          {
              isAcommand = true;
              break;
          }
      }
      var handlerName = isAcommand ? "handler_" + Attrib.Name : Attrib.HaveHandler;
      return handlerName;
    }
    
}//end class

NeedAStar= function( parVariableName)
{
    var i=0;
    for ( i = parVariableName.length - 1; i >= 0; --i)
    {
        if (isNaN(parseInt(parVariableName[i],10)))
            break;
    }
    var theVal = parVariableName[i];
    if (theVal == 'P')
        return "*";

    return "";

}
getDefaultVarNameForParam= function( parString, typeOfVariable, output) {
	        var  ret= [];
	        var  numVariables=parString.split(" ");
	        var count=0;
	        for (var i=0;i < numVariables.length;i++)
	        {
		        if (numVariables[i] == typeOfVariable)
		        {
			        if (output)
			        {

                var  vart=numVariables[i].replace('*','').replace('&','');
                vart = vart.replace('<', '_').replace('>', '_');
                if (numVariables[i].includes("*"))
                {
                  ret.push(vart+"P"+(count+1));
                }
                if (numVariables[i].includes("&"))
                {
                  ret.push(vart+"E"+(count+1));
                }

			        }
			        else
				        ret.push(numVariables[i]+(count+1));
			        count++;
		        }
          }
	        return ret;



        }




getParamTypeForMacro =function(type) {
    return type.toUpperCase().replace('<', '_').replace('>', '_');
}

CUcreate = function (obj) {
  var field = new controlUnit();
  for (var prop in obj) {
     // if (field.hasOwnProperty(prop)) {
          field[prop] = obj[prop];
     // }
  }
  return field;
};
function isRelativePath(str) {
  if (str=="")
    return true;
  if (!str.endsWith('/'))
    return false;
  
  return true;
}

function isAValidDescription(str) {
if (str.includes("\""))
  return false;
if (str.includes("\\"))
  return false;

return true;
}

function isCorrectCNameVariable(str)
 {
    var code,len;
    if (str.length==0)
    {
      return false;
    }
    for (var i = 0, len = str.length; i < len; i++)
    {
        code = str.charCodeAt(i);
        if (str[i] == "_")
        {
            continue;
        }
        if (i==0 && (code > 47 && code < 58))
        {
            return false;
        }
       if (!(code > 47 && code < 58) && // numeric (0-9)
            !(code > 64 && code < 91) && // upper alpha (A-Z)
            !(code > 96 && code < 123)   // lower alpha (a-z)

             )
        {
            return false;
        }
    }
    return true;
 }



function includeHTML() {
    var z, i, elmnt, file, xhttp;
    /*loop through a collection of all HTML elements:*/
    z = document.getElementsByTagName("*");
    for (i = 0; i < z.length; i++) {
      elmnt = z[i];
      /*search for elements with a certain atrribute:*/
      file = elmnt.getAttribute("w3-include-html");
      if (file) {
        /*make an HTTP request using the attribute value as the file name:*/
        xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
          if (this.readyState == 4) {
            if (this.status == 200) {elmnt.innerHTML = this.responseText;}
            if (this.status == 404) {elmnt.innerHTML = "Page not found.";}
            /*remove the attribute, and call this function once more:*/
            elmnt.removeAttribute("w3-include-html");
            includeHTML();
          }
        };
        xhttp.open("GET", file, true);
        xhttp.send();
        /*exit the function:*/
        return;
      }
    }
  }

  function UpdateEnumList(textlist) {
    textlist.value="";
    var EnumList=retrieveFromJson('AbstractEnumerations');
    if (EnumList != null)
    {
        for (var k in EnumList)
        {
            textlist.value+=EnumList[k].Name+"\n";
        }
    }
}
function getSelection(inputArea) {
    var start = inputArea.selectionStart;
    var finish = inputArea.selectionEnd;
    var sel = inputArea.value.substring(start, finish);
    return sel;
  }
function retrieveFromJson(key) {
  var currentCU=localStorage.getItem('controlUnit');
  if (currentCU==null)
    return;
  try
  {
    var JSonObj=JSON.parse(currentCU);
    return JSonObj[key];
  }
  catch (e) {alert(e);return null;}
}

function UpdateJsonCU(key,JsonValue) {
  var currentCU=localStorage.getItem('controlUnit');
  try
  {
    
    var JSonObj=JSON.parse(currentCU);
    JSonObj[key]=JsonValue;
    localStorage.setItem('controlUnit',JSON.stringify(JSonObj));

  }
  catch (e) {alert(e);}
}



class FileWriter {
  //WriteArea
  //indentString;
  //FileName
  constructor(filestring,filename)
  {
    this.WriteArea=filestring;
    this.FileName=filename;
    this.indentString="";
  }
  Write(what) { this.WriteArea+=this.indentString+what;}
  WriteNoInd(what) { this.WriteArea+=what;}
  WriteLineNoInd(what) { this.WriteArea+=what+"\n";}
  PrintFunctionPrototype( retType,fname,parameters)
  {
			   this.Write(retType+" ");
			   this.WriteNoInd(fname+"(");
			   this.WriteLineNoInd(parameters+");");
		}


  WriteLine(what) {
    if (what==null)
      what="";
    this.WriteArea+=this.indentString+what+"\n";
  }
  getFileContent() { return this.WriteArea;}
  addIndent(n) {
    if (n==null)
       n=1;
    for (var i=0; i<n;i++)
      this.indentString+="\t";
  }
  addIndent() {
    this.indentString+="\t";
  }
  delIndent() {
    
    if (this.indentString.length>0)
    {
      
      this.indentString=this.indentString.substring(0,this.indentString.length-1);
    }
    else this.indentString="";
  }
  delIndent(n) {
    if (n==null)
       n=1;
    for (var i=0; i < n;++i)
    {
        if (this.indentString.length>0)
        {
          
          this.indentString=this.indentString.substring(0,this.indentString.length-1);
        }
        else
        { 
           this.indentString="";
           break;
        }
    }

  }
  getIndentCount() { return this.indentString.length;}
}


module.exports = controlUnit;

module.exports = FileWriter;

