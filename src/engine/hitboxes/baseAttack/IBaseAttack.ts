import { iObject } from "../../objectHandlers/iObject";
import { objectBase } from "../../objectHandlers/objectBase";
import { roomEvent } from "../../roomEvent";
import { movementDirection } from "../../action/attackDirections";

export interface IBaseAttack{

    isDone(): boolean;

    userShouldBeStill(): boolean;

    //startAttack(creator: iObject, direction: movementDirection): void;

    queryAttack(): void;

    tickAttack(l: roomEvent): void;
}