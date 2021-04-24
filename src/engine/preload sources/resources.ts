import { objectGenerator } from "../../shared/objectGenerator";
import { tileAnimation } from "../../shared/tile/tileAnimation";

export class resourcesHand{
    private static app: PIXI.Application;
    objectGen: objectGenerator = new objectGenerator();

    private static resourcesToLoad: string[] = [];
    
    private static animatedSprite: {[key: string]: Array<PIXI.Texture>} = {};
    private static staticTile: {[key: string] : PIXI.Texture} = {};

    constructor(app: PIXI.Application, onCompleteCallback: ()=>void, alternativePath: string = ""){
        resourcesHand.app = app;

        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

        fetch(alternativePath+'/resources.txt', {
            method: 'get'
        })
        .then(response => response.text())
        .then(textData => resourcesHand.loadFromResources(textData.split("\n"), onCompleteCallback, alternativePath))
        .catch(err => {
            console.log("err: "+err);
        });

        
    }

    static loadFromResources(loadedResources: string[], onCompleteCallback: ()=>void, alternativePath: string){
        resourcesHand.resourcesToLoad = loadedResources;

        loadedResources = loadedResources.filter(x => x.indexOf(".json") != -1 || (x.indexOf(".png") != -1 && loadedResources.indexOf(x.replace(".png", ".json")) == -1) );

        resourcesHand.resourcesToLoad.forEach(resourceDir => {
            let resourceDirsSplit = resourceDir.split("/");
            let resourceName = resourceDirsSplit[resourceDirsSplit.length-1];
            resourcesHand.app.loader.add(resourceName, alternativePath+"resources/"+resourceDir);
        });

        resourcesHand.app.loader.load((e: any) => {
            resourcesHand.resourcesToLoad.forEach(resource => {
                let split = resource.split("/");
                let name = split[split.length-1];
                
                if(name.indexOf(".json") != -1){
                    resourcesHand.storeAnimatedArray(name);
                }else if(split[0] == "_generated_tiles"){
                    resourcesHand.storeStaticTile(name);
                }else if(split[0] == "tiles"){
                    resourcesHand.storeStaticTile(name);
                }else if(name.indexOf(".png") != -1){
                    resourcesHand.storeStaticTile(name);
                }
            });
            
            
            onCompleteCallback();
        });
    }

    static generateAnimatedTiles(animationMeta: tileAnimation){
        if(resourcesHand.animatedSprite[animationMeta.name] == null){
            resourcesHand.animatedSprite[animationMeta.name] = [];
        }
        for(let tile of animationMeta.tiles){
            console.log("find tile.resourceName: "+tile.resourceName);
            let parts = tile.resourceName.split("/");
            console.log("in: ", resourcesHand.app.loader.resources);
            let newTex = new PIXI.Texture(resourcesHand.app.loader.resources[parts[parts.length-1]].texture.baseTexture, 
                new PIXI.Rectangle(tile.startX, tile.startY, tile.width, tile.height));
            
            resourcesHand.animatedSprite[animationMeta.name].push(newTex);
        }
    }

    static storeStaticTile(genName: string){

        var texturesTmp = resourcesHand.app.loader.resources[genName].texture;
        if(texturesTmp != null){
            resourcesHand.staticTile[genName] = texturesTmp;
        }else{
            throw new Error("Can't create static tile resource for: "+genName);
        }
        
    }


    static storeAnimatedArray(resourceName: string){
        var texturesTmp = resourcesHand.app.loader.resources[resourceName].textures;
        if(resourcesHand.app.loader.resources[resourceName].textures != null){
            for(let key in texturesTmp){
                if(texturesTmp.hasOwnProperty(key)){
                    if(resourcesHand.animatedSprite[resourceName] == null){
                        resourcesHand.animatedSprite[resourceName] = [];
                    }
                    resourcesHand.animatedSprite[resourceName].push(texturesTmp[key]);
                }
            }
        }
        //const animeFromSheet = new PIXI.AnimatedSprite(animation);
    }

    static getAnimatedSprite(name: string){
        if(name.indexOf(".") != -1){
            name = name.split(".")[0];
        }
        name += ".json";
        if(resourcesHand.animatedSprite[name] != null){
            return new PIXI.AnimatedSprite(resourcesHand.animatedSprite[name]);
        }
        console.log("Wanted to find this animated sprite: ",name);
        console.log("In this resource pool: ",resourcesHand.animatedSprite);
        return null;
    }

    static getAnimatedTile(name: string){
        if(resourcesHand.animatedSprite[name] != null){
            return new PIXI.AnimatedSprite(resourcesHand.animatedSprite[name]);
        }
        console.log("Wanted to find this animated sprite: ",name);
        console.log("In this resource pool: ",resourcesHand.animatedSprite);
        return null;
    }

    static getStaticTile(genName: string){
        return new PIXI.Sprite(resourcesHand.staticTile[genName]);
    }

    static resourcePNG(resourceName: string): PIXI.Texture{
        for(let resourceDir of resourcesHand.resourcesToLoad){
            let splitDirs = resourceDir.split("/");
            let nameAndMeta = splitDirs[splitDirs.length-1];
            if(nameAndMeta.toLocaleLowerCase().indexOf(".png") != -1){
                let nameOnly = nameAndMeta.split(".")[0];
                if(nameAndMeta == resourceName+".png"){
                    return resourcesHand.app.loader.resources[nameAndMeta].texture;
                }
            }
        }
        
        throw new Error("PNG resource does not exist: "+resourceName);
    }


    static createAnimatedSpriteFromTile(tileAnim: tileAnimation){

    }
    
}