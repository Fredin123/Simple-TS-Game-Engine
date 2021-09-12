import { resourcesHand } from "../preload sources/resourcesHand";
import * as PIXI from 'pixi.js'

export class interaction{
    private isInUse = false;
    private inputContainer: PIXI.Container;


    constructor(inputContainer: PIXI.Container){
        this.inputContainer = inputContainer;
    }

    openText(text: string){
        this.isInUse = true;

        let newAnimation = resourcesHand.getStaticTile("panel_1");
        if(newAnimation != null){
            this.inputContainer.addChild(newAnimation);
        }
        
    }


}