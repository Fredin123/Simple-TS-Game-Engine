import { objectBase } from "../../engine/objectHandlers/objectBase";
import * as PIXI from 'pixi.js'
import { boxCollider } from "../../engine/objectHandlers/boxCollider";
import { resourceMeta } from "../../engine/preload sources/resourceMeta";
import { vector } from "../../engine/vector/vector";
import { roomEvent } from "../../engine/roomEvent";

export class block extends objectBase{
    switch: boolean = false;
    static objectName = "block";
    friction = 0.973;

    constructor(xp: number, yp: number) {
        super(xp, yp, block.objectName);
        super.setCollision(0, 0, 128, 128);

        super.style((g: PIXI.Container) => {
            let newGraphics = new PIXI.Graphics();

            newGraphics.beginFill(0x000000); 
            newGraphics.drawRect(0, 0, 128, 128);
            newGraphics.endFill();
            g.addChild(newGraphics);
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