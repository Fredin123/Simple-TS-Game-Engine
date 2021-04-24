import { boxCollider } from "./objectHandlers/collision/boxCollider";
import { iObject } from "./objectHandlers/iObject";

export class internalFunction{
    
    
    static intersecting(initiator: iObject, initiadorCollisionBox: boxCollider, collisionTarget: iObject){
        let x1 = initiator.g.x + initiadorCollisionBox.x;
        let y1 = initiator.g.y + initiadorCollisionBox.y;

        let x2 = collisionTarget.g.x + collisionTarget.collisionBox.x;
        let y2 = collisionTarget.g.y + collisionTarget.collisionBox.y;


            
        return (
            x1 < x2 + collisionTarget.collisionBox.width &&
            x1 + initiadorCollisionBox.width > x2 &&
            y1 < y2 + collisionTarget.collisionBox.height &&
            y1 + initiadorCollisionBox.height > y2
          );
    }




}