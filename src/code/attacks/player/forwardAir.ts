import { hitbox } from "../../../engine/hitboxes/hitbox/hitbox";
import { iObject } from "../../../engine/objectHandlers/iObject";
import { baseAttack } from "../../../engine/hitboxes/baseAttack/baseAttack";
import { movementDirection } from "../../../engine/action/attackDirections";
import { dummySandbag } from "../../../objects/dummySandbag";
import { player } from "../../../objects/player";



export class forwardAir extends baseAttack{

    constructor(creator: iObject, direction: movementDirection){
        super(creator, direction);

        var returnUserFacing = () => {
            return (creator as player).facingRight;
        };

        var collision = [dummySandbag.objectName];

        this.attackSeries
            .newAction().vector(90, 1).resetGravity()
            .startupWait(3)
            .endWait(3)

            .newAction().resetGravity().removePrevObjsOnCreate()
            .create(() => {return hitbox.new([20, 48], 280, 3, collision, returnUserFacing)}).objOffset([16, 5]).objLife(4)
            .startupWait(2).repeat(2)
            .endWait(8)
        
            .newAction().resetGravity().removePrevObjsOnCreate()
            .create(() => {return hitbox.new([32, 48], 10, 4, collision, returnUserFacing)}).objOffset([16, 5]).objLife(10)
            .startupWait(6)
            .endWait(10)
    }

}