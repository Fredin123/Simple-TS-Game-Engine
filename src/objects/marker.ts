import * as PIXI from 'pixi.js'
import { objectBase } from '../objectHandlers/objectBase';
import { roomEvent } from '../roomEvent';

export class marker extends objectBase{
    switch: boolean = false;
    static objectName = "marker";
    friction = 0.0;


    life: number = 1000;

    constructor(xp: number, yp: number) {
        super(xp, yp, marker.objectName);
        super.setCollision(0, 0, 0, 0);

        super.style((g: PIXI.Graphics) => {
            g.beginFill(0xFF0000); 
            g.drawRect(0, 0, 2, 2);
            g.endFill();
            return g;
        });
        
        /*setInterval(()=>{
            this.switch = !this.switch;
        }, 700);*/
    }

    logic(l: roomEvent){
        this.life--;

        if(this.life <= 0){
            l.objContainer.deleteObject(this);
        }
        //super.logic(l);
        /*if(this.switch){
            super.setNewForce(l.degreesToRadians(0), 3);
        }else{
            super.setNewForce(l.degreesToRadians(180), 3);
        }*/
    };



}