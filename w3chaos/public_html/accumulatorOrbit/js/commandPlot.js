/*
 * COMANDI DEI MAGNETI AL CLICK DELLA RIGA I-ESIMA
 */

//get url al cui-server (webui server)
var request_prefix = "http://" + location.host + ":8081/CU?dev=ACCUMULATOR/BPM/BPMSYNC";


//funzione generale per mandare i comandi           
function sendCommand(command, parm,elem_id) {
    $.ajaxSetup({async:false});
   // console.log("device: " + device + " command:" + command + " param:" + parm);
    $.get(request_prefix + "&cmd="+ command + "&parm=" + parm, function(data) {
            $(elem_id).removeClass(".waves-input-wrapper");
            $(elem_id).addClass("butt_ok");
            setTimeout(function() {
                $(elem_id).removeClass("butt_ok");
                $(elem_id).addClass(".waves-input-wrapper");
            }, 2000);
    }).fail(function() {
            $(elem_id).removeClass(".waves-input-wrapper");
            $(elem_id).addClass("butt_fail");
            setTimeout(function() {
                $(elem_id).removeClass("butt_fail");
                $(elem_id).addClass(".waves-input-wrapper");
            }, 2000);
            });
    $.ajaxSetup({async:true});
} 


var check = false;
$(document).ready(function () {
    var ckbox = $('#trig_0');
    $('input[type="checkbox"]').on('click',function () {
        if (ckbox.is(':checked')) {
            check = true;
        } else {
            check = false;
        }
    });
});

var checkP = false;
$(document).ready(function () {
    var ckbox = $('#trig_1');
    $('input[type="checkbox"]').on('click',function () {
        if (ckbox.is(':checked')) {
            checkP = true;
        } else {
            checkP = false;
        }
    });
});


var val = [];
 $(function(){
      $('#show_value').click(function(){
	$("#multi_plot").remove();
         val = [];
        $(':checkbox:checked').each(function(i){
	    
	    if ($(':checkbox:checked').attr("id") == "ALL") {
		
		val = ["BPBA1001","BPBA1002","BPBA2001","BPBA2002","BPBA3001","BPBA3002","BPBA4001","BPBA4002","BPSA1001","BPSA2001", 
			"BPSA3001","BPSA4001"];
			
	    } else {
	    val[i] = $(this).attr("id");
	    }
        });
	
	if ($("#MODE").text() == "DataOnDemand") {
		//buildBoxPlotDD("Data on Demand");
	    buildBoxPlotDDreal("Data on Demand");

	    }
	    
	if ($("#MODE").text() == "SlowAcquisition") {
		buildBoxPlotSA("Slow Acquisition");
	    }
	    
	if ($("#MODE").text() == "PermanentDD" || $("#MODE").text() == "PermanentDD+Trigg" || $("#MODE").text() == "Permanent" ) {
	    buildBoxPlotDDreal("Permanent Data on Demand");
	}
	
	if ($("#MODE").text() == "PermanentSA") {
		buildBoxPlotSA('Permanent Slow Acquisition');
	    }

    });
}); 


function Disable(val) {
    if (val == "Disable") {
        sendCommand("acquire", "{ \"enable\":0 }","#disable_0");   
    }
}


function powerDD(sam,loo){
	var samples = Number(sam);
	var loops = Number(loo);
    	    if (check == false) {
		sendCommand("acquire", "{\"enable\":1, \"mode\":0x1, \"samples\": "+ samples +", \"loops\":"+ loops +", \"duration\":0}","#DD_0");
			
	    } else {
	        sendCommand("acquire", "{\"enable\":1, \"mode\":0x101, \"samples\": "+ samples +", \"loops\":"+ loops +", \"duration\":0}","#DD_0");
	    }    
	reset_all();
	builPlotTotDD(); 
}

function powerSA(loo){
	var loops = Number(loo);
	sendCommand("acquire", "{\"enable\":1, \"mode\":0x2, \"samples\":1, \"loops\":"+ loops +", \"duration\":0}","#SA_0");
	
	reset_all();
	builPlotTotSA();
}

function permanentDD(sam){ 
	var samples = Number(sam);
        if (checkP == false) {
            sendCommand("acquire", "{\"enable\":1, \"mode\":0x1001, \"samples\": "+ samples +", \"loops\":-1, \"duration\":0}","#permanentDD_0");
        } else {
            sendCommand("acquire", "{\"enable\":1, \"mode\":0x1101, \"samples\": "+ samples +", \"loops\":-1, \"duration\":0}","#permanentDD_0");
        }
	reset_all();
	builPlotTotDD();
}
    
function permanentSA(){
	sendCommand("acquire", "{\"enable\":1, \"mode\":0x1002, \"samples\":1, \"loops\":-1, \"duration\":0}","#permanentSA_0");
	
	reset_all();
	builPlotTotSA();
}

function SaveData(nm){
    
    if (linac == -1 || linac == 1) {
	$.get("http://" + location.host + ":8081/CU?dev=ACCUMULATOR/BPM/BPMSYNC&cmd=save&parm=" + nm );

    } else  {
	alert("You can't save. Error Linac mode:" + linac );
    }
    
}


function Search() {
    
    $('.modal-trigger').leanModal();
	
	$.get("http://" + location.host + ":8081/CU?dev=ACCUMULATOR/BPM/BPMSYNC&cmd=list", function(dataset, textStatus) {
	var  list = JSON.parse(dataset);
	 $("#table-list").empty();
	for (var i = 0; i < list.keys.length; i ++) {
	  $("#table-list").append('<tr><td id="nome_ds_save_' + [i]+'">' + list.keys[i].key + '</td><td id="nome_ts_save_' + [i]+'">' +list.keys[i].ts +'</td></tr>');
	}
    });
}



$(document).on("click", "#table-list tr", function(e) {
    var selected = $(this).hasClass("row_selected");
    $("#table-list tr").removeClass("row_selected");
    if (!selected) {
        $(this).addClass("row_selected");
        num_row = this.rowIndex;
      //  num_row = num_row - 1;  // per far partire il conteggio da 1 e non da 0
        // prendo il valore del nome del file del datset
        name_file_ds = $("#nome_ds_save_" + num_row).text();
        name_file_ts = $("#nome_ts_save_" + num_row).text();

    }
});


function reset_all() {
    	
    if ($('#plot_accumulator_x').length){

	
	$("#multi_plot").remove();
	$("#plot_accumulator_x").remove();
	$("#plot_accumulator_y").remove();
	
	clear_timeout();
    }    
}


var timeouts = [];
function timeout_plot(update, updateInterval) {
    timeouts.push(setTimeout(update, updateInterval));
}

function clear_timeout() {
    for (var i = 0; i < timeouts.length; i++) {
	clearTimeout(timeouts[i]);
    }
//quick reset of the timer array you just cleared
    timeouts = [];
}


