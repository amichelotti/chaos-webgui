

var frequency = 500;

var cu_bpm = [];
var dafne_global = [];
var linac_mode;
var bpm_arr_x = [];
var bpm_arr_y = [];
var bpm_arr_sum = [];
var bpm_arr_name = [];

var bpm_x_load_ele = [];
var bpm_y_load_ele = [];
var bpm_sum_load_ele = [];
var bpm_name_load_ele = [];

var bpm_x_load_pos = [];
var bpm_y_load_pos = [];
var bpm_sum_load_pos = [];
var bpm_name_load_pos = [];


var dataLoadXE = [];
var dataLoadYE = [];
var dataLoadSumE = [];
//var dataLoadP = [];
var dataLoadXP = [];
var dataLoadYP = [];
var dataLoadSumP = [];

var diffXE, diffXP, diffYE, diffYP, diffSumE, diffSumP
var currentp = 0;
var currente = 0;

var plotLiveBpmX, plotLiveBpmY, plotLiveBpmSum;

$(document).ready(function () {

	OrbitAccumulator();
	buildPlotsOrbitX();
	buildPlotsOrbitY();
	buildPlotsOrbitSum();
	buildPlotCurrent();
});

var bpm_accumulator_orbit = ["ACCUMULATOR/BPM/BPBA1001", "ACCUMULATOR/BPM/BPSA1001", "ACCUMULATOR/BPM/BPBA1002", "ACCUMULATOR/BPM/BPBA2001",
	"ACCUMULATOR/BPM/BPSA2001", "ACCUMULATOR/BPM/BPBA2002", "ACCUMULATOR/BPM/BPSA3001", "ACCUMULATOR/BPM/BPBA3001",
	"ACCUMULATOR/BPM/BPBA3002", "ACCUMULATOR/BPM/BPBA4001", "ACCUMULATOR/BPM/BPBA4002", "ACCUMULATOR/BPM/BPSA4001"];


function OrbitAccumulator() {

	jchaos.getChannel("DAFNE/FILE/NEWDAFNE", 0, function (dafne_global) {

		linac_mode = 0;
		if (dafne_global[0].hasOwnProperty("linac_mode")) {
			linac_mode = dafne_global[0].linac_mode;
			var ep = dafne_global[0].ep;
			var em = dafne_global[0].em;
			currentp = ep;
			currente = em;
			switch (linac_mode) {
				case 1:
					$("#linac_status").html("e+ (" + ep + " mA)");

					break;
				case -1:
					$("#linac_status").html("e- (" + em + " mA)");

					break;
				default:
					$("#linac_status").html(linac_mode);
			}  // end switch


		}
		// dafne_global.forEach(function(el) {   
		//     $.each(el, function(index, value){		    
		// 	if (index == "output") {
		// 	    $.each(value, function(ind_out, val_out){
		// 		if (ind_out == "linac_mode") {
		// 		    linac_mode = val_out;
		// 		} // end if linac mode

		// 	    });  // end 3 each
		// 	} // end if output
		//     }); //end 2 each
		// });  // end 1 each

		getBPM();

	});  // END GET CHANNEL DAFNE

}  // END FUNCTION ORBITACC




function getBPM() {
	var cnt = 0;
	jchaos.getChannel(bpm_accumulator_orbit, 0, function (cu_bpm) {

		cu_bpm.forEach(function (cu) {
			bpm_arr_name[cnt] = cu.ndk_uid;
			bpm_arr_x[cnt] = cu.X;
			bpm_arr_y[cnt] = cu.Y;
			bpm_arr_sum[cnt] = cu.SUM;

			cnt++;
		}); // end 1 each
		buildPlotsOrbitX();
		buildPlotsOrbitY();
		buildPlotsOrbitSum();
		setTimeout(OrbitAccumulator, frequency);
	}); // end getChannel BPM

	// if ($('#containerX').is(':empty')){
	// 	buildPlotsOrbitX();
	// } else {
	// 	buildPlotsOrbitX();
	// }

	// if ($('#containerY').is(':empty')){
	// 	buildPlotsOrbitY();
	// } else {
	// 	buildPlotsOrbitY();
	// }

	// if ($('#containerSum').is(':empty')){
	// 	buildPlotsOrbitSum();
	// } else {
	// 	buildPlotsOrbitSum();
	// } 
	/*$("input.checkX").attr("disabled", true);
	$("input.checkY").attr("disabled", true);
	$("input.checkSUM").attr("disabled", true); */

}  //end function getBPM



function buildPlotsOrbitX() {
	Highcharts.setOptions({
		global: {
			useUTC: true
		}
	});
	if (plotLiveBpmX == null) {
		plotLiveBpmX = new Highcharts.chart('containerX', {
			chart: {
				type: 'line',
				animation: Highcharts.svg, // don't animate in old IE
				marginRight: 10,
			},
			title: {
				text: ''
			},
			xAxis: {
				title: {
					text: '[mm]'
				},

				tickPositions: [0, 2.8, 5.2, 6.58, 9.7, 11.07, 13.48, 17.72, 19.08, 22.86, 25.99, 29.76, 31.12],

				plotLines: [{
					value: 0,
					color: '#808080'
				}]
			},
			yAxis: {
				title: {
					text: 'X'
				},
				plotLines: [{
					value: 0,
					width: 1,
					color: '#808080'
				}]
			},
			tooltip: {
				formatter: function () {
					return '<b>' + this.series.name + '</b><br/>' +
						Highcharts.numberFormat(this.x, 2) + '<br/>' +
						Highcharts.numberFormat(this.y, 2);
				}
			},
			legend: {
				enabled: true
			},
			exporting: {
				enabled: true
			},
			plotOptions: {
				series: {
					marker: {
						enabled: false
					}
				}
			},
			credits: {
				enabled: false
			},
			series: [{
				name: "Orbit X e-",
				//  turboThreshold: globaLength,
				data: (function () {
					var data_eleX = [];

					if (linac_mode == -1) {
						data_eleX.push([2.8, bpm_arr_x[0]], [5.2, bpm_arr_x[1]], [6.58, bpm_arr_x[2]], [9.7, bpm_arr_x[3]], [11.07, bpm_arr_x[4]],
							[13.48, bpm_arr_x[5]], [17.72, bpm_arr_x[6]], [19.08, bpm_arr_x[7]], [22.86, bpm_arr_x[8]], [25.99, bpm_arr_x[9]],
							[29.76, bpm_arr_x[10]], [31.12, bpm_arr_x[11]]);
					}

					if (linac_mode == 1) {
						data_eleX.push([2.8, bpm_arr_x[5]], [5.2, bpm_arr_x[4]], [6.58, bpm_arr_x[3]], [9.7, bpm_arr_x[2]], [11.07, bpm_arr_x[1]],
							[13.48, bpm_arr_x[0]], [17.72, bpm_arr_x[11]], [19.08, bpm_arr_x[10]], [22.86, bpm_arr_x[9]], [25.99, bpm_arr_x[8]],
							[29.76, bpm_arr_x[7]], [31.12, bpm_arr_x[6]]);
					}

					return data_eleX;
				}())
			}]

		});

	} else {
		if (linac_mode == -1) {

			//rimuovo grafico protoni in caso di switch
			if (typeof plotLiveBpmX.get('loadXP') !== 'undefined') {
				plotLiveBpmX.get('loadXP').remove();
				//$('#choices-loadX').prop('checked', false); // Unchecks it
				$('#choices-loadX').removeAttr('checked'); // Unchecks it

				if ($("#snapshot-ele").text() != '') {
					$('#choices-load-labelX').html($("#snapshot-ele").text());
				} else {
					$('#choices-load-labelX').html('dataset');
				}
			}

			//rimuovo grafico differenze protoni in caso di switch
			if (typeof plotLiveBpmX.get('P-differenceX') !== 'undefined') {
				plotLiveBpmX.get('P-differenceX').remove();
				//$('#choices-diffX').prop('checked', false); // Unchecks it
				$('#choices-diffX').removeAttr('checked');
			}

			//se � spuntato aggiungi il grafico elettroni
			if ($("#choices-loadX").is(':checked')) {
				if (typeof plotLiveBpmX.get('loadXE') === 'undefined') {
					plotLiveBpmX.addSeries({
						id: "loadXE",
						name: "loadXE",
						color: "#b3939a",
						data: dataLoadXE
					});
				}
				//console.log("data elettroni " + dataLoadXE);
			}
			else if ($("#snapshot-ele").text() != '' && typeof plotLiveBpmX.get('loadXE') !== 'undefined') {
				plotLiveBpmX.get('loadXE').remove(); //
				$('#choices-loadX').prop('checked', false); // Unchecks it //serve???
			}

			//aggiorno valori orbita corrente
			var myset = [[2.8, bpm_arr_x[0]], [5.2, bpm_arr_x[1]], [6.58, bpm_arr_x[2]], [9.7, bpm_arr_x[3]], [11.07, bpm_arr_x[4]],
			[13.48, bpm_arr_x[5]], [17.72, bpm_arr_x[6]], [19.08, bpm_arr_x[7]], [22.86, bpm_arr_x[8]], [25.99, bpm_arr_x[9]],
			[29.76, bpm_arr_x[10]], [31.12, bpm_arr_x[11]]];
			plotLiveBpmX.series[0].setData(myset, true, true, true);
			plotLiveBpmX.series[0].update({ name: "Orbit X e-" });
			plotLiveBpmX.series[0].update({ color: "#293c9b" });


			if ($("#choices-diffX").is(':checked')) {
				//calcolo la differenza dei grafici tra l'orbita corrente e quella salvata
				diffXE = [];
				for (var i = 0; i < dataLoadXE.length; i++) {
					diffXE.push([myset[i][0], [myset[i][1]] - dataLoadXE[i][1]]);
				}

				//se il grafico non esiste lo creo
				if (typeof plotLiveBpmX.get('E-differenceX') === 'undefined') {
					//console.log("checkedXEdiff!");
					plotLiveBpmX.addSeries({
						id: 'E-differenceX',
						name: "E-differenceX",
						color: "#cdcd00",
						data: diffXE
					});
				}

				//se il grafico esiste gi� lo aggiorno
				if (typeof plotLiveBpmX.get('E-differenceX') !== 'undefined') {
					var series_diff = plotLiveBpmX.get("E-differenceX"); //get series by id
					series_diff.setData(diffXE, true, true, true);
				}

			} else if ($("#snapshot-ele").text() != '' && typeof plotLiveBpmX.get('E-differenceX') !== 'undefined') {
				plotLiveBpmX.get('E-differenceX').remove(); // serve?
				$('#choices-diffX').prop('checked', false); // Unchecks it
			}


			//caso protoni	
		} else if (linac_mode == 1) {

			//rimuovo grafico elettroni in caso di switch
			if (typeof plotLiveBpmX.get('loadXE') !== 'undefined') {
				plotLiveBpmX.get('loadXE').remove();
				//$('#choices-loadX').prop('checked', false); // Unchecks it
				$('#choices-loadX').removeAttr('checked'); // Unchecks it
				if ($("#snapshot-pos").text() != '') {
					$('#choices-load-labelX').html($("#snapshot-pos").text());
				} else {
					$('#choices-load-labelX').html('dataset');
				}
			}

			//rimuovo grafico differenze elettroni in caso di switch
			if (typeof plotLiveBpmX.get('E-differenceX') !== 'undefined') {
				plotLiveBpmX.get('E-differenceX').remove();
				//$('#choices-diffX').prop('checked', false); // Unchecks it
				$('#choices-diffX').removeAttr('checked');
			}


			if ($("#choices-loadX").is(':checked')) {
				if (typeof plotLiveBpmX.get('loadXP') === 'undefined') {
					plotLiveBpmX.addSeries({
						id: "loadXP",
						name: "loadXP",
						color: "#b3939a",
						data: dataLoadXP
					});
				}
				//console.log("dati positroni " + dataLoadXP);

			} else if ($("#snapshot-pos").text() != '' && typeof plotLiveBpmX.get('loadXP') !== 'undefined') {
				plotLiveBpmX.get('loadXP').remove(); //
				$('#choices-loadX').prop('checked', false); // Unchecks it //serve???
			}

			var myset = [[2.8, bpm_arr_x[5]], [5.2, bpm_arr_x[4]], [6.58, bpm_arr_x[3]], [9.7, bpm_arr_x[2]], [11.07, bpm_arr_x[1]],
			[13.48, bpm_arr_x[0]], [17.72, bpm_arr_x[11]], [19.08, bpm_arr_x[10]], [22.86, bpm_arr_x[9]], [25.99, bpm_arr_x[8]],
			[29.76, bpm_arr_x[7]], [31.12, bpm_arr_x[6]]];
			plotLiveBpmX.series[0].setData(myset, true, true, true);
			plotLiveBpmX.series[0].update({ name: "Orbit X e+" });
			plotLiveBpmX.series[0].update({ color: "#cc0000" });

			if ($("#choices-diffX").is(':checked')) {
				//calcolo la differenza dei grafici tra l'orbita corrente e quella salvata
				diffXP = [];
				for (var i = 0; i < dataLoadXP.length; i++) {
					diffXP.push([myset[i][0], [myset[i][1]] - dataLoadXP[i][1]]);
				}

				//se il grafico non esiste lo creo
				if (typeof plotLiveBpmX.get('P-differenceX') === 'undefined') {
					plotLiveBpmX.addSeries({
						id: 'P-differenceX',
						name: "P-differenceX",
						color: "#cdcd00",
						data: diffXP
					});
				}

				//se il grafico esiste gi� lo aggiorno
				if (typeof plotLiveBpmX.get('P-differenceX') !== 'undefined') {
					var series_diffP = plotLiveBpmX.get("P-differenceX"); //get series by id
					series_diffP.setData(diffXP, true, true, true);
				}

			} else if ($("#snapshot-pos").text() != '' && typeof plotLiveBpmX.get('P-differenceX') !== 'undefined') {
				plotLiveBpmX.get('P-differenceX').remove(); // serve?
				$('#choices-diffX').prop('checked', false); // Unchecks it
			}

		}
	}
}



function buildPlotsOrbitY() {
	Highcharts.setOptions({
		global: {
			useUTC: true
		}
	});
	if (plotLiveBpmY == null) {
		plotLiveBpmY = new Highcharts.chart('containerY', {
			chart: {
				type: 'line',
				animation: Highcharts.svg, // don't animate in old IE
				marginRight: 10,
			},

			title: {
				text: ''
			},

			xAxis: {

				title: {
					text: '[mm]'
				},

				tickPositions: [0, 2.8, 5.2, 6.58, 9.7, 11.07, 13.48, 17.72, 19.08, 22.86, 25.99, 29.76, 31.12],


				plotLines: [{
					value: 0,
					width: 1,
					color: '#808080'
				}]
			},
			yAxis: {
				title: {
					text: 'Y'
				},
				plotLines: [{
					value: 0,
					width: 1,
					color: '#808080'
				}]
			},
			tooltip: {
				formatter: function () {
					return '<b>' + this.series.name + '</b><br/>' +
						Highcharts.numberFormat(this.x, 2) + '<br/>' +
						Highcharts.numberFormat(this.y, 2);
				}
			},
			legend: {
				enabled: true
			},

			exporting: {
				enabled: true
			},

			plotOptions: {
				series: {
					marker: {
						enabled: false
					}
				}
			},

			credits: {
				enabled: false
			},


			series: [{
				name: "Orbit Y e-",

				//  turboThreshold: globaLength,
				data: (function () {
					var data_eleY = [];

					if (linac_mode == -1) {
						data_eleY.push([2.8, bpm_arr_y[0]], [5.2, bpm_arr_y[1]], [6.58, bpm_arr_y[2]], [9.7, bpm_arr_y[3]], [11.07, bpm_arr_y[4]],
							[13.48, bpm_arr_y[5]], [17.72, bpm_arr_y[6]], [19.08, bpm_arr_y[7]], [22.86, bpm_arr_y[8]], [25.99, bpm_arr_y[9]],
							[29.76, bpm_arr_y[10]], [31.12, bpm_arr_y[11]]);
					}

					if (linac_mode == 1) {

						data_eleY.push([2.8, bpm_arr_y[5]], [5.2, bpm_arr_y[4]], [6.58, bpm_arr_y[3]], [9.7, bpm_arr_y[2]], [11.07, bpm_arr_y[1]],
							[13.48, bpm_arr_y[0]], [17.72, bpm_arr_y[11]], [19.08, bpm_arr_y[10]], [22.86, bpm_arr_y[9]], [25.99, bpm_arr_y[8]],
							[29.76, bpm_arr_y[7]], [31.12, bpm_arr_y[6]]);

					}
					return data_eleY;
				}())

			}

			]

		});
	} else {
		if (linac_mode == -1) {

			//rimuovo grafico protoni in caso di switch
			if (typeof plotLiveBpmY.get('loadYP') !== 'undefined') {
				plotLiveBpmY.get('loadYP').remove();
				//$('#choices-loadX').prop('checked', false); // Unchecks it
				$('#choices-loadY').removeAttr('checked'); // Unchecks it

				if ($("#snapshot-ele").text() != '') {
					$('#choices-load-labelY').html($("#snapshot-ele").text());
				} else {
					$('#choices-load-labelY').html('dataset');
				}
			}

			//rimuovo grafico differenze protoni in caso di switch
			if (typeof plotLiveBpmY.get('P-differenceY') !== 'undefined') {
				plotLiveBpmY.get('P-differenceY').remove();
				//$('#choices-diffX').prop('checked', false); // Unchecks it
				$('#choices-diffY').removeAttr('checked');
			}

			//se � spuntato aggiungi il grafico elettroni
			if ($("#choices-loadY").is(':checked')) {
				if (typeof plotLiveBpmY.get('loadYE') === 'undefined') {
					plotLiveBpmY.addSeries({
						id: "loadYE",
						name: "loadYE",
						color: "#b3939a",
						data: dataLoadYE
					});
				}
				//console.log("data elettroni " + dataLoadYE);
			}
			else if ($("#snapshot-ele").text() != '' && typeof plotLiveBpmY.get('loadYE') !== 'undefined') {
				plotLiveBpmY.get('loadYE').remove(); //
				$('#choices-loadY').prop('checked', false); // Unchecks it //serve???
			}


			var myset = [[2.8, bpm_arr_y[0]], [5.2, bpm_arr_y[1]], [6.58, bpm_arr_y[2]], [9.7, bpm_arr_y[3]], [11.07, bpm_arr_y[4]],
			[13.48, bpm_arr_y[5]], [17.72, bpm_arr_y[6]], [19.08, bpm_arr_y[7]], [22.86, bpm_arr_y[8]], [25.99, bpm_arr_y[9]],
			[29.76, bpm_arr_y[10]], [31.12, bpm_arr_y[11]]];
			plotLiveBpmY.series[0].setData(myset, true, true, true);
			plotLiveBpmY.series[0].update({ name: "Orbit Y e-" });
			plotLiveBpmY.series[0].update({ color: "#293c9b" });

			if ($("#choices-diffY").is(':checked')) {
				//calcolo la differenza dei grafici tra l'orbita corrente e quella salvata
				diffYE = [];
				for (var i = 0; i < dataLoadYE.length; i++) {
					diffYE.push([myset[i][0], [myset[i][1]] - dataLoadYE[i][1]]);
				}

				//se il grafico non esiste lo creo
				if (typeof plotLiveBpmY.get('E-differenceY') === 'undefined') {
					//console.log("checkedXEdiff!");
					plotLiveBpmY.addSeries({
						id: 'E-differenceY',
						name: "E-differenceY",
						color: "#cdcd00",
						data: diffYE
					});
				}

				//se il grafico esiste gi� lo aggiorno
				if (typeof plotLiveBpmY.get('E-differenceY') !== 'undefined') {
					var series_diffY = plotLiveBpmY.get("E-differenceY"); //get series by id
					series_diffY.setData(diffYE, true, true, true);
				}

			} else if ($("#snapshot-ele").text() != '' && typeof plotLiveBpmY.get('E-differenceY') !== 'undefined') {
				plotLiveBpmY.get('E-differenceY').remove(); // serve?
				$('#choices-diffY').prop('checked', false); // Unchecks it
			}




		} else if (linac_mode == 1) {

			//rimuovo grafico elettroni in caso di switch
			if (typeof plotLiveBpmY.get('loadYE') !== 'undefined') {
				plotLiveBpmY.get('loadYE').remove();
				//$('#choices-loadY').prop('checked', false); // Unchecks it
				$('#choices-loadY').removeAttr('checked'); // Unchecks it
				if ($("#snapshot-pos").text() != '') {
					$('#choices-load-labelY').html($("#snapshot-pos").text());
				} else {
					$('#choices-load-labelY').html('dataset');
				}
			}

			//rimuovo grafico differenze elettroni in caso di switch
			if (typeof plotLiveBpmY.get('E-differenceY') !== 'undefined') {
				plotLiveBpmY.get('E-differenceY').remove();
				//$('#choices-diffY').prop('checked', false); // Unchecks it
				$('#choices-diffY').removeAttr('checked');
			}


			if ($("#choices-loadY").is(':checked')) {
				if (typeof plotLiveBpmY.get('loadYP') === 'undefined') {
					plotLiveBpmY.addSeries({
						id: "loadYP",
						name: "loadYP",
						color: "#b3939a",
						data: dataLoadYP
					});
				}
				//console.log("dati positroni " + dataLoadYP);

			} else if ($("#snapshot-pos").text() != '' && typeof plotLiveBpmY.get('loadYP') !== 'undefined') {
				plotLiveBpmY.get('loadYP').remove(); //
				$('#choices-loadY').prop('checked', false); // Unchecks it //serve???
			}

			var myset = [[2.8, bpm_arr_y[5]], [5.2, bpm_arr_y[4]], [6.58, bpm_arr_y[3]], [9.7, bpm_arr_y[2]], [11.07, bpm_arr_y[1]],
			[13.48, bpm_arr_y[0]], [17.72, bpm_arr_y[11]], [19.08, bpm_arr_y[10]], [22.86, bpm_arr_y[9]], [25.99, bpm_arr_y[8]],
			[29.76, bpm_arr_y[7]], [31.12, bpm_arr_y[6]]];
			plotLiveBpmY.series[0].setData(myset, true, true, true);
			plotLiveBpmY.series[0].update({ name: "Orbit Y e+" });
			plotLiveBpmY.series[0].update({ color: "#cc0000" });

			if ($("#choices-diffY").is(':checked')) {
				//calcolo la differenza dei grafici tra l'orbita corrente e quella salvata
				diffYP = [];
				for (var i = 0; i < dataLoadYP.length; i++) {
					diffYP.push([myset[i][0], [myset[i][1]] - dataLoadYP[i][1]]);
				}

				//se il grafico non esiste lo creo
				if (typeof plotLiveBpmY.get('P-differenceY') === 'undefined') {
					plotLiveBpmY.addSeries({
						id: 'P-differenceY',
						name: "P-differenceY",
						color: "#cdcd00",
						data: diffYP
					});
				}

				//se il grafico esiste gi� lo aggiorno
				if (typeof plotLiveBpmY.get('P-differenceY') !== 'undefined') {
					var series_diffPdiff = plotLiveBpmY.get("P-differenceY"); //get series by id
					series_diffPdiff.setData(diffYP, true, true, true);
				}

			} else if ($("#snapshot-pos").text() != '' && typeof plotLiveBpmY.get('P-differenceY') !== 'undefined') {
				plotLiveBpmY.get('P-differenceY').remove(); // serve?
				$('#choices-diffY').prop('checked', false); // Unchecks it
			}

		}
	}
}



function buildPlotsOrbitSum() {
	Highcharts.setOptions({
		global: {
			useUTC: true
		}
	});
	if (plotLiveBpmSum == null) {
		//    if(true){
		plotLiveBpmSum = new Highcharts.chart('containerSum', {
			chart: {
				type: 'line',
				animation: Highcharts.svg, // don't animate in old IE
				marginRight: 10,
			},


			title: {
				text: ''
			},

			xAxis: {
				title: {
					text: '[mm]'
				},

				tickPositions: [0, 2.8, 5.2, 6.58, 9.7, 11.07, 13.48, 17.72, 19.08, 22.86, 25.99, 29.76, 31.12],


				plotLines: [{
					value: 0,
					width: 1,
					color: '#808080'
				}]
			},
			yAxis: {
				title: {
					text: 'SUM'
				},
				plotLines: [{
					value: 0,
					width: 1,
					color: '#808080'
				}]
			},
			tooltip: {
				formatter: function () {
					return '<b>' + this.series.name + '</b><br/>' +
						Highcharts.numberFormat(this.x, 2) + '<br/>' +
						Highcharts.numberFormat(this.y, 2);
				}
			},
			legend: {
				enabled: true
			},

			exporting: {
				enabled: true
			},

			plotOptions: {
				series: {
					marker: {
						enabled: false
					}
				}
			},

			credits: {
				enabled: false
			},


			series: [{
				name: "Orbit Sum e-",

				//  turboThreshold: globaLength,
				data: (function () {
					var data_eleSum = [];

					if (linac_mode == -1) {

						data_eleSum.push([2.8, bpm_arr_sum[0]], [5.2, bpm_arr_sum[1]], [6.58, bpm_arr_sum[2]], [9.7, bpm_arr_sum[3]], [11.07, bpm_arr_sum[4]],
							[13.48, bpm_arr_sum[5]], [17.72, bpm_arr_sum[6]], [19.08, bpm_arr_sum[7]], [22.86, bpm_arr_sum[8]], [25.99, bpm_arr_sum[9]],
							[29.76, bpm_arr_sum[10]], [31.12, bpm_arr_sum[11]]);

					} else {
						data_eleSum.push([2.8, bpm_arr_sum[5]], [5.2, bpm_arr_sum[4]], [6.58, bpm_arr_sum[3]], [9.7, bpm_arr_sum[2]], [11.07, bpm_arr_sum[1]],
							[13.48, bpm_arr_sum[0]], [17.72, bpm_arr_sum[11]], [19.08, bpm_arr_sum[10]], [22.86, bpm_arr_sum[9]], [25.99, bpm_arr_sum[8]],
							[29.76, bpm_arr_sum[7]], [31.12, bpm_arr_sum[6]]);
					}
					return data_eleSum;
				}())

			}

			]

		});

	} else {

		if (linac_mode == -1) {

			//rimuovo grafico protoni in caso di switch
			if (typeof plotLiveBpmSum.get('loadSumP') !== 'undefined') {
				plotLiveBpmSum.get('loadSumP').remove();
				//$('#choices-loadX').prop('checked', false); // Unchecks it
				$('#choices-loadSUM').removeAttr('checked'); // Unchecks it

				if ($("#snapshot-ele").text() != '') {
					$('#choices-load-labelSUM').html($("#snapshot-ele").text());
				} else {
					$('#choices-load-labelSUM').html('dataset');
				}
			}

			//rimuovo grafico differenze protoni in caso di switch
			if (typeof plotLiveBpmSum.get('P-difference') !== 'undefined') {
				plotLiveBpmSum.get('P-difference').remove();
				//$('#choices-diffX').prop('checked', false); // Unchecks it
				$('#choices-diffSUM').removeAttr('checked');
			}

			//se � spuntato aggiungi il grafico elettroni
			if ($("#choices-loadSUM").is(':checked')) {
				if (typeof plotLiveBpmSum.get('loadSumE') === 'undefined') {
					plotLiveBpmSum.addSeries({
						id: "loadSumE",
						name: "loadSumE",
						color: "#b3939a",
						data: dataLoadSumE
					});
				}
				//console.log("data elettroni " + dataLoadSumE);
			}
			else if ($("#snapshot-ele").text() != '' && typeof plotLiveBpmSum.get('loadSumE') !== 'undefined') {
				plotLiveBpmSum.get('loadSumE').remove(); //
				$('#choices-loadSUM').prop('checked', false); // Unchecks it //serve???
			}



			var myset = [[2.8, bpm_arr_sum[0]], [5.2, bpm_arr_sum[1]], [6.58, bpm_arr_sum[2]], [9.7, bpm_arr_sum[3]], [11.07, bpm_arr_sum[4]],
			[13.48, bpm_arr_sum[5]], [17.72, bpm_arr_sum[6]], [19.08, bpm_arr_sum[7]], [22.86, bpm_arr_sum[8]], [25.99, bpm_arr_sum[9]],
			[29.76, bpm_arr_sum[10]], [31.12, bpm_arr_sum[11]]];
			plotLiveBpmSum.series[0].setData(myset, true, true, true);
			plotLiveBpmSum.series[0].update({ name: "Orbit Sum e-" });
			plotLiveBpmSum.series[0].update({ color: "#293c9b" });

			if ($("#choices-diffSUM").is(':checked')) {
				//calcolo la differenza dei grafici tra l'orbita corrente e quella salvata
				diffSumE = [];
				for (var i = 0; i < dataLoadSumE.length; i++) {
					diffSumE.push([myset[i][0], [myset[i][1]] - dataLoadSumE[i][1]]);
				}

				//se il grafico non esiste lo creo
				if (typeof plotLiveBpmSum.get('E-difference') === 'undefined') {
					//console.log("checkedXEdiff!");
					plotLiveBpmSum.addSeries({
						id: 'E-difference',
						name: "E-difference",
						color: "#cdcd00",
						data: diffSumE
					});
				}

				//se il grafico esiste gi� lo aggiorno
				if (typeof plotLiveBpmSum.get('E-difference') !== 'undefined') {
					var series_diff = plotLiveBpmSum.get("E-difference"); //get series by id
					series_diff.setData(diffSumE, true, true, true);
				}

			} else if ($("#snapshot-ele").text() != '' && typeof plotLiveBpmSum.get('E-difference') !== 'undefined') {
				plotLiveBpmSum.get('E-difference').remove(); // serve?
				$('#choices-diffSUM').prop('checked', false); // Unchecks it
			}


		} else if (linac_mode == 1) {

			//rimuovo grafico elettroni in caso di switch
			if (typeof plotLiveBpmSum.get('loadSumE') !== 'undefined') {
				plotLiveBpmSum.get('loadSumE').remove();
				//$('#choices-loadY').prop('checked', false); // Unchecks it
				$('#choices-loadSUM').removeAttr('checked'); // Unchecks it
				if ($("#snapshot-pos").text() != '') {
					$('#choices-load-labelSUM').html($("#snapshot-pos").text());
				} else {
					$('#choices-load-labelSUM').html('dataset');
				}
			}

			//rimuovo grafico differenze elettroni in caso di switch
			if (typeof plotLiveBpmSum.get('E-difference') !== 'undefined') {
				plotLiveBpmSum.get('E-difference').remove();
				//$('#choices-diffY').prop('checked', false); // Unchecks it
				$('#choices-diffSUM').removeAttr('checked');
			}


			if ($("#choices-loadSUM").is(':checked')) {
				if (typeof plotLiveBpmSum.get('loadSumP') === 'undefined') {
					plotLiveBpmSum.addSeries({
						id: "loadSumP",
						name: "loadSumP",
						color: "#b3939a",
						data: dataLoadSumP
					});
				}
				//console.log("dati positroni " + dataLoadSumP);

			} else if ($("#snapshot-pos").text() != '' && typeof plotLiveBpmSum.get('loadSumP') !== 'undefined') {
				plotLiveBpmSum.get('loadSumP').remove(); //
				$('#choices-loadSUM').prop('checked', false); // Unchecks it //serve???
			}


			var myset = [[2.8, bpm_arr_sum[5]], [5.2, bpm_arr_sum[4]], [6.58, bpm_arr_sum[3]], [9.7, bpm_arr_sum[2]], [11.07, bpm_arr_sum[1]],
			[13.48, bpm_arr_sum[0]], [17.72, bpm_arr_sum[11]], [19.08, bpm_arr_sum[10]], [22.86, bpm_arr_sum[9]], [25.99, bpm_arr_sum[8]],
			[29.76, bpm_arr_sum[7]], [31.12, bpm_arr_sum[6]]];
			plotLiveBpmSum.series[0].setData(myset, true, true, true);
			plotLiveBpmSum.series[0].update({ name: "Orbit Sum e+" });
			plotLiveBpmSum.series[0].update({ color: "#cc0000" });

			if ($("#choices-diffSUM").is(':checked')) {
				//calcolo la differenza dei grafici tra l'orbita corrente e quella salvata
				diffSumP = [];
				for (var i = 0; i < dataLoadSumP.length; i++) {
					diffSumP.push([myset[i][0], [myset[i][1]] - dataLoadSumP[i][1]]);
				}

				//se il grafico non esiste lo creo
				if (typeof plotLiveBpmSum.get('P-difference') === 'undefined') {
					plotLiveBpmSum.addSeries({
						id: 'P-difference',
						name: "P-difference",
						color: "#cdcd00",
						data: diffSumP
					});
				}

				//se il grafico esiste gi� lo aggiorno
				if (typeof plotLiveBpmSum.get('P-difference') !== 'undefined') {
					var series_diffSum = plotLiveBpmSum.get("P-difference"); //get series by id
					series_diffSum.setData(diffSumP, true, true, true);
				}

			} else if ($("#snapshot-pos").text() != '' && typeof plotLiveBpmSum.get('P-difference') !== 'undefined') {
				plotLiveBpmSum.get('P-difference').remove(); // serve?
				$('#choices-diffSUM').prop('checked', false); // Unchecks it
			}

		}
	}
}



function saveOrbit(nm) {

	if (linac_mode == -1) {
		jchaos.snapshot(nm + "_electron", "create", bpm_accumulator_orbit, null, function (answerS) {
			//console.log("electron " + nm);	
		});

	} else if (linac_mode == 1) {
		jchaos.snapshot(nm + "_positron", "create", bpm_accumulator_orbit, null, function (answerS) {
			//console.log("positron " + nm);
		});

	} else {
		alert("You can't save.");
	}
}


function loadOrbit() {
	if (linac_mode == -1) {
		jchaos.search("_electron", "snapshots", false, function (answerE) {
			if (answerE.length == 0) {
				$('#table_orbit_load').append('<p id="no-results">No results</p>');
			} else {

				$("#table_orbit_load").find("tr:gt(0)").remove();
				answerE.forEach(function (value, index) {
					var date = new Date(value.ts);

					$('#table_orbit_load').append('<tr class"tr_orbit_load"><td>' + date + '</td><td id="name_orbit_load_' + index + '">' + value.name +
						'</td></tr>');
				});
			}
		});

	} else if (linac_mode == 1) {
		jchaos.search("_positron", "snapshots", false, function (answerP) {

			if (answerP.length == 0) {
				$('#table_orbit_load').append('<p id="no-results">No results</p>');
			} else {

				$("#table_orbit_load").find("tr:gt(0)").remove();
				answerP.forEach(function (value, index) {
					var date = new Date(value.ts);

					$('#table_orbit_load').append('<tr class"tr_orbit_load"><td>' + date + '</td><td id="name_orbit_load_' + index + '">' + value.name +
						'</td></tr>');
				});
			}
		});

	} else {
		alert("Empty");
	}
}



var name_orbit_load;
$(document).on("click", "#table_orbit_load tr", function (e) {
	var selected = $(this).hasClass("row_selected");
	$("#table_orbit_load tr").removeClass("row_selected");
	if (!selected) {
		$(this).addClass("row_selected");
		num_row = this.rowIndex;
		num_row = num_row - 1;  // per far partire il conteggio da 1 e non da 0
		//console.log("row_indexxxx " + num_row);
		name_orbit_load = $("#name_orbit_load_" + num_row).text();

		$("input.checkX").attr("disabled", false);
		$("input.checkY").attr("disabled", false);
		$("input.checkSUM").attr("disabled", false);


		if (linac_mode == -1) {
			$("#snapshot-ele").html(name_orbit_load);
			loadDataOrbit(name_orbit_load);

		} else if (linac_mode == 1) {
			$("#snapshot-pos").html(name_orbit_load);
			loadDataOrbit(name_orbit_load);

		} else {
			console.log("Don't save")
		}
	}



});

function loadDataOrbit(name_snap) {

	jchaos.snapshot(name_snap, "load", bpm_accumulator_orbit, null, function (dataBPM) {

		if (linac_mode == -1) {

			var n_prog_ele = 0;
			dataBPM.forEach(function (cuLoad) {
				bpm_name_load_ele[n_prog_ele] = cuLoad.output.ndk_uid;
				bpm_x_load_ele[n_prog_ele] = cuLoad.output.X;
				bpm_y_load_ele[n_prog_ele] = cuLoad.output.Y;
				bpm_sum_load_ele[n_prog_ele] = cuLoad.output.SUM;

				n_prog_ele++;
			});

			dataLoadXE = [[2.8, bpm_x_load_ele[0]], [5.2, bpm_x_load_ele[1]], [6.58, bpm_x_load_ele[2]], [9.7, bpm_x_load_ele[3]], [11.07, bpm_x_load_ele[4]],
			[13.48, bpm_x_load_ele[5]], [17.72, bpm_x_load_ele[6]], [19.08, bpm_x_load_ele[7]], [22.86, bpm_x_load_ele[8]], [25.99, bpm_x_load_ele[9]],
			[29.76, bpm_x_load_ele[10]], [31.12, bpm_x_load_ele[11]]];

			dataLoadYE = [[2.8, bpm_y_load_ele[0]], [5.2, bpm_y_load_ele[1]], [6.58, bpm_y_load_ele[2]], [9.7, bpm_y_load_ele[3]], [11.07, bpm_y_load_ele[4]],
			[13.48, bpm_y_load_ele[5]], [17.72, bpm_y_load_ele[6]], [19.08, bpm_y_load_ele[7]], [22.86, bpm_y_load_ele[8]], [25.99, bpm_y_load_ele[9]],
			[29.76, bpm_y_load_ele[10]], [31.12, bpm_y_load_ele[11]]];

			dataLoadSumE = [[2.8, bpm_sum_load_ele[0]], [5.2, bpm_sum_load_ele[1]], [6.58, bpm_sum_load_ele[2]], [9.7, bpm_sum_load_ele[3]], [11.07, bpm_sum_load_ele[4]],
			[13.48, bpm_sum_load_ele[5]], [17.72, bpm_sum_load_ele[6]], [19.08, bpm_sum_load_ele[7]], [22.86, bpm_sum_load_ele[8]], [25.99, bpm_sum_load_ele[9]],
			[29.76, bpm_sum_load_ele[10]], [31.12, bpm_sum_load_ele[11]]];

		} else if (linac_mode == 1) {

			var n_prog_pos = 0;
			dataBPM.forEach(function (cuLoad) {
				bpm_name_load_pos[n_prog_pos] = cuLoad.output.ndk_uid;
				bpm_x_load_pos[n_prog_pos] = cuLoad.output.X;
				bpm_y_load_pos[n_prog_pos] = cuLoad.output.Y;
				bpm_sum_load_pos[n_prog_pos] = cuLoad.output.SUM;

				n_prog_pos++;
			});

			dataLoadXP = [[2.8, bpm_x_load_pos[5]], [5.2, bpm_x_load_pos[4]], [6.58, bpm_x_load_pos[3]], [9.7, bpm_x_load_pos[2]], [11.07, bpm_x_load_pos[1]],
			[13.48, bpm_x_load_pos[0]], [17.72, bpm_x_load_pos[11]], [19.08, bpm_x_load_pos[10]], [22.86, bpm_x_load_pos[9]], [25.99, bpm_x_load_pos[8]],
			[29.76, bpm_x_load_pos[7]], [31.12, bpm_x_load_pos[6]]];

			dataLoadYP = [[2.8, bpm_y_load_pos[5]], [5.2, bpm_y_load_pos[4]], [6.58, bpm_y_load_pos[3]], [9.7, bpm_y_load_pos[2]], [11.07, bpm_y_load_pos[1]],
			[13.48, bpm_y_load_pos[0]], [17.72, bpm_y_load_pos[11]], [19.08, bpm_y_load_pos[10]], [22.86, bpm_y_load_pos[9]], [25.99, bpm_y_load_pos[8]],
			[29.76, bpm_y_load_pos[7]], [31.12, bpm_y_load_pos[6]]];

			dataLoadSumP = [[2.8, bpm_sum_load_pos[5]], [5.2, bpm_sum_load_pos[4]], [6.58, bpm_sum_load_pos[3]], [9.7, bpm_sum_load_pos[2]], [11.07, bpm_sum_load_pos[1]],
			[13.48, bpm_sum_load_pos[0]], [17.72, bpm_sum_load_pos[11]], [19.08, bpm_sum_load_pos[10]], [22.86, bpm_sum_load_pos[9]], [25.99, bpm_sum_load_pos[8]],
			[29.76, bpm_sum_load_pos[7]], [31.12, bpm_sum_load_pos[6]]];


		} else {
			console.log("Problem");
		}

		$("#choices-load-labelX").html(name_snap);
		$("#choices-load-labelY").html(name_snap);
		$("#choices-load-labelSUM").html(name_snap);

	});



}



function buildPlotCurrent() {
	Highcharts.setOptions({
		global: {
			useUTC: true
		}
	});

	plotLive = new Highcharts.chart('containerCurrent', {
		chart: {
			type: 'spline',
			animation: Highcharts.svg, // don't animate in old IE
			marginRight: 10,
			events: {
				load: function () {

					// set up the updating of the chart each second
					var series = this.series[0];
					var seriesP = this.series[1];
					setInterval(function () {
						var x = (new Date()).getTime(); // current time
						series.addPoint([x, currente], true, true);
						seriesP.addPoint([x, currentp], true, true);
					}, 7500);
				}
			}
		},
		title: {
			text: ''
		},
		xAxis: {
			type: 'datetime',
			tickPixelInterval: 200
		},
		yAxis: {
			title: {
				text: 'mA'
			},
			plotLines: [{
				value: 0,
				width: 1,
				color: 'black'
			}]
		},
		tooltip: {
			formatter: function () {
				return '<b>' + this.series.name + '</b><br/>' +
					Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
					Highcharts.numberFormat(this.y, 2);
			}
		},
		legend: {
			enabled: true
		},
		exporting: {
			enabled: true
		},

		credits: {
			enabled: false
		},


		plotOptions: {
			series: {
				marker: {
					enabled: false
				}
			}
		},

		series: [{
			name: "current e-",
			color: "blue",
			data: (function () {
				// generate an array of random data
				var data_ele = [],
					time = (new Date()).getTime(),
					i;

				for (i = -150; i <= 0; i += 1) {
					data_ele.push({
						x: time + i * 1000,
						y: currente
					});
				}
				return data_ele;
			}())

		},
		{
			name: "current e+",
			color: "red",
			data: (function () {
				// generate an array of random data
				var data_ele = [],
					time = (new Date()).getTime(),
					i;

				for (i = -150; i <= 0; i += 1) {
					data_ele.push({
						x: time + i * 1000,
						y: currentp
					});
				}
				return data_ele;
			}())

		}

		]
	});
} 
