/*
 * LETTURA DATI LIVE CU
 */

var obj_json;
var frequency=1000;
var variableToPlotLive = '';
var dataToPlot;
var plotLive = [];


$("#plot-live").click(function () {
    
     getData();
     
       if ($('#container').is(':empty')){
	setTimeout(buildPlotLive,4000);
	//console.log("empty");
	} else {
	    plotLive.destroy();
	    setTimeout(buildPlotLive,4000);
	    //console.log("full");
	}
    variableToPlotLive = $("#variable option:selected").val();

});
    

function getData() {
        $.get("http://" +  url_server + ":" + n_port +"/CU?dev="+ cuToPlot + "&cmd=channel&parm=-1", function(datavalue, textStatus) {
	
	var data_json = datavalue.replace(/\$numberLong/g, 'numberLong');
	    //data_json = data_json.replace(/\//g, '');
	
	try {
	    
	    dataToPlot = 0;
	    obj_json = $.parseJSON(data_json);                   
	    //console.log("accumulator: " + obj_json);
	    obj_json.forEach(function(el) {
    		dataToPlot = el[chan][variableToPlotLive];
	    }); 
                   	
	    setTimeout(getData(),frequency);
	
	}  catch(e) {	
	        console.log("errore parsing" + e.message);
	        alert("Error status")
	}

    })
}



function buildPlotLive() {
    Highcharts.setOptions({
        global: {
            useUTC: true
        }
    });

   plotLive = new Highcharts.chart('container', {
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
			   y = dataToPlot;
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
            tickPixelInterval: 200
        },
        yAxis: {
            title: {
                text: 'A.U.'
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
            name: variableToPlotLive,
            data: (function () {
                // generate an array of random data
                var data_ele = [],
                    time = (new Date()).getTime(),
                    i;

                for (i = -150; i <= 0; i += 1) {
                    data_ele.push({
                        x: time + i * 1000,
                        y: dataToPlot
                    });
                }
                return data_ele;
            }())
	    
        }
	
	]
    });
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
} */


    
