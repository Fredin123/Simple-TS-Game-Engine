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
    /** @deprecated */

    function __spreadArrays() {
      for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;

      for (var r = Array(s), k = 0, i = 0; i < il; i++) for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) r[k] = a[j];

      return r;
    }

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
        calculations.PI = 3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679;
        calculations.EPSILON = 8.8541878128;
        return calculations;
    }());

    var nullVector = /** @class */ (function () {
        function nullVector() {
            this.delta = -1;
            this.Dx = -1;
            this.Dy = -1;
            this.angle = -1;
            this.magnitude = -1;
        }
        nullVector.prototype.increaseMagnitude = function (addValue) {
            throw new Error("Method not implemented.");
        };
        nullVector.prototype.limitHorizontalMagnitude = function (limit) {
            throw new Error("Method not implemented.");
        };
        nullVector.prototype.limitVerticalMagnitude = function (limit) {
            throw new Error("Method not implemented.");
        };
        return nullVector;
    }());

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
        //Full
        internalFunction.intersecting = function (initiator, initiadorCollisionBox, collisionTarget) {
            var x1 = initiator.g.x + initiadorCollisionBox.x;
            var y1 = initiator.g.y + initiadorCollisionBox.y;
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
                x1 + initiadorCollisionBox.width > x2 &&
                y1 < y2 + collisionTarget.collisionBox.height &&
                y1 + initiadorCollisionBox.height > y2);
        };
        return internalFunction;
    }());

    var barin = /** @class */ (function () {
        function barin() {
        }
        barin.prototype.angleBetweenPoints = function (dy, dx) {
            return Math.atan2(dy, dx) + Math.PI;
        };
        barin.prototype.distanceBetweenPoints = function (x1, y1, x2, y2) {
            return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
        };
        return barin;
    }());

    var roomEvent = /** @class */ (function () {
        function roomEvent(con, objContainer) {
            this.mouseXPosition = 0;
            this.mouseYPosition = 0;
            this.keysDown = {};
            this.gameKeysPressed = {};
            this.gameKeysReleased = {};
            this.gameKeysHeld = {};
            this.deltaTime = 1;
            this.useCamera = false;
            this.cameraX = 0;
            this.cameraY = 0;
            this.objContainer = objContainer;
            this.container = con;
            this.keysDown = {};
            this.b = new barin();
            this.container.addEventListener("mousemove", this.mouseMoveListener.bind(this));
            document.addEventListener("keydown", this.keyDownListener.bind(this), false);
            document.addEventListener("keyup", this.keyUpListener.bind(this), false);
        }
        roomEvent.tick = function () {
            if (roomEvent.ticks >= Number.MAX_VALUE) {
                roomEvent.ticks = 0;
            }
            roomEvent.ticks++;
        };
        roomEvent.getTicks = function () {
            return this.ticks;
        };
        roomEvent.prototype.queryKey = function () {
            //Reset pressed keys
            for (var key in this.gameKeysPressed) {
                if (this.gameKeysPressed.hasOwnProperty(key)) {
                    this.gameKeysPressed[key] = false;
                }
            }
            for (var key in this.gameKeysReleased) {
                if (this.gameKeysReleased.hasOwnProperty(key)) {
                    this.gameKeysReleased[key] = false;
                }
            }
            for (var key in this.keysDown) {
                if (this.keysDown.hasOwnProperty(key)) {
                    if (this.keysDown[key] && (this.gameKeysPressed[key] == undefined || this.gameKeysPressed[key] == false) && (this.gameKeysHeld[key] == undefined || this.gameKeysHeld[key] == false)) {
                        this.gameKeysPressed[key] = true;
                        this.gameKeysHeld[key] = true;
                    }
                    else if (this.keysDown[key] == false && this.gameKeysHeld[key] == true) {
                        this.gameKeysPressed[key] = false;
                        this.gameKeysHeld[key] = false;
                        this.gameKeysReleased[key] = true;
                    }
                }
            }
        };
        roomEvent.prototype.mouseMoveListener = function (e) {
            var x = e.clientX; //x position within the element.
            var y = e.clientY; //y position within the element.
            if (e.target instanceof Element) {
                var rect = e.target.getBoundingClientRect();
                x -= rect.left;
                y -= rect.top;
            }
            this.mouseXPosition = x;
            this.mouseYPosition = y;
        };
        roomEvent.prototype.keyDownListener = function (e) {
            this.keysDown[e.key] = true;
        };
        roomEvent.prototype.keyUpListener = function (e) {
            this.keysDown[e.key] = false;
        };
        roomEvent.prototype.resetKeyPressedStates = function () {
            this.keysDown = {};
        };
        //Get keys--------------------
        roomEvent.prototype.checkKeyPressed = function (keyCheck) {
            return this.gameKeysPressed[keyCheck];
        };
        roomEvent.prototype.checkKeyReleased = function (keyCheck) {
            return this.gameKeysReleased[keyCheck];
        };
        roomEvent.prototype.checkKeyHeld = function (keyCheck) {
            return this.gameKeysHeld[keyCheck];
        };
        roomEvent.prototype.mouseX = function () {
            return this.mouseXPosition;
        };
        roomEvent.prototype.mouseY = function () {
            return this.mouseYPosition;
        };
        roomEvent.prototype.foreachObjectTypeBoolean = function (type, func) {
            var specificObjects = this.objContainer.getSpecificObjects(type);
            specificObjects.forEach(function (element) {
                if (element.objectName == type) {
                    if (func(element)) {
                        return true;
                    }
                }
            });
            return false;
        };
        roomEvent.prototype.foreachObjectType = function (type, func) {
            var returnResult = new Array();
            var specificObjects = this.objContainer.getSpecificObjects(type);
            specificObjects.forEach(function (element) {
                if (element.objectName == type) {
                    if (func(element)) {
                        returnResult.push(element);
                    }
                }
            });
            return returnResult;
        };
        roomEvent.ticks = 0;
        return roomEvent;
    }());

    var movementOperations = /** @class */ (function () {
        function movementOperations() {
        }
        movementOperations.moveByForce = function (target, force, collisionNames, objContainer, deltaTime) {
            force.Dx = force.Dx * deltaTime;
            force.Dy = force.Dy * deltaTime;
            if (Math.abs(force.Dx) <= 0.000000001) {
                force.Dx = 0;
            }
            if (Math.abs(force.Dy) <= 0.000000001) {
                force.Dy = 0;
            }
            var xdiff = force.Dx;
            var ydiff = force.Dy;
            this.moveForceHorizontal(Math.round(xdiff), 1, target, collisionNames, objContainer);
            //this.moveForceHorizontal(xdiff - ~~xdiff, 0.01, target, collisionNames, objContainer);
            //this.moveOutFromCollider(xdiff % 1, 0.01, target, collisionNames, objContainer);
            this.moveForceVertical(Math.round(ydiff), 1, target, collisionNames, objContainer);
            //this.moveForceVertical(ydiff - ~~ydiff, 0.01, target, collisionNames, objContainer);
            //this.moveForceVertical(ydiff - ~~ydiff, 0.001, target, collisionNames, objContainer);
            force.Dx *= target.airFriction;
            force.Dy *= target.airFriction;
            if (target.gravity != vector.null) {
                force.Dx += target.gravity.Dx;
                force.Dy += target.gravity.Dy;
                target.gravity.increaseMagnitude(target.weight);
            }
        };
        movementOperations.moveForceHorizontal = function (magnitude, iteretorSize, target, collisionNames, objContainer) {
            if (magnitude == 0)
                return;
            var sign = magnitude > 0 ? 1 : -1;
            var objectsThatWereCollidingThisObjectWhileMoving = new Array();
            var _loop_1 = function (i) {
                objectsThatWereCollidingThisObjectWhileMoving.length = 0;
                target.g.x += iteretorSize * sign;
                if (objectBase.objectsThatCollideWithKeyObjectName[target.objectName] != null) {
                    //Push object
                    objContainer.foreachObjectType(objectBase.objectsThatCollideWithKeyObjectName[target.objectName], function (testCollisionWith) {
                        if (sign > 0) {
                            //Move right
                            if (testCollisionWith.g.x > target.g.x && internalFunction.intersecting(target, target.collisionBox, testCollisionWith)) {
                                objectsThatWereCollidingThisObjectWhileMoving.push(testCollisionWith);
                                testCollisionWith.g.x += iteretorSize * sign;
                            }
                        }
                        else {
                            //Move left
                            if (testCollisionWith.g.x + testCollisionWith.collisionBox.x + testCollisionWith.collisionBox.width < target.g.x + target.collisionBox.x + target.collisionBox.width && internalFunction.intersecting(target, target.collisionBox, testCollisionWith)) {
                                objectsThatWereCollidingThisObjectWhileMoving.push(testCollisionWith);
                                testCollisionWith.g.x += iteretorSize * sign;
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
                        objContainer.foreachObjectType(objectBase.objectsThatCollideWithKeyObjectName[target.objectName], function (testCollisionWith) {
                            //console.log("Check object: ", testCollisionWith);
                            if (sign > 0) {
                                //Move right
                                if (internalFunction.intersecting(target, stickyCheck_1, testCollisionWith)) {
                                    if (testCollisionWith._hasBeenMoved_Tick < roomEvent.getTicks()) {
                                        objectsThatWereCollidingThisObjectWhileMoving.push(testCollisionWith);
                                        testCollisionWith.g.x += iteretorSize * sign;
                                        if (i >= Math.abs(magnitude) - iteretorSize) {
                                            testCollisionWith._hasBeenMoved_Tick = roomEvent.getTicks();
                                        }
                                    }
                                }
                            }
                            else {
                                //Move left
                                if (internalFunction.intersecting(target, stickyCheck_1, testCollisionWith)) {
                                    if (testCollisionWith._hasBeenMoved_Tick < roomEvent.getTicks()) {
                                        objectsThatWereCollidingThisObjectWhileMoving.push(testCollisionWith);
                                        testCollisionWith.g.x += iteretorSize * sign;
                                        if (i >= Math.abs(magnitude) - iteretorSize) {
                                            testCollisionWith._hasBeenMoved_Tick = roomEvent.getTicks();
                                        }
                                    }
                                }
                            }
                            return false;
                        });
                    }
                }
                var collisionTarget = this_1.boxIntersectionSpecific(target, target.collisionBox, collisionNames, objContainer);
                if (collisionTarget != objectBase.null) {
                    sign *= -1;
                    target.g.x += 1 * iteretorSize * sign;
                    objectsThatWereCollidingThisObjectWhileMoving.forEach(function (updaterObject) {
                        updaterObject.g.y += iteretorSize * sign;
                    });
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
                    target.force.Dy *= collisionTarget.friction;
                    return "break";
                }
            };
            var this_1 = this;
            for (var i = 0; i < Math.abs(magnitude); i += iteretorSize) {
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
                objContainer.foreachObjectType(objectBase.objectsThatCollideWithKeyObjectName[target.objectName], function (testCollisionWith) {
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
        movementOperations.moveForceVertical = function (magnitude, iteretorSize, target, collisionNames, objContainer) {
            if (magnitude == 0)
                return;
            var sign = magnitude > 0 ? 1 : -1;
            var objectsThatWereCollidingThisObjectWhileMoving = new Array();
            var _loop_2 = function (i) {
                target.g.y += iteretorSize * sign;
                if (objectBase.objectsThatCollideWithKeyObjectName[target.objectName] != null) {
                    objContainer.foreachObjectType(objectBase.objectsThatCollideWithKeyObjectName[target.objectName], function (testCollisionWith) {
                        if (sign > 0) {
                            //Move down
                            if (testCollisionWith.g.y > target.g.y && internalFunction.intersecting(target, target.collisionBox, testCollisionWith)) {
                                objectsThatWereCollidingThisObjectWhileMoving.push(testCollisionWith);
                                testCollisionWith.g.y += iteretorSize * sign;
                            }
                        }
                        else {
                            //Move up
                            if (testCollisionWith.g.y + testCollisionWith.collisionBox.y + testCollisionWith.collisionBox.height < target.g.y + target.collisionBox.y + target.collisionBox.height && internalFunction.intersecting(target, target.collisionBox, testCollisionWith)) {
                                objectsThatWereCollidingThisObjectWhileMoving.push(testCollisionWith);
                                testCollisionWith.g.y += iteretorSize * sign;
                            }
                        }
                        return false;
                    });
                    //Sticky draging
                    var stickyCheck_2 = boxCollider.copy(target.collisionBox);
                    var checkDistance_2 = Math.abs(magnitude) + 2;
                    if (target.stickyLeftSide) {
                        stickyCheck_2.expandLeftSide(checkDistance_2);
                    }
                    if (target.stickyRightSide) {
                        stickyCheck_2.expandRightSide(checkDistance_2);
                    }
                    if (target.stickyLeftSide || target.stickyRightSide) {
                        //console.log("objectBase.objectsThatCollideWithKeyObjectName[target.objectName]", objectBase.objectsThatCollideWithKeyObjectName[target.objectName]);
                        objContainer.foreachObjectType(objectBase.objectsThatCollideWithKeyObjectName[target.objectName], function (testCollisionWith) {
                            //console.log("Check object: ", testCollisionWith);
                            if (sign > 0) {
                                //Move down
                                if (internalFunction.intersecting(target, stickyCheck_2, testCollisionWith)) {
                                    if (testCollisionWith._hasBeenMoved_Tick < roomEvent.getTicks()) {
                                        objectsThatWereCollidingThisObjectWhileMoving.push(testCollisionWith);
                                        testCollisionWith.g.y += iteretorSize * sign;
                                        if (i >= Math.abs(magnitude) - iteretorSize) {
                                            testCollisionWith._hasBeenMoved_Tick = roomEvent.getTicks();
                                        }
                                    }
                                }
                            }
                            else {
                                //Move up
                                if (internalFunction.intersecting(target, stickyCheck_2, testCollisionWith)) {
                                    if (testCollisionWith._hasBeenMoved_Tick < roomEvent.getTicks()) {
                                        objectsThatWereCollidingThisObjectWhileMoving.push(testCollisionWith);
                                        testCollisionWith.g.y += iteretorSize * sign;
                                        if (i >= Math.abs(magnitude) - iteretorSize) {
                                            testCollisionWith._hasBeenMoved_Tick = roomEvent.getTicks();
                                        }
                                    }
                                }
                            }
                            return false;
                        });
                    }
                }
                var collisionTarget = this_2.boxIntersectionSpecific(target, target.collisionBox, collisionNames, objContainer);
                if (collisionTarget != objectBase.null) {
                    sign *= -1;
                    target.g.y += iteretorSize * sign;
                    objectsThatWereCollidingThisObjectWhileMoving.forEach(function (updaterObject) {
                        updaterObject.g.y += iteretorSize * sign;
                    });
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
                    //target.gravity.Dy = 0;
                    //target.force.Dy *= collisionTarget.friction;
                    target.force.Dx *= collisionTarget.friction;
                    return "break";
                }
            };
            var this_2 = this;
            for (var i = 0; i < Math.abs(magnitude); i += iteretorSize) {
                var state_2 = _loop_2(i);
                if (state_2 === "break")
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
                objContainer.foreachObjectType(objectBase.objectsThatCollideWithKeyObjectName[target.objectName], function (testCollisionWith) {
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
        movementOperations.moveOutFromCollider = function (magnitude, iteretorSize, target, collisionNames, objContainer) {
            var collisionTarget;
            while ((collisionTarget = this.boxIntersectionSpecific(target, target.collisionBox, collisionNames, objContainer)) != objectBase.null) {
                target.g.x += Math.cos(collisionTarget.force.delta);
                Math.cos(collisionTarget.force.delta);
            }
            /*if(moveX > 0){
                target.g.x += 5;
            }else if(moveX < 0){
                target.g.x -= 5;
            }*/
        };
        movementOperations.boxIntersectionSpecific = function (initiator, boxData, targetObjects, objContainer) {
            return this.boxIntersectionSpecificClass(initiator, boxData, targetObjects, objContainer);
        };
        //Collision
        movementOperations.boxIntersectionSpecificClass = (new /** @class */ (function () {
            function class_1() {
                this.inc = function (initiator, boxData, targetObjects, objContainer) {
                    return objContainer.foreachObjectType(targetObjects, function (testCollisionWith) {
                        if (internalFunction.intersecting(initiator, boxData, testCollisionWith)) {
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
            this.stickyBottom = false;
            this.stickyTop = false;
            this.stickyLeftSide = false;
            this.stickyRightSide = false;
            this.gravity = new vector(0, 0);
            this.weight = 0;
            this.ID = "";
            this.g = new PIXI.Graphics();
            this._collisionBox = new boxCollider(0, 0, 0, 0);
            this.resourcesNeeded = [];
            this._objectName = "nulliObject";
            this.collisionTargets = [];
            this.force = new vector(0, 0);
            this._hasBeenMoved_Tick = 0;
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
            this._g = new PIXI.Container();
            this.friction = 0.5;
            this.airFriction = 0.8;
            this.resourcesNeeded = [];
            this.stickyBottom = false;
            this.stickyTop = false;
            this.stickyLeftSide = false;
            this.stickyRightSide = false;
            this.gravity = vector.null;
            this.weight = 0.4;
            this._hasBeenMoved_Tick = 0;
            this._collisionBox = new boxCollider(0, 0, 0, 0);
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
                    if (objectBase.objectsThatCollideWithKeyObjectName[collNames[i]] == null) {
                        objectBase.objectsThatCollideWithKeyObjectName[collNames[i]] = new Array();
                    }
                    if (objectBase.objectsThatCollideWithKeyObjectName[collNames[i]].indexOf(this.objectName) == -1) {
                        objectBase.objectsThatCollideWithKeyObjectName[collNames[i]].push(this.objectName);
                    }
                    if (this.collisionTargets.indexOf(collNames[i]) == -1) {
                        this.collisionTargets.push(collNames[i]);
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
            var tempG = newGraphics(new PIXI.Container());
            var oldX = this.g.x;
            var oldY = this.g.y;
            this._g = tempG;
            this._g.x = oldX;
            this._g.y = oldY;
        };
        objectBase.prototype.logic = function (l) {
            movementOperations.moveByForce(this, this._force, this.collisionTargets, l.objContainer, l.deltaTime);
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
        objectBase.null = new nulliObject(0, 0);
        objectBase.objectsThatCollideWithKeyObjectName = {};
        return objectBase;
    }());

    var block = /** @class */ (function (_super) {
        __extends(block, _super);
        function block(xp, yp) {
            var _this = _super.call(this, xp, yp, block.objectName) || this;
            _this.switch = false;
            _this.friction = 0.973;
            _super.prototype.setCollision.call(_this, 0, 0, 128, 128);
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI$1.Graphics();
                newGraphics.beginFill(0x000000);
                newGraphics.drawRect(0, 0, 128, 128);
                newGraphics.endFill();
                g.addChild(newGraphics);
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

    var movingBlockHori = /** @class */ (function (_super) {
        __extends(movingBlockHori, _super);
        function movingBlockHori(xp, yp) {
            var _this = _super.call(this, xp, yp, movingBlockHori.objectName) || this;
            _this.switch = false;
            _this.friction = 0.873;
            _this.stickyTop = true;
            _super.prototype.setCollision.call(_this, 0, 0, 256, 256);
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI$1.Graphics();
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
            if (roomEvent.getTicks() % 20 == 0) {
                this.switch = !this.switch;
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
            _this.stickyTop = true;
            _super.prototype.setCollision.call(_this, 0, 0, 256, 256);
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI$1.Graphics();
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
            if (roomEvent.getTicks() % 55 == 0) {
                this.switch = !this.switch;
            }
        };
        movingBlockVert.objectName = "movingBlockVert";
        return movingBlockVert;
    }(objectBase));

    var marker = /** @class */ (function (_super) {
        __extends(marker, _super);
        function marker(xp, yp) {
            var _this = _super.call(this, xp, yp, marker.objectName) || this;
            _this.switch = false;
            _this.friction = 0.0;
            _this.life = 1000;
            _super.prototype.setCollision.call(_this, 0, 0, 0, 0);
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI$1.Graphics();
                newGraphics.beginFill(0xFF3e50);
                newGraphics.drawRect(0, 0, 16, 16);
                newGraphics.endFill();
                g.addChild(newGraphics);
                return g;
            });
            return _this;
            /*setInterval(()=>{
                this.switch = !this.switch;
            }, 700);*/
        }
        marker.prototype.logic = function (l) {
            this.life--;
            if (this.life <= 0) {
                l.objContainer.deleteObject(this);
            }
            //super.logic(l);
            /*if(this.switch){
                super.setNewForce(l.degreesToRadians(0), 3);
            }else{
                super.setNewForce(l.degreesToRadians(180), 3);
            }*/
        };
        marker.objectName = "marker";
        return marker;
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

    var mio = /** @class */ (function (_super) {
        __extends(mio, _super);
        function mio(xp, yp) {
            var _this = _super.call(this, xp, yp, mio.objectName) || this;
            _this.airFriction = 0.93;
            _this.gravity = new vectorFixedDelta(calculations.degreesToRadians(270), 0); //vector.fromAngleAndMagnitude(calculations.degreesToRadians(270), 0.6);
            _this.weight = 0.03;
            _this.maxRunSpeed = 2;
            _super.prototype.setCollision.call(_this, 0, 0, 128, 128);
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI$1.Graphics();
                newGraphics.beginFill(0xFF3e50);
                newGraphics.drawRect(0, 0, 128, 128);
                newGraphics.endFill();
                g.addChild(newGraphics);
                var animation = resources.getAnimatedSprite("playerWalk");
                if (animation != null) {
                    animation.animationSpeed = 0.1;
                    animation.play();
                    g.addChild(animation);
                }
                g.filters = [];
                g.calculateBounds();
                return g;
            });
            _super.prototype.addCollisionTarget.call(_this, block.objectName, movingBlockHori.objectName, movingBlockVert.objectName);
            return _this;
        }
        mio.prototype.logic = function (l) {
            _super.prototype.logic.call(this, l);
            if (l.checkKeyHeld("a")) {
                _super.prototype.addForceAngleMagnitude.call(this, calculations.degreesToRadians(180), 0.8);
            }
            if (l.checkKeyHeld("d")) {
                _super.prototype.addForceAngleMagnitude.call(this, calculations.degreesToRadians(0), 0.8);
            }
            if (l.checkKeyPressed("w")) {
                _super.prototype.addForceAngleMagnitude.call(this, calculations.degreesToRadians(90), 12);
            }
            this.force.limitHorizontalMagnitude(this.maxRunSpeed);
            l.useCamera = true;
            l.cameraX = this.g.x;
            l.cameraY = this.g.y;
        };
        mio.objectName = "mio";
        return mio;
    }(objectBase));

    //{NEW IMPORTS END HERE}
    var objectGenerator = /** @class */ (function () {
        function objectGenerator() {
            this.availibleObjects = [
                //{NEW OBJECT HERE START} (COMMENT USED AS ANCHOR BY populareObjectGenerator.js)
                function (xp, yp) { return new block(xp, yp); },
                function (xp, yp) { return new movingBlockHori(xp, yp); },
                function (xp, yp) { return new movingBlockVert(xp, yp); },
                function (xp, yp) { return new marker(xp, yp); },
                function (xp, yp) { return new mio(xp, yp); },
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

    var resources = /** @class */ (function () {
        function resources(app, onCompleteCallback, alternativePath) {
            if (alternativePath === void 0) { alternativePath = ""; }
            this.objectGen = new objectGenerator();
            resources.app = app;
            fetch(alternativePath + '/resources.txt', {
                method: 'get'
            })
                .then(function (response) { return response.text(); })
                .then(function (textData) { return resources.loadFromResources(textData.split("\n"), onCompleteCallback, alternativePath); })
                .catch(function (err) {
                console.log(err);
            });
        }
        resources.loadFromResources = function (loadedResources, onCompleteCallback, alternativePath) {
            for (var _i = 0, loadedResources_1 = loadedResources; _i < loadedResources_1.length; _i++) {
                var resource = loadedResources_1[_i];
                //resource = alternativePath += resource;
                console.log(resource);
            }
            resources.resourcesToLoad = loadedResources;
            resources.resourcesToLoad.forEach(function (resourceDir) {
                var resourceDirsSplit = resourceDir.split("/");
                var resourceName = resourceDirsSplit[resourceDirsSplit.length - 1];
                resources.app.loader.add(resourceName, alternativePath + "resources/" + resourceDir);
            });
            resources.app.loader.load(function (e) {
                resources.resourcesToLoad.forEach(function (resource) {
                    var split = resource.split("/");
                    var name = split[split.length - 1];
                    if (name.indexOf(".json") != -1) {
                        resources.storeAnimatedArray(name);
                    }
                });
                onCompleteCallback();
            });
        };
        resources.storeAnimatedArray = function (resourceName) {
            var texturesTmp = resources.app.loader.resources[resourceName].textures;
            if (resources.app.loader.resources[resourceName].textures != null) {
                for (var key in texturesTmp) {
                    if (texturesTmp.hasOwnProperty(key)) {
                        if (resources.animatedSprite[resourceName] == null) {
                            resources.animatedSprite[resourceName] = [];
                        }
                        resources.animatedSprite[resourceName].push(texturesTmp[key]);
                    }
                }
            }
            //const animeFromSheet = new PIXI.AnimatedSprite(animation);
        };
        resources.getAnimatedSprite = function (name) {
            if (name.indexOf(".") != -1) {
                name = name.split(".")[0];
            }
            name += ".json";
            console.log("Name: ", name);
            if (resources.animatedSprite[name] != null) {
                return new PIXI.AnimatedSprite(resources.animatedSprite[name]);
            }
            return null;
        };
        resources.resourcePNG = function (resourceName) {
            for (var _i = 0, _a = resources.resourcesToLoad; _i < _a.length; _i++) {
                var resourceDir = _a[_i];
                var splitDirs = resourceDir.split("/");
                var nameAndMeta = splitDirs[splitDirs.length - 1];
                if (nameAndMeta.toLocaleLowerCase().indexOf(".png") != -1) {
                    nameAndMeta.split(".")[0];
                    if (nameAndMeta == resourceName + ".png") {
                        return resources.app.loader.resources[nameAndMeta].texture;
                    }
                }
            }
            throw new Error("PNG resource does not exist: " + resourceName);
        };
        resources.resourcesToLoad = [];
        resources.animatedSprite = {};
        return resources;
    }());

    var cursorType;
    (function (cursorType) {
        cursorType[cursorType["pensil"] = 0] = "pensil";
        cursorType[cursorType["eraser"] = 1] = "eraser";
        cursorType[cursorType["grabber"] = 2] = "grabber";
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

    var layer = /** @class */ (function () {
        function layer(layerName, zIndex) {
            this.metaObjectsInLayer = [];
            this.hidden = false;
            this.layerName = layerName;
            this.zIndex = zIndex;
        }
        return layer;
    }());

    var objectMetaData = /** @class */ (function () {
        function objectMetaData(x, y, name, tile) {
            this.tile = null;
            this.x = x;
            this.y = y;
            this.name = name;
            this.tile = tile;
        }
        return objectMetaData;
    }());

    var layerContainer = /** @class */ (function () {
        function layerContainer(canvasContext) {
            this.storedLayers = [];
            this.selectedLayer = null;
            this.gridXOffset = 0;
            this.gridYOffset = 0;
            this.ctx = canvasContext;
            this.containerElement = document.getElementById("layerContainer");
        }
        layerContainer.prototype.importRoom = function (jsonString) {
            var arayOfData = [];
            if (jsonString != "") {
                arayOfData = JSON.parse(jsonString);
            }
            if (arayOfData.length == 0) {
                arayOfData.push(new layer("Layer 1", 0));
            }
            this.storedLayers.length = 0;
            var _loop_1 = function (i) {
                var dataLayer = arayOfData[i];
                var newLayer = new layer(dataLayer.layerName, dataLayer.zIndex);
                dataLayer.metaObjectsInLayer.forEach(function (obj) {
                    newLayer.metaObjectsInLayer.push(new objectMetaData(obj.x, obj.y, obj.name, obj.tile));
                });
                this_1.storedLayers.push(newLayer);
            };
            var this_1 = this;
            for (var i = 0; i < arayOfData.length; i++) {
                _loop_1(i);
            }
            //populate layer select element
            this.initializeLayerModule(this.storedLayers);
            this.selectFirstLayer();
        };
        layerContainer.prototype.exportRoom = function () {
            return LZString.compressToEncodedURIComponent(JSON.stringify(this.storedLayers));
        };
        layerContainer.prototype.createLayerOption = function (layerName) {
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
            hideCheck.addEventListener("change", this.clickHideLayer.bind(this));
            layerOption.appendChild(hideCheck);
            this.containerElement.appendChild(layerOption);
            return layerOption;
        };
        layerContainer.prototype.clickLayerOption = function (e) {
            var _a;
            var target = e.target;
            var layerName = (_a = target.parentElement) === null || _a === void 0 ? void 0 : _a.getElementsByTagName("span")[0].innerHTML;
            if (layerName != null) {
                for (var _i = 0, _b = this.storedLayers; _i < _b.length; _i++) {
                    var layer_1 = _b[_i];
                    if (layer_1.layerName == layerName) {
                        this.selectLayer(layer_1);
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
                var layer_2 = _a[_i];
                if (layer_2.layerName == layerName) {
                    return layer_2.hidden;
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
        layerContainer.prototype.getObjectAtPos = function (mouseTestX, mouseTestY) {
            var _a;
            if (this.selectedLayer != null) {
                for (var _i = 0, _b = (_a = this.selectedLayer) === null || _a === void 0 ? void 0 : _a.metaObjectsInLayer; _i < _b.length; _i++) {
                    var obj = _b[_i];
                    if (this.isMouseInsideObject(obj, mouseTestX, mouseTestY)) {
                        return obj;
                    }
                }
            }
            return null;
        };
        layerContainer.prototype.remomveObject = function (targetObject) {
            if (targetObject != null && this.selectedLayer != null) {
                this.selectedLayer.metaObjectsInLayer = this.selectedLayer.metaObjectsInLayer.filter(function (x) { return x != targetObject; });
            }
        };
        layerContainer.prototype.isMouseInsideObject = function (obj, mouseTestX, mouseTestY) {
            var width = -1;
            var height = -1;
            if (obj.tile != null) {
                width = obj.tile.get(0).width;
                height = obj.tile.get(0).height;
            }
            else {
                width = canvasRenderer.classAndImage[obj.name].width;
                height = canvasRenderer.classAndImage[obj.name].height;
            }
            if (mouseTestX - this.gridXOffset >= obj.x &&
                mouseTestX - this.gridXOffset < obj.x + width &&
                mouseTestY - this.gridYOffset >= obj.y &&
                mouseTestY - this.gridYOffset < obj.y + height) {
                return true;
            }
            return false;
        };
        layerContainer.prototype.moveLayerUp = function (e) {
            var _a;
            var button = e.target;
            var layerName = (_a = button.parentElement) === null || _a === void 0 ? void 0 : _a.getElementsByTagName("span")[0].innerHTML;
            if (layerName != null) {
                var targetToMoveUp = this.storedLayers.filter(function (x) { return x.layerName == layerName; })[0];
                var index_1 = targetToMoveUp.zIndex;
                var targetToMoveDown = this.storedLayers.filter(function (x) { return x.zIndex == index_1 - 1; })[0];
                targetToMoveUp.zIndex = targetToMoveDown.zIndex;
                targetToMoveDown.zIndex = index_1;
                this.initializeLayerModule(__spreadArrays(this.storedLayers));
            }
            if (layerName != null) {
                if (this.selectedLayer != null) {
                    this.selectLayer(this.selectedLayer);
                }
            }
        };
        layerContainer.prototype.moveLayerDown = function (e) {
            var _a;
            var button = e.target;
            var layerName = (_a = button.parentElement) === null || _a === void 0 ? void 0 : _a.getElementsByTagName("span")[0].innerHTML;
            if (layerName != null) {
                var targetToMoveDown = this.storedLayers.filter(function (x) { return x.layerName == layerName; })[0];
                var index_2 = targetToMoveDown.zIndex;
                var targetToMoveUp = this.storedLayers.filter(function (x) { return x.zIndex == index_2 + 1; })[0];
                targetToMoveUp.zIndex = targetToMoveDown.zIndex;
                targetToMoveDown.zIndex = index_2;
                this.initializeLayerModule(__spreadArrays(this.storedLayers));
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
                var layerName = layers_1[_i];
                this.createLayerOption(layerName.layerName);
            }
        };
        layerContainer.prototype.selectFirstLayer = function () {
            console.log("selectFirstLayer");
            this.selectLayer(this.storedLayers[0]);
        };
        layerContainer.prototype.createNewLayer = function (newLayerName) {
            var nextIndex = 0;
            this.storedLayers.forEach(function (layer) {
                if (layer.zIndex > nextIndex) {
                    nextIndex = layer.zIndex + 1;
                }
            });
            var newLayer = new layer(newLayerName, nextIndex);
            this.storedLayers.push(newLayer);
            this.initializeLayerModule(JSON.parse(JSON.stringify(this.storedLayers)));
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
                this.initializeLayerModule(this.storedLayers.filter(function (l) { return l.layerName != layerName; }));
                this.selectLayer();
            }
        };
        return layerContainer;
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
            this.movementSpeed = 30;
            this.tiles = tiles;
        }
        tileAnimation.initFromJsonGeneratedObj = function (obj) {
            var realObject = new tileAnimation(obj.tiles);
            realObject.name = obj.name;
            return realObject;
        };
        tileAnimation.prototype.get = function (index) {
            return this.tiles[index % this.tiles.length];
        };
        tileAnimation.prototype.getAllTiles = function () {
            return this.tiles;
        };
        return tileAnimation;
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
            this.tempSubTile = this.animation.tiles[0];
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
            previewCtx === null || previewCtx === void 0 ? void 0 : previewCtx.drawImage(tileSelector.resourceNameAndImage[targetTile.resourceName], targetTile.startX, targetTile.startY, targetTile.width, targetTile.height, 0, 0, drawWidth, drawHeight);
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
            this.mouseX = -1;
            this.mouseY = -1;
            this.resourceName = "";
            this.subTileDone = false;
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
            this.controls.appendChild(this.prevCreatedAnimTiles);
            this.modal.appendChild(this.controls);
            this.canvasContainer = document.createElement("div");
            this.canvasContainer.className = "flexItem flex1";
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
            this.canvasRenderer.addEventListener("mousemove", this.mouseMoveCanvas.bind(this));
            this.canvasRenderer.addEventListener("mousedown", this.clickCanvas.bind(this));
            this.canvasRenderer.addEventListener("mouseup", this.mouseUpCanvas.bind(this));
            document.body.appendChild(this.modal);
            setInterval(function () {
                _this.renderCanvas();
            }, 500);
            this.tileCreator = new animatedTypeCreator("animTileCreator");
        }
        tileSelector.prototype.clickUseButton = function () {
            var _this = this;
            if (this.tileCreator.tempSubTile != null) {
                var tileAnimation_1 = this.tileCreator.getTileStack();
                if (tileAnimation_1.name == "") {
                    window.node.prompt("", "Create a name for the animation stack", function (name) {
                        if (name != null) {
                            var tileAnimation_2 = _this.tileCreator.getTileStack();
                            tileAnimation_2.name = name;
                            if (tileSelector.resourceCreatedTileAnimations[_this.resourceName] == null) {
                                tileSelector.resourceCreatedTileAnimations[_this.resourceName] = [];
                            }
                            tileSelector.resourceCreatedTileAnimations[_this.resourceName].push(tileAnimation_2);
                            window.node.saveJsonData(_this.saveDatePremadeTilesName, JSON.stringify(tileSelector.resourceCreatedTileAnimations));
                            _this.callbackSubTile(tileAnimation_2);
                        }
                    });
                }
                else {
                    this.callbackSubTile(tileAnimation_1);
                }
            }
        };
        tileSelector.prototype.mouseUpCanvas = function (e) {
            this.subTileDone = true;
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
            var _this = this;
            this.callbackSubTile = tileDoneCallback;
            this.resourceName = resourceName;
            if (tileSelector.resourceNameAndImage[resourceName] == null) {
                tileSelector.resourceNameAndImage[resourceName] = new Image();
                tileSelector.resourceNameAndImage[resourceName].onload = function () {
                    var _a;
                    _this.canvasRenderer.width = tileSelector.resourceNameAndImage[_this.resourceName].width;
                    _this.canvasRenderer.height = tileSelector.resourceNameAndImage[_this.resourceName].height;
                    _this.canvasRenderer.style.width = tileSelector.resourceNameAndImage[_this.resourceName].width + "px";
                    _this.canvasRenderer.style.height = tileSelector.resourceNameAndImage[_this.resourceName].height + "px";
                    (_a = _this.canvasContext) === null || _a === void 0 ? void 0 : _a.drawImage(tileSelector.resourceNameAndImage[_this.resourceName], 0, 0);
                    _this.renderCanvas();
                };
                tileSelector.resourceNameAndImage[resourceName].src = imageSource;
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
                        console.log("tileSelector.resourceCreatedTileAnimations[resourceName]: ", tileSelector.resourceCreatedTileAnimations[resourceName]);
                        tileSelector.resourceCreatedTileAnimations[resourceName].splice(pos, 1);
                        console.log("tileSelector.resourceCreatedTileAnimations[resourceName]: ", tileSelector.resourceCreatedTileAnimations[resourceName]);
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
            var mouseGridX = (Math.floor(this.mouseX / gridWidth) * gridWidth) + gridXOffset;
            var mouseGridY = (Math.floor(this.mouseY / gridHeight) * gridHeight) + gridYOffset;
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
                (_b = this.canvasContext) === null || _b === void 0 ? void 0 : _b.drawImage(tileSelector.resourceNameAndImage[this.resourceName], 0, 0);
            }
            //Render lines
            this.renderGrid();
        };
        tileSelector.resourceNameAndImage = {};
        tileSelector.resourceCreatedTileAnimations = {};
        return tileSelector;
    }());

    var canvasRenderer = /** @class */ (function () {
        function canvasRenderer(canvasName) {
            var _this = this;
            var _a, _b;
            this.gridXOffset = 0;
            this.gridYOffset = 0;
            this.canvasScaleX = 1;
            this.canvasScaleY = 1;
            this.layers = [];
            this.counter = 0;
            this.haveSelectedFromHover = false;
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
            this.inputGridx = document.getElementById("gridXInput");
            this.inputGridx.value = this.gridWidth + "";
            this.inputGridy = document.getElementById("gridYInput");
            this.inputGridy.value = this.gridHeight + "";
            this.buttonSetSize.onclick = this.setCanvasWidth.bind(this);
            (_a = document.getElementById("gridXInput")) === null || _a === void 0 ? void 0 : _a.addEventListener("change", this.onGridSizeChange.bind(this));
            (_b = document.getElementById("gridYInput")) === null || _b === void 0 ? void 0 : _b.addEventListener("change", this.onGridSizeChange.bind(this));
            this.container = document.getElementById("canvasAndFilesCon");
            window.onresize = this.windowResize.bind(this);
            setInterval(function () {
                _this.counter++;
                if (_this.counter > 1000) {
                    _this.counter = 0;
                }
            }, 1000);
            setTimeout(function () {
                _this.windowResize();
            }, 800);
        }
        canvasRenderer.prototype.updateCanvasOffset = function (dx, dy) {
            this.gridXOffset += dx;
            this.gridYOffset += dy;
            this.layerHandler.gridXOffset = this.gridXOffset;
            this.layerHandler.gridYOffset = this.gridYOffset;
        };
        canvasRenderer.prototype.windowResize = function () {
            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;
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
            var _a;
            this.haveSelectedFromHover = false;
            (_a = this.ctx) === null || _a === void 0 ? void 0 : _a.clearRect(0, 0, this.canvas.width / this.canvasScaleX, this.canvas.height / this.canvasScaleY);
            this.drawGrid();
            this.drawObjects(mouseX, mouseY);
            this.drawMouse(mouseX, mouseY, cursor);
        };
        canvasRenderer.prototype.drawObjects = function (mouseX, mouseY) {
            var _this = this;
            this.layerHandler.storedLayers.forEach(function (layer) {
                if (layer.hidden == false) {
                    layer.metaObjectsInLayer.forEach(function (meta) {
                        var _a, _b;
                        if (meta.tile == null) {
                            if (canvasRenderer.classAndImage[meta.name].complete) {
                                try {
                                    //this.ctx?.setTransform(1, 0, 0, 1, this.canvasXOffset, this.canvasYOffset);
                                    _this.drawMouseOverSelection(meta, mouseX, mouseY);
                                    (_a = _this.ctx) === null || _a === void 0 ? void 0 : _a.drawImage(canvasRenderer.classAndImage[meta.name], meta.x + _this.gridXOffset, meta.y + _this.gridYOffset);
                                }
                                catch (exception) {
                                    //console.log("Fel: ", obj.image, obj);
                                }
                            }
                        }
                        else {
                            var tileToDraw = meta.tile.get(_this.counter);
                            _this.drawMouseOverSelection(meta, mouseX, mouseY);
                            (_b = _this.ctx) === null || _b === void 0 ? void 0 : _b.drawImage(tileSelector.resourceNameAndImage[tileToDraw.resourceName], tileToDraw.startX, tileToDraw.startY, tileToDraw.width, tileToDraw.height, meta.x + _this.gridXOffset, meta.y + _this.gridYOffset, tileToDraw.width, tileToDraw.height);
                        }
                    });
                }
            });
        };
        canvasRenderer.prototype.drawMouseOverSelection = function (obj, mouseX, mouseY) {
            var _a, _b, _c;
            if (this.layerHandler.isMouseInsideObject(obj, mouseX, mouseY)
                && this.haveSelectedFromHover == false) {
                this.haveSelectedFromHover = true;
                var width = -1;
                var height = -1;
                if (obj.tile != null) {
                    width = obj.tile.get(this.counter).width;
                    height = obj.tile.get(this.counter).height;
                }
                else {
                    width = canvasRenderer.classAndImage[obj.name].width;
                    height = canvasRenderer.classAndImage[obj.name].height;
                }
                this.ctx.strokeStyle = 'red';
                this.ctx.lineWidth = 5;
                (_a = this.ctx) === null || _a === void 0 ? void 0 : _a.beginPath();
                (_b = this.ctx) === null || _b === void 0 ? void 0 : _b.rect(obj.x + this.gridXOffset - 2.5, obj.y + this.gridYOffset - 2.5, width + 5, height + 5);
                (_c = this.ctx) === null || _c === void 0 ? void 0 : _c.stroke();
            }
        };
        canvasRenderer.prototype.drawGrid = function () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
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
                    var image = tileSelector.resourceNameAndImage[cursor.currentSubTile.get(0).resourceName];
                    (_g = this.ctx) === null || _g === void 0 ? void 0 : _g.drawImage(image, cursor.currentSubTile.get(0).startX, cursor.currentSubTile.get(0).startY, cursor.currentSubTile.get(0).width, cursor.currentSubTile.get(0).height, xMousePut, yMousePut, cursor.currentSubTile.get(0).width, cursor.currentSubTile.get(0).height);
                }
            }
        };
        canvasRenderer.classAndImage = {};
        return canvasRenderer;
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
                var tempObj = obj(0, 0);
                var appRenderObject = new PIXI$1.Application({
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
                canvasRenderer.classAndImage[funcNameOnly] = tempNewImage;
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
        return fileSystemHandlerObjects;
    }());

    var fileSystemHandlerResources = /** @class */ (function () {
        function fileSystemHandlerResources(canvasHandler, cursor) {
            var _this = this;
            this.generateObjects = new objectGenerator();
            this.app = new PIXI$1.Application();
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
                _this.populateFileSystem(returnData);
            });
        }
        fileSystemHandlerResources.prototype.populateFileSystem = function (roomData) {
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
                console.log("subtile: ", subtile);
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
                var roomSrc = roomMeta[0];
                var roomData = roomMeta[1];
                var roomDirParts = roomSrc.split("/");
                var currentFolder = null;
                roomDirParts.forEach(function (item) {
                    if (item != "..") {
                        var newEntry = void 0;
                        if (item.indexOf(".ts") != -1) {
                            //It's a file
                            newEntry = new fileSystemEntry("file", item, [], idCounter, [roomSrc, roomData]);
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
        fileSystemHandlerRooms.prototype.getFileSystemElement = function () {
            return document.getElementById("fileSystemRoom");
        };
        fileSystemHandlerRooms.prototype.onClickFile = function (fileClicked, id, image, customData) {
            if (customData[1] == "") {
                customData[1] = "[]";
            }
            this.currentRoom = customData;
            this.canvasHandler.importRoom(LZString.decompressFromEncodedURIComponent(customData[1]));
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
            console.log("Save this: ", roomDataCompressed);
            window.node.saveRoom(this.currentRoom[0], roomDataCompressed);
        };
        return fileSystemHandlerRooms;
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
        };
        handleCanvas.prototype.keysUp = function (e) {
        };
        handleCanvas.prototype.mouseListenerDown = function (e) {
            var _a, _b;
            var targetElement = e.target;
            if (targetElement.tagName != "CANVAS" || targetElement.id != "game") {
                return;
            }
            if (this.cursor.objectSelected != null && this.cursor.objectSelected.objectMouseImageReady == false && cursorData.cursorType != cursorType.grabber) {
                return;
            }
            var mouseGridX = Math.floor(this.mouseXPosition / this.canvasRenderPart.gridWidth) * this.canvasRenderPart.gridWidth;
            var mouseGridY = Math.floor(this.mouseYPosition / this.canvasRenderPart.gridHeight) * this.canvasRenderPart.gridHeight;
            if (cursorData.cursorType == cursorType.pensil && this.canvasRenderPart.layerHandler.selectedLayer != null) {
                if (this.cursor.objectSelected != null || this.cursor.currentSubTile != null) {
                    var nameOfMetaObject = (_a = this.cursor.objectSelected) === null || _a === void 0 ? void 0 : _a.objectName;
                    if (nameOfMetaObject == null) {
                        nameOfMetaObject = (_b = this.cursor.currentSubTile) === null || _b === void 0 ? void 0 : _b.name;
                    }
                    if (this.noGridMouse) {
                        console.log("here");
                        this.canvasRenderPart.layerHandler.addToLayer(new objectMetaData(this.mouseXPosition - this.canvasRenderPart.gridXOffset, this.mouseYPosition - this.canvasRenderPart.gridYOffset, nameOfMetaObject, this.cursor.currentSubTile));
                    }
                    else {
                        //check if there already is an item at the position
                        console.log(this.canvasRenderPart.layerHandler.hasObjectPos(mouseGridX, mouseGridY));
                        if (this.canvasRenderPart.layerHandler.hasObjectPos(mouseGridX, mouseGridY) == false) {
                            this.canvasRenderPart.layerHandler.addToLayer(new objectMetaData(mouseGridX - this.canvasRenderPart.gridXOffset, mouseGridY - this.canvasRenderPart.gridYOffset, nameOfMetaObject, this.cursor.currentSubTile));
                        }
                    }
                }
            }
            else if (cursorData.cursorType == cursorType.eraser && this.canvasRenderPart.layerHandler.selectedLayer != null) {
                var objTarget = this.canvasRenderPart.layerHandler.getObjectAtPos(this.mouseXPosition, this.mouseYPosition);
                this.canvasRenderPart.layerHandler.remomveObject(objTarget);
            }
            else if (cursorData.cursorType == cursorType.grabber) {
                if (this.previousMouseX != -1 && this.previousMouseY != -1) {
                    var dX = this.mouseXPosition - this.previousMouseX;
                    var dY = this.mouseYPosition - this.previousMouseY;
                    this.canvasRenderPart.updateCanvasOffset(dX, dY);
                }
                this.previousMouseX = this.mouseXPosition;
                this.previousMouseY = this.mouseYPosition;
            }
            this.mouseDown = true;
        };
        handleCanvas.prototype.importRoom = function (jsonString) {
            console.log("import room");
            this.canvasRenderPart.layerHandler.importRoom(jsonString);
        };
        handleCanvas.prototype.exportRoom = function () {
            return this.canvasRenderPart.layerHandler.exportRoom();
        };
        handleCanvas.prototype.mouseListenerUp = function (e) {
            this.mouseDown = false;
            this.previousMouseX = -1;
            this.previousMouseY = -1;
        };
        handleCanvas.prototype.mouseListenerMove = function (e) {
            var mousePosition = this.canvasRenderPart.getCanvasMousePositions(e);
            this.mouseXPosition = mousePosition[0];
            this.mouseYPosition = mousePosition[1];
            if (this.mouseDown) {
                this.mouseListenerDown(e);
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
        new resources(app, function () {
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
            //tools.download("room.txt", canvasHandler.exportRoom());
            filesHandlerRooms.saveRoom(canvasHandler.exportRoom());
        }, false);
        setInterval(function () {
            canvasHandler.render();
        }, 16);
    }

}(PIXI));
