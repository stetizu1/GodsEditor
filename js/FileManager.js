class FileManager {
    constructor(svgControllerInstance, canvasControllerInstance, main) {
        this.svgC = svgControllerInstance;
        this.canvasC = canvasControllerInstance;
        this.image = null;
        this.mainInstance = main;
        this.cutouts = [];
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
                        if (this.mainInstance) alert(Messages.tooSmall);
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
                    for (var i = 0; i < this.cutouts.length; i++){
                        this.cutouts[i].doDefaultCutout();
                    }
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

    registerCutout(cutout){
        this.cutouts.push(cutout);
    }
}
