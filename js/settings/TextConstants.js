const tooSmall = "Zvolený obrázek je příliš malý. \nZvolte obrázek o rozměrech alespoň " + NumberConstants.MIN_WIDTH + " x " + NumberConstants.MIN_HEIGHT + " px";
const cutoutButtonText = 'Upravit výřez';

const leftButtonText = '&laquo;',
    rightButtonText = '&raquo;';

const fileNameBase = 'file';

const
    mainCutoutOuterDivClass = 'cutout-container',
    mainCutoutInnerDivClass = 'cutout-item',
    galleryOuterDivClass = 'gallery-container',
    galleryInnerDivClass = 'gallery-item',
    classActive = 'active',
    cutoutOffClass = 'cut-off',
    cutoutOnClass = 'cut-on',
    buttonClass = 'button',
    smallTextClass = 'mini';

const width = 'width',
    height = 'height',
    id = 'id';

class TextConstants {
    static get tooSmall() {
        return tooSmall;
    }

    static get cutoutButtonText() {
        return cutoutButtonText;
    }

    static get leftButtonText() {
        return leftButtonText;
    }

    static get rightButtonText() {
        return rightButtonText;
    }

    static get fileNameBase() {
        return fileNameBase;
    }

    static get mainCutoutOuterDivClass() {
        return mainCutoutOuterDivClass;
    }

    static get mainCutoutInnerDivClass() {
        return mainCutoutInnerDivClass;
    }

    static get galleryOuterDivClass() {
        return galleryOuterDivClass;
    }

    static get galleryInnerDivClass() {
        return galleryInnerDivClass;
    }

    static get classActive() {
        return classActive;
    }

    static get cutoutOffClass() {
        return cutoutOffClass;
    }

    static get cutoutOnClass() {
        return cutoutOnClass;
    }

    static get buttonClass() {
        return buttonClass;
    }

    static get smallTextClass() {
        return smallTextClass;
    }

    static get width() {
        return width;
    }

    static get height() {
        return height;
    }

    static get id() {
        return id;
    }

}