/*
 * COMANDI DEGLI SCRAPERS AL CLICK DELLA RIGA I-ESIMA
 */

//get url al cui-server (webui server)
var request_prefix = "http://" + location.host + ":8081/CU?dev=";
var device; // nome del device selezionato
var url;    // url completa di device per la get al cuiserver
var num_row = 0;    //nÁ riga selezionata
var position = 0;

//funzione generale per mandare i comandi         

/*function sendCommand(command, parm,elem_id) {
    $.ajaxSetup({async:false});
    console.log(request_prefix + device +"&cmd="+ command + "&parm=" + parm);
    $.get(request_prefix + device +"&cmd="+ command + "&parm=" + parm, function(data) {
            $(elem_id).removeClass(".waves-input-wrapper");
            $(elem_id).addClass("butt_ok");
            setTimeout(function() {
                $(elem_id).removeClass("butt_ok");
                $(elem_id).addClass(".waves-input-wrapper");
            }, 3000);
    }).fail(function() {
            $(elem_id).removeClass(".waves-input-wrapper");
            $(elem_id).addClass("butt_fail");
            setTimeout(function() {
                $(elem_id).removeClass("butt_fail");
                $(elem_id).addClass(".waves-input-wrapper");
            }, 3000);
            });
    $.ajaxSetup({async:true});
} */

function sendCommand(command, parm, mode, elem_id) {
    if (mode == 1) {
	$.ajaxSetup({async:false});
	console.log(request_prefix + device +"&cmd="+ command + "&mode=" + mode + "&parm=" + parm);
	$.get(request_prefix + device +"&cmd="+ command + "&mode=" + mode + "&parm=" + parm, function(data) {
		$(elem_id).removeClass(".waves-input-wrapper");
		$(elem_id).addClass("butt_ok");
		setTimeout(function() {
		    $(elem_id).removeClass("butt_ok");
		    $(elem_id).addClass(".waves-input-wrapper");
		}, 3000);
	}).fail(function() {
		$(elem_id).removeClass(".waves-input-wrapper");
		$(elem_id).addClass("butt_fail");
		setTimeout(function() {
		    $(elem_id).removeClass("butt_fail");
		    $(elem_id).addClass(".waves-input-wrapper");
		}, 3000);
		});
	$.ajaxSetup({async:true});
    } else {
	$.ajaxSetup({async:false});
	console.log(request_prefix + device +"&cmd="+ command + "&parm=" + parm);
	$.get(request_prefix + device +"&cmd="+ command + "&parm=" + parm, function(data) {
		$(elem_id).removeClass(".waves-input-wrapper");
		$(elem_id).addClass("butt_ok");
		setTimeout(function() {
		    $(elem_id).removeClass("butt_ok");
		    $(elem_id).addClass(".waves-input-wrapper");
		}, 3000);
	}).fail(function() {
		$(elem_id).removeClass(".waves-input-wrapper");
		$(elem_id).addClass("butt_fail");
		setTimeout(function() {
		    $(elem_id).removeClass("butt_fail");
		    $(elem_id).addClass(".waves-input-wrapper");
		}, 3000);
		});
	$.ajaxSetup({async:true});

    }
    
    
    
} 


function selectElement(ele_num) {
    $("#tr_element_" + ele_num).addClass("row_selected");
    position = $("#setting_" + ele_num).text();
    $("#input_position").val(position);
    device = $("#name_element_" + ele_num).text();  // prendo il nome del device dalla tabella che a sua volta e' preso dal db
    console.log("position" + position + "nomeee " + device);
}

$(document).on("click", ".row_element", function(e) {
    var selected = $(this).hasClass("row_selected");
    $(".row_element").removeClass("row_selected");
    if(!selected) {
      //  num_row = this.rowIndex - 1;   // per far partire il conteggio da 1 e non da 0
        selectElement(num_row);    
    }
    
    
}); 

//var index = 0;
//38 up, 40down
$(document).keydown(function(e) {

    if (e.keyCode === 40) {
        if (num_row+1 >= $(".row_element").length) {
           // num_row = $(".row_element").length - 1;
                        num_row = $(".row_element").length;

        } else {
            num_row = num_row + 1;
        }
        $(".row_element").removeClass("row_selected");
        selectElement(num_row);
       /* $('.tr_element:eq(' + num_row + ')').addClass("row_selected");
        current = $("#td_settCurr_" + num_row).text();
        $("#new_curr").attr("value", current);
        device = $("#name_element_" + num_row).text();  // prendo il nome del device dalla tabella che a sua volta e' preso dal db
        device = zone_selected + "/" + device;
        url = request_prefix + device;  */  

        return false;
    }
    if (e.keyCode === 38) {
        if (num_row == 0) {
            num_row = 0;
        } else {
            num_row = num_row -1;
        }
       // index = (index == 0) ? 0 : index - 1;
        $(".row_element").removeClass("row_selected");
        selectElement(num_row);
      /*  $('.tr_element:eq(' + num_row + ')').addClass("row_selected");
        current = $("#td_settCurr_" + num_row).text();
        $("#new_curr").attr("value", current);
        device = $("#name_element_" + num_row).text();  // prendo il nome del device dalla tabella che a sua volta e' preso dal db
        device = zone_selected + "/" + device;
        url = request_prefix + device;   */
        return false;
    }
});

// funzione per settare la posizione
function setPosition(val) {
    var pos_abs = Number(val).toFixed(3);  // fissa a 3 cifre deicmali
    sendCommand("mov_abs", '{"offset_mm":' + pos_abs + "}", 0, "#setPosition");    
}

//Stop motion 
function setStop() {
    sendCommand("stopMotion", "", 1,"#setStop");    
}


// funzione per spegnere/accendere gli scrapers           
function setPower(val) {
    if(val == "Standby") {
        sendCommand("poweron", '{"on": 0 }',0, "#standby");
    } else if(val == "Oper") {
        sendCommand("poweron", '{"on": 1 }',0, "#oper");
    }
}

function setPositionRel(val) {
        var pos_rel = $("#position-rel").val();
       // console.log("delta " + pos_rel);
        if(val == "Out") {
            pos_rel =  - parseFloat(pos_rel);
	    pos_rel = Number(pos_rel).toFixed(3);
            sendCommand("mov_rel", '{"offset_mm":' + pos_rel + "}", 0,"#out");
        } else if(val == "In") {
	    pos_rel = Number(pos_rel).toFixed(3);
           // position += pos_rel;
          // position = parseFloat(pos_rel) +  parseFloat(position);
            sendCommand("mov_rel", '{"offset_mm":' + pos_rel + "}", 0,"#in");
        }

}


function resetAlarm(val){
    if (val=="Reset") {
        sendCommand("rset","1", 0,"#reset_alarm");
    }
}


function Homing() {
    console.log("homing");
    sendCommand("homing", '{"homing_type":1}',0, "#homing");
}

