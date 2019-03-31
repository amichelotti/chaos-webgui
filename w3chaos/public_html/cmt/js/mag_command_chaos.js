/*
 * COMANDI DEI MAGNETI AL CLICK DELLA RIGA I-ESIMA
 */

//get url al cui-server (webui server)
var request_prefix = "http://" + location.host + ":8081/CU?dev=";
// var request_prefix = "http://chaosdev-webui1.chaos.lnf.infn.it:8081/CU?dev="; 
var device; // nome del device selezionato
var url;    // url completa di device per la get al cuiserver
var num_row = 0;    //n¡ riga selezionata
var current;

//funzione generale per mandare i comandi           
function sendCommand(command, parm,elem_id) {
    $.ajaxSetup({async:false});
    console.log(url + "&cmd="+ command + "&parm=" + parm)
    //console.log("device: " + device + " command:" + command + " param:" + parm);
    $.get(url + "&cmd="+ command + "&parm=" + parm, function(data) {
            $(elem_id).removeClass("butt_std");
            $(elem_id).addClass("butt_ok");
            setTimeout(function() {
                $(elem_id).removeClass("butt_ok");
                $(elem_id).addClass("butt_std");
            }, 3000);
    }).fail(function() {
            $(elem_id).removeClass("butt_std");
            $(elem_id).addClass("butt_fail");
            setTimeout(function() {
                $(elem_id).removeClass("butt_fail");
                $(elem_id).addClass("butt_std");
            }, 3000);
            });
    $.ajaxSetup({async:true});
} 

function selectElement(ele_num) {
    $("#tr_element_" + ele_num).addClass("row_selected");
    current = $("#td_settCurr_" + ele_num).text();
    $("#new_curr").val(current);
    device = $("#name_element_" + ele_num).text();  
    url = request_prefix + device;
}

/*$(document).on("click", ".tr_element", function(e) {
    var selected = $(this).hasClass("row_selected");
    console.log("selectedddd " + selected);
    $(".tr_element").removeClass("row_selected");
    if(!selected) {
        num_row = this.rowIndex - 1;   // per far partire il conteggio da 1 e non da 0
        console.log("nummmmm " + num_row)
        selectElement(num_row);    
    }
}); */


$(document).on("click", "td", function(e) {
        var selected = $(this).parent().hasClass("row_selected");
        $(".tr_element").removeClass("row_selected");
    if(!selected) {
        var row_index = $(this).parent().index();
  // console.log("row_indexxxx " + row_index);
        selectElement(row_index);    
    }
});

//var index = 0;
//38 up, 40down
$(document).keydown(function(e) {

    if (e.keyCode === 40) {
        if (num_row+1 >= $(".tr_element").length) {
            num_row = $(".tr_element").length - 1;
        } else {
            num_row = num_row + 1;
        }
        $(".tr_element").removeClass("row_selected");
        selectElement(num_row);
        return false;
    }
    if (e.keyCode === 38) {
        if (num_row == 0) {
            num_row = 0;
        } else {
            num_row = num_row -1;
        }
        $(".tr_element").removeClass("row_selected");
        selectElement(num_row);
        return false;
    }
});

// funzione per settare la corrente
function setCurrent(val) {
    var curr = Number(val).toFixed(3);  // fissa a 3 cifre deicmali
    sendCommand("sett", '{"sett_cur":' + curr + "}","#apply_current");
}

// funzione per settare il ritardo
function setWait(val) {
    var delay = Number(val);
    sendCommand("SCWaitCommand", '{"delay":' + delay + "}","#apply_current");    
}

// funzione per spegnere/accendere l'alimentatore           
function setPowerSupply(val) {
    if(val == "Standby") {
        sendCommand("mode", '{"mode_type": 0 }',"#buttOFF");
    } else if(val == "On") {
        sendCommand("mode", '{"mode_type": 1 }',"#buttON");
    }
}

// funzione per cambiare la polarita'; funziona solo se il magnete e' in standby, ma per ora non c'e' nessun alert
function setPolarity(val) {
    if(val == "Pos") {
        sendCommand("pola", '{"pola_value": 1}',"#buttPOS");
    } else if(val == "Neg") {
        sendCommand("pola", '{"pola_value": -1}',"#buttNEG");
    } else if(val == "Open") {  
        sendCommand("pola", '{"pola_value": 0}',"#buttOP");
    }  
}

function resetAlarm(val){
    if (val=="Reset") {
        sendCommand("rset","","#reset_alarm");
    }
}
