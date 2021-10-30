import { hitbox } from "../../../engine/hitboxes/hitbox/hitbox";
import { iObject } from "../../../engine/objectHandlers/iObject";
import { baseAttack } from "../../../engine/hitboxes/baseAttack/baseAttack";
import { movementDirection } from "../../../engine/action/attackDirections";
import { dummySandbag } from "../../../objects/dummySandbag";
import { player } from "../../../objects/player";



export class downAir extends baseAttack{

    constructor(creator: iObject, direction: movementDirection){
        super(creator, direction);

        var returnUserFacing = () => {
            return (creator as player).facingRight;
        };

        var collision = [dummySandbag.objectName];

        this.attackSeries
            .newAction().vector(90, 2).resetGravity()
            .startupWait(2)
            .endWait(6)

            .newAction().vector(270, 18).resetGravity()
            .create(() => {return hitbox.new([82, 32], 80, 8.5, collision, returnUserFacing)}).objOffset([0, 5]).objLife(60)
            .startupWait(3)
            .endWait(10);
    }

}