/*
 * GESTIONE DEI POPUP
 */

var alarm;


/*function decodeTotalAlarm(alarms) {
        
    $("#table_device_alarm").find("tr:gt(0)").remove();
    $("#popup_alarm h5 span").html(alarms.ndk_uid)

    $.each(alarms, function(key, value){
        if (key != "ndk_uid"  && key != "dpck_seq_id" && key != "dpck_ats" && key !="dpck_ds_type") {
            switch (value) {
                case 1:   
                    $("#table_error").append('<tr><td style="color:#CCCC00;" class="col s7 m7 l7">'+ key + '</td><td style="text-align:center;color: #CCCC00;"class="col s3 m3 l3">'+ value +'</td></tr>');
                    break;
                case 2:
                    $("#table_error").append('<tr><td style="color:red;" class="col s7 m7 l7">'+ key + '</td><td style="text-align:center;color:red;"class="col s3 m3 l3">'+ value +'</td></tr>');
                    break;
                default: 
                    $("#table_error").append('<tr><td class="col s7 m7 l7">'+ key + '</td><td style="text-align: center;"class="col s3 m3 l3">'+ value +'</td></tr>');
            }
        }  
    });  
} */


/*function openSaveDataset() {
    $('#popup-save').bPopup();
} */

    
function saveDataset(nameDataset) {
    var table_length = $('#main_table_scrapers tr').length;
    var elementToSave = [];
    var url_element_toSave = [];
    
    for(var i = 0; i<table_length ; i++) {  
        elementToSave.push($("#name_element_" + i).text());
    }
    url_element_toSave = JSON.stringify(elementToSave);
    $.get("http://" + location.host + ":8081/CU?cmd=snapshot&parm={'name':'"+ zone_selected + "/" + elements_selected + "/" + nameDataset +"','what':'create','node_list':"
                +  url_element_toSave + "}"); 
    //alert("Dataset saved");
}

function openGlobalLoad() {
    var list = "";
    var name_dataset;
    $("#no-results").remove();
    $("#table_dataset").find("tr:gt(0)").remove();

    
    var url_list_dataset = zone_selected + "/" +  elements_selected + "/";    
    //var tmp_search = "";
    
    /*switch (url_list_dataset) {
        case "BTF/DIPOLE/":
            tmp_search = url_list_dataset;
            break;
        case "BTF/QUADRUPOLE/":
            tmp_search = url_list_dataset;
            break;
        case "BTF/CORRECTOR/" :
            tmp_search = url_list_dataset;
            break;
        case "BTF/ALL/" :
            tmp_search = url_list_dataset;
            break;        
    } */
    
    //console.log("8081/CU?cmd=search&parm={'name':'"+ tmp_search +"','what':'snapshots'}");
    

    $.get("http://" + location.host + ":8081/CU?cmd=search&parm={'name':'"+ url_list_dataset +"','what':'snapshots'}", function(data, textStatus) {
        
        list = $.parseJSON(data);
        
        if (list.length == 0) {
            $('#table_dataset').append('<p id="no-results">No results</p>');
        } else {
        
            list.forEach(function(dataset, index) {
                var date = new Date(dataset.ts);
                $('#table_dataset').append('<tr><td>' + date + '</td><td id="nome_ds_save_' + index + '">' + dataset.name +
                                            '</td></tr>');
            });
        }
    });
}



var list_node = [];
function openViewDataset(name_dataset) {
    $('#mdl-into-load').modal('show');
    $("#name_dataset").html(name_dataset);
    
    $.ajax ({
	url: "http://" + location.host + ":8081/CU?cmd=search&parm={'name':'" + name_dataset + "','what':'insnapshot'}",
	async: false
    }).done(function(data,textStatus) {
	    list_node = data;
	    console.log("list node " + list_node);
	    intoDataset(name_dataset,list_node);    
    });
}




var colm_load_element = [];
var colm_load_setting = [];
var colm_load_status = [];
function intoDataset(nameds,node) {
    
    $.get("http://" + location.host + ":8081/CU?cmd=snapshot&parm={'name':'" + nameds + "','what':'load','node_list': " + node + "}", function(data, textStatus) {
        
        console.log("http://" + location.host + ":8081/CU?cmd=snapshot&parm={'name':'" + nameds + "','what':'load','node_list': " + node + "}");
        var obj_dataset = data.replace(/\$numberLong/g, 'numberLong');
        obj_dataset = $.parseJSON(data);
	
	console.log("dataaa " + obj_dataset);
        
        try {
    
            colm_load_element = [];
            colm_load_setting = [];
            colm_load_status = [];
            
            obj_dataset.forEach(function(element) {
                
                colm_load_element.push(element.output.ndk_uid);
                colm_load_setting.push(element.input.position);
                colm_load_status.push(element.input.powerOn);
            });
            
        } catch(e) {
                    alert("Error status");
                    console.log("errore parsing" + e.message);
                }
        $("#table_into_dataset").find("tr:gt(0)").remove();
        
        for (i = 0; i<colm_load_element.length; i++ ){
        
            $("#table_into_dataset").append('<tr id="tr_load_'+[i] +'"><td id="td_load_element_'+[i]+'"></td><td id="td_load_position_'+[i]
                                            +'"></td><td id="td_load_status_'+[i]+'"></td></tr>');
        }

            for(var i = 0; i <colm_load_element.length; i++) {
                $('#td_load_element_' + i).html(colm_load_element[i]);
                $('#td_load_position_' + i).html(colm_load_setting[i]);
            }    
                
            for(var i = 0; i <colm_load_status.length; i++) {
                switch (colm_load_status[i]) {
                    case true:
                        $("#td_load_status_" + i).html('<i class="material-icons verde">trending_down</i>');
                        break;
                    case false:
                        $("#td_load_status_" + i).html('<i class="material-icons rosso">pause_circle_outline</i>');
                        break;        
                }
            } 
    }); 
    
}


var name_file_ds;
$(document).on("click", "#table_dataset tr", function(e) {
    var selected = $(this).hasClass("row_selected");
    $("#table_dataset tr").removeClass("row_selected");
    if (!selected) {
        $(this).addClass("row_selected");
        num_row = this.rowIndex;
        num_row = num_row - 1;  // per far partire il conteggio da 1 e non da 0
        name_file_ds = $("#nome_ds_save_" + num_row).text();
        openViewDataset(name_file_ds);
    }
});



/*function open_popup_alarm_mag(index) {
    $('#popup_magnets').bPopup();
    var id_alarm_mag = index.split("_")[1];
    decodeError(tot_alarm[id_alarm_mag]);
} */


/*function decodeError(alarm) {
    $("#table_error_magnets").empty();
    for (var a = 0; a < 32; a++) {
        var bit = alarm & (1<<a);
        if (bit) {
            $("#table_error_magnets").append('<tr><td>' + decodeAlarm(bit) + '</td></tr>');
        }
    }
} */

/*function checkCommunicationFailure(alarm) {
    if (alarm & (1<<6)) {
        return 1;    
    }
        return 0;
} */

// decodifica dell'errore
/*function decodeAlarm(alarm) {
    
    switch (alarm) {
        case 1:                                        //        1
            return "(0) " + " door open";         
        case 2:                                        //        2
            return "(1) " + "over temperature";
        case 0x4:                                      //        4
            return "(2) " + "fuse fault";
        case 0x8:                                      //        8
            return "(3) " + "earth fault";
        case 0x10:                                     //       16
            return "(4) " + "over voltage";
        case 0x20:                                     //       32
            return "(5) " + "over current";
        case 0x40:                                     //       64
            return "(6) " + "communication failure";
        case 0x80:                                     //      128
            return "(7) " + "main unit fault";
        case 0x100:                                    //      256
            return "(8) " + "external interlock";
        case 0x200:                                    //      512
            return "(9) " + "set point card fault";
        case 0x400:                                    //     1024
            return "(10) " + "cubicle fault";
        case 0x800:                                    //     2048
            return "(11) " + "DCCT OVT";
        case 0x1000:                                   //     4096
            return "(12) " + "DCCT FAULT";
        case 0x2000:                                   //     8192
            return "(13) " + "active filter fuse";
        case 0x4000:                                   //    16384
            return "(14) " + "active filter fuse OVT";
        case 0x8000:                                   //    32768
            return "(15) " + "diode OVT";
        case 0x10000:                                  //    65536
            return "(16) " + "diode fault";
        case 0x20000:                                  //   131072
            return "(17) " + "AC issue";
        case 0x40000:                                  //   262144
            return "(18) " + "phase loss";
        case 0x80000:                                  //   524288
            return "(19) " + "air flow";
        case 0x100000:                                 //  1048576
            return "(20) " + "transformer OVT";
        case 0x200000:                                 //  2097152
            return "(21) " + "snubber fuse";
        case 0x400000:                                 //  4194304
            return "(22) " + "SCR fuse";
        case 0x800000:                                 //  8388608
            return "(23) " + "SCR OVT";
        case 0x1000000:                                // 16777216
            return "(24) " + "choke OVT";
        case 0x2000000:                                // 33554432
            return "(25) " + "pass filter";
        case 0x4000000:                                // 67108864
        default:
            return "(26) " + "undefined";
    }
} */



function open_cmd_rec() {
    window.open("sequencer.html", '_blank');
}


function show_dev_alarm(id) {
    var id_device_alarm = id.split("_")[1];
    console.log("popup## " + id_device_alarm);
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
    console.log("popup## " + id_cu_alarm);
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

