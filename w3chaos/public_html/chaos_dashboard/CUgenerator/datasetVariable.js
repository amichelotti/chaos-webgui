
class datasetVariable {
   //Name
   //description
   //allowed ?
   //Type
   //DataDirection
   //HaveHandler
   //SizeVector
  
       constructor(nome,description) {
        if (this.checkName(nome))
        {
            this.Name=nome;
            this.Description=description;
        }
        else
        {
            this.Name="";
            this.Description="";
        }
    }
    checkName(nom) {
        if (nom.indexOf("/") > -1)
        return false;
        else return true;
    }
    IsVector() {  
        if ((this.SizeVector!=null)&& (this.SizeVector>1))
            return true;
        else return false;
    }


    IsInput() {
        
        if ((this.DataDirection=="Input") || (this.DataDirection=="Bidirectional"))
        return true;
        else
        return false;
    }
}

DeduceCPPType= function(Type)
{
    if (Type == "TYPE_INT32") return "int32_t";
    if (Type == "TYPE_STRING") return "std::string";
    if (Type == "TYPE_INT64") return "int64_t";
    if (Type == "TYPE_BOOLEAN") return "bool";
    if (Type == "TYPE_DOUBLE") return "double";

    return "";

};


DataSetToString = function(attrib) {
   return attrib.Name+ " "+ attrib.Type + " "+attrib.DataDirection+ " "+attrib.HaveHandler;
};

getCNameForChaosType= function(type) {
    if (type.includes("INT32"))
        return "int32_t";
    if (type.includes("INT64"))
        return "int64_t";
    if (type.includes("BOOLEAN"))
        return "bool";
    if (type.includes("DOUBLE"))
        return "double";
    return "unknown";
};


DTcreate = function (obj) {
    var field = new datasetVariable("ll","aa");
    for (var prop in obj) {
       // if (field.hasOwnProperty(prop)) {
            field[prop] = obj[prop];
       // }
    }
    return field;
};



module.exports = datasetVariable;