/*
 * ARCHIVE
 */

var zone_selected = "";     //zona selezionata ad es.BTF; questa variabile è usata anche in mag_command.js
var cu_selected = "";
var ok_cu = [];
var chan = '';
var variableToPlot ='';
var cuToPlot = [];


$(document).ready(function() {
    var cu = [];
    var zones = [];
     
     
    /* function to remove element from array */ 
    Array.prototype.remove = function(){
    var args = Array.apply(null, arguments);
    var indices = [];
    for(var i = 0; i < args.length; i++){
        var arg = args[i];
        var index = this.indexOf(arg);
        while(index > -1){
            indices.push(index);
            index = this.indexOf(arg, index + 1);
        }
    }
    indices.sort();
    for(var i = 0; i < indices.length; i++){
        var index = indices[i] - i;
        this.splice(index, 1);
    }    
}
    
    
      //Funzione per riempire le select(quella delle zone, e quella degli alimentatori)
    function element_sel(field, arr, add_all) {
        $(field).empty();
        $(field).append("<option>--Select--</option>");
	//$(field).append("<option value='ALL'>ALL</option>");

        if(add_all == 1) {
            $(field).append("<option value='ALL'>ALL</option>");	    
        }  
        $(arr).each(function(i) {	    
	    $(field).append("<option value='" + arr[i] + "'>" + arr[i] + "</option>");     
        });
        
    }
    
  
    //Query a chaos per prendere la zona selezionata
    jchaos.search("", "zone", false, function (zones) {
//    $.get("http://" + url_server + ":" + n_port + "/CU?cmd=search&parm={'name': ' ' , 'what': 'zone', 'alive':false}", function(datazone,textStatus) {
       // zones = $.parseJSON(datazone);
        element_sel('#zones-archive', zones, 1);
    });
    
    //Query a chaos per prendere la lista dei magneti
    var cu_list = [];
    $("#zones-archive").change(function() {
        zone_selected = $("#zones-archive option:selected").val();
        if (zone_selected == "--Select--") {        //Disabilito la select dei magneti se non è selezionata la zona
            $("#elements-archive").attr('disabled','disabled');
        } else {
            $("#elements-archive").removeAttr('disabled');
        }
	jchaos.search(zone_selected, "class", false, function (cu_list) {
         // $.get("http://" +  url_server + ":" + n_port +"/CU?cmd=search&parm={'name':'" + zone_selected + "','what':'class','alive':false}", function(datael, textStatus) {
           // cu_list = $.parseJSON(datael);
            element_sel('#elements-archive', cu_list,0);
        });
	  	    
    });
    

    //Get per prendere i dati delle cu selezionate
    var cu_effettive = [];
    $("#elements-archive").change(function() {
         cu_selected = $("#elements-archive option:selected").val();
	 
	 //console.log("aaaaa " + cu_selected);
        
        if (cu_selected == "--Select--" || zone_selected == "--Select--" ) {
            $(".btn-main-function").hasClass("disabled")
        } else {
            $(".btn-main-function").removeClass("disabled")
        }
	
	//console.log("cu_selected " + cu_selected + "zone selected " + zone_selected);
        /*if(jQuery.inArray(cu_selected, cu_effettive) == -1) {
            $.ajax({
                url: "http://"+  url_server + ":" + n_port +"/CU?cmd=search&parm={'name':'" + zone_selected + "/" + cu_selected + "','what':'cu','alive':false}",
                async: false
            }).done(function(datall, textStatus) {
                cu = $.parseJSON(datall);
		element_sel('#CUs-archive', cu,0);
            });
        } */
	
	if(jQuery.inArray(cu_selected, cu_effettive) == -1) {
		jchaos.search(zone_selected + "/" + cu_selected,"cu",false,function (cu) {
		    element_sel('#CUs-archive', cu,0);
            });
        } 

	
    }); // *** element list change
    
    
    
    var channel = [];
    var old_str = '';
    //var cu_data = '';
    var cu_data = [];
    var channel = [];
    $("#CUs-archive").change(function() {
         cuToPlot = $("#CUs-archive option:selected").val();
	 
	 channel = [];
	 
	if (zone_selected == "--Select--") {        //Disabilito la select dei magneti se non è selezionata la zona
            $("#elements-archive").attr('disabled','disabled');
        } else {
            $("#elements-archive").removeAttr('disabled');
        }

	 
	 
	$.get("http://" +  url_server + ":" + n_port +"/CU?dev="+ cuToPlot + "&cmd=channel&parm=-1", function(datavalue,textStatus) {
	    old_str = datavalue.replace(/\$numberLong/g, 'numberLong');
	    cu_data = $.parseJSON(old_str);
	    $.each(cu_data, function(key, value){
	        $.each(value, function(key, value_due){
		    channel.push(key);
		});
	    });
	
	    channel.remove("dev_status","log_status","error_status");
	    element_sel('#channel', channel,0);
 
	}); 
	
	
	/*jchaos.getChannel(cuToPlot, -1, function (cu_data) {
	    $.each(cu_data, function(key, value){
	        $.each(value, function(key, value_due){
		    //console.log("key2 " + key + " value 2 " + value_due);
		    channel.push(key);
		});
		//console.log("channel " + channel);
	    });
	
	    channel.remove("dev_status","log_status","error_status");
	    element_sel('#channel', channel,0);
 
	}); */

	
	
    }); 
    
    
    //var data_output = '';
    var data_output;

    var element_channel = [];
    $("#channel").change(function() {
		
         chan = $("#channel option:selected").val();
	 
	 element_channel = [];
	 
	 if (channel == "--Select--") {        //Disabilito la select dei magneti se non è selezionata la zona
            $("#elements-archive").attr('disabled','disabled');
        } else {
            $("#elements-archive").removeAttr('disabled');
        }

	//console.log("chan " + chan + " cu_data " + cu_data);
	    data_output = cu_data[0][chan];
	   // data_output = cu_data[chan];
	    //console.log("data output " + data_output);
	    
	    $.each(data_output, function(key, value){
		
		if (jQuery.type(value) === "number" || jQuery.type(value) === "boolean" || jQuery.type(value) === "array" || jQuery.type(value) === "object") {  // per escludere i numberlong e le stringhe
		    element_channel.push(key);
		}
		
	    }); 
	 
	    
	    element_sel('#variable', element_channel, 0);
	    
    });
    
  
     
});   //*** main function


