let cutout_last_clicked_button = null;

class Cutout {
    /**
     * Cutout manages one cutout for given CanvasController
     * @param svgControllerInstance - instance of SVController
     * @param fileManager - instance of FileManager
     * @param canvasControllerInstance - instance of requester CanvasController
     * @param height - height of cutout
     * @param minWidth - min width of cutout
     * @param maxWidth - max width of cutout
     * @param cutButtonId - id of button that starts cutout
     * @param fmId - id from FileManager to recognise confirmation
     */
    constructor(svgControllerInstance, fileManager, canvasControllerInstance, height, minWidth, maxWidth, cutButtonId, fmId) {
        this.svgC = svgControllerInstance;
        this.canvasC = canvasControllerInstance;
        this.fileManager = fileManager;

        this.x = 0;
        this.y = 0;
        this.limitSVGWidth = 0;
        this.limitSVGHeight = 0;

        this.leftCircle = null;
        this.rightCircle = null;
        this.rect = null;

        this.cutter = document.getElementById(cutButtonId);

        this.canvasHeight = height;
        this.minCanvasWidth = minWidth;
        this.maxCanvasWidth = maxWidth;

        this.minRatio = this.minCanvasWidth / this.canvasHeight;
        this.maxRatio = this.maxCanvasWidth / this.canvasHeight;

        this._setPositions();
        this._setCutable();

        this.sendX = 0;
        this.sendY = 0;
        this.contentWidthRatio = 100;
        this.contentHeightRatio = 100;

        this.fmId = fmId;
    }

    _setPositions() {
        this.canvasC.canvasContainer.style.position = 'relative';
        this.canvasC.canvasContainer.style.overflow = 'hidden';
    }

    _setCutable() {
        this.cutter.addEventListener('click', () => {
            if (this.fileManager.empty()) return;

            if(this.fileManager.active !== this.fmId) return;

            if (this.fileManager.cutoutOn) {
                this.fileManager.setCutOff();
            }

            else {
                this.fileManager.setCutOn();
                this._makeCutout();
                cutout_last_clicked_button = this.cutter
            }
        });

        this.fileManager.cutoutConfirm.addEventListener('click', () => {
            if (this.fileManager.cutoutOn && cutout_last_clicked_button === this.cutter) {
                if (this.fileManager.active === this.fmId) {
                    this._drawCutout();
                    this.fileManager.setCutOff()
                }
            }
        });

    }

    _makeCutout() {
        this.svgC.rectGroup = document.createElementNS(this.svgC.svgNS, 'g');

        this.rect = document.createElementNS(this.svgC.svgNS, 'rect');
        this.rect.setAttributeNS(null, 'fill', OtherConstants.cutoutColor);
        this.rect.setAttributeNS(null, 'stroke', OtherConstants.cutoutStrokeColor);
        this.rect.setAttributeNS(null, 'stroke-width', OtherConstants.cutoutStrokeWidth);

        this.svgC.rectGroup.appendChild(this.rect);
        this.svgC.svg.appendChild(this.svgC.rectGroup);

        const svgW = this.svgC.getSVGWidth();
        const svgH = this.svgC.getSVGHeight();

        const minRatio = svgW / this.svgC.imageOriginalWidth;

        this.limitSVGWidth = this.minCanvasWidth * minRatio;
        this.limitSVGHeight = this.canvasHeight * minRatio;

        const maxRatio = Math.min(svgW / this.maxCanvasWidth, svgH / this.canvasHeight);

        this.height = this.canvasHeight * maxRatio;
        this.width = this.maxCanvasWidth * maxRatio;

        this.x = (svgW - this.width) / 2;
        this.y = (svgH - this.height) / 2;

        this.rect.setAttributeNS(null, 'x', this.x);
        this.rect.setAttributeNS(null, 'y', this.y);
        this.rect.setAttributeNS(null, 'width', this.width);
        this.rect.setAttributeNS(null, 'height', this.height);


        this._addCircles(this.x, this.y, this.x + this.width, this.y + this.height);
    }

    _addCircles(x1, y1, x2, y2) {
        const circlesGroup = document.createElementNS(this.svgC.svgNS, 'g');
        circlesGroup.setAttribute('class', 'circles');

        this.leftCircle = document.createElementNS(this.svgC.svgNS, 'circle');
        this.leftCircle.setAttributeNS(null, 'r', this.svgC.circleSize);
        this.leftCircle.setAttributeNS(null, 'cx', x1);
        this.leftCircle.setAttributeNS(null, 'cy', y1);
        this.leftCircle.setAttribute('fill', OtherConstants.cutoutCircleColor);
        this.leftCircle.setAttribute('stroke', OtherConstants.cutoutCircleStrokeColor);


        this.rightCircle = document.createElementNS(this.svgC.svgNS, 'circle');
        this.rightCircle.setAttributeNS(null, 'r', this.svgC.circleSize);
        this.rightCircle.setAttributeNS(null, 'cx', x2);
        this.rightCircle.setAttributeNS(null, 'cy', y2);
        this.rightCircle.setAttribute('fill', OtherConstants.cutoutCircleColor);
        this.rightCircle.setAttribute('stroke', OtherConstants.cutoutCircleStrokeColor);

        this._setDraggable();

        circlesGroup.appendChild(this.leftCircle);
        circlesGroup.appendChild(this.rightCircle);

        this.svgC.rectGroup.appendChild(circlesGroup);
    }

    _setDraggable() {
        this._setDraggableC(this.leftCircle, this.rightCircle, false);
        this._setDraggableC(this.rightCircle, this.leftCircle, true);
        this._setDraggableR();
    }

    _setDraggableC(circle, limitCircle, right) {
        let start = false;
        let x = 0,
            y = 0;
        let limitX = 0,
            limitY = 0;

        const mouseDwn = (event) => {
            if (event.preventDefault) event.preventDefault();

            x = circle.getAttributeNS(null, 'cx');
            y = circle.getAttributeNS(null, 'cy');

            limitX = parseInt(limitCircle.getAttributeNS(null, 'cx'));
            limitY = parseInt(limitCircle.getAttributeNS(null, 'cy'));

            if (right) {
                limitX += this.limitSVGWidth;
                limitY += this.limitSVGHeight;
            } else {
                limitX -= this.limitSVGWidth;
                limitY -= this.limitSVGHeight;
            }

            start = true;
        };

        const mouseMv = () => {
            if (start) {
                let newX = this.svgC.mouseX;
                let newY = this.svgC.mouseY;

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
        };

        //mouse
        circle.addEventListener('mousedown', (event) => {
            mouseDwn(event);
        });

        window.addEventListener('mousemove', () => {
            mouseMv();
        });
        this.svgC.svg.addEventListener('mouseup', () => {
            start = false
        });
        this.svgC.svg.addEventListener('mouseleave', () => {
            start = false
        });

        //touch
        circle.addEventListener('touchstart', (event) => {
            mouseDwn(event);
        });
        window.addEventListener('touchmove', () => {
            mouseMv();
        });
        this.svgC.svg.addEventListener('touchend', () => {
            start = false;
        });
        const bounds = this.svgC.svg.getBoundingClientRect();
        document.addEventListener('touchmove', (event) => { //touch leave
            const touch = event.touches[0];
            if (touch.pageX > bounds.x + bounds.width || touch.pageX < bounds.x
                || touch.pageY > bounds.y + bounds.height || touch.pageY < bounds.y) {
                start = false;
            }
        }, false);
    };

    _setDraggableR() {
        let start = false;
        let startX = 0,
            startY = 0;
        let startRectX = 0,
            startRectY = 0;

        const mouseDwn = (event) => {
            if (event.preventDefault) event.preventDefault();
            this.svgC.listenEvent(event);
            startX = this.svgC.mouseX;
            startY = this.svgC.mouseY;

            startRectX = this.x;
            startRectY = this.y;

            start = true;
        };

        const mouseMv = () => {
            if (start) {
                const endX = this.svgC.mouseX;
                const endY = this.svgC.mouseY;

                let newX = startRectX + (endX - startX);
                let newY = startRectY + (endY - startY);

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
        };

        this.rect.addEventListener('mousedown', (event) => {
            mouseDwn(event);
        });
        window.addEventListener('mousemove', () => {
            mouseMv();
        });
        this.svgC.svg.addEventListener('mouseup', () => {
            start = false
        });
        this.svgC.svg.addEventListener('mouseleave', () => {
            start = false
        });

        this.rect.addEventListener('touchstart', (event) => {
            mouseDwn(event);
        });
        window.addEventListener('touchmove', () => {
            mouseMv();
        });
        this.svgC.svg.addEventListener('touchend', () => {
            start = false;
        });
        const bounds = this.svgC.svg.getBoundingClientRect();
        document.addEventListener('touchmove', (event) => { //touch leave
            const touch = event.touches[0];
            if (touch.pageX > bounds.x + bounds.width || touch.pageX < bounds.x
                || touch.pageY > bounds.y + bounds.height || touch.pageY < bounds.y) {
                start = false;
            }
        }, false);
    }

    _drawCutout() {
        this.fileManager.drawImageOnCanvas(this.canvasC);

        //mozilla - needed instead of svg.clientHeight
        const box = this.svgC.svg.getBoundingClientRect();
        const svgClientHeight = box.bottom - box.top;
        const svgClientWidth = box.right - box.left;

        this.contentHeightRatio = this.height / svgClientHeight;
        this.contentWidthRatio = this.width / svgClientWidth;

        const newHeight = this.canvasC.canvasContainer.clientHeight / this.contentHeightRatio;
        const shrinkRatio = newHeight / svgClientHeight;
        const newWidth = shrinkRatio * this.width;

        this.canvasC.canvas.style.height = newHeight + 'px';
        this.canvasC.canvasContainer.style.width = newWidth + 'px';

        const x = (-1) * this.leftCircle.getAttributeNS(null, 'cx') * shrinkRatio;
        const y = (-1) * this.leftCircle.getAttributeNS(null, 'cy') * shrinkRatio;
        this.canvasC.canvas.style.left = x + 'px';
        this.canvasC.canvas.style.top = y + 'px';

        if (this.svgC.rotation % 180 === 0) {
            const origHeight = this.svgC.imageOriginalHeight;
            const resizeRatio = origHeight / svgClientHeight;
            this.sendX = this.leftCircle.getAttributeNS(null, 'cx') * resizeRatio;
            this.sendY = this.leftCircle.getAttributeNS(null, 'cy') * resizeRatio;
        }
    }

    doDefaultCutout() {
        this._makeCutout();
        this._drawCutout();
        this.fileManager.setCutOff();
    }
}