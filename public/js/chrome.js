
_sizeToFit();
$(window).resize(_sizeToFit);



function _sizeToFit (){
	var ww = window.innerWidth * .95,
		wh = ww * 9 / 16;
	console.log('w=%d , h=%d', ww, wh);
	
	$("#sizeToFit").remove();
	var basefontSize = (ww / 1024)  * 12;
	$("head").append(
		"<style id='sizeToFit'>" +
		"body{font-size: "+basefontSize+"px;}" +
		"#wrapper{height: "+wh+"px;width: "+ ww +"px;}" +
		"</style>");	

};
