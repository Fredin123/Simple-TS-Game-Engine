import { iVector } from "./iVector";

export class nullVector implements iVector{
    static null: iVector = new nullVector;
    delta: number = 0;
    increaseMagnitude(addValue: number): void {
        
    }
    Dx: number = 0;
    Dy: number = 0;

    angle: number = 0;
    magnitude: number = 0;
    
    limitHorizontalMagnitude(limit: number){
        
    }

    limitVerticalMagnitude(limit: number){
        
    }
}