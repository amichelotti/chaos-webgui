/////// POSITION Y ////////

var dataBA1001Y = [];
var dataBA1002Y = [];
var dataBA2001Y = [];
var dataBA2002Y = [];
var dataBA3001Y = [];
var dataBA3002Y = [];
var dataBA4001Y = [];
var dataBA4002Y = [];
var dataSA1001Y = [];
var dataSA2001Y = [];
var dataSA3001Y = [];
var dataSA4001Y = [];

var datasetY;
var totalPointsY = 1;
var updateIntervalY = 1500;

var dataYgen = [];

function GetDataY() {

        var BPBA1001Y = parseFloat(document.getElementById("BPBA1001Y_0").innerHTML);
	var BPBA1002Y = parseFloat(document.getElementById("BPBA1002Y_0").innerHTML);
	var BPBA2001Y = parseFloat(document.getElementById("BPBA2001Y_0").innerHTML);
	var BPBA2002Y = parseFloat(document.getElementById("BPBA2002Y_0").innerHTML);
	var BPBA3001Y = parseFloat(document.getElementById("BPBA3001Y_0").innerHTML);
	var BPBA3002Y = parseFloat(document.getElementById("BPBA3002Y_0").innerHTML);
	var BPBA4001Y = parseFloat(document.getElementById("BPBA4001Y_0").innerHTML);
	var BPBA4002Y = parseFloat(document.getElementById("BPBA4002Y_0").innerHTML);
	var BPSA1001Y = parseFloat(document.getElementById("BPSA1001Y_0").innerHTML);
	var BPSA2001Y = parseFloat(document.getElementById("BPSA2001Y_0").innerHTML);
	var BPSA3001Y = parseFloat(document.getElementById("BPSA3001Y_0").innerHTML);
	var BPSA4001Y = parseFloat(document.getElementById("BPSA4001Y_0").innerHTML); 

         var cum_BPBA1001Y = [1,BPBA1001Y];
         var cum_BPSA1001Y = [2,BPSA1001Y];
         var cum_BPBA1002Y = [3,BPBA1002Y];
         var cum_BPBA2001Y = [4,BPBA2001Y];
         var cum_BPSA2001Y = [5,BPSA2001Y];
         var cum_BPBA2002Y = [6,BPBA2002Y];
         var cum_BPSA3001Y = [7,BPSA3001Y];
         var cum_BPBA3001Y = [8,BPBA3001Y];
         var cum_BPBA3002Y = [9,BPBA3002Y];
         var cum_BPBA4001Y = [10,BPBA4001Y];
         var cum_BPBA4002Y = [11,BPBA4002Y];
         var cum_BPSA4001Y = [12,BPSA4001Y]; 
      
      dataBA1001Y[0] = cum_BPBA1001Y;
      dataSA1001Y[0] = cum_BPSA1001Y;
      dataBA1002Y[0] = cum_BPBA1002Y; 
      dataBA2001Y[0] = cum_BPBA2001Y; 
      dataSA2001Y[0] = cum_BPSA2001Y; 
      dataBA2002Y[0] = cum_BPBA2002Y; 
      dataSA3001Y[0] = cum_BPSA3001Y; 
      dataBA3001Y[0] = cum_BPBA3001Y; 
      dataBA3002Y[0] = cum_BPBA3002Y; 
      dataBA4001Y[0] = cum_BPBA4001Y; 
      dataBA4002Y[0] = cum_BPBA4002Y;
      dataSA4001Y[0] = cum_BPSA4001Y; 
        

    }

var optionsY = {
   /* series: {
        points: {
            show: true,
            lineWidth: 1.2
        }
    }, */
    series: {
        points: {
            show: true,
            lineWidth: 1.2
        },
	lines: {
            show: true,
            lineWidth: 1.2
        }
    }, 
    xaxis: {
   
        axisLabelUseCanvas: true,
        axisLabelFontSizePixels: 12,
        axisLabelFontFamily: 'Verdana, Arial',
        axisLabelPadding: 10
    },
    yaxis: {
      	tickDecimals: [4],
	axisLabel: "mm",
        axisLabelUseCanvas: true,
        axisLabelFontSizePixels: 12,
        axisLabelFontFamily: 'Verdana, Arial',
        axisLabelPadding: 6
    },
    legend: {        
        labelBoxBorderColor: "#fff"
    },
};

$(document).ready(function () {
    GetDataY();
	datasetY = [{data: dataBA1001Y, color: "#00FF00" },{data: dataSA1001Y, color: "#00FF00"},
                    {data: dataBA1002Y, color: "#00FF00"},{data: dataBA2001Y, color: "#00FF00"},{data: dataSA2001Y, color: "#00FF00"},
                    {data: dataBA2002Y, color: "#00FF00"},{data: dataSA3001Y, color: "#00FF00"},{data: dataBA3001Y, color: "#00FF00"},
                    {data: dataBA3002Y, color: "#00FF00"},{data: dataBA4001Y, color: "#00FF00"},{data: dataBA4002Y, color: "#00FF00"},
                    {data: dataSA4001Y, color: "#00FF00"}]; 
        
    $.plot($("#flot-placeholder1"), datasetY, optionsY);

    function updateY() {
        GetDataY();
	$.plot($("#flot-placeholder1"), datasetY, optionsY)
        setTimeout(updateY, updateIntervalY);
    }
    updateY();
});


////////////// POSITION X //////////////

var dataBA1001X = [];
var dataBA1002X = [];
var dataBA2001X = [];
var dataBA2002X = [];
var dataBA3001X = [];
var dataBA3002X = [];
var dataBA4001X = [];
var dataBA4002X = [];
var dataSA1001X = [];
var dataSA2001X = [];
var dataSA3001X = [];
var dataSA4001X = [];

var datasetX;
var totalPoiXntsX = 1;
var updateIntervalX = 1500;

//var dataXgen = [];

function GetDataX() {

        var BPBA1001X = parseFloat(document.getElementById("BPBA1001X_0").innerHTML);
	var BPBA1002X = parseFloat(document.getElementById("BPBA1002X_0").innerHTML);
	var BPBA2001X = parseFloat(document.getElementById("BPBA2001X_0").innerHTML);
	var BPBA2002X = parseFloat(document.getElementById("BPBA2002X_0").innerHTML);
	var BPBA3001X = parseFloat(document.getElementById("BPBA3001X_0").innerHTML);
	var BPBA3002X = parseFloat(document.getElementById("BPBA3002X_0").innerHTML);
	var BPBA4001X = parseFloat(document.getElementById("BPBA4001X_0").innerHTML);
	var BPBA4002X = parseFloat(document.getElementById("BPBA4002X_0").innerHTML);
	var BPSA1001X = parseFloat(document.getElementById("BPSA1001X_0").innerHTML);
	var BPSA2001X = parseFloat(document.getElementById("BPSA2001X_0").innerHTML);
	var BPSA3001X = parseFloat(document.getElementById("BPSA3001X_0").innerHTML);
	var BPSA4001X = parseFloat(document.getElementById("BPSA4001X_0").innerHTML);
        
        
         var cum_BPBA1001X = [1,BPBA1001X];
         var cum_BPSA1001X = [2,BPSA1001X];
         var cum_BPBA1002X = [3,BPBA1002X];
         var cum_BPBA2001X = [4,BPBA2001X];
         var cum_BPSA2001X = [5,BPSA2001X];
         var cum_BPBA2002X = [6,BPBA2002X];
         var cum_BPSA3001X = [7,BPSA3001X];
         var cum_BPBA3001X = [8,BPBA3001X];
         var cum_BPBA3002X = [9,BPBA3002X];
         var cum_BPBA4001X = [10,BPBA4001X];
         var cum_BPBA4002X = [11,BPBA4002X];
         var cum_BPSA4001X = [12,BPSA4001X]; 
      
      dataBA1001X[0] = cum_BPBA1001X;
      dataSA1001X[0] = cum_BPSA1001X;
      dataBA1002X[0] = cum_BPBA1002X; 
      dataBA2001X[0] = cum_BPBA2001X; 
      dataSA2001X[0] = cum_BPSA2001X; 
      dataBA2002X[0] = cum_BPBA2002X; 
      dataSA3001X[0] = cum_BPSA3001X; 
      dataBA3001X[0] = cum_BPBA3001X; 
      dataBA3002X[0] = cum_BPBA3002X; 
      dataBA4001X[0] = cum_BPBA4001X; 
      dataBA4002X[0] = cum_BPBA4002X;
      dataSA4001X[0] = cum_BPSA4001X; 
        

    }

var optionsX = {
    series: {
        points: {
            show: true,
            lineWidth: 1.2
        }
    },
    xaxis: {
   
        axisLabelUseCanvas: true,
        axisLabelFontSizePixels: 12,
        axisLabelFontFamily: 'Verdana, Arial',
        axisLabelPadding: 10
    },
    yaxis: {
      	tickDecimals: [4],
	axisLabel: "mm",
        axisLabelUseCanvas: true,
        axisLabelFontSizePixels: 12,
        axisLabelFontFamily: 'Verdana, Arial',
        axisLabelPadding: 6
    },
    legend: {        
        labelBoxBorderColor: "#fff"
    },
};

$(document).ready(function () {
    GetDataX();
	datasetX = [{data: dataBA1001X, color: "#00FF00" },{data: dataSA1001X, color: "#00FF00"},
                    {data: dataBA1002X, color: "#00FF00"},{data: dataBA2001X, color: "#00FF00"},{data: dataSA2001X, color: "#00FF00"},
                    {data: dataBA2002X, color: "#00FF00"},{data: dataSA3001X, color: "#00FF00"},{data: dataBA3001X, color: "#00FF00"},
                    {data: dataBA3002X, color: "#00FF00"},{data: dataBA4001X, color: "#00FF00"},{data: dataBA4002X, color: "#00FF00"},
                    {data: dataSA4001X, color: "#00FF00"}]; 
        
    $.plot($("#flot-placeholder2"), datasetX, optionsX);

    function updateX() {
        GetDataX();
	$.plot($("#flot-placeholder2"), datasetX, optionsX)
        setTimeout(updateX, updateIntervalX);
    }
    updateX();
});





