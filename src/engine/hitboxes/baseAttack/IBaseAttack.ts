import { objectFunctions } from "../../objectHandlers/objectFunctions";

export interface IBaseAttack{

    isDone(): boolean;

    userShouldBeStill(): boolean;

    //startAttack(creator: iObject, direction: movementDirection): void;

    queryAttack(): void;

    tickAttack(l: objectFunctions): void;
}