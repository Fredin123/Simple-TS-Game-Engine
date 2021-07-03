import { resourcesHand } from "../preload sources/resourcesHand";
import * as PIXI from 'pixi.js'

export class interaction{
    isInUse = false;
    inputContainer: PIXI.Container = new PIXI.Container();

    openText(text: string){
        this.isInUse = true;

        let newAnimation = resourcesHand.getStaticTile("panel_1");
        if(newAnimation != null){
            this.inputContainer.addChild(newAnimation);
        }
        
    }


}