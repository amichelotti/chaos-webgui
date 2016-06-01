
function buildBoxPlotDDreal(title){
    
    /*var array_bpm = ["BPBA1001","BPBA1002","BPBA2001","BPBA2002","BPBA3001","BPBA3002","BPBA4001","BPBA4002","BPSA1001","BPSA2001", 
		    "BPSA3001","BPSA4001"];*/
    
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
   
    var input_sample = $("#SAMPLES").text();

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


array_sample = [];
function setX(samples){
    array_sample = [];
    for (var i = 0; i < samples; i++) {
	array_sample.push(i/4);
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
		
	
	    
	 /*   var nome_bpmX = ["BPBA1001X_ACQ","BPBA1002X_ACQ","BPBA2001X_ACQ","BPBA2002X_ACQ","BPBA3001X_ACQ","BPBA3002X_ACQ","BPBA4001X_ACQ","BPBA4002X_ACQ","BPSA1001X_ACQ","BPSA2001X_ACQ", 
			    "BPSA3001X_ACQ","BPSA4001X_ACQ"];
	    
	    var nome_bpmY = ["BPBA1001Y_ACQ","BPBA1002Y_ACQ","BPBA2001Y_ACQ","BPBA2002Y_ACQ","BPBA3001Y_ACQ","BPBA3002Y_ACQ","BPBA4001Y_ACQ","BPBA4002Y_ACQ","BPSA1001Y_ACQ","BPSA2001Y_ACQ", 
			    "BPSA3001Y_ACQ","BPSA4001Y_ACQ"];*/
	    
	  /*  for (var i = 0; i< globalDataX.length; i ++) {
		globalDataX[i] = [];
		globalDataY[i] = [];
	    }	 */
		
	  /*  for (var j= 0; j < nome_bpmX.length; j ++ ) {
		for ( var k = 0; k< arrayX.length; k++ ) {
		    globalDataX[j].push([arrayX[k],obj_json[nome_bpmX[j]][k]]);
		    globalDataY[j].push([arrayX[k],obj_json[nome_bpmY[j]][k]]);
		}
	    }*/
		
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
	    tickDecimals: [3],
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
	timeout_plot(update, updateInterval);
    }
    
    update(); 
}