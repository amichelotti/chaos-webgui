/*
 * SHOW LIST DATASET 
 */

//var list_dataset = "";


$(document).ready(function() {
    
    $("#no-results").remove();
    $("#table-list-dataset").find("tr:gt(0)").remove();
    
    var list_dataset = "";


    
    $.get("http://" + location.host + ":8081/CU?cmd=search&parm={'name': ' ' , 'what': 'snapshot'}", function(data,textStatus) {
	
	
	 list_dataset = $.parseJSON(data);

	console.log("datasettt " + list_dataset);
	
	/*if (list_dataset.length == 0) {
            $('#table-list-dataset').append('<p id="no-results">No results</p>');
        } else {
        
            list_dataset.forEach(function(dataset, index) {
                var date = new Date(dataset.ts);
                $('#table-list-dataset').append('<tr><td>' + date + '</td><td id="nome_ds_save_' + index + '">' + dataset.name +
                                            '</td></tr>');
            });

	} */
	
    });
    
    
    

    
});
    
     
   
