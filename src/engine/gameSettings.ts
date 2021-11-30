import * as PIXI from 'pixi.js'

export class gameSettings{
    stretchToWindow: boolean = false;
    app: PIXI.Application | undefined;

    applySettings(a: PIXI.Application){
        this.app = a;
        this.app.renderer.backgroundColor = 0xFFFFFF;

        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
        PIXI.settings.PRECISION_FRAGMENT = PIXI.PRECISION.LOW;
        PIXI.settings.ROUND_PIXELS = true;
        //PIXI.settings.TARGET_FPMS = 0.06;
        
        /*if(this.stretchToWindow){
            this.windowStretchListener();
            window.addEventListener("resize", this.windowStretchListener.bind(this));
        }*/
    }

    /*windowStretchListener(){
        if(this.stretchToWindow){
            this.app!.view.width = window.innerWidth;
            this.app!.view.height = window.innerHeight;
        }
    }*/
}