import * as PIXI from 'pixi.js'
import { gameSettings } from "./gameSettings";
import { graphics } from "./graphics";
import { roomEvent } from "./roomEvent";
import { objectGenerator } from '../shared/objectGenerator';
import { Room } from "./Room";
import { objectContainer } from './objectHandlers/objectContainer';
import { objectBase } from './objectHandlers/objectBase';
import { objectMetaData } from '../developerTools/src/objectMetaData';
import { layer } from '../shared/layer';
import { iObject } from './objectHandlers/iObject';
import { tileMetaObj } from './Tile/tileMeteObj';
import { room1 } from '../scenes/test';
import { task } from './tools/task';
import { scene_home } from '../scenes/scene_home';
import { collisionSlopeLeft } from '../objects/blocks/collisionSlopeLeft';

declare var LZString: any;


export class gameRunner {
    app: PIXI.Application;
    logicModule: roomEvent;
    tasker: task = new task();
    gameContainerElement: HTMLElement;
    objContainer: objectContainer;
    tileContainer: iObject[] = [];
    generateObjects: objectGenerator = new objectGenerator();
    readonly targetFps: number = 30;
    fpsLimiter: number = 0;
    frameDelay: number = 0;

    constructor(gameContainer: string, gameProperties: gameSettings, app: PIXI.Application){
        this.app = new PIXI.Application({
            antialias: false
        });
        this.objContainer = new objectContainer();
        gameProperties.applySettings(this.app);
        this.gameContainerElement = document.getElementById(gameContainer) as HTMLElement;
        this.gameContainerElement.appendChild(this.app.view);

        //this.graphicsModule = new graphics(this.canvasContext);
        this.logicModule = new roomEvent(this.gameContainerElement, this.objContainer, this.tasker);

        this.app.ticker.add((delta: any) => {
            if(this.fpsLimiter == 0){
                this.logicModule.deltaTime = delta;
                roomEvent.tick();
                this.tasker.tick(this.logicModule);
                this.logicModule.queryKey();
                this.objContainer.loopThrough(this.logicModule);
                this.objContainer.populateFromList();
                this.objContainer.purgeObjects();
                this.fpsLimiter = this.frameDelay;

                if(this.logicModule.camera.getIsInUse()){
                    this.app.stage.pivot.x = Math.floor(this.logicModule.camera.getX() + this.logicModule.camera.cameraOffsetX);
                    this.app.stage.pivot.y = Math.floor(this.logicModule.camera.getY() + this.logicModule.camera.cameraOffsetY);
                    this.app.stage.position.x = this.app.renderer.width/2;
                    this.app.stage.position.y = this.app.renderer.height/2;

                }


                for(let t of this.tileContainer){
                    if(roomEvent.getTicks() % t.tileStepTime == 0){
                        (t as tileMetaObj).animate();
                    }
                }


                this.logicModule.camera.moveCamera();
                
            }
            if(this.fpsLimiter > 0){
                this.fpsLimiter--;
            }
            
        });

        this.loadRoom(JSON.parse(LZString.decompressFromEncodedURIComponent(scene_home)));
    }


    loadRoom(layers: layer[]){
        this.objContainer.removeObjects();

        
        for(let layer of layers){
            let pixiContainerLayer = new PIXI.Container();
            this.objContainer.addContainerForLayer(pixiContainerLayer, layer.zIndex, layer.layerName);
            for(let objMeta of layer.metaObjectsInLayer){
                if(objMeta.isPartOfCombination == false){
                    let genObj:objectBase = this.generateObjects.generateObject(objMeta.name, Math.floor(objMeta.x), Math.floor(objMeta.y), objMeta.tile);
                    if(genObj != null){
                        if(genObj.isTile == false){
                            this.objContainer.addObjectDirectly(genObj, layer.zIndex, layer.hidden);    
                        }else{
                            this.tileContainer.push(genObj);
                            if(layer.hidden == false){
                                pixiContainerLayer.addChild(genObj.g);
                            }
                        }
                    }
                }
                
            }
            
            this.app.stage.addChild(pixiContainerLayer);
        }


        this.app.stage.addChild(this.logicModule.interaction.inputContainer)
        /*for(var i=0; i<roomData.length; i++){
            var objDTO: objectMetaData = roomData[i];
            if(objDTO.isPartOfCombination == false){
                let genObj:objectBase = this.generateObjects.generateObject(objDTO.name, objDTO.x, objDTO.y, objDTO.tile);
                if(genObj != null){
                    this.objContainer.addObject(genObj, 0);
                    this.app.stage.addChild(genObj.g);
                }
            }
        }*/
    }



}