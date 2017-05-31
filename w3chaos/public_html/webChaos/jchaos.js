/**
 * !CHAOS REST Library
 */
(function(){
	function createLibrary(){
		var jchaos={};
		
		
		jchaos.lastChannel={};
		jchaos.options={
				updateEachCall:false,
				uri:"localhost",
				async:true
		};
		jchaos.setOptions=function(opt){
			for (var attrname in opt) { jchaos.options[attrname] = opt[attrname]; }

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

			var request = new XMLHttpRequest();
		        //   request.open("GET", "/cgi-bin/cu.cgi?InitId=" + this.name,true);
		   			var url ="http://" + jchaos.options.uri + ":8081/"+func;
			   //    console.log("opening:"+url + " async:"+jchaos.options.async);
			    	/*if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
			    		request.open("POST", url,false);
			    	} else {
			    		request.open("POST", url,true);

			    	}*/
		    		request.open("POST", url, jchaos.options.async);

			    //	request.setRequestHeader("cache-control", "no-cache");
			    	request.setRequestHeader("Content-Type", 'application/json');
			    	//request.setRequestHeader("Content-type", "application/json");
			    	//request.responseType = 'JSON';
		    		//request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

			        request.onreadystatechange = function (e) {
			        	//console.log("answer:"+request.status + " state:"+request.readyState);
			            if (request.readyState == 4){
			            if( request.status == 200) {
							handleFunc(JSON.parse(request.responseText));
			            } else {
			            	var str="POST "+ url + " body:\"" + params+"\" went wrong, result:"+request.status+ " state:"+request.readyState ; console.log(str); 
			            	throw str; 
			            }
			            }
	
			        }
			        request.onerror = function (e) {
			            console.error(request.statusText);
			            throw "error:"+request.statusText;
			        };
			        //console.log("sending:"+params);
			        request.send(params);
			      //  request.close();
		    	
		}
		jchaos.addLongKey=function(obj,key,valuestr){
			if(obj[key]== undefined){
				var tt={}
				tt['$numberLong']=valuestr;
				obj[key]=tt;
			}
		}
		jchaos.registerCU=function(cuid,obj,handleFunc){
			var str_url_cu = "/api/v1/producer/jsonregister/"+cuid;
			var dd=Date.now();
			jchaos.addLongKey(obj,'dpck_ats',dd.toString());
			jchaos.addLongKey(obj,'dpck_seq_id',"0");		
			jchaos.basicPost(str_url_cu,JSON.stringify(obj),function(datav){handleFunc(datav);});
		}
		
		jchaos.pushCU=function(cuid,obj,handleFunc){
			var str_url_cu = "/api/v1/producer/jsoninsert/"+cuid;
			var dd=Date.now();
			obj['dpck_ats'].$numberLong=dd.toString();	
			var id=parseInt(obj['dpck_seq_id'].$numberLong);
			id++;
			obj['dpck_seq_id'].$numberLong=id.toString();
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
		
			var dev_array="";
			if(devs instanceof Array){
				devs.forEach(function(elem,i,array){
					if(i<(array.length-1)){
						dev_array+=elem + ",";
					} else {
						dev_array+=elem ;
					}
				});
			} else {
				dev_array=devs;
			}
			var str_url_cu = "dev="+ dev_array + "&cmd=channel&parm="+channel_id;
		//	console.log("query:"+str_url_cu);
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
		
		module.exports = createLibrary();
	    
	} else{
	    window.jchaos = createLibrary();
	}
})();
