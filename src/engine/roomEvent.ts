import { AdjustmentFilter } from '@pixi/filter-adjustment';
import * as PIXI from 'pixi.js'
import { objectGenerator } from '../shared/objectGenerator';
import { gameCamera } from "./gameCamera";
import { internalFunction } from "./internalFunctions";
import { boxCollider } from "./objectHandlers/collision/boxCollider";
import { iObject } from "./objectHandlers/iObject";
import { objectBase } from "./objectHandlers/objectBase";
import { objectContainer } from "./objectHandlers/objectContainer";
import { objectGlobalData } from './objectHandlers/objectGlobalData';
import { interaction } from "./text interaction/interaction";
import { ticker } from './ticker';
import { tileMetaObj } from './Tile/tileMeteObj';
import { task } from "./tools/task";

declare var LZString: any;


export class roomEvent {
    private app: PIXI.Application;
    private mouseXPosition:number = 0;
    private mouseYPosition:number = 0;
    container: HTMLElement;
    private keysDown: Record<string, boolean> = {};
    public objContainer: objectContainer;
     

    private gameKeysPressed: Record<string, boolean> = {};
    private gameKeysReleased: Record<string, boolean> = {};
    private gameKeysHeld: Record<string, boolean> = {};

    
    deltaTime: number = 1;

    private camera: gameCamera = new gameCamera();
    public tasker: task;

    private interactionGraphics = new PIXI.Container();
    private interaction: interaction;

    private generateObjects: objectGenerator = new objectGenerator();
    private tileContainer: iObject[] = [];
    private cameraBounds = [0, 0, 0, 0];
    private roomStartString: string = "";


    constructor(con: HTMLElement, tasker: task, app: PIXI.Application){
        this.objContainer = new objectContainer();
        this.container = con;
        this.tasker = tasker;
        this.keysDown = {};
        this.app = app;
        this.interaction = new interaction(this.interactionGraphics);

        this.container.addEventListener("mousemove", this.mouseMoveListener.bind(this));
        document.addEventListener("keydown", this.keyDownListener.bind(this), false);
        document.addEventListener("keyup", this.keyUpListener.bind(this), false);


    }

    

    queryKey(){
        //Reset pressed keys
        for(let key in this.gameKeysPressed){
            if(this.gameKeysPressed.hasOwnProperty(key)){
                this.gameKeysPressed[key] = false;
            }
        }

        for(let key in this.gameKeysReleased){
            if(this.gameKeysReleased.hasOwnProperty(key)){
                this.gameKeysReleased[key] = false;
            }
        }

        for(let key in this.keysDown){
            if(this.keysDown.hasOwnProperty(key)){
                if(this.keysDown[key] && (this.gameKeysPressed[key] == undefined || this.gameKeysPressed[key] == false) && (this.gameKeysHeld[key] == undefined || this.gameKeysHeld[key] == false)){
                    this.gameKeysPressed[key] = true;
                    this.gameKeysHeld[key] = true;
                }else
                if(this.keysDown[key] == false && this.gameKeysHeld[key] == true){
                    this.gameKeysPressed[key] = false;
                    this.gameKeysHeld[key] = false;
                    this.gameKeysReleased[key] = true;
                }
            }
        }
    }

    mouseMoveListener(e: MouseEvent){
        var x = e.clientX; //x position within the element.
        var y = e.clientY;  //y position within the element.

        if(e.target instanceof Element){
            var rect = e.target.getBoundingClientRect();
            x -= rect.left;
            y -= rect.top;
        }

        this.mouseXPosition = x;
        this.mouseYPosition = y;
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


    foreachObjectTypeBoolean(type: string, func: (arg0: iObject)=>boolean): boolean{
        var specificObjects = this.objContainer.getSpecificObjects(type);
        specificObjects.forEach(element => {
            if(element.objectName == type){
                if(func(element)){
                    return true;
                }
            }
        });
        return false;
    }


    foreachObjectType(type: string, func: (arg0: objectBase)=>boolean): Array<iObject>{
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

    /*loopThroughObjectsUntilCondition(targets: string[], func:(arg:iObject)=>boolean): iObject{
        for(var i=0; i<targets.length; i++){
            if(this.objContainer.getSpecificObjects(targets[i]) != null){
                for(var j=0; j<this.objContainer.getSpecificObjects(targets[i]).length; j++){
                    if(func(this.objContainer.getSpecificObjects(targets[i])[j])){
                        return this.objContainer.getSpecificObjects(targets[i])[j];
                    }
                }
            }
        }
        return objectGlobalData.null;
    }*/


    isCollidingWith(colSource: objectBase, colSourceCollisionBox: boxCollider, colTargetType: string[]): iObject | null{
        let colliding:iObject | null = null;
        this.objContainer.loopThroughObjectsUntilCondition(colTargetType, (obj: iObject) => {
            if(internalFunction.intersecting(colSource, colSourceCollisionBox, obj)){
                colliding = obj;
                return true;
            }
            return false;
        });
        return colliding;
    }


    isCollidingWithMultiple(colSource: objectBase, colSourceCollisionBox: boxCollider, colTargetType: string[]): iObject[]{
        let colliding:iObject[] = [];
        this.objContainer.loopThroughObjectsUntilCondition(colTargetType, (obj: iObject) => {
            if(internalFunction.intersecting(colSource, colSourceCollisionBox, obj)){
                colliding.push(obj);
            }
            return false;
        });
        return colliding;
    }


    addObject(obj: objectBase, layerIndex:number){
        this.objContainer.addObject(obj, layerIndex);
    }

    deleteObject(id:iObject){
        this.objContainer.deleteObject(id);
    }

    goToRoom(roomName: string){

    }

    handleObjectsEndStep(){
        this.objContainer.populateFromList();
        this.objContainer.purgeObjects();
    }

    loopThrough(){
        this.objContainer.loopThrough(this);
    }

    updateLayerOffsets(){
        this.objContainer.updateLayerOffsets(this.camera, this.app);
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

    loadRoom(loadRoomString: string, roomStartString: string){
        this.roomStartString = roomStartString;
        let loadRoom = JSON.parse(LZString.decompressFromEncodedURIComponent(loadRoomString))
        this.objContainer.removeObjects();

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
                if(objMeta.isPartOfCombination == false){
                    //console.log("Import object: ",objMeta);
                    let genObj:objectBase = this.generateObjects.generateObject(objMeta.name, Math.floor(objMeta.x), Math.floor(objMeta.y), objMeta.tile, objMeta.inputString);
                    if(genObj != null){
                        if(genObj.isTile == false){
                            containsOnlyStaticTiles = false;
                            this.objContainer.addObjectDirectly(genObj, layer.zIndex, layer.hidden);
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
            this.app.stage.addChild(pixiContainerLayer);
        }


        this.objContainer.forEveryObject((obj) => {
            obj.init(this);
        });


        this.app.stage.addChild(this.interactionGraphics)

    }


    getInteractionObject(){
        return this.interaction;
    }

} 