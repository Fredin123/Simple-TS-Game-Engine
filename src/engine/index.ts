import { gameSettings } from "./gameSettings";
import { gameRunner } from "./gameRunner";
import { logger } from "./logger";
import { resourcesHand } from "./preload sources/resourcesHand";
import * as PIXI from 'pixi.js'


(function(){
    var app = new PIXI.Application({
        antialias: true,
        autoDensity: false,
        width: 1280,
        height: 720
        //resolution: window.devicePixelRatio,
    });
    let gameProperties = new gameSettings();
    gameProperties.stretchToWindow = true;
    gameProperties.applySettings(app);
    let runner: gameRunner;

    let resourceLoader: resourcesHand = new resourcesHand(app, () => {
        runner = new gameRunner("game", gameProperties, app);
    });
    

    //logger.initialize();
})();


