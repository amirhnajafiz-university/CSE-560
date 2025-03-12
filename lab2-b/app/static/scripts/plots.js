// global variables
const WIDTH = 800;
const HEIGHT = 600;
const MARGIN = { top: 40, right: 40, bottom: 40, left: 40 };
const SVGID = "#plot";

// helper functions
function getSVG() {
  return d3.select(SVGID)
    .selectAll("*")
    .remove()
    .attr("width", WIDTH)
    .attr("height", HEIGHT)
    .style("overflow", "hidden");
}

// data MDS plot function
function dataMDSPlot() {
  return;
}

// variables MDS plot function
function variablesDMSPlot() {
  return;
}

// parallel coordinates plot function
function pcpPlot() {
  return;
}

// creating a map variable to reference the plot functions
var plots = {
  'data-mds': dataMDSPlot,
  'variables-mds': variablesDMSPlot,
  'pcp': pcpPlot
};

// plot function that takes a name and calls a plot function based on the name
function plot(name) {
  showAlert('Drawing `' + name.toUpperCase().replace("-", " ") + '`', 'dark');
  plots[name]();
}

// add an event listener to the plot type dropdown to call the plot function
document.getElementById('plot-type').addEventListener('change', function() {
  plot(this.value)
});
