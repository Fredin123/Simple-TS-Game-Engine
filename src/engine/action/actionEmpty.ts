import { iVector } from "../dataObjects/vector/iVector";
import { nullVector } from "../dataObjects/vector/nullVector";
import { iObject } from "../objectHandlers/iObject";
import { roomEvent } from "../roomEvent/roomEvent";
import { movementDirection } from "./attackDirections";
import { genericStatus } from "./genericStatus";
import { IAction } from "./IAction";

export class actionEmpty implements IAction{
    private movementVector: iVector = new nullVector();

    public objOffset(offset: number[]){
        return this;
    }

    public objLife(life: number){
        return this;
    }

    public queryAttack(){
        
    }

    public userFriction(friction: number){
        return this;
    }

    public removePrevObjsOnCreate(){
        return this;
    }

    public continueWindow(val: number, requiredAttacks: number){
        return this;
    }

    public create(objCreatorFunc: () => iObject, offset: number[], life: number){
        return this;
    }

    public resetUserGravity(){
        return this;
    }

    public vector(angle: number, magnitude: number){
        return this;
    }

    public repeat(r: number){
        return this;
    }

    public startupWait(time: number){
        return this;
    }

    public endWait(time: number){
        return this;
    }

    public getAttackDirection(){
        return movementDirection.left_right;
    }

    public attackDirectionUpDown(){
        return this;
    }
    
    public getGravityShouldBeReset(){
        return false;
    }
    
    public getUserShouldBeStill(){
        return genericStatus.notSet;
    }

    public userStill(stillStatus: boolean){
        return this;
    }

    public resetGravity(){
        return this;
    }

    public getMovementVector(){
        return new nullVector();
    }

    public getRepeat(){
        return 0;
    }

    public isCompleted(){
        return true;
    }

    public play(user: iObject, l: roomEvent){
        
    }
}