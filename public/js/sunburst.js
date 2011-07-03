
var container = document.getElementById( 'geo' ),
    w = container.offsetWidth,
    h = container.offsetHeight,
    r = Math.min(w, h) / 2,
    color = d3.scale.category20c();

var vis = d3.select("#geo").append("svg:svg")
    .attr("width", w)
    .attr("height", h)
    .append("svg:g") 
    .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");

var partition = d3.layout.partition()
    .sort(null)
    .size([2 * Math.PI, r * r])
    .children(function(d) { 
    	return isNaN(d.value) ? d3.entries(d.value) : null; })
//    	var chillins = [];
//    	for(var i in d.value){
//    		if(i !="_c"){ 
//    			chillins.push(d.value[i]);
//    			}
//    		}
//    	return chillins.length ?  d3.entries(chillins): null;
//    	})
    .value(function(d) { return 1; });

var arc = d3.svg.arc()
    .startAngle(function(d) { return d.x; })
    .endAngle(function(d) { return d.x + d.dx; })
    .innerRadius(function(d) { return Math.sqrt(d.y); })
    .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });


var arcs, p=[], t;



function objectMapper(obj, filter){
	var prop, o = {};
	 for(prop in obj){
	  if (!(prop in filter.blackList)){
	   if (typeof obj[prop]==="object"){
	    o[prop] = objectMapper(obj[prop], filter);
	   }else{
	    o[prop] = obj[prop];
	   }
	  }
	 }
	return o;
	}
//d3.json("flare.json", sunburst);
function hmapConverter(json){
//	console.dir(json);
//	var _m = objectMapper(json, {blackList: {_id:null}}); 
//	console.dir(_m);
//	var m = d3.entries(_m);
//	return m;
	return  d3.entries(json);
}

function getColor(d,i){
//	  var 	stripe = i%3 * 90;
//		hue = Math.min(230, 70 + stripe + (i*2)),
//	  		hue = 70 + stripe + (i*2),

	return Math.floor(90 + Math.random()*160);
}
function sunburst(json) {
	arcs = vis.data(hmapConverter(json)).selectAll("g")
    		    .data(partition, function(d){return d._id;})
			    .enter().append("svg:g")
			    .attr("class", "arc")
	
	p[0] = arcs.append("svg:path")
      .attr("display", function(d) { 
    	  //if(!d.depth)return "none";
    	  return d.depth ? null : "none"; 
    	  //return d.value > 10 ? null : "none"; 
    	  })
      .attr("d", arc)
      .attr("fill", function(d, i ) {
	  			var 
	  			hue = getColor(d,i),
    	  		sat =  160 + (d.value * 3),
    	  		alpha = Math.max(.04, .9 - (d.depth*.12));	
    	  return "hsla("+hue+","+ sat +"%,60%,"+alpha+")"});
	
	t = arcs.append("svg:text")
		 .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
		 .attr("fill", "hsla(180,20%,20%,.8)")
		 .attr("text-anchor", "middle")
     	 .text(function(d, i) {return d.data.key});	
	
//updateSunburst(undefined,1000);
    p[0].data(repartition(function(d) {
		  return d.value; }))
	    .transition()
		    .duration(1000)
		    .attrTween("d", arcTween);
}
function updateSunburst(json, duration) {
	if(typeof json !== "undefined"){
	var newArcs = vis.data(hmapConverter(json)).selectAll("g")
		    .data(partition)
		    .enter().insert("svg:g")
		    .attr("class", "arc")  
	
	p[p.length] = newPaths = newArcs.insert("svg:path")
				    .attr("d", arc)
				    .attr("fill", function(d, i ) {
				  	  var 	hue = getColor(d,i),
				  	  		sat =  160 + (d.value * 3),
				  	  		alpha = Math.max(.04, .9 - (d.depth*.12));	
				  	  return "hsla("+hue+","+ sat +"%,60%,"+alpha+")"});

		newPaths.data(repartition(function(d) {
			  return d.value; }))
			  .transition()
			    .duration(duration || 500)
			    .attrTween("d", arcTween);

		for(var i =0; i<p.length; i++){
		    p[i].data(repartition(function(d) {
				  return d.value; }))
				  .transition()
				    .duration(duration || 500)
				    .attrTween("d", arcTween);
		}

//p = arcs.selectAll("svg:path");
//	    p = p.concat(newPaths);
	}


  


	  t.data(repartition(function(d) { return d.value; }))
	    .transition()
	    .duration(duration || 500)
		.attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })

}


// Compute a new partition, stashing the old value for transition.
function repartition(value) {
  return function(d) {
    var olds = partition(d),
        news = partition.value(value)(d);
    news.forEach(function(d, i) {
      d.prev = olds[i];
    });
    return news;
  };
}

// Interpolate the arcs in data space.
function arcTween(a) {
  var i = d3.interpolate({x: a.prev.x, dx: a.prev.dx}, a);
  return function(t) {
    return arc(i(t));
  };
}
//6522x