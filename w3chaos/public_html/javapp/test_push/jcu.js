var jchaos = require('../../webChaos/jchaos.js');

myobj={
	name:"ciao",
	v:1.0,
	arr:[1.0,2.0]
};


jchaos.search("","cu",true,function(data){
	data.forEach(function(elem){
		console.log("CU:"+elem);
	});
	jchaos.getChannel(data,-1,function(data){
		console.log("datasets:"+JSON.stringify(data));

	});

});
jchaos.registerCU("IMA/ACCELEROMETER/DAQ",myobj,function(data){
	console.log("ok");
	var cnt=0;
	while(cnt++<1000){
		myobj.v+=2.0;
		myobj.arr[0]+=2.0*cnt +1;
		myobj.arr[1]+=2.0*cnt;
		jchaos.pushCU("IMA/ACCELEROMETER/DAQ",myobj,function(data2){
			console.log("push "+cnt+ " OK");
	});
	}
});

	