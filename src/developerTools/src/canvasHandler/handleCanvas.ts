import { cursorData } from "../cursor/cursorData";
import { cursorType } from "../cursor/cursorType";
import { layer } from "./layer/layer";
import { layerContainer } from "./layer/layerContainer";
import { objectMetaData } from "../objectMetaData";
import { tileSelector } from "../tiles/tileSelector";
import { canvasRenderer } from "./canvasRenderer";
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
    }

    keysUp(e: KeyboardEvent){
        
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
        
        if(cursorData.cursorType == cursorType.pensil && this.canvasRenderPart.layerHandler.selectedLayer != null){
            if(this.cursor.objectSelected != null || this.cursor.currentSubTile != null){
                let nameOfMetaObject: string | undefined = this.cursor.objectSelected?.objectName!;
                if(nameOfMetaObject == null){
                    nameOfMetaObject = this.cursor.currentSubTile?.name;
                }
                if(this.noGridMouse){
                    this.canvasRenderPart.layerHandler.addToLayer(new objectMetaData(this.mouseXPosition - this.canvasRenderPart.gridXOffset, 
                        this.mouseYPosition - this.canvasRenderPart.gridYOffset, nameOfMetaObject!, 
                        this.cursor.currentSubTile));
                }else{
                    //check if there already is an item at the position
                    if(this.canvasRenderPart.layerHandler.hasObjectPos(mouseGridX, mouseGridY) == false){
                        this.canvasRenderPart.layerHandler.addToLayer(new objectMetaData(mouseGridX - this.canvasRenderPart.gridXOffset, 
                            mouseGridY - this.canvasRenderPart.gridYOffset, nameOfMetaObject!, this.cursor.currentSubTile));
                    }
                }
            }
            
        }else if(cursorData.cursorType == cursorType.eraser && this.canvasRenderPart.layerHandler.selectedLayer != null){
            let objTarget = this.canvasRenderPart.layerHandler.getObjectAtPos(this.mouseXPosition, this.mouseYPosition);
            this.canvasRenderPart.layerHandler.remomveObject(objTarget);
        }else if(cursorData.cursorType == cursorType.grabber){
            if(this.previousMouseX != -1 && this.previousMouseY != -1){
                let dX = this.mouseXPosition - this.previousMouseX;
                let dY = this.mouseYPosition - this.previousMouseY;
                this.canvasRenderPart.updateCanvasOffset(dX, dY);
            }

            this.previousMouseX = this.mouseXPosition;
            this.previousMouseY = this.mouseYPosition;
        }

        
        this.mouseDown = true;
    }


    

    


    importRoom(jsonString: string){
        this.canvasRenderPart.layerHandler.importRoom(jsonString);
    }

    exportRoom(){
        return this.canvasRenderPart.layerHandler.exportRoom();
    }

    mouseListenerUp(e: MouseEvent){
        this.mouseDown = false;
        this.previousMouseX = -1;
        this.previousMouseY = -1;
    }

    mouseListenerMove(e: MouseEvent){
        let mousePosition = this.canvasRenderPart.getCanvasMousePositions(e);
        this.mouseXPosition = mousePosition[0];
        this.mouseYPosition = mousePosition[1];
        
        if(this.mouseDown){
            this.mouseListenerDown(e);
        }
    }

    

    render(){
        this.canvasRenderPart.render(this.mouseXPosition, this.mouseYPosition, this.cursor);
    }


    

}