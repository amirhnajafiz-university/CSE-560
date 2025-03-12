// Toggle the visibility of the toolbar.
function togglePopup(show) {
  document.getElementById('popup').style.display = show ? 'block' : 'none';
  document.getElementById('fade').style.display = show ? 'block' : 'none';
}

// --- Event Listeners ---
// get class line and set stroke-width to the value of the range input
document.getElementById('tickness').addEventListener('input', function() {
  document.querySelectorAll('.line').forEach(line => line.style.strokeWidth = this.value);
  document.querySelectorAll('.arrow').forEach(line => line.style.strokeWidth = this.value);
});

// get class title and set visibility 
document.getElementById('toggle-titles').addEventListener('change', function() {
  document.querySelectorAll('.title').forEach(title => title.style.visibility = this.checked ? 'visible' : 'hidden');
});

// get class grid and set visibility
document.getElementById('toggle-grids').addEventListener('change', function() {
  document.querySelectorAll('.grid').forEach(grid => grid.style.visibility = this.checked ? 'visible' : 'hidden');
});

// get class axis-label and set visibility
document.getElementById('toggle-labels').addEventListener('change', function() {
  document.querySelectorAll('.axis-label').forEach(label => label.style.visibility = this.checked ? 'visible' : 'hidden');
});

// get class line and set color to the value of the color picker
document.getElementById('line-color-picker').addEventListener('input', function() {
  document.querySelectorAll('.line').forEach(line => line.style.stroke = this.value);
  document.querySelectorAll('.arrow').forEach(line => line.style.stroke = this.value);
});

// get class plot and set color to the value of the color picker
document.getElementById('plot-color-picker').addEventListener('input', function() {
});
