import { iObject } from "../../objectHandlers/iObject";
import { objectBase } from "../../objectHandlers/objectBase";
import { objectFunctions } from "../../objectHandlers/objectFunctions";
import { roomEvent } from "../../roomEvent/roomEvent";
import { IBaseAttack } from "./IBaseAttack";

export class baseAttackNull implements IBaseAttack {
    isDone(): boolean {
        return true;
    }
    userShouldBeStill(){
        return false;
    }
    startAttack(creator: iObject): void {

    }
    queryAttack(): void {
        
    }
    tickAttack(l: objectFunctions): void {
        
    }
}