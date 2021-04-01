import { brain } from "./brain";
import { calculations } from "./calculations";

export class gameCamera{
    private isInUse: boolean = true;
    private cameraX: number = 0;
    private cameraY: number = 0; 

    private camMovementSpeedX: number = 0.08;
    private camMovementSpeedY: number = 0.08;

    private targetX: number = 0;
    private targetY: number = 0;

    public cameraOffsetX: number = 0;
    public cameraOffsetY: number = 0;

    public getIsInUse(){
        return this.isInUse;
    }

    public getX(){
        return this.cameraX;
    }

    public getY(){
        return this.cameraY;
    }

    public moveCamera(){
        let angle = brain.angleBetweenPoints((this.cameraX - this.targetX), (this.cameraY - this.targetY));
            
        let distance = brain.distanceBetweenPoints(this.cameraX, this.cameraY, this.targetX, this.targetY);
            
        this.cameraX += Math.cos(angle) * distance * this.camMovementSpeedX;
        this.cameraY += Math.sin(angle) * distance * this.camMovementSpeedY;
        
    }

    public setMoveSpeedX(moveSpeed: number){
        this.camMovementSpeedX = moveSpeed;
    }


    public setMoveSpeedY(moveSpeed: number){
        this.camMovementSpeedY = moveSpeed;
    }

    public setTarget(tx: number, ty: number){
        this.targetX = tx;
        this.targetY = ty;
    }

}