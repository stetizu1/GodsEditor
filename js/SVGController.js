class SVGController {
    constructor(svgId) {
        this.svg = document.getElementById(svgId);
        this.svgNS = "http://www.w3.org/2000/svg";
        this.svgImg = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        this.svg.appendChild(this.svgImg); //add image to svg
        this.svgEllipses = [];
        this.rotation = 0;
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
        this.svgImg.setAttributeNS(null, 'x', '0');
        this.svgImg.setAttributeNS(null, 'y', '0');
        this.svgImg.setAttributeNS(null, 'visibility', 'visible');

        //small screens
        this.screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
        var calcWidth = 0.9 * this.screenWidth;
        var calcHeight = image.height / image.width * 0.9 * this.screenWidth;

        //big screens
        if (this.screenWidth >= 980) {
            calcWidth = 0.5 * this.screenWidth;
            calcHeight = image.height / image.width * 0.5 * this.screenWidth;
        }

        this.svgImg.setAttributeNS(null, 'width', calcWidth);
        this.svgImg.setAttributeNS(null, 'height', calcHeight);
        this.svg.style.width = calcWidth + 'px';
        this.svg.style.height = calcHeight + 'px';

    }

    redrawImage(image) {
        var oldWidth = this.screenWidth;
        this.drawImg(image);
        this.drawEllipses(oldWidth);
    }

    drawEllipses(oldWidth) {
        var resize = this.screenWidth / oldWidth;
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
}
