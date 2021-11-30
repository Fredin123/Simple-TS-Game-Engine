import { calculations } from "../../calculations";
import { internalFunction } from "../../internalFunctions";
import { boxCollider } from "../../objectHandlers/collision/boxCollider";
import { polygonCollisionX } from "../../objectHandlers/collision/polygonCollision/polygonCollisionX";
import { iObject } from "../../objectHandlers/iObject";
import { objectContainer } from "../../objectHandlers/objectContainer";
import { objectGlobalData } from "../../objectHandlers/objectGlobalData";
import { ticker } from "../../ticker";
import { moveOperationsPush } from "../moveOperationsPush";

export class verticalMovement{

    private static sign = 0;
    private static objectsThatWereCollidingThisObjectWhileMoving = new Array<iObject>();
    private static collisionTarget = objectGlobalData.null;
    private static i=0;
    private static distance = 0;
    private static stickyCheck: boxCollider
    private static checkDistance = 0;
    public static moveForceVertical(magnitude: number, target: iObject, collisionNames: string[], objContainer: objectContainer){
        if(magnitude == 0) return;
        target.verticalCollision = 0;
        this.sign = magnitude>0?1:-1;
        this.objectsThatWereCollidingThisObjectWhileMoving = new Array<iObject>();
        this.collisionTarget = objectGlobalData.null;

        for(this.i=0; this.i<Math.abs(magnitude); this.i+=1){
            this.objectsThatWereCollidingThisObjectWhileMoving.length = 0;
            target.g.y += this.sign;

            if(objectGlobalData.objectsThatCollideWith[target.objectName] != null){
                //push objects
                objContainer.loopThroughObjectsUntilCondition(objectGlobalData.objectsThatCollideWith[target.objectName], (testCollisionWith: iObject)=>{
                    if((this.sign > 0 && testCollisionWith.verticalCollision <= 0) || (this.sign < 0 && testCollisionWith.verticalCollision >= 0)){
                        if(internalFunction.intersecting(target, target.collisionBox, testCollisionWith)){
                            this.collisionTarget = moveOperationsPush.pushObjectVertical(target, testCollisionWith, this.sign, objContainer);
                            if(this.collisionTarget == objectGlobalData.null){
                                target.force.Dy *= 1-testCollisionWith.weight;
                            }
                        }
                    }
                    
                    return false;
                });


                //Sticky draging
                this.stickyCheck = boxCollider.copy(target.collisionBox);
                this.checkDistance = Math.abs(magnitude) + 2;
                if(target.stickyLeftSide){
                    this.stickyCheck.expandLeftSide(this.checkDistance);
                }
                if(target.stickyRightSide){
                    this.stickyCheck.expandRightSide(this.checkDistance);
                }
                if(target.stickyLeftSide || target.stickyRightSide){
                    //console.log("objectBase.objectsThatCollideWithKeyObjectName[target.objectName]", objectBase.objectsThatCollideWithKeyObjectName[target.objectName]);
                    objContainer.loopThroughObjectsUntilCondition(objectGlobalData.objectsThatCollideWith[target.objectName], (testCollisionWith: iObject)=>{
                        if(internalFunction.intersecting(target, this.stickyCheck, testCollisionWith)){
                            if(testCollisionWith._hasBeenMoved_Tick < ticker.getTicks()){
                                this.objectsThatWereCollidingThisObjectWhileMoving.push(testCollisionWith);
                                testCollisionWith.g.y += this.sign;
                                if(this.i >= Math.abs(magnitude)-1){
                                    testCollisionWith._hasBeenMoved_Tick = ticker.getTicks();
                                }
                            }
                        }
                        return false;
                    });
                }
            }


            //This has to be more optimized
            if(this.collisionTarget == objectGlobalData.null){
                this.collisionTarget = objContainer.boxIntersectionSpecific(target, target.collisionBox, collisionNames);
            }
            
            if(this.collisionTarget != objectGlobalData.null){
                this.sign *= -1;
                target.g.y += this.sign;

                this.objectsThatWereCollidingThisObjectWhileMoving.forEach(updaterObject => {
                    updaterObject.g.y += this.sign;
                });

                if(target.force.Dy > 0){
                    target.verticalCollision = 1;
                }else if(target.force.Dy < 0){
                    target.verticalCollision = -1;
                }

                target.force.Dy = 0;
                
                this.distance = 0;
                if(this.sign>= 0){
                    this.distance = calculations.getShortestDeltaBetweenTwoRadians(target.gravity.delta, calculations.PI/2);
                }else{
                    this.distance = calculations.getShortestDeltaBetweenTwoRadians(target.gravity.delta, calculations.PI+(calculations.PI/2));
                }
                
                
                if(this.distance < 90){
                    target.gravity.Dy *= this.distance/90;
                    target.gravity.Dx *= 1-(this.distance/90);
                }

                //console.log("Friction");
                //target.force.Dx *= collisionTarget.friction * target.friction;
                target.force.Dx *= target.friction;
                
                break;
            }
            
        }

        this.stickyCheck = boxCollider.copy(target.collisionBox);
        this.checkDistance = Math.abs(magnitude) + 2;
        if(target.stickyTop){
            this.stickyCheck.expandTop(this.checkDistance);
        }
        if(target.stickyBottom){
            this.stickyCheck.expandBottom(this.checkDistance);
        }


        //Sticky draging
        if(target.stickyTop || target.stickyBottom){
            objContainer.loopThroughObjectsUntilCondition(objectGlobalData.objectsThatCollideWith[target.objectName], (testCollisionWith: iObject)=>{
                if(this.sign > 0){
                    //Moving down
                    if(testCollisionWith.g.y + testCollisionWith.collisionBox.y + testCollisionWith.collisionBox.height < target.g.y + target.collisionBox.y+target.collisionBox.height && internalFunction.intersecting(target, this.stickyCheck, testCollisionWith)){
                        testCollisionWith.g.y = target.g.y-testCollisionWith.collisionBox.y-testCollisionWith.collisionBox.height;
                    }
                    
                }else{
                    //Moving up
                    if(testCollisionWith.g.y > target.g.y && internalFunction.intersecting(target, this.stickyCheck, testCollisionWith)){
                        testCollisionWith.g.y = target.g.y+target.collisionBox.y+target.collisionBox.height-testCollisionWith.collisionBox.y;
                    }
                    
                }
                return false;
            });
        }

    }

}