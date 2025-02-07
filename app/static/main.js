/* basic D3.js example */
var data = [4, 8, 15, 16, 23, 42];

var x = d3.scaleLinear()
    .domain([0, d3.max(data)])
    .range([0, 420]);

d3.select("#chart")
    .selectAll("div")
    .data(data)
    .enter().append("div")
    .style("width", function(d) { return x(d) + "px"; })
    .style("background-color", "steelblue")
    .style("color", "white")
    .style("padding", "5px")
    .style("margin", "1px")
    .text(function(d) { return d; });
