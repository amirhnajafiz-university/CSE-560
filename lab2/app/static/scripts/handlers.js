function changeValue(delta) {
    const rangeInput = document.getElementById('sample-number');
    let newValue = parseInt(rangeInput.value) + delta;
    if (newValue >= parseInt(rangeInput.min) && newValue <= parseInt(rangeInput.max)) {
        rangeInput.value = newValue;
        updateRangeValue();
    }
}

function updateRangeValue() {
    const rangeInput = document.getElementById('sample-number');
    const rangeValue = document.getElementById('range-value');
    rangeValue.textContent = rangeInput.value;
}

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
