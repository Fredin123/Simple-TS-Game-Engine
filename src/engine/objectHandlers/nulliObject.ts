import { objectBase } from "./objectBase";
import { roomEvent } from "../roomEvent";
import { iObject } from "./iObject";
import { vector } from "../dataObjects/vector/vector";
import { resourceMeta } from "../preload sources/resourceMeta";
import { boxCollider } from "./boxCollider";

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
    resourcesNeeded: string[] = [];
    _objectName: string = "nulliObject";
    collisionTargets: string[] = [];
    moveCollisionTargets: Array<string> = [];
    force: vector = new vector(0, 0);
    _hasBeenMoved_Tick: number = 0;

    constructor(xp: number, yp: number) {

    }
    addMoveCollisionTarget(...collNames: string[]): void {
        throw new Error("Method not implemented.");
    }
    setNewForceAngleMagnitude(a: number, b: number): void {
        throw new Error("Method not implemented.");
    }
    objectName: string = "";
    collisionBox: boxCollider = new boxCollider(0, 0, 0, 0);
    x: number = 0;
    y: number = 0;

    addCollisionTarget(...collNames: string[]): void {
        throw new Error("Method not implemented.");
    }
    removeCollisionTarget(...collNames: string[]): void {
        throw new Error("Method not implemented.");
    }
    removeAllCollisionTargets(): void {
        throw new Error("Method not implemented.");
    }
    style(newGraphics: (g: PIXI.Graphics) => PIXI.Graphics): void {
        throw new Error("Method not implemented.");
    }
    setCollision(xs: number, ys: number, width: number, height: number): void {
        throw new Error("Method not implemented.");
    }
    updatePosition(x: number, y: number): void {
        throw new Error("Method not implemented.");
    }
    setNewForce(angle: number, magnitude: number): void {
        throw new Error("Method not implemented.");
    }

    logic(l: roomEvent){

    };



}