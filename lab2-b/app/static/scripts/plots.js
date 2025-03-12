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
  showAlert('Drawing ' + name.toUpperCase(), 'dark');
  plots[name]();
}

// add an event listener to the plot type dropdown to call the plot function
document.getElementById('plot-type').addEventListener('change', function() {
  plot(this.value)
});
