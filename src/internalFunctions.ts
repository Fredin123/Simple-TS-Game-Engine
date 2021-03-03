import { logger } from "./logger";
import { boxCollider } from "./objectHandlers/boxCollider";
import { iObject } from "./objectHandlers/iObject";
import { objectBase } from "./objectHandlers/objectBase";

export class internalFunction{
    //Full
    static intersecting(initiator: iObject, initiadorCollisionBox: boxCollider, collisionTarget: iObject){
        let x1 = initiator.g.x + initiadorCollisionBox.x;
        let y1 = initiator.g.y + initiadorCollisionBox.y;

        let x2 = collisionTarget.g.x + collisionTarget.collisionBox.x;
        let y2 = collisionTarget.g.y + collisionTarget.collisionBox.y;


        /*logger.showMessage(collisionTarget.objectName,"\n",x1 ," < ", x2 + collisionTarget.collisionBox.width ," && ",
            x1 + initiator.collisionBox.width ," > ", x2 ," && ",
            y1 ," < ", y2 + collisionTarget.collisionBox.height ," && ",
            y1 + initiator.collisionBox.height ," > ", y2,"    n",
            x1 < x2 + collisionTarget.collisionBox.width &&
            x1 + initiator.collisionBox.width > x2 &&
            y1 < y2 + collisionTarget.collisionBox.height &&
            y1 + initiator.collisionBox.height > y2);*/
            
        return (
            x1 < x2 + collisionTarget.collisionBox.width &&
            x1 + initiadorCollisionBox.width > x2 &&
            y1 < y2 + collisionTarget.collisionBox.height &&
            y1 + initiadorCollisionBox.height > y2
          );
    }


    /*static intersectingLeft(initiator: objectBase, collisionTarget: objectBase){
        let x1 = initiator.g.x + initiator.collisionBox.x;
        let y1 = initiator.g.y + initiator.collisionBox.y;


        let x2 = collisionTarget.g.x + collisionTarget.collisionBox.x;
        let y2 = collisionTarget.g.y + collisionTarget.collisionBox.y;


        return (
            x1 < x2 + collisionTarget.collisionBox.width &&
            x1 + 1 > x2 &&
            y1 < y2 + collisionTarget.collisionBox.height &&
            y1 + initiator.collisionBox.height > y2
          );
    }



    static intersectingRight(initiator: objectBase, collisionTarget: objectBase){
        let x1 = initiator.g.x + initiator.collisionBox.x + initiator.collisionBox.width-1;
        let y1 = initiator.g.y + initiator.collisionBox.y;


        let x2 = collisionTarget.g.x + collisionTarget.collisionBox.x;
        let y2 = collisionTarget.g.y + collisionTarget.collisionBox.y;

        return (
            x1 < x2 + collisionTarget.collisionBox.width &&
            x1 + 1> x2 &&
            y1 < y2 + collisionTarget.collisionBox.height &&
            y1 + initiator.collisionBox.height > y2
          );
    }


    static intersectingTop(initiator: objectBase, collisionTarget: objectBase){
        let x1 = initiator.g.x + initiator.collisionBox.x;
        let y1 = initiator.g.y + initiator.collisionBox.y;


        let x2 = collisionTarget.g.x + collisionTarget.collisionBox.x;
        let y2 = collisionTarget.g.y + collisionTarget.collisionBox.y;

        return (
            x1 < x2 + collisionTarget.collisionBox.width &&
            x1 + initiator.collisionBox.width > x2 &&
            y1 < y2 + collisionTarget.collisionBox.height &&
            y1 + 1 > y2
          );
    }


    static intersectingBottom(initiator: objectBase, collisionTarget: objectBase){
        let x1 = initiator.g.x + initiator.collisionBox.x;
        let y1 = initiator.g.y + initiator.collisionBox.y + initiator.collisionBox.height-1;


        let x2 = collisionTarget.g.x + collisionTarget.collisionBox.x;
        let y2 = collisionTarget.g.y + collisionTarget.collisionBox.y;

        return (
            x1 < x2 + collisionTarget.collisionBox.width &&
            x1 + initiator.collisionBox.width > x2 &&
            y1 < y2 + collisionTarget.collisionBox.height &&
            y1 + 1 > y2
          );
    }*/


}