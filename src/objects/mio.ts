import { objectBase } from "../objectHandlers/objectBase";
import { graphics } from "../graphics";
import { roomEvent } from "../roomEvent";
import * as PIXI from 'pixi.js'
import { boxCollider } from "../objectHandlers/boxCollider";
import { block } from "./blocks/block";
import { resourceMeta } from "../preload sources/resourceMeta";
import { vector } from "../dataModules/vector/vector";
import { calculations } from "../calculations";
import { logger } from "../logger";
import { movingBlockHori } from "./blocks/movingBlockHori";
import { movingBlockVert } from "./blocks/movingBlockVert";
import { iVector } from "../dataModules/vector/iVector";
import { vectorFixedDelta } from "../dataModules/vector/vectorFixedDelta";

export class mio extends objectBase{
    static objectName = "mio";
    airFriction: number = 0.93;
    gravity: iVector = new vectorFixedDelta(calculations.degreesToRadians(270), 0);//vector.fromAngleAndMagnitude(calculations.degreesToRadians(270), 0.6);
    weight:number =  0.03;

    maxRunSpeed = 2;

    constructor(xp: number, yp: number) {
        super(xp, yp, mio.objectName);
        super.setCollision(0, 0, 16, 16);


        super.style((g: PIXI.Graphics) => {
            g.beginFill(0xFF3e50); 
            g.drawRect(0, 0, 16, 16);
            g.endFill();
            return g;
        });

        super.addCollisionTarget(block.objectName, movingBlockHori.objectName, movingBlockVert.objectName);
        //this.spriteSheet = new resourceMeta("player.jpg", 16, 16);
    }

    logic(l: roomEvent){
        super.logic(l);
        //logger.showMessage(JSON.stringify(this.gravity));
        /*let angleToMouse = l.b.angleBetweenPoints(this.y - l.mouseY()+8, this.x - l.mouseX()+8);
        
        let distanceToMouse = l.b.distanceBetweenPoints(this.x, this.y, l.mouseX()+8, l.mouseY()+8);
        let speed = distanceToMouse*0.08;
        if(speed > 23){
            speed = 23;
        }*/
        /*if(speed<1 && distanceToMouse > 1){
            speed = 1;
        }*/

        //this.updatePosition();
        //this.position = new vector(angleToMouse, speed);
        
        //l.moveByForce(this, this.movement, block.objectName);
        //super.setNewForceAngleMagnitude(angleToMouse, speed);

        
        if(l.checkKeyHeld("a")){
            super.addForceAngleMagnitude(calculations.degreesToRadians(180), 0.8);
        }
        if(l.checkKeyHeld("d")){
            super.addForceAngleMagnitude(calculations.degreesToRadians(0), 0.8);
        }

        if(l.checkKeyPressed("w")){
            super.addForceAngleMagnitude(calculations.degreesToRadians(90), 12);
        }

        this.force.limitHorizontalMagnitude(this.maxRunSpeed);
        
    }



}