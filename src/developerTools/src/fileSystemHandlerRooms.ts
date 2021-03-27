import { handleCanvas } from "./canvasHandler/handleCanvas";
import * as PIXI from 'pixi.js'
import { objectBase } from "../../engine/objectHandlers/objectBase";
import { tools } from "../../engine/tools/tools";
import { objectGenerator } from "../../shared/objectGenerator";
import { roomHandler } from "./roomHandler";
import { fileSystemEntry } from "./fileSystemEntry";

declare var LZString: any;
declare var prettyFiles: any;
declare var window: any;


export class fileSystemHandlerRooms{
    parameters: any = {
		itemName: "File",
		disableInteraction: true,
		onlyUniqueNames: false,
		createItemButtonOn: true,
		canResize: false
    };

    preLoadedImage: boolean = false;
    system:any;
    private currentRoom: Array<string> = [];

    canvasHandler: handleCanvas;
    private roomManager: roomHandler;
    


    constructor(canvasHandler: handleCanvas){
        this.canvasHandler = canvasHandler;
        this.system = new prettyFiles.init().getInit("fileSystemRoom", this.parameters);

        this.system.onCreateNewFile = this.onCreateNewFile.bind(this);

        this.system.onClickFile = this.onClickFile.bind(this);

        this.roomManager = new roomHandler(()=>{
            this.populateFileSystem(this.roomManager.getRoomData());
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
                        newEntry = new fileSystemEntry("file", item, [], idCounter, [roomSrc, roomData]);
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
        return document.getElementById("fileSystemRoom");
    }

    private onClickFile(fileClicked:string, id: number, image:string, customData: string[]){
        if(customData[1] == ""){
            customData[1] = "[]";
        }
        this.currentRoom = customData;
        this.canvasHandler.importRoom(fileClicked, LZString.decompressFromEncodedURIComponent(customData[1]));
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



    saveRoom(roomDataCompressed: string) {
        console.log("Save this: ",roomDataCompressed);
        window.node.saveRoom(this.currentRoom[0], roomDataCompressed);
    }



    
}