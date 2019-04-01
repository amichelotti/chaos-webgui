/*
 * LETTURA DATI (CORRENTE READ OUT, STATO, ERRORI) CHAOS E CREAZIONE TABELLA DEI MAGNETI
 */

var nameCU = 0;

(document).ready(function() {
	nameCU = $("#nameCUchart").val();

    
 $.get("http://" + location.host + ":8081/CU?dev="+ nameCU + "&cmd=channel&parm=-1", function(data, textStatus) {
	
	var dataCU = $.parseJSON(data);
	

	
	
	
 });  /* End get data */
 
}); /* End ready */


var obj_json;
var frequency=1000;
var thisDelay=frequency;
var url_device = "DAFNE/STATUS";

var em;
var ep;

$(document).ready(function() {

    current_ACQ();

    setTimeout(buildPlots,4000);
});



function current_ACQ() {
        $.get("http://" + location.host + ":8081/CU?dev="+ url_device + "&cmd=channel&parm=-1", function(datavalue, textStatus) {
	
	console.log("aaaaaa")
	
	var data_json = datavalue.replace(/\$numberLong/g, 'numberLong');
	    //data_json = data_json.replace(/\//g, '');
	
	try {
	
	    em = 0;
	    ep = 0;
	    var linac = 0;
	    var dafne = 0;
	    device_alarms = 0;
		    

	    obj_json = $.parseJSON(data_json);                   
	    console.log("accumulator: " + obj_json);
	    
	    obj_json.forEach(function(el) {

		
		em = el.output.em;
		ep = el.output.ep;
		linac = el.output.linac_mode;
		dafne = el.output.dafne_status;
		device_alarms = el.output.device_alarm;
		
		//TIMESTAMP = el.output.dpck_ats.numberLong;
	    });
                    $("#td_em").html(em);
		    $("#td_ep").html(ep);
		    $("#td_linac").html(linac);
		    $("#td_dafne").html(dafne);
		    $("#td_alarm").html(device_alarms); 
	    	
	    setTimeout(current_ACQ,frequency);
	
	}  catch(e) {	
	        console.log("errore parsing" + e.message);
	        alert("Error status")
	}

    })
}



/*function buildPlots() {
    Highcharts.setOptions({
        global: {
            useUTC: false
        }
    });

    Highcharts.chart('container', {
        chart: {
            type: 'spline',
            animation: Highcharts.svg, // don't animate in old IE
            marginRight: 10,
            events: {
                load: function () {

                    // set up the updating of the chart each second
                    var series = this.series[0];
                    setInterval(function () {
                        var x = (new Date()).getTime(), // current time
                           // y = Math.random();
			   y = em;
                        series.addPoint([x, y], true, true);
                    }, 1000);
                }
            }
        },
        title: {
            text: ''
        },
        xAxis: {
            type: 'datetime',
            tickPixelInterval: 150
        },
        yAxis: {
            title: {
                text: '[mA]'
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
        series: [{
            name: 'elettroni',
            data: (function () {
                // generate an array of random data
                var data_ele = [],
                    time = (new Date()).getTime(),
                    i;

                for (i = -50; i <= 0; i += 1) {
                    data_ele.push({
                        x: time + i * 1000,
                        y: em
                    });
                }
                return data_ele;
            }())
	    
        }
	
	]
    });
} */






function buildPlots() {
    Highcharts.setOptions({
        global: {
            useUTC: false
        }
    });

    Highcharts.chart('container', {
        chart: {
            type: 'spline',
            animation: Highcharts.svg, // don't animate in old IE
            marginRight: 10,
            events: {
                load: function () {

                    // set up the updating of the chart each second
                    var series_uno = this.series[0];
                    setInterval(function () {
                        var x = (new Date()).getTime(), // current time
			   y = em;
                        series_uno.addPoint([x, y], true, true);
                    }, 1000);
		    
		    var series_due = this.series[1];
                    setInterval(function () {
                        var x = (new Date()).getTime(), // current time
			   y = ep;
                        series_due.addPoint([x, y], true, true);
                    }, 1000);
		    
		    
		    
		    
                }
            }
        },
        title: {
            text: ''
        },
        xAxis: {
            type: 'datetime',
            tickPixelInterval: 150
        },
        yAxis: {
            title: {
                text: '[mA]'
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
	
	plotOptions: {
	    series: {
		marker: {
		    enabled: false
		}
	    }
	},

	
        series: [{
            name: 'e-',
	    color:'#0000be',
            data: (function () {
                // generate an array of random data
                var data_ele = [],
                    time = (new Date()).getTime(),
                    i;

                for (i = -50; i <= 0; i += 1) {
                    data_ele.push({
                        x: time + i * 1000,
                        y: em
                    });
                }
                return data_ele;
            }())
	    
        },
	{
            name: 'e+',
	    color: '#cc0000',

            data: (function () {
                // generate an array of random data
                var data_pos = [],
                    time = (new Date()).getTime(),
                    i;

                for (i = -50; i <= 0; i += 1) {
                    data_pos.push({
                        x: time + i * 1000,
                        y:ep
                    });
                }
                return data_pos;
            }())
	    
        }
	
	]
    });
}

