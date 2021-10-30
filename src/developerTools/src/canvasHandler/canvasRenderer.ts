import { layer } from "../../../shared/layer";
import { layerContainer } from "./layer/layerContainer";
import { cursorData } from "../cursor/cursorData";
import { cursorType } from "../cursor/cursorType";
import { resourcesTiles } from "../tiles/resourcesTiles";
import { geometryObject } from "../roomObjects/geometryObject";



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

    private cameraBoundButton;
    private displayCameraBounds = true;

    private counter: number = 0;
    haveSelectedFromHover: boolean = false;

    private missingImage = new Image();

    private geometryDummy = new geometryObject(0, 0);
    private toggleGridButton: HTMLElement | null;
    private renderGrid = true;
    

    constructor(canvasName: string){
        this.missingImage.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRF/wDj////hdfaxwAAAA5JREFUeJxjCGVYxYCEAR6cA/1tfYfmAAAAAElFTkSuQmCC";
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

        document.addEventListener("keypress", this.keysDown.bind(this));

        this.inputGridx = document.getElementById("gridXInput") as HTMLInputElement;
        this.inputGridx.value = this.gridWidth + "";
        this.inputGridy = document.getElementById("gridYInput") as HTMLInputElement;
        this.inputGridy.value = this.gridHeight + "";

        this.buttonSetSize.onclick = this.setCanvasWidth.bind(this);

        document.getElementById("gridXInput")?.addEventListener("change", this.onGridSizeChange.bind(this));
        document.getElementById("gridYInput")?.addEventListener("change", this.onGridSizeChange.bind(this));

        this.cameraBoundButton = document.getElementById("toggleCameraBounds");
        this.cameraBoundButton?.addEventListener("click", this.toggleCameraBounds.bind(this));

        this.toggleGridButton = document.getElementById("toggleGrid");
        this.toggleGridButton?.addEventListener("click", this.toggleGridRender.bind(this));

        this.container = document.getElementById("canvasAndFilesCon");

        window.onresize = this.windowResize.bind(this);


        setTimeout(() => {
            this.windowResize();
        }, 800);
    }

    keysDown(e: KeyboardEvent){
        if(e.key == "1"){
            this.zoomIn();
        }else if(e.key == "2"){
            this.zoomOut();
        }else if(e.key == "g"){
            this.toggleGridRender();
        }else if(e.key == "c"){
            this.toggleCameraBounds();
        }
    }


    updateCanvasOffset(dx: number, dy: number){
        this.gridXOffset += dx;
        this.gridYOffset += dy;

        this.layerHandler.gridXOffset = this.gridXOffset;
        this.layerHandler.gridYOffset = this.gridYOffset;
    }

    windowResize(){
        
        this.canvas.style.width = window.innerWidth+"px";
        this.canvas.style.height = window.innerHeight+"px";

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
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

    private toggleCameraBounds(){
        this.displayCameraBounds = !this.displayCameraBounds;
    }

    private toggleGridRender(){
        this.renderGrid = !this.renderGrid;
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
        this.counter++;
        this.haveSelectedFromHover = false;
        this.ctx?.clearRect(0, 0, this.canvas.width/this.canvasScaleX, this.canvas.height/this.canvasScaleY);
        this.ctx!.fillStyle = (document.getElementById("backgroundColorInput") as HTMLInputElement).value;
        this.ctx?.fillRect(0, 0, this.canvas.width/this.canvasScaleX, this.canvas.height/this.canvasScaleY);
        this.ctx?.fill();

        this.drawGrid();
        this.drawObjects(mouseX, mouseY);
        this.drawCameraBounds();
        this.drawMouse(mouseX, mouseY, cursor);
    }




    private drawObjects(mouseX: number, mouseY: number){
        this.layerHandler.storedLayers.forEach(layer => {
            if(layer.hidden == false){
                layer.metaObjectsInLayer.forEach(meta => {
                    if(this.layerHandler.selectedLayer!.layerName == layer.layerName){
                        meta.drawMouseOverSelection(mouseX, mouseY, this.layerHandler, this.ctx!);
                    }
                    meta.render(this.gridXOffset, this.gridYOffset, this.counter, this.ctx!);
                });
            }
        });
    }


    private drawGrid(){
        if(this.renderGrid == false) return;
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


    private drawCameraBounds(){
        if(this.displayCameraBounds == false) return;

        let startXCam = parseInt((document.getElementById("cameraBoundsX") as HTMLInputElement).value);
        let startYCam = parseInt((document.getElementById("cameraBoundsY") as HTMLInputElement).value);
        let widthCam = parseInt((document.getElementById("cameraBoundsWidth") as HTMLInputElement).value);
        let heightCam = parseInt((document.getElementById("cameraBoundsHeight") as HTMLInputElement).value);

        if(startXCam != null && startYCam != null && widthCam != null && heightCam != null){
            this.ctx!.strokeStyle = "red";
            this.ctx!.lineWidth = 16;
            this.ctx!.strokeRect(startXCam + this.gridXOffset, startYCam + this.gridYOffset, 
                widthCam, heightCam);
            this.ctx!.lineWidth = 1;
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

                if(cursor.currentSubTile.get(0) == undefined){
                    console.log("can't get first image from tile: ", cursor.currentSubTile);
                }
                if(resourcesTiles.resourceNameAndImage[cursor.currentSubTile.get(0).resourceName] != null){
                    let image = resourcesTiles.resourceNameAndImage[cursor.currentSubTile.get(0).resourceName];
                    this.ctx?.drawImage(image, cursor.currentSubTile.get(0).startX, 
                        cursor.currentSubTile.get(0).startY, 
                        cursor.currentSubTile.get(0).width, 
                        cursor.currentSubTile.get(0).height,
                        xMousePut, yMousePut, 
                        cursor.currentSubTile.get(0).width, 
                        cursor.currentSubTile.get(0).height);
                }else{
                    console.log("Can't find resource ",cursor.currentSubTile.get(0).resourceName);
                    console.log("In resource pool: ",resourcesTiles.resourceNameAndImage);
                }
                
            }
        }else if(cursorData.cursorType == cursorType.geometry){
            this.geometryDummy.render(mouseGridX, mouseGridY, 0, this.ctx!);
        }
    }




}
