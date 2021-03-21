import { subTileMeta } from "./subTileMeta";


export class tileAnimation{
    name: string = "";
    tiles: subTileMeta[];

    movementSpeed: number = 30;
    animationFunction: ((itt: number) => number[]) | undefined;
    rotationFunction: ((itt: number) => number) | undefined;


    constructor(tiles: subTileMeta[] = []){
        this.tiles = tiles;
    }

    static initFromJsonGeneratedObj(obj: tileAnimation){
        let realObject = new tileAnimation(obj.tiles);
        realObject.name = obj.name;
        return realObject;
    }

    get(index: number){
        return this.tiles[index % this.tiles.length];
    }

    getAllTiles(){
        return this.tiles;
    }
}