

export class barin{

    angleBetweenPoints(dy: number, dx: number){
        return Math.atan2(dy, dx)+Math.PI
    }

    distanceBetweenPoints(x1: number, y1: number, x2: number, y2: number){
        return Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2));
    }
}