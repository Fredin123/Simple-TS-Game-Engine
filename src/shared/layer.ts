import { objectMetaData } from "../developerTools/src/objectMetaData";


export class layer{
    layerName: string;
    metaObjectsInLayer: Array<objectMetaData> = [];
    zIndex: number;
    hidden: boolean = false;
    settings: string = "{\"scrollSpeedX\": 1, \"scrollSpeedY\": 1}";

    constructor(layerName: string, zIndex: number){
        this.layerName = layerName;
        this.zIndex = zIndex;
    }

}