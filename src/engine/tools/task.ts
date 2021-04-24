import { roomEvent } from "../roomEvent";

export class task{
    private tasksToDo: [number, (l: roomEvent)=>void][] = [];

    constructor(){

    }

    public addtasks(ticks: number, func: (l: roomEvent)=>void){
        this.tasksToDo.push([ticks, func]);
    }

    public tick(l: roomEvent){
        let i = this.tasksToDo.length;
        while(i--){
            let f = this.tasksToDo[i];
            if(f[0] <= 0){
                f[1](l);
                this.tasksToDo.splice(i, 1);
            }else{
                f[0] -= 1;
            }
        }

        
    }

}