import { objectBase } from "./objectBase";
import { roomEvent } from "../roomEvent";
import { iObject } from "./iObject";
import { vector } from "../dataModules/vector/vector";
import { resourceMeta } from "../preload sources/resourceMeta";
import { boxCollider } from "./boxCollider";

export class nulliObject implements iObject{
    static objectName = "nulliObject";
    friction: number = 0;
    airFriction: number = 0;
    stickyness: number = 0;
    gravity: vector = new vector(0, 0);
    weight: number = 0;
    ID: string = "";
    g: PIXI.Graphics = new PIXI.Graphics();
    _collisionBox: boxCollider = new boxCollider(0, 0, 0, 0);
    spriteSheet: resourceMeta | null = null;
    _objectName: string = "nulliObject";
    collisionTargets: string[] = [];
    force: vector = new vector(0, 0);

    constructor(xp: number, yp: number) {

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