var dataTe = [];
var datasetTe;
var totalPointsTe = 100;
var updateIntervalTe = 1500;

var nowTe = new Date().getTime(); 

function GetDataTe() {
    
    dataTe.shift();
    
    while (dataTe.length < totalPointsTe) {
	
	var y_value = parseFloat(document.getElementById("BPBA1001Y_0").innerHTML);
	var tempTe = [nowTe += updateIntervalTe,y_value];
	
	dataTe.push(tempTe);
    }
}

var optionsTe = {
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
    GetDataTe();

    datasetTe = [
	
	        {label:"position_y [mm]", data: dataTe, color: "#00FF00" }
    ];

    $.plot($("#flot-placeholder1"), datasetTe, optionsTe);

    function updateTe() {
        GetDataTe();

        $.plot($("#flot-placeholder1"), datasetTe, optionsTe)
        setTimeout(updateTe, updateIntervalTe);
    }

    updateTe();
});


//////////////// X GRAPH BPBA1001X_0 ///////

var data1001X = [];
var dataset1001X;
var totalPoints1001X = 100;
var updateInterval1001X = 1500;

var now1001X = new Date().getTime(); 

function GetData1001X() {
    
    data1001X.shift();
    
    while (data1001X.length < totalPoints1001X) {
	
	var x_value = parseFloat(document.getElementById("BPBA1001X_0").innerHTML); 
	var temp1001X = [now1001X += updateInterval1001X,x_value];
	
	data1001X.push(temp1001X);
    }
}

var options1001X = {
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
            var date1001X = new Date(v);

            if (date1001X.getSeconds() % 20 == 0) {
                var hours1001X = date1001X.getHours() < 10 ? "0" + date1001X.getHours() : date1001X.getHours();
                var minutes1001X = date1001X.getMinutes() < 10 ? "0" + date1001X.getMinutes() : date1001X.getMinutes();
                var seconds1001X = date1001X.getSeconds() < 10 ? "0" + date1001X.getSeconds() : date1001X.getSeconds();

                return hours1001X + ":" + minutes1001X + ":" + seconds1001X;
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
    GetData1001X();

    dataset1001X = [
	
	        {label:"position_x [mm]", data: data1001X, color: "#00FF00" }
    ];

    $.plot($("#flot-placeholder2"), dataset1001X, options1001X);

    function update1001X() {
        GetData1001X();

        $.plot($("#flot-placeholder2"), dataset1001X, options1001X)
        setTimeout(update1001X, updateInterval1001X);
    }

    update1001X();
});



//////////////// y GRAPH BPBA1002y_0 ///////

var data1002Y = [];
var dataset1002Y;
var totalPoints1002Y = 100;
var updateInterval1002Y = 1500;

var now1002Y = new Date().getTime(); 

function GetData1002Y() {
    
    data1002Y.shift();
    
    while (data1002Y.length < totalPoints1002Y) {
	
	var y_value1002Y = parseFloat(document.getElementById("BPBA1002Y_0").innerHTML); 
	var temp1002Y = [now1002Y += updateInterval1002Y,y_value1002Y];
	
	data1002Y.push(temp1002Y);
    }
}

var options1002Y = {
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
            var date1002Y = new Date(v);

            if (date1002Y.getSeconds() % 20 == 0) {
                var hours1002Y = date1002Y.getHours() < 10 ? "0" + date1002Y.getHours() : date1002Y.getHours();
                var minutes1002Y = date1002Y.getMinutes() < 10 ? "0" + date1002Y.getMinutes() : date1002Y.getMinutes();
                var seconds1002Y = date1002Y.getSeconds() < 10 ? "0" + date1002Y.getSeconds() : date1002Y.getSeconds();

                return hours1002Y + ":" + minutes1002Y + ":" + seconds1002Y;
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
    GetData1002Y();

    dataset1002Y = [
	
	        {label:"position_y [mm]", data: data1002Y, color: "#00FF00" }
    ];

    $.plot($("#flot-placeholder3"), dataset1002Y, options1002Y);

    function update1002Y() {
        GetData1002Y();

        $.plot($("#flot-placeholder3"), dataset1002Y, options1002Y)
        setTimeout(update1002Y, updateInterval1002Y);
    }

    update1002Y();
});



//////////////// x GRAPH BPBA1002X_0 ///////

var data1002X = [];
var dataset1002X;
var totalPoints1002X = 100;
var updateInterval1002X = 1500;

var now1002X = new Date().getTime(); 

function GetData1002X() {
    
    data1002X.shift();
    
    while (data1002X.length < totalPoints1002X) {
	
	var x_value1002X = parseFloat(document.getElementById("BPBA1002X_0").innerHTML); 
	var temp1002X = [now1002X += updateInterval1002X,x_value1002X];
	
	data1002X.push(temp1002X);
    }
}

var options1002X = {
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
            var date1002X = new Date(v);

            if (date1002X.getSeconds() % 20 == 0) {
                var hours1002X = date1002X.getHours() < 10 ? "0" + date1002X.getHours() : date1002X.getHours();
                var minutes1002X = date1002X.getMinutes() < 10 ? "0" + date1002X.getMinutes() : date1002X.getMinutes();
                var seconds1002X = date1002X.getSeconds() < 10 ? "0" + date1002X.getSeconds() : date1002X.getSeconds();

                return hours1002X + ":" + minutes1002X + ":" + seconds1002X;
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
    GetData1002X();

    dataset1002X = [
	
	        {label:"position_x [mm]", data: data1002X, color: "#00FF00" }
    ];

    $.plot($("#flot-placeholder4"), dataset1002X, options1002X);

    function update1002X() {
        GetData1002X();

        $.plot($("#flot-placeholder4"), dataset1002X, options1002X)
        setTimeout(update1002X, updateInterval1002X);
    }

    update1002X();
});



//////////////// y GRAPH BPBA2001Y_0 ///////

var data2001Y = [];
var dataset2001Y;
var totalPoints2001Y = 100;
var updateInterval2001Y = 1500;

var now2001Y = new Date().getTime(); 

function GetData2001Y() {
    
    data2001Y.shift();
    
    while (data2001Y.length < totalPoints2001Y) {
	
	var y_value2001Y = parseFloat(document.getElementById("BPBA2001Y_0").innerHTML); 
	var temp2001Y = [now2001Y += updateInterval2001Y,y_value2001Y];
	
	data2001Y.push(temp2001Y);
    }
}

var options2001Y = {
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
            var date2001Y = new Date(v);

            if (date2001Y.getSeconds() % 20 == 0) {
                var hours2001Y = date2001Y.getHours() < 10 ? "0" + date2001Y.getHours() : date2001Y.getHours();
                var minutes2001Y = date2001Y.getMinutes() < 10 ? "0" + date2001Y.getMinutes() : date2001Y.getMinutes();
                var seconds2001Y = date2001Y.getSeconds() < 10 ? "0" + date2001Y.getSeconds() : date2001Y.getSeconds();

                return hours2001Y + ":" + minutes2001Y + ":" + seconds2001Y;
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
    GetData2001Y();

    dataset2001Y = [
	
	        {label:"position_y [mm]", data: data2001Y, color: "#00FF00" }
    ];

    $.plot($("#flot-placeholder5"), dataset2001Y, options2001Y);

    function update2001Y() {
        GetData2001Y();

        $.plot($("#flot-placeholder5"), dataset2001Y, options2001Y)
        setTimeout(update2001Y, updateInterval2001Y);
    }

    update2001Y();
});


//////////////// X GRAPH BPBA2001X_0 ///////

var data2001X = [];
var dataset2001X;
var totalPoints2001X = 100;
var updateInterval2001X = 1500;

var now2001X = new Date().getTime(); 

function GetData2001X() {
    
    data2001X.shift();
    
    while (data2001X.length < totalPoints2001X) {
	
	var x_value2001X = parseFloat(document.getElementById("BPBA2001X_0").innerHTML); 
	var temp2001X = [now2001X += updateInterval2001X,x_value2001X];
	
	data2001X.push(temp2001X);
    }
}

var options2001X = {
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
            var date2001X = new Date(v);

            if (date2001X.getSeconds() % 20 == 0) {
                var hours2001X = date2001X.getHours() < 10 ? "0" + date2001X.getHours() : date2001X.getHours();
                var minutes2001X = date2001X.getMinutes() < 10 ? "0" + date2001X.getMinutes() : date2001X.getMinutes();
                var seconds2001X = date2001X.getSeconds() < 10 ? "0" + date2001X.getSeconds() : date2001X.getSeconds();

                return hours2001X + ":" + minutes2001X + ":" + seconds2001X;
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
    GetData2001X();

    dataset2001X = [
	
	        {label:"position_x [mm]", data: data2001X, color: "#00FF00" }
    ];

    $.plot($("#flot-placeholder6"), dataset2001X, options2001X);

    function update2001X() {
        GetData2001X();

        $.plot($("#flot-placeholder6"), dataset2001X, options2001X)
        setTimeout(update2001X, updateInterval2001X);
    }

    update2001X();
});



//////////////// Y GRAPH BPBA2002Y_0 ///////

var data2002Y = [];
var dataset2002Y;
var totalPoints2002Y = 100;
var updateInterval2002Y = 1500;

var now2002Y = new Date().getTime(); 

function GetData2002Y() {
    
    data2002Y.shift();
    
    while (data2002Y.length < totalPoints2002Y) {
	
	var y_value2002Y = parseFloat(document.getElementById("BPBA2002Y_0").innerHTML); 
	var temp2002Y = [now2002Y += updateInterval2002Y,y_value2002Y];
	
	data2002Y.push(temp2002Y);
    }
}

var options2002Y = {
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
            var date2002Y = new Date(v);

            if (date2002Y.getSeconds() % 20 == 0) {
                var hours2002Y = date2002Y.getHours() < 10 ? "0" + date2002Y.getHours() : date2002Y.getHours();
                var minutes2002Y = date2002Y.getMinutes() < 10 ? "0" + date2002Y.getMinutes() : date2002Y.getMinutes();
                var seconds2002Y = date2002Y.getSeconds() < 10 ? "0" + date2002Y.getSeconds() : date2002Y.getSeconds();

                return hours2002Y + ":" + minutes2002Y + ":" + seconds2002Y;
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
    GetData2002Y();

    dataset2002Y = [
	
	        {label:"position_y [mm]", data: data2002Y, color: "#00FF00" }
    ];

    $.plot($("#flot-placeholder7"), dataset2002Y, options2002Y);

    function update2002Y() {
        GetData2002Y();

        $.plot($("#flot-placeholder7"), dataset2002Y, options2002Y)
        setTimeout(update2002Y, updateInterval2002Y);
    }

    update2002Y();
});


//////////////// X GRAPH BPBA2002X_0 ///////


var data2002X = [];
var dataset2002X;
var totalPoints2002X = 100;
var updateInterval2002X = 1500;

var now2002X = new Date().getTime(); 

function GetData2002X() {
    
    data2002X.shift();
    
    while (data2002X.length < totalPoints2002X) {
	
	var x_value2002X = parseFloat(document.getElementById("BPBA2002X_0").innerHTML); 
	var temp2002X = [now2002X += updateInterval2002X,x_value2002X];
	
	data2002X.push(temp2002X);
    }
}

var options2002X = {
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
            var date2002X = new Date(v);

            if (date2002X.getSeconds() % 20 == 0) {
                var hours2002X = date2002X.getHours() < 10 ? "0" + date2002X.getHours() : date2002X.getHours();
                var minutes2002X = date2002X.getMinutes() < 10 ? "0" + date2002X.getMinutes() : date2002X.getMinutes();
                var seconds2002X = date2002X.getSeconds() < 10 ? "0" + date2002X.getSeconds() : date2002X.getSeconds();

                return hours2002X + ":" + minutes2002X + ":" + seconds2002X;
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
    GetData2002X();

    dataset2002X = [
	
	        {label:"position_y [mm]", data: data2002X, color: "#00FF00" }
    ];

    $.plot($("#flot-placeholder8"), dataset2002X, options2002X);

    function update2002X() {
        GetData2002X();

        $.plot($("#flot-placeholder8"), dataset2002X, options2002X)
        setTimeout(update2002X, updateInterval2002X);
    }

    update2002X();
});



//////////////// Y GRAPH BPBA3001Y_0 ///////


var data3001Y = [];
var dataset3001Y;
var totalPoints3001Y = 100;
var updateInterval3001Y = 1500;

var now3001Y = new Date().getTime(); 

function GetData3001Y() {
    
    data3001Y.shift();
    
    while (data3001Y.length < totalPoints3001Y) {
	
	var y_value3001Y = parseFloat(document.getElementById("BPBA3001Y_0").innerHTML); 
	var temp3001Y = [now3001Y += updateInterval3001Y,y_value3001Y];
	
	data3001Y.push(temp3001Y);
    }
}

var options3001Y = {
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
            var date3001Y = new Date(v);

            if (date3001Y.getSeconds() % 20 == 0) {
                var hours3001Y = date3001Y.getHours() < 10 ? "0" + date3001Y.getHours() : date3001Y.getHours();
                var minutes3001Y = date3001Y.getMinutes() < 10 ? "0" + date3001Y.getMinutes() : date3001Y.getMinutes();
                var seconds3001Y = date3001Y.getSeconds() < 10 ? "0" + date3001Y.getSeconds() : date3001Y.getSeconds();

                return hours3001Y + ":" + minutes3001Y + ":" + seconds3001Y;
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
    GetData3001Y();

    dataset3001Y = [
	
	        {label:"position_y [mm]", data: data3001Y, color: "#00FF00" }
    ];

    $.plot($("#flot-placeholder9"), dataset3001Y, options3001Y);

    function update3001Y() {
        GetData3001Y();

        $.plot($("#flot-placeholder9"), dataset3001Y, options3001Y)
        setTimeout(update3001Y, updateInterval3001Y);
    }

    update3001Y();
});



//////////////// X GRAPH BPBA3001X_0 ///////


var data3001X = [];
var dataset3001X;
var totalPoints3001X = 100;
var updateInterval3001X = 1500;

var now3001X = new Date().getTime(); 

function GetData3001X() {
    
    data3001X.shift();
    
    while (data3001X.length < totalPoints3001X) {
	
	var x_value3001X = parseFloat(document.getElementById("BPBA3001X_0").innerHTML); 
	var temp3001X = [now3001X += updateInterval3001X,x_value3001X];
	
	data3001X.push(temp3001X);
    }
}

var options3001X = {
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
            var date3001X = new Date(v);

            if (date3001X.getSeconds() % 20 == 0) {
                var hours3001X = date3001X.getHours() < 10 ? "0" + date3001X.getHours() : date3001X.getHours();
                var minutes3001X = date3001X.getMinutes() < 10 ? "0" + date3001X.getMinutes() : date3001X.getMinutes();
                var seconds3001X = date3001X.getSeconds() < 10 ? "0" + date3001X.getSeconds() : date3001X.getSeconds();

                return hours3001X + ":" + minutes3001X + ":" + seconds3001X;
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
    GetData3001X();

    dataset3001X = [
	
	        {label:"position_x [mm]", data: data3001X, color: "#00FF00" }
    ];

    $.plot($("#flot-placeholder10"), dataset3001X, options3001X);

    function update3001X() {
        GetData3001X();

        $.plot($("#flot-placeholder10"), dataset3001X, options3001X)
        setTimeout(update3001X, updateInterval3001X);
    }

    update3001X();
});

//////////////// Y GRAPH BPBA3002Y_0 ///////


var data3002Y = [];
var dataset3002Y;
var totalPoints3002Y = 100;
var updateInterval3002Y = 1500;

var now3002Y = new Date().getTime(); 

function GetData3002Y() {
    
    data3002Y.shift();
    
    while (data3002Y.length < totalPoints3002Y) {
	
	var y_value3002Y = parseFloat(document.getElementById("BPBA3002Y_0").innerHTML); 
	var temp3002Y = [now3002Y += updateInterval3002Y,y_value3002Y];
	
	data3002Y.push(temp3002Y);
    }
}

var options3002Y = {
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
            var date3002Y = new Date(v);

            if (date3002Y.getSeconds() % 20 == 0) {
                var hours3002Y = date3002Y.getHours() < 10 ? "0" + date3002Y.getHours() : date3002Y.getHours();
                var minutes3002Y = date3002Y.getMinutes() < 10 ? "0" + date3002Y.getMinutes() : date3002Y.getMinutes();
                var seconds3002Y = date3002Y.getSeconds() < 10 ? "0" + date3002Y.getSeconds() : date3002Y.getSeconds();

                return hours3002Y + ":" + minutes3002Y + ":" + seconds3002Y;
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
    GetData3002Y();

    dataset3002Y = [
	
	        {label:"position_y [mm]", data: data3002Y, color: "#00FF00" }
    ];

    $.plot($("#flot-placeholder11"), dataset3002Y, options3002Y);

    function update3002Y() {
        GetData3002Y();

        $.plot($("#flot-placeholder11"), dataset3002Y, options3002Y)
        setTimeout(update3002Y, updateInterval3002Y);
    }

    update3002Y();
});


/////////////// X GRAPH BPBA3002X_0 ///////

var data3002X = [];
var dataset3002X;
var totalPoints3002X = 100;
var updateInterval3002X = 1500;
var now3002X = new Date().getTime(); 

function GetData3002X() {
    
    data3002X.shift();
    while (data3002X.length < totalPoints3002X) {
	var x_value3002X = parseFloat(document.getElementById("BPBA3002X_0").innerHTML); 
	var temp3002X = [now3002X += updateInterval3002X,x_value3002X];
	data3002X.push(temp3002X);
    }
}

var options3002X = {
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
            var date3002X = new Date(v);
	    if (date3002X.getSeconds() % 20 == 0) {
                var hours3002X = date3002X.getHours() < 10 ? "0" + date3002X.getHours() : date3002X.getHours();
                var minutes3002X = date3002X.getMinutes() < 10 ? "0" + date3002X.getMinutes() : date3002X.getMinutes();
                var seconds3002X = date3002X.getSeconds() < 10 ? "0" + date3002X.getSeconds() : date3002X.getSeconds();
	    return hours3002X + ":" + minutes3002X + ":" + seconds3002X;
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
    GetData3002X();
	dataset3002X = [{label:"position_x [mm]", data: data3002X, color: "#00FF00" }];

    $.plot($("#flot-placeholder12"), dataset3002X, options3002X);

    function update3002X() {
        GetData3002X();
	$.plot($("#flot-placeholder12"), dataset3002X, options3002X)
        setTimeout(update3002X, updateInterval3002X);
    }
    update3002X();
});


/////////////// Y GRAPH BPBA4001Y_0 ///////

var data4001Y = [];
var dataset4001Y;
var totalPoints4001Y = 100;
var updateInterval4001Y = 1500;
var now4001Y = new Date().getTime(); 

function GetData4001Y() {
    
    data4001Y.shift();
    while (data4001Y.length < totalPoints4001Y) {
	var y_value4001Y = parseFloat(document.getElementById("BPBA4001Y_0").innerHTML); 
	var temp4001Y = [now4001Y += updateInterval4001Y,y_value4001Y];
	data4001Y.push(temp4001Y);
    }
}

var options4001Y = {
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
            var date4001Y = new Date(v);
	    if (date4001Y.getSeconds() % 20 == 0) {
                var hours4001Y = date4001Y.getHours() < 10 ? "0" + date4001Y.getHours() : date4001Y.getHours();
                var minutes4001Y = date4001Y.getMinutes() < 10 ? "0" + date4001Y.getMinutes() : date4001Y.getMinutes();
                var seconds4001Y = date4001Y.getSeconds() < 10 ? "0" + date4001Y.getSeconds() : date4001Y.getSeconds();
	    return hours4001Y + ":" + minutes4001Y + ":" + seconds4001Y;
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
    GetData4001Y();
	dataset4001Y = [{label:"position_y [mm]", data: data4001Y, color: "#00FF00" }];

    $.plot($("#flot-placeholder13"), dataset4001Y, options4001Y);

    function update4001Y() {
        GetData4001Y();
	$.plot($("#flot-placeholder13"), dataset4001Y, options4001Y)
        setTimeout(update4001Y, updateInterval4001Y);
    }
    update4001Y();
});

/////////////// X GRAPH BPBA4001X_0 ///////

var data4001X = [];
var dataset4001X;
var totalPoints4001X = 100;
var updateInterval4001X = 1500;
var now4001X = new Date().getTime(); 

function GetData4001X() {
    
    data4001X.shift();
    while (data4001X.length < totalPoints4001X) {
	var x_value4001X = parseFloat(document.getElementById("BPBA4001X_0").innerHTML); 
	var temp4001X = [now4001X += updateInterval4001X,x_value4001X];
	data4001X.push(temp4001X);
    }
}

var options4001X = {
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
            var date4001X = new Date(v);
	    if (date4001X.getSeconds() % 20 == 0) {
                var hours4001X = date4001X.getHours() < 10 ? "0" + date4001X.getHours() : date4001X.getHours();
                var minutes4001X = date4001X.getMinutes() < 10 ? "0" + date4001X.getMinutes() : date4001X.getMinutes();
                var seconds4001X = date4001X.getSeconds() < 10 ? "0" + date4001X.getSeconds() : date4001X.getSeconds();
	    return hours4001X + ":" + minutes4001X + ":" + seconds4001X;
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
    GetData4001X();
	dataset4001X = [{label:"position_x [mm]", data: data4001X, color: "#00FF00" }];

    $.plot($("#flot-placeholder14"), dataset4001X, options4001X);

    function update4001X() {
        GetData4001X();
	$.plot($("#flot-placeholder14"), dataset4001X, options4001X)
        setTimeout(update4001X, updateInterval4001X);
    }
    update4001X();
});

/////////////// Y GRAPH BPBA4002Y_0 ///////

var data4002Y = [];
var dataset4002Y;
var totalPoints4002Y = 100;
var updateInterval4002Y = 1500;
var now4002Y = new Date().getTime(); 

function GetData4002Y() {
    
    data4002Y.shift();
    while (data4002Y.length < totalPoints4002Y) {
	var y_value4002Y = parseFloat(document.getElementById("BPBA4002Y_0").innerHTML); 
	var temp4002Y = [now4002Y += updateInterval4002Y,y_value4002Y];
	data4002Y.push(temp4002Y);
    }
}

var options4002Y = {
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
            var date4002Y = new Date(v);
	    if (date4002Y.getSeconds() % 20 == 0) {
                var hours4002Y = date4002Y.getHours() < 10 ? "0" + date4002Y.getHours() : date4002Y.getHours();
                var minutes4002Y = date4002Y.getMinutes() < 10 ? "0" + date4002Y.getMinutes() : date4002Y.getMinutes();
                var seconds4002Y = date4002Y.getSeconds() < 10 ? "0" + date4002Y.getSeconds() : date4002Y.getSeconds();
	    return hours4002Y + ":" + minutes4002Y + ":" + seconds4002Y;
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
    GetData4002Y();
	dataset4002Y = [{label:"position_y [mm]", data: data4002Y, color: "#00FF00" }];

    $.plot($("#flot-placeholder15"), dataset4002Y, options4002Y);

    function update4002Y() {
        GetData4002Y();
	$.plot($("#flot-placeholder15"), dataset4002Y, options4002Y)
        setTimeout(update4002Y, updateInterval4002Y);
    }
    update4002Y();
});

/////////////// X GRAPH BPBA4002X_0 ///////

var data4002X = [];
var dataset4002X;
var totalPoints4002X = 100;
var updateInterval4002X = 1500;
var now4002X = new Date().getTime(); 

function GetData4002X() {
    
    data4002X.shift();
    while (data4002X.length < totalPoints4002X) {
	var x_value4002X = parseFloat(document.getElementById("BPBA4002X_0").innerHTML); 
	var temp4002X = [now4002X += updateInterval4002X,x_value4002X];
	data4002X.push(temp4002X);
    }
}

var options4002X = {
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
            var date4002X = new Date(v);
	    if (date4002X.getSeconds() % 20 == 0) {
                var hours4002X = date4002X.getHours() < 10 ? "0" + date4002X.getHours() : date4002X.getHours();
                var minutes4002X = date4002X.getMinutes() < 10 ? "0" + date4002X.getMinutes() : date4002X.getMinutes();
                var seconds4002X = date4002X.getSeconds() < 10 ? "0" + date4002X.getSeconds() : date4002X.getSeconds();
	    return hours4002X + ":" + minutes4002X + ":" + seconds4002X;
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
    GetData4002X();
	dataset4002X = [{label:"position_x [mm]", data: data4002X, color: "#00FF00" }];

    $.plot($("#flot-placeholder16"), dataset4002X, options4002X);

    function update4002X() {
        GetData4002X();
	$.plot($("#flot-placeholder16"), dataset4002X, options4002X)
        setTimeout(update4002X, updateInterval4002X);
    }
    update4002X();
});


/////////////// Y GRAPH BPSA1001Y_0 ///////

var dataSA1001Y = [];
var datasetSA1001Y;
var totalPointsSA1001Y = 100;
var updateIntervalSA1001Y = 1500;
var nowSA1001Y = new Date().getTime(); 

function GetDataSA1001Y() {
    
    dataSA1001Y.shift();
    while (dataSA1001Y.length < totalPointsSA1001Y) {
	var y_valueSA1001Y = parseFloat(document.getElementById("BPSA1001Y_0").innerHTML); 
	var tempSA1001Y = [nowSA1001Y += updateIntervalSA1001Y,y_valueSA1001Y];
	dataSA1001Y.push(tempSA1001Y);
    }
}

var optionsSA1001Y = {
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
            var dateSA1001Y = new Date(v);
	    if (dateSA1001Y.getSeconds() % 20 == 0) {
                var hoursSA1001Y = dateSA1001Y.getHours() < 10 ? "0" + dateSA1001Y.getHours() : dateSA1001Y.getHours();
                var minutesSA1001Y = dateSA1001Y.getMinutes() < 10 ? "0" + dateSA1001Y.getMinutes() : dateSA1001Y.getMinutes();
                var secondsSA1001Y = dateSA1001Y.getSeconds() < 10 ? "0" + dateSA1001Y.getSeconds() : dateSA1001Y.getSeconds();
	    return hoursSA1001Y + ":" + minutesSA1001Y + ":" + secondsSA1001Y;
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
    GetDataSA1001Y();
	datasetSA1001Y = [{label:"position_y [mm]", data: dataSA1001Y, color: "#00FF00" }];

    $.plot($("#flot-placeholder17"), datasetSA1001Y, optionsSA1001Y);

    function updateSA1001Y() {
        GetDataSA1001Y();
	$.plot($("#flot-placeholder17"), datasetSA1001Y, optionsSA1001Y)
        setTimeout(updateSA1001Y, updateIntervalSA1001Y);
    }
    updateSA1001Y();
});

/////////////// X GRAPH BPSA1001X_0 ///////

var dataSA1001X = [];
var datasetSA1001X;
var totalPointsSA1001X = 100;
var updateIntervalSA1001X = 1500;
var nowSA1001X = new Date().getTime(); 

function GetDataSA1001X() {
    
    dataSA1001X.shift();
    while (dataSA1001X.length < totalPointsSA1001X) {
	var x_valueSA1001X = parseFloat(document.getElementById("BPSA1001X_0").innerHTML); 
	var tempSA1001X = [nowSA1001X += updateIntervalSA1001X,x_valueSA1001X];
	dataSA1001X.push(tempSA1001X);
    }
}

var optionsSA1001X = {
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
            var dateSA1001X = new Date(v);
	    if (dateSA1001X.getSeconds() % 20 == 0) {
                var hoursSA1001X = dateSA1001X.getHours() < 10 ? "0" + dateSA1001X.getHours() : dateSA1001X.getHours();
                var minutesSA1001X = dateSA1001X.getMinutes() < 10 ? "0" + dateSA1001X.getMinutes() : dateSA1001X.getMinutes();
                var secondsSA1001X = dateSA1001X.getSeconds() < 10 ? "0" + dateSA1001X.getSeconds() : dateSA1001X.getSeconds();
	    return hoursSA1001X + ":" + minutesSA1001X + ":" + secondsSA1001X;
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
    GetDataSA1001X();
	datasetSA1001X = [{label:"position_x [mm]", data: dataSA1001X, color: "#00FF00" }];

    $.plot($("#flot-placeholder18"), datasetSA1001X, optionsSA1001X);

    function updateSA1001X() {
        GetDataSA1001X();
	$.plot($("#flot-placeholder18"), datasetSA1001X, optionsSA1001X)
        setTimeout(updateSA1001X, updateIntervalSA1001X);
    }
    updateSA1001X();
});

/////////////// Y GRAPH BPSA2001Y_0 ///////

var dataSA2001Y = [];
var datasetSA2001Y;
var totalPointsSA2001Y = 100;
var updateIntervalSA2001Y = 1500;
var nowSA2001Y = new Date().getTime(); 

function GetDataSA2001Y() {
    
    dataSA2001Y.shift();
    while (dataSA2001Y.length < totalPointsSA2001Y) {
	var y_valueSA2001Y = parseFloat(document.getElementById("BPSA2001Y_0").innerHTML); 
	var tempSA2001Y = [nowSA2001Y += updateIntervalSA2001Y,y_valueSA2001Y];
	dataSA2001Y.push(tempSA2001Y);
    }
}

var optionsSA2001Y = {
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
            var dateSA2001Y = new Date(v);
	    if (dateSA2001Y.getSeconds() % 20 == 0) {
                var hoursSA2001Y = dateSA2001Y.getHours() < 10 ? "0" + dateSA2001Y.getHours() : dateSA2001Y.getHours();
                var minutesSA2001Y = dateSA2001Y.getMinutes() < 10 ? "0" + dateSA2001Y.getMinutes() : dateSA2001Y.getMinutes();
                var secondsSA2001Y = dateSA2001Y.getSeconds() < 10 ? "0" + dateSA2001Y.getSeconds() : dateSA2001Y.getSeconds();
	    return hoursSA2001Y + ":" + minutesSA2001Y + ":" + secondsSA2001Y;
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
    GetDataSA2001Y();
	datasetSA2001Y = [{label:"position_y [mm]", data: dataSA2001Y, color: "#00FF00" }];

    $.plot($("#flot-placeholder19"), datasetSA2001Y, optionsSA2001Y);

    function updateSA2001Y() {
        GetDataSA2001Y();
	$.plot($("#flot-placeholder19"), datasetSA2001Y, optionsSA2001Y)
        setTimeout(updateSA2001Y, updateIntervalSA2001Y);
    }
    updateSA2001Y();
});

/////////////// X GRAPH BPSA2001X_0 ///////

var dataSA2001X = [];
var datasetSA2001X;
var totalPointsSA2001X = 100;
var updateIntervalSA2001X = 1500;
var nowSA2001X = new Date().getTime(); 

function GetDataSA2001X() {
    
    dataSA2001X.shift();
    while (dataSA2001X.length < totalPointsSA2001X) {
	var x_valueSA2001X = parseFloat(document.getElementById("BPSA2001X_0").innerHTML); 
	var tempSA2001X = [nowSA2001X += updateIntervalSA2001X,x_valueSA2001X];
	dataSA2001X.push(tempSA2001X);
    }
}

var optionsSA2001X = {
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
            var dateSA2001X = new Date(v);
	    if (dateSA2001X.getSeconds() % 20 == 0) {
                var hoursSA2001X = dateSA2001X.getHours() < 10 ? "0" + dateSA2001X.getHours() : dateSA2001X.getHours();
                var minutesSA2001X = dateSA2001X.getMinutes() < 10 ? "0" + dateSA2001X.getMinutes() : dateSA2001X.getMinutes();
                var secondsSA2001X = dateSA2001X.getSeconds() < 10 ? "0" + dateSA2001X.getSeconds() : dateSA2001X.getSeconds();
	    return hoursSA2001X + ":" + minutesSA2001X + ":" + secondsSA2001X;
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
    GetDataSA2001X();
	datasetSA2001X = [{label:"position_x [mm]", data: dataSA2001X, color: "#00FF00" }];

    $.plot($("#flot-placeholder20"), datasetSA2001X, optionsSA2001X);

    function updateSA2001X() {
        GetDataSA2001X();
	$.plot($("#flot-placeholder20"), datasetSA2001X, optionsSA2001X)
        setTimeout(updateSA2001X, updateIntervalSA2001X);
    }
    updateSA2001X();
});

/////////////// Y GRAPH BPSA3001Y_0 ///////

var dataSA3001Y = [];
var datasetSA3001Y;
var totalPointsSA3001Y = 100;
var updateIntervalSA3001Y = 1500;
var nowSA3001Y = new Date().getTime(); 

function GetDataSA3001Y() {
    
    dataSA3001Y.shift();
    while (dataSA3001Y.length < totalPointsSA3001Y) {
	var y_valueSA3001Y = parseFloat(document.getElementById("BPSA3001Y_0").innerHTML); 
	var tempSA3001Y = [nowSA3001Y += updateIntervalSA3001Y,y_valueSA3001Y];
	dataSA3001Y.push(tempSA3001Y);
    }
}

var optionsSA3001Y = {
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
            var dateSA3001Y = new Date(v);
	    if (dateSA3001Y.getSeconds() % 20 == 0) {
                var hoursSA3001Y = dateSA3001Y.getHours() < 10 ? "0" + dateSA3001Y.getHours() : dateSA3001Y.getHours();
                var minutesSA3001Y = dateSA3001Y.getMinutes() < 10 ? "0" + dateSA3001Y.getMinutes() : dateSA3001Y.getMinutes();
                var secondsSA3001Y = dateSA3001Y.getSeconds() < 10 ? "0" + dateSA3001Y.getSeconds() : dateSA3001Y.getSeconds();
	    return hoursSA3001Y + ":" + minutesSA3001Y + ":" + secondsSA3001Y;
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
    GetDataSA3001Y();
	datasetSA3001Y = [{label:"position_y [mm]", data: dataSA3001Y, color: "#00FF00" }];

    $.plot($("#flot-placeholder21"), datasetSA3001Y, optionsSA3001Y);

    function updateSA3001Y() {
        GetDataSA3001Y();
	$.plot($("#flot-placeholder21"), datasetSA3001Y, optionsSA3001Y)
        setTimeout(updateSA3001Y, updateIntervalSA3001Y);
    }
    updateSA3001Y();
});


/////////////// X GRAPH BPSA3001X_0 ///////

var dataSA3001X = [];
var datasetSA3001X;
var totalPointsSA3001X = 100;
var updateIntervalSA3001X = 1500;
var nowSA3001X = new Date().getTime(); 

function GetDataSA3001X() {
    
    dataSA3001X.shift();
    while (dataSA3001X.length < totalPointsSA3001X) {
	var x_valueSA3001X = parseFloat(document.getElementById("BPSA3001X_0").innerHTML); 
	var tempSA3001X = [nowSA3001X += updateIntervalSA3001X,x_valueSA3001X];
	dataSA3001X.push(tempSA3001X);
    }
}

var optionsSA3001X = {
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
            var dateSA3001X = new Date(v);
	    if (dateSA3001X.getSeconds() % 20 == 0) {
                var hoursSA3001X = dateSA3001X.getHours() < 10 ? "0" + dateSA3001X.getHours() : dateSA3001X.getHours();
                var minutesSA3001X = dateSA3001X.getMinutes() < 10 ? "0" + dateSA3001X.getMinutes() : dateSA3001X.getMinutes();
                var secondsSA3001X = dateSA3001X.getSeconds() < 10 ? "0" + dateSA3001X.getSeconds() : dateSA3001X.getSeconds();
	    return hoursSA3001X + ":" + minutesSA3001X + ":" + secondsSA3001X;
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
    GetDataSA3001X();
	datasetSA3001X = [{label:"position_x [mm]", data: dataSA3001X, color: "#00FF00" }];

    $.plot($("#flot-placeholder22"), datasetSA3001X, optionsSA3001X);

    function updateSA3001X() {
        GetDataSA3001X();
	$.plot($("#flot-placeholder22"), datasetSA3001X, optionsSA3001X)
        setTimeout(updateSA3001X, updateIntervalSA3001X);
    }
    updateSA3001X();
});

/////////////// Y GRAPH BPSA4001Y_0 ///////

var dataSA4001Y = [];
var datasetSA4001Y;
var totalPointsSA4001Y = 100;
var updateIntervalSA4001Y = 1500;
var nowSA4001Y = new Date().getTime(); 

function GetDataSA4001Y() {
    
    dataSA4001Y.shift();
    while (dataSA4001Y.length < totalPointsSA4001Y) {
	var y_valueSA4001Y = parseFloat(document.getElementById("BPSA4001Y_0").innerHTML); 
	var tempSA4001Y = [nowSA4001Y += updateIntervalSA4001Y,y_valueSA4001Y];
	dataSA4001Y.push(tempSA4001Y);
    }
}

var optionsSA4001Y = {
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
            var dateSA4001Y = new Date(v);
	    if (dateSA4001Y.getSeconds() % 20 == 0) {
                var hoursSA4001Y = dateSA4001Y.getHours() < 10 ? "0" + dateSA4001Y.getHours() : dateSA4001Y.getHours();
                var minutesSA4001Y = dateSA4001Y.getMinutes() < 10 ? "0" + dateSA4001Y.getMinutes() : dateSA4001Y.getMinutes();
                var secondsSA4001Y = dateSA4001Y.getSeconds() < 10 ? "0" + dateSA4001Y.getSeconds() : dateSA4001Y.getSeconds();
	    return hoursSA4001Y + ":" + minutesSA4001Y + ":" + secondsSA4001Y;
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
    GetDataSA4001Y();
	datasetSA4001Y = [{label:"position_y [mm]", data: dataSA4001Y, color: "#00FF00" }];

    $.plot($("#flot-placeholder23"), datasetSA4001Y, optionsSA4001Y);

    function updateSA4001Y() {
        GetDataSA4001Y();
	$.plot($("#flot-placeholder23"), datasetSA4001Y, optionsSA4001Y)
        setTimeout(updateSA4001Y, updateIntervalSA4001Y);
    }
    updateSA4001Y();
});

/////////////// X GRAPH BPSA4001X_0 ///////

var dataSA4001X = [];
var datasetSA4001X;
var totalPointsSA4001X = 100;
var updateIntervalSA4001X = 1500;
var nowSA4001X = new Date().getTime(); 

function GetDataSA4001X() {
    
    dataSA4001X.shift();
    while (dataSA4001X.length < totalPointsSA4001X) {
	var y_valueSA4001X = parseFloat(document.getElementById("BPSA4001X_0").innerHTML); 
	var tempSA4001X = [nowSA4001X += updateIntervalSA4001X,y_valueSA4001X];
	dataSA4001X.push(tempSA4001X);
    }
}

var optionsSA4001X = {
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
            var dateSA4001X = new Date(v);
	    if (dateSA4001X.getSeconds() % 20 == 0) {
                var hoursSA4001X = dateSA4001X.getHours() < 10 ? "0" + dateSA4001X.getHours() : dateSA4001X.getHours();
                var minutesSA4001X = dateSA4001X.getMinutes() < 10 ? "0" + dateSA4001X.getMinutes() : dateSA4001X.getMinutes();
                var secondsSA4001X = dateSA4001X.getSeconds() < 10 ? "0" + dateSA4001X.getSeconds() : dateSA4001X.getSeconds();
	    return hoursSA4001X + ":" + minutesSA4001X + ":" + secondsSA4001X;
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
    GetDataSA4001X();
	datasetSA4001X = [{label:"position_x [mm]", data: dataSA4001X, color: "#00FF00" }];

    $.plot($("#flot-placeholder24"), datasetSA4001X, optionsSA4001X);

    function updateSA4001X() {
        GetDataSA4001X();
	$.plot($("#flot-placeholder24"), datasetSA4001X, optionsSA4001X)
        setTimeout(updateSA4001X, updateIntervalSA4001X);
    }
    updateSA4001X();
});


