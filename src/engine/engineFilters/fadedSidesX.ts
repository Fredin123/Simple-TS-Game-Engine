import * as PIXI from 'pixi.js'

export class fadedSidesX{


    private grassGroundFragement = `
    varying vec2 vTextureCoord;
    uniform sampler2D uSampler;

    uniform float fadeSize;




    void main(void)
    {
        vec4 pixel = texture2D(uSampler, vTextureCoord);

        if(vTextureCoord.x < fadeSize){
            gl_FragColor = vec4((vTextureCoord.x/fadeSize), (vTextureCoord.x/fadeSize), (vTextureCoord.x/fadeSize), 1.0);
        }else{
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        }
        
        
    }`;

    groundFragment = {
        fadeSize: 0.01,
    };

    private myFilter: PIXI.Filter;

    constructor(fadeWidthPixels: number, realSizeWidth: number){
        //Moving grass
        this.groundFragment.fadeSize = fadeWidthPixels/realSizeWidth;

        PIXI.Filter.defaultFragmentSrc
        this.myFilter = new PIXI.Filter(undefined, this.grassGroundFragement, this.groundFragment);
        this.myFilter.autoFit = false;
    }

    public filter(): PIXI.Filter{
        return this.myFilter;
    }



}