import { subTileMeta } from "./subTileMeta";
import { animatedTypeCreator } from "./animatedTypeCreator";
import { tileAnimation } from "./tileAnimation";

declare var window: any;

export class tileSelector{
    static resourceNameAndImage: Record<string, HTMLImageElement> = {};

    private saveDatePremadeTilesName = "customAnimatedTilesMetaData_DONT_DELETE";
    static resourceCreatedTileAnimations: Record<string, Array<tileAnimation>> = {};

    private modal: HTMLElement = document.createElement("div");
    private closeButton: HTMLElement = document.createElement("button");
    private canvasRenderer: HTMLCanvasElement = document.createElement("canvas");
    private controls: HTMLElement = document.createElement("div");

    private canvasContainer: HTMLElement | null;
    private canvasContext: CanvasRenderingContext2D | null;


    private mouseX = -1;
    private mouseY = -1;


    private resourceName: string = "";
    private subTileDone: boolean = false;

    private tileCreator: animatedTypeCreator;

    private prevCreatedAnimTiles: HTMLElement;

    private callbackSubTile: (exportedTile: tileAnimation) => void = (exportedTile: tileAnimation) => {};

    constructor(){
        window.node.getJsonData(this.saveDatePremadeTilesName, (jsonString: string) => {
            if(jsonString != null){
                let objectDataOnly = JSON.parse(jsonString) as Record<string, Array<tileAnimation>>;
                let keys = Object.keys(objectDataOnly);
                keys.forEach(key => {
                    tileSelector.resourceCreatedTileAnimations[key] = [];
                    let objDataArray =  objectDataOnly[key];
                    objDataArray.forEach(objMetaData => {
                        tileSelector.resourceCreatedTileAnimations[key].push(tileAnimation.initFromJsonGeneratedObj(objMetaData));
                    });
                });
            }
        });
        this.modal.className = "modalStandard";
        this.controls.className = "modalTilesControl";
        this.appendControls();

        let createAnimTiles = document.createElement("div");
        createAnimTiles.id = "animTileCreator";
        this.controls.appendChild(createAnimTiles);

        let useTileButton = document.createElement("button");
        useTileButton.innerHTML = "use this tile";
        useTileButton.addEventListener("mouseup", this.clickUseButton.bind(this));
        this.controls.appendChild(useTileButton);


        this.prevCreatedAnimTiles= document.createElement("div");
        this.controls.appendChild(this.prevCreatedAnimTiles);



        this.modal.appendChild(this.controls);

        this.canvasContainer = document.createElement("div");
        this.canvasContainer.className = "flexItem flex1";
        this.canvasContainer.style.border = "solid 1px blue";
        this.canvasContainer.style.overflow = "auto";
        
        this.canvasRenderer.className = "tileModalCanvas";
        this.canvasContainer.appendChild(this.canvasRenderer);

        this.modal.appendChild(this.canvasContainer);

        this.canvasContext = this.canvasRenderer.getContext("2d");

        this.closeButton.className = "modalCloseButton";
        this.closeButton.innerHTML = "Close";
        this.modal.appendChild(this.closeButton);
        this.modal.style.display = "none";
        this.closeButton.addEventListener("mouseup", this.close.bind(this));

        this.canvasRenderer.addEventListener("mousemove", this.mouseMoveCanvas.bind(this));
        this.canvasRenderer.addEventListener("mousedown", this.clickCanvas.bind(this));
        this.canvasRenderer.addEventListener("mouseup", this.mouseUpCanvas.bind(this));
        
        document.body.appendChild(this.modal);


        setInterval(() => {
            this.renderCanvas();
        }, 500);

        this.tileCreator = new animatedTypeCreator("animTileCreator");

    }


    clickUseButton(){
        if(this.tileCreator.tempSubTile != null){
            let tileAnimation = this.tileCreator.getTileStack();
            if(tileAnimation.name == ""){
                window.node.prompt("", "Create a name for the animation stack", (name: string | null) => {
                    if(name != null){
                        let tileAnimation = this.tileCreator.getTileStack();
                        tileAnimation.name = name;
                        if(tileSelector.resourceCreatedTileAnimations[this.resourceName] == null){
                            tileSelector.resourceCreatedTileAnimations[this.resourceName] = [];
                        }
                        tileSelector.resourceCreatedTileAnimations[this.resourceName].push(tileAnimation);
                        window.node.saveJsonData(this.saveDatePremadeTilesName, JSON.stringify(tileSelector.resourceCreatedTileAnimations));
                        this.callbackSubTile(tileAnimation);
                    }
                });
            }else{
                this.callbackSubTile(tileAnimation);
            }
        }
    }

    mouseUpCanvas(e: MouseEvent){
        this.subTileDone = true;
    }


    clickCanvas(e: MouseEvent){
        this.subTileDone = false;
        let x = e.clientX;
        let y = e.clientY;
        
        var rect = this.canvasRenderer.getBoundingClientRect();
        x -= rect.left;
        y -= rect.top;

        let gridWidth = parseInt((document.getElementById("gridWidthIn") as HTMLInputElement).value);
        let gridHeight = parseInt((document.getElementById("gridHeightIn") as HTMLInputElement).value);
        let gridXOffset = parseInt((document.getElementById("gridXOffset") as HTMLInputElement).value);
        let gridYOffset = parseInt((document.getElementById("gridYOffset") as HTMLInputElement).value);

        this.tileCreator.tempSubTile = new subTileMeta(this.resourceName, 
            (Math.floor(x/gridWidth)*gridWidth) + gridXOffset, 
            (Math.floor(y/gridHeight)*gridHeight) + gridYOffset, 
            0, 0);
    }


    mouseMoveCanvas(e: MouseEvent){
        let x = e.clientX;
        let y = e.clientY;
        
        var rect = this.canvasRenderer.getBoundingClientRect();
        x -= rect.left;
        y -= rect.top;
        this.mouseX = x;
        this.mouseY = y;
        

        this.renderCanvas();
    }

    initCanvas(){

    }


    appendControls(){
        let controllerHTML = '<label for="gridWidthIn">Grid width:</label><input id="gridWidthIn" type="number" value="32"><br>';
        controllerHTML += '<label for="gridHeightIn">Grid height:</label><input id="gridHeightIn" type="number" value="32"><br>';

        controllerHTML += '<label for="gridXOffset">Grid x offset:</label><input id="gridXOffset" type="number" value="0"><br>';
        controllerHTML += '<label for="gridYOffset">Grid y offset:</label><input id="gridYOffset" type="number" value="0"><br>';


        this.controls.innerHTML = controllerHTML;
    }

    close(){
        window.node.saveJsonData(this.saveDatePremadeTilesName, JSON.stringify(tileSelector.resourceCreatedTileAnimations));
        this.modal.style.display = "none";
    }

    open(imageSource: string, resourceName: string, tileDoneCallback: (exportedTile: tileAnimation) => void ){
        this.callbackSubTile = tileDoneCallback;
        this.resourceName = resourceName;

        if(tileSelector.resourceNameAndImage[resourceName] == null){
            tileSelector.resourceNameAndImage[resourceName] = new Image();
            tileSelector.resourceNameAndImage[resourceName].onload = () => {
                this.canvasRenderer.width = tileSelector.resourceNameAndImage[this.resourceName].width;
                this.canvasRenderer.height = tileSelector.resourceNameAndImage[this.resourceName].height;
                this.canvasRenderer.style.width = tileSelector.resourceNameAndImage[this.resourceName].width+"px";
                this.canvasRenderer.style.height = tileSelector.resourceNameAndImage[this.resourceName].height+"px";
                this.canvasContext?.drawImage(tileSelector.resourceNameAndImage[this.resourceName], 0, 0);
    
    
                this.renderCanvas();
            };
            tileSelector.resourceNameAndImage[resourceName].src = imageSource;
        }else {
            this.renderCanvas();
        }

        
        while(this.prevCreatedAnimTiles.firstChild){
            this.prevCreatedAnimTiles.removeChild(this.prevCreatedAnimTiles.firstChild);
        }
        

        this.populateStoredTileAnimations(resourceName);
        
        
        this.modal.style.display = "flex";
        
    }


    populateStoredTileAnimations(resourceName: string){
        while(this.prevCreatedAnimTiles.firstChild){
            this.prevCreatedAnimTiles.removeChild(this.prevCreatedAnimTiles.firstChild);
        }

        if(tileSelector.resourceCreatedTileAnimations[resourceName] != null){
            let alreadyCreatedTileSets = tileSelector.resourceCreatedTileAnimations[resourceName];
            alreadyCreatedTileSets.forEach(tileSet => {
                let containerItem = document.createElement("div");
                let newTileSetItem = document.createElement("div");
                newTileSetItem.innerHTML = tileSet.name;
                newTileSetItem.addEventListener("mouseup", () => {
                    this.tileCreator.setTileSet(tileSet);
                });
                containerItem.appendChild(newTileSetItem);

                let deleteButton = document.createElement("button");
                deleteButton.innerHTML = "delete";
                deleteButton.addEventListener("mouseup", () => {
                    let pos = tileSelector.resourceCreatedTileAnimations[resourceName].indexOf(tileSet);
                    console.log("tileSelector.resourceCreatedTileAnimations[resourceName]: ",tileSelector.resourceCreatedTileAnimations[resourceName]);
                    tileSelector.resourceCreatedTileAnimations[resourceName].splice(pos, 1);
                    console.log("tileSelector.resourceCreatedTileAnimations[resourceName]: ",tileSelector.resourceCreatedTileAnimations[resourceName]);
                    this.populateStoredTileAnimations(resourceName);
                    if(this.tileCreator.animation.name == tileSet.name){
                        this.tileCreator.animation = new tileAnimation();
                        this.tileCreator.tempSubTile = null;
                    }
                });
                containerItem.appendChild(deleteButton);

                this.prevCreatedAnimTiles.appendChild(containerItem);

            });
        }
    }

    renderGrid(){
        let gridWidth = parseInt((document.getElementById("gridWidthIn") as HTMLInputElement).value);
        let gridHeight = parseInt((document.getElementById("gridHeightIn") as HTMLInputElement).value);
        let gridXOffset = parseInt((document.getElementById("gridXOffset") as HTMLInputElement).value);
        let gridYOffset = parseInt((document.getElementById("gridYOffset") as HTMLInputElement).value);
        if(gridWidth <= 0 || isNaN(gridWidth)){
            gridWidth = 1;
        }
        if(gridHeight <= 0 || isNaN(gridHeight)){
            gridHeight = 1;
        }
        if(gridXOffset <= 0 || isNaN(gridXOffset)){
            gridXOffset = 0;
        }
        if(gridYOffset <= 0 || isNaN(gridYOffset)){
            gridYOffset = 0;
        }
        

        let horizontalLines = Math.round(this.canvasRenderer.height/gridHeight)+2;
        let verticallines = Math.round(this.canvasRenderer.width/gridWidth)+2;


        this.canvasContext!.strokeStyle = 'black';
        this.canvasContext!.lineWidth = 0.5;
        for(let i=0; i<horizontalLines; i++){
            this.canvasContext?.beginPath();
            this.canvasContext?.moveTo(0.5 + (gridXOffset % gridWidth) - gridWidth, 
                (i)*gridHeight+0.5 + (gridYOffset % gridHeight) - gridHeight);
            this.canvasContext?.lineTo(this.canvasRenderer.width+0.5 + (gridXOffset%gridWidth) - gridWidth,
                 (i)*gridHeight+0.5 + (gridYOffset % gridHeight) - gridHeight);
            this.canvasContext?.stroke();
        }

        for(let i=0; i<verticallines; i++){
            this.canvasContext?.beginPath();
            this.canvasContext?.moveTo((i)*gridWidth+0.5 + (gridXOffset%gridWidth) - gridWidth, 
            this.canvasRenderer.height+(i)*gridWidth+0.5 + (gridYOffset % gridHeight) - gridHeight);
            this.canvasContext?.lineTo((i)*gridWidth+0.5 + (gridXOffset%gridWidth) - gridWidth, 0.5 + (gridYOffset % gridHeight) - gridHeight);
            this.canvasContext?.stroke();
        }


        this.canvasContext!.lineWidth = 1;
        let mouseGridX = (Math.floor(this.mouseX/gridWidth)*gridWidth) + gridXOffset;
        let mouseGridY = (Math.floor(this.mouseY/gridHeight)*gridHeight) + gridYOffset;
        this.canvasContext!.strokeStyle = 'red';
        if(this.tileCreator.tempSubTile != null){

            this.canvasContext!.beginPath();
            this.canvasContext!.rect(this.tileCreator.tempSubTile.startX, 
                this.tileCreator.tempSubTile.startY, 
                this.tileCreator.tempSubTile.width, this.tileCreator.tempSubTile.height);
            this.canvasContext!.stroke();

            if(this.subTileDone == false){
                this.tileCreator.tempSubTile.width = mouseGridX - this.tileCreator.tempSubTile.startX;
                this.tileCreator.tempSubTile.height = mouseGridY - this.tileCreator.tempSubTile.startY;
            }

        }else if(this.mouseX != -1 || this.mouseY != -1){
            

            
            this.canvasContext!.beginPath();
            this.canvasContext!.rect(mouseGridX, mouseGridY, gridWidth, gridHeight);
            this.canvasContext!.stroke();
        }

    }

    renderCanvas(){
        this.canvasContext?.clearRect(0, 0, this.canvasRenderer.width, this.canvasRenderer.height);
        if(this.resourceName != ""){
            this.canvasContext?.drawImage(tileSelector.resourceNameAndImage[this.resourceName], 0, 0);
        }
        


        //Render lines
        this.renderGrid();
    }
}