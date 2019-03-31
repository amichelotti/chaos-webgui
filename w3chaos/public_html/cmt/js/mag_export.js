function table2excel() {
    
    for(var i = 0; i<n; i++){
        if ($("#td_flag_state_" + i).text() == "trending_down") {
            $("#td_flag_state_" + i).html("on");
            
        } else if ($("#td_flag_state_" + i).text() == "pause_circle_outline") {
            $("#td_flag_state_" + i).html("standby");
        }
    }
    
    for(var i = 0; i<n; i++){
        if ($("#td_flag_pol_" + i).text() == "add_circle") {
            $("#td_flag_pol_" + i).html("pos");
            
        } else if ($("#td_flag_pol_" + i).text() == "remove_circle") {
            $("#td_flag_pol_" + i).html("neg");
            
        } else {
            $("#td_flag_pol_" + i).html("open");

        }
    }
    
     for(var i = 0; i<n; i++){
	$("#td_saved_curr_" + i).html($("#curr_dataset_" + i).val());
	var str_state = "#state_dataset_" + i + " option:selected";
        $("#td_saved_state_" + i).html($(str_state).val());
	var str_polarity = "#pola_dataset_" + i + " option:selected";
	$("#td_saved_pola_" + i).html($(str_polarity).val());
    }
    
    
    $("#main_table").table2excel({
	name: "Excel Document Name",
	filename: "Mag Terminal",
	exclude_img: true,
	exclude_links: true,
	exclude_inputs: true
	});
    
    
     for(var i = 0; i<n; i++){
	
	var curr_sett =  $("#td_saved_curr_" + i).text();
	$("#td_saved_curr_" + i).html("");
	$("#td_saved_curr_" + i).append('<input type="text" class="input_curr_saved" id="curr_dataset_' + i + '" value="' + curr_sett + '"/>');
	
	var state_sett =  $("#td_saved_state_" + i).text();
	$("#td_saved_state_" + i).html("");
	    if (state_sett == "on") {
		$("#td_saved_state_" + i).append('<select class="select_saved" id="state_dataset_' + i +'"><option value="on" selected="">on</option><option value="standby">stanby</option></select>');
	    } else if (state_sett == "standby") {
		$("#td_saved_state_" + i).append('<select class="select_saved" id="state_dataset_' + i +'"><option value="on">on</option><option value="standby" selected="">stanby</option></select>');
	    } else {
                $("#td_saved_state_" + i).append('<select class="select_saved" id="state_dataset_' + i +'"><option value="on">on</option><option value="standby">stanby</option></select>');
            }
	    
	    
	var pola_sett =  $("#td_saved_pola_" + i).text();
	$("#td_saved_pola_" + i).html("");
	    if (pola_sett == "pos") {
		$("#td_saved_pola_" + i).append('<select class="select_saved" id="pola_dataset_' + i +'"><option value="pos" selected="">Pos</option><option value="open">Open</option>' +
                                                      '<option value="neg">Neg</option></select>');
	    } else if (pola_sett == "neg") {
		$("#td_saved_pola_" + i).append('<select class="select_saved" id="pola_dataset_' + i +'"><option value="pos">Pos</option><option value="open">Open</option>' +
                                                      '<option value="neg" selected="">Neg</option></select>');
	    } else if (pola_sett == "open") {
		$("#td_saved_pola_" + i).append('<select class="select_saved" id="pola_dataset_' + i +'"><option value="pos">Pos</option><option value="open" selected="">Open</option>' +
                                                      '<option value="neg">Neg</option></select>');
	    } else {
                $("#td_saved_pola_" + i).append('<select class="select_saved" id="pola_dataset_' + i +'"><option value="pos">Pos</option><option value="open">Open</option>' +
                                                      '<option value="neg">Neg</option></select>');
            }       

    } 
}    
 





