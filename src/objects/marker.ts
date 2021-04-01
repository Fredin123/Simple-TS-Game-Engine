import * as PIXI from 'pixi.js'
import { objectBase } from '../engine/objectHandlers/objectBase';
import { roomEvent } from '../engine/roomEvent';


export class marker extends objectBase{
    switch: boolean = false;
    static objectName = "marker";
    friction = 0.0;


    life: number = 1000;

    constructor(xp: number, yp: number) {
        super(xp, yp, marker.objectName);
        super.setCollision(0, 0, 0, 0);

        super.style((g: PIXI.Container) => {
            let line = new PIXI.Graphics()
            line.lineStyle(25, 0xBB0000, 1, 1);
            line.x = 32;
            line.y = 0;
            line.moveTo(0, 0);
            line.lineTo(0, 100);
            line.endFill();
            g.addChild(line);
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