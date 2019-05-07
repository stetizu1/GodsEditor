class FileManager {
    constructor(svgControllerInstance, canvasControllerInstance, main) {
        this.svgC = svgControllerInstance;
        this.canvasC = canvasControllerInstance;
        this.image = null;
        this.mainInstance = main;
    }

    selectFile(inputId) {
        var input = document.getElementById(inputId);
        input.addEventListener('change', () => {
            if (input.files.length === 0) return; //return if none selected

            var file = input.files[0];
            var fr = new FileReader();

            fr.onload = () => {
                this.image = new Image();
                this.image.onload = () => { //set attributes for svg image
                    if (this.image.width < ImageLimits.MIN_WIDTH || this.image.height < ImageLimits.MIN_HEIGHT) {
                        if (this.mainInstance) alert(Messages.tooSmall);
                        return;
                    }

                    this.svgC.rotation = 0;
                    this.svgC.clear(); //clear old image
                    this.svgC.drawImg(this.image);
                    window.addEventListener('resize', () => {
                        this.svgC.redrawImage(this.image);
                    });
                };
                this.image.src = fr.result;

            };   // onload fires after reading is complete

            fr.readAsDataURL(file); // result is a string with a data: URL representing the file's data
        });
    }

    drawImageOnCanvas(saveId) {
        document.getElementById(saveId).addEventListener('click', () => {
            this.canvasC.drawAll(this.image);
        });
    }

    drawImageOnCanvasNow() {
        this.canvasC.drawAll(this.image);
    }
}
