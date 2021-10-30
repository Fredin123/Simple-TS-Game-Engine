import { layer } from "../../../../shared/layer";
import { layerCompressor } from "./layerCompressor";
import { roomData } from "../../../../shared/roomData";
import { objectTypes } from "../../../../shared/objectTypes";
import { userObject } from "../../roomObjects/userObject";
import { geometryObject } from "../../roomObjects/geometryObject";
import { IObjectMeta } from "../../../../shared/IObjectMeta";

declare var LZString: any;
declare var window : any;


export class layerContainer{
    containerElement: HTMLElement;
    storedLayers: layer[] = [];
    currentRoom: string = "";
    selectedLayer: layer | null = null;
    ctx: CanvasRenderingContext2D|null;

    gridXOffset: number = 0;
    gridYOffset: number = 0;
    
    constructor(canvasContext: CanvasRenderingContext2D|null){
        this.ctx = canvasContext;
        this.containerElement = document.getElementById("layerContainer") as HTMLElement;
    }


    importRoom(clickedFile: string, jsonString: string){
        this.currentRoom = clickedFile;
        let arayOfData: roomData = new roomData([]);
        if(jsonString != ""){
            //console.log("jsonString: ",jsonString);
            arayOfData = JSON.parse(jsonString);

            if(arayOfData.cameraBoundsX != undefined){
                (document.getElementById("cameraBoundsX") as HTMLInputElement).value = arayOfData.cameraBoundsX!.toString();
            }else{
                (document.getElementById("cameraBoundsX") as HTMLInputElement).value = "";
            }

            if(arayOfData.cameraBoundsX != undefined){
                (document.getElementById("cameraBoundsY") as HTMLInputElement).value = arayOfData.cameraBoundsY!.toString();
            }else{
                (document.getElementById("cameraBoundsY") as HTMLInputElement).value = "";
            }

            if(arayOfData.cameraBoundsX != undefined){
                (document.getElementById("cameraBoundsWidth") as HTMLInputElement).value = arayOfData.cameraBoundsWidth!.toString();
            }else{
                (document.getElementById("cameraBoundsWidth") as HTMLInputElement).value = "";
            }

            if(arayOfData.cameraBoundsX != undefined){
                (document.getElementById("cameraBoundsHeight") as HTMLInputElement).value = arayOfData.cameraBoundsHeight!.toString();
            }else{
                (document.getElementById("cameraBoundsHeight") as HTMLInputElement).value = "";
            }
            
            if(arayOfData.backgroundColor != undefined){
                (document.getElementById("backgroundColorInput") as HTMLInputElement).value = arayOfData.backgroundColor!.toString();
            }else{
                (document.getElementById("backgroundColorInput") as HTMLInputElement).value = "0xFFFFFF";
            }
        }
        if(arayOfData.layerData.length == 0){
            arayOfData.layerData.push(new layer("Layer 1", 0));
        }
        
        this.storedLayers.length = 0;
        for(let i=0; i<arayOfData.layerData.length; i++){
            let dataLayer = arayOfData.layerData[i];
            console.log("dataLayer: ",dataLayer);
            let newLayer = new layer(dataLayer.layerName, dataLayer.zIndex);
            newLayer.hidden = dataLayer.hidden;
            if(dataLayer.settings == "undefined" || dataLayer.settings == "" || dataLayer.settings == undefined || dataLayer.settings == null){
                dataLayer.settings = "{\"scrollSpeedX\": 1, \"scrollSpeedY\": 1}";
            }
            newLayer.settings = dataLayer.settings;

            dataLayer.metaObjectsInLayer.forEach(obj => {
                if(obj.type == objectTypes.userObject){
                    if((obj as userObject).isCombinationOfTiles == false){
                        let newObj = new userObject(obj.x, obj.y, obj.name, (obj as userObject).tile);
                        newObj.inputString = obj.inputString;
                        newLayer.metaObjectsInLayer.push(newObj);
                    }
                }
            });

            if(dataLayer.geometriesInLayer != undefined){
                dataLayer.geometriesInLayer.forEach(geom => {
                    let importedGeometry = new geometryObject(geom.x, geom.y);
                    importedGeometry.geomPoints = geom.geomPoints;
                    importedGeometry.geomWidth = geom.geomWidth;
                    newLayer.metaObjectsInLayer.push(importedGeometry);
                });
            }
            

            this.storedLayers.push(newLayer);
        }
        console.log("this.storedLayers: ",this.storedLayers);


        //populate layer select element
        this.initializeLayerModule(this.storedLayers);
        this.selectFirstLayer();
        

    }

    exportRoom(){
        return LZString.compressToEncodedURIComponent(JSON.stringify(layerCompressor.compressRoom(this.currentRoom, this.storedLayers)));
    }



    private createLayerOption(layerName: string, hidden: boolean){
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
        hideCheck.checked = hidden;
        hideCheck.addEventListener("change", this.clickHideLayer.bind(this));
        layerOption.appendChild(hideCheck);


        let edit = document.createElement("button");
        edit.innerHTML = "edit";
        edit.addEventListener("mouseup", this.setLayerSettings.bind(this));
        layerOption.appendChild(edit);


        this.containerElement.appendChild(layerOption);
        

        return layerOption;
    }

    private setLayerSettings(e: Event){
        let target = e.target as HTMLInputElement;
        let layerName = target.parentElement?.getElementsByTagName("span")[0].innerHTML;

        var clickedLayer: layer | null = null;
        if(layerName != null){
            for(let layer of this.storedLayers){
                if(layer.layerName == layerName){
                    clickedLayer = layer;
                    break;
                }
            }
        }

        if(clickedLayer != null){
            var currentSettings = clickedLayer.settings;
        
            window.node.promptDefaultText("Type in the name of the layer you want to delete", currentSettings, (text: string | null) => {
                if(text != null){
                    clickedLayer!.settings = text;
                    /*var parsed = JSON.parse(text) as any;
                    let newSpeedX: number = parseFloat(parsed.scrollSpeedX);
                    let newSpeedY: number = parseFloat(parsed.scrollSpeedY);
    
                    clickedLayer!.scrollSpeedX = newSpeedX;
                    clickedLayer!.scrollSpeedY = newSpeedY;*/
                }
            });
        }
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

    addToLayer(newObj: IObjectMeta){
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

    getObjectsAtPos(mouseTestX: number, mouseTestY: number, specificType: objectTypes | null = null){
        let foundObjects: IObjectMeta[] = [];
        if(this.selectedLayer != null){
            for(let obj of this.selectedLayer?.metaObjectsInLayer){
                if(specificType == null){
                    if(obj.isMouseInside(mouseTestX, mouseTestY, this)){
                        foundObjects.push(obj);
                    }
                }else{
                    if(obj.type == specificType && obj.isMouseInside(mouseTestX, mouseTestY, this)){
                        foundObjects.push(obj);
                    }
                }
            }
        }
        return foundObjects;
    }

    getObjectsOfType(type: objectTypes){
        let returnObjs: IObjectMeta[] = [];
        if(this.selectedLayer != null){
            for(let obj of this.selectedLayer?.metaObjectsInLayer){
                if(obj.type == type){
                    returnObjs.push(obj);
                }
            }
        }
        return returnObjs;
    }

    removeObject(targetObject: IObjectMeta | null){
        if(targetObject != null && this.selectedLayer != null){
            this.selectedLayer.metaObjectsInLayer = this.selectedLayer.metaObjectsInLayer.filter(x => x != targetObject);
        }
    }


    private moveLayerUp(e: Event){
        let button = e.target as HTMLElement;
        let layerName = button.parentElement?.getElementsByTagName("span")[0].innerHTML;

        let previousName: string | undefined = undefined;
        if(layerName != undefined){
            for(let i =0; i<this.storedLayers.length; i++){
                if(this.storedLayers[i].layerName == layerName && i != 0){
                    previousName = this.storedLayers[i-1].layerName;
                }
            }
        }

        this.moveLayerDownInOrder(previousName);
        
        
    }

    private moveLayerDown(e: Event){
        let button = e.target as HTMLElement;
        let layerName = button.parentElement?.getElementsByTagName("span")[0].innerHTML;
        this.moveLayerDownInOrder(layerName);
    }


    private moveLayerDownInOrder(layerName: string | undefined){
        if(layerName != null){
            for(let l of this.storedLayers){
                if(l.layerName == layerName){

                    for(let sl of this.storedLayers){
                        if(sl.zIndex == l.zIndex+1){
                            l.zIndex=l.zIndex^sl.zIndex;
                            sl.zIndex=l.zIndex^sl.zIndex;
                            l.zIndex=l.zIndex^sl.zIndex;
                            break;
                        }
                    }

                    break;
                }
            }

            
            this.initializeLayerModule(this.storedLayers);
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
        for(let cLayer of layers){
            created = this.createLayerOption(cLayer.layerName, cLayer.hidden);
        }

        
    }


    selectFirstLayer(){
        this.selectLayer(this.storedLayers[0]);
    }


    createNewLayer(newLayerName: string){
        let nextIndex = 0;
        this.storedLayers.forEach(layer => {
            if(layer.zIndex >= nextIndex){
                nextIndex = layer.zIndex+1;
            }
        });
        let newLayer = new layer(newLayerName, nextIndex);
        newLayer.zIndex = nextIndex;
        this.storedLayers.push(newLayer);

        this.initializeLayerModule(this.storedLayers);

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
            this.storedLayers = this.storedLayers.filter(l => l.layerName != layerName);
            this.initializeLayerModule(this.storedLayers);
            this.selectLayer();
        }

        
    }


    



}