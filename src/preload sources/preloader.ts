import { objectGenerator } from "../objectGenerator";
import { resourceMeta } from "./resourceMeta";


export class preloader{
    app: PIXI.Application;
    objectGen: objectGenerator = new objectGenerator();

    constructor(app: PIXI.Application){
        this.app = app;


        let allObjects = this.objectGen.getAvailibleObjects();
        allObjects.forEach(objGen => {
            let obj = objGen(0, 0);

            var spriteSheet = obj.spriteSheet;
            if(spriteSheet != null){
                this.app.loader.add(spriteSheet?.resourceName, "resources\\"+spriteSheet?.resourceName);
            }
            
        });

        this.app.loader.load((e: any) => {
            console.log("Done loading", e);
        });


    }


    
}