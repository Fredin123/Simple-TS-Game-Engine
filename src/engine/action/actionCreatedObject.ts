import { iObject } from "../objectHandlers/iObject";

export class actionCreatedObject{
    public life: number = 0;
    private _obj: iObject;
    private _offsetX: number;
    private _offsetY: number;

    constructor(life: number, obj: iObject, offsetX: number, offsetY: number){
        this.life = life;
        this._obj = obj;
        this._offsetX = offsetX;
        this._offsetY = offsetY;
    }

    public obj(){
        return this._obj;
    }

    public offsetX(){
        return this._offsetX;
    }

    public offsetY(){
        return this._offsetY;
    }
}