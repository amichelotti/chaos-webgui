
function buildBoxPlotSA(title){
    
      var array_bpm = ["BPBA1001","BPBA1002","BPBA2001","BPBA2002","BPBA3001","BPBA3002","BPBA4001","BPBA4002","BPSA1001","BPSA2001", 
		    "BPSA3001","BPSA4001"]; 
    
      if ($('#multi_plot').length){
    	        
            $("#multi_plot").append('<div class="row"><div class="col s12 m12 l12"><h3 class="plot_title">------  ' + title+ '  -----</h3></div></div>');
      
            for(i = 0; i < array_bpm.length; i ++ ){
                  
                   $('#multi_plot').append('<div class="row"><div class="col s3 m3 l3 name_dvc"><div class="rTableCell device"><b>'+array_bpm[i] +'</b></div>'
				    + '</div></div>' 
				    +'<div class="row"><div class="col s12 m12 l12">'
				    +'<div class="col s12 m12 l4"><fieldset class="plot"><legend>SUM [V]</legend>'
				    + '<div id="plotSum' +[i] +'" style="width:98%; height:260px;"></div></fieldset></div>'
				    +'<div class="col s12 m12 l4"><fieldset class="plot"><legend>X [mm]</legend>'
				    + '<div id="plotX' +[i] +'" style="width:98%; height:260px;"></div></fieldset></div>'
				    +'<div class="col s12 m12 l4"><fieldset class="plot"><legend>Y [mm]</legend>'
				    + '<div id="plotY' +[i] +'" style="width:98%; height:260px;"></div></fieldset></div>'
				    +'</div></div>');
                  
               /* $('#multi_plot').append('<div class="row"><div class="col s12 m12 l12"><div class="col s2 m2 l2 name_dvc"><div class="rTableCell device"><b>'+array_bpm[i] +'</b></div>'
				    + '</div><div class="col s9 m9 l5"><fieldset class="plot"><legend>X [mm]</legend>'
					+ '<div id="plotX' +[i] +'" style="width:98%; height:260px;"></div>' 
					+'</fieldset></div><div class="col s9 m9 l5 offset-s2 offset-m2"><fieldset class="plot">' 
					+ '<legend>Y [mm]</legend><div id="plotY'+[i]+'" style="width:98%; height:260px;"></div>' 
					+'</fieldset></div></div></div>'); */
            }
      	
    
      plotSA();
       
      } else {
            
            $(".box-multiple-plot").append('<div id="multi_plot"></div>');
  
            $("#multi_plot").append('<div class="row"><div class="col s12 m12 l12"><h3 class="plot_title">------  ' + title+ '  -----</h3></div></div>');
      
            for(i = 0; i < array_bpm.length; i ++ ){
                  
                   $('#multi_plot').append('<div class="row"><div class="col s3 m3 l3 name_dvc"><div class="rTableCell device"><b>'+array_bpm[i] +'</b></div>'
				    + '</div></div>' 
				    +'<div class="row"><div class="col s12 m12 l12">'
				    +'<div class="col s12 m12 l4"><fieldset class="plot"><legend>SUM [V]</legend>'
				    + '<div id="plotSum' +[i] +'" style="width:98%; height:260px;"></div></fieldset></div>'
				    +'<div class="col s12 m12 l4"><fieldset class="plot"><legend>X [mm]</legend>'
				    + '<div id="plotX' +[i] +'" style="width:98%; height:260px;"></div></fieldset></div>'
				    +'<div class="col s12 m12 l4"><fieldset class="plot"><legend>Y [mm]</legend>'
				    + '<div id="plotY' +[i] +'" style="width:98%; height:260px;"></div></fieldset></div>'
				    +'</div></div>');
                   
                   
               /* $('#multi_plot').append('<div class="row"><div class="col s12 m12 l12"><div class="col s2 m2 l2 name_dvc"><div class="rTableCell device"><b>'+array_bpm[i] +'</b></div>'
				    + '</div><div class="col s9 m9 l5"><fieldset class="plot"><legend>X [mm]</legend>'
					+ '<div id="plotX' +[i] +'" style="width:98%; height:260px;"></div>' 
					+'</fieldset></div><div class="col s9 m9 l5 offset-s2 offset-m2"><fieldset class="plot">' 
					+ '<legend>Y [mm]</legend><div id="plotY'+[i]+'" style="width:98%; height:260px;"></div>' 
					+'</fieldset></div></div></div>'); */
            }
      	
            plotSA();
	
      }
} 


function plotSA() {
      
      var updateInterval = 500;
      var totalPoints = 100;

      var globalDataX = new Array(12);
      var globalDataY = new Array(12);
      var globalDataSum = new Array(12);
      for (var i = 0; i< globalDataX.length; i ++) {
            globalDataX[i] = [];
            globalDataY[i] = [];
            globalDataSum[i] = [[],[]];
      }
    
      var setX = new Array(12);
      var setY = new Array(12);
      var setSum = new Array(12);
      for (var i = 0; i< globalDataX.length; i ++) {
            setX[i] = [];
            setY[i] = [];
            setSum[i] = [];
      }

      var nowX = new Array(12);
      var nowY = new Array(12);
      var nowSum = new Array(12);
      for (var i = 0; i< nowX.length; i ++) {
            nowX[i] = new Date().getTime();
            nowY[i] = new Date().getTime();
            nowSum[i] = new Date().getTime();
      }
    

      function GetData() {
            $.get("http://" + location.host + ":8081/CU?dev=ACCUMULATOR/BPM/BPMSYNC&cmd=status", function(datavalue, textStatus) {
                  var data_json = datavalue.replace(/\$numberLong/g, 'numberLong');
                  data_json = data_json.replace(/\//g, '');
                  var obj_json = JSON.parse(data_json);
                        
                  var array_bpm_nome = ["BPBA1001X","BPBA1002X","BPBA2001X","BPBA2002X","BPBA3001X","BPBA3002X","BPBA4001X","BPBA4002X","BPSA1001X","BPSA2001X", 
                                    "BPSA3001X","BPSA4001X"];
                  
                  var array_bpm_nomeY = ["BPBA1001Y","BPBA1002Y","BPBA2001Y","BPBA2002Y","BPBA3001Y","BPBA3002Y","BPBA4001Y","BPBA4002Y","BPSA1001Y","BPSA2001Y", 
                                    "BPSA3001Y","BPSA4001Y"];
                  
                  var nome_bpmSum = ["BPBA1001SUM","BPBA1002SUM","BPBA2001SUM","BPBA2002SUM","BPBA3001SUM","BPBA3002SUM","BPBA4001SUM","BPBA4002SUM","BPSA1001SUM","BPSA2001SUM", 
                                    "BPSA3001SUM","BPSA4001SUM"];

                        
                  for (var i=0; i<12; i++){
                        globalDataX[i].shift();
                        while(globalDataX[i].length <totalPoints){
                              globalDataX[i].push([nowX[i] += updateInterval, obj_json[array_bpm_nome[i]]]);
                        }          
                  }
                  
                  for (var i=0; i<12; i++){
                        globalDataY[i].shift();
                        while(globalDataY[i].length <totalPoints){
                              globalDataY[i].push([nowY[i] += updateInterval, obj_json[array_bpm_nomeY[i]]]);
                        }          
                  }
                  
                  for (var i=0; i<12; i++){
                        globalDataSum[i].shift();
                        while(globalDataSum[i].length <totalPoints){
                              globalDataSum[i].push([nowSum[i] += updateInterval, obj_json[nome_bpmSum[i]]]);
                        }          
                  }
            
            });
      }
              
        
      var options = {
            series: {
                  lines: {
                      show: true,
                      lineWidth: 1.2
                  }
            },
            xaxis: {
                  mode: "time",
                  tickSize: [2, "second"],
                  tickFormatter: function (v, axis) {
                        var date = new Date(v);
                        if (date.getSeconds() % 30 == 0) {
                              var hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
                              var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
                              var seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
                              return hours + ":" + minutes + ":" + seconds;
                        } else {
                              return "";
                        } 
                  }, 
                  axisLabel: "Time [h:m:s]",
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
    
      for (var i=0; i<12; i++){
            setX[i] = [{label:"position-x", data: globalDataX[i], color: "#00FF00" }];
            setY[i] = [{label:"position-y", data: globalDataY[i], color: "#00FF00" }];
            setSum[i] = [{label: "sum", data: globalDataSum[i], color: "#00FF00"}];
      }
    
   // dataset = [{label:lab, data: globalData, color: "#00FF00" }];
    
      function update() {
            GetData();
            
            for(var i=0; i<12; i++){
                  $.plot($("#plotX"+i), setX[i], options)
                  $.plot($("#plotY"+i), setY[i], options)
                  $.plot($("#plotSum"+i), setSum[i], options)
            }
        //$.plot($(plot), dataset, options)
        //setTimeout(update, updateInterval);
      timeout_plot(update, updateInterval);
      }
      
      update(); 
}

