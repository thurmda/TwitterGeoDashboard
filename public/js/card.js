var _cardMarkup =	"<img class='avatar' src='${avatar}' />"+
	"<h1 class='user'>{{html screen_name}}</h1>" +
	"<h2>{{html text}}</h2>"+
	"<h3 class='followers'>${ followers} followers</h3>";
$.template("card" , _cardMarkup);

var _displayTweetCard = function(tweet){
			var DOM  = $.tmpl( "card" , [tweet] );
			$("#tweet").fadeOut(800, function(){
				$("#tweet").html(DOM);
				$("#tweet").fadeIn(1800);
			});
}


var _statsMarkup =	""+
"<span class='stat'>{{html total}}<sub>total</sub></span>" +
"<span class='stat'>{{html perSecond.toString().substring(0,4)}}<sub>/sec</sub></span>";
$.template("stats" , _statsMarkup);

var _displayStats = function(stats){
	$("#stats").html($.tmpl( "stats" , [stats] ));
}