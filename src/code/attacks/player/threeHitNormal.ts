import { hitbox } from "../../../engine/hitboxes/hitbox/hitbox";
import { iObject } from "../../../engine/objectHandlers/iObject";
import { baseAttack } from "../../../engine/hitboxes/baseAttack/baseAttack";
import { movementDirection } from "../../../engine/action/attackDirections";
import { dummySandbag } from "../../../objects/dummySandbag";
import { player } from "../../../objects/player";



export class threeHitNormal extends baseAttack{

    constructor(creator: iObject, direction: movementDirection){
        super(creator, direction);

        var returnUserFacing = () => {
            return (creator as player).facingRight;
        };

        var collision = [dummySandbag.objectName];

        this.attackSeries
            .newAction().vector(0, 1).userStill(true)
            .create(() => {return hitbox.new([18, 12], 87, 1, collision, returnUserFacing)}).objOffset([16, -5]).objLife(3)
            .startupWait(3)

            .newAction().vector(0, 1).userStill(true).continueWindow(15).removePrevObjsOnCreate()
            .create(() => {return hitbox.new([18, 12], 40, 5, collision, returnUserFacing)}).objOffset([16, -5]).objLife(5)
            .startupWait(5)

            .newAction().vector(60, 4).userStill(true).continueWindow(19)
            .startupWait(5)
            .endWait(16)

            .newAction().userStill(true).removePrevObjsOnCreate()
            .create(() => {return hitbox.new([27, 32], 40, 5, collision, returnUserFacing)}).objOffset([16, 8]).objLife(12)
            .startupWait(0)
            .endWait(10)
        
    }

}