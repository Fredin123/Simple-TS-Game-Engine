import { hitbox } from "../hitbox/hitbox";
import { iObject } from "../../objectHandlers/iObject";
import { roomEvent } from "../../roomEvent/roomEvent";
import { IBaseAttack } from "./IBaseAttack";
import { objectBase } from "../../objectHandlers/objectBase";
import { movementDirection } from "../../action/attackDirections";
import { actionContainer } from "../../action/actionContainer";


export class baseAttack implements IBaseAttack{
    protected attackSeries: actionContainer = new actionContainer();
    
    private attackTargets: string[] = [];
    //private movementInformationPlayer: actionPlayer = new actionPlayer();
    private done = false;
    private attackDirection: movementDirection = movementDirection.right;
    private creator: iObject;

    constructor(creator: iObject, direction: movementDirection, attackTargets: string[]){
        this.attackDirection = direction;
        this.creator = creator;
        this.attackTargets = attackTargets;
    }

    isDone(){
        return this.done;
    }

    userShouldBeStill(){
        return this.attackSeries.getUserShouldBeStill();
    }

    queryAttack(){
        this.attackSeries.queryAttack();
    }

    tickAttack(l: roomEvent){
        if(this.attackSeries.hasEnded() == false){
            this.attackSeries.playCurrent(this.creator, l, this.attackDirection);
            if(this.attackSeries.isCurrentCompleted()){
                this.attackSeries.next();
            }
        }else{
            this.attackSeries.cleanup(l);
            this.done = true;
        }
    }

}