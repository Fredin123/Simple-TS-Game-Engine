import { handleCanvas } from "./canvasHandler/handleCanvas";
import * as PIXI from 'pixi.js'
import { objectBase } from "../../engine/objectHandlers/objectBase";
import { tools } from "../../engine/tools/tools";
import { objectGenerator } from "../../shared/objectGenerator";
import { fileSystemEntry } from "./fileSystemEntry";
import { cursorData } from "./cursor/cursorData";
import { objectSelectedData } from "./cursor/objectSelectedData";
import { canvasRenderer } from "./canvasHandler/canvasRenderer";

declare var prettyFiles: any;
declare var window: any;


export class fileSystemHandlerObjects{
    static classAndImage: Record<string, HTMLImageElement> = {};
    generateObjects:objectGenerator = new objectGenerator();
    parameters: any = {
		itemName: "File",
		disableInteraction: true,
		onlyUniqueNames: true,
		createItemButtonOn: true,
		canResize: false
    };

    preLoadedImage: boolean = false;
    system:any;

    canvasHandler: handleCanvas;


    savedImageDataUrls: Record<string, string> = {};
    
    cursor: cursorData;

    constructor(canvasHandler: handleCanvas, cursor: cursorData){
        this.cursor = cursor;
        this.canvasHandler = canvasHandler;
        this.system = new prettyFiles.init().getInit("fileSystemObjects", this.parameters);

        this.system.onCreateNewFile = this.onCreateNewFile.bind(this);

        this.system.onClickFile = this.onClickFile.bind(this);



        window.node.getFolderContent("../../objects", (returnData: Array<Array<string>>) => {
            returnData.forEach(room => {
                room[0] = room[0].substr(room[0].indexOf("objects"));
            });
            this.populateFileSystem(returnData);
        });

        this.generateObjects.getAvailibleObjects().forEach(obj => {
            var tempObj: objectBase = obj(0, 0, "");
            let appRenderObject = new PIXI.Application({
                width: tempObj.g.width,
                height: tempObj.g.height,
                transparent: true
            });
            

            appRenderObject.stage.addChild(tempObj.g);

            appRenderObject.render();

            this.preLoadedImage = true;
            this.system.sticker = appRenderObject.view.toDataURL();
            var functionAsString: string = tempObj.constructor.toString();
            let tempNewImage = new Image();
            tempNewImage.src = this.system.sticker;


            var funcNameOnly = tools.getClassNameFromConstructorName(functionAsString); 
            fileSystemHandlerObjects.classAndImage[funcNameOnly] = tempNewImage;
            this.savedImageDataUrls[funcNameOnly] = this.system.sticker;
        });


    }


    

    private populateFileSystem(roomData: Array<Array<string>>){
        let dataToInsertIntoFileSystem: fileSystemEntry[] = [];
        let idCounter: number = 0;
        roomData.forEach(roomMeta => {
            let roomSrc = roomMeta[0];
            let roomData = roomMeta[1];

            let roomDirParts = roomSrc.split("/");
            
            let currentFolder: fileSystemEntry | null = null;

            roomDirParts.forEach(item => {
                if(item != ".."){
                    let newEntry: fileSystemEntry;
                    if(item.indexOf(".ts") != -1){
                        //It's a file
                        let nameOnly = item.split(".")[0];
                        newEntry = new fileSystemEntry("file", nameOnly, [], idCounter, [nameOnly, roomData]);
                        newEntry.image = this.savedImageDataUrls[nameOnly];
                        if(currentFolder == null){
                            dataToInsertIntoFileSystem.push(newEntry);
                        }else{
                            currentFolder.contains.push(newEntry);
                        }
                    }else{
                        //It's a folder

                        //Check if folder already exists
                        let foundFolder: boolean = false;
                        if(currentFolder == null){
                            for(let elem of dataToInsertIntoFileSystem){
                                if(elem.type == "folder" && elem.name == item){
                                    currentFolder = elem;
                                    foundFolder = true;
                                    break;
                                }
                            }
                        }else{
                            for(let elem of currentFolder.contains){
                                if(elem.type == "folder" && elem.name == item){
                                    currentFolder = elem;
                                    foundFolder = true;
                                    break;
                                }
                            }
                        }

                        if(foundFolder == false){
                            newEntry = new fileSystemEntry("folder", item, [], idCounter, undefined);
                            if(currentFolder == null){
                                dataToInsertIntoFileSystem.push(newEntry);
                            }else{
                                currentFolder.contains.push(newEntry);
                            }
                            currentFolder = newEntry;
                        }
                        
                    }
                    //let newFolderId = this.system.createFolder(item);
                    //console.log(newFolderId);
                    
                    idCounter++;
                }
            });
        });
        this.system.insertData(JSON.stringify(dataToInsertIntoFileSystem));
    }



    public getFileSystemElement(){
        return document.getElementById("fileSystemObjects");
    }

    private onClickFile(fileClicked:string, id: number, image:string, customData: any){
        this.cursor.currentSubTile = null;
        this.cursor.objectSelected = new objectSelectedData(customData[0], customData.width, customData.height, image);
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