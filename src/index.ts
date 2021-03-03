import { gameSettings } from "./gameSettings";
import { gameRunner } from "./gameRunner";
import { preloader } from "./preload sources/preloader";
import { logger } from "./logger";


(function(){
    var app = new PIXI.Application();

    let resourceLoader: preloader = new preloader(app);
    let gameProperties = new gameSettings();
    gameProperties.stretchToWindow = true;
    let runner: gameRunner = new gameRunner("game", gameProperties, app);

    logger.initialize();
})();


