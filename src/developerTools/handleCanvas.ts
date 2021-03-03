import { objectMetaData } from "./objectMetaData";
declare var LZString: any;

export class handleCanvas{
    private mouseXPosition:number = 0;
    private mouseYPosition:number = 0;
    gridX: number;
    gridY: number;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D|null;
    buttonSetSize: HTMLButtonElement|null;
    inputGridx: HTMLInputElement;
    inputGridy: HTMLInputElement;

    itemToPlaceImageUrl: HTMLImageElement = new Image();
    itemToPlaceName:string | null = null;
    mouseImageReady = false;

    noGridMouse: boolean = false;

    roomObjects: Array<objectMetaData> = new Array<objectMetaData>();

    fileSystem: HTMLElement | null = null;
    container: HTMLElement | null;
    mouseDown: boolean = false;

    classAndImage: Record<string, HTMLImageElement> = {};

    constructor(canvasName:string){
        this.gridX = 16;
        this.gridY = 16;
        this.canvas = document.getElementById(canvasName) as HTMLCanvasElement
        this.ctx = this.canvas.getContext("2d");
        this.buttonSetSize = document.getElementById("setSizeButton") as HTMLButtonElement;

        this.inputGridx = document.getElementById("gridXInput") as HTMLInputElement;
        this.inputGridx.value = this.gridX + "";
        this.inputGridy = document.getElementById("gridYInput") as HTMLInputElement;
        this.inputGridy.value = this.gridY + "";

        this.buttonSetSize.onclick = this.setCanvasWidth.bind(this);

        document.addEventListener("mousemove", this.mouseListenerMove.bind(this));
        document.addEventListener("mousedown", this.mouseListenerDown.bind(this));
        document.addEventListener("mouseup", this.mouseListenerUp.bind(this));
        document.addEventListener("keydown", this.keysDown.bind(this));
        document.addEventListener("keyup", this.keysUp.bind(this));

        window.onresize = this.windowResize.bind(this);

        this.container = document.getElementById("canvasAndFilesCon");

        document.getElementById("pointer")?.addEventListener("mouseup", this.clickPointer.bind(this));
    }

    
    clickPointer(){
        this.mouseImageReady = false;
    }


    setFileSystemElement(fs: HTMLElement){
        this.fileSystem = fs;
        this.windowResize();
    }

    private windowResize(){
        if(this.container != null && this.fileSystem != null){
            this.canvas.width = this.container.clientWidth - this.fileSystem.clientWidth-12;
            this.canvas.height = this.container.clientHeight-9;
            
            this.canvas.style.width = this.canvas.width + "px";
            this.canvas.style.height = this.canvas.height + "px";
        }else{
            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;
        }
        
    }

    keysDown(e: KeyboardEvent){
        if(e.ctrlKey || e.metaKey){
            this.noGridMouse = true;
        }
    }

    keysUp(e: KeyboardEvent){
        if(e.ctrlKey || e.metaKey || e.key == "Meta"){
            this.noGridMouse = false;
        }
    }

    setMouseItem(imgUrl: string, objConstructorName:string){
        this.itemToPlaceName = objConstructorName;
        this.itemToPlaceImageUrl = new Image();
        this.mouseImageReady = false;
        this.itemToPlaceImageUrl.src = imgUrl;
        this.itemToPlaceImageUrl.onload = () => {
            this.mouseImageReady = true;
        };
    }

    setCanvasWidth(){
        

        this.gridX = parseInt(this.inputGridx.value);
        this.gridY = parseInt(this.inputGridy.value);
    }

    mouseListenerDown(e: MouseEvent){
        var targetElement = e.target as HTMLElement;
        if(targetElement.tagName != "CANVAS"){
            return;
        }
        if(this.mouseImageReady == false){
            return;
        }
        let img = new Image();
        img.src = this.itemToPlaceImageUrl.src;

        let mouseGridX = Math.floor(this.mouseXPosition/this.gridX)*this.gridX;
        let mouseGridY = Math.floor(this.mouseYPosition/this.gridY)*this.gridY;

        
        if(this.noGridMouse){
            this.roomObjects.push(new objectMetaData(this.mouseXPosition, this.mouseYPosition, this.itemToPlaceName!));
        }else{
            //check if there already is an item at the position
            let alreadyExists: boolean = false;
            this.roomObjects.forEach(obj => {
                if(obj.x == mouseGridX && obj.y == mouseGridY){
                    alreadyExists = true;
                }
            });
            if(alreadyExists == false){
                this.roomObjects.push(new objectMetaData(mouseGridX, mouseGridY, this.itemToPlaceName!));
            }
        }
        this.mouseDown = true;
    }

    importRoom(jsonString: string){
        let arayOfData: Array<objectMetaData> = new Array<objectMetaData>();
        arayOfData = JSON.parse(jsonString);
        
        this.roomObjects.length = 0;
        arayOfData.forEach(objInfo => {
            let newObj = new objectMetaData(objInfo.x, objInfo.y, objInfo.objectClassName);
            this.roomObjects.push(newObj);
        });

    }

    exportRoom(){
        console.log("export this: ", this.roomObjects);
        return LZString.compressToEncodedURIComponent(JSON.stringify(this.roomObjects));
    }

    mouseListenerUp(e: MouseEvent){
        this.mouseDown = false;
    }

    mouseListenerMove(e: MouseEvent){
        var x = e.clientX; //x position within the element.
        var y = e.clientY;  //y position within the element.

        /*if(e.target instanceof Element){
            var rect = e.target.getBoundingClientRect();
            x -= rect.left;
            y -= rect.top;
        }*/
        var rect = this.canvas.getBoundingClientRect();
        x -= rect.left;
        y -= rect.top;

        this.mouseXPosition = x;
        this.mouseYPosition = y;

        if(this.mouseDown){
            this.mouseListenerDown(e);
        }
    }


    update(){

    }


    render(){
        this.drawGrid();
        this.drawObjects();
        this.drawMouse();
    }

    private drawObjects(){
        this.roomObjects.forEach(obj => {
            
            if(this.classAndImage[obj.objectClassName].complete){
                try{
                    this.ctx?.drawImage(this.classAndImage[obj.objectClassName], obj.x, obj.y);
                }catch(exception){
                    //console.log("Fel: ", obj.image, obj);
                }
                
            }
        });
    }


    private drawMouse(){
        let mouseGridX = Math.floor(this.mouseXPosition/this.gridX)*this.gridX;
        let mouseGridY = Math.floor(this.mouseYPosition/this.gridY)*this.gridY;
        this.ctx!.strokeStyle = 'red';
        this.ctx!.lineWidth = 1;
        this.ctx?.rect(mouseGridX, mouseGridY, this.gridX, this.gridY);
        this.ctx?.stroke();

        if(this.mouseImageReady){
            if(this.noGridMouse){
                this.ctx?.drawImage(this.itemToPlaceImageUrl, this.mouseXPosition, this.mouseYPosition);
            }else{
                this.ctx?.drawImage(this.itemToPlaceImageUrl, mouseGridX, mouseGridY);
            }
            
        }
    }

    
    private drawGrid(){
        this.ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);
        let horizontalLines = Math.round(this.canvas.height/this.gridY);
        let verticallines = Math.round(this.canvas.width/this.gridX);

        let mostDrawCalls = (horizontalLines > verticallines) ? horizontalLines : verticallines;

        this.ctx!.strokeStyle = 'black';
        this.ctx!.lineWidth = 0.5;
        for(var i = 0; i<mostDrawCalls; i++){
            //horizontal
            if(horizontalLines > 0){
                horizontalLines--;
                this.ctx?.beginPath();
                this.ctx?.moveTo(0.5, (i+1)*this.gridY+0.5);
                this.ctx?.lineTo(this.canvas.width+0.5, (i+1)*this.gridY+0.5);
                this.ctx?.stroke();
            }
            

            //vertical
            if(verticallines > 0){
                verticallines--;
                this.ctx?.beginPath();
                this.ctx?.moveTo((i+1)*this.gridX+0.5, this.canvas.height+(i+1)*this.gridX+0.5);
                this.ctx?.lineTo((i+1)*this.gridX+0.5, 0.5);
                this.ctx?.stroke();
            }
        }
    }

}