import * as PIXI from 'pixi.js'
import { gameSettings } from "./gameSettings";
import { roomEvent } from "./roomEvent/roomEvent";
import { task } from './tools/task';
import {GodrayFilter} from '@pixi/filter-godray';
import { ticker } from './ticker';
import { gameStartRoom } from '../scenes/gameStartRoom';

declare var LZString: any;


export class gameRunner {
    private app: PIXI.Application;
    private logicModule: roomEvent;
    private tasker: task = new task();
    private gameContainerElement: HTMLElement;
    /*readonly targetFps: number = 60;
    private fpsLimiter: number = 0;
    private frameDelay: number = 0;*/

    godrayFilter = new GodrayFilter({
        lacunarity: 2.5,
        gain: 0.5,  
        time: 0,
        alpha: 0.8
    });

    constructor(gameContainer: string, gameProperties: gameSettings, app: PIXI.Application){
        this.gameContainerElement = document.getElementById(gameContainer) as HTMLElement;
        this.app = app;
        this.app.renderer.view.width = 1280;
        this.app.renderer.view.height = 720;
        

        /*this.app.renderer.view.style.width = 1280 + "px";
        this.app.renderer.view.style.height = 720 + "px"*/

        
        this.gameContainerElement.appendChild(this.app.view);

        //this.graphicsModule = new graphics(this.canvasContext);
        this.logicModule = new roomEvent(this.gameContainerElement, this.tasker, this.app);

        var mainTicker = this.app.ticker.add((delta: any) => {
            //if(this.fpsLimiter == 0){
                this.logicModule.deltaTime = delta;
                ticker.tick();
                this.tasker.tick(this.logicModule);

                if(this.logicModule.storedTargetScene[0] != ""){
                    let roomName = this.logicModule.storedTargetScene[0];
                    this.logicModule.storedTargetScene[0] = "";
                    this.logicModule.loadRoom(roomName, this.logicModule.storedTargetScene[1]);
                }

                this.logicModule.queryKey();
                this.logicModule.loopThrough();
                this.logicModule.handleObjectsEndStep();
                //this.fpsLimiter = this.frameDelay;

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
            /*}
            if(this.fpsLimiter > 0){
                this.fpsLimiter--;
            }*/
            
        });


        this.logicModule.loadRoom(gameStartRoom, []);
    }


    



}