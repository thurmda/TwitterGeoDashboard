
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
    	if(isNaN(d.value)){
    		return (d.value.c)? d3.entries(d.value.c) : null;
    	}
    	return null;
    	})
    .value(function(d) { return 1; });

var arc = d3.svg.arc()
    .startAngle(function(d) { return d.x; })
    .endAngle(function(d) { return d.x + d.dx; })
    .innerRadius(function(d) { return Math.sqrt(d.y *1.2); })
    .outerRadius(function(d) { return Math.sqrt((d.y + d.dy)*1.2); });

function byId(d){return d.data.value._id;};

var arcs, p, t;

function sunburst(json) {
	arcs = vis.data(d3.entries(json)).selectAll("g")
    		    .data(partition)
			    .enter().append("svg:g")
			    .attr("class", "arc")
	
	p = arcs.append("svg:path")
      	.attr("display", function(d) { 
	    	  if(d.data.key.substr(0,1)=="_") return "none";    
	    	  if(d.depth == 0) return "none";
	    	  if(d.depth > 3) return "none";
	    	  return null; 
    	  })
      .attr("d", arc)
      .attr("stroke", "hsla(180,40%,20%,.3)")
      .attr("fill", function(d, i ) {
//    	  console.dir(d);
    	  var 	hue = 70 + (i%2 * 60) + (i*2),
    	  		sat =  160 + (d.value * 3),
    	  		alpha = Math.max(.04, .9 - (d.depth*.22));	
    	  if (d.data && d.data.key && d.data.key=="other")
    		  alpha  = alpha *.2;
    	  return "hsla("+hue+","+ sat +"%,60%,"+alpha+")"});
	
	t = arcs.append("svg:text")
			 .attr("display", function(d) {
	    	  if(d.data.key.substr(0,1)=="_") return "none";
	    	  if(d.value &&  d.parent && d.parent.value && d.value / d.parent.value < .10) return "none";
	    	  if (d.data && d.data.key && d.data.key=="other") return "none";
	    	  return d.depth ? null : "none"; 
		 })
		.attr("transform", function(d) {
			var rotateAngle;
			if((d.x + d.dx/2) * (180/Math.PI) < 180){
				rotateAngle = Math.min(-90 + (d.x + d.dx/2) * (180/Math.PI), 90);
			}else{
				rotateAngle = 90 + (d.x + d.dx/2) * (180/Math.PI) ;
			}
			return "translate(" + arc.centroid(d) + ")rotate("+ rotateAngle +")"; })
		 .attr("fill", function(d){
			 var sat = (d.depth >2) ? 60: 20;
			 return "hsla(200,"+sat/2+"%,"+sat+"%,.8)"
		 	})
		 .attr("text-anchor", "middle")
     	 .text(function(d, i) {return d.data.key});	
	
//	setTimeout(updateSunburst, 3000);
}
function updateSunburst(json) {
	if(typeof json !== "undefined"){
		vis.data(d3.entries(json));
	}
	  p.data(repartition(function(d) { 
		  return d.value._v; }),byId)
		.attr("display", function(d) { 
	    	  if(d.data.key.substr(0,1)=="_") return "none";    
	    	  if(d.depth == 0) return "none";
	    	  if(d.depth > 3) return "none";
	    	  return null; 
    	  })
	    .transition()
	    .duration(200)
	    .attrTween("d", arcTween);

	  t.data(repartition(function(d) { return d.value._v; }),byId)
	  	.attr("display", function(d) {
	    	  if(d.data.key.substr(0,1)=="_") return "none";
	    	  if(d.depth > 1 && d.value &&  d.parent && d.parent.value && d.value / d.parent.value < .04) return "none";
	    	  if (d.data && d.data.key && d.data.key=="other") return "none";
	    	  return d.depth ? null : "none"; 
		 })
	    .transition()
	    .duration(200)
		.attr("transform", function(d) {
			var rotateAngle;
			if((d.x + d.dx/2) * (180/Math.PI) < 180){
				rotateAngle = Math.min(-90 + (d.x + d.dx/2) * (180/Math.PI), 90);
			}else{
				rotateAngle = 90 + (d.x + d.dx/2) * (180/Math.PI) ;
			}
			return "translate(" + arc.centroid(d) + ")rotate("+ rotateAngle +")"; })

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