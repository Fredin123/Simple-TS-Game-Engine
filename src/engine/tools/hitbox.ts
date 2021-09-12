import * as PIXI from 'pixi.js'
import { calculations } from '../../engine/calculations';
import { iVector } from '../../engine/dataObjects/vector/iVector';
import { internalFunction } from '../../engine/internalFunctions';
import { iObject } from '../../engine/objectHandlers/iObject';
import { objectBase } from '../../engine/objectHandlers/objectBase';
import { resourcesHand } from '../../engine/preload sources/resourcesHand';
import { roomEvent } from '../../engine/roomEvent';

export class hitbox extends objectBase{
    switch: boolean = false;
    static objectName = "hitbox";
    friction = 0.0;
    private haveHitThese: string[] = [];

    life: number = 10;
    private targets: string[] = [];
    creator: iObject | null = null;
    private offsetX: number = 0;
    private offsetY: number = 0;
    hitboxDirection: iVector | null = null;
    aerial: boolean = false;
    type: string = "";

    constructor(xp: number, yp: number) {
        super(xp, yp, hitbox.objectName);
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
                l.objContainer.deleteObject(this);
            }else{
                for(let t of this.targets){
                    l.foreachObjectType(t, (obj: objectBase) => {
                        if(this.haveHitThese.indexOf(obj.ID) == -1 
                        && internalFunction.intersecting(this, this.collisionBox, obj)){
                            this.haveHitThese.push(obj.ID);
                            if(this.hitboxDirection != null){

                                if(this.type == "sword"){
                                    resourcesHand.playAudioVolume("WeaponImpact1.ogg", 0.25);
                                }

                                obj.addForceAngleMagnitude(this.hitboxDirection?.delta, this.hitboxDirection?.magnitude);
                                
                            }
                        }
                        return true;
                    });
                }
            }

        }else{
            l.objContainer.deleteObject(this);
        }
        
    };


    moveWithCreator(){
        if(this.creator != null){


            this.g.x = this.creator.g.x+(this.creator.collisionBox.width/2) - (this.collisionBox.width / 2);
            this.g.y = this.creator.g.y+this.creator.collisionBox.height/2;
            
            this.g.x += this.offsetX;
            this.g.y += this.offsetY;
        }
    }


}