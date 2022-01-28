import { objectBase } from "../../objectBase";
import * as PIXI from 'pixi.js'
import { roomEvent } from "../../../roomEvent/roomEvent";
import { iObject } from "../../iObject";
import { vector } from "../../../dataObjects/vector/vector";
import { nullVector } from "../../../dataObjects/vector/nullVector";
import { iVector } from "../../../dataObjects/vector/iVector";
import { grassFilter } from "../../../engineFilters/groundFilters/grassFilter";
import { groundGrassFilter } from "../../../engineFilters/groundFilters/groundGrassFilter";
import { objectFunctions } from "../../objectFunctions";
import { fadedSidesX } from "../../../engineFilters/fadedSidesX";


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

    getWidth(){
        return this.width;
    }
    
    setPolygon(polygon: number[], width: number, objFuncs: objectFunctions, app: PIXI.Application){
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
            
            let groundGrassF = new groundGrassFilter(polygonPosGlslAdapted, this.highestPoint, width, objFuncs.getWindowHeight());
            

            fullGroundContainer.addChild(polygonGraphics);
            fullGroundContainer.filters = [groundGrassF.filter()];
            fullGroundContainer.cacheAsBitmap = true;
            app.renderer.render(fullGroundContainer);
            fullGroundContainer.filters = [];


            //static grass
            let spacingConst = 1.0/(polygonPosGlslAdapted.length-1);
            let staticGrassContainer = new PIXI.Container();
            let staticGrass = new grassFilter(polygonPosGlslAdapted, spacingConst, 24, 0.0, this.width/this.highestPoint,
                this.width,
                this.highestPoint, this.g.x, this.g.y,
                this.highestPoint, objFuncs.getWindowHeight(),
                this.width, objFuncs.getWindowWidth(),
                this.layerIndex);
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
            
            this.filterGrass = new grassFilter(polygonPosGlslAdapted, spacingConst, 32, 0.001, this.width/this.highestPoint,
                this.width,
                this.highestPoint, this.g.x, this.g.y,
                this.highestPoint, objFuncs.getWindowHeight(),
                this.width, objFuncs.getWindowWidth(),
                this.layerIndex);
            grassContainer.addChild(polygonGraphics);
            grassContainer.filters = [this.filterGrass.filter()];

            g.addChild(fullGroundContainer);
            g.addChild(staticGrassContainer);
            g.addChild(grassContainer);
            


            /*let groundFade = new fadedSidesX(128, this.width);
            

            let overlayBlendFade = new PIXI.Graphics();
            //overlayBlendFade.blendMode = PIXI.BLEND_MODES.ADD;
            overlayBlendFade.beginFill(0x000000, 0); // use an alpha value of 1 to make it visible
            overlayBlendFade.drawRect(0, -this.highestPoint, this.width, this.highestPoint);

            overlayBlendFade.filters = [groundFade.filter()];
            overlayBlendFade.cacheAsBitmap = true;
            //overlayBlendFade.filters[0].blendMode = PIXI.BLEND_MODES.MULTIPLY; 
            app.renderer.render(overlayBlendFade);
            overlayBlendFade.filters = [];
            //overlayBlendFade.blendMode = PIXI.BLEND_MODES.MULTIPLY; 

            g.mask = overlayBlendFade;
            g.addChild(overlayBlendFade);*/


            return g;
        });
    }

    private currentTime = 0;
    logic(l: objectFunctions){
        super.logic(l);

        this.currentTime = this.filterGrass!.grassFragment.time;
        this.currentTime += 0.015;
        this.filterGrass?.updateCollisionPositions(l);
        

        
    };
    


    private YFL_edgeIndex = 0;
    private YFL_xFirst = 0;
    private YFL_yFirst = 0;
    private YFL_xLast = 0;
    private YFL_yLast = 0;
    private YFL_steps = 0;
    private YFL_stepSize = 0;
    private getYFromLine(xIndex: number){
        
        this.YFL_edgeIndex = Math.floor((xIndex/this.pointSpacing))*2;

        this.YFL_xFirst = this.edgesPoints[this.YFL_edgeIndex];
        this.YFL_yFirst = this.edgesPoints[this.YFL_edgeIndex+1];
        this.YFL_xLast = this.edgesPoints[this.YFL_edgeIndex+2];
        this.YFL_yLast = this.edgesPoints[this.YFL_edgeIndex+2+1];

        if(xIndex >= this.YFL_xFirst && xIndex <= this.YFL_xLast){
            if(this.YFL_yFirst == this.YFL_yLast){
                return this.YFL_yFirst;
            }else{
                this.YFL_steps = this.YFL_xLast - this.YFL_xFirst;
                this.YFL_stepSize = (this.YFL_yFirst-this.YFL_yLast)/this.YFL_steps;
                return this.YFL_yFirst + (this.YFL_stepSize*(this.YFL_xFirst-xIndex));
            }
        }
            

        if(xIndex < 0){
            return this.edgesPoints[1];
        }else if(xIndex > this.edgesPoints.length-1){
            return this.edgesPoints[this.edgesPoints.length-2];
        }

        return 32;
    }

    private CV_pointSpacing = 0;
    private CV_edgesPoints: number[] = [];
    private CV_pointY = 0;
    private CV_collisionVector: iVector = new nullVector();
    private CV_xFirst = 0;
    private CV_yFirst = 0;
    private CV_xLast = 0;
    private CV_yLast = 0;
    private CV_i = 0;
    private getCollisionVector(xIndex: number){
        this.CV_pointSpacing = this.width / (this.polygon.length-1);
        this.CV_edgesPoints = [];
        for(this.CV_i=0; this.CV_i<this.polygon.length; this.CV_i++){
            this.CV_pointY = this.polygon[this.CV_i];
            this.CV_edgesPoints.push((this.CV_i*this.CV_pointSpacing), -this.CV_pointY);
        }

        this.CV_collisionVector = new nullVector();
        for(this.CV_i=0; this.CV_i<this.CV_edgesPoints.length; this.CV_i+=2){
            this.CV_xFirst = this.CV_edgesPoints[this.CV_i];
            this.CV_yFirst = this.CV_edgesPoints[this.CV_i+1];

            this.CV_xLast = this.CV_edgesPoints[this.CV_i+2];
            this.CV_yLast = this.CV_edgesPoints[this.CV_i+2+1];
            if(xIndex >= this.CV_xFirst && xIndex <= this.CV_xLast){
                this.CV_collisionVector = this.createVectorFromPoints(this.CV_xFirst, this.CV_yFirst, this.CV_xLast, this.CV_yLast);
            }
        }

        if(xIndex < 0){
            this.CV_collisionVector = this.createVectorFromPoints(this.CV_edgesPoints[0], this.CV_edgesPoints[1], this.CV_edgesPoints[2], this.CV_edgesPoints[3]);
        }else if(xIndex > (this.CV_edgesPoints.length-1)*this.CV_pointSpacing){
            this.CV_collisionVector = this.createVectorFromPoints(this.CV_edgesPoints[(this.CV_edgesPoints.length-1)], this.CV_edgesPoints[(this.CV_edgesPoints.length-1)+1], 
            this.CV_edgesPoints[(this.CV_edgesPoints.length-1)+2], this.CV_edgesPoints[(this.CV_edgesPoints.length-1)+3]);
        }

        return this.CV_collisionVector;
    }


    private triSide1 = 0;
    private triSide2 = 0;
    private length = 0;
    private vectorAngle = 0;
    private dx = 0;
    private dy = 0;
    private createVectorFromPoints(x: number, y: number, x2: number, y2: number){
        this.triSide1 = Math.abs(x) - Math.abs(x2);
        this.triSide2 = Math.abs(y) - Math.abs(y2);
        this.length = Math.sqrt(Math.pow(this.triSide1, 2) + Math.pow(this.triSide2, 2));
        this.vectorAngle = Math.atan2(x - x2, y - y2);
        this.dx = Math.cos(this.vectorAngle) * this.length;
        this.dy = Math.sin(this.vectorAngle) * this.length;
        
        return new vector(this.dx, this.dy);
    }
    

    private CT_index = 0;
    private CT_spaceFromTop = 0;
    private CT_collisionTestY = 0;
    private CT_collisionLine: iVector = new nullVector();
    private CT_steepness = 0;
    public collisionTest(obj: iObject): [boolean, iVector]{

        this.CT_index =  (obj.g.x + obj.collisionBox.x + (obj.collisionBox.width/2)) - this.g.x;

        this.CT_spaceFromTop = this.getYFromLine(this.CT_index);
        //console.log("index: ",index, "  spaceFromTop: ",spaceFromTop);
        this.CT_collisionTestY = obj.g.y + obj.collisionBox.y + obj.collisionBox.height;
        //console.log("if ",collisionWithPosition," > ",(this.g.y - (spaceFromTop)));
        
        if(obj.force.Dy >= 0 && this.CT_collisionTestY > this.g.y + (this.CT_spaceFromTop)-5
            /*&& this.CT_collisionTestY < this.g.y + (this.CT_spaceFromTop)+obj.force.Dy+10*/){
            obj.g.y = this.g.y + (this.CT_spaceFromTop) - obj.collisionBox.y - obj.collisionBox.height-1;
            this.CT_collisionTestY = obj.g.y + obj.collisionBox.y + obj.collisionBox.height;

            this.CT_collisionLine = this.getCollisionVector(this.CT_index);
            //console.log("collisionLine: ",collisionLine.);
            
            //console.log("steepness: ",steepness);
            //console.log("collision angle: ",(360+90 + calculations.radiansToDegrees(collisionLine.delta))%360, "  dx: ",collisionLine.Dx);
            if(this.CT_collisionLine.Dx > 0){
                this.CT_steepness = 1-((this.CT_collisionLine.delta/(Math.PI/2))/-1);
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
                this.CT_collisionLine.Dx = -this.CT_collisionLine.Dx;
                this.CT_collisionLine.Dy = -this.CT_collisionLine.Dy;
                this.CT_collisionLine.magnitude = -obj.gravity.magnitude*this.CT_steepness;
                obj.force.Dy = 0;
                obj.force.Dx *= this.friction;
                if(obj.force.Dx > 0){
                    obj.force.Dx *= (1-(this.CT_steepness/3));
                }else if(obj.force.Dx < 0){
                    obj.force.Dx *= 1+(this.CT_steepness/3);
                }
                //obj.gravity = collisionLine;
                obj.verticalCollision = 1;

                return [true, this.CT_collisionLine];
                //obj.gravity.magnitude = 0; 
            }else if(this.CT_collisionLine.Dx < 0){
                this.CT_steepness = 1+((this.CT_collisionLine.delta/(Math.PI/2))/-1);
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
                this.CT_collisionLine.Dx = -this.CT_collisionLine.Dx;
                this.CT_collisionLine.Dy = -this.CT_collisionLine.Dy;
                this.CT_collisionLine.magnitude = obj.gravity.magnitude*this.CT_steepness;
                obj.force.Dy = 0;
                obj.force.Dx *= this.friction;
                if(obj.force.Dx < 0){
                    obj.force.Dx *= (1-(this.CT_steepness/3));
                }else if(obj.force.Dx > 0){
                    obj.force.Dx *= 1+(this.CT_steepness/3);
                }
                //obj.gravity = collisionLine;
                obj.verticalCollision = 1;
                
                return [true, this.CT_collisionLine];
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