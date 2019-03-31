class CUCommand {
    //Name
    //Description
    //Default
    //isInterfaceCommand
    //Parameters
    constructor() {}
    CreateFunctionPrototype(nms)     {
        if (nms==null)
            nms="";
      var  ret="int ";
      if (nms != "")
          ret += nms + "::";
      ret+= this.Name+"(";
      var first=true;
      for (var   p in this.Parameters)
      {
          var par=this.Parameters[p];
          if (!first)
              ret+=",";
          else
              first=false;
          if ((par.Type.includes("string")) || (par.Type.startsWith("vector<")))
          {
              ret+="std::";
          }

          ret += par.Type +" "+par.Name;
      }
      ret+=")";
      return ret;
   }
}

getOpCode =function(cmd) {
            var  ret;
            ret = "OP_";
            ret += cmd.Name.toUpperCase();
            return ret;
};


CMDcreate= function(obj) {
    var field = new CUCommand();
    for (var prop in obj) {
        field[prop] = obj[prop];
    }
    return field;
   }


    CUCommandToString = function(command) {
    
    var  toRet=command.Name+ " (";
    for (var k in command.Parameters)
    {
        
        var param=command.Parameters[k];
        toRet+=CmdParameterToString(param)+" ";
    }
    toRet+=")";
    if (command.isInterfaceCommand)
      toRet+= "\t UI ";
    return toRet;
   
};
getCommandAlias= function (Prefix,cmdName) {
    return "CMD_"+ Prefix.toUpperCase()+"_"+cmdName.toUpperCase()+"_ALIAS";
};

getParamsTypeString= function(cmd) {
    var first=true;
    var ret="";
    for (var i in cmd.Parameters)
    {
        if (!first)
           ret+=" ";
        else
            first=false;

        ret+=cmd.Parameters[i].Type;
    }
    return ret;
};
class CmdParameter {
  //Name
  //Description
  //Type
  //Mandatory
    constructor(nome,desc,tipo,mandat)
    {
        this.Name=nome;
        this.Description=desc;
        this.Type=tipo;
        this.Mandatory=mandat;
    }
    isPointer() {return this.Type.includes('*');}


    isOutput() {
        if ((this.Type.includes("&")) || (this.Type.includes("*")))
        return true;
    return false;
    }

    getParamAlias(CUprefix,cmdName) {
        return "CMD_" + CUprefix.toUpperCase() + "_" + cmdName.toUpperCase() + "_" + this.Name.toUpperCase();
    }


}//end class
CmdParameterToString = function(par) {
    return par.Name+ " "+ par.Type;
 };
 CPARcreate = function (obj) {
    var field = new CmdParameter("a","b","c",true);
    for (var prop in obj) {
       if (field.hasOwnProperty(prop)) {
            field[prop] = obj[prop];
        }
    }
    return field;
  };

  getAddingDataWrapperFunction = function(inputType) {
        var retStr=getRetrievingDataWrapperFunction(inputType);
        return retStr.replace("get", "add");
  };

  getRetrievingDataWrapperFunction= function(type) {

      if ((type == "double") || (type =="float"))
        return "getDoubleValue";
      else if ((type == "int") || (type=="int32_t"))
        return "getInt32Value";
      else if ((type=="int64_t") || (type=="long int"))
        return "getInt64Value";
        else if (type.includes("tring"))
          return "getStringValue";
          else return "";

  };
 class ChaosAlarms {
     //Name string
     //Description string
     //CUAlarm bool
     constructor(nome,desc,isCUAlarm) {
         this.Name=nome;
         this.Description=desc;
         this.CUAlarm=isCUAlarm;
     }
 }
 ChaosAlarmsToString= function(alarm) {
     var ret= alarm.Name + " ";
     ret+= (alarm.CUAlarm)? "CU" : "DEV";
     return ret;
 };
class ChaosEnumerations {
   //Name
   //Values []
   //BitwiseOrdered bool
   constructor(nome,bitwise) {
       this.Name=nome;
       this.Values=[];
       this.BitwiseOrdered=bitwise;
   }
}
class NumberForTypePair{
    constructor() {
        this.Type="";
        this.needed=0;
    }
}
getStandardNameForTypedVariable= function(type) {
    var ret;
    ret=type.trim();
    ret=ret.replace('&','E');
    ret=ret.replace('*','P');
    ret=ret.replace(' ','_');
    ret=ret.replace('<','_');
    ret=ret.replace('>','_');
    return ret;
}

NTPcreate = function(obj) {
    var field = new NumberForTypePair();
    for (var prop in obj) {
       if (field.hasOwnProperty(prop)) {
            field[prop] = obj[prop];
        }
    }
    return field;
};





module.exports = CUCommand;
module.exports = CmdParameter;
module.exports = ChaosAlarms;
module.exports = ChaosEnumerations;
module.exports = NumberForTypePair;
