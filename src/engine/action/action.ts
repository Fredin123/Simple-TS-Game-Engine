import { calculations } from "../calculations";
import { iVector } from "../dataObjects/vector/iVector";
import { nullVector } from "../dataObjects/vector/nullVector";
import { vectorFixedDelta } from "../dataObjects/vector/vectorFixedDelta";
import { iObject } from "../objectHandlers/iObject";
import { roomEvent } from "../roomEvent/roomEvent";
import { actionContainer } from "./actionContainer";
import { actionCreatedObject } from "./actionCreatedObject";
import { movementDirection } from "./attackDirections";
import { genericStatus } from "./genericStatus";
import { IAction } from './IAction';


export class action implements IAction{
    private movementVector: iVector = new nullVector();
    private _startupWait: number = 0;
    private originalStartupWait = 0;
    private _endWait: number = 0;
    private _repeat: number = 0;
    private _resetUserGravity = false;
    private _continueWindow = -1;
    private _queriedAttacks = 0;
    private _requiredQueriedAttacks = 0;

    private gravityShouldBeReset: boolean = false;
    private userShouldBeStill: genericStatus = genericStatus.notSet;
    
    private attackDirection: movementDirection = movementDirection.left_right;

    private payloadDone = false;
    private jobCompleted = false;

    private newUserFriction = -1;
    private usersPrevStoredFriction = 0;

    private firstTime = true;

    private objCreatorFunc: (() => iObject) | null = null;
    private objToCreateOffset = [0, 0];
    private objToCreateLife = 0;

    private _actionContainer: actionContainer;
    
    private beforePaylod = true;
    private destroyPreviousObjects = false;

    constructor(actionContainer: actionContainer){
        this._actionContainer = actionContainer;
    }

    public static new(actionContainer: actionContainer){
        return new action(actionContainer);
    }

    public newAction(){
        return this._actionContainer.newAction();
    }

    public queryAttack(){
        this._queriedAttacks++;
    }

    public removePrevObjsOnCreate(){
        this.destroyPreviousObjects = true;
        return this;
    }

    public userFriction(friction: number){
        this.newUserFriction = friction;
        return this;
    }

    public continueWindow(val: number, requiredAttacks: number = 1){
        this._continueWindow = val;
        this._requiredQueriedAttacks = requiredAttacks;
        return this;
    }

    public create(objCreatorFunc: () => iObject){
        this.objCreatorFunc = objCreatorFunc;
        
        
        return this;
    }

    public objOffset(offset: number[]){
        this.objToCreateOffset = offset;
        return this;
    }

    public objLife(life: number){
        this.objToCreateLife = life;
        return this;
    }

    public resetUserGravity(){
        this._resetUserGravity = true;
        return this;
    }

    public vector(angle: number, magnitude: number){
        this.movementVector = new vectorFixedDelta(calculations.degreesToRadians(angle), magnitude);
        return this;
    }

    public repeat(r: number){
        this._repeat = r;
        return this;
    }

    public startupWait(time: number){
        this._startupWait = time;
        this.originalStartupWait = time;
        return this;
    }

    public endWait(time: number){
        this._endWait = time;
        return this;
    }

    public getAttackDirection(){
        return this.attackDirection;
    }

    public attackDirectionUpDown(){
        this.attackDirection = movementDirection.up_down;
        return this;
    }
    
    public getGravityShouldBeReset(){
        return this.gravityShouldBeReset;
    }
    
    public resetGravity(){
        this.gravityShouldBeReset = true;
        return this;
    }

    public getUserShouldBeStill(){
        return this.userShouldBeStill;
    }

    public userStill(stillStatus: boolean){
        if(stillStatus){
            this.userShouldBeStill = genericStatus.true;
        }else{
            this.userShouldBeStill = genericStatus.false;
        }
        return this;
    }

    public getMovementVector(){
        return this.movementVector;
    }

    public getRepeat(){
        return this._repeat;
    }

    public isCompleted(){
        return this.jobCompleted;
    }

    private delta = 0;
    public play(user: iObject, l: roomEvent){
        if(this.jobCompleted) return;

        if(this.firstTime){
            this.usersPrevStoredFriction = user.friction;
            if(this.newUserFriction != -1){
                user.friction = this.newUserFriction;
                this.firstTime = false;
            }
        }
        

        if(this._continueWindow > 0){
            this._continueWindow--;
            if(this._queriedAttacks >= this._requiredQueriedAttacks){
                this._continueWindow = -1;
            }else{
                return;
            }
        }else if(this._continueWindow == 0){
            this.jobCompleted = true;
            user.friction = this.usersPrevStoredFriction;
            this._actionContainer.stop();
        }

        if(this._startupWait > 0){
            this._startupWait--;
            if(this._startupWait == 0){
                if(this.beforePaylod){
                    if(this.destroyPreviousObjects == true){
                        this._actionContainer.removeAllCreatedObjects(l);
                    }
                    this.beforePaylod = false;
                }
            }
        }else{
            if(this.payloadDone == false){
                if(this._resetUserGravity){
                    user.gravity.magnitude = 0;
                }

                this.delta = this.movementVector.delta;
                if(this._actionContainer.getDirection() == movementDirection.left){
                    this.delta = calculations.PI + ((calculations.PI*2)-this.delta);
                }
                
                user.addForceAngleMagnitude(this.delta, this.movementVector.magnitude);
                if(this.objCreatorFunc != null){
                    
                    let newObj = new actionCreatedObject(this.objToCreateLife, this.objCreatorFunc(), this.objToCreateOffset[0], this.objToCreateOffset[1]);
                    this._actionContainer.objectsCreated.push(newObj);
                    this._actionContainer.positionCreatedObject(user, newObj);
                    l.addObject(newObj.obj(), user.onLayer);
                }
                this.payloadDone = true;
            }
            

            if(this._endWait > 0){
                this._endWait--;
            }else{
                if(this._repeat > 0){
                    this._repeat--;
                    this._startupWait = this.originalStartupWait;
                    this.beforePaylod = true;
                    this.payloadDone = false;
                }else{
                    this.payloadDone = true;
                    this.jobCompleted = true;
                    user.friction = this.usersPrevStoredFriction;
                }
            }
        }
    }
}