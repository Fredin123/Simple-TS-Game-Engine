export class ticker{
    private static ticks: number = 0;

    static tick(){
        if(this.ticks >= Number.MAX_VALUE){
            this.ticks = 0;
        }
        this.ticks++;
    }

    static getTicks(){
        return this.ticks;
    }
}