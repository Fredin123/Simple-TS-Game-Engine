import { objectBase } from "../../engine/objectHandlers/objectBase";
import * as PIXI from 'pixi.js'
import { boxCollider } from "../../engine/objectHandlers/boxCollider";
import { resourceMeta } from "../../engine/preload sources/resourceMeta";
import { vector } from "../../engine/vector/vector";
import { roomEvent } from "../../engine/roomEvent";

export class movingBlockHori extends objectBase{
    switch: boolean = false;
    static objectName = "movingBlockHori";
    friction = 0.873;
    stickyTop: boolean = true;

    constructor(xp: number, yp: number) {
        super(xp, yp, movingBlockHori.objectName);
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
        //super.setNewForceAngleMagnitude(calculations.degreesToRadians(180), 3);
        if(this.switch){
            super.setNewForce(2, 0);
        }else{
            super.setNewForce(-2, 0);
        }


        if(roomEvent.getTicks() % 20 == 0){
            this.switch = !this.switch;
        }
    };



}