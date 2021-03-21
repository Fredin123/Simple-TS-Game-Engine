import * as PIXI from 'pixi.js'
import { gameSettings } from "./gameSettings";
import { graphics } from "./graphics";
import { roomEvent } from "./roomEvent";
import { objectGenerator } from '../objectGenerator';
import { Room } from "./Room";
import { objectContainer } from './objectHandlers/objectContainer';
import { objectBase } from './objectHandlers/objectBase';
import { objectMetaData } from '../developerTools/src/objectMetaData';
declare var LZString: any;


export class gameRunner {
    app: PIXI.Application;
    logicModule: roomEvent;
    gameContainerElement: HTMLElement;
    objContainer: objectContainer;
    generateObjects: objectGenerator = new objectGenerator();
    readonly targetFps: number = 30;
    fpsLimiter: number = 0;
    frameDelay: number = 0;

    constructor(gameContainer: string, gameProperties: gameSettings, app: PIXI.Application){
        this.app = new PIXI.Application();
        this.objContainer = new objectContainer();
        gameProperties.applySettings(this.app);
        this.gameContainerElement = document.getElementById(gameContainer) as HTMLElement;
        this.gameContainerElement.appendChild(this.app.view);

        //this.graphicsModule = new graphics(this.canvasContext);
        this.logicModule = new roomEvent(this.gameContainerElement, this.objContainer);

        this.app.ticker.add((delta: any) => {
            if(this.fpsLimiter == 0){
                this.logicModule.deltaTime = delta;
                roomEvent.tick();
                this.logicModule.queryKey();
                this.objContainer.loopThrough(this.logicModule);
                this.objContainer.purgeObjects();
                this.fpsLimiter = this.frameDelay;

                if(this.logicModule.useCamera){
                    this.app.stage.pivot.x = this.logicModule.cameraX;
                    this.app.stage.pivot.y = this.logicModule.cameraY;
                    this.app.stage.position.x = this.app.renderer.width/2;
                    this.app.stage.position.y = this.app.renderer.height/2;
                }
                
            }
            if(this.fpsLimiter > 0){
                this.fpsLimiter--;
            }
            
        });

        //this.loadRoom(JSON.parse(LZString.decompressFromEncodedURIComponent(room1)));
        //this.loadRoom(JSON.parse(LZString.decompressFromUTF16(room1)));
    }


    loadRoom(roomData: objectMetaData[]){
        this.objContainer.removeObjects();
        for(var i=0; i<roomData.length; i++){
            var objDTO: objectMetaData = roomData[i];
            
            let genObj:objectBase = this.generateObjects.generateObject(objDTO.name, objDTO.x, objDTO.y);
            if(genObj != null){
                this.objContainer.addObject(genObj, 0);
                this.app.stage.addChild(genObj.g);
            }
            
        }
    }



}