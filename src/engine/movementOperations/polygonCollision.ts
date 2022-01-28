import { calculations } from "../calculations";
import { iVector } from "../dataObjects/vector/iVector";
import { nullVector } from "../dataObjects/vector/nullVector";
import { vector } from "../dataObjects/vector/vector";
import { internalFunction } from "../internalFunctions";
import { polygonCollisionX } from "../objectHandlers/collision/polygonCollision/polygonCollisionX";
import { iObject } from "../objectHandlers/iObject";
import { objectContainer } from "../objectHandlers/objectContainer";
import { objectGlobalData } from "../objectHandlers/objectGlobalData";
import { moveOperationsPush } from "./moveOperationsPush";

export class polygonCollision{

    private static collisionObjects: iObject[] = [];
    private static foundPolygonsTest: iObject[] = [];
    private static collisionResults: [boolean, iVector][] = [];
    private static currentFlatestCollision: iVector = new nullVector();
    private static i: number = 0;
    
    public static collisionTest(target: iObject, xTest: number, yTest: number, objContainer: objectContainer): [boolean, iVector]{
        if(target.collidesWithPolygonGeometry == true){
            
            this.foundPolygonsTest = objContainer.getSpecificObjectsInLayer(target._targetLayerForPolygonCollision, "polygonCollisionX");
            
            this.collisionObjects = [];
            for(var polygon of this.foundPolygonsTest){
                if(internalFunction.intersecting(target, target.collisionBox, polygon)){
                    this.collisionObjects.push(polygon);
                }
            }

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
            if(this.collisionResults.length == 0){
                return [false, target.gravity];
            }

            //Vertical push if collision
            /*if(target.objectName == "player"){
                console.log(this.collisionResults[0][1].Dy);
            }*/
            if(this.collisionResults[0][0] && this.collisionResults[0][1].Dy > 0){
                
                for(this.i=0; this.i<Math.round(this.collisionResults[0][1].Dy)+1; this.i+=1){
                    objContainer.loopThroughObjectsUntilCondition(objectGlobalData.objectsThatCollideWith[target.objectName], (testCollisionWith: iObject)=>{
                        if((target.sameLayerCollisionOnly == false || (target.sameLayerCollisionOnly == true && target.layerIndex == testCollisionWith.layerIndex))){
                            if(internalFunction.intersecting(target, target.collisionBox, testCollisionWith)){
                                moveOperationsPush.pushObjectVertical(target, testCollisionWith, -1, objContainer);
                            }
                        }
                        
                        
                        return false;
                    });
                }
                
            }

            return this.collisionResults[0];
            /*if(collisionTarget != objectGlobalData.null){
                return (collisionTarget as polygonCollisionX).collisionTest(target);
            }*/
        }

        //target._hasCollidedWithPolygon = false;
        return [false, target.gravity];
    }
}