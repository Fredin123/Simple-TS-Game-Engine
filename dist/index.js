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

    var brain = /** @class */ (function () {
        function brain() {
        }
        brain.angleBetweenPoints = function (dx, dy) {
            return Math.atan2(dy, dx) + Math.PI;
        };
        brain.distanceBetweenPoints = function (x1, y1, x2, y2) {
            return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
        };
        return brain;
    }());

    var gameCamera = /** @class */ (function () {
        function gameCamera() {
            this.isInUse = true;
            this.cameraX = 0;
            this.cameraY = 0;
            this.camMovementSpeedX = 0.08;
            this.camMovementSpeedY = 0.08;
            this.targetX = 0;
            this.targetY = 0;
            this.cameraOffsetX = 0;
            this.cameraOffsetY = 0;
        }
        gameCamera.prototype.getIsInUse = function () {
            return this.isInUse;
        };
        gameCamera.prototype.getX = function () {
            return this.cameraX;
        };
        gameCamera.prototype.getY = function () {
            return this.cameraY;
        };
        gameCamera.prototype.moveCamera = function () {
            var angle = brain.angleBetweenPoints((this.cameraX - this.targetX), (this.cameraY - this.targetY));
            var distance = brain.distanceBetweenPoints(this.cameraX, this.cameraY, this.targetX, this.targetY);
            this.cameraX += Math.cos(angle) * distance * this.camMovementSpeedX;
            this.cameraY += Math.sin(angle) * distance * this.camMovementSpeedY;
        };
        gameCamera.prototype.setMoveSpeedX = function (moveSpeed) {
            this.camMovementSpeedX = moveSpeed;
        };
        gameCamera.prototype.setMoveSpeedY = function (moveSpeed) {
            this.camMovementSpeedY = moveSpeed;
        };
        gameCamera.prototype.setTarget = function (tx, ty) {
            this.targetX = tx;
            this.targetY = ty;
        };
        return gameCamera;
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
            this.camera = new gameCamera();
            this.objContainer = objContainer;
            this.container = con;
            this.keysDown = {};
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
            if (Math.abs(force.Dx) <= 0.01) {
                force.Dx = 0;
            }
            if (Math.abs(force.Dy) <= 0.01) {
                force.Dy = 0;
            }
            var xdiff = force.Dx;
            var ydiff = force.Dy;
            this.moveForceHorizontal(Math.round(xdiff), target, collisionNames, objContainer);
            this.moveForceVertical(Math.round(ydiff), target, collisionNames, objContainer);
            force.Dx *= target.airFriction;
            force.Dy *= target.airFriction;
            if (target.gravity != vector.null) {
                force.Dx += target.gravity.Dx;
                force.Dy += target.gravity.Dy;
                target.gravity.increaseMagnitude(target.weight);
            }
        };
        movementOperations.moveForceHorizontal = function (magnitude, target, collisionNames, objContainer) {
            var _this = this;
            if (magnitude == 0)
                return;
            var sign = magnitude > 0 ? 1 : -1;
            var objectsThatWereCollidingThisObjectWhileMoving = new Array();
            var collisionTarget = objectBase.null;
            var _loop_1 = function (i) {
                objectsThatWereCollidingThisObjectWhileMoving.length = 0;
                target.g.x += sign;
                if (objectBase.objectsThatCollideWith[target.objectName] != null) {
                    //Push object
                    objContainer.foreachObjectType(objectBase.objectsThatCollideWith[target.objectName], function (testCollisionWith) {
                        if (internalFunction.intersecting(target, target.collisionBox, testCollisionWith)) {
                            collisionTarget = _this.pushObjectHorizontal(target, testCollisionWith, sign, objContainer);
                            if (collisionTarget == objectBase.null) {
                                target.force.Dx *= 1 - testCollisionWith.weight;
                            }
                            /*testCollisionWith.g.x += sign;
                            objContainer.foreachObjectType(testCollisionWith.collisionTargets, (testCollision: iObject)=>{
                                if(testCollision.objectName != target.objectName &&
                                    internalFunction.intersecting(testCollisionWith, testCollisionWith.collisionBox, testCollision)){
                                        testCollisionWith.g.x += sign*-1;
                                        collisionTarget = testCollisionWith;
                                }
                                return false;
                            });*/
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
                        objContainer.foreachObjectType(objectBase.objectsThatCollideWith[target.objectName], function (testCollisionWith) {
                            //console.log("Check object: ", testCollisionWith);
                            if (sign > 0) {
                                //Move right
                                if (internalFunction.intersecting(target, stickyCheck_1, testCollisionWith)) {
                                    if (testCollisionWith._hasBeenMoved_Tick < roomEvent.getTicks()) {
                                        objectsThatWereCollidingThisObjectWhileMoving.push(testCollisionWith);
                                        testCollisionWith.g.x += sign;
                                        if (i >= Math.abs(magnitude) - 1) {
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
                                        testCollisionWith.g.x += sign;
                                        if (i >= Math.abs(magnitude) - 1) {
                                            testCollisionWith._hasBeenMoved_Tick = roomEvent.getTicks();
                                        }
                                    }
                                }
                            }
                            return false;
                        });
                    }
                }
                if (collisionTarget == objectBase.null) {
                    collisionTarget = this_1.boxIntersectionSpecific(target, target.collisionBox, collisionNames, objContainer);
                }
                if (collisionTarget != objectBase.null) {
                    sign *= -1;
                    target.g.x += 1 * sign;
                    objectsThatWereCollidingThisObjectWhileMoving.forEach(function (updaterObject) {
                        updaterObject.g.x += 1 * sign;
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
                objContainer.foreachObjectType(objectBase.objectsThatCollideWith[target.objectName], function (testCollisionWith) {
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
        movementOperations.pushObjectHorizontal = function (pusher, objectBeingPushed, sign, objContainer) {
            var _this = this;
            var collided = false;
            if (internalFunction.intersecting(pusher, pusher.collisionBox, objectBeingPushed)) {
                if (objectBeingPushed.collisionTargets.length == 0) {
                    return pusher;
                }
                objectBeingPushed.g.x += sign;
                objContainer.foreachObjectType(objectBeingPushed.collisionTargets, function (testCollision) {
                    if (testCollision.objectName != pusher.objectName &&
                        internalFunction.intersecting(objectBeingPushed, objectBeingPushed.collisionBox, testCollision)
                        && _this.pushObjectHorizontal(objectBeingPushed, testCollision, sign, objContainer) != objectBase.null) {
                        objectBeingPushed.g.x += sign * -1;
                        collided = true;
                    }
                    return false;
                });
            }
            if (collided) {
                return objectBeingPushed;
            }
            return objectBase.null;
        };
        movementOperations.moveForceVertical = function (magnitude, target, collisionNames, objContainer) {
            if (magnitude == 0)
                return;
            var sign = magnitude > 0 ? 1 : -1;
            var objectsThatWereCollidingThisObjectWhileMoving = new Array();
            var collisionTarget = objectBase.null;
            var _loop_2 = function (i) {
                target.g.y += sign;
                if (objectBase.objectsThatCollideWith[target.objectName] != null) {
                    //Moving objects
                    objContainer.foreachObjectType(objectBase.objectsThatCollideWith[target.objectName], function (testCollisionWith) {
                        if (internalFunction.intersecting(target, target.collisionBox, testCollisionWith)) {
                            testCollisionWith.g.y += sign;
                            objContainer.foreachObjectType(testCollisionWith.collisionTargets, function (testCollision) {
                                if (testCollision.objectName != target.objectName &&
                                    internalFunction.intersecting(testCollisionWith, testCollisionWith.collisionBox, testCollision)) {
                                    testCollisionWith.g.y += sign * -1;
                                    collisionTarget = testCollisionWith;
                                }
                                return false;
                            });
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
                        objContainer.foreachObjectType(objectBase.objectsThatCollideWith[target.objectName], function (testCollisionWith) {
                            //console.log("Check object: ", testCollisionWith);
                            if (sign > 0) {
                                //Move down
                                if (internalFunction.intersecting(target, stickyCheck_2, testCollisionWith)) {
                                    if (testCollisionWith._hasBeenMoved_Tick < roomEvent.getTicks()) {
                                        objectsThatWereCollidingThisObjectWhileMoving.push(testCollisionWith);
                                        testCollisionWith.g.y += sign;
                                        if (i >= Math.abs(magnitude) - 1) {
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
                                        testCollisionWith.g.y += sign;
                                        if (i >= Math.abs(magnitude) - 1) {
                                            testCollisionWith._hasBeenMoved_Tick = roomEvent.getTicks();
                                        }
                                    }
                                }
                            }
                            return false;
                        });
                    }
                }
                //This has to be more optimized
                if (collisionTarget == objectBase.null) {
                    collisionTarget = this_2.boxIntersectionSpecific(target, target.collisionBox, collisionNames, objContainer);
                }
                if (collisionTarget != objectBase.null) {
                    sign *= -1;
                    target.g.y += sign;
                    objectsThatWereCollidingThisObjectWhileMoving.forEach(function (updaterObject) {
                        updaterObject.g.y += sign;
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
                    target.force.Dx *= collisionTarget.friction;
                    return "break";
                }
            };
            var this_2 = this;
            for (var i = 0; i < Math.abs(magnitude); i += 1) {
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
                objContainer.foreachObjectType(objectBase.objectsThatCollideWith[target.objectName], function (testCollisionWith) {
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
        movementOperations.boxIntersectionSpecific = function (initiator, boxData, targetObjects, objContainer) {
            return this.boxIntersectionSpecificClass(initiator, boxData, targetObjects, "", objContainer);
        };
        //Collision
        movementOperations.boxIntersectionSpecificClass = (new /** @class */ (function () {
            function class_1() {
                this.inc = function (initiator, boxData, targetObjects, excludeObject, objContainer) {
                    return objContainer.foreachObjectType(targetObjects, function (testCollisionWith) {
                        if (testCollisionWith.objectName != excludeObject && internalFunction.intersecting(initiator, boxData, testCollisionWith)) {
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
            this.moveCollisionTargets = [];
            this.force = new vector(0, 0);
            this._hasBeenMoved_Tick = 0;
            this.objectName = "";
            this.collisionBox = new boxCollider(0, 0, 0, 0);
            this.x = 0;
            this.y = 0;
        }
        nulliObject.prototype.addMoveCollisionTarget = function () {
            var collNames = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                collNames[_i] = arguments[_i];
            }
            throw new Error("Method not implemented.");
        };
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

    var objectBase = /** @class */ (function () {
        function objectBase(x, y, childObjectName) {
            this.isTile = false;
            this.tileStepTime = -1;
            this.ID = uidGen.new();
            this._g = new PIXI.Container();
            this.gSprites = {};
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
                    if (objectBase.objectsThatCollideWith[collNames[i]] == null) {
                        objectBase.objectsThatCollideWith[collNames[i]] = new Array();
                    }
                    if (objectBase.objectsThatCollideWith[collNames[i]].indexOf(this.objectName) == -1) {
                        objectBase.objectsThatCollideWith[collNames[i]].push(this.objectName);
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
            if (this.gSprites[id] != null && this.gSprites[id] instanceof PIXI$1.AnimatedSprite) {
                this.gSprites[id].stop();
            }
        };
        objectBase.prototype.playSprite = function (id) {
            if (this.gSprites[id] != null && this.gSprites[id] instanceof PIXI$1.AnimatedSprite) {
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
            if (this.gSprites[id] != null && this.gSprites[id] instanceof PIXI$1.AnimatedSprite) {
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
        objectBase.objectsThatCollideWith = {};
        objectBase.objectsThatMoveWith = {};
        return objectBase;
    }());

    var block = /** @class */ (function (_super) {
        __extends(block, _super);
        function block(xp, yp) {
            var _this = _super.call(this, xp, yp, block.objectName) || this;
            _this.switch = false;
            _this.friction = 0.986;
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
            _this.stickyRightSide = true;
            _this.stickyLeftSide = true;
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

    //import anime from 'animejs';
    var grass = /** @class */ (function (_super) {
        __extends(grass, _super);
        function grass(xp, yp) {
            var _this = _super.call(this, xp, yp, grass.objectName) || this;
            _this.switch = false;
            _this.friction = 0.0;
            _this.life = 1000;
            _this.grass = null;
            _this.grassAngle = calculations.degreesToRadians(270);
            _this.wind = 0;
            _super.prototype.setCollision.call(_this, 0, 0, 0, 0);
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI$1.Graphics();
                newGraphics.beginFill(0xFF3e50);
                newGraphics.drawRect(0, 0, 128, 128);
                newGraphics.endFill();
                g.addChild(newGraphics);
                _this.grass = new PIXI$1.Graphics();
                _this.grass.lineStyle(2, 0x00FF00, 1, 1);
                _this.grass.x = 16;
                _this.grass.y = 0;
                _this.grass.moveTo(0, 128);
                _this.grass.lineTo(0, 64);
                g.addChild(_this.grass);
                g.calculateBounds();
                return g;
            });
            return _this;
            /*anime({
                targets: battery,
                charged: '100%',
                cycles: 130,
                round: 1,
                easing: 'linear',
                elasticity: 600,
                update: function() {
                  console.log(JSON.stringify(battery));
                }
            });*/
        }
        grass.prototype.logic = function (l) {
            this.grassAngle + calculations.degreesToRadians(-20 + Math.random() * 20);
            if (calculations.radiansToDegrees(this.grassAngle) > 270) {
                this.grassAngle *= 0.99;
            }
            else if (calculations.radiansToDegrees(this.grassAngle) < 270) {
                this.grassAngle *= 1.01;
            }
            if (this.grass != null) {
                this.grass.clear();
                this.grass.lineStyle(2, 0x00FF00, 1, 1);
                this.grass.x = 16;
                this.grass.y = 0;
                this.grass.moveTo(Math.cos(this.grassAngle) * 32, 32 + Math.sin(this.grassAngle) * 32);
                this.grass.lineTo(0, 32);
            }
            if (l.checkKeyHeld("a")) {
                this.wind = 12;
            }
            if (this.wind > 0) {
                this.grassAngle += calculations.degreesToRadians(this.wind);
                this.wind *= 0.9;
                if (this.wind <= 0.01) {
                    this.wind = 0;
                }
            }
        };
        grass.objectName = "grass";
        return grass;
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

    var mio = /** @class */ (function (_super) {
        __extends(mio, _super);
        function mio(xp, yp) {
            var _this = _super.call(this, xp, yp, mio.objectName) || this;
            _this.airFriction = 0.93;
            _this.gravity = new vectorFixedDelta(calculations.degreesToRadians(270), 0); //vector.fromAngleAndMagnitude(calculations.degreesToRadians(270), 0.6);
            _this.weight = 0.09;
            _this.maxRunSpeed = 13;
            _this.currentSprite = "catReady";
            _this.currentSpriteObj = null;
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
            _super.prototype.setCollision.call(_this, 0, 0, 128, 128);
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI$1.Graphics();
                newGraphics.beginFill(0xFF3e50);
                newGraphics.drawRect(0, 0, 128, 128);
                newGraphics.endFill();
                g.addChild(newGraphics);
                g.calculateBounds();
                return g;
            });
            _super.prototype.addCollisionTarget.call(_this, block.objectName, movingBlockHori.objectName, movingBlockVert.objectName, dummySandbag.objectName);
            //super.addMoveCollisionTarget(dummySandbag.objectName);
            //super.addMoveCollisionTarget(dummySandbag.objectName);
            _super.prototype.addSprite.call(_this, new animConfig({
                animationName: "catReady",
                scaleX: 3,
                scaleY: 3,
                speed: 0.3,
                x: 64,
                y: 0,
                anchorX: 0.5,
                anchorY: 0.34,
            }));
            return _this;
        }
        mio.prototype.logic = function (l) {
            _super.prototype.logic.call(this, l);
            if (Math.floor(this.force.Dy) == 0 && Math.floor(this.gravity.magnitude) == 0) {
                this.hasJumped = false;
            }
            if (this.climbing == false) {
                if ((l.checkKeyHeld("a") || l.checkKeyHeld("d")) && this.force.Dx == 0 && Math.floor(this.force.Dy) > 0 && this.canClimb && this.falling == false && this.hasJumped) {
                    this.climbing = true;
                    this.gravity.magnitude = 0;
                    this.climbingTimer = 60;
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
            if (l.checkKeyHeld("a") && this.actionWait == 0) {
                _super.prototype.addForceAngleMagnitude.call(this, calculations.degreesToRadians(180), 1);
            }
            if (l.checkKeyHeld("d") && this.actionWait == 0) {
                _super.prototype.addForceAngleMagnitude.call(this, calculations.degreesToRadians(0), 1);
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
            if (this.force.Dy <= -9 && this.gravity.magnitude > 0) {
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
                this.currentSpriteObj = _super.prototype.addSprite.call(this, new animConfig({
                    animationName: this.currentSprite,
                    scaleX: 3,
                    scaleY: 3,
                    speed: 0.3,
                    x: 64,
                    y: 75,
                    anchorX: 0.5,
                    anchorY: 0.34,
                }));
                if (this.currentSprite == "catReady") {
                    this.currentSpriteObj.animationSpeed = 0.155;
                }
                this.currentSpriteObj.pivot.set(0, 25);
            }
            if (this.currentSpriteObj != null) {
                this.currentSpriteObj.rotation = this.jumpAngle;
                if (this.climbing) {
                    if (l.checkKeyHeld("a")) {
                        this.currentSpriteObj.rotation = calculations.degreesToRadians(90);
                    }
                    else if (l.checkKeyHeld("d")) {
                        this.currentSpriteObj.rotation = calculations.degreesToRadians(270);
                    }
                }
                if (this.currentSprite == "catRun") {
                    var animWithSpeed = 0.4 * Math.abs(this.force.Dx) / this.maxRunSpeed;
                    if (animWithSpeed < 0.1)
                        animWithSpeed = 0.1;
                    this.currentSpriteObj.animationSpeed = animWithSpeed;
                }
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
                l.camera.setMoveSpeedX(0.07);
            }
            else {
                l.camera.setMoveSpeedX(0.04);
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
                l.camera.cameraOffsetX = -this.shakeCameraForce + Math.random() * this.shakeCameraForce;
                l.camera.cameraOffsetY = -this.shakeCameraForce + Math.random() * this.shakeCameraForce;
                this.shakeCameraForce--;
            }
            else {
                l.camera.cameraOffsetX = 0;
                l.camera.cameraOffsetY = 0;
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
            l.camera.setTarget(this.g.x + addCamSpace + 64, this.g.y + addCamSpaceY);
        };
        mio.prototype.hangleAttacks = function (l) {
            if (l.checkKeyPressed(" ") && this.actionWait == 0) {
                if (Math.floor(this.gravity.magnitude) != 0) {
                    this.attacking = true;
                    this.constantForce = 15;
                    this.actionWait = 33;
                    this.airbornTimer += 5;
                }
                else {
                    this.attacking = true;
                    this.constantForce = 5;
                    this.actionWait = 12;
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
        mio.objectName = "mio";
        return mio;
    }(objectBase));

    var dummySandbag = /** @class */ (function (_super) {
        __extends(dummySandbag, _super);
        function dummySandbag(xp, yp) {
            var _this = _super.call(this, xp, yp, dummySandbag.objectName) || this;
            _this.switch = false;
            _this.friction = 0.99;
            _this.weight = 0.05;
            _this.life = 1000;
            _super.prototype.setCollision.call(_this, 0, 0, 64, 128);
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI$1.Graphics();
                newGraphics.beginFill(0x0000FF);
                newGraphics.drawRect(0, 0, 64, 128);
                newGraphics.endFill();
                g.addChild(newGraphics);
                return g;
            });
            _super.prototype.addCollisionTarget.call(_this, block.objectName, movingBlockHori.objectName, movingBlockVert.objectName, mio.objectName);
            return _this;
            //super.addMoveCollisionTarget(mio.objectName);
        }
        dummySandbag.prototype.logic = function (l) {
        };
        dummySandbag.objectName = "dummySandbag";
        return dummySandbag;
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
                var line = new PIXI$1.Graphics();
                line.lineStyle(25, 0xBB0000, 1, 1);
                line.x = 32;
                line.y = 0;
                line.moveTo(0, 0);
                line.lineTo(0, 100);
                line.endFill();
                g.addChild(line);
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
                function (xp, yp) { return new grass(xp, yp); },
                function (xp, yp) { return new dummySandbag(xp, yp); },
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

    var room1 = "NobwRAtgpgLghgeQEYCsoGMYGcCSA7AGTgE8oAnMALlDBgEsAbKKvAVwYYBow6sBhAPYQkdPHHoC8CAGYAVRlCxVpcBlijdeABThkYMwcNHi6k5avXcAHlQCMAJgAc3YlXsBWAGzcx0KmCQGAXQAazAAX05weiYWdi4efiERMQkpOQUlShU1DUSdPQNk4zTzXOs7JxcqAGZHABYfOD9KAKDQiKjaBTiOTSSjVNN0+SYsnMt83X1pQxSTM2yLPJtKB2cwV0p3ByaWtuCwyOieyjY+xLmS4ZlRxTLJ7WmiwYW8B5XKja3PeoAGPbMVqBQ6dE6xM7xfpXIaSW6ZD79AozGFvRFgVbraqUADsng2viBBw6x26EPOCV4qLS8LG6KehVmxVh7yW5QxX2xjgAnN4wIT-CCSV0YkCKdDmW9afc2Y8sMiXvNSrLPmsqps7H97I1+c0iUKjiLTuLLpKaRk6Sqkc8ma9lRNVViNWtbO57IDBe1DeCxVDTXabhaZQ7rYzqcN0Zj1Vt1gDdfsDWCyb6LlSzYG7uNlqGUenFiGOWrvnZ-gS9Z7QaTRb1KQMlRmEVapmG86yC1Hi2t3DU+QLgV6k9XIam69c4UGs+yGbmA-ns4WnTHPL8Pf3K0byX607ORo2C9PFWO2-OO9jbDjue74-qB1XjVvRyzpZO5QrbfW5+zT87bJe433iW9ZMawlHdn3peUbXDT9JlWDw+RjP9V0Awd7xHaDd0tfdIJbHdI1qBozyQ68K2FH0QP9D9MODecD3fI98O2XYf2IgDEzvTd0NbcCmzojDGN+ONEPsf9yzXMjgOHWsMJ47C334ptVjxTtfxE5D2I3FNpO4icIPk1tGJ5BC7FYsSUI4rTQKo2TaJwmcqMY2wtR1YTRITW9NIo7drN03i7MPFlHNdK9XPUjzyKkqyjxsqd-PowLFK+ISTLUkjxKAocTW86LfLkqCDMStZSyI1K2PCySssfKVcts-S8MK10exKtyb3XCLKpkmrYrqhyGuXFyUpa0iMrQ7SwK6198vq9s7AvELBrCtqKofTrMz0qbepmtZiNCtLzM8yLKJyta-J6hjCpE+oVNM9ylsyladJOvLcM2k83HPYzttKsyNPah7xqe2qNvOrb7BqP4Bq+ob0tQzixp8wHuuBhLQfqGp5qhxaJPuriAb3IGXpBt7KHg5LMb237ltxhH8aRwmUeJ+x8Wu77bux0aoqfCa8j4grQccWxPtU6H9r+6njtpyb6bRC7uXqSHhaxka4c56rEal+yia-Wo-hxDHFYp8qcfhiWsIJzWGe1yh0b+MmDbKu6OaOrn1Z5uKFK2+XHDtm7WvZlXnbVyW3bOy3YKoepPD+FmRcp43VfNV2cwCmXPZxJqWNZv3lcswPE+D5P4tT4mrpXTPY6Np3spdgvmwt4urfqblL2apXYdz6ug7Nun6-tYmdlS3aHf9juqvz7uNZTvurbdK7W8Nx2A878eaJ7qeI0K9xHG3s85rbiyvLHhsJ5D5GG-D7Zt5U-r94OjrHtr3npv7q+z27Xsfsrpej-HJO6-XmCqot47x-MVBeI9D6rUfu7PmL8QExicBXReo8oEn0Lh7OBKlgq3zFibGuaD-5F2nhfYBKlnI4Kpngruq9J5EI3ltUhXJeQUPjnnY+NDT7S2IUA1+zplIsKrj-aiL5OG93oZg7EgkBHf1QRw9BsCZ68K2APaRKCH4EKfq9RR8CCI6mHjnSB6i5GEIwdozs8FVGGLxhomBz8zFnnVPo9uViaY2NDufIBeI7aOM-sglxptjGaK1iQzw6MHFljZgYw6y92EiPkXYkh7gIbhMsdEoRMVaGmJITUPEKTwFRPvtYwJtitEkO1CpHxkTnFpNkXEkxCiSEOG8RE7O1TCmuOKe47hFRKBNxbj+SprSD41KMXUoJYdVSlwVoM4abT-odLGSU4Jkz05CxmTDYZ7SAmLK6eIxuUcKktNmZs+Z2z1pcL2RfL2zTUlbPwZ0s+3TCxozdHkpxJzxb3J2Y8y5kz7Dajeb4iBIyinfIuYAnp-xmEDKORsu+pyvnnLERCwsNReSHNuQi6hYLkXHitnUf4gKqkfKoSvHFAC8UXxycxBBsLRaUITrEpFFLGI1C3tMulcdBG1OZXQlFqwaj1C8ESoZ8LPnYt5Vk1UNR0YYvyXM8VZLJUNOlSJG58qSWMt-tA3Z-KdZ6xFccsVpKmWnR+XqkmcsOWYsVaa56uLGJOEFoauFuCtXCOVQk1UTMdFFhtSa7VbjzWUu9V4dV7zjXuoyaIllF00b63WfS1hMTA0PPBSGnpYNkkwv9VG7m8TSneo+i6pN3LRmesLZmiGcqI1urYam8lfKM0Lh2pyDVkb60erNemxye8c3trrSmrt9rY1bUFmXWlubO3RoLcsnpjU1mcq-mo0FFa50LjAZOgdDLp35vqV6+diCS1cpkeW7tDqGrYP7bWndQ6Z37srQuch16gUFKxUq89o7iZGWPcu-xiLP1NsYvwl9xKO13r3eMjxPSpGgdFYO9JkGlkTJ6SouDRqEM8sA1KnpBLf1+JBQstdKHCwWPQ6629iG-5Qaed+LdN7k1UZ1cG1lsr54MbLau7DKrcNCqFr7DDlGsMjqA4VNlhFy5Tog9R5D0HUU4hpQtbdjHhPmy-fihoPss6CZU2ekTOHUXovY6+hVAbh1qdE57P40Kh4mc1bumTurm2rHqP8hWAmKO6a4-pnjzy2X6w86W093mLMGdWN2XJknlOcaI9xg9hZ3BJPc9pzzMWzlxcfeF0JAWUtBZXbFnz8XwteOM2BzDenQu+fC0opTHHgsFcq0V-V+t37IQgKYUzebHMscKtc8JSDgV3IlRl9dLmrp2yvXV-L6XCuZYjuNs8z6pv-uG7N0b83vZMI-mVoTFW16WZLgtvh+IpNMaDT23rR2fiEui-VmbjW5u9IOZIm7y3CP3f22FiOqyXsDbfbahtxG5MuccBOqgsG3tDY-WtkjLnm4Ywh3Z8DZ200XoYU037p3VOfaq1QWenZEc7a8w1nHTXtg5M+oT+Du2Quk8e+4Erzof23emwBmHwO8dJbPJNpH5XaeZNx9sRnMYwGQ-fXah763thc5-K1lnK3oeS9h3j8pu9+li4B+ZunUuyNbGZxrsz96aO-NwxJmMS3ec05JwLsnaGYw86J2ltnSuOeUFg7Sv7nWHPMYu1tEDIvo5Y72zbx7zOYxy4N11n3aPia2E3XYCPlvicfZD1LhdZ5RdJ6d6tl3tG7A3xhZ7+z0no-qYvuefpHug-85jQdq2Ff9YO+p8n532vlfk3NwC+X73W+p-b5dTs+us93d77Xr7JMBaU9e8P1nOe2+u6dZ9EDkfvfnZj1bRfW3q-W7H4LzfP4LeO5H3PvvC+rWLa7yvkva+y-St1vrQ-zfs+K-n3n62aqL96JnwriXr+TeorYwP0v2-x7xP13zJ0FWFSAK-yP1nxf1Pzf0gM+iH1gJ-0BxG3byQOxGXxAKh1-wQP-wFT40x27zwPQPZ0QMAOuyL2R2xwIItRtjJipx02f3wPAMe3BgNWdGYNS2P3gPYJ13P24On1QNAP4NnX73jS31IPF3INz0ILcDDWkKvxR0bXH1JmwJOxkM1yN1kzfyzQ5RoL5x3wkIX2LUL23xTwEP73BgVibxYL4LYNMP0OrTfgzhULoOsNdwNnD3cNwNkK13oOc1qAUwTU220MNyQyc1ZVCIz0DwiKjxvzrypU0ziKXQIzIMCK8MQKM1AXiI8OD2yIUN6WsyFkz1EMyN0OiN61KP60sNH2cOKLRS0Pt1eQSNX1R1v0hVqJ-HsN4LgKcIfSlywJ-ALwKJr0aItX3yXDLnGJMKGMwKZgVhxEiwAgAHMyA4AsAlBi9VCgc39XN4iYwVjtsiQAATVgCACAYgAAZTgDwDOKQDgDWK92v06OSOlUFk7CblOP8AuKuNuPuMeOeIiAAF1uAAALOgM4s4qAZtBgEgcgAAOTMiIFIDIAAAJbAwBuAAAvfAWE1YP4UkaAeAZANATAXAQgREigagCKcAACHEsAe4ugCAN4G4gABygCgDOKoD+AADp3BuBRQsgaBRQUT9gmSyBFABBWAyB0AoAJSiR6gYT0BHAVicQABaeWdwM47U7kP4TwTUpAKAIVTU6QHEHkzwKAXUzwc8ewfkjkvAF47gLAeAPQAADUUL5DdOmAAE1wd4iAB3aEmACEvHbLSEqAOgNYiEmAOwCncIUEyIDorIGAMgVgIoqYqAn4fIsyFUs4tUjU7UoVPUpuQ040009wc0y0s46020+0x0506pBksyGAAQDkpklktktITk7k3kygOMEUqgMUhQJU-wP4KUmUuUhU8c1oaUrAWU+UxQAAehFJXIAFkBBtjiAMTNSMSAAxIIEwZ0rQBEmAaQAQMgCALAJsl0sAX0z0701090mAAMwc7gEMs4sMtwLvCE6M2M+MygXkJMlMt4tQgqdMzMzNHMuwXhACdszs4ZVs-YRCrsvAVk9krknkvk4UxsUcpgOcsASc7gBcpc2csyMimc1c9crcncvcw848+gU888y86828p0+8x8mAL0kmKA7i98uML8n8kmP8gCuMqgEC5MxI94hSKCyZcImMeCtsjslsvaNC7gbsrC-s3C5MUUn0IikisAKi5coikyhUrANczITc7crAXc-co8gQE8tYs88QNim8u8pk7i3isjAS3S4S8M0SnUf8mMiS4CzwUCmSiC+qeSnpHEbNJSkBBC1S5C9S1SzSjCns4YPsnCj8vSkcgysyIy8yxUyi6c5cyy2i2y+yxipy5ily1iq8jyziry18ny-i18wSz80MwKtzKM0KoCqSsCvYjAmWWKwsS8FSZS1ClKg6FCokDS5kzK7S3Koc-Cwq-YYq8qii-YEqyq6yuiuyhixy5y1yi8pqji5sl86Ydqn0zq-ynq384K8SwaiK6S1M-YjecazEK9RKulNC1K5KzsjKzC3s7Cgctay0Ai0qzaqcxc6isy7amig66q46pi0QBqtyi6zy66p8viu6-0h6783qsSgaySt64azwyY1kb6hMyLP65CAGuatK4Gpa0G7K8G3S4cuk5MQyuG8imGokPaqysYGy+ihy9GlirG9inGh8tq58uWwmvKgKp6-qwC8myKj60a5UWmtYKOO2aaha2a+klm9C9myQHKiGvCqGjaokLa+G0ysqh2iykW1cw6mqk6+qs69yy6ri+W-G3Gt8omkSvqsAEK9W8KzW8Cz6xYXW2wRwLvBm02wGlS1mrSsGnSvK7m6Gvm0ipGxG525G0W92tGuqjG727GlqwO26wOrqsAFWoKtWsKoaqKmOmmjM71Vwn8Q2-wJmk2oGs2rKi2zmrO9a3moq-mhGp2gW-a4u1GiWsuqW86mWquxWvG3y+65Wx6xusOl6jW966O7Wr6juzNewLgpOgelOmatO5ajO1a62mUHOievOwugume12yykuhe06xqleq6tenihWvyre4m1W3esmyOg+kaig4+6C0jH4s8Hu1oPuySea3u9KtmoevAS2rmse8U5+4y-O6e6i2et2+e2qn+6W5q-+7yoBzeoS7e0O8O5uim1uo+2Ok+0jPWA2pK1OtSgekGrBnB0em28e2Gl+gWt+khj+sWo67+r23+6hv2m6uhpWhh0Bne5h16qO6B+QjhuBuCIQi+vhq+o2m+827BkeyGx+22icyex23apG0hz+8hz28uxR321qlRgOgBuuhuphveyBymwo6mqgXWmoL4xB3h6+-hvhwRlaq2-Knm-B8Rwh1+4hiqmRr+ihhRqhzx6u1RvQPxxh0miOlurWmB-R6VNFfWJB2gY21B02+Ju+xJ7O2x1oe2yRjJl2qq8WnJ9xvJ2W2hnx4B9RkO0plhnRqmhYsazhgVO0oWOplBocNB5BjB9OjmzO6x-SsRu2+xnaoWpxrJ1xyWzG5epRrx9ejqtR7qjRgJiB8pw+yp9ugx3RHh-6hplZppzBhJ3B0RlJvZiRqexxwu5x2Rj205iuv+5Rq5gmop4Okm56h51hipvRl5yZQ0hWJZz504VZ+p8xoRqxh+nZgFuxoFhxw50F45vptxpen2oZ-2jem5+ukppFsplFp5tFsJuZiOJwKa6Jsx2JmJ5pzZ++pJp+1JkqqRzJ3puR-pulyumhxl65+FkB8ZtlyZqB6Z43KpyFPlqJj5pC5mgRn5lpv5mx3ZsltJrpkF9+2ViFxes5+l1e4Zpl1VsZxFpu7RrVkJmZnWnl3pO3OCgV9Bo1-uuJ010V1pvBscghqV7poushmlyFjxhl7xt1oOtVz18B9lqZ31nV9FyFINtYbFsNxpk1jZ4erZ4lgqy1jp-ZwW-wYW+10uyh85-JgBmu3xhFsBrR-e4JiYv12BlZDOYxmJ0x0Nwe35kRi10l+t8lg5pto5lt+RgZ9ttN2F2untzRwJx53Rv-XV55H7bukNtZstr5it2+qN81kl2NyVoh216Rld+Vp1xVmFwBkZ+h259Vr1-tth557l153pXkd5xmnFiEPFxaytyx6t8V9p4iht6VnplG5Nx1qFi5gpz95l-xiZ71gd+YgtwDoBCnA1sD893F756D4R7Z2tudhDhdxt+c5dlDuV2l196Fy5j9jN4pu53Dv91Fg9wthLfW0j5O41iNqjoluDut+j614Fylu1ljh1tt51pV9NlVzNj13t3djl-doIoj03G7GMEjsT8N4VyNqtsVtpmTzp+Tpdql59tj9Djt11jTnjn9nNzV-Dqw0JygcJ3I+3XLZZijy9ix6jmt5Ju9wFuTil+zxTue1DlTt9zjrt0Z797NvtoJ-9rlvzgN6YwMw1oVwVkVyz6N-5qLq1+Nx9mVpT1t3J9dl15VuFzT9L7T5FvNwdwj3LoD2wpgvM8d8T8zyT2D6zuj2z2Lpjhz2r1dhVjjzD7j7d+53Nn1zrvQ4d3DJYyRfrwVids9qds1md29wiuNh9hTp96bl95zjdrjtzxbvjrLgT-T7ryZK7ArsjorydkrmDqzmN47+99J6r5DhL1jlNwZxr9T5r9zjLnTjrgjtbw9lzeKyGZ7Uz8tiTq90rm92jir+dmLxdyb+LpNkHtD1N8Hzd7trNtr5b7zhoodhHiOSarbwr3b-F-b69w77Hv76Lqrs7mr4H5T+r1T991Lr9ll3jjVvD7LwTgzhLX6t71Hi91Om4tkjgNnzHjnyLrnyr07uL87-nurtdoXlLwplrsXkSp0TLvd7V+HoT8LEz3Mw15X1QBgD7s9p31Xr78L6TsbxDhNsF7Jpz0ntT8ntLs3wKi3mHlbuH6o3WhnKOLkWYpXlXl3lnxC93l3z3qT0bnH2Tnn3XvnongXw35L+b27ynv1TzyXx7rM23znBKuwDHFm9P13-F5vzPkb37xj3PnXgnvXwvg32bjDztk3qHttS33T63mPgNuPu2EzoG5v1Pjstviz77sr2dnP8b-HvHxNlxxLwXkv4frD911riv8f2Hnzun2v6XevrsbNef5PlvtPh-9vn78rrX3HvP3vgv3f4npLubw-hbuXwj7tco+F-LrrHxlzh47+SfZ3o-yX7P8V+XvbPu-274A9eeQPfvjN3Y5D9XOkPbdsAOp5S8nusfRvmOzMYL9Bu5AhAcN1f7r8UBm-Lvs2wu6B8wewfG7ngKAHqgz+oA2nuAOn6q4fwjOe-rAMX4cll+NAtfkdy74MCkOO-cFgP2wEucmuW7TgRsG4E08wCvncJsQVGJhIm+D-UQeIIx6r8semvaQb70B5yCA+oPBrmwJF7Ydt6BArzkQJr4y84Ik+M8JGX0EiDKBobIwWFyz6d9c62-WQf7xOYk9WBwvEfvgK4GR8NB4hS-m4JCKKY1Qc8bwar0MHUDjBSAoISdzQH58MBP-IvoPyUEQ8VBWnU-nEJcFaCA2zRFSHPxgEZDfBbvLIQEI75v9zBDHUIdS1-779-+uA8oSfycFV9OW0vZ7t0RswN8gu8AnwWZyoGwCX+kgznp0JCF+8ehxQxQdd3sHH8w+Y-KodXxqE9cdBDvMjhQLmF+DWhhLdoXQJWGf9t+YQvfsX36HKCKeFQ4Yfx1GHEC8uShPhH4WvpnC0e-wy4dOxo5mDghdwpgfrywFXcye7AwYbsMqEgD4hgxPgUB21B6C9cifIEbMMBHzCPeiAwIR0PBE997h6whQTCLsHRDVBv7B7p8NcHjDSMthbnNMLEEGDmhrfYEQd1BEStueJIyEZgMu5B8ohR-U3g3XeG0i9O9I3WvYHMIII0hwgpoecJaELCCR1wqQcSPyFf9Ch8g6EUKON4ijR+iIwgQcMSEMjMQraW-jATxEp92RT-FURINME8jtemo0kY5xsFG9S+HAt4bEKRHVDTRcdC0a6GgHYjFRuIi4faOyGEibhGom1ugKsHhC-+OAl4aHzFE+jjRdIw4Z3TSFQCrR4Y0MYrxDEZ9VRtA9UXkNjEFD4xjwkoVsKpHei1B+wjMf6Ly5d1MRuY5UfmJC6NCixDojXk6I-58jmOUIwUZEP1GAC6xNIq3vmxt5JCO8kldXF2LgGsiIxbQkscsJjF2ctRlY3oU8KTFlDXhQwtMc4JNGojHQfaQLiLDtEdiIO6Q7sZGLVFriyxG410cwPdEH8Bh+4hEeKMnGrcp+QHcdNMnlELjMhy4q4auLBGPiJuz4ocSwNsHCixxB4+sb6OPHTizRCeUdnTV+LtibRSojkSBJBERc+xqA8sZuIeHbjqxsI7YaKMcGHiRhkozMfOjlzGdViQE20TMPxE9juR8HGQWsLdERDYJo4svuOMr4fC6JTYv8fHktGnC2ROEy8beJXFLDwJ-3YiVBIFEwSPRAAwSQhInET8pxv4x0BJKDFtjcJV4oEJBzYlyTQJCkwidxMsGkSNhFIuCZpM-E0SRJk-HrNKNgqUBQcRk2SYuP8GWTHRXEiwXGLsnki9Rno+EamMQnpjRJJ4wztiHhxSScRBY60WrxMG9igpXQniS+L4nqT3xKY6idFKPGNi4psvRvCyIBEpS8xFk-Cd7w37BSKxoU3USOIikfiop2k8-rwJQm613clQQCYWL8mcj2enEmzg1JIlkjmp-E1qQVI0ZfidJP49yQG39wYSkpJkqgGZKXHsS7xYE6yWNJUlFCwpLUjSV6K0nCSJRbki7LrTDwJ5gxqU3YhdPXxUoDSkMG2G1gEAAA3DGgACEvQAACSvJ0BXisUlCZ7G9gTYJMAECAB9O+legAAauQHjJJlIS0JWEvCRpJEUPp5ABEq4DxIEkoAmIJMkAA";

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
                    if (_this.logicModule.camera.getIsInUse()) {
                        _this.app.stage.pivot.x = (_this.logicModule.camera.getX() + _this.logicModule.camera.cameraOffsetX);
                        _this.app.stage.pivot.y = (_this.logicModule.camera.getY() + _this.logicModule.camera.cameraOffsetY);
                        _this.app.stage.position.x = _this.app.renderer.width / 2;
                        _this.app.stage.position.y = _this.app.renderer.height / 2;
                    }
                    for (var _i = 0, _a = _this.tileContainer; _i < _a.length; _i++) {
                        var t = _a[_i];
                        if (roomEvent.getTicks() % t.tileStepTime == 0) {
                            t.animate();
                        }
                    }
                    _this.logicModule.camera.moveCamera();
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
