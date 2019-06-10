class ItemSave {
    /**
     * Saves parameters of images
     * @param image - original image
     * @param canvasController - canvas Controller instance for full size
     * @param canvasCutoutController - canvas Controller instance for cutout
     * @param cutout - Cutout instance
     * @param container - div for gallery order
     */
    constructor(image, canvasController, canvasCutoutController, cutout, container) {
        this.image = image;
        this.drawCanvas = canvasController;
        this.canvasCutC = canvasCutoutController;
        this.cutout = cutout;

        this.orderConainer = container;

        this.changed = false;

        //from svg
        this.ellipses = [];
        this.rotation = [];
    }

    update(ellipses, rotation) {
        this.ellipses = ellipses;
        this.rotation = rotation;
    }
}