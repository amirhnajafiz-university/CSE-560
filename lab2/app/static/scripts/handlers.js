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

// initialize the range value display
updateRangeValue();
