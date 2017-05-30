/**
 * !CHAOS REST Library
 */
(function(window){
	function createLibrary(){
		var jchaos={};
		jchaos.uri=location.host;
		jchaos.lastChannel={};
		jchaos.options={
				updateEachCall:false
		};
		jchaos.setOptions=function(opt){
			jchaos.options=opt;
		}
		
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
		
		jchaos.getHistory=function(devs,channel,start,stop,page,varname,uid,result,handleFunc){
			var cmd="";
			var varopt="";
			var query="{";
			
			if(page>0){
				query+="\"page\":"+page+",";
			}
			if(varname!=""){
				query+="\"var\":"+varname+",";
			}
			query+="\"start\":"+start+",";
			query+="\"end\":"+stop+",";
			query+="\"channel\":"+channel+",";
			query+="\"uid\":"+uid;

			if(uid==0){
				cmd="queryhst";
			} else {
				cmd="queryhstnext";
			}
			query+="}";
			var str_url_cu = "dev="+ devs + "&cmd="+cmd+"&parm="+query;
			jchaos.registerCU(obj){
				
			}
			jchaos.basicPost("CU",str_url_cu,function(datav){
				if(datav.uid>0){
					jchaos.getHistory(devs,channel,start,stop,page,varname,datav.uid,handleFunc);
				}
				if(vaname==""){
					for(ele in datav.data){
						result.X.push(Number(ele.ts.$numberLong));
						result.Y.push(ele.val);
					}
				} else {
					for(ele in datav.data){
						result.X.push(Number(ele.dpck_ats.$numberLong));
						result.Y.push(ele.val);
					}
					
				}
				if(jchaos.options.updateEachCall){
					handleFunc(result);
				} else {
					if(!(datav.uid>0)){
						// update if 0 or something else
						handleFunc(result);

					}
				}
				
				});
		}
		
		return jchaos;
	}
	if(typeof(window.jchaos === 'undefined')){
		window.jchaos=createLibrary();
	}
})(window);
