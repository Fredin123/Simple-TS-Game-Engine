import * as PIXI from 'pixi.js'
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

    private angle = 0;
    private distance = 0;
    public moveCamera(app: PIXI.Application, cameraBounds: number[]){
        this.angle = calculations.angleBetweenPoints((this.cameraX - this.targetX), (this.cameraY - this.targetY));
            
        this.distance = calculations.distanceBetweenPoints(this.cameraX, this.cameraY, this.targetX, this.targetY);
            
        this.cameraX += Math.cos(this.angle) * this.distance * this.camMovementSpeedX;
        this.cameraY += Math.sin(this.angle) * this.distance * this.camMovementSpeedY;
        
        this.cameraX = Math.round(this.cameraX);
        this.cameraY = Math.round(this.cameraY);
        
        
        if(cameraBounds[0] + cameraBounds[1] + cameraBounds[2] + cameraBounds[3] != 0){
            
            if(this.cameraX - (app.renderer.width/2) < cameraBounds[0]){
                this.cameraX = cameraBounds[0] + (app.renderer.width/2);
            }

            if(this.cameraX + (app.renderer.width/2) > cameraBounds[0] + cameraBounds[2]){
                this.cameraX = cameraBounds[0] + cameraBounds[2] - (app.renderer.width/2);
            }


            if(this.cameraY - (app.renderer.height/2) < cameraBounds[1]){
                this.cameraY = cameraBounds[1] + (app.renderer.height/2);
            }

            if(this.cameraY + (app.renderer.height/2) > cameraBounds[1] + cameraBounds[3]){
                this.cameraY = cameraBounds[1] + cameraBounds[3] - (app.renderer.height/2);
            }
        }
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