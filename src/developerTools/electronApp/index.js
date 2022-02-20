(function (PIXI, socket_ioClient) {
    'use strict';

    var calculations = /** @class */ (function () {
        function calculations() {
        }
        calculations.degreesToRadians = function (degrees) {
            return degrees * (calculations.PI / 180);
        };
        calculations.radiansToDegrees = function (radians) {
            return radians * (180 / calculations.PI);
        };
        calculations.roundToNDecimals = function (value, nDecimal) {
            return Math.round((value) * Math.pow(10, nDecimal)) / Math.pow(10, nDecimal);
        };
        calculations.getShortestDeltaBetweenTwoRadians = function (rad1, rad2) {
            rad1 *= 180 / calculations.PI;
            rad2 *= 180 / calculations.PI;
            this.raw_diff = rad1 > rad2 ? rad1 - rad2 : rad2 - rad1;
            this.mod_diff = this.raw_diff % 360;
            return this.mod_diff > 180.0 ? 360.0 - this.mod_diff : this.mod_diff; //Distance
        };
        calculations.flippedSin = function (delta) {
            return Math.sin(delta + calculations.PI /*We need to flip sin since our coordinate system Y goes from 0 to positive numbers when you do down*/);
        };
        calculations.getRandomInt = function (min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };
        calculations.angleBetweenPoints = function (dx, dy) {
            return Math.atan2(dy, dx) + Math.PI;
        };
        calculations.distanceBetweenPoints = function (x1, y1, x2, y2) {
            return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
        };
        calculations.PI = 3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679;
        calculations.EPSILON = 8.8541878128;
        calculations.raw_diff = 0;
        calculations.mod_diff = 0;
        return calculations;
    }());

    var resourcesHand = /** @class */ (function () {
        function resourcesHand(app, onCompleteCallback, alternativePath) {
            if (alternativePath === void 0) { alternativePath = ""; }
            resourcesHand.app = app;
            //webfontloader.load
            /*try{
                let font = new FontFaceObserver.default('CrimsonPro-Black');
     
                font.load().then(function () {
                    resourcesHand.initResources(onCompleteCallback, alternativePath);
                });
            }catch(err){
                resourcesHand.initResources(onCompleteCallback, alternativePath);
            }*/
            resourcesHand.initResources(onCompleteCallback, alternativePath);
        }
        resourcesHand.initResources = function (onCompleteCallback, alternativePath) {
            console.log('smallburg-Regular has loaded');
            fetch(alternativePath + '/assets/resources.txt', {
                method: 'get'
            })
                .then(function (response) { return response.text(); })
                .then(function (textData) { return resourcesHand.loadFromResources(textData.split("\n"), onCompleteCallback, alternativePath); })
                .catch(function (err) {
                console.log("err: " + err);
            });
        };
        resourcesHand.loadFromResources = function (loadedResources, onCompleteCallback, alternativePath) {
            resourcesHand.resourcesToLoad = loadedResources;
            var audioToLoad = loadedResources.filter(function (x) { return x.indexOf(".wav") != -1 || x.indexOf(".ogg") != -1; });
            resourcesHand.loadAudio(audioToLoad);
            loadedResources = loadedResources.filter(function (x) { return x.indexOf(".mp4") != -1 || x.indexOf(".json") != -1 || (x.indexOf(".png") != -1 && loadedResources.indexOf(x.replace(".png", ".json")) == -1); });
            resourcesHand.resourcesToLoad.forEach(function (resourceDir) {
                var resourceDirsSplit = resourceDir.split("/");
                var resourceName = resourceDirsSplit[resourceDirsSplit.length - 1];
                console.log("Add resource ", resourceDir);
                resourcesHand.app.loader.add(resourceName, alternativePath + resourcesHand.resourceDir + resourceDir);
            });
            resourcesHand.app.loader.load(function (e) {
                resourcesHand.resourcesToLoad.forEach(function (resource) {
                    var split = resource.split("/");
                    var name = split[split.length - 1];
                    //console.log("load resource: ", resource);
                    if (name.indexOf(".json") != -1) {
                        resourcesHand.storeAnimatedArray(name);
                    }
                    else if (split[0] == "_generated_tiles") {
                        resourcesHand.storeStaticTile(name);
                    }
                    else if (split[0] == "tiles") {
                        resourcesHand.storeStaticTile(name);
                    }
                    else if (name.indexOf(".png") != -1) {
                        //console.log("Load resource: ",name);
                        resourcesHand.storeStaticTile(name);
                    }
                    else if (name.indexOf(".mp4") != -1) {
                        resourcesHand.storeVideoAsAnimatedTexture(resourcesHand.resourceDir + resource, name);
                    }
                });
                onCompleteCallback();
            });
        };
        resourcesHand.loadAudio = function (audioFiles) {
            for (var _i = 0, audioFiles_1 = audioFiles; _i < audioFiles_1.length; _i++) {
                var audioToLoad = audioFiles_1[_i];
                var dirParts = audioToLoad.split("/");
                resourcesHand.audio[dirParts[dirParts.length - 1]] = new Howl({
                    src: [resourcesHand.resourceDir + audioToLoad]
                });
            }
        };
        resourcesHand.playAudio = function (name) {
            resourcesHand.audio[name].play();
        };
        resourcesHand.playAudioVolume = function (name, volume) {
            resourcesHand.audio[name].volume(volume);
            resourcesHand.audio[name].play();
        };
        resourcesHand.playRandomAudio = function (names) {
            resourcesHand.audio[names[calculations.getRandomInt(0, names.length - 1)]].play();
        };
        resourcesHand.generateAnimatedTiles = function (animationMeta) {
            if (resourcesHand.animatedSprite[animationMeta.name] == null) {
                resourcesHand.animatedSprite[animationMeta.name] = [];
            }
            for (var _i = 0, _a = animationMeta.tiles; _i < _a.length; _i++) {
                var tile = _a[_i];
                var parts = tile.resourceName.split("/");
                var newTex = new PIXI.Texture(resourcesHand.app.loader.resources[parts[parts.length - 1]].texture.baseTexture, new PIXI.Rectangle(tile.startX, tile.startY, tile.width, tile.height));
                resourcesHand.animatedSprite[animationMeta.name].push(newTex);
            }
        };
        resourcesHand.storeStaticTile = function (genName) {
            console.log("Try to store static tile: ", genName);
            var texturesTmp = resourcesHand.app.loader.resources[genName].texture;
            if (texturesTmp != null) {
                resourcesHand.staticTile[genName] = texturesTmp;
            }
            else {
                throw new Error("Can't create static tile resource for: " + genName);
            }
        };
        resourcesHand.storeAnimatedArray = function (resourceName) {
            var texturesTmp = resourcesHand.app.loader.resources[resourceName].textures;
            if (resourcesHand.app.loader.resources[resourceName].textures != null) {
                for (var key in texturesTmp) {
                    if (texturesTmp.hasOwnProperty(key)) {
                        if (resourcesHand.animatedSprite[resourceName] == null) {
                            resourcesHand.animatedSprite[resourceName] = [];
                        }
                        resourcesHand.animatedSprite[resourceName].push(texturesTmp[key]);
                    }
                }
            }
            //const animeFromSheet = new PIXI.AnimatedSprite(animation);
        };
        resourcesHand.storeVideoAsAnimatedTexture = function (resourcelocation, resourceName) {
            /*const texture = PIXI.Texture.from(resourcelocation);

            var textVid = new PIXI.AnimatedSprite(texture);


            if(resourcesHand.animatedSprite[resourceName] == null){
                resourcesHand.animatedSprite[resourceName] = [];
            }
            resourcesHand.animatedSprite[resourceName].push(textVid);*/
            console.log("After adding video texture: ", resourcesHand.animatedSprite[resourceName]);
        };
        resourcesHand.getAnimatedSprite = function (name) {
            if (name.indexOf(".mp4") == -1) {
                if (name.indexOf(".") != -1) {
                    name = name.split(".")[0];
                }
                name += ".json";
            }
            if (resourcesHand.animatedSprite[name] != null) {
                return new PIXI.AnimatedSprite(resourcesHand.animatedSprite[name]);
            }
            //console.log("Wanted to find this animated sprite: ",name);
            //console.log("In this resource pool: ",resourcesHand.animatedSprite);
            return null;
        };
        resourcesHand.getAnimatedTile = function (name) {
            if (resourcesHand.animatedSprite[name] != null) {
                return new PIXI.AnimatedSprite(resourcesHand.animatedSprite[name]);
            }
            console.log("Wanted to find this animated sprite: ", name);
            console.log("In this resource pool: ", resourcesHand.animatedSprite);
            return null;
        };
        resourcesHand.getStaticTile = function (genName) {
            if (genName.indexOf(".png") == -1) {
                genName += ".png";
            }
            if (resourcesHand.staticTile[genName] == null) {
                console.log("Tried to fetch static tile: ", genName, " but it was not found");
                console.log("static tiles: ", resourcesHand.staticTile);
            }
            return new PIXI.Sprite(resourcesHand.staticTile[genName]);
        };
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
        resourcesHand.convertGraphicsToTexture = function (graphics) {
            var texture = this.app.renderer.generateTexture(graphics);
            return texture;
        };
        resourcesHand.resourcesToLoad = [];
        resourcesHand.animatedSprite = {};
        resourcesHand.staticTile = {};
        resourcesHand.audio = {};
        resourcesHand.resourceDir = "assets/resources/";
        return resourcesHand;
    }());

    var cursorType;
    (function (cursorType) {
        cursorType[cursorType["pensil"] = 0] = "pensil";
        cursorType[cursorType["eraser"] = 1] = "eraser";
        cursorType[cursorType["grabber"] = 2] = "grabber";
        cursorType[cursorType["editor"] = 3] = "editor";
        cursorType[cursorType["geometry"] = 4] = "geometry";
        cursorType[cursorType["geometryEdit"] = 5] = "geometryEdit";
        cursorType[cursorType["geometryRemove"] = 6] = "geometryRemove";
    })(cursorType || (cursorType = {}));

    var cursorData = /** @class */ (function () {
        function cursorData() {
            this.objectSelected = null;
            this.currentSubTile = null;
            var buttonsContainer = document.getElementById("idCursorTypeContainer");
            var enumKeys = Object.keys(cursorType);
            for (var _i = 0, enumKeys_1 = enumKeys; _i < enumKeys_1.length; _i++) {
                var enumKey = enumKeys_1[_i];
                var typeButton = document.createElement("button");
                typeButton.className = "cursorButton";
                if (cursorType[enumKey] == cursorData.cursorType) {
                    typeButton.className = "cursorButtonSelected";
                }
                typeButton.innerHTML = enumKey;
                typeButton.addEventListener("mouseup", function (e) {
                    var allButtons = document.getElementsByClassName("cursorButtonSelected");
                    for (var i = 0; i < allButtons.length; i++) {
                        allButtons[i].className = "cursorButton";
                    }
                    var target = e.target;
                    var key = target.innerHTML;
                    target.className = "cursorButtonSelected";
                    cursorData.cursorType = cursorType[key];
                });
                buttonsContainer === null || buttonsContainer === void 0 ? void 0 : buttonsContainer.appendChild(typeButton);
            }
        }
        cursorData.cursorType = cursorType.pensil;
        return cursorData;
    }());

    var tools = /** @class */ (function () {
        function tools() {
        }
        /*download(filename: string, text:string) {
            var element = document.createElement('a');
            console.log(text)
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + text);
            element.setAttribute('download', filename);
          
            element.style.display = 'none';
            document.body.appendChild(element);
          
            element.click();
          
            document.body.removeChild(element);
        }*/
        tools.download = function (filename, text, type) {
            if (type === void 0) { type = "text/plain"; }
            // Create an invisible A element
            var a = document.createElement("a");
            a.style.display = "none";
            document.body.appendChild(a);
            // Set the HREF to a Blob representation of the data to be downloaded
            a.href = window.URL.createObjectURL(new Blob([text], { type: type }));
            // Use download attribute to set set desired file name
            a.setAttribute("download", filename);
            // Trigger the download by simulating click
            a.click();
            // Cleanup
            window.URL.revokeObjectURL(a.href);
            document.body.removeChild(a);
        };
        tools.upload = function (callback) {
            var _this = this;
            var element = document.createElement("input");
            element.type = "file";
            element.style.display = "none";
            document.body.appendChild(element);
            element.onchange = function (e) {
                _this.uploadOnChange(e, callback);
            };
            element.click();
        };
        tools.getClassNameFromConstructorName = function (constructorName) {
            var funcNameOnly = constructorName.replace("function ", "");
            var paramsStartIndex = funcNameOnly.indexOf("(");
            funcNameOnly = funcNameOnly.substring(0, paramsStartIndex);
            return funcNameOnly;
        };
        tools.functionName = function (func) {
            console.log(func.toString());
            var result = /^function\s+([\w\$]+)\s*\(/.exec(func.toString());
            return result ? result[1] : ''; // for an anonymous function there won't be a match
        };
        tools.uploadOnChange = function (e, callback) {
            var ev = e;
            console.log(ev.target.files);
            var reader = new FileReader();
            reader.readAsText(ev.target.files[0], "UTF-8");
            reader.onload = function (evt) {
                var _a, _b;
                var t = (_b = (_a = evt.target) === null || _a === void 0 ? void 0 : _a.result) === null || _b === void 0 ? void 0 : _b.toString();
                callback(LZString.decompressFromEncodedURIComponent(t));
            };
            reader.onerror = function (evt) {
                alert("Could not read file");
            };
        };
        return tools;
    }());

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    /* global Reflect, Promise */
    var extendStatics = function (d, b) {
      extendStatics = Object.setPrototypeOf || {
        __proto__: []
      } instanceof Array && function (d, b) {
        d.__proto__ = b;
      } || function (d, b) {
        for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
      };

      return extendStatics(d, b);
    };

    function __extends(d, b) {
      if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);

      function __() {
        this.constructor = d;
      }

      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var vector = /** @class */ (function () {
        function vector(a, b) {
            this.IM_mag = 0;
            this.Dx = a;
            this.Dy = b;
        }
        Object.defineProperty(vector.prototype, "delta", {
            get: function () {
                if (this.Dy == 0 && this.Dx != 0) {
                    if (this.Dx > 0)
                        return 0;
                    if (this.Dx < 0)
                        return calculations.PI;
                }
                else if (this.Dx == 0 && this.Dy != 0) {
                    if (this.Dy > 0)
                        return calculations.PI / 2;
                    if (this.Dy < 0)
                        return calculations.PI + (calculations.PI / 2);
                }
                return Math.atan(this.Dy / this.Dx);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(vector.prototype, "magnitude", {
            get: function () {
                return Math.sqrt(Math.pow(this.Dx, 2) + Math.pow(this.Dy, 2));
            },
            set: function (val) {
                this.Dx = Math.cos(this.delta) * val;
                this.Dy = Math.sin(this.delta) * val;
            },
            enumerable: false,
            configurable: true
        });
        vector.prototype.increaseMagnitude = function (addValue) {
            this.IM_mag = this.magnitude;
            this.Dx = this.Dx * (this.IM_mag + addValue) / this.IM_mag;
            this.Dy = this.Dy * (this.IM_mag + addValue) / this.IM_mag;
        };
        vector.prototype.limitHorizontalMagnitude = function (limit) {
            if (Math.abs(this.Dx) > limit) {
                if (this.Dx > 0) {
                    this.Dx = limit;
                }
                else {
                    this.Dx = -limit;
                }
            }
        };
        vector.prototype.limitVerticalMagnitude = function (limit) {
            if (Math.abs(this.Dy) > limit) {
                if (this.Dy > 0) {
                    this.Dy = limit;
                }
                else {
                    this.Dy = -limit;
                }
            }
        };
        return vector;
    }());

    var boxCollider = /** @class */ (function () {
        function boxCollider(xPos, yPos, width, height) {
            this.x = xPos;
            this.y = yPos;
            this.width = width;
            this.height = height;
        }
        boxCollider.copy = function (copyTarget) {
            return new boxCollider(copyTarget.x, copyTarget.y, copyTarget.width, copyTarget.height);
        };
        boxCollider.prototype.expandTop = function (value) {
            this.y -= value;
            this.height += value;
        };
        boxCollider.prototype.expandBottom = function (value) {
            this.height += value;
        };
        boxCollider.prototype.expandLeftSide = function (value) {
            this.x -= value;
            this.width += value;
        };
        boxCollider.prototype.expandRightSide = function (value) {
            this.width += value;
        };
        boxCollider.prototype.shrink = function (amountX, amountY) {
            this.x += amountX;
            this.y += amountY;
            this.width -= 2 * amountX;
            this.height -= 2 * amountY;
        };
        boxCollider.prototype.expand = function (aamountX, amountY) {
            this.x -= aamountX;
            this.y -= amountY;
            this.width += 2 * aamountX;
            this.height += 2 * amountY;
        };
        return boxCollider;
    }());

    var uidGen = /** @class */ (function () {
        function uidGen() {
        }
        uidGen.new = function () {
            var tempId = "";
            while (true) {
                tempId = uidGen.uuidv4();
                if (uidGen.generatedIds.indexOf(tempId) == -1) {
                    uidGen.generatedIds.push(tempId);
                    return tempId;
                }
            }
        };
        uidGen.uuidv4 = function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        };
        uidGen.generatedIds = [];
        return uidGen;
    }());

    var internalFunction = /** @class */ (function () {
        function internalFunction() {
        }
        internalFunction.intersecting = function (initiator, initiadorCollisionBox, collisionTarget) {
            this.x1 = initiator.g.x + initiadorCollisionBox.x;
            this.y1 = initiator.g.y + initiadorCollisionBox.y;
            this.x2 = collisionTarget.g.x + collisionTarget.collisionBox.x;
            this.y2 = collisionTarget.g.y + collisionTarget.collisionBox.y;
            return (this.x1 < this.x2 + collisionTarget.collisionBox.width &&
                this.x1 + initiadorCollisionBox.width > this.x2 &&
                this.y1 < this.y2 + collisionTarget.collisionBox.height &&
                this.y1 + initiadorCollisionBox.height > this.y2);
        };
        internalFunction.x1 = 0;
        internalFunction.y1 = 0;
        internalFunction.x2 = 0;
        internalFunction.y2 = 0;
        return internalFunction;
    }());

    var nulliObject = /** @class */ (function () {
        function nulliObject(xp, yp) {
            this.isTile = false;
            this.tileStepTime = -1;
            this.friction = 0;
            this.airFriction = 0;
            this.stickyBottom = false;
            this.stickyTop = false;
            this.stickyLeftSide = false;
            this.stickyRightSide = false;
            this.gravity = new vector(0, 0);
            this.weight = 0;
            this.ID = "";
            this.g = new PIXI.Graphics();
            this._collisionBox = new boxCollider(0, 0, 0, 0);
            this._objectName = "nulliObject";
            this.collisionTargets = [];
            this.moveCollisionTargets = [];
            this.force = new vector(0, 0);
            this.exportedString = "";
            this._hasBeenMoved_Tick = 0;
            this._collidingWithPolygonTick = 0;
            this._targetLayerForPolygonCollision = "";
            this.sameLayerCollisionOnly = false;
            this.collidesWithPolygonGeometry = false;
            this.layerIndex = 0;
            this.outputString = "";
            this.horizontalCollision = 0;
            this.verticalCollision = 0;
            this._hasCollidedWithPolygon = false;
            this.objectName = "";
            this.collisionBox = new boxCollider(0, 0, 0, 0);
        }
        nulliObject.prototype.changeLayer = function (roomEvents, newLayerName) {
        };
        nulliObject.prototype.preLogicMovement = function (l) {
        };
        nulliObject.prototype.afterInit = function (roomEvents) {
        };
        nulliObject.prototype.init = function (roomEvents) {
        };
        nulliObject.prototype.addMoveCollisionTarget = function () {
            var collNames = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                collNames[_i] = arguments[_i];
            }
        };
        nulliObject.prototype.setNewForceAngleMagnitude = function (a, b) {
        };
        nulliObject.prototype.addCollisionTarget = function () {
            var collNames = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                collNames[_i] = arguments[_i];
            }
        };
        nulliObject.prototype.removeCollisionTarget = function () {
            var collNames = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                collNames[_i] = arguments[_i];
            }
        };
        nulliObject.prototype.removeAllCollisionTargets = function () {
        };
        nulliObject.prototype.style = function (newGraphics) {
        };
        nulliObject.prototype.setCollision = function (xs, ys, width, height) {
        };
        nulliObject.prototype.updatePosition = function (x, y) {
        };
        nulliObject.prototype.setNewForce = function (angle, magnitude) {
        };
        nulliObject.prototype.logic = function (l) {
        };
        nulliObject.prototype.addForce = function (xd, yd) {
        };
        nulliObject.prototype.addForceAngleMagnitude = function (angle, magnitude) {
        };
        nulliObject.objectName = "nulliObject";
        return nulliObject;
    }());

    var objectGlobalData = /** @class */ (function () {
        function objectGlobalData() {
        }
        objectGlobalData.null = new nulliObject(0, 0);
        objectGlobalData.objectsThatCollideWith = {};
        objectGlobalData.objectsThatMoveWith = {};
        return objectGlobalData;
    }());

    var ticker = /** @class */ (function () {
        function ticker() {
        }
        ticker.tick = function () {
            if (this.ticks >= Number.MAX_VALUE) {
                this.ticks = 0;
            }
            this.ticks++;
        };
        ticker.getTicks = function () {
            return this.ticks;
        };
        ticker.ticks = 0;
        ticker.shortWindow = 4;
        return ticker;
    }());

    var moveOperationsPush = /** @class */ (function () {
        function moveOperationsPush() {
        }
        moveOperationsPush.pushObjectHorizontal = function (pusher, objectBeingPushed, sign, objContainer) {
            var _this = this;
            this.collided = false;
            if (internalFunction.intersecting(pusher, pusher.collisionBox, objectBeingPushed)) {
                if (objectBeingPushed.collisionTargets.length == 0) {
                    return pusher;
                }
                objectBeingPushed.g.x += sign;
                objContainer.loopThroughObjectsUntilCondition(objectBeingPushed.collisionTargets, function (testCollision) {
                    if (testCollision.objectName != pusher.objectName &&
                        (objectBeingPushed.sameLayerCollisionOnly == false || (objectBeingPushed.sameLayerCollisionOnly == true && objectBeingPushed.layerIndex == testCollision.layerIndex)) &&
                        internalFunction.intersecting(objectBeingPushed, objectBeingPushed.collisionBox, testCollision)
                        && _this.pushObjectHorizontal(objectBeingPushed, testCollision, sign, objContainer) != objectGlobalData.null) {
                        objectBeingPushed.g.x += sign * -1;
                        _this.collided = true;
                    }
                    return false;
                });
            }
            if (this.collided) {
                return objectBeingPushed;
            }
            return objectGlobalData.null;
        };
        moveOperationsPush.pushObjectVertical = function (pusher, objectBeingPushed, sign, objContainer) {
            var _this = this;
            this.collided = false;
            if (internalFunction.intersecting(pusher, pusher.collisionBox, objectBeingPushed)) {
                if (objectBeingPushed.collisionTargets.length == 0) {
                    return pusher;
                }
                objectBeingPushed.g.y += sign;
                if (ticker.getTicks() - objectBeingPushed._collidingWithPolygonTick < ticker.shortWindow) {
                    objectBeingPushed.g.y += sign * -1;
                    this.collided = true;
                    return objectBeingPushed;
                }
                else {
                    objContainer.loopThroughObjectsUntilCondition(objectBeingPushed.collisionTargets, function (testCollision) {
                        if (testCollision.objectName != pusher.objectName &&
                            (objectBeingPushed.sameLayerCollisionOnly == false || (objectBeingPushed.sameLayerCollisionOnly == true && objectBeingPushed.layerIndex == testCollision.layerIndex)) &&
                            internalFunction.intersecting(objectBeingPushed, objectBeingPushed.collisionBox, testCollision)
                            && _this.pushObjectVertical(objectBeingPushed, testCollision, sign, objContainer) != objectGlobalData.null) {
                            objectBeingPushed.g.y += sign * -1;
                            _this.collided = true;
                        }
                        return false;
                    });
                }
            }
            if (this.collided) {
                return objectBeingPushed;
            }
            return objectGlobalData.null;
        };
        moveOperationsPush.collided = false;
        return moveOperationsPush;
    }());

    var horizontalMovement = /** @class */ (function () {
        function horizontalMovement() {
        }
        horizontalMovement.moveForceHorizontal = function (magnitude, target, collisionNames, objContainer) {
            var _this = this;
            if (magnitude == 0)
                return;
            target.horizontalCollision = 0;
            this.sign = magnitude > 0 ? 1 : -1;
            this.objectsThatWereCollidingThisObjectWhileMoving = new Array();
            this.collisionTarget = objectGlobalData.null;
            var _loop_1 = function () {
                this_1.objectsThatWereCollidingThisObjectWhileMoving.length = 0;
                target.g.x += this_1.sign;
                if (objectGlobalData.objectsThatCollideWith[target.objectName] != null) {
                    //Push object
                    objContainer.loopThroughObjectsUntilCondition(objectGlobalData.objectsThatCollideWith[target.objectName], function (testCollisionWith) {
                        if ((target.sameLayerCollisionOnly == false || (target.sameLayerCollisionOnly == true && target.layerIndex == testCollisionWith.layerIndex))) {
                            if ((_this.sign > 0 && testCollisionWith.horizontalCollision <= 0) || (_this.sign < 0 && testCollisionWith.horizontalCollision >= 0)) {
                                if (internalFunction.intersecting(target, target.collisionBox, testCollisionWith)) {
                                    _this.collisionTarget = moveOperationsPush.pushObjectHorizontal(target, testCollisionWith, _this.sign, objContainer);
                                    if (_this.collisionTarget == objectGlobalData.null) {
                                        target.force.Dx *= 1 - testCollisionWith.weight;
                                    }
                                }
                            }
                        }
                        return false;
                    });
                    //Sticky draging
                    var stickyCheck_1 = boxCollider.copy(target.collisionBox);
                    var checkDistance = Math.abs(magnitude) + 2;
                    if (target.stickyTop) {
                        stickyCheck_1.expandTop(checkDistance);
                    }
                    if (target.stickyBottom) {
                        stickyCheck_1.expandBottom(checkDistance);
                    }
                    if (target.stickyTop || target.stickyBottom) {
                        //console.log("objectBase.objectsThatCollideWithKeyObjectName[target.objectName]", objectBase.objectsThatCollideWithKeyObjectName[target.objectName]);
                        objContainer.loopThroughObjectsUntilCondition(objectGlobalData.objectsThatCollideWith[target.objectName], function (testCollisionWith) {
                            if ((target.sameLayerCollisionOnly == false || (target.sameLayerCollisionOnly == true && target.layerIndex == testCollisionWith.layerIndex))
                                && internalFunction.intersecting(target, stickyCheck_1, testCollisionWith)) {
                                if (testCollisionWith._hasBeenMoved_Tick < ticker.getTicks()) {
                                    _this.objectsThatWereCollidingThisObjectWhileMoving.push(testCollisionWith);
                                    testCollisionWith.g.x += _this.sign;
                                    if (_this.i >= Math.abs(magnitude) - 1) {
                                        testCollisionWith._hasBeenMoved_Tick = ticker.getTicks();
                                    }
                                }
                            }
                            return false;
                        });
                    }
                }
                if (this_1.collisionTarget == objectGlobalData.null) {
                    this_1.collisionTarget = objContainer.boxIntersectionInLayerSpecific(target, target.collisionBox, collisionNames, target.layerIndex);
                    /*if(target.objectName == "player"){
                        console.log("this.collisionTarget: ",this.collisionTarget, "    second: ",(target._collidingWithPolygonTick - ticker.getTicks() > ticker.shortWindow));
                    }*/
                }
                if (this_1.collisionTarget != objectGlobalData.null /*&& target._collidingWithPolygonTick - ticker.getTicks() > ticker.shortWindow*/) {
                    this_1.sign *= -1;
                    target.g.x += 1 * this_1.sign;
                    this_1.objectsThatWereCollidingThisObjectWhileMoving.forEach(function (updaterObject) {
                        updaterObject.g.x += 1 * _this.sign;
                    });
                    if (target.force.Dx > 0) {
                        target.horizontalCollision = 1;
                    }
                    else if (target.force.Dx < 0) {
                        target.horizontalCollision = -1;
                    }
                    target.force.Dx = 0;
                    this_1.distance = 0;
                    if (this_1.sign <= 0) {
                        this_1.distance = calculations.getShortestDeltaBetweenTwoRadians(target.gravity.delta, 0);
                    }
                    else {
                        this_1.distance = calculations.getShortestDeltaBetweenTwoRadians(target.gravity.delta, calculations.PI);
                    }
                    if (this_1.distance < 90) {
                        target.gravity.Dy *= this_1.distance / 90;
                        target.gravity.Dx *= 1 - (this_1.distance / 90);
                    }
                    target.force.Dy *= this_1.collisionTarget.friction * target.friction;
                    return "break";
                }
            };
            var this_1 = this;
            for (this.i = 0; this.i < Math.abs(magnitude); this.i += 1) {
                var state_1 = _loop_1();
                if (state_1 === "break")
                    break;
            }
            //Sticky draging
            this.stickyCheck = boxCollider.copy(target.collisionBox);
            this.checkDistance = Math.abs(magnitude) + 2;
            if (target.stickyLeftSide) {
                this.stickyCheck.expandLeftSide(this.checkDistance);
            }
            if (target.stickyRightSide) {
                this.stickyCheck.expandRightSide(this.checkDistance);
            }
            if (target.stickyLeftSide || target.stickyRightSide) {
                objContainer.loopThroughObjectsUntilCondition(objectGlobalData.objectsThatCollideWith[target.objectName], function (testCollisionWith) {
                    if ((target.sameLayerCollisionOnly == false || (target.sameLayerCollisionOnly == true && target.layerIndex == testCollisionWith.layerIndex))) {
                        if (_this.sign > 0) {
                            //Moving right
                            if (testCollisionWith.g.x + testCollisionWith.collisionBox.x + testCollisionWith.collisionBox.width < target.g.x + target.collisionBox.x + target.collisionBox.width && internalFunction.intersecting(target, _this.stickyCheck, testCollisionWith)) {
                                testCollisionWith.g.x = target.g.x - testCollisionWith.collisionBox.x - testCollisionWith.collisionBox.width;
                            }
                        }
                        else {
                            //Moving left
                            if (testCollisionWith.g.x > target.g.x && internalFunction.intersecting(target, _this.stickyCheck, testCollisionWith)) {
                                testCollisionWith.g.x = target.g.x + target.collisionBox.x + target.collisionBox.width - testCollisionWith.collisionBox.x;
                            }
                        }
                    }
                    return false;
                });
            }
        };
        horizontalMovement.sign = 0;
        horizontalMovement.objectsThatWereCollidingThisObjectWhileMoving = new Array();
        horizontalMovement.collisionTarget = objectGlobalData.null;
        horizontalMovement.i = 0;
        horizontalMovement.distance = 0;
        horizontalMovement.checkDistance = 0;
        return horizontalMovement;
    }());

    var verticalMovement = /** @class */ (function () {
        function verticalMovement() {
        }
        verticalMovement.moveForceVertical = function (magnitude, target, collisionNames, objContainer) {
            var _this = this;
            if (magnitude == 0)
                return;
            target.verticalCollision = 0;
            this.sign = magnitude > 0 ? 1 : -1;
            this.objectsThatWereCollidingThisObjectWhileMoving = new Array();
            this.collisionTarget = objectGlobalData.null;
            /*if(target.objectName == "dummySandbag"){
                console.log("Here");
            }*/
            for (this.i = 0; this.i < Math.abs(magnitude); this.i += 1) {
                this.objectsThatWereCollidingThisObjectWhileMoving.length = 0;
                target.g.y += this.sign;
                if (objectGlobalData.objectsThatCollideWith[target.objectName] != null) {
                    //push objects
                    objContainer.loopThroughObjectsUntilCondition(objectGlobalData.objectsThatCollideWith[target.objectName], function (testCollisionWith) {
                        if ((target.sameLayerCollisionOnly == false || (target.sameLayerCollisionOnly == true && target.layerIndex == testCollisionWith.layerIndex))) {
                            if ((_this.sign > 0 && testCollisionWith.verticalCollision <= 0) || (_this.sign < 0 && testCollisionWith.verticalCollision >= 0)) {
                                if (internalFunction.intersecting(target, target.collisionBox, testCollisionWith)) {
                                    _this.collisionTarget = moveOperationsPush.pushObjectVertical(target, testCollisionWith, _this.sign, objContainer);
                                    if (_this.collisionTarget == objectGlobalData.null) {
                                        target.force.Dy *= 1 - testCollisionWith.weight;
                                    }
                                }
                            }
                        }
                        return false;
                    });
                    //Sticky draging
                    this.stickyCheck = boxCollider.copy(target.collisionBox);
                    this.checkDistance = Math.abs(magnitude) + 2;
                    if (target.stickyLeftSide) {
                        this.stickyCheck.expandLeftSide(this.checkDistance);
                    }
                    if (target.stickyRightSide) {
                        this.stickyCheck.expandRightSide(this.checkDistance);
                    }
                    if (target.stickyLeftSide || target.stickyRightSide) {
                        //console.log("objectBase.objectsThatCollideWithKeyObjectName[target.objectName]", objectBase.objectsThatCollideWithKeyObjectName[target.objectName]);
                        objContainer.loopThroughObjectsUntilCondition(objectGlobalData.objectsThatCollideWith[target.objectName], function (testCollisionWith) {
                            if ((target.sameLayerCollisionOnly == false || (target.sameLayerCollisionOnly == true && target.layerIndex == testCollisionWith.layerIndex))
                                && internalFunction.intersecting(target, _this.stickyCheck, testCollisionWith)) {
                                if (testCollisionWith._hasBeenMoved_Tick < ticker.getTicks()) {
                                    _this.objectsThatWereCollidingThisObjectWhileMoving.push(testCollisionWith);
                                    testCollisionWith.g.y += _this.sign;
                                    if (_this.i >= Math.abs(magnitude) - 1) {
                                        testCollisionWith._hasBeenMoved_Tick = ticker.getTicks();
                                    }
                                }
                            }
                            return false;
                        });
                    }
                }
                //This has to be more optimized
                if (this.collisionTarget == objectGlobalData.null) {
                    this.collisionTarget = objContainer.boxIntersectionInLayerSpecific(target, target.collisionBox, collisionNames, target.layerIndex);
                }
                if (this.collisionTarget != objectGlobalData.null) {
                    this.sign *= -1;
                    target.g.y += this.sign;
                    this.objectsThatWereCollidingThisObjectWhileMoving.forEach(function (updaterObject) {
                        updaterObject.g.y += _this.sign;
                    });
                    if (target.force.Dy > 0) {
                        target.verticalCollision = 1;
                    }
                    else if (target.force.Dy < 0) {
                        target.verticalCollision = -1;
                    }
                    target.force.Dy = 0;
                    this.distance = 0;
                    if (this.sign >= 0) {
                        this.distance = calculations.getShortestDeltaBetweenTwoRadians(target.gravity.delta, calculations.PI / 2);
                    }
                    else {
                        this.distance = calculations.getShortestDeltaBetweenTwoRadians(target.gravity.delta, calculations.PI + (calculations.PI / 2));
                    }
                    if (this.distance < 90) {
                        target.gravity.Dy *= this.distance / 90;
                        target.gravity.Dx *= 1 - (this.distance / 90);
                    }
                    //console.log("Friction");
                    //target.force.Dx *= collisionTarget.friction * target.friction;
                    target.force.Dx *= target.friction;
                    break;
                }
            }
            this.stickyCheck = boxCollider.copy(target.collisionBox);
            this.checkDistance = Math.abs(magnitude) + 2;
            if (target.stickyTop) {
                this.stickyCheck.expandTop(this.checkDistance);
            }
            if (target.stickyBottom) {
                this.stickyCheck.expandBottom(this.checkDistance);
            }
            //Sticky draging
            if (target.stickyTop || target.stickyBottom) {
                objContainer.loopThroughObjectsUntilCondition(objectGlobalData.objectsThatCollideWith[target.objectName], function (testCollisionWith) {
                    if ((target.sameLayerCollisionOnly == false || (target.sameLayerCollisionOnly == true && target.layerIndex == testCollisionWith.layerIndex))) {
                        if (_this.sign > 0) {
                            //Moving down
                            if (testCollisionWith.g.y + testCollisionWith.collisionBox.y + testCollisionWith.collisionBox.height < target.g.y + target.collisionBox.y + target.collisionBox.height && internalFunction.intersecting(target, _this.stickyCheck, testCollisionWith)) {
                                testCollisionWith.g.y = target.g.y - testCollisionWith.collisionBox.y - testCollisionWith.collisionBox.height;
                            }
                        }
                        else {
                            //Moving up
                            if (testCollisionWith.g.y > target.g.y && internalFunction.intersecting(target, _this.stickyCheck, testCollisionWith)) {
                                testCollisionWith.g.y = target.g.y + target.collisionBox.y + target.collisionBox.height - testCollisionWith.collisionBox.y;
                            }
                        }
                    }
                    return false;
                });
            }
        };
        verticalMovement.sign = 0;
        verticalMovement.objectsThatWereCollidingThisObjectWhileMoving = new Array();
        verticalMovement.collisionTarget = objectGlobalData.null;
        verticalMovement.i = 0;
        verticalMovement.distance = 0;
        verticalMovement.checkDistance = 0;
        return verticalMovement;
    }());

    var nullVector = /** @class */ (function () {
        function nullVector() {
            this.delta = 0;
            this.Dx = 0;
            this.Dy = 0;
            this.angle = 0;
            this.magnitude = 0;
        }
        nullVector.prototype.increaseMagnitude = function (addValue) {
        };
        nullVector.prototype.limitHorizontalMagnitude = function (limit) {
        };
        nullVector.prototype.limitVerticalMagnitude = function (limit) {
        };
        nullVector.null = new nullVector;
        return nullVector;
    }());

    var polygonCollision = /** @class */ (function () {
        function polygonCollision() {
        }
        polygonCollision.collisionTest = function (target, xTest, yTest, objContainer) {
            var _this = this;
            if (target.collidesWithPolygonGeometry == true) {
                this.foundPolygonsTest = objContainer.getSpecificObjectsInLayer(target._targetLayerForPolygonCollision, "polygonCollisionX");
                this.collisionObjects = [];
                for (var _i = 0, _a = this.foundPolygonsTest; _i < _a.length; _i++) {
                    var polygon = _a[_i];
                    if (internalFunction.intersecting(target, target.collisionBox, polygon)) {
                        this.collisionObjects.push(polygon);
                    }
                }
                //var collisionTarget = objContainer.boxIntersectionSpecific(target, target.collisionBox, ["polygonCollisionX"]);
                if (this.collisionObjects.length == 0) {
                    //target._hasCollidedWithPolygon = false;
                    return [false, target.gravity];
                }
                this.collisionResults = [];
                this.collisionObjects.forEach(function (obj) {
                    _this.collisionResults.push(obj.collisionTest(target));
                });
                /*this.currentFlatestCollision = new nullVector();
                this.currentFlatestCollision.delta = Math.PI/2;//point north
                this.collisionResults.forEach(collision => {
                    
                    if(collision[0] && collision[1].delta){
                        if(calculations.getShortestDeltaBetweenTwoRadians(collision[1].delta, 0) < calculations.getShortestDeltaBetweenTwoRadians(this.currentFlatestCollision.delta, 0)){
                            this.currentFlatestCollision = collision[1];
                        }
                    }
                });*/
                //let collisionHighestPoint = collisionResults[0];
                //target._hasCollidedWithPolygon = false;
                if (this.collisionResults.length == 0) {
                    return [false, target.gravity];
                }
                //Vertical push if collision
                /*if(target.objectName == "player"){
                    console.log(this.collisionResults[0][1].Dy);
                }*/
                if (this.collisionResults[0][0] && this.collisionResults[0][1].Dy > 0) {
                    for (this.i = 0; this.i < Math.round(this.collisionResults[0][1].Dy) + 1; this.i += 1) {
                        objContainer.loopThroughObjectsUntilCondition(objectGlobalData.objectsThatCollideWith[target.objectName], function (testCollisionWith) {
                            if ((target.sameLayerCollisionOnly == false || (target.sameLayerCollisionOnly == true && target.layerIndex == testCollisionWith.layerIndex))) {
                                if (internalFunction.intersecting(target, target.collisionBox, testCollisionWith)) {
                                    moveOperationsPush.pushObjectVertical(target, testCollisionWith, -1, objContainer);
                                }
                            }
                            return false;
                        });
                    }
                }
                return this.collisionResults[0];
                /*if(collisionTarget != objectGlobalData.null){
                    return (collisionTarget as polygonCollisionX).collisionTest(target);
                }*/
            }
            //target._hasCollidedWithPolygon = false;
            return [false, target.gravity];
        };
        polygonCollision.collisionObjects = [];
        polygonCollision.foundPolygonsTest = [];
        polygonCollision.collisionResults = [];
        polygonCollision.currentFlatestCollision = new nullVector();
        polygonCollision.i = 0;
        return polygonCollision;
    }());

    var movementOperations = /** @class */ (function () {
        function movementOperations() {
        }
        movementOperations.moveByForce = function (target, force, collisionNames, objContainer, deltaTime) {
            force.Dx = force.Dx;
            force.Dy = force.Dy;
            force.Dx *= target.airFriction;
            force.Dy *= target.airFriction;
            this.xdiff = force.Dx;
            this.ydiff = force.Dy;
            target.gravity.increaseMagnitude(target.weight);
            this.polygonCollisionTest = polygonCollision.collisionTest(target, Math.round(this.xdiff), Math.round(this.ydiff), objContainer);
            if (this.polygonCollisionTest[0]) {
                target._collidingWithPolygonTick = ticker.getTicks();
            }
            //console.log("1");
            force.Dx += this.polygonCollisionTest[1].Dx;
            force.Dy += this.polygonCollisionTest[1].Dy;
            target.gravity.magnitude = this.polygonCollisionTest[1].magnitude;
            /* if(target.gravity.magnitude < 1){
                target.gravity.magnitude = 0K
            }*/
            horizontalMovement.moveForceHorizontal(Math.round(this.xdiff), target, collisionNames, objContainer);
            if (this.polygonCollisionTest[0] == false) {
                verticalMovement.moveForceVertical(Math.round(this.ydiff), target, collisionNames, objContainer);
            }
        };
        movementOperations.xdiff = 0;
        movementOperations.ydiff = 0;
        movementOperations.polygonCollisionTest = [false, new nullVector()];
        return movementOperations;
    }());

    var objectBase = /** @class */ (function () {
        function objectBase(x, y, childObjectName) {
            this.isTile = false;
            this.tileStepTime = -1;
            this.ID = uidGen.new();
            this._g = new PIXI.Container();
            this.gSprites = {};
            this.friction = 0.98;
            this.airFriction = 0.9;
            this.stickyBottom = false;
            this.stickyTop = false;
            this.stickyLeftSide = false;
            this.stickyRightSide = false;
            this.gravity = nullVector.null;
            this.weight = 0.4;
            this._hasBeenMoved_Tick = 0;
            this._collidingWithPolygonTick = -1;
            this._targetLayerForPolygonCollision = "";
            this.collidesWithPolygonGeometry = false;
            this._hasCollidedWithPolygon = false;
            this.sameLayerCollisionOnly = false;
            this.inputTemplate = "";
            this.outputString = "";
            this.onLayer = 0;
            this._layerIndex = -1;
            this.horizontalCollision = 0;
            this.verticalCollision = 0;
            this._collisionBox = new boxCollider(0, 0, 0, 0);
            this._objectName = "iObject";
            this.moveCollisionTargets = [];
            this._collisionTargets = [];
            this._force = new vector(0, 0);
            this._objectName = childObjectName;
            this._g.x = x;
            this._g.y = y;
        }
        Object.defineProperty(objectBase.prototype, "layerIndex", {
            get: function () {
                return this._layerIndex;
            },
            set: function (value) {
                if (this._layerIndex == -1) {
                    this._layerIndex = value;
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(objectBase.prototype, "g", {
            get: function () {
                return this._g;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(objectBase.prototype, "collisionBox", {
            get: function () {
                return this._collisionBox;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(objectBase.prototype, "objectName", {
            get: function () {
                return this._objectName;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(objectBase.prototype, "collisionTargets", {
            get: function () {
                return this._collisionTargets;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(objectBase.prototype, "force", {
            get: function () {
                return this._force;
            },
            enumerable: false,
            configurable: true
        });
        objectBase.prototype.changeLayer = function (roomEvents, newLayerName) {
            //THIS ISNT WORKING
            console.log("Change layer: ", this.layerIndex);
            var objectsInLayer = roomEvents.objContainer.getObjectsInLayerFromIndex(this.layerIndex);
            console.log("objectsInLayer: ", objectsInLayer);
            var indexOfObjInLayer = objectsInLayer.indexOf(this);
            console.log("indexOfObjInLayer: ", indexOfObjInLayer);
            if (indexOfObjInLayer != -1) {
                console.log("old obj.layerIndex: ", this.layerIndex);
                objectsInLayer.splice(indexOfObjInLayer, 1);
                console.log("roomEvents.objContainer.getLayerNamesMap(): ", roomEvents.objContainer.getLayerNamesMap());
                var newLayerNumber = roomEvents.objContainer.getLayerNamesMap()[newLayerName];
                /*console.log("this.layerNames: ",this.layerNames);
                console.log("targetLayer: ",targetLayer);*/
                this._layerIndex = newLayerNumber;
                var netObjectContainer = roomEvents.objContainer.getObjectsInLayerFromIndex(this.layerIndex);
                console.log("newLayerNumber: ", newLayerNumber);
                netObjectContainer.push(this);
                //Move pixijs graphics to new container here
                this.g.parent.removeChild(this.g);
                var newLayerGraphicsContainer = roomEvents.objContainer.getLayerGraphicsContainerFromIndex(this.layerIndex);
                newLayerGraphicsContainer.addChild(this.g);
            }
        };
        objectBase.prototype.afterInit = function (roomEvents) {
        };
        objectBase.prototype.init = function (roomEvents) {
        };
        objectBase.prototype.addMoveCollisionTarget = function () {
            var collNames = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                collNames[_i] = arguments[_i];
            }
            /*for(let i=0; i<collNames.length; i++){
                if(this.moveCollisionTargets.indexOf(collNames[i]) == -1){
                    if(objectBase.objectsThatMoveWith[collNames[i]] == null){
                        objectBase.objectsThatMoveWith[collNames[i]] = new Array<string>();
                    }
                    if(objectBase.objectsThatMoveWith[collNames[i]].indexOf(this.objectName) == -1){
                        objectBase.objectsThatMoveWith[collNames[i]].push(this.objectName);
                    }

                    if(this.moveCollisionTargets.indexOf(collNames[i]) == -1){
                        this.moveCollisionTargets.push(collNames[i]);
                    }
                    
                }
            }*/
        };
        objectBase.prototype.addCollisionTarget = function () {
            var collNames = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                collNames[_i] = arguments[_i];
            }
            for (var i = 0; i < collNames.length; i++) {
                if (this._collisionTargets.indexOf(collNames[i]) == -1) {
                    if (objectGlobalData.objectsThatCollideWith[collNames[i]] == null) {
                        objectGlobalData.objectsThatCollideWith[collNames[i]] = new Array();
                    }
                    if (objectGlobalData.objectsThatCollideWith[collNames[i]].indexOf(this.objectName) == -1) {
                        objectGlobalData.objectsThatCollideWith[collNames[i]].push(this.objectName);
                    }
                    if (this._collisionTargets.indexOf(collNames[i]) == -1) {
                        this._collisionTargets.push(collNames[i]);
                    }
                }
            }
        };
        objectBase.prototype.removeCollisionTarget = function () {
            var collNames = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                collNames[_i] = arguments[_i];
            }
            throw new Error("Function removeCollisionTarget has not been implemented correctly");
        };
        objectBase.prototype.removeAllCollisionTargets = function () {
            this.collisionTargets.length = 0;
        };
        objectBase.prototype.style = function (newGraphics) {
            this.removeAllSprites();
            this.gSprites = {};
            var tempG = newGraphics(new PIXI.Container());
            var oldX = this.g.x;
            var oldY = this.g.y;
            this._g = tempG;
            this._g.x = oldX;
            this._g.y = oldY;
        };
        objectBase.prototype.addSprite = function (settings) {
            var newAnimation = resourcesHand.getAnimatedSprite(settings.animationName);
            if (newAnimation != null) {
                newAnimation.x = settings.x;
                newAnimation.y = settings.y;
                newAnimation.animationSpeed = settings.speed;
                //newAnimation.width = settings.width;
                //newAnimation.height = settings.height;
                newAnimation.anchor.set(settings.anchorX, settings.anchorY);
                newAnimation.scale.set(settings.scaleX, settings.scaleY);
                newAnimation.rotation = 0;
                newAnimation.play();
                this.gSprites[settings.id] = newAnimation;
                this._g.addChild(newAnimation);
            }
            return newAnimation;
        };
        objectBase.prototype.hasSprite = function (nameOrId) {
            return this.gSprites[nameOrId] != null;
        };
        objectBase.prototype.removeSprite = function (id) {
            if (this.gSprites[id] != null) {
                this._g.removeChild(this.gSprites[id]);
                delete this.gSprites[id]; //Nothing wrong with using delete, okay?
            }
            else {
                console.log("Wanted to remove ", id, " but could not find it");
            }
        };
        objectBase.prototype.removeAllSprites = function () {
            var keys = Object.keys(this.gSprites);
            for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                var k = keys_1[_i];
                this.removeSprite(k);
            }
        };
        objectBase.prototype.pauseSprite = function (id) {
            if (this.gSprites[id] != null && this.gSprites[id] instanceof PIXI.AnimatedSprite) {
                this.gSprites[id].stop();
            }
        };
        objectBase.prototype.playSprite = function (id) {
            if (this.gSprites[id] != null && this.gSprites[id] instanceof PIXI.AnimatedSprite) {
                this.gSprites[id].play();
            }
        };
        objectBase.prototype.scaleXSprites = function (scaleX) {
            var keys = Object.keys(this.gSprites);
            for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
                var k = keys_2[_i];
                this.gSprites[k].scale.set(scaleX, this.gSprites[k].scale.y);
            }
        };
        objectBase.prototype.scaleYSprites = function (scaleY) {
            var keys = Object.keys(this.gSprites);
            for (var _i = 0, keys_3 = keys; _i < keys_3.length; _i++) {
                var k = keys_3[_i];
                this.gSprites[k].scale.set(this.gSprites[k].scale.x, scaleY);
            }
        };
        objectBase.prototype.flipAllSpritesVertical = function () {
            var keys = Object.keys(this.gSprites);
            for (var _i = 0, keys_4 = keys; _i < keys_4.length; _i++) {
                var k = keys_4[_i];
                this.gSprites[k].height = -this.gSprites[k].height;
                if (this.gSprites[k].height < 0) {
                    this.gSprites[k].y += this.gSprites[k].height;
                }
                else {
                    this.gSprites[k].y -= this.gSprites[k].height;
                }
            }
        };
        objectBase.prototype.setAnimationSpeed = function (id, speed) {
            if (this.gSprites[id] != null && this.gSprites[id] instanceof PIXI.AnimatedSprite) {
                this.gSprites[id].animationSpeed = speed;
            }
        };
        objectBase.prototype.preLogicMovement = function (l) {
            movementOperations.moveByForce(this, this._force, this.collisionTargets, l.objContainer, l.deltaTime);
        };
        objectBase.prototype.logic = function (l) {
        };
        objectBase.prototype.setCollision = function (xs, ys, width, height) {
            this.collisionBox.x = xs;
            this.collisionBox.y = ys;
            this.collisionBox.width = width;
            this.collisionBox.height = height;
            if (ys < 0) {
                this.collisionBox.height += ys / -1;
            }
            if (xs < 0) {
                this.collisionBox.width += xs / -1;
            }
        };
        Object.defineProperty(objectBase.prototype, "x", {
            get: function () {
                return this.g.x;
            },
            set: function (n) {
                this.g.x = n;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(objectBase.prototype, "y", {
            get: function () {
                return this.g.y;
            },
            set: function (n) {
                this.g.y = n;
            },
            enumerable: false,
            configurable: true
        });
        objectBase.prototype.updatePosition = function (x, y) {
            this.g.x = x;
            this.g.y = y;
        };
        objectBase.prototype.setNewForce = function (xd, yd) {
            this._force.Dx = xd;
            this._force.Dy = yd;
        };
        objectBase.prototype.addForce = function (xd, yd) {
            this._force.Dx += xd;
            this._force.Dx += yd;
        };
        objectBase.prototype.setNewForceAngleMagnitude = function (angle, magnitude) {
            this._force.Dx = Math.cos(angle) * magnitude;
            this._force.Dy = calculations.flippedSin(angle) * magnitude;
            //this._force.angle = angle;
            //this._force.magnitude = magnitude;
        };
        objectBase.prototype.addForceAngleMagnitude = function (angle, magnitude) {
            this._force.Dx += Math.cos(angle) * magnitude;
            this._force.Dy += calculations.flippedSin(angle) * magnitude;
        };
        return objectBase;
    }());

    var block1 = /** @class */ (function (_super) {
        __extends(block1, _super);
        function block1(xp, yp, input) {
            var _this = _super.call(this, xp, yp, block1.objectName) || this;
            _super.prototype.setCollision.call(_this, 0, 0, 64, 64);
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI.Graphics();
                newGraphics.beginFill(0x000000);
                newGraphics.drawRect(0, 0, 64, 64);
                newGraphics.endFill();
                g.addChild(newGraphics);
                g.calculateBounds();
                return g;
            });
            return _this;
        }
        block1.prototype.logic = function (l) {
        };
        block1.objectName = "block1";
        return block1;
    }(objectBase));

    var normalBullet = /** @class */ (function (_super) {
        __extends(normalBullet, _super);
        function normalBullet(xp, yp, input) {
            var _this = _super.call(this, xp, yp, normalBullet.objectName) || this;
            _super.prototype.setCollision.call(_this, 0, 0, 8, 8);
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI.Graphics();
                newGraphics.beginFill(0xFF0000);
                newGraphics.drawRect(0, 0, 8, 8);
                newGraphics.endFill();
                g.addChild(newGraphics);
                g.calculateBounds();
                return g;
            });
            return _this;
        }
        normalBullet.prototype.logic = function (l) {
        };
        normalBullet.objectName = "normalBullet";
        return normalBullet;
    }(objectBase));

    var baseAttackNull = /** @class */ (function () {
        function baseAttackNull() {
        }
        baseAttackNull.prototype.isDone = function () {
            return true;
        };
        baseAttackNull.prototype.userShouldBeStill = function () {
            return false;
        };
        baseAttackNull.prototype.startAttack = function (creator) {
        };
        baseAttackNull.prototype.queryAttack = function () {
        };
        baseAttackNull.prototype.tickAttack = function (l) {
        };
        return baseAttackNull;
    }());

    var characterMoves = /** @class */ (function () {
        function characterMoves(ladderObject, groundAttacks, airAttacks) {
            if (ladderObject === void 0) { ladderObject = ""; }
            if (groundAttacks === void 0) { groundAttacks = null; }
            if (airAttacks === void 0) { airAttacks = null; }
            this.maxRunSpeed = 6;
            this.superRunSpeed = 6;
            this.normalRunSpeed = 4;
            this.jumpStrength = 8;
            this.jumpButtonReleased = false;
            //ladder part
            this.ladderObject = "";
            this.climbindLadder = false;
            this.canJumpLadders = false;
            this.atLadderTop = false;
            this.releasedJumpKeyAtLadderTop = false;
            this.hasJumpedFromLadder = false;
            this.climbSpeed = 2;
            this.climbDownSpeed = 3;
            this.ladderTopJump = 3;
            this.ladderSideJump = 3;
            //attack
            this.attack = new baseAttackNull();
            this.attackButtonReleased = true;
            this.airAttacks = null;
            this.groundAttacks = null;
            //Other
            this.walkingBridge = false;
            this.collidingWithPolygonStoredState = false;
            this.CL_collisionWith = null;
            this.CL_movedBetweenLadder = false;
            this.ladderObject = ladderObject;
            this.airAttacks = airAttacks;
            this.groundAttacks = groundAttacks;
        }
        characterMoves.prototype.move = function (l, character) {
            this.movement(l, character);
            this.climbingLadders(l, character);
            this.handleAttacks(l, character);
        };
        characterMoves.prototype.movement = function (l, character) {
            if (l.checkKeyHeld("Control")) {
                this.maxRunSpeed = this.superRunSpeed;
            }
            else {
                this.maxRunSpeed = this.normalRunSpeed;
            }
            if (l.checkKeyHeld("a") || l.checkKeyHeld("A")) {
                character.addForceAngleMagnitude(calculations.degreesToRadians(180), (10 / 13) * this.maxRunSpeed * l.deltaTime());
            }
            if (l.checkKeyHeld("d") || l.checkKeyHeld("D")) {
                character.addForceAngleMagnitude(calculations.degreesToRadians(0), (10 / 13) * this.maxRunSpeed * l.deltaTime());
            }
            if (l.checkKeyHeld("w") || l.checkKeyHeld("W")) {
                character.addForceAngleMagnitude(calculations.degreesToRadians(90), (10 / 13) * this.maxRunSpeed * l.deltaTime());
            }
            if (l.checkKeyHeld("s") || l.checkKeyHeld("S")) {
                character.addForceAngleMagnitude(calculations.degreesToRadians(270), (10 / 13) * this.maxRunSpeed * l.deltaTime());
            }
            character.force.limitHorizontalMagnitude(this.maxRunSpeed);
            character.force.limitVerticalMagnitude(this.maxRunSpeed);
        };
        characterMoves.prototype.climbingLadders = function (l, character) {
            if (this.ladderObject == "")
                return;
            this.CL_collisionWith = l.isCollidingWith(character, character.collisionBox, [this.ladderObject]);
            if (this.CL_collisionWith != null) {
                if ((l.checkKeyHeld("w") || l.checkKeyHeld("s"))) {
                    character.force.Dx = 0;
                }
                if ((l.checkKeyHeld("w") || l.checkKeyHeld("s")) && this.climbindLadder == false) {
                    this.climbindLadder = true;
                }
                if (this.climbindLadder) {
                    if (l.checkKeyHeld("a") == false && l.checkKeyHeld("d") == false) {
                        this.canJumpLadders = true;
                    }
                    character.gravity.magnitude = 0;
                    character.force.Dx *= 0.4;
                    character.force.Dy *= 0.2;
                    character.g.x = this.CL_collisionWith.g.x + (this.CL_collisionWith.g.width / 2) - (character.g.width / 2);
                    if (l.checkKeyHeld("w")) {
                        character.g.y -= this.climbSpeed;
                        while (l.isCollidingWith(character, character.collisionBox, [this.ladderObject]) == null ||
                            l.isCollidingWith(character, character.collisionBox, character.collisionTargets) != null) {
                            character.g.y += 1;
                            this.atLadderTop = true;
                        }
                    }
                    if (l.checkKeyHeld("w") && this.atLadderTop == true && this.releasedJumpKeyAtLadderTop) {
                        character.g.y -= 1;
                        character.addForceAngleMagnitude(calculations.degreesToRadians(90), this.ladderTopJump * l.deltaTime());
                    }
                    console.log(l.checkKeyReleased("w"));
                    if (l.checkKeyReleased("w") && this.atLadderTop == true) {
                        this.releasedJumpKeyAtLadderTop = true;
                        console.log("releasedJumpKeyAtLadderTop");
                    }
                    if (l.checkKeyHeld("s")) {
                        character.g.y += this.climbDownSpeed;
                        if (l.isCollidingWith(character, character.collisionBox, character.collisionTargets) != null) {
                            character.g.y = this.CL_collisionWith.g.y + (this.CL_collisionWith.collisionBox.y / 2) + this.CL_collisionWith.collisionBox.height / 2 - 1;
                        }
                    }
                    this.CL_movedBetweenLadder = false;
                    if (l.checkKeyReleased("d")) {
                        this.canJumpLadders = true;
                    }
                    if (l.checkKeyReleased("a")) {
                        this.canJumpLadders = true;
                    }
                    if (l.checkKeyHeld("a")) {
                        if (this.canJumpLadders) {
                            character.g.x -= character.collisionBox.width;
                            this.CL_movedBetweenLadder = true;
                            if (l.isCollidingWith(character, character.collisionBox, character.collisionTargets) != null) {
                                character.g.x += character.collisionBox.width;
                                this.CL_movedBetweenLadder = false;
                            }
                            if (this.CL_movedBetweenLadder && l.checkKeyHeld("w")) {
                                character.addForceAngleMagnitude(calculations.degreesToRadians(135), this.ladderSideJump * l.deltaTime());
                                this.atLadderTop = false;
                                this.canJumpLadders = false;
                                this.climbindLadder = false;
                                this.releasedJumpKeyAtLadderTop = false;
                            }
                            else if (this.CL_movedBetweenLadder) {
                                this.releasedJumpKeyAtLadderTop = false;
                                this.canJumpLadders = false;
                            }
                        }
                    }
                    if (l.checkKeyHeld("d")) {
                        if (this.canJumpLadders) {
                            character.g.x += character.collisionBox.width;
                            this.CL_movedBetweenLadder = true;
                            if (l.isCollidingWith(character, character.collisionBox, character.collisionTargets) != null) {
                                character.g.x -= character.collisionBox.width;
                                this.CL_movedBetweenLadder = false;
                            }
                            if (this.CL_movedBetweenLadder && l.checkKeyHeld("w")) {
                                character.addForceAngleMagnitude(calculations.degreesToRadians(45), this.ladderSideJump * l.deltaTime());
                                this.atLadderTop = false;
                                this.canJumpLadders = false;
                                this.climbindLadder = false;
                                this.releasedJumpKeyAtLadderTop = false;
                            }
                            else if (this.CL_movedBetweenLadder) {
                                this.releasedJumpKeyAtLadderTop = false;
                                this.canJumpLadders = false;
                            }
                        }
                    }
                }
            }
            else {
                this.atLadderTop = false;
                this.canJumpLadders = false;
                this.climbindLadder = false;
                this.releasedJumpKeyAtLadderTop = false;
                if (l.checkKeyHeld("w") && Math.floor(character.gravity.magnitude) == 0
                    && this.hasJumpedFromLadder == false) {
                    character.addForceAngleMagnitude(calculations.degreesToRadians(90), this.ladderTopJump * l.deltaTime());
                    this.hasJumpedFromLadder = true;
                }
            }
        };
        characterMoves.prototype.handleAttacks = function (l, character) {
            this.attack.tickAttack(l);
            if ((l.checkKeyHeld("k") || l.checkKeyHeld("K"))) {
                if (this.attackButtonReleased) {
                    this.attackButtonReleased = false;
                    this.attack.queryAttack();
                    if (this.attack.isDone()) {
                        if (character.verticalCollision > 0 || character._collidingWithPolygonTick) {
                            if (this.groundAttacks != null) {
                                this.attack = this.groundAttacks(l);
                            }
                        }
                        else {
                            if (this.airAttacks != null) {
                                this.attack = this.airAttacks(l);
                            }
                        }
                    }
                }
            }
            else {
                this.attackButtonReleased = true;
            }
        };
        return characterMoves;
    }());

    var vectorFixedDelta = /** @class */ (function () {
        function vectorFixedDelta(delta, inputMagnitude) {
            this.delta = delta;
            this.Dx = Math.cos(this.delta) * inputMagnitude;
            this.Dy = Math.sin(this.delta) * inputMagnitude;
        }
        vectorFixedDelta.prototype.limitHorizontalMagnitude = function (limit) {
            throw new Error("Method not implemented.");
        };
        vectorFixedDelta.prototype.limitVerticalMagnitude = function (limit) {
            throw new Error("Method not implemented.");
        };
        Object.defineProperty(vectorFixedDelta.prototype, "magnitude", {
            get: function () {
                return Math.sqrt(Math.pow(this.Dx, 2) + Math.pow(this.Dy, 2));
            },
            set: function (newMag) {
                var newXAdd = Math.cos(this.delta) * newMag;
                var newYAdd = calculations.flippedSin(this.delta) * newMag;
                this.Dx = newXAdd;
                this.Dy = newYAdd;
            },
            enumerable: false,
            configurable: true
        });
        vectorFixedDelta.prototype.increaseMagnitude = function (addValue) {
            //this.Dx = this.Dx * (this.magnitude+addValue) / this.magnitude;
            //this.Dy = this.Dy * (this.magnitude+addValue) / this.magnitude;
            var newXAdd = Math.cos(this.delta) * addValue;
            var newYAdd = calculations.flippedSin(this.delta) * addValue;
            if (Math.abs(newXAdd) > 0.00000000000001) {
                this.Dx += newXAdd;
            }
            if (Math.abs(newYAdd) > 0.00000000000001) {
                this.Dy += newYAdd;
            }
        };
        return vectorFixedDelta;
    }());

    var socketHandler = /** @class */ (function (_super) {
        __extends(socketHandler, _super);
        function socketHandler(xp, yp, input) {
            var _this = _super.call(this, xp, yp, socketHandler.objectName) || this;
            _this.gameId = "";
            _this.socketId = "";
            _this.localPlayerId = "";
            _this.socket = socket_ioClient.io("ws://localhost:3000");
            return _this;
        }
        socketHandler.prototype.init = function (roomEvents) {
            var _this = this;
            this.socket.on("connect", function () {
                _this.socket.emit("startGame");
            });
            this.socket.on("gameRoomFound", function (data) {
                _this.gameId = data.gameId;
                _this.socketId = data.mySocketId;
                var playerNew = new human(_this.g.x, _this.g.y, "true");
                roomEvents.addObjectLayerName(playerNew, "main");
                _this.localPlayerId = playerNew.ID;
                _this.socket.on("playerPositions", function (playerPositions) {
                    console.log("playerPositions: ", playerPositions);
                    var objectIds = Object.keys(playerPositions);
                    objectIds.forEach(function (plPosition) {
                        var positionData = playerPositions[plPosition];
                        /**gravity: [pl.gravity.Dx, pl.gravity.Dy],
                        force: [pl.force.Dx, pl.force.Dy, pl.force.delta, pl.force.magnitude] */
                        if (positionData.id != _this.localPlayerId) {
                            var allHumans = roomEvents.getSpecificObjects(human.objectName);
                            var humanUpdated_1 = false;
                            allHumans.forEach(function (h) {
                                if (h.ID == positionData.id) {
                                    h.force.Dx = positionData.force[0];
                                    h.force.Dy = positionData.force[1];
                                    h.setPersistentForce(positionData.force[2], positionData.force[3]);
                                    //h.addForceAngleMagnitude(positionData.force[0], (1/13)*positionData.force[1]);
                                    h.gravity.Dx = positionData.gravity[0];
                                    h.gravity.Dy = positionData.gravity[1];
                                    h.g.x = positionData.x;
                                    h.g.y = positionData.y;
                                    humanUpdated_1 = true;
                                }
                            });
                            if (humanUpdated_1 == false) {
                                var playerNew_1 = new human(positionData.x, positionData.y, "false");
                                playerNew_1.ID = positionData.id;
                                roomEvents.addObjectLayerName(playerNew_1, "main");
                            }
                        }
                    });
                });
            });
        };
        socketHandler.prototype.logic = function (l) {
            _super.prototype.logic.call(this, l);
        };
        socketHandler.prototype.updatePlayerPosition = function (pl) {
            var sendPlData = {
                id: pl.ID,
                x: pl.g.x,
                y: pl.g.y,
                gravity: [pl.gravity.Dx, pl.gravity.Dy],
                force: [pl.force.Dx, pl.force.Dy, pl.force.delta, pl.force.magnitude],
                gameId: this.gameId,
                socketId: this.socketId,
            };
            //console.log("Send pl data: ",sendPlData);
            this.socket.emit("position", sendPlData);
        };
        socketHandler.objectName = "socketHandler";
        return socketHandler;
    }(objectBase));

    var weaponEmpty = /** @class */ (function () {
        function weaponEmpty() {
        }
        weaponEmpty.prototype.activate = function () {
        };
        weaponEmpty.prototype.deactivate = function () {
        };
        weaponEmpty.prototype.poll = function (l, x, y, angle) {
        };
        return weaponEmpty;
    }());

    var nw1 = /** @class */ (function () {
        function nw1() {
            this.active = false;
            this.timer = 10;
            this.timerNumber = 10;
        }
        nw1.prototype.activate = function () {
            if (this.active == false) {
                this.active = true;
            }
        };
        nw1.prototype.deactivate = function () {
            if (this.active) {
                this.active = false;
            }
        };
        nw1.prototype.poll = function (l, x, y, angle) {
            if (this.timer == 0) {
                var bullet = new normalBullet(x, y, "");
                l.addObjectLayerName(bullet, "main");
                this.timer = this.timerNumber;
            }
            else {
                this.timer--;
            }
        };
        return nw1;
    }());

    var human = /** @class */ (function (_super) {
        __extends(human, _super);
        function human(xp, yp, input) {
            var _this = _super.call(this, xp, yp, human.objectName) || this;
            _this.sameLayerCollisionOnly = true;
            _this.collidesWithPolygonGeometry = true;
            _this.airFriction = 0.80;
            _this.friction = 0.7;
            _this.gravity = new vectorFixedDelta(calculations.degreesToRadians(270), 0); //vector.fromAngleAndMagnitude(calculations.degreesToRadians(270), 0.6);
            _this.weight = 0.0;
            _this.socketHandler = null;
            _this.isCurrentPlayer = false;
            _this.online_persistentForceDelta = 0;
            _this.online_persistentForceMagnitude = 0;
            _this.currentWeapon = new weaponEmpty();
            _super.prototype.setCollision.call(_this, 0, 0, 58, 58);
            if (input == "true") {
                _this.isCurrentPlayer = true;
            }
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI.Graphics();
                newGraphics.beginFill(0xFF3e50);
                newGraphics.drawRect(0, 0, 58, 58);
                newGraphics.endFill();
                g.addChild(newGraphics);
                g.calculateBounds();
                return g;
            });
            _this.characterMoveBase = new characterMoves("", function (l) {
                //Ground attacks
                return new baseAttackNull();
            }, function (l) {
                //air attacks
                return new baseAttackNull();
            });
            _this.addCollisionTarget(block1.objectName);
            _this.currentWeapon = new nw1();
            return _this;
        }
        human.prototype.afterInit = function (roomEvents) {
            this.socketHandler = roomEvents.getSpecificObjects(socketHandler.objectName)[0];
        };
        human.prototype.logic = function (l) {
            _super.prototype.logic.call(this, l);
            if (this.isCurrentPlayer && this.socketHandler != null) {
                if (l.flags().has("freezeObjects")) {
                    this.characterMoveBase.move(l, this);
                }
                if (l.checkMouseClick()) {
                    this.currentWeapon.activate();
                }
                else {
                    this.currentWeapon.deactivate();
                }
                this.currentWeapon.poll(l, this.g.x, this.g.y, 0);
                l.setCameraTarget(this.g.x + this.collisionBox.x + (this.collisionBox.width / 2), this.g.y);
                this.socketHandler.updatePlayerPosition(this);
            }
            else {
                //Is online player
                //persistent force
                this.addForceAngleMagnitude(this.online_persistentForceDelta, (1 / 13) * this.online_persistentForceMagnitude);
                this.online_persistentForceMagnitude *= 0.9;
            }
        };
        human.prototype.setPersistentForce = function (delta, magnitude) {
            this.online_persistentForceDelta = delta;
            this.online_persistentForceMagnitude = magnitude;
        };
        human.objectName = "human";
        return human;
    }(objectBase));

    var tileMetaObj = /** @class */ (function (_super) {
        __extends(tileMetaObj, _super);
        function tileMetaObj(xp, yp) {
            var _this = _super.call(this, xp, yp, tileMetaObj.objectName) || this;
            _this.isTile = true;
            _this.animation = null;
            _this.currentTileIndex = 0;
            return _this;
        }
        tileMetaObj.prototype.logic = function (l) {
            return;
        };
        tileMetaObj.prototype.setTiles = function (tAnim) {
            _super.prototype.style.call(this, function (g) {
                if (tAnim.tiles.length == 1) {
                    var animation = resourcesHand.getStaticTile(tAnim.tiles[0].resourceName);
                    if (animation != null) {
                        g.addChild(animation);
                    }
                    else {
                        console.log("animation is null: ", tAnim);
                    }
                }
                else if (tAnim.tiles.length > 1) {
                    console.log("tAnim: ", tAnim);
                    resourcesHand.generateAnimatedTiles(tAnim);
                    var animation = resourcesHand.getAnimatedTile(tAnim.name);
                    if (animation != null) {
                        console.log("tAnim.animationSpeed: ", tAnim.animationSpeed);
                        animation.animationSpeed = 0;
                        if (tAnim.animationSpeed > 0) {
                            animation.animationSpeed = (60 / (tAnim.animationSpeed * 60)) / 60;
                        }
                        animation.play();
                        animation.roundPixels = false;
                        g.addChild(animation);
                    }
                }
                return g;
            });
        };
        tileMetaObj.prototype.animate = function () {
            this.currentTileIndex += 1;
        };
        tileMetaObj.objectName = "tileMetaObj";
        return tileMetaObj;
    }(objectBase));

    //{NEW IMPORTS START HERE}
    var objectGenerator = /** @class */ (function () {
        function objectGenerator() {
            this.availibleObjects = [
                //{NEW OBJECT HERE START} (COMMENT USED AS ANCHOR BY populateObjectGenerator.js)
                function (xp, yp, input) { return new block1(xp, yp, input); },
                function (xp, yp, input) { return new normalBullet(xp, yp, input); },
                function (xp, yp, input) { return new human(xp, yp, input); },
                function (xp, yp, input) { return new socketHandler(xp, yp, input); },
            ];
        }
        objectGenerator.prototype.getAvailibleObjects = function () {
            return this.availibleObjects;
        };
        objectGenerator.prototype.generateObject = function (objectName, x, y, tile, inputString) {
            for (var i = 0; i < this.availibleObjects.length; i++) {
                if (tile == null) {
                    //Create normal object
                    var avObj = this.availibleObjects[i];
                    var temp = avObj(x, y, inputString);
                    var className = tools.getClassNameFromConstructorName(temp.constructor.toString());
                    if (className == objectName) {
                        return temp;
                    }
                }
                else {
                    //Create tile object
                    var newTile = new tileMetaObj(x, y);
                    newTile.setTiles(tile);
                    return newTile;
                }
            }
            throw new Error("Can't generate object for: " + objectName);
        };
        return objectGenerator;
    }());

    var fileSystemEntry = /** @class */ (function () {
        function fileSystemEntry(type, name, contains, id, customData) {
            this.type = type;
            this.name = name;
            this.contains = contains;
            this.id = id;
            this.customData = customData;
        }
        return fileSystemEntry;
    }());

    var objectSelectedData = /** @class */ (function () {
        function objectSelectedData(objectName, objectPlaceWidth, objectPlaceHeight, imageSrc) {
            var _this = this;
            this.objectName = "";
            this.objectPlaceWidth = -1;
            this.objectPlaceHeight = -1;
            this.objectToPlaceImageUrl = new Image();
            this.objectMouseImageReady = false;
            this.objectName = objectName;
            this.objectPlaceWidth = objectPlaceWidth;
            this.objectPlaceHeight = objectPlaceHeight;
            this.objectToPlaceImageUrl = new Image();
            this.objectToPlaceImageUrl.onload = function () {
                _this.objectMouseImageReady = true;
            };
            this.objectToPlaceImageUrl.src = imageSrc;
        }
        return objectSelectedData;
    }());

    var fileSystemHandlerObjects = /** @class */ (function () {
        function fileSystemHandlerObjects(canvasHandler, cursor) {
            var _this = this;
            this.generateObjects = new objectGenerator();
            this.parameters = {
                itemName: "File",
                disableInteraction: true,
                onlyUniqueNames: true,
                createItemButtonOn: true,
                canResize: false
            };
            this.preLoadedImage = false;
            this.savedImageDataUrls = {};
            this.cursor = cursor;
            this.canvasHandler = canvasHandler;
            this.system = new prettyFiles.init().getInit("fileSystemObjects", this.parameters);
            this.system.onCreateNewFile = this.onCreateNewFile.bind(this);
            this.system.onClickFile = this.onClickFile.bind(this);
            window.node.getFolderContent("../../objects", function (returnData) {
                returnData.forEach(function (room) {
                    room[0] = room[0].substr(room[0].indexOf("objects"));
                });
                _this.populateFileSystem(returnData);
            });
            this.generateObjects.getAvailibleObjects().forEach(function (obj) {
                var tempObj = obj(0, 0, "");
                var width = tempObj.g.width;
                var height = tempObj.g.height;
                if (width <= 0) {
                    width = 32;
                }
                if (height <= 0) {
                    height = 32;
                }
                var appRenderObject = new PIXI.Application({
                    width: width,
                    height: height,
                    transparent: true
                });
                appRenderObject.stage.addChild(tempObj.g);
                appRenderObject.render();
                _this.preLoadedImage = true;
                _this.system.sticker = appRenderObject.view.toDataURL();
                var functionAsString = tempObj.constructor.toString();
                var tempNewImage = new Image();
                tempNewImage.src = _this.system.sticker;
                var funcNameOnly = tools.getClassNameFromConstructorName(functionAsString);
                fileSystemHandlerObjects.classAndImage[funcNameOnly] = tempNewImage;
                _this.savedImageDataUrls[funcNameOnly] = _this.system.sticker;
            });
        }
        fileSystemHandlerObjects.prototype.populateFileSystem = function (roomData) {
            var _this = this;
            var dataToInsertIntoFileSystem = [];
            var idCounter = 0;
            roomData.forEach(function (roomMeta) {
                var roomSrc = roomMeta[0];
                var roomData = roomMeta[1];
                var roomDirParts = roomSrc.split("/");
                var currentFolder = null;
                roomDirParts.forEach(function (item) {
                    if (item != "..") {
                        var newEntry = void 0;
                        if (item.indexOf(".ts") != -1) {
                            //It's a file
                            var nameOnly = item.split(".")[0];
                            newEntry = new fileSystemEntry("file", nameOnly, [], idCounter, [nameOnly, roomData]);
                            newEntry.image = _this.savedImageDataUrls[nameOnly];
                            if (currentFolder == null) {
                                dataToInsertIntoFileSystem.push(newEntry);
                            }
                            else {
                                currentFolder.contains.push(newEntry);
                            }
                        }
                        else {
                            //It's a folder
                            //Check if folder already exists
                            var foundFolder = false;
                            if (currentFolder == null) {
                                for (var _i = 0, dataToInsertIntoFileSystem_1 = dataToInsertIntoFileSystem; _i < dataToInsertIntoFileSystem_1.length; _i++) {
                                    var elem = dataToInsertIntoFileSystem_1[_i];
                                    if (elem.type == "folder" && elem.name == item) {
                                        currentFolder = elem;
                                        foundFolder = true;
                                        break;
                                    }
                                }
                            }
                            else {
                                for (var _a = 0, _b = currentFolder.contains; _a < _b.length; _a++) {
                                    var elem = _b[_a];
                                    if (elem.type == "folder" && elem.name == item) {
                                        currentFolder = elem;
                                        foundFolder = true;
                                        break;
                                    }
                                }
                            }
                            if (foundFolder == false) {
                                newEntry = new fileSystemEntry("folder", item, [], idCounter, undefined);
                                if (currentFolder == null) {
                                    dataToInsertIntoFileSystem.push(newEntry);
                                }
                                else {
                                    currentFolder.contains.push(newEntry);
                                }
                                currentFolder = newEntry;
                            }
                        }
                        //let newFolderId = this.system.createFolder(item);
                        //console.log(newFolderId);
                        idCounter++;
                    }
                });
            });
            this.system.insertData(JSON.stringify(dataToInsertIntoFileSystem));
        };
        fileSystemHandlerObjects.prototype.getFileSystemElement = function () {
            return document.getElementById("fileSystemObjects");
        };
        fileSystemHandlerObjects.prototype.onClickFile = function (fileClicked, id, image, customData) {
            this.cursor.currentSubTile = null;
            this.cursor.objectSelected = new objectSelectedData(customData[0], customData.width, customData.height, image);
        };
        fileSystemHandlerObjects.prototype.onCreateNewFile = function (name, id, proceed) {
            var _this = this;
            if (this.preLoadedImage == false) {
                this.system.prompt("Image", "Include an image source", "", function (input) {
                    if (input != null && input.replace(/ /g, '') != '') {
                        _this.system.sticker = input;
                        if (proceed()) {
                            _this.system.sticker = input;
                        }
                    }
                });
            }
            else {
                if (proceed()) {
                    this.system.sticker = new Image();
                }
            }
        };
        fileSystemHandlerObjects.classAndImage = {};
        return fileSystemHandlerObjects;
    }());

    var subTileMeta = /** @class */ (function () {
        function subTileMeta(resourceName, startX, startY, width, height) {
            this.tileName = "";
            this.resourceName = resourceName;
            this.startX = startX;
            this.startY = startY;
            this.width = width;
            this.height = height;
        }
        subTileMeta.prototype.clone = function () {
            return new subTileMeta(this.resourceName, this.startX, this.startY, this.width, this.height);
        };
        return subTileMeta;
    }());

    var tileAnimation = /** @class */ (function () {
        function tileAnimation(tiles) {
            if (tiles === void 0) { tiles = []; }
            this.name = "";
            this.animationSpeed = 0.5;
            this.tiles = tiles;
        }
        tileAnimation.initFromJsonGeneratedObj = function (obj) {
            var realObject = new tileAnimation(obj.tiles);
            realObject.name = obj.name;
            realObject.animationSpeed = obj.animationSpeed;
            return realObject;
        };
        tileAnimation.prototype.get = function (index) {
            var animFrames = 60 * this.animationSpeed;
            if (index > 0) {
                index = Math.floor(index / animFrames) % this.tiles.length;
                if (isNaN(index)) {
                    index = 0;
                }
            }
            return this.tiles[index];
        };
        tileAnimation.prototype.getAllTiles = function () {
            return this.tiles;
        };
        return tileAnimation;
    }());

    var resourcesTiles = /** @class */ (function () {
        function resourcesTiles() {
        }
        resourcesTiles.resourceNameAndImage = {};
        return resourcesTiles;
    }());

    var animatedTypeCreator = /** @class */ (function () {
        function animatedTypeCreator(elementName) {
            var _a, _b;
            this.tempSubTile = null;
            this.animation = new tileAnimation();
            this.tilePreview = document.createElement("canvas");
            this.container = document.getElementById(elementName);
            this.tilesContainer = document.createElement("div");
            this.tilesContainer.style.margin = "8px";
            (_a = this.container) === null || _a === void 0 ? void 0 : _a.appendChild(this.tilesContainer);
            this.addTileToAnimButton = document.createElement("button");
            this.addTileToAnimButton.innerHTML = "add tile to animated tile";
            this.addTileToAnimButton.style.marginBottom = "32px";
            this.addTileToAnimButton.addEventListener("mouseup", this.addTileToAnimation.bind(this));
            (_b = this.container) === null || _b === void 0 ? void 0 : _b.appendChild(this.addTileToAnimButton);
            this.tilePreview.className = "tilePreview";
            document.body.appendChild(this.tilePreview);
        }
        animatedTypeCreator.prototype.setTileSet = function (tileSet) {
            this.animation = tileSet;
            this.tempSubTile = null;
            this.createElementsForTiles(this.animation.tiles);
        };
        animatedTypeCreator.prototype.addTileToAnimation = function (e) {
            var _a;
            if (this.tempSubTile != null) {
                var newTile = (_a = this.tempSubTile) === null || _a === void 0 ? void 0 : _a.clone();
                newTile.tileName = this.animation.tiles.length.toString();
                this.animation.tiles.push(newTile);
            }
            this.createElementsForTiles(this.animation.tiles);
        };
        animatedTypeCreator.prototype.createAnimatedLayerItem = function (newTile) {
            var _this = this;
            var item = document.createElement("div");
            if (newTile != null) {
                var nameElement = document.createElement("div");
                nameElement.style.display = "inline-block";
                nameElement.style.paddingRight = "32px";
                nameElement.innerHTML = newTile === null || newTile === void 0 ? void 0 : newTile.tileName;
                nameElement.addEventListener("mouseenter", function (e) {
                    if (newTile != null) {
                        _this.showPreviewOfTile(e, newTile);
                    }
                });
                nameElement.addEventListener("mouseleave", function (e) {
                    _this.tilePreview.style.display = "none";
                });
                item.appendChild(nameElement);
                item.setAttribute("itemName", newTile === null || newTile === void 0 ? void 0 : newTile.tileName);
            }
            var moveUpButton = document.createElement("button");
            moveUpButton.innerHTML = "up";
            moveUpButton.addEventListener("mouseup", function (e) {
                var _a;
                var buttonElement = e.target;
                var name = (_a = buttonElement.parentElement) === null || _a === void 0 ? void 0 : _a.getAttribute("itemName");
                if (name != null) {
                    _this.moveTile(name, -1);
                }
            });
            item.appendChild(moveUpButton);
            var moveDownButton = document.createElement("button");
            moveDownButton.innerHTML = "down";
            moveDownButton.addEventListener("mouseup", function (e) {
                var _a;
                var buttonElement = e.target;
                var name = (_a = buttonElement.parentElement) === null || _a === void 0 ? void 0 : _a.getAttribute("itemName");
                if (name != null) {
                    _this.moveTile(name, 1);
                }
            });
            item.appendChild(moveDownButton);
            var deleteLayerButton = document.createElement("button");
            deleteLayerButton.innerHTML = "delete";
            deleteLayerButton.addEventListener("mouseup", function (e) {
                var _a;
                if (_this.animation.name != "")
                    return;
                var buttonElement = e.target;
                var name = (_a = buttonElement.parentElement) === null || _a === void 0 ? void 0 : _a.getAttribute("itemName");
                if (name != null) {
                    _this.removeTile(name);
                }
            });
            item.appendChild(deleteLayerButton);
            return item;
        };
        animatedTypeCreator.prototype.getTileStack = function () {
            return this.animation;
        };
        animatedTypeCreator.prototype.moveTile = function (tileName, moveDeltaSign) {
            var originalPosition = -1;
            for (var i = 0; i < this.animation.tiles.length; i++) {
                var tile = this.animation.tiles[i];
                if (tile.tileName == tileName) {
                    originalPosition = i;
                }
            }
            var itemToPlace = this.animation.tiles[originalPosition];
            var newPosition = originalPosition + moveDeltaSign;
            this.animation.tiles.splice(originalPosition, 1);
            this.animation.tiles.splice(newPosition, 0, itemToPlace);
            this.createElementsForTiles(this.animation.tiles);
        };
        animatedTypeCreator.prototype.removeTile = function (tileName) {
            var originalPosition = -1;
            for (var i = 0; i < this.animation.tiles.length; i++) {
                var tile = this.animation.tiles[i];
                if (tile.tileName == tileName) {
                    originalPosition = i;
                }
            }
            this.animation.tiles.splice(originalPosition, 1);
            this.createElementsForTiles(this.animation.tiles);
        };
        animatedTypeCreator.prototype.createElementsForTiles = function (tilesArr) {
            var _this = this;
            var _a, _b;
            while ((_a = this.tilesContainer) === null || _a === void 0 ? void 0 : _a.firstChild) {
                this.tilesContainer.removeChild((_b = this.tilesContainer) === null || _b === void 0 ? void 0 : _b.firstChild);
            }
            tilesArr.forEach(function (tile) {
                var _a;
                (_a = _this.tilesContainer) === null || _a === void 0 ? void 0 : _a.appendChild(_this.createAnimatedLayerItem(tile));
            });
        };
        animatedTypeCreator.prototype.showPreviewOfTile = function (e, targetTile) {
            this.tilePreview.style.display = "inline";
            var target = e.target;
            var rect = target.getBoundingClientRect();
            this.tilePreview.style.top = rect.top + "px";
            this.tilePreview.style.left = window.innerWidth / 2 + "px";
            this.tilePreview.style.width = "256px";
            this.tilePreview.style.height = "256px";
            this.tilePreview.width = 256;
            this.tilePreview.height = 256;
            var drawWidth = targetTile.width;
            var drawHeight = targetTile.height;
            if (drawWidth > 256) {
                drawWidth = 256;
                drawHeight = drawWidth * (targetTile.height / targetTile.width);
            }
            if (drawHeight > 256) {
                drawHeight = 256;
                drawWidth = drawHeight * (targetTile.width / targetTile.height);
            }
            var previewCtx = this.tilePreview.getContext("2d");
            previewCtx === null || previewCtx === void 0 ? void 0 : previewCtx.clearRect(0, 0, this.tilePreview.width, this.tilePreview.height);
            previewCtx === null || previewCtx === void 0 ? void 0 : previewCtx.drawImage(resourcesTiles.resourceNameAndImage[targetTile.resourceName], targetTile.startX, targetTile.startY, targetTile.width, targetTile.height, 0, 0, drawWidth, drawHeight);
        };
        return animatedTypeCreator;
    }());

    var tileSelector = /** @class */ (function () {
        function tileSelector() {
            var _this = this;
            this.saveDatePremadeTilesName = "customAnimatedTilesMetaData_DONT_DELETE";
            this.modal = document.createElement("div");
            this.closeButton = document.createElement("button");
            this.canvasRenderer = document.createElement("canvas");
            this.controls = document.createElement("div");
            this.selectedTileProperties = document.createElement("div");
            this.mouseX = -1;
            this.mouseY = -1;
            this.resourceName = "";
            this.subTileDone = true;
            this.canvasScale = 1;
            this.callbackSubTile = function (exportedTile) { };
            window.node.getJsonData(this.saveDatePremadeTilesName, function (jsonString) {
                if (jsonString != null) {
                    var objectDataOnly_1 = JSON.parse(jsonString);
                    var keys = Object.keys(objectDataOnly_1);
                    keys.forEach(function (key) {
                        tileSelector.resourceCreatedTileAnimations[key] = [];
                        var objDataArray = objectDataOnly_1[key];
                        objDataArray.forEach(function (objMetaData) {
                            tileSelector.resourceCreatedTileAnimations[key].push(tileAnimation.initFromJsonGeneratedObj(objMetaData));
                        });
                    });
                }
            });
            this.modal.className = "modalStandard";
            this.controls.className = "modalTilesControl";
            this.appendControls();
            var createAnimTiles = document.createElement("div");
            createAnimTiles.id = "animTileCreator";
            this.controls.appendChild(createAnimTiles);
            var useTileButton = document.createElement("button");
            useTileButton.innerHTML = "use this tile";
            useTileButton.addEventListener("mouseup", this.clickUseButton.bind(this));
            this.controls.appendChild(useTileButton);
            this.prevCreatedAnimTiles = document.createElement("div");
            this.prevCreatedAnimTiles.style.height = "300px";
            this.prevCreatedAnimTiles.style.overflowY = "scroll";
            this.controls.appendChild(this.prevCreatedAnimTiles);
            this.modal.appendChild(this.controls);
            this.canvasContainer = document.createElement("div");
            this.canvasContainer.style.border = "solid 1px blue";
            this.canvasContainer.style.overflow = "auto";
            this.canvasRenderer.className = "tileModalCanvas";
            this.canvasContainer.appendChild(this.canvasRenderer);
            this.modal.appendChild(this.canvasContainer);
            this.canvasContext = this.canvasRenderer.getContext("2d");
            this.closeButton.className = "modalCloseButton";
            this.closeButton.innerHTML = "Close";
            this.modal.appendChild(this.closeButton);
            this.modal.style.display = "none";
            this.closeButton.addEventListener("mouseup", this.close.bind(this));
            this.selectedTileProperties.innerHTML = "<span>XStart</span><input id='tileStartX' type='number'>";
            this.selectedTileProperties.innerHTML += "<span>YStart</span><input id='tileStartY' type='number'>";
            this.selectedTileProperties.innerHTML += "<span>Width</span><input id='tileWidth' type='number'>";
            this.selectedTileProperties.innerHTML += "<span>Height</span><input id='tileHeight' type='number'>";
            this.modal.appendChild(this.selectedTileProperties);
            var buttonUpdateTile = document.createElement("button");
            buttonUpdateTile.innerHTML = "Update";
            buttonUpdateTile.addEventListener("mouseup", this.updateTileSize.bind(this));
            this.selectedTileProperties.appendChild(buttonUpdateTile);
            this.canvasRenderer.addEventListener("mousemove", this.mouseMoveCanvas.bind(this));
            this.canvasRenderer.addEventListener("mousedown", this.clickCanvas.bind(this));
            this.canvasRenderer.addEventListener("mouseup", this.mouseUpCanvas.bind(this));
            document.body.appendChild(this.modal);
            setInterval(function () {
                _this.renderCanvas();
            }, 500);
            this.tileCreator = new animatedTypeCreator("animTileCreator");
            setInterval(this.resizeCanvas.bind(this), 3000);
        }
        tileSelector.prototype.updateTileSize = function () {
            var gridWidth = parseInt(document.getElementById("gridWidthIn").value);
            var gridHeight = parseInt(document.getElementById("gridHeightIn").value);
            this.tileCreator.tempSubTile.startX = parseInt(document.getElementById("tileStartX").value) * gridWidth;
            this.tileCreator.tempSubTile.startY = parseInt(document.getElementById("tileStartY").value) * gridHeight;
            this.tileCreator.tempSubTile.width = parseInt(document.getElementById("tileWidth").value) * gridWidth;
            this.tileCreator.tempSubTile.height = parseInt(document.getElementById("tileHeight").value) * gridHeight;
            this.renderCanvas();
        };
        tileSelector.prototype.clickUseButton = function () {
            var _this = this;
            if (this.tileCreator.animation != null) {
                var tileAnimation_1 = this.tileCreator.getTileStack();
                if (tileAnimation_1.name == "") {
                    if (tileAnimation_1.tiles.length > 1) {
                        window.node.prompt("", "At what speed whould the animation play? [0 - 1]", function (input) {
                            if (input != null) {
                                var floatValue = parseFloat(input);
                                if (isNaN(floatValue) == false) {
                                    _this.createAnimationStackFinalize(floatValue);
                                }
                            }
                        });
                    }
                    else {
                        this.createAnimationStackFinalize(0);
                    }
                }
                else {
                    this.callbackSubTile(tileAnimation_1);
                }
            }
        };
        tileSelector.prototype.createAnimationStackFinalize = function (animationSpeed) {
            var _this = this;
            window.node.prompt("", "Create a name for the animation stack", function (name) {
                if (name != null) {
                    var tileAnimation_2 = _this.tileCreator.getTileStack();
                    tileAnimation_2.name = name;
                    tileAnimation_2.animationSpeed = animationSpeed;
                    if (tileSelector.resourceCreatedTileAnimations[_this.resourceName] == null) {
                        tileSelector.resourceCreatedTileAnimations[_this.resourceName] = [];
                    }
                    tileSelector.resourceCreatedTileAnimations[_this.resourceName].push(tileAnimation_2);
                    window.node.saveJsonData(_this.saveDatePremadeTilesName, JSON.stringify(tileSelector.resourceCreatedTileAnimations));
                    _this.callbackSubTile(tileAnimation_2);
                }
            });
        };
        tileSelector.prototype.mouseUpCanvas = function (e) {
            this.subTileDone = true;
            var gridWidth = parseInt(document.getElementById("gridWidthIn").value);
            var gridHeight = parseInt(document.getElementById("gridHeightIn").value);
            document.getElementById("tileStartX").value = (this.tileCreator.tempSubTile.startX / gridWidth) + "";
            document.getElementById("tileStartY").value = (this.tileCreator.tempSubTile.startY / gridHeight) + "";
            document.getElementById("tileWidth").value = (this.tileCreator.tempSubTile.width / gridWidth) + "";
            document.getElementById("tileHeight").value = (this.tileCreator.tempSubTile.height / gridHeight) + "";
        };
        tileSelector.prototype.clickCanvas = function (e) {
            this.subTileDone = false;
            var x = e.clientX;
            var y = e.clientY;
            var rect = this.canvasRenderer.getBoundingClientRect();
            x -= rect.left;
            y -= rect.top;
            var gridWidth = parseInt(document.getElementById("gridWidthIn").value);
            var gridHeight = parseInt(document.getElementById("gridHeightIn").value);
            var gridXOffset = parseInt(document.getElementById("gridXOffset").value);
            var gridYOffset = parseInt(document.getElementById("gridYOffset").value);
            this.tileCreator.tempSubTile = new subTileMeta(this.resourceName, (Math.floor(x / gridWidth) * gridWidth) + gridXOffset, (Math.floor(y / gridHeight) * gridHeight) + gridYOffset, 0, 0);
        };
        tileSelector.prototype.mouseMoveCanvas = function (e) {
            var x = e.clientX;
            var y = e.clientY;
            var rect = this.canvasRenderer.getBoundingClientRect();
            x -= rect.left;
            y -= rect.top;
            this.mouseX = x;
            this.mouseY = y;
            this.renderCanvas();
        };
        tileSelector.prototype.initCanvas = function () {
        };
        tileSelector.prototype.appendControls = function () {
            var controllerHTML = '<label for="gridWidthIn">Grid width:</label><input id="gridWidthIn" type="number" value="32"><br>';
            controllerHTML += '<label for="gridHeightIn">Grid height:</label><input id="gridHeightIn" type="number" value="32"><br>';
            controllerHTML += '<label for="gridXOffset">Grid x offset:</label><input id="gridXOffset" type="number" value="0"><br>';
            controllerHTML += '<label for="gridYOffset">Grid y offset:</label><input id="gridYOffset" type="number" value="0"><br>';
            this.controls.innerHTML = controllerHTML;
        };
        tileSelector.prototype.close = function () {
            window.node.saveJsonData(this.saveDatePremadeTilesName, JSON.stringify(tileSelector.resourceCreatedTileAnimations));
            this.modal.style.display = "none";
        };
        tileSelector.prototype.open = function (imageSource, resourceName, tileDoneCallback) {
            this.tileCreator.setTileSet(new tileAnimation());
            this.callbackSubTile = tileDoneCallback;
            this.resourceName = resourceName;
            if (resourcesTiles.resourceNameAndImage[resourceName] == null) {
                this.loadResource(imageSource, resourceName);
            }
            else {
                this.renderCanvas();
            }
            while (this.prevCreatedAnimTiles.firstChild) {
                this.prevCreatedAnimTiles.removeChild(this.prevCreatedAnimTiles.firstChild);
            }
            this.populateStoredTileAnimations(resourceName);
            this.modal.style.display = "flex";
        };
        tileSelector.prototype.resizeCanvas = function () {
            if (this.resourceName != null && resourcesTiles.resourceNameAndImage[this.resourceName] != undefined && resourcesTiles.resourceNameAndImage[this.resourceName].complete) {
                this.canvasRenderer.width = resourcesTiles.resourceNameAndImage[this.resourceName].width + 640;
                this.canvasRenderer.height = resourcesTiles.resourceNameAndImage[this.resourceName].height + 640;
                this.canvasRenderer.style.width = (resourcesTiles.resourceNameAndImage[this.resourceName].width + 640) + "px";
                this.canvasRenderer.style.height = (resourcesTiles.resourceNameAndImage[this.resourceName].height + 640) + "px";
            }
            this.renderCanvas();
        };
        tileSelector.prototype.loadResource = function (imageSource, resourceName) {
            var _this = this;
            resourcesTiles.resourceNameAndImage[resourceName] = new Image();
            resourcesTiles.resourceNameAndImage[resourceName].onload = function () {
                var _a;
                _this.resizeCanvas();
                (_a = _this.canvasContext) === null || _a === void 0 ? void 0 : _a.drawImage(resourcesTiles.resourceNameAndImage[resourceName], 0, 0);
                _this.renderCanvas();
            };
            resourcesTiles.resourceNameAndImage[resourceName].src = imageSource;
        };
        tileSelector.prototype.populateStoredTileAnimations = function (resourceName) {
            var _this = this;
            while (this.prevCreatedAnimTiles.firstChild) {
                this.prevCreatedAnimTiles.removeChild(this.prevCreatedAnimTiles.firstChild);
            }
            if (tileSelector.resourceCreatedTileAnimations[resourceName] != null) {
                var alreadyCreatedTileSets = tileSelector.resourceCreatedTileAnimations[resourceName];
                alreadyCreatedTileSets.forEach(function (tileSet) {
                    var containerItem = document.createElement("div");
                    var newTileSetItem = document.createElement("div");
                    newTileSetItem.innerHTML = tileSet.name;
                    newTileSetItem.addEventListener("mouseup", function () {
                        _this.tileCreator.setTileSet(tileSet);
                    });
                    containerItem.appendChild(newTileSetItem);
                    var deleteButton = document.createElement("button");
                    deleteButton.innerHTML = "delete";
                    deleteButton.addEventListener("mouseup", function () {
                        var pos = tileSelector.resourceCreatedTileAnimations[resourceName].indexOf(tileSet);
                        tileSelector.resourceCreatedTileAnimations[resourceName].splice(pos, 1);
                        if (tileSelector.resourceCreatedTileAnimations[resourceName].length == 0) {
                            delete tileSelector.resourceCreatedTileAnimations[resourceName];
                        }
                        _this.populateStoredTileAnimations(resourceName);
                        if (_this.tileCreator.animation.name == tileSet.name) {
                            _this.tileCreator.animation = new tileAnimation();
                            _this.tileCreator.tempSubTile = null;
                        }
                    });
                    containerItem.appendChild(deleteButton);
                    _this.prevCreatedAnimTiles.appendChild(containerItem);
                });
            }
        };
        tileSelector.prototype.renderGrid = function () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            var gridWidth = parseInt(document.getElementById("gridWidthIn").value);
            var gridHeight = parseInt(document.getElementById("gridHeightIn").value);
            var gridXOffset = parseInt(document.getElementById("gridXOffset").value);
            var gridYOffset = parseInt(document.getElementById("gridYOffset").value);
            if (gridWidth <= 0 || isNaN(gridWidth)) {
                gridWidth = 1;
            }
            if (gridHeight <= 0 || isNaN(gridHeight)) {
                gridHeight = 1;
            }
            if (gridXOffset <= 0 || isNaN(gridXOffset)) {
                gridXOffset = 0;
            }
            if (gridYOffset <= 0 || isNaN(gridYOffset)) {
                gridYOffset = 0;
            }
            var horizontalLines = Math.round(this.canvasRenderer.height / gridHeight) + 2;
            var verticallines = Math.round(this.canvasRenderer.width / gridWidth) + 2;
            this.canvasContext.strokeStyle = 'black';
            this.canvasContext.lineWidth = 0.5;
            for (var i = 0; i < horizontalLines; i++) {
                (_a = this.canvasContext) === null || _a === void 0 ? void 0 : _a.beginPath();
                (_b = this.canvasContext) === null || _b === void 0 ? void 0 : _b.moveTo(0.5 + (gridXOffset % gridWidth) - gridWidth, (i) * gridHeight + 0.5 + (gridYOffset % gridHeight) - gridHeight);
                (_c = this.canvasContext) === null || _c === void 0 ? void 0 : _c.lineTo(this.canvasRenderer.width + 0.5 + (gridXOffset % gridWidth) - gridWidth, (i) * gridHeight + 0.5 + (gridYOffset % gridHeight) - gridHeight);
                (_d = this.canvasContext) === null || _d === void 0 ? void 0 : _d.stroke();
            }
            for (var i = 0; i < verticallines; i++) {
                (_e = this.canvasContext) === null || _e === void 0 ? void 0 : _e.beginPath();
                (_f = this.canvasContext) === null || _f === void 0 ? void 0 : _f.moveTo((i) * gridWidth + 0.5 + (gridXOffset % gridWidth) - gridWidth, this.canvasRenderer.height + (i) * gridWidth + 0.5 + (gridYOffset % gridHeight) - gridHeight);
                (_g = this.canvasContext) === null || _g === void 0 ? void 0 : _g.lineTo((i) * gridWidth + 0.5 + (gridXOffset % gridWidth) - gridWidth, 0.5 + (gridYOffset % gridHeight) - gridHeight);
                (_h = this.canvasContext) === null || _h === void 0 ? void 0 : _h.stroke();
            }
            this.canvasContext.lineWidth = 1;
            var mouseGridX = (Math.round(this.mouseX / gridWidth) * gridWidth) + gridXOffset;
            var mouseGridY = (Math.round(this.mouseY / gridHeight) * gridHeight) + gridYOffset;
            this.canvasContext.strokeStyle = 'red';
            if (this.tileCreator.tempSubTile != null) {
                this.canvasContext.beginPath();
                this.canvasContext.rect(this.tileCreator.tempSubTile.startX, this.tileCreator.tempSubTile.startY, this.tileCreator.tempSubTile.width, this.tileCreator.tempSubTile.height);
                this.canvasContext.stroke();
                if (this.subTileDone == false) {
                    this.tileCreator.tempSubTile.width = mouseGridX - this.tileCreator.tempSubTile.startX;
                    this.tileCreator.tempSubTile.height = mouseGridY - this.tileCreator.tempSubTile.startY;
                }
            }
            else if (this.mouseX != -1 || this.mouseY != -1) {
                this.canvasContext.beginPath();
                this.canvasContext.rect(mouseGridX, mouseGridY, gridWidth, gridHeight);
                this.canvasContext.stroke();
            }
        };
        tileSelector.prototype.renderCanvas = function () {
            var _a, _b;
            (_a = this.canvasContext) === null || _a === void 0 ? void 0 : _a.clearRect(0, 0, this.canvasRenderer.width, this.canvasRenderer.height);
            if (this.resourceName != "") {
                (_b = this.canvasContext) === null || _b === void 0 ? void 0 : _b.drawImage(resourcesTiles.resourceNameAndImage[this.resourceName], 0, 0);
            }
            //Render lines
            this.renderGrid();
        };
        tileSelector.resourceCreatedTileAnimations = {};
        return tileSelector;
    }());

    var fileSystemHandlerResources = /** @class */ (function () {
        function fileSystemHandlerResources(canvasHandler, cursor) {
            var _this = this;
            this.generateObjects = new objectGenerator();
            this.app = new PIXI.Application();
            this.parameters = {
                itemName: "File",
                disableInteraction: true,
                onlyUniqueNames: true,
                createItemButtonOn: true,
                canResize: false
            };
            this.preLoadedImage = false;
            this.savedImageDataUrls = {};
            this.tileHandler = new tileSelector();
            this.cursor = cursor;
            this.canvasHandler = canvasHandler;
            this.system = new prettyFiles.init().getInit("fileSystemResources", this.parameters);
            this.system.onCreateNewFile = this.onCreateNewFile.bind(this);
            this.system.onClickFile = this.onClickFile.bind(this);
            document.body.appendChild(this.app.view);
            window.node.getFolderContent("../../resources", function (returnData) {
                returnData.forEach(function (room) {
                    room[0] = room[0].substr(room[0].indexOf("resources"));
                });
                returnData = returnData.filter(function (x) { return x.indexOf(".ogg") == -1 && x.indexOf(".wav") == -1; });
                _this.populateFileSystem(returnData);
            });
        }
        fileSystemHandlerResources.prototype.populateFileSystem = function (roomData) {
            var _this = this;
            var dataToInsertIntoFileSystem = [];
            var idCounter = 0;
            roomData.forEach(function (roomMeta) {
                var roomSrc = roomMeta[0];
                roomMeta[1];
                var roomDirParts = roomSrc.split("/");
                var currentFolder = null;
                roomDirParts.forEach(function (item) {
                    if (item != "..") {
                        var newEntry = void 0;
                        if (item.indexOf(".") != -1 && item.indexOf(".json") == -1) {
                            //It's a file
                            var nameOnly = item.split(".")[0];
                            newEntry = new fileSystemEntry("file", nameOnly, [], idCounter, [roomSrc, roomSrc]);
                            _this.tileHandler.loadResource("../../" + roomSrc, roomSrc);
                            //newEntry.image = this.savedImageDataUrls[nameOnly];
                            if (currentFolder == null) {
                                dataToInsertIntoFileSystem.push(newEntry);
                            }
                            else {
                                currentFolder.contains.push(newEntry);
                            }
                        }
                        else if (item.indexOf(".json") == -1) {
                            //It's a folder
                            //Check if folder already exists
                            var foundFolder = false;
                            if (currentFolder == null) {
                                for (var _i = 0, dataToInsertIntoFileSystem_1 = dataToInsertIntoFileSystem; _i < dataToInsertIntoFileSystem_1.length; _i++) {
                                    var elem = dataToInsertIntoFileSystem_1[_i];
                                    if (elem.type == "folder" && elem.name == item) {
                                        currentFolder = elem;
                                        foundFolder = true;
                                        break;
                                    }
                                }
                            }
                            else {
                                for (var _a = 0, _b = currentFolder.contains; _a < _b.length; _a++) {
                                    var elem = _b[_a];
                                    if (elem.type == "folder" && elem.name == item) {
                                        currentFolder = elem;
                                        foundFolder = true;
                                        break;
                                    }
                                }
                            }
                            if (foundFolder == false) {
                                newEntry = new fileSystemEntry("folder", item, [], idCounter, undefined);
                                if (currentFolder == null) {
                                    dataToInsertIntoFileSystem.push(newEntry);
                                }
                                else {
                                    currentFolder.contains.push(newEntry);
                                }
                                currentFolder = newEntry;
                            }
                        }
                        //let newFolderId = this.system.createFolder(item);
                        //console.log(newFolderId);
                        idCounter++;
                    }
                });
            });
            this.system.insertData(JSON.stringify(dataToInsertIntoFileSystem));
        };
        fileSystemHandlerResources.prototype.getFileSystemElement = function () {
            return document.getElementById("fileSystemObjects");
        };
        fileSystemHandlerResources.prototype.onClickFile = function (fileClicked, id, image, customData) {
            var _this = this;
            this.tileHandler.open("../../" + customData[1], customData[0], function (subtile) {
                _this.cursor.objectSelected = null;
                _this.cursor.currentSubTile = subtile;
                _this.tileHandler.close();
            });
        };
        fileSystemHandlerResources.prototype.onCreateNewFile = function (name, id, proceed) {
            var _this = this;
            if (this.preLoadedImage == false) {
                this.system.prompt("Image", "Include an image source", "", function (input) {
                    if (input != null && input.replace(/ /g, '') != '') {
                        _this.system.sticker = input;
                        if (proceed()) {
                            _this.system.sticker = input;
                        }
                    }
                });
            }
            else {
                if (proceed()) {
                    this.system.sticker = new Image();
                }
            }
        };
        return fileSystemHandlerResources;
    }());

    var roomHandler = /** @class */ (function () {
        function roomHandler(roomsLoadedCallbackExternal) {
            this.roomData = [];
            this.roomsLoadedCallbackExternal = roomsLoadedCallbackExternal;
            window.node.getFolderContent("../../scenes", this.roomsLoadedCallback.bind(this));
        }
        roomHandler.prototype.getRoomData = function () {
            return this.roomData;
        };
        roomHandler.prototype.roomsLoadedCallback = function (returnData) {
            returnData.forEach(function (room) {
                room[0] = room[0].substr(room[0].indexOf("scenes"));
            });
            this.roomData = returnData;
            this.roomsLoadedCallbackExternal();
            //console.log(this.roomSelector);
        };
        return roomHandler;
    }());

    var fileSystemHandlerRooms = /** @class */ (function () {
        function fileSystemHandlerRooms(canvasHandler) {
            var _this = this;
            this.parameters = {
                itemName: "File",
                disableInteraction: true,
                onlyUniqueNames: false,
                createItemButtonOn: true,
                canResize: false
            };
            this.preLoadedImage = false;
            this.currentRoom = [];
            this.canvasHandler = canvasHandler;
            this.system = new prettyFiles.init().getInit("fileSystemRoom", this.parameters);
            this.system.onCreateNewFile = this.onCreateNewFile.bind(this);
            this.system.onClickFile = this.onClickFile.bind(this);
            this.roomManager = new roomHandler(function () {
                _this.populateFileSystem(_this.roomManager.getRoomData());
            });
        }
        fileSystemHandlerRooms.prototype.populateFileSystem = function (roomData) {
            var dataToInsertIntoFileSystem = [];
            var idCounter = 0;
            roomData.forEach(function (roomMeta) {
                console.log("roomMeta: ", roomMeta);
                if (roomMeta[0] != 'scenes/scene_index.ts') {
                    var roomSrc_1 = roomMeta[0];
                    var roomData_1 = roomMeta[1];
                    var roomDirParts = roomSrc_1.split("/");
                    var currentFolder_1 = null;
                    roomDirParts.forEach(function (item) {
                        if (item != "..") {
                            var newEntry = void 0;
                            if (item.indexOf(".ts") != -1) {
                                //It's a file
                                newEntry = new fileSystemEntry("file", item, [], idCounter, [roomSrc_1, roomData_1]);
                                if (currentFolder_1 == null) {
                                    dataToInsertIntoFileSystem.push(newEntry);
                                }
                                else {
                                    currentFolder_1.contains.push(newEntry);
                                }
                            }
                            else {
                                //It's a folder
                                //Check if folder already exists
                                var foundFolder = false;
                                if (currentFolder_1 == null) {
                                    for (var _i = 0, dataToInsertIntoFileSystem_1 = dataToInsertIntoFileSystem; _i < dataToInsertIntoFileSystem_1.length; _i++) {
                                        var elem = dataToInsertIntoFileSystem_1[_i];
                                        if (elem.type == "folder" && elem.name == item) {
                                            currentFolder_1 = elem;
                                            foundFolder = true;
                                            break;
                                        }
                                    }
                                }
                                else {
                                    for (var _a = 0, _b = currentFolder_1.contains; _a < _b.length; _a++) {
                                        var elem = _b[_a];
                                        if (elem.type == "folder" && elem.name == item) {
                                            currentFolder_1 = elem;
                                            foundFolder = true;
                                            break;
                                        }
                                    }
                                }
                                if (foundFolder == false) {
                                    newEntry = new fileSystemEntry("folder", item, [], idCounter, undefined);
                                    if (currentFolder_1 == null) {
                                        dataToInsertIntoFileSystem.push(newEntry);
                                    }
                                    else {
                                        currentFolder_1.contains.push(newEntry);
                                    }
                                    currentFolder_1 = newEntry;
                                }
                            }
                            //let newFolderId = this.system.createFolder(item);
                            //console.log(newFolderId);
                            idCounter++;
                        }
                    });
                }
            });
            this.system.insertData(JSON.stringify(dataToInsertIntoFileSystem));
        };
        fileSystemHandlerRooms.prototype.getFileSystemElement = function () {
            return document.getElementById("fileSystemRoom");
        };
        fileSystemHandlerRooms.prototype.onClickFile = function (fileClicked, id, image, customData) {
            if (customData[1] == "") {
                customData[1] = "[]";
            }
            this.currentRoom = customData;
            this.canvasHandler.importRoom(fileClicked, LZString.decompressFromEncodedURIComponent(customData[1]));
        };
        fileSystemHandlerRooms.prototype.onCreateNewFile = function (name, id, proceed) {
            var _this = this;
            if (this.preLoadedImage == false) {
                this.system.prompt("Image", "Include an image source", "", function (input) {
                    if (input != null && input.replace(/ /g, '') != '') {
                        _this.system.sticker = input;
                        if (proceed()) {
                            _this.system.sticker = input;
                        }
                    }
                });
            }
            else {
                if (proceed()) {
                    this.system.sticker = new Image();
                }
            }
        };
        fileSystemHandlerRooms.prototype.saveRoom = function (roomDataCompressed) {
            window.node.saveRoom(this.currentRoom[0], roomDataCompressed);
        };
        return fileSystemHandlerRooms;
    }());

    var layer = /** @class */ (function () {
        function layer(layerName, zIndex) {
            this.metaObjectsInLayer = [];
            this.geometriesInLayer = [];
            this.hidden = false;
            this.settings = "{\"scrollSpeedX\": 1, \"scrollSpeedY\": 1}";
            this.layerName = layerName;
            this.zIndex = zIndex;
        }
        return layer;
    }());

    var roomData = /** @class */ (function () {
        function roomData(layerData) {
            this.cameraBoundsX = null;
            this.cameraBoundsY = null;
            this.cameraBoundsWidth = null;
            this.cameraBoundsHeight = null;
            this.backgroundColor = "#FFFFFF";
            this.layerData = layerData;
        }
        return roomData;
    }());

    var objectTypes;
    (function (objectTypes) {
        objectTypes[objectTypes["userObject"] = 0] = "userObject";
        objectTypes[objectTypes["geometry"] = 1] = "geometry";
    })(objectTypes || (objectTypes = {}));

    var userObject = /** @class */ (function () {
        function userObject(x, y, name, tile) {
            this.tile = null;
            this.isCombinationOfTiles = false;
            this.idOfStaticTileCombination = "";
            this.isPartOfCombination = false;
            this.type = objectTypes.userObject;
            this.inputString = "";
            this.geomPoints = [];
            this.missingImage = new Image();
            this.missingImage.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRF/wDj////hdfaxwAAAA5JREFUeJxjCGVYxYCEAR6cA/1tfYfmAAAAAElFTkSuQmCC";
            this.x = x;
            this.y = y;
            this.name = name;
            if (tile != null) {
                this.tile = tileAnimation.initFromJsonGeneratedObj(tile);
            }
        }
        userObject.prototype.isMouseInside = function (mouseX, mouseY, layerHandler) {
            var width = -1;
            var height = -1;
            if (this.tile != null) {
                width = this.tile.get(0).width;
                height = this.tile.get(0).height;
            }
            else {
                if (fileSystemHandlerObjects.classAndImage[this.name] != null) {
                    width = fileSystemHandlerObjects.classAndImage[this.name].width;
                    height = fileSystemHandlerObjects.classAndImage[this.name].height;
                }
                else {
                    width = 98;
                    height = 98;
                }
            }
            if (mouseX - layerHandler.gridXOffset >= this.x &&
                mouseX - layerHandler.gridXOffset < this.x + width &&
                mouseY - layerHandler.gridYOffset >= this.y &&
                mouseY - layerHandler.gridYOffset < this.y + height) {
                return true;
            }
            return false;
        };
        userObject.prototype.drawMouseOverSelection = function (mouseX, mouseY, layerHandler, context) {
            if (this.isMouseInside(mouseX, mouseY, layerHandler)
                && this.isCombinationOfTiles == false) {
                var width = -1;
                var height = -1;
                if (this.tile != null) {
                    width = this.tile.get(0).width;
                    height = this.tile.get(0).height;
                }
                else {
                    if (fileSystemHandlerObjects.classAndImage[this.name] != null) {
                        width = fileSystemHandlerObjects.classAndImage[this.name].width;
                        height = fileSystemHandlerObjects.classAndImage[this.name].height;
                    }
                    else {
                        width = 98;
                        height = 98;
                    }
                }
                context.strokeStyle = 'red';
                context.lineWidth = 5;
                context.beginPath();
                context.rect(this.x + layerHandler.gridXOffset - 2.5, this.y + layerHandler.gridYOffset - 2.5, width + 5, height + 5);
                context.closePath();
                context.stroke();
                return true;
            }
            return false;
        };
        userObject.prototype.interact = function (mouseX, mouseY) {
        };
        userObject.prototype.interactClick = function (mouseX, mouseY) {
        };
        userObject.prototype.render = function (xoffset, yoffset, tileCounter, context) {
            console.log("Draw userObject");
            context.beginPath();
            context.arc(this.x + xoffset + 16, this.y + yoffset + 16, 16, 0, 2 * Math.PI, false);
            context.fillStyle = 'white';
            context.fill();
            context.lineWidth = 5;
            context.strokeStyle = 'blue';
            context.stroke();
            if (this.tile == null) {
                if (fileSystemHandlerObjects.classAndImage[this.name] != null) {
                    if (fileSystemHandlerObjects.classAndImage[this.name].complete) {
                        context.drawImage(fileSystemHandlerObjects.classAndImage[this.name], this.x + xoffset, this.y + yoffset);
                    }
                }
                else {
                    if (this.missingImage.complete) {
                        context.drawImage(this.missingImage, 0, 0, 8, 8, this.x + xoffset, this.y + yoffset, 98, 98);
                    }
                }
            }
            else {
                var tileToDraw = this.tile.get(tileCounter);
                if (resourcesTiles.resourceNameAndImage[tileToDraw.resourceName] != null) {
                    context.drawImage(resourcesTiles.resourceNameAndImage[tileToDraw.resourceName], tileToDraw.startX, tileToDraw.startY, tileToDraw.width, tileToDraw.height, this.x + xoffset, this.y + yoffset, tileToDraw.width, tileToDraw.height);
                }
                else {
                    if (this.missingImage.complete) {
                        context.drawImage(this.missingImage, tileToDraw.startX, tileToDraw.startY, tileToDraw.width, tileToDraw.height, this.x + xoffset, this.y + yoffset, tileToDraw.width, tileToDraw.height);
                    }
                }
            }
        };
        return userObject;
    }());

    var layerCompressor = /** @class */ (function () {
        function layerCompressor() {
        }
        layerCompressor.compressRoom = function (roomName, layerData) {
            window.node.clearPreviouslyGeneratedImages(roomName);
            var compressed = [];
            //Loop through each layer and compress
            layerData.forEach(function (l) {
                var compressedLayer = layerCompressor.compressLayer(l, roomName);
                compressed.push(compressedLayer);
            });
            var compressedRoom = new roomData(compressed);
            compressedRoom.cameraBoundsX = parseInt(document.getElementById("cameraBoundsX").value);
            compressedRoom.cameraBoundsY = parseInt(document.getElementById("cameraBoundsY").value);
            compressedRoom.cameraBoundsWidth = parseInt(document.getElementById("cameraBoundsWidth").value);
            compressedRoom.cameraBoundsHeight = parseInt(document.getElementById("cameraBoundsHeight").value);
            compressedRoom.backgroundColor = document.getElementById("backgroundColorInput").value;
            console.log("Exported room: ", compressedRoom);
            return compressedRoom;
        };
        layerCompressor.compressLayer = function (l, roomName) {
            //remove old combined tiles
            window.node.removeOldCompiledTiles(roomName);
            //get each static tile from the layer
            var compressedLayer = new layer(l.layerName, l.zIndex);
            compressedLayer.hidden = l.hidden;
            compressedLayer.settings = l.settings;
            for (var _i = 0, _a = l.metaObjectsInLayer; _i < _a.length; _i++) {
                var d = _a[_i];
                if (d.type == objectTypes.userObject) {
                    if (d.tile != null) {
                        d.isPartOfCombination = false;
                    }
                }
            }
            var staticTiles = l.metaObjectsInLayer.filter(function (t) { return t.type == objectTypes.userObject
                && t.tile != null
                && t.tile.tiles.length == 1; });
            if (staticTiles.length > 0) {
                var combinedStaticTiles_1 = layerCompressor.combineStaticTilesIntoOne(staticTiles, roomName);
                compressedLayer.metaObjectsInLayer.push(combinedStaticTiles_1);
                //Mark static tiles that were combined
                for (var _b = 0, staticTiles_1 = staticTiles; _b < staticTiles_1.length; _b++) {
                    var t = staticTiles_1[_b];
                    t.isPartOfCombination = true;
                }
                staticTiles.forEach(function (tile) {
                    tile.idOfStaticTileCombination = combinedStaticTiles_1.name;
                    compressedLayer.metaObjectsInLayer.push(tile);
                });
            }
            var nonStaticTiles = l.metaObjectsInLayer.filter(function (t) { return t.type == objectTypes.userObject
                && t.tile != null && t.tile.tiles.length > 1; });
            for (var _c = 0, nonStaticTiles_1 = nonStaticTiles; _c < nonStaticTiles_1.length; _c++) {
                var t = nonStaticTiles_1[_c];
                compressedLayer.metaObjectsInLayer.push(t);
            }
            //add rest of the objects to the layer
            l.metaObjectsInLayer.forEach(function (obj) {
                if (obj.type == objectTypes.userObject && obj.tile == null) {
                    compressedLayer.metaObjectsInLayer.push(obj);
                }
            });
            //add geometries
            var layerGeometries = l.metaObjectsInLayer.filter(function (t) { return t.type == objectTypes.geometry; });
            var geomDataOnly = [];
            layerGeometries.forEach(function (geom) {
                geomDataOnly.push(geom.getDataObject());
            });
            compressedLayer.geometriesInLayer = geomDataOnly;
            return compressedLayer;
        };
        layerCompressor.combineStaticTilesIntoOne = function (staticTiles, roomName) {
            var canvas = document.createElement("canvas");
            var ctx = canvas.getContext("2d");
            var width = 0;
            var height = 0;
            var xStart = null;
            var yStart = null;
            //Resize the canvas to fit all tiles
            staticTiles.forEach(function (obj) {
                if (xStart == null || obj.x < xStart) {
                    xStart = obj.x;
                }
                if (yStart == null || obj.y < yStart) {
                    yStart = obj.y;
                }
            });
            staticTiles.forEach(function (obj) {
                if ((obj.x + obj.tile.tiles[0].width) - xStart > width) {
                    width = (obj.x + obj.tile.tiles[0].width) - xStart;
                }
                if ((obj.y + obj.tile.tiles[0].height) - yStart > height) {
                    height = (obj.y + obj.tile.tiles[0].height) - yStart;
                }
            });
            canvas.width = width;
            canvas.height = height;
            canvas.style.width = width + "px";
            canvas.style.height = height + "px";
            //Render tiles
            staticTiles.forEach(function (tile) {
                var tileDraw = tile.tile.tiles[0];
                var image = resourcesTiles.resourceNameAndImage[tileDraw.resourceName];
                console.log(image.src);
                if (image == null) {
                    console.log("tile: ", tile);
                    console.log("Image is null ", image);
                }
                ctx === null || ctx === void 0 ? void 0 : ctx.drawImage(image, tileDraw.startX, tileDraw.startY, tileDraw.width, tileDraw.height, tile.x - xStart, tile.y - yStart, tileDraw.width, tileDraw.height);
            });
            var generatedName = uidGen.new() + ".png";
            canvas.toBlob(function (blob) {
                if (blob != null) {
                    console.log(blob);
                    blob.arrayBuffer().then(function (buffer) {
                        return window.node.saveCompiledTiles(roomName, generatedName, buffer);
                    });
                }
                else {
                    console.log("Blob is null, staticTiles: ", staticTiles);
                }
            });
            var newTile = new subTileMeta(generatedName, xStart, yStart, width, height);
            var combinedTiles = new tileAnimation([newTile]);
            var compressetMeta = new userObject(xStart, yStart, generatedName, combinedTiles);
            compressetMeta.isCombinationOfTiles = true;
            return compressetMeta;
        };
        return layerCompressor;
    }());

    var geomObjData = /** @class */ (function () {
        function geomObjData() {
            this.x = 0;
            this.y = 0;
            this.geomWidth = 128;
            this.geomPoints = [];
        }
        return geomObjData;
    }());

    var geometryObject = /** @class */ (function () {
        function geometryObject(x, y) {
            this.name = "Geometry";
            this.inputString = "";
            this.geomWidth = 128;
            //geomHeight: number = 128;
            this.geomPoints = [32, 32, 32];
            this.type = objectTypes.geometry;
            this.tile = null;
            this.isCombinationOfTiles = false;
            this.idOfStaticTileCombination = "";
            this.isPartOfCombination = false;
            this.mouseInteractX = -100000;
            this.mouseInteractY = -100000;
            this.selectedEdgeIndex = -1;
            this.mouseHoverOver = false;
            this._lineWidth = 1;
            this.x = x;
            this.y = y;
        }
        geometryObject.prototype.getDataObject = function () {
            var dataObj = new geomObjData();
            dataObj.x = this.x;
            dataObj.y = this.y;
            dataObj.geomWidth = this.geomWidth;
            dataObj.geomPoints = this.geomPoints;
            return dataObj;
        };
        geometryObject.prototype.isMouseInside = function (mouseX, mouseY, layerHandler) {
            var highestPoint = Math.max.apply(Math, this.geomPoints);
            var lowestPoint = Math.min.apply(Math, this.geomPoints);
            if (mouseX - layerHandler.gridXOffset >= this.x - 10 &&
                mouseX - layerHandler.gridXOffset < this.x + this.geomWidth + 10 &&
                mouseY - layerHandler.gridYOffset <= this.y + 10 + Math.abs(lowestPoint) &&
                mouseY - layerHandler.gridYOffset > this.y - highestPoint - 10) {
                return true;
            }
            return false;
        };
        geometryObject.prototype.drawMouseOverSelection = function (mouseX, mouseY, layerHandler, context) {
            if (this.isMouseInside(mouseX, mouseY, layerHandler)) {
                this.mouseHoverOver = true;
                this._lineWidth = 5;
                this.render(layerHandler.gridXOffset, layerHandler.gridYOffset, 0, context);
                this._lineWidth = 1;
            }
            this.mouseHoverOver = false;
            return false;
        };
        geometryObject.prototype.interact = function (mouseX, mouseY, allGeometries) {
            var _this = this;
            this.mouseInteractX = mouseX;
            this.mouseInteractY = mouseY;
            var pointSpacing = this.geomWidth / (this.geomPoints.length - 1);
            if (this.selectedEdgeIndex >= 0) {
                this.geomPoints[this.selectedEdgeIndex] = Math.round(this.y - this.mouseInteractY);
                var _loop_1 = function () {
                    var geomCast = geom;
                    var index = 0;
                    geomCast.geomPoints.forEach(function (point) {
                        var thisGeomSpacing = geom.geomWidth / (geom.geomPoints.length - 1);
                        if (geom.x + (thisGeomSpacing * index) == _this.x + (pointSpacing * _this.selectedEdgeIndex)) {
                            geom.geomPoints[index] = _this.geomPoints[_this.selectedEdgeIndex];
                        }
                        index++;
                    });
                };
                for (var _i = 0, allGeometries_1 = allGeometries; _i < allGeometries_1.length; _i++) {
                    var geom = allGeometries_1[_i];
                    _loop_1();
                }
            }
            else if (this.selectedEdgeIndex == -2) {
                this.geomWidth = Math.abs(this.x - mouseX);
            }
        };
        geometryObject.prototype.closestPowerOf2 = function (numToRound) {
            var testNumber = 0;
            while (Math.pow(2, testNumber) < numToRound) {
                testNumber++;
            }
            return Math.pow(2, testNumber);
        };
        geometryObject.prototype.interactClick = function (mouseX, mouseY) {
            var _this = this;
            this.geomWidth = this.closestPowerOf2(this.geomWidth);
            if (this.selectedEdgeIndex == -1) {
                var pointSpacing = this.geomWidth / (this.geomPoints.length - 1);
                var edgesPoints = [];
                for (var i = 0; i < this.geomPoints.length; i++) {
                    var pointY = this.geomPoints[i];
                    edgesPoints.push([this.x + (i * pointSpacing), this.y - pointY]);
                }
                var circlePoints = this.getPointsAndMouseStatus(edgesPoints, mouseX, mouseY);
                var selectedPoints = circlePoints.filter(function (x) { return x[1][0]; });
                selectedPoints.forEach(function (sPoint) {
                    _this.selectedEdgeIndex = sPoint[1][1];
                });
                if (this.selectedEdgeIndex == -1) {
                    var lineMiddlePoints = [];
                    for (var i = 0; i < edgesPoints.length; i++) {
                        if (i + 1 < edgesPoints.length - 1) {
                            var point1 = edgesPoints[i];
                            var point2 = edgesPoints[i + 1];
                            var yDiff = point2[1] - point1[1];
                            var boxX = point1[0] + (pointSpacing / 2);
                            var boxY = point1[1] + (yDiff / 2);
                            lineMiddlePoints.push([boxX, boxY]);
                        }
                    }
                    var rectPoint = this.getPointsAndMouseStatus(lineMiddlePoints, mouseX, mouseY);
                    rectPoint.forEach(function (rect) {
                        if (rect[1][0]) {
                            var highestPoint = Math.max.apply(Math, _this.geomPoints);
                            _this.geomPoints.splice(rect[1][1] + 1, 0, highestPoint);
                        }
                    });
                    //Check drag width point
                    var widthDragPoint = [];
                    widthDragPoint.push([this.x + ((this.geomPoints.length - 1) * pointSpacing), this.y]);
                    var widthDragPointStatus = this.getPointsAndMouseStatus(widthDragPoint, this.mouseInteractX, this.mouseInteractY);
                    widthDragPointStatus.forEach(function (point) {
                        if (point[1][0] == true) {
                            _this.selectedEdgeIndex = -2;
                        }
                    });
                }
            }
            else {
                this.selectedEdgeIndex = -1;
            }
        };
        geometryObject.prototype.render = function (xOffset, yOffset, tileCounter, ctx) {
            var pointSpacing = this.geomWidth / (this.geomPoints.length - 1);
            var edgesPoints = [];
            //Draw lines
            ctx.beginPath();
            ctx.lineWidth = this._lineWidth;
            ctx.moveTo(this.x + xOffset, this.y + yOffset);
            //ctx.lineTo(this.x + xOffset, this.y + yOffset + this.geomHeight);
            for (var i = 0; i < this.geomPoints.length; i++) {
                var pointY = this.geomPoints[i];
                edgesPoints.push([this.x + xOffset + (i * pointSpacing), this.y + yOffset - pointY]);
                ctx.lineTo(this.x + xOffset + (i * pointSpacing), this.y + yOffset - pointY);
            }
            ctx.lineTo(this.x + xOffset + ((this.geomPoints.length - 1) * pointSpacing), this.y + yOffset);
            ctx.closePath();
            ctx.lineWidth = this._lineWidth;
            ctx.strokeStyle = '#f00';
            ctx.fillStyle = 'rgba(0, 0, 200, 0.1)';
            ctx.fill();
            ctx.stroke();
            //calculate rects between points coords
            var lineMiddlePoints = [];
            for (var i = 0; i < edgesPoints.length; i++) {
                if (i + 1 < edgesPoints.length - 1) {
                    var point1 = edgesPoints[i];
                    var point2 = edgesPoints[i + 1];
                    var yDiff = point2[1] - point1[1];
                    var boxX = point1[0] + (pointSpacing / 2);
                    var boxY = point1[1] + (yDiff / 2);
                    lineMiddlePoints.push([boxX, boxY]);
                }
            }
            //draw rects
            var lineMiddlePointsStatus = this.getPointsAndMouseStatus(lineMiddlePoints, this.mouseInteractX + xOffset, this.mouseInteractY + yOffset);
            lineMiddlePointsStatus.forEach(function (lineMiddle) {
                if (lineMiddle[1][0]) {
                    ctx.fillStyle = 'rgba(0, 90, 200, 1)';
                }
                else {
                    ctx.fillStyle = 'rgba(0, 200, 0, 0.8)';
                }
                ctx.fillRect(lineMiddle[0][0] - 3, lineMiddle[0][1] - 3, 6, 6);
            });
            //draw circles
            edgesPoints.push([this.x + xOffset + ((this.geomPoints.length - 1) * pointSpacing), this.y + yOffset]);
            var edgePointsStatus = this.getPointsAndMouseStatus(edgesPoints, this.mouseInteractX + xOffset, this.mouseInteractY + yOffset);
            edgePointsStatus.forEach(function (point) {
                ctx.beginPath();
                if (point[1][0] == true) {
                    ctx.strokeStyle = '#f0f';
                }
                else {
                    ctx.strokeStyle = '#00f';
                }
                ctx.arc(point[0][0], point[0][1], 3, 0, 2 * Math.PI);
                ctx.stroke();
            });
        };
        geometryObject.prototype.getPointsAndMouseStatus = function (points, mouseX, mouseY) {
            var pointsAndStatus = [];
            var index = 0;
            points.forEach(function (point) {
                if (mouseX > point[0] - 8 && mouseX < point[0] + 8
                    && mouseY > point[1] - 16 && mouseY < point[1] + 16) {
                    pointsAndStatus.push([point, [true, index]]);
                }
                else {
                    pointsAndStatus.push([point, [false, index]]);
                }
                index++;
            });
            return pointsAndStatus;
        };
        return geometryObject;
    }());

    var layerContainer = /** @class */ (function () {
        function layerContainer(canvasContext) {
            this.storedLayers = [];
            this.currentRoom = "";
            this.selectedLayer = null;
            this.gridXOffset = 0;
            this.gridYOffset = 0;
            this.ctx = canvasContext;
            this.containerElement = document.getElementById("layerContainer");
        }
        layerContainer.prototype.importRoom = function (clickedFile, jsonString) {
            this.currentRoom = clickedFile;
            var arayOfData = new roomData([]);
            if (jsonString != "") {
                //console.log("jsonString: ",jsonString);
                arayOfData = JSON.parse(jsonString);
                if (arayOfData.cameraBoundsX != undefined) {
                    document.getElementById("cameraBoundsX").value = arayOfData.cameraBoundsX.toString();
                }
                else {
                    document.getElementById("cameraBoundsX").value = "";
                }
                if (arayOfData.cameraBoundsX != undefined) {
                    document.getElementById("cameraBoundsY").value = arayOfData.cameraBoundsY.toString();
                }
                else {
                    document.getElementById("cameraBoundsY").value = "";
                }
                if (arayOfData.cameraBoundsX != undefined) {
                    document.getElementById("cameraBoundsWidth").value = arayOfData.cameraBoundsWidth.toString();
                }
                else {
                    document.getElementById("cameraBoundsWidth").value = "";
                }
                if (arayOfData.cameraBoundsX != undefined) {
                    document.getElementById("cameraBoundsHeight").value = arayOfData.cameraBoundsHeight.toString();
                }
                else {
                    document.getElementById("cameraBoundsHeight").value = "";
                }
                if (arayOfData.backgroundColor != undefined) {
                    document.getElementById("backgroundColorInput").value = arayOfData.backgroundColor.toString();
                }
                else {
                    document.getElementById("backgroundColorInput").value = "0xFFFFFF";
                }
            }
            if (arayOfData.layerData.length == 0) {
                arayOfData.layerData.push(new layer("Layer 1", 0));
            }
            this.storedLayers.length = 0;
            var _loop_1 = function (i) {
                var dataLayer = arayOfData.layerData[i];
                console.log("dataLayer: ", dataLayer);
                var newLayer = new layer(dataLayer.layerName, dataLayer.zIndex);
                newLayer.hidden = dataLayer.hidden;
                if (dataLayer.settings == "undefined" || dataLayer.settings == "" || dataLayer.settings == undefined || dataLayer.settings == null) {
                    dataLayer.settings = "{\"scrollSpeedX\": 1, \"scrollSpeedY\": 1}";
                }
                newLayer.settings = dataLayer.settings;
                dataLayer.metaObjectsInLayer.forEach(function (obj) {
                    if (obj.type == objectTypes.userObject) {
                        if (obj.isCombinationOfTiles == false) {
                            var newObj = new userObject(obj.x, obj.y, obj.name, obj.tile);
                            newObj.inputString = obj.inputString;
                            newLayer.metaObjectsInLayer.push(newObj);
                        }
                    }
                });
                if (dataLayer.geometriesInLayer != undefined) {
                    dataLayer.geometriesInLayer.forEach(function (geom) {
                        var importedGeometry = new geometryObject(geom.x, geom.y);
                        importedGeometry.geomPoints = geom.geomPoints;
                        importedGeometry.geomWidth = geom.geomWidth;
                        newLayer.metaObjectsInLayer.push(importedGeometry);
                    });
                }
                this_1.storedLayers.push(newLayer);
            };
            var this_1 = this;
            for (var i = 0; i < arayOfData.layerData.length; i++) {
                _loop_1(i);
            }
            console.log("this.storedLayers: ", this.storedLayers);
            //populate layer select element
            this.initializeLayerModule(this.storedLayers);
            this.selectFirstLayer();
        };
        layerContainer.prototype.exportRoom = function () {
            return LZString.compressToEncodedURIComponent(JSON.stringify(layerCompressor.compressRoom(this.currentRoom, this.storedLayers)));
        };
        layerContainer.prototype.createLayerOption = function (layerName, hidden) {
            var layerOption = document.createElement("div");
            layerOption.className = "layerOptionContainer";
            layerOption.addEventListener("mouseup", this.clickLayerOption.bind(this));
            var textSpan = document.createElement("span");
            textSpan.innerHTML = layerName;
            layerOption.appendChild(textSpan);
            var moveUpButton = document.createElement("button");
            moveUpButton.innerHTML = "up";
            moveUpButton.addEventListener("mouseup", this.moveLayerUp.bind(this));
            layerOption.appendChild(moveUpButton);
            var moveDownButton = document.createElement("button");
            moveDownButton.innerHTML = "down";
            moveDownButton.addEventListener("mouseup", this.moveLayerDown.bind(this));
            layerOption.appendChild(moveDownButton);
            var hideCheck = document.createElement("input");
            hideCheck.type = "checkbox";
            hideCheck.checked = hidden;
            hideCheck.addEventListener("change", this.clickHideLayer.bind(this));
            layerOption.appendChild(hideCheck);
            var edit = document.createElement("button");
            edit.innerHTML = "edit";
            edit.addEventListener("mouseup", this.setLayerSettings.bind(this));
            layerOption.appendChild(edit);
            this.containerElement.appendChild(layerOption);
            return layerOption;
        };
        layerContainer.prototype.setLayerSettings = function (e) {
            var _a;
            var target = e.target;
            var layerName = (_a = target.parentElement) === null || _a === void 0 ? void 0 : _a.getElementsByTagName("span")[0].innerHTML;
            var clickedLayer = null;
            if (layerName != null) {
                for (var _i = 0, _b = this.storedLayers; _i < _b.length; _i++) {
                    var layer_1 = _b[_i];
                    if (layer_1.layerName == layerName) {
                        clickedLayer = layer_1;
                        break;
                    }
                }
            }
            if (clickedLayer != null) {
                var currentSettings = clickedLayer.settings;
                window.node.promptDefaultText("Type in the name of the layer you want to delete", currentSettings, function (text) {
                    if (text != null) {
                        clickedLayer.settings = text;
                        /*var parsed = JSON.parse(text) as any;
                        let newSpeedX: number = parseFloat(parsed.scrollSpeedX);
                        let newSpeedY: number = parseFloat(parsed.scrollSpeedY);
        
                        clickedLayer!.scrollSpeedX = newSpeedX;
                        clickedLayer!.scrollSpeedY = newSpeedY;*/
                    }
                });
            }
        };
        layerContainer.prototype.clickLayerOption = function (e) {
            var _a;
            var target = e.target;
            var layerName = (_a = target.parentElement) === null || _a === void 0 ? void 0 : _a.getElementsByTagName("span")[0].innerHTML;
            if (layerName != null) {
                for (var _i = 0, _b = this.storedLayers; _i < _b.length; _i++) {
                    var layer_2 = _b[_i];
                    if (layer_2.layerName == layerName) {
                        this.selectLayer(layer_2);
                        break;
                    }
                }
            }
        };
        layerContainer.prototype.selectLayer = function (selectThisLayer) {
            if (selectThisLayer === void 0) { selectThisLayer = null; }
            var layerOptions = document.getElementsByClassName("layerOptionContainer");
            for (var i = 0; i < layerOptions.length; i++) {
                var element = layerOptions[i];
                var elementLayerName = element.getElementsByTagName("span")[0].innerHTML;
                if (selectThisLayer == null && i == 0) {
                    element.className = "layerOptionContainer selectedLayer";
                    this.selectedLayer = selectThisLayer;
                }
                else if (selectThisLayer != null && elementLayerName == selectThisLayer.layerName) {
                    element.className = "layerOptionContainer selectedLayer";
                    this.selectedLayer = selectThisLayer;
                }
                else {
                    element.className = "layerOptionContainer";
                }
            }
        };
        layerContainer.prototype.clickHideLayer = function (e) {
            var _a;
            var target = e.target;
            var layerName = (_a = target.parentElement) === null || _a === void 0 ? void 0 : _a.getElementsByTagName("span")[0].innerHTML;
            if (target.checked && layerName != null) {
                for (var _i = 0, _b = this.storedLayers; _i < _b.length; _i++) {
                    var l = _b[_i];
                    if (l.layerName == layerName) {
                        l.hidden = true;
                        break;
                    }
                }
            }
            else if (target.checked == false && layerName != null) {
                for (var _c = 0, _d = this.storedLayers; _c < _d.length; _c++) {
                    var l = _d[_c];
                    if (l.layerName == layerName) {
                        l.hidden = false;
                        break;
                    }
                }
            }
        };
        layerContainer.prototype.isLayerHidden = function (layerName) {
            for (var _i = 0, _a = this.storedLayers; _i < _a.length; _i++) {
                var layer_3 = _a[_i];
                if (layer_3.layerName == layerName) {
                    return layer_3.hidden;
                }
            }
            return false;
        };
        layerContainer.prototype.addToLayer = function (newObj) {
            if (this.selectedLayer != null) {
                this.selectedLayer.metaObjectsInLayer.push(newObj);
            }
        };
        layerContainer.prototype.hasObjectPos = function (x, y) {
            var _a;
            if (this.selectedLayer != null) {
                for (var _i = 0, _b = (_a = this.selectedLayer) === null || _a === void 0 ? void 0 : _a.metaObjectsInLayer; _i < _b.length; _i++) {
                    var obj = _b[_i];
                    if (obj.x == x && obj.y == y) {
                        return true;
                    }
                }
            }
            return false;
        };
        layerContainer.prototype.getObjectsAtPos = function (mouseTestX, mouseTestY, specificType) {
            var _a;
            if (specificType === void 0) { specificType = null; }
            var foundObjects = [];
            if (this.selectedLayer != null && this.selectedLayer.hidden == false) {
                for (var _i = 0, _b = (_a = this.selectedLayer) === null || _a === void 0 ? void 0 : _a.metaObjectsInLayer; _i < _b.length; _i++) {
                    var obj = _b[_i];
                    if (specificType == null) {
                        if (obj.isMouseInside(mouseTestX, mouseTestY, this)) {
                            foundObjects.push(obj);
                        }
                    }
                    else {
                        if (obj.type == specificType && obj.isMouseInside(mouseTestX, mouseTestY, this)) {
                            foundObjects.push(obj);
                        }
                    }
                }
            }
            return foundObjects;
        };
        layerContainer.prototype.getObjectsOfType = function (type) {
            var _a;
            var returnObjs = [];
            if (this.selectedLayer != null) {
                for (var _i = 0, _b = (_a = this.selectedLayer) === null || _a === void 0 ? void 0 : _a.metaObjectsInLayer; _i < _b.length; _i++) {
                    var obj = _b[_i];
                    if (obj.type == type) {
                        returnObjs.push(obj);
                    }
                }
            }
            return returnObjs;
        };
        layerContainer.prototype.removeObject = function (targetObject) {
            if (targetObject != null && this.selectedLayer != null) {
                this.selectedLayer.metaObjectsInLayer = this.selectedLayer.metaObjectsInLayer.filter(function (x) { return x != targetObject; });
            }
        };
        layerContainer.prototype.moveLayerUp = function (e) {
            var _a;
            var button = e.target;
            var layerName = (_a = button.parentElement) === null || _a === void 0 ? void 0 : _a.getElementsByTagName("span")[0].innerHTML;
            var previousName = undefined;
            if (layerName != undefined) {
                for (var i = 0; i < this.storedLayers.length; i++) {
                    if (this.storedLayers[i].layerName == layerName && i != 0) {
                        previousName = this.storedLayers[i - 1].layerName;
                    }
                }
            }
            this.moveLayerDownInOrder(previousName);
        };
        layerContainer.prototype.moveLayerDown = function (e) {
            var _a;
            var button = e.target;
            var layerName = (_a = button.parentElement) === null || _a === void 0 ? void 0 : _a.getElementsByTagName("span")[0].innerHTML;
            this.moveLayerDownInOrder(layerName);
        };
        layerContainer.prototype.moveLayerDownInOrder = function (layerName) {
            if (layerName != null) {
                for (var _i = 0, _a = this.storedLayers; _i < _a.length; _i++) {
                    var l = _a[_i];
                    if (l.layerName == layerName) {
                        for (var _b = 0, _c = this.storedLayers; _b < _c.length; _b++) {
                            var sl = _c[_b];
                            if (sl.zIndex == l.zIndex + 1) {
                                l.zIndex = l.zIndex ^ sl.zIndex;
                                sl.zIndex = l.zIndex ^ sl.zIndex;
                                l.zIndex = l.zIndex ^ sl.zIndex;
                                break;
                            }
                        }
                        break;
                    }
                }
                this.initializeLayerModule(this.storedLayers);
            }
            if (layerName != null) {
                if (this.selectedLayer != null) {
                    this.selectLayer(this.selectedLayer);
                }
            }
        };
        layerContainer.prototype.initializeLayerModule = function (layers) {
            while (this.containerElement.firstChild) {
                this.containerElement.removeChild(this.containerElement.firstChild);
            }
            layers.sort(function (a, b) {
                return a.zIndex - b.zIndex;
            });
            for (var _i = 0, layers_1 = layers; _i < layers_1.length; _i++) {
                var cLayer = layers_1[_i];
                this.createLayerOption(cLayer.layerName, cLayer.hidden);
            }
        };
        layerContainer.prototype.selectFirstLayer = function () {
            this.selectLayer(this.storedLayers[0]);
        };
        layerContainer.prototype.createNewLayer = function (newLayerName) {
            var nextIndex = 0;
            this.storedLayers.forEach(function (layer) {
                if (layer.zIndex >= nextIndex) {
                    nextIndex = layer.zIndex + 1;
                }
            });
            var newLayer = new layer(newLayerName, nextIndex);
            newLayer.zIndex = nextIndex;
            this.storedLayers.push(newLayer);
            this.initializeLayerModule(this.storedLayers);
            this.selectLayer(newLayer);
        };
        layerContainer.prototype.deleteLayer = function (layerName) {
            if (this.storedLayers.length <= 1) {
                alert("You need to have at least one layer");
                return;
            }
            var layer = this.storedLayers.filter(function (l) { return l.layerName == layerName; })[0];
            if (layer == undefined) {
                alert("The layer does not exist");
            }
            else {
                this.storedLayers = this.storedLayers.filter(function (l) { return l.layerName != layerName; });
                this.initializeLayerModule(this.storedLayers);
                this.selectLayer();
            }
        };
        return layerContainer;
    }());

    var canvasRenderer = /** @class */ (function () {
        function canvasRenderer(canvasName) {
            var _this = this;
            var _a, _b, _c, _d;
            this.gridXOffset = 0;
            this.gridYOffset = 0;
            this.canvasScaleX = 1;
            this.canvasScaleY = 1;
            this.layers = [];
            this.displayCameraBounds = true;
            this.counter = 0;
            this.haveSelectedFromHover = false;
            this.missingImage = new Image();
            this.geometryDummy = new geometryObject(0, 0);
            this.renderGrid = true;
            this.missingImage.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRF/wDj////hdfaxwAAAA5JREFUeJxjCGVYxYCEAR6cA/1tfYfmAAAAAElFTkSuQmCC";
            this.canvas = document.getElementById(canvasName);
            this.ctx = this.canvas.getContext("2d");
            this.gridWidth = 16;
            this.gridHeight = 16;
            this.layerHandler = new layerContainer(this.ctx);
            this.buttonSetSize = document.getElementById("setSizeButton");
            this.buttonZoomIn = document.getElementById("zoomIn");
            this.buttonZoomIn.addEventListener("mouseup", this.zoomIn.bind(this));
            this.buttonZoomOut = document.getElementById("zoomOut");
            this.buttonZoomOut.addEventListener("mouseup", this.zoomOut.bind(this));
            document.addEventListener("keypress", this.keysDown.bind(this));
            this.inputGridx = document.getElementById("gridXInput");
            this.inputGridx.value = this.gridWidth + "";
            this.inputGridy = document.getElementById("gridYInput");
            this.inputGridy.value = this.gridHeight + "";
            this.buttonSetSize.onclick = this.setCanvasWidth.bind(this);
            (_a = document.getElementById("gridXInput")) === null || _a === void 0 ? void 0 : _a.addEventListener("change", this.onGridSizeChange.bind(this));
            (_b = document.getElementById("gridYInput")) === null || _b === void 0 ? void 0 : _b.addEventListener("change", this.onGridSizeChange.bind(this));
            this.cameraBoundButton = document.getElementById("toggleCameraBounds");
            (_c = this.cameraBoundButton) === null || _c === void 0 ? void 0 : _c.addEventListener("click", this.toggleCameraBounds.bind(this));
            this.toggleGridButton = document.getElementById("toggleGrid");
            (_d = this.toggleGridButton) === null || _d === void 0 ? void 0 : _d.addEventListener("click", this.toggleGridRender.bind(this));
            this.container = document.getElementById("canvasAndFilesCon");
            window.onresize = this.windowResize.bind(this);
            setTimeout(function () {
                _this.windowResize();
            }, 800);
        }
        canvasRenderer.prototype.keysDown = function (e) {
            if (e.key == "1") {
                this.zoomIn();
            }
            else if (e.key == "2") {
                this.zoomOut();
            }
            else if (e.key == "g") {
                this.toggleGridRender();
            }
            else if (e.key == "c") {
                this.toggleCameraBounds();
            }
        };
        canvasRenderer.prototype.updateCanvasOffset = function (dx, dy) {
            this.gridXOffset += dx;
            this.gridYOffset += dy;
            this.layerHandler.gridXOffset = this.gridXOffset;
            this.layerHandler.gridYOffset = this.gridYOffset;
        };
        canvasRenderer.prototype.windowResize = function () {
            this.canvas.style.width = window.innerWidth + "px";
            this.canvas.style.height = window.innerHeight + "px";
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        };
        canvasRenderer.prototype.onGridSizeChange = function () {
            var _a, _b;
            this.gridWidth = parseInt(this.inputGridx.value);
            this.gridHeight = parseInt(this.inputGridy.value);
            (_a = this.ctx) === null || _a === void 0 ? void 0 : _a.setTransform(1, 0, 0, 1, 0, 0);
            (_b = this.ctx) === null || _b === void 0 ? void 0 : _b.scale(this.canvasScaleX, this.canvasScaleY);
        };
        canvasRenderer.prototype.zoomIn = function () {
            var _a, _b;
            this.canvasScaleX *= 1.1;
            this.canvasScaleY *= 1.1;
            (_a = this.ctx) === null || _a === void 0 ? void 0 : _a.setTransform(1, 0, 0, 1, 0, 0);
            (_b = this.ctx) === null || _b === void 0 ? void 0 : _b.scale(this.canvasScaleX, this.canvasScaleY);
        };
        canvasRenderer.prototype.zoomOut = function () {
            var _a, _b;
            this.canvasScaleX *= 0.9;
            this.canvasScaleY *= 0.9;
            (_a = this.ctx) === null || _a === void 0 ? void 0 : _a.setTransform(1, 0, 0, 1, 0, 0);
            (_b = this.ctx) === null || _b === void 0 ? void 0 : _b.scale(this.canvasScaleX, this.canvasScaleY);
        };
        canvasRenderer.prototype.toggleCameraBounds = function () {
            this.displayCameraBounds = !this.displayCameraBounds;
        };
        canvasRenderer.prototype.toggleGridRender = function () {
            this.renderGrid = !this.renderGrid;
        };
        canvasRenderer.prototype.setCanvasWidth = function () {
            this.gridWidth = parseInt(this.inputGridx.value);
            this.gridHeight = parseInt(this.inputGridy.value);
        };
        canvasRenderer.prototype.getCanvasMousePositions = function (e) {
            var x = e.clientX;
            var y = e.clientY;
            var rect = this.canvas.getBoundingClientRect();
            x -= rect.left;
            y -= rect.top;
            var ratioScaleX = (this.canvas.width / this.canvasScaleX) / this.canvas.width;
            var ratioScaleY = (this.canvas.height / this.canvasScaleY) / this.canvas.height;
            x *= ratioScaleX;
            y *= ratioScaleY;
            return [x, y];
        };
        canvasRenderer.prototype.render = function (mouseX, mouseY, cursor) {
            var _a, _b, _c;
            this.counter++;
            this.haveSelectedFromHover = false;
            (_a = this.ctx) === null || _a === void 0 ? void 0 : _a.clearRect(0, 0, this.canvas.width / this.canvasScaleX, this.canvas.height / this.canvasScaleY);
            this.ctx.fillStyle = document.getElementById("backgroundColorInput").value;
            (_b = this.ctx) === null || _b === void 0 ? void 0 : _b.fillRect(0, 0, this.canvas.width / this.canvasScaleX, this.canvas.height / this.canvasScaleY);
            (_c = this.ctx) === null || _c === void 0 ? void 0 : _c.fill();
            this.drawGrid();
            this.drawObjects(mouseX, mouseY);
            this.drawCameraBounds();
            this.drawMouse(mouseX, mouseY, cursor);
        };
        canvasRenderer.prototype.drawObjects = function (mouseX, mouseY) {
            var _this = this;
            this.layerHandler.storedLayers.forEach(function (layer) {
                if (layer.hidden == false) {
                    layer.metaObjectsInLayer.forEach(function (meta) {
                        if (_this.layerHandler.selectedLayer.layerName == layer.layerName) {
                            meta.drawMouseOverSelection(mouseX, mouseY, _this.layerHandler, _this.ctx);
                        }
                        meta.render(_this.gridXOffset, _this.gridYOffset, _this.counter, _this.ctx);
                    });
                }
            });
        };
        canvasRenderer.prototype.drawGrid = function () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            if (this.renderGrid == false)
                return;
            this.ctx.lineWidth = 1;
            var drawGridWidth = this.gridWidth;
            var drawGridHeight = this.gridHeight;
            var horizontalLines = Math.ceil((this.canvas.height / this.canvasScaleX) / drawGridHeight) + 1;
            var verticallines = Math.ceil((this.canvas.width / this.canvasScaleY) / this.gridWidth) + 1;
            this.ctx.strokeStyle = 'black';
            this.ctx.lineWidth = 0.5 / this.canvasScaleX;
            for (var i = 0; i < horizontalLines; i++) {
                (_a = this.ctx) === null || _a === void 0 ? void 0 : _a.beginPath();
                (_b = this.ctx) === null || _b === void 0 ? void 0 : _b.moveTo(0, (i) * drawGridWidth + 0.5 + (this.gridYOffset % drawGridHeight) - drawGridHeight);
                (_c = this.ctx) === null || _c === void 0 ? void 0 : _c.lineTo(this.canvas.width / this.canvasScaleX, (i) * drawGridWidth + 0.5 + (this.gridYOffset % drawGridHeight) - drawGridHeight);
                (_d = this.ctx) === null || _d === void 0 ? void 0 : _d.stroke();
            }
            for (var i = 0; i < verticallines; i++) {
                (_e = this.ctx) === null || _e === void 0 ? void 0 : _e.beginPath();
                (_f = this.ctx) === null || _f === void 0 ? void 0 : _f.moveTo((i) * drawGridWidth + 0.5 + (this.gridXOffset % drawGridWidth) - drawGridWidth, 0);
                (_g = this.ctx) === null || _g === void 0 ? void 0 : _g.lineTo((i) * drawGridWidth + 0.5 + (this.gridXOffset % drawGridWidth) - drawGridWidth, this.canvas.height / this.canvasScaleY);
                (_h = this.ctx) === null || _h === void 0 ? void 0 : _h.stroke();
            }
        };
        canvasRenderer.prototype.drawCameraBounds = function () {
            if (this.displayCameraBounds == false)
                return;
            var startXCam = parseInt(document.getElementById("cameraBoundsX").value);
            var startYCam = parseInt(document.getElementById("cameraBoundsY").value);
            var widthCam = parseInt(document.getElementById("cameraBoundsWidth").value);
            var heightCam = parseInt(document.getElementById("cameraBoundsHeight").value);
            if (startXCam != null && startYCam != null && widthCam != null && heightCam != null) {
                this.ctx.strokeStyle = "red";
                this.ctx.lineWidth = 16;
                this.ctx.strokeRect(startXCam + this.gridXOffset, startYCam + this.gridYOffset, widthCam, heightCam);
                this.ctx.lineWidth = 1;
            }
        };
        canvasRenderer.prototype.drawMouse = function (mouseX, mouseY, cursor) {
            var _a, _b, _e, _f, _g;
            var mouseGridX = (Math.floor(mouseX / this.gridWidth) * this.gridWidth) + ((this.gridXOffset) % this.gridWidth);
            var mouseGridY = (Math.floor(mouseY / this.gridHeight) * this.gridHeight) + ((this.gridYOffset) % this.gridHeight);
            if (cursorData.cursorType == cursorType.pensil) {
                if (cursor.objectSelected != null) {
                    this.ctx.strokeStyle = 'red';
                    this.ctx.lineWidth = 1;
                    (_a = this.ctx) === null || _a === void 0 ? void 0 : _a.rect(mouseGridX, mouseGridY, this.gridWidth, this.gridHeight);
                    (_b = this.ctx) === null || _b === void 0 ? void 0 : _b.stroke();
                    if (cursor.objectSelected.objectMouseImageReady && cursorData.cursorType == cursorType.pensil) {
                        {
                            (_e = this.ctx) === null || _e === void 0 ? void 0 : _e.drawImage((_f = cursor.objectSelected) === null || _f === void 0 ? void 0 : _f.objectToPlaceImageUrl, mouseGridX, mouseGridY);
                        }
                    }
                }
                else if (cursor.currentSubTile != null) {
                    var xMousePut = 0;
                    var yMousePut = 0;
                    {
                        xMousePut = mouseGridX;
                        yMousePut = mouseGridY;
                    }
                    if (cursor.currentSubTile.get(0) == undefined) {
                        console.log("can't get first image from tile: ", cursor.currentSubTile);
                    }
                    if (resourcesTiles.resourceNameAndImage[cursor.currentSubTile.get(0).resourceName] != null) {
                        var image = resourcesTiles.resourceNameAndImage[cursor.currentSubTile.get(0).resourceName];
                        (_g = this.ctx) === null || _g === void 0 ? void 0 : _g.drawImage(image, cursor.currentSubTile.get(0).startX, cursor.currentSubTile.get(0).startY, cursor.currentSubTile.get(0).width, cursor.currentSubTile.get(0).height, xMousePut, yMousePut, cursor.currentSubTile.get(0).width, cursor.currentSubTile.get(0).height);
                    }
                    else {
                        console.log("Can't find resource ", cursor.currentSubTile.get(0).resourceName);
                        console.log("In resource pool: ", resourcesTiles.resourceNameAndImage);
                    }
                }
            }
            else if (cursorData.cursorType == cursorType.geometry) {
                this.geometryDummy.render(mouseGridX, mouseGridY, 0, this.ctx);
            }
        };
        return canvasRenderer;
    }());

    var handleCanvas = /** @class */ (function () {
        function handleCanvas(canvasName, cursor) {
            var _a;
            this.mouseXPosition = 0;
            this.mouseYPosition = 0;
            this.previousMouseX = -1;
            this.previousMouseY = -1;
            this.noGridMouse = false;
            this.mouseDown = false;
            this.genObj = new objectGenerator();
            this.currentRoomName = "";
            this.prevClickedGeometry = [];
            this.moveToggleDown = false;
            this.cursor = cursor;
            this.canvasRenderPart = new canvasRenderer(canvasName);
            this.layerCreateButton = document.getElementById("createLayerButton");
            this.layerCreateButton.addEventListener("mouseup", this.createLayer.bind(this));
            this.layerDeleteButton = document.getElementById("removeLayerButton");
            this.layerDeleteButton.addEventListener("mouseup", this.deleteLayer.bind(this));
            document.addEventListener("mousemove", this.mouseListenerMove.bind(this));
            document.addEventListener("mousedown", this.mouseListenerDown.bind(this));
            document.addEventListener("mouseup", this.mouseListenerUp.bind(this));
            document.addEventListener("keypress", this.keysDown.bind(this));
            document.addEventListener("keyup", this.keysUp.bind(this));
            (_a = document.getElementById("pointer")) === null || _a === void 0 ? void 0 : _a.addEventListener("mouseup", this.clickPointer.bind(this));
        }
        handleCanvas.prototype.createLayer = function () {
            var _this = this;
            window.node.prompt("Create a new layer", "Type in the name of the new layer", function (text) {
                if (text != null) {
                    if (text != "") {
                        _this.canvasRenderPart.layerHandler.createNewLayer(text);
                    }
                    else {
                        alert("Invalid name.");
                    }
                }
            });
        };
        handleCanvas.prototype.deleteLayer = function () {
            var _this = this;
            window.node.prompt("Delete a new layer", "Type in the name of the layer you want to delete", function (text) {
                if (text != null) {
                    _this.canvasRenderPart.layerHandler.deleteLayer(text);
                }
            });
        };
        handleCanvas.prototype.clickPointer = function () {
            this.cursor.objectSelected.objectMouseImageReady = false;
        };
        handleCanvas.prototype.keysDown = function (e) {
            var _this = this;
            if (e.ctrlKey || e.metaKey) {
                this.noGridMouse = true;
                if (this.resetCtrlGridKey != undefined)
                    clearTimeout(this.resetCtrlGridKey);
                this.resetCtrlGridKey = setTimeout(function () {
                    _this.noGridMouse = false;
                }, 1200);
            }
            if (e.key == "m") {
                this.moveToggleDown = true;
            }
        };
        handleCanvas.prototype.keysUp = function (e) {
            if (e.key == "m") {
                this.moveToggleDown = false;
            }
        };
        handleCanvas.prototype.mouseListenerDown = function (e) {
            var _this = this;
            var _a, _b;
            var targetElement = e.target;
            if (targetElement.tagName != "CANVAS" || targetElement.id != "game") {
                return;
            }
            if (this.cursor.objectSelected != null && this.cursor.objectSelected.objectMouseImageReady == false && cursorData.cursorType != cursorType.grabber) {
                return;
            }
            var mouseGridX = (Math.floor(this.mouseXPosition / this.canvasRenderPart.gridWidth) * this.canvasRenderPart.gridWidth) + ((this.canvasRenderPart.gridXOffset) % this.canvasRenderPart.gridWidth);
            var mouseGridY = (Math.floor(this.mouseYPosition / this.canvasRenderPart.gridHeight) * this.canvasRenderPart.gridHeight) + ((this.canvasRenderPart.gridYOffset) % this.canvasRenderPart.gridHeight);
            if (cursorData.cursorType == cursorType.grabber || this.moveToggleDown) {
                if (this.previousMouseX != -1 && this.previousMouseY != -1) {
                    var dX = this.mouseXPosition - this.previousMouseX;
                    var dY = this.mouseYPosition - this.previousMouseY;
                    this.canvasRenderPart.updateCanvasOffset(dX, dY);
                }
                this.previousMouseX = this.mouseXPosition;
                this.previousMouseY = this.mouseYPosition;
            }
            else if (cursorData.cursorType == cursorType.pensil && this.canvasRenderPart.layerHandler.selectedLayer != null) {
                console.log("this.cursor: ", this.cursor);
                if (this.cursor.objectSelected != null || this.cursor.currentSubTile != null) {
                    var nameOfMetaObject = (_a = this.cursor.objectSelected) === null || _a === void 0 ? void 0 : _a.objectName;
                    console.log("Placing this object: ", nameOfMetaObject);
                    if (nameOfMetaObject == null) {
                        nameOfMetaObject = (_b = this.cursor.currentSubTile) === null || _b === void 0 ? void 0 : _b.name;
                    }
                    if (this.noGridMouse) {
                        this.canvasRenderPart.layerHandler.addToLayer(new userObject(this.mouseXPosition - this.canvasRenderPart.gridXOffset, this.mouseYPosition - this.canvasRenderPart.gridYOffset, nameOfMetaObject, this.cursor.currentSubTile));
                    }
                    else {
                        //check if there already is an item at the position
                        if (this.canvasRenderPart.layerHandler.hasObjectPos(mouseGridX, mouseGridY) == false) {
                            this.canvasRenderPart.layerHandler.addToLayer(new userObject(mouseGridX - this.canvasRenderPart.gridXOffset, mouseGridY - this.canvasRenderPart.gridYOffset, nameOfMetaObject, this.cursor.currentSubTile));
                        }
                    }
                }
            }
            else if (cursorData.cursorType == cursorType.eraser && this.canvasRenderPart.layerHandler.selectedLayer != null) {
                var objTarget_1 = this.canvasRenderPart.layerHandler.getObjectsAtPos(this.mouseXPosition, this.mouseYPosition, objectTypes.userObject);
                if (objTarget_1.length != 0 && objTarget_1[0].type != objectTypes.geometry) {
                    this.canvasRenderPart.layerHandler.removeObject(objTarget_1[0]);
                }
            }
            else if (cursorData.cursorType == cursorType.geometryRemove && this.canvasRenderPart.layerHandler.selectedLayer != null) {
                var objTarget_2 = this.canvasRenderPart.layerHandler.getObjectsAtPos(this.mouseXPosition, this.mouseYPosition, objectTypes.geometry);
                if (objTarget_2.length != 0 && objTarget_2[0].type == objectTypes.geometry) {
                    this.canvasRenderPart.layerHandler.removeObject(objTarget_2[0]);
                }
            }
            else if (cursorData.cursorType == cursorType.editor && this.canvasRenderPart.layerHandler.selectedLayer != null) {
                var objTarget = this.canvasRenderPart.layerHandler.getObjectsAtPos(this.mouseXPosition, this.mouseYPosition, objectTypes.userObject);
                if (objTarget != null) {
                    var inputTemplate = this.genObj.generateObject(objTarget[0].name, 0, 0, null, "").inputTemplate;
                    var inputString = objTarget[0].inputString;
                    if (inputString == "") {
                        inputString = inputTemplate;
                    }
                    window.node.promptDefaultText("Input string for object:", inputString, function (text) {
                        if (text != null) {
                            if (objTarget != null) {
                                objTarget[0].inputString = text;
                            }
                        }
                    });
                }
            }
            else if (cursorData.cursorType == cursorType.geometryEdit) {
                if (this.prevClickedGeometry.length == 0) {
                    var objTargets = this.canvasRenderPart.layerHandler.getObjectsAtPos(this.mouseXPosition, this.mouseYPosition, objectTypes.geometry);
                    objTargets.forEach(function (target) {
                        target.interactClick(_this.mouseXPosition - _this.canvasRenderPart.gridXOffset, _this.mouseYPosition - _this.canvasRenderPart.gridYOffset);
                    });
                    this.prevClickedGeometry = objTargets;
                }
            }
            this.mouseDown = true;
        };
        handleCanvas.prototype.importRoom = function (roomName, jsonString) {
            this.currentRoomName = roomName;
            this.canvasRenderPart.layerHandler.importRoom(roomName, jsonString);
        };
        handleCanvas.prototype.exportRoom = function () {
            return this.canvasRenderPart.layerHandler.exportRoom();
        };
        handleCanvas.prototype.mouseListenerUp = function (e) {
            var _this = this;
            this.mouseDown = false;
            this.previousMouseX = -1;
            this.previousMouseY = -1;
            var targetElement = e.target;
            if (targetElement.tagName != "CANVAS" || targetElement.id != "game") {
                return;
            }
            if (this.moveToggleDown == false) {
                if (cursorData.cursorType == cursorType.geometry) {
                    var mouseGridX = (Math.floor(this.mouseXPosition / this.canvasRenderPart.gridWidth) * this.canvasRenderPart.gridWidth) + ((this.canvasRenderPart.gridXOffset) % this.canvasRenderPart.gridWidth);
                    var mouseGridY = (Math.floor(this.mouseYPosition / this.canvasRenderPart.gridHeight) * this.canvasRenderPart.gridHeight) + ((this.canvasRenderPart.gridYOffset) % this.canvasRenderPart.gridHeight);
                    var newGeom = new geometryObject(mouseGridX - this.canvasRenderPart.gridXOffset, mouseGridY - this.canvasRenderPart.gridYOffset);
                    this.canvasRenderPart.layerHandler.addToLayer(newGeom);
                }
                else if (cursorData.cursorType == cursorType.geometryEdit) {
                    this.prevClickedGeometry.forEach(function (prevTarget) {
                        prevTarget.interactClick(_this.mouseXPosition - _this.canvasRenderPart.gridXOffset, _this.mouseYPosition - _this.canvasRenderPart.gridYOffset);
                    });
                    this.prevClickedGeometry = [];
                }
            }
        };
        handleCanvas.prototype.mouseListenerMove = function (e) {
            var _this = this;
            var mousePosition = this.canvasRenderPart.getCanvasMousePositions(e);
            this.mouseXPosition = mousePosition[0];
            this.mouseYPosition = mousePosition[1];
            document.getElementById("mousePositionContainer").innerHTML = "x: " + (this.mouseXPosition - this.canvasRenderPart.gridXOffset) + "    y: " + (this.mouseYPosition - this.canvasRenderPart.gridYOffset);
            var objTarget = this.canvasRenderPart.layerHandler.getObjectsAtPos(this.mouseXPosition, this.mouseYPosition);
            if (objTarget.length != 0 && objTarget[0].type != objectTypes.geometry) {
                document.getElementById("objectNameContainer").innerHTML = objTarget[0].name;
            }
            if (this.mouseDown) {
                this.mouseListenerDown(e);
            }
            if (cursorData.cursorType == cursorType.geometryEdit && this.moveToggleDown == false) {
                var geometries_1 = this.canvasRenderPart.layerHandler.getObjectsOfType(objectTypes.geometry);
                geometries_1.forEach(function (objTarget) {
                    objTarget.interact(_this.mouseXPosition - _this.canvasRenderPart.gridXOffset, _this.mouseYPosition - _this.canvasRenderPart.gridYOffset, geometries_1);
                });
            }
        };
        handleCanvas.prototype.render = function () {
            this.canvasRenderPart.render(this.mouseXPosition, this.mouseYPosition, this.cursor);
        };
        return handleCanvas;
    }());

    (function () {
        //load resources first
        var app = new PIXI.Application();
        new resourcesHand(app, function () {
            initializeProgram();
        }, "../../../dist/");
    })();
    function initializeProgram() {
        var _a;
        var cursor = new cursorData();
        var canvasHandler = new handleCanvas("game", cursor);
        new fileSystemHandlerObjects(canvasHandler, cursor);
        var filesHandlerRooms = new fileSystemHandlerRooms(canvasHandler);
        new fileSystemHandlerResources(canvasHandler, cursor);
        //canvasHandler.setFileSystemElement(filesHandlerObjects.getFileSystemElement()!);
        (_a = document.getElementById("saveButton")) === null || _a === void 0 ? void 0 : _a.addEventListener("mouseup", function (e) {
            filesHandlerRooms.saveRoom(canvasHandler.exportRoom());
            alert("Complete");
        }, false);
        setInterval(function () {
            canvasHandler.render();
        }, 16);
    }

}(PIXI, io));
