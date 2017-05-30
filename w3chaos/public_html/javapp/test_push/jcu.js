var jchaos = require('../../webChaos/jchaos.js');

myobj={
	name:"ciao",
	var:1.0,
	arr:[1.0,2.0]
};


jchaos.search("","cu",true,function(data){console.log("search:"+JSON.stringify(data));});

while(1){
//	console.log("waits");
	
}