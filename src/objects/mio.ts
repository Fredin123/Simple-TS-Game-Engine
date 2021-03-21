import { objectBase } from "../engine/objectHandlers/objectBase";
import * as PIXI from 'pixi.js'
import { block } from "./blocks/block";
import { movingBlockHori } from "./blocks/movingBlockHori";
import { movingBlockVert } from "./blocks/movingBlockVert";
import { iVector } from "../engine/vector/iVector";
import { vectorFixedDelta } from "../engine/vector/vectorFixedDelta";
import { calculations } from "../engine/calculations";
import { roomEvent } from "../engine/roomEvent";
import { resources } from "../engine/preload sources/resources";




export class mio extends objectBase{
    static objectName = "mio";
    airFriction: number = 0.93;
    gravity: iVector = new vectorFixedDelta(calculations.degreesToRadians(270), 0);//vector.fromAngleAndMagnitude(calculations.degreesToRadians(270), 0.6);
    weight:number =  0.03;

    maxRunSpeed = 2;

    

    constructor(xp: number, yp: number) {
        super(xp, yp, mio.objectName);
        super.setCollision(0, 0, 128, 128);


        super.style((g: PIXI.Container) => {
            let newGraphics = new PIXI.Graphics();

            newGraphics.beginFill(0xFF3e50); 
            newGraphics.drawRect(0, 0, 128, 128);
            newGraphics.endFill();
            g.addChild(newGraphics);

            
            let animation = resources.getAnimatedSprite("playerWalk");
            if(animation != null){
                animation!.animationSpeed = 0.1;
                animation!.play();
                g.addChild(animation);
            }
            

            
            g.filters = [];
            g.calculateBounds();

            return g;
        });

        super.addCollisionTarget(block.objectName, movingBlockHori.objectName, movingBlockVert.objectName);
    }

    logic(l: roomEvent){
        super.logic(l);

        
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

        l.useCamera = true;
        l.cameraX = this.g.x;
        l.cameraY = this.g.y;
        
    }



}