import { subTileMeta } from "./subTileMeta";
import { tileAnimation } from "./tileAnimation";
import { tileSelector } from "./tileSelector";


export class animatedTypeCreator{
    container: HTMLElement | null;
    addTileToAnimButton: HTMLButtonElement;
    tempSubTile: subTileMeta | null = null;

    tilesContainer: HTMLElement;

    animation: tileAnimation = new tileAnimation();

    private tilePreview: HTMLCanvasElement = document.createElement("canvas");

    constructor(elementName: string){
        this.container = document.getElementById(elementName);

        this.tilesContainer = document.createElement("div");
        this.tilesContainer.style.margin = "8px";
        this.container?.appendChild(this.tilesContainer);

        this.addTileToAnimButton = document.createElement("button");
        this.addTileToAnimButton.innerHTML = "add tile to animated tile";
        this.addTileToAnimButton.style.marginBottom = "32px";

        this.addTileToAnimButton.addEventListener("mouseup", this.addTileToAnimation.bind(this));
        this.container?.appendChild(this.addTileToAnimButton);

        this.tilePreview.className = "tilePreview";
        document.body.appendChild(this.tilePreview);
    }


    setTileSet(tileSet: tileAnimation){
        this.animation = tileSet;
        this.tempSubTile = this.animation.tiles[0];
        this.createElementsForTiles(this.animation.tiles);
    }


    addTileToAnimation(e: Event){
        if(this.tempSubTile != null){
            let newTile = this.tempSubTile?.clone();
            newTile.tileName = this.animation.tiles.length.toString();
            this.animation.tiles.push(newTile);
        }
        
        this.createElementsForTiles(this.animation.tiles);
    }


    createAnimatedLayerItem(newTile: subTileMeta | null){
        let item = document.createElement("div");
        if(newTile != null){
            let nameElement = document.createElement("div");
            nameElement.style.display = "inline-block";
            nameElement.style.paddingRight = "32px";
            nameElement.innerHTML = newTile?.tileName;
            nameElement.addEventListener("mouseenter", (e: Event) => {
                if(newTile != null){
                    this.showPreviewOfTile(e, newTile);
                }
            });
            nameElement.addEventListener("mouseleave", (e: Event) => {
                this.tilePreview.style.display = "none";
            });
            item.appendChild(nameElement);
            item.setAttribute("itemName", newTile?.tileName);
        }
        
        

        let moveUpButton = document.createElement("button");
        moveUpButton.innerHTML = "up";
        moveUpButton.addEventListener("mouseup", (e: Event) => {
            let buttonElement = e.target as HTMLButtonElement;
            let name = buttonElement.parentElement?.getAttribute("itemName");
            if(name != null){
                this.moveTile(name, -1);
            }
        });
        item.appendChild(moveUpButton);

        let moveDownButton = document.createElement("button");
        moveDownButton.innerHTML = "down";
        moveDownButton.addEventListener("mouseup", (e: Event) => {
            let buttonElement = e.target as HTMLButtonElement;
            let name = buttonElement.parentElement?.getAttribute("itemName");
            if(name != null){
                this.moveTile(name, 1);
            }
        });
        item.appendChild(moveDownButton);


        let deleteLayerButton = document.createElement("button");
        deleteLayerButton.innerHTML = "delete";
        deleteLayerButton.addEventListener("mouseup", (e: Event) => {
            let buttonElement = e.target as HTMLButtonElement;
            let name = buttonElement.parentElement?.getAttribute("itemName");
            if(name != null){
                this.removeTile(name);
            }
        });
        item.appendChild(deleteLayerButton);


        return item;
    }

    getTileStack(){
        return this.animation;
    }

    moveTile(tileName: string, moveDeltaSign: number){
        let originalPosition: number = -1;
        for(var i = 0; i<this.animation.tiles.length; i++){
            let tile = this.animation.tiles[i];
            if(tile.tileName == tileName){
                originalPosition = i;
            }
        }

        let itemToPlace = this.animation.tiles[originalPosition];

        let newPosition = originalPosition + moveDeltaSign;
        this.animation.tiles.splice(originalPosition, 1);
        this.animation.tiles.splice(newPosition, 0, itemToPlace);
        
        this.createElementsForTiles(this.animation.tiles);
    }

    removeTile(tileName: string){
        let originalPosition: number = -1;
        for(var i = 0; i<this.animation.tiles.length; i++){
            let tile = this.animation.tiles[i];
            if(tile.tileName == tileName){
                originalPosition = i;
            }
        }

        this.animation.tiles.splice(originalPosition, 1);

        this.createElementsForTiles(this.animation.tiles);
    }


    createElementsForTiles(tilesArr: subTileMeta[]){
        while(this.tilesContainer?.firstChild){
            this.tilesContainer.removeChild(this.tilesContainer?.firstChild);
        }
        tilesArr.forEach(tile => {
            this.tilesContainer?.appendChild(this.createAnimatedLayerItem(tile));
        });
        
    }


    showPreviewOfTile(e: Event, targetTile: subTileMeta){
        this.tilePreview.style.display = "inline";

        var target = e.target as HTMLElement;
        var rect = target.getBoundingClientRect();

        this.tilePreview.style.top = rect.top+"px";
        this.tilePreview.style.left = window.innerWidth/2+"px";

        this.tilePreview.style.width = "256px";
        this.tilePreview.style.height = "256px";
        this.tilePreview.width = 256;
        this.tilePreview.height = 256;

        let drawWidth = targetTile.width;
        let drawHeight = targetTile.height;

        if(drawWidth > 256){
            drawWidth = 256;
            drawHeight = drawWidth*(targetTile.height/targetTile.width)
        }
        
        if(drawHeight > 256){
            drawHeight = 256;
            drawWidth = drawHeight*(targetTile.width/targetTile.height)
        }

        var previewCtx = this.tilePreview.getContext("2d");
        previewCtx?.clearRect(0, 0, this.tilePreview.width, this.tilePreview.height)
        previewCtx?.drawImage(tileSelector.resourceNameAndImage[targetTile.resourceName], targetTile.startX, 
            targetTile.startY, 
            targetTile.width, 
            targetTile.height,
            0, 0, drawWidth, drawHeight);
    }

}