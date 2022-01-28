import { cursorData } from "../cursor/cursorData";
import { cursorType } from "../cursor/cursorType";
import { canvasRenderer } from "./canvasRenderer";
import { objectGenerator } from "../../../shared/objectGenerator";
import { userObject } from "../roomObjects/userObject";
import { geometryObject } from "../roomObjects/geometryObject";
import { objectTypes } from "../../../shared/objectTypes";
import { IObjectMeta } from "../../../shared/IObjectMeta";
declare var LZString: any;
declare var window : any;

export class handleCanvas{
    private mouseXPosition:number = 0;
    private mouseYPosition:number = 0;
    previousMouseX: number = -1;
    previousMouseY: number = -1;
    noGridMouse: boolean = false;
    layerCreateButton: HTMLButtonElement;
    layerDeleteButton: HTMLButtonElement;
    mouseDown: boolean = false;
    private cursor: cursorData;
    private resetCtrlGridKey: ReturnType<typeof setTimeout> | undefined;
    private canvasRenderPart: canvasRenderer;
    private genObj = new objectGenerator();
    private currentRoomName: string = "";

    private prevClickedGeometry: IObjectMeta[] = [];

    private moveToggleDown = false;

    constructor(canvasName:string, cursor: cursorData){
        this.cursor = cursor;

        this.canvasRenderPart = new canvasRenderer(canvasName);

        this.layerCreateButton = document.getElementById("createLayerButton") as HTMLButtonElement;
        this.layerCreateButton.addEventListener("mouseup", this.createLayer.bind(this));
        this.layerDeleteButton = document.getElementById("removeLayerButton") as HTMLButtonElement;
        this.layerDeleteButton.addEventListener("mouseup", this.deleteLayer.bind(this));



        document.addEventListener("mousemove", this.mouseListenerMove.bind(this));
        document.addEventListener("mousedown", this.mouseListenerDown.bind(this));
        document.addEventListener("mouseup", this.mouseListenerUp.bind(this));
        document.addEventListener("keypress", this.keysDown.bind(this));
        document.addEventListener("keyup", this.keysUp.bind(this));
        

        document.getElementById("pointer")?.addEventListener("mouseup", this.clickPointer.bind(this));
    }

    createLayer() {
        window.node.prompt("Create a new layer", "Type in the name of the new layer", (text: string | null) => {
            if(text != null){
                if(text != ""){
                    this.canvasRenderPart.layerHandler.createNewLayer(text);
                }else{
                    alert("Invalid name.");
                }
            }
        });
    }

    deleteLayer(){
        window.node.prompt("Delete a new layer", "Type in the name of the layer you want to delete", (text: string | null) => {
            if(text != null){
                this.canvasRenderPart.layerHandler.deleteLayer(text);
            }
        });
    }

    

    
    
    clickPointer(){
        this.cursor.objectSelected!.objectMouseImageReady = false;
    }



    

    keysDown(e: KeyboardEvent){
        if(e.ctrlKey || e.metaKey){
            this.noGridMouse = true;
            if(this.resetCtrlGridKey != undefined) clearTimeout(this.resetCtrlGridKey);
            this.resetCtrlGridKey = setTimeout(() => {
                this.noGridMouse = false;
            }, 1200);
        }

        if(e.key == "m"){
            this.moveToggleDown = true;
        }
    }

    keysUp(e: KeyboardEvent){
        if(e.key == "m"){
            this.moveToggleDown = false;
        }
    }

    

    mouseListenerDown(e: MouseEvent){
        var targetElement = e.target as HTMLElement;
        if(targetElement.tagName != "CANVAS" || targetElement.id != "game"){
            return;
        }
        if(this.cursor.objectSelected != null && this.cursor.objectSelected!.objectMouseImageReady == false && cursorData.cursorType != cursorType.grabber){
            return;
        }

        let mouseGridX = (Math.floor(this.mouseXPosition/this.canvasRenderPart.gridWidth)*this.canvasRenderPart.gridWidth) + ((this.canvasRenderPart.gridXOffset) % this.canvasRenderPart.gridWidth);
        let mouseGridY = (Math.floor(this.mouseYPosition/this.canvasRenderPart.gridHeight)*this.canvasRenderPart.gridHeight) + ((this.canvasRenderPart.gridYOffset) % this.canvasRenderPart.gridHeight);
        
        if(cursorData.cursorType == cursorType.grabber || this.moveToggleDown){
            if(this.previousMouseX != -1 && this.previousMouseY != -1){
                let dX = this.mouseXPosition - this.previousMouseX;
                let dY = this.mouseYPosition - this.previousMouseY;
                this.canvasRenderPart.updateCanvasOffset(dX, dY);
            }
            this.previousMouseX = this.mouseXPosition;
            this.previousMouseY = this.mouseYPosition;
        }else if(cursorData.cursorType == cursorType.pensil && this.canvasRenderPart.layerHandler.selectedLayer != null){
            console.log("this.cursor: ",this.cursor);
            if(this.cursor.objectSelected != null || this.cursor.currentSubTile != null){
                let nameOfMetaObject: string | undefined = this.cursor.objectSelected?.objectName!;
                console.log("Placing this object: ",nameOfMetaObject);
                if(nameOfMetaObject == null){
                    nameOfMetaObject = this.cursor.currentSubTile?.name;
                }
                if(this.noGridMouse){
                    this.canvasRenderPart.layerHandler.addToLayer(new userObject(this.mouseXPosition - this.canvasRenderPart.gridXOffset, 
                        this.mouseYPosition - this.canvasRenderPart.gridYOffset, nameOfMetaObject!, 
                        this.cursor.currentSubTile));
                }else{
                    //check if there already is an item at the position
                    if(this.canvasRenderPart.layerHandler.hasObjectPos(mouseGridX, mouseGridY) == false){
                        this.canvasRenderPart.layerHandler.addToLayer(new userObject(mouseGridX - this.canvasRenderPart.gridXOffset, 
                            mouseGridY - this.canvasRenderPart.gridYOffset, nameOfMetaObject!, this.cursor.currentSubTile));
                    }
                }
            }
            
        }else if(cursorData.cursorType == cursorType.eraser && this.canvasRenderPart.layerHandler.selectedLayer != null){
            let objTarget = this.canvasRenderPart.layerHandler.getObjectsAtPos(this.mouseXPosition, this.mouseYPosition, objectTypes.userObject);
            if(objTarget.length != 0 && objTarget[0].type != objectTypes.geometry){
                this.canvasRenderPart.layerHandler.removeObject(objTarget[0]);
            }
        }else if(cursorData.cursorType == cursorType.geometryRemove && this.canvasRenderPart.layerHandler.selectedLayer != null){
            let objTarget = this.canvasRenderPart.layerHandler.getObjectsAtPos(this.mouseXPosition, this.mouseYPosition, objectTypes.geometry);
            if(objTarget.length != 0 && objTarget[0].type == objectTypes.geometry){
                this.canvasRenderPart.layerHandler.removeObject(objTarget[0]);
            }
        }else if(cursorData.cursorType == cursorType.editor && this.canvasRenderPart.layerHandler.selectedLayer != null){
            var objTarget = this.canvasRenderPart.layerHandler.getObjectsAtPos(this.mouseXPosition, this.mouseYPosition, objectTypes.userObject);
            if(objTarget != null){
                let inputTemplate = this.genObj.generateObject(objTarget[0].name, 0, 0, null, "").inputTemplate;
                let inputString = objTarget[0].inputString;
                if(inputString == ""){
                    inputString = inputTemplate;
                }
                
                window.node.promptDefaultText("Input string for object:", inputString, (text: string | null) => {
                    if(text != null){
                        if(objTarget != null){
                            objTarget[0].inputString = text;
                        }
                    }
                });
            }
            
        }else if(cursorData.cursorType == cursorType.geometryEdit){
            if(this.prevClickedGeometry.length == 0){
                var objTargets = this.canvasRenderPart.layerHandler.getObjectsAtPos(this.mouseXPosition, this.mouseYPosition, objectTypes.geometry);
            
                objTargets.forEach(target => {
                    target.interactClick(this.mouseXPosition - this.canvasRenderPart.gridXOffset, 
                        this.mouseYPosition - this.canvasRenderPart.gridYOffset);
                });
                this.prevClickedGeometry = objTargets;
            }
        }

        
        this.mouseDown = true;
    }


    


    importRoom(roomName: string, jsonString: string){
        this.currentRoomName = roomName;
        this.canvasRenderPart.layerHandler.importRoom(roomName, jsonString);
    }

    exportRoom(){
        return this.canvasRenderPart.layerHandler.exportRoom();
    }

    mouseListenerUp(e: MouseEvent){
        this.mouseDown = false;
        this.previousMouseX = -1;
        this.previousMouseY = -1;

        var targetElement = e.target as HTMLElement;
        if(targetElement.tagName != "CANVAS" || targetElement.id != "game"){
            return;
        }
        if(this.moveToggleDown == false){
            if(cursorData.cursorType == cursorType.geometry){
                let mouseGridX = (Math.floor(this.mouseXPosition/this.canvasRenderPart.gridWidth)*this.canvasRenderPart.gridWidth) + ((this.canvasRenderPart.gridXOffset) % this.canvasRenderPart.gridWidth);
                let mouseGridY = (Math.floor(this.mouseYPosition/this.canvasRenderPart.gridHeight)*this.canvasRenderPart.gridHeight) + ((this.canvasRenderPart.gridYOffset) % this.canvasRenderPart.gridHeight);
                let newGeom = new geometryObject(
                    mouseGridX - this.canvasRenderPart.gridXOffset, 
                    mouseGridY - this.canvasRenderPart.gridYOffset);
                this.canvasRenderPart.layerHandler.addToLayer(newGeom);
            }else if(cursorData.cursorType == cursorType.geometryEdit){
                this.prevClickedGeometry.forEach(prevTarget => {
                    prevTarget.interactClick(this.mouseXPosition - this.canvasRenderPart.gridXOffset, 
                        this.mouseYPosition - this.canvasRenderPart.gridYOffset);
                });
                this.prevClickedGeometry = [];
            }
        }
        
    }

    mouseListenerMove(e: MouseEvent){
        let mousePosition = this.canvasRenderPart.getCanvasMousePositions(e);
        this.mouseXPosition = mousePosition[0];
        this.mouseYPosition = mousePosition[1];
        
        document.getElementById("mousePositionContainer")!.innerHTML = "x: "+(this.mouseXPosition-this.canvasRenderPart.gridXOffset)+"    y: "+(this.mouseYPosition-this.canvasRenderPart.gridYOffset);

        let objTarget = this.canvasRenderPart.layerHandler.getObjectsAtPos(this.mouseXPosition, this.mouseYPosition);
        if(objTarget.length != 0 && objTarget[0].type != objectTypes.geometry){
            document.getElementById("objectNameContainer")!.innerHTML = objTarget[0].name;
        }

        if(this.mouseDown){
            this.mouseListenerDown(e);
        }
        if(cursorData.cursorType == cursorType.geometryEdit && this.moveToggleDown == false){
            let geometries = this.canvasRenderPart.layerHandler.getObjectsOfType(objectTypes.geometry);
            geometries.forEach(objTarget => {
                objTarget.interact(this.mouseXPosition-this.canvasRenderPart.gridXOffset, this.mouseYPosition-this.canvasRenderPart.gridYOffset, geometries);
            });
        }
    }

    render(){
        this.canvasRenderPart.render(this.mouseXPosition, this.mouseYPosition, this.cursor);
    }

}