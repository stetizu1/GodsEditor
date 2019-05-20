class Rotator {
    constructor(svgControllerInstance, fileManager, leftId, rightId) {
        this.svgC = svgControllerInstance;
        this.right = false;
        this.fileManager = fileManager;
        this.setRotation(leftId, false);
        this.setRotation(rightId, true);
    }

    setRotation(buttonId, right) {
        var button = document.getElementById(buttonId);
        var degrees = right ? 90 : 270;
        button.addEventListener('click', () => {
            this.svgC.setCutOff();

            this.right = right;
            if (this.svgC.svgImg === null) return;
            this.svgC.rotation += degrees;
            if (this.svgC.rotation >= 360) this.svgC.rotation -= 360;
            this.rotate();
            this.fileManager.resetCutouts();
        });
    }

    rotate() {
        var rotation = this.svgC.rotation;

        var width = this.svgC.svg.style.width.replace('px', '');
        var oldH = this.svgC.svg.style.height.replace('px', '');
        var newH = width / oldH * width;
        this.svgC.refreshXY(rotation, width, newH);

        if (rotation === 90 || rotation === 270) {
            // noinspection JSSuspiciousNameCombination
            this.svgC.setWidthAndHeight(newH, width);
        } else {
            this.svgC.setWidthAndHeight(width, newH);
        }

        this.rotateEllipses(width, oldH, width, newH);

        this.svgC.svg.style.height = newH + 'px';
        this.svgC.svgImg.setAttribute('transform', 'rotate(' + rotation + ')');
    }

    rotateEllipses(oldW, oldH, newW, newH) {
        var resize = newW / oldH; // or newH /oldW
        for (var i = 0; i < this.svgC.svgEllipses.length; i++) {
            var ellipse = this.svgC.svgEllipses[i];

            //get new rx and ry with resize
            var newRX = ellipse.getAttributeNS(null, 'ry') * resize;
            var newRY = ellipse.getAttributeNS(null, 'rx') * resize;

            //get position ratio
            var xRatio = ellipse.getAttributeNS(null, 'cx') / oldW;
            var yRatio = ellipse.getAttributeNS(null, 'cy') / oldH;

            //set rx and ry
            ellipse.setAttributeNS(null, 'rx', newRX);
            ellipse.setAttributeNS(null, 'ry', newRY);


            //set cx and cy depending on left/right rotation
            if (this.right) {
                ellipse.setAttributeNS(null, 'cx', newW - newW * yRatio);
                ellipse.setAttributeNS(null, 'cy', newH * xRatio);
            } else {
                ellipse.setAttributeNS(null, 'cx', newW * yRatio);
                ellipse.setAttributeNS(null, 'cy', newH - newH * xRatio);
            }
        }
    }
}