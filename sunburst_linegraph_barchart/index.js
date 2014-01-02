// DONUT

var d_width = document.getElementById("donutcontainer").scrollWidth,
	d_height = document.getElementById("donutcontainer").scrollHeight,
	d_radius = Math.min(d_width, d_height) / 2,
    d_color = d3.scale.category20();

var donutsvg = d3.select("#donutcontainer").select("svg")
	.attr('class','donutsvg')
	.attr("width", d_width)
	.attr("height", d_height)
	.append("g")
		.attr("transform", "translate(" + d_width / 2 + "," + d_height / 2 + ")");

var partition = d3.layout.partition()
	.sort(null)
	.size([2 * Math.PI, d_radius * d_radius])
	.value(function(d) { return d.size; });

var arc = d3.svg.arc()
	.startAngle(function(d)  { return (d.x)*.7-1;				})
	.endAngle(function(d)	{ return (d.x + d.dx)*.7-1;		 })
	.innerRadius(function(d) { return Math.sqrt(d.y)*.9;		})
	.outerRadius(function(d) { return Math.sqrt(d.y + d.dy)*.9; });

d3.json("ev_wg.json", function(error, root) {
  var path = donutsvg.datum(root).selectAll("path.donutpath")
	  .data(partition.nodes)
	.enter().append("path")
		.attr("class", function(d) { return "donutpath " + d.name; })
		.attr("display", function(d) { return d.depth ? null : "none"; }) // hide inner ring
		.attr("d", arc)
		.style("fill", function(d) { return d_color((d.children ? d : d.parent).name); })
});


// LINE GRAPH over BAR CHART

var x_margin = 40,
	y_margin = 20,
	g_width = document.getElementById("graph").scrollWidth,
	g_height = document.getElementById("graph").scrollHeight,
	AXIS_Y = g_height/2;

// scales

var regiocolors = d3.scale.category20(),
	x = d3.scale.linear().range([x_margin+27, g_width-x_margin-27]),
	y = d3.scale.linear().range([g_height-y_margin,y_margin]);

var bar_x0 = d3.scale.ordinal().rangeRoundBands([x_margin, g_width-x_margin], .1),
	bar_x1 = d3.scale.ordinal(),
	bar_y = d3.scale.linear().range([AXIS_Y,0]);

// axes

var line_xAxis = d3.svg.axis()
	.scale(x)
	.tickFormat(d3.format("d"))
	.tickPadding(y_margin/2);

var line_yAxis = d3.svg.axis()
	.scale(y)
	.orient("right")
	.tickFormat(d3.format(".2s"));

var bar_yAxis = d3.svg.axis()
    .scale(bar_y)
    .orient("left")
	.tickValues([0,1])
    .tickFormat(d3.format("%"));

// svg elements

var graph_svg = d3.select("#graph").append("svg")
	.attr('class','graph_svg')
	.attr("width", g_width)
	.attr("height", g_height);

var axis_g = graph_svg.append("g")
	.attr('class','axis_g')
	.style("z-index","501");
var bar_g = graph_svg.append("g")
	.attr("class", "bar_g")
	.style("z-index","-502");
var line_g = graph_svg.append("g")
	.attr("class", "line_g")
	.style("z-index","503");


// LOAD DATA

d3.tsv("ev_btw.tsv", function(error, line_data) {
	regiocolors.domain(d3.keys(line_data[0]).filter(function(key) { return key !== "jaar"; }));

	// reconfigure regio dataset for linegraph
	var regios = regiocolors.domain().map(function(regio) {
		return {
			regio: regio,
			values: line_data.map(function(d) {
				return {jaar: d.jaar, btw: +d[regio]};
			})
		};
	});

	// set x and y domain
	x.domain(d3.extent(line_data, function(d) { return d.jaar; }));
	y.domain([
		d3.min(regios, function(r) { return d3.min(r.values, function(v) { return v.btw; }); }),
		d3.max(regios, function(r) { return d3.max(r.values, function(v) { return v.btw; }); })
	]);
	AXIS_Y = y(0);
	line_xAxis.tickSize(g_height - y_margin - y(0));

	// draw x and y axis
	axis_g.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + y(0) + ")")
		.call(line_xAxis);

	axis_g.append("g")
		.attr("class", "y axis")
		.attr("transform", "translate(" + (g_width-x_margin+3) + ",0)")
		.call(line_yAxis);

	// draw regio lines
	var line = d3.svg.line()
		.x(function(d) { return x(d.jaar); })
		.y(function(d) { return y(d.btw); });

	var regio = line_g.selectAll(".regio")
			.data(regios).enter().append("g")
				.attr("class", function(d){ return "regio regio-"+d.regio; })
				.append("path")
					.attr("class", "line")
					.attr("d", function(d) { return line(d.values); })
					.style("stroke", function(d) { return regiocolors(d.regio); });

});

d3.tsv("ev_eg.tsv", function(error, bar_data) {
	var regios = d3.keys(bar_data[0]).filter(function(key) { return key !== "jaar"; });
		regiocolors.domain(regios);

	bar_data.forEach(function(d) {
		d.eg = regios.map(function(name) { return {name: name, value: +d[name]}; });
	});

	bar_x0.domain(bar_data.map(function(d) { return d.jaar; }));
	bar_x1.domain(regios).rangeRoundBands([0, bar_x0.rangeBand()]);
	bar_y.domain([0, d3.max(bar_data, function(d) { return d3.max(d.eg, function(d) { return d.value; }); })]);

	axis_g.append("g")
		.attr("class", "y axis")
		.attr("transform", "translate(" + (x_margin-3) + ",0)")
		.call(bar_yAxis);

	// draw regio bars
	var jaar = bar_g.selectAll(".jaar")
			.data(bar_data)
			.enter().append("g")
				.attr("class", "jaar")
				.attr("transform", function(d) {
					return "translate(" + bar_x0(d.jaar) + ",0)";
				});

	jaar.selectAll("rect")
		.data(function(d) { return d.eg; }).enter().append("rect")
			.attr("class", "eg_bar")
			.attr("width", bar_x1.rangeBand())
			.attr("x", function(d) { return bar_x1(d.name); })
			.attr("y", function(d) { return bar_y(d.value); })
			.attr("height", function(d) { return AXIS_Y - bar_y(d.value); })
			.style("fill", function(d) { return regiocolors(d.name); });

});
