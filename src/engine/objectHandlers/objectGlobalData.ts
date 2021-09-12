import { iObject } from "./iObject";
import { nulliObject } from "./nulliObject";



export class objectGlobalData{
    static null: iObject = new nulliObject(0, 0);
    static objectsThatCollideWith: {[key: string]: Array<string>} = {};
    static objectsThatMoveWith: {[key: string]: Array<string>} = {};
}