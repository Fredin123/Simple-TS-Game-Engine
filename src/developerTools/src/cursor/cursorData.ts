import { cursorType } from "./cursorType";
import { objectSelectedData } from "./objectSelectedData";
import { subTileMeta } from "../../../shared/tile/subTileMeta";
import { tileAnimation } from "../../../shared/tile/tileAnimation";



export class cursorData{
    static cursorType: cursorType = cursorType.pensil;

    objectSelected: objectSelectedData | null = null;


    currentSubTile: tileAnimation | null = null;
    


    constructor(){
        let buttonsContainer = document.getElementById("idCursorTypeContainer");

        let enumKeys = Object.keys(cursorType);
        for(let enumKey of enumKeys){
            let typeButton = document.createElement("button");
            typeButton.className = "cursorButton";
            if(cursorType[enumKey as keyof typeof cursorType] == cursorData.cursorType){
                typeButton.className = "cursorButtonSelected";
            }
            typeButton.innerHTML = enumKey;
            typeButton.addEventListener("mouseup", (e: Event) => {
                let allButtons = document.getElementsByClassName("cursorButtonSelected");
                for(var i=0; i< allButtons.length; i++){
                    allButtons[i].className = "cursorButton";
                }

                let target = e.target as HTMLButtonElement;
                let key = target.innerHTML as string;
                
                target.className = "cursorButtonSelected";

                cursorData.cursorType = cursorType[key as keyof typeof cursorType];
            });
            buttonsContainer?.appendChild(typeButton);
        }
    }
}