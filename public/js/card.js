

	var _cardMarkup =	""+
		"<h1>{{html screen_name}}</h1>" +
		"{{if image}}<img src='${image}'/>{{/if}}"+
		"<h2>{{html text}}</h2>";
	$.template("card" , _cardMarkup);
	
	var _displayTweetCard = function(tweet){
				var DOM  = $.tmpl( "card" , [tweet] );
				$("#tweet").fadeOut(800, function(){
					$("#tweet").html(DOM);
					$("#tweet").fadeIn(1800);
				});
	}
	_displayTweetCard({
		screen_name: "@thurmda",
		text: "Lorem ipsum tweet Lorem ipsum tweet Lorem ipsum tweet Lorem ipsum tweet Lorem ipsum tweet Lorem ipsum tweet Lorem ipsum tweet Lorem ipsum t"
	});

	
	setInterval(function(){
	_displayTweetCard({
		screen_name: "@thurmda",
		text: "Lorem ipsum tweet Lorem ipsum tweet Lorem ipsum tweet Lorem ipsum tweet Lorem ipsum tweet Lorem ipsum tweet Lorem ipsum tweet Lorem ipsum t"
	});
	
	}, 5000);
