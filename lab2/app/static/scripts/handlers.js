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

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', function() {
  const buttons = document.querySelectorAll('.operation-btn');
  buttons.forEach(button => {
    button.addEventListener('click', function() {
      // remove col-md-4 from all buttons
      buttons.forEach(btn => {
        btn.classList.remove('col-md-4');
        btn.classList.add('col-md-2');
        btn.classList.remove('operation-btn-selected');
      });
      this.classList.remove('col-md-2');
      this.classList.add('col-md-4');
      this.classList.add('operation-btn-selected');
    });
  });
});

document.getElementById('tickness').addEventListener('input', function() {
  // get class line and set stroke-width to the value of the range input
  document.querySelectorAll('.line').forEach(line => line.style.strokeWidth = this.value);
  document.querySelectorAll('.arrow').forEach(line => line.style.strokeWidth = this.value);
});

document.getElementById('toggle-titles').addEventListener('change', function() {
  if (this.checked) {
    // get class title and set visibility to visible
    document.querySelectorAll('.title').forEach(title => title.style.visibility = 'visible');
  } else {
    // get class title and set visibility to hidden
    document.querySelectorAll('.title').forEach(title => title.style.visibility = 'hidden');
  }
});

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
  document.querySelectorAll('.arrow').forEach(line => line.style.stroke = this.value);
  document.querySelectorAll('#arrowhead-path').forEach(line => line.style.fill = this.value);
});

document.getElementById('plot-color-picker').addEventListener('input', function() {
  // get class plot and set color to the value of the color picker
  document.querySelectorAll('.eigen-circle').forEach(plot => plot.style.fill = this.value);
  document.querySelectorAll('.pca-point').forEach(plot => plot.style.fill = this.value);
});

// --- Initialization ---
updateRangeValue();
