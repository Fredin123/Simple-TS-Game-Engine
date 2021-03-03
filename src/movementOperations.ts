import { calculations } from "./calculations";
import { vector } from "./dataModules/vector/vector";
import { internalFunction } from "./internalFunctions";
import { logger } from "./logger";
import { boxCollider } from "./objectHandlers/boxCollider";
import { iObject } from "./objectHandlers/iObject";
import { objectBase } from "./objectHandlers/objectBase";
import { objectContainer } from "./objectHandlers/objectContainer";
import { movingBlockVert } from "./objects/blocks/movingBlockVert";


export class movementOperations{


    static moveByForce(target: iObject, force: vector, collisionNames: string[], objContainer: objectContainer){
        if(Math.abs(force.Dx) <= 0.000000001){
            force.Dx = 0;
        }

        if(Math.abs(force.Dy) <= 0.000000001){
            force.Dy = 0;
        }
        let xdiff = force.Dx;
        let ydiff = force.Dy;

        
        this.moveForceHorizontal(~~xdiff, 1, target, collisionNames, objContainer);
        this.moveForceHorizontal(xdiff - ~~xdiff, 0.01, target, collisionNames, objContainer);
        //this.moveOutFromCollider(xdiff % 1, 0.01, target, collisionNames, objContainer);
        
        
        this.moveForceVertical(~~ydiff, 1, target, collisionNames, objContainer);
        this.moveForceVertical(ydiff - ~~ydiff, 0.01, target, collisionNames, objContainer);
        //this.moveForceVertical(ydiff - ~~ydiff, 0.001, target, collisionNames, objContainer);
        

        force.Dx *= target.airFriction;
        force.Dy *= target.airFriction;

        if(target.gravity != vector.null){
            force.Dx += target.gravity!.Dx;
            force.Dy += target.gravity!.Dy;
            target.gravity.increaseMagnitude(target.weight);
        }



        
        
        
    }

    private static moveForceHorizontal(magnitude: number, iteretorSize: number, target: iObject, collisionNames: string[], objContainer: objectContainer){
        let sign: number = magnitude?magnitude<0?-1:1:0;
        let objectsThatWereCollidingThisObjectWhileMoving = new Array<iObject>();

        for(let i=0; i<Math.abs(magnitude); i+=iteretorSize){
            target.g.x += iteretorSize*sign;

            target.collisionBox.shrink(0, 1);
            if(objectBase.objectsThatCollideWithKeyObjectName[target.objectName] != null){
                let collisionTarget: iObject;
                
                while((collisionTarget = this.boxIntersectionSpecific(target, target.collisionBox, objectBase.objectsThatCollideWithKeyObjectName[target.objectName], objContainer)) != objectBase.null){
                    objectsThatWereCollidingThisObjectWhileMoving.push(collisionTarget);
                    collisionTarget.g.x += iteretorSize*sign;
                }
            }

            target.collisionBox.expand(0, 1);

            let collisionTarget = this.boxIntersectionSpecific(target, target.collisionBox, collisionNames, objContainer);
            if(collisionTarget != objectBase.null){
                
                sign *= -1;
                target.g.x += 1*iteretorSize*sign;

                objectsThatWereCollidingThisObjectWhileMoving.forEach(updaterObject => {
                    updaterObject.g.y += iteretorSize*sign;
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


        


    }

    private static moveForceVertical(magnitude: number, iteretorSize: number, target: iObject, collisionNames: string[], objContainer: objectContainer){
        let sign: number = magnitude?magnitude>0?-1:1:0;
        let objectsThatWereCollidingThisObjectWhileMoving = new Array<iObject>();

        for(let i=0; i<Math.abs(magnitude); i+=iteretorSize){
            target.g.y += iteretorSize*sign;

            target.collisionBox.shrink(1, 0);
            if(objectBase.objectsThatCollideWithKeyObjectName[target.objectName] != null){
                let collisionTarget: iObject;
                while((collisionTarget = this.boxIntersectionSpecific(target, target.collisionBox, objectBase.objectsThatCollideWithKeyObjectName[target.objectName], objContainer)) != objectBase.null){
                    objectsThatWereCollidingThisObjectWhileMoving.push(collisionTarget);
                    collisionTarget.g.y += iteretorSize*sign;
                }
            }
            target.collisionBox.expand(1, 0);

            let collisionTarget = this.boxIntersectionSpecific(target, target.collisionBox, collisionNames, objContainer);
            if(collisionTarget != objectBase.null){
                sign *= -1;
                target.g.y += iteretorSize*sign;

                objectsThatWereCollidingThisObjectWhileMoving.forEach(updaterObject => {
                    updaterObject.g.y += iteretorSize*sign;
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



        //Sticky draging
        if(target.stickyness > 0 && sign > 0){
            //Top test
            let checkDistance = Math.abs(magnitude) + 2;
            let stickyTop = new boxCollider(target.collisionBox.x+1, target.collisionBox.y-checkDistance, target.collisionBox.width-2, checkDistance);
            
            objContainer.foreachObjectType(objectBase.objectsThatCollideWithKeyObjectName[target.objectName], (testCollisionWith: iObject)=>{
                if(internalFunction.intersecting(target, stickyTop, testCollisionWith)){
                    testCollisionWith.g.y = target.g.y-testCollisionWith.collisionBox.height-(0.5);
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