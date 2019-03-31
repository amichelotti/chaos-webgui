<!DOCTYPE HTML>
<html>
<?php
require_once('head.php');

$curr_page = "Home";

?>
<body>

<?php
require_once('header.php');
?>

	<div id="graph-container" grafname="" style="height:100%;width:100%;">
	<div id="graph" style="height:100%;width:100%;"></div>
	</div>
	<div id="query"></div>


	
	
	


<script>
var active_plots={};
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
function GetURLParameter(sParam){
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++){
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam){
            return sParameterName[1];
        }
	}}

	var graph_selected=GetURLParameter('name');
	if(graph_selected==null){
		alert("not a valid graph 'name' selected");
	} else {
		var high_graphs= jchaos.variable("highcharts", "get", null, null);

		var opt = high_graphs[graph_selected];
    if (!(opt instanceof Object)) {
      alert("\"" + graph_selected + "\" not a valid graph ");
	} else {
		$("#query").generateQueryTable();

   var  width= window.parent.innerWidth;
  var height= window.parent.innerHeight ;
  	$("#graph-container").css('width',width);
	$("#graph-container").css('height',height);

	$("#graph-container").dialog({
        modal: false,
        draggable: true,
        closeOnEscape: false,
        title: opt.name,
        width: width,
		hright: height,
		resizable: true,
        dialogClass: 'no-close',
        open: function () {
		  opt.highchart_opt.series[0]['data']=[];
		  var chart = new Highcharts.chart("graph", opt.highchart_opt);
		  $("#graph").css('width',width);
		  $("#graph").css('height',height);
		  
          $(this).attr("graphname", graph_selected);
          var start_time = (new Date()).getTime();
          var graphname = $(this).attr("graphname");

          console.log("New Graph:" + graphname + " has been created "+width+"x"+height);

          active_plots[graph_selected] = {
            graphname: graph_selected,
            graph: chart,
            highchart_opt: opt.highchart_opt,
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
              console.log("graph options:"+JSON.stringify(graph_opt)); 

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
			  
              var timebuffer=Number(graph_opt.highchart_opt['timebuffer'])*1000;
              high_graphs[graphname].start_time=(new Date()).getTime(); 
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
                    x = $.fn.getValueFromCUList(data, tr[k].x);
                  } else {
                    x=null;
                  }
                  if ((tr[k].y == null)) {
                    y = null;
                  } else if ((tr[k].y.origin == "timestamp")) {
                    y = (new Date()).getTime(); // current time
                  } else if (tr[k].y.const != null) {
                    y = tr[k].y.const;
                  } else if (tr[k].y.var != null) {
                    y = $.fn.getValueFromCUList(data, tr[k].y);

                  } else {
                    y=null;
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

                      for (var cntt = 0; cntt < y.length; cntt++) {
                        set.push([x[cntt], y + (inc * cntt)]);
                      }

                      chart.series[cnt].setData(set, true, true, true);

                    } else {
                      chart.series[cnt].addPoint([x, y], false, enable_shift);
                    }
                    cnt++;
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
                      set.push({ x, y });
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

              if (graph_opt.highchart_opt.xAxis.type != "datetime") {
                alert("X axis must be configured as datetime, for history plots!")
                return;
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
                  console.log("to retrive CU:" + item);
                  for (k in tr) {
                    if (tr[k].y.cu === item) {
                      dirlist[tr[k].y.dir] = dir2channel(tr[k].y.dir);
                      console.log("Y Trace " + tr[k].name + " path:" + tr[k].y.origin);

                    }
                  }
                  for (var dir in dirlist) {
                    jchaos.getHistory(item, dirlist[dir], qstart, qstop, "", function (data) {
                      var cnt = 0, ele_count = 0;
                      for (k in tr) {
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
                                    var v = tmp[cntt];
                                    dataset.push([t, v]);
                                    chart.series[cnt].addPoint([t, v], false, false);
                                  }
                                  // chart.series[cnt].setData(dataset, true, true, true);
                                  chart.redraw();

                                } else {
                                  chart.series[cnt].addPoint([ts, tmp[index]], false, false);
                                }

                              } else {
                                chart.series[cnt].addPoint([ts, tmp], false, false);

                              }
                            }
                          });
                        }
                        cnt++;
                      }
                      chart.redraw();
                      // true until close if false the history loop retrive breaks
                      return active_plots.hasOwnProperty(graphname);
                    });
                  }
                });

              });
            }
          }, {
            text: "Save",
            click: function () {
              var graphname = $(this).attr("graphname");
              var graph_opt = high_graphs[graphname];
              var chart = active_plots[graphname]['graph'];
              var obj={};
              if(chart.series instanceof Array){
                chart.series.forEach(function(item){
                  obj[item.name]=[];
                  item.data.forEach(function (dat){
                    var x=dat.x;
                    var y=dat.y;
                    obj[item.name].push([x,y]);
                  });
                });
                var blob = new Blob([JSON.stringify(obj)], { type: "json;charset=utf-8" });
                saveAs(blob, graphname+".json");
              }
            
            }
          }, {
            text: "Load",
            click: function () {
              var graphname = $(this).attr("graphname");
              var graph_opt = high_graphs[graphname];
              var chart = active_plots[graphname]['graph'];
              $().getFile("TRACE LOAD","select the trace to load",function(data){
                //console.log("loaded:"+JSON.stringify(data));
                
                for(var key in data){
                  var newseries={};

                  var xy=data[key];
                  newseries['name']=key;
                  newseries['data']=xy;
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
	}}
</script>
	

</body>
</html>
