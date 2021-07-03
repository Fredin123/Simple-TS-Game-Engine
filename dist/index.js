(function (PIXI, filterGodray, filterAdjustment) {
    'use strict';

    var gameSettings = /** @class */ (function () {
        function gameSettings() {
            this.stretchToWindow = false;
            this.fixedCanvasWidth = 640;
            this.fixedCanvasHeight = 380;
            /*windowStretchListener(){
                if(this.stretchToWindow){
                    this.app!.view.width = window.innerWidth;
                    this.app!.view.height = window.innerHeight;
                }
            }*/
        }
        gameSettings.prototype.applySettings = function (a) {
            this.app = a;
            this.app.renderer.backgroundColor = 0xFFFFFF;
            PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
            /*if(this.stretchToWindow){
                this.windowStretchListener();
                window.addEventListener("resize", this.windowStretchListener.bind(this));
            }*/
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
        gameCamera.prototype.moveCamera = function (app, cameraBounds) {
            var angle = brain.angleBetweenPoints((this.cameraX - this.targetX), (this.cameraY - this.targetY));
            var distance = brain.distanceBetweenPoints(this.cameraX, this.cameraY, this.targetX, this.targetY);
            this.cameraX += Math.cos(angle) * distance * this.camMovementSpeedX;
            this.cameraY += Math.sin(angle) * distance * this.camMovementSpeedY;
            this.cameraX = Math.floor(this.cameraX);
            this.cameraY = Math.floor(this.cameraY);
            if (cameraBounds[0] + cameraBounds[1] + cameraBounds[2] + cameraBounds[3] != 0) {
                if (this.cameraX - (app.renderer.width / 2) < cameraBounds[0]) {
                    this.cameraX = cameraBounds[0] + (app.renderer.width / 2);
                }
                if (this.cameraX + (app.renderer.width / 2) > cameraBounds[0] + cameraBounds[2]) {
                    this.cameraX = cameraBounds[0] + cameraBounds[2] - (app.renderer.width / 2);
                }
                if (this.cameraY - (app.renderer.height / 2) < cameraBounds[1]) {
                    this.cameraY = cameraBounds[1] + (app.renderer.height / 2);
                }
                if (this.cameraY + (app.renderer.height / 2) > cameraBounds[1] + cameraBounds[3]) {
                    this.cameraY = cameraBounds[1] + cameraBounds[3] - (app.renderer.height / 2);
                }
            }
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
        calculations.getRandomInt = function (min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
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

    var movementOperations = /** @class */ (function () {
        function movementOperations() {
        }
        movementOperations.moveByForce = function (target, force, collisionNames, objContainer, deltaTime) {
            force.Dx = force.Dx * deltaTime;
            force.Dy = force.Dy * deltaTime;
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
                            if (internalFunction.intersecting(target, stickyCheck_1, testCollisionWith)) {
                                if (testCollisionWith._hasBeenMoved_Tick < roomEvent.getTicks()) {
                                    objectsThatWereCollidingThisObjectWhileMoving.push(testCollisionWith);
                                    testCollisionWith.g.x += sign;
                                    if (i >= Math.abs(magnitude) - 1) {
                                        testCollisionWith._hasBeenMoved_Tick = roomEvent.getTicks();
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
                if (collisionTarget != objectBase.null && target._isColliding_Special == false) {
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
        movementOperations.moveForceVertical = function (magnitude, target, collisionNames, objContainer) {
            var _this = this;
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
                            collisionTarget = _this.pushObjectVertical(target, testCollisionWith, sign, objContainer);
                            if (collisionTarget == objectBase.null) {
                                target.force.Dy *= 1 - testCollisionWith.weight;
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
                        objContainer.foreachObjectType(objectBase.objectsThatCollideWith[target.objectName], function (testCollisionWith) {
                            if (internalFunction.intersecting(target, stickyCheck_2, testCollisionWith)) {
                                if (testCollisionWith._hasBeenMoved_Tick < roomEvent.getTicks()) {
                                    objectsThatWereCollidingThisObjectWhileMoving.push(testCollisionWith);
                                    testCollisionWith.g.y += sign;
                                    if (i >= Math.abs(magnitude) - 1) {
                                        testCollisionWith._hasBeenMoved_Tick = roomEvent.getTicks();
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
                    target.force.Dx *= collisionTarget.friction * target.friction;
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
        movementOperations.pushObjectVertical = function (pusher, objectBeingPushed, sign, objContainer) {
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
                }
                else {
                    objContainer.foreachObjectType(objectBeingPushed.collisionTargets, function (testCollision) {
                        if (testCollision.objectName != pusher.objectName &&
                            internalFunction.intersecting(objectBeingPushed, objectBeingPushed.collisionBox, testCollision)
                            && _this.pushObjectHorizontal(objectBeingPushed, testCollision, sign, objContainer) != objectBase.null) {
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
            return objectBase.null;
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
            this._isColliding_Special = false;
            this.percentage = 0;
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

    var objectBase = /** @class */ (function () {
        function objectBase(x, y, childObjectName) {
            this.isTile = false;
            this.tileStepTime = -1;
            this.ID = uidGen.new();
            this._g = new PIXI.Container();
            this.gSprites = {};
            this.friction = 0.98;
            this.airFriction = 0.9;
            this.percentage = 0;
            this.resourcesNeeded = [];
            this.stickyBottom = false;
            this.stickyTop = false;
            this.stickyLeftSide = false;
            this.stickyRightSide = false;
            this.gravity = vector.null;
            this.weight = 0.4;
            this._hasBeenMoved_Tick = 0;
            this._isColliding_Special = false;
            this.onLayer = 0;
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
                var newGraphics = new PIXI.Graphics();
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
            if (roomEvent.getTicks() % 55 == 0) {
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
        function tinyBlock32(xp, yp) {
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
        function wideBlock(xp, yp) {
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

    var hitbox = /** @class */ (function (_super) {
        __extends(hitbox, _super);
        function hitbox(xp, yp) {
            var _this = _super.call(this, xp, yp, hitbox.objectName) || this;
            _this.switch = false;
            _this.friction = 0.0;
            _this.haveHitThese = [];
            _this.life = 10;
            _this.targets = [dummySandbag.objectName];
            _this.creator = null;
            _this.offsetX = 0;
            _this.offsetY = 0;
            _this.hitboxDirection = null;
            _this.aerial = false;
            _this.type = "";
            return _this;
        }
        hitbox.prototype.setOffset = function (offX, offY) {
            this.offsetX = offX;
            this.offsetY = offY;
        };
        hitbox.prototype.setSize = function (width, height) {
            _super.prototype.setCollision.call(this, 0, 0, width, height);
            _super.prototype.style.call(this, function (g) {
                var newGraphics = new PIXI.Graphics();
                newGraphics.beginFill(0x00FF50);
                newGraphics.drawRect(0, 0, width, height);
                newGraphics.endFill();
                g.addChild(newGraphics);
                return g;
            });
        };
        hitbox.prototype.logic = function (l) {
            var _this = this;
            this.life--;
            if (this.creator != null) {
                this.moveWithCreator();
                if (this.life <= 0) {
                    l.objContainer.deleteObject(this);
                }
                else {
                    for (var _i = 0, _a = this.targets; _i < _a.length; _i++) {
                        var t = _a[_i];
                        l.foreachObjectType(t, function (obj) {
                            var _a, _b, _c, _d;
                            if (_this.haveHitThese.indexOf(obj.ID) == -1
                                && internalFunction.intersecting(_this, _this.collisionBox, obj)) {
                                _this.haveHitThese.push(obj.ID);
                                if (_this.hitboxDirection != null) {
                                    if (_this.type == "sword") {
                                        resourcesHand.playAudioVolume("WeaponImpact1.ogg", 0.25);
                                    }
                                    if (_this.creator.facingRight) {
                                        obj.addForceAngleMagnitude((_a = _this.hitboxDirection) === null || _a === void 0 ? void 0 : _a.delta, (_b = _this.hitboxDirection) === null || _b === void 0 ? void 0 : _b.magnitude);
                                    }
                                    else {
                                        obj.addForceAngleMagnitude(calculations.PI - ((_c = _this.hitboxDirection) === null || _c === void 0 ? void 0 : _c.delta), (_d = _this.hitboxDirection) === null || _d === void 0 ? void 0 : _d.magnitude);
                                    }
                                }
                            }
                            return true;
                        });
                    }
                }
            }
            else {
                l.objContainer.deleteObject(this);
            }
        };
        hitbox.prototype.moveWithCreator = function () {
            if (this.creator != null) {
                this.g.x = this.creator.g.x + (this.creator.collisionBox.width / 2) - (this.collisionBox.width / 2);
                this.g.y = this.creator.g.y + this.creator.collisionBox.height / 2;
                if (this.creator.facingRight) {
                    this.g.x += this.offsetX;
                    this.g.y += this.offsetY;
                }
                else {
                    this.g.x -= this.offsetX;
                    this.g.y += this.offsetY;
                }
            }
        };
        hitbox.objectName = "hitbox";
        return hitbox;
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
        tools.createHitbox = function (_a) {
            var startupTime = _a.startupTime, x = _a.x, y = _a.y, creator = _a.creator, life = _a.life, size = _a.size, offset = _a.offset, hitboxDirection = _a.hitboxDirection, aerial = _a.aerial, type = _a.type;
            var newHitbox = new hitbox(x, y);
            newHitbox.type = type;
            newHitbox.creator = creator;
            newHitbox.life = life;
            newHitbox.setSize(size[0], size[1]);
            newHitbox.setOffset(offset[0], offset[1]);
            newHitbox.hitboxDirection = hitboxDirection;
            newHitbox.aerial = aerial;
            console.log("Passed life: ", life);
            console.log("new hitbox: ", newHitbox);
            var hitboxData = [startupTime, newHitbox];
            return hitboxData;
        };
        return tools;
    }());

    var ladder = /** @class */ (function (_super) {
        __extends(ladder, _super);
        function ladder(xp, yp) {
            var _this = _super.call(this, xp, yp, ladder.objectName) || this;
            _this.switch = false;
            _this.friction = 0.0;
            _this.life = 1000;
            _super.prototype.setCollision.call(_this, 0, 32, 64, 224);
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI.Graphics();
                newGraphics.beginFill(0xFF3e50);
                newGraphics.drawRect(0, 32, 64, 224);
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

    var textPrompt = /** @class */ (function (_super) {
        __extends(textPrompt, _super);
        function textPrompt(xp, yp) {
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
            l.interaction.openText(this.text);
        };
        textPrompt.objectName = "textPrompt";
        return textPrompt;
    }(objectBase));

    var player = /** @class */ (function (_super) {
        __extends(player, _super);
        /*private myShaderFrag = `
        varying vec2 vTextureCoord;
        uniform sampler2D uSampler;
        void main(void)
        {
            float width = 256.0;
            float height = 256.0;

            

            vec4 t = texture2D(uSampler, vTextureCoord);

            float averageColorStrength = (t.x + t.y + t.z)/3.0;

            float density = 256.0 * (1.0 - averageColorStrength);

            float positionY = float(floor(vTextureCoord.y * density));
            int everyOtherRow = int(positionY - (2.0 * floor(positionY/2.0)));


            float position = float(floor(vTextureCoord.x * density));
            int black = 0;
            int r = int(position - (2.0 * floor(position/2.0)));
            if(everyOtherRow == 0 || r == 0){
                black = 1;
            }
            
            t.a = 1.0;
            if(black == 1){
                gl_FragColor = vec4(0.0 * t.a, 0.0 * t.a, 0.0 * t.a, t.a); //* t;
            }else{
                gl_FragColor = vec4(1.0 * t.a, 1.0 * t.a, 1.0 * t.a, 1.0 * t.a); // * t;
            }

            
        }
        `;*/
        function player(xp, yp) {
            var _this = _super.call(this, xp, yp, player.objectName) || this;
            _this.airFriction = 0.98;
            _this.friction = 0.8;
            _this.gravity = new vectorFixedDelta(calculations.degreesToRadians(270), 0); //vector.fromAngleAndMagnitude(calculations.degreesToRadians(270), 0.6);
            _this.weight = 0.06;
            _this.maxRunSpeed = 9;
            _this.normalRunSpeed = 9;
            _this.superRunSpeed = 14;
            _this.currentSprite = "warriorIdle";
            _this.currentSpriteObj = null;
            _this.shakeCameraForce = 0;
            _this.airbornTimer = 0;
            _this.facingRight = true;
            _this.falling = false;
            _this.hasJumped = false;
            _this.climbindLadder = false;
            _this.canJumpLadders = false;
            _this.atLadderTop = false;
            _this.releasedJumpKeyAtLadderTop = false;
            _this.constantForce = 0;
            _this.attacking = false;
            _this.actionWait = 0;
            _this.hitboxToCreate = null;
            _this.playFootstepTimer = 0;
            _this.myShaderVert = "";
            _this.myShaderFrag = "\n    varying vec2 vTextureCoord;\n    uniform sampler2D uSampler;\n\n\n    float rand(vec2 co){\n        return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);\n    }\n\n\n    void main(void)\n    {\n        float width = 256.0;\n        float height = 175.0;\n\n        int rings = int(width/16.0);\n\n        vec4 t = texture2D(uSampler, vTextureCoord);\n\n        int color = 1;\n        int spot = 0;\n        int render = 0;\n\n        float distanceFromCenterX = vTextureCoord.x - 0.5;\n        float distanceFromCenterY = vTextureCoord.y - (1.0 - 0.68/*height/width*/);\n        float hyputenuse = sqrt((distanceFromCenterX*distanceFromCenterX) + (distanceFromCenterY*distanceFromCenterY));\n\n        /*if(floor(hyputenuse*100.0) == 15.0){\n            color = 1;\n        }*/\n\n        float floatPerPixel = 1.0/width;\n\n        float random = rand(vTextureCoord);\n\n        float averageColorStrength = (t.x + t.y + t.z)/3.0;\n        \n\n        for(int i=0; i<128; i++){\n\n            //circles\n            int drawlines = int(float(i) - (3.0 * floor(float(i)/3.0)));\n            if(drawlines == 1 && i > 5){\n\n                float thicknes = float(i)-8.0*averageColorStrength;\n\n                if(hyputenuse < float(i)*floatPerPixel && hyputenuse > thicknes*(floatPerPixel)){\n                    render = 1;\n                }\n            }\n            \n        }\n\n\n\n        if(averageColorStrength > 0.8){ //face and part of sword\n            color = -1;\n        }\n\n        if(averageColorStrength < 0.8\n            && averageColorStrength > 0.4){//armor\n                color = 2;\n        }\n\n        if(averageColorStrength < 0.3\n            && averageColorStrength > 0.2){//hair and part of wrists\n                color = 3;\n        }\n\n\n\n        for(int i=0; i<128; i++){\n\n            int draw = int(float(i) - (2.0 * floor(float(i)/2.0)));\n            if(draw == 1 && i > 3 + int((128.0*random)) ){\n                if(hyputenuse < float(i)*floatPerPixel && hyputenuse > float(i-int(32.0*averageColorStrength))*(floatPerPixel)){\n                    spot = 1;\n                }\n            }\n            \n        }\n\n        if(render == 0 && color == 1){\n            t.a = t.a* 0.9;\n        }\n\n        vec4 colorOut = vec4(1.0 * t.a, 1.0 * t.a, 1.0 * t.a, t.a);\n\n        if(color == -1){//white\n            colorOut = vec4(0.9 * t.a, 0.9 * t.a, 0.9 * t.a, t.a);\n        }else if(color == 0){//black\n            colorOut = vec4(0.0 * t.a, 0.0 * t.a, 0.0 * t.a, t.a);\n        }else if(color == 1){//blue\n            colorOut = vec4(0.0 * t.a, 0.0 * t.a, vTextureCoord.y * t.a, t.a);\n        }else if(color == 2){//silver\n            colorOut = vec4(0.4 * t.a, 0.4 * t.a, 0.4 * t.a, t.a);\n        }else if(color == 3){//yellow\n            colorOut = vec4(0.7 * t.a, 0.7 * t.a, 0.09 * t.a, t.a);\n        }else{\n            colorOut = vec4(0.0 * t.a, 0.0 * t.a, 0.0 * t.a, t.a);\n        }\n\n        if(spot == 1){\n            colorOut = colorOut*colorOut;\n        }\n\n        gl_FragColor = colorOut * t;\n\n        \n    }\n    ";
            _super.prototype.setCollision.call(_this, 0, 0, 64, 125);
            _super.prototype.style.call(_this, function (g) {
                /*let newGraphics = new PIXI.Graphics();

                newGraphics.beginFill(0xFF3e50);
                newGraphics.drawRect(0, 0, 64, 125);
                newGraphics.endFill();
                g.addChild(newGraphics);*/
                g.calculateBounds();
                return g;
            });
            _this.g.filters = [];
            try {
                /*this.g.filters.push(new GlowFilter({
                    color: 0x000000,
                    outerStrength: 16
                }));*/
                var filtertest = new PIXI.Filter(undefined, _this.myShaderFrag);
                _this.g.filters.push(filtertest);
                //this.g.filters.push(new PIXI.filters.BlurFilter());
            }
            catch (e) {
            }
            _super.prototype.addCollisionTarget.call(_this, block.objectName, movingBlockHori.objectName, movingBlockVert.objectName, dummySandbag.objectName, tinyBlock32.objectName, wideBlock.objectName);
            _this.updateCurrentSprite();
            console.log("width: ", _this.g.width);
            console.log("height: ", _this.g.height);
            return _this;
        }
        player.prototype.logic = function (l) {
            _super.prototype.logic.call(this, l);
            if (Math.floor(this.force.Dy) == 0 && Math.floor(this.gravity.magnitude) == 0) {
                this.hasJumped = false;
            }
            if (Math.floor(this.force.Dy) == 0 && Math.round(this.gravity.magnitude) == 0) {
                this.falling = false;
            }
            if (l.checkKeyHeld("Control")) {
                this.maxRunSpeed = this.superRunSpeed;
            }
            else {
                this.maxRunSpeed = this.normalRunSpeed;
            }
            var collisionWith = l.isCollidingWith(this, this.collisionBox, [ladder.objectName]);
            if (collisionWith != null) {
                if ((l.checkKeyHeld("w") || l.checkKeyHeld("s"))) {
                    this.force.Dx = 0;
                }
                if ((l.checkKeyHeld("w") || l.checkKeyHeld("s")) && this.climbindLadder == false) {
                    this.climbindLadder = true;
                    if (l.checkKeyHeld("a") == false && l.checkKeyHeld("d") == false) {
                        this.canJumpLadders = true;
                    }
                }
                if (this.climbindLadder) {
                    this.gravity.magnitude = 0;
                    this.force.Dx *= 0.4;
                    this.force.Dy *= 0.2;
                    this.g.x = collisionWith.g.x;
                    if (l.checkKeyHeld("w")) {
                        this.g.y -= 5;
                        while (l.isCollidingWith(this, this.collisionBox, [ladder.objectName]) == null ||
                            l.isCollidingWith(this, this.collisionBox, this.collisionTargets) != null) {
                            this.g.y += 1;
                            this.atLadderTop = true;
                        }
                    }
                    if (l.checkKeyHeld("w") && this.atLadderTop == true && this.releasedJumpKeyAtLadderTop) {
                        this.g.y -= 1;
                        _super.prototype.addForceAngleMagnitude.call(this, calculations.degreesToRadians(90), 11);
                    }
                    if (l.checkKeyReleased("w") && this.atLadderTop == true) {
                        this.releasedJumpKeyAtLadderTop = true;
                    }
                    if (l.checkKeyHeld("s")) {
                        this.g.y += 8;
                        if (l.isCollidingWith(this, this.collisionBox, this.collisionTargets) != null) {
                            this.g.y = collisionWith.g.y + (collisionWith.collisionBox.y / 2) + collisionWith.collisionBox.height / 2 - 1;
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
                            this.g.x -= this.collisionBox.width;
                            movedBetweenLadder = true;
                            if (l.isCollidingWith(this, this.collisionBox, this.collisionTargets) != null) {
                                this.g.x += this.collisionBox.width;
                                movedBetweenLadder = false;
                            }
                            if (movedBetweenLadder && l.checkKeyHeld("w")) {
                                _super.prototype.addForceAngleMagnitude.call(this, calculations.degreesToRadians(135), 11);
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
                            this.g.x += this.collisionBox.width;
                            movedBetweenLadder = true;
                            if (l.isCollidingWith(this, this.collisionBox, this.collisionTargets) != null) {
                                this.g.x -= this.collisionBox.width;
                                movedBetweenLadder = false;
                            }
                            if (movedBetweenLadder && l.checkKeyHeld("w")) {
                                _super.prototype.addForceAngleMagnitude.call(this, calculations.degreesToRadians(45), 11);
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
                if (this.falling == false && this.hasJumped == false && l.checkKeyHeld("w") && Math.floor(this.gravity.magnitude) == 0 && this.actionWait == 0) {
                    _super.prototype.addForceAngleMagnitude.call(this, calculations.degreesToRadians(90), 11);
                    this.hasJumped = true;
                }
            }
            if (this.climbindLadder == false) {
                if (l.checkKeyHeld("a") && this.actionWait == 0) {
                    _super.prototype.addForceAngleMagnitude.call(this, calculations.degreesToRadians(180), (1 / 13) * this.maxRunSpeed);
                }
                if (l.checkKeyHeld("d") && this.actionWait == 0) {
                    _super.prototype.addForceAngleMagnitude.call(this, calculations.degreesToRadians(0), (1 / 13) * this.maxRunSpeed);
                }
            }
            this.force.limitHorizontalMagnitude(this.maxRunSpeed);
            if (this.attacking == false) {
                if (this.force.Dy <= -9 && this.gravity.magnitude > 0) {
                    this.currentSprite = "warriorJump";
                }
                else if (this.force.Dy > -9 && this.force.Dy < 9 && this.gravity.magnitude > 0) {
                    this.currentSprite = "warriorJump";
                }
                else if (this.force.Dy > 9 && this.gravity.magnitude > 0) {
                    this.currentSprite = "warriorFall";
                }
                if (Math.abs(this.force.Dy) < 1) {
                    if (Math.abs(this.force.Dx) <= 1) {
                        this.currentSprite = "warriorIdle";
                    }
                    else if (this.force.Dx != 0) {
                        this.currentSprite = "warriorRun";
                    }
                }
            }
            if (_super.prototype.hasSprite.call(this, this.currentSprite) == false) {
                this.updateCurrentSprite();
            }
            if (this.currentSpriteObj != null) {
                if (this.currentSprite == "warriorRun") {
                    var animWithSpeed = 0.3 * Math.abs(this.force.Dx) / this.superRunSpeed;
                    if (animWithSpeed < 0.01)
                        animWithSpeed = 0.01;
                    this.currentSpriteObj.animationSpeed = animWithSpeed;
                }
                else if (this.currentSprite == "warriorIdle") {
                    this.currentSpriteObj.animationSpeed = 0.155;
                }
            }
            if (Math.abs(Math.floor(this.force.Dx)) != 0) {
                if (this.force.Dx > 0) {
                    _super.prototype.scaleXSprites.call(this, 4);
                    this.facingRight = true;
                }
                else if (this.force.Dx < 0) {
                    _super.prototype.scaleXSprites.call(this, -4);
                    this.facingRight = false;
                }
                if (this.facingRight == true) {
                    this.currentSpriteObj.pivot.set(3, 15);
                }
                else {
                    this.currentSpriteObj.pivot.set(-12, 15);
                }
            }
            if (Math.round(this.gravity.magnitude) == 0 && Math.round(this.force.Dy) == 0 && Math.abs(this.force.Dx) > 2 &&
                l.checkKeyHeld("w") == false &&
                (l.checkKeyHeld("a") || l.checkKeyHeld("d"))) {
                if (this.playFootstepTimer <= 0) {
                    this.playFootstepSounds();
                    console.log((this.maxRunSpeed / Math.abs(this.force.Dx)));
                    this.playFootstepTimer = 17 * (this.normalRunSpeed / this.maxRunSpeed);
                }
                else {
                    this.playFootstepTimer--;
                }
            }
            if (this.climbindLadder) {
                this.currentSpriteObj.pivot.set(3, 15);
            }
            if (Math.abs(Math.floor(this.force.Dx)) >= 5) {
                l.camera.setMoveSpeedX(0.07);
            }
            else {
                l.camera.setMoveSpeedX(0.04);
            }
            if (this.climbindLadder == false) {
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
            }
            else {
                this.airbornTimer = 0;
            }
            var collisionInteraction = l.isCollidingWith(this, this.collisionBox, [textPrompt.objectName]);
            if (l.checkKeyPressed(" ") && collisionInteraction != null) {
                collisionInteraction.logic(l);
            }
            else {
                this.hangleAttacks(l);
            }
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
            if (this.hitboxToCreate != null) {
                for (var _i = 0, _a = this.hitboxToCreate; _i < _a.length; _i++) {
                    var hitbox_1 = _a[_i];
                    if (hitbox_1[0] > 0) {
                        hitbox_1[0]--;
                        if (hitbox_1[0] == 0) {
                            l.objContainer.addObject(hitbox_1[1], this.onLayer);
                        }
                    }
                    /*if(hitbox != null && hitbox[1].aerial && (Math.round(this.gravity.Dy) == 0)){
                        hitbox[1].life *= 0.8;
                    }*/
                }
            }
            if (l.checkKeyReleased("p") && this.attacking == false) {
                l.objContainer.deleteObject(this);
                l.objContainer.addObject(new mio(this.g.x, this.g.y - 32), this.onLayer);
            }
        };
        player.prototype.playFootstepSounds = function () {
            resourcesHand.playRandomAudio(["footstepDirt1.wav", "footstepDirt2.wav", "footstepDirt3.wav", "footstepDirt4.wav"]);
        };
        player.prototype.hangleAttacks = function (l) {
            if (l.checkKeyPressed(" ") && this.actionWait == 0 && this.climbindLadder == false) {
                if (Math.floor(this.gravity.magnitude) != 0) {
                    resourcesHand.playAudioVolume("bladeDraw.ogg", 0.2);
                    //Air attack
                    this.currentSprite = "warriorAttack";
                    this.currentSpriteObj.animationSpeed = 0.4;
                    this.attacking = true;
                    this.constantForce = 7;
                    this.actionWait = 45;
                    this.airbornTimer += 5;
                    this.hitboxToCreate = [tools.createHitbox({
                            startupTime: 18,
                            x: this.g.x,
                            y: this.g.y,
                            creator: this,
                            life: 16,
                            size: [98, 64],
                            offset: [48, -16],
                            hitboxDirection: new vectorFixedDelta(calculations.degreesToRadians(80), 8),
                            aerial: true,
                            type: "sword"
                        }),
                        tools.createHitbox({
                            startupTime: 32,
                            x: this.g.x,
                            y: this.g.y,
                            creator: this,
                            life: 16,
                            size: [100, 128],
                            offset: [98, -52],
                            hitboxDirection: new vectorFixedDelta(calculations.degreesToRadians(24), 10),
                            aerial: true,
                            type: "sword"
                        })];
                }
                else {
                    //ground attack
                    this.currentSprite = "warriorDashAttack";
                    this.currentSpriteObj.animationSpeed = 0.21;
                    this.attacking = true;
                    this.constantForce = 3;
                    this.actionWait = 35;
                    this.force.Dy = 0;
                    this.hitboxToCreate = [tools.createHitbox({
                            startupTime: 16,
                            x: this.g.x,
                            y: this.g.y,
                            creator: this,
                            life: 7,
                            size: [98, 48],
                            offset: [64, -5],
                            hitboxDirection: new vectorFixedDelta(calculations.degreesToRadians(32), 4),
                            aerial: false,
                            type: "sword"
                        })];
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
            if (this.actionWait > 0) {
                this.actionWait--;
            }
            else {
                this.attacking = false;
            }
        };
        player.prototype.updateCurrentSprite = function () {
            _super.prototype.removeAllSprites.call(this);
            this.currentSpriteObj = _super.prototype.addSprite.call(this, new animConfig({
                animationName: this.currentSprite,
                scaleX: 4,
                scaleY: 4,
                speed: 0.3,
                x: 64,
                y: 77,
                anchorX: 0.5,
                anchorY: 0.34,
            }));
            if (this.currentSpriteObj != null) {
                this.currentSpriteObj.filters = [];
                //new PIXI.filters.AsciiFilter();
                //var t = (PIXI.Filter)(new filters.AdvancedBloomFilter());
                //this.currentSpriteObj.filters.push(new externalFilters.BlurFilter());  
                //GlowFilter
                //this.currentSpriteObj.filters.push(new GlowFilter());
                /*this.currentSpriteObj.filters.push(new DropShadowFilter({
                    blur: 5,
                    alpha: 1
                }));*/
            }
            if (this.facingRight == true) {
                this.currentSpriteObj.pivot.set(0, 15);
            }
            else {
                this.currentSpriteObj.pivot.set(-15, 15);
            }
            /*console.log(this.fragmentSrc.join('\n'));
            var colorValue = parseInt("ff0000".substr(1), 16);
            var r = ((colorValue & 0xFF0000) >> 16) / 255,
            g = ((colorValue & 0x00FF00) >> 8) / 255,
            b = (colorValue & 0x0000FF) / 255;

            this.g.filters = [new PIXI.Filter(undefined,
                this.fragmentSrc.join('\n'),
            {
                distance: 15.0,
                outerStrength: 2.4,
                innerStrength: 2.4,
                glowColor: {x: r, y: g, z: b, w: 1},
                pixelWidth: {type: '1f', value: 1 / 128},
                pixelHeight: {type: '1f', value: 1 / 128},
            })];*/
            this.g.calculateBounds();
        };
        player.objectName = "player";
        return player;
    }(objectBase));

    var dummySandbag = /** @class */ (function (_super) {
        __extends(dummySandbag, _super);
        function dummySandbag(xp, yp) {
            var _this = _super.call(this, xp, yp, dummySandbag.objectName) || this;
            _this.switch = false;
            _this.gravity = new vectorFixedDelta(calculations.degreesToRadians(270), 0);
            _this.friction = 0.90;
            _this.airFriction = 0.96;
            _this.weight = 0.06;
            _this.life = 1000;
            _super.prototype.setCollision.call(_this, 0, 0, 64, 128);
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI.Graphics();
                newGraphics.beginFill(0x0000FF);
                newGraphics.drawRect(0, 0, 64, 128);
                newGraphics.endFill();
                g.addChild(newGraphics);
                _super.prototype.addSprite.call(_this, new animConfig({
                    animationName: "godrayPreview.mp4",
                    scaleX: 3,
                    scaleY: 3,
                    speed: 0.3,
                    x: 64,
                    y: 77,
                    anchorX: 0.5,
                    anchorY: 0.34,
                }));
                return g;
            });
            _super.prototype.addCollisionTarget.call(_this, block.objectName, movingBlockHori.objectName, movingBlockVert.objectName, tinyBlock32.objectName, wideBlock.objectName, mio.objectName, player.objectName);
            return _this;
            //super.addMoveCollisionTarget(mio.objectName);
        }
        dummySandbag.prototype.logic = function (l) {
            _super.prototype.logic.call(this, l);
        };
        dummySandbag.objectName = "dummySandbag";
        return dummySandbag;
    }(objectBase));

    var mio = /** @class */ (function (_super) {
        __extends(mio, _super);
        function mio(xp, yp) {
            var _this = _super.call(this, xp, yp, mio.objectName) || this;
            _this.airFriction = 0.93;
            _this.gravity = new vectorFixedDelta(calculations.degreesToRadians(270), 0); //vector.fromAngleAndMagnitude(calculations.degreesToRadians(270), 0.6);
            _this.weight = 0.09;
            _this.maxRunSpeed = 13;
            _this.normalRunSpeed = 13;
            _this.superRunSpeed = 19;
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
            var filtertest = new PIXI.Filter(undefined, _this.myShaderFrag);
            _this.g.filters = [filtertest];
            _super.prototype.addCollisionTarget.call(_this, block.objectName, movingBlockHori.objectName, movingBlockVert.objectName, dummySandbag.objectName, tinyBlock32.objectName, wideBlock.objectName);
            _this.updateCurrentSprite();
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
                    var animWithSpeed = 0.5 * Math.abs(this.force.Dx) / this.superRunSpeed;
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
            if (this.hitboxToCreate != null) {
                if (this.hitboxToCreate[0] > 0) {
                    this.hitboxToCreate[0]--;
                    if (this.hitboxToCreate[0] == 0) {
                        l.objContainer.addObject(this.hitboxToCreate[1], this.onLayer);
                    }
                }
                if (this.hitboxToCreate != null && this.hitboxToCreate[1].aerial && (this.climbing || Math.round(this.gravity.Dy) == 0)) {
                    this.hitboxToCreate[1].life *= 0.8;
                }
            }
            if (l.checkKeyReleased("p") && this.attacking == false) {
                l.objContainer.deleteObject(this);
                l.objContainer.addObject(new player(this.g.x, this.g.y - 32), this.onLayer);
            }
        };
        mio.prototype.hangleAttacks = function (l) {
            if (l.checkKeyPressed(" ") && this.actionWait == 0 && this.climbing == false) {
                if (Math.floor(this.gravity.magnitude) != 0) {
                    this.attacking = true;
                    this.constantForce = 15;
                    this.actionWait = 33;
                    this.airbornTimer += 5;
                    resourcesHand.playAudioVolume("playerBeastAttack1.ogg", 0.2);
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
                    });
                }
                else {
                    this.attacking = true;
                    this.constantForce = 10;
                    this.actionWait = 25;
                    this.hitboxToCreate = tools.createHitbox({
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
                    });
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
            this.currentSpriteObj = _super.prototype.addSprite.call(this, new animConfig({
                animationName: this.currentSprite,
                scaleX: 3,
                scaleY: 3,
                speed: 0.3,
                x: 64,
                y: 77,
                anchorX: 0.5,
                anchorY: 0.34,
            }));
            if (this.currentSprite == "catReady") {
                this.currentSpriteObj.animationSpeed = 0.155;
            }
            this.currentSpriteObj.pivot.set(0, 25);
        };
        mio.objectName = "mio";
        return mio;
    }(objectBase));

    var collisionSlopeLeft = /** @class */ (function (_super) {
        __extends(collisionSlopeLeft, _super);
        function collisionSlopeLeft(xp, yp) {
            var _this = _super.call(this, xp, yp, collisionSlopeLeft.objectName) || this;
            _this.switch = false;
            _this.friction = 0.986;
            _this.previousTargets = [];
            _super.prototype.setCollision.call(_this, 0, 0, 256, 192);
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI.Graphics();
                newGraphics.beginFill(0x000000);
                newGraphics.drawRect(0, 0, 256, 192);
                newGraphics.endFill();
                g.addChild(newGraphics);
                var myGraph = new PIXI.Graphics();
                // Move it to the beginning of the line
                myGraph.position.set(64, 128);
                // Draw the line (endPoint should be relative to myGraph's position)
                myGraph.lineStyle(5, 0xffffff)
                    .moveTo(0, 0)
                    .lineTo(128, -64);
                g.addChild(myGraph);
                return g;
            });
            return _this;
        }
        collisionSlopeLeft.prototype.logic = function (l) {
            _super.prototype.logic.call(this, l);
            var newTargets = l.isCollidingWithMultiple(this, this.collisionBox, [player.objectName, mio.objectName, dummySandbag.objectName]);
            for (var _i = 0, newTargets_1 = newTargets; _i < newTargets_1.length; _i++) {
                var target = newTargets_1[_i];
                for (var _a = 0, _b = this.previousTargets; _a < _b.length; _a++) {
                    var prevTarget = _b[_a];
                    if (target.ID == prevTarget.ID) {
                        this.previousTargets.splice(this.previousTargets.indexOf(prevTarget), 1);
                    }
                }
                if (target.force.Dy > 0) {
                    var index = (target.g.x + target.collisionBox.x + (target.collisionBox.width / 2)) - this.g.x;
                    if (index < 64) {
                        index = 64;
                    }
                    else if (index > 192) {
                        index = 192;
                    }
                    var ratio = (index - 64) / 128;
                    var extraCheckTop = 0;
                    if (target.force.Dx < -1) {
                        extraCheckTop = 32;
                    }
                    if (target.g.y + target.collisionBox.y + target.collisionBox.height > this.g.y + 64 + 64 * (1 - ratio) - extraCheckTop) {
                        target.gravity.magnitude = 0;
                        target.force.Dy = 0;
                        target.force.Dx *= 0.916;
                        target.g.y = this.g.y - target.collisionBox.y - (target.collisionBox.height) + 64 + (64 * (1 - ratio));
                        target._isColliding_Special = true;
                    }
                    else if (target.g.y + target.collisionBox.y + target.collisionBox.height > this.g.y + 64 + 64 * (1 - ratio) - 1) {
                        target.force.Dy = 0;
                        target.gravity.magnitude = 0;
                        target._isColliding_Special = true;
                    }
                    else {
                        target._isColliding_Special = false;
                    }
                }
                else if (target.force.Dy <= 0) {
                    target._isColliding_Special = false;
                }
                for (var _c = 0, _d = this.previousTargets; _c < _d.length; _c++) {
                    var prevTarget = _d[_c];
                    prevTarget._isColliding_Special = false;
                }
                this.previousTargets = newTargets;
            }
        };
        collisionSlopeLeft.objectName = "collisionSlopeLeft";
        return collisionSlopeLeft;
    }(objectBase));

    var collisionSlopeRight = /** @class */ (function (_super) {
        __extends(collisionSlopeRight, _super);
        function collisionSlopeRight(xp, yp) {
            var _this = _super.call(this, xp, yp, collisionSlopeRight.objectName) || this;
            _this.switch = false;
            _this.friction = 0.986;
            _this.previousTargets = [];
            _super.prototype.setCollision.call(_this, 0, 0, 256, 192);
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI.Graphics();
                newGraphics.beginFill(0x000000);
                newGraphics.drawRect(0, 0, 256, 192);
                newGraphics.endFill();
                g.addChild(newGraphics);
                var myGraph = new PIXI.Graphics();
                // Move it to the beginning of the line
                myGraph.position.set(64, 64);
                // Draw the line (endPoint should be relative to myGraph's position)
                myGraph.lineStyle(5, 0xffffff)
                    .moveTo(0, 0)
                    .lineTo(128, 64);
                g.addChild(myGraph);
                return g;
            });
            return _this;
        }
        collisionSlopeRight.prototype.logic = function (l) {
            _super.prototype.logic.call(this, l);
            var newTargets = l.isCollidingWithMultiple(this, this.collisionBox, [player.objectName, mio.objectName, dummySandbag.objectName]);
            for (var _i = 0, newTargets_1 = newTargets; _i < newTargets_1.length; _i++) {
                var target = newTargets_1[_i];
                for (var _a = 0, _b = this.previousTargets; _a < _b.length; _a++) {
                    var prevTarget = _b[_a];
                    if (target.ID == prevTarget.ID) {
                        this.previousTargets.splice(this.previousTargets.indexOf(prevTarget), 1);
                    }
                }
                if (target.force.Dy > 0) {
                    var index = (target.g.x + target.collisionBox.x + (target.collisionBox.width / 2)) - this.g.x;
                    if (index < 64) {
                        index = 64;
                    }
                    else if (index > 192) {
                        index = 192;
                    }
                    var ratio = (index - 64) / 128;
                    var extraCheckTop = 0;
                    if (target.force.Dx > 1) {
                        extraCheckTop = 32;
                    }
                    if (target.g.y + target.collisionBox.y + target.collisionBox.height > this.g.y + 64 + 64 * (ratio) - extraCheckTop) {
                        target.gravity.magnitude = 0;
                        target.force.Dy = 0;
                        target.force.Dx *= 0.916;
                        target.g.y = this.g.y - target.collisionBox.y - (target.collisionBox.height) + 64 + (64 * (ratio));
                        target._isColliding_Special = true;
                    }
                    else if (target.g.y + target.collisionBox.y + target.collisionBox.height > this.g.y + 64 + 64 * (ratio) - 1) {
                        target.force.Dy = 0;
                        target.gravity.magnitude = 0;
                        target._isColliding_Special = true;
                    }
                    else {
                        target._isColliding_Special = false;
                    }
                }
                else if (target.force.Dy < -0.5) {
                    target._isColliding_Special = false;
                }
                for (var _c = 0, _d = this.previousTargets; _c < _d.length; _c++) {
                    var prevTarget = _d[_c];
                    prevTarget._isColliding_Special = false;
                }
                this.previousTargets = newTargets;
            }
        };
        collisionSlopeRight.objectName = "collisionSlopeRight";
        return collisionSlopeRight;
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
                var newGraphics = new PIXI.Graphics();
                newGraphics.beginFill(0xFF3e50);
                newGraphics.drawRect(0, 0, 128, 128);
                newGraphics.endFill();
                g.addChild(newGraphics);
                _this.grass = new PIXI.Graphics();
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

    var marker = /** @class */ (function (_super) {
        __extends(marker, _super);
        function marker(xp, yp) {
            var _this = _super.call(this, xp, yp, marker.objectName) || this;
            _this.switch = false;
            _this.friction = 0.0;
            _this.life = 1000;
            _super.prototype.setCollision.call(_this, 0, 0, 0, 0);
            _super.prototype.style.call(_this, function (g) {
                var line = new PIXI.Graphics();
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
                //{NEW OBJECT HERE START} (COMMENT USED AS ANCHOR BY populareObjectGenerator.js)
                function (xp, yp) { return new block(xp, yp); },
                function (xp, yp) { return new collisionSlopeLeft(xp, yp); },
                function (xp, yp) { return new collisionSlopeRight(xp, yp); },
                function (xp, yp) { return new movingBlockHori(xp, yp); },
                function (xp, yp) { return new movingBlockVert(xp, yp); },
                function (xp, yp) { return new tinyBlock32(xp, yp); },
                function (xp, yp) { return new wideBlock(xp, yp); },
                function (xp, yp) { return new grass(xp, yp); },
                function (xp, yp) { return new dummySandbag(xp, yp); },
                function (xp, yp) { return new ladder(xp, yp); },
                function (xp, yp) { return new textPrompt(xp, yp); },
                function (xp, yp) { return new hitbox(xp, yp); },
                function (xp, yp) { return new marker(xp, yp); },
                function (xp, yp) { return new mio(xp, yp); },
                function (xp, yp) { return new player(xp, yp); },
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
                    return newTile;
                }
            }
            console.log("Can't generate object for: " + objectName);
            throw new Error("Can't generate object for: " + objectName);
        };
        return objectGenerator;
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
        resourcesHand.resourcesToLoad = [];
        resourcesHand.animatedSprite = {};
        resourcesHand.staticTile = {};
        resourcesHand.audio = {};
        return resourcesHand;
    }());

    var interaction = /** @class */ (function () {
        function interaction() {
            this.isInUse = false;
            this.inputContainer = new PIXI.Container();
        }
        interaction.prototype.openText = function (text) {
            this.isInUse = true;
            var newAnimation = resourcesHand.getStaticTile("panel_1");
            if (newAnimation != null) {
                this.inputContainer.addChild(newAnimation);
            }
        };
        return interaction;
    }());

    //declare var Howl: any;
    var roomEvent = /** @class */ (function () {
        function roomEvent(con, objContainer, tasker) {
            this.mouseXPosition = 0;
            this.mouseYPosition = 0;
            this.keysDown = {};
            this.gameKeysPressed = {};
            this.gameKeysReleased = {};
            this.gameKeysHeld = {};
            this.deltaTime = 1;
            this.camera = new gameCamera();
            this.interaction = new interaction();
            this.objContainer = objContainer;
            this.container = con;
            this.tasker = tasker;
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
            if (specificObjects != null) {
                specificObjects.forEach(function (element) {
                    if (element.objectName == type) {
                        if (func(element)) {
                            returnResult.push(element);
                        }
                    }
                });
            }
            return returnResult;
        };
        roomEvent.prototype.isCollidingWith = function (colSource, colSourceCollisionBox, colTargetType) {
            var colliding = null;
            this.objContainer.foreachObjectType(colTargetType, function (obj) {
                if (internalFunction.intersecting(colSource, colSourceCollisionBox, obj)) {
                    colliding = obj;
                    return true;
                }
                return false;
            });
            return colliding;
        };
        roomEvent.prototype.isCollidingWithMultiple = function (colSource, colSourceCollisionBox, colTargetType) {
            var colliding = [];
            this.objContainer.foreachObjectType(colTargetType, function (obj) {
                if (internalFunction.intersecting(colSource, colSourceCollisionBox, obj)) {
                    colliding.push(obj);
                }
                return false;
            });
            return colliding;
        };
        roomEvent.ticks = 0;
        return roomEvent;
    }());

    var roomLayer = /** @class */ (function () {
        function roomLayer(layerName, zIndex, container) {
            this.objects = [];
            this.hidden = false;
            this.scrollSpeedX = 1;
            this.scrollSpeedY = 1;
            this.layerName = layerName;
            this.zIndex = zIndex;
            this.graphicsContainer = container;
        }
        return roomLayer;
    }());

    var objectContainer = /** @class */ (function () {
        function objectContainer() {
            this.layerNames = {};
            //private layersContainer: {[key: number]: PIXI.Container} = {};
            this.layerKeysOrdered = [];
            this.objectToRemoveBuffer = [];
            this.objectToAddBuffer = [];
            this.specificObjects = {};
            this.layers = {};
        }
        objectContainer.prototype.removeObjects = function () {
            this.specificObjects = {};
            this.layers = {};
            this.layerKeysOrdered.length = 0;
        };
        objectContainer.prototype.addContainerForLayer = function (container, layerNumber, layerName, scrollSpeedX, scrollSpeedY) {
            if (this.layerNames[layerNumber] == null) {
                this.layerNames[layerName] = layerNumber;
            }
            if (this.layers[layerNumber] == null) {
                this.layers[layerNumber] = new roomLayer(layerName, layerNumber, container);
                this.layers[layerNumber].scrollSpeedX = scrollSpeedX;
                this.layers[layerNumber].scrollSpeedY = scrollSpeedY;
                this.layerKeysOrdered.push(layerNumber);
                this.layerKeysOrdered.sort();
            }
        };
        objectContainer.prototype.addObjectDirectly = function (obj, targetlayer, hidden) {
            if (hidden === void 0) { hidden = false; }
            //Add specific classes
            obj.onLayer = targetlayer;
            var objName = tools.getClassNameFromConstructorName(obj.constructor.toString());
            if (this.specificObjects[objName] == null) {
                this.specificObjects[objName] = new Array();
            }
            this.specificObjects[objName].push(obj);
            this.layers[targetlayer].objects.push(obj);
            if (hidden == false) {
                this.layers[targetlayer].graphicsContainer.addChild(obj.g);
            }
        };
        objectContainer.prototype.addObject = function (obj, layerIndex) {
            this.objectToAddBuffer.push([obj, layerIndex]);
        };
        objectContainer.prototype.populateFromList = function () {
            for (var _i = 0, _a = this.objectToAddBuffer; _i < _a.length; _i++) {
                var addThis = _a[_i];
                this.addObjectDirectly(addThis[0], addThis[1]);
            }
            this.objectToAddBuffer.length = 0;
        };
        objectContainer.prototype.deleteObject = function (id) {
            this.objectToRemoveBuffer.push(id);
        };
        objectContainer.prototype.purgeObjects = function () {
            var _this = this;
            var _loop_1 = function (removeThis) {
                for (var _i = 0, _a = this_1.specificObjects[removeThis.objectName]; _i < _a.length; _i++) {
                    var target = _a[_i];
                    if (target.ID == removeThis.ID) {
                        this_1.specificObjects[removeThis.objectName].splice(this_1.specificObjects[removeThis.objectName].indexOf(target), 1);
                        break;
                    }
                }
                this_1.layerKeysOrdered.forEach(function (layerNumber) {
                    for (var _i = 0, _a = _this.layers[layerNumber].objects; _i < _a.length; _i++) {
                        var target = _a[_i];
                        if (target.ID == removeThis.ID) {
                            target.g.destroy();
                            _this.layers[layerNumber].objects.splice(_this.layers[layerNumber].objects.indexOf(target), 1);
                            break;
                        }
                    }
                });
            };
            var this_1 = this;
            for (var _i = 0, _a = this.objectToRemoveBuffer; _i < _a.length; _i++) {
                var removeThis = _a[_i];
                _loop_1(removeThis);
            }
            this.objectToRemoveBuffer.length = 0;
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
            for (var x = 0; x < this.layerKeysOrdered.length; x++) {
                var key = this.layerKeysOrdered[x];
                for (var i = 0; i < this.layers[key].objects.length; i++) {
                    this.layers[key].objects[i].logic(logicModule);
                }
            }
        };
        objectContainer.prototype.updateLayerOffsets = function (camera, app) {
            for (var x = 0; x < this.layerKeysOrdered.length; x++) {
                //console.log("this.layerKeysOrdered[x]: ",this.layerKeysOrdered[x]);
                //console.log("this.layers: ",this.layers[this.layerKeysOrdered[x]]);
                //console.log("this.layersContainer[this.layerKeysOrdered[x]].x: ",this.layersContainer[this.layerKeysOrdered[x]].x, "  camera.getX(): ",camera.getX());
                this.layers[this.layerKeysOrdered[x]].graphicsContainer.x = (-camera.getX() * (1 - this.layers[this.layerKeysOrdered[x]].scrollSpeedX)) /* - app.renderer.width/2*/;
                //this.layersContainer[this.layerKeysOrdered[x]].y = camera.getY();
            }
        };
        return objectContainer;
    }());

    var task = /** @class */ (function () {
        function task() {
            this.tasksToDo = [];
        }
        task.prototype.addtasks = function (ticks, func) {
            this.tasksToDo.push([ticks, func]);
        };
        task.prototype.tick = function (l) {
            var i = this.tasksToDo.length;
            while (i--) {
                var f = this.tasksToDo[i];
                if (f[0] <= 0) {
                    f[1](l);
                    this.tasksToDo.splice(i, 1);
                }
                else {
                    f[0] -= 1;
                }
            }
        };
        return task;
    }());

    var scene_home = "N4IgxghgtgpgThAQgewK4DsAmBnAGiALgFoB2ABjIBpxp4k0tsBNQqm2BFDHAdQEtMAFwAWhACwBOctUgd63bAAkYfAObDBhAIwkAHGwBGEMAGtVcBpgDCyADbI4hEAGIArADYDAZjBaQ1WwgAT3gAEQhBCEIAbVBYSIB5AwArGDBBbABJdAAZYPgY0EE+WxhCUHRaJ38QCHQ+KAi+ZHQAZQAHGBhMVgA6V2pi0uxCkCGYADkqghAauBhsNDgwSemQADNXEnWDHYAmInX13UwiMXWIdyJL1y8iTC0DSXWxTxIdXvb0VRrsSLhBPhiFotLoxNQ-hAASwCO5dLpqAB3AQiQjuCRaPbUYQqdSaWFiMgAXwAukTqHxsDYoAY+JVii0EusAColBaEQRwVAwCnYAAKUMETOptPpzXQhAutmwPJAAA9CEQQWDqEE0fDqJVYE5NttdgYDkcTmcLlcbncHk8JC83h8vj9yUU2eUQFqyjN1qhbLYanUGk0Wh0uj0CGxxiMCLExmyptqZmQ5gslitY+6QPNFqhlgsAPThmAZAD6sEwfFQUBz7ShEG9EDlOagDEidOwOaMpnMlmLTYgLb2hZrtk+31+-0BrAhY5hbGRQlEBC8Yg82NxGkIXjBpPJIEpIrpAfQTNZw0lNZlvIFAOFyBp+4ZEoInO51AVwNB4JAathGtda093pAR1o1KF03R1L0fWoP1GnvINugnYD2UjJ1SlTJwE2oDNk1WON0yTLMVlbfMixLMsKyrBBa3rRsMGbdBW3bMwLG4btaN7ej+0HYcfknQUgTYSFoQQ2dUQXJd3BXNQ1wXTcyV5PcxUZFk2QjKVzx3flBWvW9FIfJ9ZVfPY9hILFP3VBFf1w-8fSA8ZQLWWcYBQQRBBvX16hg8U4JDMMVNGcY0PjRNM2zQK8JCwi8xUgtsGLboyMrasqIbHsWzbYwmK7Gj0Do7BOO9bjRz4hDBMEGE9mXEARPnRdKpxKT8UxXQt3km9RQPI8-IINTZUpS8hXWBSDw5LkDMVZUPy-LQyBMzUHIEJzkBctzbOdAgKnmzBFuWqB3P9WDOng0NBi6qMArWDDwuwsKsII3NiNi0jy0SyjAmo1L6PSjtmKwVicvYvKBwK+0ioBfjeKEggKokqqURq8TJLxbQ9mauSNKG+9OpPbqz16zSr0Gtq73FEbn3lcb31VZGKDm3DHOc1zdtWkD1sstN6aWxm9s8wNDp8k7sbOmMLuC661lu7MiOikj4ueijBzrFK2LSxjOxY7LcvyocQYh8djpAUrysq6r1wRkB6qRggmpa9Gid0rGkJ6i8tMJnThsfUaX0IIzZrMq2ZtMsCZg5nbAMoFD3Q2umFoZtyoI8g9vIQ8N-OF3DLollNxfwyWouGGK4tLOWkrepX-pVjK1d+jWAa1wrdfBg2p29424dNurV0alGbd3O2OuU7GnY0-rtPa+9SbGqHjNMqa9hptmnBDrnSWxAQtofIfsDACxvW8oEtAhbe7FsbyYQPg2C2Kb4IxAYAAB0DaP3e+dwB+CAAAi0fpKHfh+t53k+fMmBv0-j-B+BhbBZhAcSGogQQhwDCoxAAsh9EY1AABe2Qtqvi0EBeIEAkipHSFkXI+RHDIUQvZXC3NE58z6AMRCEYhaoTWKLO6YU9g7EwCQdwmArheB8K4M4XgSAQGuO4MAQiIAwD0BITAZB1juDIDAVw9cm7FQXK4OeusYRiDEBZE2UMO4NUIOQMQPcqR90xgPJC+lnYEwxiTHG0pJ5eC0WwL8eiLJBxAJwgw3DeH8MEcI0R4jJHXBkboORCilEqMKszSOC8ZiuURAUeO+0vJ0P1inCh5105sNCtnCK91paPVlhWAAYg4BYggABqJRAiqBgIWYiZAxCFjAMIAiGhkCpLgIWLQ7g5SDLUaVRuhthJtyMTDC20kzEWMcUpY8jtcb2IGosvSntyaaO0X7LxtM0wpIKCvc2a8YAb1WY-ABe8+gSDECQQ+1ygHaAhJfOkqgb73yucfPe0DegSDAd85+wZgGEFAb-EAECoFgpgQEMhYUjmOAwVgmAhk8EFgISkNIGRsh5HganFmUc0w0IOsGehAskLMJwsSzCOcs64VuOidwMADAwEOCsAwZwYBHGuJgVwZAlSEkwOsEgXgDB3P8aMscQIlRzwEs3WEewPyGNcBILwMzO6mK0Qsqx4oHYRjscPF2GzTwuK9sCOVVNFUfh8YyiQzLWXspZVynlEA+UCq0EKkVYqJWYHieHShrMfHWRJZksl2TToRzChnOl1KnCZxKfnGWRdyIl0VqrH6mBCzrGqX8LQhYyB7ClRo+VgoYTuGVVM1wmJEZzPVTqt21jlmqUuX1Y1uqWgT3NUQOEFkvzuCVQc8CAEElULTCG9JPM2hZN8oLKNItaXFJurGqWSaykppegresGauw5ozIIfNZAv463UWDEqCr7VIirTW82mqCDzLRr3RteqbEtrNUahxHbNlk1fLK+e-bKrBogmHCOY7h2QVqAnUlR1Z2UvnfkxdYtcIJtXQsAuT1U2vXTZXTN2bc0HoLcekcDdz1lsIJe2Gc5CDVtMrM-ED7txPrHi+5tpr1Jts-c+ztHsf3jR4Va9wgG-zAdHUG4TAFJ20PDbBph8G0wxqXUU7CqGZTJoSvLZKO6WJ7pqYeojPFT161LZDCjKqb10dMW0htzGlldSHhx9ZX6u3bJBFogTvsgMjoDXZMTVlgOSeg-zRhBK41BUQ+wpTd0VPofKZuzTOHd34b08Ws9+sJkEFM9e2jd6GOtS44eV9bG8Yj1djZ79k9BkVvc4HcTNlvNrSJeB0NvNpMUtk4haNBT6VphQ3nNDani5Ye3Ql7TSXCMpaMzo8jMMzPZZMfeqzj7LH5f1UVtZo9ibccNYZHQMN+0edqyBwNjWPT+cgxklrMG2shc6+FwpyGV19dU+u9TabhvfUS-u5LJ6xmkZMzNrLtb6OLcY8tsrq3nHsfxo5-LznDK9uq0O07XnQO+fHWd6CUmrvBdyWneTXXQtXSi09mLG6NOly079HTebxs-elX9sq02r1UYIDRoHlnzFLY2RD+z0ONu6Th+uS1ft3AHb8yj47SSNgY6g2G7HOSqW3aJ-dnrj2HqF1e0Nr6mVRtfYLUWunJapsEmZ6JNnt75uivcNZzbBXWOQ+K+22HPHXHvBnmiQkSPpcS58yd73EHMeBeTpGjrC7lfdfjWr0pGvBtbu11XLN1OCNHom+Mi9AOWfm4swtznoPueFYd+t0rtvBcEDEEZSaaIxfo59w1qXE7ztTqThGudoeEPh8J719XGG4sU5G1TsbKfDepeM4zjLGezfmZyyDvL4OC+85Kyal35qBF7bREJ8XNkSSr0wOvNbQLAHBn4v8j8-8fnPKtq8ly7zPl-yfof7or8YX-IGBCs-wLuigo-gfCFUK4DQKJFgXhTWEYmZHmHZGRSwFRXXHRUSCxWIVxTIRCzAxmGa2nWk2-hx0V1YTuwjxmE9QkGMhgC0DuAkGrSEVeC0FOAgA3AODSHWGIL8SiXWC8FT29jIAsnSxBF2UMVeA-Gz0GWJC5y-Qh0NQc353diHkMg4KtW4LYB8QIKIJIKIDIK0AoPcCoOuFoKIHoMYJ2GYNYJBlEz9zAAcHQAqT4BgFsB6ACzlyCwVzk3QgJ2XWKWiwG0qXw3qVrCaRaWljIC8ELAADcGkIAfDBlhl3A2C0sFU1C2lTd5xoZ2crYlEbd7Z59W0+di8Bdl9tkxBBlZDMR5C1hTC4BzDLDrCjtfcpcSiyirCbDG8sd7CQ88l8dcDO8o810Y8PD90vDGlmlWkAjgjvDmlwiRlh9JtDMz5+VK0WdEiLdLZBDUj+57cF8ncytS854+1tBCivcaiLC6jAJt9Tld9zl9938H9MBj8JBOD79T4XkL5r9r4nAvlzjfln9rjAVXigEQEf9wFIF-8YVAC4V4FEEYBhA6RMBFA0AZQahMEoDXxzEA18FCFsUSE8UChcdCUpc0Dm8yBMCHC28aUO8wpHgeFdADAVhDh1hMA7glwyAhFyT-CiBJFySYAvAaTriQQoiiANxT8FVzdeCK8kjdAvA9glim0uoxDMil8pDFReSrVzcFCDAySKS2UjgaSzh+UGSDAmSWTWV2SvBOT9NKi68fFMBkAHA-BbDLsmjW8WinC2iXDlMSd3CcwqkeiQifCBigjPSRihkxjiNDM08yMCQZwpkmokitBCDxSWM7MMjF8nMcjXwok19-YfwzSLS4A-BjCpdERBwrSGig8W84NCSHTiTItc5u9Yt3SalejQj+i-DBjfSBl-TIjxigQ5j0t5TKNRIqt5jpIoyxThCVt0j31xCsj3ZtttBC1K80zvEHJ8yTSsSfE8zvQCzA87Dg87S8cyyE0nTicqyN0ay-g6yvTGyfThiWyIiojOyFVuzDE+yBDozhy58Vj4y1iS8kzCART3c5yvdVzbBsz6tlz5p0BkBOhvhM0cSZ1rtMTCcFMkNVdXCXSXtnpjy6lmzvShi+iryAyDNftWcb10sK0wyWcIz+zGpny88RDRyocEzncpy-y-Zpp0zQLwLzkE8lzEkVy6R2LILLBoLWssDHCwtyyHtkLDyEp0LTyGyk1-CLycLRi2zAyCLzdiLPcez5xyKnyhzqKRy3yxzpTEzGKzFZCOD5zo4wKILOKcyVzFzrT0D5dmidzRK9yKzIpJK0LPDMLzzsL6zcLlL8L6dpljd7yplHy71ByYzbNB53zON1ivyrY9h8jmLzL-zFzbLQKwB7AZROKHLcTYLsD283LxLnTPLujayfK5KmzLylKojuz1LSLRJtLIqqLZ9bcec4qYcErGKmoPFpzWLLLsrkBcqoLMq6Z7LCzNziz2t7TXLY19zKzo8e9pKqr+t5K-KwjWybzKouyVRNKPdIy2rbZ9K4zDL6KeqtlXwSKzLBr2YMrgLuKFy1zBKnLtyWFiqFr3LE1+tUKKqTy1rVMNrmy6r2yW4YY9qZjez+DWrdL2q0iDK6KPzsjerCQtimK7KXrxr7rvRzlMBSh1gD1XrbSSy5qQAEKItSqDzlrqzvLLysKQbtqwboiQywqyKUYjq4aTrXyzqkb4rPzGLzcpo0rczBw8aCaibsbF4xasA4AGp1zZcbStzSaXLybnDvq3C-q3S6acKGbaqmaVLgryLIb4jkYLIdLoq7debHd+aUarrtB7lfyWKLKcbShZb5auKUDIVOYbxWgxwchuVNB8qYLhLSz5rFMqalrOiVqdb-K9bFKDagqjdJjqN+MDqkrza70K1LbOrzrkbJz7ay99EzLB0pcDAfaoA-bBQA7CbPa0cnBy6doq6AQAAlExYOoSgksmimlXSPCSmmo82Os86qhS-y0Gw2jRY2-ktOwxFq+bbOl8jq2im27qgWwutQ9VEum1EAiu5uwQNupGKWmYRuxmHgQcCpewBwYm5W2a1WnuvAjvTWro7Wj0+m3yxm685m28kMrYCfGqXZbPBevSnm2KvO22gu3jAgH8rer3E+m8M+70C+zMuuv3WOKABB2wJBhwPYa+mam7MPEqpCsqgeqSoe2S9amqhOz+ie1Lb+yGX+02q2QgpIoB+G5Y62ovJfQWtO4W0unxNBjBrBuAHBo+kAAR8+y+4R3BmTfBz6iOoh6m6O2m1+3W9+-W6hpO2h3a6ev+7QZhiij3HO5ezh4y9excWc6aPhtYcRxByRkRx6r2mxzBux6RwqkStWx0jWlC5+1at+kezav0jR0GPWOhsfBh9Owclh3PNhiU0Bvm1eu2yB1zJ2mcr3JxoR+x1HP3OB9B8+nITMrwVx0O7u9WyOjykhrylRuOtRqhvC4JoENSnRxhiK+e6J7mpexGleiQ8eRKskmBsuiuwR-JhwQp0Rv2m8bUDut6lWj61osShRqO36nxsh3w-xj+upkjGSPk1m-a2e-RgQ7uRehGjhj9BJiByee1fqqBijHxcZqAbUUR4amUTAfgLAXpIpruu+0phZ8ppRweqp4eih0eraoJzZhqhVG6iJjmgxjOoxzpkxhi9etQ38lM3YnK7oV580xEFBqXPizF95qZkm2+2Z3cr6spn657ZZgF8hoGyhsexO+p6jIiiFjS2e6Fg51GYBjpk58crhsxvRK1VF3FiC-F7F0RgC1oRob0CYZANBj55ykl8OxCvu4hv50h6l1ZoFgJgK+q3ZE29OlphYw5rl45uJrpicnp3qlGK5oVzGk+KV2wGVuV8VwcSVwcJ1iu+V96+C75lVxRpZmOjV+O+l0FoMoXUfGENm6GyM41mJ2Ms1hFy6pJx2wVm556+1912Vz1l170AAUSwBrsEBwcJZvtkbmcIb9cWcpcDcqr8a1fWcCsZZZshija0vZcitjfadNZWTAbOctcLv2T9ltfTfzcwELcyclztdHYPo0GLamqVrwbgqVwrZmC7wqf+owrrdpeBcCY2bDYztCt2fDPbfm2tiOfYYTdOe6acV6sZVTZhinawBnaLZxZ8SeYxYhIJfnccqJbLdJfkcrd+YDeUdrdUbWfUb3YIvBZDMhbZcztPc7aY25cvd5dMcgcha-GHdwnfZec-bFYcfruDldYdY9dDhLcXaKvLbJZ+YpdJ3VdA+qfA9qcbbBb1bvKPZZ0NYHMQ7B2Q57fieva20LvCcw7TYmt3hI6zdDhzcdak8ZjnY3IXZkaXYIeo8A9o9dN8bA-rYg5Y-3dCcjY4+apPaNc5bjZiv4-Nb5cgegaHbE9dtI-k9ffTbdelbk7jm-YKuKa+c8fJafprYBq3YLGBt091YjfXCM-nC467jM67Yvcs8TbXsgb6bs4fZc8k+dYI5MJUBPjHDQcLa9ZmZ9d85o-85A8C+0+3e1fHs0YmPUsYbmMAbaaQ+7bfQE4tZvcLu7Mw9FN2Jy73vy8Duc+w-67y4rufcK+JeK-mfU7K-+YY8Baq4baiPC4PfTsa6zua949a-31Q8ReTd9h65qxG5KAG-G5MUeZy6QTXlKAK-I+U8o--eVdXY6OA-m4q8Y50+Y5W+Nyaq0v2c27hZ5aMv28niFtMThD65KGu931u6G8u+h5u5gDu885Ds+cVY8Zm5e-7rVcqYW5peC7pZBcg+CtW7+70bm0tlYbi9iYS6vY66E8gZE45yh9sBh-xuR-h6y+qKu6R4m-u7cbDsx5Xcfu8YC83cq8J53Z1eZsiZTv1j2cp+kmp5a-i7a6s7Q4qzRqtRS7fd59h5gAm4R7Z75-btR87oVem5F7Xdx43Zks1aW9C9l-0fS3J6YaV-xBV+27V925B6TYq3MZ17iJ58R4N6N+5715KFHeZHAv5-N+mam+XbU+x9Vbe-o4+8W6l+q4Zc2cHdd8Ybl45aB5Q796S4q2tYVLTsj9sGj9j4u4j+KJy9r-aBR8U5-dLZU7kee9F-Kpfvx4d6z+W+Zrz5iOhcV5jdi9V9p-V8S8Scngw9TrS5O5r6wBj5b656yal2wHBKgHQBgDVAF+84x-vvaJx7T7x4z4J8EBC+++Zug8hnIofJhvm2hmL7p72-9-NUxBSq-EVLWG34aB781QxvNfpNz-ZKtKapXMXuVwl6fdHet-GhnVxiL6Nx+MLL3vnnhb09rOk8Wzv2g0rV9QBIA8CmAM75UcAOKff1tWxgH29g2xPPTgRVW5y9UBTXN-jPywGa8v+qTEXPgMb4lBCBDfZfnK0P7o8reyfHvuuz76X8B+1-Inru3oGk9QqPBcMgD1aasDfeF1MvuagX5QNeuIfWwJl037V8hB8fX9qQKe6QDZu0A97rAMz4yDpeNXJtqt1FJu9C+gPc9tP3UH51+2NnXQUd1Z4GDJ2vA-QZ62EGW8k+5A8Qbb0kE2Cr+N-ENiT2TpdklBZFFQVTy24YDgeGgufpwNLp+C9BAQqokYJCEmCO+j3CAb3QoFVs6OF-GIdILiF0Cfu8vZwQX1SHK90hNFTAR-00EuZkqqZWzkUOk4CC0wKwEoMYLb5ecRB4Q7vjb3P529Aag-J3ogODIttkhzVVoZ73aGnUS+WQ85l-wr5DtdBAw5eEMKcAjCTeBvEgWUOF5iCZhVA6wTQJqbxD5BiQhVHMWYFuCTWPvQvOwNB7moUuX4XXkEPZ4gRjewIsoKEO9ZTCLBlQoDncPT61DaBcgxoeljeHKCPehjdwfG3f6l9sh2yS5jr0h56CwRw3YYfrw56XD3GJ-RarCOqFzCgudg7PqGwYHG5URKQ9EQSDUHfCuhuInBL0IJEu1ThZIkEScJmBnDiREIorlCIqGRDZh0Qh4UxyeHIjXhrcNkVE05GrFwG3gnARRgBHB9q+xI0EUjwpFC8qRXjXvlpzgELCEBtXZYWPlZFrD2R6AjoZkK8GddkuhI3UdvWX4GiRR4AIUeCJKEUdKRvrGERpy1oWjbB9QpEczVW72j-ujozYSA2xE7CtRfw4PgCMJH6ijRhoi4RKMT6qcIhtw2kXKPmEMih+SwhnEbF0bu81RmIizmwO5G7CXMXAz0azx9GGCgRRovMeAOuGFjXucImofKK+6KiYxLIlUQ6NrGfCPBXInEU2OTK+CWeRI7Mb6LFFdjAxD3YMSV0sHmiVmiImXhWObZ2jxx8YyceZytrbDXRjPCrC2Ih4CjRR-okkYKND4c8FOitdvkGJNEhiZRA4ukZLzLGLCbRlY8Gs02f5pD1RXVQTuVj2H6Ag+Xo0kc+NKATtChawLaDAHaAABxTNOEDgAmBjRJTLcaGLm7wihxQNfNOYAgDYBYoDgzZn2Xz4GtQJbQ8Cb20gml58RzFfYWaS6AYSsJUIXCaI1QncTLA2E3Cd2LMHlCH6RYzTruL8JkSEAlE-cYBJNzy83e0XDEVOKxENjZxqY5sbkLNpFFcIAkzCUJN4mPiZghkniThLwk+cse344sRGNiGySKJVEnPvu1okKoVJDEjYUxPa7YCchFjDiShK4lGTuAwk0ySAHMnGTLJokq4aaL85WDiJpYo9IWHInyTqJrk7ZpDA8mniaeGkzwZqLdHXjdJGdfSWmAikhSTJ-EoKRZJEnrjBe+EmyZJPDHSS5Kjk1KS5IIpuSQyWUtAYmL46aSUxBUvybIQCkGSqpkUvib6LKlYBQp0UzcQ1P7F2Tmp61Vqc5KZHBVOpmUkCdlKn65SZxA0q8UNPYkwSpcU0zAKFMqloTgp00kybNM-EETbJUkoNjJOSlyTVpCQ1LBtLHzdSWBdY88cmMvFQTmxP4WeMdM4mXTqpYU06TNNqlH9RBfYs-j+JLH0ikpKUt6c8I+kZSvpW0nqd5I16-CgZ6NPql7ihkVTJpY08qVFJhmTCCx0whaY9P76tIVpCkptp9OnDYyfp6k+sXlL7aDSCZw00GYFPBnjTIZ5M66ZTPGFo8whNM6EQ9KalPSWpL0pyczJomYy2Z9E7ad72nEaieZB0vmUdJKlOASZlki6YJIpk1SJZFvSEdLOlGNSqWDM56ajOVnpTfu7Mj4WeNzo+SOBeskGQbLMmiyzppMjsaNKFlmyrJx-L8bbPF4kTguTMtKR1NVmTJOOnktSe7OMY-DP+3svScTP9nnSyZIcsWebLfETCpZXfGWZHOoGJTY57U9aQnIV7hVk5HI36R7LxkZycEItH2dnPzkBzjZec02QXLDlwzaZCMxafLOWmKy2pa0jRKzMTnRscZTctOY2O0ltzgZWck6TnMDmBDg5fc7uYXIuzviNxd0+acPPplSDGZ48tGVEWnl1yk5GsjIRePym6zl5hMkaaVPXk9yg5r8rudDItkJ8exsUqATuNHmkTz5Ts+OS7PVlzzOZf0-qQDNLzO1+Zvs8KW-ImkfzDZyCgeVKIkl0y5Z9shWY7Ljk1zwFT-W+c6Pvk6zAZT8hBZ3O3m5zUFfsr+TdKpklyyBQ81PojPsl1Cq5k8jGUQvrkkKth-0h+RQoGrPyBZW8q6TvJFkMLxZRcyWVbNLk2zsFds0+Q7NemgLCFyk12aoPnmdCtJvMyhfrOoUSLaFm8z+TQsYU-zTBMUiOUoqjmVyQFBCqebXO+luycpXMvabAsSrwLDFa86RSgtMVoK-FGC62VguPk4KVFeCtRY4p4WaKIFHM1Obov2nCKmKHc3xeYvfkBL6F6S3eU3jkWSiQlp-NhSPNwVjz8F1cpxbwpvmQKElLooRXAvbmrywZ2SqRc0tun1TretiiucjK4XvS9YV8lxdoqgXNzZ+c4kRVQrSXGKN5yE8RRDLaXWSOlYS5RQiNUVKzolfS5xVorAk6Lal5CuBci3GVNLJlGS6ZWYqOU5LGipQuaQsqKUnzllkS1ZeUpiV0TiF1StxdAu5ksSvF+ynxYcohkmyzlwShRaEpuXhK7lpSqJY8vWWVLZ58St5cMvTndCcE3y1Jb8uFn-LZlTC+RSwrLmdL7h9ispdwqhWxKXlsKnae4u1mfLeqyKxpYLOaXorhZcy8OfdPLl4rulDiyFUCH6WbLGJ2yshZSqRZuYfltKgFfStDmMrB5OKxZXYrZUErelnKjZXEtcVkr3lHiupV8sFUorhVfy3uQCvFWYLCllA4pREvBUPLCV8q6FVFwblOiBFMCtVVSo1U0qZlaKnVRissWXLD51yw1bcujnX8el6Molc8r4WvLlV8Kxefou2IOripRi7VXQqQVBK9VBS6kWGKWU+qUZEKs1YdWJVBrSVms3aRSoZ7JLkmByrVc6tjVGzzlRZA+e0puG4qEpMq9NXKszWBqqlOau+YIt2XqqnaL8wJXSpdUMrMV+SoFQaqqHer8VDa-1eaqzUtqlVua8lRBILV7LI1RMiZTGsyVxrWlA6-MUOqTVETBxY601Y2qUnNqYVM6ttbao7X2qu1Yi05aupOU9rdVm6v+TYqlVdK-xaag9ROqbXuTuVXk3le2v5VJNqVUaldaWrXXlrAV2KxRS+tZVvq-Vl8hVSStPWkL-1C6ztcWqdWhzRV-chNdurNESCOFZ82VZ+qPXfrFVgympXytQ2Xr0NN60DXeqyUPq3VH46tfDJBUpr91E8w9VyrI1bKhlC8vRY-IjVXrEF4G8VlYQDyyLLZg6yDcCq9WgrU1sg9RRomaHy9l1hiFTdnlf5-rz1AGyeLKkJlcCVy4msKXyDsAwAkEEAdfrXRw0ybh1NI0dcjMU1rKOy2jEMmxMQ0IdJ+s6lVfmt8nbIeS+1KaN8p8SmbSgFmqzZoFEbtAzN4WuPkxqrXzKa10GutW+qc0cqIutc9zdmo7Zeaz1HyqjV1xIA8MhNXuaLWFss3h9Y1BgVAKYALAQbzBUGtjdKtS32D0tJGkMkKw828aKNKGvzTgn0azwUqPiarbVsi2+i-gyAUwFCAVp7zi5WKhrbJpHXybEpaWjNVs2NyVYoaCRYxKZ1xkjKl5wE5isFv-6uQptWZQ4jvj3zfCviR+e4jds-x3a3kTxGYC8VuIvwfinxN7SCg+2-5-iABIAiCTWDhgoSqAGUGghABwlsE1GWApiiIQ4pSE+KOCoQHQAQQetOm1DbKVZzFbgNPFLaIgHsCmA66KO70Gjvy0ylLkvIn-o6vZgxwCd-inzMTtsCk7VVHazHT2n8nXrF4tOybfTrWiM7mdvmxMpjrngLikqQ2zaE5Dp1E7UdcK-jUkv3zw5DuyMcXbhAgQ87pdJO2XYks8XC7TK7ElXWmDV2E7RM-OrXTss+WY6vAFAURYgvphS6TdMukNXLp10U7tAJAAbSVuqLHxKQXkewJ0AK4O7NdTu7XWquF26AqdVsY7dh293YBfd7FSrYGlN3B7zdGO13QuArQ27-y3O43QRyT3ebQ1Ami5O+l-R67NV0cPHfbtz2O789zu0PWnvLwryxdS-Q3ZXtRx568tLOi3fXpRgGa7qDdVvYnur0d7BdzuTHQ3vRpsThtA+hnUPuQ3o7ydxe8QD3sFaHCQC0+vnbPptVk6hd3exvXrqn3q7A9TOs3ZRoX3qQESy+v2OEwP05629m+pMfPp32L6y8l+zxMXTLrr6WY7eufdvtH317BCVqQdjft51f779fU3-QlTZ24Dldze-vYfqr1B6a9Ie1nWnqIDQGMaa++A3fsQPD751Z+vTegbIISB-kEgUg2QfIOkHYGn+90N-q32d7U9z+tA6Lv6GYHb9g+nAz-voP4Hu06B-fawZAM0GwDO3Lg0-vP2Kh0D1+-gxruP3J7T9ohgg6LqANSGj9AuvA-IZ4Oi6VNwB6Q6oeYkMGxDxAUveGyoOH6ji4JE4oDPu2XE7tX2h7ZfgeJXwPkzxO-E8iPw-aXD5+b7WCl+KQo-tgJAHfADCjok4An8WEiimuow6USCBBHRiSpTI6hDXwkfZAbT0YgnaUetMO0DgTHIEDMhpAynu4PbIlUEe7xWaXLBQAggrQOoJgCMAOgzDZyIvepCsP7xHknhuw+fFUyOHb8B+N4t-k+2uHP87h3w9Cg-iwoQAWRhBGsAgDl1AiMAGwN6B92dpICUO+9JEfgLw7gjyBQjrMHu74lmF1Qe6WQFSPcpLgaBmAGIDETl53AdwYwN4CIAGAdSmAJcOsHtTSJDCB40gMHy4LfLeCpB9kblhP22ItkYa7jGzqMOR7BVPiQ45iGONXBdAZxi43sCuPXAwAtx+42QEeOuBnj7gV4-6ljXrBAgggCRfVvEl2bk1zWy0b6vZVrbVuApY9vB123aaIDiKxcYNtgMegCTRJ0RviYiBEmbNC20k7ut-EUn31nG4jTSZvRwcJ+e2hFTyLGX662TGwDk2NV9HcnCTUFPkySZ3XxS919aj9UqJ-oSm6TUpxkyIfxmU7Uy3-BU6qc5MqmlTAlDU72NYVyb2Nup0U-qfoaGn2a9J7jrls4NJHmTVsQPvKa9zWnlTeJu09wGJOOnJVTW19cKbg2jj5etJr08ab43IHdNX-FNsGfrwRmsAYU0M-acfViTozjW50+ScjEJmDx4p0yJKZhZns0z+Rr2a+GZ5N6QzuZnoFyfbNRn-524-DUtOAVEb3TYTT08Z29MxdpTwJ5JYO1ZNtmeTYZtdQWcjMOmezhE7U0KYrNUnD11ZgviZx9MTnC9cCpRFc0tOzm1TAlTs3OcLPxa6piW1jWWbjMbnBziZ9LMmdHOpndDnss027uhYzmczl5yMxebPNLmiz1i5lbWp1OwbNzYp43K+bbZjmza+5+XYlRU2-ng0XZwC7yZAtXKktsZmDfGagtDmYQsFs2u+YBOP6vzNY7M2hf-N5mML6prCx6pwv3m8Lj58dYRaZY1mjTdZnjrgb0N9bM1qFv8OhdtM0X6i152Gfqq1OAKSlA5ti8+f5Ijm4LpF2Q71qbOKg+yglqyMJdjUJ5+AIgUIHwABDdnn1uFlLfhafMHip6XUnc-BdhYmn-Tsp65hab5FS5dLfAfS4ZbG3hnRLxlsC8logvmW5LVZmC4pZIvcXfTdBhy6MvvQeiYDp5m095aAt5nlzJl5i2ZdYt6n5LBpziymfCuIXPFvVG8a2b-NJWOzIl0q75aPmmWArGVt01lY9M5W3zeV+y2oYotKgPdxV6ixVbotXnJNv84syudlkunILFlxSduaha2X6zH5luQGZ5K7JNL46bSwua7MpW-L1V9cw5IIv1XhzjVpS81YbNyG2r05uKyVYSvLWfLq1qq2lZqubXRrjgkK7tbCtF8WrfFtS8QBbMnnTr85+jSAATytA-dhvM3uJepm4a4p0l41bJcyuWXoW6WLLblYtovXPzrc72PCGPPpGnAf1gGwnp+uLnkrDFljU6aW3DXArUNsaw9ZsvKW8jh15G0w0C2e6urZ1nGytfxu3nCb9m5ba6YvnbWiLoVtbs9YOuqWKLyVG9EFohNCWfLPV4C8Db2Oam8NUQgjSsrqvBWkzvNuegyYFvkWabFeNG2La0sS3yrmF6W-Ntltg2+zQCmOVteVsvnVbu58c4jZmuOW9g6qQmejfZP63Erhtvq1Yuwt3mib5Z260FbJsq3HrfNnLflbtWF0lUOo+m+Le6sG36LRt6Tfyaktm2ZLFtu65s3Gu1n+b01-beGqhgDoLGrtxU+7fOsVXLrnqv2w+YDuk37rwdim-tdzsynorxkJdcXdxtlWPbCdr2+6oJsxnrrG1zhZbaDvW2Q7atvc-bbzuCaFwhpLtQbp1BLWmbF1lm0yqutV2WLNdpWyPYUtj3bbCFye83YO07JjzLlhm99dNKx3Pbs2vJVuts0p35b-Z9O4Hbruj2G7Odsi0ycctW6ZCVFy++fZAp63y7K9iVaWfXvpXN7XNq2zvbfth2D7k50vF4BILOX57btuO13d6vX2pNt95O3LdlEK37lW9l+9A4muU3eLSNgM6KQ0snWz75530ZjfYqt8e7zG1m-3bAc3Wh7Gd-dqtzhtNWEbGtz+9FdBCVRRbx3NMPQ-90b8wN6Ciu0xbYeD3CNz9lWRaszWtq-TrVmm+D0DMCsQNmGvtWKuAeSXcH7Cx+5Sc4dgKp1J68jR-dNMaORb2gIM6it0dlrpHBjxNUY6NVgrIbhDpRxY8tX8KH9Ajo+5o5ILaPHH-crDZIpke+32bxN2q5A8UncautPK-hzY4DPBOHHJapx1I-jWuPQbAC1OxDafu12fHx6vx8GqpuC3bHTtDJxhvCd6PsNuTu++44c0jXFHzs3xyo6Q2RX1HaTux1o7gn3rb1F92p5E8ac4PTbD9826Y7afmPSnnTqxypc1tpPsdITgZwxqGcAPaN+jxO9g5Nv5PJnad6Z8U-adzOlJqj7p69YosfWanWzup845yc7On1a1ge0jNafHPZnpGpJ7+pSdRWgnKzm54M7o3DPbnozx5wNdStyPXnJN7xyc8+fZaFnFTpZ45euehPMndz7JxurBegW17MT-2xw5mcaLTnqkxuT856fIv-nqLkZyYp+vgaonbNsk9XfxfvPCXcL6dQi7IcO3or2g1Z9GqBebPAX2zphwltXuV3cXjLhR8y4qUdOznXTgJ6k8cvcuAX6zvl09SpcWKhXN5kV7I7Fcb2mXMLj59ZZ43JOm78DxKoq8pcgvqXwLgVw06xc+36XgpqF3E6U1PLWXlj7rdY9+f53zXaz9dSKvqeguNXEltxxM7wcmORT8TlmQhvhcevFngT71xpSmhKu-XGz1V5a-VeYP+r2L0Vwy91cSv9XLLw1185TmeuyX0VsEzy50fouaXLju14xeie5vwHeryNyU7ddlPzncrr19PYrfJvRNAb7+UG5BtNPQ3xjqZxG5dcBq238z2N4i-jfdv0x9ji1za8kUROB3mb72-W4ddrmnXEDid5OqJdWrepwhrt8kp7dLvlXWTmtw88Hcy2Szi2nV02-zctvYXRbmN8a9LeXOabZ73132-ueYub3xtu9wKe3f4OTVBbqVwe-8fgH5X5bhd-095eXvrXF721wB6Tt7PezBzwp0c-A+uvX3bLmdxy6nunu4PlbsJyu-7cZvclWDp5zi8bfsOn3e7r9Xh-dfvu43MHo+9+4Q-VukPKb-tXW77ugOH39HxW8+4NebSjX3zk1wed6axX4PVb8j3+8Y2ofdnQH++2G7HeVmEn0b-D6x9nfsf87-wxdz+-QWrvKPFy5h1q4beOvQPXj0T4W-E-FuSXUnpCyZVk+ke0XCnjF0p-Xe92WHgnuj-I5E+Mf2tDnt95J4-fkPHLhnuT2R6tf8vkPgbnzxZ5Af3uAvO75t8F8SdheS3bHk96Xmi-ue1Xxynj7S7GfofVz4Nzx0U5w+TvmP7b2V9B7y8yfCZvbkzxR5kVJfhXKX4D5V9TWaeo3yjmV+y7UefuAzBX1r0EtM8deqPWb+16w6E+BeCHdniD1O6G8EeRvkX8t254m+9rFPrq5TzR5zfWfw3-X1t3V+ne6fCPh9gz9t-Pe8fEP8X+7yh86+avuvan0d4c-HfOamPoXnT+F9y9luOPt34z5N-a8VrpqXXwxyO48d9fh7A36V8S+tWdvAfN3lr3d9-def9vL34N3k4w-qfPvp3l9795Y--e9PTX1z2j5B+7fMffHg7+C+eeQubP1X5b7h+J-1fhvFzzb0D8p9cfPPV7-99j6HfjP9n+PrD197a1Ze-vOXsnyj+7fA-efcXtN8u7XczeN3An1L8d409w+zvbPi76T6u+mvGK6Bwr+m+K+PfSv-Hvzxr5A8nftfRPrGRJ+l8G-pPRv0XSb+V9TKSvtbun9m+1dpemf2Hln7V919rfLvG3zl0feN87f-Xe32n4L9veDWWVj7oL995C8O-HPSPxr7L+SVR-0fbX2P4K-j+AfE-4Fxb2B6D-7vVviPo94kez+l5c-VPmPzT8L+q-fPlnrd71440V+fv6f7L054i8R-87DfhX57-N-e+i-aH1T8045tvOavlf876H-1-h+iP9ft39H9Tde0LfPvub-5818E+7fYn3v1L-78A-Rvjl4f-J8V+b-x-rf5L1D5F8fexfhPw-2rIz81+tZdfxKhf9i+j+lfCXlX+Z6Q+Ibg-4w+Xfpl7aeJPk77L+13tPbf+Hnlf5bGW-hP4qeJfv5Zl+tnuAGDe1fuHYXqhdHAFFeAhtf7XuyAYd5++e-k-4H+9nkf6QBJ-jL5n+0VkKxJuefqD4F+z3rf5ABuPhV4FOVXoH6YBCPoe44BGZtsiMBRniP5m+f-k96Je7Aa973+ePo-48B4vmtqS+NAZn7Hun-kb7R2MXvAG-+RAQL7SBOPsO4gBLTtC7d+afq-59+qgbX70BkfpoHu+--joGIBN-oAEyBwAXIGgBnNnwGQe5Ts74ueeAbYHr+KrroHee+gUL7leQ1ni4MeqfsoHs+63pz6D+sAf4HMB1Pvz7BBzgQYHC+bgcYHOuUQRAExBYfnEEr+X-okGN+G-o4HEBIQQn4QuC3ul6RBEvrkF6+UAQUEwBOfsUFiBhAWUF6BaQaEFT+0PlkG7uOQVgECBcDi75+BFpgEEPeEgUgEVBxflUH++tvmY5UB5gcf6WBH-tYFD+rQZf4OBfuFMFdBlQQz7VBAfooFca9QYv6NByPmsHT2bEkwElBgQR0GpBlai4GcB4QeK4p+dQYMFQeagRcHJKVwaIGbB4gUEFY+0wZP6oB61jUGvBSgScHYBwwb4GQMPwVoEEBLSvcEQ+jwYYGZBM-iYGeBVfkMGkuXwaxJKIshOMHceY-uUG7BMwfsFzBWvgsEreC-lCE4hXPvnZwhdgZIEIB2wU4EPB6QWEFJ+wnkt6YhNIdiHOeBVoXSMhhIXz5e+JIeyHdBIIS86HBz-osEzyeQUv5NBhvkKH4hzFCKEshfweD5KcKIRkFcBmHgoGyh1ISH60hAoRHawhqodcFtBiIYCGkhwIbMHkBBoZQFGh1AQqFnBWfriFeKRVkyEY+KQTaEShewbR4OhsPlSGs+LoQ0G0BPgYKFJMXoeqFbBmoZVZHeNvpSEEuzoUsEqB7-nmrqB69DGFJBTfr6Fx+QISgH2hSYfv4hhwfmGGnBEYdAHKh0YUVLeh+fs35sBtoUWHkhQYWAEDB-AR8FWB9IdPaWMFjLGH-BdwX6HIhHIT0FGB6IdkFvBnYd4HVhIwbWH9huYaUGsh4oSOGShxYZ34eBHYV4Edu7oT2GFqOYTcETBAIQWHNhpAVZ4lhFAWWHz+xofyED+hQYVZ1hA4e0HLhnQf6FkhgYReGOhV4T35phroVWFKhc4YVILhh4USGTBbIauEBhiYRuGz+pgdEHhhKwZmEehD4cBFWhU3lqH7yOoZyGl+YITyFbhWIV2GrBe4fUqN69YSwGNhUgaeH0+H4dBEYheEXyEERiEURGehJEU+HWhJ4W+F2hrYZ+HBhKYaGG-h8ERmFzqSEdmEsRi4bcEvhSIdqGjhUoYz7zBvEeWH8RlYQhFCRTEYVaiRIEaKHEhr4RBHvhUEdwE8RkrnxHyhAkYIEFa0YepGoRYPgmFkB3Ee2FTh24Q16fBqkSJE8+8YWhHWR54TRGThEIe8EzhAETCEVYQGqRHJBYodpFSRa4VxFeR-QfZH4RfkecHORgGkuqsR7kXS7zeFIaWHyR14RWEmhd4c0GLq1TmJFHhQ4exE6RnEdRH6RdkT5HThO4U5HxBhakFHJRVkalG7+tkZuExR9EXFG7hdUflEEhhUaBHHhLfpRG++nkRVFtRVUQ5Ec+8Ud1FoaaoX1GaRYESuHhRkETZFRRGXnRE3hDESpHTR1GrNEaRGoT-7TeQ0Tv7W+q0bUHjRsUTVHdh20evQuWloW5FNRZXmOFohsTtFHnRHUZdGER10Uky3RvwQdHPh8Yc1EnRo0TBG8hG0Z1G1R94TdHFGjUawEURHES2HlR+oQZFz+P4cZFKRgkT5pZh30dDFzR+0doGHR8MWeEd+wMbRHtRYMR9GMRX0eXw4xe0XGF-RHkcTFIxlUccG+RFMVtGQx2MWMG4xdMfjHoRc2mVF6RTMWNEsx1UY5FXRHMdTFcxtMYOESRw4UtG6RK0STHeRIsRNGxBU0RLHQSx5jDHkRAAYTFURgsaL5fhmUajHXy6YaZH8WwGndH0xKUY9EyRBwXJGGRCkWjE5Rp-glHl8x0lbG8xbEYNF6xw0YzGGxyMbBGQht4a7FUxmsb1HSx-0fTGAxPXkrGvRKsRdFixn0RrE9CHsb9FexNsZb7t+aUW2HCxxGnBHox5sW9bLqnsQiGZx2-pu45xrUSDHrR2USHF0BbseHG7RlkbDG6xpUQjEGx8gYHGgxdcZtGYxwkd9Fpx8Iab5RxXsTHHve7gTXFkxvceDHixeUV4r7CpcSPHexTYb7HHRscULFTxb0eTFJxlMSnG8iQ8cFF5hoUZJEYR0keuFxxa0dPGKRLsQ3FhxLmEGZLxHvjLEAxtsRfGbxpMdvEzxbMf3GNxD8do5Px9gS-HRxb8ZFGXxZ0QnHvRu8ezHzxvVI-HpxZcQ9FZxb3tP4vRV8V-E3x9cZGFmhAfAAkIJy8eXEkB+sYrEfxysfnHBxfcQXoBRX-PAnDxz8aPEIh48agkRB4IZAk7xk0V1H7xvwYAnMhPMYwmgJiMQHHMx5CazHQJv8ffE4I2vM3H3RrcWZ5rxlcS1GnRrCSImixHCRDGwJ69FIk8JPoSfFyxZ8RFGCJXccInwaoiWolzxNYVrw-22iQ2H5hPse3FExVcUom4R18c7FYJs4dQkuYWifgn0JK8XDH2JxCSNGkJ8cSomqx+QerEaJybFYneJQCQwnLxTCb0EThwSSYmqJasZwkRJlia5HWxSCRXHq+G8UIl5xySaEmKh4SRYmZmSunQkxJviW3HyxAsSQn5JW8WwnfxYiVQlRhWvOUlHxS4a-HIJsgXqH1Jn8Y0mYJlCbXq4BB3AVGRxVSXIn+JfsY4ngJyiYUmJxZicnHpJZSWMktxOsZMk1JHcXUlGJBSczQFxt8dgkjJbSaskyJ6yQTFTJ68RPF9B6CQMmuJQyemZmRxyRHFrJtiavEXJCiUDFBJNySEkLJqSeomlJnie0naxryX4mbJDiYomzJziRgl3Js8UskApkiUCncxwCWPECJncZPH9JPyVAmLJe8csmApJyVkmyJ5yWCkBJ-sTskNJmKewl-J5iYBErJzyackgp1SfonLRgSX0lkJ8yVilUpcKTSl4pdKQSlnJfMTfbgpnyaylJJeyRQmwpOKfCnaAd7NIl8pDKRslMpCsSylkpGKeymUpYSWklSpVsDKnWJZEfKlEpiqbUnKp6KWylippiZymSp3KTgg6p0SbwnIp-Cd0muBvSSqmmpB4vsluJ-ka0lf8NqRUl2psST4nxJ44WgkQJFKU0nYpMCVqkb0UsS8m6JJUcSnTJEKV8khpaqWGkWpEaVanSpm9LKkZx2SUQkJpwqS6mipbqeKk-xLSTgnepWabqkhRWkafH8xWycanXJyaWakpJGqf8kZp2qZWm2pOiTWl6JdaUKl5Jhad8kppgyRKnppHidamdpvqd2kLRYUYan1ppKSalFpWnuamtp1KeOnaAR5ryk5phKQKnUeJKTMlJpcyc2lFJboW2nrpyRP+hdpNibGl2J8aZcnMJLwVCm3JpsX+HKR4iVwkXpWsUin+plSYGnPRLCU+mhpI6aWnDJQgTgibp2aYgk7pDMQekipQ6cem-Jq6VynnpghF+njJhCYWH9pVyYknwZxaSunFJmqe2moZW6VBn8pMGYmlwZTaXhktpBGWelepLmO4BUOU6dek9pcaXOlYZD6Xm5Hp1GSen-hJSURmMZKEfSk3pbyXekfJA6Yum4Zy6TRmnpa6fRngZTGR0niRXSTklW+EmY2ncZ0mbxlvpZaUclf8gmSRkEJuaZhn7pFGYOlUZWmYhm0ZcmeWkMZimcCkiZoKexmmZBaZJkWZ8PtpkYxumWBkbp9md+kTJBqX2kuZ6mThnuZOvqmlIZlqShkGZkGUZnQZf6c6luZmmR5lWZsmchnyZvmUJlypjmYylBZ+aSFnBpyWeFnAZzSaBmPJX-CZCZJ26WRkJZzwVxmAZw6TCkgZDyRbE6AP5lel6pOWQql5Z96QkmFZDWQhkcpkWWOkZZVsJVmGZPiRhlHR4mdhn9Z5fj3ElZ4ae+m4pOCONmxZk2cZnTZuSbNkAZ82bXGLZaactmRpa2VWnHxrGbenOZ+WTtmPpe2S4kvpJkdCGjZbWVVmkZ+qbumzeM2ZxnJ+A2TxmpZfGYRkoZJ2R1nVpM6bWmCpwWddn1Zt2dCn3ZhcY9m2Zq2e1nMZnWedmiZl2b1lBpu2RgH7ZTWaVktZxce7r4p1WW9nkZrmRpk-ZlmUNnWZ6WQjlu6HVkplFRssWxk9Zn2X1lY5zPgtm45S2d5nlZLmITkTZlSVNnyJ22V9nch0Oc+kDKh2TzmtZ-OetmC5m2cLlqZkOd9ni5QGVzlS5ZWTLn05DmajlOZLOSLls5N2djl3ZkucNlHZRGbLmnZnSSAmOpTwVyHoBHOTjmw5Bye4lPZlucDlnZoOb2ng5V2aLkO5vAU7mm51OVFlPZugMI4e51uSim25qIYlnk5quY1nO5HqfxkoZYedGnCZuublk+5GOf+lG5juSbk-qaWSHm05VsKnkC5fqQFnvZavkrl+5OEfHmDZ6qcHkjZxeUI5p52WRnndZWeazmY5ueQHn55jvv9l0ZzeaXly55eULnvJBud3lQ5xuTDlB5heU3l6ZLmMPlW5ymTbmqZ2cWZlJZFOSllU5c+ebkp54ecjkg5A0Wjn651eYblT5eeTPkF5A+TZkL5OCEvkR5K+VHlr5KCefkq50+RLnX5OmZrnFxD+Yfme5x+Xrmd5E+TnkX5veVfn953+fjkUWLeWXnTpgBZnl7pvuW-li5H+WrmJ59yY2YwFhBGhkxp7eYFnAFZ+ZPnv5l+Z-mQFXmT-nYF81o-mM5KmXmnZ5seaFlFZ9vgdlm50ucXE4FcBSxle5zOYQXr5ZOUwVb5xWerlsFlBTTaDkuBenk8FF2afn8FBWezngFZBW-5FxVBZIVt50hSfl8Fr+cQWoFpBegWz5N+TTl35FPGoXE5XWQQVIFDBXVkkFihfoVf5FBdAXiFnBSPnwFxUTIVaFPSdYW6FthQnkGFUBVgVOF1Bf-mR5DqS-meF9ubXloFvhfYUqFgRaYWvZ5hZXlt+2haAU2FRwXYXkFsRQGYSFXBSjkaFQBZYVd5qRd4XpF0RZkXw5xhe7zxFcWTVmop2yZvl15v2TvmGFReZUU5FLhdwUIFHeYUUgFjBXNlRF9eRFmN5e+U9nOFy+bQWr59BUUV9FChaUWDFrBcMXsFqhbkVH5bhZoU9FRBcUX+5cxU0UN5u+UsVxFKxQAVrFBRR9m9FXhdsWGhRkRgWjpIxc3ljFNBf1EnFiBWcWbFMxT3k7FlOXsUtF8+T5lVFRxSEVxJdRQ2mCFjRV8VDF+xWIXZFDxcEVP5oRVMXnFERTKFOh1xX4UOFARdCVBFDOU8VM57hRsVyFyuSUVXFTsTcXNZGJY5btF4xTiV0FJmcgU6FlxSiUklaJVkUUlMJdiXzRXRRYWvFBJTXnIl34WYEiFixVCWslWJTrn5FLxVXk8lKBQyX8l7qZgXU2mJdUUbZ8WcCULpceQMW7FEJT8V3FbRWyVilnJUkV3+TqRcWRFehWUXKFFRX8WUljxRyXPF3RdyUpF7xWAWfF2+d8X+FCpSKVKl8uSqXR5uoSaV8lxsQKWkleOeSWCOepf5lj5YmYiXYRAZY7FZRCxZCWOFipQCVwlQJb6VYRaAaaU+F8xYKWJloZUfbWlsJRMXP5CJW8X+lDsSjFBlzJZaW85-WqKURlCuePlllSJRWVBx+GXmUelYZfWXoZjZVGXNlMZa2Wc5wZdznClXZV6Wj5vZejnTF5ZcmFxlJsdWV0hEiSYUplxZfCW0lVhS2WzllZXKW3FBxcmUdFeRQaWk58hR8XEl8ZbmXale5Z6Url1JZMXrl05ZuUZRc5VWUxFNZa1nhlPZT6VhFxpY+WXhgZTuVklnZQWUfleBeKX2lkpY6UzlT5duUlpIZUBX52hZeyV4xa5Vtn9lmZbGUwV7ZZeWjlwFd2WgVR5bVm-lRsc+UAVcFZU7QldNkWW3lJZfeXRl6FYOWB5r5YuUfpUZJRVIVfCWmXflduQOVblbZTJnYVSZayVsV+pXaVclEFeEU8V0FXxWeZLJWGXCVDZV+WllUpfSVZlLpcIXDlGuYJVyVWWWYX4FhpRwEx5UFX+UkVsFSOVaVwFfJWfltRemVPRTpWkVnl85UxWmhupZZX4VolfpWYRtlUZXEVmFfxXul5FUJU6VCRXpXHlhJTKX-lplZpX5lCFdcRBVNRSTmEVklcZW+VMlW+UcFrlVIUEVqpbBnmZzBS-4Xl-lUi7aVN5baW4l6xQ6USV9FbxVDlC5c5VWlsVSVXIVnFUpWQVRFd3GMV5RcxUrZejBlXqFWVTZV2x6UclXSVf2YVVzuhag1UHlqxWVWnF4lT+VJVPlSNXNFY1fp69hk1VSWlVNJahXKVWxapUOVL5Z1V1VtZT1VxVypdZVcVhlW1XGJOZRpWiF5lTFW9VulWBViVyRZVWghGFUtVul6JfBVrVj1cFXPVHlefFgJh6UIUsFBVd9UBVxVVNXHFM1RKWvV81VVVSVNVU5W5RkaetU2lTVQGnZVG+eqVmlN1bVWo1RGejVUVm1XeXbVrVQtXtVfeRaVdVaNX9XxViRaFW8lDFdTUWBENUVUWVp1d6XnVLVW9XShLNRAU01R1e+X01Z1QlXY1Ahf0V41mpQmUCV0Vb9Vc1E5YpW0VaFe9UC1ShWzWyVnNY1UcVWNQNXvxlGXlVyht1UKX3VCtTrX2pzVSrU7VdlUSWMl55SbUdlkNdrXQ1gJXrUXVfpVdW7JMteDVa1D1YrWuFsNeBXw13FYjXDVyNYdWE1KGcTXsVlte7W81CNWrXVVHVULVR1oxaLXc14tfrXA1htaDX5VjtXLU-VE1RnVK1PNdbUU1YdYtUR1qdaHEsVMdSJVB1L1UaWh1SdUjUp1mtWlXYFJdYHVbViuTbXeVVNYLUd1tNUTVsV3apnWM1iVZXWD1GtcsHs141XAox149aXVZ1HtRmWt14de3Vz1ftebVCq-1f1Vr1XlV7Xkp5pcPXC16VRzoianRe5VM10pXtX21jlZHW113VbTaX1blY3WA1BiWim412ZT7UF1K1eT7r0S9ZzoT1IVVPUb1VdVvVmxndU4Vj1IDSvWT1EtSeXOl+1aRVmV8tcXVv1mVTfXgN-NcnWs129TA0UVWDX1U4NSDWFX31spZFV3VGDYvVwNV9YeVkN2dYYkNFGpeCWy1ADVjEVYwDQw3TVvdU2X91x9aqn41KNc-V01JDU9UH1CdS3V4NbdQQ3QNI9dHX0N79fw19lgjZTXXVf9QTViNo9RI371TDYfWDVucSfUiNT9XfF11yjdg0f1t9SpUfV1dWfVp19xZY2kN1jbg2yR+DUPWENijenV6NDNWA3kNzNR42z1CjefVd1vjWLWINzDd-WglbDa6ValnDQPHcNzjZI0GN0jZdUaN3tew2+1RDYFU0aETf41RN9RT-VqVYNf-Xz1q1Zg15NoDQDU2Nu1XY1QNr6eU2ANSTDw0qNZNX3UV1EDTPUZFNdeY0v1rFeE3VNUjeXV817jXI2eNITY40uVgzQg0FNhjQbW5VedcbXaNfTeI1VNszTU1uN9sUE09NDjTo1KNMzT3XtNAjZ02yNm9fI2NNO9ZU171fjZs0BNd9fU0XND2d41ONhzdfWuN9zbY3q1uzV42hNsDW82MNHzYU0glUtb-VZNZTVc10NALXw3HNajac1jN5zRM2XNOTVDVl6tzcM3k1ozds3jNwTci0vN0zes1HNNFZi2J1ZzZA1PNcOfi31VyTfo1At8zTnWLNYJXE0cNTTVw1f8rTVY2qNU5XRVdNmjeC0rNhydS3QtMNVy2yF8Ldi2ItuLc81-NxDYS3vNorR4WktCLeS1It0rVM1CtcrYC0Kt+JeK1DVKrVK2UtMrbk03N+TXc3AtapTE3S1-LaI2rNujZq0wtxLR01Yterd02n1vzeq3HVr9fa0itsLdy2q1ZLa62mNvTYK2etAzd61u1v6Z811N3zW62TN+zT43htqZfHUjNSrRK36tPzXG22tBzYm2rlVtSS0yNyrYG1aNNrSG0i1wrRG3l5WzS618tzLdk1UtobRy0uN2rRVWpt1bZk21tELSi0u1aLaa0YtTra23GNwjcW1mNpbRfU5t1FShX9tBbWm1Ft1rSO2u5rzeO2k1jrSc3Otg7a6lztwbQu0EtJrUM2pNKbdO1ttJjcO1btnqYu27tGzX22rtA7dXFDtm7Xs1ZtCbRe1Etk7de2Ht67UukdtArdu0atz7fK2+tYrWu23tG7V+0ltP7Q200t6Lfu35t6TdPU1t6ld+1ntO7T217tdLWk2e1GTce33t7rfG3F5c8O-oodl7dB1TtsHby3ttCHWB1Idfxfh2Z6nLQB2Kt77cB2ftFHfO1UdnrTR1LtmNZG3mtOVaw1WtoHax3J5o2Rx1-tWrfR06tQHU4lMtLHae1CdeHW0i0dTbeJ0ttjHVJ2xNMnQ+2jtQtgp2cdutdx30tLDcU2oN1DabW0NiVCJ2EdL7Xm0kdGHXB3kdpTYh1ydlRRZ3U6vbcR1vtpHQG3wdDnZR1Od1HTp2idDra+1wtknZCnSdPnYJ0A5wnQF2Wd-7Su0hdN7Wp38dGnTh2Pt8nQR2udqHc21zVqnWF3qdEXbJ1Rd6XYp0pNaHQe2edhbd5351jnUV3OdMXZl1EdZXTB22dZHVh0CdhXYPl1dGXTjqld2XSHUVdM7VV3LNvnbV3+d3XcupKd8XX63qNdnW10pdmbVp1a29XT120tfXc3UDdR7Xe3tdmneB0WxLnSt1QdTXTZ3r1XnfZ3VdI3Z11jdJXat3KdOXRt0ftUmdt2pdi3QGb7dE3b123d-XS12ndc3QV07dbHXt3Ld73Td1TdgHYl15dyXX93Pdu3W9Zvdy9VZ3JtzXSd2VdZ3cN2Rdl3ex1A98PXF3Bd03bq0PdYWVD0LdMPdp3jd2PWJ2g9DHfd1Mdj3fN14tRrS3ZY98DQj36d6Hcj2DdqPamF1tDPUfZw9zPTj3WdHnd90o9v3ed3o9t+Vd26dcdaz3ldwvRz2i9aPR10S97HdwRS9P6ZW1RttteFUmVWFQk1-xO2H07A9h3Wt0GVcvZt0gddPWq24dznar2BdPrZT0Sd4PSDXhdYvUr1GF1Hbb2xdFPbj1g9uXc735drvf91+dKvYb3k9QXYL0JdfvbnUu9ivUH2jdIfcJptNDvSp3U9SXWC1PdxPQD2w9nvQ10s9GvTx041lren2W9hrR617dOfQd1udR3UL3s95vcx1E99PWX3Z9offz3e9EfXj2hd-vZD2B90PVn1C2FfUb1V9JvZ5VGNNPYT099mfcH3l9KzmH329PvVT1m9BPUbVc9nbfW3T9zlq33h9iPcd1H1mHVt0l9LuX31a2u2Gr0V5tTVr2UNEVbr2stiTeajJUM-Zv1z97fb72p9EPcX0N9VvWl029D-bw1P92-TX279s3fv0f9pfdb0e9P-Un3z9jvVH2MtAfbH299U-dn0QDdHcn13di-WP3L9qJRd3K96-af2RlHfU73R9cAyv01dGPbgN29FbTsE79o-Wn0lNE-Y31gD7HUqgn2j-ZQPgRkfa-1d97-fQOf9L3Y7bMDeA5OUv96A7QPGd1-ZC3mdAgxQNJtMvUj2ADrXcAM8DoA1-3UdUg171b9sg9QMLNfHdwPwDk-fH17dag7n0C9--RwMiDb-XQN6DDAyoNMDibsYNt9pgwQMwDOg5YMkD2A+722DLA7-1sDi0U4OcDRA931WDvAyT1a2Rg5X1Zdn3et3mDXA64NYD4vR4OGDdg+EONdw-UDWGdRfbENMl7g60WqDSQ4P0RDqA19219S-Us1uD8QzkOeDgg8rVyDNAxYNiDflTf3693sGEP5DKQ5EOm9xQxgOlDcQ270VDiQ14OQDz-Qv2dDogw-UHVvQ78WVD0g7m2ODwgyMN1DYw2g1RVRdRsQtDs-T4Ozpcw-IM-dig0EPKDfAy3ZrDrAzIP59BndE2gtmQw7WkDOA7D1W65bScNUDAA7UMxD9Q6lVr9twyR7rDDw+wN+D0QwEO6DZQxMM6l1HXcNVDZdTUPaDRnYsMmdTtRzX52Ttp8PHDMw5oNPDkIxkOvDo1Y0NLlUMKCPTDE7UMPQD-g7AOBDgI3H1kDHw-cPIjpw2z3bDIvbsOkjCAwYMUjYI6vU0jzw-8OXDj9UCNXlLds7YsjkTWcNFN6I9CPiDXbfCN8jeI8u1QDKfX8PEjAIz0NkjNw0LYSj6g3-0ojZg-MMvDIow0MSDjFE7ZueXw1SOPDGo7SPy99IwqOMj5I8qMGjSI-iOzDww6aN19tPSAOH9iA9aPXdxve0Mj9aIxcMYjy1ViMfp+ox6ND9Xo2kPnDsxX6NfVuo5HYqj9gxoPUjsvZqMcjkY-E0BjL9UGP8jczWyM+jEY9qNvDPPeKM2j3g98O+DWw+yNyjnI+MOKjCQ7cNFjgw-aOEjsoy4MpjLLdGOQMSqG76Gjdo+qO-DSYxWMtj3PU31C2YgJ2O2jUowSMyjfY82N5jmI22OTwHY4n0oD0o2gNTjUI1Q2ij7w8OOjjxY0aM-DZYzmOnlM4-6Nzjd-SOOLjk3cuNFDjoyUMx9DI-oNWjWtmeOZjZrYKMgtuY+uM6jYo9PYLjz41e0mj5Y9OMfj+Y0OOPj24-WM9j+4wy2ATV-Z+ObjoE+eMfdhQ1EOrjwo0BOzjX48ko-jko1x0JjEI1BNrjME8BOMDe3U+PYTenbhNaD+E6hOET6E3BOvdpE6qMbDYOY2MoTvo0eNRjGExsQMTcY2qMUTqI1RNsTaE8eOcT5ndxPJDefcaO9j1410O3jFo-eNKjj47YFdj44w2OTj0k6MNCTHE3ROO2kgBv07j3Y3xP-jB4yg3sTqYyeOFGuk7+PudRkwJPvjNE8JPaTLdpZNkT0vYZNSTAEwRM69sEwWPfjzk4xMljmww6MeT1E15NETNg3t0eAAw0uMTjK4+pMLDmk2ZMiTeo5FNWT1fTZPpDgk-ZNaTPk5hMpTLk+r2STkExlN2ToU7RM5TGxHlP+Tu46WNBTxk-ZWmTrY0lOR2lUzxNMT3uSxNxTWowlONTjk7z0tT4kyYMQTtU7ZOHj3U4OPETsPf1OtDEk3uPDTxU6NNZTiU71PwjU08pM4ThU3NPhjC06VMOT5U+Z2rTY4+tOzTHU8FOZTO09lMgTr3QdP6TKk0NMnTdU3bVjTq-XtPJTFoa1MBTzE2pOnTJUylVlTl047bXT4E25NFTW0yZNPT1wzWNC2gM9FOqTsU99PbTv07tP-TLdtDMXjMU1ePwzYM4tM9TL05HaF2qU6kNf1Qo2dOIzF0xNNC2+M-lNn9VbTePEDck9YMHDvPZTNVTBkxtP3TI01jPnTS07jPtjzM+9PVTgU+zPzTnM6TPczyM0zN1ha0+RNszX0w9Pa9oszjPiz8I3zMDTDg3dOyzHM-VPgz2Q5MN7dKs9NODTwM5tPEzP059Viz5M1rb6zUs65MyzcM3LOX9XM4rMWzr3VbOHT0s8dMazws1rPYz40+FOw9rszdNHTNU0LOgz3s47O+zjM8rOSzbszbMezds5rOPTPs89NKz34wHNAztsxjP2zjzaq37DIQy7PRzgc+7PBzns6HOJz4c8nPOzjtmnMwz6s-HNezZcwrMRzec1XMFz6c3HOZzCc-LNmzTs37MUzrczXNGzIcybMIz3c03NH9r3SQBLq1swVPtzyE51PJjDU2PNujWtpPMITIPZeNzzmM2HONzFc73MrzU8zHMzzxc3XOlzXc-Y2WjCkxPMHzhc7HPHzHc-XNnzDTcEPjzjtqvMEzoY0TNvjI8+fPyTkM-vNrzno0hMdD88-2OLzu85HPfjb81TP4DIM8PMizo8+AvNzLdlAsszt04PMlzcC9vMILEM30Ow9KC-zOszs88AtbzDc9gs6zwI+x34Lqs-GMZzm81nMxtQbdWO4LQtlQsGzas+gsnzmC6Qs-zDM0gu89rC9PPUzmvQPVDdd47wsvzyC9fNtzd83QudzDszvM4Lus3gtSLA87QvEL9Czs2xt4i8vNXzACyGNAL3o3IvZzBra6NMjLCyotozsM-fOnz8i2QvlDSi0Lbh6ek9IuCzGC1-PwLPC8-M6Ljtk4vvzBi2GNcLj8xS2mLD4692+L0C0IPGz7i1gueLucxIu894S6gtBzri5wvRL3C0-NxL3iy3aJLBC2gtqLhiw-O2LsSyEuXzPi8UaCLMC1EsWtJM3YvcjOFfCM5L1C7xP5LAS2ktBLOcyUt-zYS+UuHzQiwX2S1ps8UtJ5Zi1raNLbCzQtELBSzYvGLGbdosjL3S84uqLky60vVLgyxkudLzC6Ms9LN80fMpL1i4EtFL6y8MuhLZS4suWLtc-sttLhy8EvHLpS9kvbLLi59OpLqy9-NHL8pc7UNLDy0ssyL6i0YsMLJ7UwsOLWy2cuITG878uFLMy1oteL8y6ct+LYK1MsHLkK4wsXzXS7CsRL1Q5RMQr-y9h2-zmywstwr6M7ItYrmi8iu4rQK-ivor4I5ivTL2Kxn1zLJy-csgr684SvgrNKySsArKK3itorSS0XN7LRK2ys4tsy9CsMrCS18vnLHC5csvLHi28u7l9S9+NjLFS5EtDzVy0iscrZKxQt7dCq70uVLyq1KsxLMq4BUfL8q2KugrLKwisqrtKwf23LqK4ysErVi-yuIrlqy6PWrXK7auUrrI4mMgL0E+XOKLGq7D1arOy30uvjeq+ks3L7y3CPGrTK4AvwrKy7x2eTCi+Qs8joq1Gv6LMa5-Mhr7SyYsur5K9yu5LyS08uSrcayFMJr9i36uOLJq8yv2rrK46vsrOK-St3Lya3asXLDqxau1rdK8KsNrny63mmrVa+asZr1yx0vZrZa8CsW1uywWstr-a6qt1rHazauNrrtR9PtTbi5OtOrSgxss5rbqxtX5ri688tFrNS0MvhrC9eZ1jLDdYTPMpy622tWrB6xU0bEx6wpVUr-E8SuCrUK5kswrG6xjW8r469WutrT66Sv1rs612ujrQa9mN-LF686tXrzTfOO3rVlR6t4Tj65K1CrL6yKsAb86wLOfrfa7utrLYa7Ktm1mE1BuPL264WuF9e6watkVEa7hs0x+G7wW6rGG68tYbhq2Rs3rFG98t8rX6+es-raq3+uurc65usfrBGxOs0b0q3Rukbh63qN4bzG2huxrRG5huDr4G2y2FGYm+KstL6awJv6rQm+g0rDR60xuKbyy8ptSbtGzJvYbZnaJtabPa82usbKm6GsGb9GyJuR2Cm6ZsSr-G3puCbVm8JvXrmm92uVrZm+htObqmy5vqbRq+Rseb0a2auSbAy-ptZrsm7f3ybJm55sOb5mz5uWbEW4Zsabxm0FuprIW7pthbzm0lvWbbm6luAbOq0usWbmawhtrrw6xSs8bt8yxvebWW75s5brmxBt39dm7FtKbZ68VsDr9W-5sMb7mwVtKrRWwlslbz62VtJryG5VtjrfG-Fu1biW6VtDrI25Gu9bGKw+sCr8G0Nuzbcq4FsLb96+lPLb6batuRbTQ1DDNbwW72uhbyDXVszb+29iMowMW8dtebp2xQ1Tr7a4hudr82yhuELPyzVtnb023tvJbAW4xtpbBQ2mttbA2x1sXbv291v5bb23ks6bwO1NuDbv6zOtcbo2++tVbEm5ltfb8OxxuI7669xso7421Rv9bcO6Ds-buW41vRbAO20P+L6Ow9srrew8Nvrb-25tswb1KzWvsb0689v-rr22NtAbnqyQuY77O-Ts4bjO1DtbrBOzusg7j25evg7Nm+2Oo2TOwKPAbcG7tsI7HO0jvyrh8SesfzsOxjvE7Ku4LtGbtmxrt3rzO0tus7K23rtrbQu0etG70Gwru87Gi2ztPb+uyluG745TNMfb924E2O7Uu6TtybhkHLsi7vG2LuEbRO5Ltgb0u3luu78u1mP27IG97vh7vu1Fv+7Nu5Rt4lhOzrth7q65bsG7suynvibE259s07oG1nuXbgYwHvc7hW+Luh7tO2IvY75Wz4t572mx7vU7Xu+btY7quzjsNLje-ZutbSqWxtt7Au9nsu77Y3cgB1hs73tGp-e8rvt7zu39vmdo+9HsvjiuztuztTu0Ptz7eowvuB7qOwXue7DzTXv0zde3NuYTW+xXt9bVexnsH7WQ6WvH7GxKft47PO7Bsr7oi4fsd79ey3b37JNaLtp7F+0Xvx7JexHtk7hkJ-ux1+Oz-sh7l+8Xt076+xDuR2IB5rtU72u3-sD7a+6Xvpj8B8bt27T+2bvT7g+2gdapewBge27Me9gffrKBz7sNbfu97BEHqe+VW-7re7geoHgB1QdQwNB-nvB7jm9XtQHte2-u378+3glf7Qe+AecHkB--vQH+B+2mEHAh6AeP7LO2QeMHFB11sy7842wdN71W3vtfN3B6-uz7sByPvSHCB0Dt977W5nviHzB0nvUH+h5gckHch1Pur7ih8sMb7cB5YfEHS+7HtK7dhwnuUH5h6wfOHtB7NUQHyBwoeeHSh5Ht6HY++wsT786cYdX7Vw4msM7-B+EcTLze0gcMHHhwAeJ7B21IeJHzSzDtGHEuzEdcjgK+-u89qhz3u5Hk+9EdaH1+3UtW7m+74fsHwh5NuiH5B8EcOHuhyof1Hah2jspH++1UexHN+-Ed1H2R21McHTR4EdpHphxkdXbpRy1vlHUR-kd9HhR5yud734zMe3bcW4XupHL+9UdFHfB4xTf2L2eseRHHGb0diHPBzofKHK+NbqL7f4+5MO7LR+kdeHB2wcc3H1k3cdx7Dx5MdPH2Iy8fb7YB3QcBHWx5z3aHMB5cfbIvx2fuLb22zgcTH5x6CehHriNcd-Hsh6bvyHsJyCcSH56RCcP7le4CenHnx3CeYno2dieCHO+6MebH+J0EePHIR0AfrgSJ5Cdbb7x+4fbH-RzUc57iJ1Emkn-x-4ciH4xyydLH6q3sddc9Jzifn7eJ5odnHGJ2YfPHIp1ycon0J2if8nVY8sfFH+diScyHuJ7ydAnCvYSfSnPx7KcanYp1qeUn6JzscqnQp5AzqnBhxls9HEpwSdSnUxx+lWnVh64ekHth0qdLDNDcPscnhx+lsnbLeyacenMI4XWOHlpwafWn-p7afRtix8qeCngx8Kecnhp1CdMnz+8CdmncZ7UcJnvp4Ds2neR1weSn6Z5xsrHySs6cuHtx7AuKnaZ6ye7H8Z2GeJnEZ3dsBndp1SdfHNJywelnfh3DXGnzZ6afVn5p7Wc+nrx2lMpnMJ0GcbjPM4OfInmp2Mfan5o4WdH7A51cf1nLp+WdVLlRwWd9nGZ+ydLn2Z5TuGHFRwscbnAp0Weqn09h2cNHAJ92fRnR57GcnnFp5OcMnJuwqfunVZ8ecLnmZ3We7n7u+odNn15-afznvB4ufgn4ZyudvHFZy+c6nDp98dOnIF2WdgXa54ef-nm53edAXr4OeddHu+7+cX9Jh7qeOnL9ehdlHyR3mfNHLZ7hfQX+F7BednwdVefYXBR7efvn258BfLncF8OfgX650hdvngFx+eIniKSxenrxF3yevn9F1xeMXaFwHBDn-Fwef5nHF8JcXHCJ1ce8XVF03UzngZ0Jeenpnd6cKXRObMdEXUlyRe9nnF3Je0nC4OJdTnRpypc9nY595MpzJZ6ZePnWBzYfsXpF1Bdtn3h1bqKXF5zycWXf585cAXRl+2d2Xop8mdsXiF75fIXDF5pfAXHlxhfknGhz5cGXsl-CfGX7l9pdHHcxyceWXal8Gd69+p9FeEXP51Ge0XMZ+pewjYJ2Jd5XOlwVcCXs5xb2tHXp6Gc8XqV36eNnhVyItZX45zZcIOgV3KfTnFJ5leQXfl0lcBXFV2le6X8x9JdhXhl0NduX3V0meMnIVxNcJXJVyGftHWlxJda71V6pcDX4VyJeRX5V01c5nkZ5tf9Xc5ztf+XM1yNfNXGx3FdFXN58tc5XMF5deHXLV8dfxXVl2FMQLtl09d7nuZ3peCX211NdEnxeSlfrXiB69e3XMl-ddpjWqSDdmXwVwheLX7139OVz0VrDf2X1h6icQXp14Dd6nj107RSJMV40d9Xb1+1fWXKN0fZo3DtD-aE3l595cQ3k14ldA3lRZTdWwBN-lfdH4N21cA3jN7jcUX7SWzeVXHN39c1X9fdSdtHZV3Sf831N+zeYXrV0I21XYt-VerXUV-jfS3gt7Lec38t6Letn4t-Jcq3shALejXVV8LdbX2Nzzd4XMN7NeG3V18ccQ5It86OK3Glw1drXzFNbfPX111hdc3Zt1DfmT+1wbdq3Rt0LfjX+l0jdIz5N2qdW3AdzbfpXdt6bcK3Ot0rcS3Jl1Ld3iP10dcm3J1-HdkXrlzKcp3Sl5-Vy3e-VncuXut8leR3qd9+dB3GVyTfc3Pt01Nhned55ddndN17fF3g10zd-FLN56hR37t7bd0lNd97fZX0N+2ld3bt2ncvXGdwPdt3Z19Ne53qtxXfj7Md-3f03S10Pe+3kt-Pf535-a3fa32d6XfDXm903fUXLd1rcO3Cd07fK3Yl4mdj3ldxreT3K96Hdkze8xQ4GnN94vdjX1dw-ek3H13wsR319z3fj3Ht4XdAD09zjcW3I96-cAPt97Fee3p9+P3n3pV3rdX3hMm-cRHS9xuVF3u9yXeJ3SD3Sf-3C92g8f3sd5ndYP7d7zcEHIB6g9JHxt8Hf-Xg9x1fh3qx9IdUPOR0Q-L3O92fd73OD8ZdZH-twQ-UPVd8Q9T3pDzPcd37HZQ9QP79zQ+f3HD-A9cPF90ne8Prt5I+EP0j0I9f3td2vf13HRxYwsPIx0Tc3Xsj5gNkP4D+elKPU0Ho8LrMD8A8KDoD+bfkXBB+XtU3-D6w9qP7D3A-GPoj+Q+SHTj6zcqPAj3fe0P9t3I-YPCj7g+Hbh8ZY+obgTzI8eP3QyY8OPPj5E-+Prj4I-uPmD5w+hPiDzw++P3dy4-6PtN8TcaP9D2TfP3De8eZRP72248YPIDyI9gPiT2Y+5PlT9DtsPNT7Y91P9jzndXbTTyk8FPXl0U9GP8T14+mPwnWMvNP3+4U+GPcT7JMJPXT2XvFG4z0IeTPsDxk8hPsz-vfeH12xaaLPZJwY8rPtT5k-rP3DywdbPfD1vc0zMk3TNHPYTzk8LPvT1Y97PNjzsN2Pdd8tNc7zj+c-CL0z1c-DPDT6M93P+Tw8-LPTz3SMvPWj288bbyj4C-RP1j5rerPnj-U9zP6Y2M-3PML489wvBz2s+-PSL448Avnz-0sh3398jdlPki4fc03-T1M-wvQz4i8bPmR6ws7P3J83cDP3zySNZPK14o-0vqL1U9pPbT888dPrzxOd39nL9C-cvMT+o+DPMz9i+0vV28K-4vwa05er3DDyS-8LS6gy-ynI55WeaPSr59cbEsr0ffKXzL1S+SvNL8c+bPCOFC9yvy+6OdEvYd8q-wjer+S9MvlL5i8IvnT9K+BjDrzLewv99xK8-PJrzc8nPnr+rfevQT3Hf8v4L4K+FGQb4Hdiv6Ty6-Uvbr6a90vqr1y8tP1Tw+VGvfr4m8Bvmz9G-R3rTxm-xvxr9m-ZPgbym8ivabzy+Fv7T4c9SvSb9094v+rwXcYvNb1i-+vpb5s8ovFbxM8Uv+z62+uvAr51fW7FT6m89vTr3298vtb+2-sv4Tz3ojv3b0s+9vIL2aNgv2r7-fq7875a9uHqZ1q+lPOrwkdnPTb9vcsv8o9c8dvmRxI8Lvuz8C8tvk7228lvM7zw+XvW726cKvj9+bN2vTD7o+jvi7+O-LvTo-e+DvjDyfvMPP79e9Lvt76C-hva7-Et-3KD2B+Mvx94a9FvWb0B+fvtl-g8vvjl6FeKve7+u8Yf8H1e+IfBr86-9vCb2h-7v+x5A9Ef6rwteEvu7z-ewfZ59R9YfmN2+82vT95R9Znh7469IfpH3e8DvEb0O9UfmH0e8XPGk0nO+r95zuc8fXr+i8+vJ75WMUf+H11eifvHyR8TvUH1O8PvD1xRdqfcnze8Kfmb6y9nvj7wFf6fwb-J+hvJD9p-KfTHwR+yfln4Z-Wfwj7Z9CfwH6p+EfrH8+fsfDH8S9cfn5458xvIb7E-Gfp73W85vMpxZ-BfVn6F8ofJnxF-nv+p9F-5v6bzy0Cf5H+5-ofnn0F+pfVb+l9afgH1l8BfjV7l+936D9W8Zfxb3Z9ZLFN+XfefGr1jerveH-Z9dXjd+p-NvRn-F-hf077p+W37XwZ8QfXX2R-VfxXyp-IW9X2J9fPYX0p9jfrXxN8DfTn0N8ufxT81+MftXxHeLfMX859xfI36h9zfG38x9bfeX7G+8vhX4J8wfh319dkvg33++QfK79B8tfV32183fS33d-DfVX-t+Xfr63V-Hf5XwW8FfD325-ffSG0d+vf238t+7fn3wl+9fw91ieTfHX8e8zfA44gvzfVH39+APfd2d9A-RXyD8vb132V+Y-FX4D8AfF3098-fm3+D8nfIX+K+KfKP1J+oXG94T-QPsX7T-I-YCwz-cXLtxY8IftHwjf0fJT+t8U-YP8z9SP+X-63nfmX3j+c7BPxa9TfBL3Q9rf-n+N-o-VP-99pfEvzj9k-Qv6D+y-PPzR+9X-H5L+jf0v2rt6-Hz-L-yvOH++89zJX9z8W-iP+J-xTkn3Edc-+t3L+O-0391+zfpv8Wcvfov6o-i-M3Xt8w-On3D-EnSDgH8BPNP3G8h-PX2H-r3C4JH8e-t33x+afWv1L-k-uvwg7J-+vw190fiv4986-+Pzn+TpeT-n-8-hf8D9Z-Jf8ha5-Dv6n8af-77TOh-NX8L8ln9f348G-5l8h9x-PvzX8y-pf9s+8-hv+n+k-mf8X+D-df2X9qvo-83+XPrfwd-t-Q-1H+pPp35V-G-X3wP9m-K-yn9vfaf-P8SfPq67+iX64J3-l-lv1a+avgv8r9o-XXOf+z-Pf0b8Z-Jv9v9+-0-8P-d-8N9RvW-HHx+92-4Jwf+I-yf+Y-xb+8fzb+2fwW+B1yJ+AP01+4-1f+k-x3+UANBu+5xW+vr0X+vv1PO5vx6uIAMP+zv2P+Axzd+ftzhu810r+wT21+t-2e+yAJIBT50a+vnxv+trwABxAPRurp2w+iNz-+tvxV+wp2+uLPx2+bP29+9PxP+e1yZ+NAIcubH1-+fn0YBXAIbu0AN4BkP34Bff0EBhANP+yd1kBYv3X+JPzAB-f0QB7-1V+KAN+uaALp+HPyEBzt3d+LANXOP-3YBkgM4+0gNK+ogIxuPnwkBDAJsBd-xkB+gPTuhgPZ+2s2UBwgNUB7gInungIEBxgJ8BpgOYBQV1IBlgIF+SvykBrgLsB5gPgukQKr+uPzf+WAP9+9gNYB4gKsBzgP-+tgPt+OAO-+6eySBFAJiBVAL0B6QIsBhQPIBE-0oBy-2oB8QNYuZALDe1fx0BqQLqB4QNoBBfyqBCAJqBkALKB9QMkugQMUBwQLZOvgK7uDZyAe933gBW-xaB0n0ABZf3GBWPw3+L-2mBPQNr++x3P+CwOJ+cAK0BSgJGBoQLP+8wNAuDQMSBXQJWBJQNqB6wMOBfFw2uH303+GAJSBswLQuGwKOBAwKh+dwPABS-16B9-yuBFfxOBTQOSBMwMZ+Sfx+Bl-23e1r2sBOQNiBK+GeB1wLButwOWB9wMBBRAIOBFOzkB730GB0Pw+BmAMeBKIP8BEwPhBUwMRBqwKn+lwNRB6gJj+2P0JBWIIeBQIMQcIIM9+Cv1OBRIPOBXwMtOMIN+BlQP+BxQJcBpQLxmj4ReBNwIxB7wO0BxIKQBeo31mmwNgBwf0xBIoJZBawL5BwxyBe8gNj+MoN2BNZ2RBBdn5BsINQBbwIRB1IKRBKgMRMWoI5B9By5B1QLlBJIIVBeIMWBmgIX++oNFBugOamb03yBEQM5BNnwBBDoNaBr0zd25INZ+KoOFBaoP7OGoOhgPoMD+GgO2BdoNlBPIIuBToNDB0fz9BlIJ2BwwPVBhoKmmkoI1+0oIDByYKDBqYOdBc1w6BjQPdB3IMhBvIPbGfk3aBYgMcBWQOiB0YNZB843LBLoILBfwKLB5oNrB8oLLBGwQZBVv2rBRf09BOIJxG8vlBBr7ycBNYJLBMYPbGsY0bBlYLoBI4N7BFoLFBMY0HBXYKv+TXznBbYMtBE4KXBjf06+QoL1BUYLHBdYLv6k4PzB04M6BZoO6B84MdBm4K-OvoL4B-oL3BgYK3OvgIRGioLRed4MTBkYMfBKF2DBuI36BgoN1BVIP3BnAKhBhRl-BFYIcBM4J7BzQL7BQIJfB1oK2BmYIfB2YKfB+wJxGJHnTBQf3x6n4OQh34MNBYEKnBEELPBLYIvB64IXBE4PQhAoLhBu4MAhX4IiuqEO1s8EKlBWEKP+Jaz2Bl92aGeQwwh4YMQhNEJwhdEPYhU8E4hlEJ1BCgNVBfEN2u9EJaGXEIpBSwN4h3gLYhijykhwkIMBAEKTB8kJTBz4KUh2oJUhokKzB6kJzBz4JP65QISBboNc+HoMvBXoMjsRkL-BVENUh2EP0hKEIEh9-TJBYYJkhtoJYhtSw0h9EOsh4EIyBVYKiBa4IPB7YPnGPkIIhfkMghAUOghFkP7BzkMYhGYOYh+ANYhXkKchoUJPBhEMLBZkOLBwENLBIUIpc2kI8BdkI8h+628eZj1Sh0kITBskLUhLvxCBKULyhJoPFOmUNbBQUI3BIUMN65UPfBlUPsh1UIUhs7wH67UOVBH4KKhJGxxekhz6hykIKhukKQhDkNwhhkLah40ICBhUMShnkIMh3kLmh+UIWhk0Lkh3UOShijzGh60PxB1EKqhBAJ6hPDz2h9UJou6APtB0UNghZ0KHBbAMih5kNIhV4NahagNchFUPchS0OKhIzzw6t0OXBYIOv+o4Oyh44JehcUMwhnfQXm00P4hu0LWh50JPuXgO2hK0JShMMLuhmQIehWUKXmwMLv6v0O3BSPyCBkMIkhSMNeh8YI6hH0K6mCMMch0MKJha-zchEYKGham3de6Y2xh+-yb+kwKOhSUMRhlMNBh3EIShZMOOhO0N6hyML+hw4Kghj0OahZEJBhxkOOBpkNW+gUKBhh4MKMTMIh+6IMWhvMPZhFMIFhVML6eysM2hbMOWh6sNOhgsJxhTv1VhesJmhq0M1hSoO1h94K2hfMI5hGsK5hNMJ4husK+hfzx+hhsOZhO4JVhEMPJhZsMJhDsPehtMM+hw0IZhBB0Vh1PwDhTsK6htsP1hJzzDh6vzBhhA1AW+MPOumRzjhMAPih4MKThPsKhh9sMlhrwJ1hUcLVhvsMUeQPX6hVsMGhQcPph9b0DGpcPmhB0K9hWcOjhxcNnetcP2hNoMDhJsJdhI0LMercNhhvfzEhycNnuV217hKMP8hRQKahcsOChd-RHhQsPuh48JIhYsOeh08PG6ZcIP+rMMLhpsJzhPDxnhRsK9+QwMHhYj0B6K8Lrh7cMjhdML82IcMkOO8I9huMP3h2cIJhSd2OsYUIqBpoOIhZwKehlkMgYT8LSh4UKIhjUIXhk8Jah5qG-hq8JZhBIOdhwcOrhL9RARJ8IQhPMO9hTcK3hLBxgRbcLgRmcO9WRcKQR3hxQRfcOf+NsMwRD8PCeOCNHhEUPnh78MXhn8NcQ3dVvBA0M6h58M62l8KxO1CLehJMI7hCCIIRKcJ+OzCOJhtCNJh7CM3hhCOSu3COphEcPgRjcI4RQ8KdOwiK1ha8PARG8K7hjCOJOeFRIRf8JlhUUI-h-YJQsvkJfhDULURosMAR4sJXwyiNnhqMLIRzII0RtIOMRu8MZB54PIRBiKXh4JysRN8ONh-CIURUCIIOB+R-hOiIuhRgIPhJUOE6niNARnsILh9CLB230Oc6gSNgRTEPQR8awERnCMDGkSNQR0SMThGCLiRkiPTGiSNwRoAPkRkCMi+2Izl4NkJEh1sIgRVcLyRddQthb4N4RbCPERaSMPhHBQqRor0dhYiNSRbiLKR-TW1yUSIzhKSNiRrSKS+5SP9hrCLPhlcIvh7iKJqDSMre3MJiRxa1qR-iPuK4yLHesiMOhOSNKRfSP6aSOS8RJkNfh-8LsRGMPlhB8QGRVSKGRncNyRqyMjS6yKCRt8IHh98PiRayJvBLCMORzSJ6RJyLM+3h3IohSJ0hxSOWRIyLaRZyLuRPCPLhdCOGRDCNGRKGXORnSIThzgyeRKyJeRB2zeR2iM2RuiMuhQEN2RU8NTiByIBRfCJqRvSJhR+SLBRSSK6RkKOmR2KL6+7aT8y+KIhRRIxaRzyJJR56TJRWSLwBxyOhRNKNGydKJURGUL0R6MNR+OUK0Er4MaRoiKmRxGyZR4f2LyrKJMRY8KZBV0IsRGoNFR1iO7BaMInhKKKAR2yBlRziL3hVyMQRgiJYOKqKVhiyIbhVKKFRif21R4cMGRjyKJR1KOFRlRSNR8cMmR3SLNRBqO0ePKPRRuqJCRQKLCRrsMtRvKImRTSIFR0m2BRPyNJRnqIWRYCKWRoSJJ27qL+KVqPThFKKbGUKO+RpyIDRTqODReqNjRfqPjRtKMDRv72dRnyNDRFuzqRFFkjRaIKzRFcMZRcaJxRH6QLRNCIxR1SP1RpaOZRIqIzR4HyrRRyNcR5qMNRDaOI+wSOzRrqLDR3cJZR7aL5+zYO2R5iIoR-YIrR9yKbRpqMFRtaItREaP7Rc-3XhOaJn26SK1SY6P+RRaMBRJaNTRZaJfqq6JERJqJ9R4WzdRvaPrRiaM7RxaJbR9qIhepeDjBe6IeRB6Oy2R6MURxeRvRMiKTRLqM3Rj6JBRo2RfRlsPXRmKJrRW6LrRlRR-RlSInR96PO2PaKfRwGNPRlyL0h1yOXR7aRAxfKP3RtqKnRgGJnRnrSQxXqP5RqGN9Rn6P9R56SwxQaLPRG6IvR06MT+RGMzRb6K7RH6MgxX6OfRMGJcRWKNbRDqO2QlGMbRf6OrRKaPwxaaO-RjGLVRcGI1RNyK1S7GI7RsGKmh8GLzRNNlExA6OlhSKNohmqO8OMmPnRciMXReB1mR0GLzh-4PfRZGPQxFGP4xNiLfhw6PsRlCPNQymNwBC6O7RuaI0xfxXMxBQK2RHKIVRXKMxhbGIMxcqLMRkqJHRQILsxroIcx8mPEhwmMQxbmJXB9AMBhiqMMRrmL3+OqOox56OYxl6Mjer4E3ebKMHRjmIAR4WIcRiWNX+r6JIx-6O4xdGIIxfGKixxqLvRuGMPR+WN4xDGKKx1qO9RpWIfR5WO3RImKyxv6JixpGLix5GNYxmWKqxUaJtRhKLQxPGIaxQWK6xhaJaxuWLtR7WKvRiVCSxYqNIREqORRzmL2RCEDz+yWLkxviMkxNmMwxTWNAxnGObRbWL0xHWMWxDf1VRhmKHRnmJMx-YKmxsqJCxs4PURXmI1BF2KOx7mNmxCmMCxhGM2xyGJKxvWLwx9WKAxtmLex2GJQxn2LKx1mPCRv2KGxlaO2xk6K+xwOPDRG2LBx46Ihx4GO+20OOPRmmKWx02NUR-mL8RIONhxaOMux-0NXBN2LOx3mL+xxGPEx+CJmR2OIti92OixOWK4xY2L2xE2MYo1OOKxYGNqxEGORxUGNnRJOKoxtOJ2xAGP6xP2M9aimUf+9mMRRq2KExCGPTR3OI4xI2LpxfWO+xGGItiwuOABouJ8R8MIlxUmIDMyuK-+vmLFx6uIkRmuIVc37x1xTYJWx+uIpxMONay6yJFxuuLVxeMLWxlOOLi1uJVxtuLhh9uI1x62KtxXn2WxfmPFxBuM9xTuO9x6OPZRmOIdxluPqR0uLExTGP5xCuMT+BSMOxNOLJxJSPGxCWIp4keNkxvuPNxxKMVxk00-+9KMsxtGI5x9GIiReeJ9xeuPdx-uMdxUM1LxweJSxoeI9xVeK1sniJtxpuMzxFeItxKOOo6zeJdxrePLxd8Ibx4eIosWiK7++eNUxVmKXRhuNRuWJRbxp4JDxfuI7xnOM9aw+Iv+teLNx7eOzxif2XxM+PShdePnxG+P2xC4GnxPeNnxu+KzxLGMZxXXCPxJuJPxa+P7xleMHxNNm64CeJZxCOLZxSOInxAeKHxbFW3xv8LnxZ+Pixwny643+OPxO+Nvx6qPvxneKXxwBOvxoBLbxd+IXxxeM7u0BNHxIaPHx6mMbxAZm-hP+O8RbuPgJ++IvxX8PG62BIRRduLwJ5+NTxRdCDxeOOFh8qLSx82NRRCJCIJIBN-xp+PXx5BMAJhBKoJD2KuxIsM5RnPxUBWBOYJOBP7hgmIgJi+ItighJgJLBLAJohIQJBWOLywTmIJUsLgJ4BLkJFWMqKihKEJJBNwJqhPwJFBM0JUhOEJeCOTxDOP0JhvSUJ+cJoxumIFxOeKucKzgsJ2mKsJu2JsJifw+sDhNshOmOcJseIPxbhK0JyhL7xuhPYJHn0SovhMMJ2hJEJEmIHxkBKVxeQ3cJRSNixMeKLx8hI9RzOOqxOGMBxdWKSJ6hNnRqRO6xNWIyJ7OI-xGBKNxuROGxvOMhxQOKKJD+LG8JHjiJHyISJeWKyJA2PPSFbjqJE0KcJiRKqJ0RLesrRL8JlhIaJ9OJcJB+N6JYRP8JpBMCJABOCJFPnTxKmNQJheK6J4hJ6JbnjaJG0I6JjRIWJiBM9aBXhWJ9cM8JnRPQJ1RKi8yxL6JjhIGJ8uKaJguItixvh2Jp8IqJmRI2JyRL+K1xJOJHhLWJgxO8JBBJwEbvhuJaCLfx-OyYOxRIYC3xJeJ8RNax+xIBJhxKBJavzyJ6RMpR6xIOJ3RIoszxNGJ-RLBJ8JIhJiJJpsIgRHxZePGJshL0JHBO1ENeOoJc8KexAWMlxo2WxJK+JJJpiLJJWOMhJNgWJJ3BPxxoWNlh6WNMxwgVsCPxOSRBRPfxCJMWJSJK5JIJPqJaJPeJFxNsJNNkZC3JIJRcJLFJDxOyJnrSlJwpPaJZxKhx8pOaJo2SVJKJNOJopPOJ6pMuJb1i1JKBOTRcpP5JmxNayDShxJq+JUJ+JKCJ2X2YiXBMTx0ePRJ9h3NJxcUtJ1JOZJNBI8xc2P4JvgO8UuOK9JpJNsRxmPZJ-YIDJz+LSJAONlJepLNJjxNDaQUWlJ0aNYmapLjJCpNayiZOVJqxNVJlRLTJGpObymZO1JrxJzJ9xLzJBpJgKhZONJexJdJdV3jJGZPLeVZLeJsZIxJApPEKlZNxJOhNtJkxPtJVrEbe1pICJXZJTxhJL2EfZJpJ4qJDJp2LDJQIM+sgZKdJAmMiJYhLdJMBR+iVpLHJM2InJvpJMBAkJnJkZJhJ0ZJjRppJbJS5PEKK5M9Jc5OOxqWJ2R9BKVRB8VKJ4ONlxfOJrJjt3TJgeLvJ8OIfJdxMKJZZIlJ2RUXiu5LKJSeK+RphOHJqcTfJa6I-JiOP+JrpLrJxcVoSZ5JfxEFL+Juu31JP5IpKcFKTJPWJjJqZKPJMFJgK6FKzJuxKbJ2FOgpL5LwpoHyLJoJNGxzZJIp+ZLaKXiVXJQZNpJG5OexFJOby9FPgpUZI+xWFNzJOFNIp4hXYpGFPyJ3FNLJvFNopVpQEpBFNuJkFOQp35LjxElIopIpKopxFNrJfFOyKWZlnJCFPKJ0lJwubL3LJ-FIx+AFOdJh5JopelLUpBlPvJWlKQpOlNM+plIpK6lP-JFlMApamNEptlMEcPqQ4pe5K4pB5OopKlLEpobXcpglNhJ3lOUpz5L8prWQCpklN+JvJKgpvlNcpBZQipClJVJupJCpCDzCpxcRiyGlM4prOOipMlJcpqFMEcGVIcp75MspOVOspiXzSpMBUKpDFPPJj2OYp5JMnxBZSqpHlMMp85PJxBJKmJ69CapgVP3JKZJ4pJlPypBZSBy1VM0pTlLQJeVLjxQ1OapjlKMpPlNCpcVIQqk1O6pXlN6pIlP6pE1OdxiVOzJyVL6psVIGpC1PpyS1OypwlK-J41IPxOgAOpkVJ5Jx1L5Jp1M+JFWQupm1MIpJZJOpa1LOp7uWGpWVNfxpVLouEAIYJdOWhJLVIvJ9eMXJuFPEKf+SmpxVNGp8xNkpZ1PBph1K+p11Jipc1L2pvYThpl1JlJwVJ2pyNLjxaNMepUlKspP1M+Bf1JLy3eLxpUVMRpuVNepd1MXypNMbJz1JupVNIoJiFXhpiFO+pxVyJpN5OXKcOPApJVIppZVNh+ceLZKLNN5pmNNWpu1MFpV+Lpp21LFp2NLOpQtPRpyZK9WT5NSp81LWqktI7JERLapdpKYBJ1RmJFmLHx0NNupTNJjqwtKhp1hI+JxtOQJGtOMJQFKGJ1NP60VtP7JeJIXJahIqp-zT1pquM7JLtPapPZMjsQPVNpM1JSp8j1Upjtn9pCtMwpotJep4tIPxb3QDprVJMJdtIoJsdPDpQlMjpDNOjp9tPYITBLJpV1LTpSNJVpKNMwmYdJzpGNJWpUdNlpmdKhgA-TjpQNL3x2tNyBCsPMJKdKCpZdPTpFdKTp1dObpPVKVpxlIzpHdKbpJdMVpfO0ppfdJApBvQBp01PjpttItpY9O9gndMHpEdNbp+dODpbtNe6qUJrptVKMxk5OvJEWJ2w9hK7py1J7ps1ILpif1ih3NNvRR1LzpI9Pbps9Krp+9IXpqdKXp19JPpMdJaGG9J4JtBKvJfpMkhsRIPpl9Kfp-NIT+r9N-pD9JbpR9KDpulMLpqwxAZUtKUpWNJfpldLgh59OyxZtK8J4pNPp+EIhpPNNQZ4JMZpt9KQZmVM8p-9PAZ8DJXpqtMwmmDPfpLJOux+iKnJP4OOJoDO7pw9MAZv1M5pA4MdJI1MDppDMgZGDIYZsDLlxEDJspUDPM6x4IuRXDJlpCDKTpojPBRi9JIZEjLIZwjL1G0jPJRsjOYZhNOxBsEOUZ-DMfJvdJvpHVLLBwJMYZh9LUZ7NI0ZwYLEmWDIvpCNKvpLDI5pu9O9gFjKoZ3pLpJYeMxJ9E0MZ2jM-JbdMkZ+DMcZf9OsZADPUZNIPMZHjOtp2SOcpeDP0Z9YNCZTtK9pWtO7JOtKhgfjKMZxDJMZd1zsZGWIcZQpJSZATLkZ5dJ8ZUTNPG2TM8Z2lKCZBoOfBDYMsZKDPEZ+TIUZp9MqZTjODJW9M3JNUMUeDTP8ZrNL5pZTJgh5jOKZYTIZR5tPQZMdPaZOTM6ZNjO6Z10N6ZTJJqpH9J9JLFIap8IxGZJTIJppjOCZhoKWZ-TILxgzJQpp9KmmjTKYpzTPmZn+KbxeYP2Z45MOZ9VOOZV01OZHTJFpgTNWZ5TPohezNuZODOVpdTJjpzzNGZdzLyZ3jPeZiDM+ZyzLZp6TLMZuYLApVjLGZ9zOBZazOfBALM2ZBtO2ZMNP+ZNzK+ZrzN0ZBTN9p7Y1hZsTM1pCdJnphTMKMWLLXJGOLrpCTIbphkEJZjFPOZJ2JaZJ0JOeFLJmZ1DN4JTmO-pTkPpZnDKnpETNHp+LPJZyLMBZXTIeZPTNBZHtNdxOLOnpQzKRZYLOqZHLLGpkTIxZ84zZZn1IhZPzOXpPDI+ZvLLhZcxIRZRtPwZCrKIZuTLSZkNwyZHJJ5ZkrOax3zINZDN1YZ9jOmQprK2xSrItZuH0eZrLPVZ2LJtpnLL0ZcrLv6urMBpm9OpZRzMBJfUxdZRLL-xbBNJZIEJNZwrN7xztPiZQ5O5Z4NFtZ72NSZ9x0tZRrJih3rMnptdP-xsbM9ZBLKDZlLPXJFzPpJbjIBmebIZZzjLqpRbNbJ+c2NxfLPGZArMmZhoP1mZzILZfrMuZAbKjmNbI1ZJpOPpfzKTpTbJeZNTN+ZqrMrpo92rw7LMzZobOzZiTNHZojnHZvrMvJoZJ3pmTL8BrtzHZirPNZybMdZgrNGBVtzXZerPtZm7Jt+dDJUBM7NrZkLMNZILJ3Z-Nz3ZPrNmZLjKiJVbK-su7NnZ67NRZPbOHZFBNPZXbOrJaLN7Zt9PVOWZldZ4TJlZXLJzZyDwNuN7IzZ87OBprtPIZOX1XZL7P3ZG7I+OKbMvZqEIA5kHMhpg7JVZQjM3xr90w52DOw5z9L-ZcbJ8OujwI54LOQ5zJw4Bx7OfBlDwo5UrInZZBLDZ3KMKM9HMQ5t7MZZn9MXZLLMUe7HLPZyrOI5H7PwZ-HO-ZRFO4ZuHJjponKA5AzLQZOzJjpTTwY5ZrLfZgjPKpcHOHeEHI45UHLvZFbNcZj7OyWkTyU5drKo5O72yBROODBinK05WHOlZhtNlZiTLnemnIE5DrKPZS7ONZKNgWeRnMTZ+rMPZNHNc5MULGennP+xxjJ85EIPM5hoIC5VnMI5NnK1ZdnLJZ7nO2egXNJxRHNsZaHKchEXKc5IXLM5tHPoh6XLE59NJw5anMUZtmw85kXMo5KnIk5hXNPp9L0S5POPK58jOE5pHNbs+Nxq5MuJM54IKy5fnNgh1XNK5jHOg5JLKnZcXKhg3XIy5KHK3ZDbOfBw3Ly50tNqZDXLA53sEm5MnK2ZcnMRZSdIW5wbNYJzHIG54bPm5qrxa5UeOi5y3O1ZjXPNeFjz25GeIHJ3tPrp23ILsJEUA563JkJl3JY5LmPhwt3LO5sxO7ZqnIFpMdJO5DtDe5+tM1Zh3Ni513MRMr3J65ynOS5EzKlRjbLrCd3PzZxLKzZwFOO5MPL+5ntNFZ7rPRZ9nKbZKPJFZbrJA5HrPs5ezOx5UbLiZuLPFZSdMJ5YPOM5dXJm5knIlZjnKm5cDPq5tPPJ5pzKJ5N+JtJj3K25rHIjZCHJG51HNC52XOdZFTzZ5sBIu5MbMR5c3JtZ9PMW58LMB5oHPs5DTJF50hI554vMTpvjK5JSvKMJwHNs58vMG5UdgS5lPK85B7NG5LnN45s70V5hvKC5SbJN5vnLN5PDwt5fPNM5YWM65ITOa5lvKS5B3NwZuvOB5jjM154RNx5OvPx5evN957vNq5EPPrZUPIqZ3xL95YxJJ5YrPk5iDJD5jvPa5zvLt5Jz2PBsPLLZTTNbZlbOPJr3Qz5MfNRJjPJp5lXJjpBfND5rXOp5Q7OZ5+DPL5yfIBhbJJd5eENqJhfJ1JxfOr5pfMQZlDNb5xZOm5HfK+5XfJb5FfP25THImJXPOe53sG75w-PO50bNJ5CfKkZQ-Pr5BONoZTfNmhbvKX5rJMJxgvM5hvPIZ5AjIq5A-P7p6-L35OjPfZNfMa5-tJ75lFP35TPM75SdMv50-Pe5P7LP5d-PwZD-I35NDL4JW5JLhRBKv5ilJv5JfMP5b-N-5j-P+5H3IP5QDMQZ7-JP5XjIK5QAtI5YbV35MvIB5XvKD513MQFp3NAFqPID5MXO953PN1pSAvu5KvLn5K3NvpGAt+5WApx52vNwFaAvwFXrUIFcPJDZm3Il5iTOZpf-KSp7fLgFkAuNp0+PYFW1M4FQnPP5kvLYFlAuJ5aPLx5GPMG5Igo-5TLLoJafNeRQtL4FT1L75XAqtZy7NgKDAqz5BzJz5enLz5FJThpSgvxpQLIvZ0LNQhGgswFMgu4529PkFsKPepnqEMF5NLrZULKdZSd3Opx-OQF4Atv58AuEFdgsz5c7J05hbN0FoNOyKvgocFudPPZqHNMF25NCFogvZ5YvJIFR3J8FB1LCFpdME5KXKiFrgpiFlgrmZbbIZJC1OtxKQqHpmXNT53-PCez2Wl5RAviF8fNIFCAsWphQtUZxQsb5NgvyRdQtiFovNn51QsSFrAq6p9QsfpaQsh5t2JUBm2gqFjAo25Y-JYFUgp6FbQuV5VQvR5JHOEFUwuyF97JBpIdIKpwuN6FYDOc5tvNKFxlyjSIwq0FVLIXZ1gp2FLBz2Fmgv8FXHJyFufOCFFJQCpGwqYZjQq35q-LMFdwumFWvNk5qAskF6AvsprN3uFwXJt5AvOeF25J+F9greF-vOoFcvNoFE-N+F7gsqFHQrmFs3NYFIIr8Fr7PD5zgu3ZZgvQpfwut5-PI65zQpYqWIrBFsfPEFgfK+FdAsrcFgpgFpTIj5gwv9JhIqWFunIfZegsEcf5JhFDIsCFTIpuFLIsM5RIqL5AAv753ArIFrItBF7Ip0FnItWFBZWFFKIqQ5VfNUFqbOnJp5OlFnHPLZHIpWFq9IpKiouxF3nIBFeIpOFryM1FvIrb5-IrlFqXNcFBotFFRwppZ-MN2FiZK1FxvNxFJQtaZZQttFhot75AgvSFLgudFu3NdF1-NP5n3MFFCApdFFopg5PtNYFHpKVF2nMuFywtg5RXPMiKDztFbXIb5TwvxF-TXDFCYtlFggtf5CArTFPov-5foogFagrc5KSgoFwYv65EwvQFXoQjF1nNH5g5PLF5IsrF6YrRFJgs9FuwobFuYo4FxoszF3grDFyPPbF-As7FHooxFAkKlJjYs95bzMRFg3JHFfYuUF7ooGFYXN8BU4tLFCPLV5pHMXFVIpWZ6IvG5qELXFHguf5-osLF-YKpJVYqi5NYs55dYuhFR4tHFp4tV5eLMl5l4unFRgv5Zm4sj5qEOuJV4r65y4tvFiTLfFD4scFEQrG5L4oEhP4qXFk7PPFC2J0EsItGFD3JvFZPNvp2xPfFAQrFFaovU50xPOFqIrHFv7InF13Pglv4vCF-QppF84tQhOEpAlzApXFkvNaJCEqjFjIuQlsYsngFEtwlqQq2FgIpTFWqXolJEvGFZEsSZ3LmPFZXKbFkQpbFWqNiJlEpVFSEpjFbaOF5DEqKFOosdFtLO8ObhOEl2fMtF-rLyF09nklkkoaF0kqaFeooO2akvYltYs4lg3MUJCku0FSktyFxbOisRkvUlfQqYluoqdFxl0slekrPFBkuu5DkvXFxgv4lQ4qTurkt3F4nK8FAYsl5WBOMlhwpDFV3LoFgUqslmwseFK-JYl7aXCljkpgl8-NvpcUrclT4ubFnkqIRIAvilCQqB5dAqfxbIpSlTgrSlW4oEheUpFFBUv-FpvO0lXCPI5EUoeFmkuTFVUqkRNUqylnQpyl0Iq3xQUpbZpkuuFEorVOvAtql-wodFWkrsl7Z36lLUoRFQgunZY0vKl+EufFtIqeZBvPGlEgvmFBPMWlM0pslMkutFdLLWlPkvy5XYv8lq0v2FFwpEl3UqCFvUrVpR0vQl14uyleAuhF8ePylu0pUF+0oPF05OSFA0pxFTvOGlskthRb0qWlpIpWlUgt+l60qilX-JGlCgsglBwq6lIUqe54ErhRD0rhFcfImlWYuEFBQvel2oqGlDUrBlsKNRlf0poFZIrulOMuBl9UuiljUtuRl0plFfEoAl80u3JhMsels4oIl2-LKFtMoRlJIrxlAMvQFzMqglxAtalt0thlnMshl8PNAlzkvJF-MuOlikuhl4-L5l8YrRl9os+lmMu+luKOlluMshF+Mqll5MuVF4srLFwsoJlSsqJlGMpJlWMsVl6ssjFJ0ollYEuJpcMrKldMoHFc4sZlxl3WFMssTFy-NBlCsvLRzUr1lcsoNlrsp3R7sutl+Yr8lL0ulRvspZlOApVl7MroFDsuVlnwvDl0IsjlHspT5X0q2l3hzjlfstgFz0vlFQcuNl1Yo-FQsq-Fg3JTlIcohF0cqwlEcuDlXMtmFy0pLlscrLlAsqYFHErzl13ILl5cvhFlcsml+cprlYspMlZsu1l4EqbltcrGF+kobldAoklUcvHFbcuu5I8vjlSYq9lScoO2k8tTl1IrmlhEoEh88sLlHwrHlyMsSZq8ubliMtblm8sG528v7l0EpulUIvAlh8s7lwUq1lQ8uhF58qulOctIl18rPlWcpPF98vrlsEtI5t8oplGEpf53YoPlz8t4l38v3FGcpUBn8o1lXcqvl78sl5oCpNlmss-FkCq3l-8t65iEtOl4ovVF0VmgV2cuQV3csflxNK7uMqQXlG4qKlgEqTueCqzSBCvclVMuXlJCtmu+CrXlS3OLl48roF5j0zSCpjAVl8rgViUsa5IB1oVO8tZlYcqrl4Eoc5zFB4VR8u5lSMt-lwPNyeIiovlUMogVnCsl5Qiqmg0irvlWCrkVNQoUVYy2UVX8uulPMtPlxNNOewirIVdCtl5DCv3lkiuKMWirYVsio4V6ivs5rC0sVMCvAVNiq6FevPsVRit4VoctMVEiqYVbitYVjivYVucvgVevJ+5HaT8VmCqolqorEl33JIiDivCVpsrUVLiuB5+s1iVL8tUVziralgiuSV7itEVFcv+lAiv0VU0xSVACp0V4ioOlevMKV2SpkVgsoflQSuB5FSrCVqSoiVoktDFwfNsCRSqQVTSpQVNEvqZbSsqVKis6V2CtqVTCosZ7SvB5gCoLFwCqj5TtFGVVPMpllUsNlgYxGVfSu0Vr8sHlQyuhFGY0MVDSuKVqyqclOCrYZmyqUVyyqsV1Srfl8ivs5mDJmVRvKdlm-JnldsJ4elyuOV-iusVgSvOVevMeV2yo6V8SvSVvMv0VLQyuVVvPRlnspdls8qu2qUIBVHvJKVe8u8VGyvBVTyriVsCteVtir15cKs+VYyqhVeSsYVsKsN6EKrD54yoDlkyvohQPVxVlfLmV2woWV6Y2JV8KsaV3yqRViSvJFMdRJVI-N2VCUuRV6AsZV1Kp2VaSrpVGSotlbJSZVM-N3lmKrMVDKqxKAqqf5vksAFZSvQF4NPFVYAr3FEytNFZQrsFcquwFRco3lMKthlKqs5VXysRVNSreV6Au1VaKtmV+KqlVgcqGFk1NVVVAvXlmEqxVWqvWRVqrEFnio1V0qvJFTVMdVcQpblwqs1VFsvdVOqvRVLKpPlqst9Vl6VCVo8ttVIqrulEGSOVxquuVGYsHFxUtcF0apYV4ap-lrqrul7lI9V7QqFVbMvyVbDLOFMatTVQCqVVuwpBFWapmFXqtzVdqotlZav9VJqoxVVasjVsMtrVsasBVssoTl8stBVLFXYp5aveF9CpdV5qv9JParrVcarJVzEtJlkaWHVrashVgat0VwavzVcFN7V4IptVaasHVmIukOS6uJFzqojVPqvzVwos3VfIv9lZqsJVNMsPiB6qNFR6oFFa6tPVx5nPVboptlDMqBFZoosVI6rbVNys-5zLInVRGVPJd6t9FacoTVxCqZlL6unVeKobV-CurV+aqCiv6rzF-6ttlT6q9F0ytfVM6u5V+qrZV5Iqg1SGtA1s6tKV16tcFHpOg1HYsvVJooyFZQvw1mGtJVpqqvVJ6rw1MSvI1zKpQ1ZyrQ1d0rI1IGoo1YGq8V6athlXoQI1-YqI16cpLVpwu41dGsFVfCo41uGtI1dYR41M4ofVS8rtlLB0ZCUmsfFhUo8liavCeCmuE1Eqr2lAGuplSd3U1rGvo1AyoSVvKrYZVJMU1f4tmlRCp014T1M1GmvlVkqqo1Amu8ONmv01Imu3Vq6uo11mt6VLms01T0u01VCus1bvjM1eEo2licvuVLB2N8QWsYlIMs-VFKq1SEWts1aqpXVxapI1xl3i13mrs1Wmrg1MUvPSaWqLViqpS1LBwK8kWqkl+spBVYWu8ORWoS11qv7VO6s41xNMq16WsS1NWvc1jmoO2DWry1BKta12I3a1U8udlMWu9lrErc8xWo0lpWv61XapfqPWvIVqUpU1gGuMuk2uMVKAoHVHmrm1Q2qq1TqvVVtWvE1c2pI8w2usl0WrkFX6paJO2rW1nqpzV4GqbV9WuO1jWuq1JiqW1XWo-SFbl21kUuJlZWpjhFWqu1HWuPV92p9lt6pO12atE1d2oK1ycryGT2rqlo2oO1sWoDRv2uu162qS1+WoElwOuh1n2oc1QOoO23LlB1g0uBVY2vK1aOpB1f2orVZ2rE1y2sElSOt61tyte1zcPtleOph1p2oB1m2uJ1iOtkIGOo+lHaruVb2tx1pOqm1ymsoVcmsZ1WyuR1xGoR1HOqZ1+Or7Vt2vp132pXR1OoF1-GtR12I3R1ouuXVzWuS1Quvl10urJ1H6oh1A2vbSwTmZ1QKtZ1FOqwROkpxViuq3VG2pa1cuo-SuutN1h6tg1j6uy1o2W-heuvbV08sN1imIO2Tupt1F6rt1smvg1xl091NOv+1bmpV16Uv9143Wd176tkFX9MO1juvD1XuvvVfGr81vOueObFQj18aqy1MeuBuqevj1f6sXllmv81QiIsYaerHVtku11WJzFVOepg1eepm1VmuSuFesD1BOrp1FutV1Tp3r1MuqT1fuu2lIuob1YusW1Eust1GSItMxeso1gutD1Xev51Guqj1PHMz1JeO717eoz1kOrMeniOH17GsB1LevaRiGp71SuvF1zerH14Mrn1k+qsFVopx1+SPpyK+uw10Krq1e6sJk5+oY1ayoNVIspv1lesI1Puvz1yeqNlE+q51FUvJVZeqeyDquf1vGtf1NeoL1pwv-1W+rN1cOs61A+t+RB+q-1FmuAN7+pYqYBvn19upn1VpWQNh+quFZ0rQVkoqf14Btt11ep51neuB1sBoW1ngq+10BoTRn+rINCqqgN6+ql1pBo8V5upD1qmqp1jBpyVlavO1u6utZimVv1hmp+VeirYZvBoAN0msT1C+t-1J6OoNTBsgNFBvoNVBsLVmBujFLSsblRepENSmu-146sX1faPYNVSrrl9+qY1vctUN+Bu91hBvmVEho9ROhv6VtKtQ19KurllhpWVd+r2V6ysMN9hpOVehqcND+rsNUho4NhOrX1e+tx1rhueVpyv0NthpcN3ht0NA8o8NBhuJpwhuMNCeqANRBod1khoUNcBpC1napP1bssCNCKqcVPKt+VQhqMNKBt91SRosN4RqsNeqsY1oRpiNBRsUN1EqiVldNiNhRrf1xBoCNpRocN-BtyNghp4N1RtSN+2uj1WhuSNKapqNkSuUNpcqyNNKvKNIRuM11rM51NBvs1o+tYNLBxmN0huV18Ov8N2IyWNPhqb1LBtm1ixrGNXKvaNNhqmNy7I2NERuPlc6pjlT8taNbhsiNrKsqNbDJONZRpyNhxryN0xr2NuqqeNFRqONRYoeNbRusNnxpeNxxreNAascNtxq+N52KBN9aov13qqv1rxquNQRvcNoJoBN3xohNo6pH1surkNr2LhN2RoCVzxs6NgJqxN4xo+NkxqRN4JoJN+xr+NxJrxNyJrJN7xpxN-xqpNpJpSNsxsy1qBv6NqOMGNPRpe12OvZ16xpRNb6vT1rJvMNoOKZNyxp312xtr1uxppNwJoON9JvnVsJpFNmxuD1qxoWNSmNkIEGU5N4Or6NQppxxG6XngGpqx1WuvG1jWOYo6puZNvmvENRpsGxU0FNNopr71u+pVNc8rVNeprNN9MqKNaBp1Nn6UaNCBuaNvJpNNzpttN5BpR1GJsKx1pv9NipuYNypp2Nqpr9Ngax81rpqaNxRuFNuptjNGWvNNgpstNmJtDNKZqa1YpsjNEpujNWZq9NiRvdNVOKdN2Zpu1dpvFNIBoLNyZqLNZhozNIZtrNQxuaVoUpvlZZrrNP+obNlWMLNzZq6VdRooJx5htN4ZpkNQZrWNH6UHNYZtONYisv1W2slNPZv1NBuu5NlOrnNTZoXNruqXNRurV17Zt7Ngys8NYRvnNLppk1CZpLNb1kUyQ5qnNuSsbV3BuXZZ5snNjxrpNlJrlNN5osY55vvNLytxNT5qLFt5vLNsOpWNdBrHNZMpjNHZs0N2pq9x25rXNfWsNNGRsAtB5oDNtBtkNAFrRqTtFfNvxomNURruN1rPulxGR3NRmpJNr0uQtd5tQtRJvQtYJvwt4FsPNYhvTN0Fo8RFphQt1xrONOGoZ1mR08RdFvhNNxqDVFxoKVtFsIt9FunN0JtnNmzxYtPFrYtDFpnNTFp+OWJVYt2JvfNsps4tbDOXxUlsJND5pIteFo1BCluEt0luCNKloZNtILYqilvJNaFsRNOlrUtelo0tSlpktj5rkt1rNKl+ltpNFlu0tn5s0Rplp-NtOqVN-5odN2I2-htlulNFJoctVluXZXlrMtBluItRlsctQIMCtLlqD1EZvctUZo9143W8tkJpBNHFrzV1rOCcCVtRNq+v71wZoUJhvXSt-JpL1m0uotOupWceVuQ1MpsstKVuXZH1lKtWGqSt5xsqtRYuqtQVrstWltCt-lq-NeQxqtbGqhNV5phNz5onNkVsb1bloQtHlrdlA1uAtpeq7NlRQrcXVoM1vlratDVv7BM1uatPlsMtyVog11rIK8s1tc10VpGtsVu61bnm2tcZqPN3psTNWxMOtK1sSt5Vr8ti1qBBW1sutGVp6tXBr6tRYuN8R1tTN8ZtOtJ5qRJbvnetOZsrNeZurNB2zetD1vytaJo71Z1quJv1tBtZVvmt61ou1JmtsCf1orNgZvmN+1o-SVJORtv5tzNMVvzNwNqRtMNtqt11oWtG1uXZjISxtrlt2to5tGtL9XJthNu6tdVsYtkuvbSdNsGtvetRt6JsQtLNrzBFNqitI5rRteNuxGrNomthVp5NLFS9CvNqGtVNoFtQNvyREtvptc1rWt9VtJtRYr7C5Frgtcxs5tNNsjSHpMlt7Nvgt1NvRtqYpIietu31ANtxtstvFtJtoVtO1v5tWtqNtOtuttbNrNtHNoht31rbJS6lNtEBr-Ne1sFtLFSCiXtoINhCq+tbJqtKAdpttx1sotbptDtCZM9tEdo+tJ1uLNMdvrJBFudt3tpxtvtsttayOKMgdpMNwdqTtoFqdxOdvjt-1tdtFpqKtoKOLtadqDtFCvrNFdr-1h8Vzt8RtMNnZvrtzeWFFTdtz1+drrtYttuR41pwtAhrCtGoJLiq5ootCRp7ty5teRcFM7tVeu7trdt7tkaWntJdpRtBtpltiBv6aS9urtedtrt89sntsKM3tIttC1C9qIy7FJntL+pbtIFqmt4lMTOZ9sANF9smtbdropN9uXt2NvNtmdvXtk6vaSt9tEN49t3tm5u7VX9pftlNrttbtuTtxcRBF39vUN8BoLtV9tDaEDqAdfNp9thtr9t-TXcpkDvM1aRrZ1e9vyRaDoQdUtpAd5duPtKGVwdW9ubtc9svtj9qtKJDsPt6RqIdT2WTVnpoHtHRqHtQwoYd2Fogt5Oo3N7uvyRbDvQdwWt6N0+rAdlVO-NNDqwd-9v6aTVL4dUWq5NUFrodzeUkdeDv1tmttAdhdpgKk1KkdJWoNNWptgdMuXWRGjpG1WjsEdqjvEK6jsUdLttXt9tpQdx2Xpy+jr21Mju0dlDtDadgtsdz2s1NRjp0dBORsdZjvTtb9uQdWdusdqdtEdbupexoeSEtpDq7tO9oodcjraK4NJcdYOsMdxwqEdYNLCdQTq4dITqHyKTqYdH5vat4ZJjqcTsx1i5tkd2DosaL5u8dNdum1MDscdZbXVtw5qQda9p9NJTpqdF5s4NROuZtPcPitZTu3tFTont4joIOQPXydLOvXNRTt6dV8I6d4TtntkToft0Tsl6QFqydsltutwYP6dnTrIdkztFtxTsZhuVuWdETu6df9u4dgYwH6Azv11Qzocd0zoT6TTrfNrVvht15qLFZ9NgttToztfjo-to0JKtWzomdOzqid6ztDhLzvGd59vIdUzs+dzzu4tPzrvtfzrWdIzrMeLQ0OdLusgtJzoBdELs6trzt+dqzqPtcLuE6kLsRdILuRdtDtRdeHXRdwLp-t99rBdezvTGeLtSdwzuJdBB1JdczoqtKtpihmDKhdkeqP1ykvMlvPXpdGLoJdoLpRd4LuE6bLvxdUDswdwTtYpznWPBDLoFN0duMd+fIutfLowdAjsSdErsdsIrvZd-Ltldx+tOde3UVd0rv4d9jvcdVTth6FjNFdBVq5dFLskO+rqVdMru1dcro8dW40Cd1LputtLtghprs1d0jrcdlrt1d1rvOdRFuUtJNoRt1rP15Hrt4tl5uetAlsyOlTINd4NsIdOLuc6obrNdWrpddqrsjd1HWjdTrs0dhTthd3Lrw6SbrJdabuNdS+p5tMbuddCTvjd6bpLx-do4dmuuzd6TpLd-rpEtfFt6twbqu2U0zDdmVvtNDtskOjbvzdKbuOdOrrVd-szrCTbqetrTsoNZj31m-bsZtYlradwnRHdHboMdqbu7dCbvY6U7uTdM7q7drrp7dfc1KdS7rsdcbuZd+nIlmG7qzdc7uLd1HRCV7DrHthLqNdlbuPdTtoPdq7vndes2vdtru9d1zpihJ7tHdxNqudL1pfdD7rLdU+tvdR7oXd37rPdnLuxd-7vvdhMjfdcNuVtPruXZTXOrdmloRNH7vrdHrzjtm7tcdhbp3dzIpVeNrp-dTLrMlu7vteKHpvdRbpzdwnVYWEHqVtTNqHdpHsI9j7sQ94lvmeQLqI9GHq5FuO0YdOHqwNqCpQlxXMY9tHqg9z7tghYy3I9IVro9E7rw6gnundW7vQ9eHsw9yOzY9QHqxdYjpI9YnsbtEnrQ9s7r-dSnuc6uTyE9XrpE9VHuU9pbvk97zv+doHv9WKntQ98TvU9xHsvd7HW09qnss9K7us9Qruo6IBx099lqfdn7tghrnvs9BTsc9zHvOlIH33dvHso92Vuc63nos9vnphdh7s09LnukObnsudfHs89wYPC9THuk9LHvhGKXuC947v09YXri9PnsGdUXo09Nnr26mXvY9ShtbN4EvVO8XoQ9iXqQ9en3A9+XqOdhXqc9CzOY+z9oi9BXs4d5LuK9b1iq9jXuhdXXordznqXxBp2q97Ftq99Hvq9cHvMtCXpC9XNvh+7XtS9PUpwNcH2m9wVt09E3tE9zN1G9-XsZdHHu6VB+L69HXqa9g3ui9PXqHxO3uO9A3vLdZ3uG9FsSO9S3uwNXHsC+szrK9tRpGN7Usu9j3s49tEpk+r3qM93Op6dMXpG9i3qy9-Fsm9-X2w9APo0NJnuB993tmuY3tEt4Pq29ndwR9u3rFdx5qSdL90AdV3r295XphluCrR9uPox9IdvldqNyJ933oO9I7Ip9YPrrdEPogeOPsp9-Zv-ZNPre9wxoq9hPsZ9tPqDd9Pvh+XPrZ9LZoJ9bDKIAKLhUZknqs9-npW909hF9dUO59g7tC9fxRl9LkJm9NXrm92tvbSSvuCx77s29OXsV96ThkZ4vr89aXoC9peBF97sPudvjvqdkNresZvvmRRNsg9avtbd56Vt9kbOAddTssd-jo19BhKZ9H3vAlLvuQZq1uE9OvoV9nrX99hDIDdLTr8N6vud93vrl9Ufqd9o2TD9RVJV943sd9Vjq995hM6ls3uy9IfotiSfvhlGtpZN4rqtdNNnz9Vsuh90DqB953tL93kor9ArrSdd3pt9tfsL9aZuL9brpr9JuriN2zsB9uzur9s1mt1XfredPfo+dpnrasA-p99HPuF94-rj9WVvm9ifun9Avr7NvvuJpZfr4NDvpz9c-uLyq-rUN5ru3dxvql9ySm39g-qRdxnqJdffscsR-on9QvutZl-pn9LbvT9Mfs79V-sllK-oX9dfpVdkvue9emjf9Lfs+tlTrXdHfs31z-vNlU-qf9d-qrNTzsf9QAfADgNsgD8-rADi-t3N0RtAD0AcQDuFuMtKgNv9aAcHtOTqBBWAff9Frpa9VzIv9P-ot9ZdqotAAf79CAYIDe-uW9X-u7QpAeadvhtn90fvn9KzjX9FHo39rAa39H1g4DQfrT9nvpj97AZ39sbqk9dAd+9-ml4DIgYLdEvv399AckDwgeP9mLtP9F7sb9Y-sUDwAZ7lr-o0DMAYttcAZ4DOgewDzDtwDGoM19Upqut6-uR9uvtD9UgaUDHLoU9grta9h-tsDmgf2VN-pcDugfftDTpfqZgcpFRgeydCzswDuks8Djzu8DWqV8DJYpCDVvvdt-fvsJWftV9XAYT9BgZ2lNAbEDT3okDv6GCD-gfmd9rtMDoRNcDzhu0D0zKYDWxtgDYQa9999IKDe5qKDrvsQdDzuiDWPpIDlQaiDHvv0DlRQiDH1M9d7nr09ufqb9zQeyDNLug9RYo6DVTMD9G3oEDbQb19-QdSDsgfEDifxGDzbOz9Vgd6D6geKDFzoSDywc397QfyDLQZUdJftiDawa6DSwbp9KPpsD0wd-9idqr9agZr95wbIDFjr2D7foODtQfwd7voeDlAaaDhwYj9zAfv9ggbYDnwZrdgbvl9WwamD-wfg9qfsSDD-vgDE9LBDSPpOD1gbz9sfoGDdrqGD-YLL9YjPDdFAbvdTfvN9JQeGtoQet9Y-pxD6wfBDmwe4D2waJDRwY2DcIZWDgAa19lgepDwIdD9xCKRDHnrq94QeZDMwaN9cwYPxZwGPhYvrU9XIfSD8wY5DFwajtmPrJ9R9l5DfyPW93QeD9jIbz9IobuDyjojdo-tL9iodxD0ttaD5Qed96oeJDsIZ59pwYVDfIaqDyAZv9uocpDJIYZDZIcV95oa+DpQb0D2ocT9toYBDkfpYDSQfaDzoZhDtboND8IZt9noZT9+oaBD1oaZDxod2DKobh9fodDDLIZ6D8ocjD0oZatVIZ9DNIdms-oZlDxwaTDsYaOsUYc5DzXs-9GQcVAqYYTDloYzDwYaND8YbGDsoYmDjoa39hYYrD6YaDD7oZtD2YdFDv9pH9EYbaspUvRDzbogD1YfaDnYYN9AodzDcgfzDxAH7D-IYc9Q4e5DldIC0c6ITtYodJ9+wYv9Y4ZNDGFuXZM4bpDnAdJDjYdD9y4bDDmIdVDs1mXxXYYHd8fshDW-qPDA4YnDp3qK91wcPDTiKVDRfvFDi4eisc1h8xr9vIDbfveDL4bmI7yJP9w-th95-u-DmSL3Dn4axDbVh-D8KJ8dH4afDjwYv9EEefh5juVD+4fbDpfvgjGyKgj9wfDDgEclDWFuPDY7q3DZ4faDuEcvDkXuvDRAfbZ0vuIj44dIjN3pvDTgdN9VEZXDpFtMDjEZAjMEa-DOEY6R1Ec69tEfIjKksP9rEejDcodLDb1jfDbvvqDWoYJD0mI3D-AYhDvwe7NkEfKd-4bP9t4ccsCbLBt3YbKDUkYDM6kdhtm4atD24dLNAfosD+kZLDhkdEjzwaUdj4YXDsEfQViCrrDiYYbDhEaTNBfofDrfvYjYEekjaEotDgYdPD8kfZNrkY1DBDuQj2EfzsGCoDD3oacj-kZcj5fpbD57pA9KEZ0jfJr0jskYIj0UY9NZwqEjVYe0jakeSj9vtMjUUcmDGUb4D4wbkjRUaMjCpqCjrwawjqkbsj5gcet+EYMjzkeKj0gc7dk4aFDB+J+NdobxDDQYlDYUbyjDNu192UZiDuUfqjGkZPDboeajFUY5NOYbIjeYf0xY0ZSjpUbSj5UYsji0fyjqUaaj6UemjYarYjNkY4j-UfWjg0fpDZkamja0cqjeocijfkdWjFFi6jLoe+DPYZyjdUYujPkaujk0e2j50ZmjcUeA9intCj09jujXocBD10d7DMUZKjlYbKjIMZajdgeVdhAfmjnUYGjits2jp0Y+jbVhEde0f-9nkdmsaMayjEMaejkoexjs0d4jcMenDBMe+jDgYb99EcSo7OjW9RYd8j70ZujpftJjbkb-9VwcpjjFGpj-3rJjKgYSjf0cP9TMaqjEkbeDmMYv9-McujQMfpjkMbz9DRvRjrMeIDL4eljOMZWjksZt9CscJjv7r4jLLvzsHMZej3Uc1DQsYPDIse6Nasdw9U4YoJ2sa+jzMcuDvftqj+MY7lYsddDPwYZjWMbtjr0fFjjseVjqMZdjuseCjoEYNj8sa9j90ftDXgbxjWsb7lAsct9kkZGj-sfsjJkaRjhUY9jjMYDjgMYdjj0ajjtsZjjDUaGjuMbTjocaTjEUbdjqccaD0ce8j3seqjIUZtjucYzj40cajyMadjhsarjS0fBjSsZDj0vu1xTEdUtmAbbjMsetjbMcLo5sc6DpccFjNUd7jkDH7jowdjjy0a2jdceLj4fsDjPUcjjRcfTjxkczjJ0fjjLcb5jnbMVjU8YTjzscsjiEesjGMb9jS8dnjycYejWkZzjrcc3jxsf29zPtI5Y8cWDjkeBj68dN9Xca3jtcZ3j9ceXj1cazjzcYvjG8b3jGEaQjvscSjn8ZPj+cZTj58cXjlca-jjcfrDT8b-jL8avjXMeUjqgZHjemlfj18fx9L-uF9GCeQTMPpUjaCe7QlsofjxYbXjCCapjxCYHZGIeATvMYYjG1PbjGAd8B+mgATSkfwTqCbljnEehD4CbPjDoefjFCYepDCZYdTCawtJCbpj7sb4T7MZETVCc0jvCfITkiYET3cbbDtCf4TXCbTDj8YljEib7jUiZRZhrp5jFccojCibfjZCagTBiYhl4cegj+0eFjL4ZET8QdIT8CZMTAkaBlRifsTfUdMTDcY2jk8ffjmidHjxCdsTYicLjriYEjosvtjPCeDjcia0TwSddjECdkTDiboTusucTGifCTPiYwNCSfETSSb00lsrBjcCcSTsSYoTKScwT73sn9N-syTrUeXd7UZ+98wZKT0Md39aQYqTPIaqTgiZMDmAYaTiiYAj+iaCTeBsaTgQeET+SbwTlfp7jHCa1jLSdSTASefDOEd6TlsfnDh8ZAT1iYmT5icwj5ccIT-mmGTBSfZ91-rXDKyb6T9fu697SbiTCMdttZcZoTuybyTnSdaTBCcGTlEbmTISaDj+IfSTRCauTUSdCTtydyTkiYeTg8Yjj+sZmT4ydOTIycgTgSb2TR0cRjnieMT-yZOT+ycjtrYbaTSyd-QmycmTkKfOTFEY6T4KbnD8KfYTiKYBTOsbnjeseHjFyaRTnMbhT8Ud+jxyfkTUPq2TH-uHDlSa8dxPt0TRKehT40CpTXSdyDzSYZTZybRT-EYYjLKd+TMSdBTJKZpjDkbsTOSZ5TWic5TqycF92CeKTIqbJTsMYpT9SclTBKZ+jjgdxTHKdJT8qfJjOybpTwIDlT8yaATHkaPjQya1T1yfnjnyeUTvKfxT2qYPjssfRTKib5TE8abj28e8TGSYNTjyZuTvUbGT+qZVT5qfcjlib1TbibNThqexTiyaVT1qb9TzqaNTOKatTpqbudnqZZjAyYjTwqY9T-qZ9juqa+T7qZtTK8YKjLibdTvqcxTp8ZdTC8aFTPibP1pScN95Sap9ZsawtWSfUTaSZeT8aeRTpdoWTRyY1T7VlQDoqaX9RSY2TRaeqTogdmDHUenDFaeLTg4bmjMqb7TnacZTKIbwDNicdlJPumTJqdrTJcaxTSae9TKaezTkQa5TYSZrThabMTiacOTyadnTm6fcTx0YzTgqazTjia3ToaYDTjaaDTkadXTraaQDq4eGDk6bHT-HpYjTidvT6AaETqEObTdaZXtOqaXTe6cdTLaalTtAd7T5adHTrKb0TTaf7TXaZkDgobqTI6cAzqqe5jtKavTc6ZzT3CbzTxqeJTfcbQjlaYFT1aYLTemhwzA6avDRMeHTZsaIz0GbajQ6dNjt9KIAFGafTSXswD9GfAzyGbjTo8eYza6eeTBGe7QHGbfTOAe6Tn6d4zQGdqTZadozQmcQzKCYgzKGfYzy+uIzNEfVjxMfIzsmcozZSeozIGbEzymYYzbIY194mejTVsaUTWGZkzQ+rkzPEYUzZGY0zxmZUzJabUzcGaUzlma0zvPsT9ume3TQ8cDTbGcIzmmZYziqfczPGc8znGddTtkclDzmfPTi6ZnThmY8zKQeEzPadsztGY6lU6ZpT3mfZTVMbizDmcNDNvpSzXmYpj0mb00GWf8z+aZPTpvtyzfGeMDAmYEhr4YPTQKbtTXibuT-miKzUWdgzombvjdWYkzbCakzPmdqz00ryzmGabTzWb0zUyctTSWfZjvWZczHyfDTg2b7jw2ZCzO6b-T4We7Qk2feTFibCzPWc6zxWYCDTKaYT82YXT02aWz2WbmzK2fqzpadvjkvPKzMCY8TVWZBTBWeSz6tK6zY2c1j0vq3x0iYmj+Gcuz7MbQjoibejz2cCzWsbezj2ZrjF2a+z0vp+zOieoTu6dmz-miBzqWd9D4EdppmWfVTu2fBzMOZuzbmfGzRmZYTXTskzrGZRzEWbRzKzqQziWbuzh-ohzsOaG9TaaJzSOcvT7Wd-QZOdWzOQfHTpgYvD3EZO9pGZozTWfvDfWdRTbWaxze2bEjdQdGzyOYJzhWbZzI2cWzA2YFzV2Z5zLwdczFOa5zHWYlzVka9TO2cpzcpCFzU2alzoOeWzcuf3jCudFz+HvuzKuYWzDafVz8Od-QDOchzyYaXD+ua2zauZmzGuZkjwKczTAOcP9D2eBzMifXT3GdlzOOe79rWcxzYuaGz12ZpzgwefTmAdKlPEtpjH2dGTjucKz3+L8T4eb+TL2Ymz0efizIOZtzxublIiebNzmYdL9IeZjzBcbjzkeeSz6eeJzt3p6z2eqszg6eZz6maazpeYzzIkY7D1eaLzdEdTzo4frz5OaNzSuebzRsYOzNmcazx2dKluGf8TeeYOj92ZbzAeeRDQeY2zI+a7zFeZizVec7zLWf6TBmZLzc+fZzhKfxzuuadzk+fnz2yZJzTefXDgKYOT1ucVzMuZNzm+ZXzCqayz7eb3zaGbUTeGYjzQ+Y3zy+eFzhuZTzl+b7zJmaZzZmZZzx2YD1NefMjWYZ+To+dZDjmZrDcerLzJGc-zlee-zoBd-zZ0f-z36ffDz+aPzvub7jP+YbzGsfXzpvtQLreZfzx+YLD0BbQLimdozWBcALMYdrztIf3zEKdXzF+dwL71moDU+YgLM+eOzjAafzv6aQLGBapjzBdVzfOelzyBdHjnBYNzrBZ1zMnul9-Batz3BbbzNBfwD9BZNjkBcSZUha3z5Ka-zchdELuabDT-OfYL7MZUL6GbULPBY0LKBbGdMBZRjaoYMLBBfMzd8YithhenjkoYsLphaULg3KlDaae-jq8Ydz9+cwLJhewLbBeELh-psLHhaEL6Xul9PhZILwkb-zxhYa91KeTznhf8LD+ccLsCarTd+asTkoZst6PoSz1Bd4LOWectlhY-jL4aSL4RddzXGfjzo8ZyLmRYdTc2YyLthdkL9haKL5RcYLchaqLvhdjTkhbqLQReGjG6fSLQXvqLi+d3zTRekLN8eX9wvu6LChelTdheu5V+dHtPRawTIAZv96ltyLT2fiLPqadzkluSLERb8LJvvFzMRbOz2Sc+zrhbWLIaYELFqYaLaRe5z6xcPTccZcLCRe+zmTo6LUKd3zaEcR9see5TBRexzuxbELIuYOLehdRzzxdULF6YkLhxYRzPHquLCKckLtxaWLeRYCz2xdezlxeaL2cdaLvmf+LUJd-jMJb+LxxcqzmxbmLy6cJzkJfGLhSfWTwweBLMxb+zZxfmLpvrxLxRZqzMKadTexe1zbxa8LyqeRLB+fELOBd+L5JYTTXBdeLnRcvzWFruLueYeL+eevTcnqxLayfFTHaZZLlJZjT7JckLnJZBLsxcHz5xcBzmJcGLwGZqL9hZJL1RZ7zchZVLAJbZTTJcVAGpfhL9qbJLOpflLZ+bVTO+cvzupYFLYqcmLa4eCzopf0z1xdfzbetVLR2dqLjpc1LnOe1Lo4ddLepeqziJZNzXpYtLbaZxLqIeXx-efuLbuceLRxYoLKKaoLcOYdLAMe0L3xcZL7xZyz-pYVLImedLlRdTLxpbxzqReTLkZevzYee5L4Zd5LE2azLLBf2L4pY9LJ2YLL-KYHzPJfBLpZfjLN+brLxZYbLhRf2zaZeizapczL4UebLYZfyLJZfbLvZcLL0SdbLspeiL86a+LoWZWLB-qjzecb7LRZYHLbZbaLFWfpLbJftLjRcLzbpZ9zeZdqzW5e9L-2eXLpRfnLI5aeTYJfHLc5dXLlBfPzsZc3LJ5drL-ZfPLRJYLz95dtTqJZlLz5aGz+5YDLd6eYjwee-LnZYazGZZGL2eaTzoJfyzg5ZXLk5YTL05epLURcvL0FYXLo5aXLF5ZfLV5ejLN5dNLd5fQr9acELcFdWLX5dfL6adOLx6cgrx5ZwrP6YrLG5arLoFdJLvpbTzRFacLR6a2LqFfZjkhLor7ud-Q7FadLfRbND2dI4rEZf803Fe3La+ZpLVMeErB5cJL6JbcLHDPLLVJcrLu5a4r-FZ4r7aeGDElZ-L76aaTTCfUrgFcOzvFbXDOlezLGOdEr8FfErylZEruZbErbFfMrkldIrR5aErNlY0r-GfWzn6cMrclbFL1FcUreBdkrrJcQLM5fkDSlZ8rtpf6z+FdnLZlaCrLxb8roVYCr3lc9zQ-u9zJlYIr+hYirU5e2z-lZHDDhdOzJxftzdldYryVbirf4YSrlldMr1lZSrMFbSr0VYyrbld8reFYUrVlfyrWVZRLcRY-L0lfCrBVeUDxleKrSVdHj1VeCrHOZ3L9VcKLAFaMrRVdvLNFeGr7lbtLgJfGrjFdiLt+Zar-6fIriFdPLGGduzXlY7zFFYQLtVc8rg1agrfgdsrLFc-LCedmrGxear9ZbyrQ1ZOr2VfOzUlcWre5aurTVfmr51aOrl1c2r4kYZLkRe6re1ZvTTlZKzLlbKztFZUrQZbwDgNYsrY1fWroxcCjk1ZCrdVZKrx1bervOfXL01YhroNYOraJburJ+Yera5airsNa+rS1f2rv1bWzdOf-LWNevLJpeLzXRYmrNVaoryNd2r+NZ+rule7zwFboFkNdijjNenz3ZZGLyUrBrWFarL3NbRrC1bBzgVfar9gZzL4NbprDlbKrSFbPLEFfsrwtcar2Ne2rtNbhrfBZKtfZB5rFNcvz1VvVrAteerrVc0LatcZz13oYLnNZZr2taNrePuxLQpeGD5tYErZFYUDtFp1rhNdpz4+c-TttaBr1tdRD7tY1rjea1ruVqdr7NZNrzNehFZfpiyPtfQLEtcyD-tYtr06fSr8wbStAdZGrC+Z2rKtb00XlsTr0Nf6riVbCrpVbVNGdepr8lZTreNclredZjrKRfFrqde7Q6dbLryxcqr8wZst+db6rMZd5rKNb0tjdcirSta1LrdZfN7ddSrh+bjrPIYbrNdfAr3WcprPdeHr0pb1rGNYYrpdbtrctZnrJpt7r5Vf7rddcHrbdYnrBJdyrL1e+ryRCXr0tdWr6hcjryucHNe9ZWrOhZ+LKNcktp9YfLi5afL+tcbLs9Y9rVpeGDCluvrb5bOrY5e3r+Zcyyc9YurTxetNb9eIrOVcOr99Y+LADY3rP8f1L9FeIAtxcAbTFZIrIDenrMDZYtcDbmrLZZQrX9eWTFJY7rNNa7rR9c1TIpZwbhdeVrxdeZLdJbJrYtZbr+Da-TnxeXrH1YHr8GfIbGFfJrvtYlL2Db7r9DdXrfab0dUpc3riDaFr40B4b+JcgbPpc4rgjbCLv9cwbMKaEbkjdAb6CfaLutc-rcje7QosYLrHlZIbOdb7jqjabrmFc1rkhe0bRDfUbeDcrrkWPAbsjaQbJ9Ygbzha3ryjdMbP9afrWgfuNj9fDrhBY-lzjcUbGDdsb11HHr5jYEbSkjMbDjbcDz5vcbztcDzjGd8BZ5tQbp1aerSjaQbnJaib11ffLU9b8b8TasbzFfRrKTZsdCTcer6DbvrcTaybaTYQbGTY1TFUFUQFBnKblBkXrhTeAbxTabzpTZIMFTfIMITcDrMhaVLdSrKbjTaabVTd8bJTdcAHTc6blTYCbLjbMLCir6bDTYGbzTaTr2+b0bHpfqbAzbIMkzczrzdZmb61cQcxBnmbgzfsbwzeGLuUqjI4zc6bizbUbU1eMbpDbP+6zY2bhzZ0bLDYjrJjaeB5zfmblzcMbxzfdLqzb2bGzYBQ3TcCbhQfktbzYubnze2bFReu5azf2bjTcebHDaRrJzc0bbIPubEzf+bHjbybfjeBb7zbBbdDYhbLzfwbSLb+bQzfhbstb-r0IJhbBzbhboTbHz4TfQ5vzYebRLZabvRdUrmiPJbsLexbxLaALaWaHxdLcJbDLapbExccb1ltZboLcpbUzcULgLd2bBLd5b7Lf5bQxcFb7Up5bFTZRb+9fPrSZYxbUrfKbMrbPriZc+rULdcQirYoMyrZvryFYRbvTf6b9La2bOLdHr7ebmbWLaNbjLdILIRaumBrbZbFrY5bVtefruTuQt2TcVruDfRbtzYEs9rbFbipdNrXhtFbSzd0brDY9LkTeqbN1ZsbSDdDbPTabzljejb7edjbXzeqDTjb5bgbeubrjagV2rffrMTc8bSDeYTKbaObMNaLr6rfuT4HtdbFDc6rFddObFqFLbYbaSbsTb8bebYDbBbazrXVeLbyyb0dZbeYblDZWb1DctlYdeNba1d7bHbdrbH9ZzbDbb7bnbdwr7rYGrnrerbmbaAb4bf4bkGeHbcbYlLK7cTbpoY2T67YBbbTZZrE7ZHb2bb1bu+f3bq7arLJ7Y3b96dRD57Z3bfrb9917YHbh9dnbjbe9bqbe7bwbYhr97ctbwRdgLpfs-bDrcFLTrYnT27YfbuhaHbNbdPbH7eA7X7ZaLYjbnb+baubb7ZubVbefbu9YPbuTdxbUjfpTLrbQ7j5Yw7Xjaw787fgbNTcFrkGYKbEHd7bZHYvbf5eETlHZvbwdbvbtHZA7F9Yo72HfI7T7dSbbHeQ7HHao7HcZo7rHZ47jCc-T3Hbo7+lYfTjHeg70Jdg7NDabbCHYrbVDfY74nf-blpa5bwpcI7aDdw7JrbYb-HZE7NLYnTinZ9b6ZdE7V7f07r7bk7PbYU72naY78rYs7aneib6Hc07Z7ZM7zbeWb77ZY7tncSbo7aPbHJac7sndGr8na47PnaebhbY0bMVYIb7nZybGncHbNnfg7QXZbblbbbb0jfA7AnY-TZWb-bBna7L9HZX9aXdM7fnfM7XHag7SncDLnteJxMXfBbONaLboXYTbOneBrd2PC7breIbkLdC7UbeS7WldQhzXeq7xXczlpXdRb5XZC7I4fa7VnbVboXeE7g3YYbPArq75bdy7rndnbI3Yk7CJdg7ZrYpbMndi7LnaQ7CXZbgtrZFbL7ec7QbbW7oXcW7hrdQ7nHfW7Sf2Fb0re67srdVbY3f-Zmra6by3bK7ndY9bVbcxbS3e27vneTrfXc3xIpBBb53fu7PXce7M7ee733eRbF3ZVbsFdxrJ3Y3ArBBB7f3cu74PYq7I4ah7P3aVboPZ1bMtYc7qzeB75raO7LXdKzj8PuQyPa1bqPazb9nai7Vbb0QJAEJ7d3be7K3d276bcSZFPap7CzeJ7C7brbY7Y1TjPZh7NPYe707ezroXc572PeGFuPf+r+Pcp7XPZx7HXcA7GoIF7r3Yl7o3a4bZhK-g4vaF7kvZU7jVq5Iyvf7bc3agbsHerQSvcF7WvcK7v5d47qEL17TPc2bcve17ojcErzZg17BvcnblFYa7T3ZO7Zvc17Dva2rvPdbboXa2Am3d+73Pf+7nvfi73vcnm5vY+bsPbB7FVYh7wfd97KPfD7aPYProHdnbPvdD7E3a7bZnem7VbeT7bvZw7t9bw7kbcNIKfZZ7RHcXbtTfbzVxjO7sff97cPcj7CPcNRBfez7x3aa79fft7Ofd1befb8b5AGh7Lfcb7I4c77hfbj7JPci7j7arbffYb7wveJrvgJ4QYve774-ddrAkKn7-far7EfZXrUfd77ouEX7lvaN7mlbx74TwX7Y-dV7QTdetiDg37Kvfl7q-cT+IpH17svdP7VvcPLeLeECx-f37Z-dr7B+KiQMfaJ7A-dZ7nnfb7Gqbf7J-cN76XaArRnaBBf-af7t-durfjaIM--fd771bRbgPZO7UA7AHW-ecrE-bMFhaC771-YAHOXY+7jXZHDljAwHh3Zv7yA7+rqA+3J6A+gHrffR7ZPZO7+A4oHPfbjxutpgHiNd67uA4YHJtqYHkuc4b5-bOpjA8oHCfeY7M3d4H9A54H7A74HcraG7eA4DtHA-lzRjed7w3akHYg6u7CvbIFCg+EHldKLURffU7ufYx7+DY0Hn-eL7bPa87NBZHtm-cAHeld07w9o7t0g61zsg-gHw3asHig-h7n3bOpDg7UHTNNcHs-dJb25Ont1g8ATgff87NA58Hjg5r7zg-UHQQ7cHZAvCHng+0zKGSiHB-e+bmFtPtvg9YTOA7kHeA6SHwQ5X7L-fUHGQ4iHCAtyH0Q+ALdFK-tyQ-RzU3b276Q5KHmQ64H2Q6ZpEDtKHuOfT7FQ7kpVQ7yHwgrQdDQ69zqQ7sHeA46H1Q7gHfPd6HZfywHO3bTbIzdYFfQ7aHEw+GHnQ-ir3Q8GHceMmHhQ+Zb4hSWH8Q6TbmFrWHz-dCHTNN4dsw8Kr8w697eA72H-Q5YHaQ7jxJw6mHkwtDVRA7MHTNeAHw9suHyw6hz4hUkd+w46r5Q-p7kwoG74A4jbKTbeHpw4B7Cw7OpAI6uH6AtBHzw-Nzawp8bkI8zzIQoK7dw45rmXfzV6jveHotaaHXw8NVCI+wH0zYz7NA9RHgI-8HeXfxH2I9GHiHcxH5IoJHYI8pHgXZ57TvZ6HE1NpHAffpHwI-UHzjrRHMMd9byI8wt7I8JHLI6OHjI8s7vw6XbTefMFS-fj74g+u7CAtidHI5qTGXYeHQwplHfI9sHrI6ZpSo+pHd0rZKIw-e7uI+aHctKvryo+ebDI-1HVXe2HrA5NHqfanb-I6D7eA61Hso+7TQA4sHQwryd9o5gz5g5q7zo-XrGo9hlLo8NHwXfNH6g99H3o75VXo9hHZBde6-TtdHVGaRHCo+fBkY79HcXYCH+3fjHwY4OVKY7DH1rdDp8VqjHqmZjHTo7X5lo8d7Ko4FHMdIOdOY+szeY49HBY80HdnaH7ifarbwtiFHxA6Jrc-Z35+g60HbfZ0Hs7cbHhY4971o6THI4Z7HNY487h7Z-7dTdSh2o9p7Yw52bsKsNrqY99dE4-LH5eaDrsY+8hc44zHP7de6kLqXH4Bdabt7b+VnVp3H8mb3H3I5g9244THq3YpHGyvPH847PHh44vHdPfGHevJvHG46ML+fJI8k47pHxY5tHGDI-HR49MzJ49XHTkPpd-44-zgE-zH9EJAnD4+nHErcEVUE9vHNzvgnr46sL4oz-H0E-JHT4+B5SE-WHm7cQnaE4QndLvwnyE6yLrLqInOE8vbmjLInZo-OHZfKonwo9L7NBYIZ4o8H72g+oH+3ewn1E+NHg-JhH5E+o7kE7onzY5drXg8UeHE-onJHbqbok8EnYTZiHPLoEniI5XHEE+Anck5xHArd3bGyskn8k-AnVY-4nPE84nqo9r5yk7JHGI8wnTCo0nKk-Fbak7gnhk51Hqk-3HByrMnRk8+HJk-Un1k6nHGE5nHgipfHvE5N7TkK8nek5LHiDJaGa2W8ngnd8neQ2Cn-k5-HwDOPMEU7EnyTZKbQU+hYIU5S7ikPCnSU8inA49PpiU5dzk9frbJTdShsU6knJLZknP0JWchU80n1Le0ntUItM5U-MnXI6Anu0LKn6U7ineU-HHTU5ynfDYYnszYKnzU6KnTLZeHa9PanBE5uhQ0+InJRYVho0+SnrXb9hzFFqnjk8OHUU8QZA-TmnNk4sndk4XHhvRWnbk+MnHk-0Vy096nFU85bh-Zih+046nIjbv7mHarpm04OndU8M7ik7bH35jOn1jZFHpraB6W06-HRo-0nF-PG670+ZH348ynMdLenN0-mnuo6vHgiqBnT0-Sb4k9enP0+Bnq0-qn907KFMdV+n1fayHOw7IFyM7hn206cnu0-zVmM8hnRTehnxg7ZKKM+X7NQ-RnCApJnWM4+n-o5ongY6xKpM4lHSg+4H9M5in1M7+nn04Cnao88RjM5YnnY7YneA-BpvM6-7o467HVbbFHY2XZnqM-JnAY+5nNU6lnZM4GHXM7IFQs4VnTM6cHss7IFdguFnBg+-7Ys-xH9OR1nHY6oHw-YNnTtCNntY9Ynps+G72s7VnfM5Nn9Y7NnshAtnI49J71s7wHk1JdnEXatnjs5tn6yK9n9Xf+nxI79nhMgDnk3YWnAM7ZH-s7tnIs7dnvs+OHimTDnafZxnsE99Vic5jnus9FnAs4uH6c4JnxHfinoo6apSc6tHQc7xHw3bYdxc6LHnM8Wnuw5uHlc77Hpc71H6g4rnGc+Nn-A+s74s5bnec5L7RM49LBasenw0+Ht7lPrnsA7OHXE7qH7SRHnzA6BHys-yHk89bnls-5n7s5aH5s4Xnrs7rHAg-Fn7FKnnnA6VnNc7IF287Xn3s6Xn8c7kpiZx3nMg+rnkc7qH586Pngc6vnwc7wHcFIvnNg4fnZc6fn0hxfnfg-7Hj87jxz87vn4c9Bnzk9hl-8+7nhg7HH7eYpFA87GnBpcti0C6mnO-d2Fwoq-nKQ6AXuM8wtyC4AXyc4jnv85cHxRhQXZQ5wX787jxp5IIXjQ5Tnlk4tlpC6wXJc7fnTc6ZpQUTIXXQ7QXqc8g1S6iYXcw5YXlC7YXq87AXes+znIg9DnNC6rntM-HnZAo9JHC4OHXC-Wn6gokXwi4bndC7BnFsvIHyvckXHw6IX9C9vpiA8F7ai-RHFC5kXRYu0X1-d0XnI7unVU901qqBP7Ji7lHjo-MXamssXqi-kXo85nn+89I5oA50XTi+nnRI+IXr-bIIVi88Xu87HnX07vFj-Y8XfC6zny8+GJ6-ccX4S7jnm85O7e-bCXg85UBiS+MXAS8vnoi+CXiTNH7SS5gX0DZyXaS9iXG847nCS-8I-i6KXPs-iXTfYr7H-fgXGU9wX9Rub7hS+SXETaaXhA+sXDo-dHnXZUB5ffKXLS9N7IfZiX-S4EhWfdyXCC5F74T1GXzS7yXuvbt70y-GXpA68lcy-aX6S9fnmS9nnkvNd7Yy-qXPi8rpMvZWXFS5PnVS5HD+y7tbks8OXDs+OXif1OXW3fOXwy5IVWPfmXOy80XpHKR7Qy5mXNvYi4BA7OX5Qo+X9tbQujy4OX9y-CeL3aBXfy-nrp3b6X4K-v7dzahXCy9bHs7zGb7y-hXwk8RX7-ep7dy+hXl04O7Py46Xbo-uHiM92Fhs9WX388bnSi7xnvC+BXRK8pXWK-w7a3CmgeK+jHCk7sXSC6EXFy-bnEg5IXbK6pXgkudnJK9QXtk9PHHVr5X7K8lHyg9I5uc55XNZsxXKK5KnAUd+Xsq6KHMUcZXuY+ZX3S98BbM9FXzM9qHt9M1XUq4O2Y8ZVXFY7VXUvc7jFjCNXy460n6q8-Tkq9pXubdtXiq5WHu8dmn-K8IX0i6FXV7ejnWq41ndM-LTXq-1X2IxQ7Cq+eX5K+KT-q7tX47fDXjq4GnF-stlFq93HlU+tXqXajXIa+AXWXeJX3q5CHms7vjWFvjXx48TXpq747Iq4DXH6Wk7dS5an7PePbGa5LXPgdzXrq-IXGi9DXqnZdXma7Rn2a+OzaEbzXAE4LXavdRDna-rXzC8FXDU-CedGZ5nA684XQ68JXLB1HX8s9bXMs99XsWYZn466kXk65ZX06+XxXa7AnPa+OnINaXXc673n188XXeq4jXS+eLXJ67HrZ6+jXUI8SLbFU3XxtatXha8-TpUrvXltYA7va5Brt6+XX6i-dXw6+MurNZfXsdfFXUBe5X568vz38IA35dcPX5hdhn+66CXGy7kL4G6-Xei8bXaa+F9iG9g3Li6g3wG8vXqa-QXBlZg3Na-ZDBG9A3khfQ3hG419ZG5I3fNeI3V67hHF-so3tG-DH9G5o3uG9YX7geunGG+8XLy6YLHG-I3UAZw3Fa6MHVZeCcEG9rrLM7NjIm6Q3pi-lHU6+8OZftE3I9YEX04ck3nG5-nuy4k3vG6o3ENZU3fG6hDAm76nVrc3HJAc03jG8zHL4Z03Wm+obFm9M3Rm-M3Jm9Y33C-Y3NK5s3b4+M3zm4c3Bi69r9m8E3EC8kL1m483Hq7wD-m583+s9C78m6k3Ni66Xj67KzwW4M337dc3dm-c3IW6U3Gm6S3cW5g7ny9oLaW8OnjrffXeQe836W8k7mW-C3qm7JXqG6c3+m5y3b653X+W+y3t05k3a67k3sW6q3ynZq3QQYK3LW6K70W6TuJW903PAY639W9sXSa563zW8G3UW7y37W7q3IM9XXw25HXo2+m3a08C3eQcmnAW9-X064+sCm9ynla61rK2+S3kS+U3u28K383eK3G24i3nS4JXjW4NXp29K3ii-K3a4eu3fW+2Dh2863xvdCnI2+e3Y24u3s27-XD28s33Y8wZm286nvc-WrTE5lXq29k3mRwB3Z2-xXlY++36fJI8gO-OnEA5KbUO5u36y9cXCitR3j25BGCO+h3TK4fXE2+fBWO7+3DY+PBsuRc3KE+-GZO-0YFO5InhY1DnNO-B3l26u21O7ArW26E3IO9Z32O-Y6FjPJ3TO7h3mz153jO723p8+GZbvj53Iu6uXYu-Nnwu6O3Ovcy3WEwZXsu5e32-YmX9vPF3yu8+3sO+635vI13bO6B3Bc9NblTIl3cu+t7-y6yZNU813C24RnzO8WVtgRN3Ku5QHCK-t59u6t38M7MXAu5Ddru-13SO7+HJTeN3bu+xnKG7w3NzuN3eO9VXBO7a3MLLzBiO+enXU5B3U01j3UM8N3jE8T34e+NXke4SHMHrT3aO8THDS5Z5x69p340555DK-T3lq+3XWe5udOe+53EUxj3Ze4TXR08r3abLr3ue8vHd26r3Le5r3ueML3-O513PD2r3JO5O7IYMq3Wu5NXhO4WlPe8l3JS-27A+6L3sC+H3La6731eMn3pu4undK4X3pe9b3j45D3ze5X3ju5IHzu+2le+9H3me42H2e873g+5n3F+7n30DY335a9X3yO7qbs+9734+6F5I++t3Hu773R+-f37u4a3nu4bd1+5f3Ue4n3P+6D3P64h3AB+P3H+7-3X+8EtgB6n3nK+GZ9u-r3+a8b3Z+9D3yB633ME8c3MHrD3WB-cnbG9wPmB6X38E1APNM7z36m98Z4u5QP3a7QPuE5ihvO5oPW67oPFE9d5ZB45n6O6w3CvOoP+B52nhB8QnbniT3hM5T3szbJ3TB-vXFe-QPdLsEP4h9fXrW6b3mjJkPvB-0XS27whSh5IP74-NXsh8A34m4MnWh+UPwe-4PhE-0PGh4VduO4MP4B9t36Y2J3N+4W7Nh6APCh5-B5h9MPvI3UPl+8HHYh4sPM29gPkO7cPth4V3nh5cPvPUYPXh8W3a28F3PB6CPizMiP7h56Vs66iPvk2IPsR6QP8R+SPdPMX3aR4L37B+lnB6-z3OrPgPD+793T+4KP++5bHqK-73JR5P3kh-oPsEOf3CB6lHCiv1mQh-znrU9NbTR+0PkG7yPSPJMPmR-wZ7R9CPNu--3gY36PCR8wmIx96Px3JIizR57nIh5B3J7umP4C9C3g4-mPHR7E3Oq8mPIG-8P5u5u5mx4cPUh9ghKx4GPn+9f3ij0OPox42IZx4mPjR6mPqx8U3+29W57C9uP7O983szdYWCx-4X9x-wZbx6ePBu9aPjE++PRx5gPJx9neAJ-OP5nVBPVx7sVjx8BPQ258PMr2hPYJ71GEJ62PEK4MVm+8RP3HuyPis7g3GO-s5Yy3ePES9F3iDPxPPx993L08YnJJ5hP42+APaXPwXpJ7j3wO-wbiivv3pR6Encq+o6uTwJPcS+n3g485P9J+T3fx9mbfJ6pPX27hPZe0PiXJ+KXiB+JPEp-5Pwh8FPIO+FPGJ7COWJ-VnWa4XXXCs-ncp5aP228YnIB0lPlS55Pp9P1P2p5mPCp6ZPJp5FP2u+BPZd1vnVp7H3NJ+oVdp+VPD5xZPVR5YPfE5Kls1wNPRy6NPh3u9Ppp8WPKW5Z988-tPp+5qPaloDPYZ+qPrB5PZ5-x9Ply79PI7PjPgZ4+PRJ8-ZKZ+jPHp58nJCszPLp+hBZfwTPHK4aPU0rrnqZ8JPUu5HZwuHRPkJ8G5zgigPv+9hPNp9GlZZ6zPuW8dPIK8RMPR5RPMK6FwDq72PEZ5PZXZ9VP9s+LPQG6ml-Z-qP457rPw54yPPZ8unAiBTXU590Pry9FIux+XP6x8l5i5-XPhR-JPHpe3PI59jnUp5LPdZ7XPh58zn3J+lPn7Nns557bnYq5XPW55vPc54HPsZ9GBT55rP857pXAiGrXtZ6Bb757dP0B6bPHZ+SuZsA-PL589PJCtAvAF8bP1J8cPJ7KgvYO43PFM63PCF+DXSF-bX07NQvRZ-vPm58wvY67bP1W7gvowKwv5Z8vPJ56Bb7iFvPi88TPV5--ZlF+fP6F41PW5-ovYF8YvYi9eXLF+gvYB+8PzZ7cunF8Qvu5-j3GLf4vaF8EvjJ9nbbiD3X+Z-BOIl+wv2q+Qv07NkvpF+PP054ovUl9-PuUqUvBF-kP+x7UtWl+kvaF30vGl-alRl8-PSDckvDZ+4vYR4gPTp1Mv4F5zPIK7svbF6yXdZ6cvYl9mPwl-UvZl8Rbbl9ZP0k6VXS+N8v7p-bPRF-Q5QV8AvsF90vJ7PCvMF9FPvF+eOMV6svgx7FP+F0Sv5B7b3O+9pBaV44PFB+43il68v9l7e3jl4Kvzl-g3rl5Kv7l-NPEl5Evn45yvGV6MPWV4NHBl-XANV9AnEh+zPRV+SurV-QnfB5wPRYosvvY+cXXG6bX-V+6vzV+Psg168Xam7yv5V9NHpV9xPs18mvgS8w3XR+YvTV+MvlXrGvG19wVW1+8vGqYGvw4+PnNF-Ivml-Wve16bzB1-bH1F7HPD5-yvc18qvup-3Pu18KvKU+Kv9178vxU4Cv93tcAoY-Ov7ebcQn6+0vXW-ivPxx+v3Z5ev005IVYN6ov688NPtF44vgN-GvAN-Bv8164Prl8Rv21-kt0N4YvD1453wl4xvf15oLyN5hvR15uvuF-RvKN9xvLx9Wb2N9YvVN6WPm+NpvXF-Sv2+4avel9+vEN8QX7ZyZvpg+CvhF6ivowJ5vtw75vOl8HPgt45vqN9Wvil7KLhN6evMt85vau+5v8t8lvlB4RvCjZVvM14ovp+ZFvwN+AvSt8fzEV7ivet74vZZcNv1p+NvCV9NvsV-NvoV5KlIl9DLcN5OvJl6tvSV+OPFt9BvLt5Zv2B883jV6bL2J5Wvqt7Wvft7VPba6Yvd1-gLQ1+mvI180R9t-fz7V5CvAt7CvHZY+v-U+vXapxEvoeZDv86-YvQd4Rry1+Gv7e5jvyd51vr29evXV+LvZt4dPtt6hvFd+tvVd8Tvdt9rvrt6BP7t9svTd69vBB76vRd+HLWd9yPgd-Dvy1d7vOJ7Rval57vo55wvCl8Wvg9-Hv8l4wvU94Jr9N+DPHF-9zGt+jvvt5Fr0m6Av1d7evG98i3Rt+3v5d90j114nvc99Hvu9-O3Nt4bvNd6PvsN99P8N9zvCtcAXPF9bvqV5Xvi98+Py981zpK9u3mV70vluY7vvV59vf96-vAq+svVh5huIl7wjZJ6Ev1V--vdV9ZvXd-XvWmIbXlh6GPr95Afbq+fvB9+5vcD5yPw96lv898UjmD7AfaD4gfuD-9vBd9-v0V-IfQ94Dvmt9OvGD5QfWD6vvO9+Qfg65IfKV7IfjD-YfyV5Bvbd+4fE644ffD-QfdubNPj15pvND5nvPq5zvA99-D36+YfYt6TvAj5XXQj5fvXD9EfQZ4-vD97kfyG9QfnD5HukD5IjtB4Tvij8bvyj-kfqj+wfJt-Mfuj4Ufr57Cv0iNoflD7Zv0V8dpCt8WXjl7cfq98LvWV68f79-TPdF78fKd8M3CW4puQt-ezjt9Uvml6CfJd9V3Hj66vMT8rv4Z-sfdt8Sfdd+SfEF88fSCf8flZ8-Z4T9+z0D-Evz3fyfQN9LvkN6yf595h39d9MfUN7Sfzd63vLD4Sf2T+Cf8W8p3JZxKfSN46fmN+stXT9lvNN7qfAD5UP4R4SvAz-gf3t9UP4t+afsT6d35R-1vlT-x3MZ8yfTT-mfEe8WfDl+Wf096PPkT9uvFN7zvGS9yva9-ZvpNewXej+EfED6pr6T7WfnV7mfmz4vPKl52fWt+OftC84PBD8efez7WXBz58fRz-ef395ef-d92ftz7vPs97DvAL4XvLT4y32x+JvgL+PvwL5kfoL4Zr4L6K3kL-CfOebvvTt82vFz-qfkV5qfFT+hft9+OvUT5MvmL8Gfhh8Qf3z7xfpN5PvIL7efFL-vnfz-ofzt7HvWz7RfhL82v7d7Gfnd6Af1D6Zfdz+2f5N7Pvj95Ofdj6WfOD5vvlL9hfLl4FfYCbwfdD8Of3L5WfGe6ufZd9FfCr-L3HV+Vf1j9VfDe5MfKT+vvWr9QPOr5Ffmr8Ffzz8+fVD8Fvb98Rfx2+Rflr+mfB+9mfxr+lfFD6jvXz-lfbD8EfvD7UfBj8kfzL4JfDz4YfGj7TPuT7ovPr95fLL-9fjL8DfFZ6TPn7NQvUD4ZPHl4kvcb6MfzB8Nf6z-bOyb56vQz5sv+F0zfSN7zf3T+XZtUGV9Mr+cfZL-gvwEb6fGLYLfVb6Tflb-cfh+7cuNb4bfDr+eOzb+8f5r-Q57b5yfMb--Z3b6tf8u8hf-b7tfZR-ZPS+OHfST6Vf5T5Av9b47fLj+Ivs757f994nPs4dNf9V-LfowNnPOj83v2L91fnZ93Rzr7K3nb5KlW76IfTD8sfjT9GlB76cfLr+PfJCtPfCEd+fZr-nf6HIff6EdAfnr6sfzxzff8b4FP4j4xbP75Tf8d-5vOL7r1176kf6p7hfQLcA-Wb9JfXL83f4H99fZN8nv0H5uHv7-lP-74kv1Z7PfPD7dvX74ktaH6A-ch91v+H9b1hH9g-pz69f5evI-SN+w-j74-feH8vfblzo-77+Ifn76Y-375o-hb-6vLH-Q-Op7xvWH64-tb+e7vH6I-Oh-5fuUtE-FH+Ff6b+Y-Qn5bfY7-u9Un9o-8n7nfG79ffqn6Xf6L9wVyn+4-miN0-wn8h7Bn4U-X1969xn7U-8H40-Nj53f+944-BH+s-e98vvoH5bPDn4vv1T73fdes0-A77N3EK-rPUb7IvrL50-Nw4if4b4k-7UpY-IX79fYX8q9EX4KfCb6qvIn+C-cX7-fAn8S-Yr7pfz7-U-JUqABpT7ifjb+eOOX6Rv5-wdvoX5Q-uzbL+JX6i-ZX8lbFX7jvxH7KfXN7cuxX7q-4n+q-lXua-YBYNfIH48-7Zw6-RX9q-nX+Mf3X6NfBX4G--X-szen9pB5-y5LpX9Pv5X7hLFn4mfZLeGHvDcKfib+e7039W-8X8w-G35W-wje2-qX8h7m3-2-KX+pvCrb2-436Yba74Qfln+y-F38m-aluO-l39obpb9vfL77u-C360-gX5+b938M-oXbpBn3+8-a+-MvT34e-cZ7G-YP83fNw8q-yH7m-4X+h-LX86P-z9Q-wd4g-od6g-kn4R-g39Tfw39k-nH9R-SH6pfGP-h-BP7DfVX7h-MX6x-Kn9J-QL+kfkr8x-NP5hfdP7KvKP4jvU16Pf73-vfVP8h-Vn5+fDH5bvpH-wuEX9Rf5P+pfDP75-bH8Y-zn7k-PL9p-kH-p-JP4l-57-Y-0v-x-Sv9w-Av7s-ZH9l-TP-l-LP-F-tL6fvF79V-9n-V-Hr6l-PX5l-Zv5UfKv8t-av8N-Qr+N-dv9N-Dv+u-4z+GfLv7BfI77ZPpn6Hxwv593B37O-gn51-+L9h-Yv8V-rv5EXmX9u-XP-S-Rv9t-I389-yfte-HP6y-sf-1fQ39Fvzv+1-Gf5x-Wf8T-Of5NfUf-XfMf87PSX9y-Mz8U-Zn-L-1P9z-wH-z-eP6T-A8axftn5N-hf6dfN79T-pf88-cf8d-Cf8b-7f+T-h75-vnP-3fUz8nf6r+nfV7-H-lz8n-jX+-fuCa+-Eb5i-i-6B-j+-+vZ56L-Ci-pfcr7fP9CZ5-JUs3-Hf7R-2d4V-lXqP-Q-87-I-7T-IK4v-zf5JflH8F-MNzv-48cJ-Er-1-7Upf-kX7D-xP-P-hiZM-Tq5f2P+e9-4cvoA+S36H-v-+i34e-k6cwAGv-mT+P-5n-rgqsAHf-kT+iAHyWsgByX4Yfod+-36oXigB7-4LXkC2uAGYAfx+Qf7PdkQBFf72vlX+Q+LkAfm+iOYAATGuqNw0AQf+kF50AVABOb4w3EwBf36I9pwB9AFp3mecPAFsAeA+I9wCAUv+0X64KiIBa-5FHv9eEgHe-v5egAGMAawBogFtfuIBigGSAXueqzYyARP+ab7XPk2+zeIi-ggBH-6VergB+gGoAYYBKgGRZkoBFP7mAdb+Fj79-joBbb56AQH+p34M3od6xgFOAVgBpAGQ9qheMP6mAQQBuUreAYj+ax7KAfJaAQHY-vX+JH5a-rm+fma8AXRuCgETflwBm+KhAbQB8QExAUxucQFs-vneb343-jO+KQGCAaQ+wgHRAXkB+j5YnDVeW37OAUve2j5jFpYB4f5svoZ6RQFnPt6+dQHVAb-+O16LFid+HgEuASOypQHtASQBnQF5Pm0BnT4DAcwBrD5RprIBn17yAWE+QwEJAYd63QGDAU0BagEwPsU+UwGpAWZukwHzAWMBqd6xAWsBV37F-jd+4AF6vi9+w-47-q6+Fr7rAVoBuP72AR7eZwGz-toBGr6W3tcBLf5Oftn+Ij6HAVf+xwF3viMBVQELAUU+kPazAcMByVywATN+ov4tAegBMjb-Ae2cL-5AgQYBfgGf-mCB0wEjspCBZQEdARUB07KIgT0BYj7YAYj2b75Qgb4BI96SfgY2D-4yfpcBreoEgaAB2b5CAeXqpIEp-tf+3f7T-jsB2-7R-vsBY-70gZHeXf5MgWB+6t7NAWgB1lrYgUiBvQEogTOeVIFHAYyB0AFC-kKBbwEigewBI9y8geiBmj4BPq8uLH44gfgBeIER-qMB5wEN-sSBQv43DkqBzP4wgZT+DwGEgU7+Bf5agQaBZIFwfuyBLn4sgez+NIEWgVb+rwEn-n3eDL76gVaBmQFsgaKBMNyKgXyBGIGeAf9+noGygUG+vb4KgdqBXoFygcG+QYGmgdSB7wGj-j3+LoH7PiX+toH2-mqBNwEXAXcBTf6nuvUBVH5KIsGB-oHRvsu+M57c-vCBn7Isfj4ByoGvPgb+NZYOgfg+yP7lgRbG3wHrfkZ+BYErAbZuFNzFgYEBdx7ygVuerYFhAfV+eX6tvmmBJYG6gSqBzoFRlm7+nL4Jgf2BbYHPHn0B-7L+-rX+kf4MgfGB7oHSgWHGGwEhPm0+CDhvvpnelYGyvicBr74rgeqBEQFt-mKBTz67Ae7+UoGUgSeBC4F7AUuBF4E2AbY+RoED-seBd4E2fk8BxoEegfuByYEagamBJIGXgayBNoE3gUoiH4GPAe5+b4HLgb+B1oFRgdkBdIHzgX+BkEG0gcx+QEGGgXYB34FPgTBBEEGSgRSBgEHgQa6B-4HngVhBz4GOfiBBj4HvgdhBcYHXgXhBwNybgSYBpYHVgeF+iEFmgY-+kQEkQQRBbn4ZPsRBYEEsQVU+bEGagcxBaEE4QXBB44E-gZxBCz5z-oreCEGkQR8+i4EUQczcVEHuAfyBWj6ogW8mwEHcQShBz-5KQUhBFv6gQVicL-4DgXr+eoFIAepBDEFEgapBI9w6QZOBvx47fpD2ZkHdga1+VgGggfEmTYGhPmqcyAHUQYOBZYGf-q+mGYFP-qZBnkFcgWYB6AG+QXWBCX5WQYFBq4GtPnTuZ5wuQXJB3oHTgaueoUEHgQ1+YkHPHFFBSN4pQeCBblxpQYWB-7KZQY5B64HIWDlBXkFMQT5BZ6afgYeBzwHP-vFBpUGJQfE+EIGVQcpBU77z-j8cX-6uQXpBQ4EGQQ5BhUFHgWpBHUF+QfpB9kHCQas+okE1QRlBkSZVQb2BVAGP4s1B0UGhgYGBj56jQfVBQ0H5fk1BhkGRgRhB+QHaQStBwoFSQZhBwNzWQalBm0ESgdtB60HEnHtB6UHJQQdB24FlvvBB50EAFp1B5UGmQRdBb-5uQbRB5-6PQfABuIHuQa9Bt0G9QW1B-UEjgaeBY4EAQbtBb0Fy-uj+3IFFvqdBWUGrniDBuv5gwf5B1lqQwblBEUElnG++ukFwwX1BPIGqxndBWkH4Qf9BV4FngTtBMkGNgdjB7EHUfoz+of4fQS9BQX7kweK+z0FOgdTBGQFkQQTBx0GUQcTBP0GfQQzBeMGwQWtBxQFZgTTBGX5HQbzBrMH8wfH+mkGkwXzBjMGSQeRBhMGd3F2Bc4EVgU9BrUEcwfJaqMHmQWt+wUG+gVjB7MFUwSrBWsFBQZZB-36IwSTBPEEPQd9B+sGYgZviRsHawfTBAUEIZubBPoGI9rABaMGn-vDBEMFgZlDBj57uwUjBxe7rgE7BasGB-rFBnsF2wWFBEL6+fn7BNkFI-jbBCMFewcbBJkHaQTHB1sG7-uhy4cGpQQnB9sGBwaiBacEhwUi+YcFZwQlB40G+-pNBecFjQZX+hcEUOCnBZ0FNQcXBC0G3AVP+GUHVwRpBmv5dQcVBsYFSwczBQsHM3ICBIYEBgXmBf57sNkZBD4EmwfHBhDaNwQ0+zcHDwa3BT76CwQ0BE8H2gYrB6MG-QdHBI8EDwchBdcHJQf3Bq0HTwZmBu0EbwVtB0sEswZ3Bu8GHQfvBHcGd3F3BOYEBfsv+SAFHwZdBWQHXQVXBy8GbwSfBM8EnQTfB88EuwRjBbsGPwXvB7cEvwTvB38HHwb-B28GHwQAht8FugdJBZ8Fvwe9BNEFRwV-Bk8H8-mPB90GzwUmBNcEpgWvBD8HwIZL+TcFIIa-BoCHvwY6BScEQAXgh0CF0wYQhJCrnwanBTY7pwQKBfcFUIdnB1r65wXQh+cGlwRMBzkFMjk-BQCHeQcghzE74IVWBsCH9XoCBbV49gSwhDAEU3IIh0n6DwXHBuCFLXkzBgMEQIUvi4iGUITIhbcFyITLBCiHsIT-BqiEHwZAhTCElwZQBZcFAARohgCFaIafB6iG6IaghX4HoITABRiFgIbhBaiH3eoohlcEwAaSOeiGjvgYhqNyQgUIhtkE1Ae1ByiFTwc-BwCFnwS4hFiFlQTjBwMFJdh7BikERId7BsC6UOLpOscFWIahBV14UwTAhZCHMgYdeAsEBIVwhuMHJIbTBSsE6wTyB2oFeIZHBaSExgRkhosHYIWEhRMHvXvQhg76+foqBxSFBAXZBhSE1Icwh+iGsIWecDSESIavBjUGD-rzebSFuIR0hKMFFId0hYsFDwRLB5SF9-mMhUiHCwX4hCCG7vlUhndzTfo0h7YFhgVueyyGjIZUh4sHA3Bshz365IZkhnCFFQVicuyFOIfhcJyGRIXWeCPorIVOBNCG5SlchmyGIIYshI3qtDqchltw32tchFkEWwf6e7yEPIQsh2yHbej8hSN6jeh8h6sEGwYj2wKG-Ia3+OCF4dK56IKEBwbchGyqwoZChr4H-IbF68SGJwbuBaXKN2nCh5QEKQXry2no4ociBeKGSKtihyKFEQeMhBnpzIVghjyGoobZ6pKHjXsye-SGuIT7+QyE3rPShryE+PDnahKHyQR2BeJ5coWShKkGJIbi8jtYCoQ1BSUHwnuYho8F-IRShznRketyhMUEIoYIqcqGioYtBfYHIepKhK8HTIUKhkhzKoQyhr7ryoTNBvcFMKvqhKqG1wb0h6YwmoXqhfboGoT3B2n4HKiO6NqG5gXahvroOoaahaCHmoQQcrqEMoaG6jqGXwWIBByo+oW6hliEeoSa6SNq+ofc+-qG+uoGh3qG-WuGhfL7BAVGhsaFBoaEhtKEkTEmhMaEaoRwhJiF-wVG66aEcoWY8+rpxobN+PiEBoXmhFyE+8mWhMSG37oWhyaHVQUtBgYwiukWhwIHgwQIe0SEJISGhZjyNobWhBcGsoSIyh1pNodCBi8Ewel2hDKEjofmhPLr9od2hIiF8ARQyk6GjoXOh46F4dGOh5aGmTguhK6HtSqhetV63ou4A3iH3vFZYkMBxiAueD-yBcjuhETg7oSUhYwz7oUeI1Yj5NssBIzinoQG4M2igoVwKjAhj8Jlu6pwAqkBQsMRPofChMZyvoQYgCu4WMiKEX6HkRK+InyFaho-wCu6NunA2SEiOZCQAu6GuvHLwXBAoCH34U1hkCmw6zTzwYRE4EgAIYQm8V6FnwG+h8NiMTie6IoQ4YdhhuGHFvPhhYVjZ2Gu25YbcAGRhAbg4YReh-JRUYWtwNGHCbt86vPgMYbDEugAUYVm8rGFMCJluF-xe-pIEvGEROLxhzGGBlAJhKGFDvkaWCXhiYQG4EmFNIdp80mEh2Eg2HgZkeAphsMSuAHxhofyxiMeIl05q2l-GOmERODphkmHPlPphN6ENtiHmqbwmYQG4YgC6YdvSgmHbHmPGW6GZoA5hETgOYeZhO8zOYRCuO5JMof7IHmEBuGBhz6EQYYRhfmHBIV3IsGG65ExhymF7oTDYo-AAYURh3U5xBpby3GHkRLFhqyEM3AJh4WF7WBv+eKJcYfmYzNhZYQlcWdhcWO-Yry4Z6MNIKDgl2Gg4ZdhX2KFhgDJlYclh6tifskVoyDhWmIvYPHgd2I5hlYzNYbw4sDgjshIAnww1YT1hFSE0oTKhndxu4HX+wiHtIaIhapzTYVv+3MFbwdkhwNyLYcf+vCE7gR8ByVzrYZf+tiECQUDBzNy7YSABWaFgAYdhU2ED0kjex2FwAaDBH8FDof1e12F4AaQhmKEkKo9hxAEKocShuUpvYRQBgyHzYWec32FXYZdhi6FHYUDh66GVegDhwOEXYaommiFnYfIh93oQ4WDhuCoI4VWhsHYiIKDhKOHvocjh7aHioU6cWOEYodth7Zx44dQhn2HtSkThtSE+fr2eC4Bk4QMhLKF-YSWc1OHMoXIBdOEIOAzhISF1oWqh+Fys4VKhUKFPIfDh6OHY4cNBzxxc4ZqhWyGTYUviwuGnYeSB2iHi4fzh+OHRgYThsuHE4byhdZ5VYUth6EErYUchxJyq4RthJCH5IfwhmiLa4Xthm2FXQYJB+FyG4SdhMOFS4aYh93rm4TdhsMF3YcrB1lq24U9heuGlIe2czuHvYYahzqFFvh7hP2G04TOhCDi+4UjeQeGQ4UviIeGI4fJa4eEY4ZC+UeEC4fWhZuGOVnLhUEFuXLHhSeH3wU6cqeFK4Wsh07KZ4eThwP6ItrnhNOFM4QHhyFiF4Yzh4wHM4aXhieFZ4bNBOeHV4Xnh6-5E3mXhbOE9oZXh+xzN4dzhKKFi4Tbh9eFF4RXhJeHt4b3h5eGbAWkBFNwd4SLhE2EzIczc4+GS4eaB52Fh4UPhLeHToVsBapwz4Zbhc+Fw4b16a+HGIbDh9iFb4ZlKoeE94T1BNeFGoe1KzuEtQQvBjuE+4QfhEeFO4Tfh0eG+fufh00G2od9+d+HH4Q3hUgFN4ffhceEc4TDcT+HB4d-haeGm4X-hgBEn4d7h-V7-4Yfh++Hv4X3hI+GrAavhoBEf4eoBGLaQEbfh1+EwEcPha4HIwYHhiBGwEVgRPsHp6LgRmBHhQQQR6qBEEUvhc2ED4V1wqBEP4ZThZBEYERQRv2FUEZacNBE-4RNBFDisEUAR8+FH4QNBir6qoewRX9icEWARr+HoEbwRar5moTjhCeEMEZ3h5KFT4Z3cQhFIEYsBkPYKEXgRJBGxISoRxBGhwXQRGhGMEf7hK+FnnDoRMhGCoR2hWuHkEUYRYqGC4T8chhET4dKhchEy4SVBuhHF4foR9OGZ+s-hTqEiEQ9hrhGA4Q4R5hH8Ee4hFNyPYRfhDuEFIUW+gRFuEX6hCaGhEV4RUBFD4mER3hFiEdq+7qGSETDc12HOwQQhL2EgrqkR-sG4ocrhQLZZERHBcWEtoZoi+RHxEVzB6uFZIZrha2F0FlwRm+GxEdURwhFXwfJaJRExEY-izRFoEZ4RwcGqEVoRC55tEbQRPRH1EYoRPwH-fr0RbBH+EQthAxFdETnBdBEjETURe+FD4rbhOoGu4RkRyVwLEd3B7hGNEW-hmCHK-lqhJhHA3KsRF8ERoZEREBHuFn0RX577EQAREjYtERQ412GLEZfhIREdEVsRGv6T4dqhWJw3EWsRERHNIVERxCG3YekRBOFuXG8RBxHxoZ8RDxFzwbrhdxH64bSCAJGlESghvhESEZYRuOGbOoCRxaEggdZaUJFXEV-YaJHtEcURiJHQkV8BgxH1gcMROJHokajcmJGnEeZepJGjEb2h+xwUkbMR0uF84d8R9uG-EfLhblzDYTP+jhH94c4RCDiskTNhvWFu4SyRtRKe4S-hGxFFvtyRauH8QTzBOaGd3KKROuE-EXwhfJHPHNKRRuFgkcEREJFqWoqRUNaTEQwhdBHqkWzWDRGRoSKRi-LEkRTcOpFbgcbhd8HAESPcJpFBEUyRyeEKkYaRWJG0glaR4RGHEcCRmiJOkUje7pFGkWqcnpEOkWqR9pFkkYi2PpEBkfteQZGUkW3hXXChkbSR1uG9epGRepFHEW6R-pFhkcwRriCxkfiRGsGI9qmRmpF1IdqRiZFRkZKRS+KZkZoRUxELnoWR7JFwEc2B3pG5kXGRrpGOkVWRaZFgoZvipZGwkUkR8JH4XE2RNhE84amhMZF1kVmRFOElkT2RRZFakf2REkH+IYch48HEnO2Rs+GMQeORwNyTkevh05HQoczcc5E74Vbh+ZH3esuR+2ESkYEhBZEDkWWR+BGxIRuRZpHgIXMRj+KHkcqRNpHp4W2Ru5HNkcGhyRGWkdeRHZFd4XYR65EPkVORxkEvERORr5Hzke+RuxFLkV+RK5Eb4SeRFDhnkbKRW2HMkXaRI5HzIZ2R3eHdkZBR1KG2ER+Rs5H-kZuRGuEzkX+RcFHbEaLhz5GwUQkRXX63ka2RMNwgUYyRcpHLEe2cRFEpIc9hfxEQUbhRmf4poTBRQ+LkUXkh4JHykT8cjFEHIdmh25EvkRhRTxEIUb+RUpHIUUeRdiF0kThRfEGyIbvhwlEMUQJR55EkUVRRrFFSUaBRJuHcESJRImGDkdmRw5E0UXn+dFHYUZJR3FHm-lhRiFHoURpR4QHs4QIRqNxsUeNhvFF3kVic5lFTIfpRfFE7kQbeqlF9kV+eOpFpETJR4FFyUY5Re5FqEdA2hpAfal6RZ5yuUdkRRKG5EblKQVEFESVh4BEJkV5RN5FaUQZR-FExUY+RshHxUQ5RksGjkRxRq2GGUWUR4pGoUYuRCVFpUVBRT5EpUVxRBVHwUdBR2lGnkf5RvpEnsuFRHpFVUcGRF161UQFRJZxNUdVRowKtUQ1R-14dUUmRnJHIWN1ReZGcUcpRtYH1kV8hQ2H1UT1Ro+GVkYlRb5GSIcVRQ1G7Rm1R6HL9UdWRJaHWWstRI1EOwY2R41EDUZlRUpGrahFRNyEk4ZV69qBmwRtRGcF1nidRpVGYUc8R9lHrkftRHpH3Uc1RXJGPUYtRJUqXUdlRYlGrkYNRFFiEgIFqwVE8odnhg3K-UZ0RTlH54Rz2-hAg0d5R3RF0rsDRV1E8UeVRc1E-URDRcNF6UTdRVlGO6sjRH1EqIeJR0ZFI0X9RB1HgYedR13Kw0VjR6VE40WuRb1gk0QrB0lFgUbaRnlqHGLkBO1GVEZUUhIBeauNerNGM0StRKJEBWgzRKNE2-jsR6NHF5BzRfNG2AQLRBFGxSrzRpNGFUclRt1GU0ZLR1NEKUeaRSlFI0WzRT1GJUMLRUtFlUUVRstEq0ZzRZ1GKocTSGtEK0cRRtNGXkVqkRtHDUb2RYNFN5hbRC1GdUTQWVNGW0aDRjeEelo7RdtETUfAR09hu0ZlG9tGu0ZjRxtEUUUsRslEfpN7RblGm0RaR56Sh0f9RH2GhUdCKUdEE0Y1hBtFsMvHR7NH+0U7RUNHFkTDRadHu0UzRaFF-FCnRatGMUAXRr1GPwtnRPtEe0RWRXtFl0WHRilG1ETTYxdG+0etWDdEV0U5BVdH40anR7dGF0QOw1dHR0V7hHhH9gt7RppE00bXRQFGOWIPR1pHuUXTRIdFl0UPRitHHkRJR9dEz0RPR4dHK0YvR0fLOkUCRq1E80evRHdE+EUlRxhGC0SzRS9Eb0ciRRRHhWsfRu9FGUbNhTBG9UUXRF9Fd0V-C99El0UQiT9GN0fg249En0c2hrsFFih-Rl9GiUdjRX1G7UZ60v9EP0ZPAIDHP0f7qr9Et0XlBd9E70aAxwCJQMbnReVHAMYgxXNFn0dL2qDH60UdRhtGYMVbRLtFN0bgxztGf4X7RcDEQMcgihDEZ0UORWdGkMW-Rs7aD0YKR6xH6kT-RM9EMMR8RW9HMMTEytDHk9iwxfuFOEZNRbdHQ4QBRC5G84XLRnDHQMdgR6tE8MX-RMpEm0SPRC9GYElIx8DG5EIoxZDHYIioxXDEndvQxvDEckfwxU5jqMeIxBBFaMdIxSpFz0UJRuNFr0YIxKFEVEXnRKDFiMUgxIjF40ZYxglEHYXXRCjF2MWgx39ED0fox9jFdkY4xPJHeYRHRGNHuMVgxsdHgSkYxSjEIkN4xHjGfwRwxTjHD0UrRrjFj0VExITGA0cTRyTF4McQxBDHBMRkxyBF0MekxRDG5Mdwx2TEFMUoR-Pb5MZQxalHUMXExpjEuMaPR0Vje0Xx+MdGpMWFKZdGNMX3RwpGxMf5+LpHsMV4xa-hifgExq9FuMXb6gdHMUaRRajF9MVOhlBG30d3REzHGMfR+WtEy0YfR+dGtMf0xhRGeMefRszERMeIAKzGTMTfRujGl4A0xqzGRUf3RGzHDMUxRKpEsUdPRmzGqMR7qOzFzMax+11GWUeLRkdF3MVsxZeCvMTcx9NHXMRox-37vUdu+hEEH0c8xE5FbggYxB5EgsT4x9FGnkeCx0TH3YW6R0LEpMbXhF1HwsTkxpTEZkcixJTFDEWixdGHOMVuRQDF3Udix8THz0eYxwFHosRUxzlHmXn8xOH6o0U8x8eGEUaSxsVEmUWMRgVH0sfvRFhG0sZaRLLEzUT0hSzEFkZyx35GzUTrRULEEsTUxuLHM0flR7r780XZRPLElURKxotFSsUCxSFGrvgDB5NHfUZVRSrH4wRlRYrGpUbKx94HcsQqxWVH-MaxBbLG-4feR6rHLYdYxyDEysYaxXEHGsaZRxpEUQrsxehH7MX1RDrF1UWax5RFjkZax81EPMfDR2tHSsd6xbTFCkUwx0VFdMZvR3NH9XjqRgbGMMfGRtZHusTlRFrEOMWqxobGn0esxfpFxsZ9RgFHyMV-YkbFHMYdRoTG4KjmxjrF8MZ7RLVGusW8x9BHJsV-RMTEG4c2GELEVURwRtbEwsVfhxxHCsbIxCTF1MQERFIYYsQSRiPbXYVGxbDHhsdiRZzHsUSqxeLG9en2xubGE0UnRqJFdsWSx1tH-XhOxRbE6MSWxLOGzsQyxreHJkSvg7WGVsYOhzbHFEbL6nzG44QexPzG9scexoLG+UduxOrEvgYsx+rFTYWexdbGI0a0R97FNsfcR+7ElvvyxerHssUwiQkJLseWRrdElnGCArn42sX4RVJFAEj+xSN6AcTuxlMGqkSeykHFXsQCxtrFMsQBx4HHlsXBx1rEiQXCRX7HEnGhxVLGSsWjRt7FQEihxh7H4XDhx8zGPMQjRgrEUOKRxPrHUsRRx-rFf4kRxJ7Ffdoxx57Go4dRx-bHdMYOxuloscQ+xlHEYkalhV2ECceWxl7EqUXOx+DEYtiJxCL4Isafh4OFCccRxKRFycUxxh3qScRqR3bHpkZviKnG6kdJxUVHccSH+5zEXkYExWepCSp-Ru7GvsbpxV9G8kWMxKerGcRBxNnGocXZx8nEj3NRxs9FtsUSxFNEMcXpxI7GAMVqx93rOccvRcjHEsV-YfnEmcdBxlzEkcQ5xSnEjssFxtnGecRZRdHEEcb5xEXGsce+h0XH2cbFxtlH4cVhxRnHpcaOBo7E+cb16qXGOcd+xOXHKsd5xNjGJcSVxGrF5ceVxBXFJcbxx9HGP4oVxkXFtYdHWuJEBYeuxy+HOsdSRrXHCcT1xRXHEnDcRA6GhcVZxPxyDcb+x+5EXsX1xzXH-smNxFxFUoeRxfrEJcdAR83G+sTexWXHT4dmO43E+UajhCxFDcakhI3EZ4Ztxc3GTIblxZXFesfMRR3HlsbtxW3HQ0eZe13HHcfshcXGLcetx8hGXcf1xexFvcdNxlWGfcclxMeE-cfVxS3EXcW2hAPEvcQvhwPEvsTBxowKzcb1xmaEfsWLRoPH0kStxtHHPcSaxrxFTcb9xvn6acW5hQjE-kQ1x1xHrju9xR2EE8V9xW55Y8XtxlFEeUU1KrSFqcQ2Rh3rUcdjxVjGesYmxVHH3jjFxSPF4cTSxqPGfkeihEPFhcYRRrk4dcVMxXXERkQLxrLEgceGRlpyUse1xYvGYcVzxs5FroSTx07JS8cLeKLGYsY2RCvEY8dqRGvEg8XLxS5Ha8bzxB3Ftkfrx2nEnMWqRxvGq8T2x6vHg8SbxHTFwsdbxFvHqcQfi3tEM8TixuVHM8UkxlaGa8ZdOzvHk8UHRlPHQImXRLvGEsWYx7nEWMSTeXnGZsYFx9TFl0XJeFPFT0QHxMR6E8csxifGK8UDRMfHKXmGx6DECEunx2jF-sTAxMzFTbjTxo1EUEt7RsfF+8fHx5tE58fcxZfGjMcHRCfGF8WJxmTHv0fLRzN4y8S2RCPFy0UkeSfEoMWGhN3GZ0Ug2ttEq8UXxm1FO8S3x0vFcsfDxuvHLMb3xqdEz8W8xg-FB8SKxbvG+MfXRABgncaVxkfGh8ZgSa-GPcRlxnPF2sfnYeRA82r7xtfH+8ebRO-E8IcHxtTFZsfUxF-Hj8XDx8rEd8T9Rd-FD8Y3xhTGaMS-xi-GucSHxqrHb8cfxffFUMQPxn-En8RcxhvHm0UKQ6-FVcWdx7vH1MRAJu-GncZvxv-Fj0XAJl-FL8QmxK-GYEigJ9-E48QKxePHICdahAAmVMQPxWAmv8YLxezErserRJAlf8SMxoAl18eAJBAns0VQJIAkGcYMx+AmcgQbxdAmxSlQJ7xGccVnxvgLl4H26PAmZ8amxAhLcCUiRVbGwseFaJAk10e2xN-FH2AIJ01EP8ZlxU-HAMdIJvdFBsTGx0vZqCQnRv6H5scnR2gmMCb2Khgm6URzx8XFP8fXRJAkucTQJLAmJMbAJRgnz8ZYJ-nGyCVHx8gmOCSFx+3GcCZHRbgnGCRZxAzG2Ca4JMPKsMbwJIgn8CZYJQQnCCdWxUgmBCbnxE3GwdgoJ-jFrMZEJWgnRCT4JYpEZscIxGAlsCQkJxzG28VEJ6bEAMYgJY7E-USQJHHERCZIJyQn5CWTR0AmZCXYJlQnS0YCx5gmYCcaCDgnNCd3xEhIlCZOxidHYMfoJrQmp8cTRHQmECeSxfjbxCfBxRrHi8ZuxuRADCakJ6HGDQbLxB-Fe0VMJLQl1CQsxDQkqCe0JvQle8TDRiwltCZTR2wl9CWFKL-GlCSmxSQkCEocJnQm6Cc0xcdFnCYMJ87EO0dcJ7NH3CfPxjwk7Cc-xeYJHCRIJe7HhWs8J+wlXCW8J5wk5EZcJYTHfCZsJQAl-CTcJ4nF0McCJOvHzCVOYUIkcCWfxsUpwiTbxwbFfCWCJDwloiU8JGIkvCavxWIk-CUCJuIkgicMJSIkO8bTxey7EicPxRNEtMZ2CeIk4MdSJhIng0XSJ0IlIcQcxY-E0caYJKPEwiSyJjInwiRXxEtHciciJmgnZ8fyJJInF8UlKrInvCaZxkPGoQoPxEonDcZ4JGNHCiRSJ07E80YqJb-Gosdcu4on-CSFRgIm0iaCGbfH4UY0JSTF9MtiJCjHGiTSJydGsiS7hp-G8iS8xZon0iTbRlonhCccJ5QmnCaWyPIlm0YiJbokCiTWR0vYv8VaJtAkIibaJeokT8Y-xawmd8cGJSgn78cyJkjF2iUyJoHGP0bGJ7omGcUfRiYneiT0x59Ea8u4JcfEeiUGJvgmJCS6J-AmWiU4JbnFICdHxmYmz8RYBSYmsCWWJlYlpiVxxvoms8lmJ5fE5iY7qfonFiT-xRQk4iZVx5rFM8TUJ8gltiU2J1oktiULRA4noid2JHrGasTVxrwnjifGxvYmQsX-xM4npCbjxgPFdiXmJOQkoiQ2Ji4kFCRkJ84lj0aOJmIlbiVUJhQn5cdOJa4l5sTqJydH7iSaJe4mNiWOJZ4lTsd0J1rJH8YeJ9QmIcfGJYDFXieaJT4mfifaJ7ebPifeJXQl6Cd+Jt4kHiQBJFwmIscTRP4lxiRLxH4kgSdeJt-FwSV+JAVpQSVWJ-gmH8ShJdYl8CdKJGEkiiSPxZImISb+JdwkESdBJEwkIkDhJSomPichJxEmoSR2x6EnUSZhJIQnYSfRJuEmUib8JL4krCW+JMEnAIuRJaolq8U7xPElkCU6xFAlF0S-xMgkliZ2JC4ki0bqxk-GciZIx0NriCZKJfPES0fJJ9zG3EQGJNolBMQyR1gmT0cOJR9EqSfPxgfFCCc6JnwkYMfpJ8EnGkS9RSEkRsZZJhEn7nsrxYkkdiSeJQrFSSdexqwmySfsc9knqCdGxPok1UTZJJEnTMZLxfkk0SXIJU1EuSQhx4wkBSSmR21HBSS4JoUma0Qtxa3FhiTpRYUljCXMJ0YkeSdFJDEknCe1RmUksScqJEbG5SRRJQEkGkYoJOAmfsUlJSbHxSatxbknpSSLxpUmM8ZOJ53GVSQHR+nE6ScmJ4rEtSRHxO4n1sdmxhUm8SZbxdPF1cTFJW-FBcUNJWUkFiehyTXG2SZj2Y0l5SZRJ-V5TSf5JwvGWnItJw0mliRTcq0njSSZJsHGzSUVJF4nWWptJc0nFSQtJu0n9SY7xI7KacVYJrUkr0WhJ-2GKcdNJEnH3SUtJwkmFaE9Ja0kSSfxxtYlHSftJoRFvSVtJZnFqWpdJ7YnX8bFJd0lfSXtJEElfYX9J30mQyaTh0MkQyTJxSOHwyWdJpIltYcjJgknFsZXR9OHoyfqJcVF8cSSROMkhicoJ7kmvSeDJKMmiia8uQMmDiepJukl3sXrRMMmIyU0RhgZWSW+xKUnAcWlJ74kr4NRxDkkgySNJqNzcyV5JA7FYSSVKAsk6CQCJsMmVeqLJbPFVScjxiUkkyStJ6urmSWqcUslpcWzJGHHt8RVJwFF9SRjJy7FYyVyR2sm4yYyxnMngnOtRDMk6cWmxasmzCRrJ8slRSfVJrvHoCbuJZlEGyUTJUYnGyWhcpskIyebJNVHOyZGJZgmayb1JdslX8aKxU4nNSenROsl58RIxGUmByWgJc4k9SU7J0cnf8bzJ60lxSZ1JT3FyybVJkvE+yWVJMkkZybbJlsl8ERzJXEkmyVnJDUnVcU1JWskJydpJN0m0SYFRJcn2ybHJj7EVyfnJ4hHWybnJK+AeyeTJeEmfsh3J4cmxCe+hPcmGyRuxkUntyXXJQcnL8Y7J9rGVyddJAXF8yZPJzcmJEQaJ-snxyfPJeFF4yXgJy8kyyeyJ6cluyeuAA8kuyX7JNskjyVPJXUnLiYaJG8mpyXvxB8ltycXJx8lpyTVJO8kLgHvJvskcidfJ7skfjkZJHwkAyd7J7An-SVKJb1HvyQpJcomBidzxjxGyyffJRclvyT-JZsmm8d-JoClbyeAppEm7yQApbrFwKXKxxMmvyUgpUCmeyTApOUlYKZ3JrEnHUcgp5bE6kWpJNgk1yaWxeCm9ydtx-clEKUrJtcmUKYPJnXEvSZnJDCn7yS-JD8l+Uawpz8nbyRApmCmoKdJJoYmHyTfJ-CmuSZxJiCmPybQpLMmxsSIp4UmFyeIpnCkyKalJrckcKSQpH8mKSWAJprGKKezJyim8KRIpXCnZyYIpGCl6KVop6smLyUIpkCkmKVbJZilGKQopoJExyY1JMAlzyXYpicnByeXJghEsbg9JEl624TXxNMntSWDx4fF3yWIpw8ngnN4pGfHGSV-JowKhKTEJ1Cl-cTue70lOSdcRA27QKbkJgMlJKdgpKSknstdhPilkKSFJ-2FpKfgp+UmsyTje8SkhyfjxqR50KdjJ5SlSKYDJH27JKRuJmSm1Kekp9SlQ8Y0pBSnzSU5aaU7RKbdxiLbUcdkpbUnViRtJnSnSyXTeJSluKfzJQymqycUpv8lKSdZRzh7EKXMpFSn6yZTeoymOKSnJrfFsKTwp8ik6kX0p1cm5KRQpASmXyewpuim2KSMp0ykaKdZRfh7VKb5JcSlnKfKJ8vE3KXUpgontUZcpninPdsrxOykzycnJzLEPKU0pTylLUS8pz0l6yXJJDfFUKd0p4NEp8a8pmjFV8QZJEKmAqf+xLImwqSspfYmH8dCpiynAqQcpCAndSY3JRolVKZCpZTFd8VcphYkEqXipJy6siR8pzgmzySipxKlwqfnxCYm4qTSpkcnd0dSpSKkTyVSp9KksqXHJ8glkqWEpn8l-yaXRzKm3KcApI4mVHo8pPkn8CS-x5KniSQkpN4mWXqCp-fFEiSKpvyliqUxJsqmMKULxzCmwSaqpGykIKcEpZEmKqW0px0kD0RKpPKnqKXcpLNHGqV0p8qkc9hapd4lTKaKp6YmbiRipG-FYqfjJ-Yn6qXKpgAkKqVqp3Ck6qctJYDEkCZKpjkmlKVkJdqlKqQ6pogl1hIGpSckfSbUJTqlQCceJwamxqaGpBqk-ST-RAakmqUApGklC0emplqmeqRz2OanTCespPqlBKX6pwCIFqUsJcak9iQ4pyKkLCZGpGakeCUKpLNHlqWipRdHNqYSpk0kwMpMpMjFVyZ8pMamDKb3+mKmnyUvJ-anZCeeJEsm4Ks5xTom8qTMp2HGdqS2pYHEDqc6pQ6nmKRloi6nxqS6p68kjqWkJ24nLqTYpk6m5qUQJPSlzqe2pIsnHqSSpzHFrqVWpZcmrKWec+6nDKSYxLinjyZypyslnqQyppBF3qV2pD6k9qRSpXynIcZepE4nXqTWpf6mjqQ+JhqnmcdupR4kbqSuJLPH-qbOJ1amsqbepr6kcqdip4ymwaUuJuAnQaaNJaGk7qRhpZ8lbqd2p08k-qX2pL6nYaZBpu6kcKR+p86kKyaRpr4kRSaWp4JyXSVOppqmNqXTJIGmASampRSkEaSfJuGnDqQthtwbIaa6pfGkRiQYp6CkcKYxpB6lDCfte4mmCccJppcnVCQhplSlsaeBJjMmokfxpgqlZqUTxsmn1yfBpz6lgyUpp4skqab9JWmljyQ7JumnAac4p36lSqYmp+Gl4kfap9Yk7SRGBxal0aRqpXMkIuoApDakaaUgSbmn3qfyWb6mxIfTxaimZqbTJhHGOaSJprsnHKQFp7mnZiX4pFXGWKQXJOinyKZFpPmnpgX5pvlFJaZ+pvmkCaZupQmlxaS3J1iliaZxhwnGFaVRpruDFaSepr2FlaeepynGVaalpqOFY8YFpHmnBafDhNWlZaZhpBMmA-uppTWnjsS1pnWkxad1pHWl2acLJFWkDaWGp9mktKSNpKanjqRaJBNpRac2JfWm60blpC8lryW1pXKkzaRWJi2mryUbJuikL8Q1p0WkDKWypG2m0UVtp4in-iRZphGlWaWMpbqmhaXJpCamXaXRJ12naaYBpCmkHMZ-xu2lzaftpXtGvabNpQ4nzaauJZ2ncaeVJK6ll4F9ptqkwkWqp5AlAqSJJebrfab4pH2mwidDpD1GXEeS88GF+CW1oSGHICGphDchoYa8uyvGYYb4kZmH5iXphY4hWYftetuEAqnZhg6k8aUDpIPLBjO7cPWGo6dSY5NgkOI3YYomdjKNhXWGPePTphOnx-P1heWGDYSXxL-Gn2H-YtDjoOFLYY6mlYUzp7GGtYbRmFbhC6YA4jNiOZD+hBmlKnP+hsC4fGJ6iIGEgpCjp3OmVjOjpIZC+YX+E2OnHZj64vPhYYYcpmym6qYqAIxLjXurp+mnaiVNpN-rW6W8xtukQabRpcimW6YYYApESabcJVZZO6SVp3aB+6eVpI66B6VVp04Yh6bVpxW5sSs7pUen+6f5oMelB6X+u8emh6WbGSekR6S5hqemtaXhpWsYZ6b1pcOmm+jnpg2mMSWVmBemjaUNpwenyUY+ppmkoaZKGJemTaYZpwwa16R6ph6lNpo3p4OlCSZDpfcat6dqpJakuaXHpFemWaUGpd2nS+l3pTmnu6fRpJej96edpg+k3qYf6I+lhaVfJD8ku6aJxTemSabvmc+k3aVBpWenD6ZPpAOk5yYvp6+mPafJpZmn56TvpgSnOaR3po8YH6SZpDcmCadvpJgloKeFp4ilL6VJxhenZSZ+mV+n2KU9px+lUxo9qgsnBCW-pxemjyZ-pR+nV6dnpQBmV6Tfp2Wl36SvJR2lDyePpVungGQPp0anSqS+Gv+liyfbp9emohmgZNunYGdHpiBlT6cgZ1mlgGbfJ5um+qb3pE+kkGZTpgOlGKc-pOdGZ6bxp0Bn-aWfpY+nkGQgZ+ikb6eRpuim0GSlp9BlA6dwZpCn9KbdJs+mSKcnpMukiGWnpEK78GcwJghnkKSfpPPG56UIZchns8Q-pC+lcGTNa0hm7KaDJwhnyGa-pE0mAGToZpelF6T1u6hngiU3xT7YmGTgZovHd6efp8Kk-6VYZo+kJaR7p7OjU8XXpXslMJty41AkEGa4pM+mIJi4ZK+k+6RDWHhkaGb2pKBm2xn4ZbemYybYZ7MZBGaYZ7-FhbjEZNukJGc7pSRmx6b+gKRkJ6dOu6RmiGXfGWRkSGZThzhnKGQIpomlcGbkZvBk0GaUZChmyGVTGFRm6GdtJ7hms8ckZDRmpGepYTRkZGXJuNRmGGQAZPW4dGa4ZOCk2rq0Z2RnG6d5pjRkPadfpOmmgGZfGoxnAGbdpPhnVGcMZzRnEAB4Zb2k-aXnpcxlTGRAZ4xm36RvG6xlIGd4ZQGm+GYdpmlHHaU4ZSxkw6TkpWhkHGUwZpBk96Rfp8jY7GV4ZT6kTGdsZMBlHGXAZrBmLGYrJbRkGrgrq6BkA0Q7pa4Y-GYkZnxmDGXIWgJkjGS8ZxlFvGbcZKjbAmXkZl04FGZvJKhlHKU-pYJkLGQiZF8lUGXvpJRmwmWUZi+momV8Zga74mSCZ9hZEmXCZdK7omWHJERm6yVEZWjY4mZUZeymXGRiZS6lU6eUZdJm1GREp-RkiwdcZNhm0qXcZEJnX0e3pNJmjxqSZuJnYmVyZmJmGKXiZbJmdGXoZ3RnSmb0ZGSn1GeKZzJnUGVKZypnrqZwZKJnymf4ZEInIdiKZ9JkXGWsZ-JmWcWapivr6meyZfKkjruaZMpl1GZyZxpkM6YaZ0RnamVSZEckEERSZdBkGmZSpkxn2mTrpM6lb+txKwMl7Gc9pRpn-0WRpLJlqmWBJyul9GWVmAZnUyecZXpnPGaGZbumOGfAZHxnsSQlJZBnQmf5osZlAmemZ1Uk3GUKZfJlJmRxJPJmMqcKZp0k6mWYZepkVmS6ZfckuYTmZeBnLKZ6Zv6lKGcmplZlxGRlW3LhRqUGZ3+lOmd6p8+nImScZEylomV2Z9al7aYoZIZmnKRaZfpntBqOZ3um6mSd27pmiXqKZWpn9mRwZ4ZlimZWpAGkgGVsZjJlFqQOZFumpmUuZ3ZmPGbuZk5n7meuZqpmbmW2ZtZkxKZIZc5m5mVuZcGlf6U8Ze5kCXiuZQ5lrmYfpMxn7GeeZ75nNmcRp3pk3mdYZLBlZmWkZw5kEmaWuD5ngmcBZDhn5adeZU5k2mRyZMZkQWbFsdYABiOuJkYiraIeorGGdaClx3y63Lp9YPiDoWRdoxxBXaJvAthjWGPYYVhhnwFfgnRjOGN0Y72jeGH0YrRiYAF-g4KB-EMMY78CjGOMYCKAqQJhYkOjQEFAwqxhw6GiQSBBI6FsY0jC7GIB4X4gsoDAAhaD3GKcAjxjGAC6gWgAqEKLgalliAMKgIIByIDIgYACioNyQ00AaUFwQLlgqoFmYgDDwgJyIUpBIWGzoRlkn2DVhclkKWf4g9wDnGGAAqlnqWe8AZwDaWVGQW0AkAPpZbxgOgCqYMuB1WjWQCeA5gDpgCeCYSE5IxpCZ2IN4g7DZ4F4grhIz9PnWIaBcmMFZ2vqhWZmg4VnVIJFZr0gxWVw4cVnv6AlZ+iAX9mBM9eAiYEFZEmBT0plZlgDZWfMAuVnRWexYsOTxWXegiVlnUkZZ6zSpWZVZEmghWTlZWVkRWZmgUVmUSPlZzIjSuC1Z82BtWWEOeYKznp5gdWB4mOlZkHo1WdwAdVkwAA1Zw1lNWW7w41mWwJNZTNJC3svUXVnzWVVZOipLWVgAK1lrWdgAI1kKCGNZRVmtWSVZb1L05E7YiHIHWQuYC1lK2idZmABnWYNZeVkbWYwwW1nSQDtZb-KdjKvom+D5mK9ZQfrvWZ9ZlgBDWRdZP1np0H9Z+IAA2cvew0gpWRVZh1k9WRlZfVm1WQNZUNnfWdzYaMTw2eIAd1nNzifYKNm14JzpYNkbehDZ2NncANDZl1kvCAv4BNmUEvMGSkyk2XNZL1lHWbOqVNmY2TTZuNlQOAzZN1kTWUTZoGZdqKzZoNkc2b1Z9Vn9WdzZWAC02bDZvBAC2dtZQtmxZmPUotlpWeLZGNmS2VjZ0tmYALLZeNnNWQrZ-1lK2eYWh8QzWYdgatno2YtZ2tmQ2TzZjVl62ZtZBtkI2UbZxumeIqbZINnm2YBSXNma2TbZ61l22b9ZDtmE2RFYLNa6AIpkrtk14GzZONgU2bKGntmrWV9Zttl82SH4jNmI2cdmdlmdWajZ7NkW2W9ZVtnU2TLZvNnb2PzZtlhJ2XIWUfhV8GbZ3Vke2VnZ2tm62fHZFYSJ2U7ZoJkY-M9ZEdnq2ZbZXtmnWdnZOtm52UQ4+dlJEIXZ9hZaID5WjdndYZHZCXrR2edZdNkj4IVZBdl12ZUW3+JWMG7ZZdkXPKPZsdk+2dXZikS12YHZIdYh5nPZYdli2RnZ4NkV2a3ZHdlx2XnZCdn+2UzZsqb43NvZTWDu2YvZB9kx2TjZx9ld2afZU9kb2Qx2l9m+uIPZ5NnN2ZnZh9nW2TnZj9mxWddZL9mb4vjcG+A72TfZ1Vl32WPZctlTIOvZIDkG3GA519kL2ZA5v9nt2VXZJ9k12WfZvdmGqts8iDnI4OHZQ9nf2fvZqDmV2Z3ZgDmnOHA5b1K4OVaYadlN2XvZlNlQOcvZMNm+2XDZWDnT2X+e1DkhmLQ5hDn0OVHZjDkP2SvZGDlr2Ww5r9lIAZw55Vlk2RIEDeDHWfw53tnMOavZ+NkiOa4S5hJ4Of7gu9nl2SQ5h9noOU-ZmDnAOT4SKjk0OZI5XtDSOZzZsjn-2YI5OjnCOXo59RrN4qo5n9lSOcPZNXpL2QI58jlCOYo51jkUEoJg4jmzWeo5t9maOffZcjnj2UgI3dkwsNg5dAp6ALo8PAjz2WjZGjkBOW3ZpDkAOQVZQDk92ew54Tnf4lE54DnIOTI5-jnQOSw58tkeOVouzDwZOUg5MTl+OXE5H1loOWQ5STkUOUo5B+KUPMU5+Dm+OSg55Tl-2UfZFjnkOat4lDnqDh1ZrtwNOWo5EDnZOS05lTmJOaNZNTkFOQgKhBzbPFfZjTkDOaY5OTlMOUE5tohWOSk5ojl7qlyS0zn9OVk5czlDOQk57TnVOZ05tTk5DjDyfTn2OcY5jjnjes45gTkwOSzgXTl1Dsc5iCinOVsYJjkS2Ts5WjlVOaM5BznjOe0OqrwnOdw5X9m8OSPZZjltOa45ljnuOSs5iw4-OQ85fzkOOUQ5DDnzOS45izlASPrZXzmsCo9hvzlGOU855zlnGpc55jkguR05ITnFWas5PI7mEui5BDn-ObE5YVnDOXs5HzkEubdZRLnqCvoAA9nQuWc5sLl8OfC5Vzl5ObA5hzlqjil8MzlbOS85lLm7OXi5+zm0uYLZ9Lk3Okeg2zykuU05gzmCuW85IzlXWWM54LmAzt8S0rmzOQK5UtnyudS5irmfOcq5S04HUnY5zLmYuay5gLnsubi5iLmHiMs5oTmpObCqBrmGOWS5MLkAuU45QLnaOfi5z9l6uVIyqryGuRi5fuDPORrZrznlOa65Irnuuda54rl0ul659rkyuds5crmBue85OrmiuYrZYbkjTh1hXDk+uRI5TrkXOS65cbn02SG5hLkYMlPMo2FGub65WLncyji5wLkWuWTwftkoueUq6yKh2SU56dkUuZq5sbkKuTm5ujkeuX0eJESPWam5DrksuRm52LlZuS25E9nJOaG5p9LG+F256blRuRq5WtlaucK5NLm5uXS5xp4PWe-oPjnquf65Mbm5OQo5yLntua8u5-xKoKncjznFuSa5zrlmueW51zmiQLc5N3Zl-Hu53bmTuWu5TbkbuW45W7kjuYd66qAk2R-ZRbkTuWU567kLOWe584AXuaue01mq2fy5d7nTuc252rmtuVa5ebkzAZ8My7ml2aU5zTnfuQi5v7kB2du5zF4wefu5H7k+OV+597k-uZy5NzncuTNxgHnvuWm5WHkIeTh5SHl4eee5BHmUyUR5N7mruS3ZAbkPuaC5T7lQef8yiuF8ufB5srnkeRy5m7n22dW5dSrseZs5nHnRudx55rnIeZQSqHl2Kl7pdHnAeQx5iHk8eY+5fHmSefiho5LROQ252HmgeUx5brltuc+5xJ6qeZk5wnlTuctZVLmzufG587liubsyB1IbOQe5n7lkeZp5uHm8eVW5ynnA8oQQKDzWeZh5h2AaecZ5QrkVuZPZznl3Ifzc7nkkeZ55dnneeTO5vnnDuax5n7JW3EF5PbnGuX25pbkDueB5Q7lKubp5GZ6z2cR5cXmHuQl5VQpluUG5c7k6eVF5N3YZeTJ5hnkgeWF5YHmmeRB5YLlpedlB9hKxebe5cnmieae5lHl-udR5aHm6PA159Hk-2Yx5DnmKeU55tXkcXrUSXXmyeT158nliea15KHmDeVueGGEjeWV5TXn2eRR5jnmsOfx5X2HMPHN56nmhefE54Xnief+5W55kEHPYkbndecQ5vXlLef15K3n+ee1KJtIbeXQ5jbmLeQp5zHlKedN5SvEleRO5x3lwuad5D3naeZB5C7l08YEiVu42eaR5XHn3eRN5y3n5OZd5ksn-eU9ZImB1GBYYZxCUWcfgENCUWbRZDhg34AxZTRh-IK-gHhgf4GxZgxh-4P9owJCBGH+A2tlhGPCQ5GBbgEAAA";

    var gameRunner = /** @class */ (function () {
        function gameRunner(gameContainer, gameProperties, app) {
            var _this = this;
            this.tasker = new task();
            this.tileContainer = [];
            this.generateObjects = new objectGenerator();
            this.targetFps = 30;
            this.fpsLimiter = 0;
            this.frameDelay = 0;
            this.cameraBounds = [0, 0, 0, 0];
            this.godrayFilter = new filterGodray.GodrayFilter({
                lacunarity: 2.5,
                gain: 0.5,
                time: 0,
                alpha: 0.8
            });
            this.gameContainerElement = document.getElementById(gameContainer);
            this.app = new PIXI.Application({
                antialias: false,
                autoDensity: false
            });
            this.app.renderer.view.width = 806;
            this.app.renderer.view.height = 504;
            this.app.renderer.view.style.width = 806 + "px";
            this.app.renderer.view.style.height = 504 + "px";
            //PIXI.settings.PRECISION_FRAGMENT = PIXI.PRECISION.HIGH;
            PIXI.settings.ROUND_PIXELS = true;
            this.objContainer = new objectContainer();
            gameProperties.applySettings(this.app);
            this.gameContainerElement.appendChild(this.app.view);
            //this.graphicsModule = new graphics(this.canvasContext);
            this.logicModule = new roomEvent(this.gameContainerElement, this.objContainer, this.tasker);
            this.app.ticker.add(function (delta) {
                if (_this.fpsLimiter == 0) {
                    _this.logicModule.deltaTime = delta;
                    roomEvent.tick();
                    _this.tasker.tick(_this.logicModule);
                    _this.logicModule.queryKey();
                    _this.objContainer.loopThrough(_this.logicModule);
                    _this.objContainer.populateFromList();
                    _this.objContainer.purgeObjects();
                    _this.fpsLimiter = _this.frameDelay;
                    if (_this.logicModule.camera.getIsInUse()) {
                        _this.app.stage.pivot.x = Math.floor(_this.logicModule.camera.getX() + _this.logicModule.camera.cameraOffsetX);
                        _this.app.stage.pivot.y = Math.floor(_this.logicModule.camera.getY() + _this.logicModule.camera.cameraOffsetY);
                        _this.app.stage.position.x = _this.app.renderer.width / 2;
                        _this.app.stage.position.y = _this.app.renderer.height / 2;
                    }
                    for (var _i = 0, _a = _this.tileContainer; _i < _a.length; _i++) {
                        var t = _a[_i];
                        if (roomEvent.getTicks() % t.tileStepTime == 0) {
                            t.animate();
                        }
                    }
                    _this.logicModule.camera.moveCamera(_this.app, _this.cameraBounds);
                    _this.objContainer.updateLayerOffsets(_this.logicModule.camera, _this.app);
                    //this.godrayFilter.time += 0.005 * delta;
                }
                if (_this.fpsLimiter > 0) {
                    _this.fpsLimiter--;
                }
            });
            this.loadRoom(JSON.parse(LZString.decompressFromEncodedURIComponent(scene_home)));
        }
        gameRunner.prototype.loadRoom = function (loadRoom) {
            var _a, _b, _c, _d;
            this.objContainer.removeObjects();
            this.cameraBounds[0] = (_a = loadRoom.cameraBoundsX) !== null && _a !== void 0 ? _a : 0;
            this.cameraBounds[1] = (_b = loadRoom.cameraBoundsY) !== null && _b !== void 0 ? _b : 0;
            this.cameraBounds[2] = (_c = loadRoom.cameraBoundsWidth) !== null && _c !== void 0 ? _c : 0;
            this.cameraBounds[3] = (_d = loadRoom.cameraBoundsHeight) !== null && _d !== void 0 ? _d : 0;
            this.app.renderer.backgroundColor = parseInt(loadRoom.backgroundColor.replace("#", "0x"));
            var _loop_1 = function (layer) {
                var pixiContainerLayer = new PIXI.Container();
                var objectsToAdd = [];
                var containsOnlyStaticTiles = true;
                var layerSettings = JSON.parse(layer.settings);
                this_1.objContainer.addContainerForLayer(pixiContainerLayer, layer.zIndex, layer.layerName, layerSettings.scrollSpeedX, layerSettings.scrollSpeedY);
                for (var _i = 0, _a = layer.metaObjectsInLayer; _i < _a.length; _i++) {
                    var objMeta = _a[_i];
                    if (objMeta.isPartOfCombination == false) {
                        var genObj = this_1.generateObjects.generateObject(objMeta.name, Math.floor(objMeta.x), Math.floor(objMeta.y), objMeta.tile);
                        if (genObj != null) {
                            if (genObj.isTile == false) {
                                containsOnlyStaticTiles = false;
                                this_1.objContainer.addObjectDirectly(genObj, layer.zIndex, layer.hidden);
                            }
                            else {
                                if (objMeta.tile.tiles.length > 1) {
                                    containsOnlyStaticTiles = false;
                                }
                                this_1.tileContainer.push(genObj);
                                if (layer.hidden == false) {
                                    objectsToAdd.push(genObj.g);
                                }
                            }
                        }
                    }
                }
                if (parseFloat(layerSettings.blur) != 0 && false) {
                    blurFilter1 = new PIXI.filters.BlurFilter(50);
                    var filterContainer_1 = new PIXI.Container();
                    objectsToAdd.forEach(function (obj) {
                        filterContainer_1.addChild(obj);
                    });
                    pixiContainerLayer.filters = [blurFilter1];
                    pixiContainerLayer.addChild(filterContainer_1);
                }
                else {
                    objectsToAdd.forEach(function (obj) {
                        pixiContainerLayer.addChild(obj);
                    });
                }
                if (containsOnlyStaticTiles) {
                    //pixiContainerLayer.cacheAsBitmap = true;
                    if (pixiContainerLayer.filters == null) {
                        pixiContainerLayer.filters = [];
                    }
                    /*pixiContainerLayer.filters.push(new AdvancedBloomFilter({
                        quality: 4,
                        pixelSize: 1
                    }));*/
                }
                new PIXI.Point(20, 20);
                new PIXI.Point(800, 500);
                this_1.app.stage.filters = [
                    new filterAdjustment.AdjustmentFilter({
                        gamma: 1,
                        saturation: 1.6,
                        contrast: 1,
                        brightness: 1,
                        red: 1,
                        green: 0.90,
                        blue: 0.9,
                        alpha: 1
                    })
                    /*new PIXI.filters.NoiseFilter(0.099)*/ /*this.godrayFilter*/ /*new AdvancedBloomFilter({
                    quality: 4,
                    bloomScale: 4,
                    blur: 6,
                    threshold: 0.5
                })*/
                    //new BloomFilter()
                ];
                this_1.app.stage.addChild(pixiContainerLayer);
            };
            var this_1 = this, blurFilter1;
            for (var _i = 0, _e = loadRoom.layerData; _i < _e.length; _i++) {
                var layer = _e[_i];
                _loop_1(layer);
            }
            /*new TiltShiftFilter(
                        50,//Blur
                        900,//gradientBlur
                        start,//Start
                        end)//end
                         */
            this.app.stage.addChild(this.logicModule.interaction.inputContainer);
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

}(PIXI, PIXI.filters, PIXI.filters));
