
/**
 * global variables
 */
var dafne;
var obj_json;
var LoadDataXE = [];
var LoadDataYE = [];
var LoadDataXP = [];
var LoadDataYP = [];
var plotSAdone=0;
var plotDAdone=0;

/******/

$(document).ready(function() {
    
    setInterval(function() {
        $.get("http://" + location.host + ":8081/CU?dev=ACCUMULATOR/BPM/BPMSYNC&cmd=status", function(datavalue, textStatus) {
            var data_json = datavalue.replace(/\$numberLong/g, 'numberLong');
            data_json = data_json.replace(/\//g, '');

            obj_json = JSON.parse(data_json);                   
            //console.log("accumulator: " + data_json);
            
            var timestamp = obj_json.dpck_ats.numberLong;
            var status = obj_json.dev_status;
            var acquisition = obj_json.ACQUISITION.numberLong;
            var samples = obj_json.SAMPLES;
            var mode = obj_json.MODE;
	    dafne = obj_json.STATUSdafne_status;
                        	    
            $("#timestamp").html(timestamp);
            $("#dev_status").html(status);
            
            $("#ACQUISITION").html(acquisition);
            $("#SAMPLES").html(samples);
    
            switch (mode) {
                case 1:
                    $("#MODE").html("DataOnDemand");
                    break;
                case 257:
                    $("#MODE").html("DD+Trigg");
                    break;
                case 2:
                    $("#MODE").html("SlowAcquisition");
                    break;
                case 101:
                    $("#MODE").html("Trigger");
                    break;
                case  -1:
                    $("#MODE").html("Permanent");
                    break;
                case  4097:
                    $("#MODE").html("PermanentDD");
                    break;
                case  4353:
                    $("#MODE").html("PermanentDD+Trigg");
                    break;
                case  4098:
                    $("#MODE").html("PermanentSA");
                    break;
                case  0:
                    $("#MODE").html("Disable");
                    break;
            }
	    
	    switch (dafne) {
		case 1:
		    $("#DAFNE").html("positron");
		    break;
		case 2:
		    $("#DAFNE").html("electron");
		    break;
		case 0:
		    $("#DAFNE").html("no injection");
		    break;
	    }
	       
    });
	
        current_ACQ(); 
     }, 2000);
    
    
   // setTimeout(current_ACQ,4000);
    
    function current_ACQ() {
	if ($("#MODE").text() == "PermanentDD" || $("#MODE").text() == "PermanentDD+Trigg" || $("#MODE").text() == "Permanent" ) {
		//console.log("data on demand");
		builPlotTotDD();
		//buildBoxPlotDDreal("Permanent Data on Demand");
	}
	if ($("#MODE").text() == "DataOnDemand") {
		builPlotTotDD();
		//buildBoxPlotDDreal("Data on Demand");
	}
	    
	if ($("#MODE").text() == "PermanentSA") {
		builPlotTotSA();
		//buildBoxPlotSA('Permanent Slow Acquisition');
	    }
	    
	else if ($("#MODE").text() == "SlowAcquisition") {
	    builPlotTotSA();
	    //buildBoxPlotSA('Slow Acquisition');
	    
	}
    }   
  
    $(function(){
	    $('.btn-load').click(function(){
		fileLoad = $("#nameToLoad").val();
		
		if (fileLoad == '') {
		    fileLoad = name_file_ds;
		}
		
		$.get("http://"+ location.host + ":8081/CU?dev=ACCUMULATOR/BPM/BPMSYNC&cmd=load&parm=" + fileLoad, function(dataLoadJs, textStatus) {
		
		var dataLoad = dataLoadJs.replace(/\$numberLong/g, 'numberLong');
		dataLoad = dataLoad.replace(/\//g, '');
		
		
		try {
		    var objDataLoad = JSON.parse(dataLoad);
		    console.log("###### "+ objDataLoad.output.STATUSdafne_status  )
		    
		    if (objDataLoad.output.STATUSdafne_status == 2) {
			$("#file-up-el").html(fileLoad);
			
			
		    } else if (objDataLoad.output.STATUSdafne_status == 1) {
			$("#file-up-pos").html(fileLoad);
		    }
		    
		
		   
		    
			if(dafne == 1){
				LoadDataXP = [[2.8,objDataLoad.output.BPBA2002X],[5.2,objDataLoad.output.BPSA2001X],[6.6,objDataLoad.output.BPBA2001X],
						      [9.7,objDataLoad.output.BPBA1002X],[11,objDataLoad.output.BPSA1001X],[13.5,objDataLoad.output.BPBA1001X],
						      [17.7,objDataLoad.output.BPSA4001X],[19,objDataLoad.output.BPBA4002X],[22.9,objDataLoad.output.BPBA4001X],
						      [26,objDataLoad.output.BPBA3002X],[29.8,objDataLoad.output.BPBA3001X],[31.1,objDataLoad.output.BPSA3001X]];
					
					LoadDataYP = [[2.8,objDataLoad.output.BPBA2002Y],[5.2,objDataLoad.output.BPSA2001Y],[6.6,objDataLoad.output.BPBA2001Y],
						      [9.7,objDataLoad.output.BPBA1002Y],[11,objDataLoad.output.BPSA1001Y],[13.5,objDataLoad.output.BPBA1001Y],
						      [17.7,objDataLoad.output.BPSA4001Y],[19,objDataLoad.output.BPBA4002Y],[22.9,objDataLoad.output.BPBA4001Y],
						      [26,objDataLoad.output.BPBA3002Y],[29.8,objDataLoad.output.BPBA3001Y],[31.1,objDataLoad.output.BPSA3001Y]];
				       
			}
			if(dafne==2){

				LoadDataXE = [[2.8,objDataLoad.output.BPBA1001X],[5.2,objDataLoad.output.BPSA1001X],[6.6,objDataLoad.output.BPBA1002X],
					      [9.7,objDataLoad.output.BPBA2001X],[11,objDataLoad.output.BPSA2001X],[13.5,objDataLoad.output.BPBA2002X],
					      [17.7,objDataLoad.output.BPSA3001X],[19,objDataLoad.output.BPBA3001X],[22.9,objDataLoad.output.BPBA3002X],
					      [26,objDataLoad.output.BPBA4001X],[29.8,objDataLoad.output.BPBA4002X],[31.1,objDataLoad.output.BPSA4001X]];
				
				LoadDataYE = [[2.8,objDataLoad.output.BPBA1001Y],[5.2,objDataLoad.output.BPSA1001Y],[6.6,objDataLoad.output.BPBA1002Y],
					      [9.7,objDataLoad.output.BPBA2001Y],[11,objDataLoad.output.BPSA2001Y],[13.5,objDataLoad.output.BPBA2002Y],
					      [17.7,objDataLoad.output.BPSA3001Y],[19,objDataLoad.output.BPBA3001Y],[22.9,objDataLoad.output.BPBA3002Y],
					      [26,objDataLoad.output.BPBA4001Y],[29.8,objDataLoad.output.BPBA4002Y],[31.1,objDataLoad.output.BPSA4001Y]];
			}
		}  catch(e) {
			console.log("errore parsing" + e.message);
			alert("data " + fileLoad + " does not exist")
		    }
		
		});
	    });
    
    
	});

});
