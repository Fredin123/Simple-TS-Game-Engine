import { calculations } from "./calculations";
import { internalFunction } from "./internalFunctions";
import { logger } from "./logger";
import { boxCollider } from "./objectHandlers/boxCollider";
import { iObject } from "./objectHandlers/iObject";
import { objectBase } from "./objectHandlers/objectBase";
import { objectContainer } from "./objectHandlers/objectContainer";
import { roomEvent } from "./roomEvent";
import { vector } from "./vector/vector";


export class movementOperations{


    static moveByForce(target: iObject, force: vector, collisionNames: string[], objContainer: objectContainer, deltaTime: number){
        force.Dx = force.Dx * deltaTime;
        force.Dy = force.Dy * deltaTime;
        if(Math.abs(force.Dx) <= 0.0000001){
            force.Dx = 0;
        }

        if(Math.abs(force.Dy) <= 0.0000001){
            force.Dy = 0;
        }
        let xdiff = force.Dx;
        let ydiff = force.Dy;

        
        this.moveForceHorizontal(Math.round(xdiff), target, collisionNames, objContainer);
        
        
        this.moveForceVertical(Math.round(ydiff), target, collisionNames, objContainer);
        

        force.Dx *= target.airFriction;
        force.Dy *= target.airFriction;

        if(target.gravity != vector.null){
            force.Dx += target.gravity!.Dx;
            force.Dy += target.gravity!.Dy;
            target.gravity.increaseMagnitude(target.weight);
        }



        
        
        
    }

    private static moveForceHorizontal(magnitude: number, target: iObject, collisionNames: string[], objContainer: objectContainer){
        if(magnitude == 0) return;
        let sign: number = magnitude>0?1:-1;
        let objectsThatWereCollidingThisObjectWhileMoving = new Array<iObject>();

        
        for(let i=0; i<Math.abs(magnitude); i+=1){
            objectsThatWereCollidingThisObjectWhileMoving.length = 0;
            

            target.g.x += sign;

            if(objectBase.objectsThatCollideWithKeyObjectName[target.objectName] != null){
                //Push object
                objContainer.foreachObjectType(objectBase.objectsThatCollideWithKeyObjectName[target.objectName], (testCollisionWith: iObject)=>{
                    if(sign > 0){
                        //Move right
                        if(testCollisionWith.g.x > target.g.x  && internalFunction.intersecting(target, target.collisionBox, testCollisionWith)){
                            objectsThatWereCollidingThisObjectWhileMoving.push(testCollisionWith);
                            testCollisionWith.g.x += sign;
                        }
                    }else{
                        //Move left
                        if(testCollisionWith.g.x + testCollisionWith.collisionBox.x + testCollisionWith.collisionBox.width < target.g.x + target.collisionBox.x+target.collisionBox.width && internalFunction.intersecting(target, target.collisionBox, testCollisionWith)){
                            objectsThatWereCollidingThisObjectWhileMoving.push(testCollisionWith);
                            testCollisionWith.g.x += sign;
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
                    objContainer.foreachObjectType(objectBase.objectsThatCollideWithKeyObjectName[target.objectName], (testCollisionWith: iObject)=>{
                        //console.log("Check object: ", testCollisionWith);
                        if(sign > 0){
                            //Move right
                            if(internalFunction.intersecting(target, stickyCheck, testCollisionWith)){
                                if(testCollisionWith._hasBeenMoved_Tick < roomEvent.getTicks()){
                                    objectsThatWereCollidingThisObjectWhileMoving.push(testCollisionWith);
                                    testCollisionWith.g.x += sign;
                                    if(i >= Math.abs(magnitude)-1){
                                        testCollisionWith._hasBeenMoved_Tick = roomEvent.getTicks();
                                    }
                                }
                            }
                        }else{
                            //Move left
                            if(internalFunction.intersecting(target, stickyCheck, testCollisionWith)){
                                if(testCollisionWith._hasBeenMoved_Tick < roomEvent.getTicks()){
                                    objectsThatWereCollidingThisObjectWhileMoving.push(testCollisionWith);
                                    testCollisionWith.g.x += sign;
                                    if(i >= Math.abs(magnitude)-1){
                                        testCollisionWith._hasBeenMoved_Tick = roomEvent.getTicks();
                                    }
                                }
                            }
                        }
                        return false;
                    });
                }

            }
            
            

            let collisionTarget = this.boxIntersectionSpecific(target, target.collisionBox, collisionNames, objContainer);
            if(collisionTarget != objectBase.null){
                
                sign *= -1;
                target.g.x += 1*sign;

                objectsThatWereCollidingThisObjectWhileMoving.forEach(updaterObject => {
                    updaterObject.g.y += 1*sign;
                });

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
                
                target.force.Dy *= collisionTarget.friction;

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
            
            objContainer.foreachObjectType(objectBase.objectsThatCollideWithKeyObjectName[target.objectName], (testCollisionWith: iObject)=>{
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

    private static moveForceVertical(magnitude: number, target: iObject, collisionNames: string[], objContainer: objectContainer){
        if(magnitude == 0) return;
        let sign: number = magnitude>0?1:-1;
        let objectsThatWereCollidingThisObjectWhileMoving = new Array<iObject>();

        for(let i=0; i<Math.abs(magnitude); i+=1){
            

            target.g.y += sign;

            if(objectBase.objectsThatCollideWithKeyObjectName[target.objectName] != null){
                objContainer.foreachObjectType(objectBase.objectsThatCollideWithKeyObjectName[target.objectName], (testCollisionWith: iObject)=>{
                    if(sign > 0){
                        //Move down
                        if(testCollisionWith.g.y > target.g.y  && internalFunction.intersecting(target, target.collisionBox, testCollisionWith)){
                            testCollisionWith.g.y += sign;
                            let move = true;
                            /*if(this.boxIntersectionSpecific(testCollisionWith, testCollisionWith.collisionBox, 
                                objectBase.objectsThatCollideWithKeyObjectName[testCollisionWith.objectName], objContainer)){
                                    move = false;
                                    testCollisionWith.g.y -= sign;
                            }*/
                            if(move){
                                objectsThatWereCollidingThisObjectWhileMoving.push(testCollisionWith);
                            }
                        }
                    }else{
                        //Move up
                        if(testCollisionWith.g.y + testCollisionWith.collisionBox.y + testCollisionWith.collisionBox.height < target.g.y + target.collisionBox.y+target.collisionBox.height && internalFunction.intersecting(target, target.collisionBox, testCollisionWith)){
                            testCollisionWith.g.y += sign;
                            let move = true;

                            /*if(this.boxIntersectionSpecific(testCollisionWith, testCollisionWith.collisionBox, 
                                objectBase.objectsThatCollideWithKeyObjectName[testCollisionWith.objectName], objContainer)){
                                    move = false;
                                    testCollisionWith.g.y -= sign;
                            }*/
                            if(move){
                                objectsThatWereCollidingThisObjectWhileMoving.push(testCollisionWith);
                            }
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
                    objContainer.foreachObjectType(objectBase.objectsThatCollideWithKeyObjectName[target.objectName], (testCollisionWith: iObject)=>{
                        //console.log("Check object: ", testCollisionWith);
                        if(sign > 0){
                            //Move down
                            if(internalFunction.intersecting(target, stickyCheck, testCollisionWith)){
                                if(testCollisionWith._hasBeenMoved_Tick < roomEvent.getTicks()){
                                    objectsThatWereCollidingThisObjectWhileMoving.push(testCollisionWith);
                                    testCollisionWith.g.y += sign;
                                    if(i >= Math.abs(magnitude)-1){
                                        testCollisionWith._hasBeenMoved_Tick = roomEvent.getTicks();
                                    }
                                }
                            }
                        }else{
                            //Move up
                            if(internalFunction.intersecting(target, stickyCheck, testCollisionWith)){
                                if(testCollisionWith._hasBeenMoved_Tick < roomEvent.getTicks()){
                                    objectsThatWereCollidingThisObjectWhileMoving.push(testCollisionWith);
                                    testCollisionWith.g.y += sign;
                                    if(i >= Math.abs(magnitude)-1){
                                        testCollisionWith._hasBeenMoved_Tick = roomEvent.getTicks();
                                    }
                                }
                            }
                        }
                        return false;
                    });
                }



            }


            //This has to be more optimized
            let collisionTarget = this.boxIntersectionSpecific(target, target.collisionBox, collisionNames, objContainer);
            if(collisionTarget != objectBase.null){
                sign *= -1;
                target.g.y += sign;

                objectsThatWereCollidingThisObjectWhileMoving.forEach(updaterObject => {
                    updaterObject.g.y += sign;
                });

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
                //target.gravity.Dy = 0;
                //target.force.Dy *= collisionTarget.friction;
                target.force.Dx *= collisionTarget.friction;
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
            objContainer.foreachObjectType(objectBase.objectsThatCollideWithKeyObjectName[target.objectName], (testCollisionWith: iObject)=>{
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


    private static moveOutFromCollider(magnitude: number, iteretorSize: number, target: iObject, collisionNames: string[], objContainer: objectContainer){
        let collisionTarget: iObject;
        let moveX = 0;
        while((collisionTarget = this.boxIntersectionSpecific(target, target.collisionBox, collisionNames, objContainer)) != objectBase.null){
            target.g.x += Math.cos(collisionTarget.force.delta);
            moveX = Math.cos(collisionTarget.force.delta);
        }

        /*if(moveX > 0){
            target.g.x += 5;
        }else if(moveX < 0){
            target.g.x -= 5;
        }*/
        
    }



    


    //Collision
    private static boxIntersectionSpecificClass = (new class {

        inc = (initiator: iObject, boxData: boxCollider, targetObjects: string[], objContainer: objectContainer) : iObject=> {
            return objContainer.foreachObjectType(targetObjects, (testCollisionWith: iObject)=>{
                if(internalFunction.intersecting(initiator, boxData, testCollisionWith)){
                    return true;
                }
                return false;
            });
        };
    }).inc;
    private static boxIntersectionSpecific(initiator: iObject, boxData: boxCollider, targetObjects: string[], objContainer: objectContainer): iObject{
        return this.boxIntersectionSpecificClass(initiator, boxData, targetObjects, objContainer);
    }








    
}