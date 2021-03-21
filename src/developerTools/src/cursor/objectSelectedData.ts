

export class objectSelectedData{
    objectName: string = "";
    objectPlaceWidth: Number = -1;
    objectPlaceHeight: Number = -1;
    objectToPlaceImageUrl: HTMLImageElement = new Image();
    objectMouseImageReady: boolean = false;

    constructor(objectName: string,
    objectPlaceWidth: Number,
    objectPlaceHeight: Number,
    imageSrc: string){
        this.objectName = objectName;
        this.objectPlaceWidth = objectPlaceWidth;
        this.objectPlaceHeight = objectPlaceHeight;
        this.objectToPlaceImageUrl = new Image();
        this.objectToPlaceImageUrl.onload = () => {
            this.objectMouseImageReady = true;
        };
        this.objectToPlaceImageUrl.src = imageSrc;
    }


}