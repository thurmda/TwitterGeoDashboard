
_sizeToFit();
$(window).resize(_sizeToFit);


var resizeCountDown;
function _sizeToFit (){
	var ww = window.innerWidth * .98,
		wh = ww * 9 / 16;


	clearTimeout(resizeCountDown);
	resizeCountDown = 
	$("#sizeToFit").remove();
	var basefontSize = (ww / 1024)  * 12;
	$("head").append(
		"<style id='sizeToFit'>" +
		"body{font-size: "+basefontSize+"px;}" +
		"#wrapper{height: "+wh+"px;width: "+ ww +"px;}" +
		"</style>");	
	resizeCountDown  = setTimeout(function(){
		if(typeof latestGeo !=="undefined")
//			init();
//			animate();
			sunburst(latestGeo);
		},100);
};
