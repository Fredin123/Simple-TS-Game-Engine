import { vector } from "../vector/vector";
import { roomEvent } from "../roomEvent";
import { resourceMeta } from "../preload sources/resourceMeta";
import { boxCollider } from "./boxCollider";
import { uidGen } from "../tools/uidGen";
import { objectContainer } from "./objectContainer";
import { movementOperations } from "../movementOperations";
import { iObject } from "./iObject";
import { iVector } from "../vector/iVector";
import { nulliObject } from "./nulliObject";
import { calculations } from "../calculations";


export class objectBase implements iObject{
    static null: iObject = new nulliObject(0, 0);
    readonly ID: string =  uidGen.new();
    private _g: PIXI.Container = new PIXI.Container();
    friction: number = 0.5;
    airFriction: number = 0.8;

    resourcesNeeded: string[] = [];

    stickyBottom: boolean = false;
    stickyTop: boolean = false;
    stickyLeftSide: boolean = false;
    stickyRightSide: boolean = false;

    gravity: iVector = vector.null;
    weight: number = 0.4;
    _hasBeenMoved_Tick: number = 0;

    static objectsThatCollideWithKeyObjectName: {[key: string]: Array<string>} = {};


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
    private _collisionTargets: Array<string> = [];
    get collisionTargets(){
        return this._collisionTargets;
    }
    private _force: vector = new vector(0, 0);
    get force(){
        return this._force;
    }


    constructor(x: number, y: number, childObjectName: string){
        this._objectName = childObjectName;
        this._g.x = x;
        this._g.y = y;
    }

    addCollisionTarget(...collNames:string[]){
        for(let i=0; i<collNames.length; i++){
            if(this.collisionTargets.indexOf(collNames[i]) == -1){
                if(objectBase.objectsThatCollideWithKeyObjectName[collNames[i]] == null){
                    objectBase.objectsThatCollideWithKeyObjectName[collNames[i]] = new Array<string>();
                }
                if(objectBase.objectsThatCollideWithKeyObjectName[collNames[i]].indexOf(this.objectName) == -1){
                    objectBase.objectsThatCollideWithKeyObjectName[collNames[i]].push(this.objectName);
                }

                if(this.collisionTargets.indexOf(collNames[i]) == -1){
                    this.collisionTargets.push(collNames[i]);
                }
                
            }
        }
    }

    removeCollisionTarget(...collNames:string[]){
        throw new Error("Function removeCollisionTarget has not been implemented correctly");
        this._collisionTargets = this.collisionTargets.filter(x => { collNames.indexOf(x) == -1 });
        objectBase.objectsThatCollideWithKeyObjectName[this.objectName] = objectBase.objectsThatCollideWithKeyObjectName[this.objectName].filter(x => { collNames.indexOf(x) == -1 });
    }

    removeAllCollisionTargets(){
        this.collisionTargets.length = 0;
    }

    style(newGraphics: (g: PIXI.Container) => PIXI.Container){
        let tempG = newGraphics(new PIXI.Container());
        let oldX = this.g.x;
        let oldY = this.g.y;
        
        this._g = tempG;

        this._g.x = oldX;
        this._g.y = oldY;
    }

    logic(l: roomEvent){
        movementOperations.moveByForce(this, this._force, this.collisionTargets, l.objContainer, l.deltaTime);
    };

    

    setCollision(xs: number, ys: number, width: number, height: number){
        this.collisionBox.x = xs;
        this.collisionBox.y = ys;
        this.collisionBox.width = width;
        this.collisionBox.height = height;
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