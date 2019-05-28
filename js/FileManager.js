class FileManager {
    constructor(svgControllerInstance, loadId, galleryId, cutoutStartId, cutoutConfirmId, titleId, canvasContainerId, downloadContainerId) {
        this.svgC = svgControllerInstance;

        this.active = -1; // currently on svg
        this.main = 0; // on title
        this.count = 0; //actual count

        this.gallery = document.getElementById(galleryId);
        this.gallerySave = [];

        this.mainCutouts = [];
        this.cutoutStartId = cutoutStartId;
        this.cutoutConfirm = document.getElementById(cutoutConfirmId);
        this.cutoutConfirm.style.display = "none";
        this.cutoutOn = false;

        const screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
        this.svgC.circleSize = screenWidth >= 980 ? '10' : '20';

        this.downloadContainer = document.getElementById(downloadContainerId);

        this._setUseAsATitle(titleId);

        this.canvasContainer = document.getElementById(canvasContainerId);
        this.input = document.getElementById(loadId);

        this.input.addEventListener('change', () => {
            this._selectFile();
        });

        //on window resize
        window.addEventListener('resize', () => {
            if(this._empty())return;
            this.svgC.redrawImage(this.gallerySave[this.active].image);
            this.setCutOff();
            const screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
            this.svgC.circleSize = screenWidth >= 980 ? '10' : '20';
        });
    }

    _empty() {
        return this.count === 0;
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
                if (image.width < NumberConstants.MIN_WIDTH || image.height < NumberConstants.MIN_HEIGHT)
                    alert(TextConstants.tooSmall);
                else
                    this._addImage(image);
            };
            // noinspection JSValidateTypes
            image.src = fr.result;

        };   // onload fires after reading is complete

        fr.readAsDataURL(file); // result is a string with a data: URL representing the file's data
    }

    _addImage(image){
        if(!this._empty()){
            //save svg state for reactivation
            this.gallerySave[this.active].update(this.svgC.svgEllipses, this.svgC.rotation);
        }

        //restart svg
        this.setCutOff(); //turns off cutout
        this.svgC.clear(); //clear old image
        this.svgC.drawImg(image);

        this.active = this.count; //active index = old count
        this._addGalleryItem(image, this.count);

        if (this._empty()) {
            for (let i = 0; i < this.mainCutouts.length; i++) {
                this.mainCutouts[i].doDefaultCutout();
            }
        }

        this.count++;
    }

    _addMainCutoutItem(id, btnId, width, height) {
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
        this._addClickAction(gi);
        this.gallery.appendChild(galleryContainer);
        this._registerGalleryItem(image, id, gi, galleryContainer);
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

    _addButtonsOrderFunctionality(container, leftButton, rightButton) {
        container.style.order = (this.count).toString();

        const changeOrder = (oldO, newO) => {
            [this.gallerySave[oldO], this.gallerySave[newO]] = [this.gallerySave[newO], this.gallerySave[oldO]];
            this._refreshIndexes();
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

    _addClickAction(gi) {
        gi.addEventListener("click", () => {
            const newActive = parseInt(gi.parentElement.style.order);
            if(this.active === newActive) return;

            this.gallerySave[this.active].update(this.svgC.svgEllipses, this.svgC.rotation);

            this.active = newActive;

            this.svgC.clear();
            this.svgC.drawImg(this.gallerySave[this.active].image);

            this.svgC.rotation = this.gallerySave[this.active].rotation;
            Rotator.setRotation(this.svgC);

            this.svgC.svgEllipses = this.gallerySave[this.active].ellipses;
            this.svgC.drawEllipses();

        });
    }

    _registerGalleryItem(image, id, gi, container) {
        const canC = new CanvasController(this.canvasContainer, "full", this.count, this.svgC, NumberConstants.MAX_WIDTH, NumberConstants.MAX_HEIGHT);
        canC.setCanvasSave(this.downloadContainer, "file" + this.count, this.count);

        const canCutC = new CanvasController(gi, 'cutout', id, this.svgC, NumberConstants.MIN_WIDTH, NumberConstants.MIN_HEIGHT);
        const cutout = new Cutout(this.svgC, this, canCutC, 480, 320, 640, this.cutoutStartId, "gallery" + id, id);

        this.gallerySave.push(new ItemSave(image, canC, canCutC, cutout, container));

        this.drawImageOnCanvas(this.gallerySave[this.active].drawCanvas);
        cutout.doDefaultCutout();
    }

    _refreshIndexes() {
        for (let i = 0; i < this.gallerySave.length; i++) {
            this.gallerySave[i].orderConainer.style.order = i.toString();
            this.gallerySave[i].orderConainer.id = "gallery" + i;
            this.gallerySave[i].canvasCutC.canvas.id = "cutout" + i;
            this.gallerySave[i].drawCanvas.canvas.id = "cutout" + i;
            this.gallerySave[i].drawCanvas.fileName = "file" + i;
            this.gallerySave[i].drawCanvas.reloadFileSave(i);
        }
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

            const gi = this._addMainCutoutItem(i + 1, id, width, height);
            const canvasC = new CanvasController(gi, 'cutoutMin', (i + 1), this.svgC, width, height);

            const cutout = new Cutout(this.svgC, this, canvasC, height, width, width, id, "galleryMin" + (i + 1), 0);

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

    setCutOn() {
        this.cutoutOn = true;
        this.cutoutConfirm.style.display = "block";
    }
}
