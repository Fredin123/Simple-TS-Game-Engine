import { objectBase } from "./objectHandlers/objectBase";
import { block } from "./objects/blocks/block";
import { movingBlockHori } from "./objects/blocks/movingBlockHori";
import { movingBlockVert } from "./objects/blocks/movingBlockVert";
import { mio } from "./objects/mio";
import { tools } from "./tools/tools";

interface objectFuncStore{
    ():objectBase;
}

export class objectGenerator{
    private availibleObjects: Array<(xp: number, yp: number) => objectBase> = [
        (xp: number, yp: number)=>{return new mio(xp, yp);},
        (xp: number, yp: number)=>{return new block(xp, yp);},
        (xp: number, yp: number)=>{return new movingBlockHori(xp, yp);},
        (xp: number, yp: number)=>{return new movingBlockVert(xp, yp);}
        //new mio(0, 0),
        //new block(0, 0)
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



