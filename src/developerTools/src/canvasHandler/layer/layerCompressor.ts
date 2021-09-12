import { uidGen } from "../../../../engine/tools/uidGen";
import { objectMetaData } from "../../objectMetaData";
import { subTileMeta } from "../../../../shared/tile/subTileMeta";
import { tileAnimation } from "../../../../shared/tile/tileAnimation";
import { tileSelector } from "../../tiles/tileSelector";
import { layer } from "../../../../shared/layer";
import { roomData } from "../../../../shared/roomData";
import { resourcesTiles } from "../../tiles/resourcesTiles";

declare var window: any;

export class layerCompressor{

    static compressRoom(roomName: string, layerData:layer[]){
        window.node.clearPreviouslyGeneratedImages(roomName);
        let compressed: layer[] = []; 

        //Loop through each layer and compress
        layerData.forEach(l => {
            let compressedLayer = layerCompressor.compressLayer(l, roomName);
            compressed.push(compressedLayer);
        });

        let compressedRoom = new roomData(compressed);

        compressedRoom.cameraBoundsX = parseInt((document.getElementById("cameraBoundsX") as HTMLInputElement).value);
        compressedRoom.cameraBoundsY = parseInt((document.getElementById("cameraBoundsY") as HTMLInputElement).value);
        compressedRoom.cameraBoundsWidth = parseInt((document.getElementById("cameraBoundsWidth") as HTMLInputElement).value);
        compressedRoom.cameraBoundsHeight = parseInt((document.getElementById("cameraBoundsHeight") as HTMLInputElement).value);
        compressedRoom.backgroundColor = (document.getElementById("backgroundColorInput") as HTMLInputElement).value;

        console.log("Exported room: ",compressedRoom);
        return compressedRoom;
    }


    private static compressLayer(l: layer, roomName: string){
        //remove old combined tiles
        window.node.removeOldCompiledTiles(roomName);

        //get each static tile from the layer
        let compressedLayer: layer = new layer(l.layerName, l.zIndex);
        compressedLayer.hidden = l.hidden;
        compressedLayer.settings = l.settings;

        for(var d of l.metaObjectsInLayer){
            if(d.tile != null){
                d.isPartOfCombination = false;
            }
        }

        let staticTiles = l.metaObjectsInLayer.filter(t => t.tile != null && t.tile.tiles.length == 1);
        if(staticTiles.length > 0){
            let combinedStaticTiles = layerCompressor.combineStaticTilesIntoOne(staticTiles, roomName);
    
            compressedLayer.metaObjectsInLayer.push(combinedStaticTiles);
    
            //Mark static tiles that were combined
            for(let t of staticTiles){
                t.isPartOfCombination = true;
            }

            staticTiles.forEach(tile => {
                tile.idOfStaticTileCombination = combinedStaticTiles.name;
                compressedLayer.metaObjectsInLayer.push(tile);
            });
        }
        
        let nonStaticTiles = l.metaObjectsInLayer.filter(t => t.tile != null && t.tile.tiles.length > 1);
        for(let t of nonStaticTiles){
            compressedLayer.metaObjectsInLayer.push(t);
        }

        //add rest of the objects to the layer
        l.metaObjectsInLayer.forEach(obj => {
            if(obj.tile == null){
                compressedLayer.metaObjectsInLayer.push(obj);             
            }
        });

        return compressedLayer;
    }

    private static combineStaticTilesIntoOne(staticTiles: objectMetaData[], roomName: string) : objectMetaData{
        let canvas = document.createElement("canvas");
        let ctx = canvas.getContext("2d");
        let width = 0;
        let height = 0;

        let xStart: number | null = null;
        let yStart: number | null = null;

        //Resize the canvas to fit all tiles
        staticTiles.forEach(obj => {
            if(xStart == null || obj.x < xStart){
                xStart = obj.x;
            }
            if(yStart == null || obj.y < yStart){
                yStart = obj.y;
            }
        });


        staticTiles.forEach(obj => {
            if((obj.x + obj.tile!.tiles[0].width) - xStart! > width){
                width = (obj.x + obj.tile!.tiles[0].width) - xStart!;
            }
            if((obj.y + obj.tile!.tiles[0].height) - yStart! > height){
                height = (obj.y + obj.tile!.tiles[0].height) - yStart!;
            }
        });

        canvas.width = width;
        canvas.height = height;
        canvas.style.width = width+"px";
        canvas.style.height = height+"px";

        //Render tiles
        staticTiles.forEach(tile => {
            let tileDraw = tile.tile!.tiles[0];
            let image = resourcesTiles.resourceNameAndImage[tileDraw.resourceName];
            console.log(image.src);
            if(image == null){
                console.log("tile: ", tile);
                console.log("Image is null ", image);
            }
            ctx?.drawImage(image, 
                tileDraw.startX, 
                tileDraw.startY, 
                tileDraw.width, 
                tileDraw.height,
                tile.x - xStart!, 
                tile.y - yStart!,  
                tileDraw.width, 
                tileDraw.height);

        });
        
        let generatedName = uidGen.new()+".png";
        canvas.toBlob(function(blob) {
            if(blob != null){
                console.log(blob);
                blob.arrayBuffer().then(buffer => 
                    window.node.saveCompiledTiles(roomName, generatedName, buffer)
                );
            }else{
                console.log("Blob is null, staticTiles: ",staticTiles);
            }
            
            
        });

        let newTile = new subTileMeta(generatedName, xStart!, yStart!, width, height);
        let combinedTiles = new tileAnimation([newTile]);

        let compressetMeta = new objectMetaData(xStart!, yStart!, generatedName, combinedTiles);
        compressetMeta.isCombinationOfTiles = true;

        return compressetMeta;
    }
}