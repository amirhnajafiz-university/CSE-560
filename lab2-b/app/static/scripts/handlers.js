/**
 * Toggle the visibility of the toolbar.
 */
function showPopup() {
  document.getElementById('popup').style.display = 'block';
  document.getElementById('fade').style.display = 'block';
}

/**
 * Toggle the visibility of the toolbar.
 */
function hidePopup() {
  document.getElementById('popup').style.display = 'none';
  document.getElementById('fade').style.display = 'none';
}

// --- Event Listeners ---
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
});

document.getElementById('plot-color-picker').addEventListener('input', function() {
  // get class plot and set color to the value of the color picker
});
