import { subTileMeta } from "./tiles/subTileMeta";
import { tileAnimation } from "./tiles/tileAnimation";


export class objectMetaData{
    x: number;
    y: number;
    name: string;

    tile: tileAnimation | null = null;

    constructor(x: number, y: number, name: string, tile: tileAnimation | null){
        this.x = x;
        this.y = y;
        this.name = name;
        if(tile != null){
            this.tile = tileAnimation.initFromJsonGeneratedObj(tile);
        }
    }




}