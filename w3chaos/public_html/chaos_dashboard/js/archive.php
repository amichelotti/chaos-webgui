/*
 * ARCHIVE
 */

var zone_selected = "";     //zona selezionata ad es.BTF; questa variabile è usata anche in mag_command.js
var cu_selected = "";
var ok_cu = [];
var chan = '';

console.log("ciao");

$(document).ready(function() {
    var cu = [];
    //var url_cu = "";
    var zones = [];
    
    console.log("ciao");

    
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
   // $.get("http://" + location.host + ":8081/CU?cmd=search&parm={'name': ' ' , 'what': 'zone', 'alive':true}", function(datazone,textStatus) {
    $.get("http://" + <?php echo $url_server; ?> + ":" + <?php echo $n_port; ?> + "/CU?cmd=search&parm={'name': ' ' , 'what': 'zone', 'alive':true}", function(datazone,textStatus) {

    console.log("prova una " + '<?php echo $url_server; ?>' + "porta " +  '<?php echo $url_server; ?>');
    
    
        zones = $.parseJSON(datazone);
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
          $.get("http://" + location.host + ":8081/CU?cmd=search&parm={'name':'" + zone_selected + "','what':'class','alive':true}", function(datael, textStatus) {
            cu_list = $.parseJSON(datael);
	    //cu_list = datael;
            element_sel('#elements-archive', cu_list,0);
        });
	  	  
	  
    });
    
    
	

    //Get per prendere i dati delle cu selezionate
    var cu_effettive = [];
    $("#elements-archive").change(function() {
         cu_selected = $("#elements-archive option:selected").val();
	 
	 console.log("aaaaa " + cu_selected);
        
        if (cu_selected == "--Select--" || zone_selected == "--Select--" ) {
            $(".btn-main-function").hasClass("disabled")
        } else {
            $(".btn-main-function").removeClass("disabled")
        }
	
	//console.log("cu_selected " + cu_selected + "zone selected " + zone_selected);
        if(jQuery.inArray(cu_selected, cu_effettive) == -1) {
            $.ajax({
                url: "http://" + location.host + ":8081/CU?cmd=search&parm={'name':'" + zone_selected + "/" + cu_selected + "','what':'cu','alive':true}",
                async: false
            }).done(function(datall, textStatus) {
                cu = $.parseJSON(datall);
		console.log("cccc " + cu);

		element_sel('#CUs-archive', cu,0);
            });
        }
	

	
	}); // *** element list change
    
    
    
    var cu_selezionata = [];
    var channel = [];
    var old_str = '';
    var cu_data = '';
    var channel = [];
    $("#CUs-archive").change(function() {
         cu_selezionata = $("#CUs-archive option:selected").val();
	 
	if (zone_selected == "--Select--") {        //Disabilito la select dei magneti se non è selezionata la zona
            $("#elements-archive").attr('disabled','disabled');
        } else {
            $("#elements-archive").removeAttr('disabled');
        }

	 
	 console.log("diim " + cu_selezionata);
	 
	$.get("http://" + location.host + ":8081/CU?dev="+ cu_selezionata + "&cmd=channel&parm=-1", function(datavalue,textStatus) {
	
	 old_str = datavalue.replace(/\$numberLong/g, 'numberLong');
	//console.log("datavalue " + datavalue);
	cu_data = $.parseJSON(old_str);
	//console.log("cu_data " + cu_data);
	$.each(cu_data, function(key, value){
	    $.each(value, function(key, value_due){
				
		//console.log("valueee " + value);
		channel.push(key);
	    });
	});
	
	//console.log("channel total " + channel);
	
	
	//per rimuovere gli ultimi 3 canali
	var removed = channel.splice(7, 3);
	
	//console.log("value due " + removed);
	
	element_sel('#channel', channel,0);

    
	 });
	
    });
    
    
    var data_output = '';
    var element_channel = [];
    $("#channel").change(function() {
         chan = $("#channel option:selected").val();
	 
	 element_channel = [];
	 
	 if (channel == "--Select--") {        //Disabilito la select dei magneti se non è selezionata la zona
            $("#elements-archive").attr('disabled','disabled');
        } else {
            $("#elements-archive").removeAttr('disabled');
        }

	 
	// console.log("booo " + chan);

	    data_output = cu_data[0][chan];
	    
	     $.each(data_output, function(key, value){
		
		if (jQuery.type(value) === "number" || jQuery.type(value) === "boolean") {  // per escludere i numberlong e le stringhe
		    
		    element_channel.push(key);

		}
		
	    }); 
	 
	    
	    element_sel('#variable', element_channel, 0);

	    
    });
    
    
    
    
  
     
});   //*** main function


$(function() {
    $('.dataRange').daterangepicker({
	
        timePicker: true,
        timePickerIncrement: 15,
        locale: {
            format: 'MM/DD/YYYY h:mm A'
        },
	singleDatePicker: true,
	startDate : moment().format('MM/DD/YYYY'),
        endDate : moment().format('MM/DD/YYYY')

    });
});


var StartDate = 0;
var EndDate = 0;
var startDate_tmp = 0;
var endDate_tmp = 0;
var uid = 0;

$("#plot-view").click(function(){
    
    console.log("ciaaoaoao");
    
    var AMPstart = 0;
    var AMPend = 0;
 
    StartDate = $("#startDate").val();
    EndDate = $("#endDate").val();
    
    //console.log("timestamp aaa" + StartDate);
    
    
    StartDate = StartDate.match(/(\d+)\/(\d+)\/(\d+) (\d+):(\d+) ([AMP]+)/);
    EndDate = EndDate.match(/(\d+)\/(\d+)\/(\d+) (\d+):(\d+) ([AMP]+)/);
    
    if (StartDate[6] == "PM") {
	var tmp_start = parseInt(StartDate[4]);
	AMPstart = tmp_start + 12;
    } else {
	AMPstart = StartDate[4];
    } 
    
    
    if (EndDate[6] == "PM") {
	var tmp_end = parseInt(EndDate[4]);
	AMPend = tmp_end + 12;
    } else {
	AMPend = EndDate[4];
    }

    StartDate =  Date.UTC(StartDate[3],parseInt(StartDate[1])-1,StartDate[2],AMPstart,StartDate[5]);
    EndDate = Date.UTC(EndDate[3],parseInt(EndDate[1])-1,EndDate[2],AMPend,EndDate[5]);
    
    
    console.log("start " + StartDate);
    console.log("end " + EndDate);
    
 /*   $.get("http://" + location.host + ':8081/CU?dev=LUMINOMETER/CAEN775&cmd=queryhst&parm={"start":' + StartDate + ',"end":' + EndDate + ',"page":1}', function(datavalue, textStatus) {

        var old_str = datavalue.replace(/\$numberLong/g, 'numberLong');
	
	console.log("old_str " + old_str);
	
	var hist = $.parseJSON(old_str);
	
	console.log("uno  " + hist[0] +  "due " + hist[0].uid);
	
	uid = hist[0].uid;
	
    }); */
    
    
   // action(uid);
    
    
    /*do {
	
	$.get("http://" + location.host + ':8081/CU?dev=LUMINOMETER/CAEN775&cmd=queryhstnext&parm={"uid":' + uid + "}" , function(data, textStatus) {
	
	uid ++ ;
	console.log("uidddd " + uid);
	
	console.log("aaaa ");
	
	});
	
    } while (uid != "0") */
    
/*var text = "";
var i = 0;
do {
    text += "The number is " + i;
    i++;
}
while (i < 5); */
	
	/*var hist_data = hist[0].data;
	
	for(var i=0; i< hist_data.length; i ++) {
	    
	    delete hist_data[i].busy;
	    delete hist_data[i].device_alarm;
	    delete hist_data[i].cu_alarm;
	    delete hist_data[i].ndk_uid;
	    delete hist_data[i].dpck_seq_id;
	    delete hist_data[i].dpck_ds_type;
	    delete hist_data[i].ndk_uid;
	} */
	
	
    /*if(hist_data == '')
            return;
        JSONToCSVConvertor(hist_data,"Luminometer", true);  */


   // });
  
});

    
