//FROM https://codepen.io/mishaa/pen/raKzrm

import { threadId } from "node:worker_threads";
import { Filter } from "pixi.js";

export class glowFilter extends Filter{
    quality: number;
    distance: number;
    _uniforms: any;

    passes: any;
    fragmentSrc: string[];

    

    constructor(textureWidth: number, textureHeight: number, distance:number, outerStrength:number, innerStrength:number, color: string, quality:number){
        var quality = Math.pow(quality, 1/3);
        var distance = distance*quality;

        var unitmp = {
            distance: {type: '1f', value: distance},
            outerStrength: {type: '1f', value: outerStrength},
            innerStrength: {type: '1f', value: innerStrength},
            glowColor: {type: '4f', value: {}},
            pixelWidth: {type: '1f', value: 1 / textureWidth},
            pixelHeight: {type: '1f', value: 1 / textureHeight},
        };

        var colorValue = parseInt(color.substr(1), 16);
        var r = ((colorValue & 0xFF0000) >> 16) / 255,
        g = ((colorValue & 0x00FF00) >> 8) / 255,
        b = (colorValue & 0x0000FF) / 255;
        unitmp.glowColor.value = {x: r, y: g, z: b, w: 1};

        var fragmentSrc = [
            'precision mediump float;',
            'varying vec2 vTextureCoord;',
            'uniform sampler2D texture;',
            'uniform float distance;',
            'uniform float outerStrength;',
            'uniform float innerStrength;',
            'uniform vec4 glowColor;',
            'uniform float pixelWidth;',
            'uniform float pixelHeight;',
            'vec2 px = vec2(pixelWidth, pixelHeight);',
            'void main(void) {',
            '    const float PI = 3.14159265358979323846264;',
            '    vec4 ownColor = texture2D(texture, vTextureCoord);',
            '    vec4 curColor;',
            '    float totalAlpha = 0.;',
            '    float maxTotalAlpha = 0.;',
            '    float cosAngle;',
            '    float sinAngle;',
            '    for (float angle = 0.; angle <= PI * 2.; angle += ' + (1 / quality / distance).toFixed(7) + ') {',
            '       cosAngle = cos(angle);',
            '       sinAngle = sin(angle);',
            '       for (float curDistance = 1.; curDistance <= ' + distance.toFixed(7) + '; curDistance++) {',
            '           curColor = texture2D(texture, vec2(vTextureCoord.x + cosAngle * curDistance * px.x, vTextureCoord.y + sinAngle * curDistance * px.y));',
            '           totalAlpha += (distance - curDistance) * curColor.a;',
            '           maxTotalAlpha += (distance - curDistance);',
            '       }',
            '    }',
            '    maxTotalAlpha = max(maxTotalAlpha, 0.0001);',
    
            '    ownColor.a = max(ownColor.a, 0.0001);',
            '    ownColor.rgb = ownColor.rgb / ownColor.a;',
            '    float outerGlowAlpha = (totalAlpha / maxTotalAlpha)  * outerStrength * (1. - ownColor.a);',
            '    float innerGlowAlpha = ((maxTotalAlpha - totalAlpha) / maxTotalAlpha) * innerStrength * ownColor.a;',
            '    float resultAlpha = (ownColor.a + outerGlowAlpha);',
            '    gl_FragColor = vec4(mix(mix(ownColor.rgb, glowColor.rgb, innerGlowAlpha / ownColor.a), glowColor.rgb, outerGlowAlpha / resultAlpha) * resultAlpha, resultAlpha);',
            '}'
        ];

        super(undefined, fragmentSrc.join('\n'), unitmp);
        this.quality = quality;
        this._uniforms = unitmp;
        this.fragmentSrc = fragmentSrc;
        this.distance = distance;
    }
    

    
    set textureWidth(value: number){
        this.uniforms.pixelWidth.value = 1 / value;
        //this.dirty = true;
    }

    set textureHeight(value: number){
        this.uniforms.pixelHeight.value = 1 / value;
    }
    



    
}