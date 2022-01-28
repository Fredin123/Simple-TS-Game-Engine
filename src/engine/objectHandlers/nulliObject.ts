import { objectBase } from "./objectBase";
import { roomEvent } from "../roomEvent/roomEvent";
import { iObject } from "./iObject";
import { vector } from "../dataObjects/vector/vector";
import { resourceMeta } from "../preload sources/resourceMeta";
import { boxCollider } from "./collision/boxCollider";
import * as PIXI from 'pixi.js'
import { objectFunctions } from "./objectFunctions";

export class nulliObject implements iObject{
    isTile = false;
    tileStepTime: number = -1;
    static objectName = "nulliObject";
    friction: number = 0;
    airFriction: number = 0;
    stickyBottom: boolean = false;
    stickyTop: boolean = false;
    stickyLeftSide: boolean = false;
    stickyRightSide: boolean = false;
    gravity: vector = new vector(0, 0);
    weight: number = 0;
    ID: string = "";
    g: PIXI.Graphics = new PIXI.Graphics();
    _collisionBox: boxCollider = new boxCollider(0, 0, 0, 0);
    _objectName: string = "nulliObject";
    collisionTargets: string[] = [];
    moveCollisionTargets: Array<string> = [];
    force: vector = new vector(0, 0);
    exportedString: string = "";
    _hasBeenMoved_Tick: number = 0;
    _collidingWithPolygonTick: number = 0;
    _targetLayerForPolygonCollision:string = "";
    sameLayerCollisionOnly = false;
    collidesWithPolygonGeometry = false;
    onLayer: number = 0;
    outputString: string = "";
    horizontalCollision: number = 0;
    verticalCollision: number = 0;
    
    constructor(xp: number, yp: number) {

    }
    changeLayer(roomEvents: roomEvent, newLayerName: string): void {
        
    }
    preLogicMovement(l: roomEvent): void {
        
    }
    afterInit(roomEvents: objectFunctions): void {
        
    }
    layerIndex: number = 0;
    
    _hasCollidedWithPolygon: boolean = false;

        
    init(roomEvents: objectFunctions){

    }
    
    addMoveCollisionTarget(...collNames: string[]): void {
        
    }
    setNewForceAngleMagnitude(a: number, b: number): void {
        
    }
    objectName: string = "";
    collisionBox: boxCollider = new boxCollider(0, 0, 0, 0);

    addCollisionTarget(...collNames: string[]): void {
        
    }
    removeCollisionTarget(...collNames: string[]): void {
        
    }
    removeAllCollisionTargets(): void {
        
    }
    style(newGraphics: (g: PIXI.Graphics) => PIXI.Graphics): void {
        
    }
    setCollision(xs: number, ys: number, width: number, height: number): void {
        
    }
    updatePosition(x: number, y: number): void {
        
    }
    setNewForce(angle: number, magnitude: number): void {
        
    }

    logic(l: objectFunctions){

    };


    addForce(xd: number, yd: number){

    }

    addForceAngleMagnitude(angle: number, magnitude: number){
        
    }

}