class ItemSave {
    constructor(image, canvasController, canvasCutoutController, cutout, container) {
        this.image = image;
        this.drawCanvas = canvasController;
        this.canvasCutC = canvasCutoutController;
        this.cutout = cutout;

        this.orderConainer = container;

        //from svg
        this.ellipses = [];
        this.rotation = [];
    }

    update(ellipses, rotation) {
        this.ellipses = ellipses;
        this.rotation = rotation;
    }
}