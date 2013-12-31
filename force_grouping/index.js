// dataset globals
var groupcnt = 20,
  dotcnt = 100;

// viz width and height if not yet defined
var w = (w)?w:800,
  h = (h)?h:600;

// datasets
var nodes = d3.range(dotcnt).map(function(d){ return Object(d % groupcnt); });
var groups = d3.nest().key(function(d) { return d; }).entries(nodes);
var gravities = d3.range(20).map(function(d,i){
    return {
      "x": (Math.random() * .4 + .3) * w, // between .3 and .7 times w
      "y": (Math.random() * .4 + .3) * h  // between .3 and .7 times h
    };
  });

// render methods
var circleFill = d3.scale.category20c();
var groupFill = function(d, i) { return circleFill(i); };
var groupPath = function(d) { return "M" + d3.geom.hull(d.values.map(function(i) { return [i.x, i.y]; })) .join("L") + "Z"; };

// d3 viz elements
var viz, force;
var createSVG = function(){
  viz = d3.select("#viz").append("svg")
  .attr("width", w)
  .attr("height", h);

  force = d3.layout.force()
  .charge(-300)
  .size([w, h])
  .on("tick", function(e) {

    // Push different nodes in different directions for clustering.
    nodes.forEach(function(o, i) {
      var dx = gravities[o].x - o.x,
          dy = gravities[o].y - o.y;
      o.x += dx*e.alpha;
      o.y += dy*e.alpha;
    });

    // draw circles and paths
    circles.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
    paths.attr("d", groupPath);

  });
}();

// loading data, drawing html
var circles, paths;
var reload = function(){

  force.nodes(nodes).start();

  circles = viz.selectAll("circle.node")
    .data(nodes).style("fill", function(d, i) { return circleFill(d); })
    .style("stroke", function(d, i) { return d3.rgb(circleFill(d)).darker(2); });
  circles.enter().append("circle")
    .attr("class", "node")
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; })
    .attr("r", 8)
    .style("fill", function(d, i) { return circleFill(d); })
    .style("stroke", function(d, i) { return d3.rgb(circleFill(d)).darker(2); })
    .style("stroke-width", 1.5)
    .call(force.drag);
  circles.exit().remove();

  paths = viz.selectAll("path")
    .data(groups)
      .attr("d", groupPath);
  paths.enter().insert("path", "circle")
    .style("fill", groupFill)
    .style("stroke", groupFill)
    .style("stroke-width", 40)
    .style("stroke-linejoin", "round")
    .style("opacity", .5)
    .attr("d", groupPath);
  paths.exit().remove();

}();

// refresh random gravity positions
var refresh = function(){
gravities.forEach(function(g, i) {
  g.x = (Math.random() * .4 + .3) * w;
  g.y = (Math.random() * .4 + .3) * h;
});
force.resume();
}
var refreshIntervalId = setInterval("refresh()", 5000 );

