import { resourcesHand } from "../../engine/preload sources/resourcesHand";
import { cursorData } from "./cursor/cursorData";
import { fileSystemHandlerObjects } from "./fileSystemHandlerObjects";
import { fileSystemHandlerResources } from "./fileSystemHandlerResources";
import { fileSystemHandlerRooms } from "./fileSystemHandlerRooms";
import { handleCanvas } from "./canvasHandler/handleCanvas";
import { mouseControls } from "./mouseControls";
import * as PIXI from 'pixi.js'


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
        filesHandlerRooms.saveRoom(canvasHandler.exportRoom());
        alert("Complete");
    }, false);



    setInterval(()=>{
        canvasHandler.render();
    }, 16);
}