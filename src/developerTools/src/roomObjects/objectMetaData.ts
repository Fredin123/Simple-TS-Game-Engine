
import { tileAnimation } from "../../../shared/tile/tileAnimation";


export class objectMetaDataold{
    x: number;
    y: number;
    name: string;
    inputString: string = "";

    tile: tileAnimation | null = null;

    isCombinationOfTiles: boolean = false;

    idOfStaticTileCombination: string = "";

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