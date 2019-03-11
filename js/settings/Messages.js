const tooSmall = "Zvolený obrázek je příliš malý. \nZvolte obrázek o rozměrech alespoň " + ImageLimits.MIN_WIDTH + " x " + ImageLimits.MIN_HEIGHT + " px";

class Messages {
    static get tooSmall() {
        return tooSmall;
    }
}