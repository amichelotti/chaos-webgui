var dataTe = [];
var datasetTe;
var totalPointsTe = 100;
var updateIntervalTe = 1500;
var nowTe = new Date().getTime();

function GetDataTe() {
    
    dataTe.shift();
    
    while (dataTe.length < totalPointsTe) {
	
	var TU10 = parseFloat(document.getElementById("TEMP_0").innerHTML);
	var TU11 = parseFloat(document.getElementById("TEMP_1").innerHTML);
	var TU12 = parseFloat(document.getElementById("TEMP_2").innerHTML);
	var TU21 = parseFloat(document.getElementById("TEMP_6").innerHTML);
	var TU22 = parseFloat(document.getElementById("TEMP_7").innerHTML);
	var TU23 = parseFloat(document.getElementById("TEMP_8").innerHTML);
	var TU31 = parseFloat(document.getElementById("TEMP_11").innerHTML);
	var TU32 = parseFloat(document.getElementById("TEMP_12").innerHTML);
	var TU33 = parseFloat(document.getElementById("TEMP_13").innerHTML);
	var TU34 = parseFloat(document.getElementById("TEMP_14").innerHTML);
	var TU41 = parseFloat(document.getElementById("TEMP_17").innerHTML);
	var TU42 = parseFloat(document.getElementById("TEMP_18").innerHTML);
	var TU43 = parseFloat(document.getElementById("TEMP_19").innerHTML);
	var TU44 = parseFloat(document.getElementById("TEMP_20").innerHTML);
	var TU51 = parseFloat(document.getElementById("TEMP_22").innerHTML);
	var TU52 = parseFloat(document.getElementById("TEMP_23").innerHTML);
	
	var temp_avg = (TU10 + TU11 + TU12 + TU21 + TU22 + TU23 + TU31 + TU32 + TU33 + TU34 + TU41 + TU42 + TU43 + TU44 + TU51 + TU52)/16;

        var tempTe = [nowTe += updateIntervalTe, temp_avg];


        dataTe.push(tempTe);
    }
}

var optionsTe = {
    series: {
        lines: {
            show: true,
            lineWidth: 1.2,
            fill: true
        }
    },
    xaxis: {
        mode: "time",
        tickSize: [2, "second"],
        tickFormatter: function (v, axis) {
            var dateTe = new Date(v);

            if (dateTe.getSeconds() % 20 == 0) {
                var hoursTe = dateTe.getHours() < 10 ? "0" + dateTe.getHours() : dateTe.getHours();
                var minutesTe = dateTe.getMinutes() < 10 ? "0" + dateTe.getMinutes() : dateTe.getMinutes();
                var secondsTe = dateTe.getSeconds() < 10 ? "0" + dateTe.getSeconds() : dateTe.getSeconds();

                return hoursTe + ":" + minutesTe + ":" + secondsTe;
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
        min: 0,
	
	max: 35,        

        tickSize: 5,
        tickFormatter: function (v, axis) {
            if (v % 5 == 0) {
		//return v;

                return v + "&#186C";
            } else {
                return "";
            }
        },
        axisLabel: "Temp avg",
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
    GetDataTe();

    datasetTe = [
	
	        {label:"temp_avg", data: dataTe, color: "#00FF00" }
    ];

    $.plot($("#flot-placeholder6"), datasetTe, optionsTe);

    function updateTe() {
        GetDataTe();

        $.plot($("#flot-placeholder6"), datasetTe, optionsTe)
        setTimeout(updateTe, updateIntervalTe);
    }

    updateTe();
});

