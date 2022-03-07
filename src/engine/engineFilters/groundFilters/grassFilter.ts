import * as PIXI from 'pixi.js'
import { calculations } from '../../calculations';
import { iObject } from '../../objectHandlers/iObject';
import { nulliObject } from '../../objectHandlers/nulliObject';
import { objectFunctions } from '../../objectHandlers/objectFunctions';
import { roomEvent } from '../../roomEvent/roomEvent';

export class grassFilter{
    public static primaryCollider: iObject = new nulliObject(0, 0);

    
    
    private grassShader = `
    precision lowp float;
    varying vec2 vTextureCoord;
    uniform sampler2D uSampler;

    uniform float yPolPos[{yPolPosArrayLength}];

    uniform float time;
    uniform float windWidth;
    uniform float aspectRatio;
    uniform float cameraPosition;
    uniform float cameraSize;
    uniform float grassWidth;
    uniform float curveStrength;
    uniform float extraCurveStrength;
    uniform float fadeSize;
    uniform float MINGRASSHEIGHT;    

    uniform float grassMaxHeight;

    uniform vec2 collisionPoints[2];

    const int grassPerLine = {grassPerLine};
    const float SPACING = {spacing};
    const float SPACEBETWEENEACHBLADE = {SPACEBETWEENEACHBLADE};

    float randFromVec(vec2 co){
        return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
    }

    float distSquared(vec2 A, vec2 B){
        vec2 C = (A - B) * vec2(aspectRatio, 1.0);
        return dot( C, C );
    }

    vec4 generateGrass(float polygonYPos, int lineIndex, float lineStart, float topYPos, float heightDifference){
        if(abs(heightDifference) > 0.04){
            return vec4(0.0, 0.0, 0.0, 0.0);
        }
        for(int b=0; b<grassPerLine; b++){
            float grassBladeX = lineStart+(float(b)*SPACEBETWEENEACHBLADE);
            if(vTextureCoord.x > grassBladeX-grassMaxHeight && vTextureCoord.x < grassBladeX+grassMaxHeight){
                float grassBladeRandomVal = randFromVec(vec2(lineIndex, b));
                float randomBladePosition = grassBladeRandomVal * SPACEBETWEENEACHBLADE;
                grassBladeX += randomBladePosition;

                float relativePosition = (grassBladeX - (float(lineIndex)*SPACING))/SPACING;
                float grassBladeY = polygonYPos + (relativePosition*heightDifference);
                
                float collisionForce = 0.0;
                for(int i=0; i<2; i++){
                    
                    float distanceFromGrassBladeToCollider = abs(grassBladeX - collisionPoints[i].x);
                    
                    //Alternative WIP formula for collision(go to desmos.com): 1-(cos(log((x+0.008)^3)*1)*0.5)-0.5
                    if(distanceFromGrassBladeToCollider < grassMaxHeight/3.5){
                        float distancePercentage = (distanceFromGrassBladeToCollider/(grassMaxHeight/3.5));
                        float distanceToCollider = grassBladeX - collisionPoints[i].x;

                        float distanceToColliderY = abs(grassBladeY - collisionPoints[i].y);
                        float distanceToColliderYPercentage = 0.0;
                        if(distanceToColliderY < 0.02){
                            distanceToColliderYPercentage =  1.0-(distanceToColliderY / (0.02));
                        }

                        if(distanceToCollider < 0.0){
                            collisionForce = -2.0*(1.0-(cos(distancePercentage*6.3)*0.5)-0.5);
                        }else{
                            collisionForce = 1.0*(1.0-(cos(distancePercentage*6.3)*0.5)-0.5);
                        }
                        collisionForce = collisionForce * distanceToColliderYPercentage * (1.0+abs(heightDifference)*75.0);
                        break;
                    }
                }
                
                
                float grassBladeHeight = grassMaxHeight * grassBladeRandomVal;
                if(grassBladeHeight < MINGRASSHEIGHT){
                    grassBladeHeight += 0.01;
                }
                float grassHeightStrengthModify = grassBladeHeight/grassMaxHeight;
                float grassTop = polygonYPos - grassBladeHeight + topYPos;
    
                
                float yPosOfGras = ((vTextureCoord.y - grassTop)/(grassBladeHeight));
                
                //Apply wind effect
                //Wave from top to right
                float windStrength = collisionForce + pow(cos(time), 2.0);
                float steepSlopeSwayLimit = 1.0;
                if(heightDifference > 0.01){
                    steepSlopeSwayLimit = 0.3;
                }
                float offsetCurve = (1.0-yPosOfGras) * curveStrength * (0.9+windStrength);


                
                vec2 grassBladePoint = vec2(grassBladeX, grassBladeY);
                    
                float distanceToBladeStartSquared = distSquared(grassBladePoint, vec2(vTextureCoord.x, vTextureCoord.y));
                float extraCurve = (distanceToBladeStartSquared/(grassBladeHeight*grassBladeHeight)) * extraCurveStrength * windStrength *  grassHeightStrengthModify * steepSlopeSwayLimit;
                

                
                
                float bladePosition = lineStart+(float(b)*SPACEBETWEENEACHBLADE) + randomBladePosition;

                float grassBladeLeftSideStart = bladePosition + offsetCurve + extraCurve;
                float grassBladeRightSideStart = bladePosition + offsetCurve + extraCurve;

                float alpha = 0.0;
                
                if((vTextureCoord.x) > grassBladeLeftSideStart - grassWidth
                && (vTextureCoord.x) < grassBladeRightSideStart + grassWidth
                && distanceToBladeStartSquared < (grassBladeHeight*grassBladeHeight)){
                    alpha = 1.0;
                }


                if(alpha != 0.0){
                    if(grassBladeRandomVal < 0.2){
                        return vec4(0.12, 0.42, 0.01568627, alpha);
                    }else if(grassBladeRandomVal < 0.4){
                        return vec4(0.4196, 0.6078, 0.1176, alpha);
                    }else if(grassBladeRandomVal < 0.6){
                        return vec4(0.5529, 0.749, 0.2235, alpha);
                    }else if(grassBladeRandomVal < 0.8){
                        return vec4(0.448, 0.5509, 0.2019, alpha);
                    }else if(grassBladeRandomVal <= 1.0){
                        return vec4(0.425, 0.6509, 0.1019, alpha);
                    }
                }

                /*if(distanceToBladeStartSquared < 0.000001){
                    return vec4(0.0, 0.0, 1.0, 1.0);
                }*/
                
            }
            
            
        }

        return vec4(0.0, 0.0, 0.0, 0.0);
    }

    void main(void)
    {
        /*float distToPlayer = distSquared(vTextureCoord, collisionPoints[0]);
        if(distToPlayer < 0.0001){
            gl_FragColor = vec4(0.12, 0.42, 1.0, 1.0);
        }

        float distToPlayer2 = distSquared(vTextureCoord, collisionPoints[1]);
        if(distToPlayer2 < 0.0001){
            gl_FragColor = vec4(0.12, 0.42, 1.0, 1.0);
        }

        float distToPlayer3 = distSquared(vTextureCoord, collisionPoints[2]);
        if(distToPlayer3 < 0.0001){
            gl_FragColor = vec4(0.12, 0.42, 1.0, 1.0);
        }*/

        float distanceToCamera = abs(vTextureCoord.x - cameraPosition);
        if(distanceToCamera < cameraSize){
            for (int lineIndex = 0; lineIndex < {yPolPosArrayLength}-1; ++lineIndex){

            
                float heightDifference = yPolPos[lineIndex+1] - yPolPos[lineIndex];
    
                float relativePosition = (vTextureCoord.x - (float(lineIndex)*SPACING))/SPACING;
    
                float topYPos = (relativePosition*heightDifference);
    
                float grassTop = yPolPos[lineIndex] - grassMaxHeight - abs(heightDifference);
                float groundY = yPolPos[lineIndex] + topYPos;
                if(vTextureCoord.y > grassTop
                && vTextureCoord.y < groundY){

                    float lineStart = float(lineIndex)*SPACING;
                    
                    if(vTextureCoord.x > lineStart - SPACING && vTextureCoord.x < lineStart+SPACING*2.0){
                        vec4 grassResult = generateGrass(yPolPos[lineIndex], lineIndex, lineStart, topYPos, heightDifference);

                    
                        if(grassResult != vec4(0.0, 0.0, 0.0, 0.0)){
                            if(vTextureCoord.x < fadeSize){
                                grassResult = vec4((grassResult.x), (grassResult.y), (grassResult.z), vTextureCoord.x/fadeSize);
                            }
                            gl_FragColor = grassResult;
                        }else{
                            //gl_FragColor = vec4(0.0, 0.0, 1.0, 0.5);
                        }
                    }
                    
                }

            }
        }
        

        
        
    }`;

    

    
    grassFragment = {yPolPos: [1, 2, 3, 4], time: 1.0, windWidth: 0.4, 
        MINGRASSHEIGHT: 0.005,
        aspectRatio: 4.0, cameraPosition: 0.0, cameraSize: 0.06,
        grassMaxHeight: 0.02,
        grassWidth: 0.00015,
        curveStrength: 0.00008,
        extraCurveStrength: 0.0015,
        fadeSize: 0.01,
        collisionPoints: [
            -2, -2,
            -2, -2
        ]
    };

    private myFilter: PIXI.Filter;
    private filterAreaX = 0;
    private filterAreaY = 0;
    private filterAreaWidth = 0;
    private filterAreaHeight = 0;

    private mainCharacterFollow: [number, number] = [0, 0];
    private mainCharacterFollow2: [number, number] = [0, 0];

    private polygonPosGlslAdapted;

    private myLayerIndex: number = -1;

    constructor(polygonPosGlslAdapted: number[], spacingConst: number, 
        grassPerLine: number, minGrassHeight: number, aspectRatio: number,
        filterAreaWidth: number, filterAreaHeight: number,
        filterAreaX: number, filterAreaY: number,
        height:number, windowHeight: number,
        width:number, windowWidth: number,
        myLayerIndex: number){
        this.polygonPosGlslAdapted = polygonPosGlslAdapted;
        this.filterAreaWidth = filterAreaWidth;
        this.filterAreaHeight = filterAreaHeight;
        this.filterAreaX = filterAreaX;
        this.filterAreaY = filterAreaY;
        this.myLayerIndex = myLayerIndex;

        let lineWidth = (width/polygonPosGlslAdapted.length)*0.1;
        console.log("lineWidth: ",lineWidth);

        grassPerLine = Math.round(grassPerLine/lineWidth);///Math.round(grassPerLine*(1-(windowWidth/width)));
        if(grassPerLine <= 0) grassPerLine = 1;
        console.log("grassPerLine: ",grassPerLine);
        let movingGrassFragShaderParamsFixed = this.grassShader.replace(/{yPolPosArrayLength}/g, ""+polygonPosGlslAdapted.length);
        movingGrassFragShaderParamsFixed = movingGrassFragShaderParamsFixed.replace(/{spacing}/g, spacingConst+"");
        movingGrassFragShaderParamsFixed = movingGrassFragShaderParamsFixed.replace(/{grassPerLine}/g, grassPerLine+"");
        movingGrassFragShaderParamsFixed = movingGrassFragShaderParamsFixed.replace(/{SPACEBETWEENEACHBLADE}/g, ""+(spacingConst/grassPerLine));
        
    
        //Moving grass
        this.grassFragment.MINGRASSHEIGHT = minGrassHeight*(windowHeight/height);
        this.grassFragment.yPolPos = polygonPosGlslAdapted;
        this.grassFragment.time = 0.0;
        this.grassFragment.aspectRatio = aspectRatio;
        this.grassFragment.cameraSize = 0.24*(windowHeight/height);//0.078;//0.08;
        this.grassFragment.grassMaxHeight = 0.064*(windowHeight/height)//0.0225;
        this.grassFragment.grassWidth = 0.0015  * (windowWidth/width);
        this.grassFragment.curveStrength = 0.0085 * (windowWidth/width);
        this.grassFragment.extraCurveStrength = 0.0105 * (windowWidth/width);
        this.grassFragment.fadeSize = 98/width;
        /*console.log("movingGrassFragShaderParamsFixed: ",movingGrassFragShaderParamsFixed);
        console.log("grassFragment: ", this.grassFragment);*/
        
        this.myFilter = new PIXI.Filter(undefined, movingGrassFragShaderParamsFixed, this.grassFragment);
        //this.myFilter.resolution = 0.5;
        this.myFilter.autoFit = false;
    }

    public filter(): PIXI.Filter{
        return this.myFilter;
    }

    public updateCollisionPositions(l: objectFunctions){
        let currentTime = this.grassFragment.time;
        currentTime += 0.015;

        let pInShader = (l.getCameraX() - this.filterAreaX)/this.filterAreaWidth;
            
        this.grassFragment.cameraPosition = pInShader;

        this.grassFragment.time = currentTime;
        let primaryColliderX = grassFilter.primaryCollider.g.x + grassFilter.primaryCollider.collisionBox.x + (grassFilter.primaryCollider.collisionBox.width/2);
        let primaryColliderY = grassFilter.primaryCollider.g.y + grassFilter.primaryCollider.collisionBox.y + (grassFilter.primaryCollider.collisionBox.height);

        

        this.grassFragment.collisionPoints[0] = (primaryColliderX - this.filterAreaX)/this.filterAreaWidth;
        this.grassFragment.collisionPoints[1] = 1.0-(((this.filterAreaY-primaryColliderY)/this.filterAreaHeight));

        //delayed follow
        if(grassFilter.primaryCollider.layerIndex > this.myLayerIndex){
            if(this.mainCharacterFollow[0] == 0 && this.mainCharacterFollow[1] == 0){
                this.mainCharacterFollow[0] = grassFilter.primaryCollider.g.x;
                this.mainCharacterFollow[1] = grassFilter.primaryCollider.g.y;
            }else{
                let distanceToTarget = calculations.distanceBetweenPoints(this.mainCharacterFollow[0], this.mainCharacterFollow[1], grassFilter.primaryCollider.g.x, grassFilter.primaryCollider.g.y);
                let angleToTarget = calculations.angleBetweenPoints(this.mainCharacterFollow[0] - grassFilter.primaryCollider.g.x, this.mainCharacterFollow[1] - grassFilter.primaryCollider.g.y);
                this.mainCharacterFollow[0] += Math.cos(angleToTarget) *  (distanceToTarget*0.148);
                this.mainCharacterFollow[1] += Math.sin(angleToTarget) *  (distanceToTarget*0.148);
            }
            let primaryColliderXDelayed = this.mainCharacterFollow[0] + grassFilter.primaryCollider.collisionBox.x + (grassFilter.primaryCollider.collisionBox.width/2);
            let primaryColliderYDelayed = this.mainCharacterFollow[1] + grassFilter.primaryCollider.collisionBox.y + (grassFilter.primaryCollider.collisionBox.height);
    
            this.grassFragment.collisionPoints[2] = (primaryColliderXDelayed - this.filterAreaX)/this.filterAreaWidth;
            this.grassFragment.collisionPoints[3] = 1.0-(((this.filterAreaY-primaryColliderYDelayed)/this.filterAreaHeight));
        }else{
            this.mainCharacterFollow[0] = 0;
            this.mainCharacterFollow[1] = 0;

            this.myFilter.enabled = false;
        }
        


        //delayed follow 2
        /*if(this.mainCharacterFollow2[0] == 0 && this.mainCharacterFollow2[1] == 0){
            this.mainCharacterFollow2[0] = grassFilter.primaryCollider.g.x;
            this.mainCharacterFollow2[1] = grassFilter.primaryCollider.g.y;
        }else{
            let distanceToTarget = calculations.distanceBetweenPoints(this.mainCharacterFollow2[0], this.mainCharacterFollow2[1], grassFilter.primaryCollider.g.x, grassFilter.primaryCollider.g.y);
            let angleToTarget = calculations.angleBetweenPoints(this.mainCharacterFollow2[0] - grassFilter.primaryCollider.g.x, this.mainCharacterFollow2[1] - grassFilter.primaryCollider.g.y);
            this.mainCharacterFollow2[0] += Math.cos(angleToTarget) *  (distanceToTarget*0.085);
            this.mainCharacterFollow2[1] += Math.sin(angleToTarget) *  (distanceToTarget*0.085);
        }
        let primaryColliderXDelayed2 = this.mainCharacterFollow2[0] + grassFilter.primaryCollider.collisionBox.x + (grassFilter.primaryCollider.collisionBox.width/2);
        let primaryColliderYDelayed2 = this.mainCharacterFollow2[1] + grassFilter.primaryCollider.collisionBox.y + (grassFilter.primaryCollider.collisionBox.height);

        this.grassFragment.collisionPoints[4] = (primaryColliderXDelayed2 - this.filterAreaX)/this.filterAreaWidth;
        this.grassFragment.collisionPoints[5] = 1.0-(((this.filterAreaY-primaryColliderYDelayed2)/this.filterAreaHeight));*/
        
    }
    
}