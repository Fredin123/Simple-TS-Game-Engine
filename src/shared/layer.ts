import { geomObjData } from "../developerTools/src/roomObjects/geomObjData";
import { IObjectMeta } from "./IObjectMeta";

export class layer{
    layerName: string;
    metaObjectsInLayer: Array<IObjectMeta> = [];
    geometriesInLayer: geomObjData[] = [];
    zIndex: number;
    hidden: boolean = false;
    settings: string = "{\"scrollSpeedX\": 1, \"scrollSpeedY\": 1}";

    constructor(layerName: string, zIndex: number){
        this.layerName = layerName;
        this.zIndex = zIndex;
    }

}