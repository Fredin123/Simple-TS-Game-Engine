import { calculations } from "../calculations";
import { iVector } from "../dataObjects/vector/iVector";
import { nullVector } from "../dataObjects/vector/nullVector";
import { vector } from "../dataObjects/vector/vector";
import { internalFunction } from "../internalFunctions";
import { polygonCollisionX } from "../objectHandlers/collision/polygonCollision/polygonCollisionX";
import { iObject } from "../objectHandlers/iObject";
import { objectContainer } from "../objectHandlers/objectContainer";
import { objectGlobalData } from "../objectHandlers/objectGlobalData";

export class polygonCollision{

    public static collisionTest(target: iObject, xTest: number, yTest: number, objContainer: objectContainer): [boolean, iVector]{
        if(target.collidesWithPolygonGeometry == true){
            let collisionObjects = objContainer.filterObjects(["polygonCollisionX"], (testCollisionWith: iObject)=>{
                if(internalFunction.intersecting(target, target.collisionBox, testCollisionWith)){
                    return true;
                }
                return false;
            });
            //var collisionTarget = objContainer.boxIntersectionSpecific(target, target.collisionBox, ["polygonCollisionX"]);
            if(collisionObjects.length == 0){
                //target._hasCollidedWithPolygon = false;
                return [false, target.gravity];
            }

            let collisionResults: [boolean, iVector][] = [];
            collisionObjects.forEach(obj => {
                collisionResults.push((obj as polygonCollisionX).collisionTest(target));
            });

            
            let currentFlatestCollision: iVector = new nullVector();
            currentFlatestCollision.delta = Math.PI/2;//point north
            collisionResults.forEach(collision => {
                
                if(collision[0] && collision[1].delta){
                    if(calculations.getShortestDeltaBetweenTwoRadians(collision[1].delta, 0) < calculations.getShortestDeltaBetweenTwoRadians(currentFlatestCollision.delta, 0)){
                        currentFlatestCollision = collision[1];
                    }
                }
            });
            
            let collisionHighestPoint = collisionResults[0];
            //target._hasCollidedWithPolygon = false;
            return collisionResults[0];
            /*if(collisionTarget != objectGlobalData.null){
                return (collisionTarget as polygonCollisionX).collisionTest(target);
            }*/
        }

        //target._hasCollidedWithPolygon = false;
        return [false, target.gravity];
    }
}