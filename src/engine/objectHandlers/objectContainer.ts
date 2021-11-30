import { roomEvent } from "../roomEvent/roomEvent";
import { tools } from "../tools/tools";
import { objectBase } from "./objectBase";
import { nulliObject } from "./nulliObject";
import { iObject } from "./iObject";
import { gameCamera } from "../gameCamera";
import { layer } from "../../shared/layer";
import { roomLayer } from "./roomLayer";
import * as PIXI from 'pixi.js'
import { objectGlobalData } from "./objectGlobalData";
import { internalFunction } from "../internalFunctions";
import { boxCollider } from "./collision/boxCollider";


export class objectContainer{
    private specificObjects: {[key: string]: Array<iObject>};
    private layers: {[key: number]: roomLayer};
    private layerNames: {[key: string]: number} = {};

    private layerKeysOrdered: Array<number> = [];
    private objectToRemoveBuffer: Array<iObject> = [];
    private objectToAddBuffer: Array<[iObject, number]> = [];

    private roomEvents: roomEvent;

    constructor(roomEvents: roomEvent){
        this.roomEvents = roomEvents;
        this.specificObjects = {};
        this.layers = {};
    }

    /*sortLayer(layerNum: number, sortFunc: (a: iObject, b: iObject) => number){
        this.layers[layerNum].objects.sort(sortFunc);
    }*/

    addGraphicsDirectlyToLayer(graphic: PIXI.Graphics, layerName: string){
        let layerIndex = this.layerNames[layerName];
        this.layers[layerIndex].graphicsContainer.addChild(graphic);
    }

    removeObjects(){
        this.specificObjects = {};
        this.layers = {};
        this.layerKeysOrdered.length = 0;
    }

    addContainerForLayer(container: PIXI.Container, layerNumber: number, layerName: string, scrollSpeedX: number, scrollSpeedY: number){
        if(this.layerNames[layerNumber] == null){
            this.layerNames[layerName] = layerNumber;
        }

        if(this.layers[layerNumber] == null){
            this.layers[layerNumber] = new roomLayer(layerName, layerNumber, container);
            this.layers[layerNumber].scrollSpeedX = scrollSpeedX;
            this.layers[layerNumber].scrollSpeedY = scrollSpeedY;
            this.layerKeysOrdered.push(layerNumber);
            this.layerKeysOrdered.sort();
        }
    }


    addObjectDirectly(obj: iObject, targetlayer:number, hidden: boolean = false){
        //Add specific classes
        
        obj.onLayer = targetlayer;
        let objName = tools.getClassNameFromConstructorName(obj.constructor.toString());
        if(this.specificObjects[objName] == null){
            this.specificObjects[objName] = new Array<objectBase>();
        }
        this.specificObjects[objName].push(obj);
        
        if(this.layers[targetlayer] != undefined){
            obj.layerIndex = this.layers[targetlayer].objects.length;
            this.layers[targetlayer].objects.push(obj);
            if(hidden == false){
                this.layers[targetlayer].graphicsContainer.addChild(obj.g);
            }
        }

        obj.init(this.roomEvents);
        
    }

    addObject(obj: iObject, layerIndex:number){
        this.objectToAddBuffer.push([obj, layerIndex]);
    }

    addObjectLayerName(obj: iObject, layerString:string){
        let layerIndex = this.layerNames[layerString];
        this.objectToAddBuffer.push([obj, layerIndex]);
    }

    private PFL_addThis: [iObject, number] = [new nulliObject(0, 0), 0];
    populateFromList(){
        for(this.PFL_addThis of this.objectToAddBuffer){
            this.addObjectDirectly(this.PFL_addThis[0], this.PFL_addThis[1]);
        }

        for(this.PFL_addThis of this.objectToAddBuffer){
            this.PFL_addThis[0].afterInit(this.roomEvents);
        }

        this.objectToAddBuffer.length = 0;
    }

    deleteObject(id:iObject){
        this.objectToRemoveBuffer.push(id);
    }

    private PO_removeThis: iObject = new nulliObject(0, 0);
    private PO_target: iObject = new nulliObject(0, 0);
    purgeObjects(){
        for(this.PO_removeThis of this.objectToRemoveBuffer){
            if(this.specificObjects[this.PO_removeThis.objectName] != undefined){
                for(this.PO_target of this.specificObjects[this.PO_removeThis.objectName]){
                    if(this.PO_target.ID == this.PO_removeThis.ID){
                        this.specificObjects[this.PO_removeThis.objectName].splice(this.specificObjects[this.PO_removeThis.objectName].indexOf(this.PO_target), 1);
                        break;
                    }
                }
    
                this.layerKeysOrdered.forEach(layerNumber => { 
                    
                    for(this.PO_target of this.layers[layerNumber].objects){
                        if(this.PO_target.ID == this.PO_removeThis.ID){
                            this.PO_target.g.destroy();
                            this.layers[layerNumber].objects.splice(this.layers[layerNumber].objects.indexOf(this.PO_target), 1);
                            break;
                        }
                    }
                });
            }
            
        }

        this.objectToRemoveBuffer.length = 0;
    }


    loopThroughObjectsUntilCondition(targets: string[], func:(arg:iObject)=>boolean): iObject{
        var i=0;
        for(;i<targets.length; i++){
            if(this.specificObjects[targets[i]] != null){
                var j=0;
                for(; j<this.specificObjects[targets[i]].length; j++){
                    if(func(this.specificObjects[targets[i]][j])){
                        return this.specificObjects[targets[i]][j];
                    }
                }
            }
        }
        return objectGlobalData.null;
    }

    filterObjects(targets: string[], func:(arg:iObject)=>boolean): iObject[]{
        let foundObjects : iObject[] = [];
        let i=0;
        for(; i<targets.length; i++){
            if(this.specificObjects[targets[i]] != null){
                let j=0;
                for(; j<this.specificObjects[targets[i]].length; j++){
                    if(func(this.specificObjects[targets[i]][j])){
                        foundObjects.push(this.specificObjects[targets[i]][j]);
                    }
                }
            }
        }
        return foundObjects;
    }



    

    getSpecificObjects(objName: string){
        return this.specificObjects[objName];
    }

    loopThrough(logicModule: roomEvent){
        let x=0;
        for(; x<this.layerKeysOrdered.length; x++){
            let key = this.layerKeysOrdered[x];
            let i=0;
            for(; i<this.layers[key].objects.length; i++){
                this.layers[key].objects[i].logic(logicModule);
            }
        }
    }

    forEveryObject(func: ((x:iObject)=>void)){
        let x = 0;
        for(; x<this.layerKeysOrdered.length; x++){
            let key = this.layerKeysOrdered[x];
            let i=0;
            for(; i<this.layers[key].objects.length; i++){
                func(this.layers[key].objects[i]);
            }
        }
    }

    getAllObjects(){
        let allObjectsContainer: iObject[] = [];
        let x=0;
        for(; x<this.layerKeysOrdered.length; x++){
            let key = this.layerKeysOrdered[x];
            let i=0;
            for(; i<this.layers[key].objects.length; i++){
                allObjectsContainer.push(this.layers[key].objects[i]);
            }
        }
        return allObjectsContainer;
    }

    updateLayerOffsets(camera: gameCamera, app: PIXI.Application){
        let x=0;
        for(; x<this.layerKeysOrdered.length; x++){
            //console.log("this.layerKeysOrdered[x]: ",this.layerKeysOrdered[x]);
            //console.log("this.layers: ",this.layers[this.layerKeysOrdered[x]]);
            //console.log("this.layersContainer[this.layerKeysOrdered[x]].x: ",this.layersContainer[this.layerKeysOrdered[x]].x, "  camera.getX(): ",camera.getX());
            this.layers[this.layerKeysOrdered[x]].graphicsContainer.x = (-camera.getX() * (1-this.layers[this.layerKeysOrdered[x]].scrollSpeedX))/* - app.renderer.width/2*/;
            //this.layersContainer[this.layerKeysOrdered[x]].y = camera.getY();
        }
    }


    public boxIntersectionSpecific(initiator: iObject, boxData: boxCollider, targetObjects: string[]): iObject{
        return this.loopThroughObjectsUntilCondition(targetObjects, (testCollisionWith: iObject)=>{
            if(internalFunction.intersecting(initiator, boxData, testCollisionWith)){
                return true;
            }
            return false;
        });
    }


}