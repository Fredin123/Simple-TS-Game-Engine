import { vector } from "../dataModules/vector/vector";
import { roomEvent } from "../roomEvent";
import { resourceMeta } from "../preload sources/resourceMeta";
import { boxCollider } from "./boxCollider";
import { uidGen } from "../tools/uidGen";
import { objectContainer } from "./objectContainer";
import { movementOperations } from "../movementOperations";
import { iVector } from "../dataModules/vector/iVector";
import { nulliObject } from "./nulliObject";


export interface iObject{
    readonly ID: string;
    g: PIXI.Graphics;
    collisionBox: boxCollider;
    spriteSheet: resourceMeta|null;
    objectName: string;
    collisionTargets: Array<string>;
    force: iVector;
    friction: number;
    stickyness: number;
    airFriction: number;
    gravity: iVector;
    weight: number;



    addCollisionTarget(...collNames:string[]): void;

    removeCollisionTarget(...collNames:string[]): void;

    removeAllCollisionTargets(): void;

    style(newGraphics: (g: PIXI.Graphics) => PIXI.Graphics): void

    logic(l: roomEvent): void;

    setCollision(xs: number, ys: number, width: number, height: number): void;

    updatePosition(x: number, y: number): void;

    setNewForceAngleMagnitude(a: number, b: number): void


    x: number;



    y: number;



}