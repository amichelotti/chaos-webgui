
/**
 * jQuery chaos widget
 * @author: Andrea Michelotti <andrea.michelotti@lnf.infn.it>
 */
(function ($) {
  var json_editor;
  var editorFn = new Function;
  var cu_templates = null;
  var driver_templates = [];
  var custom_group = [];
  var checkRegistration = 0;
  var interface;// interface we are looking for
  var cu_copied;
  var us_copied;
  var algo_copied;
  var save_obj;
  var snap_selected = "";
  var node_selected = "";
  var pather_selected="";
  var node_multi_selected = [];
  var options;
  var node_live_selected = [{}];
  var node_list = [];
  var node_name_to_index = [];
  var node_name_to_desc = [];
  var cu_name_to_saved = []; // cuname saved state if any
  var node_list_interval; // update interval of the CU list
  var node_list_check; // update interval for CU check live
  var main_dom;
  var health_time_stamp_old = [];
  var off_line = [];
  var curr_cu_selected = {};
  var last_index_selected = -1;
  var active_plots = [];
  var trace_selected;
  var trace_list = [];
  var high_graphs; // highchart graphs
  var graph_selected;
  var search_string;
  var notupdate_dataset = 1;
  var implementation_map = { "powersupply": "SCPowerSupply", "scraper": "SCActuator", "camera": "RTCamera" };
  var histdataset = {};
  var hostWidth = 640;
  var hostHeight = 640;

  function getInterfaceFromClass(impl_class) {
    for (var key in implementation_map) {
      if (impl_class.includes(implementation_map[key])) {
        return key;
      }
    };
    return null;
  }
  function removeElementByName(name, tlist) {
    for (var cnt = 0; cnt < tlist.length; cnt++) {
      if (tlist[cnt].name == name) {
        tlist.splice(cnt, 1);
        return;
      }
    }
    return;
  }
  function replaceElementByName(name_dst, elemsrc, tlist) {
    for (var cnt = 0; cnt < tlist.length; cnt++) {
      if (tlist[cnt].name == name_dst) {
        tlist[cnt] = elemsrc
        return;
      }
    }
    return;
  }
  function convertToCSV(json) {
    return json;
  }
  function string2buffer(str) {
    var buf = new Uint8Array(str.length);
    for (var i = 0; i < str.length; i++) {
      buf[i] = str.charCodeAt(i);
    }
    return buf.buffer;
  }
  function convertBinaryToArrays(obj) {
    if (obj.hasOwnProperty("$binary")) {
      var objtmp;
      var type = obj.$binary.subType;
      if (type == "84") {
        // integers
        var binary_string = atob(obj.$binary.base64);
        if ((binary_string.length % 4) != 0) {
          binary_string = binary_string.substring(0, binary_string.length - (binary_string.length % 4));
        }
        //  if ((binary_string.length % 4) == 0) {
        var arrbuf = string2buffer(binary_string);
        var arr = new Int32Array(arrbuf);
        objtmp = Array.prototype.slice.call(arr);
        //  }
      } else if (type == "86") {

        var binary_string = atob(obj.$binary.base64);
        if ((binary_string.length % 8) == 0) {

          var arr = new Float64Array(string2buffer(binary_string));
          objtmp = Array.prototype.slice.call(arr);
        }
      } else {
        objtmp = obj;
      }
      return objtmp;
    }

    for (var k in obj) {
      if (obj[k] instanceof Object) {
        obj[k] = convertBinaryToArrays(obj[k]);
      }

    }
    return obj;
  }
  function getElementByName(name, tlist) {
    for (var cnt = 0; cnt < tlist.length; cnt++) {
      if (tlist[cnt].name == name) {
        return tlist[cnt];
      }
    }
    return null;
  }


  function getFile(msghead, msg, handler) {
    var instant = $('<div></div>').html('<div><p>' + msg + '</p></div><div><input type="file" id="upload-file" class="span3" /></div>').dialog({
      width: 680,
      height: 400,
      title: msghead,
      position: "center",
      open: function () {
        $(this).css("opacity", 0.5);
        var main = $(this);
        $('#upload-file').on('change', function () {
          var reader = new FileReader();
          reader.onload = function (e) {
            handler(JSON.parse(e.target.result));
            $(main).dialog("close").remove();
          };
          reader.readAsText(this.files[0]);

        });
      },
      buttons: [
        {
          text: "Close",
          click: function (e) {
            $(this).dialog("close").remove();

          }
        }
      ]
    });
  }

  function openControl(msg, cuname, cutype, refresh) {
    var name  = encodeName(cuname[0]);

    
    var nintervals = 0;
    var orginal_list = [];
    var instant = $('<div id=ctrl-' + name + '></div>').dialog({
      minWidth: hostWidth / 2,
      minHeight: hostHeight / 4,
      title: msg,
      position: "center",
      resizable: true,
      buttons: [
        {
          text: "close", click: function (e) {
            $("#ctrl-" + name).dialog('close');


          }
        }


      ],
      close: function (event, ui) {
        var last_interval = setInterval(function () { }, 100000);
        console.log(name + " CLOSING intervals from:" + nintervals + " to :" + last_interval);
        for (var i = nintervals; i <= last_interval; i++) {
          clearInterval(i);
        }
        $(this).remove();
        var interface = $("#classe option:selected").val();
        console.log("restoring view :" + interface);

        buildCUInteface(orginal_list, implementation_map[interface], "cu");
      },
      open: function () {
        nintervals = setInterval(function () { }, 100000);  // Get a reference to the last
        // interval +1
        orginal_list = node_list;
        console.log(name + " OPEN control interval:" + nintervals);
        $("#ctrl-" + name).chaosDashboard({ collapsed: true, withQuotes: true, template: "ctrl", cu: cuname, interface: cutype, Interval: refresh });
      }
    });
  }

  function showJson(msg, cuname, json) {
    var name = encodeName(cuname);

    var instant = $('<div id=desc-' + name + '></div>').dialog({
      minWidth: hostWidth / 4,
      minHeight: hostHeight / 4,
      title: msg,
      position: "center",
      resizable: true,
      buttons: [
        {
          text: "save", click: function (e) {
            var blob = new Blob([JSON.stringify(json)], { type: "json;charset=utf-8" });
            saveAs(blob, name + ".json");
          }
        },
        {
          text: "close", click: function (e) {
            $("#desc-" + name).dialog('close');
          }
        }


      ],
      close: function (event, ui) {

        $(this).remove();
      },
      open: function () {
        console.log(cuname + " description");
        //   $("#desc-"+name).width(hostWidth/4);
        //  $("#desc-"+name).height(hostHeight/4);
        var jsonhtml = json2html(json, options, cuname);
        if (isCollapsable(json)) {
          jsonhtml = '<a  class="json-toggle"></a>' + jsonhtml;
        }
        $("#desc-" + name).html(jsonhtml);
        jsonSetup($(this));
        $(".json-toggle").trigger("click");

      }
    });
  }

  function showDataset(msghead, cuname, refresh) {
    var update;
    var started = 0;
    var stop_update = false;
    var last_dataset = {};
    var name = encodeName(cuname);
    var instant = $('<div id=dataset-' + name + '></div>').dialog({
      minWidth: hostWidth / 4,
      minHeight: hostHeight / 4,
      title: msghead,
      position: "center",
      resizable: true,
      buttons: [
        {
          text: "update", id: 'dataset-update-' + name, click: function (e) {
            // var interval=$(this).attr("refresh_time");
            stop_update = !stop_update;

            // $(instant).dialog("close");
          }
        }, {
          text: "save", click: function (e) {
            var blob = new Blob([JSON.stringify(last_dataset)], { type: "json;charset=utf-8" });
            saveAs(blob, name + ".json");
          }
        },
        {
          text: "close", click: function (e) {
            // var interval=$(this).attr("refresh_time");
            $("#dataset-" + name).dialog('close');

          }
        }


      ],
      close: function (event, ui) {
        //  var interval=$(this).attr("refresh_time");

        clearInterval(update);
        // $(instant).dialog("close");
        $(this).remove();
      },
      open: function () {
        console.log(cuname + "dataset uodate refresh:" + refresh);
        //$(".ui-dialog-titlebar-close", ui.dialog | ui).show();
        update = setInterval(function () {
          if (stop_update) {
            $('#dataset-update-' + name).text("Update");
          } else {
            $('#dataset-update-' + name).text("Not Update");
          }
          if (!stop_update) {
            jchaos.getChannel(cuname, -1, function (imdata) {
              last_dataset = imdata;
              var converted = convertBinaryToArrays(imdata);
              var jsonhtml = json2html(converted, options, cuname);
              if (isCollapsable(converted)) {
                jsonhtml = '<a  class="json-toggle"></a>' + jsonhtml;
              }

              $("#dataset-" + name).html(jsonhtml);
              if (started == 0) {
                started = 1;
                stop_update = true;
                //var target = $(this).toggleClass('collapsed').siblings('ul.json-dict, ol.json-array');
                //target.toggle();
                $(".json-toggle").trigger("click");
                jsonEnableContext();
              }
            });
          }

        }, refresh);

        jsonSetup($(this));

      }
    });
  }
  function showPicture(msghead, fmt, cuname, refresh) {
    var update;
    var data;
    var stop_update = false;
    var name = encodeName(cuname);
    var instant = $('<div><img id=pict-' + name + ' src=""></div>').dialog({
      minWidth: hostWidth / 4,
      minHeight: hostHeight / 4,
      title: msghead,
      position: "center",
      resizable: true,
      dialogClass: 'no-close',
      buttons: [
        {
          text: "save", click: function (e) {
            var binary_string = atob(data.FRAMEBUFFER.$binary.base64);
            var len = binary_string.length;
            var bytes = new Uint8Array(len);
            for (var i = 0; i < len; i++) {
              bytes[i] = binary_string.charCodeAt(i);
            }
            var blob = new Blob([bytes], { type: "image/png" });
            saveAs(blob, name + ".png");
          }
        },
        {
          text: "update", id: 'pict-update-' + name, click: function (e) {
            // var interval=$(this).attr("refresh_time");
            stop_update = !stop_update;

          }
        },
        {
          text: "close", click: function (e) {
            // var interval=$(this).attr("refresh_time");

            clearInterval(update);
            // $(instant).dialog("close");
            $(this).remove();
          }
        }


      ],
      close: function (event, ui) {
        //  var interval=$(this).attr("refresh_time");

        clearInterval(update);
        // $(instant).dialog("close");
        $(this).remove();
      },
      open: function () {
        console.log(msghead + " refresh:" + refresh, " fmt:" + fmt);

        update = setInterval(function () {
          if (stop_update) {
            $('#pict-update-' + name).text("Update");
          } else {
            $('#pict-update-' + name).text("Not Update");
          }
          if (!stop_update) {
            jchaos.getChannel(cuname, 0, function (imdata) {
              data = imdata[0];
              if (data.hasOwnProperty("FRAMEBUFFER") && data.FRAMEBUFFER.hasOwnProperty("$binary") && data.FRAMEBUFFER.$binary.hasOwnProperty("base64")) {
                var bin = data.FRAMEBUFFER.$binary.base64;
                //  $("#pict-"+name).attr("src", "data:image/" + fmt + ";base64," + bin);
                $("#pict-" + name).attr("src", "data:;base64," + bin);
              } else {
                alert("NO 'FRAMEBUFFER.$binary.base64' key EXISTS");
                clearInterval(update);
                $(this).remove();

              }
            });
          }
          //$(this).attr("refresh_time",update);
        }, refresh);
      }
    });
  }
  function instantMessage(msghead, msg, tim) {
    var instant = $('<div></div>').html(msg).dialog({
      width: 350,
      height: 100,
      title: msghead,
      position: "center",
      open: function () {
        console.log(msghead + ":" + msg);
        $(this).css("opacity", 0.5);
        setTimeout(function () {
          $(instant).dialog("close");
        }
          , tim);
      }
    });
  }
  function copyToClipboard(testo) {
    // $("#inputClipBoard").focus();
    //var $temp=$("<input>");
    //$("body").append($temp);
    //$temp.val(testo).select();
    $("#inputClipBoard").val(testo).select();
    //document.execCommand("Copy");
    //$temp.remove();

    /*
    var $temp = $("<div>");
    $("body").append($temp);
    $temp.attr("contenteditable", true)
         .html(testo).select()
         .on("focus", function() { 
        document.execCommand('selectAll',false,null);
         document.execCommand("copy");


        }).focus();
    $temp.remove();
  */
    //    instantMessage("Copy","copied to clipboard",900);
  }
  function encodeCUPath(path) {
    if (path == null || path == "timestamp") {
      return "timestamp";
    }
    if ((path.const == null) && (path.cu == null)) {
      return path.origin;
    }

    if (path.const) {
      return path.const;
    }
    var str = path.cu + "/" + path.dir + "/" + path.var;
    if (path.index != null) {
      str += "[" + path.index + "]";
    }
    return str;
  }

  function decodeCUPath(cupath) {
    var regex_vect = /(.*)\/(.*)\/(.*)\[([-\d]+)\]$/;

    var regex = /(.*)\/(.*)\/(.*)$/;
    var tmp = {
      cu: null,
      dir: null,
      var: null,
      const: null,
      origin: cupath
    };
    if ($.isNumeric(cupath)) {
      tmp = {
        cu: null,
        dir: null,
        var: null,
        const: Number(cupath),
        index: null, // in case of vectors
        origin: cupath
      };
      return tmp;
    }
    var match = regex_vect.exec(cupath);
    if (match != null) {
      tmp = {
        cu: match[1],
        dir: match[2],
        var: match[3],
        const: null,
        index: match[4],
        origin: cupath
      };
      return tmp;
    }
    match = regex.exec(cupath);
    if (match != null) {
      tmp = {
        cu: match[1],
        dir: match[2],
        var: match[3],
        const: null,
        index: null,
        origin: cupath
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
  function installCheckLive() {
    if (node_list_check != null) {
      clearInterval(node_list_check)
    }
    node_list_check = setInterval(function () {
      node_live_selected.forEach(function (elem, index) {
        var curr_time = 0;
        if (elem.hasOwnProperty("health") && elem.health.hasOwnProperty("dpck_ats")) {
          curr_time = elem.health.dpck_ats;
        }
        if (elem.hasOwnProperty("output") && elem.output.hasOwnProperty("dpck_ats") && (elem.output.dpck_ats > curr_time)) {
          curr_time = elem.output.dpck_ats;
        }
        if (elem.hasOwnProperty("health") && elem.health.hasOwnProperty("ndk_uid")) {
          var name = encodeName(elem.health.ndk_uid);
          var diff = (curr_time - health_time_stamp_old[name]);
          if (diff != 0) {
            $("#" + name).css('color', 'green');
            $("#" + name).find('td').css('color', 'green');

            off_line[elem.health.ndk_uid] = false;

          } else {
            $("#" + name).css('color', 'black');
            $("#" + name).find('td').css('color', 'black');
            off_line[elem.health.ndk_uid] = true;
            node_live_selected[index].health.nh_status = "Dead";

          }
          health_time_stamp_old[name] = curr_time;
        } else if (node_list.length > 0) {
          var id = node_list[index];
          var name = encodeName(id);
          $("#" + name).css('color', 'red');
          off_line[id] = true;

        }

      });
    }, 10000);
  }
  function retriveCurrentCmdArguments(alias) {
    var arglist = [];
    if (node_selected == null) {
      return arglist;
    }
    var name = encodeName(node_selected);
    if (node_selected != null && node_name_to_desc[name].hasOwnProperty("cudk_ds_desc") && node_name_to_desc[name].cudk_ds_desc.hasOwnProperty("cudk_ds_command_description")) {
      var desc = node_name_to_desc[name].cudk_ds_desc.cudk_ds_command_description;
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
      node_name_to_desc[name] = desc[0];

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
    var tt = str.replace(/[\/\:\.]/g, "_");
    var rr = tt.replace(/\+/g, "_p");
    var kk = rr.replace(/\-/g, "_m")
    return kk;
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
    var dataset = node_live_selected[node_name_to_index[encodeName(id)]];
    if ((dataset != null) && (dataset.hasOwnProperty("device_alarms"))) {
      decodeDeviceAlarm(dataset.device_alarms);
    }
  }

  function show_cu_alarm(id) {
    var dataset = node_live_selected[node_name_to_index[encodeName(id)]];
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


  function buildCUBody() {
    var html = '<div class="row-fluid">';

    html += '<div class="statbox purple" onTablet="span6" onDesktop="span2">';
    html += '<h3>Zones</h3>';
    html += '<select id="zones" size="auto"></select>';
    html += '</div>';

    html += '<div class="statbox purple" onTablet="span6" onDesktop="span2">';
    html += '<h3>Elements</h3>';
    html += '<select id="elements" size="auto"></select>';
    html += '</div>';

    html += '<div class="statbox purple" onTablet="span4" onDesktop="span2">'
    html += '<h3>Class</h3>';
    html += '<select id="classe" size="auto"></select>';
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
  function buildNodeBody() {
    var html = '<div class="row-fluid">';
    html += '<div class="statbox purple" onTablet="span4" onDesktop="span3">'
    html += '<h3>Node Type</h3>';
    html += '<select id="classe" size="auto"></select>';
    html += '</div>';

    html += '<div class="statbox purple row-fluid" onTablet="span4" onDesktop="span3">'
    html += '<div class="span6">'
    html += '<label for="search-alive">Search All</label><input class="input-xlarge" id="search-alive-false" title="Search Alive and not Alive nodes" name="search-alive" type="radio" value=false>';
    html += '</div>'
    html += '<div class="span6">'
    html += '<label for="search-alive">Search Alive</label><input class="input-xlarge" id="search-alive-true" title="Search just alive nodes" name="search-alive" type="radio" value=true>';
    html += '</div>'
    // html += '<h3 class="span3">Search</h3>';

    html += '<input class="input-xlarge focused span6" id="search-chaos" title="Free form Search" type="text" value="">';
    html += '</div>';
    html += '</div>';

    return html;
  }

  function buildAlgoBody() {
    var html = '<div class="row-fluid">';
    /*html += '<div class="statbox purple" onTablet="span4" onDesktop="span3">'
    html += '<h3>Algorithm Type</h3>';
    html += '<select id="classe" size="auto"></select>';
    html += '</div>';
*/
    html += '<div class="statbox purple row-fluid" onTablet="span8" onDesktop="span6">'
    html += '<div class="span6">'
    html += '<label for="search-algo">Search Algorithms</label><input class="input-xlarge" id="search-algo" title="Search Algorithms" name="search-algo" type="radio" value=true>';
    html += '</div>'
    html += '<div class="span6">'
    html += '<label for="search-algo">Search Instanced</label><input class="input-xlarge" id="search-instance" title="Search Instanced Algorithms" name="search-algo" type="radio" value=false>';
    html += '</div>'
    // html += '<h3 class="span3">Search</h3>';

    html += '<input class="input-xlarge focused span6" id="search-chaos" title="Free form Search" type="text" value="">';
    html += '</div>';
    html += '</div>';

    return html;
  }
  function updateAlgoMenu(cu, name) {
    var items = {};
    items['edit-algo'] = { name: "Edit..", icon: "Edit" };
    items['new-algo'] = { name: "New..", icon: "New" };
    items['copy-algo'] = { name: "Copy", icon: "copy" };
    items['paste-algo'] = { name: "Paste", icon: "paste" };
    items['delete-algo'] = { name: "Delete", icon: "delete" };
    items['create-instance'] = { name: "Create Instance", icon: "Create" };
    return items;
  }
  function updateInstanceAlgoMenu(cu, name) {
    var items = {};
    items['edit-instance'] = { name: "Edit Instance..", icon: "Delete" };

    items['delete-instance'] = { name: "Delete Instance", icon: "Delete" };
    return items;
  }
/*
  function buildAlgoBody() {
    var html = '<div class="row-fluid">';

    html += '<div class="statbox purple row-fluid" onTablet="span4" onDesktop="span8">'
    html += '<div class="span6">'
    html += '<label for="search-alive">Search All Alghoritm</label><input class="input-xlarge" id="search-alive-false" title="Search Alive and not Alive nodes" name="search-alive" type="radio" value=false>';
    html += '</div>'
    html += '<div class="span6">'
    html += '<label for="search-alive">Search Alive</label><input class="input-xlarge" id="search-alive-true" title="Search just alive nodes" name="search-alive" type="radio" value=true>';
    html += '</div>'
    // html += '<h3 class="span3">Search</h3>';

    html += '<input class="input-xlarge focused span6" id="search-chaos" title="Free form Search" type="text" value="">';
    html += '</div>';
    html += '</div>';
    return html;
  }*/
  function generateAlgoTable(cu, interface, template) {
    var html = '<div class="row-fluid" id="table-space">';

    html += '<div class="box span12" id="container-main-table">';
    html += '<div class="box-content span12">';

    html += '<table class="table table-bordered" id="main_table-' + template + '">';
    html += '<thead class="box-header">';
    if(interface == "algo-instance"){
      html += '<tr class="algoInstanceMenu">';
      html += '<th>Instance Name</th>';
      html += '<th>Algorithm Name</th>';
      html += '<th>Language</th>';
      html += '<th>RPC Address</th>';
      html += '<th>Hostname</th>';
      html += '<th>Bind Type</th>';
      html += '<th>Bind Node</th>';
      html += '<th>Instance seq</th>';
      html += '</tr>';
      html += '</thead> ';
      cu.forEach(function (elem) {
        var name=elem.instance_name;
        var nameid=encodeName(name);
        html += "<tr class='row_element algoInstanceMenu' cuname='" + name + "' id='" +  nameid  + "'>";
        html += "<td class='name_element'>" +name + "</td>";
        html += "<td>"+ pather_selected + "</td>";
        html += "<td>"+ node_name_to_desc[pather_selected].eudk_script_language + "</td>";

        html += "<td>"+ elem.ndk_rpc_addr + "</td>";
        html += "<td>"+ elem.ndk_host_name + "</td>";
        html += "<td>"+ elem.script_bind_type + "</td>";
        html += "<td>"+ elem.script_bind_node + "</td>";
        html += "<td>"+ elem.instance_seq + "</td></tr>";
      });
    } else {
      html += '<tr class="algoMenu">';
      html += '<th>Name</th>';
      html += '<th>Description</th>';
      html += '<th>Language</th>';
      html += '</tr>';
      html += '</thead> ';
      cu.forEach(function (elem) {
        var name=elem.script_name;
        var nameid=encodeName(name);
        html += "<tr class='row_element algoMenu' cuname='" + name + "' id='" +  nameid  + "'>";
        html += "<td class='name_element'>" +elem.script_name + "</td>";
        html += "<td>"+ elem.script_description + "</td>";
        html += "<td>"+ elem.eudk_script_language + "</td></tr>";
      });
  } 
    html += '</table>';
    html += '</div>';
    html += '</div>';

    html += '<div class="box span12 hide" id="container-table-helper">';
    html += '<div class="box-content-helper span12">';
    html += '</div>';
    html += '</div>';

    html += '</div>';

    return html;

  }

  function generateNodeTable(cu, template) {
    var html = '<div class="row-fluid" id="table-space">';

    html += '<div class="box span12" id="container-main-table">';
    html += '<div class="box-content span12">';

    html += '<table class="table table-bordered" id="main_table-' + template + '">';
    html += '<thead class="box-header">';
    html += '<tr class="nodeMenu">';
    html += '<th>Node</th>';
    html += '<th>Type</th>';
    html += '<th>Registration Timestamp</th>';
    html += '<th>Hostname</th>';
    html += '<th>(RPC) address</th>';
    html += '<th>Status</th>';
    html += '<th>TimeStamp</th>';
    html += '<th>Uptime</th>';
    html += '<th>System Time</th>';
    html += '<th>User Time</th>';
    html += '<th>Parent</th>';

    html += '</tr>';


    html += '</thead> ';
    $(cu).each(function (i) {
      var cuname = encodeName(cu[i]);
      html += "<tr class='row_element nodeMenu' cuname='" + cu[i] + "' id='" + cuname + "'>";
      html += "<td class='name_element'>" + cu[i] + "</td>";
      html += "<td id='" + cuname + "_type'></td>";

      html += "<td id='" + cuname + "_timestamp'></td>";
      html += "<td id='" + cuname + "_hostname'></td>";
      html += "<td id='" + cuname + "_rpcaddress'></td>";
      html += "<td id='" + cuname + "_health_status'></td>";
      html += "<td id='" + cuname + "_health_timestamp'></td>";
      html += "<td id='" + cuname + "_health_uptime'></td>";
      html += "<td id='" + cuname + "_health_systemtime'></td>";
      html += "<td id='" + cuname + "_health_usertime'></td>";
      html += "<td id='" + cuname + "_parent'></td></tr>";

    });

    html += '</table>';
    html += '</div>';
    html += '</div>';

    html += '<div class="box span12 hide" id="container-table-helper">';
    html += '<div class="box-content-helper span12">';
    html += '</div>';
    html += '</div>';

    html += '</div>';

    return html;

  }
  function updateNodeTable(cu) {
    cu.forEach(function (v) {
      if (node_name_to_desc != null && node_name_to_desc[v] != null) {
        var elem = node_name_to_desc[v];

        if (elem.desc.hasOwnProperty("ndk_uid")) {
          var id = elem['desc'].ndk_uid;
          var cuname = encodeName(id);
          if (elem.desc.hasOwnProperty("ndk_heartbeat")) {
            $("#" + cuname + "_timestamp").html(elem.desc.ndk_heartbeat.$date);
          } else {
            $("#" + cuname + "_timestamp").html("NA");
          }
          if(elem.desc.hasOwnProperty("ndk_group_set")){
            $("#" + cuname + "_type").html(elem.desc.ndk_group_set);
          } else if(elem.desc.hasOwnProperty("ndk_sub_type")){
            $("#" + cuname + "_type").html(elem.desc.ndk_sub_type);

          } else{
            $("#" + cuname + "_type").html(elem.desc.ndk_type);
          }
          if (elem.desc.hasOwnProperty("ndk_host_name")) {
            $("#" + cuname + "_hostname").html(elem.desc.ndk_host_name);
          } else {
            $("#" + cuname + "_hostname").html("NA");

          }
          $("#" + cuname + "_rpcaddress").html(elem.desc.ndk_rpc_addr);
          if (elem.hasOwnProperty("parent")) {
            $("#" + cuname + "_parent").html(elem.parent);

          }
        }
      }
    });
  }

  function algoSave(json){
    jchaos.saveScript(json,function(data){
      console.log("saving script:"+JSON.stringify(json));
    });
    
  }

  function algoSaveInstance(json){
    jchaos.updateScriptInstance(json,node_name_to_desc[pather_selected],function(data){
      console.log("saving Instance:"+JSON.stringify(json));
    });
    

  }
  function newCuSave(json) {
    if ((node_selected == null || node_selected == "")) {
      if (json.ndk_parent == "") {
        alert("not US selected!");
        return;
      } else {
        console.log("using US specified into CU:" + json.ndk_parent);
        var us_list = jchaos.search(json.ndk_parent, "us", false, false);
        if (us_list.length == 0) {
          alert("US specified in CU does not exist (create before)");
          return;
        }
        node_selected = json.ndk_parent;
      }
    }
    if (json.hasOwnProperty("ndk_uid") && (json.ndk_uid != "")) {
      jchaos.node(node_selected, "get", "us", "", null, function (data) {
        console.log("adding \"" + json.ndk_uid + "\" to US:\"" + node_selected + "\"");
        json.ndk_parent = node_selected;
        if (data.us_desc.hasOwnProperty("cu_desc") && (data.us_desc.cu_desc instanceof Array)) {
          data.us_desc.cu_desc.push(json);
        } else {
          data.us_desc["cu_desc"] = [json];
        }
        jchaos.node(node_selected, "set", "us", "", data.us_desc, function (data) {
          console.log("unitServer save: \"" + name + "\" value:" + JSON.stringify(json));
        });
      });
    } else {
      alert("missing required field ndk_uid");
    }
  }
  function unitServerSave(json) {
    if ((json == null) || !json.hasOwnProperty("ndk_uid")) {
      alert("no ndk_uid key found");
      return;
    }
    if (json.ndk_uid == "") {
      alert("US name cannot be empty");
      return;
    }
    node_selected = json.ndk_uid;
    if (node_selected == null || node_selected == "") {
      alert("not US selected!");
      return;
    }

    var data = jchaos.node(node_selected, "get", "us", "", null, null);


    if ((data instanceof Object) && data.hasOwnProperty("us_desc")) {
      if (data.us_desc.hasOwnProperty("cu_desc") && (data.us_desc.cu_desc instanceof Array)) {
        data.us_desc.cu_desc.forEach(function (item) {
          var found = false;
          // remove just the cu not present in new configuration
          json.cu_desc.forEach(function (items) {
            if (items.ndk_uid == item.ndk_uid) {
              found = true;
            }
          });
          if (found == false) {
            if (off_line[item] !== false) {
              console.log("deleting cu:\"" + item.ndk_uid + "\"");
              jchaos.node(item.ndk_uid, "del", "cu", node_selected, null);
            }
          }
        });

      }
    }

    json.cu_desc.forEach(function (item) {
      item.ndk_parent = node_selected;
    });
    jchaos.node(node_selected, "set", "us", "", json, function (data) {
      console.log("unitServer save: \"" + node_selected + "\" value:" + JSON.stringify(json));
    });
  }
  function cuSave(json) {

    if ((json != null) && json.hasOwnProperty("ndk_uid")) {
      var name = json.ndk_uid;
      if (!json.hasOwnProperty("ndk_parent")) {
        alert("CU parent not defined");
        return
      }
      jchaos.node(json.ndk_uid, "set", "cu", json.ndk_parent, json, function (data) {
        console.log("cu save: \"" + node_selected + "\" value:" + JSON.stringify(json));
      });
    } else {
      alert("No ndk_uid field found");
    }
  }

  function agentSave(json) {
    if (json.hasOwnProperty("andk_node_associated") && (json.andk_node_associated instanceof Array)) {
      json.andk_node_associated.forEach(function (item) {
        jchaos.node(node_selected, "set", "agent", null, item, function (data) {
          console.log("agent save: \"" + node_selected + "\" value:" + JSON.stringify(json));
          if (item.node_log_at_launch) {
            jchaos.node(item.ndk_uid, "enablelog", "agent", null, null, function (data) {
            });
          } else {
            jchaos.node(item.ndk_uid, "disablelog", "agent", null, null, function (data) {

            });
          }
        });
      });
    } else {
      alert("No andk_node_associated field found");

    }
  }

  /***
   * 
   */
  function jsonEditWindow(name,jsontemp, jsonin){
    var instant = $('<div id=edit-' + name + '></div>').dialog({
      minWidth: hostWidth / 4,
      minHeight: hostHeight / 4,
      title: name,
      position: "center",
      resizable: true,
      buttons: [
        {
          text: "save", click: function (e) {
               // editor validation
           var errors = json_editor.validate();

          if (errors.length) {
            alert("JSON NOT VALID");
            console.log(errors);
          } else {
            // It's valid!
            var json_editor_value = json_editor.getValue();
            editorFn(json_editor_value);
          }
          $(this).remove();
    }
  }, {
        text: "download",click: function(e){
            var errors = json_editor.validate();

          if (errors.length) {
            alert("JSON NOT VALID");
            console.log(errors);
          } else {
            // It's valid!
            var json_editor_value = json_editor.getValue();
            var blob = new Blob([JSON.stringify(json_editor_value)], { type: "json;charset=utf-8" });
            saveAs(blob, name + ".json");          }
           
          }
        },
        {
          text: "close", click: function (e) {
            $("#edit-" + name).dialog('close');
          }
        }


      ],
      close: function (event, ui) {

        $(this).remove();
      },
      open: function () {
        console.log("Open Editor");
        var element = $("#edit-"+name);

        var jopt = {
          // Enable fetching schemas via ajax
          // The schema for the editor
          //theme: 'bootstrap2',
          ajax: true,
          schema: jsontemp,
    
          // Seed the form with a starting value
          startval: jsonin
        };
        if (json_editor != null) {
          delete json_editor;
        }
        JSONEditor.defaults.options.theme = 'bootstrap2';
        JSONEditor.defaults.options.iconlib = "bootstrap2";
    
        //    JSONEditor.defaults.iconlib = 'fontawesome4';
        json_editor = new JSONEditor(element.get(0), jopt);
      }
    });
  }
  /***
   * JSON EDITOR
   */
  function jsonEdit(jsontemp, jsonin) {
    var element = $("#json-edit");
    var jopt = {
      // Enable fetching schemas via ajax
      // The schema for the editor
      //theme: 'bootstrap2',
      ajax: true,
      schema: jsontemp,

      // Seed the form with a starting value
      startval: jsonin
    };
    $("#json-edit").empty();
    if (json_editor != null) {
      delete json_editor;
    }
    JSONEditor.defaults.options.theme = 'bootstrap2';
    JSONEditor.defaults.options.iconlib = "bootstrap2";

    //    JSONEditor.defaults.iconlib = 'fontawesome4';
    json_editor = new JSONEditor(element.get(0), jopt);
    $("#mdl-jsonedit").modal("show");
    //json_editor.enable();
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
      updateLog(node_selected);
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
      if (node_multi_selected.length > 1) {
        jchaos.snapshot(value, "create", node_multi_selected, function () {
        });

      } else {
        jchaos.snapshot(value, "create", node_selected, function () {
          updateSnapshotTable(cu);

        });
      }
      //var snap_table = $(this).find('a.show_snapshot');
    });

    $("#snap-close").on('click', function () {
      $("#mdl-snap").modal("hide");
      cu_name_to_saved = [];
    });


    $("a.show_snapshot").click(function () {

      updateSnapshotTable(node_selected);
    });

    $("#snap-delete").on('click', function (e) {
      if (snap_selected != "") {
        jchaos.snapshot(snap_selected, "delete", "", "", function () {
          updateSnapshotTable(node_selected);

        });

      }
    });
    $("#snap-show").on('click', function (e) {

      if (snap_selected != "") {
        var dataset = jchaos.snapshot(snap_selected, "load", null, "", null);
        var jsonhtml = json2html(dataset, options, node_selected);
        save_obj = {
          obj: dataset,
          fname: "snapshot_" + snap_selected,
          fext: "json"
        };
        if (isCollapsable(dataset)) {
          jsonhtml = '<a  class="json-toggle"></a>' + jsonhtml;
        }
        updateSnapshotTable(node_selected);

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
      var dataset = jchaos.getDesc(node_selected, null);
      var jsonhtml = json2html(dataset, options, node_selected);
      save_obj = {
        obj: dataset,
        fname: "description_" + encodeName(node_selected),
        fext: "json"
      };
      if (isCollapsable(dataset)) {
        jsonhtml = '<a  class="json-toggle"></a>' + jsonhtml;
      }
      $("#desc_text").html("Description of " + node_selected);
      $("#cu-description").html(jsonhtml);
    });

  }

  function jsonEnableContext() {
    $.contextMenu({
      selector: '.json-key',
      build: function ($trigger, e) {
        var cuitem = {};
        var portdir = $(e.currentTarget).attr("portdir");
        var portname = $(e.currentTarget).attr("portname");
        var portarray = $(e.currentTarget).attr("portarray");
        cuitem['show-graph'] = { name: "Show Graphs.." };
        if (portarray == "0") {
          cuitem['plot-x'] = { name: "Plot " + portdir + "/" + portname + " on X" };
          cuitem['plot-y'] = { name: "Plot " + portdir + "/" + portname + " on Y" };
          cuitem['plot-histo'] = { name: "Histogram " + portdir + "/" + portname };

        } else {


          cuitem['plot-x'] = { name: "Plot Array(" + portarray + ") " + portdir + "/" + portname + "[] on X" };
          cuitem['plot-y'] = { name: "Plot Array(" + portarray + ") " + portdir + "/" + portname + "[] on Y" };
          cuitem['plot-histo'] = { name: "Histogram Array(" + portarray + ") " + portdir + "/" + portname + "[] on X" };

        }



        cuitem['sep1'] = "---------";

        cuitem['quit'] = {
          name: "Quit", icon: function () {
            return 'context-menu-icon context-menu-icon-quit';
          }
        };

        return {

          callback: function (cmd, options) {

            var fullname;
            if (portarray == "0") {
              fullname = node_selected + "/" + portdir + "/" + portname;
            } else {
              fullname = node_selected + "/" + portdir + "/" + portname + "[0]";
            }
            if (cmd == "show-graph") {
              $("#mdl-graph-list").modal("show");
            } else if (cmd == "plot-x") {
              $("#mdl-graph").modal("show");

              $("#trace-name").val(node_selected);
              $("#xvar").val(fullname);

            } else if (cmd == "plot-y") {
              $("#mdl-graph").modal("show");

              $("#trace-name").val(node_selected);
              $("#yvar").val(fullname);

            } else if (cmd == "plot-histo") {
              $("#mdl-graph").modal("show");

              $("#trace-name").val(node_selected);
              $("#yvar").val("histogram");
              $("#xvar").val(fullname);
              $("#xtype").val("linear");
              $("#ytype").val("linear");

              $("#graphtype").val("histogram");

            }
            return;
          },
          items: cuitem
        }
      }
    });
  }
  /***
   * Setup CU Dataset
   * **/

  function datasetSetup() {
    $("a.show_dataset").on('click', function () {
      var dataset = jchaos.getChannel(node_selected, -1, null);
      var converted = convertBinaryToArrays(dataset[0]);
      var jsonhtml = json2html(converted, options, node_selected);
      save_obj = {
        obj: dataset[0],
        fname: "dataset_" + encodeName(node_selected),
        fext: "json"
      };

      if (isCollapsable(dataset[0])) {
        jsonhtml = '<a class="json-toggle"></a>' + jsonhtml;
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
      jsonEnableContext();
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

  function jsonSetup(dom) {
    var collapsed = options.collapsed;
    $(dom).on("click", "a.json-toggle", function () {
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


    $(dom).on("click", "span.json-key", function () {
      var id = this.id;
      var attr = id.split("-")[1];

      $("#attr-" + attr).toggle();
      //var tt =prompt('type value');
      return false;
    });

    //$("input.json-keyinput").keypress(function (e) {
    $(dom).on("keypress", "input.json-keyinput", function (e) {
      if (e.keyCode == 13) {
        var id = this.id;
        var attr = id.split("-")[1];
        jchaos.setAttribute(node_selected, attr, this.value, function () {
          instantMessage("Attribute ", "\"" + attr + "\"=\"" + this.value + "\" sent", 1000)

        });
        $("#" + this.id).toggle();
        return false;
      }
      //var tt =prompt('type value');
      return this;
    });
    /* Simulate click on toggle button when placeholder is clicked */
    //$("a.json-placeholder").click(function () {
    $(dom).on("click", "a.json-placeholder", function () {
      $(dom).siblings('a.json-toggle').click();
      return false;
    });
    /* Trigger click to collapse all nodes */

    /*if (options.collapsed == true) {
      $(this).find('a.json-toggle').click();
    }*/

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
      if (($("#xvar").val() == "") && ($("#xtype option:selected").val() == "datetime")) {
        $("#xvar").val("timestamp")
      }
      if (($("#yvar").val() == "") && ($("#ytype option:selected").val() == "datetime")) {
        $("#yvar").val("timestamp")
      }

      if ((graph_selected != null) && (high_graphs[graph_selected] != null)) {
        // initialize with the value of selected graph
        var info = high_graphs[graph_selected].highchart_opt;
        $("#graph_save_name").val(graph_selected);
        if (info.xAxis instanceof Array) {
          $("#xname").val(info.xAxis[0].title.text);

        } else {
          $("#xname").val(info.xAxis.title.text);
        }

        // $("#xtype option:selected").val(info.xAxis.type);
        if (info.xAxis.type != null && info.xAxis.type != "") {
          $("#xtype").val(info.xAxis.type);
        }

        $("#xmax").val(info.xAxis.max);
        $("#xmin").val(info.xAxis.min);
        if (info.yAxis instanceof Array) {
          $("#yname").val(info.yAxis[0].title.text);
        } else {
          $("#yname").val(info.yAxis.title.text);
        }
        //    $("#ytype option:selected").val(info.yAxis.type);
        if (info.yAxis.type != null && info.yAxis.type != "") {
          $("#ytype").val(info.yAxis.type);
        }

        $("#ymax").val(info.yAxis.max);
        $("#ymin").val(info.yAxis.min);
        $("#graph-width").val(high_graphs[graph_selected].width);
        $("#graph-high").val(high_graphs[graph_selected].height);
        $("#graph-update").val(high_graphs[graph_selected].update);
        $("#graph-keepseconds").val(info.timebuffer);
        if (info.shift == "true") {
          $radio.filter("[value=true]").prop('checked', true);

        } else {
          $radio.filter("[value=false]").prop('checked', true);

        }

        $("#trace-type").val(info.tracetype);
        $("#graphtype").val(info.chart.type);
        $("#table_graph_items").find("tr:gt(0)").remove();
        var trace = high_graphs[graph_selected].trace;
        for (var k = 0; k < trace.length; k++) {
          var tname = encodeName(trace[k].name);
          var xpath, ypath;
          xpath = encodeCUPath(trace[k].x);
          ypath = encodeCUPath(trace[k].y);
          var color = "";
          if (trace[k].hasOwnProperty("color")) {
            if (trace[k].color != null) {
              color = trace[k].color;
            }
          }
          $("#table_graph_items").append('<tr class="row_element" id="trace-' + tname + '" tracename="' + trace[k].name + '""><td>' + trace[k].name + '</td><td>' + xpath + '</td><td>' + ypath + '</td><td>' + color + '</td></tr>');

        };
      }

    });
    $(main_dom).on("click", "#table_graph_items tbody tr", function (e) {
      $(".row_element").removeClass("row_snap_selected");
      var tname = $(this).attr("tracename");
      $(this).addClass("row_snap_selected");
      $("#trace-name").val(tname);
      var tlist = getElementByName(tname, trace_list);
      $("#xvar").val(encodeCUPath(tlist.x));
      $("#yvar").val(encodeCUPath(tlist.y));
      if (tlist.hasOwnProperty("color")) {
        $("#trace-color").val(tlist.color);
      }
      trace_selected = $(this).attr("id");
    }
    );
    $("#mdl-graph").css('width', 800);
    $("#mdl-graph-list").css('width', 800);

    $("#graph-save").attr('disabled', true);
    $("#graph-run").attr('disabled', true);

    $("#graph-close").on('click', function () {
      $("#mdl-graph").modal("hide");

    });
    $("xtype").on("change", function () {
      if ($("#xtype option:selected").val() == "datetime") {
        $("#xvar").val("timestamp");
      }
    });
    $("ytype").on("change", function () {
      if ($("#ytype option:selected").val() == "datetime") {
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

      runGraph();
      $("#mdl-graph").modal("hide");

    });

    $("#graph-list-run").on('click', function () {
      runGraph();
      $("#mdl-graph-list").modal("hide");

    });
    $("#graph-list-edit").on('click', function () {
      if (graph_selected != null) {
        $("#mdl-graph-list").modal("hide");
        $("#mdl-graph").modal("show");
      }
    });
    $("#graph-delete").on('click', function () {
      if (graph_selected == null) {
        alert("no graph selected");
        return;
      }
      delete high_graphs[graph_selected];


      if (active_plots[graph_selected] != null) {
        if (active_plots[graph_selected].hasOwnProperty('interval')) {

          clearInterval(active_plots[graph_selected].interval);
          delete active_plots[graph_selected].interval;
        }
        $("#dialog-" + active_plots[grap_selected].count).modal("hide");
        delete active_plots[graph_selected];
      }
      graph_selected = null;
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
      var xtype = $("#xtype option:selected").val();
      var ytype = $("#ytype option:selected").val();
      var trace_color = $("#trace-color").val();
      var tmpx, tmpy, tmpc;
      if (trace_color != null && trace_color != "") {
        tmpc = trace_color;
      }
      if (xtype == "datetime") {
        xpath = "timestamp";
      }
      if (ytype == "datetime") {
        ypath = "timestamp";
      }
      tmpx = decodeCUPath(xpath);
      tmpy = decodeCUPath(ypath);
      var tname = encodeName(tracename);
      $("#table_graph_items").append('<tr class="row_element" id="trace-' + tname + '" tracename="' + tracename + '"><td>' + tracename + '</td><td>' + xpath + '</td><td>' + ypath + '</td></tr>');
      if (tmpx == null && tmpy == null) {
        alert("INVALID scale type options");
      }
      trace_selected = tname;
      var telem = {
        name: tracename,
        x: tmpx,
        y: tmpy,
        color: tmpc
      };
      trace_list.push(telem);

    });

    $("#trace-replace").click(function () {
      var tracename = $("#trace-name").val();
      var trace_color = $("#trace-color").val();
      var xpath = $("#xvar").val();
      var ypath = $("#yvar").val();
      var tmpx, tmpy, tmpc;
      if (trace_color != null && trace_color != "") {
        tmpc = trace_color;
      }
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
      if ((tmpx == null) && (tmpy == null)) {
        alert("INVALID paths");
        return;
      }


      var tname = encodeName(tracename);
      var replace_row = '<tr class="row_element" id="trace-' + tname + '" tracename="' + tracename + '"><td>' + tracename + '</td><td>' + xpath + '</td><td>' + ypath + '</td><td>' + trace_color + '</td></tr>';
      var toreplaceTrace = $("#" + trace_selected).attr("tracename");

      $("#" + trace_selected).replaceWith(replace_row);

      var telem = {
        name: tracename,
        x: tmpx,
        y: tmpy,
        color: tmpc
      };
      replaceElementByName(toreplaceTrace, telem, trace_list);
      trace_selected = tname;
    });

    $("#trace-up").click(function (e) {
      var tname = $("#" + trace_selected);
      var prev = $(tname).prev();
      var index = $(tname).index();
      var index_prev = $(prev).index();

      $(tname).insertBefore(prev);

      if (index > index_prev) {
        var elem = trace_list[index - 1];
        trace_list[index - 1] = trace_list[index];
        trace_list[index] = elem;
      }

    });
    $("#trace-down").click(function (e) {
      var tname = $("#" + trace_selected);
      var next = $(tname).next();
      var index = $(tname).index();
      var index_after = $(next).index();

      $(tname).insertAfter(next);
      if (index_after > index) {
        var elem = trace_list[index_after];
        trace_list[index_after] = trace_list[index];
        trace_list[index] = elem;
      }

    });
    $("#trace-rem").click(function () {
      if (trace_selected != null) {
        var tname = $("#" + trace_selected).attr("tracename");
        $("#" + trace_selected).remove();
        removeElementByName(tname, trace_list);
        trace_selected = null;

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
  function setupCU(template) {
    $("#main_table-" + template + " tbody tr").click(function (e) {
      mainTableCommonHandling("main_table-" + template, e, "cu");
    });
    n = $('#main_table-' + template + ' tr').size();
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
        jchaos.setSched(node_selected, value);

      }
    });
    $(".cucmd").click(function () {
      var alias = $(this).attr("cucmdid");
      var parvalue = $(this).attr("cucmdvalue");
      var mult = $(this).attr("cucmdvalueMult");

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
        if ((parvalue != null) && (mult != null)) {
          parvalue = parvalue * mult;
        }
        item['value'] = parvalue;
      });

      cmdparam = buildCmdParams(arglist);
      if (node_multi_selected.length > 0) {
        cuselection = node_multi_selected;
      } else {
        cuselection = node_selected;
      }
      jchaos.sendCUCmd(cuselection, alias, cmdparam, function (d) {
        var pp;
        if ((cmdparam != null) && (cmdparam instanceof Object)) {
          pp = JSON.stringify(cmdparam);
        } else {
          pp = cmdparam;
        }
        instantMessage(cuselection, "Command:\"" + alias + "\" params:\"" + pp + "\" sent", 1000)
      });

    });

    $(".cucmdbase").click(function () {
      var cmd = $(this).attr("cucmdid");
      var cuselection;
      if (node_multi_selected.length > 0) {
        cuselection = node_multi_selected;
      } else {
        cuselection = node_selected;
      }
      if (cuselection != null && cmd != null) {
        if (cmd == "init") {
          jchaos.node(cuselection, "init", "cu", null, function (data) {
            instantMessage("Command ", "Command:\"" + cmd + "\" sent", 1000);

          });
        } else if (cmd == "deinit") {
          jchaos.node(cuselection, "deinit", "cu", null, function (data) {
            instantMessage("Command ", "Command:\"" + cmd + "\" sent", 1000);

          });
        } else if (cmd == "bypasson") {
          jchaos.setBypass(cuselection, true, function (data) {
            instantMessage("Command ", "Command:\"" + cmd + "\" sent", 1000);

          });
          return;
        } else if (cmd == "bypassoff") {
          jchaos.setBypass(cuselection, false, function (data) {
            instantMessage("Command ", "Command:\"" + cmd + "\" sent", 1000);

          });
          return;
        } else if (cmd == "load") {
          jchaos.loadUnload(cuselection, true, function (data) {
            instantMessage("Command ", "Command:\"" + cmd + "\" sent", 1000);

          });
          return;
        } else if (cmd == "unload") {
          jchaos.loadUnload(cuselection, false, function (data) {
            instantMessage("Command ", "Command:\"" + cmd + "\" sent", 1000);

          });
          return;
        }

        jchaos.sendCUCmd(cuselection, cmd, "", function (data) {
          instantMessage("Command ", "Command:\"" + cmd + "\" sent", 1000);

        });

      }
    });
    $("#command-send").click(function () {
      var cuselection;
      var cmdselected = $("#cu_full_commands option:selected").val();
      var arguments = retriveCurrentCmdArguments(cmdselected);
      var force = $("#cmd-force option:selected").val();

      arguments.forEach(function (item, index) {
        var value = $("#" + cmdselected + "_" + item["name"]).val();
        if ((value == null || value == "") && (item["optional"] == false)) {
          alert("argument '" + item['name'] + "' is required in command:'" + cmdselected + "'");
          return;
        }
        item['value'] = value;
      });
      var parm = buildCmdParams(arguments);
      if (node_multi_selected.length > 0) {
        cuselection = node_multi_selected;
      } else {
        cuselection = node_selected;
      }
      jchaos.sendCUFullCmd(cuselection, cmdselected, parm, ((force == "normal") ? 0 : 1), 0, function () {
        $("#mdl-commands").modal("hide");
        instantMessage("Command ", "Command:\"" + cmdselected + "\"  params:" + parm + " sent", 1000);

      });
    });
    $("#command-close").click(function () {
      $("#mdl-commands").modal("hide");

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
    $.contextMenu({
      selector: '.cuMenu',
      build: function ($trigger, e) {
        var cuname = $(e.currentTarget).attr("id");
        var cindex = node_name_to_index[cuname];
        var cuitem = updateCUMenu(node_live_selected[cindex], cuname);
        cuitem['sep1'] = "---------";

        cuitem['quit'] = {
          name: "Quit", icon: function () {
            //$('.context-menu-list').trigger('contextmenu:hide');
            return 'context-menu-icon context-menu-icon-quit';
          }
        };

        return {

          callback: function (cmd, options) {
            // $('.context-menu-list').trigger('contextmenu:hide');

            executeCUMenuCmd(cmd, options);
            return;

          },
          items: cuitem
        }
      }


    });
    $("#mdl-dataset").draggable();
    $("#mdl-description").draggable();
    $("#mdl-snap").draggable();
    $("#mdl-log").resizable().draggable();
    configureSliderCommands("slider-GAIN", "image_gain");
    configureSliderCommands("slider-BRIGHTNESS", "image_brightness");
    configureSliderCommands("slider-SHUTTER", "image_shutter");
    configureSliderCommands("slider-CONTRAST", "image_contrast");
    configureSliderCommands("slider-SHARPNESS", "image_sharpness");
    $(main_dom).on("keypress", "input.cucmdattr", function (e) {
      if (e.keyCode == 13) {
        var id = this.id;
        var attr = id.split("-")[1];
        jchaos.setAttribute(node_selected, attr, this.value, function () {
          instantMessage("Attribute ", "\"" + attr + "\"=\"" + this.value + "\" sent", 1000)

        });
        $("#" + this.id).toggle();
        return false;
      }
      //var tt =prompt('type value');
      return this;
    });

  }
  function executeCUMenuCmd(cmd, opt) {
    if (cmd == "quit") {
      return;
    }
    if(cmd=="snapshot-cu"){
      var instUnique = (new Date()).getTime();

      getEntryWindow("Snapshotting","Snap Name", "NONAME_"+instUnique,"Create",function(inst_name){
        jchaos.snapshot(inst_name, "create", node_multi_selected, function () {
          instantMessage("Snapshot \""+inst_name+"\"", " created ", 1000);
  
        });
       
  
      },"Cancel");  
     
    } else if(cmd=="tag-cu"){
      getNEntryWindow("Tagging",["Tag Name","Duration Type","Duration"], ["NONAME_"+instUnique,"1","1"],"Create",function(inst_name){
        if(Number(inst_name[1])==1){
          jchaos.tag(inst_name[0], node_multi_selected,Number(inst_name[1]),Number(inst_name[2]), function () {
          
            instantMessage("Creating CYCLE Tag \""+inst_name[0]+"\"", " during "+inst_name[2] + " cycles", 3000);
    
          });    
        } else if(Number(inst_name[1])==2){
          jchaos.tag(inst_name[0], node_multi_selected,Number(inst_name[1]),Number(inst_name[2]), function () {
          
            instantMessage("Creating TIME Tag \""+inst_name[0]+"\"", " during: "+inst_name[2]+ " ms", 3000);
    
          });
        }
        
       
  
      },"Cancel");  
    } else if (cmd == "load") {

      jchaos.loadUnload(node_multi_selected, true, function (data) {
        instantMessage("LOAD ", "Command:\"" + cmd + "\" sent", 1000);
        //  $('.context-menu-list').trigger('contextmenu:hide')

      });

    } else if (cmd == "unload") {
      jchaos.loadUnload(node_multi_selected, false, function (data) {
        instantMessage("UNLOAD ", "Command:\"" + cmd + "\" sent", 1000);
        //   $('.context-menu-list').trigger('contextmenu:hide')

      });
    } else if (cmd == "init") {
      jchaos.node(node_multi_selected, "init", "cu", null, null, function (data) {
        instantMessage("INIT ", "Command:\"" + cmd + "\" sent", 1000);
        //    $('.context-menu-list').trigger('contextmenu:hide')

      });
    } else if (cmd == "deinit") {
      jchaos.node(node_multi_selected, "deinit", "cu", null, null, function (data) {
        instantMessage("DEINIT ", "Command:\"" + cmd + "\" sent", 1000);
        //    $('.context-menu-list').trigger('contextmenu:hide')

      });
    } else if (cmd == "open-ctrl") {
      var desc = node_name_to_desc[encodeName(node_multi_selected[0])];
      var tt = getInterfaceFromClass(desc.instance_description.control_unit_implementation);
      if(node_multi_selected.length>1){
        openControl("Multi Control " + node_multi_selected[0]+"...", node_multi_selected, tt, 1000);
      } else {
        openControl("Control " + node_multi_selected[0], node_multi_selected, tt, 1000);
      }
      
    } else if (cmd == "show-dataset") {
      showDataset(node_multi_selected[0], node_multi_selected[0], 1000);
    } else if (cmd == "show-desc") {
      jchaos.getDesc(node_multi_selected[0], function (data) {
        showJson("Description " + node_multi_selected[0], node_multi_selected[0], data);
      });

    } else if (cmd == "show-picture") {
      jchaos.getChannel(node_multi_selected[0], -1, function (imdata) {
        var cu = imdata[0];
        var refresh = 1000;
        if (cu.hasOwnProperty("health") && cu.health.hasOwnProperty("cuh_dso_prate")) {
          refresh = 1000 / (cu.health.cuh_dso_prate);
        }
        if (cu && cu.hasOwnProperty("output") &&
          cu.output.hasOwnProperty("FRAMEBUFFER") &&
          cu.output.FRAMEBUFFER.hasOwnProperty("$binary") &&
          cu.output.FRAMEBUFFER.$binary.hasOwnProperty("base64")) {
          // $("#mdl-dataset").modal("hide");

          showPicture(node_multi_selected[0], "png", node_selected, refresh);
        } else {
          alert(node_multi_selected[0] + " cannot be viewed as a Picture, missing 'FRAMEBUFFER'");
        }
      });

    } else {
      jchaos.sendCUCmd(node_multi_selected, cmd, "", function (data) {
        instantMessage("Command ", "Command:\"" + cmd + "\" sent", 1000);
        //   $('.context-menu-list').trigger('contextmenu:hide')

      });
    }
  }
  function buildCUInteface(cuids, cutype, template) {
    if (cuids == null) {
      alert("NO CU given!");
      return;
    }
    if (!(cuids instanceof Array)) {
      node_list = [cuids];
    } else {
      node_list = cuids;
    }
    if (cutype == null) {
      cutype = "generic";
    }

    if ((cutype != "generic") && (cutype != "all") && (cutype != "ALL")) {
      node_list = cusWithInterface(node_list, cutype);
    }

    node_list.forEach(function (elem, id) {
      var name = encodeName(elem);
      node_name_to_index[name] = id;
      health_time_stamp_old[name] = 0;
      off_line[name] = false;
    });
    // cu_selected = cu_list[0];
    node_selected = null;
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
      htmlt = generatePStable(node_list, template);
      htmlc = generatePSCmd(template);
      updateTableFn = updatePStable;

    } else if ((cutype.indexOf("SCActuator") != -1)) {
      htmlt = generateScraperTable(node_list, template);
      htmlc = generateScraperCmd(template);
      updateTableFn = updateScraperTable;


    } else if ((cutype.indexOf("RTCamera") != -1)) {
      htmlt = generateCameraTable(node_list, template);
      updateTableFn = updateCameraTable;

    } else {
      htmlt = generateGenericTable(node_list, template);
      htmlc = generateGenericControl(template);
      updateTableFn = updateGenericControl;
    }

    $("div.specific-table-" + template).html(htmlt);
    $("div.specific-control-" + template).html(htmlc);
    setupCU(template);

    if ((node_list_interval != null)) {
      clearInterval(node_list_interval);

    }
    node_list_interval = setInterval(function () {
      var channel_sel = -1;
      /*
      node_live_selected=  jchaos.getChannel(node_list, -1, null);
      if (node_live_selected.length == 0) {
        return;
      }
      if(node_selected!=null &&  node_name_to_index[encodeName(node_selected)] !=null){
        var index = node_name_to_index[encodeName(node_selected)];
        curr_cu_selected = node_live_selected[index];
        updateGenericControl(curr_cu_selected);
        
      }      
      updateGenericTableDataset(node_live_selected,curr_cu_selected);
      
      updateTableFn(node_live_selected,curr_cu_selected);

      
      //  $("div.cu-generic-control").html(chaosGenericControl(cu_live_selected[index]));
      if ($("#cu-dataset").is(':visible') && !notupdate_dataset) {
        var converted = convertBinaryToArrays(curr_cu_selected);
        var jsonhtml = json2html(converted, options, node_selected);
        if (isCollapsable(converted)) {
          jsonhtml = '<a  class="json-toggle"></a>' + jsonhtml;
        }

        $("#cu-dataset").html(jsonhtml);

      }*/
      if (updateTableFn == updateGenericControl) {
        channel_sel = 255;
      }
      jchaos.getChannel(node_list, channel_sel, function (dat) {
        node_live_selected = dat;
        if (node_live_selected.length == 0) {
          return;
        }

        if (node_selected != null && node_name_to_index[encodeName(node_selected)] != null) {
          var index = node_name_to_index[encodeName(node_selected)];
          curr_cu_selected = node_live_selected[index];
          updateGenericControl(curr_cu_selected);

        }
        updateGenericTableDataset(node_live_selected, curr_cu_selected);

        updateTableFn(node_live_selected, curr_cu_selected);


        //  $("div.cu-generic-control").html(chaosGenericControl(cu_live_selected[index]));
        /* if ($("#cu-dataset").is(':visible') && !notupdate_dataset) {
           if(channel_sel == -1){
             var converted = convertBinaryToArrays(curr_cu_selected);
             var jsonhtml = json2html(converted, options, node_selected);
             if (isCollapsable(converted)) {
               jsonhtml = '<a  class="json-toggle"></a>' + jsonhtml;
             }
   
             $("#cu-dataset").html(jsonhtml);
           }  else {
           jchaos.getChannel(node_selected, -1, function (datone) {
           curr_cu_selected=datone;
           var converted = convertBinaryToArrays(datone);
           var jsonhtml = json2html(converted, options, node_selected);
           if (isCollapsable(converted)) {
             jsonhtml = '<a  class="json-toggle"></a>' + jsonhtml;
           }
 
           $("#cu-dataset").html(jsonhtml);
         });
       }
       };*/
      });



      // update all generic


    }, options.Interval, updateTableFn);

    installCheckLive();

  }

  function executeNodeMenuCmd(cmd, opt) {
    if (cmd == "edit-nt_agent") {
      var templ = {
        $ref: "agent.json",
        format: "tabs"
      }
      jchaos.node(node_selected, "info", "agent", "", null, function (data) {
        if (data != null) {
          editorFn = agentSave;
          jsonEdit(templ, data);
          if (data.hasOwnProperty("andk_node_associated") && (data.andk_node_associated instanceof Array)) {
            //rimuovi tutte le associazioni precedenti.
            data.andk_node_associated.forEach(function (item) {
              if (item.hasOwnProperty("ndk_uid")) {
                jchaos.node(node_selected, "del", "agent", item.ndk_uid, function (daa) { });
              }
            });
          }
        };
      });
      return;
    } else if (cmd == "edit-nt_control_unit") {
      var templ = {
        $ref: "cu.json",
        format: "tabs"
      }
      jchaos.node(node_selected, "get", "cu", "", null, function (data) {
        if (data != null) {
          editorFn = cuSave;
          jsonEdit(templ, data);
        }
      });
      return;
    } else if (cmd == "edit-nt_unit_server") {
      var templ = {
        $ref: "us.json",
        format: "tabs"
      }
      if (node_selected == null || node_selected == "") {
        alert("not US selected!");
        return;
      }
      jchaos.node(node_selected, "get", "us", "", null, function (data) {
        if (data.hasOwnProperty("us_desc")) {
          editorFn = unitServerSave;
          jsonEdit(templ, data.us_desc);
        }
      });
      return;
    } else if (cmd == "new-nt_unit_server") {
      var templ = {
        $ref: "us.json",
        format: "tabs"
      }
      editorFn = unitServerSave;
      jsonEdit(templ, null);
      return;
    } else if (cmd == "del-nt_unit_server") {

      confirm("Delete US", "Your are deleting US: " + node_selected, "Ok", function () {
        jchaos.node(node_selected, "del", "us", null, null);
      }, "Cancel");
      return;
    } else if (cmd == "del-nt_control_unit") {
      node_multi_selected.forEach(function (nod) {
        var desc = jchaos.getDesc(nod, null);
        if (desc[0] != null && desc[0].hasOwnProperty("instance_description")) {
          var parent = desc[0].instance_description.ndk_parent;
          confirm("Delete CU", "Your are deleting CU: \"" + nod + "\"(" + parent + ")", "Ok", function () {
            jchaos.node(nod, "del", "cu", parent, null);
          }, "Cancel");
        }
      });
      return;
    } else if (cmd == "copy-nt_control_unit") {


      jchaos.node(node_selected, "get", "cu", "", null, function (data) {
        if (data != null) {
          cu_copied = data;
        //  copyToClipboard(JSON.stringify(data));
        }
      });
      return;
    } else if (cmd == "save-nt_control_unit") {


      jchaos.node(node_selected, "get", "cu", "", null, function (data) {
        if (data != null) {
          if (data instanceof Object) {
            var tmp = { cu_desc: data };
            var blob = new Blob([JSON.stringify(tmp)], { type: "json;charset=utf-8" });
            saveAs(blob, node_selected + ".json");
          }
        }
      });
      return;
    } else if (cmd == "paste-nt_control_unit") {
      var copia = cu_copied;
      /*check the status of the device must be not alive*/

      copia.ndk_parent = node_selected;
      confirm("Move or Copy", "Copy or Moving CU: \"" + cu_copied.ndk_uid + "\" into US:\"" + node_selected + "\"", "Move", function () {
        if (off_line[cu_copied.ndk_uid] == false) {
          alert("CU " + cu_copied.ndk_uid + " cannot be MOVED if alive, please bring it to 'unload' state");
          return;
        }
        jchaos.node(cu_copied.ndk_uid, "set", "cu", node_selected, copia, function () { });
      }, "Copy", function () {

        jchaos.node(cu_copied.ndk_uid + "_copied", "set", "cu", node_selected, copia, function () {
          alert("Copied and renamed:\"" + cu_copied.ndk_uid + "_copied" + "\"");
        });

      });
      return;
    } else if (cmd == "copy-nt_unit_server") {
      jchaos.node(node_selected, "get", "us", "", null, function (data) {
        if (data.hasOwnProperty("us_desc")) {
          us_copied = data.us_desc;
          copyToClipboard(JSON.stringify(data));

        }
      });
      return;
    } else if (cmd == "save-nt_unit_server") {
      jchaos.node(node_selected, "get", "us", "", null, function (data) {
        if (data.hasOwnProperty("us_desc")) {
          if (data.us_desc instanceof Object) {
            var blob = new Blob([JSON.stringify(data)], { type: "json;charset=utf-8" });
            saveAs(blob, node_selected + ".json");
          }

        }
      });
      return;
    } else if(cmd =="new-nt_control_unit-fromfile"){
      getFile("LOAD JSON CU description", "select the JSON to load", function (config) {
        //console.log("loaded:"+JSON.stringify(data));
        confirm("Add CU " + config.cu_desc.ndk_uid, "Add CU to " + node_selected + "?", "Add", function () {
          if (config.hasOwnProperty("cu_desc")) {
            var templ = {
              $ref: "cu.json",
              format: "tabs"
            }
            editorFn = newCuSave;
            var tmp = config.cu_desc;
            tmp.ndk_parent=node_selected;
            jsonEdit(templ, tmp);
          
          }
        }, "Cancel", function () {
        });
        
      });
      return;
    } else if (cmd.includes("new-nt_control_unit")) {
      var regex = /new-nt_control_unit-(.*)$/;
      var match = regex.exec(cmd);
      if (match != null) {
        var template = cu_templates[match[1]];
        if (template != null) {
          console.log("selected template:\"" + match[1]);
          template["ndk_parent"] = node_selected;
          var templ = {
            $ref: "cu.json",
            format: "tabs"
          }
          editorFn = newCuSave;

          jsonEdit(templ, template);

        } else {
          // custom
          var templ = {
            $ref: "cu.json",
            format: "tabs"
          }

          editorFn = newCuSave;
          jsonEdit(templ, template);

        }
      }
      return;
    } else if (cmd == "paste-nt_unit_server") {
      alert("Not Implemented, try with Edit.. ");
      return;
    } else if (cmd == "start-node") {
      jchaos.node(node_selected, "start", "us", function () {
        instantMessage("US START", "Starting " + node_selected + " via agent", 1000);
      });
      return;
    } else if (cmd == "stop-node") {
      jchaos.node(node_selected, "stop", "us", function () {
        instantMessage("US STOP", "Stopping " + node_selected + " via agent", 1000);

      });
      return;
    } else if (cmd == "log-node") {
      jchaos.node(node_selected, "enablelog", "agent", null, null, function (data) {
        logNode(node_selected);

      });
    } else if (cmd == "kill-node") {
      confirm("Do you want to KILL?", "Pay attention ANY CU will be killed as well", "Kill",
        function () {
          jchaos.node(node_selected, "kill", "us", function () {
            instantMessage("US KILL", "Killing " + node_selected + " via agent", 1000);
          })
        }, "Joke", function () { });
      return;
    } else if (cmd == "restart-node") {
      confirm("Do you want to RESTART?", "Pay attention ANY CU will be restarted as well", "Restart",
        function () {
          jchaos.node(node_selected, "restart", "us", function () {
            instantMessage("US RESTARTING", "Restarting " + node_selected + " via agent", 1000);
          })
        }, "Joke", function () { });
      return;
    } else if (cmd == "associate-node") {
      var templ = {
        $ref: "agent.json",
        format: "tabs"
      }
      jchaos.node(node_selected, "info", "agent", "", null, function (data) {
        if (data != null) {

          if (data.hasOwnProperty("andk_node_associated") && (data.andk_node_associated instanceof Array)) {
            //rimuovi tutte le associazioni precedenti.
            var found = 0;
            data.andk_node_associated.forEach(function (item) {
              if (item.hasOwnProperty("ndk_uid")) {
                if (item.ndk_uid == us_copied.ndk_uid) {
                  alert("node already associated");
                  found = 1;
                }
                jchaos.node(node_selected, "del", "agent", item.ndk_uid, function (daa) { });
              }
            });
            if (found == 0) {
              var tmp = {
                ndk_uid: us_copied.ndk_uid,
                association_uid: 0,
                node_launch_cmd_line: "UnitServer",
                node_auto_start: false,
                node_keep_alive: true,
                node_log_at_launch: true
              };
              data.andk_node_associated.push(tmp);
            }
          }
          editorFn = agentSave;
          jsonEdit(templ, data);
        };
      });
      return;
    } else {
      executeCUMenuCmd(cmd, options);
    }
    return;
  }
/**** ALGO MENU */

function executeAlgoMenuCmd(cmd, opt) {
  if (cmd == "edit-algo") {
    var templ = {
      $ref: "algo.json",
      format: "tabs"
    }
    if(node_selected!=null && node_name_to_desc[node_selected]!=null){
      jchaos.loadScript(node_selected,node_name_to_desc[node_selected].seq,function(data){
        console.log("script:"+node_selected+" ="+JSON.stringify(data));
        editorFn = algoSave;
        jsonEditWindow(node_selected,templ, data);
        
      });
    }
    
    return;
  }
  
  if (cmd == "new-algo") {
    var templ = {
      $ref: "algo.json",
      format: "tabs"
    }
    editorFn = algoSave;
    jsonEditWindow("newInstanceName",templ, null);
    return;
  }
  if (cmd == "delete-algo") {

    confirm("Delete Algorithm", "Your are deleting Algorithm: " + node_selected, "Ok", function () {
     jchaos.rmScript(node_name_to_desc[node_selected],function(data){
      instantMessage("Remove Script", "removed " + node_selected, 1000);

     });

    }, "Cancel");
    return;
  }

  
  if (cmd == "copy-algo") {

    jchaos.loadScript(node_selected,node_name_to_desc[node_selected].seq,function(data){
      algo_copied = data;
      instantMessage("Copy Script", "copied " + node_selected, 1000);
    });
   
    return;
  }
  if (cmd == "save-algo") {
    jchaos.loadScript(node_selected,node_name_to_desc[node_selected].seq,function(data){
      if (data != null) {
        if (data instanceof Object) {
          var blob = new Blob([JSON.stringify(data)], { type: "json;charset=utf-8" });
          saveAs(blob, node_selected + ".json");
        }
      }
    });
 
    return;
  
  }
  if (cmd == "paste-algo") {
    if((algo_copied instanceof Object)&& algo_copied.hasOwnProperty("script_name")){
      var instUnique = (new Date()).getTime();
      var templ = {
        $ref: "algo.json",
        format: "tabs"
      }
      getEntryWindow("Rename Algo","Algo Name",node_selected+ "_"+instUnique,"Create",function(inst_name){
        editorFn = algoSave;
        algo_copied.script_name=inst_name;
        jsonEdit(algo_copied, null);
        
  
      },"Cancel");    
    }
    
    return;
  }
 
  if (cmd == "create-instance") {
      var instUnique = (new Date()).getTime();

      getEntryWindow("Create Instance","Instance Name",node_selected + "/"+node_selected+"_"+instUnique,"Create",function(inst_name){
        jchaos.manageInstanceScript(node_selected,node_name_to_desc[node_selected].seq,inst_name,true,function(data){
          instantMessage("Create Instance", "instance of " + node_selected+ "created with name:"+inst_name, 1000);
    
        });

      },"Cancel");

    return;
  }
  if (cmd == "edit-instance"){
    var templ = {
      $ref: "algo-instance.json",
      format: "tabs"
    }
    
    if(node_name_to_desc[pather_selected]!=null && node_name_to_desc[pather_selected].hasOwnProperty('instances')){
      var arr=node_name_to_desc[pather_selected].instances;
      arr.forEach(function(item){
        if(item.instance_name == node_selected){
          editorFn = algoSaveInstance;
          console.log("editing instance: "+node_selected + " of:"+pather_selected + ":"+JSON.stringify(item));
          var fname=encodeName(node_selected);
          jsonEditWindow(fname,templ,item);
        }
      })
    }
   
    return;
  }
  if (cmd == "delete-instance") {
    confirm("Delete Algorithm Instance", "Your are deleting Instance Algorithm: " + node_selected + "("+pather_selected+")",  "Ok", function () {
      jchaos.manageInstanceScript(pather_selected,node_name_to_desc[pather_selected].seq,node_selected,false,function(data){
        instantMessage("Delete Instance", "instance of " + pather_selected+ "created with name:"+node_selected, 1000);
  
      });
 
     }, "Cancel");
   
    return;
  }
 
  return;
}

/****** */




  function setupNode(template) {
    $("#main_table-" + template + " tbody tr").click(function (e) {
      mainTableCommonHandling("main_table-" + template, e, "node");
    });
    n = $('#main_table-' + template + ' tr').size();
    if (n > 22) {     /***Attivo lo scroll della tabella se ci sono più di 22 elementi ***/
      $("#table-scroll").css('height', '280px');
    } else {
      $("#table-scroll").css('height', '');
    }


    $("#cuname").draggable(
      {

        cursor: 'move',
        helper: 'clone',
        containment: 'window'
      }
    );
    $.contextMenu({
      selector: '.nodeMenu',
      build: function ($trigger, e) {
        var cuname = $(e.currentTarget).attr("cuname");
        var cuitem = updateNodeMenu(node_name_to_desc[cuname]);
        cuitem['sep1'] = "---------";

        cuitem['quit'] = {
          name: "Quit", icon: function () {
            return 'context-menu-icon context-menu-icon-quit';
          }
        };

        return {

          callback: function (cmd, options) {
            executeNodeMenuCmd(cmd, options);
            return;
          },
          items: cuitem
        }
      }


    });

  }


  function buildNodeInterface(nodes, cutype, template) {
    if (nodes == null) {
      alert("NO Nodes given!");
      return;
    }
    if (!(nodes instanceof Array)) {
      node_list = [nodes];
    } else {
      node_list = nodes;
    }

    node_list.forEach(function (elem, id) {
      var name = encodeName(elem);
      node_name_to_index[name] = id;
      health_time_stamp_old[name] = 0;
      off_line[name] = false;
    });
    // cu_selected = cu_list[0];
    node_selected = null;
    var htmlt, htmlc, htmlg;
    var updateTableFn = new Function;
    /*****
     * 
     * clear all interval interrupts
     */
    /**
     * fixed part
     */
    htmlt = generateNodeTable(node_list, template);
    updateTableFn = updateNodeTable;


    $("div.specific-table-" + template).html(htmlt);
    // $("div.specific-control").html(htmlc);
    checkRegistration = 0;
    setupNode(template);

    jchaos.node(node_list, "desc", cutype, null, null, function (data) {
      var cnt = 0;
      node_list.forEach(function (elem, index) {
        var type = data[index].ndk_type;
        node_name_to_desc[elem] = { desc: data[index], parent: null, detail: null };
        if ((type == "nt_control_unit")) {
          jchaos.getDesc(elem, function (data) {
            if (data[0].hasOwnProperty("instance_description")) {
              node_name_to_desc[elem].detail = data[0].instance_description;
              node_name_to_desc[elem].parent = data[0].instance_description.ndk_parent;
            }
          });
        } else if ((type == "nt_unit_server")) {
          var par = jchaos.node(elem, "parent", "us", null, null);
          if (par.hasOwnProperty("ndk_uid") && par.ndk_uid != "") {
            node_name_to_desc[elem].parent = par.ndk_uid;
          }

        }
      });

    });


    if (node_list_interval != null) {
      clearInterval(node_list_interval);
    }
    updateTableFn(node_list);
    node_list_interval = setInterval(function (e) {
      var start_time = (new Date()).getTime();
      if ((start_time - checkRegistration) > 60000) {
        checkRegistration = start_time;
        jchaos.node(node_list, "desc", cutype, null, null, function (data) {
          var cnt = 0;
          node_list.forEach(function (elem, index) {
            node_name_to_desc[elem].desc = data[index];
          });
        });
        updateTableFn(node_list);

      }
      jchaos.node(node_list, "health", cutype, null, null, function (data) {
        node_live_selected = data;
        updateGenericTableDataset(node_live_selected);

      });


      /*
      cu_list.forEach(function (item) {
        cu_live_selected.push(jchaos.node(item, "desc", cutype));
      })
      */

      // update all generic

      if (node_live_selected.length == 0 || node_selected == null || node_name_to_index[node_selected] == null) {
        return;
      }




    }, options.Interval, updateTableFn);

    installCheckLive();


  }

  function buildAlgoInterface(nodes, interface,template) {
    if (nodes == null) {
      alert("NO Nodes given!");
      return;
    }
    node_list=[];
    for(var key in nodes){
      if(nodes[key] instanceof Array){
        node_list=node_list.concat(nodes[key]);
        
      }
    }
    if(interface !== "algo-instance"){
    node_list.forEach(function(elem){
      node_name_to_desc[elem.script_name]=elem;
      var tmp_array=[];
      jchaos.searchScriptInstance(elem.script_name,"",function(script_inst){
        for(var key in script_inst){
          if(script_inst[key] instanceof Array){
          tmp_array=tmp_array.concat(script_inst[key]);
        }
      }
      node_name_to_desc[elem.script_name]['instances']=tmp_array;
      });
    });
  }
    
    /*****
     * 
     * clear all interval interrupts
     */
    /**
     * fixed part
     */
    htmlt = generateAlgoTable(node_list,interface,template);


    $("div.specific-table-" + template).html(htmlt);


    $("#main_table-" + template + " tbody tr").click(function (e) {
      mainTableCommonHandling("main_table-" + template, e, "node");
    });
    n = $('#main_table-' + template + ' tr').size();
    if (n > 22) {     /***Attivo lo scroll della tabella se ci sono più di 22 elementi ***/
      $("#table-scroll").css('height', '280px');
    } else {
      $("#table-scroll").css('height', '');
    }


   
    $.contextMenu({
      selector: '.algoMenu',
      build: function ($trigger, e) {
        var algoname = $(e.currentTarget).attr("cuname");
        var cuitem = updateAlgoMenu(algoname);
        cuitem['sep1'] = "---------";

        cuitem['quit'] = {
          name: "Quit", icon: function () {
            return 'context-menu-icon context-menu-icon-quit';
          }
        };

        return {

          callback: function (cmd, options) {
            executeAlgoMenuCmd(cmd, options);
            return;
          },
          items: cuitem
        }
      }


    });
    $.contextMenu({
      selector: '.algoInstanceMenu',
      build: function ($trigger, e) {
        var algoname = $(e.currentTarget).attr("cuname");
        var cuitem = updateInstanceAlgoMenu(algoname);
        cuitem['sep1'] = "---------";

        cuitem['quit'] = {
          name: "Quit", icon: function () {
            return 'context-menu-icon context-menu-icon-quit';
          }
        };

        return {

          callback: function (cmd, options) {
            executeAlgoMenuCmd(cmd, options);
            return;
          },
          items: cuitem
        }
      }


    });

  }

  function mainCU() {
    var list_cu = [];
    var classe = ["powersupply", "scraper", "camera"];
    var $radio = $("input:radio[name=search-alive]");
    if ($radio.is(":checked") === false) {
      $radio.filter("[value=true]").prop('checked', true);
    }
    jchaos.search("", "zone", true, function (zones) {
      element_sel('#zones', zones, 1);
    });

    element_sel('#classe', classe, 1);
    $("#zones").change(function () {
      var zone_selected;
      zone_selected = $("#zones option:selected").val();
      search_string = zone_selected;
      if (zone_selected == "--Select--") {        //Disabilito la select dei magneti se non � selezionata la zona
        $("#elements").attr('disabled', 'disabled');
      } else {
        $("#elements").removeAttr('disabled');
      }
      if (zone_selected == "ALL") {
        search_string = "";
        var alive = $("[input=search-alive]:checked").val()
        jchaos.search(search_string, "class", (alive == "true"), function (ll) {
          element_sel('#elements', ll, 1);
        });

      } else {
        search_string = zone_selected;

        jchaos.search(zone_selected, "class", true, function (ll) {
          element_sel('#elements', ll, 1);
        });
      }
      $("#search-chaos").val(search_string);
      var alive = $("input[type=radio][name=search-alive]:checked").val()
      var interface = $("#classe option:selected").val();

      list_cu = jchaos.search(search_string, "cu", (alive == "true"), false);

      buildCUInteface(list_cu, implementation_map[interface], "cu");
    });

    $("#elements").change(function () {
      var element_selected = $("#elements option:selected").val();
      var zone_selected = $("#zones option:selected").val();
      search_string = "";
      if ((zone_selected != "ALL") && (zone_selected != "--Select--")) {
        search_string = zone_selected;
      }
      if ((element_selected != "ALL") && (node_selected != "--Select--")) {
        search_string += "/" + element_selected;
      }


      if (element_selected == "--Select--" || zone_selected == "--Select--") {
        $(".btn-main-function").hasClass("disabled");

      } else {
        $(".btn-main-function").removeClass("disabled");

      }
      $("#search-chaos").val(search_string);
      var alive = $("input[type=radio][name=search-alive]:checked").val()

      list_cu = jchaos.search(search_string, "cu", (alive == "true"), false);
      var interface = $("#classe option:selected").val();

      buildCUInteface(list_cu, implementation_map[interface], "cu");

    });
    $("#classe").change(function () {
      var interface = $("#classe option:selected").val();
      var alive = $("input[type=radio][name=search-alive]:checked").val()

      list_cu = jchaos.search(search_string, "cu", (alive == "true"), false);

      buildCUInteface(list_cu, implementation_map[interface], "cu");

    });
    $("#search-chaos").keypress(function (e) {
      if (e.keyCode == 13) {
        var interface = $("#classe").val();
        search_string = $(this).val();
        var alive = $("input[type=radio][name=search-alive]:checked").val()

        list_cu = jchaos.search(search_string, "cu", (alive == "true"), false);
        buildCUInteface(list_cu, implementation_map[interface], "cu");

      }
      //var tt =prompt('type value');
    });

    $("input[type=radio][name=search-alive]").change(function (e) {
      var alive = $("input[type=radio][name=search-alive]:checked").val()
      list_cu = jchaos.search(search_string, "cu", (alive == "true"), false);
      var interface = $("#classe option:selected").val();

      buildCUInteface(list_cu, implementation_map[interface], "cu");
    });


  }


  function interface2NodeList(inter, alive) {
    var tmp = [];
    if ((inter != "agent") && (inter != "us") && (inter != "cu")) {
      var node = jchaos.search(search_string, "us", (alive == "true"), false);
      node.forEach(function (item) {
        tmp.push(item);
      });
      node = jchaos.search(search_string, "agent", (alive == "true"), false);
      node.forEach(function (item) {
        tmp.push(item);
      });
      node = jchaos.search(search_string, "cu", (alive == "true"), false);
      node.forEach(function (item) {
        tmp.push(item);
      });
    } else {
      tmp = jchaos.search(search_string, inter, (alive == "true"), false);

    }
    return tmp;
  }

  function mainNode(template) {
    var list_cu = [];
    search_string = "";
    var $radio = $("input:radio[name=search-alive]");
    if ($radio.is(":checked") === false) {
      $radio.filter("[value=true]").prop('checked', true);
    }

    element_sel('#classe', ["us", "agent", "cu"], 1);


    $("#search-chaos").keypress(function (e) {
      if (e.keyCode == 13) {
        interface = $("#classe").val();
        search_string = $(this).val();
        var alive = $("input[type=radio][name=search-alive]:checked").val();
        list_cu = interface2NodeList(interface, alive);
        buildNodeInterface(list_cu, "us", template);
      }
      //var tt =prompt('type value');
    });

    $("input[type=radio][name=search-alive]").change(function (e) {
      var alive = $("input[type=radio][name=search-alive]:checked").val();
      interface = $("#classe option:selected").val();

      list_cu = interface2NodeList(interface, alive);

      buildNodeInterface(list_cu, interface, template);
    });
    actionJsonEditor();

  }

  function rebuildAlgoInterface(template){
   
    var search_string=$("#search-chaos").val();
  //  var interface=$("#classe option:selected").val();
    var algo_instance =  ($("input[type=radio][name=search-algo]:checked").val()=="true");
    if(algo_instance){
      jchaos.search(search_string, "script", true, function (list_algo) {
        buildAlgoInterface(list_algo, interface,template);

      }); 

  } else {
    if((node_selected!=null) && (node_selected!="")){
      pather_selected=node_selected;
    }
    if(pather_selected == null || pather_selected==""){
      alert("Please select an algorithm before");
      return;
    }
    jchaos.searchScriptInstance(node_selected,search_string,function(list_instances){
    
      buildAlgoInterface(list_instances, "algo-instance",template);

    });
  }
}
  function mainAlgo(template) {
    search_string = "";

    var $radio = $("input:radio[name=search-algo]");
    var interface = $("#classe option:selected").val();
    var algos=[];
    var algos_names=[];
    /*jchaos.search(search_string, "script", true, function (list_algo) {
      for(var key in list_algo){
        if(list_algo[key] instanceof Array){
          algos=algos.concat(list_algo[key]);
         
        }
      }
      algos.forEach(function(elem){
        if(elem.hasOwnProperty("script_name")){
          algos_names.push(elem.script_name)
        }
      });
      element_sel('#classe',algos_names, 0);

    });
     */

    if ($radio.is(":checked") === false) {
      $radio.filter("[value=true]").prop('checked', true);
    }

  /*  $("#classe").change(function () {
      rebuildAlgoInterface(template);
    });*/
    $("#search-chaos").keypress(function (e) {
      if (e.keyCode == 13) {
        algos_names=[];
        algos=[];
        jchaos.search(search_string, "script", true, function (list_algo) {
          for(var key in list_algo){
            if(list_algo[key] instanceof Array){
              algos=algos.concat(list_algo[key]);
            }
          }
          algos.forEach(function(elem){
            if(elem.hasOwnProperty("script_name")){
              algos_names.push(elem.script_name)
            }
          });
          element_sel('#classe',algos_names, 0);
    
        });
        rebuildAlgoInterface(template);
      } 
      //var tt =prompt('type value');
    });

    $("input[type=radio][name=search-alive]").change(function (e) {
      rebuildAlgoInterface(template);
     
    });

  }
  /******************
   * MAIN TABLE HANDLING
   * 
   */
  function mainTableCommonHandling(id, e, type) {

    $("#mdl-commands").modal("hide");
    $("#cu_full_commands").empty();
    if (node_selected == $(e.currentTarget).attr("cuname")) {
      $(".row_element").removeClass("row_snap_selected");
      node_multi_selected = [];
      node_selected = null;
      last_index_selected = -1;
      return;
    }
    node_selected = $(e.currentTarget).attr("cuname");
    var name = encodeName(node_selected);

    if (!e.ctrlKey) {
      $(".row_element").removeClass("row_snap_selected");
      node_multi_selected = [];
      node_multi_selected.push(node_selected);
    }
    $(e.currentTarget).addClass("row_snap_selected");
    if (type == "cu") {
      if (node_name_to_desc[name] == null) {
        var desc = jchaos.getDesc(node_selected, null);
        if (desc != null) {
          node_name_to_desc[name] = desc[0];
        }
      }
      if (node_selected != null && node_name_to_desc[name].hasOwnProperty("cudk_ds_desc") && node_name_to_desc[name].cudk_ds_desc.hasOwnProperty("cudk_ds_command_description")) {
        var desc = node_name_to_desc[name].cudk_ds_desc.cudk_ds_command_description;
        $("#cu_full_commands").add("<option>--Select--</option>");

        desc.forEach(function (item) {
          $("#cu_full_commands").append("<option value='" + item.bc_alias + "'>" + item.bc_alias + " (\"" + item.bc_description + "\")</option>");
        });
      }
    }
    if (e.shiftKey) {
      var nrows = $(e.currentTarget).index();
      if (last_index_selected != -1) {
        //alert("selected shift:"+nrows+" interval:"+(nrows-last_index_selected));
        if (nrows > last_index_selected) {
          //$('#main_table tr:gt('+(last_index_selected)+'):lt('+(nrows)+')').addClass("row_snap_selected");
          $("#" + id + " tr").slice(last_index_selected + 1, nrows + 1).addClass("row_snap_selected");
          for (var cnt = last_index_selected; cnt <= nrows; cnt++) {
            node_multi_selected.push(node_list[cnt]);

          }

        }
      }
    } else if (e.ctrlKey) {
      var nrows = $(e.currentTarget).index();
      node_multi_selected.push(node_list[nrows])
    }
    last_index_selected = $(e.currentTarget).index();

  }
  function generateCameraTable(node_list, template) {
    var html = '<div>';
    html += '<div id="cameraName"></div>';
    html += '<img id="cameraImage" src="" />';
    html += '</div>';
    html += '<div class="box span12">';
    html += '<div class="box-content">';
    html += '<h3 class="box-header" id=image-options>Image Options</h3>';

    html += '<label class="label span3" >Trigger</label>';
    html += '<select id="triggerType" class="span9">';
    html += '<option value="continuos" selected="continuos">Continuos</option>';
    html += '<option value="single">Single Shot</option>';
    html += '<option value="hw">HW trigger</option>';
    html += '<option value="sw">SW trigger</option>';
    html += '</select>';

    html += '<label class="label span3">Width </label>';
    html += '<input class="input-xlarge focused span4" id="image-WIDTH" readonly title="Readout Resize image width" type="text" value="640">';
    html += '<input class="input-xlarge focused span5 cucmdattr" id="attr-WIDTH" title="SET Resize image width" type="number" value=640>';

    html += '<label class="label span3">Height </label>';
    html += '<input class="input-xlarge focused span4" id="image-HEIGHT" readonly title="Readout Resize image height" type="text" value="480">';
    html += '<input class="input-xlarge focused span5 cucmdattr" id="attr-HEIGHT" title="Resize image height" type="text" value=480>';

    html += '<label class="label span3">Offset X</label>';
    html += '<input class="input-xlarge focused span4 json-keyinput" id="image-OFFSETX" readonly title="Readout Image Offset X (ROI)" type="text" value="0">';
    html += '<input class="input-xlarge focused span5 cucmdattr" id="attr-OFFSETX" title="Image Offset X (ROI)" type="number" value=0>';

    html += '<label class="label span3">Offset Y</label>';
    html += '<input class="input-xlarge focused span4 json-keyinput" id="image-OFFSETY" readonly title="Readout Image Offset X (ROI)" type="text" value="0">';
    html += '<input class="input-xlarge focused span5 cucmdattr" id="attr-OFFSETY" title="SET Image Offset Y (ROI)" type="text" value=0>';

    html += '<label class="label span3">Gain:</label>';
    html += '<input class="input-xlarge focused span3" id="image-GAIN" readonly title="Image Readout Gain" type="text" value="0">';
    html += '<input class="input-xlarge focused span3" id="image_gain" readonly title="Set Gain" type="number" value=0>';
    html += '<div class="span3" id="slider-GAIN" title="Camera Gain"> </div>';

    html += '<label class="label span3">Brightness</label>';
    html += '<input class="input-xlarge focused span3" id="image-BRIGHTNESS" readonly title="Image Readout Brightnessn" type="text">';
    html += '<input class="input-xlarge focused span3" id="image_brightness" readonly title="SET Brightness" type="number" value=0>';
    html += '<div class="span3" id="slider-BRIGHTNESS" title="Camera Brightness"></div>';

    html += '<label class="label span3">Shutter</label>';
    html += '<input class="input-xlarge focused span3" id="image-SHUTTER" readonly title="Camera Readout Shutter" type="text">';
    html += '<input class="input-xlarge focused span3" id="image_shutter" readonly title="SET Shutter" type="number" value=0>';
    html += '<div class="span3" id="slider-SHUTTER" title="Camera Shutter"> </div>';


    html += '<label class="label span3">Contrast</label>';
    html += '<input class="input-xlarge focused span3" id="image-CONTRAST" readonly title="Camera Readout Contrast" type="text">';
    html += '<input class="input-xlarge focused span3" id="image_contrast" readonly title="SET Contrast" type="number" value=0>';
    html += '<div class="span3" id="slider-CONTRAST" title="Camera Contrast"> </div>';

    html += '<label class="label span3">Sharpness</label>';
    html += '<input class="input-xlarge focused span3" id="image-SHARPNESS" readonly title="Camera Readout Sharpness" type="text">';
    html += '<input class="input-xlarge focused span3" id="image_sharpness" readonly title="SET Sharpness" type="number" value=0>';
    html += '<div class="span3" id="slider-SHARPNESS" title="Camera Sharpness"> </div>';

    html += '</div>';
    html += '</div>';

    html += generateGenericTable(node_list, template);
    return html;
  }
  function configureSliderCommands(slname, slinput) {
    $("#" + slname).slider({
      range: "max",
      min: 0,
      max: 100,
      value: 1,
      slide: function (event, ui) {
        $("#" + slinput).val(ui.value);
        var id = this.id;
        var attr = id.split("-")[1];
        jchaos.setAttribute(node_selected, attr, String(ui.value), function () {
          //   instantMessage("Attribute ", "\"" + attr + "\"=\"" + ui.value + "\" sent", 1000)

        });
      }
    });
    $("#" + slinput).val($("#" + slname).slider("value"));
  }

  /********************* */
  function generateGenericTable(cu, template) {
    var html = '<div class="row-fluid" id="table-space">';
    html += '<div class="box span12">';
    html += '<div class="box-content span12">';
    if (cu.length == 0) {
      html += '<p id="no-result-monitoring">No results match</p>';

    } else {
      html += '<p id="no-result-monitoring"></p>';

    }

    html += '<table class="table table-bordered" id="main_table-' + template + '">';
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
      try {
        if (el.hasOwnProperty('health') && (el.health.hasOwnProperty("ndk_uid"))) {   //if el health
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

            $("#Error-" + name_id).on("click", function () {
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
      } catch (e) {
        console.log(name_device_db + " warning :", e);
      }
    });
  }

  function generateScraperTable(cu, template) {
    var html = '<div class="row-fluid">';
    html += '<div class="box span12">';
    html += '<div class="box-content">';
    html += '<table class="table table-bordered" id="main_table-' + template + '">';
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
      html += "<tr class='row_element cuMenu' cuname='" + cu[i] + "' id='" + cuname + "'><td class='name_element'>" + cu[i]
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
      if (elem.hasOwnProperty('health') && elem.health.hasOwnProperty("ndk_uid")) {   //if el health

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
        } else if (elem.output.NegativeLimitSwitchActive == 'false') {
          $("#" + cuname + "_out").remove();
        }


        if (elem.output.PositiveLimitSwitchActive == 'true') {
          $("#" + cuname + "_in").html('<i id="in_icon_' + cuname + '" class="icon-caret-right verde"></i>');
        } else if (elem.output.PositiveLimitSwitchActive == 'false') {
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
    html += '<input class="input focused" id="mov_abs_offset_mm" type="number" value="1">';
    html += '</div>';
    html += '<a class="quick-button-small span1 btn-value cucmd" id="scraper_setPosition" cucmdid="mov_abs">';
    html += '<p>Apply</p>';
    html += '</a>';

    html += '<a class="quick-button-small span1 btn-value cucmd" id="scraper_setStop" cucmdid="stopMotion">';
    html += '<p>Stop</p>';
    html += '</a>';
    html += '<div class="span12 statbox" onTablet="span12" onDesktop="span12" id="box-cmd-due">';
    html += '<a class="quick-button-small span1 btn-cmd offset2 cucmd" id="scraper_in" cucmdid="mov_rel" cucmdvalueMult=-1>';
    html += '<i class="icon-angle-left"></i>';
    html += '<p class="name-cmd">In</p>';
    html += '</a>';
    // in case of cucmdvalue = null, a item named 'cucmd'_<commandparam>
    html += '<div class="span3" onTablet="span6" onDesktop="span3" id="input-value-due">';
    html += '<input class="input focused" id="mov_rel_offset_mm" type="number" value=1>';
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
  function generatePStable(cu, template) {
    var html = '<div class="row-fluid">';
    html += '<div class="box span12">';
    html += '<div class="box-content">';
    html += '<table class="table table-bordered" id="main_table-' + template + '">';
    html += '<thead class="box-header">';
    html += '<tr>';
    html += '<th>Element</th>';
    html += '<th>Status</th>';
    html += '<th>Readout [A]</th>';
    html += '<th>Setting [A]</th>';
    html += '<th colspan="3">Saved</th>';
    html += '<th colspan="7">Flags</th>';
    html += '</tr>';
    html += '</thead>';

    $(cu).each(function (i) {
      var cuname = encodeName(cu[i]);
      html += "<tr class='row_element cuMenu' cuname='" + cu[i] + "' id='" + cuname + "'>";
      html += "<td class='td_element td_name'>" + cu[i] + "</td>";
      html += "<td id='" + cuname + "_health_status'></td>";
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
  function updateCameraTable(cu, selected) {
    if (selected != null && selected.hasOwnProperty("output")) {
      $("#cameraName").html("<b>" + selected.output.ndk_uid + "</b>");
      if (selected.output.hasOwnProperty("FRAMEBUFFER")) {
        var bin = selected.output.FRAMEBUFFER.$binary.base64;
        var fmt = "png";
        if (selected.hasOwnProperty("input")) {
          if (selected.input.FMT != null) {
            fmt = selected.input.FMT;
          }
          $("#image-GAIN").val(selected.input.GAIN);
          $("#slider-GAIN").val(selected.input.GAIN);
          $("#image-WIDTH").val(selected.input.WIDTH);
          $("#image-HEIGHT").val(selected.input.HEIGHT);
          $("#image-OFFSETX").val(selected.input.OFFSETX);
          $("#image-OFFSETY").val(selected.input.OFFSETY);
          $("#image-BRIGHTNESS").val(selected.input.BRIGHTNESS);
          $("#image-SHUTTER").val(selected.input.SHUTTER);
          $("#image-CONTRAST").val(selected.input.CONTRAST);
          $("#image-SHARPNESS").val(selected.input.SHARPNESS);

        }
        $("#cameraName").html(selected.health.ndk_uid);
        $("#cameraImage").attr("src", "data:image/" + fmt + ";base64," + bin);
      }
    }
  }
  function updatePStable(cu) {
    cu.forEach(function (elem, index) {
      if (elem.hasOwnProperty("health") && elem.health.hasOwnProperty("ndk_uid")) {


        var id = elem.health.ndk_uid;
        var cuname = encodeName(id);
        if (elem.hasOwnProperty("output") && elem.hasOwnProperty("input") && elem.output.hasOwnProperty("current") && elem.input.hasOwnProperty("current")) {

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
    html += '<a class="quick-button-small span1 btn-cmd cucmd" id="PSbuttON" cucmdid="mode" title="Powersupply Operational" cucmdvalue=1>';
    html += '<i class="material-icons verde">trending_down</i>';
    html += '<p class="name-cmd">On</p>';
    html += '</a>';
    html += '<a class="quick-button-small span1 btn-cmd cucmd" id="PSbuttOFF" cucmdid="mode" title="Powersupply STBY" cucmdvalue=0>';
    html += '<i class="material-icons rosso">pause_circle_outline</i>';
    html += '<p class="name-cmd">Standby</p>';
    html += '</a>';
    html += '<a class="quick-button-small span1 btn-cmd cucmd" id="PSreset_alarm" title="Reset Powersupply Alarms" cucmdid="rset">';
    html += '<i class="material-icons rosso">error</i>';
    html += '<p class="name-cmd">Reset</p>';
    html += '</a>';
    html += '<div class="span3 offset1" onTablet="span6" onDesktop="span3" id="input-value-mag">';
    html += '<input class="input focused" id="sett_sett_cur" name="setCurrent" title="current setpoint in Ampere" type="text" value="">';
    html += '</div>';

    html += '<a class="quick-button-small span1 btn-value cucmd" cucmdid="sett" id="PSapply_current" >';
    html += '<p>Apply</p>';
    html += '</a>';
    html += '</div>';
    html += '<div class="row-fluid">';
    html += '<a class="quick-button-small span1 btn-cmd cucmd" cucmdid="pola" title="Powersupply Polarity POS" cucmdvalue=1 >';
    html += '<i class="material-icons rosso">add_circle</i>';
    html += '<p class="name-cmd">Pos</p>';
    html += '</a>';
    html += '<a class="quick-button-small span1 btn-cmd cucmd" cucmdid="pola"  title="Powersupply Polarity OPEN" cucmdvalue=0 >';
    html += '<i class="material-icons">radio_button_unchecked</i>';
    html += '<p class="name-cmd">Open</p>';
    html += '</a>';
    html += '<a class="quick-button-small span1 btn-cmd cucmd" cucmdid="pola"  title="Powersupply Polarity NEGATIVE" cucmdvalue=-1 >';
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
    html += '<option value="scatter">Scatter</option>';
    html += '<option value="column">Column</option>';
    html += '<option value="histogram">Histogram</option>';
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

    html += '<label class="label span3" >Trace Type </label>';
    html += '<select id="trace-type" class="span9">';
    html += '<option value="multi" selected="multi">Multiple Independent Traces</option>';
    html += '<option value="single">Single Trace</option>';
    html += '</select>';

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

    html += '<label class="label span1">X:</label>';
    html += '<input class="input-xlarge span11" type="text" title="port path to plot on X (timestamp,sequence,fullpath,[-1] all array components)" id="xvar" value="timestamp">';
    html += '<label class="label span1">Y:</label>';
    html += '<input class="input-xlarge span11" type="text" id="yvar" title="port path to plot on Y (timestamp,sequence,fullpath,[-1] all array components)" value="">';
    html += '<label class="label span1">Color:</label>';
    html += '<input class="input-xlarge span11" type="text" id="trace-color" title="Trace Color (empty = auto)" value="">';

    html += '<a href="#" class="btn span2" id="trace-add" title="Add the following trace to the Graph" >Add Trace</a>';
    html += '<a href="#" class="btn span2" id="trace-replace" title="Replace the following trace to the Graph" >Replace Trace</a>';

    html += '<a href="#" class="btn span2" id="trace-rem" title="Remove the selected trace" >Remove Trace</a>';
    html += '<a href="#" class="btn span2" id="trace-up" title="Move Trace up" >Trace UP</a>';
    html += '<a href="#" class="btn span2" id="trace-down" title="Move Trace down" >Trace Down</a>';


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
    html += '<th id="Color">Color</th>';

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
            if (path.index != null) {
              var val = convertBinaryToArrays(item.output[path.var]);
              if (path.index == "-1") {
                return val;
              } else {
                return Number(val[path.index]);
              }
            }
            return Number(item.output[path.var]);
          }
        } else if (path.dir == "input") {
          if (item.input.hasOwnProperty(path.var)) {
            if (path.index != null) {
              var val = convertBinaryToArrays(item.input[path.var]);
              if (path.index == "-1") {
                return val;
              } else {
                return Number(val[path.index]);
              }
            }
            return Number(item.input[path.var]);
          }
        } else if (path.dir == "health") {
          if (item.health.hasOwnProperty(path.var)) {
            if (path.index != null) {
              var val = convertBinaryToArrays(item.health[path.var]);


              return Number(val[path.index]);
            }
            return item.health[path.var];
          }
        }

      }
    }
    return null;
  }
  function dir2channel(dir) {
    if (dir == "output") {
      return 0;
    } else if (dir == "health") {
      return 4;
    } else if (dir == "input") {
      return 1;
    }
    return 0;
  }
  function runGraph() {
    if (graph_selected == null || graph_selected == "") {
      alert("No Graph selected");
      return;
    }
    console.log("Selected graph:" + graph_selected);
    var opt = high_graphs[graph_selected];
    if (!(opt instanceof Object)) {
      alert("\"" + graph_selected + "\" not a valid graph ");
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

    // check if exist
    if (active_plots[graph_selected] != null && active_plots[graph_selected].dialog != null) {
      $("#dialog-" + active_plots[graph_selected].dialog).show();
      return;
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
          $("#graph-" + count).css('width', opt.width);
          $("#graph-" + count).css('height', opt.height);

          var chart = new Highcharts.chart("graph-" + count, opt.highchart_opt);
          $(this).attr("graphname", graph_selected);
          var start_time = (new Date()).getTime();
          var graphname = $(this).attr("graphname");

          console.log("New Graph(" + count + "):" + graphname + " has been created");

          active_plots[graph_selected] = {
            graphname: graph_selected,
            graph: chart,
            highchart_opt: opt.highchart_opt,
            dialog: count,
            start_time: start_time
          };

        },
        buttons: [
          {
            text: "Live",
            click: function (e) {

              var graphname = $(this).attr("graphname");
              console.log("Start  Live Graph:" + graphname);
              var graph_opt = high_graphs[graphname];
              console.log("graph options:" + JSON.stringify(graph_opt));

              if (active_plots[graphname].hasOwnProperty('interval')) {
                clearInterval(active_plots[graphname].interval);
                delete active_plots[graphname].interval;
                $(e.target).html("Continue Live");
                return;
              }
              $(e.target).html("Pause Live");
              var chart = active_plots[graphname]['graph'];
              var seriesLength = chart.series.length;

              for (var i = seriesLength - 1; i > -1; i--) {
                chart.series[i].setData([]);
              }
              var timebuffer = Number(graph_opt.highchart_opt['timebuffer']) * 1000;
              high_graphs[graphname].start_time = (new Date()).getTime();
              var refresh = setInterval(function () {
                var data = jchaos.getChannel(graph_opt.culist, -1, null);
                var set = [];
                var x, y;
                var cnt = 0;
                var tr = opt.trace;
                var enable_shift = false;
                for (k in tr) {
                  if ((tr[k].x == null)) {
                    x = null;
                  } else if ((tr[k].x.origin == "timestamp")) {
                    x = (new Date()).getTime(); // current time
                    if (graph_opt.highchart_opt.shift && ((x - high_graphs[graphname].start_time) > timebuffer)) {
                      enable_shift = true;
                    }
                  } else if (tr[k].x.const != null) {
                    x = tr[k].x.const;
                  } else if (tr[k].x.var != null) {
                    x = getValueFromCUList(data, tr[k].x);

                  } else {
                    x = null;
                  }
                  if ((tr[k].y == null)) {
                    y = null;
                  } else if ((tr[k].y.origin == "timestamp")) {
                    y = (new Date()).getTime(); // current time
                  } else if (tr[k].y.const != null) {
                    y = tr[k].y.const;
                  } else if (tr[k].y.var != null) {
                    y = getValueFromCUList(data, tr[k].y);

                  } else {
                    y = null;
                  }
                  if (graph_opt.highchart_opt['tracetype'] == "multi") {
                    if ((y instanceof Array)) {
                      var inc;
                      if (x == null) {
                        x = 0;
                        inc = 1;
                      } else {
                        inc = 1.0 / y.length;
                      }

                      var set = [];

                      for (var cntt = 0; cntt < y.length; cntt++) {
                        set.push([x + inc * cntt, y[cntt]]);
                      }


                      chart.series[cnt].setData(set, true, true, true);

                    } else if (x instanceof Array) {
                      var inc;
                      var set = [];
                      if (y == null) {
                        y = 0;
                        inc = 1;
                      } else {
                        inc = 1.0 / x.length;
                      }
                      if (tr[k].y.origin == "histogram") {
                        set.push(x[cntt]);

                        chart.series[cnt + 1].setData(set, true, true, true);

                      } else {
                        for (var cntt = 0; cntt < y.length; cntt++) {
                          set.push([x[cntt], y + (inc * cntt)]);
                        }
                        chart.series[cnt].setData(set, true, true, true);

                      }

                    } else {
                      if (tr[k].y.origin == "histogram") {
                        if ($.isNumeric(x)) {
                          chart.series[cnt + 1].addPoint(x, false, false);
                        }

                      } else {
                        chart.series[cnt].addPoint([x, y], false, enable_shift);
                      }
                    }
                    if (tr[k].y.origin == "histogram") {
                      cnt += 2;

                    } else {
                      cnt++;
                    }
                  } else {
                    // single
                    if ((y instanceof Array)) {
                      var inc = 1.0 / y.length;
                      var xx = x;

                      y.forEach(function (item, index) {
                        if (x == null) {
                          set.push([index, item]);

                        } else {
                          set.push([xx, item]);
                          xx = (xx + inc);
                        }

                      });

                    } else if (x instanceof Array) {
                      var inc = 1.0 / y;
                      var yy = y;

                      x.forEach(function (item, index) {
                        if (y == null) {
                          set.push([item, index]);

                        } else {
                          set.push([item, yy]);

                          yy = (yy + inc);
                        }
                      });

                    } else {
                      if (tr[k].y.origin == "histogram") {
                        if ($.isNumeric(x)) {
                          set.push(x);
                        }
                      } else {
                        set.push({ x, y });
                      }
                    }
                  }
                  if (graph_opt.highchart_opt['tracetype'] == "single") {
                    chart.series[0].setData(set, true, true, true);
                  }
                }

                chart.redraw();
              }, graph_opt.update);
              active_plots[graphname]['interval'] = refresh;

            }
          },
          {
            text: "History",
            click: function () {

              var graphname = $(this).attr("graphname");
              console.log("Start  History Graph:" + graphname);
              var graph_opt = high_graphs[graphname];
              var correlation = false;
              if ((graph_opt.highchart_opt.xAxis.type != "datetime") && (graph_opt.highchart_opt.chart.type != "histogram")) {
                correlation = true;
              }
              if (graph_opt.highchart_opt.yAxis.type == "datetime") {
                alert("Y axis cannot be as datetime!")
                return;
              }
              $("#mdl-query").modal("show");
              $("#query-run").attr("graphname", graphname);
              $("#query-run").on("click", function () {
                $("#mdl-query").modal("hide");

                var graphname = $(this).attr("graphname");
                var graph_opt = high_graphs[graphname];

                var qstart = $("#query-start").val();
                var qstop = $("#query-stop").val();
                var page = $("#query-page").val();
                jchaos.options.history_page_len = Number(page);
                jchaos.options.updateEachCall = true;

                if (qstop == "" || qstop == "NOW") {
                  qstop = (new Date()).getTime();
                }
                if (active_plots[graphname].hasOwnProperty("interval") && (active_plots[graphname].interval != null)) {
                  clearInterval(active_plots[graphname].interval);
                  delete active_plots[graphname].interval;
                }
                var tr = graph_opt.trace;
                var chart = active_plots[graphname]['graph'];
                var dirlist = [];
                var seriesLength = chart.series.length;
                for (var i = seriesLength - 1; i > -1; i--) {
                  chart.series[i].setData([]);
                }
                graph_opt.culist.forEach(function (item) {
                  for (k in tr) {
                    if (tr[k].x.cu === item) {
                      dirlist[tr[k].x.dir] = dir2channel(tr[k].x.dir);
                      console.log("X Trace " + tr[k].name + " path:" + tr[k].x.origin);

                    }
                    if (tr[k].y.cu === item) {
                      dirlist[tr[k].y.dir] = dir2channel(tr[k].y.dir);
                      console.log("Y Trace " + tr[k].name + " path:" + tr[k].y.origin);
                    }
                  }
                });

                if (correlation) {
                  for (k in tr) {
                    histdataset[tr[k].name] = { x: [], tx: [], y: [], ty: [] };
                  }
                  // download all data before.
                  for (var v in graph_opt.culist) {
                    var item = graph_opt.culist[v];
                    for (var dir in dirlist) {
                      console.log("Retrive correlation data CU:" + item + " direction:" + dirlist[dir]);

                      jchaos.getHistory(item, dirlist[dir], qstart, qstop, "", function (data) {

                        for (k in tr) {
                          var trname = tr[k].name;

                          if (tr[k].x.cu === item) {
                            var variable = tr[k].x.var;
                            if (data.Y[0].hasOwnProperty(variable)) {
                              var cnt = 0;
                              console.log("X acquiring " + trname + " path:" + tr[k].x.origin + " items:" + data.Y.length);

                              data.Y.forEach(function (ds) {
                                if (tr[k].x.index != null && tr[k].x.index != "-1") {
                                  var tmp = Number(ds[variable]);
                                  histdataset[trname].x.push(tmp[tr[k].x.index]);
                                } else {
                                  histdataset[trname].x.push(Number(ds[variable]));

                                }
                                histdataset[trname].tx.push(data.X[cnt++]);

                              });

                            }
                          }
                          if (tr[k].y.cu === item) {
                            var variable = tr[k].y.var;
                            if (data.Y[0].hasOwnProperty(variable)) {
                              var cnt = 0;
                              console.log("Y acquiring " + trname + " path:" + tr[k].y.origin + " items:" + data.Y.length);

                              data.Y.forEach(function (ds) {
                                if (tr[k].y.index != null && tr[k].y.index != "-1") {
                                  var tmp = ds[variable];
                                  histdataset[trname].y.push(Number(tmp[tr[k].y.index]));
                                } else {
                                  histdataset[trname].y.push(Number(ds[variable]));

                                }
                                histdataset[trname].ty.push(data.X[cnt++]);

                              });
                            }
                          }
                        }
                      });
                    }
                  };
                  // ok plot
                  var chartn = 0;
                  for (k in tr) {
                    var cnt = 0;
                    var name = tr[k].name;

                    var xpoints = histdataset[name].tx.length;
                    var ypoints = histdataset[name].ty.length;
                    for (cnt = 0; cnt < Math.min(xpoints, ypoints); cnt++) {
                      chart.series[chartn].addPoint([histdataset[name].x[cnt], histdataset[name].y[cnt]], false, false);
                    }
                    chartn++;
                  }
                } else {
                  graph_opt.culist.forEach(function (item) {
                    console.log("to retrive CU:" + item);

                    for (var dir in dirlist) {
                      var dataset = [];

                      jchaos.getHistory(item, dirlist[dir], qstart, qstop, "", function (data) {
                        var cnt = 0, ele_count = 0;
                        for (k in tr) {
                          if (tr[k].y.origin == "histogram") {
                            if (tr[k].x.cu === item) {
                              var variable = tr[k].x.var;

                              data.Y.forEach(function (ds) {
                                //dataset.push(ds[variable]);
                                chart.series[cnt + 1].addPoint(ds[variable], false, false);

                              });
                            }
                            cnt += 2;
                          } else {
                            if (tr[k].y.cu === item) {
                              //iterate on the datasets
                              console.log("retrived \"" + dir + "/" + item + "\" count=" + data.Y.length);
                              var variable = tr[k].y.var;
                              var index = tr[k].y.index;
                              ele_count = 0;
                              data.Y.forEach(function (ds) {
                                if (ds.hasOwnProperty(variable)) {
                                  var ts = data.X[ele_count++];
                                  var tmp = ds[variable];

                                  if (index != null) {
                                    if (index == "-1") {
                                      var incr = 1.0 / tmp.length;
                                      var dataset = [];
                                      for (var cntt = 0; cntt < tmp.length; cntt++) {
                                        var t = ts + incr * cntt;
                                        var v = Number(tmp[cntt]);
                                        dataset.push([t, v]);
                                        chart.series[cnt].addPoint([t, v], false, false);
                                      }
                                      // chart.series[cnt].setData(dataset, true, true, true);
                                      chart.redraw();

                                    } else {
                                      chart.series[cnt].addPoint([ts, Number(tmp[index])], false, false);
                                    }

                                  } else {
                                    chart.series[cnt].addPoint([ts, Number(tmp)], false, false);

                                  }
                                }
                              });
                            }
                            cnt++;
                          }

                        }
                        chart.redraw();
                        // true until close if false the history loop retrive breaks
                        return active_plots.hasOwnProperty(graphname);
                      });
                    }
                  });
                }

              });
            }
          }, {
            text: "Save",
            click: function () {
              var graphname = $(this).attr("graphname");
              var graph_opt = high_graphs[graphname];
              var chart = active_plots[graphname]['graph'];
              var obj = {};
              if (chart.series instanceof Array) {
                chart.series.forEach(function (item) {
                  obj[item.name] = [];
                  item.data.forEach(function (dat) {
                    var x = dat.x;
                    var y = dat.y;
                    obj[item.name].push([x, y]);
                  });
                });
                var blob = new Blob([JSON.stringify(obj)], { type: "json;charset=utf-8" });
                saveAs(blob, graphname + ".json");
              }
            }
          }, {
            text: "Load",
            click: function () {
              var graphname = $(this).attr("graphname");
              var graph_opt = high_graphs[graphname];
              var chart = active_plots[graphname]['graph'];
              getFile("TRACE LOAD", "select the trace to load", function (data) {
                //console.log("loaded:"+JSON.stringify(data));

                for (var key in data) {
                  var newseries = {};

                  var xy = data[key];
                  newseries['name'] = key;
                  newseries['data'] = xy;
                  chart.addSeries(newseries);
                  /*xy.forEach(function(c){
                    chart.series[index].addPoint(c, false, false);
                  });*/

                }

              });
            }

          }, {
            text: "Close",
            click: function () {
              var graphname = $(this).attr("graphname");
              console.log("Removing graph:" + graphname);

              clearInterval(active_plots[graphname].interval);
              delete active_plots[graphname]['graph'];
              delete active_plots[graphname];

              $(this).dialog('close');
            }
          }]



      });
    } else {
      alert("Too many graph dialog opened");
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
    var xtype = $("#xtype option:selected").val();
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
    var ytype = $("#ytype option:selected").val();
    var serie = [];
    var tracecuo = {};
    var tracecu = [];
    var shift_true = $("input[type=radio][name=graph-shift]:checked").val();
    /*if (tracetype == "single") {
    
    
      serie.push({ name: graphname });
    }*/
    for (var cnt = 0; cnt < trace_list.length; cnt++) {
      //      if (tracetype == "multi") {
      var col;
      var seriespec = {};
      seriespec['name'] = trace_list[cnt].name;
      seriespec['type'] = graphtype;

      if (trace_list[cnt].hasOwnProperty("color") && (trace_list[cnt].color != "")) {
        col = trace_list[cnt].color;
        seriespec['color'] = col;
      }
      if (graphtype == "histogram") {
        var histo_data = {};

        seriespec['xAxis'] = 1;
        seriespec['yAxis'] = 1;
        seriespec['baseSeries'] = "histo_data" + (cnt + 1);
        histo_data['name'] = trace_list[cnt].name;
        histo_data['type'] = "scatter";
        histo_data['visible'] = false;

        histo_data['id'] = "histo_data" + (cnt + 1);
        histo_data['marker'] = { "radius": 1.5 };
        serie.push(seriespec);
        serie.push(histo_data);

      } else {
        serie.push(seriespec);
      }

      // }
      if ((trace_list[cnt].x != null) && trace_list[cnt].x.hasOwnProperty("cu") && trace_list[cnt].x.cu != null) {
        tracecuo[trace_list[cnt].x.cu] = "1";
      }
      if ((trace_list[cnt].y != null) && trace_list[cnt].y.hasOwnProperty("cu") && trace_list[cnt].y.cu != null) {
        tracecuo[trace_list[cnt].y.cu] = "1";
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

      series: serie
    }
    if (graphtype == "histogram") {
      tmp['xAxis'] = [];
      tmp['yAxis'] = [];
      tmp['xAxis'].push({ 'title': xname, alignTicks: false });
      tmp['xAxis'].push({ 'title': 'Histogram', 'alignTicks': false, 'opposite': false });
      tmp['yAxis'].push({ 'title': 'Frequence', alignTicks: false });
      tmp['yAxis'].push({ 'title': yname, 'alignTicks': false, 'opposite': false });
    } else {
      tmp['xAxis'] = {
        type: xtype,
        max: xmax,
        min: xmin,
        gridLineWidth: 1,
        title: {
          text: xname
        }
      };
      tmp['yAxis'] = {
        type: ytype,
        max: ymax,
        min: ymin,
        title: {
          text: yname
        }
      };
    }
    tmp['tracetype'] = tracetype;
    tmp['shift'] = shift_true;
    tmp['timebuffer'] = keepseconds;
    /*if(tracetype=="single"){
      var labels=[];
      for (var cnt=0;cnt<trace_list.length;cnt++) {
        if(trace_list[cnt].x.const!=null){
          var l={
            point: {
            xAxis: 0,
            yAxis: 0,
            x: trace_list[cnt].x.const,
            y: 1
        },
      text: trace_list[cnt].name
    };
      labels.push(l);
  } 
    }
    
    tmp['annotations']=[{
     
      'labels':labels}];
  }*/
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
    console.log("saving Graph:" + JSON.stringify(high_graphs[graphname]));

    jchaos.variable("highcharts", "set", high_graphs, null);
    graph_selected = graphname;

  }

  function restoreFullConfig(config, configToRestore) {
    if (!(configToRestore instanceof Array)) {
      return;
    }
    configToRestore.forEach(function (sel) {

      if (sel == "us") {
        if (config.hasOwnProperty('us') && (config.us instanceof Array)) {
          config.us.forEach(function (data) {
            confirm("US " + data.us_desc.ndk_uid, "Erase Or Join configuration", "Erase", function () {
              if (data.us_desc.hasOwnProperty("cu_desc") && (data.us_desc.cu_desc instanceof Array)) {
                data.us_desc.cu_desc.forEach(function (item) {
                  jchaos.node(item.ndk_uid, "del", "cu", item.ndk_parent, null);
                });
                node_selected = data.us_desc.ndk_uid;

                unitServerSave(data.us_desc);

              }
            }, "Join", function () { unitServerSave(data.us_desc); });

          });
        } else if (config.hasOwnProperty("us_desc")) {
          var templ = {
            $ref: "us.json",
            format: "tabs"
          }
          confirm("Add US " + config.us_desc.ndk_uid, "Erase Or Join configuration", "Erase", function () {
            if (config.us_desc.hasOwnProperty("cu_desc") && (config.us_desc.cu_desc instanceof Array)) {
              config.us_desc.cu_desc.forEach(function (item) {
                jchaos.node(item.ndk_uid, "del", "cu", item.ndk_parent, null);
              });
              node_selected = config.us_desc.ndk_uid;
              editorFn = unitServerSave;
              jsonEdit(templ, config.us_desc);

            }
          }, "Join", function () {
            editorFn = unitServerSave;
            jsonEdit(templ, config.us_desc);
          });
        } else if (config.hasOwnProperty("cu_desc")) {

          var parent = config.cu_desc.ndk_parent;


          confirm("Add CU " + config.cu_desc.ndk_uid, "Add CU to " + parent + "?", "Add", function () {
            if (config.hasOwnProperty("cu_desc")) {
              var templ = {
                $ref: "cu.json",
                format: "tabs"
              }
              editorFn = newCuSave;
              var tmp = config.cu_desc;
              jsonEdit(templ, tmp);
            }
          }, "Cancel", function () {
          });
        }
      }
      if ((sel == "agents") && config.hasOwnProperty('agents') && (config.agents instanceof Array)) {
        config.agents.forEach(function (json) {
          agentSave(json.info);
        });
      }
      if ((sel == "snapshots") && config.hasOwnProperty('snapshots') && (config.snapshots instanceof Array)) {
        config.snapshots.forEach(function (json) {
          jchaos.snapshot(json.name, "set", "", json.dataset, function (d) {
            console.log("restoring snapshot '" + json.name + "' created:" + json.ts);
          });
        });
      }
      if ((sel == "graphs") && config.hasOwnProperty('graphs') && (config.graphs instanceof Object)) {
        jchaos.variable("highcharts", "set", config.graphs, function (s) {
          console.log("restoring graphs:" + JSON.stringify(config.graphs));
          high_graphs = config.graph;
        });

      }
      if ((sel == "custom_group") && config.hasOwnProperty('custom_group') && (config.custom_group instanceof Array)) {
        jchaos.variable("custom_group", "set", config.custom_group, function (s) {
          console.log("restoring custom groups:" + JSON.stringify(config.custom_group));
          custom_group = config.custom_group;
        });

      }
      if ((sel == "cu_templates") && (config instanceof Object) && (!config.hasOwnProperty("cu_desc"))) {

        jchaos.variable("cu_templates", "set", config, function (s) {
          console.log("restoring CU templates:" + JSON.stringify(config));
          cu_templates = config;
        });

      }
    });
  }
  function saveFullConfig(name) {
    //find all US
    var obj = {};
    obj['agents'] = [];
    var agent_list = jchaos.search("", "agent", false, false);
    agent_list.forEach(function (item) {
      var agent = {
        "name": item,
      };
      var info = jchaos.node(item, "info", "agent", "", null);
      agent['info'] = info;
      obj['agents'].push(agent);
      ;
    });
    obj['us'] = [];
    var us_list = jchaos.search("", "us", false, false);
    us_list.forEach(function (item) {
      var data = jchaos.node(item, "get", "us", "", null);
      obj['us'].push(data);

    });
    // snapshots
    obj['snapshots'] = [];
    var snaplist = jchaos.search("", "snapshots", false);
    snaplist.forEach(function (item) {
      var snap = {
        snap: item,
      };
      var dataset = jchaos.snapshot(item.name, "load", null, "");
      snap['dataset'] = dataset;
      obj['snapshots'].push(snap);
    });
    // graphs

    obj['graphs'] = jchaos.variable("highcharts", "get", null, null);
    obj['cu_templates'] = jchaos.variable("cu_templates", "get", null, null);
    var blob = new Blob([JSON.stringify(obj)], { type: "json;charset=utf-8" });
    saveAs(blob, "configuration.json");
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
    // html += '<a href="#" class="btn btn-primary savetofilecsv" filename="description" extension="csv">Export To CSV</a>';
    html += '<a href="#" class="btn btn-primary savetofile" filename="dataset" extension="json">Save To File</a>';
    html += '<a href="#" class="btn btn-primary" id="dataset-update">Pause</a>';
    html += '<a href="#" class="btn btn-primary" id="dataset-close">Close</a>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  function actionJsonEditor() {
    $("#save_jsonedit").on('click', function () {
      // editor validation
      var errors = json_editor.validate();

      if (errors.length) {
        alert("JSON NOT VALID");
        console.log(errors);
      }
      else {
        // It's valid!
        var json_editor_value = json_editor.getValue();
        editorFn(json_editor_value);
        $("#mdl-jsonedit").modal("hide");

      }
    });

    $("#close_jsonclose").on('click', function () {
      $("#mdl-jsonedit").modal("hide");
    });
  }
  function generateEditJson() {
    // var cu=jchaos.getChannel(cuid, -1,null);
    // var desc=jchaos.getDesc(cuid,null);

    var html = '<div class="modal hide fade draggable" id="mdl-jsonedit">';
    html += '<div class="modal-header">';
    html += '<button type="button" class="close" data-dismiss="modal">×</button>';
    html += '<h3>Editor</h3>';
    html += '</div>';
    html += '<div class="modal-body">';
    html += '<div id="json-edit" class="json-edit medium-12 columns"></div>';
    html += '</div>';
    html += '<div class="modal-footer">';
    html += '<a href="#" class="btn btn-primary" id="save_jsonedit">Save</a>';
    html += '<a href="#" class="btn btn-primary" id="close_jsonclose">Close</a>';
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
    // html += '<a href="#" class="btn btn-primary savetofilecsv" filename="description" extension="csv">Export To CSV</a>';
    html += '<a href="#" class="btn btn-primary savetofile icon-save" filename="description" extension="json">Save To File</a>';
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

    html += '<table class="table table-bordered table-fixed" id="table_logs">';
    html += '<thead class="box-header">';
    html += '<tr>';
    html += '<th>Date</th>';
    html += '<th>Node</th>';
    html += '<th>Description</th>';
    html += '<th>Origin</th>';

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
    html += '<option value="log">Log</option>';
    html += '<option value="command">Commands</option>';

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
    html += '<select id="cmd-force">';
    html += '<option value="normal" selected="selected">Normal</option>';
    html += '<option value="force">Force</option>';
    html += '</select>';

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
    html += '<a href="./configuration.php" role="button" class="show_agent" data-toggle="modal">';
    html += '<i class="icon-key green"></i><span class="opt-menu hidden-tablet">Configuration</span>';
    html += '</a>';
    html += '</li>';

    html += '<li class="black">';
    html += '<a href="./index.php" role="button" class="show_agent" data-toggle="modal">';
    html += '<i class="icon-search green"></i><span class="opt-menu hidden-tablet">CU</span>';
    html += '</a>';
    html += '</li>';
    /*
        html += '<li class="black">';
        html += '<a href="#">';
        html += '<i class="icon-print green"></i><span class="opt-menu hidden-tablet">Configuration</span>';
        html += '</a>'
    
        html += '<ul class="dashboard-list metro">';
        html += '<li class="black">';
        html += '<a href="./chaos_node.php" role="button" class="show_unitserver" data-toggle="modal">';
        html += '<i class="icon-print green"></i><span class="opt-menu hidden-tablet">Node</span>';
        html += '</a>';
        html += '</li>';
        html += '</ul>';
    */

    html += '<li class="black">';
    html += '<a href="./chaos_node.php" role="button" class="show_unitserver" data-toggle="modal">';
    html += '<i class="icon-print green"></i><span class="opt-menu hidden-tablet">Node</span>';
    html += '</a>';
    html += '</li>';


    html += '<li class="black">';
    html += '<a href="./chaos_algo.php" role="button" class="show_alog" data-toggle="modal">';
    html += '<i class="icon-file red"></i><span class="opt-menu hidden-tablet">Algo</span>';
    html += '</a>';
    html += '</li>';

    html += '</ul>';
    html += '</div>';
    html += '</div>';

    html += '<div id="progressbar"></div>';

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

    /*
        html += '<li class="green">';
        html += '<a href="#mdl-dataset" role="button" class="show_dataset" data-toggle="modal">';
        html += '<i class="icon-print green"></i><span class="opt-menu hidden-tablet">Dataset</span>';
        html += '</a>';
        html += '</li>';
    
        html += '<li class="green">';
        html += '<a href="#mdl-description" role="button" class="show_description" data-toggle="modal">';
        html += '<i class="icon-print green"></i><span class="opt-menu hidden-tablet">Description</span>';
        html += '</a>';
        html += '</li>';
    */
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
            html += '<a  class="json-toggle"></a>';
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
            var portarray = 0;
            if (isCollapsable(json[key])) {
              if (json[key] instanceof Array) {
                keyclass = "json-key";
                portarray = json[key].length;
              } else {
                keyclass = "json-string";
              }
            } else {
              keyclass = "json-key";
            }
            var keyRepr = options.withQuotes ?
              '<span class="' + keyclass + '" id=' + pather + '-' + key + ' portdir="' + pather + '" portname="' + key + '" portarray="' + portarray + '">"' + key + '"</span>' : key;
            /* Add toggle button if item is collapsable */
            if (isCollapsable(json[key])) {
              html += '<a  class="json-toggle">' + keyRepr + '</a>';
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
  var updateLogInterval;

  function logNode(name) {
    $('<div></div>').appendTo('body')
      .html('<div><p id="culog"></p></div>')
      .dialog({
        modal: true, title: name, zIndex: 10000, autoOpen: true,
        width: 320,
        height: 240, resizable: true, draggable: true,
        buttons: [
          {
            id: "confirm-no",
            text: "Close",
            click: function (e) {
              $(this).dialog("close");
            }
          }],
        close: function (event, ui) {
          clearInterval(updateLogInterval);
          $(this).remove();
        },
        open: function (event, ui) {
          updateLogInterval = setInterval(function () {
            jchaos.node(name, "getlog", "agent", null, function (data) {
              $("#culog").append(JSON.stringify(data));
            });
          }, 1000);
        }
      });

  }
  function getEntryWindow(hmsg, msg, def_text, butyes, yeshandle, cancelText){
    var ret = true;
    $('<div></div>').appendTo('body')
      .html('<div><h6>' + msg + '</h6><input type="text" id="getEntryWindow_name" value='+def_text+' class="text ui-widget-content ui-corner-all"></div>')
      .dialog({
        modal: true, title: hmsg, zIndex: 10000, autoOpen: true,
        width: 'auto', resizable: false,
        buttons: [
          {
            id: "confirm-yes",
            text: butyes,
            click: function (e) {
              if (typeof yeshandle === "function") {
                yeshandle($("#getEntryWindow_name").val());
              }
              $(this).dialog("close");


            }
          },
          {
            id: "confirm-no",
            text: cancelText,
            click: function (e) {
              if (typeof nohandle === "function") {
                nohandle();
              }
              $(this).dialog("close");
            }
          }],
        close: function (event, ui) {
          $(this).remove();
        }
      });

  }

  function getNEntryWindow(hmsg, def_msg_v,def_text_v, butyes, yeshandle, cancelText){
    var ret = true;
    var htmp="";
    if(def_msg_v instanceof Array){
      var cnt=0;
      def_msg_v.forEach(function(item){
        htmp+='<div><h6>'+item+'</h6><input type="text" id="getEntryWindow_name_'+cnt+'" value='+def_text_v[cnt]+' class="text ui-widget-content ui-corner-all"></div>';
        cnt++;
      });
    } else {
      return;
    }
    $('<div></div>').appendTo('body')
      .html(htmp)
      .dialog({
        modal: true, title: hmsg, zIndex: 10000, autoOpen: true,
        width: 'auto', resizable: false,
        buttons: [
          {
            id: "confirm-yes",
            text: butyes,
            click: function (e) {
              if (typeof yeshandle === "function") {
                var answ=[];
                var cnt=0;
                def_text_v.forEach(function(item){
                  answ.push($("#getEntryWindow_name_"+cnt).val());
                  cnt++;
                });
                yeshandle(answ);
              }
              $(this).dialog("close");
            }
          },
          {
            id: "confirm-no",
            text: cancelText,
            click: function (e) {
              if (typeof nohandle === "function") {
                nohandle();
              }
              $(this).dialog("close");
            }
          }],
        close: function (event, ui) {
          $(this).remove();
        }
      });

  }
  function confirm(hmsg, msg, butyes, yeshandle, butno, nohandle) {
    var ret = true;
    $('<div></div>').appendTo('body')
      .html('<div><h6>' + msg + '</h6></div>')
      .dialog({
        modal: true, title: hmsg, zIndex: 10000, autoOpen: true,
        width: 'auto', resizable: false,
        buttons: [
          {
            id: "confirm-yes",
            text: butyes,
            click: function (e) {
              if (typeof yeshandle === "function") {
                yeshandle();
              }
              $(this).dialog("close");


            }
          },
          {
            id: "confirm-no",
            text: butno,
            click: function (e) {
              if (typeof nohandle === "function") {
                nohandle();
              }
              $(this).dialog("close");
            }
          }],
        close: function (event, ui) {
          $(this).remove();
        }
      });

  }
  function type2Alias(t) {
    switch (t) {
      case "nt_agent":
        return "Agent";
      case "nt_control_unit":
        return "Control Unit";
      case "nt_unit_server":
        return "Unit Server";

    }
  }
  function cuCreateSubMenu() {
    var items = {};
    items["new-nt_control_unit-fromfile"] = { name: "CU from file..." };

    cu_templates = jchaos.variable("cu_templates", "get", null, null);
    for (var item in cu_templates) {
      items["new-nt_control_unit-" + item] = { name: "" + item };

    }
    items["new-nt_control_unit-custom"] = { name: "Custom CU" };
    return items;
  }
  function updateNodeMenu(node) {
    var items = {};
    if (interface == "us") {
      items['new-nt_unit_server'] = { name: "New  Unit Server..." };
      if ((us_copied != null) && us_copied.hasOwnProperty("ndk_uid")) {
        items['paste-nt_unit_server'] = { name: "Paste " + us_copied.ndk_uid };
      }
    } else {

      items['new-nt_unit_server'] = { name: "New  Unit Server..." };

      if ((us_copied != null) && us_copied.hasOwnProperty("ndk_uid")) {
        items['paste-nt_unit_server'] = { name: "Paste " + us_copied.ndk_uid };
      }
    }
    if (node == null) {
      return items;
    }

    node_type = node.desc.ndk_type;
    items['edit-' + node_type] = { name: "Edit ..." };

    if (node_type == "nt_unit_server") {
      items['del-' + node_type] = { name: "Del " + node_selected };
      items['copy-' + node_type] = { name: "Copy " + node_selected };
      items['save-' + node_type] = { name: "Save To Disk " + node_selected };

      var cutypes = cuCreateSubMenu();
      items['fold1'] = { name: "New  Control Unit", "items": cutypes };

      if ((cu_copied != null) && cu_copied.hasOwnProperty("ndk_uid")) {
        items['paste-nt_control_unit'] = { name: "Paste/Move \"" + cu_copied.ndk_uid };
      }

      var associated = jchaos.node(node_selected, "parent", "us", null, null);
      if (associated != null && associated.hasOwnProperty("ndk_uid") && associated.ndk_uid != "") {
        items['sep5'] = "---------";

        items['start-node'] = { name: "Start US ..." };
        items['stop-node'] = { name: "Stop US ..." };
        items['restart-node'] = { name: "Restart US ..." };
        items['kill-node'] = { name: "Kill US ..." };
        items['log-node'] = { name: "Log US ..." };



        items['sep6'] = "---------";
      }
    } else if (node_type == "nt_control_unit") {
      items['del-' + node_type] = { name: "Del " + node_selected };
      items['copy-' + node_type] = { name: "Copy " + node_selected };
      items['save-' + node_type] = { name: "Save To Disk " + node_selected };

      var stat = jchaos.getChannel(node_selected, -1, null);
      var cmditem = updateCUMenu(stat[0], node_selected);
      items['sep2'] = "---------";
      for (var k in cmditem) {
        items[k] = cmditem[k];
      }
      items['sep3'] = "---------";
    } else if (node_type == "nt_agent") {
      if (us_copied != null && us_copied.ndk_uid != "") {
        items['agent-act'] = "---------";
        items['associate-node'] = { name: "Associate " + us_copied.ndk_uid + "..." };

        items['agent-act'] = "---------";
      }
    }

    return items;
  }

  function updateCUMenu(cu, name) {
    var items = {};

    if (cu != null && cu.hasOwnProperty('health') && cu.health.hasOwnProperty("nh_status")) {   //if el health
      var status = cu.health.nh_status;
      if ((off_line[cu.health.ndk_uid] == false)) {

        if (status == 'Start') {
          items['stop'] = { name: "Stop", icon: "stop" };
          items['snapshot-cu']= { name: "Take Snapshot", icon: "snapshot" };
          items['tag-cu']= { name: "Tag for...", icon: "tag" };
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
        } else if (status == 'Fatal Error') {
          items['deinit'] = { name: "Deinit", icon: "deinit" };
          items['init'] = { name: "Init", icon: "init" };
          items['unload'] = { name: "Unload", icon: "unload" };

        } else if (status == "Unload") {
          items['load'] = { name: "Load", icon: "load" };
        } else if (status == "Load") {
          items['unload'] = { name: "Unload", icon: "unload" };
          items['init'] = { name: "Init", icon: "init" };

        } else {
          items['load'] = { name: "Load", icon: "load" };
          items['init'] = { name: "Init", icon: "init" };
          items['unload'] = { name: "Unload", icon: "unload" };
          items['deinit'] = { name: "Deinit", icon: "deinit" };


        }

      } else {
        items['load'] = { name: "Load", icon: "load" };
        items['init'] = { name: "Init", icon: "init" };
        items['unload'] = { name: "Unload", icon: "unload" };
        items['deinit'] = { name: "Deinit", icon: "deinit" };
      }
    } else if (name != null && name != "") {
      items['load'] = { name: "Load", icon: "load" };

    }
    items['sep1'] = "---------";
    //node_name_to_desc[node_multi_selected[0]]
    var desc = node_name_to_desc[encodeName(node_multi_selected[0])];
    if (desc != null && desc.hasOwnProperty("instance_description") && desc.instance_description.hasOwnProperty("control_unit_implementation")) {
      var tt = getInterfaceFromClass(desc.instance_description.control_unit_implementation);

      if (tt != null) {
        items['open-ctrl'] = { name: "Open control:" + tt };
      }
    }
    if (node_multi_selected.length == 1) {

      items['show-dataset'] = { name: "Show Dataset" };
      items['show-desc'] = { name: "Show Description" };

      items['show-picture'] = { name: "Show as Picture.." };
    }


    return items;
  }
  function updateGenericControl(cu) {
    if (cu.hasOwnProperty('health') && cu.health.hasOwnProperty("ndk_uid")) {   //if el health
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
        $("#cmd-load-unload").attr("cucmdid", "unload");
        $("#cmd-load-unload").show();
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
        $("#cmd-load-unload").attr("cucmdid", "load");
        $("#cmd-load-unload").show();
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
    $("#log_search").val(cu);

    jchaos.log(cu, "search", logtype, 0, 10000000000000, function (data) {
      if (data.hasOwnProperty("result_list")) {
        data.result_list.forEach(function (item) {
          if ((item.mdsndk_nl_ld == logtype) || (logtype == "all")) {
            var dat = new Date(item.mdsndk_nl_lts).toString();
            var nam = item.mdsndk_nl_sid;
            var msg = item.mdsndk_nl_e_em;
            var type = item.mdsndk_nl_ld;
            var origin = item.mdsndk_nl_e_ed;
            if (type == "warning") {
              $('#table_logs').append('<tr class="row_element" id="' + dat + '"><td class="wrap">' + dat + '</td><td class="wrap">' + nam + '</td><td class="wrap">' + msg + '</td><td class="wrap">' + origin + '</td></tr>').css('color', 'yellow');;
            } else if (type == "error") {
              $('#table_logs').append('<tr class="row_element" id="' + dat + '"><td class="wrap">' + dat + '</td><td>' + nam + '</td><td class="wrap">' + msg + '</td><td class="wrap">' + origin + '</td></tr>').css('color', 'red');;
            } else if (type == "command") {
              $('#table_logs').append('<tr class="row_element" id="' + dat + '"><td class="wrap">' + dat + '</td><td>' + nam + '</td><td class="wrap">' + msg + '</td><td class="wrap">' + origin + '</td></tr>').css('color', 'green');;
            } else {
              $('#table_logs').append('<tr class="row_element" id="' + dat + '"><td class="wrap">' + dat + '</td><td>' + nam + '</td><td class="wrap">' + msg + '</td><td class="wrap">' + origin + '</td></tr>');

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
      if (high_graphs[graph_selected].trace instanceof Array) {
        trace_list = high_graphs[graph_selected].trace;
      } else {
        trace_list = [];
      }
      var xp, yp;
      for (var cnt = 0; cnt < trace_list.length; cnt++) {
        xp = encodeCUPath(trace_list[cnt].x);
        yp = encodeCUPath(trace_list[cnt].y);
        var tname = encodeName(trace_list[cnt].name);
        var tcolor = "";
        if (trace_list[cnt].hasOwnProperty("color")) {
          tcolor = (trace_list[cnt].color == null) ? "" : trace_list[cnt].color;
        }

        $('#table_trace').append('<tr class="row_element" id=trace_"' + tname + '" tracename="' + trace_list[cnt].name + '"><td>' + trace_list[cnt].name + '</td><td>' + xp + '</td><td>' + yp + '</td><td>' + tcolor + '</td></tr>');

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
    var tosnapshot = [];
    if (node_multi_selected.length > 0) {
      tosnapshot = node_multi_selected;
    } else {
      if (node_selected) {
        tosnapshot.push(node_selected);
      }
    }
    if (tosnapshot.length > 0) {
      $("#list_snapshot").html("Snapshotting the following group:");

      tosnapshot.forEach(function (elem) {
        var type;
        var name = encodeName(elem);
        if (node_name_to_desc[elem] == null) {
          var desc = jchaos.getDesc(elem, null);
          node_name_to_desc[elem] = desc[0];

        }
        if (node_name_to_desc[elem] == null) {
          type = "NA";
        } else {
          type = findImplementationName(node_name_to_desc[elem].instance_description.control_unit_implementation);
        }
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
  $.fn.generateMenuBox = function () {
    $(this).html(generateMenuBox());
  }
  $.fn.generateQueryTable = function () {
    $(this).html(generateQueryTable());
  }
  $.fn.generateEditJson = function () {
    $(this).html(generateEditJson());
  }
  $.fn.editActions = function () {
    actionJsonEditor();
  }
  $.fn.saveFullConfig = function () {
    saveFullConfig();
  }
  $.fn.restoreFullConfig = function (json, opt) {
    restoreFullConfig(json, opt);
  }
  $.fn.getFile = function (msghead, msg, handler) {
    return getFile(msghead, msg, handler);
  }
  $.fn.getValueFromCUList = function (culist, path) {
    return getValueFromCUList(culist, path);
  }
  $.fn.chaosDashboard = function (opt) {
    main_dom = this;
    options = opt || {};
    // clear all intervals

    /*  var interval_id = setInterval("", 9999); // Get a reference to the last
      // interval +1
      for (var i = 1; i < interval_id; i++)
        clearInterval(i);
  */
    hostWidth = $(window).width();
    hostHeight = $(window).height();
    console.log("Window size:" + hostWidth + "x" + hostHeight);

    $(window).resize(function () {
      hostWidth = $(window).width();
      hostHeight = $(window).height();
      console.log("resized " + hostWidth + "x" + hostHeight);
    });
    /* jQuery chaining */
    return this.each(function () {
      var notupdate_dataset = 1;
      /* Transform to HTML */
      // var html = chaosCtrl2html(cu, options, '');
      if (options.template == "cu") {
        var html = "";
        html += buildCUBody();
        html += generateModalActions();
        html += '<div class="specific-table-cu"></div>';
        html += '<div class="specific-control-cu"></div>';
        /*** */
        /* Insert HTML in target DOM element */
        $(this).html(html);
        graphSetup();
        snapSetup();
        datasetSetup();
        descriptionSetup();
        logSetup();
        mainCU();
      } else if (options.template == "node") {
        var html = "";
        html += buildNodeBody();
        html += generateEditJson();
        html += '<input id="inputClipBoard" value=" "/>';

        html += '<div class="specific-table-node"></div>';

        $(this).html(html);
        mainNode(options.template);

      } else if (options.template == "ctrl") {
        var html = "";
        html += '<div class="specific-table-ctrl"></div>';
        html += '<div class="specific-control-ctrl"></div>';
        $(this).html(html);
        buildCUInteface(options.cu, implementation_map[options.interface], options.template);

      } else if (options.template == "algo") {
        var html = "";
        html += buildAlgoBody();
        html += '<div class="specific-table-algo"></div>';
        html += '<div class="specific-control-algo"></div>';

        $(this).html(html);
        mainAlgo(options.template);
      }
      $("#menu-dashboard").html(generateMenuBox());

      jsonSetup($(this));
      $(".savetofile").on("click", function (e) {
        var t = $(e.target);
        if (save_obj instanceof Object) {
          if (save_obj.fext == "json") {
            var blob = new Blob([JSON.stringify(save_obj.obj)], { type: "json;charset=utf-8" });
            saveAs(blob, save_obj.fname + "." + save_obj.fext);
          }
        }
      });
      $(".savetofilecsv").on("click", function (e) {
        var t = $(e.target);
        if (save_obj instanceof Object) {
          if (save_obj.fext == "json") {
            var str = convertToCSV(save_obj.obj);
            var blob = new Blob([str], { type: "text;charset=utf-8" });
            saveAs(blob, save_obj.fname + ".csv");
          }
        }
      });
    });
  }
})(jQuery);
