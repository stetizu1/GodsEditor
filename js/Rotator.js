class Rotator {
    constructor(svgControllerInstance) {
        this.svgC = svgControllerInstance;
        this.x = '0';
        this.y = '0';
        this.right = false;
    }

    setRotation(buttonId, right) {
        var button = document.getElementById(buttonId);
        var degrees = right ? 90 : 270;
        button.addEventListener('click', () => {
            this.right = right;
            if (this.svgC.svgImg === null) return;
            this.svgC.rotation += degrees;
            if (this.svgC.rotation >= 360) this.svgC.rotation -= 360;
            this.rotate();
        });
    }

    rotate() {
        var rotation = this.svgC.rotation;

        var width = this.svgC.svg.style.width.replace('px', '');
        var oldH = this.svgC.svg.style.height.replace('px', '');
        var newH = width / oldH * width;
        this.refreshXY(rotation, width, newH);

        this.svgC.svgImg.setAttributeNS(null, 'x', this.x);
        this.svgC.svgImg.setAttributeNS(null, 'y', this.y);

        if (rotation === 90 || rotation === 270) {
            // noinspection JSSuspiciousNameCombination
            this.setWidthAndHeight(newH, width);
        } else {
            this.setWidthAndHeight(width, newH);
        }

        this.rotateEllipses(width, oldH, width, newH);

        this.svgC.svg.style.height = newH + 'px';
        this.svgC.svgImg.setAttribute('transform', 'rotate(' + rotation + ')');

    }

    setWidthAndHeight(width, height) {
        this.svgC.svgImg.style.width = width;
        this.svgC.svgImg.style.height = height;

        this.svgC.svgImg.setAttributeNS(null, 'width', width); //firefox
        this.svgC.svgImg.setAttributeNS(null, 'height', height); //firefox
    }

    refreshXY(rotation, width, height) {
        if (rotation === 0) {
            this.x = '0';
            this.y = '0';
        } else if (rotation === 90) {
            this.x = '0';
            this.y = '-' + width;
        } else if (rotation === 180) {
            this.x = '-' + width;
            this.y = '-' + height;

        } else if (rotation === 270) {
            this.x = '-' + height;
            this.y = '0';
        }
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