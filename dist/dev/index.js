(function (PIXI$1) {
    'use strict';

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

    var nullVector = /** @class */ (function () {
        function nullVector() {
            this.ax = -1;
            this.by = -1;
        }
        return nullVector;
    }());

    var vector = /** @class */ (function () {
        function vector(a, b) {
            this.ax = a;
            this.by = b;
        }
        vector.null = new nullVector;
        return vector;
    }());

    var boxCollider = /** @class */ (function () {
        function boxCollider(xPos, yPos, width, height) {
            this.x = xPos;
            this.y = yPos;
            this.width = width;
            this.height = height;
        }
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
        //Full
        internalFunction.intersecting = function (initiator, collisionTarget) {
            var x1 = initiator.g.x + initiator.collisionBox.x;
            var y1 = initiator.g.y + initiator.collisionBox.y;
            var x2 = collisionTarget.g.x + collisionTarget.collisionBox.x;
            var y2 = collisionTarget.g.y + collisionTarget.collisionBox.y;
            /*logger.showMessage(collisionTarget.objectName,"\n",x1 ," < ", x2 + collisionTarget.collisionBox.width ," && ",
                x1 + initiator.collisionBox.width ," > ", x2 ," && ",
                y1 ," < ", y2 + collisionTarget.collisionBox.height ," && ",
                y1 + initiator.collisionBox.height ," > ", y2,"    n",
                x1 < x2 + collisionTarget.collisionBox.width &&
                x1 + initiator.collisionBox.width > x2 &&
                y1 < y2 + collisionTarget.collisionBox.height &&
                y1 + initiator.collisionBox.height > y2);*/
            return (x1 < x2 + collisionTarget.collisionBox.width &&
                x1 - 0.5 + initiator.collisionBox.width > x2 &&
                y1 + 0.5 < y2 + collisionTarget.collisionBox.height &&
                y1 + initiator.collisionBox.height > y2);
        };
        internalFunction.intersectingLeft = function (initiator, collisionTarget) {
            var x1 = initiator.g.x + initiator.collisionBox.x;
            var y1 = initiator.g.y + initiator.collisionBox.y;
            var x2 = collisionTarget.g.x + collisionTarget.collisionBox.x;
            var y2 = collisionTarget.g.y + collisionTarget.collisionBox.y;
            return (x1 < x2 + collisionTarget.collisionBox.width &&
                x1 + 1 > x2 &&
                y1 < y2 + collisionTarget.collisionBox.height &&
                y1 + initiator.collisionBox.height > y2);
        };
        internalFunction.intersectingRight = function (initiator, collisionTarget) {
            var x1 = initiator.g.x + initiator.collisionBox.x + initiator.collisionBox.width - 1;
            var y1 = initiator.g.y + initiator.collisionBox.y;
            var x2 = collisionTarget.g.x + collisionTarget.collisionBox.x;
            var y2 = collisionTarget.g.y + collisionTarget.collisionBox.y;
            return (x1 < x2 + collisionTarget.collisionBox.width &&
                x1 + 1 > x2 &&
                y1 < y2 + collisionTarget.collisionBox.height &&
                y1 + initiator.collisionBox.height > y2);
        };
        internalFunction.intersectingTop = function (initiator, collisionTarget) {
            var x1 = initiator.g.x + initiator.collisionBox.x;
            var y1 = initiator.g.y + initiator.collisionBox.y;
            var x2 = collisionTarget.g.x + collisionTarget.collisionBox.x;
            var y2 = collisionTarget.g.y + collisionTarget.collisionBox.y;
            return (x1 < x2 + collisionTarget.collisionBox.width &&
                x1 + initiator.collisionBox.width > x2 &&
                y1 < y2 + collisionTarget.collisionBox.height &&
                y1 + 1 > y2);
        };
        internalFunction.intersectingBottom = function (initiator, collisionTarget) {
            var x1 = initiator.g.x + initiator.collisionBox.x;
            var y1 = initiator.g.y + initiator.collisionBox.y + initiator.collisionBox.height - 1;
            var x2 = collisionTarget.g.x + collisionTarget.collisionBox.x;
            var y2 = collisionTarget.g.y + collisionTarget.collisionBox.y;
            return (x1 < x2 + collisionTarget.collisionBox.width &&
                x1 + initiator.collisionBox.width > x2 &&
                y1 < y2 + collisionTarget.collisionBox.height &&
                y1 + 1 > y2);
        };
        return internalFunction;
    }());

    var movementOperations = /** @class */ (function () {
        function movementOperations() {
        }
        movementOperations.moveByForce = function (target, force, collisionNames, objContainer) {
            var xdiff = force.ax;
            var ydiff = force.by;
            this.moveForceHorizontal(~~xdiff, 1, target, collisionNames, objContainer);
            this.moveForceHorizontal(xdiff - ~~xdiff, 0.01, target, collisionNames, objContainer);
            //this.moveOutFromCollider(xdiff % 1, 0.01, target, collisionNames, objContainer);
            this.moveForceVertical(~~ydiff, 1, target, collisionNames, objContainer);
            this.moveForceVertical(ydiff - ~~ydiff, 0.01, target, collisionNames, objContainer);
            //this.moveForceVertical(ydiff - ~~ydiff, 0.001, target, collisionNames, objContainer);
            force.ax *= target.airFriction;
            force.by *= target.airFriction;
            if (target.gravity != vector.null) {
                force.ax += target.gravity.ax;
                force.by += target.gravity.by;
                //target.gravity!.ax += //target.gravity!.ax+(1-Math.cos(target.gravity!.ax))*target.weight;
                target.gravity.by += target.weight; //target.gravity!.by+(1-Math.sin(target.gravity!.by))*target.weight;
            }
        };
        movementOperations.moveForceHorizontal = function (magnitude, iteretorSize, target, collisionNames, objContainer) {
            var sign = magnitude ? magnitude < 0 ? -1 : 1 : 0;
            for (var i = 0; i < Math.abs(magnitude); i += iteretorSize) {
                target.g.x += iteretorSize * sign;
                var collisionTarget = this.boxIntersectionSpecific(target, target.collisionBox, collisionNames, objContainer);
                if (collisionTarget != objectBase.null) {
                    sign *= -1;
                    target.g.x += 1 * iteretorSize * sign;
                    target.force.ax = 0;
                    target.gravity.ax = 0;
                    target.force.by *= collisionTarget.friction;
                    break;
                }
            }
        };
        movementOperations.moveForceVertical = function (magnitude, iteretorSize, target, collisionNames, objContainer) {
            var sign = magnitude ? magnitude < 0 ? -1 : 1 : 0;
            for (var i = 0; i < Math.abs(magnitude); i += iteretorSize) {
                target.g.y += iteretorSize * sign;
                var collisionTarget = this.boxIntersectionSpecific(target, target.collisionBox, collisionNames, objContainer);
                if (collisionTarget != objectBase.null) {
                    sign *= -1;
                    target.g.y += 1 * iteretorSize * sign;
                    target.force.by = 0;
                    target.gravity.by = 0;
                    target.force.ax *= collisionTarget.friction;
                    break;
                }
            }
        };
        movementOperations.moveOutFromCollider = function (magnitude, iteretorSize, target, collisionNames, objContainer) {
            var collisionWith = this.boxIntersectionSpecific(target, target.collisionBox, collisionNames, objContainer);
            if (collisionWith != objectBase.null) {
                var direction = Math.cos(collisionWith.force.ax) < 0 ? -1 : 1;
                while (this.boxIntersectionSpecific(target, target.collisionBox, collisionNames, objContainer) != objectBase.null) {
                    target.g.x += 1 * direction;
                }
                target.g.x += 2 * direction;
            }
        };
        movementOperations.boxIntersectionSpecific = function (initiator, boxData, targetObjects, objContainer) {
            return this.boxIntersectionSpecificClass(initiator, boxData, targetObjects, objContainer);
        };
        //Collision
        movementOperations.boxIntersectionSpecificClass = (new /** @class */ (function () {
            function class_1() {
                this.inc = function (initiator, boxData, targetObjects, objContainer) {
                    return objContainer.foreachObjectType(targetObjects, function (obj) {
                        if (internalFunction.intersecting(initiator, obj)) {
                            return true;
                        }
                        return false;
                    });
                };
            }
            return class_1;
        }())).inc;
        return movementOperations;
    }());

    var nulliObject = /** @class */ (function () {
        function nulliObject(xp, yp) {
            this.friction = 0;
            this.airFriction = 0;
            this.gravity = new vector(0, 0);
            this.weight = 0;
            this.ID = "";
            this.g = new PIXI.Graphics();
            this._collisionBox = new boxCollider(0, 0, 0, 0);
            this.spriteSheet = null;
            this._objectName = "nulliObject";
            this.collisionTargets = [];
            this.force = new vector(0, 0);
            this.objectName = "";
            this.collisionBox = new boxCollider(0, 0, 0, 0);
            this.x = 0;
            this.y = 0;
        }
        nulliObject.prototype.setNewForceAngleMagnitude = function (a, b) {
            throw new Error("Method not implemented.");
        };
        nulliObject.prototype.addCollisionTarget = function () {
            var collNames = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                collNames[_i] = arguments[_i];
            }
            throw new Error("Method not implemented.");
        };
        nulliObject.prototype.removeCollisionTarget = function () {
            var collNames = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                collNames[_i] = arguments[_i];
            }
            throw new Error("Method not implemented.");
        };
        nulliObject.prototype.removeAllCollisionTargets = function () {
            throw new Error("Method not implemented.");
        };
        nulliObject.prototype.style = function (newGraphics) {
            throw new Error("Method not implemented.");
        };
        nulliObject.prototype.setCollision = function (xs, ys, width, height) {
            throw new Error("Method not implemented.");
        };
        nulliObject.prototype.updatePosition = function (x, y) {
            throw new Error("Method not implemented.");
        };
        nulliObject.prototype.setNewForce = function (angle, magnitude) {
            throw new Error("Method not implemented.");
        };
        nulliObject.prototype.logic = function (l) {
        };
        nulliObject.objectName = "nulliObject";
        return nulliObject;
    }());

    var objectBase = /** @class */ (function () {
        function objectBase(x, y, childObjectName) {
            this.ID = uidGen.new();
            this._g = new PIXI.Graphics();
            this.friction = 0.5;
            this.airFriction = 0.8;
            this.gravity = vector.null;
            this.weight = 0.4;
            this._collisionBox = new boxCollider(0, 0, 0, 0);
            this._spriteSheet = null;
            this._objectName = "iObject";
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
        Object.defineProperty(objectBase.prototype, "spriteSheet", {
            get: function () {
                return this._spriteSheet;
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
        objectBase.prototype.addCollisionTarget = function () {
            var collNames = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                collNames[_i] = arguments[_i];
            }
            for (var i = 0; i < collNames.length; i++) {
                if (this.collisionTargets.indexOf(collNames[i]) == -1) {
                    this.collisionTargets.push(collNames[i]);
                }
            }
        };
        objectBase.prototype.removeCollisionTarget = function () {
            var collNames = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                collNames[_i] = arguments[_i];
            }
            this._collisionTargets = this.collisionTargets.filter(function (x) { });
        };
        objectBase.prototype.removeAllCollisionTargets = function () {
            this.collisionTargets.length = 0;
        };
        objectBase.prototype.style = function (newGraphics) {
            var tempG = newGraphics(new PIXI.Graphics());
            var oldX = this.g.x;
            var oldY = this.g.y;
            this._g = tempG;
            this._g.x = oldX;
            this._g.y = oldY;
        };
        objectBase.prototype.logic = function (l) {
            movementOperations.moveByForce(this, this.force, this.collisionTargets, l.objContainer);
        };
        objectBase.prototype.setCollision = function (xs, ys, width, height) {
            this.collisionBox.x = xs;
            this.collisionBox.y = ys;
            this.collisionBox.width = width;
            this.collisionBox.height = height;
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
        objectBase.prototype.setNewForceAngleMagnitude = function (angle, magnitude) {
            this._force.ax = Math.cos(angle) * magnitude;
            this._force.by = Math.sin(angle) * magnitude;
            //this._force.angle = angle;
            //this._force.magnitude = magnitude;
        };
        objectBase.prototype.addForceAngleMagnitude = function (angle, magnitude) {
            this._force.ax += Math.cos(angle) * magnitude;
            this._force.by += Math.sin(angle) * magnitude;
        };
        objectBase.null = new nulliObject(0, 0);
        return objectBase;
    }());

    var block = /** @class */ (function (_super) {
        __extends(block, _super);
        function block(xp, yp) {
            var _this = _super.call(this, xp, yp, block.objectName) || this;
            _this.switch = false;
            _this.friction = 0.873;
            _super.prototype.setCollision.call(_this, 0, 0, 16, 16);
            _super.prototype.style.call(_this, function (g) {
                g.beginFill(0x000000);
                g.drawRect(0, 0, 16, 16);
                g.endFill();
                return g;
            });
            return _this;
            /*setInterval(()=>{
                this.switch = !this.switch;
            }, 700);*/
        }
        block.prototype.logic = function (l) {
            _super.prototype.logic.call(this, l);
            /*if(this.switch){
                super.setNewForce(l.degreesToRadians(0), 3);
            }else{
                super.setNewForce(l.degreesToRadians(180), 3);
            }*/
        };
        block.objectName = "block";
        return block;
    }(objectBase));

    var calculations = /** @class */ (function () {
        function calculations() {
        }
        calculations.degreesToRadians = function (degrees) {
            return -degrees * (calculations.PI / 180);
        };
        calculations.roundToNDecimals = function (value, nDecimal) {
            return Math.round((value) * Math.pow(10, nDecimal)) / Math.pow(10, nDecimal);
        };
        calculations.PI = 3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679;
        calculations.EPSILON = 8.8541878128;
        return calculations;
    }());

    var movingBlockHori = /** @class */ (function (_super) {
        __extends(movingBlockHori, _super);
        function movingBlockHori(xp, yp) {
            var _this = _super.call(this, xp, yp, movingBlockHori.objectName) || this;
            _this.switch = false;
            _this.friction = 0.873;
            _super.prototype.setCollision.call(_this, 0, 0, 16, 16);
            _super.prototype.style.call(_this, function (g) {
                g.beginFill(0x000000);
                g.drawRect(0, 0, 16, 16);
                g.endFill();
                return g;
            });
            setInterval(function () {
                _this.switch = !_this.switch;
            }, 700);
            return _this;
        }
        movingBlockHori.prototype.logic = function (l) {
            _super.prototype.logic.call(this, l);
            if (this.switch) {
                _super.prototype.setNewForceAngleMagnitude.call(this, calculations.degreesToRadians(0), 3);
            }
            else {
                _super.prototype.setNewForceAngleMagnitude.call(this, calculations.degreesToRadians(180), 3);
            }
        };
        movingBlockHori.objectName = "movingBlockHori";
        return movingBlockHori;
    }(objectBase));

    var movingBlockVert = /** @class */ (function (_super) {
        __extends(movingBlockVert, _super);
        function movingBlockVert(xp, yp) {
            var _this = _super.call(this, xp, yp, movingBlockVert.objectName) || this;
            _this.switch = false;
            _this.friction = 0.873;
            _super.prototype.setCollision.call(_this, 0, 0, 16, 16);
            _super.prototype.style.call(_this, function (g) {
                g.beginFill(0x000000);
                g.drawRect(0, 0, 16, 16);
                g.endFill();
                return g;
            });
            setInterval(function () {
                _this.switch = !_this.switch;
            }, 700);
            return _this;
        }
        movingBlockVert.prototype.logic = function (l) {
            _super.prototype.logic.call(this, l);
            if (this.switch) {
                _super.prototype.setNewForceAngleMagnitude.call(this, calculations.degreesToRadians(90), 3);
            }
            else {
                _super.prototype.setNewForceAngleMagnitude.call(this, calculations.degreesToRadians(270), 3);
            }
        };
        movingBlockVert.objectName = "movingBlockHori";
        return movingBlockVert;
    }(objectBase));

    var mio = /** @class */ (function (_super) {
        __extends(mio, _super);
        function mio(xp, yp) {
            var _this = _super.call(this, xp, yp, mio.objectName) || this;
            _this.airFriction = 0.8;
            _this.gravity = new vector(0, 1); //vector.fromAngleAndMagnitude(calculations.degreesToRadians(270), 0.6);
            _this.weight = 0.046;
            _super.prototype.setCollision.call(_this, 0, 0, 16, 16);
            _super.prototype.style.call(_this, function (g) {
                g.beginFill(0xFF3e50);
                g.drawRect(0, 0, 16, 16);
                g.endFill();
                return g;
            });
            _super.prototype.addCollisionTarget.call(_this, block.objectName);
            return _this;
            //this.spriteSheet = new resourceMeta("player.jpg", 16, 16);
        }
        mio.prototype.logic = function (l) {
            _super.prototype.logic.call(this, l);
            //logger.showMessage(JSON.stringify(this.gravity));
            /*let angleToMouse = l.b.angleBetweenPoints(this.y - l.mouseY()+8, this.x - l.mouseX()+8);
            
            let distanceToMouse = l.b.distanceBetweenPoints(this.x, this.y, l.mouseX()+8, l.mouseY()+8);
            let speed = distanceToMouse*0.08;
            if(speed > 23){
                speed = 23;
            }*/
            /*if(speed<1 && distanceToMouse > 1){
                speed = 1;
            }*/
            //this.updatePosition();
            //this.position = new vector(angleToMouse, speed);
            //l.moveByForce(this, this.movement, block.objectName);
            //super.setNewForceAngleMagnitude(angleToMouse, speed);
            if (l.checkKeyHeld("a")) {
                _super.prototype.addForceAngleMagnitude.call(this, calculations.degreesToRadians(180), 1);
            }
            if (l.checkKeyHeld("d")) {
                _super.prototype.addForceAngleMagnitude.call(this, calculations.degreesToRadians(0), 1);
            }
            if (l.checkKeyPressed("w")) {
                _super.prototype.addForceAngleMagnitude.call(this, calculations.degreesToRadians(90), 15);
            }
        };
        mio.objectName = "mio";
        return mio;
    }(objectBase));

    var objectGenerator = /** @class */ (function () {
        function objectGenerator() {
            this.availibleObjects = [
                function (xp, yp) { return new mio(xp, yp); },
                function (xp, yp) { return new block(xp, yp); },
                function (xp, yp) { return new movingBlockHori(xp, yp); },
                function (xp, yp) { return new movingBlockVert(xp, yp); }
                //new mio(0, 0),
                //new block(0, 0)
            ];
        }
        objectGenerator.prototype.getAvailibleObjects = function () {
            return this.availibleObjects;
        };
        objectGenerator.prototype.generateObject = function (objectName, x, y) {
            for (var i = 0; i < this.availibleObjects.length; i++) {
                var avObj = this.availibleObjects[i];
                var temp = avObj(x, y);
                var className = tools.getClassNameFromConstructorName(temp.constructor.toString());
                if (className == objectName) {
                    return temp;
                }
            }
            console.log("Can't generate object for: " + objectName);
            throw new Error("Can't generate object for: " + objectName);
        };
        return objectGenerator;
    }());

    var fileSystemHandler = /** @class */ (function () {
        function fileSystemHandler(canvasHandler) {
            var _this = this;
            this.generateObjects = new objectGenerator();
            this.app = new PIXI$1.Application();
            this.parameters = {
                itemName: "File",
                disableInteraction: false,
                onlyUniqueNames: true,
                createItemButtonOn: true,
                canResize: false
            };
            this.preLoadedImage = false;
            this.canvasHandler = canvasHandler;
            this.system = new prettyFiles.init().getInit("fileSystem", this.parameters);
            document.addEventListener("keydown", this.keyDownListener.bind(this));
            this.system.onCreateNewFile = this.onCreateNewFile.bind(this);
            this.system.onClickFile = this.onClickFile.bind(this);
            document.body.appendChild(this.app.view);
            this.generateObjects.getAvailibleObjects().forEach(function (obj) {
                _this.app.stage.removeChildren();
                var tempObj = obj(0, 0);
                console.log(tempObj);
                _this.app.view.width = tempObj.g.width;
                _this.app.view.height = tempObj.g.height;
                _this.app.stage.addChild(tempObj.g);
                _this.app.render();
                _this.preLoadedImage = true;
                _this.system.sticker = _this.app.view.toDataURL();
                var functionAsString = tempObj.constructor.toString();
                var tempNewImage = new Image();
                tempNewImage.src = _this.system.sticker;
                var funcNameOnly = tools.getClassNameFromConstructorName(functionAsString);
                canvasHandler.classAndImage[funcNameOnly] = tempNewImage;
                _this.system.createFile(funcNameOnly, function () {
                }, funcNameOnly);
            });
        }
        fileSystemHandler.prototype.getFileSystemElement = function () {
            return document.getElementById("fileSystem");
        };
        fileSystemHandler.prototype.onClickFile = function (fileClicked, id, image, customData) {
            this.canvasHandler.setMouseItem(image, customData);
        };
        fileSystemHandler.prototype.keyDownListener = function (e) {
            if (e.key == "e")
                console.log(this.system.getStructure(true));
        };
        fileSystemHandler.prototype.onCreateNewFile = function (name, id, proceed) {
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
        return fileSystemHandler;
    }());

    var objectMetaData = /** @class */ (function () {
        function objectMetaData(x, y, objectClassName) {
            this.x = x;
            this.y = y;
            this.objectClassName = objectClassName;
        }
        return objectMetaData;
    }());

    var handleCanvas = /** @class */ (function () {
        function handleCanvas(canvasName) {
            var _a;
            this.mouseXPosition = 0;
            this.mouseYPosition = 0;
            this.itemToPlaceImageUrl = new Image();
            this.itemToPlaceName = null;
            this.mouseImageReady = false;
            this.noGridMouse = false;
            this.roomObjects = new Array();
            this.fileSystem = null;
            this.mouseDown = false;
            this.classAndImage = {};
            this.gridX = 16;
            this.gridY = 16;
            this.canvas = document.getElementById(canvasName);
            this.ctx = this.canvas.getContext("2d");
            this.buttonSetSize = document.getElementById("setSizeButton");
            this.inputGridx = document.getElementById("gridXInput");
            this.inputGridx.value = this.gridX + "";
            this.inputGridy = document.getElementById("gridYInput");
            this.inputGridy.value = this.gridY + "";
            this.buttonSetSize.onclick = this.setCanvasWidth.bind(this);
            document.addEventListener("mousemove", this.mouseListenerMove.bind(this));
            document.addEventListener("mousedown", this.mouseListenerDown.bind(this));
            document.addEventListener("mouseup", this.mouseListenerUp.bind(this));
            document.addEventListener("keydown", this.keysDown.bind(this));
            document.addEventListener("keyup", this.keysUp.bind(this));
            window.onresize = this.windowResize.bind(this);
            this.container = document.getElementById("canvasAndFilesCon");
            (_a = document.getElementById("pointer")) === null || _a === void 0 ? void 0 : _a.addEventListener("mouseup", this.clickPointer.bind(this));
        }
        handleCanvas.prototype.clickPointer = function () {
            this.mouseImageReady = false;
        };
        handleCanvas.prototype.setFileSystemElement = function (fs) {
            this.fileSystem = fs;
            this.windowResize();
        };
        handleCanvas.prototype.windowResize = function () {
            if (this.container != null && this.fileSystem != null) {
                this.canvas.width = this.container.clientWidth - this.fileSystem.clientWidth - 12;
                this.canvas.height = this.container.clientHeight - 9;
                this.canvas.style.width = this.canvas.width + "px";
                this.canvas.style.height = this.canvas.height + "px";
            }
            else {
                this.canvas.width = this.canvas.clientWidth;
                this.canvas.height = this.canvas.clientHeight;
            }
        };
        handleCanvas.prototype.keysDown = function (e) {
            if (e.ctrlKey || e.metaKey) {
                this.noGridMouse = true;
            }
        };
        handleCanvas.prototype.keysUp = function (e) {
            if (e.ctrlKey || e.metaKey || e.key == "Meta") {
                this.noGridMouse = false;
            }
        };
        handleCanvas.prototype.setMouseItem = function (imgUrl, objConstructorName) {
            var _this = this;
            this.itemToPlaceName = objConstructorName;
            this.itemToPlaceImageUrl = new Image();
            this.mouseImageReady = false;
            this.itemToPlaceImageUrl.src = imgUrl;
            this.itemToPlaceImageUrl.onload = function () {
                _this.mouseImageReady = true;
            };
        };
        handleCanvas.prototype.setCanvasWidth = function () {
            this.gridX = parseInt(this.inputGridx.value);
            this.gridY = parseInt(this.inputGridy.value);
        };
        handleCanvas.prototype.mouseListenerDown = function (e) {
            var targetElement = e.target;
            if (targetElement.tagName != "CANVAS") {
                return;
            }
            if (this.mouseImageReady == false) {
                return;
            }
            var img = new Image();
            img.src = this.itemToPlaceImageUrl.src;
            var mouseGridX = Math.floor(this.mouseXPosition / this.gridX) * this.gridX;
            var mouseGridY = Math.floor(this.mouseYPosition / this.gridY) * this.gridY;
            if (this.noGridMouse) {
                this.roomObjects.push(new objectMetaData(this.mouseXPosition, this.mouseYPosition, this.itemToPlaceName));
            }
            else {
                //check if there already is an item at the position
                var alreadyExists_1 = false;
                this.roomObjects.forEach(function (obj) {
                    if (obj.x == mouseGridX && obj.y == mouseGridY) {
                        alreadyExists_1 = true;
                    }
                });
                if (alreadyExists_1 == false) {
                    this.roomObjects.push(new objectMetaData(mouseGridX, mouseGridY, this.itemToPlaceName));
                }
            }
            this.mouseDown = true;
        };
        handleCanvas.prototype.importRoom = function (jsonString) {
            var _this = this;
            var arayOfData = new Array();
            arayOfData = JSON.parse(jsonString);
            this.roomObjects.length = 0;
            arayOfData.forEach(function (objInfo) {
                var newObj = new objectMetaData(objInfo.x, objInfo.y, objInfo.objectClassName);
                _this.roomObjects.push(newObj);
            });
        };
        handleCanvas.prototype.exportRoom = function () {
            console.log("export this: ", this.roomObjects);
            return LZString.compressToEncodedURIComponent(JSON.stringify(this.roomObjects));
        };
        handleCanvas.prototype.mouseListenerUp = function (e) {
            this.mouseDown = false;
        };
        handleCanvas.prototype.mouseListenerMove = function (e) {
            var x = e.clientX; //x position within the element.
            var y = e.clientY; //y position within the element.
            /*if(e.target instanceof Element){
                var rect = e.target.getBoundingClientRect();
                x -= rect.left;
                y -= rect.top;
            }*/
            var rect = this.canvas.getBoundingClientRect();
            x -= rect.left;
            y -= rect.top;
            this.mouseXPosition = x;
            this.mouseYPosition = y;
            if (this.mouseDown) {
                this.mouseListenerDown(e);
            }
        };
        handleCanvas.prototype.update = function () {
        };
        handleCanvas.prototype.render = function () {
            this.drawGrid();
            this.drawObjects();
            this.drawMouse();
        };
        handleCanvas.prototype.drawObjects = function () {
            var _this = this;
            this.roomObjects.forEach(function (obj) {
                var _a;
                if (_this.classAndImage[obj.objectClassName].complete) {
                    try {
                        (_a = _this.ctx) === null || _a === void 0 ? void 0 : _a.drawImage(_this.classAndImage[obj.objectClassName], obj.x, obj.y);
                    }
                    catch (exception) {
                        //console.log("Fel: ", obj.image, obj);
                    }
                }
            });
        };
        handleCanvas.prototype.drawMouse = function () {
            var _a, _b, _c, _d;
            var mouseGridX = Math.floor(this.mouseXPosition / this.gridX) * this.gridX;
            var mouseGridY = Math.floor(this.mouseYPosition / this.gridY) * this.gridY;
            this.ctx.strokeStyle = 'red';
            this.ctx.lineWidth = 1;
            (_a = this.ctx) === null || _a === void 0 ? void 0 : _a.rect(mouseGridX, mouseGridY, this.gridX, this.gridY);
            (_b = this.ctx) === null || _b === void 0 ? void 0 : _b.stroke();
            if (this.mouseImageReady) {
                if (this.noGridMouse) {
                    (_c = this.ctx) === null || _c === void 0 ? void 0 : _c.drawImage(this.itemToPlaceImageUrl, this.mouseXPosition, this.mouseYPosition);
                }
                else {
                    (_d = this.ctx) === null || _d === void 0 ? void 0 : _d.drawImage(this.itemToPlaceImageUrl, mouseGridX, mouseGridY);
                }
            }
        };
        handleCanvas.prototype.drawGrid = function () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            (_a = this.ctx) === null || _a === void 0 ? void 0 : _a.clearRect(0, 0, this.canvas.width, this.canvas.height);
            var horizontalLines = Math.round(this.canvas.height / this.gridY);
            var verticallines = Math.round(this.canvas.width / this.gridX);
            var mostDrawCalls = (horizontalLines > verticallines) ? horizontalLines : verticallines;
            this.ctx.strokeStyle = 'black';
            this.ctx.lineWidth = 0.5;
            for (var i = 0; i < mostDrawCalls; i++) {
                //horizontal
                if (horizontalLines > 0) {
                    horizontalLines--;
                    (_b = this.ctx) === null || _b === void 0 ? void 0 : _b.beginPath();
                    (_c = this.ctx) === null || _c === void 0 ? void 0 : _c.moveTo(0.5, (i + 1) * this.gridY + 0.5);
                    (_d = this.ctx) === null || _d === void 0 ? void 0 : _d.lineTo(this.canvas.width + 0.5, (i + 1) * this.gridY + 0.5);
                    (_e = this.ctx) === null || _e === void 0 ? void 0 : _e.stroke();
                }
                //vertical
                if (verticallines > 0) {
                    verticallines--;
                    (_f = this.ctx) === null || _f === void 0 ? void 0 : _f.beginPath();
                    (_g = this.ctx) === null || _g === void 0 ? void 0 : _g.moveTo((i + 1) * this.gridX + 0.5, this.canvas.height + (i + 1) * this.gridX + 0.5);
                    (_h = this.ctx) === null || _h === void 0 ? void 0 : _h.lineTo((i + 1) * this.gridX + 0.5, 0.5);
                    (_j = this.ctx) === null || _j === void 0 ? void 0 : _j.stroke();
                }
            }
        };
        return handleCanvas;
    }());

    (function () {
        var _a, _b;
        var canvasHandler = new handleCanvas("game");
        var filesHandler = new fileSystemHandler(canvasHandler);
        canvasHandler.setFileSystemElement(filesHandler.getFileSystemElement());
        (_a = document.getElementById("exportRoom")) === null || _a === void 0 ? void 0 : _a.addEventListener("mouseup", function () {
            tools.download("room.txt", canvasHandler.exportRoom());
        });
        (_b = document.getElementById("importRoom")) === null || _b === void 0 ? void 0 : _b.addEventListener("mouseup", function () {
            tools.upload(function (text) {
                //console.log(text);
                canvasHandler.importRoom(text);
            });
        });
        setInterval(function () {
            canvasHandler.render();
        }, 16);
    })();

}(PIXI));
