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



/*var val = [];
 $(function(){
      $('#show_value').click(function(){
         val = [];
        $(':checkbox:checked').each(function(i){
	val[i] = $(this).attr("id");
        });

	if ($("#MODE").text() == "DataOnDemand") {
		buildBoxPlotDD("Data on Demand");
	    }

	if ($("#MODE").text() == "SlowAcquisition") {
		buildBoxPlotSA("Slow Acquisition");
	    }
    });
});  */


var val = [];
$(function(){
	$('#show_value').click(function(){
		val = [];
		$(':checkbox:checked').each(function(i){

			if ($(':checkbox:checked').attr("id") == "ALL") {

				val = ["BPBA1001","BPBA1002","BPBA2001","BPBA2002","BPBA3001","BPBA3002","BPBA4001","BPBA4002","BPSA1001","BPSA2001", 
				       "BPSA3001","BPSA4001"];

			} else {

				val[i] = $(this).attr("id");

				//console.log("val " + val);

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

/*function powerDD(sam,loo){
	var samples = Number(sam);
	var loops = Number(loo);
        if (check == false) {
            sendCommand("acquire", "{\"enable\":1, \"mode\":0x1, \"samples\": "+ samples +", \"loops\":"+ loops +", \"duration\":0}","#DD_0");
        } else {
            sendCommand("acquire", "{\"enable\":1, \"mode\":0x101, \"samples\": "+ samples +", \"loops\":"+ loops +", \"duration\":0}","#DD_0");
        }

	reset_all();
	builPlotTotDD();
	buildBoxPlotDD("Data on Demand");
}  */


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

	/*if (checkPlot == true) {
	    buildBoxPlotDD("Data on Demand");
	} else {
	    console.log("ciao")
	} */
}

function powerSA(loo){
	var loops = Number(loo);
	sendCommand("acquire", "{\"enable\":1, \"mode\":0x2, \"samples\":1, \"loops\":"+ loops +", \"duration\":0}","#SA_0");

	reset_all();
	builPlotTotSA();
	//buildBoxPlotSA('Slow Acquisition');
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
	//buildBoxPlotDD("Permanent Data on Demand");
}

function permanentSA(){
	sendCommand("acquire", "{\"enable\":1, \"mode\":0x1002, \"samples\":1, \"loops\":-1, \"duration\":0}","#permanentSA_0");

	reset_all();
	builPlotTotSA();
	//buildBoxPlotSA('Permanent Slow Acquisition');
}

function SaveData(nm){

	if (dafne == 1 || dafne == 2) {
		$.get("http://" + location.host + ":8081/CU?dev=ACCUMULATOR/BPM/BPMSYNC&cmd=save&parm=" + nm );

	} else if (dafne == 0) {
		alert("Save inhibited, no valid injection status");
	}

}

/*function SaveData(nm){
    var particle;

    if (dafne == 1) {
	particle = "e";
    } else if (dafne == 2) {
	particle = "p";
    } else if (dafne == 0) {
	alert("non puoi salvare");
    }

    $.get("http://" + location.host + ":8081/CU?dev=ACCUMULATOR/BPM/BPMSYNC&cmd=save&parm=" + nm + "/" + particle);
} */


function Search() {

	$('.modal-trigger').leanModal();

	$.get("http://" + location.host + ":8081/CU?dev=ACCUMULATOR/BPM/BPMSYNC&cmd=list", function(dataset, textStatus) {
		var  list = JSON.parse(dataset);

		for (var i = 0; i < list.keys.length; i ++) {
			$("#table-list").append('<tr><td id="nome_ds_save_' + [i]+'">' + list.keys[i].key + '</td><td id="ts_ds_save ' + [i] + '>"' +list.keys[i].ts +'</td></tr>');
		}
	});
}


var name_file_ds;
$(document).on("click", "#table-list tr", function(e) {
	var selected = $(this).hasClass("row_selected");
	$("#table-list tr").removeClass("row_selected");
	if (!selected) {
		$(this).addClass("row_selected");
		num_row = this.rowIndex;
		num_row = num_row - 1;  // per far partire il conteggio da 1 e non da 0
		// prendo il valore del nome del file del datset
		name_file_ds = $("#nome_ds_save_" + num_row).text();
	}
});

function getLoad() {
       carica_load(name_file_ds);
    }

function carica_load(nome_load) {
    $.get("http://" + location.host + ":8081/CU?dev=ACCUMULATOR/BPM/BPMSYNC&cmd=load&parm=" + nome_load);

    console.log("http://" + location.host + ":8081/CU?dev=ACCUMULATOR/BPM/BPMSYNC&cmd=load&parm=" + nome_load);

}



/*function openGlobalLoad() {
    var list;

    var name_dataset;
    $('#popup').bPopup();
    $.get("http://" + location.host + "/cmt/json_api/get_dataset_list", function(dataset, textStatus) {
        list = $.parseJSON(dataset);
        $("#list_dataset").find("tr:gt(0)").remove();
        for (var i = 0; i < list.length; i++) {
            $('#list_dataset').append('<tr><td>' + list[i].date + '</td><td id="nome_ds_save_' + [i] + '">' + list[i].name +
                                        '</td><td>' + list[i].comment + '</td></tr>');
        }
    });
}


var name_file_ds;
$(document).on("click", "#list_dataset tr", function(e) {
    var selected = $(this).hasClass("row_selected");
    $("#list_dataset tr").removeClass("row_selected");
    if (!selected) {
        $(this).addClass("row_selected");
        num_row = this.rowIndex;
        num_row = num_row - 1;  // per far partire il conteggio da 1 e non da 0
        // prendo il valore del nome del file del datset
        name_file_ds = $("#nome_ds_save_" + num_row).text();
        $("#input_dataset").attr("value", name_file_ds);
        fill_table_saved();
    }
});

function apri_popup() {
    $('#popup_alarm').bPopup();
}*/


function reset_all() {

	// if ($('#multi_plot').length){

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
//	quick reset of the timer array you just cleared
	timeouts = [];
}


