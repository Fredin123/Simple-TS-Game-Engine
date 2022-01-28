//{NEW IMPORTS START HERE}
//{NEW IMPORTS END HERE}


import { tileAnimation } from "./tile/tileAnimation";
import { objectBase } from "../engine/objectHandlers/objectBase";
import { tools } from "../engine/tools/tools";
import { tileMetaObj } from "../engine/Tile/tileMeteObj";





export class objectGenerator{
    private availibleObjects: Array<(xp: number, yp: number, input: string) => objectBase> = [
        //{NEW OBJECT HERE START} (COMMENT USED AS ANCHOR BY populateObjectGenerator.js)
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