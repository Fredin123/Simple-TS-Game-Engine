import { objectBase } from "./objectHandlers/objectBase";



export class Room{
    internalList:Array<objectBase>;
    constructor(objectList:Array<objectBase>){
        this.internalList = objectList;
    }

    getObjects(){
        return this.internalList;
    }

}