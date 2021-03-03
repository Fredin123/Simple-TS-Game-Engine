

export class boxCollider{

    x: number;
    y: number;
    width: number;
    height: number;

    constructor(xPos: number,
        yPos: number,
        width: number,
        height: number){
            this.x = xPos;
            this.y = yPos;
            this.width = width;
            this.height = height;
    }

    
    shrink(amountX: number, amountY: number){
        this.x += amountX;
        this.y += amountY;
        this.width -= 2*amountX;
        this.height -= 2*amountY;
    }


    expand(aamountX: number, amountY: number){
        this.x -= aamountX;
        this.y -= amountY;
        this.width += 2*aamountX;
        this.height += 2*amountY;
    }

}