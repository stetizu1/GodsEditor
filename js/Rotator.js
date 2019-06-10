class Rotator {
    /**
     * Creates instance of Rotator, that allows to rotate svg image and set it to canvas
     * @param fileManager - instance of FileManager to manage canvases
     * @param leftId - id of button for left rotation
     * @param rightId - id of button for right rotation
     */
    constructor(fileManager, leftId, rightId) {
        this.fileManager = fileManager;
        this.svgC = this.fileManager.svgC;
        this.right = false;
        this._setRotation(leftId, false);
        this._setRotation(rightId, true);
    }

    _setRotation(buttonId, right) {
        const button = document.getElementById(buttonId);
        const degrees = right ? 90 : 270;
        button.addEventListener('click', () => {
            if (this.svgC.svgImg === null) return;

            this.fileManager.setCutOff();
            this.fileManager.setActiveItemChanged();

            this.right = right;
            this.svgC.rotation += degrees;
            if (this.svgC.rotation >= 360) this.svgC.rotation -= 360;
            this._rotate();

            this.fileManager.resetCanvases(true);
        });
    }

    static setRotation(svgC){
        const rotation = svgC.rotation;
        const width = svgC.svg.style.width.replace('px', '');
        let height;
        if (rotation === 0 || rotation === 180){
            height = svgC.svg.style.height.replace('px', '');
            svgC.setWidthAndHeight(width, height);
        }
        else {
            const oldH = svgC.svg.style.height.replace('px', '');
            height = width / oldH * width;
            // noinspection JSSuspiciousNameCombination
            svgC.setWidthAndHeight(height, width);
        }

        svgC.refreshXY(rotation, width, height);


        svgC.svg.style.height = height + 'px';
        svgC.svgImg.setAttribute('transform', 'rotate(' + rotation + ')');
    }

    _rotate() {
        const rotation = this.svgC.rotation;

        const width = this.svgC.svg.style.width.replace('px', '');
        const oldH = this.svgC.svg.style.height.replace('px', '');
        const newH = width / oldH * width;
        this.svgC.refreshXY(rotation, width, newH);

        if (rotation === 90 || rotation === 270) {
            // noinspection JSSuspiciousNameCombination
            this.svgC.setWidthAndHeight(newH, width);
        } else {
            this.svgC.setWidthAndHeight(width, newH);
        }

        this._rotateEllipses(width, oldH, width, newH);

        this.svgC.svg.style.height = newH + 'px';
        this.svgC.svgImg.setAttribute('transform', 'rotate(' + rotation + ')');
    }

    _rotateEllipses(oldW, oldH, newW, newH) {
        const resize = newW / oldH; // or newH /oldW
        for (let i = 0; i < this.svgC.svgEllipses.length; i++) {
            const ellipse = this.svgC.svgEllipses[i];

            //get new rx and ry with resize
            const newRX = ellipse.getAttributeNS(null, 'ry') * resize;
            const newRY = ellipse.getAttributeNS(null, 'rx') * resize;

            //get position ratio
            const xRatio = ellipse.getAttributeNS(null, 'cx') / oldW;
            const yRatio = ellipse.getAttributeNS(null, 'cy') / oldH;

            //set rx and ry
            ellipse.setAttributeNS(null, 'rx', newRX.toString());
            ellipse.setAttributeNS(null, 'ry', newRY.toString());


            //set cx and cy depending on left/right rotation
            if (this.right) {
                ellipse.setAttributeNS(null, 'cx', (newW - newW * yRatio).toString());
                ellipse.setAttributeNS(null, 'cy', (newH * xRatio).toString());
            } else {
                ellipse.setAttributeNS(null, 'cx', (newW * yRatio).toString());
                ellipse.setAttributeNS(null, 'cy', (newH - newH * xRatio).toString());
            }
        }
    }
}