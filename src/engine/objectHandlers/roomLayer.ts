import { objectBase } from "./objectBase";
import * as PIXI from 'pixi.js'
import { iObject } from "./iObject";


export class roomLayer{

    layerName: string;
    objects: Array<iObject> = [];
    graphicsContainer: PIXI.Container;
    zIndex: number;
    hidden: boolean = false;
    scrollSpeedX: number = 1;
    scrollSpeedY: number = 1;

    constructor(layerName: string, zIndex: number, container: PIXI.Container){
        this.layerName = layerName;
        this.zIndex = zIndex;
        this.graphicsContainer = container;
    }

}