import { roomEvent } from "../roomEvent";
import { tools } from "../tools/tools";
import { objectBase } from "./objectBase";
import { nulliObject } from "./nulliObject";
import { iObject } from "./iObject";


export class objectContainer{
    private specificObjects: {[key: string]: Array<objectBase>};
    private layers: {[key: number]: Array<iObject>};
    private layerNames: {[key: string]: number} = {};
    private layersContainer: {[key: number]: PIXI.Container} = {};
    private layerKeysOrdered: Array<number> = [];
    private objectToRemoveBuffer: Array<iObject> = [];
    private objectToAddBuffer: Array<[objectBase, number]> = [];

    constructor(){
        this.specificObjects = {};
        this.layers = {};
    }

    removeObjects(){
        this.specificObjects = {};
        this.layers = {};
        this.layerKeysOrdered.length = 0;
    }

    addContainerForLayer(container: PIXI.Container, layerNumber: number, layerName: string){
        if(this.layersContainer[layerNumber] == null){
            this.layersContainer[layerNumber] = container;
            this.layerNames[layerName] = layerNumber;
        }
    }

    addObjectDirectly(obj: objectBase, targetlayer:number, hidden: boolean = false){
        //Add specific classes
        obj.onLayer = targetlayer;
        let objName = tools.getClassNameFromConstructorName(obj.constructor.toString());
        if(this.specificObjects[objName] == null){
            this.specificObjects[objName] = new Array<objectBase>();
        }
        this.specificObjects[objName].push(obj);

        //Add on specific layer
        if(this.layers[targetlayer] == null){
            this.layers[targetlayer] = new Array<objectBase>();
            this.layerKeysOrdered.push(targetlayer);
            this.layerKeysOrdered.sort();
        }
        
        this.layers[targetlayer].push(obj);
        if(hidden == false){
            this.layersContainer[targetlayer].addChild(obj.g);
        }
        
    }

    addObject(obj: objectBase, layerIndex:number){
        this.objectToAddBuffer.push([obj, layerIndex]);
    }

    populateFromList(){
        for(let addThis of this.objectToAddBuffer){
            
            
            this.addObjectDirectly(addThis[0], addThis[1]);
        }

        this.objectToAddBuffer.length = 0;
    }

    deleteObject(id:iObject){
        this.objectToRemoveBuffer.push(id);
    }

    purgeObjects(){
        for(let removeThis of this.objectToRemoveBuffer){
            for(let target of this.specificObjects[removeThis.objectName]){
                if(target.ID == removeThis.ID){
                    this.specificObjects[removeThis.objectName].splice(this.specificObjects[removeThis.objectName].indexOf(target), 1);
                    break;
                }
            }

            this.layerKeysOrdered.forEach(layerNumber => { 
                
                for(let target of this.layers[layerNumber]){
                    if(target.ID == removeThis.ID){
                        target.g.destroy();
                        this.layers[layerNumber].splice(this.layers[layerNumber].indexOf(target), 1);
                        break;
                    }
                }
            });
        }

        this.objectToRemoveBuffer.length = 0;
    }


    foreachObjectType(targets: string[], func:(arg:iObject)=>boolean): iObject{
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
        for(let x = 0; x<this.layerKeysOrdered.length; x++){
            let key = this.layerKeysOrdered[x];
            for(var i=0; i<this.layers[key].length; i++){
                this.layers[key][i].logic(logicModule);
            }
        }

        
    }
}