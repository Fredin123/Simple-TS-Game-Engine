import { subTileMeta } from "../../shared/tile/subTileMeta";
import { tileAnimation } from "../../shared/tile/tileAnimation";


export class objectMetaData{
    x: number;
    y: number;
    name: string;

    tile: tileAnimation | null = null;

    isCombinationOfTiles: boolean = false;

    isPartOfCombination: boolean = false;

    constructor(x: number, y: number, name: string, tile: tileAnimation | null){
        this.x = x;
        this.y = y;
        this.name = name;
        if(tile != null){
            this.tile = tileAnimation.initFromJsonGeneratedObj(tile);
        }
    }




}