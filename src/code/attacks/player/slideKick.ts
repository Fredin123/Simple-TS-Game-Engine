import { hitbox } from "../../../engine/hitboxes/hitbox/hitbox";
import { iObject } from "../../../engine/objectHandlers/iObject";
import { baseAttack } from "../../../engine/hitboxes/baseAttack/baseAttack";
import { movementDirection } from "../../../engine/action/attackDirections";
import { dummySandbag } from "../../../objects/dummySandbag";
import { player } from "../../../objects/player";



export class slideKick extends baseAttack{

    constructor(creator: iObject, direction: movementDirection){
        super(creator, direction);

        var returnUserFacing = () => {
            return (creator as player).facingRight;
        };

        var collision = [dummySandbag.objectName];

        
        this.attackSeries
            .newAction().vector(0, 16).userStill(true)
            .create(() => {return hitbox.new([18, 12], 20, 3, collision, returnUserFacing)}).objOffset([16, 5]).objLife(10)
            .startupWait(6)
            .endWait(20).userFriction(1)

            .newAction().vector(40, 12)//.continueWindow(19)
            .create(() => {return hitbox.new([20, 20], 80, 7, collision, returnUserFacing)}).objOffset([8, -10]).objLife(20)
            .startupWait(0)
            .endWait(3);

            /*.newAction().vector(300, 4)
            .startupWait(20)
            .endWait(30);*/
        
    }

}