

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


    static copy(copyTarget: boxCollider){
        return new boxCollider(copyTarget.x, copyTarget.y, copyTarget.width, copyTarget.height);
    }
    
    expandTop(value: number){
        this.y -= value;
        this.height += value;
    }

    expandBottom(value: number){
        this.height += value;
    }

    expandLeftSide(value: number){
        this.x -= value;
        this.width += value;
    }

    expandRightSide(value: number){
        this.width += value;
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