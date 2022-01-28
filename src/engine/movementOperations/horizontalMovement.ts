import { calculations } from "../calculations";
import { internalFunction } from "../internalFunctions";
import { boxCollider } from "../objectHandlers/collision/boxCollider";
import { iObject } from "../objectHandlers/iObject";
import { objectContainer } from "../objectHandlers/objectContainer";
import { objectGlobalData } from "../objectHandlers/objectGlobalData";
import { ticker } from "../ticker";
import { moveOperationsPush } from "./moveOperationsPush";

export class horizontalMovement{

    private static sign = 0;
    private static objectsThatWereCollidingThisObjectWhileMoving = new Array<iObject>();
    private static collisionTarget = objectGlobalData.null;
    private static i=0;
    private static distance = 0;
    private static stickyCheck: boxCollider
    private static checkDistance = 0;
    public static moveForceHorizontal(magnitude: number, target: iObject, collisionNames: string[], objContainer: objectContainer){
        if(magnitude == 0) return;
        target.horizontalCollision = 0;
        this.sign = magnitude>0?1:-1;
        this.objectsThatWereCollidingThisObjectWhileMoving = new Array<iObject>();
        this.collisionTarget = objectGlobalData.null;
        
        for(this.i=0; this.i<Math.abs(magnitude); this.i+=1){
            this.objectsThatWereCollidingThisObjectWhileMoving.length = 0;
            target.g.x += this.sign;

            if(objectGlobalData.objectsThatCollideWith[target.objectName] != null){
                //Push object
                objContainer.loopThroughObjectsUntilCondition(objectGlobalData.objectsThatCollideWith[target.objectName], (testCollisionWith: iObject)=>{
                    if((target.sameLayerCollisionOnly == false || (target.sameLayerCollisionOnly == true && target.layerIndex == testCollisionWith.layerIndex))){
                        if((this.sign > 0 && testCollisionWith.horizontalCollision <= 0) || (this.sign < 0 && testCollisionWith.horizontalCollision >= 0)){
                            if(internalFunction.intersecting(target, target.collisionBox, testCollisionWith)){
                                this.collisionTarget = moveOperationsPush.pushObjectHorizontal(target, testCollisionWith, this.sign, objContainer);
                                if(this.collisionTarget == objectGlobalData.null){
                                    target.force.Dx *= 1-testCollisionWith.weight;
                                }
                            }
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
                        if((target.sameLayerCollisionOnly == false || (target.sameLayerCollisionOnly == true && target.layerIndex == testCollisionWith.layerIndex))
                            && internalFunction.intersecting(target, stickyCheck, testCollisionWith)){
                            if(testCollisionWith._hasBeenMoved_Tick < ticker.getTicks()){
                                this.objectsThatWereCollidingThisObjectWhileMoving.push(testCollisionWith);
                                testCollisionWith.g.x += this.sign;
                                if(this.i >= Math.abs(magnitude)-1){
                                    testCollisionWith._hasBeenMoved_Tick = ticker.getTicks();
                                }
                            }
                        }
                        return false;
                    });
                }

            }
            
            
            if(this.collisionTarget == objectGlobalData.null){
                this.collisionTarget = objContainer.boxIntersectionInLayerSpecific(target, target.collisionBox, collisionNames, target.layerIndex);
                /*if(target.objectName == "player"){
                    console.log("this.collisionTarget: ",this.collisionTarget, "    second: ",(target._collidingWithPolygonTick - ticker.getTicks() > ticker.shortWindow));
                }*/
            }
            
            if(this.collisionTarget != objectGlobalData.null /*&& target._collidingWithPolygonTick - ticker.getTicks() > ticker.shortWindow*/){
                this.sign *= -1;
                target.g.x += 1*this.sign;

                this.objectsThatWereCollidingThisObjectWhileMoving.forEach(updaterObject => {
                    updaterObject.g.x += 1*this.sign;
                });

                if(target.force.Dx > 0){
                    target.horizontalCollision = 1;
                }else if(target.force.Dx < 0){
                    target.horizontalCollision = -1;
                }

                target.force.Dx = 0;

                this.distance = 0;
                if(this.sign<= 0){
                    this.distance = calculations.getShortestDeltaBetweenTwoRadians(target.gravity.delta, 0);
                }else{
                    this.distance = calculations.getShortestDeltaBetweenTwoRadians(target.gravity.delta, calculations.PI);
                }
                
                if(this.distance < 90){
                    target.gravity.Dy *= this.distance/90;
                    target.gravity.Dx *= 1-(this.distance/90);
                }
                
                target.force.Dy *= this.collisionTarget.friction * target.friction;

                break;
            }
        }



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
            
            objContainer.loopThroughObjectsUntilCondition(objectGlobalData.objectsThatCollideWith[target.objectName], (testCollisionWith: iObject)=>{
                if((target.sameLayerCollisionOnly == false || (target.sameLayerCollisionOnly == true && target.layerIndex == testCollisionWith.layerIndex))){
                    if(this.sign > 0){
                        //Moving right
                        if(testCollisionWith.g.x + testCollisionWith.collisionBox.x + testCollisionWith.collisionBox.width < target.g.x + target.collisionBox.x+target.collisionBox.width && internalFunction.intersecting(target, this.stickyCheck, testCollisionWith)){
                            testCollisionWith.g.x = target.g.x-testCollisionWith.collisionBox.x-testCollisionWith.collisionBox.width;
                        }
                    }else{
                        //Moving left
                        if(testCollisionWith.g.x > target.g.x && internalFunction.intersecting(target, this.stickyCheck, testCollisionWith)){
                            testCollisionWith.g.x = target.g.x+target.collisionBox.x+target.collisionBox.width-testCollisionWith.collisionBox.x;
                        }
                    }
                }
                return false;
            });
        }
    }

}