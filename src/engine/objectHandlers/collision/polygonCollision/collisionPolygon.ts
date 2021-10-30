import { objectBase } from "../../objectBase";
import * as PIXI from 'pixi.js'
import { roomEvent } from "../../../roomEvent";
import { mio } from "../../../../objects/mio";
import { player } from "../../../../objects/player";
import { dummySandbag } from "../../../../objects/dummySandbag";
import { iObject } from "../../iObject";

export class collisionPolygon extends objectBase{
    switch: boolean = false;
    static objectName = "collisionPolygon";
    friction = 0.986;
    private previousTargets: iObject[] = [];
    private line: number[] = [0, 32, 16, 32, 48, 16, 64, 16];

    constructor(xp: number, yp: number, input: string) {
        super(xp, yp, collisionPolygon.objectName);
        super.setCollision(0, 0, 64, 64);

        
        
    }

    public setPolygon(polygon: number[]){
        this.line = polygon;
        super.style((g: PIXI.Container) => {


            let myGraph = new PIXI.Graphics();

            // Move it to the beginning of the line
            //myGraph.position.set(0, 12);

            let linesWithEnding = [... this.line];

            linesWithEnding.push(
                64, 64,
                0, 64);
            //console.log(linesWithEnding);
            myGraph.beginFill(0xff0000);
            myGraph.drawPolygon(linesWithEnding);
            myGraph.endFill();

            g.addChild(myGraph);
                
            return g;
        });
    }

    private getYFromLine(xIndex: number){
        for(var i=0; i<this.line.length; i+=2){
            let xFirst = this.line[i];
            let yFirst = this.line[i+1];

            let xLast = this.line[i+2];
            let yLast = this.line[i+2+1];
            if(xIndex >= xFirst && xIndex <= xLast){
                if(yFirst == yLast){
                    return yFirst;
                }else{
                    let steps = xLast - xFirst;
                    let stepSize = (yFirst-yLast)/steps;

                    return yFirst + (stepSize*(xFirst-xIndex));
                }
            }
        }
        if(xIndex <= 0){
            return this.line[1];
        }else if(xIndex >= this.line[this.line.length-1-1]){
            return this.line[this.line.length-1];
        }

        return 0;
    }

    logic(l: roomEvent){
        super.logic(l);

        
        for(var prevTarget of this.previousTargets){
            prevTarget._isColliding_Special = false;
        }
        
        let newTargets = l.isCollidingWithMultiple(this, this.collisionBox, [player.objectName, mio.objectName, dummySandbag.objectName]);
        for(var target of newTargets){
            /*for(var prevTarget of this.previousTargets){
                if(target.ID == prevTarget.ID){
                    this.previousTargets.splice(this.previousTargets.indexOf(prevTarget), 1);
                }
            }*/
            let index =  (target.g.x + target.collisionBox.x + (target.collisionBox.width/2)) - this.g.x;
    
            let extraCheckTop = 0;
            
            if(target.force.Dx < -1){
                extraCheckTop = 16;
            }
            let spaceFromTop = this.getYFromLine(index);

            if(Math.round(target.force.Dy) >= 0){
                if(target.g.y + target.collisionBox.y + target.collisionBox.height > this.g.y + (spaceFromTop/2)){
                    target.gravity.magnitude = 0;
                    target.force.Dy = 0;
                    target.force.Dx *= 0.916;
                    
                    target.g.y = this.g.y - target.collisionBox.y - target.collisionBox.height + spaceFromTop;// - target.collisionBox.y - (target.collisionBox.height) + 6 + (6*(1-ratio));
                    target._isColliding_Special = true;
                }else{
                    target._isColliding_Special = false;
                }
            }else if(Math.round(target.force.Dy) < 0){
                target._isColliding_Special = false;
            }
            
            /*if(target.force.Dy >= 0){
                let index =  (target.g.x + target.collisionBox.x + (target.collisionBox.width/2)) - this.g.x;
    
                let extraCheckTop = 0;
    
                if(target.force.Dx < -1){
                    extraCheckTop = 16;
                }
                let spaceFromTop = this.getYFromLine(index);
                if(target.g.y + target.collisionBox.y + target.collisionBox.height > this.g.y + (spaceFromTop/2)){
                    target.gravity.magnitude = 0;
                    target.force.Dy = 0;
                    target.force.Dx *= 0.916;
                    
                    target.g.y = this.g.y - target.collisionBox.y - target.collisionBox.height + spaceFromTop;// - target.collisionBox.y - (target.collisionBox.height) + 6 + (6*(1-ratio));
                    target._isColliding_Special = true;
                }else{
                    //target._isColliding_Special = false;
                }
            }else if(target.force.Dy <= 0){
                //target._isColliding_Special = false;
            }*/
            
        }
        this.previousTargets = newTargets;        

        
    };



}