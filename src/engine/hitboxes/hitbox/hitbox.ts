import * as PIXI from 'pixi.js'
import { calculations } from '../../calculations';
import { iVector } from '../../dataObjects/vector/iVector';
import { nullVector } from '../../dataObjects/vector/nullVector';
import { vectorFixedDelta } from '../../dataObjects/vector/vectorFixedDelta';
import { internalFunction } from '../../internalFunctions';
import { iObject } from '../../objectHandlers/iObject';
import { nulliObject } from '../../objectHandlers/nulliObject';
import { objectBase } from '../../objectHandlers/objectBase';
import { objectFunctions } from '../../objectHandlers/objectFunctions';
import { roomEvent } from '../../roomEvent/roomEvent';

export class hitbox extends objectBase{
    switch: boolean = false;
    static objectName = "hitbox";
    friction = 0.0;
    private color: number = 0x000000;
    private hitDirection: iVector = new nullVector();
    private targets: string[] = [];
    private haveHitThese: string[] = [];
    private userFaceRight: (() => boolean) = () => {return true;};

    constructor(xp: number, yp: number, input: string) {
        super(xp, yp, hitbox.objectName);
    }

    static new(size: number[], angle: number, magnitude: number, targets: string[], userFaceRight: (() => boolean)){
        let newHitbox = new hitbox(0, 0, "");
        newHitbox.setSize(size[0], size[1]);
        newHitbox.hitDirection = new vectorFixedDelta(calculations.degreesToRadians(angle), magnitude);
        newHitbox.targets = targets;
        newHitbox.userFaceRight = userFaceRight;
        return newHitbox;
    }

    setSize(width: number, height: number){
        console.log("height ",height);
        super.setCollision(0, 0, width, height);

        super.style((g: PIXI.Container) => {
            let newGraphics = new PIXI.Graphics();

            newGraphics.beginFill(this.color); 
            newGraphics.drawRect(0, 0, width, height);
            newGraphics.endFill();
            g.addChild(newGraphics);
            return g;
        });

    }

    logic(l: objectFunctions){
        for(let t of this.targets){
            l.foreachObjectType(t, (obj: iObject) => {
                if(this.haveHitThese.indexOf(obj.ID) == -1 
                && internalFunction.intersecting(this, this.collisionBox, obj)){
                    this.haveHitThese.push(obj.ID);
                    if(this.hitDirection != null){

                        /*if(this.type == "sword"){
                            resourcesHand.playAudioVolume("WeaponImpact1.ogg", 0.25);
                        }*/
                        obj.gravity.magnitude = 0;
                        if(this.userFaceRight()){
                            obj.addForceAngleMagnitude(this.hitDirection.delta, this.hitDirection.magnitude);
                        }else{
                            obj.addForceAngleMagnitude(calculations.PI-this.hitDirection.delta, this.hitDirection.magnitude);
                        }
                        
                    }
                }
                return true;
            });
        }
        
    };


    /*moveWithCreator(creator: iObject){
        this.g.x = creator.g.x+(creator.collisionBox.width/2) - (this.collisionBox.width / 2);
        this.g.y = creator.g.y+creator.collisionBox.height/2;
        if((this.creator as mio).facingRight){
            this.g.x += this.offsetX;
            this.g.y += this.offsetY;
        }else{
            this.g.x -= this.offsetX;
            this.g.y += this.offsetY;
        }
    }*/


}