import * as PIXI from 'pixi.js'


type updateFuncType = (a: PIXI.AnimatedSprite) => void;
export class spriteContainer{
    currentSpriteObj: PIXI.AnimatedSprite | null = null;

    set(newSprite:PIXI.AnimatedSprite | null){
        this.currentSpriteObj = newSprite;
    }

    update(updateFunc: updateFuncType){
        if(this.currentSpriteObj != null){
            updateFunc(this.currentSpriteObj);
        }
    }
}