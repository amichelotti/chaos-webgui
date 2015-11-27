var dataVA= [];
var dataVB= [];
var dataVC= [];
var dataVD= [];

var datasetVA;
var totalPointsVA = 100;
var updateIntervalVA = 1500;

var nowVA = new Date().getTime();
var nowVB = new Date().getTime();
var nowVC = new Date().getTime();
var nowVD = new Date().getTime();



function GetDataVA() {
    
    dataVA.shift();
    dataVB.shift();
    dataVC.shift();
    dataVD.shift();
    
    while (dataVA.length < totalPointsVA) {
	
	var VA = parseFloat(document.getElementById("VA_0").innerHTML);
	var VB = parseFloat(document.getElementById("VB_0").innerHTML);
	var VC = parseFloat(document.getElementById("VC_0").innerHTML);
	var VD = parseFloat(document.getElementById("VD_0").innerHTML);



	var tempVA = [nowVA += updateIntervalVA,VA];
	var tempVB = [nowVB += updateIntervalVA,VB];
	var tempVC = [nowVC += updateIntervalVA,VC];
	var tempVD = [nowVD += updateIntervalVA,VD];


	
	dataVA.push(tempVA);
	dataVB.push(tempVB);
	dataVC.push(tempVC);
	dataVD.push(tempVD);

    }
}

var optionsVA = {
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
            var dateVA = new Date(v);

            if (dateVA.getSeconds() % 20 == 0) {
                var hoursVA = dateVA.getHours() < 10 ? "0" + dateVA.getHours() : dateVA.getHours();
                var minutesVA = dateVA.getMinutes() < 10 ? "0" + dateVA.getMinutes() : dateVA.getMinutes();
                var secondsVA = dateVA.getSeconds() < 10 ? "0" + dateVA.getSeconds() : dateVA.getSeconds();

                return hoursVA + ":" + minutesVA + ":" + secondsVA;
            } else {
                return "";
            } 
        }, 
        axisLabel: "Time",
        axisLabelUseCanvas: true,
        axisLabelFontSizePixels: 12,
        axisLabelFontFamily: 'Verdana, Arial',
        axisLabelPadding: 10
    },
    yaxis: {
	tickDecimals: [2],
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
    GetDataVA();

    datasetVA = [
	
	        {label:"Voltage_VA [mV]", data: dataVA, color: "#00ff80" },
		{label:"Voltage_VB [mV]", data: dataVB, color: "#ff007f" }, 
		{label:"Voltage_VC [mV]", data: dataVC, color: "#ff8000" },
		{label:"Voltage_VD [mV]", data: dataVD, color: "#007fff" }, 
];

    $.plot($("#flot-placeholder1"), datasetVA, optionsVA);

    function updateVA() {
        GetDataVA();

        $.plot($("#flot-placeholder1"), datasetVA, optionsVA)
        setTimeout(updateVA, updateIntervalVA);
    }

    updateVA();
});

