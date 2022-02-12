import * as PIXI from 'pixi.js'
import { Filter } from 'pixi.js';
import { isObject } from 'util';
import { roomEvent } from "../roomEvent/roomEvent";
import { boxCollider } from "./collision/boxCollider";
import { polygonCollisionX } from './collision/polygonCollision/polygonCollisionX';
import { iObject } from "./iObject";

export class objectFunctions{
    
    
    private roomEvents: roomEvent;

    constructor(l: roomEvent){
        this.roomEvents = l;
    }


    //Camera
    getCameraBounds(){
        return this.roomEvents.getCameraBounds();
    }

    isCameraInUse(){
        return this.roomEvents.isCameraInUse();
    }

    getCameraX(){
        return this.roomEvents.getCameraX();
    }

    getCameraY(){
        return this.roomEvents.getCameraY();
    }

    setCameraTarget(targetX: number, targetT: number){
        this.roomEvents.setCameraTarget(targetX, targetT);
    }

    setCameraMoveSpeedX(val: number){
        this.roomEvents.setCameraMoveSpeedX(val);
    }

    setCameraMoveSpeedY(val: number){
        this.roomEvents.setCameraMoveSpeedY(val);
    }

    getCameraOffsetX(){
        return this.roomEvents.getCameraOffsetX();
    }

    getCameraOffsetY(){
        return this.roomEvents.getCameraOffsetY();
    }

    setCameraOffsetX(value: number){
        this.roomEvents.setCameraOffsetX(value);
    }

    setCameraOffsetY(value: number){
        this.roomEvents.setCameraOffsetY(value);
    }




    getWindowWidth(){
        return this.roomEvents.getWindowWidth();
    }

    getWindowHeight(){
        return this.roomEvents.getWindowHeight();
    }


    deleteObject(id:iObject){
        this.roomEvents.deleteObject(id);
    }

    addObject(obj: iObject, layerIndex:number){
        this.roomEvents.addObject(obj, layerIndex);
    }

    addObjectLayerName(obj: iObject, layerString:string){
        this.roomEvents.addObjectLayerName(obj, layerString);
    }

    foreachObjectTypeBoolean(type: string, func: (arg0: iObject)=>boolean): boolean{
        return this.roomEvents.foreachObjectTypeBoolean(type, func);
    }

    foreachObjectType(type: string, func: (arg0: iObject)=>boolean): Array<iObject>{
        return this.roomEvents.foreachObjectType(type, func);
    }

    loadRoom(loadRoomString: string, roomStartString: string[]){
        this.roomEvents.loadRoom(loadRoomString, roomStartString);
    }

    checkKeyPressed(keyCheck: string){
        return this.roomEvents.checkKeyPressed(keyCheck);
    }

    checkKeyReleased(keyCheck: string){
        return this.roomEvents.checkKeyReleased(keyCheck);
    }

    checkKeyHeld(keyCheck: string){
        return this.roomEvents.checkKeyHeld(keyCheck);
    }

    checkMouseDown(){
        return this.roomEvents.checkMouseDown();
    }
    
    checkMouseUp(){
        return this.roomEvents.checkMouseUp();
    }
    
    mouseX(){
        return this.roomEvents.mouseX();
    }

    mouseY(){
        return this.roomEvents.mouseY();
    }

    getRoomStartString(){
        return this.roomEvents.getRoomStartString();
    }

    getSpecificObjects(type:string){
        return this.roomEvents.getSpecificObjects(type);
    }

    getLayerNamesSortedList(){
        return this.roomEvents.objContainer.getLayerNames();
    }

    getLayerNamesMap(){
        return this.roomEvents.objContainer.getLayerNamesMap();
    }

    deltaTime(){
        return this.roomEvents.deltaTime;
    }
    flags(){
        return this.roomEvents.flags;
    }

    keepObjectsWithinArea(objects: iObject[], originX: number, originY: number, radius: number){
        return this.roomEvents.keepObjectsWithinArea(objects, originX, originY, radius);
    }

    getRenderer(){
        return this.roomEvents.getRenderer();
    }

    addGraphicsDirectlyToLayer(graphic: PIXI.Graphics, layerName: string){
        this.roomEvents.addGraphicsDirectlyToLayer(graphic, layerName);
    }

    setLayerFilterExclude(excludeLayer: string, filters: Filter[]){
        this.roomEvents.setLayerFilterExclude(excludeLayer, filters);
    }

    goToRoom(loadRoomString: string, roomStartString: string[]){
        this.roomEvents.goToRoom(loadRoomString, roomStartString);
    }


    isCollidingWith(colSource: iObject, colSourceCollisionBox: boxCollider, colTargetType: string[]): iObject | null{
        return this.roomEvents.isCollidingWith(colSource, colSourceCollisionBox, colTargetType);
    }
    

    public tryStepBetweenLayers(obj: iObject, forward: boolean = true){
        let allLayers = this.getLayerNamesSortedList();
        if(forward == false){
            allLayers = allLayers.reverse();
        }
        console.log("layerKeys: ",allLayers);
        let targetLayer = "";
        let targetLayerGroundPart = "";
        let passedMyLayer = false;
        for(var i=0; i<allLayers.length; i++){
            let layer = allLayers[i];

            if(passedMyLayer){
                let foundPolygons = this.roomEvents.objContainer.getSpecificObjectsInLayer(allLayers[i], polygonCollisionX.objectName) as polygonCollisionX[];
                
                if(foundPolygons.length > 0){
                    if(forward){
                        targetLayer = allLayers[i-1];
                    }else{
                        targetLayer = allLayers[i+1];
                    }
                    
                    targetLayerGroundPart = allLayers[i];
                    console.log("targetLayerGroundPart: ",targetLayerGroundPart);
                    break;
                }
            }

            if(obj._targetLayerForPolygonCollision == layer){
                passedMyLayer = true;
            }
        }

        /*for(var i=0; i<allLayers.length; i++){
            let layer = allLayers[i];

            if(passedMyLayer){
                let foundPolygons = this.roomEvents.objContainer.getSpecificObjectsInLayer(allLayers[i], polygonCollisionX.objectName) as polygonCollisionX[];
                
                if(foundPolygons.length > 0){
                    if(passedMyTargetpolygonLayer == false){
                        passedMyTargetpolygonLayer = true;
                    }else{
                        targetLayer = allLayers[i-1];
                        targetLayerGroundPart = allLayers[i];
                        break;
                    }
                }
            }

            if(obj.layerIndex == this.getLayerNamesMap()[layer]){
                passedMyLayer = true;
            }
        }*/

        console.log("targetLayer: ",targetLayer);
        if(targetLayer != ""){
            //Check if polygon collision is below character
            let foundPolygons = this.roomEvents.getSpecificObjectsInLayer(polygonCollisionX.objectName, targetLayerGroundPart) as polygonCollisionX[];
            console.log("foundPolygons: ",foundPolygons);
            let targetPolygon: polygonCollisionX | null = null;
            for(var polygon of foundPolygons){
                if(obj.g.x > polygon.g.x && obj.g.x < polygon.g.x + polygon.getWidth()){
                    targetPolygon = polygon;
                    break;
                }
            }
            console.log("targetPolygon: ",targetPolygon);
            if(targetPolygon != null){
                obj._targetLayerForPolygonCollision = targetLayerGroundPart;
                //Move object to new layer
                this.roomEvents.stageObjectForNewLayer(obj, targetLayer);
            }
        }
        
    }

}