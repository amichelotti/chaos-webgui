/**
 * !CHAOS REST Library
 */
(function(window){
	function createLibrary(){
		var jchaos={};
		jchaos.uri=location.host;
		jchaos.lastChannel={};
		jchaos.basicPost= function(func,params,handleFunc){
			var saveData = $.ajax({  // inizio post
				type: 'POST',
				url: "http://" + jchaos.uri + ":8081/"+func,
				data: params,
				dataType: "json",
				success: function(datavalue) {
					jchaos.lastChannel=datavalue;
					handleFunc(datavalue);
					
				} });
		    saveData.error(function() { console.log("POST \"" + params+"\" went wrong"); });

		}
		jchaos.getChannel=function(devs,channel_id,handleFunc){
			var str_url_cu = "dev="+ devs + "&cmd=channel&parm="+channel_id;
			jchaos.basicPost("CU",str_url_cu,function(datav){jchaos.lastChannel=datav;handleFunc(datav);});
		}
		return jchaos;
	}
	if(typeof(window.jchaos === 'undefined')){
		window.jchaos=createLibrary();
	}
})(window);
