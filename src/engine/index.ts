import { gameSettings } from "./gameSettings";
import { gameRunner } from "./gameRunner";
import { logger } from "./logger";
import { resourcesHand } from "./preload sources/resources";


(function(){
    var app = new PIXI.Application();
    let gameProperties = new gameSettings();
    gameProperties.stretchToWindow = true;
    let runner: gameRunner;

    let resourceLoader: resourcesHand = new resourcesHand(app, () => {
        runner = new gameRunner("game", gameProperties, app);
    });
    

    logger.initialize();
})();


