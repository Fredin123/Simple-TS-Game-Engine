

export class brain{

    static angleBetweenPoints(dx: number, dy: number){
        return Math.atan2(dy, dx)+Math.PI;
    }

    static distanceBetweenPoints(x1: number, y1: number, x2: number, y2: number){
        return Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2));
    }
}