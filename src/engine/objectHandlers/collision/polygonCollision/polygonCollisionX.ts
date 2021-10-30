import { objectBase } from "../../objectBase";
import * as PIXI from 'pixi.js'
import { roomEvent } from "../../../roomEvent";
import { iObject } from "../../iObject";
import { vector } from "../../../dataObjects/vector/vector";
import { nullVector } from "../../../dataObjects/vector/nullVector";
import { iVector } from "../../../dataObjects/vector/iVector";
import { player } from "../../../../objects/player";
import { grassFilter } from "../../../../code/groundFilters/grassFilter";
import { groundGrassFilter } from "../../../../code/groundFilters/groundGrassFilter";


export class polygonCollisionX extends objectBase{
    static objectName = "polygonCollisionX";
    friction = 0.916;
    private polygon: number[] = [];
    private width = 0;
    private edgesPoints: number[] = [];
    private pointSpacing: number = 0;

    
    private filterGrass: grassFilter | null = null;
    

    groundFragment = {yPolPos: [1, 2, 3, 4]};
    
    private highestPoint = 0;

    constructor(xp: number, yp: number, input: string) {
        super(xp, yp, polygonCollisionX.objectName);
        //super.setCollision(0, 0, 32, 32);
        
    }

    setPolygon(polygon: number[], width: number, roomEvents: roomEvent, app: PIXI.Application){
        //width = 4096;
        this.highestPoint = Math.max(...polygon);
        this.highestPoint = this.closestPowerOf2(this.highestPoint);
        this.width = width;
        super.setCollision(0, -this.highestPoint, this.width, this.highestPoint);
        this.polygon = polygon;
        this.pointSpacing = this.width / (this.polygon.length-1);
        for(let i=0; i<this.polygon.length; i++){
            let pointY = this.polygon[i];
            this.edgesPoints.push((i*this.pointSpacing), -pointY);
        }

        super.style((g: PIXI.Container) => {


            //Polygon create
            let polygonGraphics = new PIXI.Graphics();
            polygonGraphics.beginFill(0x000000, 0); // use an alpha value of 1 to make it visible
            polygonGraphics.drawRect(0, -this.highestPoint, this.width, this.highestPoint);
            //polygonGraphics.beginFill(0x5d0015, 1);
            /*polygonGraphics.beginFill(0x0F2027, 1);
            
            polygonGraphics.drawPolygon(
                ...this.edgesPoints,
                this.edgesPoints[this.edgesPoints.length-2], 0,
                0, 0
            );
            
            polygonGraphics.endFill();*/

            
            

            
            let polygonPosGlslAdapted : number[] = [];
            this.polygon.forEach(pos => {
                polygonPosGlslAdapted.push(1-(pos/this.highestPoint));
            });
            
            
            
            let fullGroundContainer = new PIXI.Container();
            let groundGrassF = new groundGrassFilter(polygonPosGlslAdapted);
            

            fullGroundContainer.addChild(polygonGraphics);
            fullGroundContainer.filters = [groundGrassF.filter()];
            fullGroundContainer.cacheAsBitmap = true;
            app.renderer.render(fullGroundContainer);
            fullGroundContainer.filters = [];


            //static grass
            let spacingConst = 1.0/(polygonPosGlslAdapted.length-1);
            let staticGrassContainer = new PIXI.Container();
            let staticGrass = new grassFilter(polygonPosGlslAdapted, spacingConst, 24, "0.0", this.width/this.highestPoint,
                this.width, this.highestPoint, this.g.x, this.g.y);
            staticGrass.grassFragment.grassMaxHeight = 0.0058;
            staticGrass.grassFragment.cameraSize = 100;
            staticGrass.grassFragment.time = 1.57;

            staticGrassContainer.addChild(polygonGraphics);
            staticGrassContainer.filters = [staticGrass.filter()];
            staticGrassContainer.cacheAsBitmap = true;
            app.renderer.render(staticGrassContainer);
            staticGrassContainer.filters = [];



            //Moving grass
            let grassContainer = new PIXI.Container();
            
            this.filterGrass = new grassFilter(polygonPosGlslAdapted, spacingConst, 9, "0.001", this.width/this.highestPoint,
                this.width, this.highestPoint, this.g.x, this.g.y);
            grassContainer.addChild(polygonGraphics);
            grassContainer.filters = [this.filterGrass.filter()];

            g.addChild(fullGroundContainer);
            g.addChild(staticGrassContainer);
            g.addChild(grassContainer);
            
            return g;
        });
    }

    logic(l: roomEvent){
        super.logic(l);

        let currentTime = this.filterGrass!.grassFragment.time;
        currentTime += 0.015;
        this.filterGrass?.updateCollisionPositions(l);
        

        
    };
    


    private getYFromLine(xIndex: number){
        
        let edgeIndex = Math.floor((xIndex/this.pointSpacing))*2;

        let xFirst = this.edgesPoints[edgeIndex];
        let yFirst = this.edgesPoints[edgeIndex+1];
        let xLast = this.edgesPoints[edgeIndex+2];
        let yLast = this.edgesPoints[edgeIndex+2+1];

        if(xIndex >= xFirst && xIndex <= xLast){
            if(yFirst == yLast){
                return yFirst;
            }else{
                let steps = xLast - xFirst;
                let stepSize = (yFirst-yLast)/steps;
                return yFirst + (stepSize*(xFirst-xIndex));
            }
        }
            

        if(xIndex < 0){
            return this.edgesPoints[1];
        }else if(xIndex > this.edgesPoints.length-1){
            return this.edgesPoints[this.edgesPoints.length-2];
        }

        return 32;
    }

    private getCollisionVector(xIndex: number){
        var pointSpacing = this.width / (this.polygon.length-1);
        let edgesPoints: number[] = [];
        for(let i=0; i<this.polygon.length; i++){
            let pointY = this.polygon[i];
            edgesPoints.push((i*pointSpacing), -pointY);
        }

        let collisionVector: iVector = new nullVector();
        for(var i=0; i<edgesPoints.length; i+=2){
            let xFirst = edgesPoints[i];
            let yFirst = edgesPoints[i+1];

            let xLast = edgesPoints[i+2];
            let yLast = edgesPoints[i+2+1];
            if(xIndex >= xFirst && xIndex <= xLast){
                collisionVector = this.createVectorFromPoints(xFirst, yFirst, xLast, yLast);
            }
        }

        if(xIndex < 0){
            collisionVector = this.createVectorFromPoints(edgesPoints[0], edgesPoints[1], edgesPoints[2], edgesPoints[3]);
        }else if(xIndex > (edgesPoints.length-1)*pointSpacing){
            collisionVector = this.createVectorFromPoints(edgesPoints[(edgesPoints.length-1)], edgesPoints[(edgesPoints.length-1)+1], 
            edgesPoints[(edgesPoints.length-1)+2], edgesPoints[(edgesPoints.length-1)+3]);
        }

        return collisionVector;
    }

    private createVectorFromPoints(x: number, y: number, x2: number, y2: number){
        let triSide1 = Math.abs(x) - Math.abs(x2);
        let triSide2 = Math.abs(y) - Math.abs(y2);
        let length = Math.sqrt(Math.pow(triSide1, 2) + Math.pow(triSide2, 2));
        let vectorAngle = Math.atan2(x - x2, y - y2);
        let dx = Math.cos(vectorAngle) * length;
        let dy = Math.sin(vectorAngle) * length;
        
        return new vector(dx, dy);
    }
    

    public collisionTest(obj: iObject): [boolean, iVector]{

        let index =  (obj.g.x + obj.collisionBox.x + (obj.collisionBox.width/2)) - this.g.x;
        let extraCheckTop = 0;
            
        if(obj.force.Dx < -1){
            extraCheckTop = 16;
        }

        let spaceFromTop = this.getYFromLine(index);
        //console.log("index: ",index, "  spaceFromTop: ",spaceFromTop);
        let collisionTestY = obj.g.y + obj.collisionBox.y + obj.collisionBox.height;
        //console.log("if ",collisionWithPosition," > ",(this.g.y - (spaceFromTop)));
        let collision = false;
        if(obj.force.Dy > 0 && collisionTestY > this.g.y + (spaceFromTop)-5){
            obj.g.y = this.g.y + (spaceFromTop) - obj.collisionBox.y - obj.collisionBox.height;
            collisionTestY = obj.g.y + obj.collisionBox.y + obj.collisionBox.height;

            let collisionLine = this.getCollisionVector(index);
            //console.log("collisionLine: ",collisionLine.);
            
            //console.log("steepness: ",steepness);
            //console.log("collision angle: ",(360+90 + calculations.radiansToDegrees(collisionLine.delta))%360, "  dx: ",collisionLine.Dx);
            if(collisionLine.Dx > 0){
                let steepness = 1-((collisionLine.delta/(Math.PI/2))/-1);
                //vector going north (vector starts at west point)
                //
                //
                //       end
                //      /
                //     /
                //    /
                //   / 
                //start
                //collisionLine.delta

                //Make collision line point down
                collisionLine.Dx = -collisionLine.Dx;
                collisionLine.Dy = -collisionLine.Dy;
                collisionLine.magnitude = -obj.gravity.magnitude*steepness;
                obj.force.Dy = 0;
                obj.force.Dx *= this.friction;
                if(obj.force.Dx > 0){
                    obj.force.Dx *= (1-(steepness/3));
                }else if(obj.force.Dx < 0){
                    obj.force.Dx *= 1+(steepness/3);
                }
                //obj.gravity = collisionLine;
                obj.verticalCollision = 1;

                return [true, collisionLine];
                //obj.gravity.magnitude = 0; 
            }else if(collisionLine.Dx < 0){
                let steepness = 1+((collisionLine.delta/(Math.PI/2))/-1);
                //vector going north (vector starts at east point)
                //
                //
                // start
                //    \
                //     \
                //      \
                //      end
                //

                //Make collision line point down
                collisionLine.Dx = -collisionLine.Dx;
                collisionLine.Dy = -collisionLine.Dy;
                collisionLine.magnitude = obj.gravity.magnitude*steepness;
                obj.force.Dy = 0;
                obj.force.Dx *= this.friction;
                if(obj.force.Dx < 0){
                    obj.force.Dx *= (1-(steepness/3));
                }else if(obj.force.Dx > 0){
                    obj.force.Dx *= 1+(steepness/3);
                }
                //obj.gravity = collisionLine;
                obj.verticalCollision = 1;
                
                return [true, collisionLine];
            }
            
            

            return [false, obj.gravity];
        }
        

        return [false, obj.gravity];
    }


    private closestPowerOf2(numToRound: number): number{
        let testNumber = 0;
        while(Math.pow(2, testNumber) < numToRound){
            testNumber++;
        }
        return Math.pow(2, testNumber);
    }

}