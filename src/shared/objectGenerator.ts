//{NEW IMPORTS START HERE}
//{NEW IMPORTS END HERE}


import { tileAnimation } from "./tile/tileAnimation";
import { objectBase } from "../engine/objectHandlers/objectBase";
import { tools } from "../engine/tools/tools";
import { resourcesHand } from "../engine/preload sources/resourcesHand";
import { tileMetaObj } from "../engine/Tile/tileMeteObj";





export class objectGenerator{
    private availibleObjects: Array<(xp: number, yp: number) => objectBase> = [
        //{NEW OBJECT HERE START} (COMMENT USED AS ANCHOR BY populareObjectGenerator.js)
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