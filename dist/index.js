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
            this.app.renderer.backgroundColor = 0xFFF;
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
            this.ticks = 0;
            this.objContainer = objContainer;
            this.container = con;
            this.keysDown = {};
            this.b = new barin();
            this.container.addEventListener("mousemove", this.mouseMoveListener.bind(this));
            document.addEventListener("keydown", this.keyDownListener.bind(this), false);
            document.addEventListener("keyup", this.keyUpListener.bind(this), false);
        }
        roomEvent.prototype.tick = function () {
            if (this.ticks >= Number.MAX_VALUE) {
                this.ticks = 0;
            }
            this.ticks++;
        };
        roomEvent.prototype.getTicks = function () {
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

    var movementOperations = /** @class */ (function () {
        function movementOperations() {
        }
        movementOperations.moveByForce = function (target, force, collisionNames, objContainer) {
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
            for (var i = 0; i < Math.abs(magnitude); i += iteretorSize) {
                //target.collisionBox.shrink(0, 1);
                target.g.x += iteretorSize * sign;
                if (objectBase.objectsThatCollideWithKeyObjectName[target.objectName] != null) {
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
                }
                var collisionTarget = this.boxIntersectionSpecific(target, target.collisionBox, collisionNames, objContainer);
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
                    break;
                }
            }
            //Sticky draging
            if (target.stickyness > 0) {
                var checkDistance = Math.abs(magnitude) + 2;
                var stickyCheck_1;
                if (sign > 0) {
                    //Moving right, check left
                    stickyCheck_1 = new boxCollider(target.collisionBox.x - checkDistance, target.collisionBox.y, checkDistance, target.collisionBox.height);
                }
                else {
                    //Moving left, check right
                    stickyCheck_1 = new boxCollider(target.collisionBox.x - target.collisionBox.width, target.collisionBox.y, checkDistance, target.collisionBox.height);
                }
                objContainer.foreachObjectType(objectBase.objectsThatCollideWithKeyObjectName[target.objectName], function (testCollisionWith) {
                    if (sign > 0) {
                        //Moving right
                        if (testCollisionWith.g.x + testCollisionWith.collisionBox.x + testCollisionWith.collisionBox.width < target.g.x + target.collisionBox.x + target.collisionBox.width && internalFunction.intersecting(target, stickyCheck_1, testCollisionWith)) {
                            testCollisionWith.g.x = target.g.x - testCollisionWith.collisionBox.x - testCollisionWith.collisionBox.width;
                        }
                    }
                    else {
                        //Moving left
                        if (testCollisionWith.g.x > target.g.x && internalFunction.intersecting(target, stickyCheck_1, testCollisionWith)) {
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
            for (var i = 0; i < Math.abs(magnitude); i += iteretorSize) {
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
                }
                var collisionTarget = this.boxIntersectionSpecific(target, target.collisionBox, collisionNames, objContainer);
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
                    break;
                }
            }
            //Sticky draging
            if (target.stickyness > 0) {
                var checkDistance = Math.abs(magnitude) + 2;
                var stickyCheck_2;
                if (sign > 0) {
                    //Moving down, check up
                    stickyCheck_2 = new boxCollider(target.collisionBox.x + 1, target.collisionBox.y - checkDistance, target.collisionBox.width - 2, checkDistance);
                }
                else {
                    //Moving up, check down
                    stickyCheck_2 = new boxCollider(target.collisionBox.x + 1, target.collisionBox.y + target.collisionBox.height, target.collisionBox.width - 2, checkDistance);
                }
                objContainer.foreachObjectType(objectBase.objectsThatCollideWithKeyObjectName[target.objectName], function (testCollisionWith) {
                    if (sign > 0) {
                        //Moving down
                        if (testCollisionWith.g.y + testCollisionWith.collisionBox.y + testCollisionWith.collisionBox.height < target.g.y + target.collisionBox.y + target.collisionBox.height && internalFunction.intersecting(target, stickyCheck_2, testCollisionWith)) {
                            testCollisionWith.g.y = target.g.y - testCollisionWith.collisionBox.y - testCollisionWith.collisionBox.height;
                        }
                    }
                    else {
                        //Moving up
                        if (testCollisionWith.g.y > target.g.y && internalFunction.intersecting(target, stickyCheck_2, testCollisionWith)) {
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
            this.stickyness = 0;
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
            this.stickyness = 0.0;
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
                    if (objectBase.objectsThatCollideWithKeyObjectName[collNames[i]] == null) {
                        objectBase.objectsThatCollideWithKeyObjectName[collNames[i]] = new Array();
                    }
                    objectBase.objectsThatCollideWithKeyObjectName[collNames[i]].push(this.objectName);
                    this.collisionTargets.push(collNames[i]);
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
            var tempG = newGraphics(new PIXI.Graphics());
            var oldX = this.g.x;
            var oldY = this.g.y;
            this._g = tempG;
            this._g.x = oldX;
            this._g.y = oldY;
        };
        objectBase.prototype.logic = function (l) {
            movementOperations.moveByForce(this, this._force, this.collisionTargets, l.objContainer);
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
            return _this;
        }
        movingBlockHori.prototype.logic = function (l) {
            _super.prototype.logic.call(this, l);
            //super.setNewForceAngleMagnitude(calculations.degreesToRadians(180), 3);
            if (this.switch) {
                _super.prototype.setNewForce.call(this, 1, 0);
            }
            else {
                _super.prototype.setNewForce.call(this, -1, 0);
            }
            if (l.getTicks() % 20 == 0) {
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
            _this.stickyness = 1;
            _super.prototype.setCollision.call(_this, 0, 0, 16, 16);
            _super.prototype.style.call(_this, function (g) {
                g.beginFill(0x000000);
                g.drawRect(0, 0, 16, 16);
                g.endFill();
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
            if (l.getTicks() % 55 == 0) {
                this.switch = !this.switch;
            }
        };
        movingBlockVert.objectName = "movingBlockVert";
        return movingBlockVert;
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
            _super.prototype.setCollision.call(_this, 0, 0, 16, 16);
            _super.prototype.style.call(_this, function (g) {
                g.beginFill(0xFF3e50);
                g.drawRect(0, 0, 16, 16);
                g.endFill();
                return g;
            });
            _super.prototype.addCollisionTarget.call(_this, block.objectName, movingBlockHori.objectName, movingBlockVert.objectName);
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
                _super.prototype.addForceAngleMagnitude.call(this, calculations.degreesToRadians(180), 0.8);
            }
            if (l.checkKeyHeld("d")) {
                _super.prototype.addForceAngleMagnitude.call(this, calculations.degreesToRadians(0), 0.8);
            }
            if (l.checkKeyPressed("w")) {
                _super.prototype.addForceAngleMagnitude.call(this, calculations.degreesToRadians(90), 12);
            }
            this.force.limitHorizontalMagnitude(this.maxRunSpeed);
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

    var room1 = "NobwRAHmBcDMBMAaMBPGDkHsBGArApgMYAuAwgDYCGAztQHKUC2+MYjmAbgJYB2A5gCFymQgGsAavgBOxMAF9E4KHCSoYAFgAcWPETJVaDZq3bd+QkROmyFS9KrTQAbOp0ESFGvSYtobTryCwmKSMvKKkPbIjpoADG56noY+JgHmwVZhtpEq0TAAnE4JHgbexn6mgRYh1uF2uWrQAIxNqjju+l5Gvv5mQZahNhHKGI2t2mDtiaXdqX3VmUP1o45N6q6TuiVdKRVp-TVZw1FjTvGbHUllPZXpA7XZylp5zWfFncnlvVUZg3U5LheTTeF2mOy+twOi3+yjiQJBU22nxu+wWf0eBSKp3OiI+1zmP3uR3qLQcMGBOK2eNme3mvwex2a8AmqwRVKuNO+d0OSxyaw2rMplxmuy5UPRjOejVGuI5oshaIZ9UB0ra7JFENR9OJOThqvecs1dKJvOUhReMvV4JRxp5MPJrQtauF1oJ3OhGOcApgKtlGpthLtnpVMSFYORbvFSt150cvqtEdpgY9jJDDud4fxSfdEuV3qZEz9ruzUZ1sNj5OZBv9kcVZfJIMF1eLYrrpvJAHYsU3QUis63te3ml2getm4mByb7cPu5XCwn+wrB9OmiOxo7e9T5Vqp57V7PoObN4aAzno8p9y89UWJ0vd4zL414y7bzugw+144pTfF2+UyTPxOH9OTvd8SUbICFxAv9cz5Md9WPGsSzbFcqwQ4Dt1tf8+TQuMNgwo1k1gi94Lw8dfyw4jyVImBrygzCiPPOcgTQgjT1LId+RY+cXwoxj62aGjmg3Nja2XT0j1WET6IhLhMHkABdIA";

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

    var gameRunner = /** @class */ (function () {
        function gameRunner(gameContainer, gameProperties, app) {
            var _this = this;
            this.generateObjects = new objectGenerator();
            this.targetFps = 30;
            this.app = new PIXI$1.Application();
            this.objContainer = new objectContainer();
            gameProperties.applySettings(this.app);
            this.gameContainerElement = document.getElementById(gameContainer);
            this.gameContainerElement.appendChild(this.app.view);
            //this.graphicsModule = new graphics(this.canvasContext);
            this.logicModule = new roomEvent(this.gameContainerElement, this.objContainer);
            this.app.ticker.add(function () {
                _this.logicModule.tick();
                _this.logicModule.queryKey();
                _this.objContainer.loopThrough(_this.logicModule);
                _this.objContainer.purgeObjects();
            });
            this.loadRoom(JSON.parse(LZString.decompressFromEncodedURIComponent(room1)));
            //this.loadRoom(JSON.parse(LZString.decompressFromUTF16(room1)));
        }
        gameRunner.prototype.loadRoom = function (roomData) {
            console.log("Import this data: ", roomData);
            this.objContainer.removeObjects();
            for (var i = 0; i < roomData.length; i++) {
                var objDTO = roomData[i];
                var genObj = this.generateObjects.generateObject(objDTO.objectClassName, objDTO.x, objDTO.y);
                if (genObj != null) {
                    this.objContainer.addObject(genObj, 0);
                    this.app.stage.addChild(genObj.g);
                }
            }
        };
        return gameRunner;
    }());

    var preloader = /** @class */ (function () {
        function preloader(app) {
            var _this = this;
            this.objectGen = new objectGenerator();
            this.app = app;
            var allObjects = this.objectGen.getAvailibleObjects();
            allObjects.forEach(function (objGen) {
                var obj = objGen(0, 0);
                var spriteSheet = obj.spriteSheet;
                if (spriteSheet != null) {
                    _this.app.loader.add(spriteSheet === null || spriteSheet === void 0 ? void 0 : spriteSheet.resourceName, "resources\\" + (spriteSheet === null || spriteSheet === void 0 ? void 0 : spriteSheet.resourceName));
                }
            });
            this.app.loader.load(function (e) {
                console.log("Done loading", e);
            });
        }
        return preloader;
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
        logger.inputWaiter = -1;
        logger.debugPresses = 0;
        logger.showDebugger = false;
        return logger;
    }());

    (function () {
        var app = new PIXI.Application();
        new preloader(app);
        var gameProperties = new gameSettings();
        gameProperties.stretchToWindow = true;
        new gameRunner("game", gameProperties, app);
        logger.initialize();
    })();

}(PIXI));
