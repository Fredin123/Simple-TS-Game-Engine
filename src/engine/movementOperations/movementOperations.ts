import { iObject } from "../objectHandlers/iObject";
import { objectContainer } from "../objectHandlers/objectContainer";
import { iVector } from "../dataObjects/vector/iVector";
import { horizontalMovement } from "./horizontalMovement";
import { verticalMovement } from "./verticalMovement/verticalMovement";
import { polygonCollision } from "./polygonCollision";


export class movementOperations{


    static moveByForce(target: iObject, force: iVector, 
        collisionNames: string[], objContainer: objectContainer, deltaTime: number){
        force.Dx = force.Dx * deltaTime;
        force.Dy = force.Dy * deltaTime;

        force.Dx *= target.airFriction;
        force.Dy *= target.airFriction;

        let xdiff = force.Dx;
        let ydiff = force.Dy;
        
        target.gravity.increaseMagnitude(target.weight);
        
        let polygonCollisionTest = polygonCollision.collisionTest(target, Math.round(xdiff), Math.round(ydiff), objContainer);

        force.Dx += polygonCollisionTest[1].Dx;
        force.Dy += polygonCollisionTest[1].Dy;
        
        target.gravity.magnitude = polygonCollisionTest[1].magnitude;

        
        /* if(target.gravity.magnitude < 1){
            target.gravity.magnitude = 0K
        }*/

        

        

        horizontalMovement.moveForceHorizontal(Math.round(xdiff), target, collisionNames, objContainer);
        
        if(polygonCollisionTest[0] == false){
            verticalMovement.moveForceVertical(Math.round(ydiff), target, collisionNames, objContainer);
        }
    }







    
}