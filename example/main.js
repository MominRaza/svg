import DrawSVGShapes from '../main.js';

const svg = document.getElementById('svg');
const colorPicker = document.getElementById('colorPicker');
const gridSize = document.getElementById('gridSize');
const showGrid = document.getElementById('showGrid');
const height = document.getElementById('height');
const width = document.getElementById('width');
const drawType = document.getElementById('drawType');
const cancelButton = document.getElementById('cancelButton');
const clearButton = document.getElementById('clearButton');
const drawMode = document.getElementById('drawMode');

const drawer = new DrawSVGShapes({
  svg,
  svgSize: { width: width.value, height: height.value },
  drawingColor: colorPicker.value,
  showGrid: showGrid.checked,
  gridSize: parseInt(gridSize.value),
  drawingType: drawType.value,
  drawingMode: drawMode.value,
  drawings: JSON.parse(localStorage.getItem('drawings')) || [],
});

height.addEventListener('change', (event) => {
  drawer.svgSize = { width: width.value, height: event.target.value };
});

width.addEventListener('change', (event) => {
  drawer.svgSize = { width: event.target.value, height: height.value };
});

colorPicker.addEventListener('change', (event) => {
  drawer.drawingColor = event.target.value;
});

gridSize.addEventListener('change', (event) => {
  drawer.gridSize = parseInt(event.target.value);
});

showGrid.addEventListener('change', (event) => {
  drawer.showGrid = event.target.checked;
});

drawType.addEventListener('change', (event) => {
  drawer.drawingType = event.target.value;
});

cancelButton.addEventListener('click', () => {
  drawer.cancelDrawing();
});

clearButton.addEventListener('click', () => {
  drawer.clearSvg();
});

drawMode.addEventListener('change', (event) => {
  drawer.drawingMode = event.target.value;
});

document.getElementById('save').addEventListener('click', () => {
  localStorage.setItem('drawings', JSON.stringify(drawer.drawings));
});
