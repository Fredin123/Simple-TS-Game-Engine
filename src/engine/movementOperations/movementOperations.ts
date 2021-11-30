import { iObject } from "../objectHandlers/iObject";
import { objectContainer } from "../objectHandlers/objectContainer";
import { iVector } from "../dataObjects/vector/iVector";
import { horizontalMovement } from "./horizontalMovement";
import { verticalMovement } from "./verticalMovement/verticalMovement";
import { polygonCollision } from "./polygonCollision";
import { nullVector } from "../dataObjects/vector/nullVector";


export class movementOperations{


    private static xdiff = 0;
    private static ydiff = 0;
    private static polygonCollisionTest: [boolean, iVector] = [false, new nullVector()];
    static moveByForce(target: iObject, force: iVector, 
        collisionNames: string[], objContainer: objectContainer, deltaTime: number){
        force.Dx = force.Dx;
        force.Dy = force.Dy;

        force.Dx *= target.airFriction;
        force.Dy *= target.airFriction;

        this.xdiff = force.Dx;
        this.ydiff = force.Dy;
        
        target.gravity.increaseMagnitude(target.weight);
        
        this.polygonCollisionTest = polygonCollision.collisionTest(target, Math.round(this.xdiff), Math.round(this.ydiff), 
                                objContainer);

        force.Dx += this.polygonCollisionTest[1].Dx;
        force.Dy += this.polygonCollisionTest[1].Dy;
        
        target.gravity.magnitude = this.polygonCollisionTest[1].magnitude;

        
        /* if(target.gravity.magnitude < 1){
            target.gravity.magnitude = 0K
        }*/

        

        

        horizontalMovement.moveForceHorizontal(Math.round(this.xdiff), target, collisionNames, objContainer);
        
        if(this.polygonCollisionTest[0] == false){
            verticalMovement.moveForceVertical(Math.round(this.ydiff), target, collisionNames, objContainer);
        }
    }







    
}