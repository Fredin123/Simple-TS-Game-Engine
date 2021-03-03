import { objectBase } from "../../objectHandlers/objectBase";
import { roomEvent } from "../../roomEvent";
import * as PIXI from 'pixi.js'
import { boxCollider } from "../../objectHandlers/boxCollider";
import { resourceMeta } from "../../preload sources/resourceMeta";
import { vector } from "../../dataModules/vector/vector";
import { calculations } from "../../calculations";

export class movingBlockHori extends objectBase{
    switch: boolean = false;
    static objectName = "movingBlockHori";
    friction = 0.873;

    constructor(xp: number, yp: number) {
        super(xp, yp, movingBlockHori.objectName);
        super.setCollision(0, 0, 16, 16);

        super.style((g: PIXI.Graphics) => {
            g.beginFill(0x000000); 
            g.drawRect(0, 0, 16, 16);
            g.endFill();
            return g;
        });
        

    }

    logic(l: roomEvent){
        super.logic(l);
        //super.setNewForceAngleMagnitude(calculations.degreesToRadians(180), 3);
        if(this.switch){
            super.setNewForce(5, 0);
        }else{
            super.setNewForce(-5, 0);
        }


        if(l.getTicks() % 40 == 0){
            this.switch = !this.switch;
        }
    };



}