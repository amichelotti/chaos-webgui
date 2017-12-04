/**
 * jQuery chaos widget
 * @author: Andrea Michelotti <andrea.michelotti@lnf.infn.it>
 */
(function($){


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

  /**
   * Transform a json object into html representation
   * @return string
   */
  function json2html(json, options,pather) {
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
          html += json2html(json[i], options,key);
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
            var keyclass="";
            if(isCollapsable(json[key])){
            	keyclass="json-string";
            } else {
            	keyclass="json-key";
            }
            var keyRepr = options.withQuotes ?
              '<span class="'+keyclass+'" id='+pather+'-'+key+'>"' + key + '"</span>' : key;
            /* Add toggle button if item is collapsable */
            if (isCollapsable(json[key])) {
              html += '<a href class="json-toggle">' + keyRepr + '</a>';
            }
            else {
              html += keyRepr;

            }
            html += ': ' + json2html(json[key], options,key);
            if ((!isCollapsable(json[key]))&& (pather == "input")) {
                html += '<input class="json-keyinput" id="attr-'+key+'"/>';

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

  function setSched(name,value){
    jchaos.setSched(name,value);
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

  function Stop(cuid){
    jchaos.sendCUCmd(cuid,"stop","",null);
  }
  function Start(cuid){
    jchaos.sendCUCmd(cuid,"start","",null);
  }
  function Deinit(cuid){
    jchaos.sendCUCmd(cuid,"deinit","",null);
  }
  function Init(cuid){
    jchaos.sendCUCmd(cuid,"init","",null);
  }
  function ByPassON(cuid) {
    jchaos.setBypass(cuid,true,null);
        
}
function ByPassOFF() {
    jchaos.setBypass(cuid,false,null);
}

function chaosGeneric(cuid,html,options){
  var status;
  var cu=jchaos.getChannel(cuid, -1,null);
  var desc=jchaos.getDesc(cuid,null);
  if(cu[0].hasOwnProperty('health')) { 
     var jsonhtml;
      status=cu[0].health.nh_status;
      var ctrlid=cuid.replace(/\//g,"_");
      html+='<div class="span12">';
      html+='<h2>DATASET</span></h2>';
      jsonhtml=json2html(cu[0], options,cuid);
      if (isCollapsable(cu[0])){
        jsonhtml = '<a href class="json-toggle"></a>' + jsonhtml;
      }
      html+=jsonhtml;
      html+='</div>';      
      html+='<div class="span12">';
      html+='<h2>DESCRIPTION</span></h2>';
      jsonhtml=json2html(desc, options,cuid);
      if (isCollapsable(desc)){
        jsonhtml = '<a href class="json-toggle"></a>' + jsonhtml;
      }        
      html+=jsonhtml;      
      html+='</div>'        
              
      html+='<div class="row-fluid">';
      html+='<div class="box span12 box-cmd">';
      html+='<div class="box-header green">';
      html+='<h3 id="h3-cmd">Commands</h3>';
      html+='</div>';
      html+='<div class="box-content">';

      if(cu[0].hasOwnProperty('system')){						
              html+='<div class="row-fluid">';
              html+="<div class='span6 statbox'>";
              html+="<h3>Actual scheduling (us):" + cu[0].system.cudk_thr_sch_delay+"</h3>";
              html+="</div>";    
              
              html+="<div class='span3'>";              
              //html+="<input type='text' id='setSchedule' onkeypress='setSched(\""+cuid.cuname+"\",this.value);'>"; 
              html+="<input type='text' class='setSchedule' cuname=\""+cuid+"\">"; 
            //html+="<input type='text' id='setSchedule' onkeypress='jchaos.setSched(\""+cuid+"\",this.value);'>"; 
              html+="</div>";
              html+="</div>";    
              
      }

						
					
    html+='<div class="row-fluid">';    
    html+="<div class='span12'>";
    if (status == 'Start') {
      
        html+="<a class='quick-button-small span2 btn-cmd' id='cmd-stop-"+ctrlid+"' onclick='jchaos.sendCUCmd(\""+cuid+"\",\"stop\",\"\",null);'><i class='material-icons verde'>pause</i><p class='name-cmd'>Stop</p></a>";
        
    } else if (status == 'Stop') {
      html+="<a class='quick-button-small span2 btn-cmd' id='cmd-start-"+ctrlid+"' onclick='jchaos.sendCUCmd(\""+cuid+"\",\"start\",\"\",null);'><i class='material-icons verde'>play_arrow</i><p class='name-cmd'>Start</p></a>";
      html+="<a class='quick-button-small span2 btn-cmd' id='cmd-deinit-"+ctrlid+"' onclick='jchaos.sendCUCmd(\""+cuid+"\",\"deinit\",\"\",null);'><i class='material-icons verde'>trending_down</i><p class='name-cmd'>Deinit</p></a>";
      
    }  else if (status == 'Init') {
      html+="<a class='quick-button-small span2 btn-cmd' id='cmd-start-"+ctrlid+"' onclick='jchaos.sendCUCmd(\""+cuid+"\",\"start\",\"\",null);'><i class='material-icons verde'>play_arrow</i><p class='name-cmd'>Start</p></a>";        
      html+="<a class='quick-button-small span2 btn-cmd' id='cmd-deinit-"+ctrlid+"' onclick='jchaos.sendCUCmd(\""+cuid+"\",\"deinit\",\"\",null);'><i class='material-icons verde'>trending_down</i><p class='name-cmd'>Deinit</p></a>";
    } else if (status == 'Deinit') {
      html+="<a class='quick-button-small span2 btn-cmd' id='cmd-deinit-"+ctrlid+"' onclick='jchaos.sendCUCmd(\""+cuid+"\",\"init\",\"\",null);'><i class='material-icons verde'>trending_up</i><p class='name-cmd'>Init</p></a>";
      html+="<a class='quick-button-small span2 btn-cmd' id='cmd-unload-"+ctrlid+"' onclick='jchaos.loadUnload(\""+cuid+"\",false,null);'><i class='material-icons verde'>power</i><p class='name-cmd'>Unload</p></a>";
      
    } else if (status == 'Recoverable Error') {
      html+="<a class='quick-button-small span2 btn-cmd' id='cmd-init-"+ctrlid+"' onclick='jchaos.sendCUCmd(\""+cuid+"\",\"recover\",\"\",null);'><i class='material-icons verde'>build</i><p class='name-cmd'>Recover Error</p></a>";
    } else if(status == "Recoverable Error"){

    } else if (status == "Load") {
      html+="<a class='quick-button-small span2 btn-cmd' id='cmd-load-"+ctrlid+"' onclick='jchaos.loadUnload(\""+cuid+"\",true,null);'><i class='material-icons green'>power</i><p class='name-cmd'>Unload</p></a>";
      
    } else {
      html+="<a class='quick-button-small span2 btn-cmd' id='cmd-load-"+ctrlid+"' onclick='jchaos.loadUnload(\""+cuid+"\",true,null);'><i class='material-icons red'>power</i><p class='name-cmd'>Load</p></a>";
      
    }
    
  
  if(cu[0].hasOwnProperty('system')){
    var bypass=cu[0].system.cudk_bypass_state;
    if(bypass){
      html+="<a class='quick-button-small span2 btn-cmd' id='cmd-bypassOFF-"+ctrlid+"'' onclick='jchaos.setBypass(\""+cuid+"\",false,null);'><i class='material-icons verde'>usb</i><p class='name-cmd'>BypassOFF</p></a>";
        
    } else {
      html+="<a class='quick-button-small span2 btn-cmd' id='cmd-bypassON-"+ctrlid+"'' onclick='jchaos.setBypass(\""+cuid+"\",true,null);'><i class='material-icons verde'>cached</i><p class='name-cmd'>BypassON</p></a>";   
    }
  }
  html+="</div>";    
  html+="</div>";    
  html+="</div>";    
  html+="</div>";   
  html+="</div>";    
}
return html;
}
  /**
   * Transform a json object into html representation
   * @return string
   */
  function chaosCtrl2html(cuid, options) {
    var html = '';

    if(options.CUtype=="generic"){
      html=chaosGeneric(cuid,html,options);
    }
   
    return html;
  }

  /**
   * jQuery plugin method
   * @param json: a javascript object
   * @param options: an optional options hash
   */
  
  $.fn.chaosDashboard = function(cu, options) {
    options = options || {};
    var collapsed=options.collapsed;
    /* jQuery chaining */
    return this.each(function() {
    
      /* Transform to HTML */
     var html = chaosCtrl2html(cu, options,'');
     
      /* Insert HTML in target DOM element */
     $(this).html(html);
     $(this).off('mousemove');
     $(this).off('keypress');
     $(this).on('keypress',function(event){
      var t = $(event.target);
      
       if((event.which == 13)&&(t.attr('class')=="setSchedule")){
         var name = $(t).attr("cuname");
         var value=$(t).attr("value");
        jchaos.setSched(name,value);
        
       }
      
     });

     /*** json events */
     $(this).off('click');
     $(this).on('click', 'a.json-toggle', function() {
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

     $(this).on('click', 'span.json-key', function() {
       var id=this.id;
      var attr = id.split("-")[1];
      
       $("#attr-"+attr).toggle();
      //var tt =prompt('type value');
         return false;
       });
     
     $(this).on('keypress', 'input.json-keyinput', function(e) {
       if(e.keyCode == 13){
        var id=this.id;
        var attr = id.split("-")[1];
        jchaos.setAttribute(cu,attr,this.value);
         $("#"+this.id).toggle();
         return false;
       }
      //var tt =prompt('type value');
         return this;
       });
     /* Simulate click on toggle button when placeholder is clicked */
     $(this).on('click', 'a.json-placeholder', function() {
       $(this).siblings('a.json-toggle').click();
       return false;
     });

     if (options.collapsed == true) {
       /* Trigger click to collapse all nodes */
       $(this).find('a.json-toggle').click();
     }
    var last=0, diff;
    $(this).off('mousemove');
    $(this).on('mousemove',  function(event) {
        diff = event.timeStamp - last;
        last=event.timeStamp;
        if(diff>500){
        var html = chaosCtrl2html(cu, options,'');
        collapsed=!$(this).find('a.json-toggle').is(':visible');
         /* Insert HTML in target DOM element */
         $(this).html(html);
         if (collapsed == true) {
          /* Trigger click to collapse all nodes */
          $(this).find('a.json-toggle').click();
        }
        }
      }); 
     
    });
  };
})(jQuery);
