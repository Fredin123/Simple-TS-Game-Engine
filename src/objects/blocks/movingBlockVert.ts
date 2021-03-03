import { objectBase } from "../../objectHandlers/objectBase";
import { roomEvent } from "../../roomEvent";
import * as PIXI from 'pixi.js'
import { boxCollider } from "../../objectHandlers/boxCollider";
import { resourceMeta } from "../../preload sources/resourceMeta";
import { vector } from "../../dataModules/vector/vector";
import { calculations } from "../../calculations";

export class movingBlockVert extends objectBase{
    switch: boolean = false;
    static objectName = "movingBlockVert";
    friction = 0.873;
    stickyness: number = 1;

    constructor(xp: number, yp: number) {
        super(xp, yp, movingBlockVert.objectName);
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
        if(this.switch){
            super.setNewForceAngleMagnitude(calculations.degreesToRadians(90), 2);
        }else{
            super.setNewForceAngleMagnitude(calculations.degreesToRadians(270), 2);
        }

        if(l.getTicks() % 55 == 0){
            this.switch = !this.switch;
        }
    };



}