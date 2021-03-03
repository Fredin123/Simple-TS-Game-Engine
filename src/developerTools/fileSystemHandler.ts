import { handleCanvas } from "./handleCanvas";
import * as PIXI from 'pixi.js'
import { objectBase } from "../objectHandlers/objectBase";
import { tools } from "../tools/tools";
import { objectGenerator } from "../objectGenerator";

declare var prettyFiles: any;


export class fileSystemHandler{
    generateObjects:objectGenerator = new objectGenerator();
    app = new PIXI.Application();
    parameters: any = {
		itemName: "File",
		disableInteraction: false,
		onlyUniqueNames: true,
		createItemButtonOn: true,
		canResize: false
    };

    preLoadedImage: boolean = false;
    system:any;

    canvasHandler: handleCanvas;

    


    constructor(canvasHandler: handleCanvas){
        this.canvasHandler = canvasHandler;
        this.system = new prettyFiles.init().getInit("fileSystem", this.parameters);

        document.addEventListener("keydown", this.keyDownListener.bind(this));

        this.system.onCreateNewFile = this.onCreateNewFile.bind(this);

        this.system.onClickFile = this.onClickFile.bind(this);


        document.body.appendChild(this.app.view);

        this.generateObjects.getAvailibleObjects().forEach(obj => {
            this.app.stage.removeChildren();
            var tempObj: objectBase = obj(0, 0);
            console.log(tempObj);
            this.app.view.width = tempObj.g.width;
            this.app.view.height = tempObj.g.height;
            this.app.stage.addChild(tempObj.g);

            this.app.render();

            this.preLoadedImage = true;
            this.system.sticker = this.app.view.toDataURL();
            var functionAsString: string = tempObj.constructor.toString();
            let tempNewImage = new Image();
            tempNewImage.src = this.system.sticker;

            var funcNameOnly = tools.getClassNameFromConstructorName(functionAsString); 
            canvasHandler.classAndImage[funcNameOnly] = tempNewImage;
            this.system.createFile(funcNameOnly, ()=> {

            }, funcNameOnly);
        });
    }

    

    public getFileSystemElement(){
        return document.getElementById("fileSystem");
    }

    private onClickFile(fileClicked:string, id: number, image:string, customData: any){
        this.canvasHandler.setMouseItem(image, customData as string);
    }

    private keyDownListener(e: KeyboardEvent){
        if(e.key == "e")
            console.log(this.system.getStructure(true));
    }


    private onCreateNewFile(name: string, id: number, proceed: any){
        if(this.preLoadedImage == false){
            this.system.prompt("Image", "Include an image source", "", (input: any) => {
                if(input != null && input.replace(/ /g, '') != ''){
                    this.system.sticker = input;
                    
                    if(proceed()){
                        this.system.sticker = input;
                    }
                }
            });
        }else{
            if(proceed()){
                this.system.sticker = new Image();
            }
        }
    }

    
}