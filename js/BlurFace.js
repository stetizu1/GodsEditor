class BlurFace {
    constructor(switchId, svgControllerInstance) {
        this.svgC = svgControllerInstance;

        this.mouseX = 0;
        this.mouseY = 0;

        this.on = false;

        this.listenToSwitch(switchId);
        this.listenToMousePosition();
        this.addEllipse();
    }

    listenToSwitch(blurId) {
        var blurFace = document.getElementById(blurId);
        blurFace.addEventListener('change', () => {
            this.on = blurFace.checked;
        });
    }

    listenToMousePosition() {
        var mousePos = (event) => {

            var rect = this.svgC.svg.getBoundingClientRect();
            var position = {top: (rect.top), left: rect.left};

            if (event.clientX) {
                this.mouseX = event.clientX - position.left; //only clientX / -Y has same behavior on Firefox and Chrome
                this.mouseY = event.clientY - position.top;
            }
        };
        window.addEventListener('mousemove', mousePos);
        window.addEventListener('scroll', mousePos);
    }

    addEllipse() {
        this.ellipse = null;
        this.startX = 0;
        this.startY = 0;
        this.click = true;
        this.timer = null;
        this.DELAY = 200;

        this.svgC.svg.addEventListener('mousedown', (event) => {
            event.preventDefault();
            if (!this.on) return;

            this.mouseDown = true;

            this.ellipse = document.createElementNS(this.svgC.svgNS, 'ellipse');

            this.ellipse.setAttribute('fill', 'white');
            this.ellipse.setAttribute('opacity', '0.9');
            this.ellipse.setAttribute('filter', 'url(#blurFilter)');

            var el = this.ellipse;
            el.addEventListener("dblclick", () => {
                if (!this.on) {
                    return;
                }
                el.remove();
                this.svgC.svgEllipses.splice(this.svgC.svgEllipses.indexOf(el), 1);
            });

            this.svgC.svg.appendChild(this.ellipse);

            //starting coordinates
            this.startX = this.mouseX;
            this.startY = this.mouseY;

            this.click = true;

            this.timer = setTimeout(() => {
                this.click = false;
            }, this.DELAY);

        });
        window.addEventListener('mousemove', () => {
            if (!this.on || !this.mouseDown) {
                return;
            }


            var width = Math.abs(this.startX - this.mouseX);
            var height = Math.abs(this.startY - this.mouseY);


            this.ellipse.setAttribute('cx', (this.startX + this.mouseX + 5) / 2); // '5' for blur edge
            this.ellipse.setAttribute('cy', (this.startY + this.mouseY + 5) / 2);
            this.ellipse.setAttribute('rx', width / 2);
            this.ellipse.setAttribute('ry', height / 2);
        });

        //click / end of drag detection
        window.addEventListener('mouseup', () => {
            if (!this.on || !this.mouseDown) { //if off or drag didn't start inside
                return;
            }
            this.mouseDown = false;

            if (this.click) {
                clearTimeout(this.timer);
                if (this.ellipse != null) {
                    this.ellipse.remove();
                }
                return;
            }
            this.svgC.svgEllipses.push(this.ellipse);
        });
    }
}

