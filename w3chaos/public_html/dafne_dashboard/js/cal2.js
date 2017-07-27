$(function() {
    $('.dataRange').daterangepicker({
	
        timePicker: true,
        timePickerIncrement: 15,
        locale: {
            format: 'MM/DD/YYYY h:mm A'
        },
	singleDatePicker: true,
	startDate : moment().format('MM/DD/YYYY'),
        endDate : moment().format('MM/DD/YYYY')

    });
});


var StartDate = 0;
var EndDate = 0;
var startDate_tmp = 0;
var endDate_tmp = 0;
var uid = 0;
$('#getData').click(function(){
    
    var AMPstart = 0;
    var AMPend = 0;
 
    StartDate = $("#startDate").val();
    EndDate = $("#endDate").val();
    
    //console.log("timestamp aaa" + StartDate);
    
    
    StartDate = StartDate.match(/(\d+)\/(\d+)\/(\d+) (\d+):(\d+) ([AMP]+)/);
    EndDate = EndDate.match(/(\d+)\/(\d+)\/(\d+) (\d+):(\d+) ([AMP]+)/);
    
    if (StartDate[6] == "PM") {
	var tmp_start = parseInt(StartDate[4]);
	AMPstart = tmp_start + 12;
    } else {
	AMPstart = StartDate[4];
    } 
    
    
    if (EndDate[6] == "PM") {
	var tmp_end = parseInt(EndDate[4]);
	AMPend = tmp_end + 12;
    } else {
	AMPend = EndDate[4];
    }

    StartDate =  Date.UTC(StartDate[3],parseInt(StartDate[1])-1,StartDate[2],AMPstart,StartDate[5]);
    EndDate = Date.UTC(EndDate[3],parseInt(EndDate[1])-1,EndDate[2],AMPend,EndDate[5]);
    
    
    $.get("http://" + location.host + ':8081/CU?dev=LUMINOMETER/CAEN775&cmd=queryhst&parm={"start":' + StartDate + ',"end":' + EndDate + ',"page":1}', function(datavalue, textStatus) {

        var old_str = datavalue.replace(/\$numberLong/g, 'numberLong');
	
	console.log("old_str " + old_str);
	
	var hist = $.parseJSON(old_str);
	
	console.log("uno  " + hist[0] +  "due " + hist[0].uid);
	
	uid = hist[0].uid;
	
	//console.log("uidd " + uid);
    });
    
    
   // action(uid);
    
    
    /*do {
	
	$.get("http://" + location.host + ':8081/CU?dev=LUMINOMETER/CAEN775&cmd=queryhstnext&parm={"uid":' + uid + "}" , function(data, textStatus) {
	
	uid ++ ;
	console.log("uidddd " + uid);
	
	console.log("aaaa ");
	
	});
	
    } while (uid != "0") */
    
/*var text = "";
var i = 0;
do {
    text += "The number is " + i;
    i++;
}
while (i < 5); */
	
	/*var hist_data = hist[0].data;
	
	for(var i=0; i< hist_data.length; i ++) {
	    
	    delete hist_data[i].busy;
	    delete hist_data[i].device_alarm;
	    delete hist_data[i].cu_alarm;
	    delete hist_data[i].ndk_uid;
	    delete hist_data[i].dpck_seq_id;
	    delete hist_data[i].dpck_ds_type;
	    delete hist_data[i].ndk_uid;
	} */
	
	
    /*if(hist_data == '')
            return;
        JSONToCSVConvertor(hist_data,"Luminometer", true);  */


   // });
  
});




$('#proof').click(function(){


    $.get("http://" + location.host + ':8081/CU?dev=LUMINOMETER/CAEN775&cmd=queryhstnext&parm={"uid":' + uid + "}" , function(data, textStatus) {

        var str = data.replace(/\$numberLong/g, 'numberLong');
	
	console.log("str " + str);
	
	var bla = $.parseJSON(str);
	
	console.log("unodue  " + bla[0] +  "dueuno " + bla[0].uid);
	
	//uid = bla[0].uid;
	
	//console.log("uidd " + uid);
    });
    
});



function action(uid) {
    var initval = 1;
    var new_uid = "";
    do {
       
	    
	$.get("http://" + location.host + ':8081/CU?dev=LUMINOMETER/CAEN775&cmd=queryhstnext&parm={"uid":' + uid + "}" , function(data, textStatus) {

	    var str = data.replace(/\$numberLong/g, 'numberLong');
	
	    console.log("old_str " + str);
	
	    var hist = $.parseJSON(str);
	
	
	     new_uid = hist[0].uid;
	     
	     console.log("new" + new_uid);
	    
	});
	
	

      /*  ( function( captured_initval ){
            $.ajax({
                type: "POST",
                url: "http://localhost/js.php",
                data: action_string,
                success: function(result){
                    $AppendResult.append(captured_initval + ',<br/>');
                }  
            });
        }( initval ) ); */

        initval++;
    } while (new_uid != "0");
}





/*function action() {
    var initval = 1;
    var endval = 5;
    do {
        var action_string = 'txtuser=someone',
            $AppendResult = $('#append_result');

        ( function( captured_initval ){
            $.ajax({
                type: "POST",
                url: "http://localhost/js.php",
                data: action_string,
                success: function(result){
                    $AppendResult.append(captured_initval + ',<br/>');
                }  
            });
        }( initval ) );

        initval++;
    } while (initval <= endval);
} */


function JSONToCSVConvertor(JSONData, ReportTitle, ShowLabel) {
    //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
    var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
    
    var CSV = '';    
    //Set Report title in first row or line
    
    CSV += ReportTitle + '\r\n\n';

    //This condition will generate the Label/Header
    if (ShowLabel) {
        var row = "";
        
        //This loop will extract the label from 1st index of on array
        for (var index in arrData[0]) {
	    
	    if (index == "dpck_ats") {
		
		row += "TIMESTAMP" + ',';

	    } else if (index != "dpck_ats") {
            //Now convert each value to string and comma-seprated
            row += index + ',';
	    }
        }

        row = row.slice(0, -1);
        
        //append Label row with line break
        CSV += row + '\r\n';
    }
    
    //1st loop is to extract each row
    for (var i = 0; i < arrData.length; i++) {
        var row = "";
        
        //2nd loop will extract each column and convert it in string comma-seprated
        for (var index in arrData[i]) {
	    
	    if (index == "EVENTS" || index == "ACQUISITION") {
		 		
		row += '' + arrData[i][index].numberLong + ',';

	    } else if (index == "dpck_ats") {
				
		var dateTmp = (arrData[i][index].numberLong)/1000;
		var DateUtc = new Date(1000*dateTmp);

		row += '' + DateUtc + ',';

		//console.log(DateUtc.toUTCString());

	    }  else {
	    	    
		row += '[' + arrData[i][index] + ']';
	    }

        }
	
        row.slice(0, row.length - 1);
        
        //add a line break after each row
        CSV += row + '\r\n';
    }
    

    if (CSV == '') {        
        alert("Invalid data");
        return;
    }   
    
    //Generate a file name
    var fileName = "Data_";
    //this will remove the blank-spaces from the title and replace it with an underscore
    fileName += ReportTitle.replace(/ /g,"_");   
    
    //Initialize file format you want csv or xls
    var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
    
    // Now the little tricky part.
    // you can use either>> window.open(uri);
    // but this will not work in some browsers
    // or you will not get the correct file extension    
    
    //this trick will generate a temp <a /> tag
    var link = document.createElement("a");    
    link.href = uri;
    
    //set the visibility hidden so it will not effect on your web-layout
    link.style = "visibility:hidden";
    link.download = fileName + ".csv";
    
    //this part will append the anchor tag and remove it after automatic click
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
 