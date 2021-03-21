import { layer } from "./layer/layer";
import { layerContainer } from "./layer/layerContainer";
import { objectMetaData } from "../objectMetaData";
import { tileSelector } from "../tiles/tileSelector";
import { cursorData } from "../cursor/cursorData";
import { cursorType } from "../cursor/cursorType";



export class canvasRenderer{
    gridWidth: number;
    gridHeight: number;
    ctx: CanvasRenderingContext2D|null;

    canvas: HTMLCanvasElement;
    buttonSetSize: HTMLButtonElement|null;
    buttonZoomIn: HTMLButtonElement|null;
    buttonZoomOut: HTMLButtonElement|null;
    inputGridx: HTMLInputElement;
    inputGridy: HTMLInputElement;

    gridXOffset: number = 0;
    gridYOffset: number = 0;

    private canvasScaleX: number = 1;
    private canvasScaleY: number = 1;
    
    layers: layer[] = [];

    layerHandler: layerContainer;

    container: HTMLElement | null;

    static classAndImage: Record<string, HTMLImageElement> = {};

    private counter: number = 0;
    haveSelectedFromHover: boolean = false;

    constructor(canvasName: string){
        this.canvas = document.getElementById(canvasName) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d");
        this.gridWidth = 16;
        this.gridHeight = 16;

        this.layerHandler = new layerContainer(this.ctx);
        
        this.buttonSetSize = document.getElementById("setSizeButton") as HTMLButtonElement;
        this.buttonZoomIn = document.getElementById("zoomIn") as HTMLButtonElement;
        this.buttonZoomIn.addEventListener("mouseup", this.zoomIn.bind(this));
        this.buttonZoomOut = document.getElementById("zoomOut") as HTMLButtonElement;
        this.buttonZoomOut.addEventListener("mouseup", this.zoomOut.bind(this));

        this.inputGridx = document.getElementById("gridXInput") as HTMLInputElement;
        this.inputGridx.value = this.gridWidth + "";
        this.inputGridy = document.getElementById("gridYInput") as HTMLInputElement;
        this.inputGridy.value = this.gridHeight + "";

        this.buttonSetSize.onclick = this.setCanvasWidth.bind(this);

        document.getElementById("gridXInput")?.addEventListener("change", this.onGridSizeChange.bind(this));
        document.getElementById("gridYInput")?.addEventListener("change", this.onGridSizeChange.bind(this));

        this.container = document.getElementById("canvasAndFilesCon");

        window.onresize = this.windowResize.bind(this);

        setInterval(() => {
            this.counter ++;
            if(this.counter > 1000){
                this.counter = 0;
            }
        }, 1000);

        setTimeout(() => {
            this.windowResize();
        }, 800);
    }

    updateCanvasOffset(dx: number, dy: number){
        this.gridXOffset += dx;
        this.gridYOffset += dy;

        this.layerHandler.gridXOffset = this.gridXOffset;
        this.layerHandler.gridYOffset = this.gridYOffset;
    }

    windowResize(){
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        
    }

    onGridSizeChange(){
        this.gridWidth = parseInt(this.inputGridx.value);
        this.gridHeight = parseInt(this.inputGridy.value);
        this.ctx?.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx?.scale(this.canvasScaleX, this.canvasScaleY);
    }

    zoomIn(){
        this.canvasScaleX *= 1.1;
        this.canvasScaleY *= 1.1;
        this.ctx?.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx?.scale(this.canvasScaleX, this.canvasScaleY);
    }

    zoomOut(){
        this.canvasScaleX *= 0.9;
        this.canvasScaleY *= 0.9;
        this.ctx?.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx?.scale(this.canvasScaleX, this.canvasScaleY);
    }

    setCanvasWidth(){
        

        this.gridWidth = parseInt(this.inputGridx.value);
        this.gridHeight = parseInt(this.inputGridy.value);
    }

    getCanvasMousePositions(e: MouseEvent){
        let x = e.clientX;
        let y = e.clientY;
        
        var rect = this.canvas.getBoundingClientRect();
        x -= rect.left;
        y -= rect.top;

        let ratioScaleX = (this.canvas.width/this.canvasScaleX)/this.canvas.width;
        let ratioScaleY = (this.canvas.height/this.canvasScaleY)/this.canvas.height;

        x *= ratioScaleX;
        y *= ratioScaleY;
        return [x, y]
    }


    render(mouseX: number, mouseY: number, cursor: cursorData){
        this.haveSelectedFromHover = false;
        this.ctx?.clearRect(0, 0, this.canvas.width/this.canvasScaleX, this.canvas.height/this.canvasScaleY);
        this.drawGrid();
        this.drawObjects(mouseX, mouseY);
        this.drawMouse(mouseX, mouseY, cursor);
    }




    private drawObjects(mouseX: number, mouseY: number){
        this.layerHandler.storedLayers.forEach(layer => {
            if(layer.hidden == false){
                layer.metaObjectsInLayer.forEach(meta => {
                    if(meta.tile == null){
                        if(canvasRenderer.classAndImage[meta.name].complete){
                            try{
                                //this.ctx?.setTransform(1, 0, 0, 1, this.canvasXOffset, this.canvasYOffset);
                                this.drawMouseOverSelection(meta, mouseX, mouseY);
                                this.ctx?.drawImage(canvasRenderer.classAndImage[meta.name], 
                                    meta.x + this.gridXOffset, 
                                    meta.y + this.gridYOffset);
                            }catch(exception){
                                //console.log("Fel: ", obj.image, obj);
                            }
                            
                        }
                    }else{
                        let tileToDraw = meta.tile.get(this.counter);
                        this.drawMouseOverSelection(meta, mouseX, mouseY);
                        this.ctx?.drawImage(tileSelector.resourceNameAndImage[tileToDraw.resourceName], tileToDraw.startX, 
                            tileToDraw.startY, 
                            tileToDraw.width, 
                            tileToDraw.height,
                            meta.x + this.gridXOffset, meta.y + this.gridYOffset, tileToDraw.width, tileToDraw.height);
                    }
                });
            }
        });
    }



    private drawMouseOverSelection(obj: objectMetaData, mouseX: number, mouseY: number){
        if(this.layerHandler.isMouseInsideObject(obj, mouseX, mouseY) 
        && this.haveSelectedFromHover == false){
            this.haveSelectedFromHover = true;
            let width = -1;
            let height = -1;
            if(obj.tile != null){
                width = obj.tile.get(this.counter).width;
                height = obj.tile.get(this.counter).height;
            }else{
                width = canvasRenderer.classAndImage[obj.name].width;
                height = canvasRenderer.classAndImage[obj.name].height;
            }
            this.ctx!.strokeStyle = 'red';
            this.ctx!.lineWidth = 5;
            this.ctx?.beginPath();
            this.ctx?.rect(obj.x + this.gridXOffset-2.5, 
                    obj.y + this.gridYOffset-2.5,
                    width+5,
                    height+5);
            this.ctx?.stroke();
        }
    }



    private drawGrid(){
        this.ctx!.lineWidth = 1;
        let drawGridWidth = this.gridWidth;
        let drawGridHeight = this.gridHeight;



        let horizontalLines = Math.ceil((this.canvas.height/this.canvasScaleX)/drawGridHeight)+1;
        let verticallines = Math.ceil((this.canvas.width/this.canvasScaleY)/this.gridWidth)+1;


        this.ctx!.strokeStyle = 'black';
        this.ctx!.lineWidth = 0.5/this.canvasScaleX;

        for(let i=0; i<horizontalLines; i++){
            this.ctx?.beginPath();
            this.ctx?.moveTo(0, 
            (i)*drawGridWidth+0.5 + (this.gridYOffset % drawGridHeight) - drawGridHeight);

            this.ctx?.lineTo(this.canvas.width / this.canvasScaleX, 
                (i)*drawGridWidth+0.5 + (this.gridYOffset % drawGridHeight) - drawGridHeight);
            this.ctx?.stroke();
        }

        for(let i=0; i<verticallines; i++){
            this.ctx?.beginPath();
            this.ctx?.moveTo((i)*drawGridWidth+0.5 + (this.gridXOffset%drawGridWidth) - drawGridWidth, 0);

            this.ctx?.lineTo((i)*drawGridWidth+0.5 + (this.gridXOffset%drawGridWidth) - drawGridWidth, this.canvas.height / this.canvasScaleY);
            this.ctx?.stroke();
        }

    }



    private drawMouse(mouseX: number, mouseY: number, cursor: cursorData){
        let mouseGridX = (Math.floor(mouseX/this.gridWidth)*this.gridWidth) + ((this.gridXOffset) % this.gridWidth);
        let mouseGridY = (Math.floor(mouseY/this.gridHeight)*this.gridHeight) + ((this.gridYOffset) % this.gridHeight);


        if(cursorData.cursorType == cursorType.pensil){
            if(cursor.objectSelected != null){
                this.ctx!.strokeStyle = 'red';
                this.ctx!.lineWidth = 1;
                this.ctx?.rect(mouseGridX, mouseGridY, this.gridWidth, this.gridHeight);
                this.ctx?.stroke();
    
                if(cursor.objectSelected!.objectMouseImageReady && cursorData.cursorType == cursorType.pensil){
                    if(/*this.noGridMouse*/false){
                        this.ctx?.drawImage(cursor.objectSelected?.objectToPlaceImageUrl!, mouseX, mouseY);
                    }else{
                        this.ctx?.drawImage(cursor.objectSelected?.objectToPlaceImageUrl!, mouseGridX, mouseGridY);
                    }
                    
                }
            }else if(cursor.currentSubTile != null){
                let xMousePut = 0;
                let yMousePut = 0;
                if(/*this.noGridMouse*/false){
                    xMousePut = mouseX;
                    yMousePut = mouseY;
                }else{
                    xMousePut = mouseGridX;
                    yMousePut = mouseGridY;
                }

                
                let image = tileSelector.resourceNameAndImage[cursor.currentSubTile.get(0).resourceName];
                this.ctx?.drawImage(image, cursor.currentSubTile.get(0).startX, 
                    cursor.currentSubTile.get(0).startY, 
                    cursor.currentSubTile.get(0).width, 
                    cursor.currentSubTile.get(0).height,
                    xMousePut, yMousePut, 
                    cursor.currentSubTile.get(0).width, 
                    cursor.currentSubTile.get(0).height);
            }
        }
    }




}
