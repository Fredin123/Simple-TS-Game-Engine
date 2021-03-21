import { objectGenerator } from "../../objectGenerator";

export class resources{
    private static app: PIXI.Application;
    objectGen: objectGenerator = new objectGenerator();

    private static resourcesToLoad: string[] = [];
    
    private static animatedSprite: {[key: string]: Array<PIXI.Texture>} = {};

    constructor(app: PIXI.Application, onCompleteCallback: ()=>void, alternativePath: string = ""){
        resources.app = app;

        fetch(alternativePath+'/resources.txt', {
            method: 'get'
        })
        .then(response => response.text())
        .then(textData => resources.loadFromResources(textData.split("\n"), onCompleteCallback, alternativePath))
        .catch(err => {
            console.log(err);
        });

        
    }

    static loadFromResources(loadedResources: string[], onCompleteCallback: ()=>void, alternativePath: string){
        for(var resource of loadedResources){
            //resource = alternativePath += resource;
            console.log(resource);
        }
        resources.resourcesToLoad = loadedResources;

        resources.resourcesToLoad.forEach(resourceDir => {
            let resourceDirsSplit = resourceDir.split("/");
            let resourceName = resourceDirsSplit[resourceDirsSplit.length-1];
            resources.app.loader.add(resourceName, alternativePath+"resources/"+resourceDir);
        });

        resources.app.loader.load((e: any) => {
            resources.resourcesToLoad.forEach(resource => {
                let split = resource.split("/");
                let name = split[split.length-1];
                if(name.indexOf(".json") != -1){
                    resources.storeAnimatedArray(name);
                }
            });
            
            
            onCompleteCallback();
        });
    }

    static storeAnimatedArray(resourceName: string){
        let animation:Array<PIXI.Texture> = [];
        var texturesTmp = resources.app.loader.resources[resourceName].textures;
        if(resources.app.loader.resources[resourceName].textures != null){
            for(let key in texturesTmp){
                if(texturesTmp.hasOwnProperty(key)){
                    if(resources.animatedSprite[resourceName] == null){
                        resources.animatedSprite[resourceName] = [];
                    }
                    resources.animatedSprite[resourceName].push(texturesTmp[key]);
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
        console.log("Name: ",name);
        if(resources.animatedSprite[name] != null){
            return new PIXI.AnimatedSprite(resources.animatedSprite[name]);
        }
        return null;
    }

    static resourcePNG(resourceName: string): PIXI.Texture{
        for(let resourceDir of resources.resourcesToLoad){
            let splitDirs = resourceDir.split("/");
            let nameAndMeta = splitDirs[splitDirs.length-1];
            if(nameAndMeta.toLocaleLowerCase().indexOf(".png") != -1){
                let nameOnly = nameAndMeta.split(".")[0];
                if(nameAndMeta == resourceName+".png"){
                    return resources.app.loader.resources[nameAndMeta].texture;
                }
            }
        }
        
        throw new Error("PNG resource does not exist: "+resourceName);
    }


    
}