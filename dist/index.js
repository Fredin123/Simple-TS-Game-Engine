(function (PIXI$1) {
    'use strict';

    var gameSettings = /** @class */ (function () {
        function gameSettings() {
            this.stretchToWindow = false;
            this.fixedCanvasWidth = 640;
            this.fixedCanvasHeight = 640;
        }
        gameSettings.prototype.applySettings = function (a) {
            this.app = a;
            this.app.renderer.backgroundColor = 0xFFFFFF;
            if (this.stretchToWindow) {
                this.windowStretchListener();
                window.addEventListener("resize", this.windowStretchListener.bind(this));
            }
        };
        gameSettings.prototype.windowStretchListener = function () {
            if (this.stretchToWindow) {
                this.app.view.width = window.innerWidth;
                this.app.view.height = window.innerHeight;
            }
        };
        return gameSettings;
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
            this.isTile = false;
            this.tileStepTime = -1;
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

    var resourcesHand = /** @class */ (function () {
        function resourcesHand(app, onCompleteCallback, alternativePath) {
            if (alternativePath === void 0) { alternativePath = ""; }
            this.objectGen = new objectGenerator();
            resourcesHand.app = app;
            PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
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
            resourcesHand.resourcesToLoad.forEach(function (resourceDir) {
                var resourceDirsSplit = resourceDir.split("/");
                var resourceName = resourceDirsSplit[resourceDirsSplit.length - 1];
                resourcesHand.app.loader.add(resourceName, alternativePath + "resources/" + resourceDir);
            });
            resourcesHand.app.loader.load(function (e) {
                resourcesHand.resourcesToLoad.forEach(function (resource) {
                    var split = resource.split("/");
                    var name = split[split.length - 1];
                    if (name.indexOf(".json") != -1) {
                        resourcesHand.storeAnimatedArray(name);
                    }
                    else if (split[0] == "_generated_tiles") {
                        resourcesHand.storeStaticTile(name);
                    }
                    else if (split[0] == "tiles") {
                        resourcesHand.storeStaticTile(name);
                    }
                });
                onCompleteCallback();
            });
        };
        resourcesHand.generateAnimatedTiles = function (animationMeta) {
            if (resourcesHand.animatedSprite[animationMeta.name] == null) {
                resourcesHand.animatedSprite[animationMeta.name] = [];
            }
            for (var _i = 0, _a = animationMeta.tiles; _i < _a.length; _i++) {
                var tile = _a[_i];
                console.log("find tile.resourceName: " + tile.resourceName);
                var parts = tile.resourceName.split("/");
                console.log("in: ", resourcesHand.app.loader.resources);
                var newTex = new PIXI.Texture(resourcesHand.app.loader.resources[parts[parts.length - 1]].texture.baseTexture, new PIXI.Rectangle(tile.startX, tile.startY, tile.width, tile.height));
                resourcesHand.animatedSprite[animationMeta.name].push(newTex);
            }
        };
        resourcesHand.storeStaticTile = function (genName) {
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
        resourcesHand.getAnimatedSprite = function (name) {
            if (name.indexOf(".") != -1) {
                name = name.split(".")[0];
            }
            name += ".json";
            if (resourcesHand.animatedSprite[name] != null) {
                return new PIXI.AnimatedSprite(resourcesHand.animatedSprite[name]);
            }
            console.log("Wanted to find this animated sprite: ", name);
            console.log("In this resource pool: ", resourcesHand.animatedSprite);
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
        resourcesHand.createAnimatedSpriteFromTile = function (tileAnim) {
        };
        resourcesHand.resourcesToLoad = [];
        resourcesHand.animatedSprite = {};
        resourcesHand.staticTile = {};
        return resourcesHand;
    }());

    var mio = /** @class */ (function (_super) {
        __extends(mio, _super);
        function mio(xp, yp) {
            var _this = _super.call(this, xp, yp, mio.objectName) || this;
            _this.airFriction = 0.93;
            _this.gravity = new vectorFixedDelta(calculations.degreesToRadians(270), 0); //vector.fromAngleAndMagnitude(calculations.degreesToRadians(270), 0.6);
            _this.weight = 0.09;
            _this.maxRunSpeed = 13;
            _super.prototype.setCollision.call(_this, 0, 0, 128, 128);
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI$1.Graphics();
                newGraphics.beginFill(0xFF3e50);
                newGraphics.drawRect(0, 0, 128, 128);
                newGraphics.endFill();
                g.addChild(newGraphics);
                var animation = resourcesHand.getAnimatedSprite("catRun");
                if (animation != null) {
                    animation.width = 256;
                    animation.height = 256;
                    animation.animationSpeed = 0.3;
                    animation.play();
                    animation.x = -64;
                    animation.y = -64;
                    g.addChild(animation);
                }
                //g.removeChild(animation);
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
                _super.prototype.addForceAngleMagnitude.call(this, calculations.degreesToRadians(180), 1);
            }
            if (l.checkKeyHeld("d")) {
                _super.prototype.addForceAngleMagnitude.call(this, calculations.degreesToRadians(0), 1);
            }
            if (l.checkKeyPressed("w")) {
                _super.prototype.addForceAngleMagnitude.call(this, calculations.degreesToRadians(90), 32);
            }
            this.force.limitHorizontalMagnitude(this.maxRunSpeed);
            l.useCamera = true;
            l.cameraX = this.g.x;
            l.cameraY = this.g.y;
        };
        mio.objectName = "mio";
        return mio;
    }(objectBase));

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
        objectGenerator.prototype.generateObject = function (objectName, x, y, tile) {
            for (var i = 0; i < this.availibleObjects.length; i++) {
                if (tile == null) {
                    //Create normal object
                    var avObj = this.availibleObjects[i];
                    var temp = avObj(x, y);
                    var className = tools.getClassNameFromConstructorName(temp.constructor.toString());
                    if (className == objectName) {
                        return temp;
                    }
                }
                else {
                    //Create tile object
                    var newTile = new tileMetaObj(x, y);
                    newTile.setTiles(tile);
                    resourcesHand.createAnimatedSpriteFromTile(tile);
                    return newTile;
                }
            }
            console.log("Can't generate object for: " + objectName);
            throw new Error("Can't generate object for: " + objectName);
        };
        return objectGenerator;
    }());

    var objectContainer = /** @class */ (function () {
        function objectContainer() {
            this.layerKeysOrdered = [];
            this.objectToRemoveBuffer = [];
            this.specificObjects = {};
            this.layers = {};
        }
        objectContainer.prototype.removeObjects = function () {
            this.specificObjects = {};
            this.layers = {};
            this.layerKeysOrdered.length = 0;
        };
        objectContainer.prototype.addObject = function (obj, layer) {
            //Add specific classes
            var objName = tools.getClassNameFromConstructorName(obj.constructor.toString());
            if (this.specificObjects[objName] == null) {
                this.specificObjects[objName] = new Array();
            }
            this.specificObjects[objName].push(obj);
            //Add on specific layer
            if (this.layers[layer] == null) {
                this.layers[layer] = new Array();
                this.layerKeysOrdered.push(layer);
                this.layerKeysOrdered.sort();
            }
            this.layers[layer].push(obj);
        };
        objectContainer.prototype.deleteObject = function (id) {
            this.objectToRemoveBuffer.push(id);
        };
        objectContainer.prototype.purgeObjects = function () {
            /*for(var i=0; i<this.objectToRemoveBuffer.length; i++){
                var obj = this.objectToRemoveBuffer[i];
                for(var objClass in this.specificObjects[obj.objectName])
                this.specificObjects = {};
                this.layers = {};
                this.layerKeysOrdered.length = 0;
            }
            this.objectToRemoveBuffer.length = 0;*/
        };
        objectContainer.prototype.foreachObjectType = function (targets, func) {
            for (var i = 0; i < targets.length; i++) {
                if (this.specificObjects[targets[i]] != null) {
                    for (var j = 0; j < this.specificObjects[targets[i]].length; j++) {
                        if (func(this.specificObjects[targets[i]][j])) {
                            return this.specificObjects[targets[i]][j];
                        }
                    }
                }
            }
            return objectBase.null;
        };
        objectContainer.prototype.getSpecificObjects = function (objName) {
            return this.specificObjects[objName];
        };
        objectContainer.prototype.loopThrough = function (logicModule) {
            for (var key in this.layerKeysOrdered) {
                for (var i = 0; i < this.layers[key].length; i++) {
                    this.layers[key][i].logic(logicModule);
                }
            }
        };
        return objectContainer;
    }());

    var room1 = "NobwRAtgpgLghgeQEYCsoGMYGcCSA7AGTgE8oAnMALlDBgEsAbKKvAVwYYBow6sBhAPYQkdPHHoC8CAGYAVRlCxVpcBlijdeABThkYMwcNHi6k5avXcAHlQCMAJgAc3YlXsBWAGzcx0KmCQGAXQAazAAX05weiYWdi4efiERMQkpOQUlShU1DUSdPQNk4zTzXOs7JxcqAGZHABYfOD9KAKDQiKjaBTiOTSSjVNN0+SYsnMt83X1pQxSTM2yLPJtKB2cwV0p3ByaWtuCwyOieyjY+xLmS4ZlRxTLJ7WmiwYW8B5XKja3PeoAGPbMVqBQ6dE6xM7xfpXIaSW6ZD79AozGFvRFgVbraqUADsng2viBBw6x26EPOCV4qLS8LG6KehVmxVh7yW5QxX2xjgAnN4wIT-CCSV0YkCKdDmW9afc2Y8sMiXvNSrLPmsqps7H97I1+c0iUKjiLTuLLpKaRk6Sqkc8ma9lRNVViNWtbO57IDBe1DeCxVDTXabhaZQ7rYzqcN0Zj1Vt1gDdfsDWCyb6LlSzYG7uNlqGUenFiGOWrvnZ-gS9Z7QaTRb1KQMlRmEVapmG86yC1Hi2t3DU+QLgV6k9XIam69c4UGs+yGbmA-ns4WnTHPL8Pf3K0byX607ORo2C9PFWO2-OO9jbDjue74-qB1XjVvRyzpZO5QrbfW5+zT87bJe433iW9ZMawlHdn3peUbXDT9JlWDw+RjP9V0Awd7xHaDd0tfdIJbHdI1qBozyQ68K2FH0QP9D9MODecD3fI98O2XYf2IgDEzvTd0NbcCmzojDGN+ONEPsf9yzXMjgOHWsMJ47C334ptVjxTtfxE5D2I3FNpO4icIPk1tGJ5BC7FYsSUI4rTQKo2TaJwmcqMY2wtR1YTRITW9NIo7drN03i7MPFlHNdK9XPUjzyKkqyjxsqd-PowLFK+ISTLUkjxKAocTW86LfLkqCDMStZSyI1K2PCySssfKVcts-S8MK10exKtyb3XCLKpkmrYrqhyGuXFyUpa0iMrQ7SwK6198vq9s7AvELBrCtqKofTrMz0qbepmtZiNCtLzM8yLKJyta-J6hjCpE+oVNM9ylsyladJOvLcM2k83HPYzttKsyNPah7xqe2qNvOrb7BqP4Bq+ob0tQzixp8wHuuBhLQfqGp5qhxaJPuriAb3IGXpBt7KHg5LMb237ltxhH8aRwmUeJ+x8Wu77bux0aoqfCa8j4grQccWxPtU6H9r+6njtpyb6bRC7uXqSHhaxka4c56rEal+yia-Wo-hxDHFYp8qcfhiWsIJzWGe1yh0b+MmDbKu6OaOrn1Z5uKFK2+XHDtm7WvZlXnbVyW3bOy3YKoepPD+FmRcp43VfNV2cwCmXPZxJqWNZv3lcswPE+D5P4tT4mrpXTPY6Np3spdgvmwt4urfqblL2apXYdz6ug7Nun6-tYmdlS3aHf9juqvz7uNZTvurbdK7W8Nx2A878eaJ7qeI0K9xHG3s85rbiyvLHhsJ5D5GG-D7Zt5U-r94OjrHtr3npv7q+z27Xsfsrpej-HJO6-XmCqot47x-MVBeI9D6rUfu7PmL8QExicBXReo8oEn0Lh7OBKlgq3zFibGuaD-5F2nhfYBKlnI4Kpngruq9J5EI3ltUhXJeQUPjnnY+NDT7S2IUA1+zplIsKrj-aiL5OG93oZg7EgkBHf1QRw9BsCZ68K2APaRKCH4EKfq9RR8CCI6mHjnSB6i5GEIwdozs8FVGGLxhomBz8zFnnVPo9uViaY2NDufIBeI7aOM-sglxptjGaK1iQzw6MHFljZgYw6y92EiPkXYkh7gIbhMsdEoRMVaGmJITUPEKTwFRPvtYwJtitEkO1CpHxkTnFpNkXEkxCiSEOG8RE7O1TCmuOKe47hFRKBNxbj+SprSD41KMXUoJYdVSlwVoM4abT-odLGSU4Jkz05CxmTDYZ7SAmLK6eIxuUcKktNmZs+Z2z1pcL2RfL2zTUlbPwZ0s+3TCxozdHkpxJzxb3J2Y8y5kz7Dajeb4iBIyinfIuYAnp-xmEDKORsu+pyvnnLERCwsNReSHNuQi6hYLkXHitnUf4gKqkfKoSvHFAC8UXxycxBBsLRaUITrEpFFLGI1C3tMulcdBG1OZXQlFqwaj1C8ESoZ8LPnYt5Vk1UNR0YYvyXM8VZLJUNOlSJG58qSWMt-tA3Z-KdZ6xFccsVpKmWnR+XqkmcsOWYsVaa56uLGJOEFoauFuCtXCOVQk1UTMdFFhtSa7VbjzWUu9V4dV7zjXuoyaIllF00b63WfS1hMTA0PPBSGnpYNkkwv9VG7m8TSneo+i6pN3LRmesLZmiGcqI1urYam8lfKM0Lh2pyDVkb60erNemxye8c3trrSmrt9rY1bUFmXWlubO3RoLcsnpjU1mcq-mo0FFa50LjAZOgdDLp35vqV6+diCS1cpkeW7tDqGrYP7bWndQ6Z37srQuch16gUFKxUq89o7iZGWPcu-xiLP1NsYvwl9xKO13r3eMjxPSpGgdFYO9JkGlkTJ6SouDRqEM8sA1KnpBLf1+JBQstdKHCwWPQ6629iG-5Qaed+LdN7k1UZ1cG1lsr54MbLau7DKrcNCqFr7DDlGsMjqA4VNlhFy5Tog9R5D0HUU4hpQtbdjHhPmy-fihoPss6CZU2ekTOHUXovY6+hVAbh1qdE57P40Kh4mc1bumTurm2rHqP8hWAmKO6a4-pnjzy2X6w86W093mLMGdWN2XJknlOcaI9xg9hZ3BJPc9pzzMWzlxcfeF0JAWUtBZXbFnz8XwteOM2BzDenQu+fC0opTHHgsFcq0V-V+t37IQgKYUzebHMscKtc8JSDgV3IlRl9dLmrp2yvXV-L6XCuZYjuNs8z6pv-uG7N0b83vZMI-mVoTFW16WZLgtvh+IpNMaDT23rR2fiEui-VmbjW5u9IOZIm7y3CP3f22FiOqyXsDbfbahtxG5MuccBOqgsG3tDY-WtkjLnm4Ywh3Z8DZ200XoYU037p3VOfaq1QWenZEc7a8w1nHTXtg5M+oT+Du2Quk8e+4Erzof23emwBmHwO8dJbPJNpH5XaeZNx9sRnMYwGQ-fXah763thc5-K1lnK3oeS9h3j8pu9+li4B+ZunUuyNbGZxrsz96aO-NwxJmMS3ec05JwLsnaGYw86J2ltnSuOeUFg7Sv7nWHPMYu1tEDIvo5Y72zbx7zOYxy4N11n3aPia2E3XYCPlvicfZD1LhdZ5RdJ6d6tl3tG7A3xhZ7+z0no-qYvuefpHug-85jQdq2Ff9YO+p8n532vlfk3NwC+X73W+p-b5dTs+us93d77Xr7JMBaU9e8P1nOe2+u6dZ9EDkfvfnZj1bRfW3q-W7H4LzfP4LeO5H3PvvC+rWLa7yvkva+y-St1vrQ-zfs+K-n3n62aqL96JnwriXr+TeorYwP0v2-x7xP13zJ0FWFSAK-yP1nxf1Pzf0gM+iH1gJ-0BxG3byQOxGXxAKh1-wQP-wFT40x27zwPQPZ0QMAOuyL2R2xwIItRtjJipx02f3wPAMe3BgNWdGYNS2P3gPYJ13P24On1QNAP4NnX73jS31IPF3INz0ILcDDWkKvxR0bXH1JmwJOxkM1yN1kzfyzQ5RoL5x3wkIX2LUL23xTwEP73BgVibxYL4LYNMP0OrTfgzhULoOsNdwNnD3cNwNkK13oOc1qAUwTU220MNyQyc1ZVCIz0DwiKjxvzrypU0ziKXQIzIMCK8MQKM1AXiI8OD2yIUN6WsyFkz1EMyN0OiN61KP60sNH2cOKLRS0Pt1eQSNX1R1v0hVqJ-HsN4LgKcIfSlywJ-ALwKJr0aItX3yXDLneQAF1uAAALOgAAExWKgGbQYBIHIAADkzIiBSAyAAACWwMAbgAAL3wHWNWD+FJGgHgGQDQEwFwEIG2IoGoAinAAAjOLADgDwDoAgDeAAGUAAHKAKAFYqgP4AAOncG4FFCyBoFFD2P2B+LIEUAEFYDIHQCgBRKJG5BxAhigD+HcGkAAFpBZ0AagyT6g4A-g4AyTHAcRHB3AyT0B7BmTzxpAkko53BoSQS8AABzH4rAeAPQAADUUL5FFOmAAE1wd4iAB3VYmARYvHbLJYqAOgQUxYmAOwCncIOYyIDorIGAMgVgIoqYqAn4fIsyAkokkk8kyk6k2k+kxk5k1k9kzknEbkv4Xk-koU6pL4syGAAQEEn4v4gE4EsEiEqE+ExsJEhQPE-wP4NEjErEnE5M1odErATE7ExQAAegRILIAFkBAsAsBiAjiySjiAAxIIEwIUrQLYmAaQAQMgCALAAM4U7gGUiUqU3ssUmAeUygOMZUlY1UtwLvRYrUnUvUygXkQ0406-To0TM0i0zNa0uwXhACUM8M4ZYM-YPciM-4wEtIUE8EyE0c+My0RMpgLMsAVM7gHMvMzMsyF8jMws4sssisqsms+sgQRswU5s8QNsjsrsgUnssAPsmASUkmKAmCkcsclUtUkmac2c3UqgRco0xI1chSdcyZcImMHckMsMoMvaY87gSMs84YC82M685MREn0B8p8sAD8-Mh89inErAIszIUs8sys6sushs+gJslssCzs7skUocuCsjRCuMsAccyctCnUGc7UzChczwJc3CtQgqAinpQkhWEio8sig8iisiqi086My8hShEqgO83EsyVirixy-YFyni78gSv84SwC0S4C8S9sySyC6S6YWShCocpC7gJS1CtzTU9S+c7C5c1QoHZUfSwsS8FSYyokY8sy3ciy34qy88mMq8uMOyj45MFitM3Mz8zi9M-Mjyvin8wS-8kS0Qfy0CwKiCwMwc0Kgc6CiKhS6Kqc1SjChKrSnCk0lKjeNKzEK9YikBPK-cg6Q87K-K6i6y+i0qhM5ipyqq181yokdy3isYfi38oSgCoCkC1szqqSnq-s+C6UgahioalSuKucrC8apKzwyY1kGa-UyLeaulHK5a8y8MyyqMoqmyhisqhyyq58uqt8tyhGr8xqry861qsSjq8C26-q3qh6u64cwalC4at6jSxKnSqaxYP6tYKOO2LK-wYGz40Gk8iG2i4q2y7aiq3a+G6qji985Ghqk6pq7yi6vyq6iSrqqCmCsKx6uUomicmK9C+Kj67SyajAmWam2wRwLvQG5CRmySFahmtawqtmqGra28na-YZy5G2q3m7i46ws4W9G3ytq8Wm64KgmmWgmyKxS4m16sANS96zS1Wlc3S+qamgfM8em1ofWocQ2mO421myQOikqm8mUWG7mtim2-mu2lGoWtGlql2zG667Gj23G+6uSp65ChWkmgO0alWia0Oym368071Dk-WaO2gUykGxalmmi5O9m6Gzm5EzOly22-awWx2gunyy6gK0u7q8u2Cvq+S56v22Kuu5W4Oxu5K9W1K1uzNJuIWTu2O04eOrusGgqpOvAFOjmi2rmq2vamqnOieh2nip2wu2erGoKhe6W5equqKtepWoO8mtWig6a-e0jPWOmha0ipapm3u8G-u6+we829Oy2oka23O8ez8yet+6e0W12ue7+qWmSv+uW1emu-2wOsmz6im3e8Bjc0jIQ3W5m3K2Bvuja1Oxi+y9BlMx+vmpG3O3B065qmesWohyWkKiu8K8h6u5S9e6hsakOnesBqmiBgVQWTKmBkyuBg25mxBzh2+tB++jB-hxGw6gW1+kRkWjG9qku4hqRpe-Gxen2l6hR+urer6won6qgammVSvbc7R1a3RuO-Ry+pBm+oeu+keh+nm-a7B+qqx9+sRwhr+yRz2shvQVxwBkazekBpu+htRxhgVTwZ1H8Y+7u+B9hgxyGzatOpikxvhuJp+wRl+zys6j+8RtJnG3+5xleuRxW3J4B2h0B+Qop6VVI8poJo2kJ0+sJ9a2prhmG3h1oTB+J5+nBpJ-B2xt2+ekhvGyu2RgByh9xvJkZgp1Rlu4piOP0oy6ZhO2ZiEM+yi8JwxqJ4xmJ0x5pgRixoRrZjplJ4uiWnp0hvp-+32k5oBmh5R76oYhKam1zX1LW+58+8ihB15xZoxhpz5pprOrBjZxJ9p0RghoF92n+0Fw5rJ+W+RqFpR7e2F43cZyFJwLRoGypvR9FhZ02up7h8qnF1Zsxg6-wI6olmxouux4Fsu3pylwmihmloZ6F+l7xuFjW9RiOO3QJtlx5oEZ5xOiJlB+pnhxpgV758x4Vyx0V52z++x9Jxer2lx6lwZ0mulrxiYlVve653pDVtYCp7VqgXVi+rlges2w1vlpM0e7O1pzZy1zp1Jm1kFg5mRqluVp1je4ZmF5Vxlq5lZDOFh3uthnRjhzF957F8N2JvF9ZqNwl1GgFkliVsl-Z6R2W5NgZ2uxRhu11kw91hhnNo+lFk+p5+Zk24Nnl5Z41x8wVhJ+2mNwF+tvZxx+1-p45+V51jtuhy53xtV3pXkaBrVtF6pjF7lpZ4estr5itlp35tpmt4lnZiRhNpt72x1ttjx-JlRsZ7N1DCnKO-t9l0Jzl4d5BkN3ljO8tsegl6d69sV61yV8lxN5t2V1tqhl985t9v-JlhLWm79vdgt4Joto9rFo1-lid01oV7Mi1yDq1rp+NqVilpNhD5d1N9tzx9d99zdz1glO2L91hnug9oNwD0dk9+8iN-FqtiD-O2t297pmjuDx9lN59s5jNt1rNtj6VXI+3XLAdnVodq+yJ1B0toT0DyNy96Nij2N0l+djJsFo5iFldtNxVztqwnxygCOyfSRW0wtnDmZvDkd496J093FsD0TvOqeiT8V3ZhxyzmV7JyFhVl1ljtDj91FCGJg9z3Dzzh57z-j3zj5-zk189n581v5mdut8L216Vuj6L2zpj19hlvQnt3DJmSGZ7bjqpwtmp-Dktwj3L4j-Ls1sjor0z2d0r+9pxqLp9pDhTpVpTur9DsbIihU7Dnjtrw9nzgjsNgzs9wL4z6t8Tm9sLu96Th9h1uTib9Nqbrt5T5zrd+oQytzxb1r3D9r1bzr9b0jnrrbwrq93bqDqjmDxt0bir8b05s7hzho7t2biODKu7vW39uZ-9nTg14DlZ97ozz7kz77yjuNv7hdzJ+jmzxj5DxTi7mbxL8LOahbmHv1ygANoEwEjgTL3T0NkDzb1H-rr7kLvb6DhtnHqzlthjttarlD2r6o6miLSnVLmZ2n1QBgfdnRqX+np7rLtb5ngL1n3r4LvB0Lrnizu13Hyr1Cp0QXonxz8H0nvHYXKgUHGA4J+XmX9L8+23hnxHsdojtZi9tHnbjnn7rH7nyLwHk7w3wn87k3y70XmXdTkWPcx3+3qPunmXxXxnpH8dt3grtn9Hr3zH8ziL3X3nvHl6wPyb0HsApz0Xi3tYLjxa6Ppbm3uPp3oDl37rlPvr9X4R5Jkrg72Do7pd-HgXoPov8Q03lT1DcPhPbNSv2vmPsMx3hP53wTt7pvt7kVwb9vqTzvgH+D-X3vwv+LoIofhLEfrsMf2Bqvh7yX2vmf+vufuG9XqdjX6xzPud7P8rjf8bgvkHnfy0s3piQeTVynk-jl4-ufxW5K8XuKvPLh9zT6e9NenPX7r7xz5jcA+6oI3sHzB6h8t2+OXeFHD-4T9q+Z-aXnXwE5+cNuqvETttzE4Z8zOj-MrrRxf6ICNgyA-voMTQHsdiCoxMJKDX-5-tAB+Ai-oQJy7EDwBavJfhj0oHDdDu6-WTohzf72cP+JfLdtMXzzsDx++AyfiCWn7ADE+DfAQSj1IEe9yB0A73ln2oEydjuUgpAX31kGD8ru7HWIgMjngcCcBp-B5uoL46aCr+wnStmQLv5t9JO1HNfou3Bb59zB2-UZglz34Co1O-1bbDXxUG4DnBQA1wbPyIHz9J24Hbwds326r9-uAQ6zkEPoEWDQhu-awZMh6IR9sBsQpwQ7wSEAc3ByQ6-hAJb7-MYBPvHXs-0kH88-UdnOLoUM-7hDagrAm0lq04Fw9uBCvDQUkP4EpCSOt-VvhkO15P8aB7Qnvp0IYGWDmBoaLAXwj8Jy9HBAAnYTwPGGX86hHg93pAP0H39RBHfbIXr1f7BD3+PQuQZ621DsC9csxUYXbziFVCDhiQo4ZMPqFCDyOIgoblcJ54ICzB+QkIRc1Y7FDM0thbnBpyn67CuB+wsYT8L4H6cphN-NIbMK16wDWhiw0wR0OkHdCoRYQmEaRnMIIJ7Byg+nqoJcE1CJhGI-4boLOHpDcRLQhYSYO755DV2zHB4VYM1qtpD+1vPAbSM+Gx9vhDI34UyJOGp9GhxXXwdjz960DwRvImrpmxJ59CO8o-EUfEIqF7CYhqIqUeiK67aCF+MwpoYYKoEjcchfPZYcSLXb8j1hVaeweHiP4oiPhlQiUUaIR7SjTRmIhocIIoHAishoI-3qqK6GOjSRRQiOq4SZxvCPRsvQ0fH0OEmjXuzIzwXoLZHNCjBNom4XQLVFC8NRIvLdj4Swrq53hSY0USmLRHZcZRhnFkfKOX6Ki4BbQwkfaLuEyCnRmo8kZiD7RlCHB+o5EcmIIF1j-RGY04U2KBEr8-B1w3PpvxWEFDoxvQ3sfnjBxqhqRlYukdUN9FpiwBOgzMayJxE5jrR4g20Xnz9oOi+Ry4x4Y6DlwxgK+W48UYiMlG7ixx6Y2Uc3yDEGCH+Yg-wfmIjGrDuxJYz1unh-CPjEx2418fqz9EfiGxh4qccGJnFKj4B4YokZ2JJGocYxpY+PMKPKFiivRL4n0TBL3HI9zR2Iy0b+JBHKilhPIyMdeKwkrjNauE10O6JHFQTiJbzPTuOM-GL9ARSElsfiK5GBDLxGEqMYxNvGblkCCY9ic+LUE7iSJ74-ceRKC7HirRf4ucWCPQkQj7hN4gUVuzwzOh4c+Ez0QaOrGjjleZE1IapMomXDQxNE9sXRKAl6TnRCWRTC6ARHyShxIwxMbwKUlWTphFEhUZkNnFhiVR2kwscb1QE9jqa7uSoJuMglyT6Rb4yycn2sleC1JVE+yahPCkdidJXYlyTFK3b+4ohJkqsXqM4nFtuJcElno2O-EXCQxoUhydyNEn5TMJwvHrNTTDw6iypxeCSVYK2hops0WwG2G1gEAAA3NqgACEvQAACXbJ0AvchU6op7G9gTYJMAECABNOmlegAAauQD1KGkliqxdYpsTeIPkJp5ALYq4AuJXEoAmIQ0kAA";

    var gameRunner = /** @class */ (function () {
        function gameRunner(gameContainer, gameProperties, app) {
            var _this = this;
            this.tileContainer = [];
            this.generateObjects = new objectGenerator();
            this.targetFps = 30;
            this.fpsLimiter = 0;
            this.frameDelay = 0;
            this.app = new PIXI$1.Application();
            this.objContainer = new objectContainer();
            gameProperties.applySettings(this.app);
            this.gameContainerElement = document.getElementById(gameContainer);
            this.gameContainerElement.appendChild(this.app.view);
            //this.graphicsModule = new graphics(this.canvasContext);
            this.logicModule = new roomEvent(this.gameContainerElement, this.objContainer);
            this.app.ticker.add(function (delta) {
                if (_this.fpsLimiter == 0) {
                    _this.logicModule.deltaTime = delta;
                    roomEvent.tick();
                    _this.logicModule.queryKey();
                    _this.objContainer.loopThrough(_this.logicModule);
                    _this.objContainer.purgeObjects();
                    _this.fpsLimiter = _this.frameDelay;
                    if (_this.logicModule.useCamera) {
                        _this.app.stage.pivot.x = _this.logicModule.cameraX;
                        _this.app.stage.pivot.y = _this.logicModule.cameraY;
                        _this.app.stage.position.x = _this.app.renderer.width / 2;
                        _this.app.stage.position.y = _this.app.renderer.height / 2;
                    }
                    for (var _i = 0, _a = _this.tileContainer; _i < _a.length; _i++) {
                        var t = _a[_i];
                        if (roomEvent.getTicks() % t.tileStepTime == 0) {
                            t.animate();
                        }
                    }
                }
                if (_this.fpsLimiter > 0) {
                    _this.fpsLimiter--;
                }
            });
            this.loadRoom(JSON.parse(LZString.decompressFromEncodedURIComponent(room1)));
        }
        gameRunner.prototype.loadRoom = function (layers) {
            this.objContainer.removeObjects();
            for (var _i = 0, layers_1 = layers; _i < layers_1.length; _i++) {
                var layer_1 = layers_1[_i];
                var pixiContainerLayer = new PIXI$1.Container();
                for (var _a = 0, _b = layer_1.metaObjectsInLayer; _a < _b.length; _a++) {
                    var objMeta = _b[_a];
                    if (objMeta.isPartOfCombination == false) {
                        var genObj = this.generateObjects.generateObject(objMeta.name, objMeta.x, objMeta.y, objMeta.tile);
                        if (genObj != null) {
                            if (genObj.isTile == false) {
                                this.objContainer.addObject(genObj, layer_1.zIndex);
                                pixiContainerLayer.addChild(genObj.g);
                            }
                            else {
                                this.tileContainer.push(genObj);
                                pixiContainerLayer.addChild(genObj.g);
                            }
                        }
                    }
                }
                this.app.stage.addChild(pixiContainerLayer);
            }
            /*for(var i=0; i<roomData.length; i++){
                var objDTO: objectMetaData = roomData[i];
                if(objDTO.isPartOfCombination == false){
                    let genObj:objectBase = this.generateObjects.generateObject(objDTO.name, objDTO.x, objDTO.y, objDTO.tile);
                    if(genObj != null){
                        this.objContainer.addObject(genObj, 0);
                        this.app.stage.addChild(genObj.g);
                    }
                }
            }*/
        };
        return gameRunner;
    }());

    var logger = /** @class */ (function () {
        function logger() {
        }
        logger.initialize = function () {
            if (logger.initialized == false) {
                document.body.addEventListener("keyup", logger.listenForStartCommand);
                logger.container.style.position = "absolute";
                logger.container.style.width = "100%";
                logger.container.style.height = "25%";
                logger.container.style.backgroundColor = "rgba(0,0,0,0.6)";
                logger.container.style.color = "white";
                logger.container.style.top = "0px";
                logger.container.style.pointerEvents = "none";
                logger.container.style.display = "none";
                document.body.appendChild(logger.container);
                logger.initialized = true;
            }
        };
        logger.showMessage = function () {
            var s = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                s[_i] = arguments[_i];
            }
            logger.container.style.display = "inline";
            var newLog = "";
            s.forEach(function (text) {
                newLog += text;
            });
            this.container.innerHTML = newLog;
        };
        logger.listenForStartCommand = function (e) {
            var _this = this;
            if (e.key == "Escape" && logger.showDebugger) {
                logger.showDebugger = false;
                logger.container.style.display = "none";
            }
            if (logger.showDebugger == false) {
                logger.inputWaiter = setTimeout(function () {
                    _this.debugPresses = 0;
                }, 1000);
                if (e.key == "%") {
                    clearTimeout(logger.inputWaiter);
                    logger.debugPresses += 1;
                    if (logger.debugPresses >= 7) {
                        logger.debugPresses = 0;
                        logger.showDebugger = true;
                        logger.container.style.display = "inline";
                    }
                }
            }
        };
        logger.initialized = false;
        logger.container = document.createElement("div");
        logger.inputWaiter = null;
        logger.debugPresses = 0;
        logger.showDebugger = false;
        return logger;
    }());

    (function () {
        var app = new PIXI.Application();
        var gameProperties = new gameSettings();
        gameProperties.stretchToWindow = true;
        new resourcesHand(app, function () {
            new gameRunner("game", gameProperties, app);
        });
        logger.initialize();
    })();

}(PIXI));
