import { subTileMeta } from "./subTileMeta";


export class tileAnimation{
    name: string = "";
    tiles: subTileMeta[];

    animationSpeed: number = 0.5;
    animationFunction: ((itt: number) => number[]) | undefined;
    rotationFunction: ((itt: number) => number) | undefined;


    constructor(tiles: subTileMeta[] = []){
        this.tiles = tiles;
    }

    static initFromJsonGeneratedObj(obj: tileAnimation){
        let realObject = new tileAnimation(obj.tiles);
        realObject.name = obj.name;
        realObject.animationSpeed = obj.animationSpeed;
        return realObject;
    }

    get(index: number){
        let animFrames = 60*this.animationSpeed;
        if(index > 0){
            index = Math.floor(index/animFrames) % this.tiles.length;
            if(isNaN(index)){
                index = 0;
            }
        }
        return this.tiles[index];
    }

    getAllTiles(){
        return this.tiles;
    }
}