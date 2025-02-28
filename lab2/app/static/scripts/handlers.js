/**
 * Change the value of the range input by a given delta.
 * @param {Number} delta - The amount to change the value by.
 */
function changeValue(delta) {
    const rangeInput = document.getElementById('sample-number');
    let newValue = parseInt(rangeInput.value) + delta;
    if (newValue >= parseInt(rangeInput.min) && newValue <= parseInt(rangeInput.max)) {
        rangeInput.value = newValue;
        updateRangeValue();
    }
}

/**
 * Update the displayed value of the range input.
 */
function updateRangeValue() {
    const rangeInput = document.getElementById('sample-number');
    const rangeValue = document.getElementById('range-value');
    rangeValue.textContent = rangeInput.value;
}

/**
 * Toggle the visibility of the toolbar content.
 */
function toggleToolbarContent() {
    const toolbarContent = document.getElementById('toolbar-content');
    const toolbarIcon = document.getElementById('toolbar-icon');
    toolbarContent.classList.toggle('show');
    if (toolbarContent.classList.contains('show')) {
        toolbarIcon.classList.remove('icon-arrow-down');
        toolbarIcon.classList.add('icon-arrow-up');
    } else {
        toolbarIcon.classList.remove('icon-arrow-up');
        toolbarIcon.classList.add('icon-arrow-down');
    }
}

// Event listeners
document.getElementById('toggle-grids').addEventListener('change', function() {
    if (this.checked) {
        // get class grid and set visibility to visible
        document.querySelectorAll('.grid').forEach(grid => grid.style.visibility = 'visible');
    } else {
        // get class grid and set visibility to hidden
        document.querySelectorAll('.grid').forEach(grid => grid.style.visibility = 'hidden');
    }
});
document.getElementById('toggle-labels').addEventListener('change', function() {
    if (this.checked) {
        // get class axis-label and set visibility to visible
        document.querySelectorAll('.axis-label').forEach(label => label.style.visibility = 'visible');
    } else {
        // get class axis-label and set visibility to hidden
        document.querySelectorAll('.axis-label').forEach(label => label.style.visibility = 'hidden');
    }
});
document.getElementById('line-color-picker').addEventListener('input', function() {
    // get class line and set color to the value of the color picker
    document.querySelectorAll('.line').forEach(line => line.style.stroke = this.value);
});
document.getElementById('plot-color-picker').addEventListener('input', function() {
    // get class plot and set color to the value of the color picker
    document.querySelectorAll('.circle').forEach(plot => plot.style.fill = this.value);
});

// initialize the range value display
updateRangeValue();
