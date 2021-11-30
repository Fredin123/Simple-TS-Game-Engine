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

    private static collisionObjects: iObject[] = [];
    private static collisionResults: [boolean, iVector][] = [];
    private static currentFlatestCollision: iVector = new nullVector();
    public static collisionTest(target: iObject, xTest: number, yTest: number, objContainer: objectContainer): [boolean, iVector]{
        if(target.collidesWithPolygonGeometry == true){
            this.collisionObjects = objContainer.filterObjects(["polygonCollisionX"], (testCollisionWith: iObject)=>{
                if(internalFunction.intersecting(target, target.collisionBox, testCollisionWith)){
                    return true;
                }
                return false;
            });
            //var collisionTarget = objContainer.boxIntersectionSpecific(target, target.collisionBox, ["polygonCollisionX"]);
            if(this.collisionObjects.length == 0){
                //target._hasCollidedWithPolygon = false;
                return [false, target.gravity];
            }

            this.collisionResults = [];
            this.collisionObjects.forEach(obj => {
                this.collisionResults.push((obj as polygonCollisionX).collisionTest(target));
            });

            
            /*this.currentFlatestCollision = new nullVector();
            this.currentFlatestCollision.delta = Math.PI/2;//point north
            this.collisionResults.forEach(collision => {
                
                if(collision[0] && collision[1].delta){
                    if(calculations.getShortestDeltaBetweenTwoRadians(collision[1].delta, 0) < calculations.getShortestDeltaBetweenTwoRadians(this.currentFlatestCollision.delta, 0)){
                        this.currentFlatestCollision = collision[1];
                    }
                }
            });*/
            
            //let collisionHighestPoint = collisionResults[0];
            //target._hasCollidedWithPolygon = false;
            return this.collisionResults[0];
            /*if(collisionTarget != objectGlobalData.null){
                return (collisionTarget as polygonCollisionX).collisionTest(target);
            }*/
        }

        //target._hasCollidedWithPolygon = false;
        return [false, target.gravity];
    }
}