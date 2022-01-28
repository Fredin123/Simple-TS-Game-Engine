import { AdjustmentFilter } from '@pixi/filter-adjustment';
import * as PIXI from 'pixi.js'
import { objectTypes } from '../../shared/objectTypes';
import { objectGenerator } from '../../shared/objectGenerator';
import { roomData } from '../../shared/roomData';
import { gameCamera } from "../gameCamera";
import { internalFunction } from "../internalFunctions";
import { boxCollider } from "../objectHandlers/collision/boxCollider";
import { iObject } from "../objectHandlers/iObject";
import { objectBase } from "../objectHandlers/objectBase";
import { objectContainer } from "../objectHandlers/objectContainer";
import { ticker } from '../ticker';
import { tileMetaObj } from '../Tile/tileMeteObj';
import { task } from "../tools/task";
import { polygonCollisionX } from '../objectHandlers/collision/polygonCollision/polygonCollisionX';
import { Filter } from 'pixi.js';
import { calculations } from '../calculations';
import { layer } from '../../shared/layer';
import { roomEventFlags } from './roomEventFlags';
import { objectFunctions } from '../objectHandlers/objectFunctions';
import { player } from '../../objects/player';

declare var LZString: any;


export class roomEvent {
    
    private app: PIXI.Application;
    private mouseXPosition:number = 0;
    private mouseYPosition:number = 0;
    container: HTMLElement;
    private keysDown: Record<string, boolean> = {};
    public objContainer: objectContainer;
     
    private layerAndGraphicContainer: Record<string, PIXI.Container> = {};

    private gameKeysPressed: Record<string, boolean> = {};
    private gameKeysReleased: Record<string, boolean> = {};
    private gameKeysHeld: Record<string, boolean> = {};

    private functionsForObjects: objectFunctions;

    deltaTime: number = 1;

    private camera: gameCamera = new gameCamera();
    public tasker: task;


    private generateObjects: objectGenerator = new objectGenerator();
    private tileContainer: iObject[] = [];
    private cameraBounds = [0, 0, 0, 0];
    private roomStartString: string[] = [];

    public flags: roomEventFlags = new roomEventFlags();

    public storedTargetScene: [string, string[]] = ["", []];

    public moveObjectToNewLayerBuffer: [iObject, string][] = [];

    constructor(con: HTMLElement, tasker: task, app: PIXI.Application){
        this.objContainer = new objectContainer(this);
        this.container = con;
        this.tasker = tasker;
        this.keysDown = {};
        this.app = app;

        this.functionsForObjects = new objectFunctions(this);

        this.container.addEventListener("mousemove", this.mouseMoveListener.bind(this));
        document.addEventListener("keydown", this.keyDownListener.bind(this), false);
        document.addEventListener("keyup", this.keyUpListener.bind(this), false);
    }

    getRenderer(){
        return this.app.renderer;
    }

    addStageFilter(addFilters: Filter[]){
        this.app.stage.filters = addFilters;
    }

    setLayerFilter(layerNames: string[], filters: Filter[]){
        let keys = Object.keys(this.layerAndGraphicContainer);
        let pixiContainerForFilter = new PIXI.Container();

        this.app.stage.removeChildren();
        for(let key of keys){
            //this.layerAndGraphicContainer[key].parent.removeChild(this.layerAndGraphicContainer[key]);
            if(layerNames.length == 0 || layerNames.indexOf(key) == -1){
                this.app.stage.addChild(this.layerAndGraphicContainer[key]);
            }else{
                pixiContainerForFilter.addChild(this.layerAndGraphicContainer[key]);
                layerNames.splice(layerNames.indexOf(key), 1);
                if(layerNames.length == 0){
                    pixiContainerForFilter.filters = filters;
                    this.app.stage.addChild(pixiContainerForFilter);
                }
            }
        }
    }

    setLayerFilterExclude(excludeLayer: string, filters: Filter[]){
        let keys = Object.keys(this.layerAndGraphicContainer);
        for(let key of keys){
            if(excludeLayer != key){
                this.layerAndGraphicContainer[key].filters = filters;
            }
        }
    }

    getStageFilters(){
        return this.app.stage.filters;
    }

    getWindowWidth(){
        return this.app.renderer.view.width;
    }

    getWindowHeight(){
        return this.app.renderer.view.height;
    }
    

    private key = "";
    queryKey(){
        //Reset pressed keys
        for(this.key in this.gameKeysPressed){
            if(this.gameKeysPressed.hasOwnProperty(this.key)){
                this.gameKeysPressed[this.key] = false;
            }
        }

        for(this.key in this.gameKeysReleased){
            if(this.gameKeysReleased.hasOwnProperty(this.key)){
                this.gameKeysReleased[this.key] = false;
            }
        }

        for(this.key in this.keysDown){
            if(this.keysDown.hasOwnProperty(this.key)){
                if(this.keysDown[this.key] && (this.gameKeysPressed[this.key] == undefined || this.gameKeysPressed[this.key] == false) && (this.gameKeysHeld[this.key] == undefined || this.gameKeysHeld[this.key] == false)){
                    this.gameKeysPressed[this.key] = true;
                    this.gameKeysHeld[this.key] = true;
                }else
                if(this.keysDown[this.key] == false && this.gameKeysHeld[this.key] == true){
                    this.gameKeysPressed[this.key] = false;
                    this.gameKeysHeld[this.key] = false;
                    this.gameKeysReleased[this.key] = true;
                }
            }
        }
    }

    private mouseXPre = 0;
    private mouseYPre = 0;
    mouseMoveListener(e: MouseEvent){
        this.mouseXPre = e.clientX; //x position within the element.
        this.mouseYPre = e.clientY;  //y position within the element.

        if(e.target instanceof Element){
            var rect = e.target.getBoundingClientRect();
            this.mouseXPre -= rect.left;
            this.mouseYPre -= rect.top;
        }

        this.mouseXPosition = this.mouseXPre;
        this.mouseYPosition = this.mouseYPre;
    }

    keyDownListener(e: KeyboardEvent){
        this.keysDown[e.key] = true; 
    }

    keyUpListener(e: KeyboardEvent){
        this.keysDown[e.key] = false;
    }

    resetKeyPressedStates(){
        this.keysDown = {};
    }


    //Get keys--------------------
    checkKeyPressed(keyCheck: string){
        return this.gameKeysPressed[keyCheck];
    }

    checkKeyReleased(keyCheck: string){
        return this.gameKeysReleased[keyCheck];
    }

    checkKeyHeld(keyCheck: string){
        return this.gameKeysHeld[keyCheck];
    }

    mouseX(){
        return this.mouseXPosition;
    }

    mouseY(){
        return this.mouseYPosition;
    }

    keepObjectsWithinArea(objects: iObject[], originX: number, originY: number, radius: number){
        let keptObjects: iObject[] = [];
        for(var obj of objects){
            if(calculations.distanceBetweenPoints(originX, originY, obj.g.x, obj.g.y) <= radius){
                keptObjects.push(obj);
            }
        }
        return keptObjects;
    }

    getObjectsInLayer(layerName: string){
        return this.objContainer.getObjectsInLayer(layerName);
    }
    
    foreachObjectTypeBoolean(type: string, func: (arg0: iObject)=>boolean): boolean{
        this.objContainer.getSpecificObjects(type)
        .forEach(element => {
            if(element.objectName == type){
                if(func(element)){
                    return true;
                }
            }
        });
        return false;
    }


    foreachObjectType(type: string, func: (arg0: iObject)=>boolean): Array<iObject>{
        var returnResult: Array<iObject> = new Array<objectBase>();
        var specificObjects = this.objContainer.getSpecificObjects(type);
        if(specificObjects != null){
            specificObjects.forEach(element => {
                if(element.objectName == type){
                    if(func(element)){
                        returnResult.push(element);
                    }
                }
            });
        }
        return returnResult;
    }

    /*sortLayer(layerNum: number, sortFunc: (a: iObject, b: iObject) => number){
        this.objContainer.sortLayer(layerNum, sortFunc);
    }*/

    getSpecificObjects(type:string){
        return this.objContainer.getSpecificObjects(type);
    }

    private ICW_colliding: iObject | null = null;
    isCollidingWith(colSource: iObject, colSourceCollisionBox: boxCollider, colTargetType: string[]): iObject | null{
        this.ICW_colliding = null;
        this.objContainer.loopThroughObjectsUntilCondition(colTargetType, (obj: iObject) => {
            if(internalFunction.intersecting(colSource, colSourceCollisionBox, obj)){
                this.ICW_colliding = obj;
                return true;
            }
            return false;
        });
        return this.ICW_colliding;
    }


    isCollidingWithMultiple(colSource: iObject, colSourceCollisionBox: boxCollider, colTargetType: string[]): iObject[]{
        let colliding:iObject[] = [];
        this.objContainer.loopThroughObjectsUntilCondition(colTargetType, (obj: iObject) => {
            if(internalFunction.intersecting(colSource, colSourceCollisionBox, obj)){
                colliding.push(obj);
            }
            return false;
        });
        return colliding;
    }

    addGraphicsDirectlyToLayer(graphic: PIXI.Graphics, layerName: string){
        this.objContainer.addGraphicsDirectlyToLayer(graphic, layerName);
    }

    addObject(obj: iObject, layerIndex:number){
        this.objContainer.addObject(obj, layerIndex);
    }

    addObjectLayerName(obj: iObject, layerString:string){
        this.objContainer.addObjectLayerName(obj, layerString);
    }

    deleteObject(id:iObject){
        this.objContainer.deleteObject(id);
    }

    goToRoom(loadRoomString: string, roomStartString: string[]){
        this.storedTargetScene = [loadRoomString, roomStartString];
    }

    hoesIndex = 0;
    handleObjectsEndStep(){
        //Move objects to new layers
        for(this.hoesIndex = 0; this.hoesIndex < this.moveObjectToNewLayerBuffer.length; this.hoesIndex++){
            this.moveObjectToNewLayerBuffer[this.hoesIndex][0].changeLayer(this, this.moveObjectToNewLayerBuffer[this.hoesIndex][1]);
        }
        this.moveObjectToNewLayerBuffer = [];

        this.objContainer.populateFromList(this.functionsForObjects);
        this.objContainer.purgeObjects();
    }

    loopThrough(){
        this.objContainer.loopThrough(this.functionsForObjects, this);
    }

    updateLayerOffsets(){
        this.objContainer.updateLayerOffsets(this.camera, this.app);
    }

    getCameraBounds(){
        return this.cameraBounds;
    }

    moveCamera(){
        this.camera.moveCamera(this.app, this.cameraBounds);
    }

    isCameraInUse(){
        return this.camera.getIsInUse();
    }

    getCameraX(){
        return this.camera.getX();
    }

    getCameraY(){
        return this.camera.getY();
    }

    setCameraTarget(targetX: number, targetT: number){
        this.camera.setTarget(targetX, targetT);
    }

    setCameraMoveSpeedX(val: number){
        this.camera.setMoveSpeedX(val);
    }

    setCameraMoveSpeedY(val: number){
        this.camera.setMoveSpeedY(val);
    }

    getCameraOffsetX(){
        return this.camera.cameraOffsetX;
    }

    getCameraOffsetY(){
        return this.camera.cameraOffsetY;
    }

    setCameraOffsetX(value: number){
        this.camera.cameraOffsetX = value;
    }

    setCameraOffsetY(value: number){
        this.camera.cameraOffsetY = value;
    }

    animateTiles(){
        for(let t of this.tileContainer){
            if(ticker.getTicks() % t.tileStepTime == 0){
                (t as tileMetaObj).animate();
            }
        }
    }

    getRoomStartString(){
        return this.roomStartString;
    }

    loadRoom(loadRoomString: string, roomStartString: string[]){
        this.roomStartString = roomStartString;
        let loadRoom = (JSON.parse(LZString.decompressFromEncodedURIComponent(loadRoomString)) as roomData);
        //console.log("import room: ",loadRoom);
        this.objContainer.removeObjects();

        this.moveObjectToNewLayerBuffer = [];
        this.cameraBounds[0] = loadRoom.cameraBoundsX ?? 0;
        this.cameraBounds[1] = loadRoom.cameraBoundsY ?? 0;
        this.cameraBounds[2] = loadRoom.cameraBoundsWidth ?? 0;
        this.cameraBounds[3] = loadRoom.cameraBoundsHeight ?? 0;

        while(this.app.stage.children[0]) { this.app.stage.removeChild(this.app.stage.children[0]); }
        this.app.renderer.backgroundColor = parseInt(loadRoom.backgroundColor.replace("#", "0x"));
        
        for(let layer of loadRoom.layerData){
            let pixiContainerLayer = new PIXI.Container();
            let objectsToAdd = [];
            let containsOnlyStaticTiles = true;
            let layerSettings = JSON.parse(layer.settings);
            this.objContainer.addContainerForLayer(pixiContainerLayer, layer.zIndex, layer.layerName, layerSettings.scrollSpeedX, layerSettings.scrollSpeedY);
            for(let objMeta of layer.metaObjectsInLayer){
                if(objMeta.type == objectTypes.userObject){
                    if(objMeta.isPartOfCombination == false){
                        let genObj:objectBase = this.generateObjects.generateObject(objMeta.name, Math.floor(objMeta.x), Math.floor(objMeta.y), objMeta.tile, objMeta.inputString);
                        genObj.layerIndex = layer.zIndex;
                        if(genObj != null){
                            if(genObj.isTile == false){
                                containsOnlyStaticTiles = false;
                                this.objContainer.addObjectDirectly(genObj, layer.zIndex, layer.hidden, this.functionsForObjects, false);
                            }else{
                                if(objMeta.tile!.tiles.length > 1){
                                    containsOnlyStaticTiles = false;
                                }
                                this.tileContainer.push(genObj);
                                if(layer.hidden == false){
                                    objectsToAdd.push(genObj.g);
                                }
                            }
                        }
                    }
                }
            }

            for(let geom of layer.geometriesInLayer){
                let newPolygon = new polygonCollisionX(geom.x, geom.y, "");
                geom.geomPoints = geom.geomPoints.map(function(yPoint){
                    return Number(Math.round(yPoint));
                });
                newPolygon.setPolygon(geom.geomPoints, Math.round(geom.geomWidth), this.functionsForObjects, this.app);
                this.objContainer.addObjectDirectly(newPolygon, layer.zIndex, layer.hidden, this.functionsForObjects, false);
            }
            
            if(parseFloat(layerSettings.blur) != 0 && false){
                var blurFilter1 = new PIXI.filters.BlurFilter(50);
                let filterContainer = new PIXI.Container();
                objectsToAdd.forEach(obj => {
                    filterContainer.addChild(obj);
                });
                pixiContainerLayer.filters = [blurFilter1];
                pixiContainerLayer.addChild(filterContainer);
            }else{
                objectsToAdd.forEach(obj => {
                    pixiContainerLayer.addChild(obj);
                });
            }
            if(containsOnlyStaticTiles){
                if(pixiContainerLayer.filters == null){
                    pixiContainerLayer.filters = [];
                }
            }
            
            
            

            var start = new PIXI.Point(20, 20);
            var end = new PIXI.Point(800, 500);
            this.app.stage.filters = [
                new AdjustmentFilter({
                    gamma: 1,
                    saturation: 1.6,
                    contrast: 1,
                    brightness: 1,
                    red: 1,
                    green: 0.90,
                    blue: 0.9,
                    alpha: 1})
            ];
            this.layerAndGraphicContainer[layer.layerName] = pixiContainerLayer;
            this.app.stage.addChild(pixiContainerLayer);
            
        }


        let allObjects = this.objContainer.getAllObjects();

        allObjects.forEach(obj => {
            this.objContainer.setTargetPolygonCollisionLayer(obj);
        });
        allObjects.forEach(obj => {
            obj.init(this.functionsForObjects);
        });

    
        allObjects.forEach(obj => {
            obj.afterInit(this.functionsForObjects);
        });



    }


    getSpecificObjectsInLayer(objectType: string, targetLayer: string){
        let targetObjects: iObject[] = [];
        let objectsFound = this.getObjectsInLayer(targetLayer);
        console.log("objects in layer: ",objectsFound);
        
        for(var obj of objectsFound){
            console.log("if ",obj.objectName," == ", objectType);
            if(obj.objectName == objectType){
                targetObjects.push(obj);
            }
        }
        return targetObjects;
    }

    stageObjectForNewLayer(obj: iObject, layerName: string){
        this.moveObjectToNewLayerBuffer.push([obj, layerName]);
    }


} 