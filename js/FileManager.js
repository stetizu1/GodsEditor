class FileManager {
    constructor(svgControllerInstance, loadId, galleryId, cutoutStartId, cutoutConfirmId, titleId, canvasContainerId, downloadContainerId) {
        this.svgC = svgControllerInstance;

        this.empty = true;
        this.active = -1; // currently on svg
        this.main = 0; // on title
        this.i = 0; // count + deleted
        this.count = 0; //actual count

        this.gallery = document.getElementById(galleryId);
        this.gallerySave = [];

        this.mainCutouts = [];
        this.cutoutStartId = cutoutStartId;
        this.cutoutConfirm = document.getElementById(cutoutConfirmId);
        this.cutoutConfirm.style.display = "none";
        this.cutoutOn = false;

        this.downloadContainer = document.getElementById(downloadContainerId);

        this._setUseAsATitle(titleId);

        this.canvasContainer = document.getElementById(canvasContainerId);
        this.input = document.getElementById(loadId);

        this.input.addEventListener('change', () => {
            this._selectFile();
        });
    }

    _setUseAsATitle(titleId) {
        const useButton = document.getElementById(titleId);
        useButton.addEventListener('click', () => {
            this.main = this.active;
            this.resetCanvases();
        });
    }

    _selectFile() {
        if (this.input.files.length === 0) return; //return if none selected

        const file = this.input.files[0];
        const fr = new FileReader();

        fr.onload = () => {
            const image = new Image();
            image.onload = () => { //set attributes for svg image
                if (image.width < ImageLimits.MIN_WIDTH || image.height < ImageLimits.MIN_HEIGHT) {
                    alert(Messages.tooSmall);
                    return;
                }

                this.svgC.rotation = 0;
                this.setCutOff(); //turns off cutout
                this.svgC.clear(); //clear old image
                this.svgC.drawImg(image);

                let screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
                this.svgC.circleSize = screenWidth >= 980 ? '10' : '20';

                window.addEventListener('resize', () => {
                    this.svgC.redrawImage(image);
                    this.svgC.setCutOff();
                    screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
                    this.svgC.circleSize = screenWidth >= 980 ? '10' : '20';
                });

                this.active++;
                this._addGalleryItem(image, this.i);

                if (this.empty) {
                    for (let i = 0; i < this.mainCutouts.length; i++) {
                        this.mainCutouts[i].doDefaultCutout();
                    }
                    this.empty = false;
                }

                this.count++;
                this.i++;
            };
            // noinspection JSValidateTypes
            image.src = fr.result;

        };   // onload fires after reading is complete

        fr.readAsDataURL(file); // result is a string with a data: URL representing the file's data
    }

    _addCutoutItem(id, btnId, width, height) {
        const ci = document.createElement("div");
        ci.classList.add("cutoutItem");

        const bt = document.createElement("button");
        bt.id = btnId;
        bt.classList.add("button");
        bt.innerText = "Upravit výřez";

        const gi = document.createElement("div");
        gi.classList.add("galleryItem");
        gi.id = "galleryMin" + id;
        gi.style.width = width + "px";
        gi.style.height = height + "px";

        const sp = document.createElement("span");
        sp.classList.add("mini");
        sp.innerText = width + "×" + height + " px";

        ci.appendChild(bt);
        ci.appendChild(gi);
        ci.appendChild(sp);
        this.cutGallery.appendChild(ci);
        return gi;

    }

    _addGalleryItem(image, id) {
        const galleryContainer = document.createElement("div");
        galleryContainer.classList.add("gallery-container");

        const gi = document.createElement("div");
        gi.classList.add("galleryItem");
        gi.id = "gallery" + id;
        gi.style.height = "160px";
        gi.style.width = "110px";

        this._addButtons(galleryContainer, gi);
        this.gallery.appendChild(galleryContainer);
        this._registerGalleryItem(image, id, gi);
    }

    _addButtons(container, gi) {
        const leftButton = document.createElement("button");
        const rightButton = document.createElement("button");
        leftButton.innerHTML = "&laquo;";
        rightButton.innerHTML = "&raquo;";

        this._addButtonsOrderFunctionality(container, leftButton, rightButton);

        container.appendChild(leftButton);
        container.appendChild(gi);
        container.appendChild(rightButton);
    }

    _addButtonsOrderFunctionality(container, leftButton, rightButton){
        container.style.order = (this.count).toString();

        const changeOrder = (oldO, newO) => {
            const children = this.gallery.childNodes;
            for (let i = 0; i < children.length; i++)
                if (children[i].style.order === newO.toString()) {
                    children[i].style.order = oldO.toString();
                    break;
                }
            container.style.order = (newO).toString();
        };

        leftButton.addEventListener("click", () => {
            const oldOrder = parseInt(container.style.order);
            if (oldOrder > 0) changeOrder(oldOrder, oldOrder - 1);
        });

        rightButton.addEventListener("click", () => {
            const oldOrder = parseInt(container.style.order);
            if (oldOrder < this.count - 1) changeOrder(oldOrder, oldOrder + 1);
        });
    }

    _registerGalleryItem(image, id, gi) {
        const canC = new CanvasController(this.canvasContainer, "full", this.i, this.svgC, ImageLimits.MAX_WIDTH, ImageLimits.MAX_HEIGHT);
        canC.setCanvasSave(this.downloadContainer, "file" + this.i);

        const canCutC = new CanvasController(gi, 'cutout', id, this.svgC, ImageLimits.MIN_WIDTH, ImageLimits.MIN_HEIGHT);
        const cutout = new Cutout(this.svgC, this, canCutC, 480, 320, 640, this.cutoutStartId,"gallery" + id, id);

        this.gallerySave.push(new ItemSave(image, canC, canCutC, cutout));

        this.drawImageOnCanvas(this.gallerySave[this.active].drawCanvas);
        cutout.doDefaultCutout();
    }

    drawImageOnCanvas(canvasC) {
        canvasC.drawAll(this.gallerySave[this.active].image);
    }

    resetCanvases() {
        this.drawImageOnCanvas(this.gallerySave[this.active].drawCanvas);

        if (this.active === this.main) {
            for (let i = 0; i < this.mainCutouts.length; i++) {
                this.mainCutouts[i].doDefaultCutout();
                this.mainCutouts[i].fmId = this.main;
            }
        }
        this.gallerySave[this.active].cutout.doDefaultCutout();
    }

    registerMainCutouts(galleryId, cutouts) {
        this.cutGallery = document.getElementById(galleryId);
        for (let i = 0; i < cutouts.length; i++) {
            const width = cutouts[i]["width"];
            const height = cutouts[i]["height"];
            const id = cutouts[i]["id"];

            const gi = this._addCutoutItem(i + 1, id, width, height);
            const canvasC = new CanvasController(gi, 'cutoutMin', (i + 1), this.svgC, width, height);

            const cutout = new Cutout(this.svgC, this, canvasC, height, width, width, id,"galleryMin" + (i + 1), 0);

            this.mainCutouts.push(cutout);
        }
    }

    setCutOff() {
        if (this.svgC.rectGroup != null) {
            this.svgC.rectGroup.remove();
            this.svgC.rectGroup = null;
            this.cutoutOn = false;
        }
        this.cutoutConfirm.style.display = "none";
    }
    setCutOn(){
        this.cutoutOn = true;
        this.cutoutConfirm.style.display = "block";
    }

}
