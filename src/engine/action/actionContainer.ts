import { iObject } from "../objectHandlers/iObject";
import { roomEvent } from "../roomEvent";
import { action } from "./action";
import { actionCreatedObject } from "./actionCreatedObject";
import { actionEmpty } from "./actionEmpty";
import { movementDirection } from "./attackDirections";
import { genericStatus } from "./genericStatus";
import { IAction } from "./IAction";

export class actionContainer{
    private currentIndex = 0;
    private actionSeries: IAction[] = [];
    private _keepUserStill = false;
    public objectsCreated: actionCreatedObject[] = [];
    private direction: movementDirection = movementDirection.right;
    private stopped = false;

    public playCurrent(user: iObject, l: roomEvent, direction: movementDirection){
        this.direction = direction;
        for (let i = this.objectsCreated.length - 1; i >= 0; i--) {
            var objMeta = this.objectsCreated[i];
            if(objMeta.life > 0){
                objMeta.life--;
                this.positionCreatedObject(user, objMeta);
            }else{
                l.deleteObject(objMeta.obj());
                this.objectsCreated.splice(i, 1);
            }
        }
        
        if(this.current().getUserShouldBeStill() != genericStatus.notSet){
            this._keepUserStill = (this.current().getUserShouldBeStill() == genericStatus.true) ? true : false;
        }
        this.current().play(user, l);
    }

    public stop(){
        this.stopped = true;
    }

    public hasEnded(){
        return this.stopped || this.isCurrentCompleted();
    }

    public queryAttack(){
        this.current().queryAttack();
    }

    public positionCreatedObject(user: iObject, createdObj: actionCreatedObject){
        createdObj.obj().g.x = user.g.x + (user.g.width/2) - (createdObj.obj().g.width/2);
        createdObj.obj().g.y = user.g.y + (user.g.height/2) - (createdObj.obj().g.height/2);
        if(this.direction == movementDirection.right){
            createdObj.obj().g.x += createdObj.offsetX();
            createdObj.obj().g.y += createdObj.offsetY();
        }else if(this.direction == movementDirection.left){
            createdObj.obj().g.x -= createdObj.offsetX();
            createdObj.obj().g.y += createdObj.offsetY();
        }else if(this.direction == movementDirection.up){
            createdObj.obj().g.x += createdObj.offsetX();
            createdObj.obj().g.y -= createdObj.offsetY();
        }else if(this.direction == movementDirection.down){
            createdObj.obj().g.x += createdObj.offsetX();
            createdObj.obj().g.y += createdObj.offsetY();
        }
    }

    public getDirection(){
        return this.direction;
    }

    public getUserShouldBeStill(){
        return this._keepUserStill;
    }

    public isCurrentCompleted(){
        return this.current().isCompleted();
    }

    public cleanup(l: roomEvent){
        if(this.current().isCompleted() || this.stopped){
            this.removeAllCreatedObjects(l);
        }
        this._keepUserStill = false;
    }

    public removeAllCreatedObjects(l: roomEvent){
        for (let i = this.objectsCreated.length - 1; i >= 0; i--) {
            var objMeta = this.objectsCreated[i];
            l.deleteObject(objMeta.obj());
            this.objectsCreated.splice(i, 1);
        }
    }

    private current(){
        if(this.actionSeries[this.currentIndex] == undefined){
            console.log("Can't get ",this.currentIndex," from ", this.actionSeries);
            return new actionEmpty();
        }
        return this.actionSeries[this.currentIndex];
    }

    public next(){
        this.currentIndex += 1;
        if(this.currentIndex > this.actionSeries.length-1){
            this.currentIndex = 0;
            return false;
        }
        return true;
    }

    public add(action: IAction){
        this.actionSeries.push(action);
        return this;
    }

    public newAction(){
        let newAction = action.new(this);
        this.actionSeries.push(newAction);
        return newAction;
    }

    


}