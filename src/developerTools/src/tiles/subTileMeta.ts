

export class subTileMeta{
    tileName: string = "";

    resourceName: string;
    startX: number;
    startY: number;
    width: number;
    height: number;

    constructor(resourceName: string,
        startX: number,
        startY: number,
        width: number,
        height: number){
            this.resourceName = resourceName;
            this.startX = startX;
            this.startY = startY;
            this.width = width;
            this.height = height;
    }

    clone(){
        return new subTileMeta(this.resourceName, this.startX, this.startY, this.width, this.height);
    }
}