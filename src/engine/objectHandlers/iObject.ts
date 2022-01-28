import { roomEvent } from "../roomEvent/roomEvent";
import { boxCollider } from "./collision/boxCollider";
import { iVector } from "../dataObjects/vector/iVector";
import * as PIXI from 'pixi.js'
import { objectFunctions } from "./objectFunctions";


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
    _collidingWithPolygonTick: number;
    _targetLayerForPolygonCollision: string;
    sameLayerCollisionOnly: boolean;
    collidesWithPolygonGeometry: boolean;

    onLayer: number;
    layerIndex: number;
    outputString: string;

    horizontalCollision: number;
    verticalCollision: number;

    changeLayer(roomEvents: roomEvent, newLayerName: string): void;

    init(roomEvents: objectFunctions): void;

    afterInit(roomEvents: objectFunctions): void;
    
    addMoveCollisionTarget(...collNames:string[]): void;

    addCollisionTarget(...collNames:string[]): void;

    removeCollisionTarget(...collNames:string[]): void;

    removeAllCollisionTargets(): void;

    style(newGraphics: (g: PIXI.Container) => PIXI.Container): void

    preLogicMovement(l: roomEvent): void;

    logic(l: objectFunctions): void;

    setCollision(xs: number, ys: number, width: number, height: number): void;

    updatePosition(x: number, y: number): void;

    setNewForceAngleMagnitude(a: number, b: number): void

    
    setNewForce(xd: number, yd: number): void;

    addForce(xd: number, yd: number): void;

    setNewForceAngleMagnitude(angle: number, magnitude: number): void;

    addForceAngleMagnitude(angle: number, magnitude: number): void;



}