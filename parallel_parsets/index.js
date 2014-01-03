var w = (w)?w:800;
var h = (h)?h:600;

var chart = d3.parsets()
        .dimensions([
            "Software",
            "Tools",
            "Projects/Services"
        ])
        .tension(.5);

var svg = d3.select("#viz").append("svg");

function loaddata(){
    chart
        .width(w)
        .height(h);

    svg
        .attr("width", chart.width())
        .attr("height", chart.height());

    d3.csv("except_sp_t_t.csv", function(csv) {
      svg.datum(csv).call(chart);
    });
}
loaddata();