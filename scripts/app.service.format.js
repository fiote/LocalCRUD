window.myApp.service('$format', function() {

	this.asMoney = function(num) {
		if (!num) num = 0;
		if (!num.toFixed) num = parseFloat(num);
    	var p = num.toFixed(2).split(".");
    	return "$" + p[0].split("").reverse().reduce(function(acc, num, i, orig) {
        	return  num=="-" ? acc : num + (i && !(i % 3) ? "," : "") + acc;
    	}, "") + "." + p[1];
    };

    this.asFlag = function(flag) {
    	return (flag) ? 'Yes' : 'No';
    }
    
});