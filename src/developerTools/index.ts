import { fileSystemHandler } from "./fileSystemHandler";
import { handleCanvas } from "./handleCanvas";
import { mouseControls } from "./mouseControls";
import { tools } from "../tools/tools";



(function(){
    let canvasHandler = new handleCanvas("game");
    
    let mouseCon = new mouseControls("game");
    
    let filesHandler = new fileSystemHandler(canvasHandler);


    canvasHandler.setFileSystemElement(filesHandler.getFileSystemElement()!);

    document.getElementById("exportRoom")?.addEventListener("mouseup", () => {
        tools.download("room.txt", canvasHandler.exportRoom());
    });

    document.getElementById("importRoom")?.addEventListener("mouseup", () => {
        tools.upload((text: string) => {
            //console.log(text);
            canvasHandler.importRoom(text);
        });
    });
    

    setInterval(()=>{
        canvasHandler.render();
    }, 16);

})();