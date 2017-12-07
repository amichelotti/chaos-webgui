/**
 * jQuery chaos widget
 * @author: Andrea Michelotti <andrea.michelotti@lnf.infn.it>
 */
(function ($) {


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
    html += '<a href="#" class="btn" id="snap-save">Save</a>';
    html += '<a href="#" class="btn" id="snap-show">Show</a>';
    html += '<a href="#" class="btn" id="snap-apply">Apply</a>';
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
    html += '<h3>Description ' + cuid + '</h3>';
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

  function generateModalActions(cuid) {
    var html = generateDataSet(cuid);
    html += generateDescription(cuid);
    html += generateSnapshotTable(cuid);
    return html;
  }

  function generateActionBox(cuid) {
    var html = '<div class="box black span4" onTablet="span4" onDesktop="span4">';
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

  function chaosGeneric(cu) {
    var status;
    var html = "";
    if (cu.hasOwnProperty('health')) {
      var cuid = cu.health.ndk_uid;
      status = cu.health.nh_status;
      var ctrlid = cuid.replace(/\//g, "_");


      html += '<div class="row-fluid">';
      html += '<div class="box span12 box-cmd">';
      html += '<div class="box-header green">';
      html += '<h3 id="h3-cmd">Commands</h3>';
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



      html += '<div class="row-fluid">';
      html += "<div class='span12'>";
      if (status == 'Start') {
        html += "<a class='quick-button-small span2 btn-cmd' id='cmd-stop-" + ctrlid + "' onclick='jchaos.sendCUCmd(\"" + cuid + "\",\"stop\",\"\",null);'><i class='material-icons verde'>pause</i><p class='name-cmd'>Stop</p></a>";
      } else if (status == 'Stop') {
        html += "<a class='quick-button-small span2 btn-cmd' id='cmd-start-" + ctrlid + "' onclick='jchaos.sendCUCmd(\"" + cuid + "\",\"start\",\"\",null);'><i class='material-icons verde'>play_arrow</i><p class='name-cmd'>Start</p></a>";
        html += "<a class='quick-button-small span2 btn-cmd' id='cmd-deinit-" + ctrlid + "' onclick='jchaos.sendCUCmd(\"" + cuid + "\",\"deinit\",\"\",null);'><i class='material-icons verde'>trending_down</i><p class='name-cmd'>Deinit</p></a>";

      } else if (status == 'Init') {
        html += "<a class='quick-button-small span2 btn-cmd' id='cmd-start-" + ctrlid + "' onclick='jchaos.sendCUCmd(\"" + cuid + "\",\"start\",\"\",null);'><i class='material-icons verde'>play_arrow</i><p class='name-cmd'>Start</p></a>";
        html += "<a class='quick-button-small span2 btn-cmd' id='cmd-deinit-" + ctrlid + "' onclick='jchaos.sendCUCmd(\"" + cuid + "\",\"deinit\",\"\",null);'><i class='material-icons verde'>trending_down</i><p class='name-cmd'>Deinit</p></a>";
      } else if (status == 'Deinit') {
        html += "<a class='quick-button-small span2 btn-cmd' id='cmd-init-" + ctrlid + "' onclick='jchaos.sendCUCmd(\"" + cuid + "\",\"init\",\"\",null);'><i class='material-icons verde'>trending_up</i><p class='name-cmd'>Init</p></a>";
        html += "<a class='quick-button-small span2 btn-cmd' id='cmd-unload-" + ctrlid + "' onclick='jchaos.loadUnload(\"" + cuid + "\",false,null);'><i class='material-icons red'>power</i><p class='name-cmd'>Unload</p></a>";

      } else if (status == 'Recoverable Error') {
        html += "<a class='quick-button-small span2 btn-cmd' id='cmd-init-" + ctrlid + "' onclick='jchaos.sendCUCmd(\"" + cuid + "\",\"recover\",\"\",null);'><i class='material-icons verde'>build</i><p class='name-cmd'>Recover Error</p></a>";
      } else if (status == "Fatal Error") {
        html += "<a class='quick-button-small span2 btn-cmd' id='cmd-deinit-" + ctrlid + "' onclick='jchaos.sendCUCmd(\"" + cuid + "\",\"deinit\",\"\",null);'><i class='material-icons verde'>trending_down</i><p class='name-cmd'>Deinit</p></a>";

      } else if (status == "Load") {
        html += "<a class='quick-button-small span2 btn-cmd' id='cmd-init-" + ctrlid + "' onclick='jchaos.sendCUCmd(\"" + cuid + "\",\"init\",\"\",null);'><i class='material-icons verde'>trending_up</i><p class='name-cmd'>Init</p></a>";
        html += "<a class='quick-button-small span2 btn-cmd' id='cmd-unload-" + ctrlid + "' onclick='jchaos.loadUnload(\"" + cuid + "\",false,null);'><i class='material-icons red'>power</i><p class='name-cmd'>Unload</p></a>";

      } else {
        html += "<a class='quick-button-small span2 btn-cmd' id='cmd-load-" + ctrlid + "' onclick='jchaos.loadUnload(\"" + cuid + "\",true,null);'><i class='material-icons green'>power</i><p class='name-cmd'>Load</p></a>";

      }


      if (cu.hasOwnProperty('system')) {
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
      html += "</div>";
      html += "</div>";
    }
    return html;
  }

  /**
   * Transform a json object into html representation
   * @return string
   */
  function chaosCtrl2html(cuid, options) {
    var html = '';

    if (options.CUtype == "generic") {
      html = chaosGeneric(cuid, html, options);
    }

    return html;
  }

  /**
   * jQuery plugin method
   * @param json: a javascript object
   * @param options: an optional options hash
   */
  $.fn.chaosDashboard = function (cu, options) {
    options = options || {};
    var collapsed = options.collapsed;
    /* jQuery chaining */
    return this.each(function () {
      var notupdate_dataset = 1;
      /* Transform to HTML */
      // var html = chaosCtrl2html(cu, options, '');
      var html = "";
      var snap_selected = "";
      /**
       * fixed part
       */
      html += generateModalActions(cu);
      html += generateActionBox(cu);
      html += '<div class="cu-generic-control"></div>';

      /*** */
      /* Insert HTML in target DOM element */
      $(this).html(html);
      $(this).off('keypress');
      $(this).on('keypress', function (event) {
        var t = $(event.target);

        if ((event.which == 13) && (t.attr('class') == "setSchedule")) {
          var name = $(t).attr("cuname");
          var value = $(t).attr("value");
          jchaos.setSched(name, value);

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
          jchaos.setAttribute(cu, attr, this.value);
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
        if (cu instanceof Array) {
          jchaos.snapshot(value, "create", cu, null);
        } else {
          jchaos.snapshot(value, "create", [cu], null, null);
        }
        var snap_table = $(this).find('a.show_snapshot');
        $(snap_table).click(); // force reload table
      });

      $("#snap-close").on('click', function () {
        $("#mdl-snap").modal("hide");
      });

      $(this).on('click', 'a.show_snapshot', function () {
      
        jchaos.search(cu, "snapshotsof", false, function (snaplist) {
          $("#table_dataset").find("tr:gt(0)").remove();
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
              var selected = $(this).hasClass("row_selected");

              $(this).removeClass("row_selected");
              if (!selected) {
                $(this).addClass("row_selected");
                var row_index = $(this).parent().index();
                snap_selected = $(this).attr("id");
                $("#snap_save_name").val(snap_selected);
              }
            });
          }
        });
      });
      

      $("#snap-show").on('click', function (e) {
        if (snap_selected != "") {
          var dataset = jchaos.snapshot(snap_selected, "load", "", "", null);
          var jsonhtml = json2html(dataset, options, cu);
          if (isCollapsable(dataset)) {
            jsonhtml = '<a href class="json-toggle"></a>' + jsonhtml;
          }

          $("#cu-description").html(jsonhtml);
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
        var dataset = jchaos.getChannel(cu, -1, null);
        var jsonhtml = json2html(dataset[0], options, cu);
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
        var dataset = jchaos.getDesc(cu, null);
        var jsonhtml = json2html(dataset, options, cu);
        if (isCollapsable(dataset)) {
          jsonhtml = '<a href class="json-toggle"></a>' + jsonhtml;
        }

        $("#cu-description").html(jsonhtml);
      });

      /************** */
      $("div.cu-generic-control").html(chaosGeneric(jchaos.getChannel(cu, -1, null)[0]));
      var interval = setInterval(function () {
        var data = jchaos.getChannel(cu, -1, null)[0];
        if ($("div.cu-generic-control").is(':visible') == false) {
          clearInterval(interval);
        } else {
          $("div.cu-generic-control").html(chaosGeneric(data));
          if ($("#cu-dataset").is(':visible') && !notupdate_dataset) {
            var jsonhtml = json2html(data, options, cu);
            if (isCollapsable(data)) {
              jsonhtml = '<a href class="json-toggle"></a>' + jsonhtml;
            }

            $("#cu-dataset").html(jsonhtml);

          }
        }

      }, 500);


    });
  };
})(jQuery);
