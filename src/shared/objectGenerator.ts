//{NEW IMPORTS START HERE}
import { block } from "../objects/blocks/block";
import { collisionSlopeLeft } from "../objects/blocks/collisionSlopeLeft";
import { collisionSlopeRight } from "../objects/blocks/collisionSlopeRight";
import { movingBlockHori } from "../objects/blocks/movingBlockHori";
import { movingBlockVert } from "../objects/blocks/movingBlockVert";
import { tinyBlock32 } from "../objects/blocks/tinyBlock32";
import { wideBlock } from "../objects/blocks/wideBlock";
import { grass } from "../objects/decoration/grass";
import { dummySandbag } from "../objects/dummySandbag";
import { ladder } from "../objects/environment/interactive/ladder";
import { textPrompt } from "../objects/environment/interactive/textPrompt";
import { hitbox } from "../objects/hitboxes/hitbox";
import { marker } from "../objects/marker";
import { mio } from "../objects/mio";
import { player } from "../objects/player";
//{NEW IMPORTS END HERE}


import { tileAnimation } from "./tile/tileAnimation";
import { objectBase } from "../engine/objectHandlers/objectBase";
import { tools } from "../engine/tools/tools";
import { resourcesHand } from "../engine/preload sources/resourcesHand";
import { tileMetaObj } from "../engine/Tile/tileMeteObj";





export class objectGenerator{
    private availibleObjects: Array<(xp: number, yp: number) => objectBase> = [
        //{NEW OBJECT HERE START} (COMMENT USED AS ANCHOR BY populareObjectGenerator.js)
		(xp: number, yp: number)=>{return new block(xp, yp);},
		(xp: number, yp: number)=>{return new collisionSlopeLeft(xp, yp);},
		(xp: number, yp: number)=>{return new collisionSlopeRight(xp, yp);},
		(xp: number, yp: number)=>{return new movingBlockHori(xp, yp);},
		(xp: number, yp: number)=>{return new movingBlockVert(xp, yp);},
		(xp: number, yp: number)=>{return new tinyBlock32(xp, yp);},
		(xp: number, yp: number)=>{return new wideBlock(xp, yp);},
		(xp: number, yp: number)=>{return new grass(xp, yp);},
		(xp: number, yp: number)=>{return new dummySandbag(xp, yp);},
		(xp: number, yp: number)=>{return new ladder(xp, yp);},
		(xp: number, yp: number)=>{return new textPrompt(xp, yp);},
		(xp: number, yp: number)=>{return new hitbox(xp, yp);},
		(xp: number, yp: number)=>{return new marker(xp, yp);},
		(xp: number, yp: number)=>{return new mio(xp, yp);},
		(xp: number, yp: number)=>{return new player(xp, yp);},
//{NEW OBJECT HERE END} (COMMENT USED AS ANCHOR BY populareObjectGenerator.js)

    ];

    getAvailibleObjects(){
        return this.availibleObjects;
    }

    generateObject(objectName: string, x: number, y: number, tile: tileAnimation | null) : objectBase{
        
        
        for(var i=0; i<this.availibleObjects.length; i++){

            if(tile == null){
                //Create normal object
                var avObj: (xp: number, yp: number) => objectBase = this.availibleObjects[i];
                var temp: objectBase = avObj(x, y);
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

        console.log("Can't generate object for: "+objectName);
        throw new Error("Can't generate object for: "+objectName);
    }






}