import { calculations } from "../engine/calculations";
import { baseAttackNull } from "../engine/hitboxes/baseAttack/baseAttackNull";
import { IBaseAttack } from "../engine/hitboxes/baseAttack/IBaseAttack";
import { iObject } from "../engine/objectHandlers/iObject";
import { objectFunctions } from "../engine/objectHandlers/objectFunctions";
import { ticker } from "../engine/ticker";

export class characterMoves{
    public maxRunSpeed = 6;
    private superRunSpeed = 6;
    private normalRunSpeed = 4;
    private jumpStrength = 8;

    private jumpButtonReleased = false;

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
    private airAttacks: ((l: objectFunctions) => IBaseAttack) | null = null;
    private groundAttacks: ((l: objectFunctions) => IBaseAttack) | null = null;


    //Other
    private walkingBridge = false;
    private collidingWithPolygonStoredState = false;
    constructor(ladderObject : string = "", groundAttacks: ((l: objectFunctions) => IBaseAttack) | null = null, airAttacks: ((l: objectFunctions) => IBaseAttack) | null = null){
        this.ladderObject = ladderObject;
        this.airAttacks = airAttacks;
        this.groundAttacks = groundAttacks;
    }

    move(l: objectFunctions, character: iObject) {
        this.movement(l, character);
        this.climbingLadders(l, character);
        this.handleAttacks(l, character);
    }

    private movement(l: objectFunctions, character: iObject){
        if(l.checkKeyHeld("Control")){
            this.maxRunSpeed = this.superRunSpeed;
        }else{
            this.maxRunSpeed = this.normalRunSpeed;
        }

        if(l.checkKeyHeld("a") || l.checkKeyHeld("A")){
            character.addForceAngleMagnitude(calculations.degreesToRadians(180), (10/13)*this.maxRunSpeed * l.deltaTime());
        }
        if(l.checkKeyHeld("d") || l.checkKeyHeld("D")){
            character.addForceAngleMagnitude(calculations.degreesToRadians(0), (10/13)*this.maxRunSpeed * l.deltaTime());
        }
        
        if(l.checkKeyHeld("w") || l.checkKeyHeld("W")){
            character.addForceAngleMagnitude(calculations.degreesToRadians(90), (10/13)*this.maxRunSpeed * l.deltaTime());
        }
        if(l.checkKeyHeld("s") || l.checkKeyHeld("S")){
            character.addForceAngleMagnitude(calculations.degreesToRadians(270), (10/13)*this.maxRunSpeed * l.deltaTime());
        }

        
        
       



        character.force.limitHorizontalMagnitude(this.maxRunSpeed);
        character.force.limitVerticalMagnitude(this.maxRunSpeed);
    }

    private CL_collisionWith: iObject | null = null;
    private CL_movedBetweenLadder = false;
    private climbingLadders(l: objectFunctions, character: iObject){
        if(this.ladderObject == "") return;

        this.CL_collisionWith = l.isCollidingWith(character, character.collisionBox, [this.ladderObject]);
        
        if(this.CL_collisionWith != null){
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
                character.g.x = this.CL_collisionWith.g.x + (this.CL_collisionWith.g.width/2) - (character.g.width/2);

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
                    character.addForceAngleMagnitude(calculations.degreesToRadians(90), this.ladderTopJump * l.deltaTime());
                }

                console.log(l.checkKeyReleased("w"));
                if(l.checkKeyReleased("w") && this.atLadderTop == true){
                    this.releasedJumpKeyAtLadderTop = true;
                    console.log("releasedJumpKeyAtLadderTop");
                }
    
                if(l.checkKeyHeld("s")){
                    character.g.y+=this.climbDownSpeed;
                    if(l.isCollidingWith(character, character.collisionBox, character.collisionTargets) != null){
                        character.g.y = this.CL_collisionWith.g.y+(this.CL_collisionWith.collisionBox.y/2)+this.CL_collisionWith.collisionBox.height/2-1;
                    }
                }
    
                this.CL_movedBetweenLadder = false;
                if(l.checkKeyReleased("d")){
                    this.canJumpLadders = true;
                }
                if(l.checkKeyReleased("a")){
                    this.canJumpLadders = true;
                }

                if(l.checkKeyHeld("a")){
                    if(this.canJumpLadders){
                        character.g.x -= character.collisionBox.width;
                        this.CL_movedBetweenLadder = true;
                        if(l.isCollidingWith(character, character.collisionBox, character.collisionTargets) != null){
                            character.g.x += character.collisionBox.width;
                            this.CL_movedBetweenLadder = false;
                        }
                        if(this.CL_movedBetweenLadder && l.checkKeyHeld("w")){
                            character.addForceAngleMagnitude(calculations.degreesToRadians(135), this.ladderSideJump * l.deltaTime());
                            this.atLadderTop = false;
                            this.canJumpLadders = false;
                            this.climbindLadder = false;
                            this.releasedJumpKeyAtLadderTop = false;
                        }else if(this.CL_movedBetweenLadder){
                            this.releasedJumpKeyAtLadderTop = false;
                            this.canJumpLadders = false;
                        }
                    }
                    
                }

                if(l.checkKeyHeld("d")){
                    if(this.canJumpLadders){
                        character.g.x += character.collisionBox.width;
                        this.CL_movedBetweenLadder = true;
                        if(l.isCollidingWith(character, character.collisionBox, character.collisionTargets) != null){
                            character.g.x -= character.collisionBox.width;
                            this.CL_movedBetweenLadder = false;
                        }
                        if(this.CL_movedBetweenLadder && l.checkKeyHeld("w")){
                            character.addForceAngleMagnitude(calculations.degreesToRadians(45), this.ladderSideJump * l.deltaTime());
                            this.atLadderTop = false;
                            this.canJumpLadders = false;
                            this.climbindLadder = false;
                            this.releasedJumpKeyAtLadderTop = false;
                        }else if(this.CL_movedBetweenLadder){
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
                character.addForceAngleMagnitude(calculations.degreesToRadians(90), this.ladderTopJump * l.deltaTime());
                this.hasJumpedFromLadder = true;
            }
        }

    }




    private handleAttacks(l: objectFunctions, character: iObject){
        this.attack.tickAttack(l);
        if((l.checkKeyHeld("k") || l.checkKeyHeld("K"))){
            if(this.attackButtonReleased){
                this.attackButtonReleased = false;
                this.attack.queryAttack();
                if(this.attack.isDone()){
                    if(character.verticalCollision > 0 || character._collidingWithPolygonTick){
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