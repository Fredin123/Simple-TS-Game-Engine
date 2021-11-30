import { iVector } from "../dataObjects/vector/iVector";
import { iObject } from "../objectHandlers/iObject";
import { roomEvent } from "../roomEvent/roomEvent";
import { movementDirection } from "./attackDirections";
import { genericStatus } from "./genericStatus";

export interface IAction{
    getMovementVector(): iVector;

    getRepeat(): number;

    resetGravity(): IAction;

    userFriction(friction: number): IAction;

    getGravityShouldBeReset(): boolean;

    getUserShouldBeStill(): genericStatus;

    queryAttack(): void;

    removePrevObjsOnCreate(): IAction;

    continueWindow(val: number, requiredAttacks: number): IAction;

    userStill(stillStatus: boolean): IAction;

    getAttackDirection(): movementDirection;

    attackDirectionUpDown(): IAction;

    startupWait(time: number): IAction;

    endWait(time: number): IAction;

    repeat(r: number): IAction;

    vector(angle: number, magnitude: number): IAction;

    objOffset(offset: number[]): IAction;

    objLife(life: number): IAction;

    resetUserGravity(): IAction;

    create(objCreatorFunc: () => iObject, offset: number[], life: number): IAction;

    isCompleted(): boolean;

    play(user: iObject, l: roomEvent): void;
}