// plot function that takes a name and calls a plot function based on the name
function plot(name) {
    showAlert('Loading... ' + name, 'light');
}

// add an event listener to the plot type dropdown to call the plot function
document.getElementById('plot-type').addEventListener('change', function() {
    plot(this.value)
});
