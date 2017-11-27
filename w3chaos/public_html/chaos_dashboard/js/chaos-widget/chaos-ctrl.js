/**
 * jQuery chaos widget
 * @author: Andrea Michelotti <andrea.michelotti@lnf.infn.it>
 */
(function($){


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

function chaosGeneric(cuid,html){
  var status;
  var cu=jchaos.getChannel(cuid, -1,null);
  if(cu[0].hasOwnProperty('health')) { 
      status=cu[0].health.nh_status;
      var ctrlid=cuid.replace(/\//g,"_");
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
    if (status == 'Start' || status ==  'start') {
      
        html+="<a class='quick-button-small span2 btn-cmd' id='cmd-stop-"+ctrlid+"' onclick='jchaos.sendCUCmd(\""+cuid+"\",\"stop\",\"\",null);'><i class='material-icons verde'>pause</i><p class='name-cmd'>Stop</p></a>";
        
    } if (status == 'Stop' || status == 'stop') {
      html+="<a class='quick-button-small span2 btn-cmd' id='cmd-start-"+ctrlid+"' onclick='jchaos.sendCUCmd(\""+cuid+"\",\"start\",\"\",null);'><i class='material-icons verde'>play_arrow</i><p class='name-cmd'>Start</p></a>";
      html+="<a class='quick-button-small span2 btn-cmd' id='cmd-deinit-"+ctrlid+"' onclick='jchaos.sendCUCmd(\""+cuid+"\",\"deinit\",\"\",null);'><i class='material-icons verde'>trending_down</i><p class='name-cmd'>Deinit</p></a>";
      
    }  if (status == 'Init' || status == 'init') {
      html+="<a class='quick-button-small span2 btn-cmd' id='cmd-start-"+ctrlid+"' onclick='jchaos.sendCUCmd(\""+cuid+"\",\"start\",\"\",null);'><i class='material-icons verde'>play_arrow</i><p class='name-cmd'>Start</p></a>";        
      html+="<a class='quick-button-small span2 btn-cmd' id='cmd-deinit-"+ctrlid+"' onclick='jchaos.sendCUCmd(\""+cuid+"\",\"deinit\",\"\",null);'><i class='material-icons verde'>trending_down</i><p class='name-cmd'>Deinit</p></a>";
    } if (status == 'Deinit' || status == 'deinit') {
      html+="<a class='quick-button-small span2 btn-cmd' id='cmd-init-"+ctrlid+"' onclick='jchaos.sendCUCmd(\""+cuid+"\",\"init\",\"\",null);'><i class='material-icons verde'>trending_up</i><p class='name-cmd'>Init</p></a>";
    } 
    
  }
  if(cu[0].hasOwnProperty('system')){
    var bypass;
    if(bypass){
      html+="<a class='quick-button-small span2 btn-cmd' id='cmd-bypassOFF-"+ctrlid+"'' onclick='jchaos.setBypass(\""+cuid+"\",\"false\",null);'><i class='material-icons verde'>usb</i><p class='name-cmd'>BypassOFF</p></a>";
        
    } else {
      html+="<a class='quick-button-small span2 btn-cmd' id='cmd-bypassON-"+ctrlid+"'' onclick='jchaos.setBypass(\""+cuid+"\",\"true\",null);'><i class='material-icons verde'>cached</i><p class='name-cmd'>BypassON</p></a>";   
    }
  }
  html+="</div>";    
  html+="</div>";    
  html+="</div>";    
  html+="</div>";   
  html+="</div>";    
  
return html;
}
  /**
   * Transform a json object into html representation
   * @return string
   */
  function chaosCtrl2html(cuid, options) {
    var html = '';

    if(options.CUtype=="generic"){
      html=chaosGeneric(cuid,html);
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
  /*  var t=$(this).find("#setSchedule");
    t.bind('keypress',function(event){
      var value=t.value;

    });
    t.setSched=function(name,value){
      jchaos.setSched(name,value);
    }*/
    /*t.off('value');
    t.on('value',function(event){
        if(event.which== 13){
          jchaos.setSched(this.cuname,this.value);
        }
     });
    */  var last=0, diff;
     $(this).on('mousemove',  function(event) {
        diff = event.timeStamp - last;
        last=event.timeStamp;
        if(diff>500){
        var html = chaosCtrl2html(cu, options,'');
        
         /* Insert HTML in target DOM element */
         $(this).html(html);
        }
      }); 
     
    });
  };
})(jQuery);
