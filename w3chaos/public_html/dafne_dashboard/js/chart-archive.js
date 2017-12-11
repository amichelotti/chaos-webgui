/*
 * LETTURA DATI (CORRENTE READ OUT, STATO, ERRORI) CHAOS E CREAZIONE TABELLA DEI MAGNETI
 */

/*$(function() {
    $('.dataRange').daterangepicker({
	
        timePicker: true,
        timePickerIncrement: 15,
        locale: {
            format: 'MM/DD/YYYY h:mm A'
        },
	singleDatePicker: true,
	startDate : moment().format('MM/DD/YYYY'),
        endDate : moment().format('MM/DD/YYYY')

    });
        
});


var StartDate = 0;
var EndDate = 0;
var startDate_tmp = 0;
var endDate_tmp = 0;
$('#viewChart').click(function(){
    
    var AMPstart = 0;
    var AMPend = 0;
 
    StartDate = $("#startDate").val();
    EndDate = $("#endDate").val();
    
    console.log("timestamp aaa" + StartDate);
    
    
    StartDate = StartDate.match(/(\d+)\/(\d+)\/(\d+) (\d+):(\d+) ([AMP]+)/);
    EndDate = EndDate.match(/(\d+)\/(\d+)\/(\d+) (\d+):(\d+) ([AMP]+)/);
    
    if (StartDate[6] == "PM") {
	var tmp_start = parseInt(StartDate[4]);
	AMPstart = tmp_start + 12;
    } else {
	AMPstart = StartDate[4];
    } 
    
    
    if (EndDate[6] == "PM") {
	var tmp_end = parseInt(EndDate[4]);
	AMPend = tmp_end + 12;
    } else {
	AMPend = EndDate[4];
    }

    StartDate =  Date.UTC(StartDate[3],parseInt(StartDate[1])-1,StartDate[2],AMPstart,StartDate[5]);
    EndDate = Date.UTC(EndDate[3],parseInt(EndDate[1])-1,EndDate[2],AMPend,EndDate[5]);
    
    console.log("http://" + location.host + ":8081/CU?dev=DAFNE/STATUS&cmd=queryhst&parm={'start':" + StartDate + ",'end':" + EndDate + "}");
    $.get("http://" + location.host + ':8081/CU?dev=DAFNE/STATUS&cmd=queryhst&parm={"start":' + StartDate + ',"end":' + EndDate + "}", function(datavalue, textStatus) {

        var old_str = datavalue.replace(/\$numberLong/g, 'numberLong');
	
	
	var hist = $.parseJSON(old_str);
	
	
	var hist_data = hist[0].data;
	
		
    });
    
    //createChart();
  
}); */

var seriesOptions = [],
    seriesCounter = 0,
    names = ['MSFT', 'AAPL', 'GOOG'];

/**
 * Create the chart when all data is loaded
 * @returns {undefined}
 */
function createChart() {

    Highcharts.stockChart('container', {

        rangeSelector: {
            selected: 4
        },

        yAxis: {
            labels: {
                formatter: function () {
                    return (this.value > 0 ? ' + ' : '') + this.value + '%';
                }
            },
            plotLines: [{
                value: 0,
                width: 2,
                color: 'silver'
            }]
        },

        plotOptions: {
            series: {
                compare: 'percent',
                showInNavigator: true
            }
        },

        tooltip: {
            pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
            valueDecimals: 2,
            split: true
        },

        series: seriesOptions
    });
}

$.each(names, function (i, name) {

    $.getJSON('https://www.highcharts.com/samples/data/jsonp.php?filename=' + name.toLowerCase() + '-c.json&callback=?',    function (data) {

        seriesOptions[i] = {
            name: name,
            data: data
        };

        // As we're loading the data asynchronously, we don't know what order it will arrive. So
        // we keep a counter and create the chart when all the data is loaded.
        seriesCounter += 1;

        if (seriesCounter === names.length) {
            createChart();
        }
    });
});


/*var obj_json;
var frequency=1000;
var thisDelay=frequency;
var url_device = "DAFNE/STATUS";

var em;
var ep;

$(document).ready(function() {

    current_ACQ();

    setTimeout(buildPlots,4000);
}); */



/*function current_ACQ() {
        $.get("http://" + location.host + ":8081/CU?dev="+ url_device + "&cmd=channel&parm=-1", function(datavalue, textStatus) {
	
	console.log("aaaaaa")
	
	var data_json = datavalue.replace(/\$numberLong/g, 'numberLong');
	
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
} */



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
} */

