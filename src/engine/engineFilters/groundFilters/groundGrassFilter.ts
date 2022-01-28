import * as PIXI from 'pixi.js'
import { iObject } from '../../objectHandlers/iObject';

export class groundGrassFilter{


    private grassGroundFragement = `
    varying vec2 vTextureCoord;
    uniform sampler2D uSampler;

    uniform float yPolPos[{yPolPosArrayLength}];

    uniform float groundHeight;
    uniform float fadeSize;

    float randFromVec(vec2 co){
        return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
    }



    void main(void)
    {
        vec4 groundDarkColor = vec4(0.020607, 0.0245, 0.1204117, 1.0);

        vec4 preColor = vec4(0.0, 0.0, 0.0, 0.0);
        float spacing = 1.0/float({yPolPosArrayLength}-1);
        for (int k = 0; k < {yPolPosArrayLength}; ++k){

            
            if(k+1 < {yPolPosArrayLength}){
                float heightDifference = yPolPos[k+1] - yPolPos[k];

                float relativePosition = (vTextureCoord.x - (float(k)*spacing))/spacing;

                float topYPos = (relativePosition*heightDifference);

                

                if((vTextureCoord.x) > (float(k)*spacing) 
                && (vTextureCoord.x) < (float(k)*spacing) + spacing){

                    if(vTextureCoord.y > yPolPos[k] + topYPos){
                        if(vTextureCoord.y < yPolPos[k] + topYPos + groundHeight*4.0){
                            float depth = (yPolPos[k] + topYPos + groundHeight) - (vTextureCoord.y);
                            depth = (depth)/(groundHeight);



                            if(randFromVec(vTextureCoord) < depth){
                                preColor = vec4(0.5529, 0.749, 0.2235, 1.0);
                            }else{
                                float depth = (yPolPos[k] + topYPos + groundHeight*4.0) - (vTextureCoord.y);
                                depth = (depth)/(groundHeight*4.0);

                                if(randFromVec(vTextureCoord) < depth){
                                    preColor = vec4(0.1294117647, 0.1294117647, 0.30196078431, 1.0);//vec4(0.07843, 0.07843, 0.180392, 1.0);
                                }else{
                                    float randomWhiteSpecks = randFromVec(vTextureCoord);
                                    if(randomWhiteSpecks > 0.0997 && randomWhiteSpecks < 0.1){
                                        preColor = vec4(1.0, 1.0, 1.0, 1.0);
                                    }else{
                                        preColor = groundDarkColor;
                                    }
                                }
                            }

                            
                        }else{
                            float randomWhiteSpecks = randFromVec(vTextureCoord);
                            if(randomWhiteSpecks > 0.0997 && randomWhiteSpecks < 0.1){
                                preColor = vec4(1.0, 1.0, 1.0, 1.0);
                            }else{
                                preColor = groundDarkColor;
                            }
                        }
                    }
                    
                    
                    
                }
            }
            
            
        }


        gl_FragColor = preColor;
        /*if(vTextureCoord.x < fadeSize){
            gl_FragColor = vec4((preColor.x), (preColor.y), (preColor.z), (vTextureCoord.x/fadeSize));
        }else{
            gl_FragColor = preColor;
        }*/
        
    }`;

    groundFragment = {
        yPolPos: [1, 2, 3, 4],
        groundHeight: 0.02,
        fadeSize: 0.01
    };

    private myFilter: PIXI.Filter;

    constructor(polygonPosGlslAdapted: number[], height:number, width: number, windowHeight: number){
        let fragGroundShader = this.grassGroundFragement.replace(/{yPolPosArrayLength}/g, ""+polygonPosGlslAdapted.length);
        
        //Moving grass
        this.groundFragment.yPolPos = polygonPosGlslAdapted;
        console.log("windowHeight: ",windowHeight);
        console.log("height: ",height);
        this.groundFragment.groundHeight = 0.05*(windowHeight/height);
        this.groundFragment.fadeSize = 98/width;

        
        this.myFilter = new PIXI.Filter(undefined, fragGroundShader, this.groundFragment);
        this.myFilter.autoFit = false;
    }

    public filter(): PIXI.Filter{
        return this.myFilter;
    }



}