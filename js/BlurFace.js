class BlurFace {
    constructor(switchId, svgControllerInstance) {
        this.svgC = svgControllerInstance;

        this.on = false;

        this.listenToSwitch(switchId);
        this.addEllipse();
    }

    listenToSwitch(blurId) {
        var blurFace = document.getElementById(blurId);
        blurFace.addEventListener('change', () => {
            this.on = blurFace.checked;
            if(this.on) this.svgC.setCutOff();
        });
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
            this.startX = this.svgC.mouseX;
            this.startY = this.svgC.mouseY;

            this.click = true;

            this.timer = setTimeout(() => {
                this.click = false;
            }, this.DELAY);

        });
        window.addEventListener('mousemove', () => {
            if (!this.on || !this.mouseDown) {
                return;
            }


            var width = Math.abs(this.startX - this.svgC.mouseX);
            var height = Math.abs(this.startY - this.svgC.mouseY);


            this.ellipse.setAttribute('cx', (this.startX + this.svgC.mouseX + 5) / 2); // '5' for blur edge
            this.ellipse.setAttribute('cy', (this.startY + this.svgC.mouseY + 5) / 2);
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
    setOff(buttonId, offButtonId) {
        var button = document.getElementById(buttonId);
        var offButton = document.getElementById(offButtonId);
        offButton.addEventListener('click', () => {
            button.checked = false;
            this.on = false;
        });
    }
}

