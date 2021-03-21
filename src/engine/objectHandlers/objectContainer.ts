import { roomEvent } from "../roomEvent";
import { tools } from "../tools/tools";
import { objectBase } from "./objectBase";
import { nulliObject } from "./nulliObject";
import { iObject } from "./iObject";


export class objectContainer{
    private specificObjects: {[key: string]: Array<objectBase>};
    private layers: {[key: number]: Array<objectBase>};
    private layerKeysOrdered: Array<number> = [];
    private objectToRemoveBuffer: Array<iObject> = [];

    constructor(){
        this.specificObjects = {};
        this.layers = {};
    }

    removeObjects(){
        this.specificObjects = {};
        this.layers = {};
        this.layerKeysOrdered.length = 0;
    }

    addObject(obj: objectBase, layer:number){
        //Add specific classes
        let objName = tools.getClassNameFromConstructorName(obj.constructor.toString());
        if(this.specificObjects[objName] == null){
            this.specificObjects[objName] = new Array<objectBase>();
        }
        this.specificObjects[objName].push(obj);

        //Add on specific layer
        if(this.layers[layer] == null){
            this.layers[layer] = new Array<objectBase>();
            this.layerKeysOrdered.push(layer);
            this.layerKeysOrdered.sort();
        }
        this.layers[layer].push(obj);
    }

    deleteObject(id:iObject){
        this.objectToRemoveBuffer.push(id);
    }

    purgeObjects(){
        /*for(var i=0; i<this.objectToRemoveBuffer.length; i++){
            var obj = this.objectToRemoveBuffer[i];
            for(var objClass in this.specificObjects[obj.objectName])
            this.specificObjects = {};
            this.layers = {};
            this.layerKeysOrdered.length = 0;
        }
        this.objectToRemoveBuffer.length = 0;*/
    }


    foreachObjectType(targets: string[], func:(arg:objectBase)=>boolean): iObject{
        for(var i=0; i<targets.length; i++){
            if(this.specificObjects[targets[i]] != null){
                for(var j=0; j<this.specificObjects[targets[i]].length; j++){
                    if(func(this.specificObjects[targets[i]][j])){
                        return this.specificObjects[targets[i]][j];
                    }
                }
            }
        }
        return objectBase.null;
    }


    getSpecificObjects(objName: string){
        return this.specificObjects[objName];
    }

    loopThrough(logicModule: roomEvent){
        for(let key in this.layerKeysOrdered){

            for(var i=0; i<this.layers[key].length; i++){
                this.layers[key][i].logic(logicModule);
            }
        }

        
    }
}