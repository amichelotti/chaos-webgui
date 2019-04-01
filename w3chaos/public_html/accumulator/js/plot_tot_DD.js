
function builPlotTotDD(){
    	
    if ($('#plot_accumulator_x').length){

	
	$("#plot_accumulator_x").append('<fieldset class="plot col s12 m12 l12">' 
				    + '<legend>Data X</legend><div class="col s11 m11 l11"><div id="chart_tot_x" style="width:100%; height:300px;"></div></div>'
				    +'<div class="col s1 m1 l1" style="margin-top:2%;"><input type="checkbox" id="choices-loadX" class="filled-in check-plotX"/><label for="choices-loadX" id="choices-load-labelX">dataset</label>'
				    +'<input type="checkbox" id="choices-diffX" class="filled-in check-plotX"/><label for="choices-diffX" id="choices-diff-labelX">diff</label></div>' 
				    +'</fieldset>')
	
	$("input.check-plotX").attr("disabled", true);

	$("#plot_accumulator_y").append('<fieldset class="plot col s12 m12 l12">' 
				    + '<legend>Data Y</legend><div class="col s11 m11 l11"><div id="chart_tot_y" style="width:100%; height:300px;"></div></div>'
				    +'<div class="col s1 m1 l1" style="margin-top:2%;"><input type="checkbox" id="choices-loadY" class="filled-in check-plotY"/><label for="choices-loadY" id="choices-load-labelY">dataset</label>'
				    +'<input type="checkbox" id="choices-diffY" class="filled-in check-plotY"/><label for="choices-diffY" id="choices-diff-labelY">diff</label></div>' 
				    +'</fieldset>')
	
	$("input.check-plotY").attr("disabled", true);

    plotTotDD("#chart_tot_x","plotDataX");
    plotTotDD("#chart_tot_y","plotDataY"); 

 
    } else {
		
	$(".box-accumulator").append('<div id="plot_accumulator_x"></div>');
		
	$("#plot_accumulator_x").append('<fieldset class="plot col s12 m12 l12">' 
				    + '<legend>Data X</legend><div class="col s11 m11 l11"><div id="chart_tot_x" style="width:100%; height:300px;"></div></div>'
				    +'<div class="col s1 m1 l1" style="margin-top:2%;"><input type="checkbox" id="choices-loadX" class="filled-in check-plotX"/><label for="choices-loadX" id="choices-load-labelX">dataset</label>'
				    +'<input type="checkbox" id="choices-diffX" class="filled-in check-plotX"/><label for="choices-diffX" id="choices-diff-labelX">diff</label></div>' 
				    +'</fieldset>')
	
	$("input.check-plotX").attr("disabled", true);
	
	$(".box-accumulator").append('<div id="plot_accumulator_y"></div>');
	
	$("#plot_accumulator_y").append('<fieldset class="plot col s12 m12 l12">' 
				    + '<legend>Data Y</legend><div class="col s11 m11 l11"><div id="chart_tot_y" style="width:100%; height:300px;"></div></div>'
				    +'<div class="col s1 m1 l1" style="margin-top:2%;"><input type="checkbox" id="choices-loadY" class="filled-in check-plotY"/><label for="choices-loadY" id="choices-load-labelY">dataset</label>'
				    +'<input type="checkbox" id="choices-diffY" class="filled-in check-plotY"/><label for="choices-diffY" id="choices-diff-labelY">diff</label></div>' 
				    +'</fieldset>')
	
	$("input.check-plotY").attr("disabled", true);
   
    plotTotDD("#chart_tot_x","plotDataX");
    plotTotDD("#chart_tot_y","plotDataY"); 

    }
} 



function plotTotDD(chart,plotdataset) {
    
var globalDataXP = [];
var globalDataYP = [];
var globalDataXE = [];
var globalDataYE = [];
var datasetXP = [];
var datasetYP = [];
var datasetXE = [];
var datasetYE = [];
var datasetX = [];
var datasetY = [];


var updateInterval = 500;

/*var LoadDataXE = [];
var LoadDataYE = [];
var LoadDataXP = [];
var LoadDataYP = [];

var label_ele;
var label_pos; */

var linac_st = 0;
var fileLoad;

    function GetData() {
       /* $.get("http://" + location.host + ":8081/CU?dev=ACCUMULATOR/BPM/BPMSYNC&cmd=status", function(datavalue, textStatus) {
            var data_json = datavalue.replace(/\$numberLong/g, 'numberLong');
            data_json = data_json.replace(/\//g, '');
            var obj_json = JSON.parse(data_json); */
	    
	    linac_st = 0;
	    linac_st = obj_json.STATUSlinac_mode;
	    // console.log("dafne get data " + linac_st );
	    
	    globalDataXP = [];
	    globalDataYP = [];
	    globalDataXE = [];
	    globalDataYE = [];

	    	    
	    globalDataXP = [[2.8,obj_json.BPBA2002X_ACQ[0]],[5.2,obj_json.BPSA2001X_ACQ[0]],[6.6,obj_json.BPBA2001X_ACQ[0]],
			  [9.7,obj_json.BPBA1002X_ACQ[0]],[11,obj_json.BPSA1001X_ACQ[0]],[13.5,obj_json.BPBA1001X_ACQ[0]],
			  [17.7,obj_json.BPSA4001X_ACQ[0]],[19,obj_json.BPBA4002X_ACQ[0]],[22.9,obj_json.BPBA4001X_ACQ[0]],
			  [26,obj_json.BPBA3002X_ACQ[0]],[29.8,obj_json.BPBA3001X_ACQ[0]],[31.1,obj_json.BPSA3001X_ACQ[0]]];
	    
	    globalDataYP = [[2.8,obj_json.BPBA2002Y_ACQ[0]],[5.2,obj_json.BPSA2001Y_ACQ[0]],[6.6,obj_json.BPBA2001Y_ACQ[0]],
			  [9.7,obj_json.BPBA1002Y_ACQ[0]],[11,obj_json.BPSA1001Y_ACQ[0]],[13.5,obj_json.BPBA1001Y_ACQ[0]],
			  [17.7,obj_json.BPSA4001Y_ACQ[0]],[19,obj_json.BPBA4002Y_ACQ[0]],[22.9,obj_json.BPBA4001Y_ACQ[0]],
			  [26,obj_json.BPBA3002Y_ACQ[0]],[29.8,obj_json.BPBA3001Y_ACQ[0]],[31.1,obj_json.BPSA3001Y_ACQ[0]]];
	    
	    globalDataXE = [[2.8,obj_json.BPBA1001X_ACQ[0]],[5.2,obj_json.BPSA1001X_ACQ[0]],[6.6,obj_json.BPBA1002X_ACQ[0]],
			  [9.7,obj_json.BPBA2001X_ACQ[0]],[11,obj_json.BPSA2001X_ACQ[0]],[13.5,obj_json.BPBA2002X_ACQ[0]],
			  [17.7,obj_json.BPSA3001X_ACQ[0]],[19,obj_json.BPBA3001X_ACQ[0]],[22.9,obj_json.BPBA3002X_ACQ[0]],
			  [26,obj_json.BPBA4001X_ACQ[0]],[29.8,obj_json.BPBA4002X_ACQ[0]],[31.1,obj_json.BPSA4001X_ACQ[0]]];
	    
	    globalDataYE = [[2.8,obj_json.BPBA1001Y_ACQ[0]],[5.2,obj_json.BPSA1001Y_ACQ[0]],[6.6,obj_json.BPBA1002Y_ACQ[0]],
			  [9.7,obj_json.BPBA2001Y_ACQ[0]],[11,obj_json.BPSA2001Y_ACQ[0]],[13.5,obj_json.BPBA2002Y_ACQ[0]],
			  [17.7,obj_json.BPSA3001Y_ACQ[0]],[19,obj_json.BPBA3001Y_ACQ[0]],[22.9,obj_json.BPBA3002Y_ACQ[0]],
			  [26,obj_json.BPBA4001Y_ACQ[0]],[29.8,obj_json.BPBA4002Y_ACQ[0]],[31.1,obj_json.BPSA4001Y_ACQ[0]]];
	    
	    datasetXP = [{label:"currentDataX e+", data: globalDataXP, color: "#b30000" }];
	    datasetYP = [{label:"currentDataY e+",data: globalDataYP, color: "#b30000"}];
	    
	    datasetXE = [{label:"currentDataX e-", data: globalDataXE, color: "#0062FF" }];
	    datasetYE = [{label:"currentDataY e-",data: globalDataYE, color: "#0062FF"}];
	    
	    datasetX = [{label:"noise", data: globalDataXE, color: "#00FF00" }];
	    datasetY = [{label:"noise",data: globalDataYE, color: "#00FF00"}];	


	//});
    }
    
	  /*  $('.btn-load').click(function(){
		fileLoad = $("#nameToLoad").val();
		
		if (fileLoad == '') {
		    fileLoad = name_file_ds;
		}
		
		$.get("http://"+ location.host + ":8081/CU?dev=ACCUMULATOR/BPM/BPMSYNC&cmd=load&parm=" + fileLoad, function(dataLoadJs, textStatus) {
		
		    var dataLoad = dataLoadJs.replace(/\$numberLong/g, 'numberLong');
		    dataLoad = dataLoad.replace(/\//g, '');
		    
		    $("input.check-plotX").attr("disabled", false);
		    $("input.check-plotY").attr("disabled", false);

		    
		    try {
			var objDataLoad = JSON.parse(dataLoad);
			var linac_load = objDataLoad.output.STATUSlinac_mode;
			
			switch(linac_load) {
			    
			    case -1:
				$("#file-up-el").html(fileLoad);
				label_ele = fileLoad;
				
				LoadDataXE = [[2.8,objDataLoad.output.BPBA1001X_ACQ[0]],[5.2,objDataLoad.output.BPSA1001X_ACQ[0]],[6.6,objDataLoad.output.BPBA1002X_ACQ[0]],
					    [9.7,objDataLoad.output.BPBA2001X_ACQ[0]],[11,objDataLoad.output.BPSA2001X_ACQ[0]],[13.5,objDataLoad.output.BPBA2002X_ACQ[0]],
					    [17.7,objDataLoad.output.BPSA3001X_ACQ[0]],[19,objDataLoad.output.BPBA3001X_ACQ[0]],[22.9,objDataLoad.output.BPBA3002X_ACQ[0]],
					    [26,objDataLoad.output.BPBA4001X_ACQ[0]],[29.8,objDataLoad.output.BPBA4002X_ACQ[0]],[31.1,objDataLoad.output.BPSA4001X_ACQ[0]]];
			
				LoadDataYE = [[2.8,objDataLoad.output.BPBA1001Y_ACQ[0]],[5.2,objDataLoad.output.BPSA1001Y_ACQ[0]],[6.6,objDataLoad.output.BPBA1002Y_ACQ[0]],
					    [9.7,objDataLoad.output.BPBA2001Y_ACQ[0]],[11,objDataLoad.output.BPSA2001Y_ACQ[0]],[13.5,objDataLoad.output.BPBA2002Y_ACQ[0]],
					    [17.7,objDataLoad.output.BPSA3001Y_ACQ[0]],[19,objDataLoad.output.BPBA3001Y_ACQ[0]],[22.9,objDataLoad.output.BPBA3002Y_ACQ[0]],
					    [26,objDataLoad.output.BPBA4001Y_ACQ[0]],[29.8,objDataLoad.output.BPBA4002Y_ACQ[0]],[31.1,objDataLoad.output.BPSA4001Y_ACQ[0]]];

			    break;
			
			    case 1:
				$("#file-up-pos").html(fileLoad);
				label_pos = fileLoad;

				LoadDataXP = [[2.8,objDataLoad.output.BPBA2002X_ACQ[0]],[5.2,objDataLoad.output.BPSA2001X_ACQ[0]],[6.6,objDataLoad.output.BPBA2001X_ACQ[0]],
					    [9.7,objDataLoad.output.BPBA1002X_ACQ[0]],[11,objDataLoad.output.BPSA1001X_ACQ[0]],[13.5,objDataLoad.output.BPBA1001X_ACQ[0]],
					    [17.7,objDataLoad.output.BPSA4001X_ACQ[0]],[19,objDataLoad.output.BPBA4002X_ACQ[0]],[22.9,objDataLoad.output.BPBA4001X_ACQ[0]],
					    [26,objDataLoad.output.BPBA3002X_ACQ[0]],[29.8,objDataLoad.output.BPBA3001X_ACQ[0]],[31.1,objDataLoad.output.BPSA3001X_ACQ[0]]];
			    
				LoadDataYP = [[2.8,objDataLoad.output.BPBA2002Y_ACQ[0]],[5.2,objDataLoad.output.BPSA2001Y_ACQ[0]],[6.6,objDataLoad.output.BPBA2001Y_ACQ[0]],
					    [9.7,objDataLoad.output.BPBA1002Y_ACQ[0]],[11,objDataLoad.output.BPSA1001Y_ACQ[0]],[13.5,objDataLoad.output.BPBA1001Y_ACQ[0]],
					    [17.7,objDataLoad.output.BPSA4001Y_ACQ[0]],[19,objDataLoad.output.BPBA4002Y_ACQ[0]],[22.9,objDataLoad.output.BPBA4001Y_ACQ[0]],
					    [26,objDataLoad.output.BPBA3002Y_ACQ[0]],[29.8,objDataLoad.output.BPBA3001Y_ACQ[0]],[31.1,objDataLoad.output.BPSA3001Y_ACQ[0]]];
			    
			    break;
			}
		    }  catch(e) {
			    console.log("errore parsing" + e.message);
			    alert("the uploaded file does not exist")
			}
		});
	    });*/
	
    var optionsP = {
	series: {
	    lines: {
		show: true,
		lineWidth: 1.2
	    }
	},
	xaxis: {
	    tickSize: [1],
	    ticks: [
		    [2.8,"BA2002"],
		    [5.2,"SA2001"],
		    [6.6,"BA2001"],
		    [9.7,"BA1002"],
		    [11,"SA1001"],
		    [13.5,"BA1001"],
		    [17.7,"SA4001"],
		    [19,"BA4002"],
		    [22.9,"BA4001"],
		    [26,"BA3002"],
		    [29.8,"BA3001"],
		    [31.1,"SA3001"],
		    ],
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
    
        var optionsE = {
	series: {
	    lines: {
		show: true,
		lineWidth: 1.2
	    }
	},
	xaxis: {
	    tickSize: [1],
	    ticks: [
		    [2.8,"BA1001"],
		    [5.2,"SA1001"],
		    [6.6,"BA1002"],
		    [9.7,"BA2001"],
		    [11,"SA2001"],
		    [13.5,"BA2002"],
		    [17.7,"SA3001"],
		    [19,"BA3001"],
		    [22.9,"BA3002"],
		    [26,"BA4001"],
		    [29.8,"BA4002"],
		    [31.1,"SA4001"],
		    ],
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
	    labelBoxBorderColor: "#000"
	},
    };
    
    function update() {
        GetData();
	
	switch (linac_st) {
	    case -1:
		if (plotdataset == "plotDataX") {
		    if (LoadDataXE.length) {
			$("#choices-load-labelX").html(label_ele);
			//$('input.check-plotX:checkbox').removeAttr('checked');

			if ($("#choices-loadX").is(':checked'))   {
			    datasetXE.push({label: label_ele, data: LoadDataXE});
			}
			if ($("#choices-diffX").is(':checked'))   {
			    var diffXE= []; 
			    for(var i = 0; i< LoadDataXE.length; i++) {
			        diffXE.push( [LoadDataXE[i][0], LoadDataXE[i][1] - globalDataXE[i][1]]);	
			    }
			    datasetXE.push({label: "difference", data: diffXE}); 
			}
		    }
		    $.plot($(chart), datasetXE, optionsE);
		}
	
		if (plotdataset == "plotDataY") {
		    if (LoadDataYE.length) {
			$("#choices-load-labelY").html(label_ele);
			if ($("#choices-loadY").is(':checked'))   {
			    datasetYE.push({label:label_ele, data: LoadDataYE});
			}
			if ($("#choices-diffY").is(':checked'))   {
			    var diffYE= []; 
			    for(var i = 0; i< LoadDataYE.length; i++) {
			        diffYE.push( [LoadDataYE[i][0], LoadDataYE[i][1] - globalDataYE[i][1]]);	
			    }
			    datasetYE.push({label: "difference", data: diffYE});
			}
		    }
		    $.plot($(chart), datasetYE, optionsE)
		}
		break;
	
	    case 1:
		if (plotdataset == "plotDataX") {
		    if (LoadDataXP.length) {
			$("#choices-load-labelX").html(label_pos);
			//$('input.check-plotX:checkbox').removeAttr('checked');
			if ($("#choices-loadX").is(':checked'))   {
			    datasetXP.push({label: label_pos, data: LoadDataXP});
			    console.log("protoni " + LoadDataXP);
			}
			if ($("#choices-diffX").is(':checked'))   {
			    var diffXP= []; 
			    for(var i = 0; i< LoadDataXP.length; i++) {
				diffXP.push( [LoadDataXP[i][0], LoadDataXP[i][1] - globalDataXP[i][1]]);	
			    }
			    datasetXP.push({label: "difference", data: diffXP});
			}
		    }
		    $.plot($(chart), datasetXP, optionsP);
		}
	
		if (plotdataset == "plotDataY") {
		    if (LoadDataYP.length) {
			$("#choices-load-labelY").html(label_pos);
			if ($("#choices-loadY").is(':checked'))   {
			    datasetYP.push({label: label_pos, data: LoadDataYP});
			}
			if ($("#choices-diffY").is(':checked'))   {
			    var diffYP= []; 
			    for(var i = 0; i< LoadDataYP.length; i++) {
			        diffYP.push( [LoadDataYP[i][0], LoadDataYP[i][1] - globalDataYP[i][1]]);	
			    }
			    datasetYP.push({label: "difference", data: diffYP});
			}
		    }
		    $.plot($(chart), datasetYP, optionsP)
		}
		break;
	    
	    default:
		if (plotdataset == "plotDataX") {	
		    $.plot($(chart), datasetX, optionsE);
		}
		if (plotdataset == "plotDataY") {	
		    $.plot($(chart), datasetY, optionsE)
		}
	
	}
	timeout_plot(update, updateInterval);
    } 
    update(); 
}




