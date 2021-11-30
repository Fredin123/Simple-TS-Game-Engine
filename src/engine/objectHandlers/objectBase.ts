import { vector } from "../dataObjects/vector/vector";
import { roomEvent } from "../roomEvent/roomEvent";
import { boxCollider } from "./collision/boxCollider";
import { uidGen } from "../tools/uidGen";
import { movementOperations } from "../movementOperations/movementOperations";
import { iObject } from "./iObject";
import { iVector } from "../dataObjects/vector/iVector";
import { calculations } from "../calculations";
import { resourcesHand } from "../preload sources/resourcesHand";
import { animConfig } from "./animConfig";
import { AnimatedSprite } from "pixi.js";
import * as PIXI from 'pixi.js'
import { objectGlobalData } from "./objectGlobalData";
import { nullVector } from "../dataObjects/vector/nullVector";


export class objectBase implements iObject{
    isTile = false;
    tileStepTime: number = -1;
    readonly ID: string =  uidGen.new();
    private _g: PIXI.Container = new PIXI.Container();
    private gSprites : {[key: string]: PIXI.AnimatedSprite} = {};
    friction: number = 0.98;
    airFriction: number = 0.9;
    

    stickyBottom: boolean = false;
    stickyTop: boolean = false;
    stickyLeftSide: boolean = false;
    stickyRightSide: boolean = false;

    gravity: iVector = nullVector.null;
    weight: number = 0.4;
    _hasBeenMoved_Tick: number = 0;
    _collidingWithPolygon: boolean = false;

    collidesWithPolygonGeometry = false;
    _hasCollidedWithPolygon = false;

    inputTemplate: string = "";
    outputString: string = "";
    onLayer: number = 0;

    _layerIndex: number = -1;
    get layerIndex(){
        return this._layerIndex;
    }
    set layerIndex(value){
        if(this._layerIndex == -1){
            this._layerIndex = value;
        }
    }

    horizontalCollision: number = 0;
    verticalCollision: number = 0;

    get g(){
        return this._g;
    }
    private _collisionBox: boxCollider = new boxCollider(0, 0, 0, 0);
    get collisionBox(){
        return this._collisionBox;
    }
    private _objectName: string = "iObject";
    get objectName(){
        return this._objectName;
    }

    moveCollisionTargets: Array<string> = [];
    private _collisionTargets: Array<string> = [];
    get collisionTargets(){
        return this._collisionTargets;
    }
    private _force: vector = new vector(0, 0);
    public get force(){
        return this._force;
    }


    constructor(x: number, y: number, childObjectName: string){
        this._objectName = childObjectName;
        this._g.x = x;
        this._g.y = y;
    }

    
    afterInit(roomEvents: roomEvent): void {
        
    }

    init(roomEvents: roomEvent){
        
    }

    addMoveCollisionTarget(...collNames:string[]){
        /*for(let i=0; i<collNames.length; i++){
            if(this.moveCollisionTargets.indexOf(collNames[i]) == -1){
                if(objectBase.objectsThatMoveWith[collNames[i]] == null){
                    objectBase.objectsThatMoveWith[collNames[i]] = new Array<string>();
                }
                if(objectBase.objectsThatMoveWith[collNames[i]].indexOf(this.objectName) == -1){
                    objectBase.objectsThatMoveWith[collNames[i]].push(this.objectName);
                }

                if(this.moveCollisionTargets.indexOf(collNames[i]) == -1){
                    this.moveCollisionTargets.push(collNames[i]);
                }
                
            }
        }*/
    }



    addCollisionTarget(...collNames:string[]){
        for(let i=0; i<collNames.length; i++){
            if(this._collisionTargets.indexOf(collNames[i]) == -1){
                if(objectGlobalData.objectsThatCollideWith[collNames[i]] == null){
                    objectGlobalData.objectsThatCollideWith[collNames[i]] = new Array<string>();
                }
                if(objectGlobalData.objectsThatCollideWith[collNames[i]].indexOf(this.objectName) == -1){
                    objectGlobalData.objectsThatCollideWith[collNames[i]].push(this.objectName);
                }

                if(this._collisionTargets.indexOf(collNames[i]) == -1){
                    this._collisionTargets.push(collNames[i]);
                }
                
            }
        }
    }

    removeCollisionTarget(...collNames:string[]){
        throw new Error("Function removeCollisionTarget has not been implemented correctly");
        this._collisionTargets = this.collisionTargets.filter(x => { collNames.indexOf(x) == -1 });
        objectGlobalData.objectsThatCollideWith[this.objectName] = objectGlobalData.objectsThatCollideWith[this.objectName].filter(x => { collNames.indexOf(x) == -1 });
    }

    removeAllCollisionTargets(){
        this.collisionTargets.length = 0;
    }

    style(newGraphics: (g: PIXI.Container) => PIXI.Container){
        this.removeAllSprites();
        this.gSprites = {};
        let tempG = newGraphics(new PIXI.Container());
        let oldX = this.g.x;
        let oldY = this.g.y;
        
        this._g = tempG;

        this._g.x = oldX;
        this._g.y = oldY;
    }


    addSprite(settings: animConfig){
        let newAnimation = resourcesHand.getAnimatedSprite(settings.animationName);
        if(newAnimation != null){
            newAnimation.x = settings.x;
            newAnimation.y = settings.y;
            newAnimation.animationSpeed = settings.speed;
            //newAnimation.width = settings.width;
            //newAnimation.height = settings.height;
            newAnimation.anchor.set(settings.anchorX, settings.anchorY);
            newAnimation.scale.set(settings.scaleX, settings.scaleY);
            newAnimation.rotation = 0;
            newAnimation.play();
            
            this.gSprites[settings.id] = newAnimation;
            this._g.addChild(newAnimation);
        }
        
        return newAnimation;
    }

    hasSprite(nameOrId: string){
        return this.gSprites[nameOrId] != null;
    }

    removeSprite(id: string){
        if(this.gSprites[id] != null){
            this._g.removeChild(this.gSprites[id]);
            delete this.gSprites[id];//Nothing wrong with using delete, okay?
        }else{
            console.log("Wanted to remove ",id," but could not find it");
        }
    }

    removeAllSprites(){
        let keys = Object.keys(this.gSprites);
        for(let k of keys){
            this.removeSprite(k);
        }
    }

    pauseSprite(id: string){
        if(this.gSprites[id] != null && this.gSprites[id] instanceof AnimatedSprite){
            (this.gSprites[id] as AnimatedSprite).stop();
        }
    }

    playSprite(id: string){
        if(this.gSprites[id] != null && this.gSprites[id] instanceof AnimatedSprite){
            (this.gSprites[id] as AnimatedSprite).play();
        }
    }

    scaleXSprites(scaleX: number){
        let keys = Object.keys(this.gSprites);
        for(let k of keys){
            this.gSprites[k].scale.set(scaleX, this.gSprites[k].scale.y);
        }
    }

    scaleYSprites(scaleY: number){
        let keys = Object.keys(this.gSprites);
        for(let k of keys){
            this.gSprites[k].scale.set(this.gSprites[k].scale.x, scaleY);
        }
    }

    flipAllSpritesVertical(){
        let keys = Object.keys(this.gSprites);
        for(let k of keys){
            this.gSprites[k].height = -this.gSprites[k].height; 
            if(this.gSprites[k].height < 0){
                this.gSprites[k].y += this.gSprites[k].height;
            }else{
                this.gSprites[k].y -= this.gSprites[k].height;
            }
        }
    }

    setAnimationSpeed(id: string,  speed: number){
        if(this.gSprites[id] != null && this.gSprites[id] instanceof AnimatedSprite){
            (this.gSprites[id] as AnimatedSprite).animationSpeed = speed;
        }
    }

    

    logic(l: roomEvent){
        movementOperations.moveByForce(this, this._force, this.collisionTargets, l.objContainer, l.deltaTime);
    };

    

    setCollision(xs: number, ys: number, width: number, height: number){
        this.collisionBox.x = xs;
        this.collisionBox.y = ys;
        this.collisionBox.width = width;
        this.collisionBox.height = height;
        if(ys < 0){
            this.collisionBox.height += ys/-1;
        }
        if(xs < 0){
            this.collisionBox.width += xs/-1;
        }
    }

    

    

    get x(){
        return this.g.x;
    }
    set x(n: number){
        this.g.x = n;
    }

    get y(){
        return this.g.y;
    }

    set y(n: number){
        this.g.y = n;
    }


    updatePosition(x: number, y: number){
        this.g.x = x;
        this.g.y = y;
    }

    setNewForce(xd: number, yd: number){
        this._force.Dx = xd;
        this._force.Dy = yd;
    }

    addForce(xd: number, yd: number){
        this._force.Dx += xd;
        this._force.Dx += yd;
    }

    setNewForceAngleMagnitude(angle: number, magnitude: number){
        this._force.Dx = Math.cos(angle) * magnitude;
        this._force.Dy = calculations.flippedSin(angle) * magnitude;
        //this._force.angle = angle;
        //this._force.magnitude = magnitude;
    }

    addForceAngleMagnitude(angle: number, magnitude: number){
        this._force.Dx += Math.cos(angle) * magnitude;
        this._force.Dy += calculations.flippedSin(angle) * magnitude;
    }

}