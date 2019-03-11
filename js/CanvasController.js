class CanvasController {
    constructor(svgControllerInstance) {
        this.svgC = svgControllerInstance;
        this.canvas = document.querySelector('canvas');
        this.canvasCtx = this.canvas.getContext('2d');
    }

    drawAll(image, download) {
        this.drawImg(image);
        this.drawEllipses();

        download.href = this.canvas.toDataURL('image/jpeg', 1.0);
        download.download = "test.jpg";
    }

    drawImg(image) {
        var imageHeight = image.height;
        var imageWidth = image.width;

        if (imageWidth > ImageLimits.MAX_WIDTH) { //check width from original
            imageHeight = (imageHeight / imageWidth) * ImageLimits.MAX_WIDTH;
            imageWidth = ImageLimits.MAX_WIDTH;

        }
        if (imageHeight > ImageLimits.MAX_HEIGHT) { //check height from possibly smaller
            imageWidth = (imageWidth / imageHeight) * ImageLimits.MAX_HEIGHT;
            imageHeight = ImageLimits.MAX_HEIGHT;

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

    drawEllipses() {
        //ellipses style
        this.canvasCtx.filter = "blur(5px)";
        this.canvasCtx.fillStyle = "rgba(255,255,255,0.9)";

        //resize ratio
        var svgWidth = this.svgC.svg.style.width.replace('px', '');
        var canvasWidth = this.canvas.width;
        var canvasHeight = this.canvas.height;

        var ratio = canvasWidth / svgWidth;

        console.log(this.svgC.svgEllipses);

        for (var i = 0; i < this.svgC.svgEllipses.length; i++) {
            var ellipse = this.svgC.svgEllipses[i];

            var cx = ellipse.getAttribute('cx') * ratio;
            var cy = ellipse.getAttribute('cy') * ratio;
            var rx = ellipse.getAttribute('rx') * ratio;
            var ry = ellipse.getAttribute('ry') * ratio;


            this.canvasCtx.beginPath();
            if (this.svgC.rotation === 0) {
                this.canvasCtx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
            }
            else if(this.svgC.rotation === 90){
                this.canvasCtx.ellipse(cy, canvasWidth - cx, ry, rx, 0, 0, 2 * Math.PI);
            }
            else if(this.svgC.rotation === 180){
                this.canvasCtx.ellipse(canvasWidth - cx, canvasHeight - cy, rx, ry, 0, 0, 2 * Math.PI);
            }
            else if(this.svgC.rotation === 270){
                this.canvasCtx.ellipse(canvasHeight - cy, cx, ry, rx, 0, 0, 2 * Math.PI);
            }
            this.canvasCtx.stroke();
            this.canvasCtx.fill();
        }
    }
}