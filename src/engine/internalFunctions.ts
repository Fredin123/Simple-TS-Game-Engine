import { boxCollider } from "./objectHandlers/collision/boxCollider";
import { iObject } from "./objectHandlers/iObject";

export class internalFunction{
    private static x1 = 0;
    private static y1 = 0;

    private static x2 = 0;
    private static y2 = 0;
    static intersecting(initiator: iObject, initiadorCollisionBox: boxCollider, collisionTarget: iObject){
        this.x1 = initiator.g.x + initiadorCollisionBox.x;
        this.y1 = initiator.g.y + initiadorCollisionBox.y;

        this.x2 = collisionTarget.g.x + collisionTarget.collisionBox.x;
        this.y2 = collisionTarget.g.y + collisionTarget.collisionBox.y;

            
        return (
            this.x1 < this.x2 + collisionTarget.collisionBox.width &&
            this.x1 + initiadorCollisionBox.width > this.x2 &&
            this.y1 < this.y2 + collisionTarget.collisionBox.height &&
            this.y1 + initiadorCollisionBox.height > this.y2
          );
    }
}