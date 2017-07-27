/*
 * SHOW LIST DATASET 
 */

//var list_dataset = "";


$(document).ready(function() {
    
    $("#no-results").remove();
    $("#table-list-dataset").find("tr:gt(0)").remove();
    
    var list_dataset = [];
    
    $.get("http://" + location.host + ":8081/CU?cmd=search&parm={'name':'','what':'snapshots'}", function(data,textStatus) {
	 
	list_dataset = $.parseJSON(data);
	
	if (list_dataset.length == 0) {
            $('#table-list-dataset').append('<p id="no-results">No results</p>');
        } else {
        
            list_dataset.forEach(function(dataset, index) {
                var date = new Date(dataset.ts);
                $('#table-list-dataset').append('<tr><td>' + date + '</td><td id="nome_ds_save_' + index + '">' + dataset.name +
                                            '</td><td></td></tr>');
            });
	}
				
	});
    
});


var list_node = [];
function openViewDatasetMag(name_dataset) {
    $('#mdl-into-load').modal('show');
    $("#name_dataset").html(name_dataset);
    $.ajax ({
	url: "http://" + location.host + ":8081/CU?cmd=search&parm={'name':'" + name_dataset + "','what':'insnapshot'}",
	async: false
    }).done(function(data,textStatus) {
	    list_node = data;
	    //console.log("list node " + list_node);
	    intoDataset(name_dataset,list_node);    
    });
}

    
var colm_load_element = [];
var colm_load_setting = [];
var colm_load_status = [];
var colm_load_polarity = [];
function intoDataset(nameds,node) {
    $.get("http://" + location.host + ":8081/CU?cmd=snapshot&parm={'name':'" + nameds + "','what':'load','node_list': " + node + "}", function(data, textStatus) {
        //console.log("http://" + location.host + ":8081/CU?cmd=snapshot&parm={'name':'" + nameds + "','what':'load','node_list': " + node + "}");
        var obj_dataset = data.replace(/\$numberLong/g, 'numberLong');
        obj_dataset = $.parseJSON(data);
	//console.log("dataaa " + obj_dataset);
        try {
            colm_load_element = [];
            colm_load_setting = [];
            colm_load_status = [];
            colm_load_polarity = [];
            
            obj_dataset.forEach(function(element) {
                
                colm_load_element.push(element.output.ndk_uid);
                colm_load_setting.push(element.input.current);
                colm_load_status.push(element.output.stby);
                colm_load_polarity.push(element.output.polarity);    
            
            });
            
        } catch(e) {
                    alert("Error status");
                    console.log("errore parsing" + e.message);
                }

        $("#table_into_dataset_magnets").find("tr:gt(0)").remove();

        for (i = 0; i<colm_load_element.length; i++ ){
        
            $("#table_into_dataset_magnets").append('<tr id="tr_load_'+[i] +'"><td id="td_load_element_'+[i]+'"></td><td id="td_load_current_'+[i]
                                            +'"></td><td id="td_load_status_'+[i]+'"></td><td id="td_load_polarity_'+[i]+'"></td></tr>');
        }

            for(var i = 0; i <colm_load_element.length; i++) {
                $('#td_load_element_' + i).html(colm_load_element[i]);
                $('#td_load_current_' + i).html(colm_load_setting[i]);
            }    
                
            for(var i = 0; i <colm_load_polarity.length; i++) {
                    switch(colm_load_polarity[i]) {
                        case 1:
                            $('#td_load_polarity_' + i).html('<i class="material-icons rosso">add_circle</i>');
                            break;
                        case -1:
                            $('#td_load_polarity_' + i).html('<i class="material-icons blu">remove_circle</i>');
                            break;
                        case 0:
                            $('#td_load_polarity_' + i).html('<i class="material-icons">radio_button_unchecked</i>');
                            break;
                    }
                }
                
            for(var i = 0; i <colm_load_status.length; i++) {
                switch (colm_load_status[i]) {
                    case true:
                        $("#td_load_status_" + i).html('<i class="material-icons rosso">pause_circle_outline</i>');
                        break;
                    case false:
                        $("#td_load_status_" + i).html('<i class="material-icons verde">trending_down</i>');
                        break;        
                }
            }
    }); 
}


var list_node_scr = [];
function openViewDatasetScr(name_dataset) {
    $('#mdl-into-load-scraper').modal('show');
    $("#name_dataset").html(name_dataset);
    
    $.ajax ({
	url: "http://" + location.host + ":8081/CU?cmd=search&parm={'name':'" + name_dataset + "','what':'insnapshot'}",
	async: false
    }).done(function(data,textStatus) {
	    list_node_scr = data;
	    console.log("list node " + list_node_scr);
	    intoDatasetScr(name_dataset,list_node_scr);    
    });
}




var colm_load_element_scr = [];
var colm_load_setting_scr = [];
var colm_load_status_scr = [];
function intoDatasetScr(nameds,node) {
    
    $.get("http://" + location.host + ":8081/CU?cmd=snapshot&parm={'name':'" + nameds + "','what':'load','node_list': " + node + "}", function(data, textStatus) {
        
        console.log("http://" + location.host + ":8081/CU?cmd=snapshot&parm={'name':'" + nameds + "','what':'load','node_list': " + node + "}");
        var obj_dataset = data.replace(/\$numberLong/g, 'numberLong');
        obj_dataset = $.parseJSON(data);
	
	console.log("dataaa " + obj_dataset);
        
        try {
    
            colm_load_element_scr = [];
            colm_load_setting_scr = [];
            colm_load_status_scr = [];
            
            obj_dataset.forEach(function(element) {
                
                colm_load_element_scr.push(element.output.ndk_uid);
                colm_load_setting_scr.push(element.input.position);
                colm_load_status_scr.push(element.output.powerOn);
            });
            
        } catch(e) {
                    alert("Error status");
                    console.log("errore parsing" + e.message);
                }
        $("#table_into_dataset_scraper").find("tr:gt(0)").remove();
        
        for (i = 0; i<colm_load_element_scr.length; i++ ){
        
            $("#table_into_dataset_scraper").append('<tr id="tr_load_scr_'+[i] +'"><td id="td_load_element_scr_'+[i]+'"></td><td id="td_load_position_scr_'+[i]
                                            +'"></td><td id="td_load_status_scr_'+[i]+'"></td></tr>');
        }

            for(var i = 0; i <colm_load_element_scr.length; i++) {
                $('#td_load_element_scr_' + i).html(colm_load_element_scr[i]);
                $('#td_load_position_scr_' + i).html(colm_load_setting_scr[i]);
            }    
                
            for(var i = 0; i <colm_load_status_scr.length; i++) {
                switch (colm_load_status_scr[i]) {
                    case true:
                        $("#td_load_status_scr_" + i).html('<i class="material-icons verde">trending_down</i>');
                        break;
                    case false:
                        $("#td_load_status_scr_" + i).html('<i class="material-icons rosso">pause_circle_outline</i>');
                        break;        
                }
            } 
    }); 
    
}



var name_file_ds;
$(document).on("click", "#table-list-dataset tr", function(e) {
    var selected = $(this).hasClass("row_selected");
    $("#table-list-dataset tr").removeClass("row_selected");
    if (!selected) {
        $(this).addClass("row_selected");
        num_row = this.rowIndex;
        num_row = num_row - 1;  // per far partire il conteggio da 1 e non da 0
        name_file_ds = $("#nome_ds_save_" + num_row).text();
	
	if (name_file_ds.indexOf("SCRAPER") >=0) {
	    console.log("scraper");
	    openViewDatasetScr(name_file_ds);

	} else {
	    console.log("###altro");
	    openViewDatasetMag(name_file_ds);
	}
        
    }
});




