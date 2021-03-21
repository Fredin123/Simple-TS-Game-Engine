import { calculations } from "../calculations";
import { iVector } from "./iVector";

export class vectorFixedDelta implements iVector{
    delta: number;
    Dx: number;
    Dy: number;

    constructor(delta: number, inputMagnitude: number){
        this.delta = delta;

        this.Dx = Math.cos(this.delta) * inputMagnitude;
        this.Dy = Math.sin(this.delta) * inputMagnitude;
    }
    limitHorizontalMagnitude(limit: number): void {
        throw new Error("Method not implemented.");
    }
    limitVerticalMagnitude(limit: number): void {
        throw new Error("Method not implemented.");
    }

    get magnitude(){
        return Math.sqrt(Math.pow(this.Dx, 2) + Math.pow(this.Dy, 2));
    }

    increaseMagnitude(addValue: number){
        //this.Dx = this.Dx * (this.magnitude+addValue) / this.magnitude;
        //this.Dy = this.Dy * (this.magnitude+addValue) / this.magnitude;
        let newXAdd = Math.cos(this.delta) * addValue;
        let newYAdd = calculations.flippedSin(this.delta) * addValue;

        if(Math.abs(newXAdd) > 0.00000000000001){
            this.Dx += newXAdd;
        }

        if(Math.abs(newYAdd) > 0.00000000000001){
            this.Dy += newYAdd;
        }
        
        
    }

}