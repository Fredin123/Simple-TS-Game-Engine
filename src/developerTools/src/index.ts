import { resourcesHand } from "../../engine/preload sources/resources";
import { cursorData } from "./cursor/cursorData";
import { fileSystemHandlerObjects } from "./fileSystemHandlerObjects";
import { fileSystemHandlerResources } from "./fileSystemHandlerResources";
import { fileSystemHandlerRooms } from "./fileSystemHandlerRooms";
import { handleCanvas } from "./canvasHandler/handleCanvas";
import { mouseControls } from "./mouseControls";



(function(){
    //load resources first
    var app = new PIXI.Application();
    new resourcesHand(app, () => {
        initializeProgram();
    }, "../../../dist/");
    
    

})();


function initializeProgram(){
    let cursor = new cursorData();

    let canvasHandler = new handleCanvas("game", cursor);
    
    let mouseCon = new mouseControls("game");
    
    let filesHandlerObjects = new fileSystemHandlerObjects(canvasHandler, cursor);
    let filesHandlerRooms = new fileSystemHandlerRooms(canvasHandler);
    let resourcesHandlerRooms = new fileSystemHandlerResources(canvasHandler, cursor);

    

    //canvasHandler.setFileSystemElement(filesHandlerObjects.getFileSystemElement()!);

    document.getElementById("saveButton")?.addEventListener("mouseup", (e: Event) => {
        //tools.download("room.txt", canvasHandler.exportRoom());
        filesHandlerRooms.saveRoom(canvasHandler.exportRoom());
    }, false);



    setInterval(()=>{
        canvasHandler.render();
    }, 16);
}