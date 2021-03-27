import { objectMetaData } from "../developerTools/src/objectMetaData";


export class layer{
    layerName: string;
    metaObjectsInLayer: Array<objectMetaData> = [];
    zIndex: number;
    hidden: boolean = false;


    constructor(layerName: string, zIndex: number){
        this.layerName = layerName;
        this.zIndex = zIndex;
    }

}