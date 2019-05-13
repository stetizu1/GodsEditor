class BlurFace {
    constructor(switchId, svgControllerInstance) {
        this.svgC = svgControllerInstance;

        this.on = false;
        this.cutouts = [];

        this.listenToSwitch(switchId);
        this.addEllipse();

        this.touchTime = 0;
    }

    listenToSwitch(blurId) {
        var blurFace = document.getElementById(blurId);
        blurFace.addEventListener('change', () => {
            this.on = blurFace.checked;
            if (this.on) this.svgC.setCutOff();
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
            this.downListener();

        });
        window.addEventListener('mousemove', () => {
            this.moveListener();
        });
        window.addEventListener('mouseup', () => {  //click / end of drag detection
            this.upListener()
        });



        this.svgC.svg.addEventListener('touchstart', (event) => {
            event.preventDefault();
            this.svgC.listenEvent(event);
            this.downListener();
        });
        window.addEventListener('touchmove', () => {
            this.moveListener();
        });
        window.addEventListener('touchend', () => {
            this.upListener()
        });
    }

    downListener() {
        if (!this.on) return;

        this.mouseDown = true;

        this.ellipse = document.createElementNS(this.svgC.svgNS, 'ellipse');

        this.ellipse.setAttribute('fill', 'white');
        this.ellipse.setAttribute('opacity', '0.9');
        this.ellipse.setAttribute('filter', 'url(#blurFilter)');

        var el = this.ellipse;

        el.addEventListener("click", () => {
            this.doubleClickListener(el)
        });
        el.addEventListener("touchend", () => {
            this.doubleClickListener(el)
        });

        this.svgC.svg.appendChild(this.ellipse);
        //starting coordinates
        this.startX = this.svgC.mouseX;
        this.startY = this.svgC.mouseY;

        this.click = true;

        this.timer = setTimeout(() => {
            this.click = false;
        }, this.DELAY);
    }

    doubleClickListener(el) {
        if (!this.on) {
            return;
        }

        if (this.touchTime === 0) {
            this.touchTime = new Date().getTime();
        } else {
            if (((new Date().getTime()) - this.touchTime) < 800) {
                el.remove();
                this.svgC.svgEllipses.splice(this.svgC.svgEllipses.indexOf(el), 1);

                this.updateCutout();
                this.touchTime = 0;
            } else {
                this.touchTime = new Date().getTime();
            }
        }
    }

    moveListener() {
        if (!this.on || !this.mouseDown) {
            return;
        }

        var width = Math.abs(this.startX - this.svgC.mouseX);
        var height = Math.abs(this.startY - this.svgC.mouseY);

        this.ellipse.setAttribute('cx', (this.startX + this.svgC.mouseX + 5) / 2); // '5' for blur edge
        this.ellipse.setAttribute('cy', (this.startY + this.svgC.mouseY + 5) / 2);
        this.ellipse.setAttribute('rx', width / 2);
        this.ellipse.setAttribute('ry', height / 2);
    }

    upListener() {
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
        this.updateCutout();
    }

    registerCutout(cutout) {
        this.cutouts.push(cutout);
    }

    updateCutout(){
        for (var i = 0; i < this.cutouts.length; i++) {
            this.cutouts[i].doDefaultCutout();
        }
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

