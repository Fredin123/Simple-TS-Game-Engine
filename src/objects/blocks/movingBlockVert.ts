import { objectBase } from "../../engine/objectHandlers/objectBase";
import * as PIXI from 'pixi.js'
import { boxCollider } from "../../engine/objectHandlers/boxCollider";
import { resourceMeta } from "../../engine/preload sources/resourceMeta";
import { vector } from "../../engine/vector/vector";
import { roomEvent } from "../../engine/roomEvent";
import { calculations } from "../../engine/calculations";


export class movingBlockVert extends objectBase{
    switch: boolean = false;
    static objectName = "movingBlockVert";
    friction = 0.873;
    stickyTop: boolean = true;

    constructor(xp: number, yp: number) {
        super(xp, yp, movingBlockVert.objectName);
        super.setCollision(0, 0, 256, 256);

        super.style((g: PIXI.Container) => {
            let newGraphics = new PIXI.Graphics();

            newGraphics.beginFill(0x000000); 
            newGraphics.drawRect(0, 0, 256, 256);
            newGraphics.endFill();
            g.addChild(newGraphics);
            return g;
        });
        

    }

    logic(l: roomEvent){
        super.logic(l);
        if(this.switch){
            super.setNewForceAngleMagnitude(calculations.degreesToRadians(90), 1);
        }else{
            super.setNewForceAngleMagnitude(calculations.degreesToRadians(270), 1);
        }

        if(roomEvent.getTicks() % 55 == 0){
            this.switch = !this.switch;
        }
    };



}