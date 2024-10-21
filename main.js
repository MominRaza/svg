export default class DrawSVGShapes {
  constructor({ svg, svgSize, drawingType }) {
    this.svg = svg;
    this.svg.setAttribute('width', svgSize.width);
    this.svg.setAttribute('height', svgSize.height);
    this.currentShape = null;
    this.points = [];
    this.coordinates = [];
    this.drawings = [];
    this.drawingType = drawingType;
    this.CLICK_THRESHOLD = 10;
    this.previewLine = null;

    this.init();
  }

  init() {
    this.svg.onclick = this.handleClick.bind(this);
    this.svg.onmousemove = this.handleMouseMove.bind(this);
  }

  handleClick(e) {
    if (this.drawingType === 'polygon') {
      /**
       * @type {string}
       */
      const point = `${e.offsetX},${e.offsetY}`;

      if (this.points.length > 2) {
        const start = this.points[0];

        if (Math.abs(e.offsetX - start.split(',')[0]) < this.CLICK_THRESHOLD && Math.abs(e.offsetY - start.split(',')[1]) < this.CLICK_THRESHOLD) {
          this.points.push(start);
          this.currentShape = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
          this.currentShape.setAttribute('points', this.points.join(' '));
          this.currentShape.setAttribute('style', 'fill:blue;stroke:black;stroke-width:2;');
          this.svg.appendChild(this.currentShape);

          this.points = [];
          this.drawings.push({ points: this.coordinates, type: this.drawingType });
          this.coordinates = [];

          return;
        }
      }

      if (this.points.length > 0) {
        this.line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        this.line.setAttribute('x1', this.points[this.points.length - 1].split(',')[0]);
        this.line.setAttribute('y1', this.points[this.points.length - 1].split(',')[1]);
        this.line.setAttribute('x2', point.split(',')[0]);
        this.line.setAttribute('y2', point.split(',')[1]);
        this.line.setAttribute('style', 'stroke:black;stroke-width:2;');

        this.svg.appendChild(this.line);
      }

      this.points.push(point);
      this.coordinates.push({ x: e.offsetX, y: e.offsetY });
    }
  }

  handleMouseMove(e) {
    if (this.drawingType === 'polygon') {
      /**
       * @type {string}
       */
      const point = `${e.offsetX},${e.offsetY}`;

      if (this.points.length > 0) {
        if (this.previewLine) {
          this.previewLine.remove();
        }
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', this.points[this.points.length - 1].split(',')[0]);
        line.setAttribute('y1', this.points[this.points.length - 1].split(',')[1]);
        line.setAttribute('x2', point.split(',')[0]);
        line.setAttribute('y2', point.split(',')[1]);
        line.setAttribute('style', 'stroke:black;stroke-width:2;');

        this.svg.appendChild(line);
        this.previewLine = line;
      }
    }
  }
}

// svg?.addEventListener('mousedown', (e) => {
//   const target = e.target;
//   const shapeType = shapeTypeSelect.value;

//   if (shapeType === 'rect') {
//     if (target.tagName === 'rect') {
//       isDragging = true;
//       currentShape = target;
//       startX = e.offsetX;
//       startY = e.offsetY;
//       offsetX = startX - parseFloat(currentShape.getAttribute('x'));
//       offsetY = startY - parseFloat(currentShape.getAttribute('y'));
//     } else {
//       isDrawing = true;
//       startX = e.offsetX;
//       startY = e.offsetY;
//       currentShape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
//       currentShape.setAttribute('x', startX);
//       currentShape.setAttribute('y', startY);
//       currentShape.setAttribute('width', 0);
//       currentShape.setAttribute('height', 0);
//       currentShape.setAttribute('style', 'fill:blue;stroke:black;stroke-width:2;');
//       svg.appendChild(currentShape);
//     }
//   } else if (shapeType === 'polygon') {
//     if (target.tagName === 'polygon') {
//       isDragging = true;
//       currentShape = target;
//       // Handle dragging logic for polygon if needed
//     } else {
//       isDrawing = true;
//       const point = `${e.offsetX},${e.offsetY}`;
//       points.push(point);
//       if (!currentShape) {
//         currentShape = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
//         currentShape.setAttribute('points', points.join(' '));
//         currentShape.setAttribute('style', 'fill:blue;stroke:black;stroke-width:2;');
//         svg.appendChild(currentShape);
//       } else {
//         currentShape.setAttribute('points', points.join(' '));
//       }
//     }
//   }
// });

// svg?.addEventListener('mousemove', (e) => {
//   if (isDrawing) {
//     const shapeType = shapeTypeSelect.value;
//     if (shapeType === 'rect') {
//       const currentX = e.offsetX;
//       const currentY = e.offsetY;
//       const width = Math.abs(currentX - startX);
//       const height = Math.abs(currentY - startY);
//       currentShape.setAttribute('width', width);
//       currentShape.setAttribute('height', height);
//       currentShape.setAttribute('x', Math.min(currentX, startX));
//       currentShape.setAttribute('y', Math.min(currentY, startY));
//     } else if (shapeType === 'polygon') {
//       const point = `${e.offsetX},${e.offsetY}`;
//       points[points.length - 1] = point;
//       currentShape.setAttribute('points', points.join(' '));
//     }
//   } else if (isDragging) {
//     const shapeType = shapeTypeSelect.value;
//     if (shapeType === 'rect') {
//       const currentX = e.offsetX;
//       const currentY = e.offsetY;
//       currentShape.setAttribute('x', currentX - offsetX);
//       currentShape.setAttribute('y', currentY - offsetY);
//     } else if (shapeType === 'polygon') {
//       // Handle dragging logic for polygon if needed
//     }
//   }
// });

// svg?.addEventListener('mouseup', (e) => {
//   isDrawing = false;
//   isDragging = false;
//   points = [];
// });