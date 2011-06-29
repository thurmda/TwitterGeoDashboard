
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
    .children(function(d) { return isNaN(d.value) ? d3.entries(d.value) : null; })
    .value(function(d) { return 1; });

var arc = d3.svg.arc()
    .startAngle(function(d) { return d.x; })
    .endAngle(function(d) { return d.x + d.dx; })
    .innerRadius(function(d) { return Math.sqrt(d.y); })
    .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });


var arcs, p, t;

//d3.json("flare.json", sunburst);

function sunburst(json) {
	arcs = vis.data(d3.entries(json)).selectAll("g")
    		    .data(partition)
			    .enter().append("svg:g")
			    .attr("class", "arc")
	
	p = arcs.append("svg:path")
      .attr("display", function(d) { 
//    	  if(!d.depth)return "none";
    	  return d.depth ? null : "none"; 

//    	  return d.value > 10 ? null : "none"; 
    	  }) // hide inner ring
      .attr("d", arc)
      .attr("stroke", "hsla(180,40%,20%,.3)")
      .attr("fill", function(d, i ) {
//    	  console.dir(d);
    	  var 	hue = Math.min(230, 70 + (d.value * 5) + (i*9)),
    	  		sat =  160 + (d.value * 3),
    	  		alpha = Math.max(.04, .9 - (d.depth*.19));	
    	  
    	  return "hsla("+hue+","+ sat +"%,60%,"+alpha+")"})
      .attr("fill-rule", "evenodd");
	
	t = arcs.append("svg:text")
		 .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
		 .attr("fill", "hsla(180,20%,20%,.8)")
		 .attr("text-anchor", "middle")
     	 .text(function(d, i) {return d.data.key});	
	
	setTimeout(updateSunburst, 3000);
}
function updateSunburst(json) {
	if(typeof json !== "undefined"){
		vis.data(d3.entries(json));
	}
	  p.data(repartition(function(d) { 
		  return d.value; }))
	    .transition()
	    .duration(200)
	    .attrTween("d", arcTween);

	  t.data(repartition(function(d) { return d.value; }))
	    .transition()
	    .duration(200)
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