import { vector } from "../dataObjects/vector/vector";
import { roomEvent } from "../roomEvent";
import { resourceMeta } from "../preload sources/resourceMeta";
import { boxCollider } from "./collision/boxCollider";
import { uidGen } from "../tools/uidGen";
import { objectContainer } from "./objectContainer";
import { movementOperations } from "../movementOperations";
import { iVector } from "../dataObjects/vector/iVector";
import { nulliObject } from "./nulliObject";
import * as PIXI from 'pixi.js'


export interface iObject{
    readonly ID: string;
    isTile: boolean;
    tileStepTime: number;
    g: PIXI.Container;
    collisionBox: boxCollider;
    resourcesNeeded: string[];
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
    percentage: number;

    _hasBeenMoved_Tick : number;
    _isColliding_Special: boolean;

    
    addMoveCollisionTarget(...collNames:string[]): void;

    addCollisionTarget(...collNames:string[]): void;

    removeCollisionTarget(...collNames:string[]): void;

    removeAllCollisionTargets(): void;

    style(newGraphics: (g: PIXI.Container) => PIXI.Container): void

    logic(l: roomEvent): void;

    setCollision(xs: number, ys: number, width: number, height: number): void;

    updatePosition(x: number, y: number): void;

    setNewForceAngleMagnitude(a: number, b: number): void

    
    
    x: number;



    y: number;



}