class BlurFace {
    constructor(svgControllerInstance, fileManager, switchId) {
        this.svgC = svgControllerInstance;

        this.on = false;
        this.fileManager = fileManager;

        this._listenToSwitch(switchId);
        this._addEllipse();

        this.touchTime = 0;
    }

    _listenToSwitch(blurId) {
        const blurFace = document.getElementById(blurId);
        blurFace.addEventListener('change', () => {
            this.on = blurFace.checked;
            if (this.on) this.fileManager.setCutOff();
        });
    }


    _addEllipse() {
        this.ellipse = null;
        this.startX = 0;
        this.startY = 0;
        this.click = true;
        this.timer = null;
        this.DELAY = 200;

        this.svgC.svg.addEventListener('mousedown', (event) => {
            event.preventDefault();
            this._downListener();

        });
        window.addEventListener('mousemove', () => {
            this._moveListener();
        });
        window.addEventListener('mouseup', () => {  //click / end of drag detection
            this._upListener()
        });



        this.svgC.svg.addEventListener('touchstart', (event) => {
            event.preventDefault();
            this.svgC.listenEvent(event);
            this._downListener();
        });
        window.addEventListener('touchmove', () => {
            this._moveListener();
        });
        window.addEventListener('touchend', () => {
            this._upListener()
        });
    }

    _downListener() {
        if (!this.on) return;

        this.mouseDown = true;

        this.ellipse = document.createElementNS(this.svgC.svgNS, 'ellipse');

        this.ellipse.setAttribute('fill', '#edac69');
        this.ellipse.setAttribute('filter', 'url(#blurFilter)');

        const el = this.ellipse;

        el.addEventListener('click', () => {
            this._doubleClickListener(el)
        });
        el.addEventListener('touchend', () => {
            this._doubleClickListener(el)
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

    _doubleClickListener(el) {
        if (!this.on) {
            return;
        }

        if (this.touchTime === 0) {
            this.touchTime = new Date().getTime();
        } else {
            if (((new Date().getTime()) - this.touchTime) < 800) {
                el.remove();
                this.svgC.svgEllipses.splice(this.svgC.svgEllipses.indexOf(el), 1);

                this._updateCutout();
                this.touchTime = 0;
            } else {
                this.touchTime = new Date().getTime();
            }
        }
    }

    _moveListener() {
        if (!this.on || !this.mouseDown) {
            return;
        }

        const width = Math.abs(this.startX - this.svgC.mouseX);
        const height = Math.abs(this.startY - this.svgC.mouseY);

        this.ellipse.setAttribute('cx', ((this.startX + this.svgC.mouseX + 5) / 2).toString()); // '5' for blur edge
        this.ellipse.setAttribute('cy', ((this.startY + this.svgC.mouseY + 5) / 2).toString());
        this.ellipse.setAttribute('rx', (width / 2).toString());
        this.ellipse.setAttribute('ry', (height / 2).toString());
    }

    _upListener() {
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
        this._updateCutout();
    }

    _updateCutout(){
        this.fileManager.resetCanvases();
    }

    setOff(buttonId, offButtonIds) {
        const button = document.getElementById(buttonId);
        for(let i = 0; i < offButtonIds.length; i++){
            const offButton = document.getElementById(offButtonIds[i]);
            offButton.addEventListener('click', () => {
                button.checked = false;
                this.on = false;
            });
        }

    }
}

