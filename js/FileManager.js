class FileManager {
    constructor(svgControllerInstance, canvasControllerInstances) {
        this.svgC = svgControllerInstance;
        this.canvasesC = canvasControllerInstances;
        this.image = null;
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
                        alert(Messages.tooSmall);
                        return;
                    }

                    this.svgC.rotation = 0;
                    this.svgC.clear(); //clear old image
                    this.svgC.drawImg(this.image);
                    window.addEventListener('resize', () =>{
                        this.svgC.redrawImage(this.image);
                    });
                };
                this.image.src = fr.result;

            };   // onload fires after reading is complete

            fr.readAsDataURL(file); // result is a string with a data: URL representing the file's data
        });
    }

    saveImage(saveId, downloadId, fileName) {
        var save = document.getElementById(saveId);
        var download = document.getElementById(downloadId);

        save.addEventListener('click', () => {
            for(var i = 0; i < this.canvasesC.length; i++){
                this.canvasesC[i].drawAll(this.image, download, fileName);
            }
        });
    }
}
