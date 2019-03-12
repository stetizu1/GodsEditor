class Cutout {
    constructor(svgControllerInstance) {
        this.svgC = svgControllerInstance;
        this.x = 0;
        this.y = 0;
        this.minWidth = 0;
        this.minHeight = 0;
        this.leftCircle = null;
        this.rightCircle = null;

        this.on = false;
    }

    makeCutout(width, height) {
        this.svgC.rectGroup = document.createElementNS(this.svgC.svgNS, 'g');
        var rect = document.createElementNS(this.svgC.svgNS, 'rect');
        rect.setAttributeNS(null, 'fill', 'rgba(192,192,192,0.3)');
        rect.setAttributeNS(null, 'stroke', 'black');
        rect.setAttributeNS(null, 'stroke-width', '2');
        this.svgC.rectGroup.appendChild(rect);
        this.svgC.svg.appendChild(this.svgC.rectGroup);

        var svgW = this.svgC.svg.style.width.replace('px', '');
        var svgH = this.svgC.svg.style.height.replace('px', '');

        var minRatio = svgW / this.svgC.imageOriginalWidth;

        this.minWidth = width * minRatio;
        this.minHeight = height * minRatio;

        var maxRatio = Math.min(svgW / width, svgH / height);

        this.height = height * maxRatio;
        this.width = width * maxRatio;

        this.x = (svgW - this.width) / 2;
        this.y = (svgH - this.height) / 2;

        rect.setAttributeNS(null, 'x', this.x);
        rect.setAttributeNS(null, 'y', this.y);
        rect.setAttributeNS(null, 'height', this.height);
        rect.setAttributeNS(null, 'width', this.width);


        this.addCircles(this.x, this.y, this.x + this.width, this.y + this.height);
    }

    setCutable(buttonId, width, height) {
        var cutter = document.getElementById(buttonId);
        cutter.addEventListener('click', () => {
            if (!this.svgC.cutoutOn) {
                this.makeCutout(width, height);
                this.svgC.cutoutOn = true;
            } else if (this.svgC.rectGroup != null) {
                this.svgC.rectGroup.remove();
                this.svgC.rectGroup = null;
                this.svgC.cutoutOn = false;
            }
        })
    }

    addCircles(x1, y1, x2, y2) {
        var circlesGroup = document.createElementNS(this.svgC.svgNS, 'g');
        circlesGroup.setAttribute('class', 'circles');

        this.leftCircle = document.createElementNS(this.svgC.svgNS, 'circle');
        this.leftCircle.setAttributeNS(null, 'r', '10');
        this.leftCircle.setAttributeNS(null, 'cx', x1);
        this.leftCircle.setAttributeNS(null, 'cy', y1);
        this.leftCircle.setAttribute('fill', 'grey');
        this.leftCircle.setAttribute('stroke', 'black');


        this.rightCircle = document.createElementNS(this.svgC.svgNS, 'circle');
        this.rightCircle.setAttributeNS(null, 'r', '10');
        this.rightCircle.setAttributeNS(null, 'cx', x2);
        this.rightCircle.setAttributeNS(null, 'cy', y2);
        this.rightCircle.setAttribute('fill', 'grey');
        this.rightCircle.setAttribute('stroke', 'black');

        circlesGroup.appendChild(this.leftCircle);
        circlesGroup.appendChild(this.rightCircle);

        this.svgC.rectGroup.appendChild(circlesGroup);
    }
}