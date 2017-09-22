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
//var uid = 0;
var uid_next = 0;
var hist = [];

var globalData = [];
var globalDataY = [];

var globaLength = '';
var plotTo = [];
var x_time = [];
		
    
function plot() {
    variableToPlot = $("#variable option:selected").val();
    var AMPstart = 0;
    var AMPend = 0;
 
    StartDate = $("#startDate").val();
    EndDate = $("#endDate").val();
        
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
    
    
    //console.log("starttttt ######### " + StartDate);
    //console.log("end ######### " + EndDate);
    //console.log(" fff " + variableToPlot + "canale " + chan + " cu " + cuToPlot);
   jchaos.getHistory(cuToPlot,chan,StartDate,EndDate,variableToPlot,function(result){
       	console.log("Returned " + result.X.length);

       globalData=result.X;
       globalDataY=result.Y;
        if ($('#container').is(':empty')){
		buildPlots();
		//console.log("empty");
	    } else {
		plotTo.destroy();
		buildPlots();
		//console.log("full");
	    }
   });
//    $.get("http://" +  url_server + ":" + n_port +'/CU?dev=' + cuToPlot + '&cmd=queryhst&parm={"start":'  + StartDate + ',"end":' + EndDate + ',"var":"' + variableToPlot + '","channel":"' + chan + '","page":1000}', function(datavalue, textStatus) {
//
//	console.log("dataaaa###### " + datavalue);
//	hist = $.parseJSON(datavalue);
//	console.log("hist " + hist);
//	uid_next = hist.uid;
//	//console.log("numero uid" + uid_next);
//	 x_time = hist.data;
//
//
//	if (uid_next == 0) {
//	   // x_time = hist.data;
//	    //uid_next = hist.uid;
//	    //console.log("uiidddd " + uid_next);	
//	    var lunghezza_data = x_time.length;
//	
//	   // console.log("aaaa " + x_time);
//	    $.each(x_time, function(key, value){
//	    	$.each(value, function(key, value_p){
//		    
//		    if (jQuery.type(key == 'val') != "array") {
//			console.log("riga 91####");
//			
//			if (key == 'ts') {			
//			    globalData.push(value_p);
//			    	//console.log("globalData " + globalData);
//
//			} else if ( key == 'val') {
//			
//			    globalDataY.push(value_p);
//			    
//			   // console.log("globalData " + value_p);
//			    
//			} 
//			
//		    } else if(jQuery.type(key == 'val') === "array") {
//			//if ( key == 'val') {
//			    globalDataY = value_p;
//			    //globalData = array_sample;
//			    console.log("IN ARRAY");
//			//}
//			
//			
//			
//		    } 
//		    
//		   
//
//		   // }
//		}); 
//	    });
//
//	    console.log("lunghezza " + globalData.length + "2 " + globalDataY.length);
//	    globaLength = globalData.length;
//		    
//	  //  console.log("####### numeri " + globalData);
//	  //  console.log("####### valori " + globalDataY);
//	   
//	    if ($('#container').is(':empty')){
//		buildPlots();
//		//console.log("empty");
//	    } else {
//		plotTo.destroy();
//		buildPlots();
//		//console.log("full");
//	    }
//	
//	
//	} /* chiusura if chiamata queryhst con uid = 0 */
//	
//	
//	else {
//	    
//	    
//	  //  console.log("uiidddd " + uid_next);
//	    
//	/*   do {
//	    
//	  //  console.log("http://" +  url_server + ":" + n_port +'/CU?dev=' + cuToPlot + '&cmd=querynext&parm={"uid":' + uid_next + ',"var":"' +  variableToPlot+ '"}');
//    
//   $.get("http://" +  url_server + ":" + n_port +'/CU?dev=' + cuToPlot + '&cmd=querynext&parm={"uid":' + uid_next + '","var":"' +  variableToPlot+ "}", function(dataval, textStatus) {
//	
//	console.log("aaaaa#####");
//
//	hist_next = $.parseJSON(dataval);
//	console.log("hist " + hist_next);
//	uid_next = hist_next.uid;
//	//console.log("numero uid" + uid_next);
//
//	
//	    
//	    x_time =+ hist_next.data;
//	    
//	    console.log("x_time ��������� " + x_time);
//	    
//	   // hist_tot =+ 
//    
//    
//   }); // end $get hstnext 
//   
//    
//    
//   }  // end do
//   
//   while (uid_next != 0) */
//	    
//
//	    
//	}  // end else uid != 0
//	       
//	});  // chiusura $get queryhst
//
	    
}  //end function plot 

     
     
function buildPlots() {
    Highcharts.setOptions({
        global: {
            useUTC: true
        }
    });

     plotTo = new Highcharts.chart('container', {
        chart: {
            type: 'spline',
            animation: Highcharts.svg, // don't animate in old IE
            marginRight: 10,
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
	     
	     //console.log("lunghezza " + globalData.length);
	} 
        return data_ele;
            }())
	    
       }  
	
	] 
	
    });

}



function plot_array() {
    
}

// Function per asse x nel caso IMA
array_sample = [];
function setX(samples){
    for (var i = 0; i < samples; i++) {
	array_sample.push(i/4);
    }
return array_sample;
}

    