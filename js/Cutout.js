class Cutout {
    constructor(svgControllerInstance, confirmButtonId) {
        this.svgC = svgControllerInstance;
        this.confirm = document.getElementById(confirmButtonId);

        this.x = 0;
        this.y = 0;
        this.minWidth = 0;
        this.minHeight = 0;
        this.minRatio = 1;
        this.maxRatio = 1;

        this.leftCircle = null;
        this.rightCircle = null;
        this.rect = null;

        this.confirm.addEventListener('click', () => {
            if (this.svgC.cutoutOn) {

            }
        })

    }

    setCutable(buttonId, minWidth, height, maxWidth) {
        var cutter = document.getElementById(buttonId);
        cutter.addEventListener('click', () => {
            if (this.svgC.imageOriginalHeight === 0) return;

            if (this.svgC.cutoutOn && this.svgC.rectGroup != null) {
                this.svgC.setCutOff();
            }

            if (!this.svgC.cutoutOn || this.id !== buttonId) {
                this.makeCutout(minWidth, height);
                this.svgC.cutoutOn = true;
                this.minRatio = minWidth / height;
                this.maxRatio = maxWidth / height;
                this.id = buttonId;
            }
        })
    }

    makeCutout(width, height) {
        this.svgC.rectGroup = document.createElementNS(this.svgC.svgNS, 'g');
        this.rect = document.createElementNS(this.svgC.svgNS, 'rect');
        this.rect.setAttributeNS(null, 'fill', 'rgba(192,192,192,0.3)');
        this.rect.setAttributeNS(null, 'stroke', 'black');
        this.rect.setAttributeNS(null, 'stroke-width', '2');
        this.svgC.rectGroup.appendChild(this.rect);
        this.svgC.svg.appendChild(this.svgC.rectGroup);

        var svgW = this.svgC.getSVGWidth();
        var svgH = this.svgC.getSVGHeight();

        var minRatio = svgW / this.svgC.imageOriginalWidth;

        this.minWidth = width * minRatio;
        this.minHeight = height * minRatio;

        var maxRatio = Math.min(svgW / width, svgH / height);

        this.height = height * maxRatio;
        this.width = width * maxRatio;

        this.x = (svgW - this.width) / 2;
        this.y = (svgH - this.height) / 2;

        this.rect.setAttributeNS(null, 'x', this.x);
        this.rect.setAttributeNS(null, 'y', this.y);
        this.rect.setAttributeNS(null, 'width', this.width);
        this.rect.setAttributeNS(null, 'height', this.height);


        this.addCircles(this.x, this.y, this.x + this.width, this.y + this.height);
    }

    addCircles(x1, y1, x2, y2) {
        var circlesGroup = document.createElementNS(this.svgC.svgNS, 'g');
        circlesGroup.setAttribute('class', 'circles');

        this.leftCircle = document.createElementNS(this.svgC.svgNS, 'circle');
        this.leftCircle.setAttributeNS(null, 'r', '10');
        this.leftCircle.setAttributeNS(null, 'cx', x1);
        this.leftCircle.setAttributeNS(null, 'cy', y1);
        this.leftCircle.setAttribute('fill', 'grey');
        this.leftCircle.setAttribute('stroke', 'black');


        this.rightCircle = document.createElementNS(this.svgC.svgNS, 'circle');
        this.rightCircle.setAttributeNS(null, 'r', '10');
        this.rightCircle.setAttributeNS(null, 'cx', x2);
        this.rightCircle.setAttributeNS(null, 'cy', y2);
        this.rightCircle.setAttribute('fill', 'grey');
        this.rightCircle.setAttribute('stroke', 'black');

        this.setDraggable();

        circlesGroup.appendChild(this.leftCircle);
        circlesGroup.appendChild(this.rightCircle);

        this.svgC.rectGroup.appendChild(circlesGroup);
    }


    setDraggable() {
        this.setDraggableC(this.leftCircle, this.rightCircle, false);
        this.setDraggableC(this.rightCircle, this.leftCircle, true);
        this.setDraggableR();
    }

    setDraggableC(circle, limitCircle, right) {
        var start = false;
        var x = 0,
            y = 0;
        var limitX = 0,
            limitY = 0;

        circle.addEventListener('mousedown', (event) => {
            if (event.preventDefault) event.preventDefault();

            x = circle.getAttributeNS(null, "cx");
            y = circle.getAttributeNS(null, "cy");

            limitX = parseInt(limitCircle.getAttributeNS(null, "cx"));
            limitY = parseInt(limitCircle.getAttributeNS(null, "cy"));

            if (right) {
                limitX += this.minWidth;
                limitY += this.minHeight;
            } else {
                limitX -= this.minWidth;
                limitY -= this.minHeight;
            }

            start = true;

        });
        window.addEventListener('mousemove', () => {
            if (start) {
                var newX = this.svgC.mouseX;
                var newY = this.svgC.mouseY;

                if (right) {
                    if (newX < limitX) newX = limitX;
                    if (newY < limitY) newY = limitY;
                    this.width = newX - this.x;
                    this.height = newY - this.y;
                    if (this.width / this.height > this.maxRatio) {
                        this.width = this.maxRatio * this.height;
                    } else if (this.width / this.height < this.minRatio) {
                        this.height = (1 / this.minRatio) * this.width;
                    }
                    newX = this.x + this.width;
                    newY = this.y + this.height;

                } else {
                    if (newX > limitX) newX = limitX;
                    if (newY > limitY) newY = limitY;
                    this.width += this.x - newX;
                    this.height += this.y - newY;

                    if (this.width / this.height > this.maxRatio) {
                        newX += this.width;
                        this.width = this.maxRatio * this.height;
                        newX -= this.width;
                    } else if (this.width / this.height < this.minRatio) {
                        newY += this.height;
                        this.height = (1 / this.minRatio) * this.width;
                        newY -= this.height;
                    }

                    this.x = newX;
                    this.y = newY;
                    this.rect.setAttributeNS(null, 'x', newX);
                    this.rect.setAttributeNS(null, 'y', this.y);
                }

                this.rect.setAttributeNS(null, 'width', this.width);
                this.rect.setAttributeNS(null, 'height', this.height);

                circle.setAttributeNS(null, 'cx', newX);
                circle.setAttributeNS(null, 'cy', newY);

            }
        });
        this.svgC.svg.addEventListener('mouseup', () => {
            start = false
        });
        this.svgC.svg.addEventListener('mouseleave', () => {
            start = false
        });
    }

    setDraggableR() {
        var start = false;
        var startX = 0,
            startY = 0;
        var startRectX = 0,
            startRectY = 0;

        this.rect.addEventListener('mousedown', (event) => {
            if (event.preventDefault) event.preventDefault();
            startX = this.svgC.mouseX;
            startY = this.svgC.mouseY;

            startRectX = this.x;
            startRectY = this.y;

            start = true;

        });
        window.addEventListener('mousemove', () => {
            if (start) {
                var endX = this.svgC.mouseX;
                var endY = this.svgC.mouseY;

                var newX = startRectX + (endX - startX);
                var newY = startRectY + (endY - startY);

                if (newX < 0) newX = 0;
                if (newX > this.svgC.getSVGWidth() - this.width) newX = this.svgC.getSVGWidth() - this.width;
                if (newY < 0) newY = 0;
                if (newY > this.svgC.getSVGHeight() - this.height) newY = this.svgC.getSVGHeight() - this.height;

                this.rect.setAttributeNS(null, 'x', newX);
                this.rect.setAttributeNS(null, 'y', newY);
                this.leftCircle.setAttributeNS(null, 'cx', newX);
                this.leftCircle.setAttributeNS(null, 'cy', newY);
                this.rightCircle.setAttributeNS(null, 'cx', newX + this.width);
                this.rightCircle.setAttributeNS(null, 'cy', newY + this.height);
                this.x = newX;
                this.y = newY;
            }
        });
        this.svgC.svg.addEventListener('mouseup', () => {
            start = false
        });
        this.svgC.svg.addEventListener('mouseleave', () => {
            start = false
        });
    }
}