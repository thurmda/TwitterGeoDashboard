
var container = document.getElementById( 'geo' ),
	w = container.offsetWidth,
	h = container.offsetHeight,
	r = .9 * Math.min(w, h) / 2,
    color = d3.scale.category20c(),
    vis, arcs, p=[], t=[],
    partition = d3.layout.partition()
	    .sort(null)
	    .size(getSize())
	    .children(function(d) {
	    	if(isNaN(d.value)){
	    		return (d.value.c)? d3.entries(d.value.c) : null;
	    	}
	    	return null;
	    	})
	    .value(function(d) { return 1; }),
    arc = d3.svg.arc()
	    .startAngle(function(d) { return d.x; })
	    .endAngle(function(d) { return d.x + d.dx; })
	    .innerRadius(function(d) { 
	    	var inner = Math.sqrt(d.y *1.2);
	    	if(d.depth>=2) inner = inner *.98;
	    	return inner;})
	    .outerRadius(function(d) { 
	    	var outter = Math.sqrt((d.y + d.dy)*1.2);
	    	if(d.depth==3) outter = outter *1.14;
	    	return outter;});
function getSize(){
	console.log(r);
	return [2 * Math.PI, r *r];
}
function byId(d){
	var id = (d.data) ? d.data.value._id :undefined;
	return id;};
	var creatingSunburst = false;
	var updatingSunburst = false;
function sunburst(json) {
	creatingSunburst = true;
	d3.select("#geo svg").remove();
    w = container.offsetWidth;
    h = container.offsetHeight;
    wh = Math.min(w, h);
    r = .89 * wh / 2;
    partition = d3.layout.partition()
    .sort(null)
    .size(getSize())
    .children(function(d) {
    	if(isNaN(d.value)){
    		return (d.value.c)? d3.entries(d.value.c) : null;
    	}
    	return null;
    	})
    .value(function(d) { return 1; });
    
	vis = d3.select("#geo").append("svg:svg")
	    .attr("width", wh)
	    .attr("height", wh)
	    .append("svg:g") 
	    .attr("transform", "translate(" + wh / 2 + "," + wh / 2 + ")");	
	
	arcs = vis.data(d3.entries(json)).selectAll("g")
    		    .data(partition,byId)
			    .enter().append("svg:g")
			    .attr("class", "arc")
	
	p[0] = arcs.append("svg:path")
	      .attr("display", function(d) { 
		    	  if(d.data.key.substr(0,1)=="_") return "none";    
		    	  if(d.depth == 0) return "none";
		    	  if(d.depth > 3) return "none";
		    	  return null; 
	    	  })
	      .attr("d", arc)
	      .attr("stroke", "hsla(180,40%,20%,.3)")
	      .attr("fill", function(d, i ) {
	    	  var 	hue = 70 + (i%2 * 60) + (i*2),
	    	  		sat =  160 + (d.value * 3),
	    	  		alpha = Math.max(.04, .9 - (d.depth*.22));	
	    	  if (d.data && d.data.key && d.data.key=="other")
	    		  alpha  = alpha *.2;
	    	  return "hsla("+hue+","+ sat +"%,60%,"+alpha+")"});
	
	t[0] = arcs.append("svg:text")
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
	
	
    p[0].data(repartition(function(d) {
		  return d.value._v;}), byId)
		.attr("display", function(d) { 
	    	  if(d.data.key.substr(0,1)=="_") return "none";    
	    	  if(d.depth == 0) return "none";
	    	  if(d.depth > 3) return "none";
	    	  return null; 
  	  })
		  .transition()
		    .duration(4000)
		    .attrTween("d", arcTween);
	  t[0].data(repartition(function(d) { return d.value._v; }),byId)
	  	.attr("display", function(d) {
	    	  if(d.data.key.substr(0,1)=="_") return "none";
	    	  if(d.depth > 1 && d.value &&  d.parent && d.parent.value && d.value / d.parent.value < .04) return "none";
	    	  if (d.data && d.data.key && d.data.key=="other") return "none";
	    	  return d.depth ? null : "none"; 
		 })
	    .transition()
	    .duration(4000)
		.attr("transform", function(d) {
			var rotateAngle;
			if((d.x + d.dx/2) * (180/Math.PI) < 180){
				rotateAngle = Math.min(-90 + (d.x + d.dx/2) * (180/Math.PI), 90);
			}else{
				rotateAngle = 90 + (d.x + d.dx/2) * (180/Math.PI) ;
			}
			return "translate(" + arc.centroid(d) + ")rotate("+ rotateAngle +")"; })	
	setTimeout(function(){creatingSunburst = false;}, 4500)
//	setTimeout(updateSunburst, 3000);
}
function updateSunburst(json) {
	updatingSunburst = true;
	setTimeout(function(){updatingSunburst=false},4800);
	if(creatingSunburst) return;
	
	if(typeof json !== "undefined"){
		arcs = vis.data(d3.entries(json)).selectAll("g")
					    .data(partition,byId).enter().insert("svg:g")
					    .attr("class", function(d){
					    var id = byId(d);
					    	return "arc new";
					    })  		
	var newArcs = vis.selectAll("g.new").attr("class", "arc");
		p[p.length] = newPaths = newArcs.insert("svg:path")
		  .attr("d", arc)
	      .attr("fill", function(d, i ) {
	    	  var 	hue = 70 + (i%2 * 60) + (i*2),
	    	  		sat =  160 + (d.value * 3),
	    	  		alpha = Math.max(.04, .9 - (d.depth*.22));	
	    	  if (d.data && d.data.key && d.data.key=="other")
	    		  alpha  = alpha *.2;
	    	  return "hsla("+hue+","+ sat +"%,60%,"+alpha+")"});

			newPaths.data(repartition(function(d) {
				  return d.value._v; }),byId)
				  .transition()
				    .duration(200)
				    .attrTween("d", arcTween);
					    
		t[t.length] = newText = newArcs.insert("svg:text")
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
	}

		for(var i =0; i<p.length; i++){
		    p[i].data(repartition(function(d) {
				  return d.value._v;}), byId)
		  		.attr("display", function(d) { 
			    	  if(d.data.key.substr(0,1)=="_") return "none";    
			    	  if(d.depth == 0) return "none";
			    	  if(d.depth > 3) return "none";
			    	  return null; 
		    	  })
				  .transition()
				    .duration(4500)
				    .attrTween("d", arcTween);
		}
	  
		for(var i =0; i<t.length; i++){	  
		  t[i].data(repartition(function(d) { return d.value._v; }),byId)
		  	.attr("display", function(d) {
		    	  if(d.data.key.substr(0,1)=="_") return "none";
		    	  if(d.depth > 1 && d.value &&  d.parent && d.parent.value && d.value / d.parent.value < .04) return "none";
		    	  if (d.data && d.data.key && d.data.key=="other") return "none";
		    	  return d.depth ? null : "none"; 
			 })
		    .transition()
		    .duration(4500)
			.attr("transform", function(d) {
				var rotateAngle;
				if((d.x + d.dx/2) * (180/Math.PI) < 180){
					rotateAngle = Math.min(-90 + (d.x + d.dx/2) * (180/Math.PI), 90);
				}else{
					rotateAngle = 90 + (d.x + d.dx/2) * (180/Math.PI) ;
				}
				return "translate(" + arc.centroid(d) + ")rotate("+ rotateAngle +")"; })
		}

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