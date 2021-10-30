import { calculations } from "../engine/calculations";
import { baseAttackNull } from "../engine/hitboxes/baseAttack/baseAttackNull";
import { IBaseAttack } from "../engine/hitboxes/baseAttack/IBaseAttack";
import { iObject } from "../engine/objectHandlers/iObject";
import { roomEvent } from "../engine/roomEvent";

export class characterMoves{
    private maxRunSpeed = 6;
    private superRunSpeed = 11;
    private normalRunSpeed = 6;
    private jumpStrength = 8;

    private jumpButtonReleased = true

    //ladder part
    private ladderObject : string = "";
    private climbindLadder = false;
    private canJumpLadders = false;
    private atLadderTop = false;
    private releasedJumpKeyAtLadderTop = false;
    private hasJumpedFromLadder = false;
    public climbSpeed = 2;
    public climbDownSpeed = 3;
    public ladderTopJump = 3;
    public ladderSideJump = 3;


    //attack
    private attack: IBaseAttack = new baseAttackNull();
    private attackButtonReleased = true;
    private airAttacks: ((l: roomEvent) => IBaseAttack) | null = null;
    private groundAttacks: ((l: roomEvent) => IBaseAttack) | null = null;


    constructor(ladderObject : string = "", groundAttacks: ((l: roomEvent) => IBaseAttack) | null = null, airAttacks: ((l: roomEvent) => IBaseAttack) | null = null){
        this.ladderObject = ladderObject;
        this.airAttacks = airAttacks;
        this.groundAttacks = groundAttacks;
    }

    move(l: roomEvent, character: iObject) {
        this.movement(l, character);
        this.climbingLadders(l, character);
        this.handleAttacks(l, character);
    }

    private movement(l: roomEvent, character: iObject){
        if(l.checkKeyHeld("Control")){
            this.maxRunSpeed = this.superRunSpeed;
        }else{
            this.maxRunSpeed = this.normalRunSpeed;
        }

        if(l.checkKeyHeld("a") || l.checkKeyHeld("A")){
            if(character.verticalCollision > 0){
                character.addForceAngleMagnitude(calculations.degreesToRadians(180), (1/13)*this.maxRunSpeed);
            }else{
                character.addForceAngleMagnitude(calculations.degreesToRadians(180), (1/64)*this.maxRunSpeed);
            }
        }
        if(l.checkKeyHeld("d") || l.checkKeyHeld("D")){
            if(character.verticalCollision > 0){
                character.addForceAngleMagnitude(calculations.degreesToRadians(0), (1/13)*this.maxRunSpeed);
            }else{
                character.addForceAngleMagnitude(calculations.degreesToRadians(0), (1/64)*this.maxRunSpeed);
            }
        }
        if(this.jumpButtonReleased == true && (l.checkKeyHeld("w") || l.checkKeyHeld("W")) && (character.verticalCollision > 0 || character._isColliding_Special)){
            character.addForceAngleMagnitude(calculations.degreesToRadians(90), this.jumpStrength);
            
            this.jumpButtonReleased = false;
        }

        if(l.checkKeyReleased("h")){
            character.addForceAngleMagnitude(calculations.degreesToRadians(90), this.jumpStrength);
            character.gravity.magnitude = 0;
        }
        
        if(l.checkKeyHeld("w") || l.checkKeyHeld("W")){
            this.jumpButtonReleased = true;
        }
        character.force.limitHorizontalMagnitude(this.maxRunSpeed);
    }

    private climbingLadders(l: roomEvent, character: iObject){
        if(this.ladderObject == "") return;

        let collisionWith = l.isCollidingWith(character, character.collisionBox, [this.ladderObject]);
        
        if(collisionWith != null){
            if((l.checkKeyHeld("w") || l.checkKeyHeld("s"))){
                character.force.Dx = 0;
            }
            if((l.checkKeyHeld("w") || l.checkKeyHeld("s")) && this.climbindLadder == false){
                this.climbindLadder = true;
            }

            if(this.climbindLadder){
                if(l.checkKeyHeld("a") == false && l.checkKeyHeld("d") == false){
                    this.canJumpLadders = true;
                }
                character.gravity.magnitude = 0;

                character.force.Dx *= 0.4;
                character.force.Dy *= 0.2;
                character.g.x = collisionWith.g.x + (collisionWith.g.width/2) - (character.g.width/2);

                if(l.checkKeyHeld("w")){
                    character.g.y-=this.climbSpeed;
                    while(l.isCollidingWith(character, character.collisionBox,[this.ladderObject]) == null || 
                        l.isCollidingWith(character, character.collisionBox, character.collisionTargets) != null){
                        character.g.y+=1;
                        this.atLadderTop = true;
                    }
                }



                if(l.checkKeyHeld("w") && this.atLadderTop == true && this.releasedJumpKeyAtLadderTop){
                    character.g.y-=1;
                    character.addForceAngleMagnitude(calculations.degreesToRadians(90), this.ladderTopJump);
                }

                console.log(l.checkKeyReleased("w"));
                if(l.checkKeyReleased("w") && this.atLadderTop == true){
                    this.releasedJumpKeyAtLadderTop = true;
                    console.log("releasedJumpKeyAtLadderTop");
                }
    
                if(l.checkKeyHeld("s")){
                    character.g.y+=this.climbDownSpeed;
                    if(l.isCollidingWith(character, character.collisionBox, character.collisionTargets) != null){
                        character.g.y = collisionWith.g.y+(collisionWith.collisionBox.y/2)+collisionWith.collisionBox.height/2-1;
                    }
                }
    
                let movedBetweenLadder = false;
                if(l.checkKeyReleased("d")){
                    this.canJumpLadders = true;
                }
                if(l.checkKeyReleased("a")){
                    this.canJumpLadders = true;
                }

                if(l.checkKeyHeld("a")){
                    if(this.canJumpLadders){
                        character.g.x -= character.collisionBox.width;
                        movedBetweenLadder = true;
                        if(l.isCollidingWith(character, character.collisionBox, character.collisionTargets) != null){
                            character.g.x += character.collisionBox.width;
                            movedBetweenLadder = false;
                        }
                        if(movedBetweenLadder && l.checkKeyHeld("w")){
                            character.addForceAngleMagnitude(calculations.degreesToRadians(135), this.ladderSideJump);
                            this.atLadderTop = false;
                            this.canJumpLadders = false;
                            this.climbindLadder = false;
                            this.releasedJumpKeyAtLadderTop = false;
                        }else if(movedBetweenLadder){
                            this.releasedJumpKeyAtLadderTop = false;
                            this.canJumpLadders = false;
                        }
                    }
                    
                }

                if(l.checkKeyHeld("d")){
                    if(this.canJumpLadders){
                        character.g.x += character.collisionBox.width;
                        movedBetweenLadder = true;
                        if(l.isCollidingWith(character, character.collisionBox, character.collisionTargets) != null){
                            character.g.x -= character.collisionBox.width;
                            movedBetweenLadder = false;
                        }
                        if(movedBetweenLadder && l.checkKeyHeld("w")){
                            character.addForceAngleMagnitude(calculations.degreesToRadians(45), this.ladderSideJump);
                            this.atLadderTop = false;
                            this.canJumpLadders = false;
                            this.climbindLadder = false;
                            this.releasedJumpKeyAtLadderTop = false;
                        }else if(movedBetweenLadder){
                            this.releasedJumpKeyAtLadderTop = false;
                            this.canJumpLadders = false;
                        }
                    }
                    
                }
                
                

            }

            

            
        }else{
            this.atLadderTop = false;
            this.canJumpLadders = false;
            this.climbindLadder = false;
            this.releasedJumpKeyAtLadderTop = false;
            if(l.checkKeyHeld("w") && Math.floor(character.gravity.magnitude) == 0
            && this.hasJumpedFromLadder == false){
                character.addForceAngleMagnitude(calculations.degreesToRadians(90), this.ladderTopJump);
                this.hasJumpedFromLadder = true;
            }
        }

    }




    private handleAttacks(l: roomEvent, character: iObject){
        this.attack.tickAttack(l);
        if(l.checkKeyHeld(" ")){
            if(this.attackButtonReleased){
                this.attackButtonReleased = false;
                this.attack.queryAttack();
                if(this.attack.isDone()){
                    if(character.verticalCollision > 0 || character._isColliding_Special){
                        if(this.groundAttacks != null){
                            this.attack = this.groundAttacks(l);
                        }
                    }else{
                        if(this.airAttacks != null){
                            this.attack = this.airAttacks(l);
                        }
                    }
                }
            }
        }else{
            this.attackButtonReleased = true;
        }
    }




}