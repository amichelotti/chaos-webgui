/**
 * jQuery chaos widget
 * @author: Andrea Michelotti <andrea.michelotti@lnf.infn.it>
 */
(function ($) {
  var selectedInterface="";
  var snap_selected = "";
  var cu_selected = "";
  var cu_live_selected = {};
  var cu_list = [];
  var cu_name_to_index = [];
  var cu_name_to_desc = [];
  
  var health_time_stamp_old=[];
  var off_line=[];
  function cusWithInterface(culist,interface){
    var retlist=[];
    culist.forEach(function(name){
      var desc=jchaos.getDesc(name,null);
      if (desc[0].hasOwnProperty('instance_description') && desc[0].instance_description.hasOwnProperty("control_unit_implementation")&&(desc[0].instance_description.control_unit_implementation.indexOf(interface)!=-1)) {
        cu_name_to_desc[name]=desc[0];
        retlist.push(name);
    }
    });
    return retlist;
  }
  //Funzione per controllare che il timestamp di ogni singolo magnete si stia aggiornando
  function checkTimestamp() {
    setInterval(function () {
      for (var i = 0; i < refresh_time.length; i++) {
        if (refresh_time[i] != old_time[i]) {
          $("#name_element_" + i).css('color', 'green');
          old_time[i] = refresh_time[i];
        } else {
          $("#name_element_" + i).css('color', 'red');
        }
      }
    }, 10000);  /*** il setInterval è impostato a 6 secondi perché non può essere minore delq refresh cu ***/
  }

    //var index = 0;
    //38 up, 40down
/*     $(document).keydown(function (e) {
      
              if (e.keyCode === 40) {
                  if (num_row + 1 >= $(".row_element").length) {
                      num_row = $(".row_element").length - 1;
                  } else {
                      num_row = num_row + 1;
                  }
                  $(".row_element").removeClass("row_selected");
                  selectElement(num_row);
                  return false;
              }
              if (e.keyCode === 38) {
                  if (num_row == 0) {
                      num_row = 0;
                  } else {
                      num_row = num_row - 1;
                  }
                  $(".row_element").removeClass("row_selected");
                  selectElement(num_row);
                  return false;
              }
          });
 */      
  /**
   * Check if arg is either an array with at least 1 element, or a dict with at least 1 key
   * @return boolean
   */
  function isCollapsable(arg) {
    return arg instanceof Object && Object.keys(arg).length > 0;
  }
  function encodeName(str) {
    var tt = str.replace(/\//g, "_");
    return tt;
  }
  function toHHMMSS(sec_num) {

    // var sec_num = parseInt(this, 10); // don't forget the second param	
    var days = Math.floor(sec_num / 86400);
    var hours = Math.floor((sec_num - (days * 86400)) / 3600);
    var minutes = Math.floor((sec_num - (days * 86400) - (hours * 3600)) / 60);
    var seconds = sec_num - (days * 86400) - (hours * 3600) - (minutes * 60);

    if (days < 10) {
      days = "0" + days;
    }
    if (hours < 10) {
      hours = "0" + hours;
    }
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    if (seconds < 10) {
      seconds = "0" + seconds;
    }

    return days + ' days ' + hours + ':' + minutes + ':' + seconds;
  }

  function show_dev_alarm(id) {
    var dataset = cu_live_selected[cu_name_to_index[id]];
    if (dataset.hasOwnProperty("device_alarms")) {
      decodeDeviceAlarm(dataset.device_alarms);
    }
  }

  function show_cu_alarm(id) {
    var dataset =cu_live_selected[cu_name_to_index[id]];
    if (dataset.hasOwnProperty("cu_alarms")) {
      decodeDeviceAlarm(dataset.cu_alarms);
    }
  }

  function decodeDeviceAlarm(dev_alarm) {
    $("#table_device_alarm").find("tr:gt(0)").remove();
    $("#name-device-alarm").html(dev_alarm.ndk_uid);

    $.each(dev_alarm, function (key, value) {
      if (key != "ndk_uid" && key != "dpck_seq_id" && key != "dpck_ats" && key != "dpck_ds_type") {
        switch (value) {
          case 1:
            $("#table_device_alarm").append('<tr><td class="warning_value">' + key + '</td><td class="warning_value">' + value + '</td></tr>');
            break;
          case 2:
            $("#table_device_alarm").append('<tr><td style="color:red;">' + key + '</td><td style="color:red;">' + value + '</td></tr>');
            break;
          default:
            $("#table_device_alarm").append('<tr><td>' + key + '</td><td>' + value + '</td></tr>');
        }
      }
    });
  }
  /**
   * Check if a string represents a valid url
   * @return boolean
   */
  function isUrl(string) {
    var regexp = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return regexp.test(string);
  }
  function generateGenericTable(cu) {
    var html = '<div class="row-fluid" id="table-space">';
    html += '<div class="box span12">';
    html += '<div class="box-content span12">';
    if(cu.length==0){
      html += '<p id="no-result-monitoring">No results match</p>';
   
    } else {
      html += '<p id="no-result-monitoring"></p>';
      
    }
  
    html += '<table class="table table-bordered" id="main_table_cu">';
    html += '<thead class="box-header">';
    html += '<tr>';
    html += '<th>Name CU</th>';
    html += '<th colspan="3">Status</th>';
    html += '<th>Timestamp</th>';
    html += '<th>Uptime</th>';
    html += '<th colspan="2">Time sys/usr [%]</th>';
    html += '<th>Command Queue</th>';
    html += '<th colspan="2">Alarms dev/cu</th>';
    html += '<th>Push rate</th>';
    html += '</tr>';
   

    html += '</thead> ';
    $(cu).each(function (i) {
      var cuname = encodeName(cu[i]);
      html+="<tr class='row_element' cuname='"+cu[i]+"' id='" + cuname + "'><td class='name_element'>" + cu[i]
        + "</td><td id='status-" + cuname + "'></td><td id='td_busy_" + cuname + "'><td id='td_bypass_" + cuname + "'></td><td id='timestamp_" + cuname
        + "'></td><td id='uptime_" + cuname + "'></td><td id='systemtime_" + cuname + "'></td><td id='usertime_" + cuname
        + "'></td><td id='command_" + cuname + "'></td><td id='dev_alarm_" + cuname + "'></td><td id='cu_alarm_" + cuname + "'></td><td id='prate_" + cuname + "'></td></tr>";
    });

    html += '</table>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  function generateUpdateGenericTable(cu) {
   
  

    //$("#main_table_cu").DataTable();

    n = $('#main_table_cu tr').size();
    if (n > 22) {     /***Attivo lo scroll della tabella se ci sono più di 22 elementi ***/
      $("#table-scroll").css('height', '280px');
    } else {
      $("#table-scroll").css('height', '');
    }
   
  }

  function updateGenericTableDataset(cu) {
    cu.forEach(function (el) {  // cu forEach
      var name_device_db, name_id;
      var status;
      if (el.hasOwnProperty('health')) {   //if el health
        name_device_db = el.health.ndk_uid;
        name_id = encodeName(name_device_db);
        el.systTime = Number(el.health.nh_st).toFixed(3);
        el.usrTime = Number(el.health.nh_ut).toFixed(3);
        el.tmStamp = Number(el.health.dpck_ats) / 1000;

        el.tmUtm = toHHMMSS(el.health.nh_upt);
        status = el.health.nh_status;
        $("#uptime_" + name_id).html(el.tmUtm);
        $("#timestamp_" + name_id).html(new Date(1000 * el.tmStamp).toUTCString());
        $("#usertime_" + name_id).html(el.usrTime);
        $("#systemtime_" + name_id).html(el.systTime);
        $("#prate_" + name_id).html(Number(el.health.cuh_dso_prate).toFixed(3));
        if(off_line[name_device_db]==true){
          status="Dead";
        }
        if (status == 'Start') {
          $("#status-" + name_id).html('<i class="material-icons verde">play_arrow</i>');
        } else if (status == 'Stop') {
          $("#status-" + name_id).html('<i class="material-icons arancione">stop</i>');
        } else if (status == 'Init') {
          $("#status-" + name_id).html('<i class="material-icons giallo">trending_up</i>');
        } else if (status == 'Deinit') {
          $("#status-" + name_id).html('<i class="material-icons rosso">trending_down</i>');
        } else if (status == 'Fatal Error' || status == 'Recoverable Error') {
          //$("#status_" + name_id).html('<a id="fatalError_' + name_id + '" href="#mdl-fatal-error" role="button" data-toggle="modal" onclick="return show_fatal_error(this.id);"><i style="cursor:pointer;" class="material-icons rosso">error</i></a>');
          $("#status-" + name_id).html('<a id="Error-' + name_id + '" href="#mdl-fatal-error" role="button" data-toggle="modal" ><i style="cursor:pointer;" class="material-icons rosso">cancel</i></a>');
          $("Error-" + name_id).on("click", function () {
            $("#name-FE-device").html(el.health.ndk_uid);
            $("#status_message").html(status);

            $("#error_message").html(el.health.nh_lem);
            $("#error_domain").html(el.health.nh_led);
          });
        } else if (status == "Unload") {
          $("#status-" + name_id).html('<i class="material-icons rosso">power</i>');

        } else if (status == "Load") {
          $("#status-" + name_id).html('<i class="material-icons verde">power</i>');

        } else {
          $("#status-" + name_id).html('<i class="material-icons red">block</i>');
          
        }
      }
      if (el.hasOwnProperty('system')&& (status != "Dead")) {   //if el system
        $("#command_" + name_id).html(el.system.dp_sys_que_cmd);
        if (el.system.cudk_bypass_state == false) {
          $("#td_bypass_" + name_id).html('<i id="td_bypass_' + name_id + '" class="material-icons verde">usb</i>');
        } else {
          $("#td_bypass_" + name_id).html('<i id="td_bypass_' + name_id + '" class="material-icons verde">cached</i>');
        }
      }
      if (el.hasOwnProperty('output')) {   //if el output
        var busy = $.trim(el.output.busy);
        var dev_alarm = $.trim(el.output.device_alarm);
        var cu_alarm = $.trim(el.output.cu_alarm);
        if (dev_alarm == 1) {
          $("#dev_alarm_" + name_id).html('<a id="device-alarm-butt-'+  name_id +'" cuname="'+name_device_db+'" class="device-alarm" href="#mdl-device-alarm-cu" role="button" data-toggle="modal" ><i class="material-icons giallo">error</i></a>');
        } else if (dev_alarm == 2) {
          $("#dev_alarm_" + name_id).html('<a id="device-alarm-butt-'+  name_id +'" cuname="'+name_device_db+'" class="device-alarm" href="#mdl-device-alarm-cu" role="button" data-toggle="modal" ><i class="material-icons rosso">error</i></a>');
        } else {
          $("#device-alarm-butt-"+  name_id).remove();
        }

        if (cu_alarm == 1) {
          $("#cu_alarm_" + name_id).html('<a id="cu-alarm-butt-'+  name_id +'" cuname="'+name_device_db+'" class="cu-alarm" href="#mdl-device-alarm-cu" role="button" data-toggle="modal" ><i class="material-icons giallo">error_outline</i></a>');
        } else if (cu_alarm == 2) {
          $("#cu_alarm_" + name_id).html('<a id="cu-alarm-butt-'+  name_id +'" cuname="'+name_device_db+'" class="cu-alarm" href="#mdl-device-alarm-cu" role="button" data-toggle="modal"><i  class="material-icons rosso">error_outline</i></a>');
        } else {
          $("#cu-alarm-butt-"+  name_id).remove();
        }
        $("a.device-alarm").click(function(e){
          var id=$(this).attr("cuname");
          show_dev_alarm(id);
        });
        $("a.cu-alarm").click(function(e){
          var id=$(this).attr("cuname");
          
          show_cu_alarm(id);
        });

        if (busy == 'true') {
          $("#td_busy_" + name_id).html('<i id="busy_' + name_id + '" class="material-icons verde">hourglass_empty</i>');
        } else {
          $("#busy_" + name_id).remove();
        }
      }
    });
  }

  function generatePStable(cu) {
    var html = '<div class="row-fluid">';
    html += '<div class="box span12">';
    html += '<div class="box-content">';
    html += '<table class="table table-bordered" id="main_table_magnets">';
    html += '<thead class="box-header">';
    html += '<tr>';
    html += '<th>Element</th>';
    html += '<th>Readout [A]</th>';
    html += '<th>Setting [A]</th>';
    html += '<th colspan="3">Saved</th>';
    html += '<th colspan="6">Flags</th>';
    html += '</tr>';
    html += '</thead>';

    $(cu).each(function (i) {
      var cuname = encodeName(cu[i]);
      html += "<tr class='ps_element' cuname='"+cu[i]+"' id='" + cuname + "'><td class='td_element td_name'>" + cu[i] + "</td><td class='td_element td_readout' id='" + cuname
      + "_output_current'>NA</td><td class='td_element td_current' id='" + cuname + "_input_current'>NA</td><td class='td_element' id='" + cuname
      + "_saved_current'></td><td class='td_element' id='" + cuname
      + "_saved_state'></td><td class='td_element' id='" + cuname
      + "_saved_polarity'></td><td class='td_element' id='" + cuname
      + "_output_stby'></td><td class='td_element' id='" + cuname
      + "_output_polarity'></td><td class='td_element' id='" + cuname
      + "_output_local'></td><td class='td_element' id='" + cuname
      + "_output_busy'></td><td class='td_element' id='" + cuname
      + "_output_device_alarm'></td><td class='td_element' id='" + cuname
      + "_output_cu_alarm'></td></tr>";
    });
    html += '</table>';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    return html;
  }
  function updatePStable(cu) {
    cu.forEach(function (elem) {
      var cuname = encodeName(elem.output.ndk_uid);

      $("#" + cuname + "_output_current").html(elem.output.current.toFixed(3));
      $("#" + cuname + "_input_current").html(elem.input.current);
      switch (elem.output.polarity) {
        case 1:
          $("#" + cuname + "_output_polarity").html('<i class="material-icons rosso">add_circle</i>');
          break;
        case -1:
          $("#" + cuname + "_output_polarity").html('<i class="material-icons blu">remove_circle</i>');
          break;
        case 0:
          $("#" + cuname + "_output_polarity").html('<i class="material-icons">radio_button_unchecked</i>');
          break;

      }


      if (elem.output.stby == false) {
        $("#" + cuname + "_output_stby").html('<i class="material-icons verde">trending_down</i>');
      } else if (elem.output.ostby= true) {
        $("#" + cuname + "_output_stby").html('<i class="material-icons rosso">pause_circle_outline</i>');

      }

      if (elem.output.busy == true) {
        $("#" + cuname + "_output_busy").html('<i class="material-icon verde">hourglass empty</i>');
      } else if (elem.output.busy == false) {
        $("#" + cuname + "_output_busy").remove();
      }


      if (elem.output.local == true) {
        $("#" + cuname + "_output_local").html('<i class="material-icons rosso">vpn_key</i>');
      } else if (elem.output.local == false) {
        $("#" + cuname + "_output_local").remove();
      }

    });

    n = $('#main_table_magnets tr').size();
    if (n > 22) {     /***Attivo lo scroll della tabella se ci sono più di 22 elementi ***/
      $("#table-scroll").css('height', '280px');
    } else {
      $("#table-scroll").css('height', '');
    }
    
  }
  function generatePSCmd(cu) {
    var html = '<div class="row-fluid">';
    html += '<div class="box span12 box-cmd">';
    html += '<div class="box-header green">';
    html += '<h3 id="h3-cmd">Commands</h3>';
    html += '</div>';
    html += '<div class="box-content">';
    html += '<div class="row-fluid">';
    html += '<a class="quick-button-small span1 btn-cmd cucmd" id="PSbuttON" cucmdid="mode" cucmdvalue=1>';
    html += '<i class="material-icons verde">trending_down</i>';
    html += '<p class="name-cmd">On</p>';
    html += '</a>';
    html += '<a class="quick-button-small span1 btn-cmd cucmd" id="PSbuttOFF" cucmdid="mode" cucmdvalue=0>';
    html += '<i class="material-icons rosso">pause_circle_outline</i>';
    html += '<p class="name-cmd">Standby</p>';
    html += '</a>';
    html += '<a class="quick-button-small span1 btn-cmd cucmd" id="PSreset_alarm" cucmdid="rst">';
    html += '<i class="material-icons rosso">error</i>';
    html += '<p class="name-cmd">Reset</p>';
    html += '</a>';
    html += '<div class="span3 offset1" onTablet="span6" onDesktop="span3" id="input-value-mag">';
    html += '<input class="input focused" id="sett_sett_cur" name="setCurrent" type="text" value="[A]">';
    html += '</div>';

    html += '<a class="quick-button-small span1 btn-value cucmd" cucmdid="sett" id="PSapply_current" >';
    html += '<p>Apply</p>';
    html += '</a>';
    html += '</div>';
    html += '<div class="row-fluid">';
    html += '<a class="quick-button-small span1 btn-cmd cucmd" cucmdid="pola" cucmdvalue=1 >';
    html += '<i class="material-icons rosso">add_circle</i>';
    html += '<p class="name-cmd">Pos</p>';
    html += '</a>';
    html += '<a class="quick-button-small span1 btn-cmd cucmd" cucmdid="pola" cucmdvalue=0 >';
    html += '<i class="material-icons">radio_button_unchecked</i>';
    html += '<p class="name-cmd">Open</p>';
    html += '</a>';
    html += '<a class="quick-button-small span1 btn-cmd cucmd" cucmdid="pola" cucmdvalue=-1 >';
    html += '<i class="material-icons blu">remove_circle</i>';
    html += '<p class="name-cmd">Neg</p>';
    html += '</a>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    return html;
  }
  function generateSnapshotTable(cuid) {

    var html = '<div class="modal hide fade" id="mdl-snap">';
    html += '<div class="modal-header">';
    html += '<button type="button" class="close" data-dismiss="modal">×</button>';
    html += '<h3>List Snapshots</h3>';
    html += '</div>';
    html += '<div class="modal-body">';
    html += '<div class="row-fluid">';
    html += '<div class="box span12">';
    html += '<div class="box-content">';
    html += '<table class="table table-bordered" id="table_snap">';
    html += '<thead class="box-header">';
    html += '<tr>';
    html += '<th>Date</th>';
    html += '<th>Name</th>';
    html += '</tr>';
    html += '</thead>';
    html += '</table>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    html += '<div class="modal-footer">';
    html += '<div class="control-group">';
    html += '<label class="control-label" for="nameDataset">Insert name</label>';
    html += '<div class="controls">';
    html += '<input class="input-xlarge focused" id="snap_save_name" type="text" value="name">';
    html += '</div>';
    html += '</div>';
    html += '<a href="#" class="btn" id="snap-show">Show</a>';
    html += '<a href="#" class="btn" id="snap-apply">Apply</a>';
    html += '<a href="#" class="btn" id="snap-delete">Delete</a>';
    html += '<a href="#" class="btn" id="snap-close">Close</a>';
    html += '</div>';
    html += '</div>';
    return html;
  }
  function generateDataSet(cuid) {
    // var cu=jchaos.getChannel(cuid, -1,null);
    // var desc=jchaos.getDesc(cuid,null);

    var html = '<div class="modal hide fade " id="mdl-dataset">';
    html += '<div class="modal-header">';
    html += '<button type="button" class="close" data-dismiss="modal">×</button>';
    html += '<h3>DATASET ' + cuid + '</h3>';
    html += '</div>';
    html += '<div class="modal-body">';
    html += '<div id="cu-dataset" class="json-dataset"></div>';
    html += '</div>';
    html += '<div class="modal-footer">';
    html += '<a href="#" class="btn btn-primary" id="dataset-update">Pause</a>';
    html += '<a href="#" class="btn btn-primary" id="dataset-close">Close</a>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  function generateDescription(cuid) {
    // var cu=jchaos.getChannel(cuid, -1,null);
    // var desc=jchaos.getDesc(cuid,null);

    var html = '<div class="modal hide fade " id="mdl-description">';
    html += '<div class="modal-header">';
    html += '<button type="button" class="close" data-dismiss="modal">×</button>';
    html += '<h3 id="desc_text">Description ' + cuid + '</h3>';
    html += '</div>';
    html += '<div class="modal-body">';
    html += '<div id="cu-description" class="json-dataset"></div>';
    html += '</div>';
    html += '<div class="modal-footer">';
    html += '<a href="#" class="btn btn-primary" id="description-close">Close</a>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  function generateAlarms(cuid) {
    var html = '<div class="modal hide fade" id="mdl-fatal-error">';
    html += '<div class="modal-header">';
    html += '<button type="button" class="close" data-dismiss="modal">X</button>';
    html += '<h3>Error of <span id="name-FE-device"></span></h3>';
    html += '</div>';
    html += '<div class="modal-body">';
    html += '<div class="row-fluid">';
    html += '<p><b>Health Status:</b><span id="status_message"></span></p>';
    html += '<p><b>Message:</b><span id="error_message"></span></p>';
    html += '<p><b>Domain:</b><span id="error_domain"></span></p>';
    html += '</div>';
    html += '</div>';
    html += '<div class="modal-footer">';
    html += '</div>';
    html += '</div>';

    html += '<div class="modal hide fade" id="mdl-device-alarm-cu">';
    html += '<div class="modal-header">';
    html += '<button type="button" class="close" data-dismiss="modal">X</button>';
    html += '<h3>TABLE ALARM of <span id="name-device-alarm"></span></h3>';
    html += '</div>';
    html += '<div class="modal-body">';
    html += '<div class="row-fluid">';
    html += '<div class="box span12 red">';
    html += '<div class="box-content">';
    html += '<table class="table table-bordered" id="table_device_alarm">';
    html += '<thead class="box-header red">';
    html += '<tr>';
    html += '<th>Description</th>';
    html += '<th>Value</th>';
    html += '</tr>';
    html += '</thead>';
    html += '</table>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    html += '<div class="modal-footer">';
    html += '</div>';
    html += '</div>';


    return html;
  }
  function generateModalActions(cuid) {
    var html = generateDataSet(cuid);
    html += generateDescription(cuid);
    html += generateSnapshotTable(cuid);
    html += generateAlarms(cuid);
    return html;
  }

  function generateActionBox(cuid) {
    var html = '<div class="box black span4 offset8" onTablet="span4" onDesktop="span4">';
    html += '<div class="box-header">';
    html += '<h2><i class="halflings-icon white list"></i><span class="break"></span>Actions</h2>';
    html += '<div class="box-icon">';
    html += '<a href="#" class="btn-minimize"><i class="halflings-icon white chevron-up"></i></a>';
    html += '</div>';
    html += '</div>';
    html += '<div class="box-content">';
    html += '<ul class="dashboard-list metro">';
    /*    html += '<li class="green">';
       html += '<a href="#mdl-save" role="button" data-toggle="modal">';
       html += '<i class="icon-save green"></i><span class="opt-menu hidden-tablet">Save</span>';
       html += '</a>';
       html += '</li>';
       html += '<li class="blue">';
       html += '<a href="#" role="button" onclick="reLoad()">';
       html += '<i class="icon-repeat blue"></i><span class="opt-menu hidden-tablet">Reload</span>';
       html += '</a>';
       html += '</li>';
       html += '<li class="yellow">';
       html += '<a href="#">';
       html += '<i class="icon-print yellow"></i><span class="opt-menu hidden-tablet">Print</span>';
       html += '</a>';
       html += '</li>';
       
       */
    html += '<li class="red">';
    html += '<a href="#mdl-snap" role="button" class="show_snapshot" data-toggle="modal">';
    html += '<i class="icon-file red"></i><span class="opt-menu hidden-tablet">Snapshot</span>';
    html += '</a>';
    html += '</li>';


    html += '<li class="green">';
    html += '<a href="#mdl-dataset" role="button" class="show_dataset" data-toggle="modal">';
    html += '<i class="icon-print green"></i><span class="opt-menu hidden-tablet">Dataset</span>';
    html += '</a>';
    html += '</li>';

    html += '<li class="red">';
    html += '<a href="#mdl-description" role="button" class="show_description" data-toggle="modal">';
    html += '<i class="icon-print green"></i><span class="opt-menu hidden-tablet">Description</span>';
    html += '</a>';
    html += '</li>';
    html += '</ul>';
    html += '</div>';
    html += '</div>';
    return html;
  }
  /**
   * Transform a json object into html representation
   * @return string
   */
  function json2html(json, options, pather) {
    var html = '';
    if (typeof json === 'string') {
      /* Escape tags */
      json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      if (isUrl(json))
        html += '<a href="' + json + '" class="json-string">' + json + '</a>';
      else
        html += '<span class="json-string">"' + json + '"</span>';
    }
    else if (typeof json === 'number') {
      html += '<span class="json-literal">' + json + '</span>';
    }
    else if (typeof json === 'boolean') {
      html += '<span class="json-literal">' + json + '</span> ';
    }
    else if (json === null) {
      html += '<span class="json-literal">null</span>';
    }
    else if (json instanceof Array) {
      if (json.length > 0) {
        html += '[<ol class="json-array">';
        for (var i = 0; i < json.length; ++i) {
          html += '<li>';
          /* Add toggle button if item is collapsable */
          if (isCollapsable(json[i])) {
            html += '<a href class="json-toggle"></a>';
          }
          html += json2html(json[i], options, key);
          /* Add comma if item is not last */
          if (i < json.length - 1) {
            html += ',';
          }
          html += '</li>';
        }
        html += '</ol>]';
      }
      else {
        html += '[]';
      }
    }
    else if (typeof json === 'object') {
      var key_count = Object.keys(json).length;
      if (key_count > 0) {
        html += '{<ul class="json-dict">';
        for (var key in json) {
          if (json.hasOwnProperty(key)) {
            html += '<li>';
            var keyclass = "";
            if (isCollapsable(json[key])) {
              keyclass = "json-string";
            } else {
              keyclass = "json-key";
            }
            var keyRepr = options.withQuotes ?
              '<span class="' + keyclass + '" id=' + pather + '-' + key + '>"' + key + '"</span>' : key;
            /* Add toggle button if item is collapsable */
            if (isCollapsable(json[key])) {
              html += '<a href class="json-toggle">' + keyRepr + '</a>';
            }
            else {
              html += keyRepr;

            }
            html += ': ' + json2html(json[key], options, key);
            if ((!isCollapsable(json[key])) && (pather == "input")) {
              html += '<input class="json-keyinput" id="attr-' + key + '"/>';

            }
            /* Add comma if item is not last */
            if (--key_count > 0)
              html += ',';
            html += '</li>';
          }
        }
        html += '</ul>}';
      }
      else {
        html += '{}';
      }
    }
    return html;
  }

  function setSched(name, value) {
    jchaos.setSched(name, value);
  }
  /**
   * Check if arg is either an array with at least 1 element, or a dict with at least 1 key
   * @return boolean
   */
  function isCollapsable(arg) {
    return arg instanceof Object && Object.keys(arg).length > 0;
  }

  /**
   * Check if a string represents a valid url
   * @return boolean
   */
  function isUrl(string) {
    var regexp = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return regexp.test(string);
  }

  function Stop(cuid) {
    jchaos.sendCUCmd(cuid, "stop", "", null);
  }
  function Start(cuid) {
    jchaos.sendCUCmd(cuid, "start", "", null);
  }
  function Deinit(cuid) {
    jchaos.sendCUCmd(cuid, "deinit", "", null);
  }
  function Init(cuid) {
    jchaos.sendCUCmd(cuid, "init", "", null);
  }
  function ByPassON(cuid) {
    jchaos.setBypass(cuid, true, null);

  }
  function ByPassOFF() {
    jchaos.setBypass(cuid, false, null);
  }

  function chaosGenericControl(cu) {
    var status;
    var html = "";
    html += '<div class="row-fluid">';
    html += '<div class="box span12 box-cmd">';


    if (cu.hasOwnProperty('health')) {
      var cuid = cu.health.ndk_uid;
      status = cu.health.nh_status;
      var ctrlid = encodeName(cuid);
      html += '<div class="box-header green">';
      html += '<h3 id="h3-cmd">Generic Commands</h3>';
      html += '</div>';
      html += '<div class="box-content">';

      if (cu.hasOwnProperty('system')) {
        html += '<div class="row-fluid">';
        html += "<div class='span6 statbox'>";
        html += "<h3>Actual scheduling (us):" + cu.system.cudk_thr_sch_delay + "</h3>";
        html += "</div>";

        html += "<div class='span3'>";
        //html+="<input type='text' id='setSchedule' onkeypress='setSched(\""+cuid.cuname+"\",this.value);'>"; 
        html += "<input type='text' class='setSchedule' cuname=\"" + cuid + "\">";
        //html+="<input type='text' id='setSchedule' onkeypress='jchaos.setSched(\""+cuid+"\",this.value);'>"; 
        html += "</div>";
        html += "</div>";

      }


      if(off_line[cuid]==true){
        status="Dead";
      }
      html += '<div class="row-fluid">';
      html += "<div class='span12'>";
      if (status == 'Start') {
        html += "<a class='quick-button-small span2 btn-cmd' cuname='"+cuid+"' id='cmd-stop-" + ctrlid + "' onclick='jchaos.sendCUCmd(\"" + cuid + "\",\"stop\",\"\",null);'><i class='material-icons verde'>pause</i><p class='name-cmd'>Stop</p></a>";
      } else if (status == 'Stop') {
        html += "<a class='quick-button-small span2 btn-cmd' cuname='"+cuid+"' id='cmd-start-" + ctrlid + "' onclick='jchaos.sendCUCmd(\"" + cuid + "\",\"start\",\"\",null);'><i class='material-icons verde'>play_arrow</i><p class='name-cmd'>Start</p></a>";
        html += "<a class='quick-button-small span2 btn-cmd' cuname='"+cuid+"'id='cmd-deinit-" + ctrlid + "' onclick='jchaos.sendCUCmd(\"" + cuid + "\",\"deinit\",\"\",null);'><i class='material-icons verde'>trending_down</i><p class='name-cmd'>Deinit</p></a>";

      } else if (status == 'Init') {
        html += "<a class='quick-button-small span2 btn-cmd' cuname='"+cuid+"' id='cmd-start-" + ctrlid + "' onclick='jchaos.sendCUCmd(\"" + cuid + "\",\"start\",\"\",null);'><i class='material-icons verde'>play_arrow</i><p class='name-cmd'>Start</p></a>";
        html += "<a class='quick-button-small span2 btn-cmd' cuname='"+cuid+"' id='cmd-deinit-" + ctrlid + "' onclick='jchaos.sendCUCmd(\"" + cuid + "\",\"deinit\",\"\",null);'><i class='material-icons verde'>trending_down</i><p class='name-cmd'>Deinit</p></a>";
      } else if (status == 'Deinit') {
        html += "<a class='quick-button-small span2 btn-cmd' cuname='"+cuid+"' id='cmd-init-" + ctrlid + "' onclick='jchaos.sendCUCmd(\"" + cuid + "\",\"init\",\"\",null);'><i class='material-icons verde'>trending_up</i><p class='name-cmd'>Init</p></a>";
        html += "<a class='quick-button-small span2 btn-cmd' cuname='"+cuid+"' id='cmd-unload-" + ctrlid + "' onclick='jchaos.loadUnload(\"" + cuid + "\",false,null);'><i class='material-icons red'>power</i><p class='name-cmd'>Unload</p></a>";

      } else if (status == 'Recoverable Error') {
        html += "<a class='quick-button-small span2 btn-cmd' cuname='"+cuid+"' id='cmd-init-" + ctrlid + "' onclick='jchaos.sendCUCmd(\"" + cuid + "\",\"recover\",\"\",null);'><i class='material-icons verde'>build</i><p class='name-cmd'>Recover Error</p></a>";
      } else if (status == "Fatal Error") {
        html += "<a class='quick-button-small span2 btn-cmd' cuname='"+cuid+"' id='cmd-deinit-" + ctrlid + "' onclick='jchaos.sendCUCmd(\"" + cuid + "\",\"deinit\",\"\",null);'><i class='material-icons verde'>trending_down</i><p class='name-cmd'>Deinit</p></a>";

      } else if (status == "Load") {
        html += "<a class='quick-button-small span2 btn-cmd' cuname='"+cuid+"' id='cmd-init-" + ctrlid + "' onclick='jchaos.sendCUCmd(\"" + cuid + "\",\"init\",\"\",null);'><i class='material-icons verde'>trending_up</i><p class='name-cmd'>Init</p></a>";
        html += "<a class='quick-button-small span2 btn-cmd' cuname='"+cuid+"' id='cmd-unload-" + ctrlid + "' onclick='jchaos.loadUnload(\"" + cuid + "\",false,null);'><i class='material-icons red'>power</i><p class='name-cmd'>Unload</p></a>";

      } else if (status == "Unload") {
        html += "<a class='quick-button-small span2 btn-cmd' cuname='"+cuid+"' id='cmd-load-" + ctrlid + "' onclick='jchaos.loadUnload(\"" + cuid + "\",true,null);'><i class='material-icons green'>power</i><p class='name-cmd'>Load</p></a>";        
      } else {

      }


      if (cu.hasOwnProperty('system')&& (status != "Dead")) {
        var bypass = cu.system.cudk_bypass_state;
        if (bypass) {
          html += "<a class='quick-button-small span2 btn-cmd' id='cmd-bypassOFF-" + ctrlid + "'' onclick='jchaos.setBypass(\"" + cuid + "\",false,null);'><i class='material-icons verde'>usb</i><p class='name-cmd'>BypassOFF</p></a>";

        } else {
          html += "<a class='quick-button-small span2 btn-cmd' id='cmd-bypassON-" + ctrlid + "'' onclick='jchaos.setBypass(\"" + cuid + "\",true,null);'><i class='material-icons verde'>cached</i><p class='name-cmd'>BypassON</p></a>";
        }
      }
      html += "</div>";
      html += "</div>";
      html += "</div>";

    } else {
      html += '<div class="box-header red">';
      html += '<h3 id="h3-cmd" style=”color: red; font-weight: bold;">DEAD</h3>';
      html += '</div>';

    }
    html += "</div>";
    html += "</div>";
    return html;
  }



  function updateSnapshotTable(cu) {
    $("#table_snap").find("tr:gt(0)").remove();
    $("#snap-apply").hide();
    $("#snap-show").hide();
    $("#snap-delete").hide();
    $("#snap-save").show();

    jchaos.search(cu, "snapshotsof", false, function (snaplist) {
      if (snaplist.length == 0) {
        $('#table_snap').append('<p id="no-results">No results</p>');
      } else {
        var dataset;
        snap_selected = "";
        snaplist.forEach(function (dataset, index) {
          var date = new Date(dataset.ts);
          $('#table_snap').append('<tr class="row_element" id="' + dataset.name + '"><td>' + date + '</td><td>' + dataset.name + '</td></tr>');
        });
        $("#table_snap tbody tr").click(function (e) {
          $(".row_element").removeClass("row_snap_selected");
          $(this).addClass("row_snap_selected");
          snap_selected = $(this).attr("id");
          $("#snap-apply").show();
          $("#snap-show").show();
          $("#snap-delete").show();

          $("#snap_save_name").val(snap_selected);

        });
      }
    });
  }
  /**
   * jQuery plugin method
   * @param json: a javascript object
   * @param options: an optional options hash
   */
  $.fn.chaosDashboard = function (cuids, options) {
    options = options || {};
    if(cuids == null){
      return;
    }
    var collapsed = options.collapsed;
    /* jQuery chaining */
    return this.each(function () {
      var notupdate_dataset = 1;
      /* Transform to HTML */
      // var html = chaosCtrl2html(cu, options, '');
      
      if (!(cuids instanceof Array)) {
        cu_list = [cuids];
      } else {
        cu_list = cuids;
      }
      if(options.CUtype==null){
        options.CUtype="generic";
      }

      if( (options.CUtype!="generic") && (options.CUtype!="all") && (options.CUtype!="ALL")){
        cu_list=cusWithInterface(cu_list,options.CUtype);
      }

      cu_list.forEach(function (elem,id) {
        cu_name_to_index[elem] = id;
        health_time_stamp_old[elem]=0;
        off_line[elem]=false;
      });
      cu_selected = cu_list[0];
      
      var html = "";
      /*****
       * 
       * clear all interval interrupts
       */
      /**
       * fixed part
       */
      html += generateModalActions("");
      html += generateActionBox("");

      if ((options.CUtype.indexOf("SCPowerSupply") != -1)) {
        html += generatePStable(cu_list);

        html += '<div class="ps-control"></div>';

      } else {
        html+=generateGenericTable(cu_list);
      }
      html += '<div class="cu-generic-control"></div>';

      /*** */
      /* Insert HTML in target DOM element */
      $(this).html(html);
      /*****
       * 
       * GENERIC TABLE
       */
      
      $("#main_table_cu tbody tr").click(function (e) {
        $(".row_element").removeClass("row_snap_selected");
        $(this).addClass("row_snap_selected");
        cu_selected = $(this).attr("cuname");
  
      });
      /******** */
      $(this).off('keypress');
      $(this).on('keypress', function (event) {
        var t = $(event.target);

        if ((event.which == 13) && (t.attr('class') == "setSchedule")) {
          //  var name = $(t).attr("cuname");
          var value = $(t).attr("value");
          jchaos.setSched(cu_selected, value);

        }

      });
      $("#mdl-dataset").draggable();
      $("#mdl-description").draggable();
      $("#mdl-snap").draggable();

      /*** 
       * 
       * JSON EVENTS
       * */
      $(this).off('click');
      $(this).on('click', 'a.json-toggle', function () {
        var target = $(this).toggleClass('collapsed').siblings('ul.json-dict, ol.json-array');
        target.toggle();
        if (target.is(':visible')) {
          target.siblings('.json-placeholder').remove();
        }
        else {
          var count = target.children('li').length;
          var placeholder = count + (count > 1 ? ' items' : ' item');
          target.after('<a href class="json-placeholder">' + placeholder + '</a>');
        }
        return false;
      });


      $(this).on('click', 'span.json-key', function () {
        var id = this.id;
        var attr = id.split("-")[1];

        $("#attr-" + attr).toggle();
        //var tt =prompt('type value');
        return false;
      });

      $(this).on('keypress', 'input.json-keyinput', function (e) {
        if (e.keyCode == 13) {
          var id = this.id;
          var attr = id.split("-")[1];
          jchaos.setAttribute(cu_selected, attr, this.value);
          $("#" + this.id).toggle();
          return false;
        }
        //var tt =prompt('type value');
        return this;
      });
      /* Simulate click on toggle button when placeholder is clicked */
      $(this).on('click', 'a.json-placeholder', function () {
        $(this).siblings('a.json-toggle').click();
        return false;
      });

      if (options.collapsed == true) {
        /* Trigger click to collapse all nodes */
        $(this).find('a.json-toggle').click();
      }

      /****************************/
      ///******* control buttons */
      /*** 
       * Snapshot handling
       */
      $("#snap-save").on('click', function () {
        var value = $("#snap_save_name").val();

        jchaos.snapshot(value, "create", cu_selected, function () {
          updateSnapshotTable(cu);

        });

        //var snap_table = $(this).find('a.show_snapshot');
      });

      $("#snap-close").on('click', function () {
        $("#mdl-snap").modal("hide");
      });

      $(this).on('click', 'a.show_snapshot', function () {

        updateSnapshotTable(cu_selected);
      });

      $("#snap-delete").on('click', function (e) {
        if (snap_selected != "") {
          jchaos.snapshot(snap_selected, "delete", "", "", function () {
            updateSnapshotTable(cu_selected);

          });

        }
      });
      $("#snap-show").on('click', function (e) {

        if (snap_selected != "") {
          var dataset = jchaos.snapshot(snap_selected, "load", "", "", null);
          var jsonhtml = json2html(dataset, options, cu_selected);
          if (isCollapsable(dataset)) {
            jsonhtml = '<a href class="json-toggle"></a>' + jsonhtml;
          }
          updateSnapshotTable(cu_selected);

          $("#cu-description").html(jsonhtml);
          $("#desc_text").html("Snapshot " + snap_selected);
          $("#mdl-description").modal("show");

        }
      });
      $("#snap-apply").on('click', function (e) {
        if (snap_selected != "") {
          jchaos.snapshot(snap, "restore", "", "", null);
        }
      });
      /***********************/

      /*
      * DATASET HANDLING 
       */
      $(this).on('click', 'a.show_dataset', function () {
        var dataset = jchaos.getChannel(cu_selected, -1, null);
        var jsonhtml = json2html(dataset[0], options, cu_selected);
        if (isCollapsable(dataset[0])) {
          jsonhtml = '<a href class="json-toggle"></a>' + jsonhtml;
        }

        $("#cu-dataset").html(jsonhtml);
      });
      $("#dataset-close").on('click', function () {
        $("#mdl-dataset").modal("hide");
      });
      if (notupdate_dataset) {
        $("#dataset-update").html('Update');
      } else {
        $("#dataset-update").html('Pause');
      }
      $("#dataset-update").on('click', function () {
        notupdate_dataset = !notupdate_dataset;
        if (notupdate_dataset) {
          $("#dataset-update").html('Update');
        } else {
          $("#dataset-update").html('Pause');
        }
      });
      /********************/
      /*********
       * DESCRIPTION HANDLING
       */
      $("#description-close").on('click', function () {
        $("#mdl-description").modal("hide");
      });

      $(this).on('click', 'a.show_description', function () {
        var dataset = jchaos.getDesc(cu_selected, null);
        var jsonhtml = json2html(dataset, options, cu_selected);
        if (isCollapsable(dataset)) {
          jsonhtml = '<a href class="json-toggle"></a>' + jsonhtml;
        }

        $("#cu-description").html(jsonhtml);
      });


      /**
       * 
       * POWER SUPPLY HANDLING
       */
      if (options.CUtype.indexOf("SCPowerSupply") != -1) {
        $("#main_table_magnets tbody tr").click(function (e) {
          $(".ps_element").removeClass("row_snap_selected");
          $(this).addClass("row_snap_selected");
          cu_selected = $(this).attr("cuname");
        });

        $("div.ps-control").html(generatePSCmd(cu_selected));
       /*  var ps_interval = setInterval(function () {
          if ($("div.ps-control").is(':visible') == false) {
            clearInterval(ps_interval);
          }
          var datasets = jchaos.getChannel(cu_list, -1, null);
         
        }, options.Interval); */
      }

      /************** 
       * 
       * UPDATE DATASET
       * 
      */
      
      
      $("div.cu-generic-control").html(chaosGenericControl(jchaos.getChannel(cu_selected, -1, null)[0]));
      var interval = setInterval(function () {
        cu_live_selected = jchaos.getChannel(cu_list, -1, null);
        if ($("div.cu-generic-control").is(':visible') == false) {
          clearInterval(interval);
        } else {
          if(cu_live_selected.length==0 || cu_selected == null || cu_name_to_index[cu_selected]==null){
            return;
          }
          
          var index = cu_name_to_index[cu_selected];
          $("div.cu-generic-control").html(chaosGenericControl(cu_live_selected[index]));
          if ($("#cu-dataset").is(':visible') && !notupdate_dataset) {
            var jsonhtml = json2html(cu_live_selected[index], options, cu_selected);
            if (isCollapsable(cu_live_selected[index])) {
              jsonhtml = '<a href class="json-toggle"></a>' + jsonhtml;
            }

            $("#cu-dataset").html(jsonhtml);

          }
          
          if ($("#main_table_cu").is(':visible')) {
            // update 
            updateGenericTableDataset(cu_live_selected);
          }
          if ($("#main_table_magnets").is(':visible')) {
            // update 
            
            updatePStable(cu_live_selected);
          //  $("div.ps-control").html(generatePSCmd(cu_live_selected[index]));
          }
        }

      }, options.Interval);
      for(var i=1;i<interval;i++){
        clearInterval(i);
      }
      $(".cucmd").click(function(){
        var alias=$(this).attr("cucmdid");
        var parvalue=$(this).attr("cucmdvalue");
        
        if(cu_selected!=null && cu_name_to_desc[cu_selected].hasOwnProperty("cudk_ds_desc")&& cu_name_to_desc[cu_selected].cudk_ds_desc.hasOwnProperty("cudk_ds_command_description")){
          var desc=cu_name_to_desc[cu_selected].cudk_ds_desc.cudk_ds_command_description;
          desc.forEach(function(item){
            if(item.bc_alias == alias){
              //
              var cmdparam={};
              var params=item.bc_parameters;
              params.forEach(function(par){
                var parname=par.bc_parameter_name;
                if(parvalue==null){
                  parvalue=$("#"+alias+"_"+parname).val();
                  
                } 
                switch(par.bc_parameter_type){
                  case 0:
                  //bool
                  if(parvalue == "true"){
                    cmdparam[parname]=true;
                    
                  } else  if(parvalue == "false"){
                    cmdparam[parname]=true;
                  } else {
                    cmdparam[parname]=parseInt(parvalue);
                    
                  }                    
                  break;
                  case 1:
                    //integer
                    cmdparam[parname]=parseInt(parvalue);
                   break;
                  case 3:{
                    var d={};
                    d['$numberDouble']=parvalue.toString();
                    cmdparam[parname]=d;
                    }
                  
                }
                
              });
            jchaos.sendCUCmd(cu_selected,alias,cmdparam);
            
            }
            
          });
          
        }
        
      });
      var check_time_stamp_interval=setInterval(function(){
        if ($("div.cu-generic-control").is(':visible') == false) {
          clearInterval(check_time_stamp_interval);
          
        }          
        cu_live_selected.forEach(function(elem,index){
          if(elem.hasOwnProperty("health")){
            var name=encodeName(elem.health.ndk_uid);
            var diff =(elem.health.dpck_ats - health_time_stamp_old[elem.health.ndk_uid]);
            if(diff>0){
              $("#"+name).css('color', 'green');
              $("#"+name).find('td').css('color', 'green');
              
              off_line[elem.health.ndk_uid]=false;
              
            } else {
              $("#"+name).css('color', 'black');
              $("#"+name).find('td').css('color', 'black');
              off_line[elem.health.ndk_uid]=true;
              
            }
            health_time_stamp_old[elem.health.ndk_uid]=elem.health.dpck_ats;
          } else {
            if(elem.hasOwnProperty("output")&&elem.output.hasOwnProperty("ndk_uid")){
              var name=encodeName(elem.output.ndk_uid);
              $("#"+name).css('color', 'red');
              off_line[elem.output.ndk_uid]=true;
              
            }
            
          }

        });
      },7000);
    });
  };
})(jQuery);
