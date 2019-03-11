class SVGController {
    constructor() {
        this.svg = document.querySelector('svg');
        this.svgNS = "http://www.w3.org/2000/svg";
        this.svgImg = null;
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
        var svgImg = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        svgImg.setAttributeNS('http://www.w3.org/1999/xlink', 'href', image.src);
        svgImg.setAttributeNS(null, 'x', '0');
        svgImg.setAttributeNS(null, 'y', '0');
        svgImg.setAttributeNS(null, 'visibility', 'visible');

        //small screens
        var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
        var calcWidth = 0.9 * screenWidth;
        var calcHeight = image.height / image.width * 0.9 * screenWidth;

        //big screens
        if (screenWidth >= 980) {
            calcWidth = 0.5 * screenWidth;
            calcHeight = image.height / image.width * 0.5 * screenWidth;
        }

        svgImg.setAttributeNS(null, 'width', calcWidth);
        svgImg.setAttributeNS(null, 'height', calcHeight);
        this.svg.style.width = calcWidth + 'px';
        this.svg.style.height =  calcHeight + 'px';

        this.svg.appendChild(svgImg); //add image to svg
        this.svgImg = svgImg;
    }
}
