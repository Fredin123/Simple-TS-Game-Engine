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
import { ticker } from './ticker';

declare var LZString: any;


export class gameRunner {
    private app: PIXI.Application;
    private logicModule: roomEvent;
    private tasker: task = new task();
    private gameContainerElement: HTMLElement;
    readonly targetFps: number = 60;
    private fpsLimiter: number = 0;
    private frameDelay: number = 0;

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

        gameProperties.applySettings(this.app);
        this.gameContainerElement.appendChild(this.app.view);

        //this.graphicsModule = new graphics(this.canvasContext);
        this.logicModule = new roomEvent(this.gameContainerElement, this.tasker, this.app);

        this.app.ticker.add((delta: any) => {
            if(this.fpsLimiter == 0){
                this.logicModule.deltaTime = delta;
                ticker.tick();
                this.tasker.tick(this.logicModule);
                this.logicModule.queryKey();
                this.logicModule.loopThrough();
                this.logicModule.handleObjectsEndStep();
                this.fpsLimiter = this.frameDelay;

                if(this.logicModule.isCameraInUse()){
                    this.app.stage.pivot.x = Math.floor(this.logicModule.getCameraX() + this.logicModule.getCameraOffsetX());
                    this.app.stage.pivot.y = Math.floor(this.logicModule.getCameraY() + this.logicModule.getCameraOffsetX());
                    this.app.stage.position.x = this.app.renderer.width/2;
                    this.app.stage.position.y = this.app.renderer.height/2;
                }


                this.logicModule.animateTiles();


                this.logicModule.moveCamera();
                this.logicModule.updateLayerOffsets();
                
                //this.godrayFilter.time += 0.005 * delta;
            }
            if(this.fpsLimiter > 0){
                this.fpsLimiter--;
            }
            
        });

        this.logicModule.loadRoom(scene_home, "");
    }


    



}