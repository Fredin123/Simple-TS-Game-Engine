import { roomEvent } from "../roomEvent";
import { boxCollider } from "./collision/boxCollider";
import { iVector } from "../dataObjects/vector/iVector";
import * as PIXI from 'pixi.js'


export interface iObject{
    readonly ID: string;
    isTile: boolean;
    tileStepTime: number;
    g: PIXI.Container;
    collisionBox: boxCollider;
    //resourcesNeeded: string[];
    objectName: string;
    collisionTargets: Array<string>;
    moveCollisionTargets: Array<string>;
    force: iVector;
    friction: number;
    stickyBottom: boolean;
    stickyTop: boolean;
    stickyLeftSide: boolean;
    stickyRightSide: boolean;
    airFriction: number;
    gravity: iVector;
    weight: number;

    _hasBeenMoved_Tick : number;
    _isColliding_Special: boolean;
    collidesWithPolygonGeometry: boolean;

    onLayer: number;
    outputString: string;

    horizontalCollision: number;
    verticalCollision: number;

    init(roomEvents: roomEvent): void;
    
    addMoveCollisionTarget(...collNames:string[]): void;

    addCollisionTarget(...collNames:string[]): void;

    removeCollisionTarget(...collNames:string[]): void;

    removeAllCollisionTargets(): void;

    style(newGraphics: (g: PIXI.Container) => PIXI.Container): void

    logic(l: roomEvent): void;

    setCollision(xs: number, ys: number, width: number, height: number): void;

    updatePosition(x: number, y: number): void;

    setNewForceAngleMagnitude(a: number, b: number): void

    
    setNewForce(xd: number, yd: number): void;

    addForce(xd: number, yd: number): void;

    setNewForceAngleMagnitude(angle: number, magnitude: number): void;

    addForceAngleMagnitude(angle: number, magnitude: number): void;



}