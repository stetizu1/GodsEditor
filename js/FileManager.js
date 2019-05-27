class FileManager {
    constructor(svgControllerInstance, canvasControllerInstance, galleryId, cutoutStartId, cutoutConfirmId, titleId) {
        this.svgC = svgControllerInstance;
        this.canvasC = canvasControllerInstance;

        this.canvasCCutouts = [];
        this.mainCutouts = [];

        this.active = -1;
        this.main = 0;
        this.image = null;

        this.gallery = document.getElementById(galleryId);
        this.galleryCanvases = [];
        this.galleryCutouts = [];

        this.empty = true;
        this.i = 0;
        this.count = 0;

        this.cutoutStartId = cutoutStartId;
        this.cutoutConfirmId = cutoutConfirmId;
        this.useAsATitle(titleId);

    }

    useAsATitle(titleId) {
        var useButton = document.getElementById(titleId);
        useButton.addEventListener('click', () => {
            this.main = this.active;

            this.resetCutouts();
        });

    }

    selectFile(inputId) {
        this.input = document.getElementById(inputId);
        this.input.addEventListener('change', () => {
            if (this.input.files.length === 0) return; //return if none selected

            var file = this.input.files[0];
            var fr = new FileReader();

            fr.onload = () => {
                this.image = new Image();
                this.image.onload = () => { //set attributes for svg image
                    if (this.image.width < ImageLimits.MIN_WIDTH || this.image.height < ImageLimits.MIN_HEIGHT) {
                        alert(Messages.tooSmall);
                        return;
                    }

                    this.svgC.rotation = 0;
                    this.svgC.clear(); //clear old image
                    this.svgC.drawImg(this.image);

                    var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
                    this.svgC.circleSize = screenWidth >= 980 ? '10' : '20';

                    window.addEventListener('resize', () => {
                        this.svgC.redrawImage(this.image);
                        this.svgC.setCutOff();
                        var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
                        this.svgC.circleSize = screenWidth >= 980 ? '10' : '20';
                    });
                    if (this.empty) {
                        for (var i = 0; i < this.mainCutouts.length; i++) {
                            this.mainCutouts[i].doDefaultCutout();
                        }
                        this.empty = false;
                    }

                    this.addGalleryItem(this.i);
                    this.registerGalleryItem(this.i);
                    this.i++;
                    this.active++;
                };
                this.image.src = fr.result;

            };   // onload fires after reading is complete

            fr.readAsDataURL(file); // result is a string with a data: URL representing the file's data
        });
    }

    resetCutouts() {
        if (this.active === this.main) {
            for (var i = 0; i < this.mainCutouts.length; i++) {
                this.mainCutouts[i].doDefaultCutout();
                this.mainCutouts[i].fmId = this.main;
            }
        }
        this.galleryCutouts[this.active].doDefaultCutout();
    }

    addCutoutItem(id, btnId, width, height) {
        var ci = document.createElement("div");
        ci.classList.add("cutoutItem");

        var bt = document.createElement("button");
        bt.id = btnId;
        bt.classList.add("button");
        bt.innerText = "Upravit výřez";

        var gi = document.createElement("div");
        gi.classList.add("galleryItem");
        gi.id = "galleryMin" + id;
        gi.style.width = width + "px";
        gi.style.height = height + "px";

        var can = document.createElement("canvas");
        can.id = "cutoutMin" + id;
        can.classList.add("cutout");
        gi.appendChild(can);

        var sp = document.createElement("span");
        sp.classList.add("mini");
        sp.innerText = width + "×" + height + " px";

        ci.appendChild(bt);
        ci.appendChild(gi);
        ci.appendChild(sp);
        this.cutGallery.appendChild(ci);

    }

    addGalleryItem(id) {
        var itemDiv = document.createElement("div");
        itemDiv.classList.add("gallery-container");

        var gi = document.createElement("div");
        gi.classList.add("galleryItem");
        gi.id = "gallery" + id;
        gi.style.height = "160px";
        gi.style.width = "110px";

        var can = document.createElement("canvas");
        can.id = "cutout" + id;
        can.classList.add("cutout");

        gi.appendChild(can);

        this.addButtons(itemDiv, gi);
        this.gallery.appendChild(itemDiv);
    }

    addButtons(div, gi) {
        div.style.order = this.count;
        this.count++;
        var leftButton = document.createElement("button");
        leftButton.innerHTML = "&laquo;";
        var rightButton = document.createElement("button");
        rightButton.innerHTML = "&raquo;";

        leftButton.addEventListener("click", () => {
            var oldOrder = parseInt(div.style.order);
            if (oldOrder > 0) {
                var children = this.gallery.childNodes;
                for (var i = 0; i < children.length; i++) {
                    if (children[i].style.order === (oldOrder - 1).toString()) {
                        children[i].style.order = oldOrder;
                        break;
                    }
                }
                div.style.order = oldOrder - 1;
            }
        });

        rightButton.addEventListener("click", () => {
            var oldOrder = parseInt(div.style.order);
            var children = this.gallery.childNodes;
            if (oldOrder < children.length - 1) {
                for (var i = 0; i < children.length; i++) {
                    if (children[i].style.order === (oldOrder + 1).toString()) {
                        children[i].style.order = oldOrder;
                        break;
                    }
                }
                div.style.order = oldOrder + 1;
            }
        });

        div.appendChild(leftButton);
        div.appendChild(gi);
        div.appendChild(rightButton);

    }

    registerGalleryItem(id) {
        var cc = new CanvasController('cutout' + id, this.svgC, ImageLimits.MIN_WIDTH, ImageLimits.MIN_HEIGHT);
        this.galleryCanvases.push(cc);
        var cutout = new Cutout(this.svgC, this, cc, 480, 320, 640, this.cutoutStartId, this.cutoutConfirmId, "gallery" + id, id);
        this.galleryCutouts.push(cutout);
        cutout.doDefaultCutout();

    }

    drawImageOnCanvas(saveId) {
        document.getElementById(saveId).addEventListener('click', () => {
            this.canvasC.drawAll(this.image);
        });
    }

    drawImageOnCanvasNow(canvasC) {
        canvasC.drawAll(this.image);

    }

    registerMainCutouts(cutId, cutouts) {
        this.cutGallery = document.getElementById(cutId);
        for (let i = 0; i < cutouts.length; i++) {
            var width = cutouts[i]["width"];
            var height = cutouts[i]["height"];
            var id = cutouts[i]["id"];

            this.addCutoutItem(i + 1, id, width, height);
            this.canvasCCutouts.push(new CanvasController('cutoutMin' + (i + 1), this.svgC, width, height));
            var cutout = new Cutout(this.svgC, this, this.canvasCCutouts[i], height, width, width, id, this.cutoutConfirmId, "galleryMin" + (i + 1), 0);
            this.mainCutouts.push(cutout);
        }
    }
}
