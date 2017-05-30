/**
 * !CHAOS REST Library
 */
(function(){
	function createLibrary(){
		var jchaos={};
		
		
		jchaos.lastChannel={};
		jchaos.options={
				updateEachCall:false,
				uri:"localhost"
		};
		jchaos.setOptions=function(opt){
			jchaos.options=opt;

		}
		
		jchaos.basicPost= function(func,params,handleFunc){
			/*
			var saveData = $.ajax({  // inizio post
				type: 'POST',
				url: "http://" + jchaos.options.uri + ":8081/"+func,
				data: params,
				dataType: "json",
				success: function(datavalue) {
					jchaos.lastChannel=datavalue;
					handleFunc(datavalue);
					
				} });
		    saveData.error(function() { str="POST \"" + params+"\" went wrong"; console.log(str); throw str; });
*/

			 	
			 	var url ="http://" + jchaos.options.uri + ":8081/"+func;
		        //   request.open("GET", "/cgi-bin/cu.cgi?InitId=" + this.name,true);
		        console.log("opening:"+url);

		        request.open("POST", url,true);

		        //request.setRequestHeader("Content-type", "application/json");
		        //request.responseType = 'JSON';
		        request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

		        request.onreadystatechange = function (e) {
		        	console.log("answer:"+request.status + " state:"+request.readyState+ " e:"+e);
		            if (request.readyState == 4){
		            if( request.status == 200) {
					//	handleFunc(request.responseText);
		            } else {
		            	var str="POST "+ url + " body:\"" + params+"\" went wrong, result:"+request.status+ " state:"+request.readyState ; console.log(str); 
		            	throw str; 
		            }
		            }

		        }
		        request.onerror = function (e) {
		            console.error(request.statusText);
		        };
		        console.log("sending:"+params);
		        request.send(params);
		        //request.send(params);
		        
		}
		jchaos.registerCU=function(cuid,obj,handleFunc){
			var str_url_cu = "/api/vi/producer/jsonregister/"+cuid;
			jchaos.basicPost(str_url_cu,JSON.stringify(obj),function(datav){handleFunc(datav);});
		}
		
		jchaos.pushCU=function(cuid,obj,handleFunc){
			var str_url_cu = "/api/vi/producer/jsoninsert/"+cuid;
			jchaos.basicPost(str_url_cu,JSON.stringify(obj),function(datav){handleFunc(datav);});
		}
		jchaos.searchBase=function(opt,handleFunc){
			var param="cmd=search&parm="+JSON.stringify(opt);
			jchaos.basicPost("MDS",param,function(datav){handleFunc(datav);});
		}
		
		jchaos.search=function(_name,_what,_alive,handleFunc){
			var opt={
					name:_name,
					what:_what,
					alive:_alive
			};
			return jchaos.searchBase(opt,handleFunc);
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
	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
		var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
		 var request = new XMLHttpRequest();

		module.exports = createLibrary();
	    
	} else{
	    window.jchaos = createLibrary();
	}
})();
