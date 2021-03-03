import { objectBase } from "../../objectHandlers/objectBase";
import { roomEvent } from "../../roomEvent";
import * as PIXI from 'pixi.js'
import { boxCollider } from "../../objectHandlers/boxCollider";
import { resourceMeta } from "../../preload sources/resourceMeta";
import { vector } from "../../dataModules/vector/vector";

export class block extends objectBase{
    switch: boolean = false;
    static objectName = "block";
    friction = 0.973;

    constructor(xp: number, yp: number) {
        super(xp, yp, block.objectName);
        super.setCollision(0, 0, 16, 16);

        super.style((g: PIXI.Graphics) => {
            g.beginFill(0x000000); 
            g.drawRect(0, 0, 16, 16);
            g.endFill();
            return g;
        });
        
        /*setInterval(()=>{
            this.switch = !this.switch;
        }, 700);*/
    }

    logic(l: roomEvent){
        super.logic(l);
        /*if(this.switch){
            super.setNewForce(l.degreesToRadians(0), 3);
        }else{
            super.setNewForce(l.degreesToRadians(180), 3);
        }*/
    };



}