import { objectBase } from "./engine/objectHandlers/objectBase";
import { tools } from "./engine/tools/tools";
//{NEW IMPORTS START HERE}
import { block } from "./objects/blocks/block";
import { movingBlockHori } from "./objects/blocks/movingBlockHori";
import { movingBlockVert } from "./objects/blocks/movingBlockVert";
import { marker } from "./objects/marker";
import { mio } from "./objects/mio";
//{NEW IMPORTS END HERE}




export class objectGenerator{
    private availibleObjects: Array<(xp: number, yp: number) => objectBase> = [
        //{NEW OBJECT HERE START} (COMMENT USED AS ANCHOR BY populareObjectGenerator.js)
		(xp: number, yp: number)=>{return new block(xp, yp);},
		(xp: number, yp: number)=>{return new movingBlockHori(xp, yp);},
		(xp: number, yp: number)=>{return new movingBlockVert(xp, yp);},
		(xp: number, yp: number)=>{return new marker(xp, yp);},
		(xp: number, yp: number)=>{return new mio(xp, yp);},
//{NEW OBJECT HERE END} (COMMENT USED AS ANCHOR BY populareObjectGenerator.js)

    ];

    getAvailibleObjects(){
        return this.availibleObjects;
    }

    generateObject(objectName: string, x: number, y: number) : objectBase{
        
        
        for(var i=0; i<this.availibleObjects.length; i++){
            var avObj: (xp: number, yp: number) => objectBase = this.availibleObjects[i];
            var temp: objectBase = avObj(x, y);
            var className = tools.getClassNameFromConstructorName(temp.constructor.toString()); 
            
            
            if(className == objectName){
                return temp;
            }
        }

        console.log("Can't generate object for: "+objectName);
        throw new Error("Can't generate object for: "+objectName);
    }


    





}



