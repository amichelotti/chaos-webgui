/*
 * ARCHIVE - plot
 */


$(function() {
    $('.dataRange').daterangepicker({
	
        timePicker: true,
        timePickerIncrement: 1,
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
var uid = 0;

var globalData = [];
	
var globalDataY = [];

var globaLength = '';
var plotTo = [];
		
    
function plot() {
    
    
    variableToPlot = $("#variable option:selected").val();


    
    console.log("ciaaoaoao");
    
    var AMPstart = 0;
    var AMPend = 0;
 
    StartDate = $("#startDate").val();
    EndDate = $("#endDate").val();
    
    //console.log("timestamp aaa" + StartDate);
    
    
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
    
    
    console.log("start " + StartDate);
    console.log("end " + EndDate);
    
    console.log(" fff " + variableToPlot + "canale " + chan + " cu " + cuToPlot);
    
 
   
   
   
   
   
   
   
   
   
    
    //query funzionante con btf 
     $.get("http://" +  url_server + ":" + n_port +'/CU?dev=' + cuToPlot + '&cmd=queryhst&parm={"start":'  + StartDate + ',"end":' + EndDate + ',"var":"' + variableToPlot + '","channel":"' + chan + '","page":100}', function(datavalue, textStatus) {
	
	
   // console.log("http://" +  url_server + ":" + n_port +'/CU?dev=' + cuToPlot + '&cmd=queryhst&parm={"start":'  + StartDate + ',"end":' + EndDate + ',"var":"' + variableToPlot + '","channel":"' + chan + '","page":100}');
	
	
	//console.log("old_str " + datavalue);
	
	var hist = $.parseJSON(datavalue);
    
	
	console.log("hist " + hist);
	
	var x_time = hist.data;
	
	//console.log
	
	var lunghezza_data = x_time.length;
	
	
	console.log("aaaa " + x_time);
	
	
	
	
	 $.each(x_time, function(key, value){
	    
	    	 $.each(value, function(key, value_p){
		    
		    if (key == 'ts') {
			
			globalData.push(value_p);
		    } else if ( key == 'val') {
			
			globalDataY.push(value_p);
		    }

				
		//globalData.push(x[i],y[i]);
	    }); 
		 
	});

	
	console.log("lunghezza " + globalData.length + "2 " + globalDataY.length);
	
	
	globaLength = globalData.length;
	
	//console.log("global " + globalData + "Y " + globalDataY);
	
	console.log("####### numeri " + globalData);
	
	console.log("####### valori " + globalDataY);

	
	
	//var dataToPlot = hist.data[0].val;
	
	//console.log("data to " + dataToPlot);
	

	
	

	   
	   if ($('#container').is(':empty')){
  
	    
	    	buildPlots();
		
		console.log("empty");

	    
	    } else {
		
			plotTo.destroy();
			
			buildPlots();
			console.log("full");
	
	    }
	   
	});
    
}

     
     
  
     
function buildPlots() {
    Highcharts.setOptions({
        global: {
            useUTC: false
        }
    });

     plotTo = new Highcharts.chart('container', {
        chart: {
            type: 'spline',
            animation: Highcharts.svg, // don't animate in old IE
            marginRight: 10,
          //  events: {
            //    load: function () {

                    // set up the updating of the chart each second
               /*     var series_uno = this.series[0];
                    setInterval(function () {
                        var x = (new Date()).getTime(), // current time
			   y = em;
                        series_uno.addPoint([x, y], true, true);
                    }, 1000); */
		    
		 /*   var series_due = this.series[1];
                    setInterval(function () {
                        var x = (new Date()).getTime(), // current time
			   y = ep;
                        series_due.addPoint([x, y], true, true);
                    }, 1000);  */
		    
		    
		    
		    
              //  }
           // }
        },
        title: {
            text: ''
        },
        xAxis: {
            type: 'datetime',
            tickPixelInterval: 500
        },
        yAxis: {
            title: {
                text: '[A]'
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

	
    credits: {
            enabled: false
        },

	
    series: [{
    name: variableToPlot,
    
    turboThreshold: globaLength,
    data: (function() {
	var data_ele = [];
	
	for(var i=0; i<globalData.length; i++){
			   
	     data_ele.push([globalData[i],globalDataY[i]]);
	     
	     console.log("lunghezza " + globalData.length);
	} 
        return data_ele;
            }())
	    
       }  
	
	] 
	
    });

}

    
        
    
    
 /*   $.get("http://" + location.host + ':8081/CU?dev=LUMINOMETER/CAEN775&cmd=queryhst&parm={"start":' + StartDate + ',"end":' + EndDate + ',"page":1}', function(datavalue, textStatus) {

        var old_str = datavalue.replace(/\$numberLong/g, 'numberLong');
	
	console.log("old_str " + old_str);
	
	var hist = $.parseJSON(old_str);
	
	console.log("uno  " + hist[0] +  "due " + hist[0].uid);
	
	uid = hist[0].uid;
	
    }); */
    
    
   // action(uid);
    
    
    /*do {
	
	$.get("http://" + location.host + ':8081/CU?dev=LUMINOMETER/CAEN775&cmd=queryhstnext&parm={"uid":' + uid + "}" , function(data, textStatus) {
	
	uid ++ ;
	console.log("uidddd " + uid);
	
	console.log("aaaa ");
	
	});
	
    } while (uid != "0") */
    
    
    
    
    
/*var text = "";
var i = 0;
do {
    text += "The number is " + i;
    i++;
}
while (i < 5); */
	
	/*var hist_data = hist[0].data;
	
	for(var i=0; i< hist_data.length; i ++) {
	    
	    delete hist_data[i].busy;
	    delete hist_data[i].device_alarm;
	    delete hist_data[i].cu_alarm;
	    delete hist_data[i].ndk_uid;
	    delete hist_data[i].dpck_seq_id;
	    delete hist_data[i].dpck_ds_type;
	    delete hist_data[i].ndk_uid;
	} */
	
	
    /*if(hist_data == '')
            return;
        JSONToCSVConvertor(hist_data,"Luminometer", true);  */


   // });
  
//}

    
