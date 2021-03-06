class CanvasController {
    /**
     * Creates instance of controller that wraps canvas for necessary functions. It creates canvas inside canvasContainer
     * @param canvasContainer - div in which is canvas created
     * @param svgControllerInstance - instance of SVGController
     * @param widthLimit - max canvas width
     * @param heightLimit - max canvas height
     */
    constructor(canvasContainer, svgControllerInstance, widthLimit, heightLimit) {
        this.canvasContainer = canvasContainer;

        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'absolute';

        this.canvasContainer.appendChild(this.canvas);

        this.canvasCtx = this.canvas.getContext('2d');

        this.svgC = svgControllerInstance;

        this.widthLimit = widthLimit;
        this.heightLimit = heightLimit;

        this.saving = false;
    }

    setCanvasSave(saveContainer, fileName, order) {
        this.saving = true;
        this.dwnL = document.createElement('a');
        this.dwnL.style.order = order;

        saveContainer.appendChild(this.dwnL);
        this.fileName = fileName;
    }

    reloadFileSave(order) {
        this.dwnL.download = this.fileName;
        this.dwnL.innerHTML = this.fileName;
        this.dwnL.style.order = order;
    }

    drawAll(image) {
        this._drawImgOnCanvas(image);
        this._drawEllipsesOnCanvas();
        if (this.saving) {
            this.dwnL.href = this.canvas.toDataURL('image/jpeg', 0.9);
            this.dwnL.download = this.fileName;
            this.dwnL.innerHTML = this.fileName;
        }
    }

    _drawImgOnCanvas(image) {
        let imageHeight = image.height;
        let imageWidth = image.width;

        if (imageWidth > this.widthLimit) { //check width from original
            imageHeight = (imageHeight / imageWidth) * this.widthLimit;
            imageWidth = this.widthLimit;
        }
        if (imageHeight > this.heightLimit) { //check height from possibly smaller
            imageWidth = (imageWidth / imageHeight) * this.heightLimit;
            imageHeight = this.heightLimit;
        }

        if (this.svgC.rotation === 0 || this.svgC.rotation === 180) {
            this.canvas.height = imageHeight;
            this.canvas.width = imageWidth;

            if (this.svgC.rotation === 180) {
                this.canvasCtx.rotate(Math.PI);
                this.canvasCtx.translate(-1 * imageWidth, -1 * imageHeight);
            }
            this.canvasCtx.drawImage(image, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            // noinspection JSSuspiciousNameCombination
            this.canvas.height = imageWidth;
            // noinspection JSSuspiciousNameCombination
            this.canvas.width = imageHeight;

            if (this.svgC.rotation === 90) {
                this.canvasCtx.rotate(Math.PI / 2);
                this.canvasCtx.translate(0, -1 * imageHeight);
            } else {
                this.canvasCtx.rotate(Math.PI * 3 / 2);
                this.canvasCtx.translate(-1 * imageWidth, 0);
            }
            this.canvasCtx.drawImage(image, 0, 0, this.canvas.height, this.canvas.width);

        }
    }

    _drawEllipsesOnCanvas() {
        //ellipses style
        const n = 5 * this.canvas.width / this.svgC.getSVGWidth();
        this.canvasCtx.filter = 'blur(' + n + 'px)';
        this.canvasCtx.fillStyle = OtherConstants.blurColor;

        //resize ratio
        const svgWidth = this.svgC.svg.style.width.replace('px', '');
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;

        const ratio = canvasWidth / svgWidth;

        for (let i = 0; i < this.svgC.svgEllipses.length; i++) {
            const ellipse = this.svgC.svgEllipses[i];

            const cx = ellipse.getAttribute('cx') * ratio;
            const cy = ellipse.getAttribute('cy') * ratio;
            const rx = ellipse.getAttribute('rx') * ratio;
            const ry = ellipse.getAttribute('ry') * ratio;


            this.canvasCtx.beginPath();
            if (this.svgC.rotation === 0) {
                this.canvasCtx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
            } else if (this.svgC.rotation === 90) {
                this.canvasCtx.ellipse(cy, canvasWidth - cx, ry, rx, 0, 0, 2 * Math.PI);
            } else if (this.svgC.rotation === 180) {
                this.canvasCtx.ellipse(canvasWidth - cx, canvasHeight - cy, rx, ry, 0, 0, 2 * Math.PI);
            } else if (this.svgC.rotation === 270) {
                this.canvasCtx.ellipse(canvasHeight - cy, cx, ry, rx, 0, 0, 2 * Math.PI);
            }
            this.canvasCtx.stroke();
            this.canvasCtx.fill();
        }
    }
}