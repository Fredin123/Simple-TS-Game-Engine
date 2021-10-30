import { calculations } from "../calculations";
import { internalFunction } from "../internalFunctions";
import { boxCollider } from "../objectHandlers/collision/boxCollider";
import { iObject } from "../objectHandlers/iObject";
import { objectContainer } from "../objectHandlers/objectContainer";
import { objectGlobalData } from "../objectHandlers/objectGlobalData";
import { ticker } from "../ticker";
import { moveOperationsPush } from "./moveOperationsPush";

export class horizontalMovement{

    public static moveForceHorizontal(magnitude: number, target: iObject, collisionNames: string[], objContainer: objectContainer){
        if(magnitude == 0) return;
        target.horizontalCollision = 0;
        let sign: number = magnitude>0?1:-1;
        let objectsThatWereCollidingThisObjectWhileMoving = new Array<iObject>();
        let collisionTarget: iObject = objectGlobalData.null;
        
        for(let i=0; i<Math.abs(magnitude); i+=1){
            objectsThatWereCollidingThisObjectWhileMoving.length = 0;
            target.g.x += sign;

            if(objectGlobalData.objectsThatCollideWith[target.objectName] != null){
                //Push object
                objContainer.loopThroughObjectsUntilCondition(objectGlobalData.objectsThatCollideWith[target.objectName], (testCollisionWith: iObject)=>{
                    if(internalFunction.intersecting(target, target.collisionBox, testCollisionWith)){
                        collisionTarget = moveOperationsPush.pushObjectHorizontal(target, testCollisionWith, sign, objContainer);
                        if(collisionTarget == objectGlobalData.null){
                            target.force.Dx *= 1-testCollisionWith.weight;
                        }
                    }
                    return false;
                });


                //Sticky draging
                let stickyCheck: boxCollider = boxCollider.copy(target.collisionBox);
                let checkDistance = Math.abs(magnitude) + 2;
                if(target.stickyTop){
                    stickyCheck.expandTop(checkDistance);
                }
                if(target.stickyBottom){
                    stickyCheck.expandBottom(checkDistance);
                }
                if(target.stickyTop || target.stickyBottom){
                    //console.log("objectBase.objectsThatCollideWithKeyObjectName[target.objectName]", objectBase.objectsThatCollideWithKeyObjectName[target.objectName]);
                    objContainer.loopThroughObjectsUntilCondition(objectGlobalData.objectsThatCollideWith[target.objectName], (testCollisionWith: iObject)=>{
                        if(internalFunction.intersecting(target, stickyCheck, testCollisionWith)){
                            if(testCollisionWith._hasBeenMoved_Tick < ticker.getTicks()){
                                objectsThatWereCollidingThisObjectWhileMoving.push(testCollisionWith);
                                testCollisionWith.g.x += sign;
                                if(i >= Math.abs(magnitude)-1){
                                    testCollisionWith._hasBeenMoved_Tick = ticker.getTicks();
                                }
                            }
                        }
                        return false;
                    });
                }

            }
            
            
            if(collisionTarget == objectGlobalData.null){
                collisionTarget = objContainer.boxIntersectionSpecific(target, target.collisionBox, collisionNames);
            }
            
            if(collisionTarget != objectGlobalData.null && target._isColliding_Special == false){
                
                sign *= -1;
                target.g.x += 1*sign;

                objectsThatWereCollidingThisObjectWhileMoving.forEach(updaterObject => {
                    updaterObject.g.x += 1*sign;
                });

                if(target.force.Dx > 0){
                    target.horizontalCollision = 1;
                }else if(target.force.Dx < 0){
                    target.horizontalCollision = -1;
                }

                target.force.Dx = 0;

                let distance: number = 0;
                if(sign<= 0){
                    distance = calculations.getShortestDeltaBetweenTwoRadians(target.gravity.delta, 0);
                }else{
                    distance = calculations.getShortestDeltaBetweenTwoRadians(target.gravity.delta, calculations.PI);
                }
                
                if(distance < 90){
                    target.gravity.Dy *= distance/90;
                    target.gravity.Dx *= 1-(distance/90);
                }
                
                target.force.Dy *= collisionTarget.friction * target.friction;

                break;
            }
        }



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
            
            objContainer.loopThroughObjectsUntilCondition(objectGlobalData.objectsThatCollideWith[target.objectName], (testCollisionWith: iObject)=>{
                if(sign > 0){
                    //Moving right
                    if(testCollisionWith.g.x + testCollisionWith.collisionBox.x + testCollisionWith.collisionBox.width < target.g.x + target.collisionBox.x+target.collisionBox.width && internalFunction.intersecting(target, stickyCheck, testCollisionWith)){
                        testCollisionWith.g.x = target.g.x-testCollisionWith.collisionBox.x-testCollisionWith.collisionBox.width;
                    }
                }else{
                    //Moving left
                    if(testCollisionWith.g.x > target.g.x && internalFunction.intersecting(target, stickyCheck, testCollisionWith)){
                        testCollisionWith.g.x = target.g.x+target.collisionBox.x+target.collisionBox.width-testCollisionWith.collisionBox.x;
                    }
                    
                }
                return false;
            });
        }
    }

}