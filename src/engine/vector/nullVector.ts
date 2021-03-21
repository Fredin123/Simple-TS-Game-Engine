import { iVector } from "./iVector";

export class nullVector implements iVector{
    delta: number= -1;
    increaseMagnitude(addValue: number): void {
        throw new Error("Method not implemented.");
    }
    Dx: number = -1;
    Dy: number = -1;

    angle: number = -1;
    magnitude: number = -1;
    
    limitHorizontalMagnitude(limit: number){
        throw new Error("Method not implemented.");
    }

    limitVerticalMagnitude(limit: number){
        throw new Error("Method not implemented.");
    }
}