import { objectBase } from "../objectHandlers/objectBase";
import * as PIXI from 'pixi.js'
import { roomEvent } from "../roomEvent";
import { resourcesHand } from "../preload sources/resourcesHand";
import { subTileMeta } from "../../shared/tile/subTileMeta";
import { tileAnimation } from "../../shared/tile/tileAnimation";

export class tileMetaObj extends objectBase{
    static objectName = "tileMetaObj";
    isTile = true;
    animation: tileAnimation | null = null;

    private currentTileIndex = 0;

    constructor(xp: number, yp: number) {
        super(xp, yp, tileMetaObj.objectName);
        
    }

    logic(l: roomEvent){
        return;
    };


    public setTiles(tAnim: tileAnimation){
        
        super.style((g: PIXI.Container) => {

            if(tAnim.tiles.length == 1){
                let animation = resourcesHand.getStaticTile(tAnim.tiles[0].resourceName);
                if(animation != null){
                    g.addChild(animation);
                }else{
                    console.log("animation is null: ", tAnim);
                }
            }else if(tAnim.tiles.length > 1){
                console.log("tAnim: ",tAnim);
                resourcesHand.generateAnimatedTiles(tAnim);
                let animation = resourcesHand.getAnimatedTile(tAnim.name);
                if(animation != null){
                    console.log("tAnim.animationSpeed: ",tAnim.animationSpeed);
                    animation!.animationSpeed = 0;
                    if(tAnim.animationSpeed > 0){
                        animation!.animationSpeed = (60/(tAnim.animationSpeed*60))/60;
                    }
                    
                    animation!.play();
                    animation.roundPixels = false;
                    g.addChild(animation);
                }
            }
            
            
            
            return g;
        });

    }

    public animate(){
        this.currentTileIndex += 1;
    }

}