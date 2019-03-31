
function buildBoxPlotDD(title){    
    
    if ($('#multi_plot').length){

	$("#multi_plot").append('<div class="row"><div class="col s12 m12 l12"><h3 class="plot_title">------  ' + title+ '  -----</h3></div></div>');
      
	for(i = 0; i < val.length; i ++ ){
	    
	    $('#multi_plot').append('<div class="row"><div class="col s12 m12 l12"><div class="col s2 m2 l2 name_dvc"><div class="rTableCell device"><b>'+val[i] +'</b></div>'
				    + '</div><div class="col s9 m9 l5"><fieldset class="plot"><legend>X [mm]</legend>'
					+ '<div id="plotX' +[i] +'" style="width:98%; height:260px;"></div>' 
					+'</fieldset></div><div class="col s9 m9 l5 offset-s2 offset-m2"><fieldset class="plot">' 
					+ '<legend>Y [mm]</legend><div id="plotY'+[i]+'" style="width:98%; height:260px;"></div>' 
					+'</fieldset></div></div></div>');
	} 
   
    if (title == 'Data on Demand') {
        input_sample = $("#sampleDD_0").val();
    } else {
	input_sample = $("#sampleTR_0").val();
    }

   setX(input_sample);

   plotDD();
   
    }  else {
	
	$(".box-multiple-plot").append('<div id="multi_plot"></div>');

	        
	$("#multi_plot").append('<div class="row"><div class="col s12 m12 l12"><h3 class="plot_title">------  ' + title+ '  -----</h3></div></div>');
      
	for(i = 0; i < val.length; i ++ ){
	    
	    $('#multi_plot').append('<div class="row"><div class="col s12 m12 l12"><div class="col s2 m2 l2 name_dvc"><div class="rTableCell device"><b>'+val[i] +'</b></div>'
				    + '</div><div class="col s9 m9 l5"><fieldset class="plot"><legend>X [mm]</legend>'
					+ '<div id="plotX' +[i] +'" style="width:98%; height:260px;"></div>' 
					+'</fieldset></div><div class="col s9 m9 l5 offset-s2 offset-m2"><fieldset class="plot">' 
					+ '<legend>Y [mm]</legend><div id="plotY'+[i]+'" style="width:98%; height:260px;"></div>' 
					+'</fieldset></div></div></div>');
	    
	}
	
   
    if (title == 'Data on Demand') {
        input_sample = $("#sampleDD_0").val();
    } else {
	input_sample = $("#sampleTR_0").val();
    }

   setX(input_sample);
   
   plotDD();

    }
}


var array_sample = [];
function setX(samples){
    array_sample = [];
    for (var i = 0; i < samples; i++) {
	array_sample.push(i);
    }   
}

function plotDD() {
        
    var updateInterval = 1000;

    var globalDataX = new Array(val.length);
    var globalDataY = new Array(val.length);
    for (var i = 0; i< globalDataX.length; i ++) {
	globalDataX[i] = [[],[]];
	globalDataY[i] = [[],[]];
    }
    
    var setX = new Array(val.length);
    var setY = new Array(val.length);
    for (var i = 0; i< globalDataX.length; i ++) {
	setX[i] = [];
	setY[i] = [];
    }
    
    var name_bpmX = [];
    var name_bpmY = [];
    
    function GetData() {
        $.get("http://" + location.host + ":8081/CU?dev=ACCUMULATOR/BPM/BPMSYNC&cmd=status", function(datavalue, textStatus) {
	    
	    var data_json = datavalue.replace(/\$numberLong/g, 'numberLong');
            data_json = data_json.replace(/\//g, '');
            var obj_json = JSON.parse(data_json);
	    
	    var arrayX = array_sample;
	    
	    for (var i = 0; i< val.length; i ++) {
		globalDataX[i] = [];
		globalDataY[i] = [];
	    }	
	    
	    name_bpmX = [];
	    name_bpmY = [];

	    for (var i = 0; i<val.length; i ++) {
		name_bpmX.push(val[i]+"X_ACQ");
		name_bpmY.push(val[i]+"Y_ACQ");
	    }
	    
		
	    for (var j= 0; j < val.length; j ++ ) {
		for ( var k = 0; k< arrayX.length; k++ ) {
		    globalDataX[j].push([arrayX[k],obj_json[name_bpmX[j]][k]]);
		    globalDataY[j].push([arrayX[k],obj_json[name_bpmY[j]][k]]);
		}
	    }
		
	    for ( var i = 0; i< val.length; i++) {
		setX[i] = [{label: "position-x", data: globalDataX[i], color: "#00FF00"}];
		setY[i] = [{label: "position-y", data: globalDataY[i], color: "#00FF00"}];
	    }
	    		
	});
    }
    
    var options = {
	series: {
	    points: {
		show: true,
		lineWidth: 1.2
	    }
	},
	xaxis: {
	    axisLabel: "[]",
	    axisLabelUseCanvas: true,
	    axisLabelFontSizePixels: 12,
	    axisLabelFontFamily: 'Verdana, Arial',
	    axisLabelPadding: 10
	},
	yaxis: {
	    tickDecimals: [3],
	    axisLabel: "[mm]",
	    axisLabelUseCanvas: true,
	    axisLabelFontSizePixels: 12,
	    axisLabelFontFamily: 'Verdana, Arial',
	    axisLabelPadding: 6
	},
	legend: {        
	    labelBoxBorderColor: "#fff"
	},
    };
    
    function update() {
        GetData();
	
	for (var i = 0; i< val.length ; i ++) {
	    $.plot($("#plotX" + i), setX[i], options)
	    $.plot($("#plotY" + i), setY[i], options)
	}
        //setTimeout(update, updateInterval);
	timeout_plot(update, updateInterval);
    }
    
    update(); 
}


