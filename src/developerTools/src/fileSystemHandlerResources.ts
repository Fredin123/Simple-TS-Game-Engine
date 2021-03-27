import { handleCanvas } from "./canvasHandler/handleCanvas";
import * as PIXI from 'pixi.js'
import { objectGenerator } from "../../shared/objectGenerator";
import { fileSystemEntry } from "./fileSystemEntry";
import { tileSelector } from "./tiles/tileSelector";
import { cursorData } from "./cursor/cursorData";
import { subTileMeta } from "../../shared/tile/subTileMeta";
import { tileAnimation } from "../../shared/tile/tileAnimation";

declare var prettyFiles: any;
declare var window: any;


export class fileSystemHandlerResources{
    generateObjects:objectGenerator = new objectGenerator();
    app = new PIXI.Application();
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
    private tileHandler: tileSelector = new tileSelector();
    private cursor: cursorData;



    constructor(canvasHandler: handleCanvas, cursor: cursorData){
        this.cursor = cursor;
        this.canvasHandler = canvasHandler;
        this.system = new prettyFiles.init().getInit("fileSystemResources", this.parameters);


        this.system.onCreateNewFile = this.onCreateNewFile.bind(this);

        this.system.onClickFile = this.onClickFile.bind(this);


        document.body.appendChild(this.app.view);

        window.node.getFolderContent("../../resources", (returnData: Array<Array<string>>) => {
            returnData.forEach(room => {
                room[0] = room[0].substr(room[0].indexOf("resources"));
            });
            this.populateFileSystem(returnData);
        });



    }


    

    private populateFileSystem(roomData: Array<Array<string>>){
        let dataToInsertIntoFileSystem: fileSystemEntry[] = [];
        let idCounter: number = 0;
        roomData.forEach(roomMeta => {
            let roomSrc = roomMeta[0];
            let roomMetaData = roomMeta[1];

            let roomDirParts = roomSrc.split("/");
            
            let currentFolder: fileSystemEntry | null = null;

            roomDirParts.forEach(item => {
                if(item != ".."){
                    let newEntry: fileSystemEntry;
                    if(item.indexOf(".") != -1 && item.indexOf(".json") == -1){
                        //It's a file
                        let nameOnly = item.split(".")[0];
                        newEntry = new fileSystemEntry("file", nameOnly, [], idCounter, [roomSrc, roomSrc]);
                        this.tileHandler.loadResource("../../"+roomSrc, roomSrc);
                        //newEntry.image = this.savedImageDataUrls[nameOnly];
                        if(currentFolder == null){
                            dataToInsertIntoFileSystem.push(newEntry);
                        }else{
                            currentFolder.contains.push(newEntry);
                        }
                    }else if(item.indexOf(".json") == -1){
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
        this.tileHandler.open("../../"+customData[1], customData[0], (subtile: tileAnimation) =>{
            this.cursor.objectSelected = null;
            this.cursor.currentSubTile = subtile;
            this.tileHandler.close();
        });
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