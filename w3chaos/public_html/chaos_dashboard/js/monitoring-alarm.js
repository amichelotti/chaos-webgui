function show_fatal_error(id) {
    var id_fatal_error = id.split("-")[1];
    //var name_cu_fe = $("#name_element_" + id_fatal_error).text();
    decodeFatalError(cu_cache[id_fatal_error].health.ndk_uid,cu_cache[id_fatal_error].health.nh_lem,cu_cache[id_fatal_error].health.nh_led);    
}

function decodeFatalError(nameCu,status_msg,FEmessagge,domMessage) {
    $("#name-FE-device").html(nameCu);
    $("#status_message").html(status_msg);

    $("#error_message").html(FEmessagge);
    $("#error_domain").html(domMessage);

    
}


function show_dev_alarm(id) {
    var id_device_alarm = id.split("-")[1];
    decodeDeviceAlarm(cu_cache[id_device_alarm].device_alarms);   
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
    var id_cu_alarm = id.split('-')[1];
    decodeCUAlarm(cu_cache[id_cu_alarm].cu_alarms);   
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


function openViewIO() {
    $("#name-cu-io").html(selected_device.health.ndk_uid)
    
    $('#json-renderer').jsonViewer(selected_device,{
        collapsed: false,
        withQuotes: true

   });
	
	$("#mdl-io-cu").modal()
    

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
	openViewIO();
    }
});
