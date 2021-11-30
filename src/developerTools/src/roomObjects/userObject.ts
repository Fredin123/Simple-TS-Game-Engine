import { tileAnimation } from "../../../shared/tile/tileAnimation";
import { layerContainer } from "../canvasHandler/layer/layerContainer";
import { fileSystemHandlerObjects } from "../fileSystemHandlerObjects";
import { resourcesTiles } from "../tiles/resourcesTiles";
import { objectTypes } from "../../../shared/objectTypes";
import { IObjectMeta } from "../../../shared/IObjectMeta";

export class userObject implements IObjectMeta{
    x: number;
    y: number;
    name: string;
    tile: tileAnimation | null = null;
    isCombinationOfTiles: boolean = false;
    idOfStaticTileCombination: string = "";
    isPartOfCombination: boolean = false;
    type: objectTypes = objectTypes.userObject;
    inputString: string = "";
    geomPoints: number[] = [];

    private missingImage = new Image();


    constructor(x: number, y: number, name: string, tile: tileAnimation | null){

        this.missingImage.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRF/wDj////hdfaxwAAAA5JREFUeJxjCGVYxYCEAR6cA/1tfYfmAAAAAElFTkSuQmCC";
        this.x = x;
        this.y = y;
        this.name = name;
        if(tile != null){
            this.tile = tileAnimation.initFromJsonGeneratedObj(tile);
        }
    }
    

    isMouseInside(mouseX: number, mouseY: number, layerHandler: layerContainer){
        let width = -1;
        let height = -1;
        if(this.tile != null){
            width = this.tile.get(0).width;
            height = this.tile.get(0).height;
        }else{
            if(fileSystemHandlerObjects.classAndImage[this.name] != null){
                width = fileSystemHandlerObjects.classAndImage[this.name].width;
                height = fileSystemHandlerObjects.classAndImage[this.name].height;
            }else{
                width = 98;
                height = 98;
            }
            
        }
        
        if(mouseX - layerHandler.gridXOffset >= this.x && 
            mouseX - layerHandler.gridXOffset < this.x+width &&
            mouseY - layerHandler.gridYOffset >= this.y && 
            mouseY - layerHandler.gridYOffset < this.y+height){
                return true;
        }
        return false;
    }


    drawMouseOverSelection(mouseX: number, mouseY: number, layerHandler: layerContainer, context: CanvasRenderingContext2D){
        if(this.isMouseInside(mouseX, mouseY, layerHandler)
        && this.isCombinationOfTiles == false){
            let width = -1;
            let height = -1;
            if(this.tile != null){
                width = this.tile.get(0).width;
                height = this.tile.get(0).height;
            }else{
                if(fileSystemHandlerObjects.classAndImage[this.name] != null){
                    width = fileSystemHandlerObjects.classAndImage[this.name].width;
                    height = fileSystemHandlerObjects.classAndImage[this.name].height;
                }else{
                    width = 98;
                    height = 98;
                }
            }
            context.strokeStyle = 'red';
            context.lineWidth = 5;
            context.beginPath();
            context.rect(this.x + layerHandler.gridXOffset-2.5, 
                    this.y + layerHandler.gridYOffset-2.5,
                    width+5,
                    height+5);
            context.closePath();
            context.stroke();
            return true;
        }
        return false;
    }

    interact(mouseX: number, mouseY: number){
        
    }

    interactClick(mouseX: number, mouseY: number){
        
    }

    render(xoffset: number, yoffset: number, tileCounter:number, context: CanvasRenderingContext2D){
        console.log("Draw userObject");
        context.beginPath();
        context.arc(this.x + xoffset+16, this.y + yoffset+16, 16, 0, 2 * Math.PI, false);
        context.fillStyle = 'white';
        context.fill();
        context.lineWidth = 5;
        context.strokeStyle = 'blue';
        context.stroke();

        if(this.tile == null){
            if(fileSystemHandlerObjects.classAndImage[this.name] != null){
                if(fileSystemHandlerObjects.classAndImage[this.name].complete){
                    context.drawImage(fileSystemHandlerObjects.classAndImage[this.name], this.x + xoffset, this.y + yoffset);
                }
            }else{
                if(this.missingImage.complete){
                    context.drawImage(this.missingImage, 
                            0, 
                            0, 
                            8, 
                            8,
                            this.x + xoffset, this.y + yoffset, 98, 98);
                }
                
            }
            
        }else{
            let tileToDraw = this.tile.get(tileCounter);
            
            if(resourcesTiles.resourceNameAndImage[tileToDraw.resourceName] != null){
                context.drawImage(resourcesTiles.resourceNameAndImage[tileToDraw.resourceName], 
                    tileToDraw.startX, 
                    tileToDraw.startY, 
                    tileToDraw.width, 
                    tileToDraw.height,
                    this.x + xoffset, this.y + yoffset, tileToDraw.width, tileToDraw.height);
            }else{
                if(this.missingImage.complete){
                    context.drawImage(this.missingImage, 
                        tileToDraw.startX, 
                        tileToDraw.startY, 
                        tileToDraw.width, 
                        tileToDraw.height,
                        this.x + xoffset, this.y + yoffset, tileToDraw.width, tileToDraw.height);
                }
            }
            
        }
    }

}