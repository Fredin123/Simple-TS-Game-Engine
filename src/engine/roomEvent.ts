import { brain } from "./brain";
import { gameCamera } from "./gameCamera";
import { internalFunction } from "./internalFunctions";
import { boxCollider } from "./objectHandlers/collision/boxCollider";
import { iObject } from "./objectHandlers/iObject";
import { objectBase } from "./objectHandlers/objectBase";
import { objectContainer } from "./objectHandlers/objectContainer";
import { interaction } from "./text interaction/interaction";
import { task } from "./tools/task";

//declare var Howl: any;


export class roomEvent {
    private mouseXPosition:number = 0;
    private mouseYPosition:number = 0;
    container: HTMLElement;
    private keysDown: Record<string, boolean> = {};
    objContainer: objectContainer;
     

    private gameKeysPressed: Record<string, boolean> = {};
    private gameKeysReleased: Record<string, boolean> = {};
    private gameKeysHeld: Record<string, boolean> = {};

    private static ticks: number = 0;
    deltaTime: number = 1;

    public camera: gameCamera = new gameCamera();
    public tasker: task;

    interaction: interaction = new interaction();



    constructor(con: HTMLElement, objContainer: objectContainer, tasker: task){
        this.objContainer = objContainer;
        this.container = con;
        this.tasker = tasker;
        this.keysDown = {};

        this.container.addEventListener("mousemove", this.mouseMoveListener.bind(this));
        document.addEventListener("keydown", this.keyDownListener.bind(this), false);
        document.addEventListener("keyup", this.keyUpListener.bind(this), false);


    }

    static tick(){
        if(roomEvent.ticks >= Number.MAX_VALUE){
            roomEvent.ticks = 0;
        }
        roomEvent.ticks++;
    }

    static getTicks(){
        return this.ticks;
    }

    queryKey(){
        //Reset pressed keys
        for(let key in this.gameKeysPressed){
            if(this.gameKeysPressed.hasOwnProperty(key)){
                this.gameKeysPressed[key] = false;
            }
        }

        for(let key in this.gameKeysReleased){
            if(this.gameKeysReleased.hasOwnProperty(key)){
                this.gameKeysReleased[key] = false;
            }
        }

        for(let key in this.keysDown){
            if(this.keysDown.hasOwnProperty(key)){
                if(this.keysDown[key] && (this.gameKeysPressed[key] == undefined || this.gameKeysPressed[key] == false) && (this.gameKeysHeld[key] == undefined || this.gameKeysHeld[key] == false)){
                    this.gameKeysPressed[key] = true;
                    this.gameKeysHeld[key] = true;
                }else
                if(this.keysDown[key] == false && this.gameKeysHeld[key] == true){
                    this.gameKeysPressed[key] = false;
                    this.gameKeysHeld[key] = false;
                    this.gameKeysReleased[key] = true;
                }
            }
        }
    }

    mouseMoveListener(e: MouseEvent){
        var x = e.clientX; //x position within the element.
        var y = e.clientY;  //y position within the element.

        if(e.target instanceof Element){
            var rect = e.target.getBoundingClientRect();
            x -= rect.left;
            y -= rect.top;
        }

        this.mouseXPosition = x;
        this.mouseYPosition = y;
    }

    keyDownListener(e: KeyboardEvent){
        this.keysDown[e.key] = true; 
    }

    keyUpListener(e: KeyboardEvent){
        this.keysDown[e.key] = false;
    }

    resetKeyPressedStates(){
        this.keysDown = {};
    }


    //Get keys--------------------
    checkKeyPressed(keyCheck: string){
        return this.gameKeysPressed[keyCheck];
    }

    checkKeyReleased(keyCheck: string){
        return this.gameKeysReleased[keyCheck];
    }

    checkKeyHeld(keyCheck: string){
        return this.gameKeysHeld[keyCheck];
    }

    mouseX(){
        return this.mouseXPosition;
    }

    mouseY(){
        return this.mouseYPosition;
    }


    foreachObjectTypeBoolean(type: string, func: (arg0: iObject)=>boolean): boolean{
        var specificObjects = this.objContainer.getSpecificObjects(type);
        specificObjects.forEach(element => {
            if(element.objectName == type){
                if(func(element)){
                    return true;
                }
            }
        });
        return false;
    }


    foreachObjectType(type: string, func: (arg0: objectBase)=>boolean): Array<iObject>{
        var returnResult: Array<iObject> = new Array<objectBase>();
        var specificObjects = this.objContainer.getSpecificObjects(type);
        if(specificObjects != null){
            specificObjects.forEach(element => {
                if(element.objectName == type){
                    if(func(element)){
                        returnResult.push(element);
                    }
                }
            });
        }
        return returnResult;
    }


    isCollidingWith(colSource: objectBase, colSourceCollisionBox: boxCollider, colTargetType: string[]): iObject | null{
        let colliding:iObject | null = null;
        this.objContainer.foreachObjectType(colTargetType, (obj: iObject) => {
            if(internalFunction.intersecting(colSource, colSourceCollisionBox, obj)){
                colliding = obj;
                return true;
            }
            return false;
        });
        return colliding;
    }


    isCollidingWithMultiple(colSource: objectBase, colSourceCollisionBox: boxCollider, colTargetType: string[]): iObject[]{
        let colliding:iObject[] = [];
        this.objContainer.foreachObjectType(colTargetType, (obj: iObject) => {
            if(internalFunction.intersecting(colSource, colSourceCollisionBox, obj)){
                colliding.push(obj);
            }
            return false;
        });
        return colliding;
    }
    







} 