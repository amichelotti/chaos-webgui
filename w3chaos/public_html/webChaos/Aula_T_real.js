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

    $.plot($("#flot-placeholder1"), datasetTe, optionsTe);

    function updateTe() {
        GetDataTe();

        $.plot($("#flot-placeholder1"), datasetTe, optionsTe)
        setTimeout(updateTe, updateIntervalTe);
    }

    updateTe();
});



///////////////////////////*****************//////////////////////////


var dataCO = [];
var datasetCO;
var totalPointsCO = 100;
var updateIntervalCO = 1500;
var nowCO = new Date().getTime();

function GetDataCO() {
    
    dataCO.shift();
    	
    while (dataCO.length < totalPointsCO) {
	
	
	var CO1 = parseFloat(document.getElementById("CO2_5").innerHTML);
	var CO3 = parseFloat(document.getElementById("CO2_16").innerHTML);
	var CO5 = parseFloat(document.getElementById("CO2_26").innerHTML);
	
	//CO_avg = (CO1 + CO3 + CO5)/3;
	
	var CO_avg = (CO3 + CO5)/2;
	       
        var tempCO = [nowCO += updateIntervalCO, CO_avg];

        dataCO.push(tempCO);
    }
}

var optionsCO = {
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
            var dateCO = new Date(v);

            if (dateCO.getSeconds() % 20 == 0) {
                var hoursCO = dateCO.getHours() < 10 ? "0" + dateCO.getHours() : dateCO.getHours();
                var minutesCO = dateCO.getMinutes() < 10 ? "0" + dateCO.getMinutes() : dateCO.getMinutes();
                var secondsCO = dateCO.getSeconds() < 10 ? "0" + dateCO.getSeconds() : dateCO.getSeconds();

                return hoursCO + ":" + minutesCO + ":" + secondsCO;
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
        min: 50,	
	max: 300,        

        tickSize: 5,
        tickFormatter: function (v, axis) {
            if (v % 20 == 0) {
	//	return v;

                return v + "ppm";
            } else {
                return "";
            }
        },
        axisLabel: "CO2 loading",
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
    GetDataCO();

    datasetCO = [
       // { label: "CO2_avg", data: dataCO, color: "#00FF00" }
       
     {label: "CO2_avg",data: dataCO, color: "#00FF00" }

    ];

    $.plot($("#flot-placeholder2"), datasetCO, optionsCO);

    function updateCO() {
        GetDataCO();

        $.plot($("#flot-placeholder2"), datasetCO, optionsCO)
        setTimeout(updateCO, updateIntervalCO);
    }

    updateCO();
});


/////////////////////////***********************//////////////////////////////////


var dataHu = [];
var datasetHu;
var totalPointsHu = 100;
var updateIntervalHu = 1500;
var nowHu= new Date().getTime();

function GetDataHu() {
    
    dataHu.shift();
    
    while (dataHu.length < totalPointsHu) {
	
	var HU10 = parseFloat(document.getElementById("HUMIDITY_0").innerHTML);
	var HU11 = parseFloat(document.getElementById("HUMIDITY_1").innerHTML);
	var HU12 = parseFloat(document.getElementById("HUMIDITY_2").innerHTML);
	var HU21 = parseFloat(document.getElementById("HUMIDITY_6").innerHTML);
	var HU22 = parseFloat(document.getElementById("HUMIDITY_7").innerHTML);
	var HU23 = parseFloat(document.getElementById("HUMIDITY_8").innerHTML);
	var HU31 = parseFloat(document.getElementById("HUMIDITY_11").innerHTML);
	var HU32 = parseFloat(document.getElementById("HUMIDITY_12").innerHTML);
	var HU33 = parseFloat(document.getElementById("HUMIDITY_13").innerHTML);
	var HU34 = parseFloat(document.getElementById("HUMIDITY_14").innerHTML);
	var HU41 = parseFloat(document.getElementById("HUMIDITY_17").innerHTML);
	var HU42 = parseFloat(document.getElementById("HUMIDITY_18").innerHTML);
	var HU43 = parseFloat(document.getElementById("HUMIDITY_19").innerHTML);
	var HU44 = parseFloat(document.getElementById("HUMIDITY_20").innerHTML);
	var HU51 = parseFloat(document.getElementById("HUMIDITY_22").innerHTML);
	var HU52 = parseFloat(document.getElementById("HUMIDITY_23").innerHTML);
	
	 var humi_avg = (HU10 + HU11 + HU12 + HU21 + HU22 + HU23 + HU31 + HU32 + HU33 + HU34 + HU41 + HU42 + HU43 + HU44 + HU51 + HU52)/16;

        var tempHu = [nowHu += updateIntervalHu, humi_avg];


        dataHu.push(tempHu);
    }
}

var optionsHu = {
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
            var dateHu = new Date(v);

            if (dateHu.getSeconds() % 20 == 0) {
                var hoursHu = dateHu.getHours() < 10 ? "0" + dateHu.getHours() : dateHu.getHours();
                var minutesHu = dateHu.getMinutes() < 10 ? "0" + dateHu.getMinutes() : dateHu.getMinutes();
                var secondsHu = dateHu.getSeconds() < 10 ? "0" + dateHu.getSeconds() : dateHu.getSeconds();

                return hoursHu + ":" + minutesHu + ":" + secondsHu;
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
        min: 25,
	
	max: 60,        

        tickSize: 5,
        tickFormatter: function (v, axis) {
            if (v % 5 == 0) {
		//return v;

                return v + "%";
            } else {
                return "";
            }
        },
        axisLabel: "Humidity avg",
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
    GetDataHu();

    datasetHu = [
	
	        { label: "Humidity_avg", data: dataHu, color: "#00FF00" }
    ];

    $.plot($("#flot-placeholder3"), datasetHu, optionsHu);

    function updateHu() {
        GetDataHu();

        $.plot($("#flot-placeholder3"), datasetHu, optionsHu)
        setTimeout(updateHu, updateIntervalHu);
    }

    updateHu();
});


/////////////////////////////****************************/////////////////////////////


var dataTs = [];
var datasetTs;
var totalPointsTs = 100;
var updateIntervalTs = 1500;
var nowTs= new Date().getTime();

function GetDataTs() {
    
    dataTs.shift();
    
    while (dataTs.length < totalPointsTs) {
	
	var S11 = parseFloat(document.getElementById("TEMP_3").innerHTML);
	var S12 = parseFloat(document.getElementById("TEMP_4").innerHTML);
	var S21 = parseFloat(document.getElementById("TEMP_9").innerHTML);
	var S22 = parseFloat(document.getElementById("TEMP_10").innerHTML);
	var S31 = parseFloat(document.getElementById("TEMP_15").innerHTML);
	var S41 = parseFloat(document.getElementById("TEMP_21").innerHTML);
	var S51 = parseFloat(document.getElementById("TEMP_24").innerHTML);
	var S52 = parseFloat(document.getElementById("TEMP_25").innerHTML);
	
	var temp_sup_avg = (S11 + S12 + S21 + S22 + S31 + S41 + S51 + S52)/8;

        var tempTs = [nowTs += updateIntervalTs, temp_sup_avg];


        dataTs.push(tempTs);
    }
}

var optionsTs = {
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
            var dateTs = new Date(v);

            if (dateTs.getSeconds() % 20 == 0) {
                var hoursTs = dateTs.getHours() < 10 ? "0" + dateTs.getHours() : dateTs.getHours();
                var minutesTs = dateTs.getMinutes() < 10 ? "0" + dateTs.getMinutes() : dateTs.getMinutes();
                var secondsTs = dateTs.getSeconds() < 10 ? "0" + dateTs.getSeconds() : dateTs.getSeconds();

                return hoursTs + ":" + minutesTs + ":" + secondsTs;
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
        axisLabel: "Superficial_Temperature avg",
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
    GetDataTs();

    datasetTs = [
	
	        { label: "Sup_Temp_avg", data: dataTs, color: "#00FF00" }
    ];

    $.plot($("#flot-placeholder4"), datasetTs, optionsTs);

    function updateTs() {
        GetDataTs();

        $.plot($("#flot-placeholder4"), datasetTs, optionsTs)
        setTimeout(updateTs, updateIntervalTs);
    }

    updateTs();
});
