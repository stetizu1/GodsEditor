class FileManager {
    /**
     * File manager manages image input, full size canvas save and all cutouts
     * @param svgControllerId - id of svg element
     * @param loadId - id of button for image load
     * @param galleryId - id of photo gallery
     * @param cutoutStartId - id of button to start basic cutout
     * @param cutoutConfirmId - id of button to start confirm all cutout
     * @param titleId - id of button that sets photo as a title photo
     * @param deleteId - id of button that deletes current picture
     * @param canvasContainerId - id of container for full-size canvases
     * @param downloadContainerId - id of container for edited-image save
     * @param deleteAllId - id of button for delete all
     * @param deleteAllOthersId - id of button for delete all except main
     */
    constructor(svgControllerId, loadId, galleryId, cutoutStartId, cutoutConfirmId, titleId, deleteId, canvasContainerId, downloadContainerId, deleteAllId, deleteAllOthersId) {
        this.svgC = new SVGController(svgControllerId);

        this.active = -1; // currently on svg
        this.main = 0; // on title
        this.count = 0; //actual count

        this.gallery = document.getElementById(galleryId);
        this.gallery.style.display = 'flex';
        this.gallerySave = [];

        this.mainCutouts = [];
        this.cutoutStartId = cutoutStartId;
        this.cutoutConfirm = document.getElementById(cutoutConfirmId);

        this.cutoutConfirm.classList.add(TextConstants.cutoutOffClass);
        this.cutoutOn = false;

        this._setCircleSize();

        this.downloadContainer = document.getElementById(downloadContainerId);

        this._setUseAsATitle(titleId);
        this._setDeleteCurrent(deleteId);
        this._setDeleteAll(deleteAllId);
        this._setDeleteAllOthers(deleteAllOthersId);

        this.canvasContainer = document.getElementById(canvasContainerId);
        this.input = document.getElementById(loadId);

        this.input.addEventListener('change', () => {
            this._selectFile();
        });

        //on window resize
        window.addEventListener('resize', () => {
            if (this.empty()) return;
            this.svgC.redrawImage(this.gallerySave[this.active].image);
            this.setCutOff();
            this._setCircleSize();
        });
    }

    _setCircleSize() {
        const screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
        this.svgC.circleSize = screenWidth >= NumberConstants.SCREEN_WIDTH_LIMIT ? NumberConstants.SMALL_CIRCLE_R : NumberConstants.BIG_CIRCLE_R;
    }

    _setUseAsATitle(titleId) {
        const useButton = document.getElementById(titleId);
        useButton.addEventListener('click', () => {
            this._changeOrder(this.active, 0);
            this.resetCanvases(false);
            this.cutGallery.classList.add(TextConstants.galleryActiveClass);
        });
    }

    _setDeleteCurrent(deleteId) {
        const deleteButton = document.getElementById(deleteId);
        deleteButton.addEventListener('click', () => {
            this._delete(this.active);
        })
    }

    _setDeleteAll(deleteAllId) {
        const deleteButton = document.getElementById(deleteAllId);
        deleteButton.addEventListener('click', () => {
            for (let i = this.count - 1; i >= 0; i--) this._delete(i);

        });
    }

    _setDeleteAllOthers(deleteAOId) {
        const deleteButton = document.getElementById(deleteAOId);
        deleteButton.addEventListener('click', () => {
            this._setActive(this.main);
            for (let i = this.count - 1; i > 0; i--) this._delete(i);
        });
    }

    _delete(index) {
        if (this.empty()) return;

        //reset input for adding again
        this.input.value = '';
        if(!/safari/i.test(navigator.userAgent)){
            this.input.type = '';
            this.input.type = 'file';
        }

        if (this.count === 1) {
            this.setCutOff(); //turns off cutout
            this.svgC.clear(); //clear old image
            this.svgC.svg.removeChild(this.svgC.svgImg);
            this.svgC.initImage();
            this.svgC.svg.style.height = '0';
        }
        if (index === this.active && this.count >= 2) {
            if (this.active !== 0) this._setActive(0);
            else {
                this._setActive(1);
                this.active = 0;
            }
        } else if (index === this.active) {
            this.active = -1;
        }

        this.count--;

        this.gallerySave[index].cutout.removeListeners();
        this.gallerySave.splice(index, 1);

        const gallCN = this.gallery.childNodes;
        const downloadContCN = this.downloadContainer.childNodes;

        //delete element
        for (let i = 0; i < gallCN.length; i++) {
            const order = parseInt(gallCN[i].style.order);
            if (order === index) {
                this.gallery.removeChild(gallCN[i]);
                this.downloadContainer.removeChild(downloadContCN[i]);
                break;
            }
        }

        //repair order
        for (let i = 0; i < gallCN.length; i++) {
            const order = parseInt(gallCN[i].style.order);
            if (order >= index) {
                gallCN[i].style.order = (order - 1).toString();
                downloadContCN[i].style.order = (order - 1).toString();
                this.gallerySave[order - 1].cutout.fmId = order - 1;
            }
        }


        if (index === this.main) {
            if (!this.empty()) {
                for (let i = 0; i < this.mainCutouts.length; i++) this.mainCutouts[i].doDefaultCutout();
                this.cutGallery.classList.add(TextConstants.galleryActiveClass);
            } else {
                for (let i = 0; i < this.mainCutouts.length; i++) {
                    this.mainCutouts[i].canvasC.canvasCtx.clearRect(0, 0, this.mainCutouts[i].canvasC.canvas.width, this.mainCutouts[i].canvasC.canvas.height);
                    this.mainCutouts[i].canvasC.canvasCtx.clearRect(0, 0, this.mainCutouts[i].canvasC.canvas.height, this.mainCutouts[i].canvasC.canvas.width);
                }
                this.cutGallery.classList.remove(TextConstants.galleryActiveClass);

            }
        }
        this._refreshButtonClass();
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

    _addImage(image) {
        if (!this.empty()) {
            //save svg state for reactivation
            this.gallerySave[this.active].update(this.svgC.svgEllipses, this.svgC.rotation);
        }

        //restart svg
        this.setCutOff(); //turns off cutout
        this.svgC.clear(); //clear old image
        this.svgC.drawImg(image);

        const oldActive = this.active;
        this.active = this.count; //active index = old count
        this._addGalleryItem(image, this.count);

        if (this.empty()) {
            for (let i = 0; i < this.mainCutouts.length; i++) {
                this.mainCutouts[i].doDefaultCutout();
            }
            this.cutGallery.classList.add(TextConstants.galleryActiveClass);
        } else {
            this.gallerySave[oldActive].orderConainer.classList.remove(TextConstants.activeClass);
            this.cutGallery.classList.remove(TextConstants.galleryActiveClass);
        }
        this.gallerySave[this.active].orderConainer.classList.add(TextConstants.activeClass);

        this.count++;
    }

    _addMainCutoutItem(id, btnId, width, height) {
        const ci = document.createElement('div');
        ci.classList.add(TextConstants.mainCutoutOuterDivClass);

        const bt = document.createElement('button');
        bt.type = 'button';
        bt.id = btnId;
        bt.classList.add(TextConstants.buttonClass);
        bt.innerText = TextConstants.cutoutButtonText;
        bt.addEventListener('click', () => {
            this._setActive(this.main);
        });

        const gi = document.createElement('div');
        gi.classList.add(TextConstants.mainCutoutInnerDivClass);
        gi.style.width = width + 'px';
        gi.style.height = height + 'px';

        const sp = document.createElement('span');
        sp.classList.add(TextConstants.smallTextClass);
        sp.innerText = width + '×' + height + ' px';

        ci.appendChild(bt);
        ci.appendChild(gi);
        ci.appendChild(sp);
        this.cutGallery.appendChild(ci);
        return gi;

    }

    _addGalleryItem(image, id) {
        const galleryContainer = document.createElement('div');
        galleryContainer.classList.add(TextConstants.galleryOuterDivClass);

        const gi = document.createElement('div');
        gi.classList.add(TextConstants.galleryInnerDivClass);
        gi.style.height = NumberConstants.GALLERY_CUTOUT_DEFAULT_HEIGHT + 'px';
        gi.style.width = NumberConstants.GALLERY_CUTOUT_DEFAULT_WIDTH + 'px';

        this._addButtons(galleryContainer, gi);
        this._addClickAction(gi);
        this.gallery.appendChild(galleryContainer);
        this._registerGalleryItem(image, id, gi, galleryContainer);
        this._refreshButtonClass();
    }

    _addButtons(container, gi) {
        const leftButton = document.createElement('button');
        const rightButton = document.createElement('button');
        leftButton.type = 'button';
        rightButton.type = 'button';
        leftButton.innerHTML = TextConstants.leftButtonText;
        rightButton.innerHTML = TextConstants.rightButtonText;

        this._addButtonsOrderFunctionality(container, leftButton, rightButton);

        container.appendChild(leftButton);
        container.appendChild(gi);
        container.appendChild(rightButton);
    }

    _addButtonsOrderFunctionality(container, leftButton, rightButton) {
        container.style.order = (this.count).toString();

        leftButton.addEventListener('click', () => {
            const oldOrder = parseInt(container.style.order);
            if (oldOrder > 1) this._changeOrder(oldOrder, oldOrder - 1);
        });

        rightButton.addEventListener('click', () => {
            const oldOrder = parseInt(container.style.order);
            if (oldOrder !== 0 && oldOrder < this.count - 1) this._changeOrder(oldOrder, oldOrder + 1);
        });

    }

    _refreshButtonClass() {
        for (let i = 0; i < this.gallerySave.length; i++) {
            const orderContainer = this.gallerySave[i].orderConainer;
            const order = parseInt(orderContainer.style.order);

            if (order === 0) {
                orderContainer.childNodes[0].classList.add(TextConstants.buttonOffClass);
                orderContainer.childNodes[2].classList.add(TextConstants.buttonOffClass);
            } else {
                if (order === 1) orderContainer.childNodes[0].classList.add(TextConstants.buttonOffClass);
                else orderContainer.childNodes[0].classList.remove(TextConstants.buttonOffClass);

                if (order === this.gallerySave.length - 1) orderContainer.childNodes[2].classList.add(TextConstants.buttonOffClass);
                else orderContainer.childNodes[2].classList.remove(TextConstants.buttonOffClass);
            }
        }
    }

    _changeOrder(oldO, newO) {
        this.gallerySave[oldO].cutout.fmId = newO;
        this.gallerySave[newO].cutout.fmId = oldO;
        [this.gallerySave[oldO], this.gallerySave[newO]] = [this.gallerySave[newO], this.gallerySave[oldO]];
        if (this.active === oldO) this.active = newO;
        else if (this.active === newO) this.active = oldO;

        this._refreshIndexes();
        this._refreshButtonClass();
    }

    _addClickAction(gi) {
        gi.addEventListener('click', () => {
            const newActive = parseInt(gi.parentElement.style.order);
            this._setActive(newActive);

        });
    }

    _setActive(newActive) {
        if (this.active === newActive) return;
        if (newActive === this.main) this.cutGallery.classList.add(TextConstants.galleryActiveClass);
        else this.cutGallery.classList.remove(TextConstants.galleryActiveClass);

        this.gallerySave[this.active].update(this.svgC.svgEllipses, this.svgC.rotation);

        this.gallerySave[this.active].orderConainer.classList.remove(TextConstants.activeClass);
        this.gallerySave[newActive].orderConainer.classList.add(TextConstants.activeClass);

        this.active = newActive;

        this.svgC.clear();
        this.svgC.drawImg(this.gallerySave[this.active].image);

        this.svgC.rotation = this.gallerySave[this.active].rotation;
        Rotator.setRotation(this.svgC);

        this.svgC.svgEllipses = this.gallerySave[this.active].ellipses;
        this.svgC.drawEllipses();
    }

    _registerGalleryItem(image, id, gi, container) {
        const canC = new CanvasController(this.canvasContainer, this.svgC, NumberConstants.MAX_WIDTH, NumberConstants.MAX_HEIGHT);
        canC.setCanvasSave(this.downloadContainer, TextConstants.fileNameBase + this.count, this.count);

        const canCutC = new CanvasController(gi, this.svgC, NumberConstants.MIN_WIDTH, NumberConstants.MIN_HEIGHT);
        const cutout = new Cutout(this, canCutC, NumberConstants.MIN_HEIGHT, NumberConstants.MIN_WIDTH, NumberConstants.MEDIUM_WIDTH, this.cutoutStartId, id);

        this.gallerySave.push(new ItemSave(image, canC, canCutC, cutout, container));

        this.drawImageOnCanvas(this.gallerySave[this.active].drawCanvas);
        cutout.doDefaultCutout();
    }

    _refreshIndexes() {

        for (let i = 0; i < this.gallerySave.length; i++) {
            this.gallerySave[i].orderConainer.style.order = i.toString();
            this.gallerySave[i].drawCanvas.fileName = TextConstants.fileNameBase + i;
            this.gallerySave[i].drawCanvas.reloadFileSave(i);
        }
    }

    empty() {
        return this.count === 0;
    }

    drawImageOnCanvas(canvasC) {
        canvasC.drawAll(this.gallerySave[this.active].image);
    }

    drawCutoutOnCanvas(canvasC, width, height) {
        canvasC.widthLimit = width;
        canvasC.heightLimit = height;
        canvasC.drawAll(this.gallerySave[this.active].image);
    }

    resetCanvases(redrawAll) {
        if (this.empty()) return;

        if (this.active === this.main) {
            for (let i = 0; i < this.mainCutouts.length; i++) {
                this.mainCutouts[i].doDefaultCutout();
                this.mainCutouts[i].fmId = this.main;
            }
        }

        if (redrawAll) {
            this.drawImageOnCanvas(this.gallerySave[this.active].drawCanvas);
            this.gallerySave[this.active].cutout.doDefaultCutout();
        }
    }

    registerMainCutouts(galleryId, cutouts) {
        this.cutGallery = document.getElementById(galleryId);
        for (let i = 0; i < cutouts.length; i++) {
            const width = cutouts[i][TextConstants.width];
            const height = cutouts[i][TextConstants.height];
            const id = cutouts[i][TextConstants.id];

            const gi = this._addMainCutoutItem(i + 1, id, width, height);
            const canvasC = new CanvasController(gi, this.svgC, width, height);

            const cutout = new Cutout(this, canvasC, height, width, width, id, 0);

            this.mainCutouts.push(cutout);
        }
    }

    setCutOff() {
        this.cutoutOn = false;
        cutout_last_clicked_button = null;
        if (this.svgC.rectGroup != null) {
            this.svgC.rectGroup.remove();
            this.svgC.rectGroup = null;
        }
        this.cutoutConfirm.classList.remove(TextConstants.cutoutOnClass);
        this.cutoutConfirm.classList.add(TextConstants.cutoutOffClass);
    }

    setCutOn() {
        this.cutoutOn = true;
        this.cutoutConfirm.classList.remove(TextConstants.cutoutOffClass);
        this.cutoutConfirm.classList.add(TextConstants.cutoutOnClass);
    }

    setActiveItemChanged() {
        if (this.active !== -1) {
            this.gallerySave[this.active].changed = true;
        }
    }

    isItemChanged(i) {
        if (this.active !== -1)
            return this.gallerySave[this.active].changed;
        return -1;
    }
}
