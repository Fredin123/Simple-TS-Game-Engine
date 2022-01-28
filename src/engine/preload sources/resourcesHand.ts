import { tileAnimation } from "../../shared/tile/tileAnimation";
import { calculations } from "../calculations";
import * as PIXI from 'pixi.js';
import * as FontFaceObserver from 'fontfaceobserver';

declare var Howl: any;

export class resourcesHand{
    private static app: PIXI.Application;

    private static resourcesToLoad: string[] = [];
    
    private static animatedSprite: {[key: string]: Array<PIXI.Texture>} = {};
    private static staticTile: {[key: string] : PIXI.Texture} = {};
    
    private static audio: {[key: string] : any} = {};
    
    private static resourceDir = "assets/resources/";

    constructor(app: PIXI.Application, onCompleteCallback: ()=>void, alternativePath: string = ""){
        resourcesHand.app = app;
        //webfontloader.load

        try{
            let font = new FontFaceObserver.default('CrimsonPro-Black');
 
            font.load().then(function () {
                resourcesHand.initResources(onCompleteCallback, alternativePath);
            });
        }catch(err){
            resourcesHand.initResources(onCompleteCallback, alternativePath);
        }
        

        

        
    }

    private static initResources(onCompleteCallback: ()=>void, alternativePath: string){
        console.log('smallburg-Regular has loaded');
            fetch(alternativePath+'/assets/resources.txt', {
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

        let audioToLoad = loadedResources.filter(x => x.indexOf(".wav") != -1 || x.indexOf(".ogg") != -1);
        resourcesHand.loadAudio(audioToLoad);


        loadedResources = loadedResources.filter(x => x.indexOf(".mp4") != -1 || x.indexOf(".json") != -1 || (x.indexOf(".png") != -1 && loadedResources.indexOf(x.replace(".png", ".json")) == -1) );

        resourcesHand.resourcesToLoad.forEach(resourceDir => {
            let resourceDirsSplit = resourceDir.split("/");
            let resourceName = resourceDirsSplit[resourceDirsSplit.length-1];
            console.log("Add resource ", resourceDir);
            resourcesHand.app.loader.add(resourceName, alternativePath+resourcesHand.resourceDir+resourceDir);
        });

        resourcesHand.app.loader.load((e: any) => {
            resourcesHand.resourcesToLoad.forEach(resource => {
                let split = resource.split("/");
                let name = split[split.length-1];
                //console.log("load resource: ", resource);
                if(name.indexOf(".json") != -1){
                    resourcesHand.storeAnimatedArray(name);
                }else if(split[0] == "_generated_tiles"){
                    resourcesHand.storeStaticTile(name);
                }else if(split[0] == "tiles"){
                    resourcesHand.storeStaticTile(name);
                }else if(name.indexOf(".png") != -1){
                    //console.log("Load resource: ",name);
                    resourcesHand.storeStaticTile(name);
                }else if(name.indexOf(".mp4") != -1){
                    resourcesHand.storeVideoAsAnimatedTexture(resourcesHand.resourceDir+resource, name);
                }
            });
            
            
            onCompleteCallback();
        });
    }


    static loadAudio(audioFiles: string[]){
        for(let audioToLoad of audioFiles){
            let dirParts = audioToLoad.split("/");

            resourcesHand.audio[dirParts[dirParts.length-1]] = new Howl({
                src: [resourcesHand.resourceDir+audioToLoad]
            });
        }
    }

    static playAudio(name: string){
        resourcesHand.audio[name].play();
    }

    static playAudioVolume(name: string, volume: number){
        resourcesHand.audio[name].volume(volume);
        resourcesHand.audio[name].play();
    }

    static playRandomAudio(names: string[]){
        resourcesHand.audio[names[calculations.getRandomInt(0, names.length-1)]].play();
    }

    static generateAnimatedTiles(animationMeta: tileAnimation){
        if(resourcesHand.animatedSprite[animationMeta.name] == null){
            resourcesHand.animatedSprite[animationMeta.name] = [];
        }
        for(let tile of animationMeta.tiles){
            let parts = tile.resourceName.split("/");
            
            let newTex = new PIXI.Texture(resourcesHand.app.loader.resources[parts[parts.length-1]].texture!.baseTexture, 
                new PIXI.Rectangle(tile.startX, tile.startY, tile.width, tile.height));
            
            resourcesHand.animatedSprite[animationMeta.name].push(newTex);
        }
    }

    static storeStaticTile(genName: string){
        console.log("Try to store static tile: ",genName);
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

    static storeVideoAsAnimatedTexture(resourcelocation: string, resourceName: string){
        /*const texture = PIXI.Texture.from(resourcelocation);

        var textVid = new PIXI.AnimatedSprite(texture);


        if(resourcesHand.animatedSprite[resourceName] == null){
            resourcesHand.animatedSprite[resourceName] = [];
        }
        resourcesHand.animatedSprite[resourceName].push(textVid);*/

        console.log("After adding video texture: ", resourcesHand.animatedSprite[resourceName]);
    }

    static getAnimatedSprite(name: string){
        if(name.indexOf(".mp4") == -1){
            if(name.indexOf(".") != -1){
                name = name.split(".")[0];
            }
            name += ".json";
        }
        
        if(resourcesHand.animatedSprite[name] != null){
            return new PIXI.AnimatedSprite(resourcesHand.animatedSprite[name]);
        }
        //console.log("Wanted to find this animated sprite: ",name);
        //console.log("In this resource pool: ",resourcesHand.animatedSprite);
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
        if(genName.indexOf(".png") == -1){
            genName += ".png";
        }
        if(resourcesHand.staticTile[genName] == null){
            console.log("Tried to fetch static tile: ",genName," but it was not found");
            console.log("static tiles: ",resourcesHand.staticTile);
        }
        return new PIXI.Sprite(resourcesHand.staticTile[genName]);
    }

    /*static resourcePNG(resourceName: string): PIXI.Texture | undefined{
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
    }*/

    static convertGraphicsToTexture(graphics: PIXI.Graphics){
        var texture = this.app.renderer.generateTexture(graphics);
        return texture;
    }
    
}