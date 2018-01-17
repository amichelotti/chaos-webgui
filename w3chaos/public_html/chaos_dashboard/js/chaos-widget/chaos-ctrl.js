
/**
 * jQuery chaos widget
 * @author: Andrea Michelotti <andrea.michelotti@lnf.infn.it>
 */
(function ($) {
  var selectedInterface = "";
  var snap_selected = "";
  var cu_selected = "";
  var cu_multi_selected = [];
  var options;
  var cu_live_selected = [{}];
  var cu_list = [];
  var cu_name_to_index = [];
  var cu_name_to_desc = [];
  var cu_name_to_saved = []; // cuname saved state if any
  var cu_list_interval; // update interval of the CU list
  var cu_list_check; // update interval for CU check live

  var health_time_stamp_old = [];
  var off_line = [];
  var curr_cu_selected = {};
  var last_index_selected = -1;
  var active_plots = [];
  var trace_selected;
  var trace_list = {};
  var high_graphs; // highchart graphs
  var graph_selected;
  var search_string;
  var notupdate_dataset=1;
  var implementation_map = { "powersupply": "SCPowerSupply", "scraper": "SCActuator" };

  function encodeCUPath(path) {
    if (path == null) {
      return "timestamp";
    }
    if (path.const) {
      return path.const;
    }
    return path.cu + "/" + path.dir + "/" + path.var;
  }

  function decodeCUPath(cupath) {
    var regex = /(.*)\/(.*)\/(.*)$/;
    var tmp;
    if ($.isNumeric(cupath)) {
      tmp = {
        cu: null,
        dir: null,
        var: null,
        const: Number(cupath)
      };
      return tmp;
    }
    var match = regex.exec(cupath);
    if (match != null) {
      tmp = {
        cu: match[1],
        dir: match[2],
        var: match[3],
        const: null
      };
    }
    return tmp;
  }
  function findImplementationName(type) {

    var ret = "uknown";
    if (type != null) {
      var r = type.lastIndexOf(":");
      var tmp = type.substring(r + 1);

      if (implementation_map[tmp] != null) {
        ret = implementation_map[tmp];
      } else if (tmp != null) {
        ret = tmp;
      }
    }
    return ret;

  }
  function retriveCurrentCmdArguments(alias) {
    var arglist = [];
    if (cu_selected != null && cu_name_to_desc[cu_selected].hasOwnProperty("cudk_ds_desc") && cu_name_to_desc[cu_selected].cudk_ds_desc.hasOwnProperty("cudk_ds_command_description")) {
      var desc = cu_name_to_desc[cu_selected].cudk_ds_desc.cudk_ds_command_description;
      desc.forEach(function (item) {
        if (item.bc_alias == alias) {
          var params = item.bc_parameters;
          if ((params == null) || (params.length == 0)) {
            return arglist;
          }
          params.forEach(function (par) {
            var arg = {};
            arg['name'] = par.bc_parameter_name;
            arg['desc'] = par.bc_parameter_description;
            arg['optional'] = (par.bc_parameter_flag == 0);
            arg['value'] = null;
            switch (par.bc_parameter_type) {
              case 0:
                arg['type'] = "bool";
                break;
              case 1:
                arg['type'] = "int32";
                break;
              case 2:
                arg['type'] = "int64";
                break;
              case 4:
                arg['type'] = "string";
                break;
              case 3:
                arg['type'] = "double";
                break;
              case 5:
                arg['type'] = "binary";
                break;

            }
            arglist.push(arg);
          });
        }
      });
    }
    return arglist;
  }
  // encode the arguments value as extended json
  // alias: command name
  // argument values arglist['name'] ...
  // return a filled argument list ready to be send
  function buildCmdParams(arglist) {
    var cmdparam = {};
    arglist.forEach(function (par) {
      var parname = par['name'];
      var parvalue = par['value'];
      var type = par['type'];
      if (parvalue != null) {
        switch (type) {
          case "bool":
            //bool
            if (parvalue == "true") {
              cmdparam[parname] = true;

            } else if (parvalue == "false") {
              cmdparam[parname] = true;
            } else {
              cmdparam[parname] = parseInt(parvalue);

            }
            break;
          case "int32":
            //integer
            cmdparam[parname] = parseInt(parvalue);
            break;
          case "double": {
            var d = {};
            if (typeof parvalue === 'string') {
              d['$numberDouble'] = parvalue;
            } else {
              d['$numberDouble'] = parvalue.toString();
            }
            cmdparam[parname] = d;
            break;
          }
          case "string": {
            cmdparam[parname] = parvalue;
            break;
          }
          case "int64": {
            var d = {};
            if (typeof parvalue === 'string') {
              d['$numberLong'] = parvalue;
            } else {
              d['$numberLong'] = parvalue.toString();
            }
            cmdparam[parname] = d;
            break;
          }

        }
      }
    });
    return cmdparam;
  }
  function cusWithInterface(culist, interface) {
    var retlist = [];
    culist.forEach(function (name) {
      var desc = jchaos.getDesc(name, null);
      cu_name_to_desc[name] = desc[0];

      if (desc[0].hasOwnProperty('instance_description') && desc[0].instance_description.hasOwnProperty("control_unit_implementation") && (desc[0].instance_description.control_unit_implementation.indexOf(interface) != -1)) {
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
    var dataset = cu_live_selected[cu_name_to_index[id]];
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


  function buildBody() {
    var html = '<div class="row-fluid">';

    html += '<div class="statbox purple" onTablet="span6" onDesktop="span2">';
    html += '<h3>Zones</h3>';
    html += '<select id="zones"></select>';
    html += '</div>';

    html += '<div class="statbox purple" onTablet="span6" onDesktop="span2">';
    html += '<h3>Elements</h3>';
    html += '<select id="elements"></select>';
    html += '</div>';

    html += '<div class="statbox purple" onTablet="span4" onDesktop="span2">'
    html += '<h3>Class</h3>';
    html += '<select id="classe"></select>';
    html += '</div>';

    html += '<div class="statbox purple row-fluid" onTablet="span4" onDesktop="span3">'
    html += '<div class="span3">'
    html += '<label for="search-alive">Search All</label><input class="input-xlarge" id="search-alive-false" title="Search Alive and not Alive nodes" name="search-alive" type="radio" value=false>';
    html += '</div>'
    html += '<div class="span3">'
    html += '<label for="search-alive">Search Alive</label><input class="input-xlarge" id="search-alive-true" title="Search just alive nodes" name="search-alive" type="radio" value=true>';
    html += '</div>'
   // html += '<h3 class="span3">Search</h3>';

    html += '<input class="input-xlarge focused span6" id="search-chaos" title="Free form Search" type="text" value="">';
    html += '</div>';
    html += generateActionBox();
    html += '</div>';

    return html;
  }
  function element_sel(field, arr, add_all) {
    $(field).empty();
    $(field).append("<option>--Select--</option>");
    //$(field).append("<option value='ALL'>ALL</option>");

    if (add_all == 1) {
      $(field).append("<option value='ALL'>ALL</option>");

    }
    $(arr).each(function (i) {
      $(field).append("<option value='" + arr[i] + "'>" + arr[i] + "</option>");

    });

  }

  function logSetup() {
    $("a.show_log").click(function () {
      updateLog(cu_selected);
      //$("#mdl-log").modal("show");
    });
    $("#log-search-go").click(function () {
      var sel = $("#log_search").val();
      updateLog(sel);
      //$("#mdl-log").modal("show");
    });
    $("#log-close").click(function () {
      $("#mdl-log").modal("hide");

    });
  }
  function snapSetup() {
    $("#snap-save").on('click', function () {
      var value = $("#snap_save_name").val();
      if (cu_multi_selected.length > 1) {
        jchaos.snapshot(value, "create", cu_multi_selected, function () {
        });

      } else {
        jchaos.snapshot(value, "create", cu_selected, function () {
          updateSnapshotTable(cu);

        });
      }
      //var snap_table = $(this).find('a.show_snapshot');
    });

    $("#snap-close").on('click', function () {
      $("#mdl-snap").modal("hide");
      cu_name_to_saved = [];
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
        var dataset = jchaos.snapshot(snap_selected, "load", null, "", null);
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
        jchaos.snapshot(snap_selected, "restore", "", "", null);
      }
    });

  }


  /**
   * Setup CU Description
   */

  function descriptionSetup() {
    $("#description-close").on('click', function () {
      $("#mdl-description").modal("hide");
    });

    $("a.show_description").click(function () {
      var dataset = jchaos.getDesc(cu_selected, null);
      var jsonhtml = json2html(dataset, options, cu_selected);
      if (isCollapsable(dataset)) {
        jsonhtml = '<a href class="json-toggle"></a>' + jsonhtml;
      }
      $("#desc_text").html("Description of " + cu_selected);      
      $("#cu-description").html(jsonhtml);
    });

  }
  /***
   * Setup CU Dataset
   * **/

  function datasetSetup() {
    $("a.show_dataset").on('click', function () {
      var dataset = jchaos.getChannel(cu_selected, -1, null);
      var jsonhtml = json2html(dataset[0], options, cu_selected);
      if (isCollapsable(dataset[0])) {
        jsonhtml = '<a href class="json-toggle"></a>' + jsonhtml;
      }

      $("#cu-dataset").html(jsonhtml);
      $(".json-key").draggable(
        {

          cursor: 'move',
          helper: 'clone',
          containment: 'window'
        }
      );
      $("#X-axis").droppable({
        drop: function (e, ui) {
          var draggable = ui.draggable;
          alert('Something X "' + draggable.attr('id') + '" was dropped onto me!');
        }
      });

      $("#Y-axis").droppable({
        drop: function (e, ui) {
          var draggable = ui.draggable;
          alert('Something Y "' + draggable.attr('id') + '" was dropped onto me!');

        }
      });
      $.contextMenu({
        selector: '.json-key',
        build: function ($trigger, e) {
          var cuitem = {};
          var portdir = $(e.currentTarget).attr("portdir");
          var portname = $(e.currentTarget).attr("portname");
          cuitem['show-graph'] = { name: "Show Graphs.." };
          cuitem['plot-x'] = { name: "Plot " + portdir + "/" + portname + " on X" };
          cuitem['plot-y'] = { name: "Plot " + portdir + "/" + portname + " on Y" };



          cuitem['sep1'] = "---------";

          cuitem['quit'] = {
            name: "Quit", icon: function () {
              return 'context-menu-icon context-menu-icon-quit';
            }
          };

          return {

            callback: function (cmd, options) {
              if (cmd == "show-graph") {

                $("#mdl-graph-list").modal("show");
              } else if (cmd == "plot-x") {
                $("#mdl-graph").modal("show");

                var fullname = cu_selected + "/" + portdir + "/" + portname;
                $("#trace-name").val(cu_selected);
                $("#xvar").val(fullname);
              } else if (cmd == "plot-y") {
                $("#mdl-graph").modal("show");
                $("#trace-name").val(cu_selected);
                var fullname = cu_selected + "/" + portdir + "/" + portname;
                $("#yvar").val(fullname);

              }
            },
            items: cuitem
          }
        }


      });
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
  }


  /**
   * 
   * JSON SETUP
   */

  function jsonSetup() {
    var collapsed = options.collapsed;
    
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

  }
  /*
  * 
  * Setup Graphs
  */
  function graphSetup() {
    $("#mdl-graph").draggable();
    $("#mdl-graph-list").draggable();
    $('#mdl-graph-list').on('shown.bs.modal', function () {
      graph_selected = null;
    });

    $('#mdl-graph').on('shown.bs.modal', function () {
      var $radio = $("input:radio[name=graph-shift]");
      if ($radio.is(":checked") === false) {
        $radio.filter("[value=false]").prop('checked', true);
      }
      if (($("#trace-name").val() != "") && (($("#xvar").val() != "") || ($("#yvar").val() != ""))) {
        $("#trace-add").attr('title', "Add Trace");
        $("#trace-add").removeAttr('disabled');
      } else {
        $("#trace-add").attr('title', "You must specify a valid trace name and at least a X/Y path");
        $("#trace-add").attr('disabled', true);

      }
      if (($("#xvar").val() == "") && ($("#xtype:selected").val() == "datetime")) {
        $("#xvar").val("timestamp")
      }
      if (($("#yvar").val() == "") && ($("#ytype:selected").val() == "datetime")) {
        $("#yvar").val("timestamp")
      }

      if ((graph_selected != null) && (high_graphs[graph_selected] != null)) {
        // initialize with the value of selected graph
        var info = high_graphs[graph_selected].highchart_opt;
        $("#graph_save_name").val(graph_selected);
        $("#xname").val(info.xAxis.title.text);
        $("#xtype").val(info.xAxis.type);
        $("#xmax").val(info.xAxis.max);
        $("#xmin").val(info.xAxis.min);
        $("#xname").val(info.yAxis.title.text);

        $("#ytype").val(info.yAxis.type);

        $("#ymax").val(info.yAxis.max);
        $("#ymin").val(info.yAxis.min);
        $("#graph-width").val(high_graphs[graph_selected].width);
        $("#graph-high").val(high_graphs[graph_selected].height);
        $("#graph-update").val();
        $("#graph-keepseconds").val(info.timebuffer);
        if (info.shift) {
          $radio.filter("[value=true]").prop('checked', true);

        } else {
          $radio.filter("[value=false]").prop('checked', true);

        }

        $("#trace-type").val(info.tracetype);
        $("#graphtype").val(graph_selected);
        $("#table_graph_items").find("tr:gt(0)").remove();
        var trace = high_graphs[graph_selected].trace;
        for (var k in trace) {
          var tname = encodeName(k);
          var xpath, ypath;
          xpath = encodeCUPath(trace[k].x);
          ypath = encodeCUPath(trace[k].y);
          $("#table_graph_items").append('<tr class="row_element" id="trace-' + tname + '"><td>' + k + '</td><td>' + xpath + '</td><td>' + ypath + '</td></tr>');

        };
      }
      $("#table_graph_items tbody tr").click(function (e) {
        $(".row_element").removeClass("row_snap_selected");
        $(this).addClass("row_snap_selected");
        trace_selected = $(this).attr("id");
      }
      );
    });
    $("#mdl-graph").css('width', 800);
    $("#mdl-graph-list").css('width', 800);

    $("#graph-save").attr('disabled', true);
    $("#graph-run").attr('disabled', true);

    $("#graph-close").on('click', function () {
      $("#mdl-graph").modal("hide");

    });
    $("xtype").on("change", function () {
      if ($("#xtype:selected").val() == "datetime") {
        $("#xvar").val("timestamp");
      }
    });
    $("ytype").on("change", function () {
      if ($("#ytype:selected").val() == "datetime") {
        $("#yvar").val("timestamp");
      }
    });
    $("#graph-list-close").on('click', function () {
      $("#mdl-graph-list").modal("hide");

    });

    $("#graph-save").on('click', function () {
      saveGraph();
      $("#graph-run").removeAttr('disabled');
    });

    $("#graph-run").on('click', function () {

      runGraph($("#graph_save_name").val());
      $("#mdl-graph").modal("hide");

    });

    $("#graph-list-run").on('click', function () {
      runGraph(graph_selected);
      $("#mdl-graph-list").modal("hide");

    });
    $("#graph-list-edit").on('click', function () {
      if (graph_selected != null) {
        $("#mdl-graph-list").modal("hide");
        $("#mdl-graph").modal("show");
      }
    });
    $("#graph-delete").on('click', function () {
      delete high_graphs[graph_selected];
      jchaos.variable("highcharts", "set", high_graphs, null);
      updateGraph();
    });




    $("#graph_save_name").on("keypress", function () {
      if ($("#graph_save_name").val() != "") {
        var rowCount = $('#table_graph_items tr').length;
        if (rowCount > 1) {
          $("#graph-save").removeAttr('disabled');
          $("#graph-save").attr('title', "Save current Trace");

        } else {
          $("#graph-save").attr('disabled', true);
          $("#graph-save").attr('title', "At least one trace must be present ");
        }

      } else {
        $("#graph-save").attr('title', "Must specify a valid Graph name");
        $("#graph-save").attr('disabled', true);

      }
    });
    $("#trace-add").click(function () {
      var tracename = $("#trace-name").val();
      var xpath = $("#xvar").val();
      var ypath = $("#yvar").val();
      var tmpx, tmpy;
      if (xpath == "") {
        xpath = "timestamp";
      } else {
        tmpx = decodeCUPath(xpath);
      }
      if (ypath == "") {
        ypath = "timestamp";
      } else {
        tmpy = decodeCUPath(ypath);
      }
      var tname = encodeName(tracename);
      $("#table_graph_items").append('<tr class="row_element" id="trace-' + tname + '"><td>' + tracename + '</td><td>' + xpath + '</td><td>' + ypath + '</td></tr>');
      if (tmpx == null && tmpy == null) {
        alert("INVALID scale type options");
      }
      trace_list[tracename] = {
        x: tmpx,
        y: tmpy
      }

    });



    $("#trace-rem").click(function () {
      if (trace_selected != null) {
        $("#" + trace_selected).remove();
      }
    });

    $("a.show_graph").on('click', function () {
      updateGraph();
      //$("#mdl-log").modal("show");
    });
  }
  /****
   * 
   * Setup CU Interface
   * 
  */
  // the interface has all the main elements
  function setupCU() {
    $("#main_table_cu tbody tr").click(function (e) {
      mainTableCommonHandling("main_table_cu", e);
    });
    n = $('#main_table_cu tr').size();
    if (n > 22) {     /***Attivo lo scroll della tabella se ci sono più di 22 elementi ***/
      $("#table-scroll").css('height', '280px');
    } else {
      $("#table-scroll").css('height', '');
    }

    $(this).off('keypress');
    $(this).on('keypress', function (event) {
      var t = $(event.target);

      if ((event.which == 13) && (t.attr('class') == "setSchedule")) {
        //  var name = $(t).attr("cuname");
        var value = $(t).attr("value");
        jchaos.setSched(cu_selected, value);

      }
    });
    $(".cucmd").click(function () {
      var alias = $(this).attr("cucmdid");
      var parvalue = $(this).attr("cucmdvalue");
      var arglist = retriveCurrentCmdArguments(alias);
      var cuselection;
      var cmdparam = {};
      var arguments = {};
      arglist.forEach(function (item, index) {
        // search for values
        if (parvalue == null) {
          parvalue = $("#" + alias + "_" + item['name']).val();
        }
        if ((parvalue == null) && (item['optional'] == false)) {
          alert("argument '" + item['name'] + "' is required in command:'" + alias + "'");
          return;
        }

        item['value'] = parvalue;
      });

      cmdparam = buildCmdParams(arglist);
      if (cu_multi_selected.length > 0) {
        cuselection = cu_multi_selected;
      } else {
        cuselection = cu_selected;
      }
      jchaos.sendCUCmd(cuselection, alias, cmdparam);

    });

    $(".cucmdbase").click(function () {
      var cmd = $(this).attr("cucmdid");
      var cuselection;
      if (cu_multi_selected.length > 0) {
        cuselection = cu_multi_selected;
      } else {
        cuselection = cu_selected;
      }
      if (cuselection != null && cmd != null) {
        if (cmd == "bypasson") {
          jchaos.setBypass(cuselection, true, null);
          return;
        }
        if (cmd == "bypassoff") {
          jchaos.setBypass(cuselection, false, null);
          return;
        }
        if (cmd == "load") {
          jchaos.loadUnload(cuselection, true, null);
          return;
        }
        if (cmd == "unload") {
          jchaos.loadUnload(cuselection, false, null);
          return;
        }

        jchaos.sendCUCmd(cuselection, cmd, "", null);

      }
    });
    $("#mdl-dataset").draggable();
    $("#mdl-description").draggable();
    $("#mdl-snap").draggable();
    $("#mdl-log").draggable();


  }
  function buildCUInterface(cuids, cutype) {
    if(cuids == null){
      alert("NO CU given!");
      return;
    }
    if (!(cuids instanceof Array)) {
      cu_list = [cuids];
    } else {
      cu_list = cuids;
    }
    if (cutype == null) {
      cutype = "generic";
    }

    if ((cutype != "generic") && (cutype != "all") && (cutype != "ALL")) {
      cu_list = cusWithInterface(cu_list, cutype);
    }

    cu_list.forEach(function (elem, id) {
      cu_name_to_index[elem] = id;
      health_time_stamp_old[elem] = 0;
      off_line[elem] = false;
    });
    // cu_selected = cu_list[0];
    cu_selected = null;
    var htmlt, htmlc, htmlg;
    var updateTableFn = new Function;
    /*****
     * 
     * clear all interval interrupts
     */
    /**
     * fixed part
     */

    if ((cutype.indexOf("SCPowerSupply") != -1)) {
      htmlt = generatePStable(cu_list);
      htmlc = generatePSCmd();
      updateTableFn=updatePStable;

    } else if ((cutype.indexOf("SCActuator") != -1)) {
      htmlt = generateScraperTable(cu_list);
      htmlc = generateScraperCmd();
      updateTableFn=updateScraperTable;
      
    } else {
      htmlt = generateGenericTable(cu_list);
      htmlc = generateGenericControl();
      updateTableFn=updateGenericControl;
    }

    $("div.specific-table").html(htmlt);
    $("div.specific-control").html(htmlc);
    setupCU();

    if (cu_list_interval != null) {
      clearInterval(cu_list_interval);

    }
    cu_list_interval = setInterval(function () {
      cu_live_selected = jchaos.getChannel(cu_list, -1, null);



      // update all generic
      updateGenericTableDataset(cu_live_selected);
      updateTableFn(cu_live_selected);
      
      if (cu_live_selected.length == 0 || cu_selected == null || cu_name_to_index[cu_selected] == null) {
        return;
      }

      var index = cu_name_to_index[cu_selected];
      curr_cu_selected = cu_live_selected[index];
      updateGenericControl(curr_cu_selected);
      //  $("div.cu-generic-control").html(chaosGenericControl(cu_live_selected[index]));
      if ($("#cu-dataset").is(':visible') && !notupdate_dataset) {
        var jsonhtml = json2html(curr_cu_selected, options, cu_selected);
        if (isCollapsable(curr_cu_selected)) {
          jsonhtml = '<a href class="json-toggle"></a>' + jsonhtml;
        }

        $("#cu-dataset").html(jsonhtml);

      }




    }, options.Interval,updateTableFn);

    if (cu_list_check != null) {
      clearInterval(cu_list_check)
    }
    cu_list_check = setInterval(function () {
      cu_live_selected.forEach(function (elem, index) {
        if (elem.hasOwnProperty("health")) {
          var name = encodeName(elem.health.ndk_uid);
          var diff = (elem.health.dpck_ats - health_time_stamp_old[elem.health.ndk_uid]);
          if (diff > 0) {
            $("#" + name).css('color', 'green');
            $("#" + name).find('td').css('color', 'green');

            off_line[elem.health.ndk_uid] = false;

          } else {
            $("#" + name).css('color', 'black');
            $("#" + name).find('td').css('color', 'black');
            off_line[elem.health.ndk_uid] = true;

          }
          health_time_stamp_old[elem.health.ndk_uid] = elem.health.dpck_ats;
        } else {
          var id = cu_list[index];
          var name = encodeName(id);
          $("#" + name).css('color', 'red');
          off_line[id] = true;

        }

      });
    }, 7000);

  }

  function mainCU() {
    var list_cu;
    var classe=["powersupply","scraper"];
    var $radio = $("input:radio[name=search-alive]");
    if ($radio.is(":checked") === false) {
      $radio.filter("[value=true]").prop('checked', true);
    }
    jchaos.search("", "zone", true, function (zones) {
      element_sel('#zones', zones, 1);
    });
    
    element_sel('#classe',classe,1);
    $("#zones").change(function () {
      var zone_selected;
      zone_selected = $("#zones option:selected").val();
      search_string=zone_selected;
      if (zone_selected == "--Select--") {        //Disabilito la select dei magneti se non � selezionata la zona
        $("#elements").attr('disabled', 'disabled');
      } else {
        $("#elements").removeAttr('disabled');
      }
      if (zone_selected == "ALL") {
        search_string="";
        var alive=$("[input=search-alive]:checked").val()
        jchaos.search(search_string, "class", (alive=="true"), function (ll) {
          element_sel('#elements', ll, 1);
        });

      } else {
        jchaos.search(zone_selected, "class", true, function (ll) {
          element_sel('#elements', ll, 1);
        });
      }
      $("#search-chaos").val(search_string);
      
    });

    $("#elements").change(function () {
      var element_selected = $("#elements option:selected").val();
      var zone_selected = $("#zones option:selected").val();
      search_string="";
      if ((zone_selected != "ALL") && (zone_selected != "--Select--")) {
        search_string = zone_selected;
      }
      if ((element_selected != "ALL") && (cu_selected != "--Select--")) {
        search_string += "/" + element_selected;
      }


      if (element_selected == "--Select--" || zone_selected == "--Select--") {
        $(".btn-main-function").hasClass("disabled");

      } else {
        $(".btn-main-function").removeClass("disabled");

      }
      $("#search-chaos").val(search_string);
      var alive=$("input[type=radio][name=search-alive]:checked").val()
      
      list_cu = jchaos.search(search_string, "cu", (alive=="true"), false);
      var interface = $("#classe option:selected").val();

      buildCUInterface(list_cu, implementation_map[interface]);

    });
    $("#classe").change(function () {
      var interface = $("#classe option:selected").val();
      var alive=$("input[type=radio][name=search-alive]:checked").val()
      
      list_cu = jchaos.search(search_string, "cu", (alive=="true"), false);
      
      buildCUInterface(list_cu, implementation_map[interface]);

    });
    $("#search-chaos").keypress(function (e) {
      if (e.keyCode == 13) {
        var interface = $("#classe option:selected").val();
        search_string=$(this).val();
        var alive=$("input[type=radio][name=search-alive]:checked").val()
        
        list_cu = jchaos.search(search_string, "cu", (alive=="true"), false);
        buildCUInterface(list_cu, implementation_map[interface]);
        
      }
      //var tt =prompt('type value');
    });

    $("input[type=radio][name=search-alive]").change(function(e){
      var alive=$("input[type=radio][name=search-alive]:checked").val()
      list_cu = jchaos.search(search_string, "cu", (alive=="true"), false);
      var interface = $("#classe option:selected").val();
      
      buildCUInterface(list_cu, implementation_map[interface]);
    });


  }
  /******************
   * MAIN TABLE HANDLING
   * 
   */
  function mainTableCommonHandling(id, e) {
    $(".row_element").removeClass("row_snap_selected");
    $("#mdl-commands").modal("hide");
    $("#cu_full_commands").empty();
    if (cu_selected == $(e.currentTarget).attr("cuname")) {
      cu_selected = null;
      return;
    }
    $(e.currentTarget).addClass("row_snap_selected");

    cu_selected = $(e.currentTarget).attr("cuname");
    cu_multi_selected = [];


    /******** Build Context menu *****/



    $.contextMenu({
      selector: '.cuMenu',
      build: function ($trigger, e) {
        var cuname = $(e.currentTarget).attr("cuname");
        var cindex = cu_name_to_index[cuname];
        var cuitem = updateCUMenu(cu_live_selected[cindex]);
        cuitem['sep1'] = "---------";

        cuitem['quit'] = {
          name: "Quit", icon: function () {
            return 'context-menu-icon context-menu-icon-quit';
          }
        };

        return {

          callback: function (cmd, options) {
            if (cmd == "load") {
              jchaos.loadUnload(cu_selected, true, null);
              return;
            }
            if (cmd == "unload") {
              jchaos.loadUnload(cu_selected, false, null);
              return;
            }

            jchaos.sendCUCmd(cu_selected, cmd, "", null);
          },
          items: cuitem
        }
      }


    });
    /***********************/
    /**
     * handling commands
     */
    if (cu_name_to_desc[cu_selected] == null) {
      var desc = jchaos.getDesc(cu_selected, null);
      cu_name_to_desc[cu_selected] = desc[0];
    }
    if (cu_selected != null && cu_name_to_desc[cu_selected].hasOwnProperty("cudk_ds_desc") && cu_name_to_desc[cu_selected].cudk_ds_desc.hasOwnProperty("cudk_ds_command_description")) {
      var desc = cu_name_to_desc[cu_selected].cudk_ds_desc.cudk_ds_command_description;
      $("#cu_full_commands").add("<option>--Select--</option>");

      desc.forEach(function (item) {
        $("#cu_full_commands").append("<option value='" + item.bc_alias + "'>" + item.bc_alias + " (\"" + item.bc_description + "\")</option>");
      });

      $("#cu_full_commands").change(function (e) {
        //show the command
        var cmdselected = $("#cu_full_commands option:selected").val();
        var arguments = retriveCurrentCmdArguments(cmdselected);
        var input_type = "number";
        if (arguments.length == 0) {
          $("#list_command_argument").html("Command \"" + cmdselected + "\" NO ARGUMENTS");
        } else {
          $("#list_command_argument").html("Command \"" + cmdselected + "\"");
        }
        $("#commands_argument_table").find("tr:gt(0)").remove();
        arguments.forEach(function (item) {
          if (item['type'] == "string") {
            input_type = "text";
          }
          if (item["optional"]) {
            $('#commands_argument_table').append('<tr class="row_element" ><td>' + item["name"] + '</td><td>' + item["desc"] + '</td><td>' + item["type"] + '</td><td><input class="input focused" id="' + cmdselected + '_' + item["name"] + '" type="' + input_type + '"></td></tr>');
          } else {
            $('#commands_argument_table').append('<tr class="row_element" ><td><b>' + item["name"] + '</b></td><td>' + item["desc"] + '</td><td>' + item["type"] + '</td><td><input class="input focused" id="' + cmdselected + '_' + item["name"] + '" type="' + input_type + '"></td></tr>');
          }

        });
        $("#mdl-commands").draggable();

        $("#mdl-commands").modal("show");
      });

    }
    $("#command-close").click(function () {
      $("#mdl-commands").modal("hide");

    });

    $("#command-send").click(function () {
      var cuselection;
      var cmdselected = $("#cu_full_commands option:selected").val();
      var arguments = retriveCurrentCmdArguments(cmdselected);
      arguments.forEach(function (item, index) {
        var value = $("#" + cmdselected + "_" + item["name"]).val();
        if ((value == null || value == "") && (item["optional"] == false)) {
          alert("argument '" + item['name'] + "' is required in command:'" + cmdselected + "'");
          return;
        }
        item['value'] = value;
      });
      var parm = buildCmdParams(arguments);
      if (cu_multi_selected.length > 0) {
        cuselection = cu_multi_selected;
      } else {
        cuselection = cu_selected;
      }
      jchaos.sendCUCmd(cuselection, cmdselected, parm);
    });

    if (e.shiftKey) {
      var nrows = $(e.currentTarget).index();
      if (last_index_selected != -1) {
        //alert("selected shift:"+nrows+" interval:"+(nrows-last_index_selected));
        if (nrows > last_index_selected) {
          //$('#main_table_cu tr:gt('+(last_index_selected)+'):lt('+(nrows)+')').addClass("row_snap_selected");
          $("#" + id + " tr").slice(last_index_selected + 1, nrows + 1).addClass("row_snap_selected");
          for (var cnt = last_index_selected; cnt <= nrows; cnt++) {
            cu_multi_selected.push(cu_list[cnt]);

          }

        }
      }
    }
    last_index_selected = $(e.currentTarget).index();

  }
  /********************* */
  function generateGenericTable(cu) {
    var html = '<div class="row-fluid" id="table-space">';
    html += '<div class="box span12">';
    html += '<div class="box-content span12">';
    if (cu.length == 0) {
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
      html += "<tr class='row_element cuMenu' cuname='" + cu[i] + "' id='" + cuname + "'>";
      html += "<td class='name_element'>" + cu[i] + "</td>";
      html += "<td id='" + cuname + "_health_status'></td>";
      html += "<td id='" + cuname + "_output_busy'></td>";
      html += "<td title='Bypass Mode' id='" + cuname + "_system_bypass'></td>";
      html += "<td id='" + cuname + "_health_timestamp'></td>";
      html += "<td id='" + cuname + "_health_uptime'></td>";
      html += "<td id='" + cuname + "_health_systemtime'></td>";
      html += "<td id='" + cuname + "_health_usertime'></td>";
      html += "<td id='" + cuname + "_system_command'></td>";
      html += "<td title='Device alarms' id='" + cuname + "_output_device_alarm'></td>";
      html += "<td title='Control Unit alarms' id='" + cuname + "_output_cu_alarm'></td>";
      html += "<td id='" + cuname + "_health_prate'></td></tr>";
    });

    html += '</table>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    return html;
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
        el.tmStamp = Number(el.health.dpck_ats);

        el.tmUtm = toHHMMSS(el.health.nh_upt);
        status = el.health.nh_status;
        $("#" + name_id + "_health_uptime").html(el.tmUtm);
        $("#" + name_id + "_health_timestamp").html(new Date(el.tmStamp).toUTCString());
        $("#" + name_id + "_health_usertime").html(el.usrTime);
        $("#" + name_id + "_health_systemtime").html(el.systTime);
        $("#" + name_id + "_health_prate").html(Number(el.health.cuh_dso_prate).toFixed(3));
        if ((off_line[name_device_db] == true) && (status != "Unload")) {
          status = "Dead";
        }

        if (status == 'Start') {
          $("#" + name_id + "_health_status").html('<i class="material-icons verde">play_arrow</i>');

        } else if (status == 'Stop') {
          $("#" + name_id + "_health_status").html('<i class="material-icons arancione">stop</i>');
        } else if (status == 'Init') {
          $("#" + name_id + "_health_status").html('<i class="material-icons giallo">trending_up</i>');

        } else if (status == 'Deinit') {
          $("#" + name_id + "_health_status").html('<i class="material-icons rosso">trending_down</i>');

        } else if (status == 'Fatal Error' || status == 'Recoverable Error') {
          //$("#status_" + name_id).html('<a id="fatalError_' + name_id + '" href="#mdl-fatal-error" role="button" data-toggle="modal" onclick="return show_fatal_error(this.id);"><i style="cursor:pointer;" class="material-icons rosso">error</i></a>');
          $("#" + name_id + "_health_status").html('<a id="Error-' + name_id + '" href="#mdl-fatal-error" role="button" data-toggle="modal" ><i style="cursor:pointer;" class="material-icons rosso">cancel</i></a>');

          $("Error-" + name_id).on("click", function () {
            $("#name-FE-device").html(el.health.ndk_uid);
            $("#status_message").html(status);

            $("#error_message").html(el.health.nh_lem);
            $("#error_domain").html(el.health.nh_led);
          });
        } else if (status == "Unload") {
          $("#" + name_id + "_health_status").html('<i class="material-icons rosso">power</i>');


        } else if (status == "Load") {
          $("#" + name_id + "_health_status").html('<i class="material-icons verde">power</i>');

        } else {
          $("#" + name_id + "_health_status").html('<i class="material-icons red">block</i>');

        }
      }
      $("#" + name_id + "_health_status").attr('title', "Device status:" + status);
      if (el.hasOwnProperty('system') && (status != "Dead")) {   //if el system
        $("#" + name_id + "_system_command").html(el.system.dp_sys_que_cmd);


        if (el.system.cudk_bypass_state == false) {
          $("#" + name_id + "_system_bypass").html('<i id="td_bypass_' + name_id + '" class="material-icons verde">usb</i>');
          $("#" + name_id + "_system_bypass").attr('title', "Bypass disabled")

        } else {
          $("#" + name_id + "_system_bypass").attr('title', "Bypass enabled")

          $("#" + name_id + "_system_bypass").html('<i id="td_bypass_' + name_id + '" class="material-icons yellow">cached</i>');
        }
      }
      if (el.hasOwnProperty('output')) {   //if el output
        var busy = $.trim(el.output.busy);
        var dev_alarm = $.trim(el.output.device_alarm);
        var cu_alarm = $.trim(el.output.cu_alarm);
        if (dev_alarm == 1) {
          $("#" + name_id + "_output_device_alarm").attr('title', "Device Warning");
          $("#" + name_id + "_output_device_alarm").html('<a id="device-alarm-butt-' + name_id + '" cuname="' + name_device_db + '" class="device-alarm" href="#mdl-device-alarm-cu" role="button" data-toggle="modal" ><i class="material-icons giallo">error</i></a>');
        } else if (dev_alarm == 2) {
          $("#" + name_id + "_output_device_alarm").attr('title', "Device Error");
          $("#" + name_id + "_output_device_alarm").html('<a id="device-alarm-butt-' + name_id + '" cuname="' + name_device_db + '" class="device-alarm" href="#mdl-device-alarm-cu" role="button" data-toggle="modal" ><i class="material-icons rosso">error</i></a>');
        } else {
          $("#" + name_id + "_output_device_alarm").html('');
        }

        if (cu_alarm == 1) {
          $("#" + name_id + "_output_cu_alarm").attr('title', "Control Unit Warning");

          $("#" + name_id + "_output_cu_alarm").html('<a id="cu-alarm-butt-' + name_id + '" cuname="' + name_device_db + '" class="cu-alarm" href="#mdl-device-alarm-cu" role="button" data-toggle="modal" ><i class="material-icons giallo">error_outline</i></a>');
        } else if (cu_alarm == 2) {
          $("#" + name_id + "_output_cu_alarm").attr('title', "Control Unit Error");

          $("#" + name_id + "_output_cu_alarm").html('<a id="cu-alarm-butt-' + name_id + '" cuname="' + name_device_db + '" class="cu-alarm" href="#mdl-device-alarm-cu" role="button" data-toggle="modal"><i  class="material-icons rosso">error_outline</i></a>');
        } else {
          $("#" + name_id + "_output_cu_alarm").html('');
        }
        $("a.device-alarm").click(function (e) {
          var id = $(this).attr("cuname");
          show_dev_alarm(id);
        });
        $("a.cu-alarm").click(function (e) {
          var id = $(this).attr("cuname");

          show_cu_alarm(id);
        });

        if (busy == 'true') {
          $("#" + name_id + "_output_busy").attr('title', "The device is busy command in queue:" + el.system.dp_sys_que_cmd);
          if (el.output.dpck_seq_id & 1) {
            $("#" + name_id + "_output_busy").html('<i id="busy_' + name_id + '" class="material-icons verde">hourglass_empty</i>');
          } else {
            $("#" + name_id + "_output_busy").html('<i id="busy_' + name_id + '" class="material-icons verde">hourglass_full</i>');
          }
        } else {
          $("#" + name_id + "_output_busy").html('');
        }
      }
    });
  }

  function generateScraperTable(cu) {
    var html = '<div class="row-fluid">';
    html += '<div class="box span12">';
    html += '<div class="box-content">';
    html += '<table class="table table-bordered" id="main_table_cu">';
    html += '<thead class="box-header">';
    html += '<tr>';
    html += '<th>Element</th>';
    html += '<th>Position [mm]</th>';
    html += '<th>Setting [mm]</th>';
    html += '<th colspan="2">Saved [mm]</th>';
    html += '<th colspan="5">Out In !</th>';
    html += '</tr>';
    html += '</thead>';


    $(cu).each(function (i) {
      var cuname = encodeName(cu[i]);
      html += "<tr class='row_element' cuname='" + cu[i] + "' id='" + cuname + "'><td class='name_element'>" + cu[i]
        + "</td><td class='position_element' id='" + cuname + "_output_position'></td><td class='position_element' id='" + cuname
        + "_input_position'></td><td id='" + cuname + "_input_saved_position'></td><td id='" + cuname + "_input_saved_status'></td><td id='" + cuname + "_output_status'></td><td id='" + cuname
        + "_in'></td><td id='" + cuname + "_out'></td><td  title='Device alarms' id='" + cuname + "_output_device_alarm'></td><td title='Control Unit alarms' id='" + cuname + "_cu_alarm'></td></tr>";
    });

    html += '</table>';
    html += '</div>';
    html += '</div>';

    html += '</div>';

    return html;
  }

  function updateScraperTable(cu) {
    cu.forEach(function (elem) {
      if (elem.hasOwnProperty('health')) {   //if el health

        var cuname = encodeName(elem.health.ndk_uid);

        $("#" + cuname + "_output_position").html(elem.output.position.toFixed(3));
        $("#" + cuname + "_input_position").html(elem.input.position);
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


        if (elem.output.powerOn == true) {
          $("#" + cuname + "_output_status").html('<i class="material-icons verde">trending_down</i>');
        } else if (elem.output.powerOn = false) {
          $("#" + cuname + "_output_status").html('<i class="material-icons rosso">pause_circle_outline</i>');

        }
        if (elem.output.NegativeLimitSwitchActive == 'true') {
          $("#" + cuname + "_out").html('<i id="out_icon_' + cuname + '" class="icon-caret-left verde"></i>');
        } else if (out_neg_col[i] == 'false') {
          $("#" + cuname + "_out").remove();
        }


        if (elem.output.PositiveLimitSwitchActive == 'true') {
          $("#" + cuname + "_in").html('<i id="in_icon_' + cuname + '" class="icon-caret-right verde"></i>');
        } else if (in_pos_col[i] == 'false') {
          $("#" + cuname + "_in").remove();
        }




        if (elem.output.local == true) {
          $("#" + cuname + "_output_local").html('<i class="material-icons rosso">vpn_key</i>');
        } else if (elem.output.local == false) {
          $("#" + cuname + "_output_local").remove();
        }
      }
    });



  }
  function generateScraperCmd() {
    var html = '<div class="row-fluid">';
    html += '<div class="box span12 box-cmd">';
    html += '<div class="box-header green">';
    html += '<h3 id="h3-cmd">Commands</h3>';
    html += '</div>';
    html += '<div class="box-content">';
    html += '<a class="quick-button-small span1 btn-cmd cucmd" id="scraper_standby" cucmdid="poweron" cucmdvalue=0>';
    html += '<i class="material-icons rosso">pause_circle_outline</i>';
    html += '<p class="name-cmd">Stanby</p>';
    html += '</a>';
    html += '<a class="quick-button-small span1 btn-cmd cucmd" id="scraper_oper"  cucmdid="poweron" cucmdvalue=1>';
    html += '<i class="material-icons verde">trending_down</i>';
    html += '<p class="name-cmd">Oper</p>';
    html += '</a>';
    html += '<a class="quick-button-small span1 btn-cmd cucmd" id="scraper_reset" cucmdid="rset" cucmdvalue=1>';
    html += '<i class="material-icons rosso">error</i>';
    html += '<p class="name-cmd">Reset</p>';
    html += '</a>';
    html += '<div class="span3 offset1" onTablet="span6" onDesktop="span3" id="input-value">';
    html += '<input class="input focused" id="mov_abs_offset_mm" type="number" value="[mm]">';
    html += '</div>';
    html += '<a class="quick-button-small span1 btn-value cucmd" id="scraper_setPosition" cucmdid="mov_abs">';
    html += '<p>Apply</p>';
    html += '</a>';

    html += '<a class="quick-button-small span1 btn-value cucmd" id="scraper_setStop" cucmdid="stopMotion">';
    html += '<p>Stop</p>';
    html += '</a>';
    html += '<div class="span12 statbox" onTablet="span12" onDesktop="span12" id="box-cmd-due">';
    html += '<a class="quick-button-small span1 btn-cmd offset2 cucmd" id="scraper_in" cucmdid="mov_rel">';
    html += '<i class="icon-angle-left"></i>';
    html += '<p class="name-cmd">In</p>';
    html += '</a>';
    html += '<div class="span3" onTablet="span6" onDesktop="span3" id="input-value-due">';
    html += '<input class="input focused" id="mov_rel_offset_mm" type="number" value="&#916; [mm]">';
    html += '</div>';
    html += '<a class="quick-button-small span1 btn-cmd cucmd" id="scraper_out" cucmdid="mov_rel">';
    html += '<i class="icon-angle-right"></i>';
    html += '<p class="name-cmd">Out</p>';
    html += '</a>';

    html += '<a href="#mdl-homing" role="button" class="quick-button-small span1 btn-cmd offset3 cucmd" cucmdid="stopMotion" cucmdvalue=1>';
    html += '<i class="icon-home"></i>';
    html += '<p class="name-cmd">Homing</p>';
    html += '</a>';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    html += '</div>';

    return html;
  }
  function generatePStable(cu) {
    var html = '<div class="row-fluid">';
    html += '<div class="box span12">';
    html += '<div class="box-content">';
    html += '<table class="table table-bordered" id="main_table_cu">';
    html += '<thead class="box-header">';
    html += '<tr>';
    html += '<th>Element</th>';
    html += '<th>Readout [A]</th>';
    html += '<th>Setting [A]</th>';
    html += '<th colspan="3">Saved</th>';
    html += '<th colspan="7">Flags</th>';
    html += '</tr>';
    html += '</thead>';

    $(cu).each(function (i) {
      var cuname = encodeName(cu[i]);
      html += "<tr class='row_element' cuname='" + cu[i] + "' id='" + cuname + "'>";
      html += "<td class='td_element td_name'>" + cu[i] + "</td>";
      html += "<td title='Readout current' class='td_element td_readout' id='" + cuname + "_output_current'>NA</td>";
      html += "<td class='td_element td_current' title='Setpoint current' id='" + cuname + "_input_current'>NA</td>";
      html += "<td class='td_element' title='Restore setpoint current'  id='" + cuname + "_input_saved_current'></td>";
      html += "<td class='td_element' title='Restore Stanby/Operational' id='" + cuname + "_input_saved_stby'></td>";
      html += "<td class='td_element' title='Restore setpoint polarity' id='" + cuname + "_input_saved_polarity'></td>";
      html += "<td class='td_element' id='" + cuname + "_output_stby'></td>";
      html += "<td class='td_element' id='" + cuname + "_output_polarity'></td>";
      html += "<td class='td_element' title='Bypass Mode' id='" + cuname + "_system_bypass'></td>";
      html += "<td class='td_element' title='Local controlled' id='" + cuname + "_output_local'></td>";
      html += "<td class='td_element' id='" + cuname + "_output_busy'></td>";
      html += "<td class='td_element' title='Control Unit alarms' id='" + cuname + "_output_cu_alarm'></td>";
      html += "<td class='td_element' title='Device alarms' id='" + cuname + "_output_device_alarm'></td></tr>";
    });
    html += '</table>';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    return html;
  }
  function updatePStable(cu) {
    cu.forEach(function (elem, index) {
      if (elem.hasOwnProperty("health")) {


        var id = elem.health.ndk_uid;
        var cuname = encodeName(id);
        if (!elem.output.hasOwnProperty("current")) {
          $("#" + cuname + "_output_current").html("NO DATASET");
          $("#" + cuname + "_input_current").html("NO DATASET");
          return;
        }
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
        } else if (elem.output.stby = true) {
          $("#" + cuname + "_output_stby").html('<i class="material-icons rosso">pause_circle_outline</i>');

        }



        if (elem.output.local == true) {
          $("#" + cuname + "_output_local").html('<i class="material-icons rosso">vpn_key</i>');
        } else if (elem.output.local == false) {
          $("#" + cuname + "_output_local").remove();
        }

        if ((cu_name_to_saved != null) && (cu_name_to_saved[elem.output.ndk_uid] != null)) {
          var saved = cu_name_to_saved[elem.output.ndk_uid];
          if (saved.input.stby == false) {
            $("#" + cuname + "_input_saved_stby").attr('title', "from snapshot:" + snap_selected);
            $("#" + cuname + "_input_saved_stby").html('<i class="material-icons verde">trending_down</i>');
          } else if (saved.input.stby = true) {
            $("#" + cuname + "_input_saved_stby").html('<i class="material-icons rosso">pause_circle_outline</i>');
          }
          $("#" + cuname + "_input_saved_current").attr('title', "from snapshot:" + snap_selected);
          $("#" + cuname + "_input_saved_current").html(saved.input.current);
          $("#" + cuname + "_input_saved_polarity").attr('title', "from snapshot:" + snap_selected);
          switch (saved.input.polarity) {
            case 1:
              $("#" + cuname + "_input_saved_polarity").html('<i class="material-icons rosso">add_circle</i>');
              break;
            case -1:
              $("#" + cuname + "_input_saved_polarity").html('<i class="material-icons blu">remove_circle</i>');
              break;
            case 0:
              $("#" + cuname + "_input_saved_polarity").html('<i class="material-icons">radio_button_unchecked</i>');
              break;

          }
        }
      }
    });

   

  }
  function generatePSCmd() {
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

  function generateGraphList() {
    var html = '<div class="modal hide fade" id="mdl-graph-list">';

    html += '<div class="modal-header">';
    html += '<button type="button" class="close" data-dismiss="modal">×</button>';
    html += '<h3 id="list_graphs">List Graphs</h3>';
    html += '</div>';

    html += '<div class="modal-body">';
    html += '<div class="row-fluid">';
    html += '<div class="box span12">';
    html += '<div class="box-content">';

    html += '<table class="table table-bordered" id="table_graph">';
    html += '<thead class="box-header">';
    html += '<tr>';
    html += '<th>Name</th>';
    html += '<th>Date</th>';
    html += '<th>Type</th>';

    html += '</tr>';
    html += '</thead>';
    html += '</table>';

    html += '<table class="table table-bordered" id="table_trace">';
    html += '<thead class="box-header">';
    html += '<tr>';
    html += '<th>Name</th>';
    html += '<th>X</th>';
    html += '<th>Y</th>';
    html += '</tr>';
    html += '</thead>';
    html += '</table>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    html += '<div class="modal-footer">';

    html += '<a href="#" class="btn" id="graph-delete">Delete</a>';
    html += '<a href="#" class="btn" id="graph-list-run">Run</a>';
    html += '<a href="#" class="btn" id="graph-list-edit">Edit..</a>';

    html += '<a href="#" class="btn" id="graph-list-close">Close</a>';
    html += '</div>';
    html += '</div>';
    return html;


  }
  function generateQueryTable() {
    var html = '<div class="modal hide fade draggable" id="mdl-query">';

    html += '<div class="modal-header">';
    html += '<button type="button" class="close" data-dismiss="modal">×</button>';
    html += '<h3>Query History</h3>';
    html += '</div>';

    html += '<div class="modal-body">';
    html += '<div class="row-fluid">';

    html += '<div class="box span12">';
    html += '<div class="box-content">';
    html += '<h3 class="box-header">Query options</h3>';
    html += '<label class="label span3">Start </label>';
    html += '<input class="input-xlarge focused span9" id="query-start" title="Start of the query (epoch in ms or hhmmss offset )" type="text" value="">';
    html += '<label class="label span3">Stop </label>';
    html += '<input class="input-xlarge focused span9" id="query-stop" title="End of the query (empty means: now)" type="text" value="NOW">';

    html += '<label class="label span3">Page </label>';
    html += '<input class="input-xlarge focused span9" id="query-page" title="page length" type="number" value="100">';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    html += '<div class="modal-footer">';

    html += '<a href="#" class="btn" id="query-run">Run</a>';
    html += '<a href="#" class="btn" id="query-close">Close</a>';
    html += '</div>';
    html += '</div>';
    return html;

  }
  function generateGraphTable() {
    var html = '<div class="modal hide fade" id="mdl-graph">';
    html += '<div class="modal-header">';
    html += '<button type="button" class="close" data-dismiss="modal">×</button>';
    html += '<h3>Graph options</h3>';
    html += '</div>';
    html += '<div class="modal-body">';
    html += '<div class="row-fluid">';

    html += '<div class="box span12">';
    html += '<div class="box-content">';
    html += '<h3 class="box-header">Graph options</h3>';
    html += '<label class="label span3">Width </label>';
    html += '<input class="input-xlarge focused span9" id="graph-width" title="Width px" type="number" value="640">';
    html += '<label class="label span3">High </label>';
    html += '<input class="input-xlarge focused span9" id="graph-high" title="High px" type="number" value="480">';

    html += '<label class="label span3" >Graph Type </label>';
    html += '<select id="graphtype" class="span9">';
    html += '<option value="line" selected="selected">Line</option>';
    html += '<option value="column">Column</option>';
    html += '<option value="histo">Histogram</option>';
    html += '</select>';
    html += '<label class="label span3">Graph update (ms) </label>';
    html += '<input class="input-xlarge span9" id="graph-update" type="number" value="1000">';

    html += '<label class="label span3">Graph Scroll </label>';
    html += '<div class="span3">'
    html += '<label for="graph-shift">enable scroll</label><input class="input-xlarge" id="shift-true" title="ENABLE scroll graph whenever keep seconds are reached" name="graph-shift" type="radio" value="true">';
    html += '</div>'
    html += '<div class="span3">'
    html += '<label for="graph-shift">disable scroll</label><input class="input-xlarge" id="shift-false" title="DISABLE scroll graph whenever keep seconds are reached" name="graph-shift" type="radio" value="false">';
    html += '</div>'

    html += '<label class="label span3">Graph keep seconds (s) </label>';
    html += '<input class="input-xlarge span9" id="graph-keepseconds" type="number" value="3600">';

    html += '</div>';
    html += '</div>';

    html += '<div class="box span12">';
    html += '<div class="box-content">';
    html += '<h3 class="box-header" id="X-axis">X-axis Options</h3>';

    html += '<label class="label span3">Name </label>';
    html += '<input class="input-xlarge focused span9" id="xname" type="text" value="X">';
    html += '<label class="label span3">Max </label>';
    html += '<input class="input-xlarge focused span9" id="xmax" title="Max X Scale" type="text" value="Auto">';
    html += '<label class="label span3">Min </label>';
    html += '<input class="input-xlarge focused span9" id="xmin" title="Min X Scale" type="text" value="Auto">';
    html += '<label class="label span3" >Scale </label>';
    html += '<select id="xtype" class="span9">';
    html += '<option value="linear">Linear scale</option>';
    html += '<option value="logarithmic">Logarithmic</option>';
    html += '<option value="datetime" selected="selected">DateTime</option>';
    html += '<option value="category">Category</option>';

    html += '</select>';

    html += '</div>';
    html += '</div>';

    html += '<div class="box span12">';
    html += '<div class="box-content">';
    html += '<h3 class="box-header">Y-axis Options</h3>';

    html += '<label class="label span3">Name </label>';
    html += '<input class="input-xlarge span9" id="yname" type="text" value="Y">';
    html += '<label class="label span3">Max </label>';
    html += '<input class="input-xlarge span9" id="ymax" type="text" title="Max Y Scale" value="Auto">';
    html += '<label class="label span3">Min </label>';
    html += '<input class="input-xlarge span9" id="ymin" type="text" title="Min Y Scale" value="Auto">';
    html += '<label class="label span3" >Scale </label>';
    html += '<select id="ytype" class="span9">';
    html += '<option value="linear" selected="selected">Linear scale</option>';
    html += '<option value="logarithmic">Logarithmic</option>';
    html += '<option value="datetime">DateTime</option>';
    html += '<option value="category">Category</option>';

    html += '</select>';

    html += '</div>';
    html += '</div>';

    html += '<div class="box span12">';
    html += '<div class="box-content">';
    html += '<h3 class="box-header">Trace Options</h3>';

    html += '<label class="label span2">Name </label>';
    html += '<input class="input-xlarge span10" id="trace-name" title="Name of the trace" type="text" value="">';
    html += '<label class="label span3" >Trace Type </label>';
    html += '<select id="trace-type" class="span9">';
    html += '<option value="multi" selected="multi">Multiple Independent Traces</option>';
    html += '<option value="single">Single Trace</option>';
    html += '</select>';

    html += '<label class="label span1">X:</label>';
    html += '<input class="input-xlarge span11" type="text" title="port path to plot on X" id="xvar" value="timestamp">';
    html += '<label class="label span1">Y:</label>';
    html += '<input class="input-xlarge span11" type="text" id="yvar" title="port path to plot on Y" value="">';
    html += '<a href="#" class="btn span5" id="trace-add" title="Add the following trace to the Graph" >Add Trace</a>';
    html += '<a href="#" class="btn span5" id="trace-rem" title="Remove the selected trace" >Remove Trace</a>';

    html += '</div>';
    html += '</div>';


    html += '<div class="box span12">';
    html += '<div class="box-content">';
    html += '<table class="table table-bordered" id="table_graph_items">';
    html += '<thead class="box-header">';
    html += '<tr>';
    html += '<th>Trace Name</th>';
    html += '<th id="X-axis">X-Axis</th>';
    html += '<th id="Y-axis">Y-Axis</th>';

    html += '</tr>';
    html += '</thead>';
    html += '</table>';
    html += '</div>';
    html += '</div>';

    html += '</div>';
    html += '</div>';
    html += '<div class="modal-footer">';

    html += '<input class="input-xlarge" id="graph_save_name" title="Graph Name" type="text" value="">';
    html += '<a href="#" class="btn" id="graph-run">Run</a>';
    html += '<a href="#" class="btn" id="graph-save">Save</a>';
    html += '<a href="#" class="btn" id="graph-close">Close</a>';
    html += '</div>';
    html += '</div>';
    return html;
  }
  function getValueFromCUList(culist, path) {
    for (var cnt = 0; cnt < culist.length; cnt++) {
      var item = culist[cnt];
      if (path.cu == item.health.ndk_uid) {
        if (path.dir == "output") {
          if (item.output.hasOwnProperty(path.var)) {
            return item.output[path.var];
          }
        }
        if (path.dir == "input") {
          if (item.input.hasOwnProperty(path.var)) {
            return item.input[path.var];
          }
        }
      }
    }
    return null;
  }

  function runGraph(graphname) {
    if (graphname == null || graphname == "")
      return;
    var opt = high_graphs[graphname];
    if (!(opt instanceof Object)) {
      alert("\"" + graphname + "\" not a valid graph ");
      return;
    }
    /// fix things before

    if (!$.isNumeric(opt.highchart_opt.xAxis.max)) {
      opt.highchart_opt.xAxis.max = null;
    }
    if (!$.isNumeric(opt.highchart_opt.xAxis.min)) {
      opt.highchart_opt.xAxis.min = null;
    }
    if (!$.isNumeric(opt.highchart_opt.yAxis.max)) {
      opt.highchart_opt.yAxis.max = null;
    }
    if (!$.isNumeric(opt.highchart_opt.yAxis.min)) {
      opt.highchart_opt.yAxis.min = null;
    }
    var count = 0;
    for (k in active_plots) {
      if (active_plots.hasOwnProperty(k)) count++;
    }

    if (count < 10) {
      $("#dialog-" + count).dialog({
        modal: false,
        draggable: true,
        closeOnEscape: false,
        title: opt.name + "-" + count,
        width: opt.width,
        hright: opt.height,
        resizable: true,
        dialogClass: 'no-close',
        open: function () {

          var start_time = (new Date()).getTime();
          var chart = new Highcharts.chart("graph-" + count, opt.highchart_opt);
          $("#dialog-" + count).attr("graphname", graphname);

          active_plots[graphname] = {
            graphname: graphname,
            graph: chart,
            highchart_opt: opt.highchart_opt,
            dialog: count,
          };

        },
        buttons: [
          {
            id: "dialog-live",
            text: "Live",
            click: function (e) {
              if (active_plots[graphname].hasOwnProperty('interval')) {
                clearInterval(active_plots[graphname].interval);
                delete active_plots[graphname].interval;
                $(e.target).html("Continue Live");
                return;
              }
              $(e.target).html("Pause Live");
              var chart = active_plots[graphname]['graph'];

              var refresh = setInterval(function () {
                var data = jchaos.getChannel(opt.culist, -1, null);
                var set = [];
                var x, y;
                var cnt = 0;
                var tr = opt.trace;
                var enable_shift = false;
                for (k in tr) {
                  if (tr[k].x == null) {
                    x = (new Date()).getTime(); // current time
                    if (opt.highchart_opt.shift && ((x - start_time) > opt.highchart_opt['timebuffer'])) {
                      enable_shift = true;
                    }
                  } else if (tr[k].x.const != null) {
                    x = tr[k].x.const;
                  } else {
                    x = getValueFromCUList(data, tr[k].x);
                  }
                  if (tr[k].y == null) {
                    y = (new Date()).getTime(); // current time
                  } else if (tr[k].y.const != null) {
                    y = tr[k].y.const;
                  } else {
                    y = getValueFromCUList(data, tr[k].y);

                  }
                  if (opt.highchart_opt['tracetype'] == "multi") {
                    chart.series[cnt++].addPoint([x, y], false, enable_shift);
                  } else {
                    set.push({ x, y });
                  }
                }
                if (opt.highchart_opt['tracetype'] == "single") {
                  chart.series[0].setData(set, true, true, true);
                }
                chart.redraw();
              }, opt.update);
              active_plots[graphname]['interval'] = refresh;

            }
          },
          {
            id: "dialog-history",
            text: "History",
            click: function () {
              if (opt.highchart_opt.xAxis.type != "datetime") {
                alert("X axis must be configured as datetime, for history plots!")
                return;
              }
              if (opt.highchart_opt.yAxis.type == "datetime") {
                alert("Y axis cannot be as datetime!")
                return;
              }
              $("#mdl-query").modal("show");
              $("#query-run").on("click", function () {
                $("#mdl-query").modal("hide");

                var qstart = $("#query-start").val();
                var qstop = $("#query-stop").val();
                var page = $("#query-page").val();
                jchaos.options.history_page_len = Number(page);
                jchaos.options.updateEachCall = true;

                if (qstop == "" || qstop == "NOW") {
                  qstop = (new Date()).getTime();
                }
                clearInterval(active_plots[graphname].interval);
                delete active_plots[graphname].interval;
                var tr = opt.trace;
                var chart = active_plots[graphname]['graph'];
                opt.culist.forEach(function (item) {
                  jchaos.getHistory(item, 0, qstart, qstop, "", function (data) {
                    var cnt = 0, ele_count = 0;
                    for (k in tr) {
                      if (tr[k].y.cu === item) {
                        //iterate on the datasets
                        var variable = tr[k].y.var;
                        var ts = data.X[ele_count++];
                        data.Y.forEach(function (ds) {
                          if (ds.hasOwnProperty(variable)) {
                            chart.series[cnt].addPoint([ts, ds[variable]], false, false);
                          }
                        });
                      }
                      cnt++;
                    }
                    chart.redraw();
                  });
                });
              })
            }
          }, {
            text: "Close",
            click: function () {
              clearInterval(active_plots[graphname].interval);
              delete active_plots[graphname];
              $(this).dialog('close');
            }
          }],



      });
    }
  }
  function saveGraph() {
    var graphtype = $("#graphtype option:selected").val();
    var tracetype = $("#trace-type option:selected").val();

    var graphname = $("#graph_save_name").val();
    if (graphname == "") {
      alert("must specify a valid graph name");
      return;
    }
    var xname = $("#xname").val();
    var xtype = $("#xtype").val();
    var xmax = $("#xmax").val();
    var xmin = $("#xmin").val();
    var ymax = $("#ymax").val();
    var ymin = $("#ymin").val();
    var width_ = $("#graph-width").val();
    var height_ = $("#graph-high").val();
    var gupdate = $("#graph-update").val();
    var keepseconds = Number($("#graph-keepseconds").val());
    if (!$.isNumeric(xmax)) {
      xmax = null;
    }
    if (!$.isNumeric(xmin)) {
      xmin = null;
    }
    if (!$.isNumeric(ymax)) {
      ymax = null;
    }

    if (!$.isNumeric(ymin)) {
      ymin = null;
    }

    var yname = $("#yname").val();
    var ytype = $("#ytype").val();
    var serie = [];
    var tracecuo = {};
    var tracecu = [];
    var shift_true = $("input[type=radio][name=graph-shift]:checked").val();
    if (tracetype == "single") {
      serie.push({ name: graphname });
    }
    for (key in trace_list) {
      if (tracetype == "multi") {
        serie.push({ name: key });
      }
      if ((trace_list[key].x != null) && trace_list[key].x.hasOwnProperty("cu") && trace_list[key].x.cu != null) {
        tracecuo[trace_list[key].x.cu] = "1";
      }
      if ((trace_list[key].y != null) && trace_list[key].y.hasOwnProperty("cu") && trace_list[key].y.cu != null) {
        tracecuo[trace_list[key].y.cu] = "1";
      }
    }
    for (key in tracecuo) {
      // unique cu
      tracecu.push(key);
    }
    var tmp = {
      chart: {
        type: graphtype,
        zoomType: "xy"
      },
      title: {
        text: graphname
      },
      xAxis: {
        type: xtype,
        max: xmax,
        min: xmin,
        gridLineWidth: 1,
        title: {
          text: xname
        }
      },
      yAxis: {
        type: ytype,
        max: ymax,
        min: ymin,
        title: {
          text: yname
        }
      },
      series: serie
    }
    tmp['tracetype'] = tracetype;
    tmp['shift'] = shift_true;
    tmp['timebuffer'] = keepseconds * 1000;

    if (xtype == "datetime") {
      tmp['rangeSelector'] = {
        buttons: [{
          count: 1,
          type: 'minute',
          text: '1min'
        }, {
          count: 5,
          type: 'minute',
          text: '5min'
        }, {
          count: 1,
          type: 'hour',
          text: '1hour'
        }, {
          type: 'all',
          text: 'All'
        }],
        inputEnabled: false,
        selected: 0
      }
    }

    high_graphs = jchaos.variable("highcharts", "get", null, null);
    var tempo = (new Date()).toString();
    high_graphs[graphname] = {
      name: graphname,
      width: width_,
      height: height_,
      update: gupdate,
      highchart_opt: tmp,
      trace: trace_list,
      culist: tracecu,
      time: tempo
    };
    jchaos.variable("highcharts", "set", high_graphs, null);
  }

  function generateSnapshotTable(cuid) {
    var html = '<div class="modal hide fade" id="mdl-snap">';

    html += '<div class="modal-header">';
    html += '<button type="button" class="close" data-dismiss="modal">×</button>';
    html += '<h3 id="list_snapshot">List Snapshots</h3>';
    html += '</div>';

    html += '<div class="modal-body">';
    html += '<div class="row-fluid">';
    html += '<div class="box span12">';
    html += '<div class="box-content">';

    html += '<table class="table table-bordered" id="table_snap_nodes">';
    html += '<thead class="box-header">';
    html += '<tr>';
    html += '<th>Element</th>';
    html += '<th>Type</th>';
    html += '</tr>';
    html += '</thead>';
    html += '</table>';

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

    html += '<label class="label span3" for="snap_save_name">Snapshot name</label>';
    html += '<input class="input-xlarge focused span9" id="snap_save_name" type="text" value="name">';

    html += '</div>';
    html += '</div>';

    html += '<div class="modal-footer">';
    html += '<a href="#" class="btn" id="snap-show">Show</a>';
    html += '<a href="#" class="btn" id="snap-apply">Apply</a>';
    html += '<a href="#" class="btn" id="snap-delete">Delete</a>';
    html += '<a href="#" class="btn" id="snap-save">Save</a>';
    html += '<a href="#" class="btn" id="snap-close">Close</a>';
    html += '</div>';
    html += '</div>';
    return html;
  }
  function generateDataSet() {
    // var cu=jchaos.getChannel(cuid, -1,null);
    // var desc=jchaos.getDesc(cuid,null);

    var html = '<div class="modal hide fade " id="mdl-dataset">';
    html += '<div class="modal-header">';
    html += '<button type="button" class="close" data-dismiss="modal">×</button>';
    html += '<h3>DATASET</h3>';
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

  function generateDescription() {
    // var cu=jchaos.getChannel(cuid, -1,null);
    // var desc=jchaos.getDesc(cuid,null);

    var html = '<div class="modal hide fade " id="mdl-description">';
    html += '<div class="modal-header">';
    html += '<button type="button" class="close" data-dismiss="modal">×</button>';
    html += '<h3 id="desc_text"></h3>';
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
  function generateLog() {
    var html = '<div class="modal hide fade" id="mdl-log">';
    html += '<div class="modal-header">';
    html += '<button type="button" class="close" data-dismiss="modal">×</button>';
    html += '<h3 id="list_logs">List logs</h3>';
    html += '</div>';
    html += '<div class="modal-body">';
    html += '<div class="row-fluid">';
    html += '<div class="box span12">';
    html += '<div class="box-content">';

    html += '<table class="table table-bordered" id="table_logs">';
    html += '<thead class="box-header">';
    html += '<tr>';
    html += '<th>Date</th>';
    html += '<th>Node</th>';
    html += '<th>Description</th>';
    html += '</tr>';
    html += '</thead>';
    html += '</table>';

    html += '</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    html += '<div class="modal-footer">';
    html += '<div class="control-group">';

    html += '<div class="controls">';


    html += '<select id="logtype">';
    html += '<option value="all" selected="selected">All</option>';
    html += '<option value="Info">Informative</option>';
    html += '<option value="error">Error</option>';
    html += '<option value="warning">Warning</option>';
    html += '</select>';

    html += '<input class="input-xlarge focused" id="log_search" type="text" value="Node search..">';

    html += '</div>';
    html += '</div>';

    html += '<a href="#" class="btn" id="log-search-go">Search</a>';
    html += '<a href="#" class="btn" id="log-next">Next</a>';
    html += '<a href="#" class="btn" id="log-close">Close</a>';
    html += '</div>';
    html += '</div>';
    return html;
  }
  function generateCmdModal() {
    var html = '<div class="modal hide fade" id="mdl-commands">';
    html += '<div class="modal-header">';
    html += '<button type="button" class="close" data-dismiss="modal">×</button>';
    html += '<h3 id="list_command_argument"></h3>';
    html += '</div>';

    html += '<div class="modal-body">';
    html += '<table class="table table-bordered" id="commands_argument_table">';
    html += '<thead class="box-header">';
    html += '<tr>';
    html += '<th>Argument Name</th>';
    html += '<th>Description</th>';
    html += '<th>Type</th>';
    html += '<th>Value</th>';
    html += '</tr>';
    html += '</thead>';
    html += '</table>';
    html += '</div>';

    html += '<div class="modal-footer">';
    html += '<a href="#" class="btn btn-primary" id="command-send">Send</a>';
    html += '<a href="#" class="btn btn-primary" id="command-close">Close</a>';
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
  function generateModalActions() {
    var html = "";
    for (var cnt = 0; cnt < 10; cnt++) {
      html += '<div id="dialog-' + cnt + '" class="cugraph hide" grafname="' + cnt + '" style="z-index: 1000;">';
      html += '<div id="graph-' + cnt + '" style="height: 380px; width: 580px;z-index: 1000;">';
      html += '</div>';
      html += '</div>';
    }

    html += generateDataSet();
    html += generateDescription();
    html += generateSnapshotTable();
    html += generateAlarms();
    html += generateCmdModal();
    html += generateLog();
    html += generateGraphTable();
    html += generateGraphList();
    html += generateQueryTable();


    return html;
  }
  function generateMenuBox() {
    var html = '<div class="box black">';
    html += '<div class="box-header">';
    html += '<h2><i class="halflings-icon white list"></i><span class="break"></span>Menu</h2>';
    html += '<div class="box-icon">';
    html += '<a href="#" class="btn-minimize"><i class="halflings-icon white chevron-up"></i></a>';
    html += '</div>';
    html += '</div>';
    html += '<div class="box-content">';
    html += '<ul class="dashboard-list metro">';
 
    


    html += '<li class="black">';
    html += '<a href="./unitserver.php" role="button" class="show_unitserver" data-toggle="modal">';
    html += '<i class="icon-print green"></i><span class="opt-menu hidden-tablet">UnitServer</span>';
    html += '</a>';
    html += '</li>';

    html += '<li class="black">';
    html += '<a href="./agent.pgp" role="button" class="show_agent" data-toggle="modal">';
    html += '<i class="icon-print green"></i><span class="opt-menu hidden-tablet">Agent</span>';
    html += '</a>';
    html += '</li>';

    html += '<li class="black">';
    html += '<a href="./orbit.php" role="button" class="show_orbit" data-toggle="modal">';
    html += '<i class="icon-file red"></i><span class="opt-menu hidden-tablet">Orbit</span>';
    html += '</a>';
    html += '</li>';
    
    html += '</ul>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  function generateActionBox() {
    var html = '<div class="box black span3" onTablet="span4" onDesktop="span4">';
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

    html += '<li class="green">';
    html += '<a href="#mdl-log" role="button" class="show_log" data-toggle="modal">';
    html += '<i class="icon-print green"></i><span class="opt-menu hidden-tablet">Logging</span>';
    html += '</a>';
    html += '</li>';

    html += '<li class="red">';
    html += '<a href="#mdl-graph-list" role="button" class="show_graph" data-toggle="modal">';
    html += '<i class="icon-print green"></i><span class="opt-menu hidden-tablet">Graphs</span>';
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
      html += '<span class="json-literal" cuport="' + json + '">' + json + '</span>';
    }
    else if (typeof json === 'boolean') {
      html += '<span class="json-literal" cuport="' + json + '">' + json + '</span> ';
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
              '<span class="' + keyclass + '" id=' + pather + '-' + key + ' portdir="' + pather + '" portname="' + key + '">"' + key + '"</span>' : key;
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



  function generateGenericControl() {
    var html = "";
    html += '<div class="row-fluid">';
    html += '<div class="box span12 box-cmd">';

    html += '<div class="box-header green">';
    html += '<h3 id="h3-generic-cmd">Generic Commands</h3>';
    html += '</div>';
    html += '<div class="box-content">';

    html += '<div class="row-fluid">';

    html += "<div class='span3 statbox'>";
    html += "<h3 id='scheduling_title'></h3>";
    html += "<input type='text' class='setSchedule'>";

    html += "</div>";

    // html += "<div class='span3'>";
    // html += "</div>";


    html += "<div class='span8'>";
    html += '<h2 class="span2">Available Commands</h2>';
    html += '<select class="span6" id="cu_full_commands" data-toggle="modal"> </select>';
    html += '</div>';

    html += "</div>";




    html += '<div class="row-fluid">';
    html += "<div class='span12'>";
    html += "<a class='quick-button-small span2 btn-cmd cucmdbase' id='cmd-stop-start'><i class='material-icons verde'>pause</i><p class='name-cmd'>Stop</p></a>";
    html += "<a class='quick-button-small span2 btn-cmd cucmdbase' id='cmd-init-deinit'><i class='material-icons verde'>trending_down</i><p class='name-cmd'>Deinit</p></a>";

    html += "<a class='quick-button-small span2 btn-cmd cucmdbase' id='cmd-recover-error'><i class='material-icons verde'>build</i><p class='name-cmd'>Recover Error</p></a>";
    html += "<a class='quick-button-small span2 btn-cmd cucmdbase' id='cmd-load-unload'><i class='material-icons red'>power</i><p class='name-cmd'>Unload</p></a>";
    html += "<a class='quick-button-small span2 btn-cmd cucmdbase' id='cmd-bypass-on-off'><i class='material-icons verde'>usb</i><p class='name-cmd'>BypassOFF</p></a>";

    // html += "<a class='quick-button-small span2 btn-cmd' id='cmd-bypassON-" + ctrlid + "'' onclick='jchaos.setBypass(\"" + cuid + "\",true,null);'><i class='material-icons verde'>cached</i><p class='name-cmd'>BypassON</p></a>";
    //   html += '<div class="statbox purple" onTablet="span2" onDesktop="span3">';
    //  html += '<h3>Available Commands</h3>';
    //  html += '<select id="cu_full_commands" data-toggle="modal"> </select>';
    //   html += '</div>';



    html += "</div>";
    html += "</div>";
    html += "</div>";


    html += "</div>";
    html += "</div>";
    return html;
  }

  function updateCUMenu(cu) {
    var items = {};

    if (cu.hasOwnProperty('health')) {   //if el health
      var status = cu.health.nh_status;
      if (status == 'Start') {
        items['stop'] = { name: "Stop", icon: "stop" };
      } else if (status == 'Stop') {
        items['start'] = { name: "Start", icon: "start" };
        items['deinit'] = { name: "Deinit", icon: "deinit" };
      } else if (status == 'Init') {
        items['start'] = { name: "Start", icon: "start" };
        items['deinit'] = { name: "Deinit", icon: "deinit" };
      } else if (status == 'Deinit') {
        items['unload'] = { name: "Unload", icon: "unload" };
        items['init'] = { name: "Init", icon: "init" };
      } else if (status == 'Recoverable Error') {
        items['recover'] = { name: "Recover", icon: "recover" };
      } else if (status == "Unload") {
        items['load'] = { name: "Load", icon: "load" };
      } else if (status == "Load") {
        items['unload'] = { name: "Unload", icon: "unload" };
        items['init'] = { name: "Init", icon: "init" };

      } else {

      }
    }
    return items;
  }
  function updateGenericControl(cu) {
    if (cu.hasOwnProperty('health')) {   //if el health
      var name = cu.health.ndk_uid;
      var status = cu.health.nh_status;
      $("#cmd-stop-start").hide();
      $("#cmd-init-deinit").hide();
      $("#cmd-load-unload").hide();
      $("#cmd-recover-error").hide();
      $("#cmd-bypass-on-off").hide();

      /*$("#cmd-stop-start").children().remove();
      $("#cmd-init-deinit").children().remove();
      $("#cmd-load-unload").children().remove();
      $("#cmd-recover-error").children().remove();
      $("#cmd-bypass-on-off").children().remove();
      */
      if ((off_line[name] == true) && (status != "Unload")) {
        status = "Dead";
      }
      $("#h3-generic-cmd").html("Generic Controls:\"" + name + "\" status:" + status);

      if (status == 'Start') {
        $("#cmd-stop-start").html("<i class='material-icons verde'>pause</i><p class='name-cmd'>Stop</p>");
        $("#cmd-stop-start").attr("cucmdid", "stop");
        $("#cmd-stop-start").show();
      } else if (status == 'Stop') {
        $("#cmd-stop-start").html("<i class='material-icons verde'>play_arrow</i><p class='name-cmd'>Start</p>");
        $("#cmd-stop-start").attr("cucmdid", "start");
        $("#cmd-init-deinit").html("<i class='material-icons verde'>trending_down</i><p class='name-cmd'>Deinit</p>");
        $("#cmd-init-deinit").attr("cucmdid", "deinit");
        $("#cmd-stop-start").show();
        $("#cmd-init-deinit").show();

      } else if (status == 'Init') {
        $("#cmd-init-deinit").html("<i class='material-icons verde'>trending_down</i><p class='name-cmd'>Deinit</p>");
        $("#cmd-init-deinit").attr("cucmdid", "deinit");
        $("#cmd-stop-start").html("<i class='material-icons verde'>play_arrow</i><p class='name-cmd'>Start</p>");
        $("#cmd-stop-start").attr("cucmdid", "start");
        $("#cmd-stop-start").show();
        $("#cmd-init-deinit").show();
      } else if (status == 'Deinit') {
        $("#cmd-init-deinit").html("<i class='material-icons verde'>trending_up</i><p class='name-cmd'>Init</p>");
        $("#cmd-init-deinit").attr("cucmdid", "init");
        $("#cmd-load-unload").html("<i class='material-icons red'>power</i><p class='name-cmd'>Unload</p>");
        $("#cmd-load-unload").attr("cucmdid", "unload");
        $("#cmd-init-deinit").show();
        $("#cmd-load-unload").show();
      } else if (status == 'Recoverable Error') {
        $("#cmd-recover-error").html("<i class='material-icons red'>build</i><p class='name-cmd'>Recover Error</p>");
        $("#cmd-recover-error").attr("cucmdid", "recover");
        $("#cmd-recover-error").show();
      } else if (status == "Unload") {
        $("#cmd-load-unload").html("<i class='material-icons green'>power</i><p class='name-cmd'>Load</p>");
        $("#cmd-load-unload").attr("cucmdid", "load");
        $("#cmd-load-unload").show();

      } else if (status == "Load") {
        $("#cmd-load-unload").html("<i class='material-icons red'>power</i><p class='name-cmd'>Unload</p>");
        $("#cmd-load-unload").attr("cucmdid", "unload");
        $("#cmd-load-unload").show();
        $("#cmd-init-deinit").html("<i class='material-icons verde'>trending_up</i><p class='name-cmd'>Init</p>");
        $("#cmd-init-deinit").attr("cucmdid", "init");
        $("#cmd-init-deinit").show();

      } else {

      }
    }
    if (cu.hasOwnProperty('system') && (status != "Dead")) {   //if el system
      $("#scheduling_title").html("Actual scheduling (us):" + cu.system.cudk_thr_sch_delay);

      if (cu.system.cudk_bypass_state == false) {
        $("#cmd-bypass-on-off").html("<i class='material-icons verde'>cached</i><p class='name-cmd'>Bypass</p>");
        $("#cmd-bypass-on-off").attr("cucmdid", "bypasson");


      } else {
        $("#cmd-bypass-on-off").html("<i class='material-icons verde'>usb</i><p class='name-cmd'>No Bypass</p>");
        $("#cmd-bypass-on-off").attr("cucmdid", "bypassoff");

      }
    }

  }

  function populateSnapList(snaplist) {
    if (snaplist.length > 0) {
      var dataset;
      snap_selected = "";
      snaplist.forEach(function (dataset, index) {
        var date = new Date(dataset.ts);
        $('#table_snap').append('<tr class="row_element" id="' + dataset.name + '"><td>' + date + '</td><td>' + dataset.name + '</td></tr>');
      });
      $("#table_snap tbody tr").click(function (e) {
        $(".row_element").removeClass("row_snap_selected");
        $("#table_snap_nodes").find("tr:gt(0)").remove();

        $(this).addClass("row_snap_selected");
        snap_selected = $(this).attr("id");
        var dataset = jchaos.snapshot(snap_selected, "load", null, "", null);
        dataset.forEach(function (elem) {
          var name;
          if (elem.hasOwnProperty("input")) {
            name = elem.input.ndk_uid;
          } else if (elem.hasOwnProperty("output")) {
            name = elem.output.ndk_uid;

          }
          cu_name_to_saved[name] = elem;

          var desc = jchaos.getDesc(name, null);
          var type = findImplementationName(desc[0].instance_description.control_unit_implementation);
          $('#table_snap_nodes').append('<tr class="row_element" id="' + name + '"><td>' + name + '</td><td>' + type + '</td></tr>');

        });
        $("#snap-apply").show();
        $("#snap-show").show();
        $("#snap-delete").show();

        $("#snap_save_name").val(snap_selected);

      });
    }
  }
  function updateLog(cu) {
    $("#table_logs").find("tr:gt(0)").remove();
    //var logtype= $( "input[name=log]:radio" );
    var logtype = $("#logtype option:selected").val();
    /*
    { "result_list" : [ { "seq" : 1618, "mdsndk_nl_lts" : 1513869648206, "mdsndk_nl_sid" : "BTF/QUADRUPOLE/QUATB001", "mdsndk_nl_ld" : "error", "mdsndk_nl_lsubj" : "mode", "mdsndk_nl_e_ed" : "", "mdsndk_nl_e_em" : "", "mdsndk_nl_e_ec" : 0 }, { "seq" : 1256, "mdsndk_nl_lts" : 1513869317995, "mdsndk_nl_sid" : "BTF/QUADRUPOLE/QUATB001", "mdsndk_nl_ld" : "error", "mdsndk_nl_lsubj" : "mode", "mdsndk_nl_e_ed" : "", "mdsndk_nl_e_em" : "", "mdsndk_nl_e_ec" : 0 }, { "seq" : 654, "mdsndk_nl_lts" : 1513869128475, "mdsndk_nl_sid" : "BTF/QUADRUPOLE/QUATB001", "mdsndk_nl_ld" : "error", "mdsndk_nl_lsubj" : "mode", "mdsndk_nl_e_ed" : "", "mdsndk_nl_e_em" : "", "mdsndk_nl_e_ec" : 0 }, { "seq" : 196, "mdsndk_nl_lts" : 1513869042637, "mdsndk_nl_sid" : "BTF/QUADRUPOLE/QUATB001", "mdsndk_nl_ld" : "error", "mdsndk_nl_lsubj" : "pola", "mdsndk_nl_e_ed" : "", "mdsndk_nl_e_em" : "", "mdsndk_nl_e_ec" : 0 } ] }
    */
    jchaos.log(cu, "search", "log", 0, 10000000000000, function (data) {
      if (data.hasOwnProperty("result_list")) {
        data.result_list.forEach(function (item) {
          if ((item.mdsndk_nl_ld == logtype) || (logtype == "all")) {
            var dat = new Date(item.mdsndk_nl_lts).toString();
            var nam = item.mdsndk_nl_sid;
            var msg = item.mdsndk_nl_l_m;
            if (logtype == "warning") {
              $('#table_logs').append('<tr class="row_element" id="' + dat + '"><td>' + dat + '</td><td>' + nam + '</td><td>' + msg + '</td></tr>').css('color', 'yellow');;
            } else if (logtype == "error") {
              $('#table_logs').append('<tr class="row_element" id="' + dat + '"><td>' + dat + '</td><td>' + nam + '</td><td>' + msg + '</td></tr>').css('color', 'red');;
            } else {
              $('#table_logs').append('<tr class="row_element" id="' + dat + '"><td>' + dat + '</td><td>' + nam + '</td><td>' + msg + '</td></tr>');

            }
          }
        });
      }

    });
  }
  function updateGraph() {
    high_graphs = jchaos.variable("highcharts", "get", null, null);
    $("#table_graph").find("tr:gt(0)").remove();

    for (g in high_graphs) {
      $('#table_graph').append('<tr class="row_element" id="' + g + '"><td>' + g + '</td><td>' + high_graphs[g].time + '</td><td>' + high_graphs[g].highchart_opt.chart.type + '</td></tr>');

    }

    $("#table_graph tbody tr").click(function (e) {
      $(".row_element").removeClass("row_snap_selected");
      $("#table_trace").find("tr:gt(0)").remove();

      $(this).addClass("row_snap_selected");
      graph_selected = $(this).attr("id");
      $(list_graphs).html("Graph Selected \"" + graph_selected + "\"");
      trace_list = high_graphs[graph_selected].trace;
      var xp, yp;
      for (g in trace_list) {
        xp = encodeCUPath(trace_list[g].x);
        yp = encodeCUPath(trace_list[g].y);
        var tname = encodeName(g);
        $('#table_trace').append('<tr class="row_element" id=trace_"' + tname + '"><td>' + g + '</td><td>' + xp + '</td><td>' + yp + '</td></tr>');

      }
      /*$("#table_trace tbody tr").click(function (e) {
        $(".row_element").removeClass("row_snap_selected");
        $(this).addClass("row_snap_selected");
        trace_selected = $(this).attr("id");
      });*/
    });

  }

  function updateSnapshotTable(cu) {
    $("#table_snap").find("tr:gt(0)").remove();
    $("#table_snap_nodes").find("tr:gt(0)").remove();
    $("#table_snap_nodes").show();

    $("#snap-apply").hide();
    $("#snap-show").hide();
    $("#snap-delete").hide();
    $("#snap-save").show();
    $('#table_snap').hide();
    if (cu_multi_selected.length > 0) {
      $("#list_snapshot").html("Snapshotting the following group:");

      cu_multi_selected.forEach(function (elem) {
        var name = encodeName(elem);
        var type = findImplementationName(cu_name_to_desc[elem].instance_description.control_unit_implementation);

        $('#table_snap_nodes').append('<tr class="row_element" id="' + name + '"><td>' + name + '</td><td>' + type + '</td></tr>');

      });
    } else {
      var snap_list = "";
      $('#table_snap').show();
      if ((cu == null) || (cu.length == 0)) {
        $("#list_snapshot").html("List All snapshots");

        jchaos.search("", "snapshots", false, function (snaplist) {
          populateSnapList(snaplist);
        });
      } else {
        $("#list_snapshot").html("List snapshot of " + cu);

        jchaos.search(cu, "snapshotsof", false, function (snaplist) {
          populateSnapList(snaplist);

        });
      }
    }
  }

  /**
   * jQuery plugin method
   * @param json: a javascript object
   * @param options: an optional options hash
   */
  $.fn.chaosDashboard = function (opt) {
    options = opt || {};
    
    /* jQuery chaining */
    return this.each(function () {
      var notupdate_dataset = 1;
      /* Transform to HTML */
      // var html = chaosCtrl2html(cu, options, '');
      if (options.template = "CU") {
        var html="";
        html += buildBody();
        html += generateModalActions();
        html += '<div class="specific-table"></div>';
        html += '<div class="specific-control"></div>';
        /*** */
      /* Insert HTML in target DOM element */
        $(this).html(html);
        graphSetup();
        snapSetup();
        datasetSetup();
        descriptionSetup();
        logSetup();
        jsonSetup();
        mainCU();
        $("#menu-dashboard").html(generateMenuBox());
      }



      

      

    });
  };
})(jQuery);
