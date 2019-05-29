class SVGController {
    /**
     * Creates instance of controller that wraps svg for necessary functions
     * @param svgId - id of svg element
     */
    constructor(svgId) {
        this.svg = document.getElementById(svgId);
        this.svgNS = 'http://www.w3.org/2000/svg';

        this.mouseX = 0;
        this.mouseY = 0;
        this._listenToMousePosition();

        this._initImage();

        this.svgEllipses = [];
        this.rectGroup = null;

        this.rotation = 0;
        this.x = '0';
        this.y = '0';
        this.imageOriginalHeight = 0;
        this.imageOriginalWidth = 0;
        this.circleSize = NumberConstants.SMALL_CIRCLE_R;
    }

    _listenToMousePosition() {
        const mousePos = (event) => {
            this.listenEvent(event);
        };
        window.addEventListener('mousemove', mousePos);
        window.addEventListener('touchmove', mousePos);
        window.addEventListener('scroll', mousePos);
    }

    _initImage() {
        //init img
        this.svgImg = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        this.svgImg.setAttributeNS(null, 'x', '0');
        this.svgImg.setAttributeNS(null, 'y', '0');
        this.svgImg.setAttributeNS(null, 'visibility', 'visible');
        this.svg.appendChild(this.svgImg); //add image to svg
    }

    _drawEllipses(oldWidth) {
        const resize = this.calcWidth / oldWidth;
        for (let i = 0; i < this.svgEllipses.length; i++) {
            const ellipse = this.svgEllipses[i];

            const newRX = ellipse.getAttributeNS(null, 'rx') * resize;
            const newRY = ellipse.getAttributeNS(null, 'ry') * resize;
            const newCX = ellipse.getAttributeNS(null, 'cx') * resize;
            const newCY = ellipse.getAttributeNS(null, 'cy') * resize;

            //set rx and ry
            ellipse.setAttributeNS(null, 'rx', newRX.toString());
            ellipse.setAttributeNS(null, 'ry', newRY.toString());
            ellipse.setAttributeNS(null, 'cx', newCX.toString());
            ellipse.setAttributeNS(null, 'cy', newCY.toString());
        }
    }

    drawEllipses(){
        for (let i = 0; i < this.svgEllipses.length; i++){
            const ellipse = this.svgEllipses[i];
            this.svg.appendChild(ellipse);
        }
    }

    listenEvent(event) {
        const rect = this.svg.getBoundingClientRect();
        const position = {top: (rect.top), left: rect.left};

        if (event.clientX) {
            this.mouseX = event.clientX - position.left; //only clientX / -Y has same behavior on Firefox and Chrome
            this.mouseY = event.clientY - position.top;
        } else if(event.touches && event.touches[0].clientX) {
            this.mouseX = event.touches[0].clientX - position.left;
            this.mouseY = event.touches[0].clientY - position.top;
        }
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

        this.svgImg.setAttributeNS(null, 'x', this.x);
        this.svgImg.setAttributeNS(null, 'y', this.y);
    }

    drawImg(image) {
        this.svgImg.setAttributeNS('http://www.w3.org/1999/xlink', 'href', image.src);
        this.imageOriginalWidth = image.width;
        this.imageOriginalHeight = image.height;

        //small screens
        const screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
        const coefficient = screenWidth >= NumberConstants.SCREEN_WIDTH_LIMIT ? NumberConstants.WIDTH_COEFFICIENT_BIG_SCREEN : NumberConstants.WIDTH_COEFFICIENT_SMALL_SCREEN;

        this.calcWidth = coefficient * screenWidth;
        let calcHeight;

        if (this.rotation === 0 || this.rotation === 180) {
            calcHeight = image.height / image.width * coefficient * screenWidth;
            this.refreshXY(this.rotation, this.calcWidth, calcHeight);

            this.svg.style.height = calcHeight + 'px';
            this.svg.style.width = this.calcWidth + 'px';
            this.setWidthAndHeight(this.calcWidth, calcHeight);
        } else {
            calcHeight = image.width / image.height * coefficient * screenWidth;
            this.refreshXY(this.rotation, this.calcWidth, calcHeight);

            this.svg.style.height = calcHeight + 'px';
            this.svg.style.width = this.calcWidth + 'px';
            // noinspection JSSuspiciousNameCombination
            this.setWidthAndHeight(calcHeight, this.calcWidth);
        }

    }

    redrawImage(image) {
        const oldWidth = this.calcWidth;
        this.drawImg(image);
        this._drawEllipses(oldWidth);
    }

    clear() {
        this.rotation = 0;

        for (let i = 0; i < this.svgEllipses.length; i++) {
            this.svgEllipses[i].remove();
        }

        //reset attributes of img
        this.rotation = 0;
        this.svgImg.setAttributeNS(null, 'x', '0');
        this.svgImg.setAttributeNS(null, 'y', '0');
        this.svgImg.setAttribute('transform', 'rotate(0)');

        this.svgEllipses = [];
    }

    setWidthAndHeight(width, height) {
        this.svgImg.style.width = width;
        this.svgImg.style.height = height;

        this.svgImg.setAttributeNS(null, 'width', width); //firefox
        this.svgImg.setAttributeNS(null, 'height', height); //firefox
    }

    getSVGWidth() {
        return parseInt(this.svg.style.width.replace('px', ''));
    }

    getSVGHeight() {
        return parseInt(this.svg.style.height.replace('px', ''));
    }

}
