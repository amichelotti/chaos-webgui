/*
 * COMANDI DEI MAGNETI AL CLICK DELLA RIGA I-ESIMA
 */

//get url al cui-server (webui server)
var request_prefix = "http://" + location.host + ":8081/CU?dev=";
// var request_prefix = "http://chaosdev-webui1.chaos.lnf.infn.it:8081/CU?dev="; 
var url;    // url completa di device per la get al cuiserver
var num_row = 0;    //n¡ riga selezionata
var current;

  





//funzione generale per mandare i comandi           
function sendCommand(command,parm) {
    jchaos.sendCUCmd(selected_device.health.ndk_uid,command,parm,null);
} 


function selectElement(ele_num) {
    var status,bypass;
    $("#tr_element_" + ele_num).addClass("row_selected");
    //current = $("#td_settCurr_" + ele_num).text();
    //$("#new_curr").val(current);
    selected_device = cu_cache[row_2_cuid[ele_num]];
 //   $("#cu-cmd").html(selected_device);
    status=cu_cache[row_2_cuid[ele_num]].health.nh_status;
    bypass=cu_cache[row_2_cuid[ele_num]].system.cudk_bypass_state;
    $("#available_commands").find("a").remove();
    
  //  $("#available_commands").append("<a class='quick-button-small span2 btn-cmd' id='cmd-bypassOn' onclick='ByPassON()'><i class='material-icons verde'>cached</i><p class='name-cmd'>ByPass</p></a>");
    
    if (status == 'Start' || status ==  'start') {
        $("#available_commands").append("<a class='quick-button-small span2 btn-cmd' id='cmd-stop' onclick='Stop()'><i class='material-icons verde'>pause</i><p class='name-cmd'>Stop</p></a>");
        
    } if (status == 'Stop' || status == 'stop') {
        $("#available_commands").append("<a class='quick-button-small span2 btn-cmd' id='cmd-start' onclick='Start()'><i class='material-icons verde'>play_arrow</i><p class='name-cmd'>Start</p></a>");
        
    }  if (status == 'Init' || status == 'init') {
        $("#available_commands").append("<a class='quick-button-small span2 btn-cmd' id='cmd-start' onclick='Start()'><i class='material-icons verde'>play_arrow</i><p class='name-cmd'>Start</p></a>");        
        $("#available_commands").append("<a class='quick-button-small span2 btn-cmd' id='cmd-deinit' onclick='Deinit()'><i class='material-icons verde'>trending_down</i><p class='name-cmd'>Deinit</p></a>");
    } if (status == 'Deinit' || status == 'deinit') {
        $("#available_commands").append("<a class='quick-button-small span2 btn-cmd' id='cmd-init' onclick='Init()'><i class='material-icons verde'>trending_up</i><p class='name-cmd'>Init</p></a>");
    } 

    if(bypass){
        $("#available_commands").append("<a class='quick-button-small span2 btn-cmd' id='cmd-bypassOFF' onclick='ByPassOFF()'><i class='material-icons verde'>usb</i><p class='name-cmd'>BypassOFF</p></a>");
        
    } else {
        $("#available_commands").append("<a class='quick-button-small span2 btn-cmd' id='cmd-bypassON' onclick='ByPassON()'><i class='material-icons verde'>cached</i><p class='name-cmd'>BypassON</p></a>");   
    }
   // console.log("device "+ device);
    //url = request_prefix + device;
    
}


/*function selectElement(ele_num) {
    $("#tr_element_" + ele_num).addClass("row_selected");
    current = $("#td_settCurr_" + ele_num).text();
    $("#new_curr").val(current);
    device = $("#name_element_" + ele_num).text();  
    url = request_prefix + device;
} */

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
        $(".row_element").removeClass("row_selected");
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
        if (num_row+1 >= $(".row_element").length) {
            num_row = $(".row_element").length - 1;
        } else {
            num_row = num_row + 1;
        }
        $(".row_element").removeClass("row_selected");
        selectElement(num_row);
        return false;
    }
    if (e.keyCode === 38) {
        if (num_row == 0) {
            num_row = 0;
        } else {
            num_row = num_row -1;
        }
        $(".row_element").removeClass("row_selected");
        selectElement(num_row);
        return false;
    }
});


function Init() {
    sendCommand("init","");
}

function ByPassON() {
    jchaos.setBypass(selected_device.health.ndk_uid,true,null);
        
}
function ByPassOFF() {
    jchaos.setBypass(device.health.ndk_uid,false,null);
}
function Init() {
    sendCommand("init","");
}

function Start() {
    sendCommand("start","");
}


function Stop() {
    sendCommand("stop","");
}

function Deinit() {
    sendCommand("deinit","");
}

function Load() {
    sendCommand("load","");
}

/*function Unload() {
    sendCommand("unload","#cmd-unload");
} */



// funzione per settare la corrente
/*function setCurrent(val) {
    var curr = Number(val).toFixed(3);  // fissa a 3 cifre deicmali
    sendCommand("sett", '{"sett_cur":' + curr + "}","#apply_current");
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
} */
