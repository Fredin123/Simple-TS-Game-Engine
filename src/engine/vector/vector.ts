import { calculations } from "../calculations";
import { iVector } from "./iVector";
import { nullVector } from "./nullVector";

export class vector implements iVector{
    static null: iVector = new nullVector;
    Dx: number;
    Dy: number;

    constructor(a: number, b: number){
        this.Dx = a;
        this.Dy = b;
    }

    get delta(){
        if(this.Dy == 0 && this.Dx != 0){
            if(this.Dx > 0)return 0;
            if(this.Dx < 0)return calculations.PI;
        }else if(this.Dx == 0 && this.Dy != 0){
            if(this.Dy > 0)return calculations.PI/2;
            if(this.Dy < 0)return calculations.PI + (calculations.PI/2);
        }
        return Math.atan(this.Dy/this.Dx);
    }

    get magnitude(){
        return Math.sqrt(Math.pow(this.Dx, 2) + Math.pow(this.Dy, 2));
    }

    increaseMagnitude(addValue: number){
        let mag = this.magnitude;
        this.Dx = this.Dx * (mag+addValue) / mag;
        this.Dy = this.Dy * (mag+addValue) / mag;
    }


    limitHorizontalMagnitude(limit: number){
        if(Math.abs(this.Dx) > limit){
            if(this.Dx > 0){
                this.Dx = limit;
            }else{
                this.Dx = -limit;
            }
        }
    }

    limitVerticalMagnitude(limit: number){
        if(Math.abs(this.Dy) > limit){
            if(this.Dy > 0){
                this.Dy = limit;
            }else{
                this.Dy = -limit;
            }
        }
    }
    

}