var elements_dataset = [];
var current_saved = [];
var status_saved = [];
var polarity_saved = [];

function fill_table_saved() {
    elements_dataset = [];
    current_saved = [];
    status_saved = [];
    polarity_saved = [];
    
    $("#apply_saved").remove();
    
    for (var i = 0; i < ok_mag.length; i++) {
        $("#td_saved_curr_" + i).html("");
        $("#td_saved_pola_" + i).html("");
        $("#td_saved_state_" + i).html("");
    }
    
    $.get("http://" + location.host + "/cmt/json_api/get_dataset/" + name_file_ds, function(data, textStatus) {
        var data_dataset = $.parseJSON(data);
        
        data_dataset.forEach(function(el) {
            elements_dataset.push(el.element);
            current_saved.push(Number(el.value).toFixed(3));
            status_saved.push(el.status);
            polarity_saved.push(el.polarity);
        });
        
        var dataset_index = -1;
        var mag_index = 0;
        
        ok_mag.forEach(function(mag) {
            dataset_index = $.inArray(mag, elements_dataset);
            if (dataset_index != -1) {
                $("#td_saved_curr_" + mag_index).html('<input type="text" class="input_curr_saved" id="curr_dataset_' + mag_index +
                                                      '" value="' + current_saved[dataset_index] + '"/>');
                
                switch (status_saved[dataset_index]) {
                    case '2':
                        $("#td_saved_state_" + mag_index).html('<i class="material-icons green md-24">trending_down</i>');
                        break;
                    case '8':
                        $("#td_saved_state_" + mag_index).html('<i class="material-icons red md-24">pause_circle_outline</i>');
                        break;
                }
                
                switch (polarity_saved[dataset_index]) {
                    case '-1':
                        $("#td_saved_pola_" + mag_index).html('<i class="material-icons blu md-24">remove_circle</i>');
                        break;
                    case '0':
                        $("#td_saved_pola_" + mag_index).html('<i class="material-icons md-24">radio_button_unchecked</i>');
                        break;
                    case '1':
                        $("#td_saved_pola_" + mag_index).html('<i class="material-icons red md-24">add_circle</i>');
                        break;
                }
            } else {
                $("#td_saved_curr_" + mag_index).html('<input type="text" class="input_curr_saved" id="curr_dataset_' + mag_index + '" value=""/>');
                $("#td_saved_state_" + mag_index).html("");
                $("#td_saved_pola_" + mag_index).html("");
            }
            mag_index++;
        });
    });
    
    $("#main_table_box").append('<div id="apply_saved" style="cursor:pointer;" onclick="ciccio()";><i class="material-icons green md-24">send</i>Apply All</div>');
}

var device_name;
function ciccio() {
    var valore_corrente = [];
    var nomi = [];
    
    $("#main_table input[type=text]").each( function() {
        if ($(this).val() == '') {
            console.log("vuoto");
        } else {
            var input_saved = $(this).closest('tr').attr('id'); // id tr of input non null
            device_name = $('#' + input_saved + ' td:first-child').text(); // name device of input not null
            device_name = zone_selected + "/" + device_name; // come vuole il nome del device la funzione send_command
            
            valore_corrente.push(this.value);
            nomi.push(device_name);
        }
    });
    
    // console.log("##### " + valore_corrente + "##### " + nomi);
    
    for (var i = 0; i < nomi.length; i++) {
        // console.log("url: " + request_prefix + nomi[i]);
        // console.log("device: " + device + " command:" + command + " param:" + parm);
        $.ajaxSetup({async:false});
        
        console.log(request_prefix + nomi[i] + '&cmd=sett&parm={"sett_cur":' + valore_corrente[i] + "}");
        $.get(request_prefix + nomi[i] + '&cmd=sett&parm={"sett_cur":' + valore_corrente[i] + "}");
        // console.log("url: " + url + " ")
        
        /*
        $.get(request_prefix + nomi[i] + '&cmd=sett&parm={"sett_curr":' + valore_corrente[i] + "}", function(data) {
            $("#apply_saved").removeClass("butt_std");
            $("#apply_saved").addClass("butt_ok");
            setTimeout(function() {
                $("#apply_saved").removeClass("butt_ok");
                $("#apply_saved").addClass("butt_std");
            }, 3000);
        }).fail(function() {
            $("#apply_saved").removeClass("butt_std");
            $("#apply_saved").addClass("butt_fail");
            setTimeout(function() {
                $("#apply_saved").removeClass("butt_fail");
                $("#apply_saved").addClass("butt_std");
            }, 3000);
        });
        $.ajaxSetup({async:true});
        */
    } 
}
