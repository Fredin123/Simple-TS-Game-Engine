import { handleCanvas } from "../handleCanvas";
import { layer } from "./layer";
import { objectMetaData } from "../../objectMetaData";
import { canvasRenderer } from "../canvasRenderer";

declare var LZString: any;


export class layerContainer{
    containerElement: HTMLElement;
    storedLayers: layer[] = [];
    selectedLayer: layer | null = null;
    ctx: CanvasRenderingContext2D|null;

    gridXOffset: number = 0;
    gridYOffset: number = 0;
    
    constructor(canvasContext: CanvasRenderingContext2D|null){
        this.ctx = canvasContext;
        this.containerElement = document.getElementById("layerContainer") as HTMLElement;
    }


    importRoom(jsonString: string){
        let arayOfData: layer[] = [];
        if(jsonString != ""){
            arayOfData = JSON.parse(jsonString);
        }
        if(arayOfData.length == 0){
            arayOfData.push(new layer("Layer 1", 0));
        }
        
        this.storedLayers.length = 0;
        for(let i=0; i<arayOfData.length; i++){
            let dataLayer = arayOfData[i];
            let newLayer = new layer(dataLayer.layerName, dataLayer.zIndex);

            dataLayer.metaObjectsInLayer.forEach(obj => {
                newLayer.metaObjectsInLayer.push(new objectMetaData(obj.x, obj.y, obj.name, obj.tile));
            });
            this.storedLayers.push(newLayer);
        }


        //populate layer select element
        this.initializeLayerModule(this.storedLayers);
        this.selectFirstLayer();
        

    }

    exportRoom(){
        return LZString.compressToEncodedURIComponent(JSON.stringify(this.storedLayers));
    }



    private createLayerOption(layerName: string){
        let layerOption = document.createElement("div");
        layerOption.className = "layerOptionContainer";
        layerOption.addEventListener("mouseup", this.clickLayerOption.bind(this));
        let textSpan = document.createElement("span");
        textSpan.innerHTML = layerName;
        layerOption.appendChild(textSpan);

        let moveUpButton = document.createElement("button");
        moveUpButton.innerHTML = "up";
        moveUpButton.addEventListener("mouseup", this.moveLayerUp.bind(this));
        layerOption.appendChild(moveUpButton);

        let moveDownButton = document.createElement("button");
        moveDownButton.innerHTML = "down";
        moveDownButton.addEventListener("mouseup", this.moveLayerDown.bind(this));
        layerOption.appendChild(moveDownButton);

        let hideCheck = document.createElement("input");
        hideCheck.type = "checkbox"; 
        hideCheck.addEventListener("change", this.clickHideLayer.bind(this));
        layerOption.appendChild(hideCheck);

        this.containerElement.appendChild(layerOption);

        return layerOption;
    }

    private clickLayerOption(e: Event){
        let target = e.target as HTMLInputElement;
        let layerName = target.parentElement?.getElementsByTagName("span")[0].innerHTML;
        if(layerName != null){
            for(let layer of this.storedLayers){
                if(layer.layerName == layerName){
                    this.selectLayer(layer);
                    break;
                }
            }
        }
    }

    private selectLayer(selectThisLayer: layer | null = null){
        let layerOptions = document.getElementsByClassName("layerOptionContainer");
        for(let i=0; i<layerOptions.length; i++){
            let element = layerOptions[i] as HTMLElement;
            let elementLayerName = element.getElementsByTagName("span")[0].innerHTML;
            if(selectThisLayer == null && i == 0){
                element.className = "layerOptionContainer selectedLayer";
                this.selectedLayer = selectThisLayer;
            }else if(selectThisLayer != null && elementLayerName == selectThisLayer.layerName){
                element.className = "layerOptionContainer selectedLayer";
                this.selectedLayer = selectThisLayer;
            }else{
                element.className = "layerOptionContainer";
            }
        }
        
    }

    private clickHideLayer(e: Event){
        let target = e.target as HTMLInputElement;
        let layerName = target.parentElement?.getElementsByTagName("span")[0].innerHTML;
        if(target.checked && layerName != null){
            for(let l of this.storedLayers){
                if(l.layerName == layerName){
                    l.hidden = true;
                    break;
                }
            }
        }else if(target.checked == false && layerName != null){
            for(let l of this.storedLayers){
                if(l.layerName == layerName){
                    l.hidden = false;
                    break;
                }
            }
        }
    }
    
    isLayerHidden(layerName: string){
        for(let layer of this.storedLayers){
            if(layer.layerName == layerName){
                return layer.hidden;
            }
        }
        return false;
    }

    addToLayer(newObj: objectMetaData){
        if(this.selectedLayer != null){
            this.selectedLayer.metaObjectsInLayer.push(newObj)
        }
    }

    hasObjectPos(x: number, y: number){
        if(this.selectedLayer != null){
            for(let obj of this.selectedLayer?.metaObjectsInLayer){
                if(obj.x == x && obj.y == y){
                    return true;
                }
            }
        }
        return false;
    }

    getObjectAtPos(mouseTestX: number, mouseTestY: number){
        if(this.selectedLayer != null){
            for(let obj of this.selectedLayer?.metaObjectsInLayer){
                if(this.isMouseInsideObject(obj, mouseTestX, mouseTestY)){
                    return obj;
                }
            }
        }
        return null;
    }

    remomveObject(targetObject: objectMetaData | null){
        if(targetObject != null && this.selectedLayer != null){
            this.selectedLayer.metaObjectsInLayer = this.selectedLayer.metaObjectsInLayer.filter(x => x != targetObject);
        }
    }

    isMouseInsideObject(obj: objectMetaData, mouseTestX: number, mouseTestY: number){
        let width = -1;
        let height = -1;
        if(obj.tile != null){
            width = obj.tile.get(0).width;
            height = obj.tile.get(0).height;
        }else{
            width = canvasRenderer.classAndImage[obj.name].width;
            height = canvasRenderer.classAndImage[obj.name].height;
        }
        
        if(mouseTestX - this.gridXOffset >= obj.x && 
            mouseTestX - this.gridXOffset < obj.x+width &&
            mouseTestY - this.gridYOffset >= obj.y && 
            mouseTestY - this.gridYOffset < obj.y+height){
                return true;
        }
        return false;
    }

    private moveLayerUp(e: Event){
        let button = e.target as HTMLElement;
        let layerName = button.parentElement?.getElementsByTagName("span")[0].innerHTML;
        if(layerName != null){
            let targetToMoveUp = this.storedLayers.filter(x => x.layerName == layerName)[0];
            let index = targetToMoveUp.zIndex;
            let targetToMoveDown = this.storedLayers.filter(x => x.zIndex == index-1)[0];

            targetToMoveUp.zIndex = targetToMoveDown.zIndex;
            targetToMoveDown.zIndex = index;
            this.initializeLayerModule([...this.storedLayers]);
        }
        if(layerName != null){
            if(this.selectedLayer != null){
                this.selectLayer(this.selectedLayer);
            }
        }
        
    }

    private moveLayerDown(e: Event){
        let button = e.target as HTMLElement;
        let layerName = button.parentElement?.getElementsByTagName("span")[0].innerHTML;
        if(layerName != null){
            let targetToMoveDown = this.storedLayers.filter(x => x.layerName == layerName)[0];
            let index = targetToMoveDown.zIndex;
            let targetToMoveUp = this.storedLayers.filter(x => x.zIndex == index+1)[0];

            targetToMoveUp.zIndex = targetToMoveDown.zIndex;
            targetToMoveDown.zIndex = index;
            this.initializeLayerModule([...this.storedLayers]);
        }
        if(layerName != null){
            if(this.selectedLayer != null){
                this.selectLayer(this.selectedLayer);
            }
        }
    }



    initializeLayerModule(layers: layer[]){
        while(this.containerElement.firstChild){
            this.containerElement.removeChild(this.containerElement.firstChild);
        }

        layers.sort((a: layer, b: layer) => {
            return a.zIndex-b.zIndex;
        });

        let created = null;
        for(let layerName of layers){
            created = this.createLayerOption(layerName.layerName);
        }

        
    }


    selectFirstLayer(){
        console.log("selectFirstLayer");
        this.selectLayer(this.storedLayers[0]);
    }


    createNewLayer(newLayerName: string){
        let nextIndex = 0;
        this.storedLayers.forEach(layer => {
            if(layer.zIndex > nextIndex){
                nextIndex = layer.zIndex+1;
            }
        });
        let newLayer = new layer(newLayerName, nextIndex);
        this.storedLayers.push(newLayer);
        
        this.initializeLayerModule(JSON.parse(JSON.stringify(this.storedLayers)));

        this.selectLayer(newLayer);
    }

    deleteLayer(layerName: string){
        if(this.storedLayers.length <= 1){
            alert("You need to have at least one layer");
            return;
        }
        let layer = this.storedLayers.filter(l => l.layerName == layerName)[0];
        if(layer == undefined){
            alert("The layer does not exist");
        }else{
            this.initializeLayerModule(this.storedLayers.filter(l => l.layerName != layerName));
            this.selectLayer();
        }

        
    }


    



}