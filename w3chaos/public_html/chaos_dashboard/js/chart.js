var seriesOptions = [],
    seriesCounter = 0,
    names = ['MSFT', 'AAPL'];

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
                color: 'white'
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
	
	console.log("dataaa " + data);

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