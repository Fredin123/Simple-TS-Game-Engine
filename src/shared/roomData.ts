import { layer } from "./layer";

export class roomData{
    layerData:layer[];
    cameraBoundsX: number | null = null;
    cameraBoundsY: number | null = null;
    cameraBoundsWidth: number | null = null;
    cameraBoundsHeight: number | null = null;

    backgroundColor: string = "#FFFFFF";

    constructor(layerData:layer[]){
        this.layerData = layerData;
    }



}