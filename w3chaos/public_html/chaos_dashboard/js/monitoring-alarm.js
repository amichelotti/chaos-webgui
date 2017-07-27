function show_fatal_error(id) {
    var id_fatal_error = id.split("_")[1];
    var name_cu_fe = $("#name_element_" + id_fatal_error).text();
    decodeFatalError(name_cu_fe,colm_fl_state[id_fatal_error],fat_err[id_fatal_error],dom_err[id_fatal_error]);    
}

function decodeFatalError(nameCu,status_msg,FEmessagge,domMessage) {
    $("#name-FE-device").html(nameCu);
    $("#status_message").html(status_msg);

    $("#error_message").html(FEmessagge);
    $("#error_domain").html(domMessage);

    
}


function show_dev_alarm(id) {
    var id_device_alarm = id.split("_")[1];
    decodeDeviceAlarm(device_alarms[id_device_alarm]);   
}
    
    
function decodeDeviceAlarm(dev_alarm) {
        $("#table_device_alarm").find("tr:gt(0)").remove();
	$("#name-device-alarm").html(dev_alarm.ndk_uid);

        $.each(dev_alarm, function(key, value){
        if (key != "ndk_uid"  && key != "dpck_seq_id" && key != "dpck_ats" && key !="dpck_ds_type") {
            switch (value) {
                case 1:   
                    $("#table_device_alarm").append('<tr><td class="warning_value">'+ key + '</td><td class="warning_value">'+ value +'</td></tr>');
                    break;
                case 2:
                    $("#table_device_alarm").append('<tr><td style="color:red;">'+ key + '</td><td style="color:red;">'+ value +'</td></tr>');
                    break;
                default: 
                    $("#table_device_alarm").append('<tr><td>'+ key + '</td><td>'+ value +'</td></tr>');
            }
        }  
    });  
}


function show_cu_alarm(id) {
    var id_cu_alarm = id.split("_")[1];
    decodeCUAlarm(cu_alarms[id_cu_alarm]);   
}
    
    
function decodeCUAlarm(cu_alarm) {
        $("#table_cu_alarm").find("tr:gt(0)").remove();
	$("#name-cu-alarm").html(cu_alarm.ndk_uid);

        $.each(cu_alarm, function(key, value){
        if (key != "ndk_uid"  && key != "dpck_seq_id" && key != "dpck_ats" && key !="dpck_ds_type") {
            switch (value) {
                case 1:   
                    $("#table_cu_alarm").append('<tr><td class="warning_value">'+ key + '</td><td class="warning_value">'+ value +'</td></tr>');
                    break;
                case 2:
                    $("#table_cu_alarm").append('<tr><td style="color:red;">'+ key + '</td><td style="color:red;">'+ value +'</td></tr>');
                    break;
                default: 
                    $("#table_cu_alarm").append('<tr><td>'+ key + '</td><td>'+ value +'</td></tr>');
            }
        }  
    });  
}


function openViewIO(cu) {
    $("#table_cu_in").find("tr:gt(0)").remove();
    $("#table_cu_out").find("tr:gt(0)").remove();
     // jchaos.getChannel(cu, -1, function (datavalue) {   //risposta

     // console.log("datavlaueee "  + "cuccc " + cu);
      
    $.get("http://" +  url_server + ":" + n_port +"/CU?dev="+ cu + "&cmd=channel&parm=-1", function(datavalue,textStatus) {
	
	var old_str = datavalue.replace(/\$numberLong/g, 'numberLong');
	//console.log("datavalue " + datavalue);
	var cu_data = $.parseJSON(old_str);
	
	var output_data = cu_data[0].output;
	
	var input_data = cu_data[0].input;	
	
	$("#name-cu-io").html(cu);	
	
	var textToInsertOut = '';
	$.each(output_data, function(key, value) {
	    
	    if(typeof value =='object') {
		$.each(value, function(key, value){
		    textToInsertOut  += '<tr><td>' + key + '</td><td>'+ value+'</td></tr>';
		});
	    } else
	    
	    textToInsertOut  += '<tr><td>' + key + '</td><td>'+ value+'</td></tr>';
	});
	$("#table_cu_out").append(textToInsertOut);	
	
	var textToInsertIn = '';
	$.each(input_data, function(key, value) {
	    
	    if(typeof value =='object') {
		$.each(value, function(key, value){
		    textToInsertIn  += '<tr><td>' + key + '</td><td>'+ value+'</td></tr>';
		});
	    } else
	    textToInsertIn  += '<tr><td>' + key + '</td><td>'+ value+'</td></tr>';
	});
	$("#table_cu_in").append(textToInsertIn);

	
	$("#mdl-io-cu").modal()
    
    });
}

$(document).on("click", ".name_element", function(e) {
//$(document).on("click", "#main_table_cu tr", function(e) {
    var selected = $(this).hasClass("row_selected");
    $(".name_element").removeClass("row_selected");
   // $("#main_table_cu tr").removeClass("row_selected");
    if (!selected) {
        $(this).addClass("row_selected");
	   num_row = $(this).parent().index();
      //  num_row = this.rowIndex;
      //  num_row = num_row - 1;  // per far partire il conteggio da 1 e non da 0
	name_cu = $("#name_element_" + num_row).text();
	openViewIO(name_cu);
    }
});
