

export class resourceMeta{
    resourceName: string;
    tileWidth: number;
    tileHeight: number;

    sheet: any;

    constructor(resourceName: string, tileWidth: number, tileHeight: number){
        this.resourceName = resourceName;
        this.tileHeight = tileHeight;
        this.tileWidth = tileWidth;
    }



}