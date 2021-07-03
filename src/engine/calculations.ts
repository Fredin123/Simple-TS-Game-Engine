

export class calculations{
    static readonly PI: number = 3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679;
    static readonly EPSILON : number = 8.8541878128;

    static degreesToRadians(degrees: number){
        return degrees*(calculations.PI/180);
    }

    static radiansToDegrees(radians: number){
        return radians*(180/calculations.PI)
    }


    static roundToNDecimals(value: number, nDecimal: number){
        return Math.round((value) * Math.pow(10, nDecimal)) / Math.pow(10, nDecimal);
    }

    static getShortestDeltaBetweenTwoRadians(rad1: number, rad2: number){
        rad1 *= 180/calculations.PI;
        rad2 *= 180/calculations.PI;
        let raw_diff: number = rad1 > rad2 ? rad1 - rad2 : rad2 - rad1;
        let mod_diff = raw_diff % 360;
        let dist = mod_diff > 180.0 ? 360.0 - mod_diff : mod_diff;

        return dist;
    }

    static flippedSin(delta: number){
        return Math.sin(delta + calculations.PI/*We need to flip sin since our coordinate system Y goes from 0 to positive numbers when you do down*/);
    }

    static getRandomInt(min: number, max: number) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

}