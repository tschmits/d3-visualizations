var chart = d3.parsets()
    .dimensions([
        "Software",
        "Tools",
        "Projects/Services"
    ])
    .tension(.5)
    .width(800)
    .height(400);

var vis = d3.select("#viz").append("svg")
    .attr("width", chart.width())
    .attr("height", chart.height());

d3.csv("except_sp_t_t.csv", function(csv) {
  vis.datum(csv).call(chart);
});
