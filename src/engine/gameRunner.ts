import * as PIXI from 'pixi.js'
import { gameSettings } from "./gameSettings";
import { roomEvent } from "./roomEvent";
import { objectGenerator } from '../shared/objectGenerator';
import { objectContainer } from './objectHandlers/objectContainer';
import { objectBase } from './objectHandlers/objectBase';
import { iObject } from './objectHandlers/iObject';
import { tileMetaObj } from './Tile/tileMeteObj';
import { task } from './tools/task';
import { scene_home } from '../scenes/scene_home';
import { roomData } from '../shared/roomData';
import {TiltShiftFilter} from '@pixi/filter-tilt-shift';
import {GodrayFilter} from '@pixi/filter-godray';
import {AdvancedBloomFilter} from '@pixi/filter-advanced-bloom';
import {BloomFilter} from '@pixi/filter-bloom';
import {AdjustmentFilter} from '@pixi/filter-adjustment';
import {SimpleLightmapFilter} from '@pixi/filter-simple-lightmap';

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
    private cameraBounds = [0, 0, 0, 0];

    godrayFilter = new GodrayFilter({
        lacunarity: 2.5,
        gain: 0.5,  
        time: 0,
        alpha: 0.8
    });

    constructor(gameContainer: string, gameProperties: gameSettings, app: PIXI.Application){
        this.gameContainerElement = document.getElementById(gameContainer) as HTMLElement;
        this.app = new PIXI.Application({
            antialias: false,
            autoDensity: false
        });
        this.app.renderer.view.width = 806;
        this.app.renderer.view.height = 504;

        this.app.renderer.view.style.width = 806 + "px";
        this.app.renderer.view.style.height = 504 + "px"


        
        //PIXI.settings.PRECISION_FRAGMENT = PIXI.PRECISION.HIGH;
        PIXI.settings.ROUND_PIXELS = true;

        this.objContainer = new objectContainer();
        gameProperties.applySettings(this.app);
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


                this.logicModule.camera.moveCamera(this.app, this.cameraBounds);
                this.objContainer.updateLayerOffsets(this.logicModule.camera, this.app);
                
                //this.godrayFilter.time += 0.005 * delta;
            }
            if(this.fpsLimiter > 0){
                this.fpsLimiter--;
            }
            
        });

        this.loadRoom(JSON.parse(LZString.decompressFromEncodedURIComponent(scene_home)));
    }


    loadRoom(loadRoom: roomData){
        this.objContainer.removeObjects();

        this.cameraBounds[0] = loadRoom.cameraBoundsX ?? 0;
        this.cameraBounds[1] = loadRoom.cameraBoundsY ?? 0;
        this.cameraBounds[2] = loadRoom.cameraBoundsWidth ?? 0;
        this.cameraBounds[3] = loadRoom.cameraBoundsHeight ?? 0;

        
        this.app.renderer.backgroundColor = parseInt(loadRoom.backgroundColor.replace("#", "0x"));
        
        for(let layer of loadRoom.layerData){
            let pixiContainerLayer = new PIXI.Container();
            let objectsToAdd = [];
            let containsOnlyStaticTiles = true;
            let layerSettings = JSON.parse(layer.settings);
            this.objContainer.addContainerForLayer(pixiContainerLayer, layer.zIndex, layer.layerName, layerSettings.scrollSpeedX, layerSettings.scrollSpeedY);
            for(let objMeta of layer.metaObjectsInLayer){
                if(objMeta.isPartOfCombination == false){
                    let genObj:objectBase = this.generateObjects.generateObject(objMeta.name, Math.floor(objMeta.x), Math.floor(objMeta.y), objMeta.tile);
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
                //pixiContainerLayer.cacheAsBitmap = true;
                if(pixiContainerLayer.filters == null){
                    pixiContainerLayer.filters = [];
                }
                /*pixiContainerLayer.filters.push(new AdvancedBloomFilter({
                    quality: 4,
                    pixelSize: 1
                }));*/
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
                /*new PIXI.filters.NoiseFilter(0.099)*/ /*this.godrayFilter*//*new AdvancedBloomFilter({
                quality: 4,
                bloomScale: 4,
                blur: 6,
                threshold: 0.5
            })*/
                //new BloomFilter()
            ];
            this.app.stage.addChild(pixiContainerLayer);
        }

        /*new TiltShiftFilter(
                    50,//Blur 
                    900,//gradientBlur 
                    start,//Start 
                    end)//end
                     */

        this.app.stage.addChild(this.logicModule.interaction.inputContainer)

    }



}