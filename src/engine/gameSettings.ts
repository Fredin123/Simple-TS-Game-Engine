

export class gameSettings{
    stretchToWindow: boolean = false;
    fixedCanvasWidth: number = 640;
    fixedCanvasHeight: number = 640;
    app: PIXI.Application | undefined;

    applySettings(a: PIXI.Application){
        this.app = a;
        this.app.renderer.backgroundColor = 0xFFFFFF;

        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
        
        if(this.stretchToWindow){
            this.windowStretchListener();
            window.addEventListener("resize", this.windowStretchListener.bind(this));
        }
    }

    windowStretchListener(){
        if(this.stretchToWindow){
            this.app!.view.width = window.innerWidth;
            this.app!.view.height = window.innerHeight;
        }
    }
}