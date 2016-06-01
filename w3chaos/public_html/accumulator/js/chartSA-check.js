
function buildBoxPlotSA(title){
          
      if ($('#multi_plot').length){
    	        
            $("#multi_plot").append('<div class="row"><div class="col s12 m12 l12"><h3 class="plot_title">------  ' + title+ '  -----</h3></div></div>');
                        
            for(i = 0; i < val.length; i ++ ){

                  
                   $('#multi_plot').append('<div class="row"><div class="col s3 m3 l3 name_dvc"><div class="rTableCell device"><b>'+val[i] +'</b></div>'
				    + '</div></div>' 
				    +'<div class="row"><div class="col s12 m12 l12">'
				    +'<div class="col s12 m12 l4"><fieldset class="plot"><legend>SUM [V]</legend>'
				    + '<div id="plotSum' +[i] +'" style="width:98%; height:260px;"></div></fieldset></div>'
				    +'<div class="col s12 m12 l4"><fieldset class="plot"><legend>X [mm]</legend>'
				    + '<div id="plotX' +[i] +'" style="width:98%; height:260px;"></div></fieldset></div>'
				    +'<div class="col s12 m12 l4"><fieldset class="plot"><legend>Y [mm]</legend>'
				    + '<div id="plotY' +[i] +'" style="width:98%; height:260px;"></div></fieldset></div>'
				    +'</div></div>');
            }
      	
    
      plotSA();
       
      } else {
            
            $(".box-multiple-plot").append('<div id="multi_plot"></div>');
  
            $("#multi_plot").append('<div class="row"><div class="col s12 m12 l12"><h3 class="plot_title">------  ' + title+ '  -----</h3></div></div>');
      
            for(i = 0; i < val.length; i ++ ){
                  
                   $('#multi_plot').append('<div class="row"><div class="col s3 m3 l3 name_dvc"><div class="rTableCell device"><b>'+val[i] +'</b></div>'
				    + '</div></div>' 
				    +'<div class="row"><div class="col s12 m12 l12">'
				    +'<div class="col s12 m12 l4"><fieldset class="plot"><legend>SUM [V]</legend>'
				    + '<div id="plotSum' +[i] +'" style="width:98%; height:260px;"></div></fieldset></div>'
				    +'<div class="col s12 m12 l4"><fieldset class="plot"><legend>X [mm]</legend>'
				    + '<div id="plotX' +[i] +'" style="width:98%; height:260px;"></div></fieldset></div>'
				    +'<div class="col s12 m12 l4"><fieldset class="plot"><legend>Y [mm]</legend>'
				    + '<div id="plotY' +[i] +'" style="width:98%; height:260px;"></div></fieldset></div>'
				    +'</div></div>');
            }
      	
            plotSA();
	
      }
} 


function plotSA() {
      
      var updateInterval = 500;
      var totalPoints = 100;

      var globalDataX = new Array(val.length);
      var globalDataY = new Array(val.length);
      var globalDataSum = new Array(val.length);
      for (var i = 0; i< globalDataX.length; i ++) {
            globalDataX[i] = [];
            globalDataY[i] = [];
            globalDataSum[i] = [[],[]];
      }
    
      var setX = new Array(val.length);
      var setY = new Array(val.length);
      var setSum = new Array(val.length);
      for (var i = 0; i< globalDataX.length; i ++) {
            setX[i] = [];
            setY[i] = [];
            setSum[i] = [];
      }

      var nowX = new Array(val.length);
      var nowY = new Array(val.length);
      var nowSum = new Array(val.length);
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
                  
                  var array_bpm_nomeX = [];
                  var array_bpm_nomeY = [];
                  var array_bpm_Sum = [];
                  
                   for (var i = 0; i<val.length; i ++) {
                        array_bpm_nomeX.push(val[i]+"X");
                        array_bpm_nomeY.push(val[i]+"Y");
                        array_bpm_Sum.push(val[i]+"SUM");
                  }

                        
                  for (var i=0; i<val.length; i++){
                        globalDataX[i].shift();
                        while(globalDataX[i].length <totalPoints){
                              globalDataX[i].push([nowX[i] += updateInterval, obj_json[array_bpm_nomeX[i]]]);
                        }          
                  }
                  
                  for (var i=0; i<val.length; i++){
                        globalDataY[i].shift();
                        while(globalDataY[i].length <totalPoints){
                              globalDataY[i].push([nowY[i] += updateInterval, obj_json[array_bpm_nomeY[i]]]);
                        }          
                  }
                  
                  for (var i=0; i<val.length; i++){
                        globalDataSum[i].shift();
                        while(globalDataSum[i].length <totalPoints){
                              globalDataSum[i].push([nowSum[i] += updateInterval, obj_json[array_bpm_Sum[i]]]);
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
    
      for (var i=0; i<val.length; i++){
            setX[i] = [{label:"position-x", data: globalDataX[i], color: "#00FF00" }];
            setY[i] = [{label:"position-y", data: globalDataY[i], color: "#00FF00" }];
            setSum[i] = [{label: "sum", data: globalDataSum[i], color: "#00FF00"}];
      }
    
   // dataset = [{label:lab, data: globalData, color: "#00FF00" }];
    
      function update() {
            GetData();
            
            for(var i=0; i<val.length; i++){
                  $.plot($("#plotX"+i), setX[i], options)
                  $.plot($("#plotY"+i), setY[i], options)
                  $.plot($("#plotSum"+i), setSum[i], options)
            }
        //setTimeout(update, updateInterval);
      timeout_plot(update, updateInterval);
      }
      
      update(); 
}

