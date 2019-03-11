class SVGController {
    constructor(svgId) {
        this.svg = document.getElementById(svgId);
        this.svgNS = "http://www.w3.org/2000/svg";

        //init img
        this.svgImg = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        this.svgImg.setAttributeNS(null, 'x', '0');
        this.svgImg.setAttributeNS(null, 'y', '0');
        this.svgImg.setAttributeNS(null, 'visibility', 'visible');
        this.svg.appendChild(this.svgImg); //add image to svg

        this.svgEllipses = [];
        this.rotation = 0;
        this.x = '0';
        this.y = '0';
    }

    clear() {
        var items = this.svg.childNodes;
        for (var i = 0; i < items.length; i++) {
            if (items[i].id !== "defs") {
                items[i].remove();
            }
        }
        this.svgEllipses = [];
    }

    drawImg(image) {
        this.svgImg.setAttributeNS('http://www.w3.org/1999/xlink', 'href', image.src);

        //small screens
        var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
        var coef = screenWidth >= 980 ? 0.5 : 0.9;

        this.calcWidth = coef * screenWidth;
        var calcHeight;

        if(this.rotation === 0 || this.rotation === 180) {
            calcHeight = image.height / image.width * coef * screenWidth;
            this.refreshXY(this.rotation, this.calcWidth, calcHeight);

            this.svg.style.height = calcHeight + 'px';
            this.svg.style.width = this.calcWidth + 'px';
            this.setWidthAndHeight(this.calcWidth, calcHeight);
        } else {
            calcHeight = image.width / image.height * coef * screenWidth;
            this.refreshXY(this.rotation, this.calcWidth, calcHeight);

            this.svg.style.height = calcHeight + 'px';
            this.svg.style.width = this.calcWidth + 'px';
            // noinspection JSSuspiciousNameCombination
            this.setWidthAndHeight(calcHeight, this.calcWidth);
        }

    }

    redrawImage(image) {
        var oldWidth = this.calcWidth;
        this.drawImg(image);
        this.drawEllipses(oldWidth);
    }

    drawEllipses(oldWidth) {
        console.log('old: ' + oldWidth );
        console.log('new: ' + oldWidth );
        var resize = this.calcWidth / oldWidth;
        for (var i = 0; i < this.svgEllipses.length; i++) {
            var ellipse = this.svgEllipses[i];

            var newRX = ellipse.getAttributeNS(null, 'rx') * resize;
            var newRY = ellipse.getAttributeNS(null, 'ry') * resize;
            var newCX = ellipse.getAttributeNS(null, 'cx') * resize;
            var newCY = ellipse.getAttributeNS(null, 'cy') * resize;

            //set rx and ry
            ellipse.setAttributeNS(null, 'rx', newRX);
            ellipse.setAttributeNS(null, 'ry', newRY);
            ellipse.setAttributeNS(null, 'cx', newCX);
            ellipse.setAttributeNS(null, 'cy', newCY);

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

    setWidthAndHeight(width, height) {
        this.svgImg.style.width = width;
        this.svgImg.style.height = height;

        this.svgImg.setAttributeNS(null, 'width', width); //firefox
        this.svgImg.setAttributeNS(null, 'height', height); //firefox
    }
}
