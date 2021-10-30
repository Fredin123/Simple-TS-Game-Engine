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

    public static moveForceVertical(magnitude: number, target: iObject, collisionNames: string[], objContainer: objectContainer){
        if(magnitude == 0) return;
        target.verticalCollision = 0;
        let sign: number = magnitude>0?1:-1;
        let objectsThatWereCollidingThisObjectWhileMoving = new Array<iObject>();
        let collisionTarget: iObject = objectGlobalData.null;

        for(let i=0; i<Math.abs(magnitude); i+=1){
            objectsThatWereCollidingThisObjectWhileMoving.length = 0;
            target.g.y += sign;

            if(objectGlobalData.objectsThatCollideWith[target.objectName] != null){
                //push objects
                objContainer.loopThroughObjectsUntilCondition(objectGlobalData.objectsThatCollideWith[target.objectName], (testCollisionWith: iObject)=>{
                    if(internalFunction.intersecting(target, target.collisionBox, testCollisionWith)){
                        collisionTarget = moveOperationsPush.pushObjectVertical(target, testCollisionWith, sign, objContainer);
                        if(collisionTarget == objectGlobalData.null){
                            target.force.Dy *= 1-testCollisionWith.weight;
                        }
                    }
                    return false;
                });


                //Sticky draging
                let stickyCheck: boxCollider = boxCollider.copy(target.collisionBox);
                let checkDistance = Math.abs(magnitude) + 2;
                if(target.stickyLeftSide){
                    stickyCheck.expandLeftSide(checkDistance);
                }
                if(target.stickyRightSide){
                    stickyCheck.expandRightSide(checkDistance);
                }
                if(target.stickyLeftSide || target.stickyRightSide){
                    //console.log("objectBase.objectsThatCollideWithKeyObjectName[target.objectName]", objectBase.objectsThatCollideWithKeyObjectName[target.objectName]);
                    objContainer.loopThroughObjectsUntilCondition(objectGlobalData.objectsThatCollideWith[target.objectName], (testCollisionWith: iObject)=>{
                        if(internalFunction.intersecting(target, stickyCheck, testCollisionWith)){
                            if(testCollisionWith._hasBeenMoved_Tick < ticker.getTicks()){
                                objectsThatWereCollidingThisObjectWhileMoving.push(testCollisionWith);
                                testCollisionWith.g.y += sign;
                                if(i >= Math.abs(magnitude)-1){
                                    testCollisionWith._hasBeenMoved_Tick = ticker.getTicks();
                                }
                            }
                        }
                        return false;
                    });
                }
            }


            //This has to be more optimized
            if(collisionTarget == objectGlobalData.null){
                collisionTarget = objContainer.boxIntersectionSpecific(target, target.collisionBox, collisionNames);
            }
            
            if(collisionTarget != objectGlobalData.null){
                sign *= -1;
                target.g.y += sign;

                objectsThatWereCollidingThisObjectWhileMoving.forEach(updaterObject => {
                    updaterObject.g.y += sign;
                });

                if(target.force.Dy > 0){
                    target.verticalCollision = 1;
                }else if(target.force.Dy < 0){
                    target.verticalCollision = -1;
                }

                target.force.Dy = 0;
                
                let distance: number = 0;
                if(sign>= 0){
                    distance = calculations.getShortestDeltaBetweenTwoRadians(target.gravity.delta, calculations.PI/2);
                }else{
                    distance = calculations.getShortestDeltaBetweenTwoRadians(target.gravity.delta, calculations.PI+(calculations.PI/2));
                }
                
                
                if(distance < 90){
                    target.gravity.Dy *= distance/90;
                    target.gravity.Dx *= 1-(distance/90);
                }

                //console.log("Friction");
                //target.force.Dx *= collisionTarget.friction * target.friction;
                target.force.Dx *= target.friction;
                
                break;
            }
            
        }

        let stickyCheck: boxCollider = boxCollider.copy(target.collisionBox);
        let checkDistance = Math.abs(magnitude) + 2;
        if(target.stickyTop){
            stickyCheck.expandTop(checkDistance);
        }
        if(target.stickyBottom){
            stickyCheck.expandBottom(checkDistance);
        }


        //Sticky draging
        if(target.stickyTop || target.stickyBottom){
            objContainer.loopThroughObjectsUntilCondition(objectGlobalData.objectsThatCollideWith[target.objectName], (testCollisionWith: iObject)=>{
                if(sign > 0){
                    //Moving down
                    if(testCollisionWith.g.y + testCollisionWith.collisionBox.y + testCollisionWith.collisionBox.height < target.g.y + target.collisionBox.y+target.collisionBox.height && internalFunction.intersecting(target, stickyCheck, testCollisionWith)){
                        testCollisionWith.g.y = target.g.y-testCollisionWith.collisionBox.y-testCollisionWith.collisionBox.height;
                    }
                    
                }else{
                    //Moving up
                    if(testCollisionWith.g.y > target.g.y && internalFunction.intersecting(target, stickyCheck, testCollisionWith)){
                        testCollisionWith.g.y = target.g.y+target.collisionBox.y+target.collisionBox.height-testCollisionWith.collisionBox.y;
                    }
                    
                }
                return false;
            });
        }

    }

}