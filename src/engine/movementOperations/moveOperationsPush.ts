import { internalFunction } from "../internalFunctions";
import { iObject } from "../objectHandlers/iObject";
import { objectContainer } from "../objectHandlers/objectContainer";
import { objectGlobalData } from "../objectHandlers/objectGlobalData";
import { ticker } from "../ticker";

export class moveOperationsPush{

    private static collided = false;
    public static pushObjectHorizontal(pusher: iObject, objectBeingPushed: iObject, sign: number, objContainer: objectContainer){
        this.collided = false;
        if(internalFunction.intersecting(pusher, pusher.collisionBox, objectBeingPushed)){
            if(objectBeingPushed.collisionTargets.length == 0){
                return pusher;
            }
            objectBeingPushed.g.x += sign;
            objContainer.loopThroughObjectsUntilCondition(objectBeingPushed.collisionTargets, (testCollision: iObject)=>{
                if(testCollision.objectName != pusher.objectName && 
                    (objectBeingPushed.sameLayerCollisionOnly == false || (objectBeingPushed.sameLayerCollisionOnly == true && objectBeingPushed.layerIndex == testCollision.layerIndex)) &&
                    internalFunction.intersecting(objectBeingPushed, objectBeingPushed.collisionBox, testCollision)
                    && this.pushObjectHorizontal(objectBeingPushed, testCollision, sign, objContainer) != objectGlobalData.null){
                        objectBeingPushed.g.x += sign*-1;
                        this.collided = true;
                }
                return false;
            });
        }
        if(this.collided){
            return objectBeingPushed;
        }
        return objectGlobalData.null;
    }

    public static pushObjectVertical(pusher: iObject, objectBeingPushed: iObject, sign: number, objContainer: objectContainer){
        this.collided = false;
        if(internalFunction.intersecting(pusher, pusher.collisionBox, objectBeingPushed)){
            if(objectBeingPushed.collisionTargets.length == 0){
                return pusher;
            }
            
            objectBeingPushed.g.y += sign;
            if(ticker.getTicks() - objectBeingPushed._collidingWithPolygonTick < ticker.shortWindow){
                objectBeingPushed.g.y += sign*-1;
                this.collided = true;
                return objectBeingPushed;
            }else{
                objContainer.loopThroughObjectsUntilCondition(objectBeingPushed.collisionTargets, (testCollision: iObject)=>{
                    if(testCollision.objectName != pusher.objectName && 
                        (objectBeingPushed.sameLayerCollisionOnly == false || (objectBeingPushed.sameLayerCollisionOnly == true && objectBeingPushed.layerIndex == testCollision.layerIndex)) &&
                        internalFunction.intersecting(objectBeingPushed, objectBeingPushed.collisionBox, testCollision)
                        && this.pushObjectVertical(objectBeingPushed, testCollision, sign, objContainer) != objectGlobalData.null){
                            objectBeingPushed.g.y += sign*-1;
                            this.collided = true;
                    }
                    return false;
                });
            }
            
        }
        if(this.collided){
            return objectBeingPushed;
        }
        return objectGlobalData.null;
    }
    
}