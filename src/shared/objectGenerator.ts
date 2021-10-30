//{NEW IMPORTS START HERE}
import { movingBlockHori } from "../objects/blocks/movingBlockHori";
import { movingBlockVert } from "../objects/blocks/movingBlockVert";
import { collisionSlopeLeft } from "../objects/blocks/polygons/collisionSlopeLeft";
import { collisionSlopeRight } from "../objects/blocks/polygons/collisionSlopeRight";
import { block } from "../objects/blocks/static blocks/block";
import { block32x64 } from "../objects/blocks/static blocks/block32x64";
import { block64x32 } from "../objects/blocks/static blocks/block64x32";
import { tinyBlock32 } from "../objects/blocks/tinyBlock32";
import { wideBlock } from "../objects/blocks/wideBlock";
import { dummySandbag } from "../objects/dummySandbag";
import { grass } from "../objects/environment/grass";
import { ladder } from "../objects/environment/interactive/ladder";
import { textPrompt } from "../objects/environment/interactive/textPrompt";
import { roomChanger } from "../objects/environment/roomChanger";
import { skyBackground } from "../objects/environment/skyBackground";
import { treeGen } from "../objects/environment/treeGen";
import { mio } from "../objects/mio";
import { player } from "../objects/player";
//{NEW IMPORTS END HERE}


import { tileAnimation } from "./tile/tileAnimation";
import { objectBase } from "../engine/objectHandlers/objectBase";
import { tools } from "../engine/tools/tools";
import { tileMetaObj } from "../engine/Tile/tileMeteObj";





export class objectGenerator{
    private availibleObjects: Array<(xp: number, yp: number, input: string) => objectBase> = [
        //{NEW OBJECT HERE START} (COMMENT USED AS ANCHOR BY populateObjectGenerator.js)
		(xp: number, yp: number, input: string)=>{return new movingBlockHori(xp, yp, input);},
		(xp: number, yp: number, input: string)=>{return new movingBlockVert(xp, yp, input);},
		(xp: number, yp: number, input: string)=>{return new collisionSlopeLeft(xp, yp, input);},
		(xp: number, yp: number, input: string)=>{return new collisionSlopeRight(xp, yp, input);},
		(xp: number, yp: number, input: string)=>{return new block(xp, yp, input);},
		(xp: number, yp: number, input: string)=>{return new block32x64(xp, yp, input);},
		(xp: number, yp: number, input: string)=>{return new block64x32(xp, yp, input);},
		(xp: number, yp: number, input: string)=>{return new tinyBlock32(xp, yp, input);},
		(xp: number, yp: number, input: string)=>{return new wideBlock(xp, yp, input);},
		(xp: number, yp: number, input: string)=>{return new dummySandbag(xp, yp, input);},
		(xp: number, yp: number, input: string)=>{return new grass(xp, yp, input);},
		(xp: number, yp: number, input: string)=>{return new ladder(xp, yp, input);},
		(xp: number, yp: number, input: string)=>{return new textPrompt(xp, yp, input);},
		(xp: number, yp: number, input: string)=>{return new roomChanger(xp, yp, input);},
		(xp: number, yp: number, input: string)=>{return new skyBackground(xp, yp, input);},
		(xp: number, yp: number, input: string)=>{return new treeGen(xp, yp, input);},
		(xp: number, yp: number, input: string)=>{return new mio(xp, yp, input);},
		(xp: number, yp: number, input: string)=>{return new player(xp, yp, input);},
//{NEW OBJECT HERE END} (COMMENT USED AS ANCHOR BY populateObjectGenerator.js)

    ];

    getAvailibleObjects(){
        return this.availibleObjects;
    }

    generateObject(objectName: string, x: number, y: number, tile: tileAnimation | null, inputString: string) : objectBase{
        
        
        for(var i=0; i<this.availibleObjects.length; i++){

            if(tile == null){
                //Create normal object
                var avObj: (xp: number, yp: number, input: string) => objectBase = this.availibleObjects[i];
                var temp: objectBase = avObj(x, y, inputString);
                var className = tools.getClassNameFromConstructorName(temp.constructor.toString());
                
                if(className == objectName){
                    return temp;
                }
            }else{
                //Create tile object
                let newTile = new tileMetaObj(x, y);
                newTile.setTiles(tile);
                return newTile;
            }
            
        }

        throw new Error("Can't generate object for: "+objectName);
    }






}