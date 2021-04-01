export class animConfig{
    animationName: string = "";
    x: number = 0;
    y: number = 0;
    speed: number = 0.5;
    scaleX: number = 1;
    scaleY: number = 1;
    anchorX: number = 0.5;
    anchorY: number = 0.5;
    id: string = "";

    public constructor(init?:Partial<animConfig>) {
        Object.assign(this, init);
        if(this.id == ""){
            this.id = this.animationName;
        }
    }


}