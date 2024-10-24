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
    this.previousLine = [];
    this.IsDragging = false;
    this.DraggingStartPoint = { x: 0, y: 0 };
    this.movingCoordinates = [];

    this.init();
  }

  init() {
    this.svg.onclick = this.handleClick.bind(this);
    this.svg.onmousemove = this.handleMouseMove.bind(this);
    this.svg.style.cursor = 'crosshair';
  }

  handleClick(e) {
    if (this.drawingType === 'polygon') {
      const point = `${e.offsetX},${e.offsetY}`;

      if (this.points.length > 2) {
        if (this.isPolygonCompleted(e.offsetX, e.offsetY)) {
          this.points.push(this.points[0]);
          this.currentShape = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
          this.currentShape.setAttribute('points', this.points.join(' '));
          this.currentShape.setAttribute('style', 'fill:blue;stroke:black;stroke-width:2;');

          this.drawCrossIcon(this.currentShape);

          if (this.previewLine) {
            this.previewLine.remove();
          }

          if (this.previousLine.length > 0) {
            this.previousLine.forEach(line => {
              line.remove();
            });
          }

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

        this.previousLine.push(this.line);
      }

      this.points.push(point);
      this.coordinates.push({ x: e.offsetX, y: e.offsetY });
    }
  }

  handleMouseMove(e) {
    if (this.drawingType === 'polygon') {
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

  isPolygonCompleted(x, y) {
    const firstPoint = this.coordinates[0];
    const distance = Math.sqrt(Math.pow(x - firstPoint.x, 2) + Math.pow(y - firstPoint.y, 2));
    return distance < this.CLICK_THRESHOLD;
  }

  getTopRightCorner(shape) {
    const svgWidth = this.svg.clientWidth;
    let minDistance = Number.MAX_VALUE;
    let topRightCorner = { x: 0, y: 0 };

    const points = this.getShapePoints(shape);

    points.forEach(coord => {
      const distance = Math.sqrt(Math.pow(svgWidth - coord.x, 2) + Math.pow(coord.y, 2));
      if (distance < minDistance) {
        minDistance = distance;
        topRightCorner = { x: coord.x, y: coord.y };
      }
    });

    return topRightCorner;
  }

  drawCrossIcon(shape) {
    const size = 10;
    const circleRadius = size;
    const { x, y } = this.getTopRightCorner(shape);

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', circleRadius);
    circle.setAttribute('fill', 'white');
    circle.setAttribute('stroke', 'black');
    circle.setAttribute('stroke-width', 2);

    const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line1.setAttribute('x1', x - size / 2);
    line1.setAttribute('y1', y - size / 2);
    line1.setAttribute('x2', x + size / 2);
    line1.setAttribute('y2', y + size / 2);
    line1.setAttribute('stroke', 'black');
    line1.setAttribute('stroke-width', 2);

    const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line2.setAttribute('x1', x + size / 2);
    line2.setAttribute('y1', y - size / 2);
    line2.setAttribute('x2', x - size / 2);
    line2.setAttribute('y2', y + size / 2);
    line2.setAttribute('stroke', 'black');
    line2.setAttribute('stroke-width', 2);

    const crossGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    crossGroup.appendChild(circle);
    crossGroup.appendChild(line1);
    crossGroup.appendChild(line2);

    const outerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    outerGroup.appendChild(shape);
    outerGroup.appendChild(crossGroup);

    crossGroup.addEventListener('click', (e) => {
      if (this.coordinates.length > 0) return;

      e.stopPropagation();
      this.svg.removeChild(outerGroup);
      this.svg.style.cursor = 'crosshair';
    });

    crossGroup.addEventListener('mouseover', (e) => {
      if (this.coordinates.length > 0) return;

      e.stopPropagation();
      this.svg.style.cursor = 'pointer';
    });

    crossGroup.addEventListener('mouseout', (e) => {
      if (this.coordinates.length > 0) return;

      e.stopPropagation();
      this.svg.style.cursor = 'crosshair';
    });

    this.handleMoveEvents(shape, crossGroup);
    this.handleResizeEvents(shape, crossGroup);

    this.svg.appendChild(outerGroup);
  }

  handleMoveEvents(shape, crossGroup) {
    shape.addEventListener('mouseover', () => {
      if (this.coordinates.length > 0) return;
      this.svg.style.cursor = 'grab';
    });

    shape.addEventListener('mousedown', (e) => {
      if (this.coordinates.length > 0) return;
      e.stopPropagation();
      this.IsDragging = true;
      this.DraggingStartPoint = { x: e.offsetX, y: e.offsetY };
      this.svg.style.cursor = 'grabbing';

      this.movingCoordinates = this.getShapePoints(shape);
      shape.remove();
      this.svg.appendChild(shape);
      crossGroup.remove();
    });

    shape.addEventListener('mousemove', (e) => {
      if (this.coordinates.length > 0) return;

      if (this.IsDragging) {
        const deltaX = e.offsetX - this.DraggingStartPoint.x;
        const deltaY = e.offsetY - this.DraggingStartPoint.y;

        const updatedCoordinates = this.movingCoordinates.map(coord => ({
          x: coord.x + deltaX,
          y: coord.y + deltaY
        }));

        const updatedPointsString = updatedCoordinates.map(coord => `${coord.x},${coord.y}`).join(' ');
        shape.setAttribute('points', updatedPointsString);

        this.draggingStartPoint = { x: e.offsetX, y: e.offsetY };
      }
    });

    shape.addEventListener('mouseup', (e) => {
      if (this.coordinates.length > 0) return;

      e.stopPropagation();
      this.IsDragging = false;
      this.svg.style.cursor = 'grab';
      this.drawCrossIcon(shape);
    });

    shape.addEventListener('mouseout', () => {
      if (this.coordinates.length > 0) return;

      this.svg.style.cursor = 'crosshair';
    });

    shape.addEventListener('click', (e) => {
      if (this.coordinates.length > 0) return;

      e.stopPropagation();
    });
  }

  getShapePoints(shape) {
    return shape.getAttribute('points').split(' ').map(point => {
      const [x, y] = point.split(',').map(Number);
      return { x, y };
    });
  }

  handleResizeEvents(shape, crossGroup) {
    this.movingCoordinates = this.getShapePoints(shape);
    shape.remove();
    this.svg.appendChild(shape);
    // crossGroup.remove();

    // Add draggable handles
    this.movingCoordinates.forEach((coord, index) => {
      const handle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      handle.setAttribute('cx', coord.x);
      handle.setAttribute('cy', coord.y);
      handle.setAttribute('r', 5);
      handle.setAttribute('fill', '#00000000');
      handle.setAttribute('cursor', 'move');
      this.svg.appendChild(handle);

      handle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        this.isDragging = true;
        this.draggingPointIndex = index;
        this.svg.style.cursor = 'grabbing';
      });

      handle.addEventListener('mousemove', (e) => {
        if (!this.isDragging || this.draggingPointIndex !== index) return;

        const deltaX = e.offsetX - coord.x;
        const deltaY = e.offsetY - coord.y;

        this.movingCoordinates[index] = { x: e.offsetX, y: e.offsetY };

        const updatedPointsString = this.movingCoordinates.map(coord => `${coord.x},${coord.y}`).join(' ');
        shape.setAttribute('points', updatedPointsString);

        handle.setAttribute('cx', e.offsetX);
        handle.setAttribute('cy', e.offsetY);
      });

      handle.addEventListener('mouseup', (e) => {
        if (!this.isDragging || this.draggingPointIndex !== index) return;
        this.isDragging = false;
        this.svg.style.cursor = 'default';
      });

      handle.addEventListener('mouseout', () => {
        if (!this.isDragging || this.draggingPointIndex !== index) return;
        this.isDragging = false;
        this.svg.style.cursor = 'default';
      });

      handle.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    });
  }
}
