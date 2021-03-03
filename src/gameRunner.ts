import * as PIXI from 'pixi.js'
import { objectMetaData } from './developerTools/objectMetaData';
import { gameSettings } from "./gameSettings";
import { graphics } from "./graphics";
import { objectBase } from "./objectHandlers/objectBase";
import { roomEvent } from "./roomEvent";
import { objectGenerator } from './objectGenerator';
import { Room } from "./Room";
import { room1 } from "./scenes/room1";
import { objectContainer } from './objectHandlers/objectContainer';
declare var LZString: any;


export class gameRunner {
    app: PIXI.Application;
    logicModule: roomEvent;
    gameContainerElement: HTMLElement;
    objContainer: objectContainer;
    generateObjects: objectGenerator = new objectGenerator();
    readonly targetFps: number = 60;

    constructor(gameContainer: string, gameProperties: gameSettings, app: PIXI.Application){
        this.app = new PIXI.Application();
        this.objContainer = new objectContainer();
        gameProperties.applySettings(this.app);
        this.gameContainerElement = document.getElementById(gameContainer) as HTMLElement;
        this.gameContainerElement.appendChild(this.app.view);

        //this.graphicsModule = new graphics(this.canvasContext);
        this.logicModule = new roomEvent(this.gameContainerElement, this.objContainer);

        this.app.ticker.add(() => {
            this.logicModule.tick();
            this.logicModule.queryKey();
            this.objContainer.loopThrough(this.logicModule);
            this.objContainer.purgeObjects();
        });

        this.loadRoom(JSON.parse(LZString.decompressFromEncodedURIComponent(room1)));
        //this.loadRoom(JSON.parse(LZString.decompressFromUTF16(room1)));
    }


    loadRoom(roomData: objectMetaData[]){
        console.log("Import this data: ", roomData);
        this.objContainer.removeObjects();
        for(var i=0; i<roomData.length; i++){
            var objDTO: objectMetaData = roomData[i];
            
            let genObj:objectBase = this.generateObjects.generateObject(objDTO.objectClassName, objDTO.x, objDTO.y);
            if(genObj != null){
                this.objContainer.addObject(genObj, 0);
                this.app.stage.addChild(genObj.g);
            }
            
        }
    }



}