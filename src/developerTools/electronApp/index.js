(function (PIXI, filterAdjustment) {
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
            var raw_diff = rad1 > rad2 ? rad1 - rad2 : rad2 - rad1;
            var mod_diff = raw_diff % 360;
            var dist = mod_diff > 180.0 ? 360.0 - mod_diff : mod_diff;
            return dist;
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
        return calculations;
    }());

    var resourcesHand = /** @class */ (function () {
        function resourcesHand(app, onCompleteCallback, alternativePath) {
            if (alternativePath === void 0) { alternativePath = ""; }
            resourcesHand.app = app;
            fetch(alternativePath + '/resources.txt', {
                method: 'get'
            })
                .then(function (response) { return response.text(); })
                .then(function (textData) { return resourcesHand.loadFromResources(textData.split("\n"), onCompleteCallback, alternativePath); })
                .catch(function (err) {
                console.log("err: " + err);
            });
        }
        resourcesHand.loadFromResources = function (loadedResources, onCompleteCallback, alternativePath) {
            resourcesHand.resourcesToLoad = loadedResources;
            var audioToLoad = loadedResources.filter(function (x) { return x.indexOf(".wav") != -1 || x.indexOf(".ogg") != -1; });
            resourcesHand.loadAudio(audioToLoad);
            loadedResources = loadedResources.filter(function (x) { return x.indexOf(".mp4") != -1 || x.indexOf(".json") != -1 || (x.indexOf(".png") != -1 && loadedResources.indexOf(x.replace(".png", ".json")) == -1); });
            resourcesHand.resourcesToLoad.forEach(function (resourceDir) {
                var resourceDirsSplit = resourceDir.split("/");
                var resourceName = resourceDirsSplit[resourceDirsSplit.length - 1];
                resourcesHand.app.loader.add(resourceName, alternativePath + "resources/" + resourceDir);
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
                        resourcesHand.storeStaticTile(name);
                    }
                    else if (name.indexOf(".mp4") != -1) {
                        resourcesHand.storeVideoAsAnimatedTexture("resources/" + resource, name);
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
                    src: ['resources/' + audioToLoad]
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
        resourcesHand.resourcePNG = function (resourceName) {
            for (var _i = 0, _a = resourcesHand.resourcesToLoad; _i < _a.length; _i++) {
                var resourceDir = _a[_i];
                var splitDirs = resourceDir.split("/");
                var nameAndMeta = splitDirs[splitDirs.length - 1];
                if (nameAndMeta.toLocaleLowerCase().indexOf(".png") != -1) {
                    nameAndMeta.split(".")[0];
                    if (nameAndMeta == resourceName + ".png") {
                        return resourcesHand.app.loader.resources[nameAndMeta].texture;
                    }
                }
            }
            throw new Error("PNG resource does not exist: " + resourceName);
        };
        resourcesHand.convertGraphicsToTexture = function (graphics) {
            var texture = this.app.renderer.generateTexture(graphics);
            return texture;
        };
        resourcesHand.resourcesToLoad = [];
        resourcesHand.animatedSprite = {};
        resourcesHand.staticTile = {};
        resourcesHand.audio = {};
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
    /** @deprecated */

    function __spreadArrays() {
      for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;

      for (var r = Array(s), k = 0, i = 0; i < il; i++) for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) r[k] = a[j];

      return r;
    }

    var vector = /** @class */ (function () {
        function vector(a, b) {
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
            var mag = this.magnitude;
            this.Dx = this.Dx * (mag + addValue) / mag;
            this.Dy = this.Dy * (mag + addValue) / mag;
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
            var x1 = initiator.g.x + initiadorCollisionBox.x;
            var y1 = initiator.g.y + initiadorCollisionBox.y;
            var x2 = collisionTarget.g.x + collisionTarget.collisionBox.x;
            var y2 = collisionTarget.g.y + collisionTarget.collisionBox.y;
            return (x1 < x2 + collisionTarget.collisionBox.width &&
                x1 + initiadorCollisionBox.width > x2 &&
                y1 < y2 + collisionTarget.collisionBox.height &&
                y1 + initiadorCollisionBox.height > y2);
        };
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
            this._isColliding_Special = false;
            this.collidesWithPolygonGeometry = false;
            this.onLayer = 0;
            this.outputString = "";
            this.horizontalCollision = 0;
            this.verticalCollision = 0;
            this._hasCollidedWithPolygon = false;
            this.objectName = "";
            this.collisionBox = new boxCollider(0, 0, 0, 0);
        }
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
        return ticker;
    }());

    var moveOperationsPush = /** @class */ (function () {
        function moveOperationsPush() {
        }
        moveOperationsPush.pushObjectHorizontal = function (pusher, objectBeingPushed, sign, objContainer) {
            var _this = this;
            var collided = false;
            if (internalFunction.intersecting(pusher, pusher.collisionBox, objectBeingPushed)) {
                if (objectBeingPushed.collisionTargets.length == 0) {
                    return pusher;
                }
                objectBeingPushed.g.x += sign;
                objContainer.loopThroughObjectsUntilCondition(objectBeingPushed.collisionTargets, function (testCollision) {
                    if (testCollision.objectName != pusher.objectName &&
                        internalFunction.intersecting(objectBeingPushed, objectBeingPushed.collisionBox, testCollision)
                        && _this.pushObjectHorizontal(objectBeingPushed, testCollision, sign, objContainer) != objectGlobalData.null) {
                        objectBeingPushed.g.x += sign * -1;
                        collided = true;
                    }
                    return false;
                });
            }
            if (collided) {
                return objectBeingPushed;
            }
            return objectGlobalData.null;
        };
        moveOperationsPush.pushObjectVertical = function (pusher, objectBeingPushed, sign, objContainer) {
            var _this = this;
            var collided = false;
            if (internalFunction.intersecting(pusher, pusher.collisionBox, objectBeingPushed)) {
                if (objectBeingPushed.collisionTargets.length == 0) {
                    return pusher;
                }
                objectBeingPushed.g.y += sign;
                if (objectBeingPushed._isColliding_Special) {
                    objectBeingPushed.g.y += sign * -1;
                    collided = true;
                    return objectBeingPushed;
                }
                else {
                    objContainer.loopThroughObjectsUntilCondition(objectBeingPushed.collisionTargets, function (testCollision) {
                        if (testCollision.objectName != pusher.objectName &&
                            internalFunction.intersecting(objectBeingPushed, objectBeingPushed.collisionBox, testCollision)
                            && _this.pushObjectVertical(objectBeingPushed, testCollision, sign, objContainer) != objectGlobalData.null) {
                            objectBeingPushed.g.y += sign * -1;
                            collided = true;
                        }
                        return false;
                    });
                }
            }
            if (collided) {
                return objectBeingPushed;
            }
            return objectGlobalData.null;
        };
        return moveOperationsPush;
    }());

    var horizontalMovement = /** @class */ (function () {
        function horizontalMovement() {
        }
        horizontalMovement.moveForceHorizontal = function (magnitude, target, collisionNames, objContainer) {
            if (magnitude == 0)
                return;
            target.horizontalCollision = 0;
            var sign = magnitude > 0 ? 1 : -1;
            var objectsThatWereCollidingThisObjectWhileMoving = new Array();
            var collisionTarget = objectGlobalData.null;
            var _loop_1 = function (i) {
                objectsThatWereCollidingThisObjectWhileMoving.length = 0;
                target.g.x += sign;
                if (objectGlobalData.objectsThatCollideWith[target.objectName] != null) {
                    //Push object
                    objContainer.loopThroughObjectsUntilCondition(objectGlobalData.objectsThatCollideWith[target.objectName], function (testCollisionWith) {
                        if (internalFunction.intersecting(target, target.collisionBox, testCollisionWith)) {
                            collisionTarget = moveOperationsPush.pushObjectHorizontal(target, testCollisionWith, sign, objContainer);
                            if (collisionTarget == objectGlobalData.null) {
                                target.force.Dx *= 1 - testCollisionWith.weight;
                            }
                        }
                        return false;
                    });
                    //Sticky draging
                    var stickyCheck_1 = boxCollider.copy(target.collisionBox);
                    var checkDistance_1 = Math.abs(magnitude) + 2;
                    if (target.stickyTop) {
                        stickyCheck_1.expandTop(checkDistance_1);
                    }
                    if (target.stickyBottom) {
                        stickyCheck_1.expandBottom(checkDistance_1);
                    }
                    if (target.stickyTop || target.stickyBottom) {
                        //console.log("objectBase.objectsThatCollideWithKeyObjectName[target.objectName]", objectBase.objectsThatCollideWithKeyObjectName[target.objectName]);
                        objContainer.loopThroughObjectsUntilCondition(objectGlobalData.objectsThatCollideWith[target.objectName], function (testCollisionWith) {
                            if (internalFunction.intersecting(target, stickyCheck_1, testCollisionWith)) {
                                if (testCollisionWith._hasBeenMoved_Tick < ticker.getTicks()) {
                                    objectsThatWereCollidingThisObjectWhileMoving.push(testCollisionWith);
                                    testCollisionWith.g.x += sign;
                                    if (i >= Math.abs(magnitude) - 1) {
                                        testCollisionWith._hasBeenMoved_Tick = ticker.getTicks();
                                    }
                                }
                            }
                            return false;
                        });
                    }
                }
                if (collisionTarget == objectGlobalData.null) {
                    collisionTarget = objContainer.boxIntersectionSpecific(target, target.collisionBox, collisionNames);
                }
                if (collisionTarget != objectGlobalData.null && target._isColliding_Special == false) {
                    sign *= -1;
                    target.g.x += 1 * sign;
                    objectsThatWereCollidingThisObjectWhileMoving.forEach(function (updaterObject) {
                        updaterObject.g.x += 1 * sign;
                    });
                    if (target.force.Dx > 0) {
                        target.horizontalCollision = 1;
                    }
                    else if (target.force.Dx < 0) {
                        target.horizontalCollision = -1;
                    }
                    target.force.Dx = 0;
                    var distance = 0;
                    if (sign <= 0) {
                        distance = calculations.getShortestDeltaBetweenTwoRadians(target.gravity.delta, 0);
                    }
                    else {
                        distance = calculations.getShortestDeltaBetweenTwoRadians(target.gravity.delta, calculations.PI);
                    }
                    if (distance < 90) {
                        target.gravity.Dy *= distance / 90;
                        target.gravity.Dx *= 1 - (distance / 90);
                    }
                    target.force.Dy *= collisionTarget.friction * target.friction;
                    return "break";
                }
            };
            for (var i = 0; i < Math.abs(magnitude); i += 1) {
                var state_1 = _loop_1(i);
                if (state_1 === "break")
                    break;
            }
            //Sticky draging
            var stickyCheck = boxCollider.copy(target.collisionBox);
            var checkDistance = Math.abs(magnitude) + 2;
            if (target.stickyLeftSide) {
                stickyCheck.expandLeftSide(checkDistance);
            }
            if (target.stickyRightSide) {
                stickyCheck.expandRightSide(checkDistance);
            }
            if (target.stickyLeftSide || target.stickyRightSide) {
                objContainer.loopThroughObjectsUntilCondition(objectGlobalData.objectsThatCollideWith[target.objectName], function (testCollisionWith) {
                    if (sign > 0) {
                        //Moving right
                        if (testCollisionWith.g.x + testCollisionWith.collisionBox.x + testCollisionWith.collisionBox.width < target.g.x + target.collisionBox.x + target.collisionBox.width && internalFunction.intersecting(target, stickyCheck, testCollisionWith)) {
                            testCollisionWith.g.x = target.g.x - testCollisionWith.collisionBox.x - testCollisionWith.collisionBox.width;
                        }
                    }
                    else {
                        //Moving left
                        if (testCollisionWith.g.x > target.g.x && internalFunction.intersecting(target, stickyCheck, testCollisionWith)) {
                            testCollisionWith.g.x = target.g.x + target.collisionBox.x + target.collisionBox.width - testCollisionWith.collisionBox.x;
                        }
                    }
                    return false;
                });
            }
        };
        return horizontalMovement;
    }());

    var verticalMovement = /** @class */ (function () {
        function verticalMovement() {
        }
        verticalMovement.moveForceVertical = function (magnitude, target, collisionNames, objContainer) {
            if (magnitude == 0)
                return;
            target.verticalCollision = 0;
            var sign = magnitude > 0 ? 1 : -1;
            var objectsThatWereCollidingThisObjectWhileMoving = new Array();
            var collisionTarget = objectGlobalData.null;
            var _loop_1 = function (i) {
                objectsThatWereCollidingThisObjectWhileMoving.length = 0;
                target.g.y += sign;
                if (objectGlobalData.objectsThatCollideWith[target.objectName] != null) {
                    //push objects
                    objContainer.loopThroughObjectsUntilCondition(objectGlobalData.objectsThatCollideWith[target.objectName], function (testCollisionWith) {
                        if (internalFunction.intersecting(target, target.collisionBox, testCollisionWith)) {
                            collisionTarget = moveOperationsPush.pushObjectVertical(target, testCollisionWith, sign, objContainer);
                            if (collisionTarget == objectGlobalData.null) {
                                target.force.Dy *= 1 - testCollisionWith.weight;
                            }
                        }
                        return false;
                    });
                    //Sticky draging
                    var stickyCheck_1 = boxCollider.copy(target.collisionBox);
                    var checkDistance_1 = Math.abs(magnitude) + 2;
                    if (target.stickyLeftSide) {
                        stickyCheck_1.expandLeftSide(checkDistance_1);
                    }
                    if (target.stickyRightSide) {
                        stickyCheck_1.expandRightSide(checkDistance_1);
                    }
                    if (target.stickyLeftSide || target.stickyRightSide) {
                        //console.log("objectBase.objectsThatCollideWithKeyObjectName[target.objectName]", objectBase.objectsThatCollideWithKeyObjectName[target.objectName]);
                        objContainer.loopThroughObjectsUntilCondition(objectGlobalData.objectsThatCollideWith[target.objectName], function (testCollisionWith) {
                            if (internalFunction.intersecting(target, stickyCheck_1, testCollisionWith)) {
                                if (testCollisionWith._hasBeenMoved_Tick < ticker.getTicks()) {
                                    objectsThatWereCollidingThisObjectWhileMoving.push(testCollisionWith);
                                    testCollisionWith.g.y += sign;
                                    if (i >= Math.abs(magnitude) - 1) {
                                        testCollisionWith._hasBeenMoved_Tick = ticker.getTicks();
                                    }
                                }
                            }
                            return false;
                        });
                    }
                }
                //This has to be more optimized
                if (collisionTarget == objectGlobalData.null) {
                    collisionTarget = objContainer.boxIntersectionSpecific(target, target.collisionBox, collisionNames);
                }
                if (collisionTarget != objectGlobalData.null) {
                    sign *= -1;
                    target.g.y += sign;
                    objectsThatWereCollidingThisObjectWhileMoving.forEach(function (updaterObject) {
                        updaterObject.g.y += sign;
                    });
                    if (target.force.Dy > 0) {
                        target.verticalCollision = 1;
                    }
                    else if (target.force.Dy < 0) {
                        target.verticalCollision = -1;
                    }
                    target.force.Dy = 0;
                    var distance = 0;
                    if (sign >= 0) {
                        distance = calculations.getShortestDeltaBetweenTwoRadians(target.gravity.delta, calculations.PI / 2);
                    }
                    else {
                        distance = calculations.getShortestDeltaBetweenTwoRadians(target.gravity.delta, calculations.PI + (calculations.PI / 2));
                    }
                    if (distance < 90) {
                        target.gravity.Dy *= distance / 90;
                        target.gravity.Dx *= 1 - (distance / 90);
                    }
                    //console.log("Friction");
                    //target.force.Dx *= collisionTarget.friction * target.friction;
                    target.force.Dx *= target.friction;
                    return "break";
                }
            };
            for (var i = 0; i < Math.abs(magnitude); i += 1) {
                var state_1 = _loop_1(i);
                if (state_1 === "break")
                    break;
            }
            var stickyCheck = boxCollider.copy(target.collisionBox);
            var checkDistance = Math.abs(magnitude) + 2;
            if (target.stickyTop) {
                stickyCheck.expandTop(checkDistance);
            }
            if (target.stickyBottom) {
                stickyCheck.expandBottom(checkDistance);
            }
            //Sticky draging
            if (target.stickyTop || target.stickyBottom) {
                objContainer.loopThroughObjectsUntilCondition(objectGlobalData.objectsThatCollideWith[target.objectName], function (testCollisionWith) {
                    if (sign > 0) {
                        //Moving down
                        if (testCollisionWith.g.y + testCollisionWith.collisionBox.y + testCollisionWith.collisionBox.height < target.g.y + target.collisionBox.y + target.collisionBox.height && internalFunction.intersecting(target, stickyCheck, testCollisionWith)) {
                            testCollisionWith.g.y = target.g.y - testCollisionWith.collisionBox.y - testCollisionWith.collisionBox.height;
                        }
                    }
                    else {
                        //Moving up
                        if (testCollisionWith.g.y > target.g.y && internalFunction.intersecting(target, stickyCheck, testCollisionWith)) {
                            testCollisionWith.g.y = target.g.y + target.collisionBox.y + target.collisionBox.height - testCollisionWith.collisionBox.y;
                        }
                    }
                    return false;
                });
            }
        };
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
            if (target.collidesWithPolygonGeometry == true) {
                var collisionObjects = objContainer.filterObjects(["polygonCollisionX"], function (testCollisionWith) {
                    if (internalFunction.intersecting(target, target.collisionBox, testCollisionWith)) {
                        return true;
                    }
                    return false;
                });
                //var collisionTarget = objContainer.boxIntersectionSpecific(target, target.collisionBox, ["polygonCollisionX"]);
                if (collisionObjects.length == 0) {
                    //target._hasCollidedWithPolygon = false;
                    return [false, target.gravity];
                }
                var collisionResults_1 = [];
                collisionObjects.forEach(function (obj) {
                    collisionResults_1.push(obj.collisionTest(target));
                });
                var currentFlatestCollision_1 = new nullVector();
                currentFlatestCollision_1.delta = Math.PI / 2; //point north
                collisionResults_1.forEach(function (collision) {
                    if (collision[0] && collision[1].delta) {
                        if (calculations.getShortestDeltaBetweenTwoRadians(collision[1].delta, 0) < calculations.getShortestDeltaBetweenTwoRadians(currentFlatestCollision_1.delta, 0)) {
                            currentFlatestCollision_1 = collision[1];
                        }
                    }
                });
                collisionResults_1[0];
                //target._hasCollidedWithPolygon = false;
                return collisionResults_1[0];
                /*if(collisionTarget != objectGlobalData.null){
                    return (collisionTarget as polygonCollisionX).collisionTest(target);
                }*/
            }
            //target._hasCollidedWithPolygon = false;
            return [false, target.gravity];
        };
        return polygonCollision;
    }());

    var movementOperations = /** @class */ (function () {
        function movementOperations() {
        }
        movementOperations.moveByForce = function (target, force, collisionNames, objContainer, deltaTime) {
            force.Dx = force.Dx * deltaTime;
            force.Dy = force.Dy * deltaTime;
            force.Dx *= target.airFriction;
            force.Dy *= target.airFriction;
            var xdiff = force.Dx;
            var ydiff = force.Dy;
            target.gravity.increaseMagnitude(target.weight);
            var polygonCollisionTest = polygonCollision.collisionTest(target, Math.round(xdiff), Math.round(ydiff), objContainer);
            force.Dx += polygonCollisionTest[1].Dx;
            force.Dy += polygonCollisionTest[1].Dy;
            target.gravity.magnitude = polygonCollisionTest[1].magnitude;
            /* if(target.gravity.magnitude < 1){
                target.gravity.magnitude = 0K
            }*/
            horizontalMovement.moveForceHorizontal(Math.round(xdiff), target, collisionNames, objContainer);
            if (polygonCollisionTest[0] == false) {
                verticalMovement.moveForceVertical(Math.round(ydiff), target, collisionNames, objContainer);
            }
        };
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
            this._isColliding_Special = false;
            this.collidesWithPolygonGeometry = false;
            this._hasCollidedWithPolygon = false;
            this.inputTemplate = "";
            this.outputString = "";
            this.onLayer = 0;
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
        objectBase.prototype.logic = function (l) {
            movementOperations.moveByForce(this, this._force, this.collisionTargets, l.objContainer, l.deltaTime);
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

    var movingBlockHori = /** @class */ (function (_super) {
        __extends(movingBlockHori, _super);
        function movingBlockHori(xp, yp, input) {
            var _this = _super.call(this, xp, yp, movingBlockHori.objectName) || this;
            _this.switch = false;
            _this.friction = 0.873;
            _this.stickyTop = true;
            _this.stickyRightSide = true;
            _this.stickyLeftSide = true;
            _super.prototype.setCollision.call(_this, 0, 0, 256, 256);
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI.Graphics();
                newGraphics.beginFill(0x000000);
                newGraphics.drawRect(0, 0, 256, 256);
                newGraphics.endFill();
                g.addChild(newGraphics);
                return g;
            });
            return _this;
        }
        movingBlockHori.prototype.logic = function (l) {
            _super.prototype.logic.call(this, l);
            //super.setNewForceAngleMagnitude(calculations.degreesToRadians(180), 3);
            if (this.switch) {
                _super.prototype.setNewForce.call(this, 2, 0);
            }
            else {
                _super.prototype.setNewForce.call(this, -2, 0);
            }
            if (ticker.getTicks() % 20 == 0) {
                this.switch = !this.switch;
            }
        };
        movingBlockHori.objectName = "movingBlockHori";
        return movingBlockHori;
    }(objectBase));

    var movingBlockVert = /** @class */ (function (_super) {
        __extends(movingBlockVert, _super);
        function movingBlockVert(xp, yp, input) {
            var _this = _super.call(this, xp, yp, movingBlockVert.objectName) || this;
            _this.switch = false;
            _this.friction = 0.873;
            _this.stickyTop = true;
            _super.prototype.setCollision.call(_this, 0, 0, 256, 256);
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI.Graphics();
                newGraphics.beginFill(0x000000);
                newGraphics.drawRect(0, 0, 256, 256);
                newGraphics.endFill();
                g.addChild(newGraphics);
                return g;
            });
            return _this;
        }
        movingBlockVert.prototype.logic = function (l) {
            _super.prototype.logic.call(this, l);
            if (this.switch) {
                _super.prototype.setNewForceAngleMagnitude.call(this, calculations.degreesToRadians(90), 1);
            }
            else {
                _super.prototype.setNewForceAngleMagnitude.call(this, calculations.degreesToRadians(270), 1);
            }
            if (ticker.getTicks() % 55 == 0) {
                this.switch = !this.switch;
            }
        };
        movingBlockVert.objectName = "movingBlockVert";
        return movingBlockVert;
    }(objectBase));

    var block = /** @class */ (function (_super) {
        __extends(block, _super);
        function block(xp, yp, input) {
            var _this = _super.call(this, xp, yp, block.objectName) || this;
            _this.switch = false;
            _this.friction = 0.986;
            _super.prototype.setCollision.call(_this, 0, 0, 32, 32);
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI.Graphics();
                newGraphics.beginFill(0x000000);
                newGraphics.drawRect(0, 0, 32, 32);
                newGraphics.endFill();
                g.addChild(newGraphics);
                return g;
            });
            return _this;
        }
        block.prototype.setCollision = function (x, y, width, height) {
            _super.prototype.setCollision.call(this, x, y, width, height);
            _super.prototype.style.call(this, function (g) {
                var newGraphics = new PIXI.Graphics();
                newGraphics.beginFill(0x000000);
                newGraphics.drawRect(x, y, width, height);
                newGraphics.endFill();
                g.addChild(newGraphics);
                return g;
            });
        };
        block.prototype.logic = function (l) {
            _super.prototype.logic.call(this, l);
        };
        block.objectName = "block";
        return block;
    }(objectBase));

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

    var animConfig = /** @class */ (function () {
        function animConfig(init) {
            this.animationName = "";
            this.x = 0;
            this.y = 0;
            this.speed = 0.5;
            this.scaleX = 1;
            this.scaleY = 1;
            this.anchorX = 0.5;
            this.anchorY = 0.5;
            this.id = "";
            Object.assign(this, init);
            if (this.id == "") {
                this.id = this.animationName;
            }
        }
        return animConfig;
    }());

    var tinyBlock32 = /** @class */ (function (_super) {
        __extends(tinyBlock32, _super);
        function tinyBlock32(xp, yp, input) {
            var _this = _super.call(this, xp, yp, tinyBlock32.objectName) || this;
            _this.switch = false;
            _this.friction = 0.986;
            _super.prototype.setCollision.call(_this, 0, 0, 32, 32);
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI.Graphics();
                newGraphics.beginFill(0x000000);
                newGraphics.drawRect(0, 0, 32, 32);
                newGraphics.endFill();
                g.addChild(newGraphics);
                return g;
            });
            return _this;
            /*setInterval(()=>{
                this.switch = !this.switch;
            }, 700);*/
        }
        tinyBlock32.prototype.logic = function (l) {
            _super.prototype.logic.call(this, l);
            /*if(this.switch){
                super.setNewForce(l.degreesToRadians(0), 3);
            }else{
                super.setNewForce(l.degreesToRadians(180), 3);
            }*/
        };
        tinyBlock32.objectName = "tinyBlock32";
        return tinyBlock32;
    }(objectBase));

    var wideBlock = /** @class */ (function (_super) {
        __extends(wideBlock, _super);
        function wideBlock(xp, yp, input) {
            var _this = _super.call(this, xp, yp, wideBlock.objectName) || this;
            _this.switch = false;
            _this.friction = 0.986;
            _super.prototype.setCollision.call(_this, 0, 0, 640, 64);
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI.Graphics();
                newGraphics.beginFill(0x000000);
                newGraphics.drawRect(0, 0, 640, 64);
                newGraphics.endFill();
                g.addChild(newGraphics);
                return g;
            });
            return _this;
            /*setInterval(()=>{
                this.switch = !this.switch;
            }, 700);*/
        }
        wideBlock.prototype.logic = function (l) {
            _super.prototype.logic.call(this, l);
            /*if(this.switch){
                super.setNewForce(l.degreesToRadians(0), 3);
            }else{
                super.setNewForce(l.degreesToRadians(180), 3);
            }*/
        };
        wideBlock.objectName = "wideBlock";
        return wideBlock;
    }(objectBase));

    var block32x64 = /** @class */ (function (_super) {
        __extends(block32x64, _super);
        function block32x64(xp, yp, input) {
            var _this = _super.call(this, xp, yp, input) || this;
            _this.switch = false;
            _this.friction = 0.986;
            _this.setCollision(0, 0, 32, 64);
            return _this;
        }
        block32x64.objectName = "block32x64";
        return block32x64;
    }(block));

    var block64x32 = /** @class */ (function (_super) {
        __extends(block64x32, _super);
        function block64x32(xp, yp, input) {
            var _this = _super.call(this, xp, yp, block64x32.objectName) || this;
            _this.friction = 0.986;
            _super.prototype.setCollision.call(_this, 0, 0, 64, 32);
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI.Graphics();
                newGraphics.beginFill(0x000000);
                newGraphics.drawRect(0, 0, 64, 32);
                newGraphics.endFill();
                g.addChild(newGraphics);
                return g;
            });
            return _this;
        }
        block64x32.prototype.logic = function (l) {
            _super.prototype.logic.call(this, l);
        };
        block64x32.objectName = "block64x32";
        return block64x32;
    }(objectBase));

    var dummySandbag = /** @class */ (function (_super) {
        __extends(dummySandbag, _super);
        function dummySandbag(xp, yp, input) {
            var _this = _super.call(this, xp, yp, dummySandbag.objectName) || this;
            _this.switch = false;
            _this.gravity = new vectorFixedDelta(calculations.degreesToRadians(270), 0);
            _this.friction = 0.90;
            _this.airFriction = 0.96;
            _this.weight = 0.02;
            _this.life = 1000;
            _super.prototype.setCollision.call(_this, 0, 0, 24, 32);
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI.Graphics();
                newGraphics.beginFill(0x0000FF);
                newGraphics.drawRect(0, 0, 24, 32);
                newGraphics.endFill();
                g.addChild(newGraphics);
                return g;
            });
            _super.prototype.addCollisionTarget.call(_this, "player", block.objectName, block32x64.objectName, block64x32.objectName, movingBlockHori.objectName, movingBlockVert.objectName, tinyBlock32.objectName, wideBlock.objectName);
            return _this;
        }
        dummySandbag.prototype.logic = function (l) {
            _super.prototype.logic.call(this, l);
        };
        dummySandbag.objectName = "dummySandbag";
        return dummySandbag;
    }(objectBase));

    var ladder = /** @class */ (function (_super) {
        __extends(ladder, _super);
        function ladder(xp, yp, input) {
            var _this = _super.call(this, xp, yp, ladder.objectName) || this;
            _this.switch = false;
            _this.friction = 0.0;
            _this.life = 1000;
            _super.prototype.setCollision.call(_this, 0, 0, 20, 98);
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI.Graphics();
                newGraphics.beginFill(0x483e51);
                newGraphics.drawRect(0, 0, 20, 98);
                newGraphics.endFill();
                g.addChild(newGraphics);
                g.calculateBounds();
                return g;
            });
            _super.prototype.addSprite.call(_this, new animConfig({
                animationName: "ladder",
                scaleX: 2,
                scaleY: 2,
                speed: 0.3,
                x: 4,
                y: 0,
                anchorX: 0,
                anchorY: 0,
            }));
            return _this;
        }
        ladder.prototype.logic = function (l) {
        };
        ladder.objectName = "ladder";
        return ladder;
    }(objectBase));

    var spriteContainer = /** @class */ (function () {
        function spriteContainer() {
            this.currentSpriteObj = null;
        }
        spriteContainer.prototype.set = function (newSprite) {
            this.currentSpriteObj = newSprite;
        };
        spriteContainer.prototype.update = function (updateFunc) {
            if (this.currentSpriteObj != null) {
                updateFunc(this.currentSpriteObj);
            }
        };
        return spriteContainer;
    }());

    var hitbox = /** @class */ (function (_super) {
        __extends(hitbox, _super);
        function hitbox(xp, yp, input) {
            var _this = _super.call(this, xp, yp, hitbox.objectName) || this;
            _this.switch = false;
            _this.friction = 0.0;
            _this.color = 0x000000;
            _this.hitDirection = new nullVector();
            _this.targets = [];
            _this.haveHitThese = [];
            _this.userFaceRight = function () { return true; };
            return _this;
        }
        hitbox.new = function (size, angle, magnitude, targets, userFaceRight) {
            var newHitbox = new hitbox(0, 0, "");
            newHitbox.setSize(size[0], size[1]);
            newHitbox.hitDirection = new vectorFixedDelta(calculations.degreesToRadians(angle), magnitude);
            newHitbox.targets = targets;
            newHitbox.userFaceRight = userFaceRight;
            return newHitbox;
        };
        hitbox.prototype.setSize = function (width, height) {
            var _this = this;
            console.log("height ", height);
            _super.prototype.setCollision.call(this, 0, 0, width, height);
            _super.prototype.style.call(this, function (g) {
                var newGraphics = new PIXI.Graphics();
                newGraphics.beginFill(_this.color);
                newGraphics.drawRect(0, 0, width, height);
                newGraphics.endFill();
                g.addChild(newGraphics);
                return g;
            });
        };
        hitbox.prototype.logic = function (l) {
            var _this = this;
            for (var _i = 0, _a = this.targets; _i < _a.length; _i++) {
                var t = _a[_i];
                l.foreachObjectType(t, function (obj) {
                    if (_this.haveHitThese.indexOf(obj.ID) == -1
                        && internalFunction.intersecting(_this, _this.collisionBox, obj)) {
                        _this.haveHitThese.push(obj.ID);
                        if (_this.hitDirection != null) {
                            /*if(this.type == "sword"){
                                resourcesHand.playAudioVolume("WeaponImpact1.ogg", 0.25);
                            }*/
                            obj.gravity.magnitude = 0;
                            if (_this.userFaceRight()) {
                                obj.addForceAngleMagnitude(_this.hitDirection.delta, _this.hitDirection.magnitude);
                            }
                            else {
                                obj.addForceAngleMagnitude(calculations.PI - _this.hitDirection.delta, _this.hitDirection.magnitude);
                            }
                        }
                    }
                    return true;
                });
            }
        };
        hitbox.objectName = "hitbox";
        return hitbox;
    }(objectBase));

    var movementDirection;
    (function (movementDirection) {
        movementDirection[movementDirection["left_right"] = 0] = "left_right";
        movementDirection[movementDirection["up_down"] = 1] = "up_down";
        movementDirection[movementDirection["right"] = 2] = "right";
        movementDirection[movementDirection["left"] = 3] = "left";
        movementDirection[movementDirection["up"] = 4] = "up";
        movementDirection[movementDirection["down"] = 5] = "down";
    })(movementDirection || (movementDirection = {}));

    var actionCreatedObject = /** @class */ (function () {
        function actionCreatedObject(life, obj, offsetX, offsetY) {
            this.life = 0;
            this.life = life;
            this._obj = obj;
            this._offsetX = offsetX;
            this._offsetY = offsetY;
        }
        actionCreatedObject.prototype.obj = function () {
            return this._obj;
        };
        actionCreatedObject.prototype.offsetX = function () {
            return this._offsetX;
        };
        actionCreatedObject.prototype.offsetY = function () {
            return this._offsetY;
        };
        return actionCreatedObject;
    }());

    var genericStatus;
    (function (genericStatus) {
        genericStatus[genericStatus["true"] = 0] = "true";
        genericStatus[genericStatus["false"] = 1] = "false";
        genericStatus[genericStatus["notSet"] = 2] = "notSet";
    })(genericStatus || (genericStatus = {}));

    var action = /** @class */ (function () {
        function action(actionContainer) {
            this.movementVector = new nullVector();
            this._startupWait = 0;
            this.originalStartupWait = 0;
            this._endWait = 0;
            this._repeat = 0;
            this._resetUserGravity = false;
            this._continueWindow = -1;
            this._queriedAttacks = 0;
            this._requiredQueriedAttacks = 0;
            this.gravityShouldBeReset = false;
            this.userShouldBeStill = genericStatus.notSet;
            this.attackDirection = movementDirection.left_right;
            this.payloadDone = false;
            this.jobCompleted = false;
            this.newUserFriction = -1;
            this.usersPrevStoredFriction = 0;
            this.firstTime = true;
            this.objCreatorFunc = null;
            this.objToCreateOffset = [0, 0];
            this.objToCreateLife = 0;
            this.beforePaylod = true;
            this.destroyPreviousObjects = false;
            this._actionContainer = actionContainer;
        }
        action.new = function (actionContainer) {
            return new action(actionContainer);
        };
        action.prototype.newAction = function () {
            return this._actionContainer.newAction();
        };
        action.prototype.queryAttack = function () {
            this._queriedAttacks++;
        };
        action.prototype.removePrevObjsOnCreate = function () {
            this.destroyPreviousObjects = true;
            return this;
        };
        action.prototype.userFriction = function (friction) {
            this.newUserFriction = friction;
            return this;
        };
        action.prototype.continueWindow = function (val, requiredAttacks) {
            if (requiredAttacks === void 0) { requiredAttacks = 1; }
            this._continueWindow = val;
            this._requiredQueriedAttacks = requiredAttacks;
            return this;
        };
        action.prototype.create = function (objCreatorFunc) {
            this.objCreatorFunc = objCreatorFunc;
            return this;
        };
        action.prototype.objOffset = function (offset) {
            this.objToCreateOffset = offset;
            return this;
        };
        action.prototype.objLife = function (life) {
            this.objToCreateLife = life;
            return this;
        };
        action.prototype.resetUserGravity = function () {
            this._resetUserGravity = true;
            return this;
        };
        action.prototype.vector = function (angle, magnitude) {
            this.movementVector = new vectorFixedDelta(calculations.degreesToRadians(angle), magnitude);
            return this;
        };
        action.prototype.repeat = function (r) {
            this._repeat = r;
            return this;
        };
        action.prototype.startupWait = function (time) {
            this._startupWait = time;
            this.originalStartupWait = time;
            return this;
        };
        action.prototype.endWait = function (time) {
            this._endWait = time;
            return this;
        };
        action.prototype.getAttackDirection = function () {
            return this.attackDirection;
        };
        action.prototype.attackDirectionUpDown = function () {
            this.attackDirection = movementDirection.up_down;
            return this;
        };
        action.prototype.getGravityShouldBeReset = function () {
            return this.gravityShouldBeReset;
        };
        action.prototype.resetGravity = function () {
            this.gravityShouldBeReset = true;
            return this;
        };
        action.prototype.getUserShouldBeStill = function () {
            return this.userShouldBeStill;
        };
        action.prototype.userStill = function (stillStatus) {
            if (stillStatus) {
                this.userShouldBeStill = genericStatus.true;
            }
            else {
                this.userShouldBeStill = genericStatus.false;
            }
            return this;
        };
        action.prototype.getMovementVector = function () {
            return this.movementVector;
        };
        action.prototype.getRepeat = function () {
            return this._repeat;
        };
        action.prototype.isCompleted = function () {
            return this.jobCompleted;
        };
        action.prototype.play = function (user, l) {
            if (this.jobCompleted)
                return;
            if (this.firstTime) {
                this.usersPrevStoredFriction = user.friction;
                if (this.newUserFriction != -1) {
                    user.friction = this.newUserFriction;
                    this.firstTime = false;
                }
            }
            if (this._continueWindow > 0) {
                this._continueWindow--;
                if (this._queriedAttacks >= this._requiredQueriedAttacks) {
                    this._continueWindow = -1;
                }
                else {
                    return;
                }
            }
            else if (this._continueWindow == 0) {
                this.jobCompleted = true;
                user.friction = this.usersPrevStoredFriction;
                this._actionContainer.stop();
            }
            if (this._startupWait > 0) {
                this._startupWait--;
                if (this._startupWait == 0) {
                    if (this.beforePaylod) {
                        if (this.destroyPreviousObjects == true) {
                            this._actionContainer.removeAllCreatedObjects(l);
                        }
                        this.beforePaylod = false;
                    }
                }
            }
            else {
                if (this.payloadDone == false) {
                    if (this._resetUserGravity) {
                        user.gravity.magnitude = 0;
                    }
                    var delta = this.movementVector.delta;
                    if (this._actionContainer.getDirection() == movementDirection.left) {
                        delta = calculations.PI + ((calculations.PI * 2) - delta);
                    }
                    user.addForceAngleMagnitude(delta, this.movementVector.magnitude);
                    if (this.objCreatorFunc != null) {
                        var newObj = new actionCreatedObject(this.objToCreateLife, this.objCreatorFunc(), this.objToCreateOffset[0], this.objToCreateOffset[1]);
                        this._actionContainer.objectsCreated.push(newObj);
                        this._actionContainer.positionCreatedObject(user, newObj);
                        l.addObject(newObj.obj(), user.onLayer);
                    }
                    this.payloadDone = true;
                }
                if (this._endWait > 0) {
                    this._endWait--;
                }
                else {
                    if (this._repeat > 0) {
                        this._repeat--;
                        this._startupWait = this.originalStartupWait;
                        this.beforePaylod = true;
                        this.payloadDone = false;
                    }
                    else {
                        this.payloadDone = true;
                        this.jobCompleted = true;
                        user.friction = this.usersPrevStoredFriction;
                    }
                }
            }
        };
        return action;
    }());

    var actionEmpty = /** @class */ (function () {
        function actionEmpty() {
            this.movementVector = new nullVector();
        }
        actionEmpty.prototype.objOffset = function (offset) {
            return this;
        };
        actionEmpty.prototype.objLife = function (life) {
            return this;
        };
        actionEmpty.prototype.queryAttack = function () {
        };
        actionEmpty.prototype.userFriction = function (friction) {
            return this;
        };
        actionEmpty.prototype.removePrevObjsOnCreate = function () {
            return this;
        };
        actionEmpty.prototype.continueWindow = function (val, requiredAttacks) {
            return this;
        };
        actionEmpty.prototype.create = function (objCreatorFunc, offset, life) {
            return this;
        };
        actionEmpty.prototype.resetUserGravity = function () {
            return this;
        };
        actionEmpty.prototype.vector = function (angle, magnitude) {
            return this;
        };
        actionEmpty.prototype.repeat = function (r) {
            return this;
        };
        actionEmpty.prototype.startupWait = function (time) {
            return this;
        };
        actionEmpty.prototype.endWait = function (time) {
            return this;
        };
        actionEmpty.prototype.getAttackDirection = function () {
            return movementDirection.left_right;
        };
        actionEmpty.prototype.attackDirectionUpDown = function () {
            return this;
        };
        actionEmpty.prototype.getGravityShouldBeReset = function () {
            return false;
        };
        actionEmpty.prototype.getUserShouldBeStill = function () {
            return genericStatus.notSet;
        };
        actionEmpty.prototype.userStill = function (stillStatus) {
            return this;
        };
        actionEmpty.prototype.resetGravity = function () {
            return this;
        };
        actionEmpty.prototype.getMovementVector = function () {
            return new nullVector();
        };
        actionEmpty.prototype.getRepeat = function () {
            return 0;
        };
        actionEmpty.prototype.isCompleted = function () {
            return true;
        };
        actionEmpty.prototype.play = function (user, l) {
        };
        return actionEmpty;
    }());

    var actionContainer = /** @class */ (function () {
        function actionContainer() {
            this.currentIndex = 0;
            this.actionSeries = [];
            this._keepUserStill = false;
            this.objectsCreated = [];
            this.direction = movementDirection.right;
            this.stopped = false;
        }
        actionContainer.prototype.playCurrent = function (user, l, direction) {
            this.direction = direction;
            for (var i = this.objectsCreated.length - 1; i >= 0; i--) {
                var objMeta = this.objectsCreated[i];
                if (objMeta.life > 0) {
                    objMeta.life--;
                    this.positionCreatedObject(user, objMeta);
                }
                else {
                    l.deleteObject(objMeta.obj());
                    this.objectsCreated.splice(i, 1);
                }
            }
            if (this.current().getUserShouldBeStill() != genericStatus.notSet) {
                this._keepUserStill = (this.current().getUserShouldBeStill() == genericStatus.true) ? true : false;
            }
            this.current().play(user, l);
        };
        actionContainer.prototype.stop = function () {
            this.stopped = true;
        };
        actionContainer.prototype.hasEnded = function () {
            return this.stopped || this.isCurrentCompleted();
        };
        actionContainer.prototype.queryAttack = function () {
            this.current().queryAttack();
        };
        actionContainer.prototype.positionCreatedObject = function (user, createdObj) {
            createdObj.obj().g.x = user.g.x + (user.g.width / 2) - (createdObj.obj().g.width / 2);
            createdObj.obj().g.y = user.g.y + (user.g.height / 2) - (createdObj.obj().g.height / 2);
            if (this.direction == movementDirection.right) {
                createdObj.obj().g.x += createdObj.offsetX();
                createdObj.obj().g.y += createdObj.offsetY();
            }
            else if (this.direction == movementDirection.left) {
                createdObj.obj().g.x -= createdObj.offsetX();
                createdObj.obj().g.y += createdObj.offsetY();
            }
            else if (this.direction == movementDirection.up) {
                createdObj.obj().g.x += createdObj.offsetX();
                createdObj.obj().g.y -= createdObj.offsetY();
            }
            else if (this.direction == movementDirection.down) {
                createdObj.obj().g.x += createdObj.offsetX();
                createdObj.obj().g.y += createdObj.offsetY();
            }
        };
        actionContainer.prototype.getDirection = function () {
            return this.direction;
        };
        actionContainer.prototype.getUserShouldBeStill = function () {
            return this._keepUserStill;
        };
        actionContainer.prototype.isCurrentCompleted = function () {
            return this.current().isCompleted();
        };
        actionContainer.prototype.cleanup = function (l) {
            if (this.current().isCompleted() || this.stopped) {
                this.removeAllCreatedObjects(l);
            }
            this._keepUserStill = false;
        };
        actionContainer.prototype.removeAllCreatedObjects = function (l) {
            for (var i = this.objectsCreated.length - 1; i >= 0; i--) {
                var objMeta = this.objectsCreated[i];
                l.deleteObject(objMeta.obj());
                this.objectsCreated.splice(i, 1);
            }
        };
        actionContainer.prototype.current = function () {
            if (this.actionSeries[this.currentIndex] == undefined) {
                console.log("Can't get ", this.currentIndex, " from ", this.actionSeries);
                return new actionEmpty();
            }
            return this.actionSeries[this.currentIndex];
        };
        actionContainer.prototype.next = function () {
            this.currentIndex += 1;
            if (this.currentIndex > this.actionSeries.length - 1) {
                this.currentIndex = 0;
                return false;
            }
            return true;
        };
        actionContainer.prototype.add = function (action) {
            this.actionSeries.push(action);
            return this;
        };
        actionContainer.prototype.newAction = function () {
            var newAction = action.new(this);
            this.actionSeries.push(newAction);
            return newAction;
        };
        return actionContainer;
    }());

    var baseAttack = /** @class */ (function () {
        function baseAttack(creator, direction) {
            this.attackSeries = new actionContainer();
            //private movementInformationPlayer: actionPlayer = new actionPlayer();
            this.done = false;
            this.attackDirection = movementDirection.right;
            this.attackDirection = direction;
            this.creator = creator;
        }
        baseAttack.prototype.isDone = function () {
            return this.done;
        };
        baseAttack.prototype.userShouldBeStill = function () {
            return this.attackSeries.getUserShouldBeStill();
        };
        baseAttack.prototype.queryAttack = function () {
            this.attackSeries.queryAttack();
        };
        baseAttack.prototype.tickAttack = function (l) {
            if (this.attackSeries.hasEnded() == false) {
                this.attackSeries.playCurrent(this.creator, l, this.attackDirection);
                if (this.attackSeries.isCurrentCompleted()) {
                    this.attackSeries.next();
                }
            }
            else {
                this.attackSeries.cleanup(l);
                this.done = true;
            }
        };
        return baseAttack;
    }());

    var threeHitNormal = /** @class */ (function (_super) {
        __extends(threeHitNormal, _super);
        function threeHitNormal(creator, direction) {
            var _this = _super.call(this, creator, direction) || this;
            var returnUserFacing = function () {
                return creator.facingRight;
            };
            var collision = [dummySandbag.objectName];
            _this.attackSeries
                .newAction().vector(0, 1).userStill(true)
                .create(function () { return hitbox.new([18, 12], 87, 1, collision, returnUserFacing); }).objOffset([16, -5]).objLife(3)
                .startupWait(3)
                .newAction().vector(0, 1).userStill(true).continueWindow(15).removePrevObjsOnCreate()
                .create(function () { return hitbox.new([18, 12], 40, 5, collision, returnUserFacing); }).objOffset([16, -5]).objLife(5)
                .startupWait(5)
                .newAction().vector(60, 4).userStill(true).continueWindow(19)
                .startupWait(5)
                .endWait(16)
                .newAction().userStill(true).removePrevObjsOnCreate()
                .create(function () { return hitbox.new([27, 32], 40, 5, collision, returnUserFacing); }).objOffset([16, 8]).objLife(12)
                .startupWait(0)
                .endWait(10);
            return _this;
        }
        return threeHitNormal;
    }(baseAttack));

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

    var slideKick = /** @class */ (function (_super) {
        __extends(slideKick, _super);
        function slideKick(creator, direction) {
            var _this = _super.call(this, creator, direction) || this;
            var returnUserFacing = function () {
                return creator.facingRight;
            };
            var collision = [dummySandbag.objectName];
            _this.attackSeries
                .newAction().vector(0, 16).userStill(true)
                .create(function () { return hitbox.new([18, 12], 20, 3, collision, returnUserFacing); }).objOffset([16, 5]).objLife(10)
                .startupWait(6)
                .endWait(20).userFriction(1)
                .newAction().vector(40, 12) //.continueWindow(19)
                .create(function () { return hitbox.new([20, 20], 80, 7, collision, returnUserFacing); }).objOffset([8, -10]).objLife(20)
                .startupWait(0)
                .endWait(3);
            return _this;
            /*.newAction().vector(300, 4)
            .startupWait(20)
            .endWait(30);*/
        }
        return slideKick;
    }(baseAttack));

    var forwardAir = /** @class */ (function (_super) {
        __extends(forwardAir, _super);
        function forwardAir(creator, direction) {
            var _this = _super.call(this, creator, direction) || this;
            var returnUserFacing = function () {
                return creator.facingRight;
            };
            var collision = [dummySandbag.objectName];
            _this.attackSeries
                .newAction().vector(90, 1).resetGravity()
                .startupWait(3)
                .endWait(3)
                .newAction().resetGravity().removePrevObjsOnCreate()
                .create(function () { return hitbox.new([20, 48], 280, 3, collision, returnUserFacing); }).objOffset([16, 5]).objLife(4)
                .startupWait(2).repeat(2)
                .endWait(8)
                .newAction().resetGravity().removePrevObjsOnCreate()
                .create(function () { return hitbox.new([32, 48], 10, 4, collision, returnUserFacing); }).objOffset([16, 5]).objLife(10)
                .startupWait(6)
                .endWait(10);
            return _this;
        }
        return forwardAir;
    }(baseAttack));

    var downAir = /** @class */ (function (_super) {
        __extends(downAir, _super);
        function downAir(creator, direction) {
            var _this = _super.call(this, creator, direction) || this;
            var returnUserFacing = function () {
                return creator.facingRight;
            };
            var collision = [dummySandbag.objectName];
            _this.attackSeries
                .newAction().vector(90, 2).resetGravity()
                .startupWait(2)
                .endWait(6)
                .newAction().vector(270, 18).resetGravity()
                .create(function () { return hitbox.new([82, 32], 80, 8.5, collision, returnUserFacing); }).objOffset([0, 5]).objLife(60)
                .startupWait(3)
                .endWait(10);
            return _this;
        }
        return downAir;
    }(baseAttack));

    var neutralAir = /** @class */ (function (_super) {
        __extends(neutralAir, _super);
        function neutralAir(creator, direction) {
            var _this = _super.call(this, creator, direction) || this;
            var returnUserFacing = function () {
                return creator.facingRight;
            };
            var collision = [dummySandbag.objectName];
            _this.attackSeries
                .newAction().resetGravity()
                .create(function () { return hitbox.new([32, 24], 10, 4, collision, returnUserFacing); }).objOffset([16, 0]).objLife(8)
                .startupWait(2)
                .endWait(4)
                .newAction().resetGravity()
                .create(function () { return hitbox.new([20, 24], 170, 4, collision, returnUserFacing); }).objOffset([-16, 0]).objLife(8)
                .startupWait(4)
                .endWait(10);
            return _this;
        }
        return neutralAir;
    }(baseAttack));

    var characterMoves = /** @class */ (function () {
        function characterMoves(ladderObject, groundAttacks, airAttacks) {
            if (ladderObject === void 0) { ladderObject = ""; }
            if (groundAttacks === void 0) { groundAttacks = null; }
            if (airAttacks === void 0) { airAttacks = null; }
            this.maxRunSpeed = 6;
            this.superRunSpeed = 11;
            this.normalRunSpeed = 6;
            this.jumpStrength = 8;
            this.jumpButtonReleased = true;
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
                if (character.verticalCollision > 0) {
                    character.addForceAngleMagnitude(calculations.degreesToRadians(180), (1 / 13) * this.maxRunSpeed);
                }
                else {
                    character.addForceAngleMagnitude(calculations.degreesToRadians(180), (1 / 64) * this.maxRunSpeed);
                }
            }
            if (l.checkKeyHeld("d") || l.checkKeyHeld("D")) {
                if (character.verticalCollision > 0) {
                    character.addForceAngleMagnitude(calculations.degreesToRadians(0), (1 / 13) * this.maxRunSpeed);
                }
                else {
                    character.addForceAngleMagnitude(calculations.degreesToRadians(0), (1 / 64) * this.maxRunSpeed);
                }
            }
            if (this.jumpButtonReleased == true && (l.checkKeyHeld("w") || l.checkKeyHeld("W")) && (character.verticalCollision > 0 || character._isColliding_Special)) {
                character.addForceAngleMagnitude(calculations.degreesToRadians(90), this.jumpStrength);
                this.jumpButtonReleased = false;
            }
            if (l.checkKeyReleased("h")) {
                character.addForceAngleMagnitude(calculations.degreesToRadians(90), this.jumpStrength);
                character.gravity.magnitude = 0;
            }
            if (l.checkKeyHeld("w") || l.checkKeyHeld("W")) {
                this.jumpButtonReleased = true;
            }
            character.force.limitHorizontalMagnitude(this.maxRunSpeed);
        };
        characterMoves.prototype.climbingLadders = function (l, character) {
            if (this.ladderObject == "")
                return;
            var collisionWith = l.isCollidingWith(character, character.collisionBox, [this.ladderObject]);
            if (collisionWith != null) {
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
                    character.g.x = collisionWith.g.x + (collisionWith.g.width / 2) - (character.g.width / 2);
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
                        character.addForceAngleMagnitude(calculations.degreesToRadians(90), this.ladderTopJump);
                    }
                    console.log(l.checkKeyReleased("w"));
                    if (l.checkKeyReleased("w") && this.atLadderTop == true) {
                        this.releasedJumpKeyAtLadderTop = true;
                        console.log("releasedJumpKeyAtLadderTop");
                    }
                    if (l.checkKeyHeld("s")) {
                        character.g.y += this.climbDownSpeed;
                        if (l.isCollidingWith(character, character.collisionBox, character.collisionTargets) != null) {
                            character.g.y = collisionWith.g.y + (collisionWith.collisionBox.y / 2) + collisionWith.collisionBox.height / 2 - 1;
                        }
                    }
                    var movedBetweenLadder = false;
                    if (l.checkKeyReleased("d")) {
                        this.canJumpLadders = true;
                    }
                    if (l.checkKeyReleased("a")) {
                        this.canJumpLadders = true;
                    }
                    if (l.checkKeyHeld("a")) {
                        if (this.canJumpLadders) {
                            character.g.x -= character.collisionBox.width;
                            movedBetweenLadder = true;
                            if (l.isCollidingWith(character, character.collisionBox, character.collisionTargets) != null) {
                                character.g.x += character.collisionBox.width;
                                movedBetweenLadder = false;
                            }
                            if (movedBetweenLadder && l.checkKeyHeld("w")) {
                                character.addForceAngleMagnitude(calculations.degreesToRadians(135), this.ladderSideJump);
                                this.atLadderTop = false;
                                this.canJumpLadders = false;
                                this.climbindLadder = false;
                                this.releasedJumpKeyAtLadderTop = false;
                            }
                            else if (movedBetweenLadder) {
                                this.releasedJumpKeyAtLadderTop = false;
                                this.canJumpLadders = false;
                            }
                        }
                    }
                    if (l.checkKeyHeld("d")) {
                        if (this.canJumpLadders) {
                            character.g.x += character.collisionBox.width;
                            movedBetweenLadder = true;
                            if (l.isCollidingWith(character, character.collisionBox, character.collisionTargets) != null) {
                                character.g.x -= character.collisionBox.width;
                                movedBetweenLadder = false;
                            }
                            if (movedBetweenLadder && l.checkKeyHeld("w")) {
                                character.addForceAngleMagnitude(calculations.degreesToRadians(45), this.ladderSideJump);
                                this.atLadderTop = false;
                                this.canJumpLadders = false;
                                this.climbindLadder = false;
                                this.releasedJumpKeyAtLadderTop = false;
                            }
                            else if (movedBetweenLadder) {
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
                    character.addForceAngleMagnitude(calculations.degreesToRadians(90), this.ladderTopJump);
                    this.hasJumpedFromLadder = true;
                }
            }
        };
        characterMoves.prototype.handleAttacks = function (l, character) {
            this.attack.tickAttack(l);
            if (l.checkKeyHeld(" ")) {
                if (this.attackButtonReleased) {
                    this.attackButtonReleased = false;
                    this.attack.queryAttack();
                    if (this.attack.isDone()) {
                        if (character.verticalCollision > 0 || character._isColliding_Special) {
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

    var grassFilter = /** @class */ (function () {
        function grassFilter(polygonPosGlslAdapted, spacingConst, grassPerLine, minGrassHeight, aspectRatio, filterAreaWidth, filterAreaHeight, filterAreaX, filterAreaY) {
            this.grassShader = "\n    precision lowp float;\n    varying vec2 vTextureCoord;\n    uniform sampler2D uSampler;\n\n    uniform float yPolPos[{yPolPosArrayLength}];\n\n    uniform float time;\n    uniform float windWidth;\n    uniform float aspectRatio;\n    uniform float cameraPosition;\n    uniform float cameraSize;\n    \n\n    uniform float grassMaxHeight;\n\n    uniform vec2 collisionPoints[2];\n\n    const int grassPerLine = {grassPerLine};\n    const float SPACING = {spacing};\n    const float MINGRASSHEIGHT = {MINGRASSHEIGHT};\n    const float SPACEBETWEENEACHBLADE = {SPACEBETWEENEACHBLADE};\n\n    float randFromVec(vec2 co){\n        return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);\n    }\n\n    float distSquared(vec2 A, vec2 B){\n        vec2 C = (A - B) * vec2(aspectRatio, 1.0);\n        return dot( C, C );\n    }\n\n    vec4 generateGrass(float polygonYPos, int lineIndex, float lineStart, float topYPos, float heightDifference){\n        \n        for(int b=0; b<grassPerLine; b++){\n            float grassBladeX = lineStart+(float(b)*SPACEBETWEENEACHBLADE);\n            if(vTextureCoord.x > grassBladeX-grassMaxHeight && vTextureCoord.x < grassBladeX+grassMaxHeight){\n                float grassBladeRandomVal = randFromVec(vec2(lineIndex, b));\n                float randomBladePosition = grassBladeRandomVal * SPACEBETWEENEACHBLADE;\n                grassBladeX += randomBladePosition;\n\n                float relativePosition = (grassBladeX - (float(lineIndex)*SPACING))/SPACING;\n                float grassBladeY = polygonYPos + (relativePosition*heightDifference);\n                \n                float collisionForce = 0.0;\n                for(int i=0; i<2; i++){\n                    \n                    float distanceFromGrassBladeToCollider = abs(grassBladeX - collisionPoints[i].x);\n                    \n                    //Alternative WIP formula for collision(go to desmos.com): 1-(cos(log((x+0.008)^3)*1)*0.5)-0.5\n                    if(distanceFromGrassBladeToCollider < grassMaxHeight/3.5){\n                        float distancePercentage = (distanceFromGrassBladeToCollider/(grassMaxHeight/3.5));\n                        float distanceToCollider = grassBladeX - collisionPoints[i].x;\n\n                        float distanceToColliderY = abs(grassBladeY - collisionPoints[i].y);\n                        float distanceToColliderYPercentage = 0.0;\n                        if(distanceToColliderY < 0.02){\n                            distanceToColliderYPercentage =  1.0-(distanceToColliderY / (0.02));\n                        }\n\n                        if(distanceToCollider < 0.0){\n                            collisionForce = -2.0*(1.0-(cos(distancePercentage*6.3)*0.5)-0.5);\n                        }else{\n                            collisionForce = 1.0*(1.0-(cos(distancePercentage*6.3)*0.5)-0.5);\n                        }\n                        collisionForce = collisionForce * distanceToColliderYPercentage;\n                        break;\n                    }\n                }\n                \n                \n                float grassBladeHeight = grassMaxHeight * grassBladeRandomVal;\n                if(grassBladeHeight < MINGRASSHEIGHT){\n                    grassBladeHeight += 0.01;\n                }\n                float grassHeightStrengthModify = grassBladeHeight/grassMaxHeight;\n                float grassTop = polygonYPos - grassBladeHeight + topYPos;\n    \n                \n                float yPosOfGras = ((vTextureCoord.y - grassTop)/(grassBladeHeight));\n                \n                //Apply wind effect\n                //Wave from top to right\n                float windStrength = collisionForce + pow(cos(time), 2.0);\n                float steepSlopeSwayLimit = 1.0;\n                if(heightDifference > 0.01){\n                    steepSlopeSwayLimit = 0.3;\n                }\n                float offsetCurve = (1.0-yPosOfGras) * 0.00085 * (0.9+windStrength);\n\n\n                \n                vec2 grassBladePoint = vec2(grassBladeX, grassBladeY);\n                    \n                float distanceToBladeStartSquared = distSquared(grassBladePoint, vec2(vTextureCoord.x, vTextureCoord.y));\n                float extraCurve = (distanceToBladeStartSquared/(grassBladeHeight*grassBladeHeight)) * 0.0015 * windStrength *  grassHeightStrengthModify * steepSlopeSwayLimit;\n                \n\n                float bladeWidthMoon = 0.0002;\n                \n                float bladePosition = lineStart+(float(b)*SPACEBETWEENEACHBLADE) + randomBladePosition;\n\n                float grassBladeLeftSideStart = bladePosition + offsetCurve + extraCurve;\n                float grassBladeRightSideStart = bladePosition + offsetCurve + extraCurve;\n\n                float alpha = 0.0;\n                \n                if((vTextureCoord.x) > grassBladeLeftSideStart - bladeWidthMoon\n                && (vTextureCoord.x) < grassBladeRightSideStart + bladeWidthMoon\n                && distanceToBladeStartSquared < (grassBladeHeight*grassBladeHeight)){\n                    alpha = 1.0;\n                }\n\n\n                if(alpha != 0.0){\n                    if(grassBladeRandomVal < 0.2){\n                        return vec4(0.12, 0.42, 0.01568627, alpha);\n                    }else if(grassBladeRandomVal < 0.4){\n                        return vec4(0.4196, 0.6078, 0.1176, alpha);\n                    }else if(grassBladeRandomVal < 0.6){\n                        return vec4(0.5529, 0.749, 0.2235, alpha);\n                    }else if(grassBladeRandomVal < 0.8){\n                        return vec4(0.448, 0.5509, 0.2019, alpha);\n                    }else if(grassBladeRandomVal <= 1.0){\n                        return vec4(0.425, 0.6509, 0.1019, alpha);\n                    }\n                }\n\n                /*if(distanceToBladeStartSquared < 0.000001){\n                    return vec4(0.0, 0.0, 1.0, 1.0);\n                }*/\n                \n            }\n            \n            \n        }\n\n        return vec4(0.0, 0.0, 0.0, 0.0);\n    }\n\n    void main(void)\n    {\n        /*float distToPlayer = distSquared(vTextureCoord, collisionPoints[0]);\n        if(distToPlayer < 0.0001){\n            gl_FragColor = vec4(0.12, 0.42, 1.0, 1.0);\n        }\n\n        float distToPlayer2 = distSquared(vTextureCoord, collisionPoints[1]);\n        if(distToPlayer2 < 0.0001){\n            gl_FragColor = vec4(0.12, 0.42, 1.0, 1.0);\n        }\n\n        float distToPlayer3 = distSquared(vTextureCoord, collisionPoints[2]);\n        if(distToPlayer3 < 0.0001){\n            gl_FragColor = vec4(0.12, 0.42, 1.0, 1.0);\n        }*/\n\n        float distanceToCamera = abs(vTextureCoord.x - cameraPosition);\n        if(distanceToCamera < cameraSize){\n            for (int lineIndex = 0; lineIndex < {yPolPosArrayLength}; ++lineIndex){\n\n            \n                float heightDifference = yPolPos[lineIndex+1] - yPolPos[lineIndex];\n    \n                float relativePosition = (vTextureCoord.x - (float(lineIndex)*SPACING))/SPACING;\n    \n                float topYPos = (relativePosition*heightDifference);\n    \n                float grassTop = yPolPos[lineIndex] - grassMaxHeight*1.0;\n                float groundY = yPolPos[lineIndex] + topYPos;\n                if(vTextureCoord.y > grassTop\n                && vTextureCoord.y < groundY){\n\n                    float lineStart = float(lineIndex)*SPACING;\n                    \n                    if(vTextureCoord.x > lineStart - SPACING && vTextureCoord.x < lineStart+SPACING*2.0){\n                        vec4 grassResult = generateGrass(yPolPos[lineIndex], lineIndex, lineStart, topYPos, heightDifference);\n\n                    \n                        if(grassResult != vec4(0.0, 0.0, 0.0, 0.0)){\n                            gl_FragColor = grassResult;\n                        }else{\n                            //gl_FragColor = vec4(0.0, 0.0, 1.0, 0.5);\n                        }\n                    }\n                    \n                }\n\n            }\n        }\n        \n        //gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);\n    }";
            this.grassFragment = { yPolPos: [1, 2, 3, 4], time: 1.0, windWidth: 0.4,
                aspectRatio: 4.0, cameraPosition: 0.0, cameraSize: 0.06,
                grassMaxHeight: 0.02,
                collisionPoints: [
                    -2, -2,
                    -2, -2
                ]
            };
            this.filterAreaX = 0;
            this.filterAreaY = 0;
            this.filterAreaWidth = 0;
            this.filterAreaHeight = 0;
            this.mainCharacterFollow = [0, 0];
            this.mainCharacterFollow2 = [0, 0];
            this.polygonPosGlslAdapted = polygonPosGlslAdapted;
            this.filterAreaWidth = filterAreaWidth;
            this.filterAreaHeight = filterAreaHeight;
            this.filterAreaX = filterAreaX;
            this.filterAreaY = filterAreaY;
            var movingGrassFragShaderParamsFixed = this.grassShader.replace(/{yPolPosArrayLength}/g, "" + polygonPosGlslAdapted.length);
            movingGrassFragShaderParamsFixed = movingGrassFragShaderParamsFixed.replace(/{spacing}/g, spacingConst + "");
            movingGrassFragShaderParamsFixed = movingGrassFragShaderParamsFixed.replace(/{grassPerLine}/g, grassPerLine + "");
            movingGrassFragShaderParamsFixed = movingGrassFragShaderParamsFixed.replace(/{MINGRASSHEIGHT}/g, minGrassHeight);
            movingGrassFragShaderParamsFixed = movingGrassFragShaderParamsFixed.replace(/{SPACEBETWEENEACHBLADE}/g, "" + (spacingConst / grassPerLine));
            //Moving grass
            this.grassFragment.yPolPos = polygonPosGlslAdapted;
            this.grassFragment.time = 0.0;
            this.grassFragment.aspectRatio = aspectRatio;
            this.grassFragment.cameraSize = 0.078; //0.08;
            this.grassFragment.grassMaxHeight = 0.0225;
            console.log("movingGrassFragShaderParamsFixed: ", movingGrassFragShaderParamsFixed);
            console.log("grassFragment: ", this.grassFragment);
            this.myFilter = new PIXI.Filter(undefined, movingGrassFragShaderParamsFixed, this.grassFragment);
            this.myFilter.resolution = 0.5;
            this.myFilter.autoFit = false;
        }
        grassFilter.prototype.filter = function () {
            return this.myFilter;
        };
        grassFilter.prototype.updateCollisionPositions = function (l) {
            var currentTime = this.grassFragment.time;
            currentTime += 0.015;
            var pInShader = (l.getCameraX() - this.filterAreaX) / this.filterAreaWidth;
            this.grassFragment.cameraPosition = pInShader;
            this.grassFragment.time = currentTime;
            var primaryColliderX = grassFilter.primaryCollider.g.x + grassFilter.primaryCollider.collisionBox.x + (grassFilter.primaryCollider.collisionBox.width / 2);
            var primaryColliderY = grassFilter.primaryCollider.g.y + grassFilter.primaryCollider.collisionBox.y + (grassFilter.primaryCollider.collisionBox.height);
            this.grassFragment.collisionPoints[0] = (primaryColliderX - this.filterAreaX) / this.filterAreaWidth;
            this.grassFragment.collisionPoints[1] = 1.0 - (((this.filterAreaY - primaryColliderY) / this.filterAreaHeight));
            //delayed follow
            if (this.mainCharacterFollow[0] == 0 && this.mainCharacterFollow[1] == 0) {
                this.mainCharacterFollow[0] = grassFilter.primaryCollider.g.x;
                this.mainCharacterFollow[1] = grassFilter.primaryCollider.g.y;
            }
            else {
                var distanceToTarget = calculations.distanceBetweenPoints(this.mainCharacterFollow[0], this.mainCharacterFollow[1], grassFilter.primaryCollider.g.x, grassFilter.primaryCollider.g.y);
                var angleToTarget = calculations.angleBetweenPoints(this.mainCharacterFollow[0] - grassFilter.primaryCollider.g.x, this.mainCharacterFollow[1] - grassFilter.primaryCollider.g.y);
                this.mainCharacterFollow[0] += Math.cos(angleToTarget) * (distanceToTarget * 0.148);
                this.mainCharacterFollow[1] += Math.sin(angleToTarget) * (distanceToTarget * 0.148);
            }
            var primaryColliderXDelayed = this.mainCharacterFollow[0] + grassFilter.primaryCollider.collisionBox.x + (grassFilter.primaryCollider.collisionBox.width / 2);
            var primaryColliderYDelayed = this.mainCharacterFollow[1] + grassFilter.primaryCollider.collisionBox.y + (grassFilter.primaryCollider.collisionBox.height);
            this.grassFragment.collisionPoints[2] = (primaryColliderXDelayed - this.filterAreaX) / this.filterAreaWidth;
            this.grassFragment.collisionPoints[3] = 1.0 - (((this.filterAreaY - primaryColliderYDelayed) / this.filterAreaHeight));
            //delayed follow 2
            /*if(this.mainCharacterFollow2[0] == 0 && this.mainCharacterFollow2[1] == 0){
                this.mainCharacterFollow2[0] = grassFilter.primaryCollider.g.x;
                this.mainCharacterFollow2[1] = grassFilter.primaryCollider.g.y;
            }else{
                let distanceToTarget = calculations.distanceBetweenPoints(this.mainCharacterFollow2[0], this.mainCharacterFollow2[1], grassFilter.primaryCollider.g.x, grassFilter.primaryCollider.g.y);
                let angleToTarget = calculations.angleBetweenPoints(this.mainCharacterFollow2[0] - grassFilter.primaryCollider.g.x, this.mainCharacterFollow2[1] - grassFilter.primaryCollider.g.y);
                this.mainCharacterFollow2[0] += Math.cos(angleToTarget) *  (distanceToTarget*0.085);
                this.mainCharacterFollow2[1] += Math.sin(angleToTarget) *  (distanceToTarget*0.085);
            }
            let primaryColliderXDelayed2 = this.mainCharacterFollow2[0] + grassFilter.primaryCollider.collisionBox.x + (grassFilter.primaryCollider.collisionBox.width/2);
            let primaryColliderYDelayed2 = this.mainCharacterFollow2[1] + grassFilter.primaryCollider.collisionBox.y + (grassFilter.primaryCollider.collisionBox.height);

            this.grassFragment.collisionPoints[4] = (primaryColliderXDelayed2 - this.filterAreaX)/this.filterAreaWidth;
            this.grassFragment.collisionPoints[5] = 1.0-(((this.filterAreaY-primaryColliderYDelayed2)/this.filterAreaHeight));*/
        };
        grassFilter.primaryCollider = new nulliObject(0, 0);
        return grassFilter;
    }());

    var player = /** @class */ (function (_super) {
        __extends(player, _super);
        function player(xp, yp, input) {
            var _this = _super.call(this, xp, yp, player.objectName) || this;
            _this.airFriction = 0.99;
            _this.friction = 0.7;
            _this.gravity = new vectorFixedDelta(calculations.degreesToRadians(270), 0); //vector.fromAngleAndMagnitude(calculations.degreesToRadians(270), 0.6);
            _this.weight = 0.05;
            _this.currentSprite = "warriorIdle";
            _this.currentSpriteObj = new spriteContainer();
            _this.collidesWithPolygonGeometry = true;
            _this.facingRight = true;
            _super.prototype.setCollision.call(_this, 0, 0, 64, 98);
            //console.log(input);
            grassFilter.primaryCollider = _this;
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI.Graphics();
                newGraphics.beginFill(0xFF3e50);
                newGraphics.drawRect(0, 0, 64, 98);
                newGraphics.endFill();
                g.addChild(newGraphics);
                g.calculateBounds();
                return g;
            });
            _this.g.filters = [];
            _super.prototype.addCollisionTarget.call(_this, block.objectName, block32x64.objectName, block64x32.objectName, movingBlockHori.objectName, movingBlockVert.objectName, "dummySandbag", tinyBlock32.objectName, wideBlock.objectName);
            _this.updateCurrentSprite();
            _this.characterMoveBase = new characterMoves(ladder.objectName, function (l) {
                //Ground attacks
                if (l.checkKeyHeld("s")) {
                    return new slideKick(_this, (_this.facingRight) ? movementDirection.right : movementDirection.left);
                }
                else {
                    return new threeHitNormal(_this, (_this.facingRight) ? movementDirection.right : movementDirection.left);
                }
            }, function (l) {
                //air attacks
                if (l.checkKeyHeld("d") || l.checkKeyHeld("a")) {
                    return new forwardAir(_this, (_this.facingRight) ? movementDirection.right : movementDirection.left);
                }
                else if (l.checkKeyHeld("s")) {
                    return new downAir(_this, (_this.facingRight) ? movementDirection.right : movementDirection.left);
                }
                else if (!l.checkKeyHeld("d") && !l.checkKeyHeld("d") && !l.checkKeyHeld("d") && !l.checkKeyHeld("d")) {
                    return new neutralAir(_this, (_this.facingRight) ? movementDirection.right : movementDirection.left);
                }
                return new baseAttackNull();
            });
            return _this;
        }
        player.prototype.init = function (roomEvents) {
            var _this = this;
            if (roomEvents.getRoomStartString() != "") {
                var roomStartObj = JSON.parse(roomEvents.getRoomStartString());
                if (roomStartObj.from != null) {
                    var from_1 = roomStartObj.from;
                    var roomChangers = roomEvents.objContainer.getSpecificObjects("roomChanger");
                    roomChangers.forEach(function (roomChanger) {
                        var roomChangerJson = JSON.parse(roomChanger.outputString);
                        var facing = roomChangerJson.facing;
                        if (roomChangerJson.to == from_1) {
                            _this.g.y = roomChanger.g.y;
                            _this.g.x = roomChanger.g.x + _this.collisionBox.x + _this.collisionBox.width / 2;
                            if (facing == "right") {
                                _this.g.x += 50;
                            }
                            else if (facing == "left") {
                                _this.g.x -= 50;
                            }
                        }
                    });
                }
            }
        };
        player.prototype.logic = function (l) {
            _super.prototype.logic.call(this, l);
            //l.queryKey();
            this.characterMoveBase.move(l, this);
            l.setCameraTarget(this.g.x + this.collisionBox.x + (this.collisionBox.width / 2), this.g.y);
            //console.log(this.force.Dy);
            //console.log("Grav mag", this.gravity.magnitude);
            /*if(l.checkKeyReleased("p") && this.attacking == false){
                l.deleteObject(this);
                l.addObject(new mio(this.g.x, this.g.y-32, ""), this.onLayer);
            }*/
            if (this.verticalCollision > 0) {
                if (this.force.Dx > 0) {
                    this.facingRight = true;
                }
                else if (this.force.Dx < 0) {
                    this.facingRight = false;
                }
            }
        };
        player.prototype.playFootstepSounds = function () {
            resourcesHand.playRandomAudio(["footstepDirt1.wav", "footstepDirt2.wav", "footstepDirt3.wav", "footstepDirt4.wav"]);
        };
        player.prototype.updateCurrentSprite = function () {
            _super.prototype.removeAllSprites.call(this);
            if (this.currentSprite != null) {
                this.currentSpriteObj.set(_super.prototype.addSprite.call(this, new animConfig({
                    animationName: this.currentSprite,
                    scaleX: 4,
                    scaleY: 4,
                    speed: 0.3,
                    x: 64,
                    y: 77,
                    anchorX: 0.5,
                    anchorY: 0.34,
                })));
                if (this.currentSpriteObj != null) {
                    this.currentSpriteObj.update(function (x) { return x.filters = []; });
                    if (this.facingRight == true) {
                        this.currentSpriteObj.update(function (x) { return x.pivot.set(0, 15); });
                    }
                    else {
                        this.currentSpriteObj.update(function (x) { return x.pivot.set(-15, 15); });
                    }
                }
            }
            this.g.calculateBounds();
        };
        player.objectName = "player";
        return player;
    }(objectBase));

    var mio = /** @class */ (function (_super) {
        __extends(mio, _super);
        function mio(xp, yp, input) {
            var _this = _super.call(this, xp, yp, mio.objectName) || this;
            _this.airFriction = 0.93;
            _this.gravity = new vectorFixedDelta(calculations.degreesToRadians(270), 0); //vector.fromAngleAndMagnitude(calculations.degreesToRadians(270), 0.6);
            _this.weight = 0.09;
            _this.maxRunSpeed = 13;
            _this.normalRunSpeed = 13;
            _this.superRunSpeed = 19;
            _this.currentSprite = "catReady";
            _this.currentSpriteObj = new spriteContainer();
            _this.jumpAngle = 0;
            _this.shakeCameraForce = 0;
            _this.airbornTimer = 0;
            _this.facingRight = true;
            _this.climbing = false;
            _this.canClimb = true;
            _this.falling = false;
            _this.climbingTimer = 0;
            _this.hasJumped = false;
            _this.constantForce = 0;
            _this.attacking = false;
            _this.actionWait = 0;
            _this.hitboxToCreate = null;
            _this.jumpsquateLength = 4;
            _this.jumpSquatCounter = -1;
            _this.myShaderFrag = "\n    varying vec2 vTextureCoord;\n    uniform sampler2D uSampler;\n\n\n    float rand(vec2 co){\n        return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);\n    }\n\n\n    void main(void)\n    {\n        float width = 256.0;\n        float height = 175.0;\n\n        int rings = int(width/16.0);\n\n        vec4 t = texture2D(uSampler, vTextureCoord);\n\n        int color = 1;\n        int spot = 0;\n\n        float distanceFromCenterX = vTextureCoord.x - 0.5;\n        float distanceFromCenterY = vTextureCoord.y - (1.0 - 0.68/*height/width*/);\n        float hyputenuse = sqrt((distanceFromCenterX*distanceFromCenterX) + (distanceFromCenterY*distanceFromCenterY));\n\n        /*if(floor(hyputenuse*100.0) == 15.0){\n            color = 1;\n        }*/\n\n        float floatPerPixel = 1.0/width;\n\n        float random = rand(vTextureCoord);\n\n        float averageColorStrength = (t.x + t.y + t.z)/3.0;\n        \n\n\n\n        if(averageColorStrength > 0.8){ //face and part of sword\n            color = -1;\n        }\n\n        if(averageColorStrength < 0.8\n            && averageColorStrength > 0.4){//armor\n                color = 2;\n        }\n\n        if(averageColorStrength < 0.3\n            && averageColorStrength > 0.2){//hair and part of wrists\n                color = 3;\n        }\n\n\n\n        for(int i=0; i<128; i++){\n\n            int draw = int(float(i) - (2.0 * floor(float(i)/2.0)));\n            if(draw == 1 && i > 3 + int((128.0*random)) ){\n                if(hyputenuse < float(i)*floatPerPixel && hyputenuse > float(i-int(32.0*averageColorStrength))*(floatPerPixel)){\n                    spot = 1;\n                }\n            }\n            \n        }\n\n\n        int colorIt = 0;\n        if(random > 0.5){\n            //color = 1;\n            //colorIt = 1;\n        }\n\n        \n        //t.a = 1.0;\n\n        vec4 colorOut = vec4(1.0 * t.a, 1.0 * t.a, 1.0 * t.a, t.a);\n\n        if(color == -1){//white\n            colorOut = vec4(1.0 * t.a, 1.0 * t.a, 1.0 * t.a, t.a);\n        }else if(color == 0){//black\n            colorOut = vec4(0.0 * t.a, 0.0 * t.a, 0.0 * t.a, t.a);\n        }else if(color == 1){//blue\n            colorOut = vec4(0.0 * t.a, 0.0 * t.a, vTextureCoord.y * t.a, t.a);\n        }else if(color == 2){//silver\n            colorOut = vec4(0.4 * t.a, 0.4 * t.a, 0.4 * t.a, t.a);\n        }else if(color == 3){//yellow\n            colorOut = vec4(0.7 * t.a, 0.7 * t.a, 0.09 * t.a, t.a);\n        }else{\n            colorOut = vec4(0.0 * t.a, 0.0 * t.a, 0.0 * t.a, t.a);\n        }\n\n        if(spot == 1){\n            colorOut = colorOut*colorOut;\n        }\n\n        gl_FragColor = colorOut;\n\n        \n    }\n    ";
            _super.prototype.setCollision.call(_this, 14, 40, 100, 88);
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI.Graphics();
                newGraphics.beginFill(0xFF3e50);
                newGraphics.drawRect(14, 40, 100, 88);
                newGraphics.endFill();
                g.addChild(newGraphics);
                g.calculateBounds();
                return g;
            });
            _super.prototype.addCollisionTarget.call(_this, block.objectName, block32x64.objectName, block64x32.objectName, movingBlockHori.objectName, movingBlockVert.objectName, dummySandbag.objectName, tinyBlock32.objectName, wideBlock.objectName);
            _this.updateCurrentSprite();
            return _this;
        }
        mio.prototype.logic = function (l) {
            var _this = this;
            _super.prototype.logic.call(this, l);
            if (Math.floor(this.force.Dy) == 0 && Math.floor(this.gravity.magnitude) == 0) {
                this.hasJumped = false;
            }
            if (this.climbing == false) {
                if ((l.checkKeyHeld("a") || l.checkKeyHeld("d")) && this.force.Dx == 0 && Math.floor(this.force.Dy) > 0 && this.canClimb && this.falling == false && this.hasJumped) {
                    this.climbing = true;
                    this.gravity.magnitude = 0;
                    this.climbingTimer = 70;
                    this.canClimb = false;
                }
            }
            else {
                if (this.force.Dx != 0 || this.climbingTimer <= 0 || (l.checkKeyHeld("a") || l.checkKeyHeld("d")) == false || (l.checkKeyHeld("a") && l.checkKeyHeld("d"))) {
                    this.climbing = false;
                    this.weight = 0.09;
                    this.falling = true;
                }
                else {
                    this.falling = false;
                    this.airbornTimer = 0;
                    this.weight = 0.001;
                }
                if (this.climbingTimer > 0) {
                    this.climbingTimer--;
                }
            }
            if (Math.floor(this.force.Dy) == 0 && Math.round(this.gravity.magnitude) == 0) {
                this.canClimb = true;
                this.falling = false;
            }
            if (l.checkKeyHeld("Control")) {
                this.maxRunSpeed = this.superRunSpeed;
            }
            else {
                this.maxRunSpeed = this.normalRunSpeed;
            }
            if (l.checkKeyHeld("a") && this.actionWait == 0) {
                _super.prototype.addForceAngleMagnitude.call(this, calculations.degreesToRadians(180), (1 / 13) * this.maxRunSpeed);
            }
            if (l.checkKeyHeld("d") && this.actionWait == 0) {
                _super.prototype.addForceAngleMagnitude.call(this, calculations.degreesToRadians(0), (1 / 13) * this.maxRunSpeed);
            }
            if (this.climbing == false) {
                if (this.falling == false && this.hasJumped == false && l.checkKeyPressed("w") && Math.floor(this.gravity.magnitude) == 0 && this.actionWait == 0) {
                    _super.prototype.addForceAngleMagnitude.call(this, calculations.degreesToRadians(90), 26);
                    this.hasJumped = true;
                }
            }
            else {
                if (l.checkKeyHeld("w")) {
                    _super.prototype.addForceAngleMagnitude.call(this, calculations.degreesToRadians(90), 0.5);
                }
            }
            this.force.limitHorizontalMagnitude(this.maxRunSpeed);
            if (this.climbing && this.force.Dy < 0) {
                this.currentSprite = "catRun";
            }
            else if (this.force.Dy <= -9 && this.gravity.magnitude > 0) {
                this.currentSprite = "catJumpUp";
            }
            else if (this.force.Dy > -9 && this.force.Dy < 9 && this.gravity.magnitude > 0) {
                this.currentSprite = "catJumpMid";
            }
            else if (this.force.Dy > 9 && this.gravity.magnitude > 0) {
                this.currentSprite = "catJumpDown";
            }
            if (Math.abs(this.force.Dy) < 1) {
                this.jumpAngle = 0;
                if (Math.abs(this.force.Dx) <= 1) {
                    this.currentSprite = "catReady";
                }
                else if (this.force.Dx != 0) {
                    this.currentSprite = "catRun";
                }
            }
            if (this.force.Dy > 1) {
                if (this.force.Dx > 0 && this.jumpAngle < 0.4) {
                    this.jumpAngle += 0.015;
                }
                else if (this.jumpAngle > -0.4) {
                    this.jumpAngle -= 0.015;
                }
            }
            if (_super.prototype.hasSprite.call(this, this.currentSprite) == false) {
                _super.prototype.removeAllSprites.call(this);
                this.updateCurrentSprite();
            }
            this.currentSpriteObj.update(function (x) { return x.rotation = _this.jumpAngle; });
            if (this.climbing) {
                if (l.checkKeyHeld("a")) {
                    this.currentSpriteObj.update(function (x) { return x.rotation = calculations.degreesToRadians(90); });
                }
                else if (l.checkKeyHeld("d")) {
                    this.currentSpriteObj.update(function (x) { return x.rotation = calculations.degreesToRadians(270); });
                }
            }
            if (this.currentSprite == "catRun") {
                var animWithSpeed_1 = 0.5 * Math.abs(this.force.Dx) / this.superRunSpeed;
                if (animWithSpeed_1 < 0.1)
                    animWithSpeed_1 = 0.1;
                this.currentSpriteObj.update(function (x) { return x.animationSpeed = animWithSpeed_1; });
            }
            if (Math.abs(Math.floor(this.force.Dx)) != 0) {
                if (this.force.Dx > 0) {
                    _super.prototype.scaleXSprites.call(this, 3);
                    this.facingRight = true;
                    if (this.jumpAngle < 0) {
                        this.jumpAngle *= -1;
                    }
                }
                else if (this.force.Dx < 0) {
                    _super.prototype.scaleXSprites.call(this, -3);
                    this.facingRight = false;
                    if (this.jumpAngle > 0) {
                        this.jumpAngle *= -1;
                    }
                }
            }
            if (Math.abs(Math.floor(this.force.Dx)) >= 5) {
                l.setCameraMoveSpeedX(0.07);
            }
            else {
                l.setCameraMoveSpeedX(0.04);
            }
            if (this.force.Dy >= 1) {
                this.airbornTimer++;
            }
            else {
                if (this.airbornTimer > 25) {
                    this.shakeCameraForce = this.airbornTimer * 0.7;
                    if (this.shakeCameraForce > 40) {
                        this.shakeCameraForce = 40;
                    }
                }
                this.airbornTimer = 0;
            }
            this.hangleAttacks(l);
            if (this.shakeCameraForce > 0) {
                l.setCameraOffsetX(-this.shakeCameraForce + Math.random() * this.shakeCameraForce);
                l.setCameraOffsetY(-this.shakeCameraForce + Math.random() * this.shakeCameraForce);
                this.shakeCameraForce--;
            }
            else {
                l.setCameraOffsetX(0);
                l.setCameraOffsetY(0);
            }
            var spaceToAdd = 128;
            if (Math.abs(this.force.Dx) > 2) {
                spaceToAdd = 256;
            }
            var addCamSpace = spaceToAdd;
            if (this.facingRight == false) {
                addCamSpace = -spaceToAdd;
            }
            var addCamSpaceY = 0;
            if (Math.floor(this.force.Dy) > 30) {
                addCamSpaceY = 600;
            }
            l.setCameraTarget(this.g.x + addCamSpace + 64, this.g.y + addCamSpaceY);
            /*if(this.hitboxToCreate != null){
                if(this.hitboxToCreate[0] > 0){
                    this.hitboxToCreate[0]--;
                    if(this.hitboxToCreate[0] == 0){
                        l.addObject(this.hitboxToCreate[1], this.onLayer);
                    }
                    
                }

                if(this.hitboxToCreate != null && this.hitboxToCreate[1].aerial && (this.climbing || Math.round(this.gravity.Dy) == 0)){
                    this.hitboxToCreate[1].life *= 0.8;
                }
            }*/
            if (l.checkKeyReleased("p") && this.attacking == false) {
                l.deleteObject(this);
                l.addObject(new player(this.g.x, this.g.y - 32, ""), this.onLayer);
            }
        };
        mio.prototype.hangleAttacks = function (l) {
            if (l.checkKeyPressed(" ") && this.actionWait == 0 && this.climbing == false) {
                if (Math.floor(this.gravity.magnitude) != 0) {
                    this.attacking = true;
                    this.constantForce = 15;
                    this.actionWait = 33;
                    this.airbornTimer += 5;
                    /*resourcesHand.playAudioVolume("playerBeastAttack1.ogg", 0.2);
                    this.hitboxToCreate = tools.createHitbox({
                        startupTime: 4,
                        x: this.g.x,
                        y: this.g.y,
                        creator: this,
                        life: 24,
                        size: [64, 80],
                        offset: [60, 54],
                        hitboxDirection: new vectorFixedDelta(calculations.degreesToRadians(24), 16),
                        aerial: true,
                        type: "playerBeastForm"
                    });*/
                }
                else {
                    this.attacking = true;
                    this.constantForce = 10;
                    this.actionWait = 25;
                    /*this.hitboxToCreate = tools.createHitbox({
                        startupTime: 4,
                        x: this.g.x,
                        y: this.g.y,
                        creator: this,
                        life: 6,
                        size: [98, 48],
                        offset: [64, 5],
                        hitboxDirection: new vectorFixedDelta(calculations.degreesToRadians(24), 12),
                        aerial: false,
                        type: "playerBeastForm"
                    });*/
                }
            }
            if (this.facingRight) {
                _super.prototype.addForceAngleMagnitude.call(this, calculations.degreesToRadians(350), this.constantForce);
            }
            else {
                _super.prototype.addForceAngleMagnitude.call(this, calculations.degreesToRadians(190), this.constantForce);
            }
            if (this.constantForce > 0) {
                this.constantForce -= 1;
            }
            else {
                this.attacking = false;
            }
            if (this.actionWait > 0) {
                this.actionWait--;
            }
        };
        mio.prototype.updateCurrentSprite = function () {
            _super.prototype.removeAllSprites.call(this);
            if (this.currentSprite != null) {
                this.currentSpriteObj.set(_super.prototype.addSprite.call(this, new animConfig({
                    animationName: this.currentSprite,
                    scaleX: 3,
                    scaleY: 3,
                    speed: 0.3,
                    x: 64,
                    y: 77,
                    anchorX: 0.5,
                    anchorY: 0.34,
                })));
                if (this.currentSpriteObj != null) {
                    if (this.currentSprite == "catReady") {
                        this.currentSpriteObj.update(function (x) { return x.animationSpeed = 0.155; });
                    }
                    this.currentSpriteObj.update(function (x) { return x.pivot.set(0, 25); });
                }
            }
        };
        mio.objectName = "mio";
        return mio;
    }(objectBase));

    var collisionPolygon = /** @class */ (function (_super) {
        __extends(collisionPolygon, _super);
        function collisionPolygon(xp, yp, input) {
            var _this = _super.call(this, xp, yp, collisionPolygon.objectName) || this;
            _this.switch = false;
            _this.friction = 0.986;
            _this.previousTargets = [];
            _this.line = [0, 32, 16, 32, 48, 16, 64, 16];
            _super.prototype.setCollision.call(_this, 0, 0, 64, 64);
            return _this;
        }
        collisionPolygon.prototype.setPolygon = function (polygon) {
            var _this = this;
            this.line = polygon;
            _super.prototype.style.call(this, function (g) {
                var myGraph = new PIXI.Graphics();
                // Move it to the beginning of the line
                //myGraph.position.set(0, 12);
                var linesWithEnding = __spreadArrays(_this.line);
                linesWithEnding.push(64, 64, 0, 64);
                //console.log(linesWithEnding);
                myGraph.beginFill(0xff0000);
                myGraph.drawPolygon(linesWithEnding);
                myGraph.endFill();
                g.addChild(myGraph);
                return g;
            });
        };
        collisionPolygon.prototype.getYFromLine = function (xIndex) {
            for (var i = 0; i < this.line.length; i += 2) {
                var xFirst = this.line[i];
                var yFirst = this.line[i + 1];
                var xLast = this.line[i + 2];
                var yLast = this.line[i + 2 + 1];
                if (xIndex >= xFirst && xIndex <= xLast) {
                    if (yFirst == yLast) {
                        return yFirst;
                    }
                    else {
                        var steps = xLast - xFirst;
                        var stepSize = (yFirst - yLast) / steps;
                        return yFirst + (stepSize * (xFirst - xIndex));
                    }
                }
            }
            if (xIndex <= 0) {
                return this.line[1];
            }
            else if (xIndex >= this.line[this.line.length - 1 - 1]) {
                return this.line[this.line.length - 1];
            }
            return 0;
        };
        collisionPolygon.prototype.logic = function (l) {
            _super.prototype.logic.call(this, l);
            for (var _i = 0, _a = this.previousTargets; _i < _a.length; _i++) {
                var prevTarget = _a[_i];
                prevTarget._isColliding_Special = false;
            }
            var newTargets = l.isCollidingWithMultiple(this, this.collisionBox, [player.objectName, mio.objectName, dummySandbag.objectName]);
            for (var _b = 0, newTargets_1 = newTargets; _b < newTargets_1.length; _b++) {
                var target = newTargets_1[_b];
                /*for(var prevTarget of this.previousTargets){
                    if(target.ID == prevTarget.ID){
                        this.previousTargets.splice(this.previousTargets.indexOf(prevTarget), 1);
                    }
                }*/
                var index = (target.g.x + target.collisionBox.x + (target.collisionBox.width / 2)) - this.g.x;
                if (target.force.Dx < -1) ;
                var spaceFromTop = this.getYFromLine(index);
                if (Math.round(target.force.Dy) >= 0) {
                    if (target.g.y + target.collisionBox.y + target.collisionBox.height > this.g.y + (spaceFromTop / 2)) {
                        target.gravity.magnitude = 0;
                        target.force.Dy = 0;
                        target.force.Dx *= 0.916;
                        target.g.y = this.g.y - target.collisionBox.y - target.collisionBox.height + spaceFromTop; // - target.collisionBox.y - (target.collisionBox.height) + 6 + (6*(1-ratio));
                        target._isColliding_Special = true;
                    }
                    else {
                        target._isColliding_Special = false;
                    }
                }
                else if (Math.round(target.force.Dy) < 0) {
                    target._isColliding_Special = false;
                }
                /*if(target.force.Dy >= 0){
                    let index =  (target.g.x + target.collisionBox.x + (target.collisionBox.width/2)) - this.g.x;
        
                    let extraCheckTop = 0;
        
                    if(target.force.Dx < -1){
                        extraCheckTop = 16;
                    }
                    let spaceFromTop = this.getYFromLine(index);
                    if(target.g.y + target.collisionBox.y + target.collisionBox.height > this.g.y + (spaceFromTop/2)){
                        target.gravity.magnitude = 0;
                        target.force.Dy = 0;
                        target.force.Dx *= 0.916;
                        
                        target.g.y = this.g.y - target.collisionBox.y - target.collisionBox.height + spaceFromTop;// - target.collisionBox.y - (target.collisionBox.height) + 6 + (6*(1-ratio));
                        target._isColliding_Special = true;
                    }else{
                        //target._isColliding_Special = false;
                    }
                }else if(target.force.Dy <= 0){
                    //target._isColliding_Special = false;
                }*/
            }
            this.previousTargets = newTargets;
        };
        collisionPolygon.objectName = "collisionPolygon";
        return collisionPolygon;
    }(objectBase));

    var collisionSlopeLeft = /** @class */ (function (_super) {
        __extends(collisionSlopeLeft, _super);
        function collisionSlopeLeft(xp, yp, input) {
            var _this = _super.call(this, xp, yp, input) || this;
            _this.switch = false;
            _this.friction = 0.986;
            _this.setPolygon([0, 32, 16, 32, 48, 16, 64, 16]);
            return _this;
        }
        collisionSlopeLeft.objectName = "collisionSlopeLeft";
        return collisionSlopeLeft;
    }(collisionPolygon));

    var collisionSlopeRight = /** @class */ (function (_super) {
        __extends(collisionSlopeRight, _super);
        function collisionSlopeRight(xp, yp, input) {
            var _this = _super.call(this, xp, yp, input) || this;
            _this.switch = false;
            _this.friction = 0.986;
            _this.setPolygon([0, 16, 16, 16, 48, 32, 64, 32]);
            return _this;
        }
        collisionSlopeRight.objectName = "collisionSlopeRight";
        return collisionSlopeRight;
    }(collisionPolygon));

    var grass = /** @class */ (function (_super) {
        __extends(grass, _super);
        function grass(xp, yp, input) {
            var _this = _super.call(this, xp, yp, grass.objectName) || this;
            _this.switch = false;
            _this.friction = 0.986;
            _this.myShaderFrag = "\n    varying vec2 vTextureCoord;\n    uniform sampler2D uSampler;\n\n\n    float rand(vec2 co){\n        return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);\n    }\n\n\n    void main(void)\n    {\n\n        gl_FragColor = vec4(1.0, 0.3, 1.0, 1.0);\n\n        \n    }\n    ";
            //uniform mediump vec4 time;
            _this.customVertexShader = "\n    attribute vec2 aVertexPosition;\n    attribute vec2 aTextureCoord;\n    uniform mat3 projectionMatrix;\n    uniform float time;\n    uniform float collisionX;\n\n    varying vec2 vTextureCoord;\n    void main(void)\n    {\n        vec4 offset = vec4(0.0);\n        \n        vec4 tempPos = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n\n        if (aTextureCoord.y < 0.5) {\n            tempPos.x += 0.01 * sin(time);\n\n            tempPos.x -= (collisionX) * 0.10;\n        }\n        \n        gl_Position = tempPos;\n        \n        vTextureCoord = aTextureCoord;\n    }";
            _this.vertexUniform = {
                time: 0.0,
                collisionX: 0.0
            };
            _this.targetCollisionX = 0.0;
            _super.prototype.setCollision.call(_this, 0, 0, 32, 32);
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI.Graphics();
                /*newGraphics.beginFill(0x000000);
                newGraphics.drawRect(0, 0, 32, 32);
                newGraphics.endFill();*/
                //g.addChild(newGraphics);
                var grass = resourcesHand.getStaticTile("grass1");
                console.log("grass: ", grass);
                var simpleShader = new PIXI.Filter(_this.customVertexShader, undefined, _this.vertexUniform);
                grass.filters = [simpleShader];
                newGraphics.addChild(grass);
                //var uniforms = { uSampler2:PIXI.Texture.from('required/assets/SceneRotate.jpg') };
                g.addChild(newGraphics);
                return g;
            });
            return _this;
        }
        grass.prototype.logic = function (l) {
            _super.prototype.logic.call(this, l);
            var newTargets = l.isCollidingWithMultiple(this, this.collisionBox, [player.objectName]);
            if (newTargets.length > 0) {
                var xInCollision = (newTargets[0].g.x + newTargets[0].collisionBox.x + (newTargets[0].collisionBox.width / 2)) - (this.g.x);
                var collisionPosVec = xInCollision / this.collisionBox.width;
                if (collisionPosVec < 0) {
                    collisionPosVec = 0;
                }
                else if (collisionPosVec > 1) {
                    collisionPosVec = 1;
                }
                this.targetCollisionX = (collisionPosVec - 0.5) * 2;
                if (this.targetCollisionX > 0.0) {
                    this.targetCollisionX = (1 - this.targetCollisionX);
                    //this.targetCollisionX = Math.sin(1.0-this.targetCollisionX);
                }
                else if (this.targetCollisionX < 0.0) {
                    this.targetCollisionX = -(1 + this.targetCollisionX);
                    //this.targetCollisionX = Math.sin(-1.0+this.targetCollisionX);
                }
                console.log("this.targetCollisionX: ", this.targetCollisionX);
            }
            if (this.vertexUniform.collisionX < this.targetCollisionX - 0.05) {
                if (this.vertexUniform.collisionX < 0) {
                    this.vertexUniform.collisionX += (1 - Math.abs(this.vertexUniform.collisionX)) * 0.03;
                }
                else {
                    this.vertexUniform.collisionX += (1 - Math.abs(this.vertexUniform.collisionX)) * 0.2;
                }
            }
            else if (this.vertexUniform.collisionX > this.targetCollisionX + 0.05) {
                if (this.vertexUniform.collisionX > 0) {
                    this.vertexUniform.collisionX -= (1 - Math.abs(this.vertexUniform.collisionX)) * 0.03;
                }
                else {
                    this.vertexUniform.collisionX -= (1 - Math.abs(this.vertexUniform.collisionX)) * 0.2;
                }
            }
            this.vertexUniform.time += 0.01;
        };
        grass.objectName = "grass";
        return grass;
    }(objectBase));

    var textPrompt = /** @class */ (function (_super) {
        __extends(textPrompt, _super);
        function textPrompt(xp, yp, input) {
            var _this = _super.call(this, xp, yp, textPrompt.objectName) || this;
            _this.switch = false;
            _this.friction = 0.0;
            _this.text = "[SPACE]";
            _super.prototype.setCollision.call(_this, 0, 32, 64, 64);
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI.Graphics();
                newGraphics.beginFill(0x003eff);
                newGraphics.drawRect(0, 32, 64, 64);
                newGraphics.endFill();
                g.addChild(newGraphics);
                var text = new PIXI.Text('[SPACE]', { fontFamily: 'Arial', fontSize: 24, fill: 0xff1010, align: 'center' });
                g.addChild(text);
                g.calculateBounds();
                return g;
            });
            return _this;
        }
        textPrompt.prototype.logic = function (l) {
            l.getInteractionObject().openText(this.text);
        };
        textPrompt.objectName = "textPrompt";
        return textPrompt;
    }(objectBase));

    var scene_home = "N4IgxghgtgpgThAQgewK4DsAmBnAGiALgFoAOAJgAYAacaeJNLbATUKLIEYLrbYEUMOAOoBLTABcAFoQDsMyjUh8Gg7AAkYIgOaTxhMgDYArDwBGEMAGstcRpgDCyADbI4hEAGIYJb95A0nCABPeAARCHEIQgBtUFhIgHlTACsYMHFsAEl0ABlg+BjQcREnGEJ0VCcnGhFsRyhTEXQIkWR0BIAzABUSmGxCDognbBgazE6AZUjisB7S+sbm4rb3fxBagAUIOHFOhaaWlYJB4dGQcSCABzKCHibL1HEpuCatVZotGGQoDeQmjJiAF0aFBathXpkoBBPoRgABfGgAD0IHHkJBoQTYZCMBhozVg7mwliCiAs1lsghAcOBIE+3xg4hefWyeRCbgI0RpkjEmBg6AGQxGNBG4mK6C0-QIIGAAB0QNgwLYqhNrjBMLg5QQAAQcKhauUKpVOFUwNXMTU6uFrQJsgBydHc5isNjsawAXtlecjbgi4gyIElUuksrl8uzYudeuVKtV1nVvotDu1ur1JSchetxh0pi1Zr19ktWvypWtNttdh0C0mBacaBdroQ7ugHk9Ga93rSvj8-ugARyaaDsODxZDoTd4Uj9BwAJxkDFsDhkdEgfE3ECXG0FX2R0rRqo1eMNA7LZNzPo1jNiSbTER5+YJ49FjtlnZ7B+Fo7ps71m5NlvPdsSw+Ltfn+SVORBMEIShGECAnEBvQ4cgABZ5wIZDl1XdwxRJFwrAAZjIKkqCKKMCAqfc4yrE9OjPNNBTOK9sxvO8YGop8gLjLZX0rd9q2OBi6yuX8ambR4APFDs6W7MCgUgodoLHWEEQQwgDBIbg0KIGc5xXB0pRwxA8MsQjiNI3dyJjA92LaWjUwvRisxzGYzxs4sQFLbBuIrNyHKEhtblE-820kzjpNA3twIHKCRxg8cVO9Mh8JIVCQExdDMP0844FNABxPkqRpaSGSZENWQKDlQG9UgMLQoxZ2A75RAkaQCBIHTGpkyKYg4AwOHwqgOHq1ChunXFRo4AA6acxuGmaTGQ-CBqGmQDEmih8IMZDjGxAwyAwkaDAoGRppxeRkJkJaSGSw6KGQybkK4CgyFnTbCJIIxBqMchJqMMgZCG-DFyMIwOF1QGjEm8hQenGdpxMPbwaMfCTpnEg5GnCh0f65C5yG5Dp1+vqKD22GjBkchlpxKbXvw7aZGQxn8IoT7epZqGKf6zbMcuv6vpm9auDRpKNpkPmhr+ybmcpmQKBm2ctq+vrpqSumDAZpmWa+5LfvkTa+pkWcSaplHJrRjGsYBum8dByGyE4ZLqfw6dyEGi61tWuWLo2+rjGW7b8PW7Fjr6ob9vF5Dnt+9H9sjraQ7x53CZS7gDBdw3p0I-2o8WjbuGR56DCBwbNtRo65d6gnnfG5LCcWo7+ruinkuWlG1sZ1FsRxIxHpRkucSDh25ZMVECZL-DIaO7E3rpzOa4w36xsp9rLr6kv+qlww+qrrbM-RfqN8Igxt7nqv98IqakMNzm7tmxOl2m+H4ZRpb5HkdfA+S7hnvdyhNsGl6kN2qUHJkDDgGEXYAI0mbMaXAjrIzGuNYO01eozg1qHABUcwZFwJqtHB05MEUDNltCe316pDRIONVERCSApUZvIUGzN7aDXAYHEGfsu7GzXlwMak1ZaUIpnIDSxhxrHUDkuC6oMSCwwpiTQaJNIbuzkHtIuFAkL7w2vdWO6MUYXWnO-IWJBJp7WkfbAmd0MKs24FNEmcs5CEVAZ9MaZAg48Nhu1BWqFpwLwngDR611Rp0yoJjRR-V-rfUupHZ2wShpm0uuHSOmccRUHRvdJC-VLoT2uuTFJzt1rIR7tdZ6piGoeL4XTFeM0lxITnHIe65NZGzjJouVCq0bHM1lsfdqi5jpUDFmtW2+d2py0xrqBmRCAb53+sYZGxdV4wMWlI+GkdsR9NiTotO18XZDSoOpIxGMCbhMxkDGQuzlbqT+ujZGKF2pnKmhcpcYtkr7VucfNalA5a0MjtdCmuItpTU2gHTa9tj53V2cdB6S85Byy6WDKg5MjHgIwpwRmWNCKoWRidYZ-U-qr0NvC+2m9HqeJwZ9cx61aHGHoe9RWBMAV-Q6c7Xqcg5y4N+ttdSjNcbEwZlQDCRiu5g0pYjDafLaGTUFeo4+nBRX8olSDIVlCRUDTZT3LpXLDBcF5XKyVwqZUqvFbqpV+qxUCoVVK5VfLYZSwZWI2G6t346vNXqrgBqzWgwtSa1VHK6Hcq1ahOlNqRaXXtSyq19Lg1Moday7xD0CYE3IX4x2Vr7qM28U-VErCPqmvlR6l1srrUT0jaGx1H0zbk0zpo469cDUuNsQzdJuL1YYo2nwx6JNwFJKZgSxRDtukA26eiTFUMhZFrxQQ5G90AYvXpsixcuo-ouPRTpLapL4XcGMYtGOS9jqrRVRTaaRcQbvW2Wovlx9dZ6PcYbRaYq61HQbe1Jt2rKF3vWg+-xYdVravhm++tn7n0Btfci991bG3TJfbqED-7wPfqA1Bn6MGn0QaAwag1CGMN8opmKqD2GLronw1hgjq0iNYdxBdANeGSOEfdqRmjVHiOMbI3R6jeHXZ6KwwQi6pyOO8duRhXDPH8Xcc46JvjuGuPCbFlhslUmhNCck4psTwn+PXStQNEwc5QZaYUMjT6PcNNHXhYrb61B6qfSOgQvq6ITG7LHsYKz6ldnYbTtQPZuyUoeb+TNNZYzOB9MIn0xmfTkZ9PVn06TFNWkNUNrU7xfTX2G2oLjVmXTynJTkBTV6DVerqXS+jIR2W8ZpcyQVrLSUcslaupl0xztit5dKzVorg0qsZcKxV+r+zqvtbqy1hr3Xyu9b40YQE1IaDckwLyYsX5hQMjFBKdwsp5SKmcMaVU6oLS6n1Mto0JozSbatAEMM9oCRSnKnAHU7pPQwEQtueIAYUhpAyCyMMclOz0jbMyUMbI3sTam35eUc3XiSmlAaFbyp1sakIDqPUYPdvrfNNDjgh2QCbjgCdtcNgIBDiu1gG7+hqRwiAA";

    var roomIndex = {
        "scene_home": scene_home,
    };

    var roomChanger = /** @class */ (function (_super) {
        __extends(roomChanger, _super);
        function roomChanger(xp, yp, input) {
            var _this = _super.call(this, xp, yp, roomChanger.objectName) || this;
            _this.switch = false;
            _this.friction = 0.0;
            _this.inputTemplate = '{"to": "", "from": "", "facing": ""}';
            _this.targetRoom = "";
            _super.prototype.setCollision.call(_this, 0, 0, 32, 32);
            _this.targetRoom = input;
            _this.outputString = _this.targetRoom;
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI.Graphics();
                newGraphics.beginFill(0x003eff);
                newGraphics.drawRect(0, 0, 32, 32);
                newGraphics.endFill();
                g.addChild(newGraphics);
                g.calculateBounds();
                return g;
            });
            return _this;
        }
        roomChanger.prototype.logic = function (l) {
            var collisionTarget = l.isCollidingWith(this, this.collisionBox, [player.objectName]);
            if (collisionTarget != null) {
                var inputJson = JSON.parse(this.targetRoom);
                //console.log(inputJson);
                //console.log("Load room: ",roomIndex[inputJson.to]);
                l.loadRoom(roomIndex[inputJson.to], this.targetRoom);
            }
        };
        roomChanger.objectName = "roomChanger";
        return roomChanger;
    }(objectBase));

    var skyBackground = /** @class */ (function (_super) {
        __extends(skyBackground, _super);
        function skyBackground(xp, yp, input) {
            var _this = _super.call(this, xp, yp, skyBackground.objectName) || this;
            _this.skyFilter = "\n    precision lowp float;\n    varying vec2 vTextureCoord;\n\n    const vec2 star = vec2(0.5, 0.5);\n\n    uniform int timeOfDay;\n    uniform float starBrightness;\n\n    float randFromVec(vec2 co){\n        return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);\n    }\n\n    void main(void)\n    {\n\n        //Dawn 07:17  -  0\n        vec3 dawnColor1 = vec3(0.36784,0.33843,0.5545);\n        vec3 dawnColor2 = vec3(0.78117,0.592,0.5447);\n\n\n        //Sunrise 08:04  -  1\n        vec3 sunriseColor1 = vec3(0.4219,0.6047,0.8945);\n        vec3 sunriseColor2 = vec3(0.8649,0.86392,0.54235);\n\n        //Morning 10:00  -  2\n        vec3 morningColor1 = vec3(0.45019,0.6929,0.97804);\n        vec3 morningColor2 = vec3(0.6494,0.82745,0.98745);\n\n        //Afternoon 14:00  -  3\n        vec3 afternoonColor1 = vec3(0.3145,0.563529,0.8643);\n        vec3 afternoonColor2 = vec3(0.56588,0.770196,0.92941);\n\n        //Sunset 17:00  -  4\n        vec3 sunsetColor1 = vec3(0.5309,0.378,0.53098);\n        vec3 sunsetColor2 = vec3(0.92588,0.66549,0.238039);\n\n        //Dusk 17:54  -  5\n        vec3 duskColor1 = vec3(0.2549,0.29568,0.5545);\n        vec3 duskColor2 = vec3(0.8827,0.5494,0.2988);\n\n        //Night 19:00  -  6\n        vec3 nightColor1 = vec3(0.0023137,0.061568,0.138823);\n        vec3 nightColor2 = vec3(0.14667,0.28783,0.4847);\n\n\n        float nightSkyHeight = 0.5;\n        vec3 color = mix(dawnColor1,dawnColor2, vTextureCoord.y);\n\n        if(timeOfDay == 1){\n            color = mix(sunriseColor1,sunriseColor2, vTextureCoord.y);\n        }else if(timeOfDay == 2){\n            color = mix(morningColor1,morningColor2, vTextureCoord.y);\n        }else if(timeOfDay == 3){\n            color = mix(afternoonColor1,afternoonColor2, vTextureCoord.y);\n        }else if(timeOfDay == 4){\n            color = mix(sunsetColor1,sunsetColor2, vTextureCoord.y);\n        }else if(timeOfDay == 5){\n            color = mix(duskColor1,duskColor2, vTextureCoord.y);\n        }else if(timeOfDay == 6){\n            color = mix(nightColor1,nightColor2, vTextureCoord.y);\n        }\n\n        float randNum = randFromVec(vTextureCoord);\n\n        if(vTextureCoord.y < 0.5){\n            float closeToTopOfStarPart = (vTextureCoord.y/0.5) * 1.4;\n            if(randNum < 0.001 * starBrightness){\n                gl_FragColor = mix(vec4(1.0, 1.0, 1.0, 1.0), vec4(color,1.0), closeToTopOfStarPart);\n            }else{\n                gl_FragColor = vec4(color,1.0);\n            }\n        }else{\n            gl_FragColor = vec4(color,1.0);\n        }\n        \n        \n    }";
            _this.skyUniform = {
                'timeOfDay': 0,
                'starBrightness': 1
            };
            _this.timeOfDay = 2;
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI.Graphics();
                newGraphics.beginFill(0x000000, 1); // use an alpha value of 1 to make it visible
                newGraphics.drawRect(-1280, -360, 1280 * 2, 720);
                newGraphics.endFill();
                g.addChild(newGraphics);
                g.cacheAsBitmap = true;
                return g;
            });
            return _this;
        }
        skyBackground.prototype.init = function (roomEvents) {
            this.skyUniform.timeOfDay = this.timeOfDay;
            if (this.timeOfDay == 0) { //dawn
                this.skyUniform.starBrightness = 0.5;
            }
            else if (this.timeOfDay == 1) { //Sunrise
                this.skyUniform.starBrightness = 0.4;
            }
            else if (this.timeOfDay == 2) { //Morning
                this.skyUniform.starBrightness = 0.1;
            }
            else if (this.timeOfDay == 3) { //afternoon
                this.skyUniform.starBrightness = 0.1;
            }
            else if (this.timeOfDay == 4) { //Sunset
                this.skyUniform.starBrightness = 0.2;
            }
            else if (this.timeOfDay == 5) { //Dusk
                this.skyUniform.starBrightness = 0.4;
            }
            else if (this.timeOfDay == 6) { //night
                this.skyUniform.starBrightness = 1.0;
            }
            var filterSky = new PIXI.Filter(undefined, this.skyFilter, this.skyUniform);
            filterSky.autoFit = false;
            this.g.filters = [filterSky];
            this.g.cacheAsBitmap = true;
            roomEvents.getRenderer().render(this.g);
            this.g.filters = [];
            if (this.timeOfDay == 0) { //dawn
                //vec3(0.36784,0.33843,0.5545);
                //vec3(0.78117,0.592,0.5447);
                roomEvents.addStageFilter([new filterAdjustment.AdjustmentFilter({
                        red: 0.57,
                        green: 0.48,
                        blue: 0.545,
                        contrast: 1.0,
                        brightness: 1.0,
                    })]);
            }
            else if (this.timeOfDay == 1) { //Sunrise
                /*vec3 sunriseColor1 = vec3(0.4219,0.6047,0.8945);
                vec3 sunriseColor2 = vec3(0.8649,0.86392,0.54235);*/
                roomEvents.addStageFilter([new filterAdjustment.AdjustmentFilter({
                        red: 0.64,
                        green: 0.72,
                        blue: 0.714,
                        contrast: 1.0,
                        brightness: 1.0,
                    })]);
            }
            else if (this.timeOfDay == 2) { //Morning
                //vec3 morningColor1 = vec3(0.45019,0.6929,0.97804);
                //vec3 morningColor2 = vec3(0.6494,0.82745,0.98745);
                roomEvents.addStageFilter([new filterAdjustment.AdjustmentFilter({
                        red: 0.645,
                        green: 0.855,
                        blue: 0.995,
                        contrast: 1.0,
                        brightness: 1.0,
                    })]);
            }
            else if (this.timeOfDay == 3) { //afternoon
                //vec3 afternoonColor1 = vec3(0.3145,0.563529,0.8643);
                //vec3 afternoonColor2 = vec3(0.56588,0.770196,0.92941);
                roomEvents.addStageFilter([new filterAdjustment.AdjustmentFilter({
                        red: 0.535,
                        green: 0.765,
                        blue: 0.99,
                        contrast: 1.0,
                        brightness: 1.0,
                    })]);
            }
            else if (this.timeOfDay == 4) { //Sunset
                //vec3 sunsetColor1 = vec3(0.5309,0.378,0.53098);
                //vec3 sunsetColor2 = vec3(0.92588,0.66549,0.238039);
                roomEvents.addStageFilter([new filterAdjustment.AdjustmentFilter({
                        red: 0.725,
                        green: 0.515,
                        blue: 0.38,
                        contrast: 1.0,
                        brightness: 1.0,
                    })]);
            }
            else if (this.timeOfDay == 5) { //Dusk
                //vec3 duskColor1 = vec3(0.2549,0.29568,0.5545);
                //vec3 duskColor2 = vec3(0.8827,0.5494,0.2988);
                roomEvents.addStageFilter([new filterAdjustment.AdjustmentFilter({
                        red: 0.5688,
                        green: 0.415,
                        blue: 0.4244,
                        contrast: 1.0,
                        brightness: 1.0,
                    })]);
            }
            else if (this.timeOfDay == 6) {
                roomEvents.addStageFilter([new filterAdjustment.AdjustmentFilter({
                        red: 0.25,
                        green: 0.25,
                        blue: 1.25,
                        contrast: 1.2,
                        brightness: 1.2,
                    })]);
            }
        };
        skyBackground.prototype.logic = function (l) {
            _super.prototype.logic.call(this, l);
            var panPercentage = (l.getCameraX() - l.getCameraBounds()[0]) / l.getCameraBounds()[2];
            this.g.x = l.getCameraX() - (640 * panPercentage);
            this.g.y = l.getCameraY();
            //console.log("panPercentage: ",panPercentage);
        };
        skyBackground.objectName = "skyBackground";
        return skyBackground;
    }(objectBase));

    var treeGen = /** @class */ (function (_super) {
        __extends(treeGen, _super);
        function treeGen(xp, yp, input) {
            var _this = _super.call(this, xp, yp, treeGen.objectName) || this;
            _this.switch = false;
            _this.friction = 0.986;
            _this.myShaderFrag = "\n    varying vec2 vTextureCoord;\n    uniform sampler2D uSampler;\n    const float treeSeed = 0.0;\n\n    uniform float aspectRatio;\n\n\n    float distSquared(vec2 A, vec2 B){\n        vec2 C = (A - B) * vec2(aspectRatio, 1.0);\n        return dot( C, C );\n    }\n\n    float rand(vec2 co){\n        return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);\n    }\n\n    float det(vec2 a, vec2 b) { return a.x*b.y-b.x*a.y; }\n\n    vec2 closestPointInSegment( vec2 a, vec2 b )\n    {\n        vec2 ba = b - a;\n        return a + ba*clamp( -dot(a,ba)/dot(ba,ba), 0.0, 1.0 );\n    }\n\n    float getBezierT(vec2 b0, vec2 b1, vec2 b2) {\n            \n        float a=det(b0,b2), b=2.0*det(b1,b0), d=2.0*det(b2,b1); // \uD835\uDEFC,\uD835\uDEFD,\uD835\uDEFF(\uD835\uDC5D)\n        \n        //if( abs(2.0*a+b+d) < 1000.0 ) return closestPointInSegment(b0,b2);\n            \n        float f=b*d-a*a; // \uD835\uDC53(\uD835\uDC5D)\n        vec2 d21=b2-b1, d10=b1-b0, d20=b2-b0;\n        vec2 gf=2.0*(b*d21+d*d10+a*d20);\n        gf=vec2(gf.y,-gf.x); // \u2207\uD835\uDC53(\uD835\uDC5D)\n        vec2 pp=-f*gf/dot(gf,gf); // \uD835\uDC5D\u2032\n        vec2 d0p=b0-pp; // \uD835\uDC5D\u2032 to origin\n        float ap=det(d0p,d20), bp=2.0*det(d10,d0p); // \uD835\uDEFC,\uD835\uDEFD(\uD835\uDC5D\u2032)\n        // (note that 2*ap+bp+dp=2*a+b+d=4*area(b0,b1,b2))\n        float t=clamp((ap+bp)/(2.0*a+b+d), 0.0 ,1.0);\n\n        return t;\n    }\n\n\n    vec4 treeTrunk(float trunkLean, float trunkCenter){\n        vec4 trunkColor = vec4(0.06117, 0.227, 0.1949, 1.0);\n        \n        float trunkThickness = clamp(rand(vec2(treeSeed, treeSeed)), 0.1, 0.4);\n        \n\n        float leftTrunkFootWidth = clamp(rand(vec2(treeSeed+0.2, treeSeed+0.2)),0.1, 0.3);\n        float leftTrunkFootHeight = clamp(rand(vec2(treeSeed+0.25, treeSeed+0.25)),0.1, 0.2);\n\n        float rightTrunkFootWidth = clamp(rand(vec2(treeSeed+0.69, treeSeed+0.69)),0.1, 0.3);\n        float rightTrunkFootHeight = clamp(rand(vec2(treeSeed+0.5, treeSeed-0.5)),0.1, 0.2);\n\n        float height = rand(vec2(treeSeed+0.3, treeSeed+0.3));\n\n        trunkThickness = trunkThickness * (vTextureCoord.y);\n\n        float leanFix = trunkLean * (1.0 - vTextureCoord.y);\n\n        if(vTextureCoord.x > trunkCenter - trunkThickness + leanFix && vTextureCoord.x < trunkCenter + trunkThickness + leanFix\n            && vTextureCoord.y > 0.15){\n            return trunkColor;\n        }\n\n        float removeFooterEnd = 0.18;\n\n        //Left side trunk foot\n        float leftFootXStart = trunkCenter - trunkThickness - leftTrunkFootWidth;\n        float xInLeftFootPercentage = 0.0;\n        if(vTextureCoord.x > leftFootXStart+removeFooterEnd && vTextureCoord.x < leftFootXStart+leftTrunkFootWidth){\n            xInLeftFootPercentage = (vTextureCoord.x - leftFootXStart)/leftTrunkFootWidth;\n            xInLeftFootPercentage = pow(xInLeftFootPercentage, 6.0);\n            if(vTextureCoord.y > 1.0-(xInLeftFootPercentage*leftTrunkFootHeight)){\n                return trunkColor;\n            }\n        }\n\n        //right side trunk foot\n        float rightFootXStart = trunkCenter + trunkThickness;\n        if(vTextureCoord.x > rightFootXStart && vTextureCoord.x < rightFootXStart+rightTrunkFootWidth-removeFooterEnd){\n            float xInFootPercentage = 1.0-(vTextureCoord.x - rightFootXStart)/rightTrunkFootWidth;\n            xInFootPercentage = pow(xInFootPercentage, 6.0);\n            if(vTextureCoord.y > 1.0-(xInFootPercentage*rightTrunkFootHeight)){\n                return trunkColor;\n            }\n        }\n\n        //Fill space between feet right\n        if(vTextureCoord.x >= trunkCenter\n            && vTextureCoord.x <= rightFootXStart\n            && vTextureCoord.y > (1.0-rightTrunkFootHeight)){\n                return trunkColor;\n        }\n        //Fill space between feet left\n        if(vTextureCoord.x <= trunkCenter\n            && vTextureCoord.x >= leftFootXStart+leftTrunkFootWidth\n            && vTextureCoord.y > (1.0-leftTrunkFootHeight)){\n                return trunkColor;\n        }\n\n\n\n        //branches\n        float numberOfBranches = 3.0;\n        /*float bezierT = getBezierT(grassBladePoint-textureCoordAspect.xy, \n            grassForcePoint-textureCoordAspect.xy, \n            grassBladeEndPoint-textureCoordAspect.xy);*/\n\n\n        return vec4(0.0, 0.0, 0.0, 0.0);\n    }\n\n    vec4 leaf(vec2 position){\n\n        if(distSquared(vTextureCoord.xy, position) < 0.001){\n            float grassBladeRandomVal = rand(position);\n            if(grassBladeRandomVal < 0.2){\n                return vec4(0.12, 0.42, 0.01568627, 1.0);\n            }else if(grassBladeRandomVal < 0.4){\n                return vec4(0.4196, 0.6078, 0.1176, 1.0);\n            }else if(grassBladeRandomVal < 0.6){\n                return vec4(0.5529, 0.749, 0.2235, 1.0);\n            }else if(grassBladeRandomVal < 0.8){\n                return vec4(0.448, 0.5509, 0.2019, 1.0);\n            }else if(grassBladeRandomVal <= 1.0){\n                return vec4(0.425, 0.6509, 0.1019, 1.0);\n            }\n        }\n\n        return vec4(0.0, 0.0, 0.0, 0.0);\n    }\n\n\n    vec4 generateLeavesGroup(vec2 leavGroupOrigin, float groupSize){\n        float angleOfShadow = 0.785398163; //45 degrees\n        \n\n\n        if(distSquared(vTextureCoord, leavGroupOrigin) < groupSize*groupSize){\n            float randNumb = rand(vTextureCoord);\n\n\n            float darkSpotStartX = leavGroupOrigin.x + cos(angleOfShadow) * (groupSize*groupSize)*2.0;\n            float darkSpotStartY = leavGroupOrigin.y + sin(angleOfShadow) * (groupSize*groupSize)*2.0;\n\n            vec2 darkSpot = vec2(darkSpotStartX, darkSpotStartY);\n            float percentageToDarkSpotCenter = distSquared(vTextureCoord, darkSpot)/(groupSize*groupSize);\n            if(randNumb < 0.10*percentageToDarkSpotCenter){\n                return vec4(0.00039215686, 0.06039215686, 0.06392, 1.0);\n            }\n\n            \n            float percentageToCenter = distSquared(vTextureCoord, leavGroupOrigin)/(groupSize*groupSize);\n            if(randNumb < 0.07*percentageToCenter){\n                return vec4(0.996078, 0.996078, 0.965882, 1.0);\n            }else if(randNumb < 0.2*percentageToCenter){\n                return vec4(0.39, 0.49725, 0.452549, 1.0);\n            }else if(randNumb < 0.3*percentageToCenter){\n                return vec4(0.06117, 0.227, 0.19, 1.0);\n            }\n            return vec4(0.00039215686, 0.06039215686, 0.06392, 1.0);\n        }\n        \n\n        return vec4(0.0, 0.0, 0.0, 0.0);\n    }\n\n\n    \n\n\n    void main(void)\n    {\n\n        float trunkCenter = 0.5;\n        float trunkLean = (clamp(rand(vec2(treeSeed+2.1, treeSeed+1.53)), 0.0, 1.0) - 0.5)*0.25;\n        vec4 trunk = treeTrunk(trunkLean, trunkCenter);\n\n\n        if(trunk != vec4(0.0, 0.0, 0.0, 0.0)){\n            gl_FragColor = trunk;\n        }\n\n        float leavesGroupX = trunkLean * (1.0 - 0.13);\n        vec4 topLeaves = generateLeavesGroup(vec2(trunkCenter + leavesGroupX, 0.13), 0.2);\n        if(topLeaves != vec4(0.0, 0.0, 0.0, 0.0)){\n            gl_FragColor = topLeaves;\n        }\n\n\n    }\n    ";
            _this.treeUniforms = {
                aspectRatio: 1.0
            };
            //super.setCollision(0, 0, 256, 256);
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI.Graphics();
                newGraphics.beginFill(0x000000);
                newGraphics.drawRect(0, -512, 512, 512);
                newGraphics.endFill();
                g.addChild(newGraphics);
                return g;
            });
            return _this;
        }
        treeGen.prototype.init = function (roomEvents) {
            this.treeUniforms.aspectRatio = this.g.width / this.g.height;
            var myFilter = new PIXI.Filter(undefined, this.myShaderFrag, this.treeUniforms);
            this.g.filters = [myFilter];
            this.g.cacheAsBitmap = true;
            roomEvents.getRenderer().render(this.g);
            this.g.filters = [];
        };
        treeGen.prototype.logic = function (l) {
            _super.prototype.logic.call(this, l);
        };
        treeGen.objectName = "treeGen";
        return treeGen;
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
                function (xp, yp, input) { return new movingBlockHori(xp, yp, input); },
                function (xp, yp, input) { return new movingBlockVert(xp, yp, input); },
                function (xp, yp, input) { return new collisionSlopeLeft(xp, yp, input); },
                function (xp, yp, input) { return new collisionSlopeRight(xp, yp, input); },
                function (xp, yp, input) { return new block(xp, yp, input); },
                function (xp, yp, input) { return new block32x64(xp, yp, input); },
                function (xp, yp, input) { return new block64x32(xp, yp, input); },
                function (xp, yp, input) { return new tinyBlock32(xp, yp, input); },
                function (xp, yp, input) { return new wideBlock(xp, yp, input); },
                function (xp, yp, input) { return new dummySandbag(xp, yp, input); },
                function (xp, yp, input) { return new grass(xp, yp, input); },
                function (xp, yp, input) { return new ladder(xp, yp, input); },
                function (xp, yp, input) { return new textPrompt(xp, yp, input); },
                function (xp, yp, input) { return new roomChanger(xp, yp, input); },
                function (xp, yp, input) { return new skyBackground(xp, yp, input); },
                function (xp, yp, input) { return new treeGen(xp, yp, input); },
                function (xp, yp, input) { return new mio(xp, yp, input); },
                function (xp, yp, input) { return new player(xp, yp, input); },
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
                var appRenderObject = new PIXI.Application({
                    width: tempObj.g.width,
                    height: tempObj.g.height,
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
            if (this.selectedLayer != null) {
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
                if (this.cursor.objectSelected != null || this.cursor.currentSubTile != null) {
                    var nameOfMetaObject = (_a = this.cursor.objectSelected) === null || _a === void 0 ? void 0 : _a.objectName;
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
                var objTarget_1 = this.canvasRenderPart.layerHandler.getObjectsAtPos(this.mouseXPosition, this.mouseYPosition);
                if (objTarget_1.length != 0 && objTarget_1[0].type != objectTypes.geometry) {
                    this.canvasRenderPart.layerHandler.removeObject(objTarget_1[0]);
                }
            }
            else if (cursorData.cursorType == cursorType.geometryRemove && this.canvasRenderPart.layerHandler.selectedLayer != null) {
                var objTarget_2 = this.canvasRenderPart.layerHandler.getObjectsAtPos(this.mouseXPosition, this.mouseYPosition);
                if (objTarget_2.length != 0 && objTarget_2[0].type == objectTypes.geometry) {
                    this.canvasRenderPart.layerHandler.removeObject(objTarget_2[0]);
                }
            }
            else if (cursorData.cursorType == cursorType.editor && this.canvasRenderPart.layerHandler.selectedLayer != null) {
                var objTarget = this.canvasRenderPart.layerHandler.getObjectsAtPos(this.mouseXPosition, this.mouseYPosition);
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

}(PIXI, PIXI.filters));
