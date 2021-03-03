

export class graphics{
    private ctx: CanvasRenderingContext2D | null;

    constructor(renderContext: CanvasRenderingContext2D | null){
        this.ctx = renderContext;
    }

    drawCircle(x: number, y: number, radius: number){
        this.ctx?.beginPath();
        this.ctx?.arc(x, y, radius, 0, 2 * Math.PI);
        this.ctx?.stroke();
    }

}