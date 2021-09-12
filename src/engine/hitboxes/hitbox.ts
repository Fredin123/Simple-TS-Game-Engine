import * as PIXI from 'pixi.js'
import { calculations } from '../calculations';
import { iVector } from '../dataObjects/vector/iVector';
import { internalFunction } from '../internalFunctions';
import { iObject } from '../objectHandlers/iObject';
import { objectBase } from '../objectHandlers/objectBase';
import { resourcesHand } from '../preload sources/resourcesHand';
import { roomEvent } from '../roomEvent';
import { dummySandbag } from '../../objects/dummySandbag';
import { mio } from '../../objects/mio';

export class hitbox extends objectBase{
    switch: boolean = false;
    static objectName = "hitbox";
    friction = 0.0;
    private haveHitThese: string[] = [];
    private startupTime: number = 0;


    life: number = 10;
    private targets = [dummySandbag.objectName];
    creator: iObject | null = null;
    private offsetX: number = 0;
    private offsetY: number = 0;
    hitboxDirection: iVector | null = null;
    aerial: boolean = false;
    type: string = "";

    constructor(xp: number, yp: number, input: string) {
        super(xp, yp, hitbox.objectName);
    }


    public static initialize({ startupTime, x, y, creator, life, size, offset, hitboxDirection , aerial, type}: 
        { startupTime: number; x: number; y: number; creator: iObject; life: number; size: [number, number]; offset: [number, number]; 
            hitboxDirection: iVector; aerial: boolean; type:string;}){
        let newHitbox: hitbox = new hitbox(x, y, "");
        newHitbox.startupTime = startupTime;
        newHitbox.type = type;
        newHitbox.creator = creator;
        newHitbox.life = life;
        newHitbox.setSize(size[0], size[1]);
        newHitbox.setOffset(offset[0], offset[1]);
        newHitbox.hitboxDirection = hitboxDirection;
        newHitbox.aerial = aerial;
        


        return newHitbox;
    }

    getStartupTime(){
        return this.startupTime;
    }

    setOffset(offX: number, offY: number){
        this.offsetX = offX;
        this.offsetY = offY;
    }

    setSize(width: number, height: number){
        super.setCollision(0, 0, width, height);

        super.style((g: PIXI.Container) => {
            let newGraphics = new PIXI.Graphics();

            newGraphics.beginFill(0x00FF50); 
            newGraphics.drawRect(0, 0, width, height);
            newGraphics.endFill();
            g.addChild(newGraphics);
            return g;
        });

    }

    logic(l: roomEvent){
        this.life--;
        

        if(this.creator != null){


            this.moveWithCreator();
            

            if(this.life <= 0){
                l.deleteObject(this);
            }else{
                for(let t of this.targets){
                    l.foreachObjectType(t, (obj: objectBase) => {
                        if(this.haveHitThese.indexOf(obj.ID) == -1 
                        && internalFunction.intersecting(this, this.collisionBox, obj)){
                            this.haveHitThese.push(obj.ID);
                            if(this.hitboxDirection != null){

                                /*if(this.type == "sword"){
                                    resourcesHand.playAudioVolume("WeaponImpact1.ogg", 0.25);
                                }*/

                                if((this.creator as mio).facingRight){
                                    obj.addForceAngleMagnitude(this.hitboxDirection?.delta, this.hitboxDirection?.magnitude);
                                }else{
                                    obj.addForceAngleMagnitude(calculations.PI-this.hitboxDirection?.delta, this.hitboxDirection?.magnitude);
                                }
                                
                            }
                        }
                        return true;
                    });
                }
            }

        }else{
            l.deleteObject(this);
        }
        
    };


    moveWithCreator(){
        if(this.creator != null){


            this.g.x = this.creator.g.x+(this.creator.collisionBox.width/2) - (this.collisionBox.width / 2);
            this.g.y = this.creator.g.y+this.creator.collisionBox.height/2;
            if((this.creator as mio).facingRight){
                this.g.x += this.offsetX;
                this.g.y += this.offsetY;
            }else{
                this.g.x -= this.offsetX;
                this.g.y += this.offsetY;
            }
        }
    }


}