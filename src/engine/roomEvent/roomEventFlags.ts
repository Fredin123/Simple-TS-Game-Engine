export class roomEventFlags{
    private flags: string[] = [];

    constructor(){

    }

    add(flag: string){
        if(this.flags.indexOf(flag) == -1){
            this.flags.push(flag);
        }
    }

    remove(flag: string){
        if(this.flags.indexOf(flag) != -1){
            this.flags.splice(this.flags.indexOf(flag), 1);
        }
    }

    has(flag: string){
        if(this.flags.indexOf(flag) != -1){
            return false;
        }
        return true;
    }

}