import { hitbox } from "../../../engine/hitboxes/hitbox/hitbox";
import { iObject } from "../../../engine/objectHandlers/iObject";
import { baseAttack } from "../../../engine/hitboxes/baseAttack/baseAttack";
import { movementDirection } from "../../../engine/action/attackDirections";
import { dummySandbag } from "../../../objects/dummySandbag";
import { player } from "../../../objects/player";



export class neutralAir extends baseAttack{

    constructor(creator: iObject, direction: movementDirection){
        super(creator, direction);

        var returnUserFacing = () => {
            return (creator as player).facingRight;
        };

        var collision = [dummySandbag.objectName];

        this.attackSeries

            .newAction().resetGravity()
            .create(() => {return hitbox.new([32, 24], 10, 4, collision, returnUserFacing)}).objOffset([16, 0]).objLife(8)
            .startupWait(2)
            .endWait(4)
        
            .newAction().resetGravity()
            .create(() => {return hitbox.new([20, 24], 170, 4, collision, returnUserFacing)}).objOffset([-16, 0]).objLife(8)
            .startupWait(4)
            .endWait(10);
    }

}