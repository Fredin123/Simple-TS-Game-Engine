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
            PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
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
            this.cameraX = Math.floor(this.cameraX);
            this.cameraY = Math.floor(this.cameraY);
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
                var newGraphics = new PIXI$1.Graphics();
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
                var newGraphics = new PIXI$1.Graphics();
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
            return _this;
        }
        hitbox.prototype.setOffset = function (offX, offY) {
            this.offsetX = offX;
            this.offsetY = offY;
        };
        hitbox.prototype.setSize = function (width, height) {
            _super.prototype.setCollision.call(this, 0, 0, width, height);
            _super.prototype.style.call(this, function (g) {
                var newGraphics = new PIXI$1.Graphics();
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
            var startupTime = _a.startupTime, x = _a.x, y = _a.y, creator = _a.creator, life = _a.life, size = _a.size, offset = _a.offset, hitboxDirection = _a.hitboxDirection, aerial = _a.aerial;
            var newHitbox = new hitbox(x, y);
            newHitbox.creator = creator;
            newHitbox.life = life;
            newHitbox.setSize(size[0], size[1]);
            newHitbox.setOffset(offset[0], offset[1]);
            newHitbox.hitboxDirection = hitboxDirection;
            newHitbox.aerial = aerial;
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
                var newGraphics = new PIXI$1.Graphics();
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
                var newGraphics = new PIXI$1.Graphics();
                newGraphics.beginFill(0x003eff);
                newGraphics.drawRect(0, 32, 64, 64);
                newGraphics.endFill();
                g.addChild(newGraphics);
                var text = new PIXI$1.Text('[SPACE]', { fontFamily: 'Arial', fontSize: 24, fill: 0xff1010, align: 'center' });
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
            _super.prototype.setCollision.call(_this, 0, 0, 64, 125);
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI$1.Graphics();
                newGraphics.beginFill(0xFF3e50);
                newGraphics.drawRect(0, 0, 64, 125);
                newGraphics.endFill();
                g.addChild(newGraphics);
                g.calculateBounds();
                return g;
            });
            _super.prototype.addCollisionTarget.call(_this, block.objectName, movingBlockHori.objectName, movingBlockVert.objectName, dummySandbag.objectName, tinyBlock32.objectName, wideBlock.objectName);
            _this.updateCurrentSprite();
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
                if (this.falling == false && this.hasJumped == false && l.checkKeyPressed("w") && Math.floor(this.gravity.magnitude) == 0 && this.actionWait == 0) {
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
                if (this.hitboxToCreate[0] > 0) {
                    this.hitboxToCreate[0]--;
                    if (this.hitboxToCreate[0] == 0) {
                        l.objContainer.addObject(this.hitboxToCreate[1], this.onLayer);
                    }
                }
                if (this.hitboxToCreate != null && this.hitboxToCreate[1].aerial && (Math.round(this.gravity.Dy) == 0)) {
                    this.hitboxToCreate[1].life *= 0.8;
                }
            }
            if (l.checkKeyReleased("p") && this.attacking == false) {
                l.objContainer.deleteObject(this);
                l.objContainer.addObject(new mio(this.g.x, this.g.y - 32), this.onLayer);
            }
        };
        player.prototype.hangleAttacks = function (l) {
            if (l.checkKeyPressed(" ") && this.actionWait == 0 && this.climbindLadder == false) {
                if (Math.floor(this.gravity.magnitude) != 0) {
                    //Air attack
                    this.currentSprite = "warriorAttack";
                    this.currentSpriteObj.animationSpeed = 0.4;
                    this.attacking = true;
                    this.constantForce = 12;
                    this.actionWait = 45;
                    this.airbornTimer += 5;
                    this.hitboxToCreate = tools.createHitbox({
                        startupTime: 4,
                        x: this.g.x,
                        y: this.g.y,
                        creator: this,
                        life: 24,
                        size: [64, 64],
                        offset: [48, 32],
                        hitboxDirection: new vectorFixedDelta(calculations.degreesToRadians(24), 24),
                        aerial: true
                    });
                }
                else {
                    //ground attack
                    this.currentSprite = "warriorDashAttack";
                    this.currentSpriteObj.animationSpeed = 0.21;
                    this.attacking = true;
                    this.constantForce = 3;
                    this.actionWait = 35;
                    this.hitboxToCreate = tools.createHitbox({
                        startupTime: 7,
                        x: this.g.x,
                        y: this.g.y,
                        creator: this,
                        life: 7,
                        size: [98, 48],
                        offset: [64, -5],
                        hitboxDirection: new vectorFixedDelta(calculations.degreesToRadians(24), 8),
                        aerial: false
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
            if (this.facingRight == true) {
                this.currentSpriteObj.pivot.set(0, 15);
            }
            else {
                this.currentSpriteObj.pivot.set(-15, 15);
            }
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
                var newGraphics = new PIXI$1.Graphics();
                newGraphics.beginFill(0x0000FF);
                newGraphics.drawRect(0, 0, 64, 128);
                newGraphics.endFill();
                g.addChild(newGraphics);
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
            _super.prototype.setCollision.call(_this, 0, 40, 128, 88);
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI$1.Graphics();
                newGraphics.beginFill(0xFF3e50);
                newGraphics.drawRect(0, 40, 128, 88);
                newGraphics.endFill();
                g.addChild(newGraphics);
                g.calculateBounds();
                return g;
            });
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
                    this.hitboxToCreate = tools.createHitbox({
                        startupTime: 4,
                        x: this.g.x,
                        y: this.g.y,
                        creator: this,
                        life: 24,
                        size: [64, 80],
                        offset: [60, 54],
                        hitboxDirection: new vectorFixedDelta(calculations.degreesToRadians(24), 32),
                        aerial: true
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
                        hitboxDirection: new vectorFixedDelta(calculations.degreesToRadians(24), 16),
                        aerial: false
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
            _super.prototype.setCollision.call(_this, 0, 0, 256, 192);
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI$1.Graphics();
                newGraphics.beginFill(0x000000);
                newGraphics.drawRect(0, 0, 256, 192);
                newGraphics.endFill();
                g.addChild(newGraphics);
                var myGraph = new PIXI$1.Graphics();
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
            var targets = l.isCollidingWithMultiple(this, this.collisionBox, [player.objectName, mio.objectName, dummySandbag.objectName]);
            for (var _i = 0, targets_1 = targets; _i < targets_1.length; _i++) {
                var target = targets_1[_i];
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
                        target.g.y = this.g.y + target.collisionBox.y - (target.collisionBox.height) + 64 + (64 * (1 - ratio));
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
                else if (target.force.Dy < 0) {
                    target._isColliding_Special = false;
                }
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
            _super.prototype.setCollision.call(_this, 0, 0, 256, 192);
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI$1.Graphics();
                newGraphics.beginFill(0x000000);
                newGraphics.drawRect(0, 0, 256, 192);
                newGraphics.endFill();
                g.addChild(newGraphics);
                var myGraph = new PIXI$1.Graphics();
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
            var targets = l.isCollidingWithMultiple(this, this.collisionBox, [player.objectName, mio.objectName, dummySandbag.objectName]);
            for (var _i = 0, targets_1 = targets; _i < targets_1.length; _i++) {
                var target = targets_1[_i];
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
                        target.g.y = this.g.y + target.collisionBox.y - (target.collisionBox.height) + 64 + (64 * (ratio));
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
                else if (target.force.Dy < 0) {
                    target._isColliding_Special = false;
                }
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
                    resourcesHand.createAnimatedSpriteFromTile(tile);
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
            loadedResources = loadedResources.filter(function (x) { return x.indexOf(".json") != -1 || (x.indexOf(".png") != -1 && loadedResources.indexOf(x.replace(".png", ".json")) == -1); });
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

    var objectContainer = /** @class */ (function () {
        function objectContainer() {
            this.layerNames = {};
            this.layersContainer = {};
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
        objectContainer.prototype.addContainerForLayer = function (container, layerNumber, layerName) {
            if (this.layersContainer[layerNumber] == null) {
                this.layersContainer[layerNumber] = container;
                this.layerNames[layerName] = layerNumber;
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
            //Add on specific layer
            if (this.layers[targetlayer] == null) {
                this.layers[targetlayer] = new Array();
                this.layerKeysOrdered.push(targetlayer);
                this.layerKeysOrdered.sort();
            }
            this.layers[targetlayer].push(obj);
            if (hidden == false) {
                this.layersContainer[targetlayer].addChild(obj.g);
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
                    for (var _i = 0, _a = _this.layers[layerNumber]; _i < _a.length; _i++) {
                        var target = _a[_i];
                        if (target.ID == removeThis.ID) {
                            target.g.destroy();
                            _this.layers[layerNumber].splice(_this.layers[layerNumber].indexOf(target), 1);
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
                for (var i = 0; i < this.layers[key].length; i++) {
                    this.layers[key][i].logic(logicModule);
                }
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

    var scene_home = "NobwRAtgpgLghgeQEYCsoGMYGcCSA7AGTgE8oAnMALlDBgEsAbKK8POaKsMAGjDjzoQ49APZ4AygAcoUACZUADADoArL3pMsVGhqgA5ds0pdeZKFhEBXMun2HOAFjgOAzAoBM7qAFoksgOxw3g5yAGbeAJzu6OFQKgCMMkih6A7oLgBsSpJ4AOY8YFjwZDAAGlTeLgAcDrxFcCUAmlQJ7rwA7nSyMAAWVA6etWA9UHS5PTBUVS7uAL4AurO8dFgAwiIQSHRsongIoQAqjOZUMGSWUMtYAAoNMPvrm9vCdGJUoXAMWJdgAB4V1SGxBa8TaYDYHGMTlcHi8vgCQRCsnCURi3jiiSgyVS6SyOXyS3AuhY4PsxlkIhEZHiBX4gheYikMnklAU6mOWmoROOBkhYAUBTMFmstl5RjAQqsNnMAHpdN9sAB9aCyOiWCAygBiVPMMAAaowGHBclBFfLYAoXIqAG6G42m+IZX6O7J5Ar1ErlVl1YowZqUDIONlgTrdPqUUFVXgjMYTKjxKILJZgFaPLY7V57Q4c96fb5XW4lB4bdMMvCnc4-f6UKoRDK8YERhRVKOkvkUqk0wm0Y4kiHi9qfBg03h0oS7JlyRTszTablMMWcAWmcxS0VkiWrkWy81KlVqjXaoX6u0ms0ci1W20MI1nx3OvFun13L3uFT1wq+-2AjpdXpUQNo1GcZJgjRNFiuNNnl2fYjlnSgPi+H4VkLe5QigjM3koM4Ll4at4g8IF42bVt+04Qcby7bh5yMVgNwo4daQEcdM0nFlg3lOcewXDdl03YVpUXYxJW3LA5QvPc5APLUdSKA0b3tc9NEvG1TwdJ0XXxd1fVfd9nyaKgfxDP9w0A4ZgLjMC5gglM1hLaDM1gnMELzZCbjuYsnkw8tsMrPCphmBtiJbXgyOMBiqJovt6O2ERpDyMgrDweRR2Yss2OnbiTi5LKhP5QUt0EjcROlMTdywZUpPVGTj3k29TV3S1VIUu8NMffJ9LKEEwQ9P0AKDX8w3jdxWxjED43A5NU3s7ynPgxD81s1DPNLXYK1wv5gtbRsCJCtsB1i+LckSyxkrAbtiUoOi+U6PA4qgBKkpSvg0onaQp29LLOR0HleIKgT1z5ErbDKiSKv3aqj11OrFMaq81MVe9NKfT8X26zr-UDYNQ3-CMRqA2NQITayprsryyzm7KFrc5b0Jmst1qrKh-AUIimz2sLjLuo6TrOi7eyu-byKHEcXvpN7mUyzict0PK+OBuwgcKkHxOUyTVUh2STxahqJKa696sRtrXQ61HPSoN8P1678akG3GzLGyziaTSD6Zg7N5tcgsPLp8m1t8jb8PcR0gvZ0j6JF87qKy6Kbu2dAGBEb5jqepjxdY972JnbKfp4vl5eVxXxQV0G1fBqrDy1mGzzh5rDaR9rtLRygjOt-rsZM4bRosonJtdv3HI9qmvaWn2MIZgOmbxqpgx2kjQpivAE6TqAU9O+R+aYWOB0j1L08ZTOpec3Oi6Xf611P4TC9L8xYHLjXK9qhHa4NxSG5NpvzcoS2McM23jKGgGIYjte4k37qtQecFh5IW9kWX2ECsI4SnljUOu1w43UjpvWiQtwq7zFixA+ktPrSxPnLc+248ol1VrfdW0koZyWfnreGOsjYPg-p1XSVsvx-yGDjUywCe4TTAbZce7soGcmprAtCojMyM38hGIM20toLwwZRKOUVBacwYg9WQTBQgwFFmOdKh9iHHxomQlcANL78QvjfBU986FV0YWrfWCN35aQ4ZlNuLd-58K7gTcaVkXYiLdpA5ykjR5wJkYgvym1KCtFQfPHBIYhw6L0QY9RMdNERxvDosghNDGvQzkQjiZjcp-UsRfSh19qH2Mqg-Gq0NnE0NcSw9xKNepekjL-HxvDO7TwCU7PuISB5iEphIkeKEx6hJiYHeMDh-BgjnhzHJTBkr5JApFLJ11xRIBEDAGAGxxC+gIFAfRacCESBMaU+CpCKk2IocVGp5V6mOKfiwl+bjjYeLNl1T63iVD+A-H4gZ5lCb9WCdNUZWZxG5hgZE6RMyfJIPkQ4BwSimzuCGJzPZByjknLOZMLB29OC4sORAY5dwABK4K96XIyqY255j7kK2qVYuxd9Xma3eYbT5bTvkdJ0v435-pAXAv6d0sFgTAyQrJggmF4TJnuSiUiuRcT4gqEyIkrFKjdn7PJZSkoNLxrEuyXyMlGwADqQ5NSJypBc4xJTs7fWZfnchRUlbstqZyiGj8mkfKYXXN+ArTadItnpEVLQgV23DDMYMICIU2ShfK8ZcLFpTJVdCtV1ZphLOIjq5JFqIDWpvLaykFBTU7M4AAIX1Vam1dqyDuAdRLD6Nyc6uvFAXKxbLbHetody-1vLA2v1amwn5Ybv4RoBdGgBuNiaDNAjKpNcqHJjKHhM+FGbEVZsnvIsV2rsUblrXi4tDby3Nsrckk95KS0MDLVSZtdLHVtudVxWWLLC69tEv2hxg6GEBpccw+uIbP5-J-pG+Js6QULqlZZZdpNokKs9lu5VO75XZvjC4NFh7dU1rrWe0tjbL3R0ulW4wN761EYvS24pr6vrvt+m6ypjzPV9peb6xpAHh1AaDWO5GoahVTq4XcUV0GJVREXYmxDSLU0uVQ7TJDmGIwarzZio9fJKOEfvcRzJZHC0EbvZqAg5aXC0cIfRkhnaz4sY9cXZ5YMuV+u47DEdXzx2CubgkyDB6538Kk0A2VSG5MRO3StNdyLYnViBRigiBacWGZtSZqkZmr2c2ORsDgz7W1ZwYzLJjXb3WA3s16jjFcuPax4y04DwaPOCebq3bhvSY1CIC5GILsmN1ppptM3dKK4l1lnlMOseHjAZYgBwNLG5l7fFkJa7YFJ2jmauU6vLdzmMPLs5wKhZWGn0Mq653jo71J1bA16Rron24tdBQm6eHXoUhaVYp1Ve71WqdDrWD8nMZtyHm8lEQS2pt8nungP7i3lsMvbS68pG3WVPNK45zj+3q66yO+5gTZ30aQZQX54Vt32sruC11+T6a0Phe8sp+I2G2afdG2AEHYOAd6YFuRlJN5xBCBvHoEQWmIfXLfflvOhXbPFe2w5suTmKso6UtVvjJ2MeeJbu4YM3ijIgodoIu7hPOuwpJz1zNGHXtBxnh9kbySGIc6HNz3nQOd7s85wwa3BG+eraszD4Xm3RdXwRxLpHTjAOy+O6whXvzzvK56Wr-pGvwVa5kw94noWyfwIi5ThZanafm6HJbrnPPne2+FjeAAoslU5+in34Jfblt3H7Ydfvh+xxH5XkfNIVK0kDp3Fcq6a5HwBkr8cjXuymhPT3euG-69WNFGKM9aKHMX2QpeYAkY0azhic-jUTHL0YnLR8mXu5s576xO3G97f91V1vNX+ON0V5K1XviJX4zg0TAf2v4+68T89vrUX4yao-I2afqy19CYl9tlkkfs5sFsmdss6Mq8yka8Pc4c2Mf1ds3kh1DtA90cr9Q8eEekccYMH9+8qhB8ItHsFNR8U8jcrswA-8zdvtE5ZtGdAdSMWdM97crdc9T0XdLNYCCt98ECSsG9fcm9T80Dz85dg9MDJ040I879AFo9AkCc48h838R8DdyDx8o1f9hsvtVls9Hd2DyVmct4zU7c9CtNN8ikLMYDd84DeC69EDSpf1Jdm8A9RCg92l6sv4INb8+le98DNcFDwFiDh9SDVCKcKCaxAoqCtC6cGIndT1gD9MZ9WCc9ecoDLCd8O099jBu0ql68kDj8UCXMa43N+UO8sClcu9LtmtccgE2tn9FCgjlCQj0M1Cv9KAYtTdtDVEGBdC4iDD89jBbBGBDUYAtMF9OCrDMibDsiitD9xcaE-1nMDtii0dSiQ9J1KiDJaiaiINbsENAjZpgjScP8x82ijI-9IjvtRgejfQxjCVDDsErjhjbiCN19Jg0iVsuDrCeCZiRc5ifcFinDhCVj0C1iJChNNi+pQUQVdjNd9iRklDFVmjycJ51CFFFkPtLjptriRitM3iHiSVBjriABZLoXRKAcYj4yHAXdbeAuw-g-IwQk-HlEQlSNw0DTvHpDuXvSTR-aTA4imI4-XFosItE7zRsDo0AkkskpgcYgYsAIYhgUk2QckykivbfRlKYn4-KP479Bw5A-9ZY1HUE9vdYiErk67WDPYhwIgw4po44sg0Uto3zCU1mOnRU5U1U+4+Uj0mUqAfEqk-nNbazX4g-PUlWA0pY6XPlU08E5uWDbxbk+dXk6020wU+04UlE-2NE+IRRUOSUp4pUv0-En06UlUpgAM9U6AjI6HaYnUsMvI-Ugow06Mko2M9hcohMprJM8MK0uEm0l-RElDB00I1EtoqnHDKI9ot0qUxgT0is8FUsxgOfA4OKSsrfaszU2s7UnI1jBkpspkwoo0mXVwjAjsydSfC0movsmPAIhExopEkckUscuZaeIbKDLo8URUlctcxcpgow1nb85KVcyQNUjc9IrcxjIXWwntRsiM5sqMlvNks8idITS8yDSVGDFM-w+ogUsRR8zM5PJ018nHRsXzQsn80C70-8x4jcLAHoQQPAKAYEQM13bg6C0MvgsXAEupP3FkkE08sE88oTC7LYzCqPARGPS2NM-C4cwipTcI0EEOKc7zTmeixi5igk4wzgRUkCiYmsqC6xXcrbb3AQwEvi1AgS5CoS1C5uSE-0WDLCsEVMwch8uSqRLM2RcI3NUOHHQsvSpchgPS1ir4rUji+sri0yxk8yoQ-i40wS9s2yr+ey1ra87CmPeE5NNy6BJ8zy2ZKeOLNmPy7ExgAKmiwkhU641IqsiCqHQyixBs+w+Cw8lspCmANvWrM0uyiPcPNK5y-smSsJdyhFPKyLEigaKcny2chgG3cq7Sokxgaq8Cz4yY7c8K4yr3A-DlAdRClw6yxKzzZKnqns1Klyhou0gijyoil8qeKai4sEQs2a5faapaiwlagywXIy2Y8MncBCqXNqjqy-YS7qyDKQvqgLTK1dC64asLa67M8cwiTEh6kqmavPOawCqq53EK1a+qz9WCpq36lq3as-fazquMo60G3qpyiGgc869My6kauGrynM4OTQiI5GvkRUp6kAx6rGmq96yCz6hqyKraxwiyoo+K0moGpKv5FKioy09K6VWmvCoanK+Sl7Fmk3SarEzmzGjgwK+c5gbGj62kmC3Igm7axY-6va9qi-eXcm2WnpCDamvkwLVy6GtWq6hStEyUiUjIdBL8ss8krSjGucv0-SwW02zi+k7isy3i2KyyyW22sQ9wzHf5JrZ2iTfqjK5W+8j2zdXKpm-K+RQbfM-290oOreA28O42yOkMiKmOqKg8mK5kxOk8qW+24Gim7xTOnk7OpWwa9dDMr2jW8c1msugOnSyu5gau8so2-m6k4MrIhu-G-c5qluo81s1Yg6jwx2yDXu5M-u+DXOrK-O7rEez-V8jPV0jTQOsOuekO6aw2iOuqoWvG82tewmje1qm2wGzumWr0OWg+3sxW4+we5DT2xm72to325mGcws5+2e4O2u1+qOlej+2O6K+O1uiW9u5O9ksojYp2iNF2s6lWoehm2G6B18lmNmAslGxB9Gp+muheoM6vHc76uCr+7BzegGu28QruvenukhrOmm8Bkgwu6hgqxGqc2hiu++4OpBreFBmk+uja-4uOn1BO3BmMsmwRwB4h8VPusR92+mmGpPKR+RO6uB2+qehRquphhBlh5axe9h9azhi2sW7R483R6Ww6oRjOkR4x12yGonYeqB0e18wqie+Rosh+pRqAcw-eAW1BtRjxz+y2oEuKvBv+gRgBrxQJox+2SSge0x2SyBqhyJgqkad8uR5huehI5gzmWQGQSQAAcV5lkAABEGgABrF+1R5e9Rn6zJ8WnxvWeIRUY6OALACqVOxXMyRM67OQsBsp1Wgu9Wy+qeUuqcyMYMZp1pjpp6Hpsgfp+UlpqAdpzpk5-plRpeus4Zrh0Z7xrelpSZ6Z2ZvJ-xr0RZ7s5Zkp1Zum8pjZi+04qJmRnaGpunC5q545vpx+g5y5o59eG5gZ+5jh3Up5rxnB8Zlxd5sgGZuZjk8o35qok67YshvOsxipixqp+RaJ3ZqF5JGF5F5KVF85w565+Fu5txr6zFzxyM62km9q-Fwlr53en5oYJZmolZpdE+qG6lkFiJrZ+liFrufZjcFlrl05hFzVzluFnVnl9ivlxqjJ7F3h3+0Vz5+ZklqVv5mVgFuV8RoU0F1o8FgtSFrWxF2FlF+FjlpF7V251hti749x-ls1wV5w4VhQK1olwhoTUlrY8l2V-kql4F8+5VsF6Rj19V6F-V31nV-1n1tl7l4N0Ktak1kWo-ImoV1kkVqZgl614lydRNqE5Nx11N0+xVjNyplV9VJJT1jV9sfNktwtxxvVgNg1oNlxth414Wxu0WyN4EpOmNhtsVm1ltu1sl-5kxoF9Znt2lvt-CAd3N5lkd7pv18d4dydgt6dt61xud9+vczB5unhn+6N2N8VtO1t-0dt3d8hiBpV3trN1VvaQdvNm90ds5q98ULVqdtF3l+d1el99et94mut1dj5uNrqr+H9zKdXDtt2vdih8xk4t16RsD09711li9sd566jwNhDx92vZDpu1DrRnF151vT9jdhNrdpNndkJ+VsJyhw9kD-tyjt8iD4t2j6D+jidmT1Fo10Nythd6t7+9Dqy+trDr9hZ-jttwTylrt9NvXV14iij2LJlhj+DotmjpTstnGt+ljjBtj7hjji1j9tdpt+N5uPDz6Aj-9tN-d0zzN8j0Dyzr1hTuzy9+T69xT0tmdkNsK1T1jxdv6qNjDnj5tvjq8gLoT518J4DsLiTiLod2D899lmDzgOD29pjlTpDlztLmtjLrTzDxt7Dh2yV3LiSwL4z4L9-R0m68L1BKzqLxj2zxj5T5Lhr591z55zjgGrLnz3D-T39wzgatZkjmlsj8z4bxlyLuL6Lujnmsb+DqbitmbkyprjT2t1rpbnDv5Pzv9-LzbwDg9nbobkrkbg78ryD2T3Vw7ybhzk2tJ8NlDtzna27ld+7zr-qbr2Qwj0JnXUTj7+G8FyTvZ6To7uTk7wHs74HuuoZ9J8H+bjzzLrzjr-RuHyDZ7ozhVkzgb0ctHiz77sr6rirmL3H37+Lw1gn1JonsHub81998nnT3j3z1b-Dnrl74jt7kLor3br7-btn8kDn47xI072r873G5z2b67tDqHnJmHqn7Y6VvLunkT0jwb5nvb8Ds9v7yr2L7n7Hur6bp9q79Tg3lr6Hin3T21+H4p3r+n-rlQ58m3pXu36z2rib-HxL8tnXuk1Lz39zkXu7338XlbgP-zGXgDiRzZ8T49jH0bvH6Pqr1Xh3hL+92d+r93za5PyH73o39P7LiXrP6ni35Hq3pn5m8c97ZXrH8bsvsAGrqD13i72vjRrBlPzTn3sXlvzPmn9bnOgrlH63nvqJvvyPzX0fmPrXvnwZh54noXpd7JxqY3-J03+183jb2XvPszz7-CTfqj7f-73f0f7XpzxPxr+vq2xvs-5v5bo90l7+dpeHfV-Kv277F03sKgNTJj3t488ceGvEvu-337osw2prEnsLxn5N85+gArrovwdZB9Le23NflAMf4wDWeA-GzkPxH7-cP+aDR5gK3S7LscB7XP3puzb4Usb+ufF1qF0V7kDYBxfZ3oPyd7s8K+vPOPo5wYFH99e0-Q3v-1wEPd8BZvUAdwKC5bcgOYnYrgIMoHwCXeb-OgagMQ4T8RmWA+QRMwAFKDqeKghHkQM74kDIBY1Aqk-yk56CRBXPMQQgLH4J8zaevH-lkzboKC2BGfIAZwJTZEceBhXLQfwPjAuC4BUfHfjQLV53tkmD7Gvrrw97zEveLAoIeu3n6hCCB1-Zfq9zv58CH+sQigf3zcHUDRB5fLwfQNB4YDj+zA0-hYMUGw9L+27QgTn3UFy9GeYfdfs4MqFb9kBr-JIeIJSH0pq+bvDIXXyyFyC-+bQ4IfkOUFX9VBxQ2-rwIV7lCVMww5-qMMd4eC6hLvBoQLyaGyCG+OQpYXkLwHWC1htgnoX1w0HvdSBTg+lnEKEGeD9B4w+oUYOY5f8-B8wy4a0LxaWCOhT3JfqU02FRDUegw94XsNcEJCxhtQ4fskO8Gf9fBmQnigsKuGgj2hJvCEd0LAFDkHBAwsgRUMEE-cvh7gpAcINj5V8ku4-WYZP1fY4iQRbzMEQSOAG081BTwvoaH1GqU4PhVI44TSKab0QoAN4dEdIMF4XDf+uIk0nowv5g1vEcAkFGDVuzSUShWw6ITsO8CSo548WCUVKPlLXARATAYknACornJThh-WUf4LGZccO67AoTF4Saw7Mih8hXCr0NKHbDw+1YSoP-B2h99OYZoi0VaLlJD9JA5oqAJaMkDrkGR8fDEdHST5Aj5R7IhKkqO+bYFIMHo9YV6MILaiYRrw5TC4H8CzpgxlQzmNGPDHxi-yKIpAJYHQC9NYA0oxoVWzTEBCdGbZLMRKzuFVEM8nowFpEIgFki3h6qXkpC2Uo4omxLYolEPyKAiBmxDQQpKkOmFMiARWIzRsCMCE9i-GfY6oqqIyBmQYSEaAgivy75jjlMEGSsRzXFCLjlx1Ic6PMGjBkkHoGbI0KQDIB5R5QAACSsDfAtAvAAAF74AWm+EbsNAHgDIA0AmAXAIQBIDkBDKVAPAJYBvAjjLxgokLtWBdL7CDoLTatInGbFaVUJ6En0TqNhFYQIkQcZSiMPwlQBCJS4xAQLFIkMAMJpIrCdRIqBmQ6J5ELoAxKInMSjCrE9iZoMok+QuJ38S0IIOnExQCJgkkiWhLYnkTixjgjNtWHcAZAMSjLWSeagUmmoRJKk0cZxJHgaS6mU4z8qSn0lzVDJfI30bqP9iSS3AzYXQVon4mMTiJBkpSaJJeFqTsJ8YfwJOIpHulzRDAFYKxETjSBIxGiWycH2eHy8HJXlSSSNFonBTQCoU8KYyEin+l6xWSWKcQLEklj-JLcQMKVxiLuTrJMU7yUZMwlF0JJpkioOZLwl8T5JTExSWRLskUSipkkgYEX10m7JKpeU6qZ1NUlXjipvU2LEkhxSDTLo+U+wYVL8k9SRoGKHZtNLaleSOpcU-kciTqnqT+gy0pGnTiQAzSWJw0rafZPEl7TKAE0-MvAw3DHT1pNks6QVN8ljSlpkncivdJOnCTnp8016SZPhQT4DpU5dCmtM8lPTNpL0hKZdPGmOh3yoMr6Y9KqmQy-p0M7qQ1MoDeBrGeMfqVZKRlDSUZ4A2qQpUklYzIiyySesYAengzkZykkacZN2nFSyZamCICoAiBKAIgnMrmdzK5lHTvpRgOaUTI4mMzSZ2MqamDKEkCzfpQshaW9IxnMzbptjKmfzJQnSySRssgGYtADHYzPpek-GbNLVnZUNZIs+WdjIRl6yaZBMumedK6mLTTZ5MwyL1QlntTrZUM-oZrKnjeAmp8tQtPpJfHDA3x44z8eQDyhEAvxAAAlFigTkoUADSZBNgCIBUAGAbAPgDDlITPqqswmerP+kmzAZVACIKCFQQhiNwkgYORWghmuzUZ7s3OVrItgOBUpYcaFuqAgDEBxA-AWQEgGNDPjXxKpd8SFzLl5Q4Aeya0FAHWA3hMp5YECWBNjmGR450EpOXBNTmISKAGc+aiYD56qAD+2pGQRkBcDoAAgsgGYN4HQBwB4g-gYIHAAiDhAkAjoc+VUA+AZAsUoQZXLIE5km9vAvmVUX3xBTopwhtDC8dlH6x+ikp8s3CbsLvGcBd5+8-wIfPcDHzT558pwFfN8C3ysZD8p+S-LflaR5SoQI0DABo5tizhHY7ETuO7F4jlhtw9OlUW8x4Fu4t5b0fTOJl0s4k3spSpZOMC4LhABCnBXgoIW2iMW5wh0S80W6ciL+ctGhffjoUFiAFxsyxhH2Gi4yOFvCzpgD3FCcL8FKi-hegOIXbj0xu48hTcKsFUKtiEi3wlIqdgMKbZo0rCSzQblsK6c6i7hUP0cWaK-h6QzcXMJIV6KyFHI-EWIp6SmL50fhehYWOhEMy5F+EanCN0UVgAXFqcHhVwtcWSCQeRCtTp2MdEiK-F2Y4xVCUCW9lgl0ioseEuYX4Q080S9hbEuUXxLnFVS9eIQrtGCL0lwiy1qIuyXiLC515ApRYtCU+S0ZfksUhWIUUVK4ldShJRotThaKUu3-JpQtxaVZKDx7SsELQrqI9KapwsiJf0HRTlKHFtSvmDUsSUTK3FMwjxSyPY6kLcWviihUYsWWWkulT+VZYwvWUlL4wGQBQO+XsXJIRleylEV8uejJLCeDSnRVP3OVOjtOVyjoTcs6XmL7lMinORsojCLJLOMS35aos4AorJll3Txboq7EXLuOrShZQEo6XLLXad5R5bIueU+yLJOyg5aMv2XjK6lGKkwVixP76LLlhiiFYSqWWSKVlsKvpWNJzJBScZwy3ZRvDpV8KjlG4zEViuBXeLcVFoc-m0s5W3LoVXcXldXPhU8Shl1K+ld8qOGVKaVZ0RlcyNMEsqfFeK+ZWnUhXErzxRSphUe24lswPlnMFFfKTXjJR5svQLpnQBKD1KBFQK1kSCsyXgqTeN+e4UEpVWx5el6qildfS1XJI3V4BT1d6vnE-KRVvq7RWkq8U4rQVbXdlSbytXcqSVlit2QKMZk+1y6Ok4VQatFWprq16aqZYCKzUZK5lwa-xT5iJWFqbVYSu1QX3zSOrx6nytNWMvFX-L+egKzNdiubWecLVnJdtVyrMU8rbVTy+1ZjNgxUrB1da4dUksTFSD2xE6mVdmqDV5q21AKDtQuqLUPKrFxSldZUF6rrrnVQ6sVdurXGMifBKY6ZU2uaXTrW1iqudcqsXXdrl1vazGehXvUbgXVT6w5aOq3kZrUxn62Zd+uPW-rT1868NQBqjWlr4VH8wZUKu1VOKURCa8QNlITEvqkxMoxpfBrJ5p8Z1nZB-N4jzHnr8cwyMlXCopXLT3lxcvkIRuI25TaRaKtNUapOUmqWhrK81T+oJV-qoV6GtZeSpXUJggxaUh9Zusg0MqJVb69Bo2snVfrRe4my1Uqqk0Xq1VmGtjfEA6W3i8NKirdVBp3UpLx1cGrTQhp01IaJNKG-9YZqXWybgNgwDjVWPA2Pra1Oqv5TZoBV+r91Aa2VTmoVUuamseSvHDhUvUlqdp8K9wJkFiyca1F-mvVeirU3JiNNW4g9VOqc3edrl+m61fFqM1Ja2NDgM3OZo3WBbUVSiutYJqlWnKIeEWo9cVo5WSaytISirZIzY2PzHV6W-jcpoC0jrgtY60LfZoK3abqNum2da5oM1dqMNlWlde4H8AIjTNvmvkBBrG3Pqphr63LYwIjYiazV8q-FXpu62drytHm1jSupcAuBBVTqvzaNqy0Cact5G-1Wcva0trnNl2xbT1sKWAbPN2gwyDAPeUDqlN9Wqzapug1oCG1+W8LYet+2db81pW67b1tu18qbFZxN5UiqrXQ6VNhqj7Xuum1I7Ctc2v7Qtpi1nq0N7m4HXduA0uAqcbNZ7Ttsy18bGt9W5re+s00zbHNlO1HSepp2ob8lEa0lVep7Wg6lcmq3DXVvw16ruN90MChNpg0I7pV5O2bbP3m3lE5aDGunUxuEQsbsdZa8clUAjS1bOYSuqKdRRRG0D7OcO4wcauZWna5VYKqnf70KH5jhxMmxndLvFJYZJySIw4ZztRETD61mK1raT1T7a6PdHAr3Q8OJFGy-dMQ+JGZsD1Kyw9XggwQ7tV3w7I9wm5rgqLE1x6cuCewPo8Ml1Ab-d6eiMFEuqGl87daInnXlo13fbkdiGoXdksJFDinWWO6NSuoD116g9L-EPeKIOGV9SNu61JWTvb0U7Y9Xeg8T3u9196GdJu+FUPonKZ77dnPUPTvokF56ndQml3UXozHnaaN8emwRXqT1n119FKzffXuD277x9dIvfo7v+EtbC9N3RYQYsX3ftuRkIn3cboH3AawFW+qgY3r1X77JhleWzVNo-UOaqNC+ynhf2X2J7eRVekHanrAOP7R9z+gCg3pQHv73Fn+k-d-uL3n6ddl+sNdnxv3ds79g+nDeAcIPIioDzeknTPoQP86kDrA0va33L20GMDiW-rYwdZ24GJ96vF-dSPpFT64DsGrg5roF3IGXR-Bq-YIY2EraRDoBpg+Idf2JCm94elvcdswGmq3duav-XpzCGI9hOVc4zSutIoZ6ID+htg4YY4N2aFDc+rXbwYsOe61D7fIQ7YdW3AaHDw+7fWiJz2T6DtZG0nR4ba0d6itKB7vQAaJEBGZZKenYSEeYNP7JDBB7IzAY1KTb5DfOxQzwdyE+HqDXQ3vZ20wPpH-RlBHaLoekOQG997B4g8ctINMDT9omyg3wYX5+GuBGh33QweCMTUGjI+iQ5LIqrQGI9TKzo+QbP3u7yjZe-o+EKR5pHhj0u1hY0dFE1CXDvwto5Kt52I7PDSh7w4kaX3JGqjEQoYyAc2MzkxjYR8PREYP2yGQtRR443Efn1nGVDfRmg-4cGPAG7DwGrY+Mb0OsGWjrhg4+puMPNCujZ2xY+cf-1WG7B6x246npBOPHs9Pwk4W4fgPFGTjpR64UsdUN-GBjUIzQ-nzuOOrtjWe74QYf2OH6P9RxtvZ8a8NlHETlhgQ-8fJM3GgTVJ1BDSemPPH8jm5Qo+rqj1mCf9bK4k78cqMr7qjwhyk+ifuOOGWDY+3I3gZeNRHp97h-E6ydOPsmfjBQlY9Yb61KmdhGJpw+CakM7G39jJkg8yYlOmHItF2zkyaZRPZyNj6JitQ8atPqnaKExmY87rmPZCFj5hjk74dJOrGbDqJvk96diyCnwj2JoHlCaO0yChFBpokxGYqMCcUjAJmo16YtM+nVTeRhrbSZTP2n2jjpr-aGe6MImjTqwuU+gfzOKn7+dR9osWdCN+n8DAZsE7nteNimC9ZB2s-CfDMNn+xuZq42sc9NomizCZ0E00ecMQmGTA5tXUOZDNsi6zY5kIY2cnPynrjgJoI5sc7NZHNTkxtedMaMPpmZlhJ3-dmeWNRnTT-euM3OYFMLnbTS5m0+WZkPam5D4pms5udHNRakTXJsk0AYLOzn2zsDLs2qZ7NTHWjlZw463qdOu6XTF+h802ev2pGZzL5qCyecTNPHkzP52A28f-PDnALZh4C26cfMenk9hZvC-OcxN0m9jOJ1M59rC0EmY93xncxOYM55meTh5rQ8ecYvdmcjvZxc4YLYsxG9T0e7AYaZ4udC9zzZgSxBdwtwiWF+F989+eaNfnLzuJ94yydkvmC7z45xS3xanMxmcLR5+M2+aYtiiNTgZq8-aJvNcX5LKw3i2t34vgXWzZQhi7ZdEvnnWcelqS5wZkuSmKD9ZhS2gawstnAjQl1PdjNPOBnhTQZ4-RucDUo77zJJzC+oZUs+XgF5I9mv5dgtiX4LkJxC9CevOUbXLWZ0y9FdyveW4r5p9s4lYItYn6TrFiq2mecvVW5LtVqK5cf3PTm6LkF9SzmgdkwXSzKVpyxRsQM1WTLA15E5XvyuJTCrrVrS0KaIt2nVz+e2YydrhOUXXTkZnK9ycauxnrLOw9a3Zd2PLnOrO1o-R0f2vzGtzVF460pZit5WmrbZsawFFgFtXmLt1is-daZPIWALGVzvVldlPvWGrq+ik99bWsTWkrfZuCxeYQvA2HToN8i+DYSN1XBryls61ZfiuXXEb-1+y+JY-OSWur7F2ffqdvPSnIbxpmi8ta+u+WfrRV3ZqTZuu6W0bv50i+uaesjnDr6F7K9DdOuw3eTF1lqyTY2tJmOrQN3m4Ob2smHULHWhm7ufMtDXLLI1tS2tZq0lmzzZZ4K1TeksfGjLUpkvTKcZsnWwL4twS81bZuxrJrBt6a-pbIvpWftEN3G0tboMM8db44nNHradvJWtrRB426FdNvhWwzr1nMxrfxu23VLkth24HaRsSX-TZVlcwrbXNK3YTz1oC0dZjueWLLZp+G-7eiIc2ZbhFuW8RYKNZ3gzAtii2haoMYXRbNthUyzYKul2awydzmzpYcvI2tTJFxW3XeVsHXG7vRq2y3ejPF3WbutsQxXfassX5bg92u2lfrvY3Bdatjy1Lzjtt3zrRNlq93fnsA3ub5V9G1Wcxvu34jG9r26BanvPnE7s94q1NZDuU2z7SFmE3KKvvKHFrt9p82vtGuP3y7113u+Te0uh237lVnq3Nb6sLX3LZlwu5rensd3lMOzX0yVcCvoPUrj1ke7naFtN2Rbsdj6wTe1sP3O7qD-W8HarvbXM7u14ezncFtj3Lb6thBzvYPMJ397bN8h0Hf7sYPSzM1r7bTfmv02b77p5m3vftuFWuHKdim2ndRun2aHD16s1jY9s42f7ojn2yH1IcoPXlT952y-f7MKOQbH9jM3TYtub34H29oh-HZWswy0SUjnu5+b7up3Ijy92h6vZwcMPVbIjpmxo-ikAOyHOjoBwFcNs83XHiji+2vZUfX21HPj7CyQ44eSPAnaD5+1Q-AeGOMbxjlyzA+EcxPrbd9-+37cpxqtuHzj0q3I4zthOjHVV6B8ZZydwP6rYt3e4TYked2GWyTvR6k9fvpPz7mT3q7U7MfeO8nf9uGzPdafFPpHYD60045kcuOa7bj7B-Q4btePcnk94ZxLYSdjOc2JTmZ2U6CuhO5n4T3pzU-Ns9GmHW9kAaw+Gu37-HRTrZxM82udODHlTjJ9U+4NCOBnKzwhzDaafxOWntz6k0fbJvp27r3T9+685KPvPTn5jhp63bYc2OipOZcZw46megOjbED7q7NbefZOPn9TvG1Y5+fXPCnilJF4C65vTPJnTzg51U6gdYv+nULwZ6s9ouEutHxLu58i9kd7P5Hzznp+C84vYv6Xnzlh-i7hft3VrmzgF8A8ceov9noplews8-tfG3LlCmF-k5GfIPiXGPdlyjc5cVOqXLzmlxC-5eRXcX3tuJ8y42dFPNXpLkB8C6Xt6ueXBrvl3S+NfKu8X3zkV+I5LuWuRLmDl2yFd1MR3nTyzk17-aZf0GbnGrn1yk8XvV3ZX8zpR5fcVf9WQ36js1+G6JeIurXkrlF7a9je1U5XCbyJ1-e4spvYnsVz16M+9e6PKHMb6h9y7BeOvBHRr7c6W6GdhvfbLLnMnEK1e7PMH-Dji02+dctvXXpr8t8069eKVu31rqV7m7rf2uG3mLw10O+jvN2vnjTj1+O8reTvNtPb3hwbf7c02zbEV4d0YpVdrO7bE7rtzu+nc5vynIL+t5A8XdOuTnLr0926-XdXP03nb3vte+zccu+3rt-mx46WeZWGXa72F5+47cWvt3f1m9-+74eAfs7Crtk8m5HehuxHm79V1e9g9-vtXAH-13icDcq3QPgryx+68g+aPoPtiue7h97cIeCPBllC6PeDdofU3Y7355e7Hp2Ld3ITrl-O8fcCOj3Ud-O6u6Ffketb5rv54pQHXtOa3gNvNykwLcRPgP697+628ZcYeOPW76j9W54e8fdXcbw57y8HcvuT34I99xB4k9fuqPXHmj8E79dh2A3hlyOy9ZE8EOxPH7qz1B6k86egnvr-R7M8M-Uun3Jn49yu-c9kfPPSDsV5Thk8UO9PDn9F9TdiNCfXPwtqG+B9VfrOfPY9LWrJ4S8BeB7-HjF4J5c9530vE9zL+e-Yc5eomTLfL6U73eOXEPdD5D5mdgesey3n1it1h9y-vKePiX0FwJ4Hepfyv+DjLx58s-RfbHfX3T41-0-3vivyXsK0G5I-qeqv7byj7V+qZ5f4v83wbw+5K8jeyveD8e8w8i9Tf77Nnur7t+2cUu8P9Hxz4R+c+rfPbpHi58K4o9+OM3s3vz9G-k9zugv+rkL6N9O9nOLHH38T9N4Re-eGvOzpr3p4PcpeTvjD6FxZ6y8XvtPsPvb-D4W92ugfDrkHyj5Y9vvR33XzDzF+k+3f7nst2t2k8O-LeiPzHtb517beafJPnHqJvXrh-3e6P+7lr+48WeqeS3rPjT74+2nXeCq3PnH7z4R-zekfK34j29-W+TeMfNXzn1L8nI8+HndPrpwz5NsvelfqjlXxd7V-wv+l45aX3d518A-6fS3g30x9weo+wPqv6r+b-5WW+tfMvm3yfYM-5v43ynoX1E7U+i+Nv7P6z9t-pZW+afld3X5S4J8LvSvr3436H9d+bfvv37qJnmT+8dO4-gX-30Z8beg-nf73nkex459Y+s-LknP3J99+LeE-w3w98T5Z+k-0P4vi6TD6r9Rvc-tvvX-b-DuG-mfyv1P6b7d+iuZvXfub7j4O-9+nPjvzxy3-M9k-iHFf3r5P5r8FfHn+fxTwH6Oe0vTP4Xib6P-T8S-I-6qbP9r9p+9-4-Bf4L0n6N-ROTfkPqL1d7P+lLtJl-2P9f+39pDCf9-ofyn6t+bHuT5aea-gVRlKG-vt6FeIprf7A+--k74k+S-m35pu3nhr70sEAZ-4L23-kV4N+R3k37J+j-iP7P+l3gU6Z+4AR-7e+V-nX74+sAX-7HeBASH5ABXXiv4R+aAef4UB1vlQHkuaLkN54ByPgwEi+TAWz7t+tsh75Z+HATH5YB1AQp6-+ifvQEP+jAUgHABLAagGV+5ATh72e0AVg6FuKnsH6CBSgcwHWO4-p37qBU-rL54+MgeuKN+-AQoH6BXIsv5GBPXpT45kGAZQFf+0gYD60BcgfgG2BSrkIFi+KAVt5sB7-hoH+eW-jgFeB1gYr4ABhAf4Fh+IgdYqm64gaEH-eHgXb64BjPoP4IBi-vYHIB5fqwFqB9LD-hmBPvtwEyukQXwHRB2QcP5xBafuH6qBYAUUFaokAdP5aBCvkz7VBgAQYHCBgQRn6S+TQXZ5hBefhEE7+hfkT4CBfgd0EBB+QQ0HOB45MUEtB5gTP4ZBDvmDZ6BkwbkHKBjgRT4T+BVAsGYBx9mUF8eKwQP7z+IHjUFTB8Qb0Gn+wQd-jNBBwUC53uNAaMF3+8gTEGKBmwYYEEuBQY0Hqo+wW4FSBRwX74vBcAW8GdBsQZcF1BCQderAaGqPcEAhhwdK7HBFQZkFnBwvhsGoG6PmP5OBuwQMElBXAUiHAhsgVEEdBC-hcGfBPQTMFBBhQeqivK-XnB4Pe-Pgx5u2Rbkm4detQcf71B1Ib8H4QdIfiHuBQIfX4ohqwco7FuGIUkYOB3wbMG4htIW8r8hgIYSFChIIXQE+B7wXYGYhkoRu6gBcwVEx8hiwaUGKhzwcSGVBpIecFdBFIdMEgBq-jqEFUeoQ8FkuhoZYGHaqIWsFihqHhyHEBZvsYEW+uoXKH6hBIbO7pBwoacGuhbIXU5EBZflaE-BNofSzHiErpoHhBMAcqHeBNgWqHihFxpqFfeNwTSG8hsupIGIhgYX34nBc-qGEoe7IZCGch0IVLqp6joHmEDebQQL7yuJjpC6vuFYZ6HYhOwSYGxhdYQyF8+zXsyFAeQfm6HlhFoVcFUhfQW-4vKPYbR5y+uPu0FZBZIeaEaheQVGHShXYbSHThCYcMFJhxoS6GihYYTi4RhgBtsHahMobmHxhQwdgE7hVgSaELhZoRCGjhUIdcEd+PobaGbhl4WkFFhwYSWH7hZYeGEehkYSoHchMYeqiIq8oQWFPBTodEYhhv4e17-hbYYBEnh1oWeEBSD+PaE2ukEZ4HJhJIXeHoh7oQhHHhUocBEoRCKmhEIhjwTq5Khu4SKGJuf4YeEARhEVqHIR64fhBgR-oQKGOhWEdREwRtEXBH0RBEV5ZIR0YSRFnyZEZwEcRhYTf7YRt4WiHrB+EY+GVhz4aIE46UTGxHoRM7phFBh0kXuG8RpjgK5P+iEUREThtwaRHd+tfoKFGhN4TpGshdEfpFHhgkUZHZhPIahFmRm-tuHaBgfm156RrYQpHthJ-i+FiBBVIFIpBPfp+FSR3ET+G6RLYWZ6+RhkUxHCRLEQFJPa9YYmEeRe-ku4H+bnkf5+RXIcZE5hSUSFHmRnEVpERRz3rJHDh8EbFGMRWYQFEqRQUclG9hs4eYHzh5UQeF2RDEQ5HxRa4a+H0swUeBEUR+Hk96MepYXxHtRAkUXav+JkWfINRM4RYFcRVkTRE2Ro0T5HLhWwY5G1RSQfVGFRbkVeFpRxnsX6IBVUZ1E1RykZtH0s5uoMGpBFkVBE6mZUSNHeRMUatFfBXUcRGJREYBdH9RDoZJE-+C0TxFLRD0Yf6VeT4eOFORIEfhAfR7EQqHfRIwaVHDRsEQDFZRQMYpEgxG0fCrxAEMepG3ulEZZHOhi0boEVR-EUdETRpAf0HqoGMeRFfRmkV+HaReMUOFtRK0RKErhQEXlHOR70RboUxGEdjE3Rf5oOFeR0UYDHneOUVWHV6NYeTHiRUMVTHhRv0ZFH-R-MYjGCxcUSdGJBaMWLH5hA0Y95JetMXzHNuAsec6KxXnq9E9RZMezHixEEVzHzRuMX9H4x9MY9GMxa0S9EsxYMfGCqxKUe5EtR90XLEVeCsdVEGxjsSJFRA9IbNHLB34XdHwxnseN5IxQsUpHKxFKsTCBxW4btHuxYcTrHyxesT7HQ+RsfhABxn0ZzGDRmsVbF0xtkQzEZhTMUJHdRgUfSzZxkMWbF5xvAdZHWxRcbbElx9sUrEwh0unHE5xGkebElR0saHFRRKcV7Fpxx0b7Ggx-sXeocxXcbXH6+BcdrHLuqcRD76xGcRXETi48abHqxTIUNEshDcctFNxIFi3EjxqMbHFVxmMfB4bx+cTLHbxCMYPELx6cZNH5RVkPHEfh10RbHQRF8YXE7xusTfHDxS8XVGVxq8WrGUx3cdTGwxW8e-FXxEcd7Hfxd8azEdx1cevH9hm8bzHNhA8RAlDxxMWq5OxD8Z3FYxU8bP59xssSglneaCYg7QJmCbAknxjIQgnnx+CZfHhxRCV-HoJ2XlNHHxE8TgkaxdcVrHIJc8dfFnu-kadFoxLCWvGAJuCcWE0JYCXQng+vCblGjxb0eQmsJp8VQkcJM8VwmZRPCViF8JMcXJqCJACbnHsJ08W-GzxqiagkMJJCSTGThWCXAnCJeiXglwx-cdwnGJUicLFYGOwnIlCJuiWfFKJBiSolhe88Y4nRxbcTWHaJrsYnGNhOgeImEJkieonSJh8Von-xwSWFE-RlsV4lZO9ifQl+JKMfwlHxcSY1FzRPcUkliJhiT4lqJmYQfGZJsSY-FXRxUcAm9xtiQQmpJkSSUk-xZ0SvEVJoUc-F5Jr8QUneJwnsUmlx60WUmwhQSTknBxNMcokpJRiWklRJTibUZs2riTomTx1iaIm1JtCRElo+jSaQljxrSUVHQx14fknLJ4SfUlrJfSQ7EyJmcUIhbJO0QkkwxNSaAmFJPSQ4lTJ-idWEuJQyUHENhA4Uh7dJaXg8nrJZicwnZJbyalFJxdiRMkNJxya3HPJ7ZnMnxJ7SdUl7JtyV8ljekyb8kYJmydgkKJiPqEmeRiKWD5HJ+8U0kCJAKQnFXJuyZ0n7Jdyd8nIp4KaUmaJgyUSlPxVSVLHwpSCeMlFJPydSkEpWSRclQBQKVinpRz7mylUp+KRsmyJrycSmwpTKWSkIprKfclCpz0RCkixLyfSmVJOyXtFF+zfuSFPRlIauGGxy8VnHKpbSYymJJUqSyl9OoKXinypNKQElKp3Ka0G8pHya144pJfgZG3xfyffHyaF4SqmSxxqbdHkpTqYdFaploczGnJeqRNAKabiQskeJ+iV0kyplKWCnCpbqTAkRA4afMlsJUaTYnSpZqYKnxplqZylaJKaTClGp1ycymfJsaUik5p2qcGkxJgyQWnDJ7yYgmlpWabKkVpQaWXG6pv8ROK1pgKW7F8p+0RqlLhdsbmkipZyWBBdp4qUWmkpvqZmnHO2aRamVpbaX7GipY6QymqpwKXUnmpLvsjE6pi6SOkep6KZQmYpDqYL4Up5aXOmtp-SbSntxyaZ6mGpq6b2nqpEwfJGBpY4dukhpHaVnHLpXqUAmSpU6aakzpzaWekvpVaQMlXpn6benepxaSamNp-6XGmAZwMa+nVpoGTenbJEGZOk8x0Gfv6zpm6VHEZJl6YElgZKGd+k+p6GY6llpuKdhmLxw6aGmjpyGZckSpxGXzYYZGUVhml+rqailLptGTyk9pR6U2FkZzqfZGMJmPkmkEZdGROlqp4wb4FPpg6fOkXp1qVCnXp+6X2GHpDaaRlNpsGRRlsZTCe6kKZlie4mKJ0aX6l8ZAadJnnpJyYhn4ZnGXancZKmcen+pOQc+nwZwGXhkvJImVxkhJPGWEknp5GaxlQJiaWQk6ZFCUpny+96RJlphUmc3FDpfmf7GuZVme5k2ZvGWpmnpGmb5nsZu6QFnyJB6cFkeZ2KUZn2ZJmUBkLpb6c0kfplmUsH1p1CYZmJZ3mS6kpZWmcJmlZBoXenZZ-KaF4AZyWYJnq+2mTFllZ9qfFmeZdmZqn5ZjmYVnmZLmQ1kBhqGeJnwBi4Q+EOZW6U5lyZsyelkRpaafpkZpf6ZhltZPmR1nu+76WGnjZEkZNlrpKyYcntZpialnUZe6bpmRpa2UsnTpm2epnbZ52XVn+Z3WY1lHZIWdNn3hHwXNk4ZCGSBkWZimU1E8BBmfdnMZW2TVk7Z3oZdnLZqaRilZZfWTllVZ-GR1FQ5OIRxmuS4GURmQZv6UxkCpEOQJnPZQma9n9qIoj1nWZFWWDn45j2ZDlE5nWfVmY5hGSIkhxlWTBlJZT2Zc5WpkKUtkppnwrFkkpU2WCEzZP2UNnzZI2QDljZjOaJlNZiOS1kHReWRFkyZZmRLnyZvOWTnvZ2OWhmMZqmWznVZhOZzl5pNaaTkq85OXFmU5G2eDk05+uZ95c5iqarnG546TLnm5eOa1lW5qOXTm7ZxWftlS5bmQLnHZByRukc5NuYblIZPufzn0ZOOSRm2ZuWYNmK5pmQqnOJ9uWHmm5fuZ9lC532eqGi5f2Qtnc5hVldm8S4eWJn+5XmSjnjRHudDl7ZNGcnka5zOaMnJJyOcZlx5BWbJm55rTrDl85KeRHla5Q9tHkN5CuXvGRZF2ZXn55zUoXlO5niTGl95seQPlK5CeTMl557eerkTZmuYLmqh4ISLlN5w2S3l25POQ7krpH2c1l9pj6SOG-ZlGVFkY5VQl+m15ICRbnU57ObTkG5VGcPmL5JuTXmLJLOVTmu59+dblQ+T+V7lV5l+VjnX5Nybflf5eue7mP55+Wllq5r+cvnAFJaTrkPZ3+RAXB5f+QIkwFjuQfmy5R+ZJkn5WeWflD5-+SPmIiQBe-l15k+brml5RMeXno50BXvlX5ZBTfku58udPnUWs+bbmJ5u+dXlwFjBSAXMF-abNn4FmmcTnRZ9BaQXppd2aAUsFA6Zvli52+ZwUL5GBfvkr5xeQNkyFM+fHkcF8+W3lKFDBRIUf5UhQIUb5Ghc3nK5zmUnmAFTObwUIFveZQWN5JhVvlmFi2YoViFVhfoXkFrOUgXgFZeZAWEF6Ba4XS5WBc7mIFlucgU+FqBVAUw5uheIW3ZBhfwXH5lUafnCF9OSTncFh2SoVp5a+cLmZ5shdnni55hVwWWFgRRkWH5D6bgWJFQhbVkiFF+QXmd5ReZkWph6+TkUOFchU4Wt5lOC-mYFJRdgVlFYWXgW5FBBS9miFaRRLHdFwRbYVeFVBUkVVFKRcMVFFvuV3mr5jRdkXphLRXkXyF2hR0XRFbhbEUeFn+dIWCFAxckWe5-hSMU1x1hVBkhFd+d4XUFvhUMU1Fo+XUXj5oOYYUJFhMdMVo5nYXQVnF8CcpnjFCWXYX95bBZoUh5gOfMVj5QRRPmeFoRTcUfFNBV8VRFARQsX1FpRaFlNFqxcCWmFc+fRaFFtRW-nuFTBVcVgFUxZUWfFp4Q8UkFOxX8VQl+xUYXNFmJY4XYlEbgKrbFxRfAWXFExTCUklRxTMUnFR8ayXIlzxetnxF5Re8Wkl8JeSXfF4JU8WQlLxSKV9FFRTyVklzEVKV4lPBQSV8FRJQcXGFDJa0VMlP3lEydFyheyW45WpXSUYlb1liVaFOJS4U-FViRqU2FAJZMX2FupesVtFO+baXSl+JbsWElnJdcXclaxYMXVFqpY8Xel1JXKVmlbxWNG3FERX4VsarMGVLGlFxaaV+lxJS6WWljJdaXMlbRMrhbKXpeqU+lmpamXal9JRmV6lWZQaVTwuZYmV6FhZY6X9ZMeeoWulQZbMVvR1ZXaV6Z4ZcKWRlopdGVwldxcGXUZ7ZfmXpFJpVHlOlXJemUF25ZaCU7Cw5WqWjlyZeOUNlU+U2VllbpfqVkB8iPOWhlBZV2WSF8peiXhZgZccUV5-+TuWUlbJUuXa5xZeaXHlzZaeW0FQ5QmUdlN2fuVxFPZQqVilSpRKUqlz5XmULloxWOU3lE5f6VTlonjOVoF8ZQBW7li5Q6UcloFWmVAl65S2V8la2i+UjlQFdeU95iFSWUWl05RuUVlW5XEgXl8QjEXvlexa8W9lxcSeW8lZ5cloYVgFecXwVKZbhV3l-RbRXKlCUSOmkVHeWGUI5-xSuWAlrBShWPlCJZXm8VS+XBV1lCFUJXOlyFQRWoV9FdBU1l5FQJU0lVFV+V9l4pQOWtlPFYxWwVWFSxXLlSOcJVrlilWJWSl-5apVUl6lRGW3lUZTRUPldFU+USVBlZeWClspd2UOV1FbvHOVXFeXFuVMFR5UQlYxRpWHlKxfeWiVLleJXnl7lWRW2Vc4Q0VVBkVRxX+Vv5dxXWVr5atkUVvpWxWOVfldFUBV7aXFXBVCVVeXGVIFXJWTlClRBWEVs5e2aSVsBdJW5VRZflW+Vn8ekn-ZBRYVZNVXRcBU4V1VWBW1VEXvVVQVa2qZqUizVUZUyVrFUNVIVIlRZUxVVlRJWTV2VfDlJVqJV9l4RaVUVUZVgVeeVrVmFcxWzVJlXLnsVipZxX7VJVclpHVTFb8V2V3le1VaVTlXtW6VaFV5p3VhlSdWtV9ZaZXyVi1XVVKVrlYdW165VZ5VhV9lc9VHlu1UtXFVO6UOVfVIVTKWQ1T1fNV4VUVXDXXVCNatVg1fFXuWPVB5Z+Uw1l1elXvVylRNV41UlTNW-Vslf9U1VgNaNXA1sVbdVU101T9WE1H5T5UvVhVVjXk1INbdVMG+NS1Wc1lFRFUZ5+FUDWWVf5atVC11NRzWbVPRWiWpVpNW9Wxl9xTxVnyrOsLU01otXlXo1F1d+VXV-NSzUmactezUPVitYJX01w1YzXZRzNStWHV5tf1XYVSnudUFVnVY8m4ZzhZ3bBwztUmWVVg1TbULV5lVLXLVMtU7Xa18tZbXNRyVaaE7VqtXzXq1g5bLVR1FtfaWnVVVcHUY1sNWHXw1RWYLVp1LtYHVu1OBTzWe1KKRrVDlWKBDrR1GdbTVzV2dYbXaVP5SbWO1yWjXXrVmWVbXhVxNSrVG1ZNcnV6V1daMbfVMdSDlo1TdR7W+JXtd1U+114p3XHV49eUFi1fdRLWY1eddjUF1bGovX3V9dXrVtVBtdPW9JCaXGVrau9WPX71PdVDVH1HVTPWV1KdeeUX1yNfxXX1k9e7V31J9YPlV1Elc-Xg1oVQNWl1vRSTUD1atb-mRFv9aPUv1BNW-VE13NSA0t1xtUPUfV0ut5pd1QWbA1c10Nf3WINg9eA1n1Xmn-U61CtbHVbV6eQnWgNSdfg0-1T9VA3-1KNYA27+ZdQg2vVVDS-4QNtDbXXp1nZQfV-VH9eXX31HKeNWENdDcQ3L1yIavXwNODaw2b1bdRHUd1ojXXU8NmDZI3YN69bnVM10tZlWQNXDcXWZ1Qdfw0sNvNbI3INFNV5puASJQA2u1TDcA3SNxjZo3h12jeeUWN6DcDkr1+tVPWf17KafU0NyWi41L1V9aQ1K121XJEaN9tVo0HVfjSqbQNItSo0eNhjXY0V1QjRw1RNljQw3WNYwSE0ExuDWA3sNBDag3+Ne9co1BN1tQk3qNidSY3UNj9ak2uNuSXCl01ZTRQ05NbDSQH5NqeilonmYjYE0T1cDWo1NNMjQ4351o2Y1WpatTSMnxNzDYk2CNPjdU1saozQE3FNPTVg231AjV-XsFDVWzYdNNlRVX6NQDcrXlNlDZU15NvjXM2dNSjW+W8NDTZM0HNzTUc2tNJzWtrzNRTRc1xNh9Z42rN3jd-WzNjzWc3cNLzSU291UjTc0DN4TY42RNpzds0Q1jDZk3kNoTRU2DNW9cM2bNTzZfWLN7jW82NNcLYc0ItcjU41+NvzXo0N1Z1dc39N9jaC1DNKuci0EtAdbs02N+zaS1JNMzcPUSVrgFNWEtlzY3WYt2TSC2RxDtfI1VaiNl01otEjRM22NwLWS28tETTdUCtbLTS1EtWdVy02xjLV83Mt55ay1jN5WYC19NWLbc04tpjQLUytGrb1mlNJLTq08tkCRS09Vvteq0LN-zUs2qNKzUY3Kt6zcI2oNNrc805VHLcS1itDLdM0qtKDe03utqLXa3otfDaa3ctErRa2ItlLb1VBtMTbrWvNYbT61mtkbcQm4t4LWtpxt9Da-UAtN9e81OtfrS60pNhrba2etibVc3JtEbc60glrrYG2Ct5zWW25t79eG1KthbTW3FtmbfW1-Njbfa2it9LSm3VtVpRs2xtXbey3ltnLS22Nxg7ZmXDt1rcnZCtIbSK0Ytk7R-FttQ7bW1zl1WkXVytXrQq0rt4CXKlFtbTZu3ztDbRtVNtvTY61TNaze23HtjVVu1GtFOVq1Xt4rdO2QVHbV5oPtpbee29ty7ZW2ttN7eu0ftqDe+C6NO7eO3et-bVW1rtM7Ru2NVoHY+1m5z7fm3XtnzUe0PNXmgh3ft3dRe3LNKHa+0wd77Xe2bNWHR60-tobRW1QdAHWh23tGHSB1JOwbT20UdE7f+1TthHWNXAd7TaR2Md5HUu1JtVHWx2AdsHZx1zl3HfG0kNv7fx1ZN1HYe20d3zZh0Md4neI1Ehf7QJ2rtQnUR10dXHYp3ZtMDbh0Ot+Hb60adHHcR29VYnbp2xN+nX23SdgnTR1Adpnb7XmdC7Ux18dlHTZ3qddncJ0Od14k51ntOHZJ1udsLdB3GdfLXi1savnd228dKnVJ1BdMnS2n2dWnaJ06dznVF1URqne50Ht8XV52JdjVYNqIdqeWQ1ZFBHSF1StONeeV5d2HRg1Wd6XbF22dsnQl3ydqDRV1kd-ncx2QdGXRIlwZmnY13tNzXTx2tdrnSx1qdmXV10mdOXZs19dSnd01tde7ax0ed9Xdl09dc5ZN0WdCbdV0xdRXUZ2ed3Xaq3JaK3Sl0Dd0XYF2bdA7ex2hdGbV5r7dfnVV0BdQ3R12rJZ2em3Sta2ld2Rdh3Wl0bdyxcV3bdY3Ut25ddzgd03dM3QY37tnXY936tptS90A913W42Dd7XbV3zdWXTt0Bty3dD1vdQPXD2zdw3WD1B5VTbt0DaaPWO3rdx3V91bdC3cj1mNTXYT3gdxPXd0I9I3eD149KPf91pNObbd3w9J3cF0-d53c92Xd1PbWXytIPXN0M9uPcc1-dmzRtqytAvbu1C92PQ92i99zeL29Vkvfl2LFqhY2WHFSDUz2U97TSr2VdsPUd109nPXF2jdPPWV3JaevS10Y9hvRz2k9p3SV1gtvPag2W9-Xdb0fdJPSlXfd5Pb9349a2i71TdwrTb1Y993adkK9XoQa1+9m2oD0G97vUb129XPd71m929ZH1S9alRB3B99PTj0P5EPe3Vsa-vat0SdwPXs0h9gedn3a9EfV5r590fXU0-ptvZ71k9SPT73M9EvVH0w9NfQxmy9JfSxll9Yvb72V9rfej0x9OMR73x19vdz2ldyff32p9iVbT119o-Qn2N9SfUi3K9A-UT3s9Gfcb11di-RP3L9vtVX1t94zTV2b9iPab079MbXv2r9NPev2d9mffL099ivX32oNVQHYrV9h-Z9319Y-Yn1n9VrdeLP927dL3p9N-cf0i99-eH2Q9Xmn-2q9KJcE239ofaAMdhufWtqQD+ve32R5G-fH0m9jPb33N9vVcgNW9Q-dzHoDH-Qv2n9jveb1saeA670EDL8XH3EDmA2H0ID-LUgMv9B-Zq15tirVv2kDlrfPXhEKUv-1p9s-UQPz99A-AMaJPA2iR8DUA0KWXthnZ-3b9ZA5P1P9LA4P2oD3ecX2wDpfT-nYDOvXOWUDAfYu1B9QAxgOcDWAw-04DvtXoMF9ynbH1z9uEXINcD0bT-28Dlg6-1sDzbcL1Z9Wg2YM6DjVS4OsDxrch0cDJ-aYNgDiAxAPKDa-UX10tXfQTkoF5feANKD-AzP3X96g8AOeDcQ9oMV9iQ1INeVMg0EMgDXg6ENMD4Q0kM7NgvakPGDwQwwNiD7Rc4MRDV-VEMwtaQ3f2FDjA2F3MDpQ1C0ZNrwc0NwDrQzUMelFg-UMADgg0YN0DJg9UPRJ5-b-3DDAgykPRDGg9339DUw04MSDfgyoNv9I-XYMkDIQ20MXd2QygObDtA8IMTDogysPiDOZesORDmPWMMnDVQ2cPTJNpUMOdDVjSXULDvQ5oMZD3g1kPtNVww0M3DFQ+MP3Dyw48PZlr5JIOHDbg3kOg9LQ18NFD7QyUM5DqNdCMeDsI+EXxDYQwcP4Dqg0sVAjBQ3CN7DTvb8OzDyQ40M9DlQ-iPojmQwkPEjLw+k1vDTQxSPpDVI98M0jugySNlDMvYCN3DlIzGUYjxQ1iMZZbvcP3HD2wyIMgjTyYMMzDl0XMNkjoIR8NLDBIwMMKFzw0Dk4j6vauWa9eDdSOYjtI2qNHDtg61GnDEo97W1Daw9x51pAQ+wMwjfQ0qPnDZo5cMWj3aUh3WjqI7aMsj8I-sN6j12S52GD3I2KPGjdo6COVl25ZYOFp0g3h35DzI3yM6jAo96OBZ1Ax0mijRo8CNBjkoyqPSj+o1CORjNo58MejhI+QMdDWY1aPuDcve6MxjrI7qPsjMo6SMAj7w0yNojFY56NEj1Y8WNPtro2WN5jTYwWOKD8Y0KOJj9TcmMexjY-2U59cY62M+jqXSKOGjw4+WOjj-IwiOCjK2VOOEDtwwGOpj+Y8qObFdQzWOcjgA-6MpjvI-OOxji432PLj73dONCD640eM6VY46eMTjCY+qNx1149GPHjlY+OO+DTo9cN+j9Y3iOvjt4wuNejD4-2NPjhXQ2NzjAEyeNATn47uNdDDI+SN-jI45BPvj94zBNtjLo6WMxDbuZuP2jUozuPoTBXTAMKjsQzhPBjxFRpJhjlo+2OYTiwyRPdjW408OZjk4xeOrjB47ONdjb482OFjiI8xPCjrE7+M8j-463V3j0E5s2UTzo4RMmtboxxPITXE72PAT543xM0DM48nEQTwk4BMtjaE7xMDjtfVeOHjQk1r1QTmk2JNfj-wz+OMjiE2pOGTKE6JO4DpkyMPzDFk4JNIT6k0ZPcTS43DksTyk3pPsTio6RPpj24+aOwTrw7S1OTL4y5PWTck7v1MTj4waM+TqkzJOuTNk8ZN2TwU-SOhTCE85NWT2o8lPuTZ455NKTSYypMgpfk-RO4TGY-hPaToE0RPgTiU5FM9j0U5VOxT2YwZ1RjEUzlNRT0w01MgTcU2uP6T7U7k25T8k1pPNTJYyiOdjpU5xMNTXU2sPU+4Y7kM5j0k5NOyT006sOXDc01RMYT401hNhFZU2ROkxFExtMSTavc+P9T2U4NOdTa0+CMtgtqelPlDAk+FPnTLTZdMXD100dPfjNg-FMlTdE1NMMTYI1WU3TBEydNgTlk3VMdTq069MAz702ZOfTfU75M-TK039MhjJFYDNVTvU2xMJTy00lMvTDo29O3TbPXKMqhtU1jP1TSM+RMWwqM6NPUT207RPYTe0wFOMTzg9DMOThMymGgzJM+DNkzB0xTPMzso3WNhTZ02DMXTEM7jNVlEQF76KTOkx30Yz303TO-T5U4FM5l4swdlrdjk5lOPTQs89MizeExIPKzQM9ANSTE0wjPYz2sxVO6zEswVNSzaA3DOYzxs6TMKzjM+bMqzhffzPqzgsxzPCzXM+YnuAes2jMtT1nbTO7T8s-tPezvs1TNbTi00bNyziMw7P-T25WHM9T-s0f3Ezds5zOxzyMxpIJzks9VOGzO07CUxzIcyZE+zFs-NPIjkc3nMBlac4XP3xxc87PWDl4zbOyzQcwXMMzccyRVZzlsznOBDuYx7NazXs0XMdzpc9C1uz8M9HMmz-czXODzm05JPdzS06nOez6c+TPfwU88dMGzs81HPNz484vPczy8yXPTzwMzVPsz8833Pbzoc3vOrzEY61M9zx83c04zOs0rPnzH0w3Myz66b3O3zps4rPgjK80-P8TAs6PObz9s9XOsxtc-rOXzAc8RNjzgC63MZzFsN-Mwzz8w9PuzN83q0aTeU3OVwLLM67PyjKc5AtVz0C0vMgLfs2NPlzgc-nNbzQC5gmEL4czPMdjFc+BUoLbk8NObNGC3zPmTI87bO4LC8xQskRVC4nPELV83POcLJ89wttlLC7WNsL2C0fNCL78xPPALYi3uOjDL8ydmazMi6fMmRzkq5FwTGU5ItZTKiwwtDTjU2iQaLoCwtMCLG82QtQLpo-fOvkxi0QvUzJCxAsALeC1YtmzuOtX7ULB87nOkLlc1wv4LO87YseLa87QveL9C+S2ODkM-IgBLfC-YtmLdCyNVhLT3WgvtmUS9nPoziC--MWLzi3PWizkS3jomLZc7EshL8S5K0KDhi24uaLIU-dN-zHC04u+LLi5-NTwKS53NpL1S03OZLdS9kvWLjS3kt2LEc4UuOL7S8It+L5iU0tDz3Qzosazb8-ot3zrizYs9LgS2AvJzUi7UtDL9S47PlL+S8PMTLSC9IvTLH8+stzL7i9Et9L4CzgsrLqiyIsjpoy-vNBLNEwMs+Lqy50uzL3S0cupLSc+-26LUywksiTKU53bXLF86YunLyy4MsXLwy+ovzLxyzQt3LZyyCt7Lsi5gn-LP895ONzr88gvfLqC0wuFWiK-Au-z7C20sPLoK2sttz1YNiuYLEi0TPArBK3CtqL98aSusLsM0osB5XyyUvcDOS3Eh0r4iwyvpLNS7CvorjC2UuHLFS3dNcj3K-iuhLLK+EtsrJKxCtvL-C0CufLaKxKuJLmK38syrzS+8tbDOy+cvUrly9RkcrCi2rPbLGS1St8rBizNMbLvS1Cs0z9y+KtRtyqwKsvLQqwTNYLFKwqu7LpqzMsNLuS68vqrcq0stur2qx6v7LxK4ZBqrYy-BNGrPKyatKrPy0kts2+q1otVLeK6ivurMaxisOr3q06t6dhq66uTLiq3auxrKq6WJhrNy4ssfLea6msFr6a+auCrmy+Mu5rWq7ytpr-KzWvdLEgeGvaLDa8au2rabYWsZr7KwoDtrpa4Cv+rFa4GvNrZq1dNtr20YmsirrSymvjrVay2tTruS0OsArBS-KtjrTa0uuTrESwOtrrSK0VNfTC69uu9r1ayuv7rM65Utzrya8ovMrO656sHL063WsRrXa1Gs9rJifautrq61evCr+46Ksnr0aw+vBrMCy3CDrv686vkrbMwGunrn632vfrl6y+udr0G1utAbZ68ut7r0qwes4ryK4ysl5H611U55XSz+tIbSa5GtirxS8BvwrJEW4DYbZK1yvzrd6-mvobu61KuhrdG-SsILjG0yvMbcG+euYb7GxBvZrrMzhGNraG3xsYbbG2BscbnK1xu3rPG5Wssbj6yGvSbQm5Z05rKG2JsEbs9URvPLJG5aueL683Et21E68pugbtG2puqzImzJHdrlG0psgbS8xZukbN6+RuAb2mw-WP9qek5sGbty9aswr4m4Rv5FAm6pvOb-69xv4bdmxJusbxG4hs+bZa5qu2bJm1Rs0rrMd5sLLI6+WtabkW4FsbFT6-ps7Q2fvRtybrm0xuKbUW2ZuOb4G6giFbnG7islbCm4uv2b1G29Fpb8yNX5FbdW2+sUbSW01spbCK1Vu7MNW7Judbmm4luh1Oq2Cu0rA2wVvtbtW7hsAbpW41vlbDm-4vTbbW5TJ-riiwtsNbsGzlvulem7FszbG25BsMb8mxFs9by281tXLa2woizbw2-NvhbahVqMdLum16uHb624euDjxU25vZbOm0FtSbrW7dvHbwmy6ujb7679seb5g8WsSBQ2wavWb9cTtsBbf27lsqbgO7mR3bcO6DuibY289uPLr23lvvbQO59u6TKK4tu7byO-ttvbWG7AKw7s62FtnbT2zqUvb-2zFvU71Wxjt07W249sa9TO3jss7B22zuDbHO9ev079W+dvjbQa1dt6rN2+jvA76m-DucJPO6WV87KO+Zsy7tOyLtc7DO0ruS1E20Stq7MO8LubbGm9jvg7F23tublq24bty7Vm1js2bZuxLumbK2yMtqrGu8bsK7YyZqO87hK08tU7oaz6tu7J28VtdbP2+bsU7luy7sB7Ru0Hsjbpu91uO7yW7quV5TS4Hsg7UG3Huh7Ce71tJ7-+SnvR7ae6dti7jO8rs+7+O6juu7+e-Lt27CO+Lu47pe-zt+7u846qp7Ve+nv278e3Xt67vuwTuZzFsy3u27bezXvF7uu5Lt9bPCx3P97Ls4PuK7XuyXtd7Ze6Bu8LROzhtHrpO4jvubyTd528DE+5XsD7heyHtk7SO5Ds+DzC33u77U+-vtg7He97vz7Dez3uwLZ+zbsX7we1fuZ7ne6Ps57yWpTMfbK+19vHrh+xvtMtUO0zPvKk+-XOx77e2-s37H+5NvAL3+8vsdbD29ruz7I+07tS7ElfAey7xO9LPbbte9AdoHY+22WYHYB9N3V7M+2ZXv7BB5-sUD1PiQeB9l+xnsAHEO5vvjduA7Qfn74B0gdF7OuxvW37quwQvEHHB6QfT7nuxQf4Hie7AeULlg3QcGDDB5AdMHYe8fs-DCk1ge-7JO3hvD7vBzAf67Ah3YoyHvo3IdD7PB2E1UHkhzwvSHQh-Qcv7jB+vvMHQByfupT7O0-ucHq+xofGH8Ldofd7KmxCNHb2B9bNuHKB1oemHOhzvM+HP+4geuHuB5ocmHEhyEfezFh84fCHhh+QcA1We5duEHPFQkd+Hag1EfuH2LZ4cL7uh6zr6HK41wcH7th4ocsHSvRf007lh7IfWH8hxUdpHFu0RWhH+fSUdeTkR9zuBHMR9ntmHbZe0d1HBhw0dGHPRx4fBHXh4vuDHiR1YcQHox2Idz7BR3fveH0x9ke4jMG0ftVHnm3OWrHahzgfdHCx6gexHkxwQu7HER3-tr7eB4scTHhR6Ef+0sWB0eFTFxwEeHHQR8ce3H3s2cdzbXR8gevHvR+kfUHKfU4drHGo38fjH7x8sdTHm2o8dWzORwcepHlBxCf8HbR9CdDHpRz8fcHYx-kc3HkJ6ceonMx-UdzHKRwzXNH4e60efH+JyCenTOO+Id9HcR0XNfH92xiflHVx0cd0nJx6EdZHex-4e5HWJ7q1LHyJ-Ed6HaJ50fPHvJ2CfYnSJ5Tv3738IIcEnwx0SeiHCJ7ScAn-R5kfsH8p+idin8JySeIn7Jx8dFzcp1ScgzGx4Af+tDh77U77mp6KfqH4p8qfXHUpxHsDzj+8aeHzpp3Yfmnyh41VWnrp14s2rHp+h3VH14j6fcncJ78f2nbJ6qf0nk8y6ehn6x6htmngZ9sfJLFe9adPHtpzqe21pJ0odsjKZ1HtpnsJ-GdZblR-Yden8a6me+nRm0Uslnnp7mfln+Z5WfBL-pzWdJnwB0YsVncZ6CcRnbx-qe4nq2w2edn1Jw7t6nUZxyeR7DxyKfpn+x+Ge6nKpy0eztxawOfnHGZzOdZnI5-Odwd9ZxOcFnXc02f+biZ3J3JnW58CeDnJpwmcBnh522cWrvh6edun55y2eXnFp4ufbnjZ9CuUrB5w11HnWKx2fLn055icSn-JzieCn4K0uffH2p6uch1652ScLn4RHns7nLSxBc514J72fAXU26BdMn4F-+fdn-xxucideZy+e3nfp-ucXnn51edzL1u6+d+b75yReLdX56qsUXhF1WfNn2Z1sdkXz60LvwXGq0OPDnc59Bebn35wxe-nPJ5meQXvFzmdVjKZ4JdgXK51heznDpyhfSn5e1JcYXMlyyfRHyF6OcGnU28peY7Ih-XkAX5rQpdOn2l7UecXfq5ls0n8l5pd9nLuzpec7Ju40esnPZ9ZeoXqW+ruTnhZ12dyXkZ7hdb77Z3Zea7Dl-MfYXGl75esH9F6ZeUXDi8RcPnpF0+ewX7l2ZcxLm68WcsXpZ3WcCXkV4xd7n1F7Fe0XbF-lvhH0l3+dqXeR4BeOn5J+CsBX7u2QdKn3l85dhXQZwlfVXMe2Uev7Ch2le1nEl+WctXBeyMfEna52JesX8V-5dZXQl2GeyXg11ZeNXdF9DtjXxV8JeIXzdYZcuXilwbvzXKlyVftXTR1BfiXH4z1cbXul8kd1XU1z5d8XeFwdcnn410WeWXZ13teoTl1xxdRX-SzFedXrZyNe46vV63vHX+lyFeSnRl5VcmXV1wtcTXpV3ycrXM1wVfsrLOsDebXi15NeiX01+dd+XZxDDdPX2V2+funeVxT1lnWK2jc3n1115enXDV8jfhXpYvjdFXcN6DfbXTlzhek3TV0YsU3CByDc3XPF0jf3Xtk38tM3qh4TdDn1++zfDXuN1zfwhzN1Tes3-N3deC3GV8LfFHHl7ueY39529ePnQt+Tci3PNyzdE3iN5LfpX3V3jdq3MJ-LdUXWN0rdxXKt7Bfc3BtwhcI3SF-9erXxl6lsW3ct1bdg3Bl6m123gNw7f63Tt1xffbHV7tdS3utzLew3R1-1cnXWtyTcc3vy3NehbWu9bfLXbt5DcfX5F5ZvP7ip79f1XdN5HdxrmVzHdBXA1+HeZ3Ad-tc53cWxlsJbbN9rddXxdxFe53Hu+nfE3hdzrfV30d6Xcbro66lf+3Tdw9cl36W23cWXFdxHdF33dzXet3Wyy7d-X5VwDcwXo17Xe1X9dwXehX9N7NfNXKdy4eYX49xneL3Wd0Wsr3s93pcUFE9xDdL3UN4Lu93Y9zTfqXtt4ndm3M96Pf1rF92VdH329-2un3kK4Zs5Xxt53dV3w9y3dn399zYe03W90Pec3v92-e+b0V7lcm3+V0nfsXf96+sP34NwnfH3MD4VeyryV+3e3Xg913cgPu93ffwPAD5feT37t9PefXq90keh389zbdEP199LegPaDycsYPA943ff3OD7fdwPyGwQ+P3SD8-cIbr9-Q9WrED5-dDX2D1He4P7D2Rsb3Dd0A8iP2d0Hd4PHD45eEPT98A+iPjN2rcdrEjwg+u3b7U30oP0N+o-Drfd+XcS3WDyw+qPqNwY-rr595w+IPOj0v28PhkNzcaPLm5I8L3V98g833Fj2lOtXzJ1o+H33Dyo+yPqt9499Xadwfeb37jzw8XrJK04+GP1j4o9cPdj9-3BbzOpY-PXKV5g-MP715482LsT1Y--3CT7Y9ndyTwDt5P6T4w8mPWT8re0P5t2k8Y3Rt4rdf32TzU9qPIT99cUP4T1I+RPgTzvcSDK3c4+i7rj1Q-KPMj7085l-T3E8FPwVxE-UPHjy0-jPbLpM-4PhT9o-FPpSw4-fwEz-k-LP0z10+zPUT8FuaSiz9s8KPuz24-7PPTy-cWwWz+U-93lT9I9mPQT7wPmdAz7HdDP8d0k-rP0T+Gg6drz3ndh3wzwE+jPVz8Jj4zoT21c2Pqzw72srrOz89gv7T2E-QlezyM+PPYz+CMvPSz6c-53gL588wvAu3C973P150-nPKL80+B314l+3iPLj348zPpL9U-kvvA5S9gP8W9xf3P3T8C8bPWKIfYnPmj5C-+PuL5Kuwv38Ci38P79wrcd3wj6i8gvWzYS8dPSLyS9AvUr5y8ivvq+g93PUBwLccv3z8K+aWPL9S98vtL4q9kvzd7wMqvfz3XfEvOL2s94vjezK-yPvLys-8v1r4K-4vwr9E2qvDD+q9+3kr8a8-3pr+6-mvc95a8fPzr1+vavKWgG+YvDr2c9Wv0Ly6+2vhTcy9l3rLxq+V3vr6w85lib6K-gPL15A9NP9Lya8SDWbx68CPub0I+avSr+G-Fvgb-vfyvsb+P1fPhz3-U1vRL3W8hvcb2G9NvdDS29yvtJcfUNvNrzKdoN9r-q+OvhrwK+dvUm8O9UvgzzS-IvRrwW9+vEg829Rvo7zG-tvA7-G9DvK73q+zvBr-O8Tv8G+G9a1sr4i99vXjV-2NvU7ye8jve72O8Hvob0e+HPN7zO9vPc7wq+Hv-G9e86Gq73e-rv-b5e+Dv3hy+9JvRjym-evFb+m-mP4IyB-ZvLL77c7XPr4u8ZvMHz++7vb7-u8fvj71+9CvftW0977vb5pUFtHb0+-fv+H6ncQv971h8kfOH6694fp75R--vF7-INAfi+0jUlvYrw08SvkH8h-QfVZex89vZ70R+odgH1u-AfYNYJ+Mf2Lxu+ifk77h8Cfv7xh9Uf9b7J+kf8nxJ+Kf-z5Q8yfLH2J9sfGn+h9afwbwB+6fcn3R8Kfhnxa9tvJnw4NmftrxZ+3Pxj6m+mPUH088SDDn-U+CPjT0h+m38zzB8Gfjn+B+IfPH758Mv7nwF+efZb958hf0Dzk-8fEX7zdnn3H2m+8fbnzmUefiX3efJfLn6l9ov8X2Q+zHUnwC86ftn2p-mfCXxrd83zn1U+hfhb+l8VfYt5rcqfpn2V-2fDXyHdCf4tQ32lftH218FfhJ0V-afNn7sPoHoNf18Kng38Z-MfPX5Jvqf431qeqX77818zf0W+V-zfNp1teYfy3yN8ZHiNe1-2XVn+e8fNqn719DvGX5V9JfmTw8+ufeX9uXnfjX1V8QfKX7V9Lv9X+t9Tn8N+8-Dfkw4CefV+34FeHfwn170tfp3+J-vfnl49-Bfz37F9+f+Xwx++PW3yV87fv36g33fHX5N-Wf038j9qne3+D+G3Xn9l81fMP2F9vf8P+vdLfSPz984-QVVmsIvGP0d-Efm73Z9Dv8VZJ8I-yn5T8PD1P6VW0-BH519r13X9j-RnwC6z+afgP11-2DQv2OdFzov5Z9BvmP8d8g-s33R+y-gXwh+AP7L5W+HPqv5F8ZPTD9d+5f0rzr+ZfRF3m8+fxP3V-gjxvxd9ZfV35r83fRv2VVs-5P4j-ffXP8L+YJoGqB-xPTH4r8rfFWzvNe-cH8m-q-Sjwu8vfKH1PBB-HHzm96-bLxc9avwW9H-O-i3679Y-VPx78kRyf2L-y-DPyJ9K-q343vZ-cv7W95-wP-7-O7JkcX9q--+1D85fEf3x+RLb2eC-s-vv4z8nfyv43vnE3v1M-SfbvyaPS-tK8390-rf33-p-7v4P+pbw-3z-0-QP4L8Z-k-wivT-FH6P-Ff-f2mOZ-LWwakPfl3-r-2-hvxs9g0r70Z8K-7fwX8B-Iy9v-o-q-0N-j-A-1pepbV-wd+5-c-5L8L-D-witP-APy-8S-Ow+-82XRcxNiMf3g+tfw1+Cfy1+U7yABKf02+HP3X+-k03+PFSgBOf1L+r-z-+E-w-+PCyQBJf1beZf3n+6AIABNcywBNf0uOYf0-enfxlOa6h7+OzzH+fvyl+GANFSeP2duFPzgB9MwQBMOUYBPt1ABpAOw+5AJU2lAOD+YH1D+iTx4BhfwoBM0WIBLxydeNH14BoG34BwAJD+XAOEB0gNEBfAPEBuvwqe1XwN+DfzS+N3jJ+qf1gBd-w3+i-xEiYkXkBggMUBRT2UBF-ymipgOgBn32YBhgPgBxgNkStgOQBOANQB4oyMB9AN3SrgOwBhH1-+ngKcB3gMuyvgIkBdp3HeIgOsB7qVCB6gK9edfyJ+ON1h+9LBiBJvyYur13ze2gNu+6qBSBNv1N+5b2h+iQJJ+ugNveSnzb++fwr+o3w1Udc3Ie-PyBaeAPv+BANZi74VSBH92i+BQN0ecX3kQzQNyBaQLN+MX0KBlv2QQ1QMK+N-ym+tAP-+rl0wS3QJ3+tvz3+4AId+Gz2mB1-xd+BgPGB+AMmBJESWBz-xQBAQMDGQQMaBUwOGBA31GBp-3KBdAIOBmwKOBE3xOBuALf+6wLWuS8y2B3-x2BAvzuBDQI2Bb0SeBNVxeBdQLeBXgIuBnwKuBC3xgBZQPL+5wI+BI6S+BPjxWBoIPqB-wIhB1GShBLfxhBNALP+FQN2+leSRBI-xRBa-0cBrAOcBkIKBBG33sBafzWB7wIeBO8yxBM-xuBHgL2B+IOCBmIKJBH32pupILRB4IIpB5iSpBK-xxBt-zJB8II5BJkS5Ba930BsIL+B+wIRBjIL0BIINRBZwImBAoPviQoJqBs-12BG43pBAIMJBUoJJBqwLZBcoPtuhwM1BLIO1BsoPuBeoMuBBoPFumgP3+mQJBeioJGBPILGBOoJNBHt0wS8L2pB9oNOBYIN1BzoJIiroO5BIoJlBnoKdBJD1fIvoOFB0oNxBfIPFB8oNZioYKVBNIJVBN43IW3P3hUsYLtB-oIjBjoPJBpoLeiqYOOB7oNuBaAKzB3oJzB5oKa+nPyLBwYKnguYOuB+YNpBqoODmyYIpU1YOBBWoNFBhYP5B2YJHSzYOJBhoLbBgQLVBEoP-y3YOZBFoKe+9fwt+r3xDBpYMh+YALpe1oI2ew4Ih+u-3j+c4InBkf3kQi4Px+UX0J+WgLXBjfziQm4KYBrIONBFYP4undkPBnAJIBSgKZ+rXxlOF4PMuTnzHBCQI6BSQIPB04OXBloPmBB-21e94LVej4PiBu4IGBk4KrB74NmBK4PD+e4J0BIEJKBJ-wLB-YIbBbAMryv4M9e-4NnBEEKAh64LfB6NxaB4rzt+X4PnBP4ODu2wPcBCYIMmWSwZBQ4KIhzwJIhrwPbBUYM7B1GVAO3twfBQXzQhZAJUBoGyYhSVxQhrEO4BVgMr+98S4hYQJEu23y9BlYI3BVEO+BNEN+BdEIHB0YJdBkkOhB6YN5BmYI7BxYK7BikORBykIdBJ4LUh4kKwhBNx6BrQJ3BVoMghWQOrAQkNiBqEL4hN4NB+nEM0h2IO0hHoLhB9EPUhjEIchboKchcELpBCEIJB7kOwhRkNwhcwNXBGEP3BFkI8hfoPDBKkN0hrkP0h4UIChMwLyBbQPHBoUKghEkIShywK8hdYMTBliz8hSEIihYYNbBAYJchckIYh+UIyhxEP8BtEPghLc0QhlEIqh1EKqhMkJqhSYLqhKYIKhcYNrBpEIGmKu3khPoI6haYKihOkMDBp4IuuhVkshOEK4+eEJChL4KKBQwIGheYKyh3UKem9e0HBVQIWhNYKWh1UJ8htULyh-+TzClt0vBkgIiB-EMqBFKgOhzEL-BvEOvBHfw4hjwOb2l0J4hQgMsBtkJkB90I2hLYN7BxULFBpULchw+VMBh0JYhz0Kher0LuhO8wNElN0yhQ0OchP0N8hFELRiAMMehpbzj+n4Jmh9j21eEMNFuUMKKhGYJihv0LihqVEMhiUN6B+QJShs0MGBf8Q+hPYNHBAENMhqUPMhhMMhhlUNqB2rVkhcMPVBQ5SABgMKuhwMKkBoMKiBwCy5hSMM4+BP2mh6EPJhwEO3KQsO4hyMI0BT4MAhEsMwhGkmlhwkKWuLAPZha0PC6stxlhIsO3BYsPYhAsM-+E0MChU0OCh4sPRhKT3-i3MKehFgJBht0MNhNGythwsNj+csNph+ELMhILyP+TMMahLMJfaJUI1hfUK3+xsOJhxkP1hkQIEhj-2Dh2MK+huMJGhekLPBpYhTS1sNlhcQLYh4cLOh92iThzsJABV4Jeh9sIjhS-wehOsJdhqcJsh+cIzhTOizhxcJzhx0Ifep0IxBueyrhqsLju6sN2h8MIpU0f2ThusJRh8sLphisLChmygIuk0NFhZsINhBcKz+ZVS7hJcOshN0PP+48LeincOzhCgNzhdsLnhFcOl0i8Orhy8Nrh1H35h88JHSm8ObhX3zxBAcLKh-+UPhVkOuhecLXhDcI30YNSnhNcPCBdcL3h68OwM98KXh5gJXhfMPLht8Pv078K3hn8J3hokKDBCcPCIm+gfh28Kfhu8J-hKP2wMTBggRgCKgRwCNGhKN1fIYBgQRPv2+hbMLbhHMMry6CI-hmCNjh-sJwRmsNEMVMJHBZYNbhrUL2hVQKjhzMOVB20PrBJCMDhhILoRPsIYRzUJ2h1CPbh9hjoaGCN7+RCNhhzCLPhtCPIRS4LAhqMPNhJTyFerCn4R1AMER2CO4RuCP-ysiIIRAiOihccNihoCJ9o7rzkRWLwURLUNyhPCOBMuiLUR8iI0RxCKURpCOBMJ5j0R0bywRhiPIhyiPhU0FnVuIcKCh4ELHhr8NfMDUKkhTUNZhjiOZ21iOEsYiK3BPcLdhaMOkRrr0SsdiLXeDiK4RRiOcRMakRssSL-e8SKYRViJYR1GRiRZiP0RFiKERmSJERySMOu9CPjBjCJyhTiOCRCVhSRuSPsRBiISRlSKyRleRyRACMIR+SMURiSKqRl1mTsqSNKB6SIqRQSKaR-+UdsbiOjhNMLTh9cNgR3SO1hR8IcBkYPxh2iLaIIyN6RsEOyhZEMGRRSJXUyyNqRcSPqRGSM6RQyPhU2yNaR6iOGhliIORmyOA0UjhWR4v3KR6yN6hlyOl01yJ2RaSL2RAyIeRf0P-yzyJOR5iLORBSIuRnyPhU3yNmRx4M0RCyLGhYzgx4NyJ-+dyJ6hq0MORscRPYWMNKRXUNhRK0L4OCKLk0SKNGRKKK2hnCP2RjSMeRNYWxR0KJ+BASIaRGyMBRiKKhRLyL6RbyPuR8KKJRLiTiEpKOkh5KIJRlKIJh4ClCRR4KNBYKNPhVKLk0LKNpRqyOWheiwFOmKNhCwqJ+ReSL+RHSMJRgqKlRlJ0vhvMJOhL8N-hQqOVRw8L1ho8PThGqNhCcXmRR7CLKR+KPeRjKMVR7cUNROKONRqKNNRDKIxRTKKhSVqNZR-iL9h-yIVRXKI+URMLGRlCJPhwiItRNYWdRIqNuRdqLhRDqIDRLiSDRMqLqR7SMCRHyM9R9Xm9hfiN9hsg3lRnKMWRN3jYRyaI4R7KLNR4aITRGpxBRfKPORHqIzRO3izRSkOhh3kI5R8aLLRUfljO2qPCREyPVRUyKhS0fhdRKaLam6KIlRjqNmS7aODRMKNDR3aKAukqPbi-aOjRuyNjRFKNrREKNTw6Fx9RM4LLhN8NbRsyQv8SaMrROMKnRNaPNRnqLXRRqOzRJqNzR9qJ7REaKhSe6OtRB6NtRR6LDRJ6N3R86NxRVaLWRN6JHRvaLzyrgX3RG6JjhW6LzRt6LrR7ARKRNqLxR16OHRFV13RX108hj6LFR96ynuf6JCCPKKOhSCPLB8cNnRilH+CH6K0hkGLRR4qJfRp6NmSaGIvRn6PGRS6PRBK6Lzy+GI7ROaLdRaaJnRqCL2CXtwnRryO-Rx6JwxnqLjC8GKBhtsO-hy6MbBcmjYxviMIxvqPmRAqNYxF0IYxdKKYxz6NAxsGKnCRcKLRfYOnRO6OkxEYD4x3qIfRm6LlRcaMUxKGJzIakXXRGGPUxMMOoxWmNoxvUURhYmNFRWGOgxxDyUxokSHhJsJHhniL1RpGNacumPQxjkMwxQ6OwxUmO0x45D6i-GP0xX6I0xCmPzRNmL8xqmMAxHmOAxXmJgxPmNUiT2goxh6KoxmmJCxsWK2i7GJ5hnGLVRMCJ4xsITCxemPcxBmOrRP6JYxNmNViCWKvRSWOCxv6NSx50RVhKqMyxz8OyxbUNjiZWIHRZKMqx26JSxJmONiMyPqxX8Kyx3GOaxcmlax5mJDRUWKsxNDzmhtWN6xjaNdhzaKaxNCK5S6WJth-WMaxg2MWx5SWWxKcJnh18JIxOWKvSTsNGxg6PGxvG0mxFMJaSW2O7hc2OIx7INfRbeUOxcmP6RzGO8x3WP1SFaICxRGNnhe2KGxRuUux08Kvhq8O+xG2N+x-mIKxgWMMxyWOqxr2O9yoOIgxhWKfRIGJix0OIAK4WMvRQGI6xxWJexZN0UosOXKx6ONTRkOJKxNWJIq8VTxxkWIxxz2KRx2OIkGpOLaxbKIpxkmKpxDNxzKtOKOx7WIJxVWKJxyONIqZOPhxUGNOxczymxJOMnhdONdRHOM6xUOOpxLOJFxbOPpx4uMxxTOOXu4XwAxaOPJx8uMpx1mOJxGknY+vOPBxRWI1xZ2MlhJFR1xouM7R18zK2huKVhFsBNxsuLFxXaOixmuO5xNuMex9KMZxjuKlx-nxVxAmMXRX2NuxuGN6qsHwIxH2MExqkK0RWuOtx8CNNxlGPVxbuMtxA8O-ggeN1xn2N2xfuK5R9H1hxkUL5xlmIFxBzynef9STxIeLxhwmKUx073yxcOL1xCOIdxceLShJFXzxUeMSxMeMRx7uOZx4IzrxtuLNxgiyW21eIZhbr1kxfWKARSGLDx3OOLeBeJ9xKeLEhJeJHx9eIqxjeKrxguPOxGkinx7eOjx9uImx8+KNxi+NsR0+Pxxq+Jzxlz2VeW+OXxDeN3xFuPXxVuJ1edmPcRpsMcxkyP2x7TTNebgLtx5uK7xZ+Pjxdr2P+Y2IZxTeO7x0rwfxfgI7x5i02Oifynef+JdxEmO-xr+JrxGkizao+I-BvcPdh9MOleMBO3xauJPxL+NzxuH2QJR+JnxaBPJ2GBLo+WBLAJQWIlxXOI9xVZUIJ-eMQxVCIBRaeIoJs2NLhvuInx4eO-gdBPsxOqJvxLaLvxm7RqR2BJ3xz+LwJ++PDeTLzcx5eOTxgONTxJeOEJQeLBxYhK4xQOOMRbrR6RKBKzxnmLXx+BNteUhNgJEiPgJkSKvemBKUJvBNQJ-BKAJEAP0JM2LYJTaJuxTBO5xmhOUJFeP5xp+PUJQ71sJhhJUJJ2McJghMOeLhKIJEOM5xWOJbx5BIMJPhP1xseMgJPeMtg72JkJheP5R-qLTx5nS0JSUJMhCBP7hUBIJeGeMKh9hOzxHhOAJuH3iJdhNkJA2PkJSSLW0eRNcJmRNUJe+JyJdH1KJwRMrxahM8JkAJ06CRJJhyUOfBFsMaJkRNEJ0RJLR6aOYJERL+xj8JEhg+PBR3OJqJlBKGJ1BNLRfRLGJ9BJ2x4hOsJZBKlhTRPyJ3RPdRvRNGJyxLKJBRLWxRRK6R8HU2JtRIcJ6BIaJuRIOJ4xLVhfqMKR-uMc6ZxNmJAOLkJEhOmJtxIsJ12MYJICKeJnRMzx5RPcJxxKqJtrxmJLxIYJ4+PeJGxM+JGRO2J0CPWxChO06YJM6hfBM7xAhL+JQ7wBJV+IcxkiK8R+qPo6sJMGhbhK-xc+KcJ3hxRJC6LgJESKkRehOqJzxNRJ7BPRJTmK4J+xOxJi0KMJCJJMJCwPDeRJLUx3xLxJ9RKRJhJMpJxJO0JpJIxJzmJ86fJI5JEJOQRyGNBJAxMgRExMuJNBJLxK3WaJocN1Rt+J+xVPT7xdxNVROxMeJ3OMVJKxLHx8xJBJixJIqepK2JqxKMxXWONJfD1zI2kk1JDWMhJuxNHRXm3V2tpMBJcxIeJCxICJqDxtJECgixuJNnx3JNMJrrzR2EATtJq2IdJOpKtJgm2q2rpKpJlhLeJKCKjJIW0G2sZP5JiRLDhqpOBx0uhDJqZLFJ5pMJx-hKVxpDxjJvpNVx-pNwJLJO-BKT1d2uZL9JnJIDJlRKDJXfxrJpZO9xJJPmxUJOKJTOhbJhxKyJvxKbJMpxT2tZLLJ9ZIrJH5w9hh-x7J5xJbhcpKmJ3OIn2w5LbJApI7JjpLuxwZz72i5ODxBpI9JRpK9J7cw3JrZK3J7ZKsJu5KLJX8wPJvZIqJ2RIHJ3hwXJh5KiJ25MKJkZL3Jve2b2m5IfJx5ITJkpKTJ7GhLJl5J+JiJJvJi+2IO75K6Jj5O1JnpLPJUM1AOoFK+J4pOGJxeL6JIFPvJYFM-JwJMTJL5J5mMFJQpcFPzJfhMVxJ9wpmeh1gp4JLwpJBMLJhFNlOxFJwppFPApEZMgplFLCO6JBopcJKZJgBPHJiBM5e0hxIprFPLJxhI4pKRPCJ3FJYpOJNHJ-FJounFPDewlP-JXJMbJrJMOe0lOnJx8KExsRJLx7Rx4polPgpkxPWJP5PUpIlMZJfFOZJAlPaJuHz0pMlIbJ15PkpU7zMpSlLmRoeJGJulOhOGlIMpYlKMpElMEp0rxspYZIHx2lJoxjlJp2zlM2hbFOM2UD0kphzy8pbpPuJT5IYpejw0k9xz-JtlNBRPRL8pmFM2eUKMCpn0K0ps5J0pqVM0k6VP0pQVMMp7FPcpJlLo+8VJTJBVMypZFIVxzeKgp25XKpBWwyp1MOqpBuLCJ0r0VJTVIoRdFIlJQ+J-JHVMqpzVO6pCFNUpfRP6p5lLHJJVKiR-xKaJnVPER6ZJVJnBLVJMJISp3lKoJ2VJSpdVJIq8RNmpYSNeJ6FO-JuVO2pA1K6paFMNJGFM2pysJmpx1LmpLRKSJuhNY+BCyOp41PEp2Nw8pnLyepiVOLRaxI2pjFM0JO1N5R8mPIpBFNipdch6R-1IQxspJUpVxNoJYNOupu1KBJZ1IOpF1NBpxR3BpHGPDJPVIcpuVL+pcNIBpT2NCJBJMX2MBLRpGWIxpw1OhpkhJSRJNJWxPlPWpxmJ-JxNNxpENIuJUNPlJfRMZpz1Lcpr1NKpGhKppTNPRptNNZpc5J-JKr1DJkVK1J9FNPJjFNFp1NO2xUVIgpUtJBpF+JWp4tPtJmNMQpw+NsRstKuxCNJ3J51OlpuiO1p-2Ilp6tJGpw+MNp-NNJpgtPspGtJFpFtM5pxVO5pU1KHeI+KNpgxJZpNtLNpdtLfJltJppa1KFpOVORpCePvhbtJlJHtKLxXtNypOuNDpiCMhpntIppfROjpvtLlpJtPJpbNO5xpOJjpbSOIJNVJ-xnL0zpydJ1p7pOipitM6BwuIeOWdNORvhKBptVMYpBdIdpIVIyBE5PDe9dM+pgNNzpbVPzpk8MrpvyOrpHdMJpS82IKPpIbp1Z1Cpb1IxhuOJ7psqL7prVIHp4MMnphdONpatLTpwtNSpQ9LFpcZL2piNN6pa9IXpI9OYuTdLCpUmzmSG9LTJt1IzJi1KzJgSSthU9JjROdNnpJxNdeJ9Nvpk6PvpBNMfpje2fpi9PdpM5IDpP1KVpX9P3p6QPN+R9KFe6MS5hL9MYxb9IgJc9PMS4DNRp39LDpv9Pjp6dKTJ8DJVpm9N1pJdP1pADLyxzFKAZfQPaBPNIoBeDOHpbdPxpMDI-pJDPixkDPEx0DPxJVDL4BpDNPpeZKGpvlPppa9OYZtDIsxV5P7JVlLAZXDMQZsdPDpMRITpyOOmiAVKEZ2dJnp79J5JsgNcxZDNWpcdIjpYjLQZCjJYZdZKypf9I4ZQdNsxGDLPpypI4JC2OhJLiXUZ3DM-xFlL4ZVZOPpKmPmQ5jOOxslMsp1jLAZtjPwZ5DNdxlDLkZg9NcZijNVpZNPYZlpLXpPjI0ZI5K0ZKDNXpujOCZ9jPZxE1Kdp5JM-p5GOiZcuNiZY9OIZfAMSZUjKrpIRM8ZQFMHpGTIIZpMLaJztPSZ+tySZT+K5pqTOKZsgPfRvjMwZxdIVpODLLpcGIqpBTNaJCsLSZ1TJh2ZTIAJjdJAZ49OC2ZDMapmTN7p2TIYZXjPBh7aO6ZK+JeplTPiZFAMmZwzOnpozMDJ-DKfpCzNaZd1LJJD1ImZF5PcZ4BLGZuTPBhiaLcZSjJEZyVJ0ZlFLgEQzI2ZF9OMZXZMtRtBymZx+JmZh9P6Zx9OOZtTIMZHiJpJmZJMZTqOopNzIWpdzL2JsyWdRTzJwJLzL6ZHTMHpYLMWZd9JkZOTNWZn9NhZgLKMZnZJBZeeRZR4LPhJjtNmZ2zLgZWLLhZr9IRZBzKRZFAMJZqLJ+Zl9L+ZsyQpZezPoZKzOcZT9JJR2LOCpo9NeZ0LPBhLLKJZUDJJZjLIIhAzO5ZlLJ0JWzL0+g9KFZ9LL5ZclKZZn9IlZpzOQZKjNQZa9PGcITKXJ81LRZq5OuJ-zn0ZrDNOpetKRplzJVZrLKKpvTP6BbzLAZRrJ5ZdDKlZTjIFZUm2uRxrNcpuLI5ZVTKXmDrKtZPDIAplZLtZQr3dZwrMFJtJKWpOwj9ZkrOWZ0rJ9ZrrxDZ8rOUp4TMDplFOWRjrLCZirIiZ8bNhp-rJXJz5KDpCbI9ZFjJSZLrLmZKmxiRibJapsjMOZ5iSLZObIcZljMApZLMLZfNPTZJ5MaZr4PGskjIbZX5J3pQdNcRqrKPJy5MbZBrKVpXbOLZbDLppgTM7ZWtMrZMTMhZZrM5Z5iUHZE7OSZU7KIZrrJ3msiKHZerOwZ-bKaZNjB1ZmjJLZiLJlZMp1XZ87PKZzrKhZy7M5BfCLXZvbPbZWNKDpmRm7ZH5OvZ+1I7ZlFPvZV7PVZVLOBZTpJ2E6CPfZ59KBZ6LO-Z7Zl-Zx7J6Z7LLPZBbNA2IHLbZz7NvZlFPARf7MMZn7MA5a5LARIdNA50zIqZ+bPxZJkQQ5GHOeZWHIg5OHPvieHJg529Lg5StNI5obLqJ4bObpSf27p+HIhZhHOnZ57Kr+DHLI5+rJfZStM7hiHO+ZIrKFJdJLZsPHMY5OLNNZS7Mg5S82E5HHI3ZXHK3Z1RGuZ1HKOJNbIPZqOyThvHOvxyHM1ZXKO7+JzL8Z1tOTZcbKVpOnM+ZurKfZ5HNtpqVK9hunLqZ8tMlpTbKFxJKxvpInLZZB9KI5YrP8WTnOk5DTM3ZzbMdk2FK85dnJ85DnJ+eO7NCZe7NJZKnMX2EDOc5JrPA5LHIk5oR2i5AXNNpqjMOpCDOS5K9MM5cnLkBD7NQpZnM45FHOy5NDJi5TrLE5ZMJnZ-yVC5arP-ZGrMzZlzOK5GXICZkuN3prbMU5fZOU5EbM-pDXLa5vDI65dHPeZFdJK5SbNEZSrN0ZAMPU5aJP45gbKvpkaMG5jXJHZzXLG5c3J65XrOMprHOiBy3OjZdlIM5-9Oy543KG54XP5Z-XLAZ+3Pm52jNHZlzNO5K3McZVjM65FAKu5W3KSp31IuZADIe5enP9psbN25vnNBQCnMe5X1ItJi3Mu5m3Pe5yjJG5KbNe5wPJs5qdKa5pBLXpb3Kh5y9Jh5FFIh5VXJ7ZH7Km5vzPuZgaMh5XzI05GPOpZWPIyMPtLO5n3Je5cnIOhE3OpJ+PK-ZqHLRIFPIO5w7PO5gPKVp9PJJ5O3LJ533NZ513OrZ3rOO5rry55f3PbpD9PGZF7NR5j7PR5AbMx5GLM7sAvJB5ZzOe5F3JZ5xPO55ebLc5zPxU2svIR5-jIW5sPLvZyvMF5FDIi5d3I15+vLl5CrLB5WXM55pvK15+nIt5X3OC52xF+5ZvJjZ7PMV5cnP85KvMXZ5XPW5MYLF5eXIl5GbJip7vL95uFMZ5pPLd533I95BvI8ZRvL55jeyj5zvO25dvI55DvIT5NvI+5rvOZ5wfJaZnvOY54nOI5vvJz50fP2ZR3NAZrrzT5uPMm5kvIJ50vOUwFfNM5AfL7ZsnMj5IfNop67O85zfNT5rfN4ppXLi5+fPc55iXr5u7LD5mfN15lFKH5YXJH5yfIj5XfKL5ifKe5APLH5RnJl2CwWL5DLNo5ZfObJEgVX58-P+5BZOBpcnLR2O-PT5oPPOZM-IXxD+0dUx-Mr5VPOr5NPK1Z2+wtm1-Ib5NXM05dXKVpv5N2Yz-OH57fMC5nfIv5sp2p83-Mn5v-JS5o3MYpmB2AF1XKQ51PJQ5D-KCmqCCgFaPNf5sAq05JeMsGSAvF5KArv5cArTxGAuaCa-JtZt3Lj5Q73z6mAv952AsD5pdO+562k205AtD5oAsy59vIAFtAtgE9Arb5+XJk5hXJoFDVLuCFSmgFfHJwFaAtGpGPHYFPfOG5Z-Kz5PArucYgs0ph3I355rLKpMgoIFu-KF5pbNrZUXJ06sgpcpEgoV5Ugod5-RK-5KgpP58vMX5yPLk5hgp2g2gsKpvfNc58XIL5lCykJ1gqqpU-MkFS-IsFTguMFN-PjJsHIs5QdKxQiNmcFg1MYFSPIP5NAqzaQQpOpnAo753AoMFEQq8FL-JgFQgvf5FgpVekQpupSQqoF9nJYFaQoSFP-OiFf-NiFOQvde6Qvhp9TMKFfgoNpV-LyFIAoKFYAvB5qQpKFNQoEFePOSFQfJoFf9VKFeNJj5pfMUF9nyYMXQuZp5vLcF5gpoFgeMGFAtIz50-P0FLAvGFzQuQFmQqb5RQo3x1uLBqEwqtpUwpGFYQoMF8VXWFftNP5egvcFNAt2F8wqwFiwpvZlQoAZsOT2FKdMR5OvNGFDvKHpNwqLptnPqFlvMeF2iWeFS9O15TPKOFHwv-iXwp-pLvOmFfwoAF6DKMF-AoWFggqyFQXLBFpDMBFSDOBFWwtrpuDKe0CIuEZwwsOFDwrhFaItOFFAvOFvgsjpujIUZ6IukZYbNtZJAqYZpgNJFWTJo5FIs35FAJ8ZNIpGZdIuIFDIr4BTIrxFDArqFTApT5YIrtCfArZ5IIuxFKwuUxfoSsFXIo4FjfIuFRIsuZAoojAzIqWZrIr657ItkB+GMVF8LPJFbIr6FFAPVFkovEF8gvpFOor4BNTI1FxLK1FKouNFnTLYF+orkFrgqxF2wrBFpottFOgsNF2ooq57qXPRZot5ZFot55qosHpXopdFNgt0FZgsdFootUOEoshFZwuhFSwsuF2XOj83outZvorW5CXLgZCYqDFLgpCF9wrDF5+KuZgotz5p7PsFA-JsBQAozFwQp5FoQpRFe3NLFUYvxFMYplFqXLG5dikTFnrJu5loo9FMCStRLYtzZXvKKZqYpsBzYrLFUQulFhIsbFlzLiE3YqrZqvKLF6vNkBE4qHFGQvrFo4vAFADPnFtYu5FI4vM5sooAZ2KMnFk7Lz53vP7F7qV3FC4rKFrwt5F5-PDFJ4vXFUosoFsYu3F2XOvFQouRFedIxh4zj3FC7IPFfYocFIkXfFp4u6FJfIUFHYrISf4pvFBovtFoYqrF33KkcH4pPZZXO-FxYvviMEv-FQwqRFDoqglDvOQlYErtFWYt+FIovPxIyNglYHLsF-fNnFS80IlKEsmFBwsglr4uC2FEuwlroogl+-IwlAAvolz4vQltEqk2iViIlmHMLFpEtvBdbJtFDEuDFbovbFPvMwS3EsolGwuolzEs4lQr0klwkszFFYuzFLEtFFCkvYlNEs7p2r1cRPEoI5fEsPFP4reiOkqkl+wtMFskq0lwW2MlikvLFm4oK5cYu+5Vko0l5ktgZJkUclBYvgl7TPElJETclhAuTFk1KPFrMR8lqgsN5vQuAl3kpPMukqY5+koQlZEpXZEUpMltwp+F4fJmFootYUkUtE5ffIMliEsClTQuslw4rvFDYpXFcnLSlCUpeF0PJUlcktdeJUryli4taFMIv-5qUtylTkvwpqkvPxmRnSlLnOAZM4oEloG3alpUu+FtvJfFFkqk2fUpqlZ4vKleEpzF8eNGlzUprplUsb2M0vclmUpilPUvuh7yg6lsXJIlWUtilF7PWl-UqBFSfKGlLkoVBdDQ2ltgq6l-Ersha0sQF+0sRFh0o4lw0qFei0t8lyor9FVouulEItml-dMYZvUtOlt0oxFaEs0lx0qaBf0rGlAEvX5RorClgIL2lYMtQl90qBlP0o+lkYq+lwvLLZuHLWF-0rJFr0pTFhkpHSm+jOlIYucliMp3m+MsxltIqU5b0qhlB8LKqBMtEllMq8lC8JplZMpZFFMpxl2Us9+TMthlVErMlLUvmlMp2j+tMqYlvMselrrwFlzMqVFrMv8luMr1WKaUFluEuSloItFFxnLllyksmlrUvjxysvFlmouxlUsvZljsJhlKMvUFkXMc2AIq1l5op1lcTOllye1NlXMuklPMrmlIsumpN0ttlpksxFCMpF5gANZ0KstslXAvslBgqAB3soKly4oaFNAoDlZsp9FFsrxZesrbKYcpdliUsGlD0uBl-mSElhsv3ZxvNkBuIrjlZUruFasr5lqgJTlS0q2lK0qulRzNiwgcoJFW4rHFKPM+lhcoul20tWlpcudlqctj5-osblNcpelksstl0cp8BZcvDlSYsjl2HO7lIQN7lWcoGlmwsTlxMrgZ1Ir7lrYp55bMp2lJYqbltcsIZ9cpLlU8pHlzctClDMo1B7cuClPQqAl28sRB1QtHlB0oX5RMo9lJ0qXlHcva59MoCl+oN3lJgrdl58rRll8ofl3gq3pdkofFVvKvle8sAlkMsPlkoLfliQqXFlcqKl38qAV+Qp9lMQr9lAArzC5cpAVn8qrl5POPlm8oPld8rNBECtqFUCoqFX8od5cCpnlPYq-FnkvQVgIJ-lj8sBlz8o0F70MwVLQqr59UuWFbUpQVy8sKZxCqtl+0KYV18t65t8rYV60JoVUIrql94qQV4CuRlzCraZfcKplR8rIV78qwZ0CtwVsCo4Vv8ohl7ooAV7CqkVwCoEVhUpDleCoUV5CvhllCuNllIJ0V0ivKFbwuYFoovwVJ8rulZ8uFlScowVIis4Vq3N1lC8tfl9isUVRArElJCp3lrit0V1iodltitIVfCujFGiuDl7woAFBstEVmzIE5QbPbM4SocVbYu4VQ8vKh3iuMV54srFecvshgSrrFwStAVWirCVaisgVQcpyVoStFFsSrcVfkq7lzisL5ySvUVdCsEVYCtn51SoKVFcsQV9SryVmSo3FhSpaVuSpKV+SqwVnSt9lcip6V7StvFzSoGVQioaV+YriVc8qcVDcsH5vStoVt-PoVMCqGVjSr6VoytkV4yraVqyoWVPgqKVZivPxpSp8Ve-JsVk8pMihypSVE0oVl+Evjx5ypqViyrqV3SoOV8yv4VtSs0VxSqeVwyvAl8stH51ytSJn0G2VLyvuVbyv2VNyueVQSteVISpBVfytuVTSoQVYytaVKypeUfoSmV04sulb0J3m7yj1CKKt7FrCsSV9UJ2gWKrKVA8rV5syrOVqCEJVRyrUFacspFGSoJVyKqJVncqjllSoUhuzApVFypzlVyqml0KvJV9KspVIUrQVPCqbBPKo2GcMt8V30ovlVSqRVIqu5lT8pOVEqpZVdKulVdstlVfitOVgkOFVqCv-lniv8hiqs1Vyiu1VSSqlVeqo8VgqpXUmKt5V7KqSlPyq5VPePNVSqtdlFCrlVL8slVYovtV8cvHl7sudVCqqNVEStuZuAqUxdquNVCSuZV-UNZVFqruVuyq6V7ytBVYardV2cqtVwoptVIL0DVvqoA5wguRxeYTZVEao-l8KseV00sdUWathV2SqjVUKp7xmavDVRaohVeyr5F5ioLVFarWVcKo2VCKsYVGqtTVtXPaF2itbV2KqIV4ipUVCMNiwhaobVxatzV0ar+VmMLhkcarHlMkqdVVCrbluqrbVb-I7VYIqe0g6p2VOaqbVearHVK6vrVa6pkVOCs2V4Yu3Vk6tPlxytVV8qrHiXaoZVN8vnlpKsIBrOlXVgKsjVI6tLV0ryABD6vBVQKshVNavPxN4h9V3auiluKpDVMcvvVO6sfV66v3Vzao1l-8XfVWSqrVJau-VUGpTV-6o8lvaoNVue2g1oGo-VT6o3Vo6p7xxnJg1HSvWVEGs3VeGpTSBGpGVjauI1uGs9hZGsw1sGs-V1asvF5+Pw1dGsI1lGtMVCGr+V0f3I1XytVlnKvVlXGrKqPGpwlfGutVAmp7x3GtY1FGuHVOGpfVGz0k1x6qsVp6vFVXqpIim+mE1jEu+ViavE1IL3U1Umt412Co41TGvjxYBg01IkqFlZ6tU1b0VM1+mpE1hmovFKUvPxNmsU1AMr0VM6oMVu0svVfKv3lWqtNVIxiQ1V6q4VN6rXlgoLoaZmqUl9mrSVjssPZ7r3C1Nkv6Vsms41PeNYUcWvylRGqM1jmvjxriNS1tUrg1z6qS1IL2y1tms01omu016SqXmRWpc1WMsZVg8qA1I6Uq1QauC16KvLZiNhy140o5VYmvK1O80SsbWvBl7iuDVt6tZiPWuK15mq01R0rVVQ2ta1I2oi1CWqo1cmu1eIyN61oquU1qMtnV5bOTsS2plVjqss1a2pMii2um18WvS1DmsVl5+Kkcm2uVV22pU1u2qQlOnXO1Dqrc1O2o81JkTO1B2rS17GuO1vyp7xL2qq15MuvVMypC1N2oC13mr-l+qr817cXGcd2vdV06se16cvFZdzkh18aoTlnquu1MCQh1r2ty1DGvg1xmrHV2KIR1U6vtlV2qe1x4ox4eOpPVVKpbl70q5ZJOvR17WoTV42vPVsiVx1NOr615SqZVg2rIScQlJ1SmvJ1W8rQ1aMU51zOuW1POoFVeKv51m2i51rmrFVq2qJ1MCQF1P2pZlf2oqV7OpEicusa1-2ua1A4pA18uolliurZ1AOs7Fdigl11Wt11tWuV1LgMN1guq21D2sJ1sOtLlQOstVSOv0VtuvXl9uuzVe6oy1J2vjxeYtdVauqV1+urISHzKN1v2qC16urBhaYotmQeoV1Ier91GuvdS0fkj1Ouuj1eutj1MCXj1luou11uul1zuqmiaeu112spq1JKv91IkXPRCevz1JusL1KerISJevT192ql1Rsuz1nop9WpevNlBeu6lRetkSNTOb1Ectb1aKrD1U0U71Neqh1BOqz1NKoDFEgS71-cp71q8sr1xevH1g+sR1Hqqd1o+vBh+GIn1s8tRV0+r717qVX18+vx1Kqpt1y+rgZO+rz1LevL1bepn1siWP1vuuT1W+pgS8oonV1+tN17et3S9+rX1hCoA1qGrB1NYVf1u+rJ1-Kt81outjiPjLf1U4pxVn+sANvGPLVJ+u71Z+t71DsNkSwBt-13Ov-1oOogNuWNMBIBv3FH+uSJEiuHyCjMwNn4uwN91LQN7cXwNSBsl1K2vr1h+qmipDIINcEuWlgGrN1u6VoN5BuN1Seqf1F+uYNR6sf1Fetv1ZCRYN0Bsn1sBs318Bt3SqsToNxErrlxcs4Nl2XENrBuD1jipj1fBpEichsEN6+rANOBr7VLWLfV8hqj1ihpv1ohsRKXmod1i+vc1DeoZysap4N5+uUNFJQf1C6tQFKQu+5Q9IkNvEpQ1mhr51KlWMNbupMVH2qTVXdIHVuhsT1+ho4NNhv0qQmsCNZevYNvBsMNNPy8Nlasx1+Wux14RPiqLhr0lbhuINdWtx+cRqHVeWsS1SRule7H1SNUUvSNorMyNuNVgERRoylRcsYNz+sRqTBkqNnUpXl0htCNdRq11VhrgN+8NaN2Rt3VPhqi1-is1q9RoiNp+qiN1hpiNnDW6NYGvd1vhp01nLz-qDRs2lUhpqNMhp0aExqw14Go91n2ulecxqGNMBpGNHRu8RjVW2Nahvf1JRqiVM3MONYWp2NQhr2NIhs6NElWLe8xvOlTRqWNLRvuNsWquN6hp7V7hq-1c5QeNHxpONDBvANZRucaJ5keNhMrMN1BprmKrzBNdMqa1rxpBNARuONoBq+NGRqYNQ5WhN-xuRNRBtKNaJpZaU2qRNWBtON03JpZI7QqNmJsJNgJu+NJBrraZJoJNhBqJNUvKA5mzSzaMJos1B+tbl3sxZN5JvpNlJtRNtRpZaG2u5N9BuqNQJtxNarUFNdJuFNixtFN-JvFNbRvsNbQuoFcQolN7RtuNBxuZNKpoVNSysGVP6vM6rJrG1E8oZ1iANu1QpskNzxplNyxvPKeptNNrht5NOJtlNyWmtNkprNNLCotN8JsdNJpudNtppFNVJuBNe3Xh1NprSNdprONJJt9qK3X1NpWvp1Vmp4q4ZsDNxRuDNxJsJ5LPVWN9Guw1c2oK1nL1jNXpqDNPpr5Nlpv9NdauzN8ZtzN9pvzNA2mp1RZqqN0pt9NYpr26FZtVNzRrGNdZsRNDZpeNTZvLNLZq1NDyuo1mZvrNXZuBVGZvDevAp91-Zq-V+Rt7NnZuQ1CZsZNtPJzK+fQjNkWoql0WpWO4urjNVZvNNNZodNefVXNlZsaNrps3NZZqBOlhtHNjGsy1fytYFKZrY1MmvTN45vDe85rXNe5rEVB5vdNFAwt1u5oWNG5rzNL5qLGx5qnNJZpDNSZpMm8pr-N1Zq-N7Zp-N86pAtn5tLN35p4mkFsC1wRuiNdxvPKlgwXNs2o2Nfhqkp1PjQtR2r6NE2qkO2FofNH5v3NYFuQtX+0It75qeNJFpgt4FogGFFtbNbptotT-XotJ5qx1Z5vCJHcxwt72rwtRpqHKnFqItVFqfNpFvVNvVX4tlFvBNMOshNciwj1Alokt7Jsp1Z80LNDFufNTFvaaYluUtwlsxJalpkt4lthNoetUt6Cx0tGlpotZFrY06ltYtiRvYtnsLVWXFuvNGFpmN2ryaWtltyNN5qstk5Kb1slr0tShoMt+F0vN0mpct9lq6145z8tBmvQt0xqCtIF0nNCFviVcJp8tx51-N0VumV3ltMt92hstnlrZNI+o5NkVpCtdmrCtPFujN0uw8tuloytVBqytaFyitwOqUVJqupNOwict6VoNNyOpl1-WyKtxloAttfISuLVosteRrctjlrStxVoatS+rKtbl06tUFuotbVqZNPdz-ViVo31jZpSt3ZLn1-VsjNhpoKtyexl2zloSN3Vs91fyrR261rTNgVuXN61xytJWsXNucoOtlWwWtrVsTN7VrYeU1sqt-Wtitc1uzJa1vqtS1sat5hv62F1q6trlq2teGueti1pOt-GoitQNwStd1tZ1IRrithVmw05H38tG1u+tmxo2eUNtAhANs61Z1p3miNpghAJv-NV1omtndnRtH+KxNDJpr5ONuUwH8n++ORtht+1v6N1GVJtHAKt1deupVQ1swSNNqRteVqXNVNsryzNvSJoVtwtbNvwtJEU5tqOJ6NqSt5tvFo5t4CP1JA1ohNjNv5t4trNJJVoZtClpMiAtrLxV5oCt4VtRt5iWVtIhNVtFNvVt7Nv-yWtpM58Rr2tetr5tb0UNtuXJ1tJtvytKOqZtVHNGtQlpMtIltxt9tumtGhs0twpPCIFtsp51tpFtK1oNtpMssVFBuF1ABr9NFKkNt8CrstpttFtAdoxlQdrYNiFtGNj1tT0EdoIVBNunNRNtnNr5FTt8doUNMVv0tydr1EgdsutM5vgFbRBztJdsztZduztxdq+tlNrNtI6Qrtddujt-tqw0tdodtkSuxtWds9k7drdtKJqdtWlqLtcdsrt9-K5RTdo7tfqvTVSZPHtfduxN41u7t8iBntoNuJVSdudtJNt7ty9qn1s1rXtXto3tJhuh18ltwNsdoLlE9rTVjhod5S9v3tw+tKtitvvil9u8NwttOt+trbtw9ubtNtqatMttftp9vbVSpoAF99uNt6xpbtttpltAwrTtFJqxtpdrHtYBkjtatvft71pAdXsrAdPJogdVdqgdoDtztehvztyVp3taJDxtkytnthNtHtSmLwdCoqQdUpugt89urtPdvQdI9v9VzBJIdcIQwdQRqwdBhsLt7ZgYdMDt1tcDqktdtpodb9r9twDvNt0DrIdLpsdtlDrQdiDqYdkRsTt+xsHt7Dug5-DqftDduptCju-ti6t-toooYdltphtvtqUdMdrbt8CJ9tgDu4d0tqEdhjoZ5ktsktpjsbtqjoIdGdqId9DvwRctssdh9q0NN6icdtDqntqVK0dEttetg1tvtrMR8dzjr8dUtoCdvDvMJm9uEN29rkdbNiCdnjvPtf9o8dijsBtGtqVtSTrUdDhqXVmjvSddjpQdDjuRxcTuSdKNuft4dpydkTpuN0Ts9tuDrKdV9v31mVrCdCDulJwdpQN1VrDt7jsjxwTuRtZWtSdd9pqdD9suVxTuUdYto6d8Tqyd5+MKdGTsVN2QuydIzqKd3TpKd7ToidtTsu19TqPtL9q9xkxt6NAjo-tQjv-hozo0d4zof0j+NEdndsgdxDqOd-+O9NoFoHtVTvLtFzv2d0zsOdZNqFtAzvmdQzuPtLNp5tejtbt4dur+czqjNgjsbtfzsmd2poPV4zuBduTuud4juIdELvKdMjrVNMTshtsLuWdmepvtazt+dTv2OdVzoodXdqodi9uRd-To61bzv0dGLt5+VtuMd2zvgd5toJdADqmNJjoad1LsxdlzpzNULtxdY9ppd5Nt0dKToWdwGmCATLoedsIs0dHLpedRLoBdOzqBd-Lv+dy1sBd1NuFdmzsft3LvedWGjldaxrpdlLp4d-NpVdqZopd3zpldHNq1d5LrVdurvFdsrsldILu7N82uC2fLrJdOjp1dirpJdN6gNdtrqNd9rp+djrrNdkLpxdZzvodTru5t3FvVd1juptxnLsBgltOdqDuIdwbqxdLLq9d4bvodkbuZdxZtZd3roKd8boFdDUvGdqbqldb1o1d5tszd5roHNt5qtdebs9dY1rZdEbq-+nLrtdgzoddvLqs5ZgITtLDvBtbDtiddbpDdcltWdbjtrdFbpFddOuldJro5tv6oEBDbqStrDpwd5dsHd9brztI7qbdY7uztE7rbdXltHdiLtxt87qjdibpjd+Tuntq7oTd65tLdybuntcgIXd8top16LpvUh7rXdu7rEdZbvod57p3dj5rDdm7u8dt7rTdDCvjx+ojUB+brHNPVqtdz7qzd-jtPdvLt-dn7tPNP1uTVnzv9dxrqpdGkIxt6dryddDuRxyEKH1dTrRdnbul0DJNG1ITqsdDLug9gtvldrzrFdUHp1VKtuddWzsg9Obpw9xHr9dUdvpdAHrQ93fNytXztddervxVdjIsdmHtcdHhrNV9HuOtrNrI9gbsNV1nJRd9NpPdqHtT0E-J7djutCdtHrE93How9XToI95HqI9pDqkdwxvhdlTsE540LBV2rpdd1brddwGhhVlbp09xLr09dHs+VDHog9THv7dLHuU9L7uWVHyoBVqrtI9lnsI9AnsYdtnp1NMaoc92nqc9unuY97ULM9PHsY9vnqs9-nq89hrp89xnr89QqoC9cnt49znsU9rns4dXLuC9Lnus9bnr-dUntE9OwgM9EntMNWHuk92Xq094XoVdKXoS9aXqS9Vbsi9IXui9YXpI9JXqq9qXtC9+DrhdjbqQts7ughtXqo9sDoDd2HqU96XuA9bFtA9C4KK9dXvw9fbsa9NXua9QnsoNCtoK9MSpG9XXq4dPXrm9sTqgN7nrBdb7rW9GXvy9WXvYdW3oG9llqG92r28A+3pLdV7v3d3jtO9LXundbXuXdJNqu903pDtqBradvLoe9hLt7d2bv49Btre9tLoi9Cnq+9WGh+9hnr+943rK9gPqMV73sk9O3s49r3oh9v3vq9-3t69HNosV63sg1fypO9cPuB9CPtB9APvDtKPu29HHp+Ne3sx9uXoPtHbph90ugx9snpm1QXoa9YPrx91vMe9LToG1W5pvUmvKZ9Pmue9tZoZ91PsO1FntK9uPrZ9jPsh9eXsJ9NVuJ9vPre11HuW9u3tW9wvvh9Y3s+9SPu+98vqx9ivv-dsvsht7PpF9ZPpQ9FPpTt2voV9orpx9yvvB9kvox1yXrp9gvth95vtp1UPrF9L3sp9omNR9JGpBeVPq5t5nul9fHtN9PPo99gXv59Vvp99Qvqadw7pmtbZubdWvo1JZ3ofd8HuntzvoJ95PqJ9cvpD9U7rD9jFoj9uNvj9B3s2t8NuO9Wfuj9k9oSdmjvz913rT9Kloz993qj9pfvdtNzo09mfqr9HPpB1rTu59wfr99sXtp9iPpW9kfpT9mDpu9q9ru9XtpL9jfqqtLPsPNNvrb9NPoD9nfs199fp79zDr79sjtud2dqH9Ovuvts3pn9lfrn90jta9-fqX9nsnHVSpKn9Jvq79uNoP9vjvk9x-o39XtrP9nTri9AvqD9gHrMxLvp7Nx3py55-rv9gfpP9JNrf9t-o79l-v19eoh-9z-stdUm3fdGzsc92PqV9X-uv98WPf9f-qgDV-twdQAYT9evqT9kNuQD2frhtmFp-dsAd-9R-oQDAAfYdOXKMdRnun9hAdidxAbY9F-oIDaAdP93XMwD9dprdlPsoDwAcHNP7vh5w-vutBdva9i9oP9JAZB9NAfF9FAY4Dq-uQ96-vID6AZEDRvo+9GvokDp-unlKnt2NanvD9PAbiQ+ogUDrAcLdoAfHVFXtID--toD3-o0DKAfEDBgev9RgYYDQDuq9Z7vMDBfrPtYzrfdOgZEd2Lr3dsboKdjgcUD1xuUD6ftUDAYncDmge-d2gZsD1fv7t0LpvdQQc4DYNtu9e-t4D4QdEDKztQDQgckDG8uMDInrkDhgeSDFgZo9iAfLtfgZSDvOtMDSAdiD0gft9ifsSD8gYyDtgZ-tjzocDRQbV9xvsEDjvpTtuQcyDMvrSDZgYqDwQbnt17rcDtQdJ9a-tSDBQZyDvQbw99QdkDgweztzQcqD6juqD6PsmDnQcIdsfqfdwwYgD6vsy9bQcKDFVoiDK9sX9dfu-93BryDIusaDgAf2DLQe990AaQDJwamDmToOdDgcuD8wfsdiwaDpYAaOt7fvwDYwbKDewdpN-gaO9OAa+DBwdDtLfsA9dwa2DW9pUDA-ouDfwdOD8Xut9zAeBDcQdRdJgY+DMAchDVwamdgrvGdcgN2tlXrID4wf39cIeKDovtKDRwaID+IbqDMgbWDuId4DpIb6DYgYGDSIYhDLwcn9XvuhDD-thDKIfuDcHq8dTwcxDL1uoD7weJDFAepDIwfJD0PspDagZ5D-1o-9OIfpDOQaFDKwdGDFIZlDEwczl3wdz9vwYW9nvu69ZweyDyoZPtqIdBdaPp7xzwZi9TIa1DLIfODsob1DHIaTdrgYPdKof+DXPtZ9QIatDIIaidYIeiD4oftDUIfv9Fod1DtvpZ12wYRdHod8D9Af1DFrrYD2gdDD1oY3djwcopxoad50YZcDj7u5DUYddDFTvdDuweRD-oaF1zPoetPgYqALAYdDzfqdDbIezDdNpm9dIYFD6AdTD8IeE9+QaVDeIZdDtYYrD9YarDdAabDBId19iIbbDnwY1D-vuZDPoZ1DjYb7DrwYHDn-qHDVIY7DZIZKDCQZ7DWYZNDfPrHD0obnDuDondugYED-IcBDlPrXDTgejdSYdjDStO8AO4Y8Dnxq6DF3qeDx4dVD2AdADl4aLDo-tgt24djlV4YctVrtvD3ofHD6wfHdT4bvDeYfBDX4ckdz4aBtgTrfDYYYLdAQaFeR4e-D74eXDW4ZTtIEcTD53ttD3jvgjaYa8D5fvzDmMhQjzYae9xYbH9j4YAjP4e4Df4bndUEdAjX7p+DN4dIjCEZj9XIbjDWEc7D-QdbDsEb1E9EenDhIdnDzEfYdrEZpD8Qe7DnEdidE7u0di3st9MEZLDKdrrdQkc1DS3u1Dn4eztEkf4DkAc3DYkb1E8kaoDUof0DDYcXtqkcAjPTsCd2kcIj2DuIjnsn0j0EY0jK4fLtJkbIjIHrVDoAcsj1EcL99gfR9dkdQjO-p2D0SpbdnnIMjS7uDDAIE8jpkYaD-EchtzkewjuYaIjPkcxkwUYYjtIaYjykfYdkUbYjXYcrDgUdxt8UZ4jCIaSjsUY8j4nuFDM4b4jmUaCjD2K8jM7qMjWkcKj-kaUjeEfEjZUasjg3psjEEcEjcAbeDiofMjJEaWdIUc59uEYfDcEbqx5UeajyUZJtDUbwDS4bMj-Ua9tg0Z0jPLvwjW-tU9rkaDDmYdXDPUZqjh3rqjrr0gjbUaijvEYyjlUZYji0fsjdgZuD6PvGjRUaiD80f-D00aUDs0fU97kYKjiHoX1iUZij20bij3bpyj7Ebyjj0ayj4HuGjAUfyjKUeej8oZFDDvtGjuDtbdF7vvdDkYOjRoZBjd7uItiEeTDcYahjE0aVd4doRjx0d39p0bkjf0e89ikb6jP0ZJtKMd6jooc0jagfxjS0Zz914YgjJMb2jVQfRDb7okjjUa+jFUa6jKkeqjVMemDNMacjLMZcjC-rmj10ZSjanLUj8AcZjENr5jqvrSjdYcODQMYsj-McRjTAfEj0sdRjbkfONLbvljBMcBjuMa9txnMkj-YbNDg4dkjxkdllu4fXd+4dojh4c1lJ4cxtNobhjpsYNj5sdg9lsYPDcnMDEJPpej90Ylj6seBjNsZljJnrljzsf+juUa2jTMbijnsYVjPMaVjQUeDjqsaJDksbkjEcdJjWAZfDtkdjjrMeuDMwchjSca5jZfo9t6Mf1jvsaxjqwcJjLUZzjI4dND0kfNDE4eJj6cfajTfvvDwsbxjlcY2j6UYejgceVjuceK9+cbVj70aRdnMq9jUXvddHQYzjNftCDBTrFltsfAd9sZNjjsZHjPcasDvLqnjIcaujYcdxtc8cjjHEfdj5duXjcccYD3sb1EG8eTjaIfTdb7t3jA8ZCD3Qente9qrjI-t-D4Uf-tCUcYjbsc7jLtq-tm8csDE3vcdT8b3jBodd9CNvPjDcfFjAIbXjNdvfjx8bPDSEaeDP8dvj0Ufvjzccht4CbFjLYagTtcd3tQCYvjXAcMj18dgTLsbvj-8YfjJNoU108dfjs8fCNkocFjOMZwTXtrwT88YzDvMdwTRCfwT9Pr7jjIcXDOsY-DYoYDEFCZXjb0egTS8doTlCe8DJUbUD7CefjWQb1j+Lp4THCYDjiCY9jSlt4T6Ef4TAYhY1xCaajBcejjRcZBtwCYWDE8e+5TscYTUvuYTokbITUiZ0TFvuxDI0YATqifgtH8fDDWgYpjtGsUTDMdITXCbrj0ifETTcckTUsecTQidaDrCYBAtiboTMIZ9jRibt9r0YkTFfo1jviZkTWceoTYSY8TlibAjFEYpjGGrsTeidMTBiYsjiSb8TrIaqjrut-j8CewTjiY1j6SYiTtfqiTwMcKTLiYQToSYWjwFs8TMke8TmEZ0NSSdLjusbqTa0cCTAYdBDfCevjE7qxDege+jqSdajbSZzDHUZrjlSbOjaiZQTkQbRjJSbGTFifUTDwc0TF9u6TvIfUjfSfyTVScGT5YZwjIyYwjrSfGTOSa2TV8ezji9qWTjSZEjKSbWTMydutcyc5DRfoxDcobzjCoeUTZicnDGyYz1f8cdD-SeHDeyYgTm0dcToyb9D3ybgTBybCjRyc9D7IeuT48duTtwfBTEycDDC8dDNvYcBTmCcgTeSbcTAyaRTfseCTfyZ2TJyYyTvoc9kuKaKTQ8a3dDSbxT5cYDEhKfKTqKf+TBKdJTRKdPjyEaojEKZjDCyb-tdbvXD2MaeTnydKjOXuRTvyYqTOyfZThscvdNEahTHMd5TmKddj1KcFTNsrJTIieJjsqfpT54fhjiqapTHyYuTGMYlTDyYBjUceeTCqa1TbcceTHcY1TxkdVTNSbLj8qfkTZqdiT5EZWjje1vUBqdG9Rqd1T3Kf1TxcaYTTSZYTRMatT2UclTWCfVTaKdNTvqe1T-sexTcid8jwacNTOqdXjrqfkTKsfNTzSe9TPidFjfKcbjAqfDTEUfjTNqesj5MdWjmsYUj7cZdTJqa0jWaeZTxsbFTacZTTfqZRTAaZpTJaarTIaaxT6aevj+aYFjSieNTgafrTZYbeTuSdrTgqdLTsKY6TsiZbTA6f2ToUbQToKbjTDaajToaebTk6eTT3adr1vac6jnaYrj06adT0ac4Tq6anTi6aQ9-KelTGae0Tc-OzTtUdzT9qdbTcqZaTF6aVToCfhjo6Z+TaaYPTI6fXTwkZMTqye3TFQAvhaqZXTdaYETMuMvTSaZA0-6ZvTVscnjwGe-T2ycPTX6YTTXqcLjoicvxZadhjDsa0T0GZPTy0bPTMp2td50c8Dl0aoTi8ZoTCGcHTboc6T86aAzhGbHTwycOT0yeztqGcQzoqccjRodozRGfTDJGeoznsiYzFGerjVGfwz5CfAzMGf0Txab-T5GYfT7yZ-TOyY4zImeXTkGevjEmaBT46e8jpGawzE-o9TZyffTv6bYTfGbQzZMYTjEEdkzqadEz0mcUzemerT+6b7TUGc0zdGfBjqcbd9xmcbTUqbMzMmYszzGbQjkSZ4zuDtszM6abTT6aMzTmc4zl8ZBTbGa7Tx6csz+0eszCNuvTEGe4zCKeiTu6buj-qbEzh6Yiz-GfOTH6czTL6akjqmaFj6mYXTwWeczuGdYzbmfcTsWb31pmYSzz6eKzf+sozAWcKzMcfSz2sc9TAmdSzR6YTDIWepjB8acj96bkzVWYnTgWbXTFWeQN3WYUzvWZ3TuWb8zqCaGzNWfMTrHoAzcGb6zo2ckzwKZ6zk2aCzLWbyz3MfhTgFvDjdWdHDySbUz-ae2zJccyzDiaazSWa0z8caAjTNtOzrWbZj7WcrT-Weadg2eKj5WfmzXWa4z1Weiz7mfY5IGeQzF9qk532dZTQrt8zC2fkzT2Z8zwmdez-maWzH2fXjQOYhz42dBzw2YqApmrMgkWfezm2Zdt9RpRzyWb2zh6eRz0MdDdVmfZjRobxzM2ZUTi9pJz-2YrTbvopzqOahz6OfXtmOfxz7bpjTgmYDENOexzWWZ2T6mqxzZ2a3jvcd5d3OaZzi7oRzy2bUDgudJzeqbZzYNT4xtOYmz0OZozQmp5z12ZTjROZsziuaFzx7rDTjmYHVSubWzmceKTouY0zOuY1zLjqLTJ2bI1uubGzkycVj8uamzymMtzwOcezJ0cRzaWfJVDubhz1udDjtuZWzMmIlzsaZyzBKvdz+makzUWfpzMWdZVQeZMzj6Yczimfw1kebsz8WcMzLueazvucpzDGbd9ceZNz7HrNz2WYij0GvjznmfszZWdjz+eazzfIeOzueYdTbubLzKyc5ziWdLzfudZzEaerzjeaaz3SYLzG6dnT3meTz7eZrzJCa5TTefqT96o7zr6d6Tdea6Tb6pHzGWbfT4+cUzEodbzlefnzaeYhjbvqXzsuZFz3ubBTryaXTi2blzYeYZDGKYTzNaeLzyebXzHOYrzOyfHVPSY3DF+cPTV+eWT-eY7Ti+YwND+fbTOecvzL+dOTM+dvz18aB9HubhTeGc3zAYj-zwed3zG+f3z5dpALUeYMzoeeutkBZiTyuf3jr7u5VEeb7zb+ZZzqWcxVU+fqzR2YHzmBZbzy+bCzhENQLC+YwjWBbQL9ibwLueczV2BZ2zDWZSz1BYLVtBcOz3+aoLGEZoLFBd2zs+ZdzHBdILGacxDzBZUzrBafzGEYELnBfoLOOfCjYhb4LUhZXVghd0TEhe4LhufDQKgA5kPMnULEQAIL6+edzyhanQqhY0L6ha0L5+bYLGabfA+hYML3MiMLvOZfj9Ccw65hYsLnMisLiBc-jL-sOeKgHsLDhacLeucHjDKf8F7hbULDhc0LJBcILqucP+CYACLnheCL2hamTuheZ07MkCLjhaiLxhZELGabiLERYsLXhatzABYKzQBcce8RYSLmRcdzb2bpzcBdye+RcCLhRf-zQ6dczuRZbg4RYSLQRcDz4hdwLKRfCjaRYaLlRdALIOZ0LtRfaLBRaSL1heETdSb6LFRYGLzhasT4EeDJ9Rf6LTRZkLpGZGLkRdmLIRduznsOmLoxaWL0RZtzEBbKL6RYMLnRegLIebRzpRcaWaxcWLqec2LXue2LJxfKLZxftzzReEL7+dSLpxYyLYxe8LJ8eVTRnOeLexdeLWReqLBud6LXxY0L+xaPzpWaTzsRcBLhhZ+LRRchze+eOLUsI8LLxY2LyRceL4UbMLuxaBLUJaqLxGeHTpGbRLHRcxLXRadzMRdqL0heWLyBbLVTBfuLY+Z-zpGd4LZJbs9+auBLhecTzsBeJt4RDpLFxY2zcJYMh5xeRLGBdzz5BbmLLucFL9JY89KBaRLgxa8TgGfUDxuaFLuhZlLTJc7zXmZjzp+YwN8heMT1JZML18avz6paCTRebBLtRYVLBJYOLYBZ6LVxZiDspdFLG3tmDapapLN+a1Lc+dtLcpcNLOpbtLnKdaLjpctLnJcAL5pfFDTpatLhodXz-pe9LORd9LvgeDLfJa3Tz+a9LkZZCTH+ZjLkpdqT0pddLzpbDLBYYjLiZYtTLSZTLAZa-jr-ozL4xbiTdqcwzOZZDLOJdVLCZcLLtqYwzKmyNLEparLOaZ0zq0dLLsZa1znpcVLo+ftLHpYrLHZenzmpe7L8pdJLZZZqLaZdXUchbdLhaf5Ll+fHLqZe5LIYYqNupfaT2JZHLc5YLDM5dzLrhcjDC5YnLzqanLd+fXLw5f+Lo5fjDvJczLiadmz85d7LOBYeLe5e1LB5dbLc6dPz95bPLsGbJzW+eNLIJejzJ+cHLz5YbLp6abL9qaHLD5e7zP5e3Ls5bZLB+frLbxZAToGa0TQFZfLjWcXzv5egrGiapzCNvgrf5fQzAFZLLyFd+Ly5aPLq5bHLYFY3LIAYgjGFZQr8ybQrr-twr0JfhzZpcIrJ5buL4FYXt75agreFZYz5ZdArV5boLLRZRL7ZY-LzJePzBpePLLZYQrDBfjL3FZYL-Zb4rPZYErSpf1LrJZYr8ULYrtFc9zXJYgrbRBFLh5eJTqVK0rwFZVLuhY5L+le-LtRaMrYlckLtJcpLzFbxdcSDMrmFe0zF2YvVclc7L7pZkruhfIr7FZczBFY0rhpWIr2ld8LjFP8L+JZUrWJY4rK5Z8rVZSCrMxdPL9lfOzukcoWUVfWLMVYorNyfTzYRZuLiJeSrnlfyznFYBLGVe+LIVcJLxRdhLEVciWEJZ5kklaEL0ldvL8xemA6JchLhVZNL3ReJLo5eqALgHqrFVecrfZa7Lbld6LdVeCrWVdUr2RdyrrVf6r0VaYrJFYjDQrzarHVcsLXVevL1VajLGEbRQ-gFmrvMnmrPFZvLS1YzTK1bWriRcarn5ZgLRxdKrcSF2rA1Ymr-lY+LcnLOr41drCO5c3TcZZ2rCyD2rjRcGroVa8rOlaDpN1aSrF1eMrwlcIr31duLd1esrXKISA8QBerlVYULvFZqrLubBrENY2rUlZ6rMNd0LcNfOrwNcmr1iddeqNdurMub+rilZsrOElM08NYOrgldBL+NdBrRNbRruNfMrShdqLgKARLBVberRVZhL4BcIr9NeJrTNaarRJa2LbNY20HNd+rNNZpLsNb5rVNcXLQyeKrrNZOrOEhFrONbFrmyearPNalrAEEe0-NfRrl1dvTLPJVrotfurXeYMrpla1rstZ1rypZMro5d3k+VYxLJNfkrLJeOrSlbgY7Ve1rINaUxLMHtrhtcdrzBOdrqteprsVb5zM8ePMq1YdrGNcmLjeyBQ-tddrgdfiTVUq0kntblrPadNLLVcIrIdejrRtYUrNtYJrAUHBrAdfVrsFYd50wAzrYdazrP2dYlzOiTrbteRxtYAZrFtc5rh1cOLJRaVrXdgrrDVarrpNa-L-1brr5dZLr4deLLKm1Zk5tcbrAte9rNhf8TwbLZkHdYLrAOdzFHgBdrP1bVreNdTrnqMnro9dnrtddtrmKCnrQNa9rKVchTaVbfFKWkXrgtYdLLubQQkNY1LSNe2rUhdx1MdZ3zCtcuLhFaPrCNaqrp9cer59ZJ1l9b3TLdfJrNmIvrydetry9bTr3KPvrUNa2rT9dIzW2j8rS9ZKrK9dAbx9b1LP9Ygbf9agbADZPrrleRrJJc51r9bizQlY-rzBO91M9f3rA5ZJLgevQbJWffrc9ZsxhDe-rmDdIb2DfIbpdbQZNDc7rNZdkB8eqIblWYlr9FbrrzBktrLlcnLZ9ZAbzDYobZNaob4jP4btDbXpIjYYb2FZNFTepYbA2bYb8dY4bJepkbD2bkbitcgbijYEbJDd-rd6MrLm9ZZTVFYGZneqUbofp8LV1acNhjY0bR1a0bNmPMbojd0ZNjYkbjlcv1atw3r2VfWzPpdvrq+qMbqfpMbGtey5njYsbNdbgbnqP8btjcuZITYcb8VZEi4TbHr+jePp0TfAbktcgb8TbwbvVdHLdhq4b3VeQbvDcPrr+q8bvfv1zn1blF4oqbrVtcobVjewbuTYCbcddUb8DcqboTYAZwBryb8-oKbAVYabdld0b5ae3rAzMabVTevr6lcgbPTfqb2XMGbETcmj3+vabrjZabpjceF+Bqab2-rcboZdvrszd6b3NZvrHDeWbQzacNGzdGbSMbk02zZibXTePp+zYSb7DcgbtBrmbM0YWbI1aWbNFferOVfCrZzdubzNbor8jcebYDZSbKDbSb5zZWbKjbWbkDfENFzYujVzYeb8DYBbPzZZrpzdBbk+fBbLzZqbnqLBbmzf+FelY+b2Tfcr2iRcbQ1b+LhTauFDeZ2bssZtS0DaXLYVe8rkDfRbgLZwzwLZJb8DdhyGLbublLexbRXItzMLbUr7jY4bNLfJbp4dQrhzbAZ7LeZbw1ZBbnqN5biLZYFKRo5bFsb0b3LZV+6ueFbootIqtLeebLLcWbddblbYrbtjErZXz-hsJb4tYhbrzb-rwcGlzqrbHj6raILz7wNbfLaxbrTYsFhRsNbyDq3rGrePeZrZlbP6utb5rfwrDLbGFjrbxb28caqLradbb+MDx8ra5rvzf6berYDbNrfIdnTftbz70ZzfrfPNYbddbxLfdbBgrmN4bZOdhOZWLsxrC1qbecDSGfHrb+JTbCbY+rlrY6FWbcLb9zapbaeILbsbfCJVba9b-OYKasWuzbe4dzbsTdw+DxqbbRsZbbkrYTejbbLb9LeLbBgvbbfbambvjZoFQ7erbv+N7bE7eVeU7brbvtfvxs7YObUbZAJi7ZOburbTx47bnbBCYbbVla3bthZ3bWrflrqzZDbG7dXbKLeAbLuYjeu7aXbJrZXb17bXbcLcnxZ7YHrQxcAzV7cPbsdb6brLZXr77cQbMDbKbQTafb97fPbbZcvbm7ZvboRarez7Y6bXbeXbbbeg7kzZ8b2deKFwHZfbUpYvLFsHA7D7b+beraw7IHcfLuhd-bGTYWrj9dA7hHbw7aHaTLGHd7xH7avrx7e-berdrbEHYzb4byY72HZPbJeL-qbEWY75Ja2NdDW477HYY7lbf47D+B47DJfPNXHdE7gnaVbP7ck7Q0a4LQtcI7cnenbx7yYMAnfw7IFdqL6eJ2g6nco7WZbfbgeN07MHfozcHfM+anak7Gnb1ro5e07LkRU70bdZ0RncQ77xdHbBgsM7Fnb0755bfL2uPM78ncULina07bnd870NdRbAXbBqjncxbbrYHbswrC77neM76bd47nL3Y+4XbpbI7eQ7sraS7sXac7MFcLr6XZi7QXaAbZHdC7sAmS7Crf5bFbZLxGXfy7i1YvbhHfiqJXaDbOrcfbfRLq7mXYi7ibai7srZa7VXdI7BHa07XXbs7U7367e7aHrFhR07rXZS7SHZy7uYthy9Xerr1TZw7grZTSs3ebrljcA72De0Sy3dKbgjfKb4jI2743dK7Fremby6v-im3e4bu5ZC7aTb273XaybNXZJLqsVO7mTZ4bt3bSb93f27DXdhbC3dKxQAIe7JHZu7hXZe733be7c3a-bMnahbDnaB7K3cCbiTfgbpDJ+7m1eq7-3ZubxXYh7W3c0ba3fEZsPZR7Z3YeriPfWbT2jh7iNb+7vXa+b+Pax7j3fO7z3aWbpgIJ7D9aJ7mna+b1PbJ7v3ae7uPbObjPeu7LPeJ7VPdiwNPcAbCPa57HDZ8ZvPaQbnPfp7t9aF7TPfh7PXbF7gvbzCwvf-b23fR7aDIl7HPYp7rPdqbxTdMiA3ZcZmvb0Zw3cyTLiXv18vaJbRbaO74YqN7kvcJ7ovas7HjbVuxve1bH3Y472Dfwx9vaPbwbaE71jYkCrvc-b9HdB7YGOR7qvZx7AvbUbXvct7tPet7Jtdvr56O97dHfd7fvesbPqxj7b9dW70Pe0bqCCT7GDcV7qfYT7PPbD7fPel7NvY4b0fgz7xDZT7kLc9Rxfbz7IvbV7wffgblfcD7utcj7RfYtmJfdYbjXc+72Dfr72vafpHzNb7sjfb7TvfEZvfar7CvbR72feob1Pj77yjYH7Hveobdiin7xjec7aXdzFVqIX73jaX7U3a91q-ZH7JvfLbSbbBFcQjX7+Tcm7ebbHVh-Z37DvcVb1zY4b5-Yb7xtdbrkDexRR-eabJ-dbbzLIx4z-fmbqXc37OOo-7F-bd7M-fj72DYXraNc-7lze-7p-a+1I9dAH--Z97cfev7K9Z7rqtbAHQLYgHb-cb2SA5gHd-ZTrO3aTJmA9urKA4pbaA+7bMp3brWA+77jezIHBA9gHsfcAHCA7-rudeQHNA+T7UPfL7Ttajr5A-17+KfkQidc4HYnbFLyWo4H1A+wHsDfH7yOI9rfA+k79A65REg+EHFA5i1a9cyrWva4H5KeVrvdc6rY3ZEHAHbEHSZLNrTA60HWfbYHzBL0Hkg8s7TfZXrJg7kHKg8tTUaAbrGg9s71g7qT7NdMHHndfLkudsH+g-kHKm2xr09cIHnLcorJA+8HlNasH-A+tLPeJ8HQNb8H4rcjbt7aFegNaUHevdCHgZfk1z1ZcHcXdCzkHfo5odd8HzA8z7Y-aMHyOJmraQ6y7XLdM7XfzGrOQ4MH+Q-XbSmKKHIQ6kHArdqHFQ8iHuQ9L7rA5qHzBIWLCQ6iHarZiHmQ9Ke6g7mrmg68H5m3KrQw4cHSQ7zLbhbsH4w+UHkw83LuRJmH61eGHjg7fbiVZaHVQ7L7HQ927AfZGHg9NJ7mw-aHTXZ2H6fdaHbfcd7s-aH7ufcOH83cH7dDeuHew7nVEw4aH5XeMHjqh6HRrb6HLHeC2cvbOH-fYuHQA4zV7w7+H0-YBH0g4DVpw5uHIPfBHzBPeUHw9tbxrf6HQrzhHII8X72XcgHYHt2Y8I4jbsHdiH5fMhHjw81tvw6hHvvZhHBTuJHhI6VtFI9WH1Hfd9Kw-mHpFdWj1I4ZHU1ebL7PcpHd9vHV2I7TbGQ++HgQYeHNI6876ZYFHLI8xrgFfZHgo-cHq6glHoo6DrJZZlHLw-37mjrkB3I5zbJnbxHgFYOHHI8CdKo9RH6-fRH6A5wruw8lH-uaIrBI5NHg+cYriQ8VHHXbuTxo9lHEdftTE7tVHzbfVHSI9Wjzo71Hx-Y37GI4Rtno5JH8A8aH9Dv9H2o8uzJ3a9HL-Z9Hho9rLdbpdHnbbdHfI4STKI4DHdA6DHKbvDHKY7BHaY+ntxnLjHIqfi74nbuzWI4jHX-df7gQ9A2KebmHNo7N7GbqW7JY-AHZY7KHmGdzH9Y9QHjY41HzY7rHmY6v72Y+8d0fzzHYMd5HCXeO9-Y9bHRA-bH7o-tTo4+7HZXaVH4LrKqA45hjCY+HHVrunHoY81dC47HH-g9SrTY9rLa44tHTWf3HDo67rFY6PH1Y5c7f9rPHZg4f7f9aUz9I-PHy-cPjm45nHh3YvHgOZFHD45-7xOby76492d9o8-Hvo+O9m+kXHBOaHHhY+pzP44PHleeAnW4+iHuI8nHmGZgnL48i7NY7fdSE9-HNjsgnx48YbS80NtIE+ZzF3YYr6E6gnXOawnAE+jHFY+In2E8kblE7In146wbBTqon5E-LHuE6Yn9E6EbZ8bonrg8QrpE--H7E9wH3jrYn3E-EruOa4n6Q7azK49ADQk-EnN2cknEEeknJQ4CHu49onfE+EnFleTzCk7a7pvbfHTztUnMk5VziY9Wjmk4m7UY5YnaNuMnB3ZQnOk7QnYk8UnO447HtZYsn73Z7Hrw8Yntk60ne-dtHNk70ndk7tbDk5Un5o+onjjcwnPk48n-bdQn6PqcnwPdJHvY7AT7k5MnBo7MnmtqinkPduHlw7PjPnYwnKjsynJE9xzOU6CnkTbMd4PeQn7XYinxOfynzE+UnrE4qn-E6V7gk5qnak9prx5bAM+E+FzBQ4ynxU6ynwzs6nuU9RLxb1anmudr7p7eBHJU+0nj4-PN-U9gnvQ-gnhk57bI066nzjXdeA09NznzcIrRHeeHtU50HuVMmno088nZU8nb8096nuJZVefmIKnYzd+NJ5lOnlU-8nBCxOnvJDOnuzfMal0-un104Qn3hzunbacoL+Des7WbSunm0-an2NMRsf08an-nZ+nQM5en-0+2HDNPBnn04U7B9cI7v04hnIM-hnWncRnsM787KM7BnxXaRn+k6QL4E85eUhOBnuM5cLjI40JydiJnvk8RHs0+cJ5M5xnlM6+Hck4IJtM-RnwXcp7yrcJndM7CnxA6qnoRw5nLM4K7Q08kJ5M6mnnw5mnjM+mpyY4WnHpslnR08vb5nWWn2edWnyrflnIs4RHDM-xnbJJ06Cs-LzmM7WnKs92n4U+sn55v1nUs61hMs4en+LfpJgU9en1M95J5s5tn4s+RJWs9VnOI+XHGs7cLzs4Nn3M5uniXM9nps5KJfs9lnhHZNnQc607Ic4tn3rZI6gc4jn9beWpxY69nE49tnmgvtnkM+OHP5PDnDs-dnHROtnqc477UpPjn-s4U6Kc+Rn3071n0c8znAg9fV5c9zndw7S5xc+JnExcdHTs-rn9M7FnWc9OJLc65nic8dnds5znJc9SbZc87nCU9KHPs85Nws4Tnpk55nY856nMc-nbJ7RnnFc7CHSBPHnhc7daQM5dnPI4kn7c4IJ684nniU6nnRc1+nG87VHBY8rnBM93nq85pNfc4bnRZZwnoRxOnx89dHp86XnB+I-HNc-Sn208unj8-jHz8+SHVby-ne85Hnb08X2D88AXSk9HnRcx2nl89+NS0+-n+Y7AnZ86g7h09nn27YXbyC8Xnf88OeUC9Dn1newXKC-3baC+vnrc7dniC6wXAC+gXIzXIXOC7WnoC4oXVLTfn-c6VnP7aPnYC-snwC4IWLC7oXpJqIXXc8nnEC5rmhM7gXg463npC6negi9YXfk-YXvM5Xn1C+Vn1c8YXhE7kXQ88snpU6Nn4RIzn788BH6c-kXN8+rLNE8epOi+IXv86mH2c4Lnsi5-bK3W1ntedBna08sXQi6XHxi4WHSgvQXmi7JHfVLucVi8fzA8+Vbdi4kXVM57ni+18XXC7DNf-b8X6s9EXuH2HN1o9cXsU8YpUS88X6BcUXFi9CXwS+vE8S-sXoE5EXL86HNKS-MXerfSXYS7bnES7KpuS-wXI3Ym6pS4wXJi9Mpm2gSXX0+8XP7fz6dS7hnpc+VbTS4yXBE7ZnjS9qXHS7anUM9yp7S8KXJC+yX4VJ6XQy8cXpM9IFYy9SXvA0GXMy4kGcy7yXeAvn7vS8GnMvZ-blg2aXGM9aXGy5WX4y4QXIy6nemy9WXK06SXereOX+y6yXmC6OXey-mX602UXzk9nHXk-PNmBy2XrM-V7eAsn7Jy8VnZy8+XDy+ingY9cnP5NeX3y51nOy-OXXy8uXsk+3ntrxBXUK4MnAS4IWHczeXAs-WXereRXoK+sXus+VbGK-hXeM+KXtr1xXdy-PJLi4UXXS7-rTSxRX-PbRX2nLVWVK4L75g4pXdK8xXXi6YXTK9D7eK5JnrI635oU+Hn4C6kXtl15XKi7GnX4+stHK+JXJxbt7LK8SX5K+053N3pXdPcL7K9dSeC85iXQK8s58q+lX9S7ZXcq6lXnK8bnJ45NluvYVXEfZvH2nOVw-y9Sn0I9iXRnItXPC75XbC6TnRq8tXqPa2Hac8s5mklJXui8bLwU71Wnq-tXwq72nai89h-q7MXZS4N7yS1DX947VXc46g1zI6qXTi67+MwAYX3q--Lvq+T2ya4DXjy9fH407w1ma7DXCa8mXqO3zX0a7JXHy9qHJa42nZa8FnnQ8e0Qq+zXVk9zXnsLrXWa4BXqY-VXQdIe0Wo6WXFa+7X4a+4H7KxbXBa5jXzy7w1DgEB7+q9vn+i-8W469VX1a5pXtQ9nXra6tXMU47XlFOwwE64lXkSyXXw6-nXSq4pXO69LXqa6wr6a9z2h66rXx64crhU6uW4OmXXrq6OHec6TJLgFvXu68vXcVfOnySxfXR66MXBy+uX01a-XF65-XVy+qXwZIA3VY5HX+08P+YG+iXe68ZX2nOg3Jq5r7C686HCG61XLS4aXFK9Q3k670Xp6-hUz64zHW6-ZWWG8I3JK2I3Pa5Q3BG-I3hQ7I3-a9UHLcBo3ha+5Xg5IY3EG+DXUG8o3tG5sH9G443jG7FHzG543rG6bX7G5dX2Pcb7Zq9qHLG9g34m4o3Im-J7QfeQ31G4E3Um4YnT68k3b659rqC9qtam6A30K4JX-G9k3zPaQ3+6-g3Sm-U3g9YjX8a203vC-3n-C9S2Vm4dXki6dX-i2g3gbbbXWY7XXRnJc3HbfgXwG8TX+m9o7LA7SnWi8s5Xm+Hb3c5hX-m7-bu-cNnQm8ctoW5I3YOlxbnG+GL8W6o3qm6S3vG7lHqO1S3yW8Az+G+Rbym44nIW4y3gm9FXwm4C3eQ7dXj6+K3BW7M3r7eo7+W4q3bQ6C3bi5q3TW-OHLk9jX21py3mW6bn2W5K3hW4Enna5UATLYS39G67HY2+fXE27S3IW+m3uW4a3I269XOm4RXEW+y3c2963hq+c3629K3gE5Sei27vXom-v7Km9m3S2+s3QC6c3Iy323r6+W3+K8OX-6+23g27qnw24e3dW-Q7Qo-G3p24c3-i9W35myu3xHal7iq7g3Em9G3M2+e3qHde3VHfe3U2-B3N265XfG7W3CBYh3+nYW34Sfm3UO7+3VyaR3nnalH0O+3zgW+tXHm8P5GO5s9oO-XXxO-69G27vnl2+tTj262nw25p3WO7cHpo8a3C4fz7gO+k3im8dTh25wHT27J3DO9h3Bq6p36i2g3HKdNXx2-p3XO7k3Ym-F3fO8l3hm-k3xm4k3-O7O3-K4u3wu78jlO+nX1O8jT965a3Nq6J3Gu523FE8c20G61jAO7F3RW4l392bRH528RXzm8N3tO4BnVu5ezga5i3ZW7i3Du8Z3PE9SLpu4LTRm6B3Mm+t3+o9t3P25N3nu4F3U69w3FKhZ3q2Yj3OG+vXeq193-M+pXiu8D3ymbZ3Fu6G3su+wz248c3du+13Oe7gnwy7-XoG85jXu5EnbRdN39MfQ3Oq6V36Hqt7-u4536W-r34fcb3Mu883Ze7j3Pq4T3ye2g3R7tOXsq7r3n0Zr3vy6H3MHtFnxe5A3Xfz73oMYcXv66n3kW-xtE+4mXTG-63t0ea3BO663eGpn3YW74XAq-V36+463Ty8g3Hu8P3-w863o689hO+8m31+9J3He7P3oI4v3J+723mMZXXgK633V+9f3uu833l+-K34+7VnRS7u3pe4f3Nu9V3+e4P3w++2XGG5M3IB+D3YB9D39u9gP3o5s3++9pWt+7R3OO-QPmu6j392iwPRu6SnEB--3rs5X38O9+3X++53og6d3ZO+X+3+9XXH+6g3TcLv3RO8YPGB+Z35O8P92q9H3KG5YP2B573ue3YP1e6gPte+4PDfvL36k9iLAh+w33e4-Xlm54P+B4PnaB7kPju-6XYO8L3008n3fm4R3ah+X38+80Pv26UPYh6anhFdx36e+r7Cu4D31G4MPXe7TXfB7w3kh5v3Vh5V3jq-APih9EP1h5PXth+j39h6YP33JMPuHobXqi9i3e28cPX2-CXQB+n3IR9d33s9QPdm8iPAR5FXu24B27B7935h6b3J26D3yB5D3em60PLu-iPQa6CPSR86zUR-C32R-0PB2db3qR-b3zB-KPGe7b3lu+oPNR7MP0u-qPnm6KPeR7d3iR-u3jR9H7VW9rnqh9yPbm6f3bG7i3bR8GPx++GPwR+6P0W+iPau9cPGR8jHKB9mPsR6mPl-fGPBR66P8x9LHe+6WPCK2SPye4ZXaR-6Pse6cPee4QPl29GPb+-bX9B9P3mx4bH2x5cPdm-D3Jx++3pR7D3Ou4oP2g6oP9++0PAB40PRa7IPLe9qPlR5aPBu8BPTR6O3IJ98PVe6kPNh5kPWK2hPN+873zx7CPJe+n3SJ9CPgB9RPi+8o9Uu4hPWe++Pph56PD676P2e8JP0x5KP4R+xP2ttoP7+9-3Nx6IPm8903lJ7X3kB-eXNa853rJ9RXqe45PDJ5Pnuh-+Pbx85PKe4sPT6-PXQ7rgPzh7OP6izFPk7syP8B9ePM66IBPh4d5G6+htHx8MHKh-XXMp-73Py8H3nQ+1Ps+8yXTJ6xPqOwNPu+8WPDx4RWZp8m31p+VPAAtVPQp4OPVR98Ptp9YPg+YdPvJ6fn-J9X35m1dPvB7hPfyz9P8h9s3Vp6VPbp9SzHp6X3vx5IPWW99PYZ-9Pj0+zJUa6oBCx6yPzJ-M2yZ-FPcp8lPCp8v+toPl3zR-xPh-MzPsp9TP8p-TPJsvzP5u7qPRZ98PJZ51PYK+gPtQ-rPhp86X5a86HLZ-NPaZ5NPGZ6rPDe+BPtZ5VPnZ8m3w57tPSstHP4Z9zzcaCQPZZ5zPFZ485uvYbPWK-BX5q8XPrZ76X7q87Xdq89PP8+9PpB+dXjp-Z3zp6HPa567P5Z57PB553PPm+NPC+9R2256jPxB73PsZ8vPD58ZPK29zP6i3vPKZ62PFp6lPtKy-PWZ9nPpx4-P-59PPI57AvY5+Y1AF9LPP5+7Pt54zPEF8nPGEenPh58z3vO9tXiF4TPls-jW0F6XPrK64PhQ9wv657WX3J6fXRF7PPc54vPC55nPsF-PP8F5fP357uPv55AvkcJovTF7gveh4YvgF9ovlF-ov1F9QvNZ-QvxZ917HB5H3ep8IvIl8EPbJ4U3ZF8kvMJ48PAZ9LE0F9EvQh4Ivsl7BPRJ713hO98Pjt3kvV68UvtT3WjyJ8xPfF5GW3N1F3gl7p366-MvwqeEXN584v-ixsvo8ejPT5763ow7VuFl4HPQl50vHl9svc+983Ap8cvvl+cvj54CvPp8c2Tl8m3kV8gvGsuivSF6eLzjdfznB-EvT6+5u1+aPPkJ5VPaV6SvYl-bPhQ+yvX+eFPhx+sviV8KvTp8yv9p4KvUV9Kv1V+qTwZ5iPCKyqvMV+2tTV-ivbRdavWF8jnetzqvyh83PJV56vhh5sXddZVXeO8q3xJ4-nna46v9V52PNGzivnV9jntVugvnl8LP3l5PPcu+rPXl6svGF-Wv-Z5WvW1+EvO14qPe16+PB1-dTQJ+Ovmp+2vZ1-BPPO-2vdZ917y17xPq1-tPS178vRp-fP858v+D17evbZ-ZP6l+uvml5-3z+4B2r15Cvb59u3VF6+v7x9xPt15Ov91+hvBZ6evd17Wvtx7bH9x7-PrF9Rv44-RvLF6NhCN42vF176vV14GPlx-c31x8thIl5SPhN+q3W58pv+x4yvg55evdN-Av+N92vSN7hvKN5JvNJ6uPdJ4pvrN6Ov7N8uvp165v6p+qHRN+Fvxx4xPfx-Cv-F5FvMN8oPQt-hvWN9z3Lx8+vn57kvLN5+PoV-svgV6hvWt-BvcO+fPst-8PYx5zX7u75v+t75PYV-3Pxt5xPiN9hvit85vJt9JvQx-WPwZOUvUl65PIp49XGt+aveGo9vel-fXiZ682Ad81vZJ9WPZt86P7t5X97h-0vwd8WvMd+Mv0t5tveZ7cPSd5jPbl8rPad6lvGd823Iy0rX1J9FvvR4mv664Lv0hNNvja-NvAOzLvKl+kvpF8s5Nd89vRV+PP9p8bvgd403BC9qtbd8m33d79vza9wDPd4Hvfd8P+Q6+dv3N7JvvN+rvQ97av8xdHvdt4Jvgt-Fvvh7nvhd-lvnx8dv9p5lPtd69vxV6M5W96bv5V8ZvSsv3v7d-M3A65JWJ95tPu0d6vNN61P198Gv2K+VXl9+HvjlufvM95dzkZ-nvbN4dvS95VPb9-mvc8+SW-9+mvlp5o2wD5vvJJ73v999jvQd+wvWK3AfD95XPi6+gf6d9cved+lPKD5zvaD6F3tKy3vVN8Xvt96gf6XJfvKTzwf9N7QvyN83vSXJIfAOzIfV9+If799iLMp8evP98Ifh-OYfP143PbD5dPTKcQfTZ-1PvD5gfHd-KX8D8EfqD+tvRt5GWHD7BvVt51vMt6kfYj6wfEj8zvip4IjjD96L0j-ofAN-JPON7VvaB7KTAD803n64MfID4xvux5MfED5LvBJ9mTfD+EPPJ5sfQj7PvdG5j3mO8cf9W-R3Fj9sfal7a3h+Zdvax6rv-688fbj7e3mB6Cf4j7kfKd8IPDj-CfH18hvUT9cfMT4hvpl-ifI5vUfrVZc3OV9UvKV58f0T6UfET8kfKT7sNaT+MPGT7KvDN+evSstKfiJ+yTiT8NvKj4L3vj-Hvrt4CfwB9GvG+7oPk98CfNT7yfsT+SftKxXvRT8Mfnd+SWZd-SvFD45vrd8-zPd6mfND+mroz8yfdd+9vna-mfZT-GfG9-HPUBYrvgR5afXfxLPYz8svEz42fiO+CfkO5x3ez4WfO95bvRz7afR+8jvxu485mz78fdz4IP-58efTT-8fUd92fbz6Lv41+C3W5++fa941Pv95evAL-tvCt+Bf1z8afPz60v5N5Bvuvf2fm18OfUF-hfFz+bvFV-HPKL9WfBz-WfyL+6fxR90fcT9AveL-aPMx9AfQcOJfWz4SP9z71vUL8BfYt+4fTt4SfPT6SfDl5pfuT-xfzF70fmN9pfYL-XvEL9xfNz-P3Hz+pf6t4pfTz8rvnz8HJ0F4Rf1N8gfEt6ZfHL44vut9Ffgr8f3wr5ef3L-ZfJL4pPhL81fU3q8f2T9pvh1-OvBD7lfSt9Z3N1-BfDL6Zvxr8tffL+tfGL9tfgN46fwN+mroN7DvnXrpfxd7+f66-dfsz-dv315kfXp+Uf6D6Jf2j4jvEr5FfYb7lvvL6BfDr4FfMb4XvrD7NfQ58N9tT8F3Wu8-Pab+ZfdT9Dfj-2zfir7ovrL6zfKx4AHE99df0d9LfcA55vFb6+fVb9oH5b4mPIN4Lf2r4JffT-zf9b-x3Lr6bfbr5bflL-yPOz6lffb-Ff2z8lfd5+Hf7z+efCh47fyt6L3ud5wfM78Tf396tfKb5Bfnb7GvML86flb9nf6h-nfmb9ef67-aftJ9rfQ78Pftz8jfGr8-+E7+hfQN57f276XfAt+TfVj+LP1769fvz9a3-z7PfQr6nfIZ8dhr79jf9L9XfkL8lvhb94vxb4PfO750PIb4XfV76-far5-fDV5o2Zd5YfK7+ffy9+WD-b46PUb9S2yH84fJF6Wfpd4w-I76pfl76Q-RH8nfF7+nfCK1w-Qb93P0H-3fOH6kD6b8j3nh-u0Az7N3y7-tfQH+Y17H-wfT759fRnN4-5D+xf-L41lQn8HvrXOKfw1-E--r6TXNYZOfyO6h3Mn6k-yq+U-Qz5EffyzU-pj9xvSH-k-zH-j3Bl6MWWn8sfAn8P5xn4NfeV6fX5n4U-2O+Z31n-0-0h-jvIz6Y-Ob4zfOB6Z0Nd74-qH9M-6H5x5Fn7+vDd5c-oH+AvXL+o-QX9bfnL91fYX78-Nn6Z37p88-wn8RfOL7E-5H5vf3b7dvSa9S-b783fJ7+LXWX4A-3r4-fhH-7j-n5kvgX5K-sX+93bRZo-0z4q-Dn9hPTn-jWNX9k-g5Oa-Kn4pXbX-U-Fm6xWnX+0-oX7I-dX9c-LH8M-ZxF6-Jn6K-gn-y-Sb+8-E37M-U384-cb+4-ca9bjFH9Hf2H9g-4b7LfzT7HfvZ5W-aX+Pfd792fgb49f+r8q-Fe-mLfr-a-q56dfOj8i-7b7xvm3+rfjb4y-Ur+O-LX7vPb36u-zZ8+-XX-PvfnJu-Eb7W-pH-Jfj34bf23-W-+soB-W3-VfVH7-fe3+y-t75e-47-h-BX-ff+u7rP+Pq+-ta-m-j75m-6P5VPY39K-9d+WfOP5Nf-H9m-y969Dv3+cfAz5Q-XH7Q-BP6p-fX6i-un6nDQ34M-jX56-TP-G-+P9bv3P6J-BH8E--P7O-4h96LtP7w-A+8s-Dd+F-9X4UvnP80-Mv-Z-jn7gfCv7Z-wX9VvLP5a24v9o-1596f4H5w-iv-V-KJ-u-rP9B-Xb4O-SP-M22v4k-Zv43fiP8Hfxa8N-EX6Vf8j-UWAz5lfpr4Z-fP5hTIv6MP0n-uTxH4HfO38c27v9Rfh94qfPH4D-q35I-sP61-Uf-2-Nb8O-rX-j-CP-S-Dv6t-Kf9R-OX6T-jv59-sv7jvKv9LEof6xfSX9E-21uL-Nv55f03-p-Pn8Z-ef6V-DX8L-sFwr-734z-9f6N-Jl-1-1H8z-1f8W-Xv6VlLf6x-hQ8H-1P643Xa-b-zv6Lfyr-6fPf4W-gH-7-kf4n-mH9JfZj9N-Vf7n-hX95-A-9n-uP5r-FP7r-qr9APYH+n-Bv-ebPP+0vB-6i3gP5j-v77j-Z-4F-u97M-Tzcn-x-9d-M--v-vv6Gvqn+f-y-51fJv7v-7W7fvpR+t-5XLO7+3m52Xnr+J-7d-h-++f6wPl1eqv6AAfB+wAGIfgABV-7Q-gh+M16oAf9uG-5o-hf+3v6IAUf+IX6a-qABP-6B-lh+wP4kATABDf5y-k3+Rn6kAdH+Qf4Q-lr+BZYP-lc+PH4sAZ-+j94dfhwBsAHCPt1+mn48AdQBBf7wAUX+ggEd-sneBT79PmIBL-5EAf-+Vyx7PuAB-l75PvU+Jb4EARKesgFd-nD+agHZnhoBUAFaAWgBT37g-hQBfq7wvooB714svnoBIP4GAWD+MP4gASYBtW6cAUg+HZ6mARReugFv-nq+-dasAei+Cb7YAbv+ff61-ja+2gFAXhr+cgH2AUEBPF5uAZE+0b6+AWT+eP54AY6+4QHsXlP+7gGNXs42ZgG-XmV+k15pAa4BIQGaAS1saV7pAVw+S34tXtkBtV6JAWjed355AVcsBQE5Acb+VQHS7OPqhQH4fo-+vh5rWk0Bkv4Bfp2ubQG1AZ3+lgHXbNI2PQESASoB5VrlAdjelQF9AYVaOjaOAfw+hQ42Wu0Bup5S-l0BAwFjbkvsuDbn-rC+uHycWvMBjZ52Pj+SWwGDAXu+7n7MWg4BvAFOPlxun-IxAXa+-gH7-iwKmByubmQBK-46fkQc2FrbAcueMwHAri8BBwHYPgx+BFonAUIBcAELXr4MnwErAaharwH4Xoa+EAqG6mCBMq6LAZCBw+ZfAfR+RwG69OLq0IHJXrCBH-LzmqiBuV6dAYxSmIEIgcoBeb6ULHiBKwHEga3+BCxRLvcBDAHkAbH+MZov1viBkAEpATwsFIFYgVk+6IEWCuGaLIGLPi0BBgocgfSBFgGMgW2UvIErAUKBZIHSLvCBKwFSEpSBCf7Pfun+HC4bapyBlz7eAW-ikoEKgWi+R94-qiyaqoHh-pQ+sraagXyBub4wfjwseoESga1qWoHlPjqBGoGmgfqBbn6sfp+0VoEmgVQB4gGHAbaBa86OgTIBuQETAXiaboG--m2+9QH3GqCaZoFrPmX+4RLQmoGBIn7xvm-ioYHWgcN+8v7XiFGBKwHxgaKB3syJgUP+ItIBgdGBHP60AZm86YEJgTmBSYGQLnmBqYGfzlMBpwHuPjjuMp5SgXaCGQAZAUtsoahVEMAwzO4W3IFS1YEGCNWBRQEaXHWBWxANgYPmcyRmai2BL9iriG8BbuJy0OJQDW5qrNYKWyC9+IOB4IFWYiOBD+B1JgEK43yTgZ+ESTBDgQrao4HvbpYKJTZPQI0wsKT+ADWBsGxdkFUQjlD7mBLoRTboevuBBggRAAeB4mydgVCQG4Fi6BhGeVI2uk9A14FXgTeBH6x3gQ5Q84EY6IOWOQKjCG+BL9jXge2BttxfgcKggOiGls5qVpiAQZ04VQAfgZFsYEFWQHRuEYrTZiwYcEEGCHBBIEFEPIhBJ4ENbhWBI2roQS-YmEHNAZ+BdGhNYLhB727COsJKhEGdOCoA8EEXbEAwQTDvbm048950QQYIdEFYQStcjEFFMFKOlY7l3jRwbEEv2A4A9EFj0hRBvEETNpM4wkEGCMJBnEHiwmJBpo5eotuB68BSQS-Yq4EzgQoKD4EKQdIBMnC7gVUkwEEkQQhBZEHHgT+BjGi4lonigVIwQbr4+kEdAWVsOEEmQQbos97-gWCYlkGh6NloNkFLbAWopkGY6J0OpUjbKPLolmhE6EFoOwFN4p5BDkHeQYUO5Yja1MioHOhfmG5BCwG8bKFBj4H06IUOEQDuvJDoL2iE6OgByAGYAVcs-gB7OvmBtKx5QeAGPoHjAQKBuUH5QUWBna5FQZbewb4EgYaBLWzVQeHeWUFA-jSBeqyNQWPe0oFGAa1ByeztQV-efgHz-gEBSsq9QaveWf72-sH+-izDQfxBVIGPAf1+DUEVQaP+wxaTQdveaoER-hrKS0EH3uaBSL5rQfNBzP6hAT1BO0HrAVu+XfzrQafeZYHM7idBk24XQQVBqWxXQZVB6663QQtBeW4PQbtBfoG57M9Bh0G5fuZs70FeAeqB20HFQQ8Bf-6vQXhu30HTAbsBlnIgwaWBIT7nQQdBP0GrQdtaEMH-AXwBf34twAjBToHfAUiBtVqowe6BdQGegW9BMMGgwd4+VUH4wZDBpz7M7r5BTUGGAbYBKAFXLOTBHUGp-hb+soH+LLTBfUGxAXv+W-7MaszBI0G9-gNBNwFKypzBU0GdQVTBOUF6rPzBy0HagVtB21qiwRtBQYERgZLBsOZowYiBLoFebFLBp0FQwe6eKsGTbhrB10EIrFrBd0FGcrrBj0ENbgbBL0G4wXhuxsEfQTn+5mzmwbDBFoEaytbBBMEQgfrB8sHYwb0BZUEiwc7BJUEu-lEBqWz2wSTBin447r7BiMFnAcMWgcEKwXVBPwE0bKHBLsFDAYSBkcEewQDBvoGmwdHuUcGewckB3sE6wfHB00GAwUnB92gpwQnBpUHpwXHB4OZhwQyBhcEtbHnBWcGJwW7ByewVwYLBGAFkvjTBX2Z6wYfyosFefmzB8QEcwU3BhsFQ7q3BiX6yvgv+dsFdwSbB1cG57L3BmsFDwRbBlv6ObGPB2sFFwZB+Ll6KwSN+Niwzwc3Bvh4rwd3BAcETwTbBEsF4auvBw8FlwY3BMX5+wbZ+6sFbwQ7BbIFrwWfBx8FxfhGee8GTwYzBIyx3wdvByX5ywUfBQcFnQafBb8ElwfyBB8HuwV-B0cHOgUvBjSxPwefBOIFOwf-BqcGv-r-BNcFXwe-BasG3wbAh38EGgRHB5cGIIQAh6MFKwbVaICHXwVV+8xbYIXAhpMGfwfPB2t6lwZIBPsFoIZAhkQFkIRnBECH5wV7B1CFzwQ++rMHXAezBg8G0IZXBBcEMIagh7CF1wdlBDcFtQehyl0GCIbPBc0GSfhvB0MFiIfvBXCHlQZIh98HjQSMsS0FtwSwhHcF-QcQhBt42gUAhkSyKIX3Bnv6DQcxq2iFCIWr+6CGLwbGBsFyTQXT+yiEbAcGS5iES-vFBmQH3QcgmoCH2IUZyNiE6-hABP8HSIQIhRiGUIR6BI8HAwY4hOCHnfh-eriGGIbb+R76J-lPBE0EBIQQh-sESIWEh574tQXYB+0HeIXQhacGeIckh8SFAAYkh1MFeIZkhSAHZIcLBGSEWvs6+DMHyIeos-MEe-uT+rCGvwYf+6gG+IdAho8FiJuIhRCHr-v1Bm-4qITUhrSHMITzB1SG7wU0hUiHDAeQhmwbPwcGBnsKTQZUhcQFWIcdB0uZh-ptBL8F4auMhsyEywcUBCyEzISX+-cF6IaohXSFXAT0hHSGrIUv+qSFQIekheMEHIRwh9CGDIQisiyHrIbohvMH6IWshoSHbISUhESEPweosVyEPIVq+PiE4wX4h0e5vISIhMiG1IToB9SHHIf4hpyG8IQUh-CFFIR8hhyFUIRchNGy-IavBKp7woc0hEZ6pQdneSCEaIaYhRiyooTVBdH7hwRjBySzYoRTBNgH1wav+LWyEoXTBo0Fp-mUhtKzkoSzBOyHtIVMhg5K0oVzBOAHZ-pEhIyzMoUbagSGi-q1WnKEcfm0huAGMoajsfKFKIbshQqHmbCKhOiFVIXshnsKSoZNucqF-IXqsCqEIofaeyqHIoVOeaqEDIbHBZKH20oqhyeyaoXIhTAFXLAahIyGywXhqJqFOIcT+664Wodyhfv7KrjahMSEnwSihuqEqoUrKDqHooTGBWYE2LO6hxiF4oZghBKEuoeqhyF4+oZ8hrsENIXhuIaHQoUChsKE6oXB+hAHRodqhxqGBoVqh9UFJoXGhdSFfIeGh0e6RoWchaSExoWmhaiGyPqQh+aFKocmhhqHGAfqhZaGmoSshsqFVoZahgv6H8jmhYKE3-jkhlaHpoYChmaHAodmhdaG2oV-+FK5NofTBzyHUoalsA6GUoaUhRqGloe2hwQGdoSWhbaGFobVBxaGJoZOh86G4oYuhqaHLoUwh9KGCoUdBTKE9oY6hN8EaoXuhHqGZgSIBsFyjodzBDKE7ocKhR6G+oWuhKCEFoZuhTyEygcOhCKznoayhY0EToXOhj6G3fuchS6FfoSB+t6EeIbOhuexvoQKhbKEvITShN6GhoTHB66H-oahBrqHMaqBh3SGXoZ9BjmxIYVuh4GEvoTRs6GFPoV1BSSEgYVBhUaEzoX+hBGFToREBCaGwYaRhK6G6-kBhJGERoYRhuaFHIcBh9GFkYUkBTGF0Yd2hrGEVAb+hlGEsYdRh7iHIIfih8aw4YT+heaEcYfdoImHX-owBFaFUYd+hUmHUgfhhfGHFIaJh7GG8YZxheSHxocRhamESYU1KeqGyYZ6+Y6FDoZ+h+mGnfr2hXAHacpyhFiFioVehEqG6YQhhGsqWYbYhwUGOwY2hdmFBoakWjmFuIUoBd6FCYVisnmHyoW5hKaH3oRuhBmEXoduhqGH+LP5hemFKYaFh76FUocZhMWGmYfuhuCEf3lFh9mHbWmlh7mFtFplhQWG+YX8sOWHlod1BJmEk7ulh5qGBYYVhimHqYcph8mEzQcQBIWFJYcehyv6noVih5WHVoQPBGWGtYfWh3IGqoZ1hZmFOASlB8UpeYeYBgmH+ocJhg2HyoeNh0WHZoZNhpWGyoTNhWWHzFnWAg36NYY3+zWFnEEthGmEZoWGhXaErqEGAgQpOYWuBLmHfcnthKSGMYTCh4mHAaCdhm2EdodthzGEdwtJI12HTobdhF2Ebwg9h1WHNQS2hhSHnwm9hsWFgYR+hMmHwqFdh72GUwSShTwEHwj9hDWGAYSNhmiGnVhDhJWELYS7mQYDJ2FZhKGGWwZJyCgDI4Qdh6kHOIddWGOFqPgjhuhZI4fjhuWGjYYVYROGPYeRhWmHBYZXk5OHA4cShfCGkoeDhmOFDYSJBtsFcanjhFOFsYedh2mGXYRzhdOHm-kZhAOH3YczhY2604b9hyGHhYWjhgfx84eLhGGH-YUVhgOEy4ZDh0GGAIZihbRBA4bLhuGFCwRCh32H7YSzhskHioejheuGi4XDhFO4k4TDhE+Cm4SjhkuHsoVX8VuFY4TCBYCG44cbhU2G7Yfbh+uEGQb9B7OEu4bNh8mru4SbhPuEE4bUWGuHK4URhz2E84a9hgeHm4Wrhr5Ah4fDh0eFeoVH8-uGu4bzhUeEVYa2huuGnYc2h0mEK4fdhaeFtYZsh3uFZ4YOhz6EJYXnhsiEF4bch8eJx4VyhyWFBIYThpuH8oRLhmGFl4W7h9bIp4ZHhFeFdYWwB1eGN4aKhqOG24ffENeFN4XLh8WFC4W3hXeF9Ye8BqVLD4f3hNuEQYazEs+FSoZMhNmFG4ZPhdeE8oQDWfeHL4e3BhuHS4e3hvuHavEvhAeHr4SthNAFrYbHh2+En4fxh3mG0YRHhqejH4R3hD+FX4U-hOwiP4YfhSfwv4R-hUmzv4UHho5a-4QnhF+FJ4Qfhf+Fb4SARgBGAgUJyX+GgEXXWABHp4V9hiuHgEfAROuGIEf9BZ2EUYdThmeE4oTRh0OEx4cARaBHZ4QphGeGoEdgRAmEYoYnhqKCN4dLB4YE1oX7hPBLX4UShAuGl4ePhqeEEESXheGHEEeXhpBG34bgRFBGw4fQRr+HtmMPh1BGl-mahILzCEarBhCGpZhIRDBEUoWFhLeEsEZ3h3BHDYeQRQBGUEQIR3+FxDlQRkhGxIYPmMhGCEVARGhEwESvW+hGaEaLK2hGyEXShWuGg4bNB4OFGERARgD6GEWwRhmHMEbnhE+HKEazhO8HiERYRBhFk4T4RZhFF-P4RxhF-1qYRwRFcoqERDhFGPk4RHhEG4avh++HOEfIR8uGVYe4RV55kEZ6hahH8EbTaIOEM4WDh1GQ14XhejuE44cdhpuEFEWiBTuHFEdLYGYFNYZARfhGVEZYR3F5c4RgReWHKYPkRxF7uQQ2hFRFZEfTh4KGM4XkRJRFtEXYhVqHccv0RVRGrYTURnditEaMR5+HjES0RIxH1ETBejRFU4c0R4RCTEfMRpRHYgUURDvKrEb4RExFzETsRsxF1EfsRZ6G6vBNhL4HsEdrhvRH6oScRRxFYodcRARFMoXcRYRG1DhthqRE8EaoRMxHHEWcRLhEcEQgR02FfEYkRY+FuEUzoLxGvnkWhd+GYERGhjxGREcM+Y2H-EXFh46GKEV5sIJGMXtxhYmH34bVayJENEaiRqmEQkX8RAl6iEbQRjlqYkQsR2JHc4biREmFQkcgRlxHFYSSRYwE8YeSRwJGRvFMRwgEfES1hTIKj4QiRQJHZkpyh6xGsgeURKp48kQMRzmEXwQKRTJEBYeyR1hE5EbYR9WFYkXSRaJEMkdyRYpE3EethSpH3EdehEpEqYWSRyxFskfiRGyFV4R1hGpE1YdnB3yE6YYaRH2E54ckRjJFmkdkRPRG5EXBhspEq3ksRpOH5YaqRTxGdDoKRzJEAgY4RfmGukdCRGn6liB6R4pG6kTchvSGewvzBvJFcgT3hnSGgkQuh4JHakWcQ4ZFCkYdhIpH2nomRnpFIwc4+k0ERkYqBXuH7IcGR0qF74Qohzzpn4SyR3pF-LFmRSZHY4UMRh-IVkemRwcFPQcWRUOHvEWWRpYi1kZdBaHztkWqe5xE2EXVhPUEdkcqRNiyRQfmRK+ERYQoh-ZFqkV9B45FukRFBU5F+kfwBrZGzkVSRdpGNwt28lZGFEdWRvh41AGxepJFNEc6RicKrkXWRH8ERnluRw5G74XERIywnka8RKhHpEayRZxCXkTGRq6FxkXuRsFz3kSiRcpE4kfGRNiyvkQ6Rc74YIRbhPCDbke+RWpHPkUYs35G0kY6R4eEKkV5sYFHZkStBbOGkageRk24wUWuRZRGbEfaeyFGHkfAhU54YUZ2RN+HXkSeht5GDkeY6uFFyYeaRRBG-EfdoQ5GkUTaRn2EoET8hxFEDkY0sVFEAYSrhf5F4EVohDFETkY5szFHwYdORT65gUSPhkpG2kdKRyewCUXPhChFckdBRl7I74ZYh55HqLGJRMlHWYaOR8lHSUUhRqlGMUU386lFcUf4sClFqUfzezeFJEZwRmcJaUXxRlnK6URpR7KzmUdpRF5EmUXORyMGAgPpRHJGC4ZJRtVpWUaZRna5uUXZRzj6eUUuRIlErkY5RQlG0UdSReG4+UZXhoZGH-KFR3eFKgdtakVFT4WDBHlG2Ub5RvZEnIaMBEFEwYVBRmMGettZRryFZUe5RDiHegWHh6VGfkUxRuVFeUWP+4yFhgQSR7WF5kdYBTBE-EXRRlFGlUUlRe0GNISWBG+F2oRSuFSGVUXqR4VGOWl1RmFFSEVOe-VHjwW1RJZFekVERWKzDURZRJKxTUdlRtKyzUXlR4CGpUb+RJiF8ETNR0rbTUYZAC1FlUSHBG1FzUUMhy1G7vmxRa1FbUXtRi1EtwWdRO1F5bttRzVFAwT8hTVFhUTKhh-wVUQNRuhERni9R7yFKQd8RFxHLkcDBMbabUSjB-1H7UZchQNHnUb4ePFGeAVFRuZE0aqW2elGHUVB+fqH-kb0gfwFjURmRY-5gUZWB31E9kS1RiWGQ0XFRhMHWoQh2+NFHYaKRMO7E0SmRbqGFgWDRApFU0VdRDW7EkZjRAJGckZaR3JG00bdROcHAkWzRj1GFkeosDNHdUSGRT1FEkVzRUNFwweahwtHk0fyRqqHi0e1RfaEWYdLRqNH1kdR2NeGM0fCRzlEs0c-h9oEA0crR-NEFkXJRQ+Gm4SrRf2GAkerRb+Gm4YhuVVGF4RJqZtFobnyRaFGiijXh5tE9UYLRn+EXzlrR1tE6EU6hueYO0TbRkZHRUVbRrtHA0Vn87tHzEY7RAtE80frRAdHU0QAK3tEe0Qehy1ZK4eBu7NEmkbzhMi6B0QvCCdFrAdzRetGL4RnRhtEGUcbRRlEp0eKBbtHyga9RntHx0aXRJuGV0VrRcMjw0QvBiNHsUadWtdG1UXb+BdEUUZdhzdGXAYFRFpGF0RvCndFfUUzRatG90Q-h-dF40TLR5mFKYvXIt2o60SORUuHmJFPRKNFNkTeRLZErEaPRmdEi0fBR4hFr0XnRTlGuESbRQhGDAHXRJCFPkUjRAwDw6jPRZ5HKUUPhh9Et0eEhe9HD0W-hN9Fd0ZqRu5Gn0U-RA9Gq0ffR7dEbwu-RY9EK0UeRXtG-0evREtF20efiZ9Fk0ePR-WFJkuAxR9HqIcvRE1ETEUAxEyGX0XPRVfxIMUshNBHVUeIR6DHXIbrRV9GL4TgxouFAMdbhElH70UJyxDEO4ahRG5FbERQxHuHtEd1h9tG0MUQxygp0MYMRHRE0MXc4glEv0U6Rb9GcMeJRhlHf0Q-hQDFcMUaRVcFZobthwjH8MW3RDVGXYZIxilED4QvhnvxyMcwxXGFAUa-RjdFAyHwx8jHz4VhhC8LCMSIRTtHh0QQxnDEGMWHR2dFKMSYxsdEpYYTh+jFWMfXhweG2MSoxMRGe4aLR2DGWMU4xV5GeEfMhbjHWkd0RQVG-UR3CQDGwUeLB3jHyakExKFEbEdQx0dHhMWXRcdE7VjExHjEPkTgRzZEIMS0RCTFa0ekxadEHwpkxUdGMMcc8iTFvkWlRquEnUddIOTF00e9uMDGeMbER+DEWMb4xdVE-UX5RgOFlMUnR4jGyMfkxNdG-PBExttFRMfbRa9HBMXMhoyHyan0xXTG+0dDRQzGdMbEx1jHB4cMxkzH2Mf-hMzGi4QsxHTGAUUUxx1EZERPgSzFZMXkRmzG5MWAxOzHlMVKOC9GnkbJRNTFZ-PsxLTE7YR3REzGLMdcxyzHHMUpRqDFD4ecxWdGnMQvCzzEb0V4R4zErMStRDdElMUcxVTEuMZvRXzH3MQoxujFM4V2RWNFSkclRiuHcvFXRELGD0V-RMjGvYbCxJdHwsZ-R9VHBUcLhaLFG0czRD9FCERnR-THLIVgxfuEosVsxNOEEsSMxOZGuMSSx2LH50bixgjGm0aSxuzG94UyxBzGmjmLhVhHcMZBRxVGUEUESqLHOMfQxUZFW0XyxZLHfYSKxzLHs4eKxbLF6EWvRYsEDMWIRwLGMEa3R9LFIsSPRopIfMaExR+EZ0XKxRLGW0d4RUrEXMXdhbuEGsS8xjzE50SaxGrGDMVqxFrEgMT0xYDHasVIxKrGYscaxDD4SscKxrrHSsdIRDrHaMaQxeLFQEWmy-LHUUX4xPdEMsUIRsrGOsUPRobFCcuGxPrECMaqxb+ExsTcxAVFcsUVRIFHq4YmxdzFBsfUx2NF3UbthGbGisYDh+bFusVvRV1JJsXhRXjFWsUn8RbGesV7R1bGGsS9harHJsaIxnCFGsVcxTbFkUbVhONEdwnWxprGD4YvhPbGWsQqxR+EDsbax7DHR0SOxkDHT4V9WE7H-0VhRy1YzsUvRBFEr0WiQ-zEsUYVRxTHrMf0AC7GsUatRm7HXSNux67FrMYRRUfwHsegRPDEaMVuxpbGZsWuxZ7HcsWmxseGnsYQRnbG5sW2x5bHVMWaxnvyPsd2RULFdsXmxV7EFsd2x-7HFsYqxN7FPscaRrTF90UBxNbHzsVBx9bHokWGxsHG9sYoxZzGIcYOxhJFVsahxo7EMMXsxWgqUMZExY7G9MbhxrDHCkZLR9tEG0RgxFtH6kf7RoKHfscJR0LFcEY8hKbEbscex6hE0cZCxdHG-sawRAKFPYamxp9Hkcbgxs9F9sZ78-HGnEZzhO5HnsSUxj2jzYdBxHmHScXBxGVEEoXJxSHFgsUqhSnFoccSxQtHLYYux1RHLsethanFYcUKxtaEo-gixGLEBMaaRYnFqMRJxe7GPaL1hk7HxUYTRxnHosQ0x9HHmcfzhyrGRsfGxAaGOcTixHnHOsVaRFnGrMbuxLHHsrAVhynGt4f5xbnF30aZxjTFVYZrhTHFHsbpx3qG2cbOxg1HBoclx2nFjEYlxjSyhcepxerERUYlRYXGIka5RBXG5cVRxMNHtsTRRIbGecfGssVF2cQTRRnK1cSlxb1HYUSVxBnF+0eVxb7GAsZ8xjlqNcRlx0xFZcZpRFXHBseRR1XFYrL1xO7G-MdZxENG14U1x5dGpFtNxIjEdseBxlzHZkgtxEbGIsX5xq3GcUcBxjlprcbGx0jGbcV5se3EkUaBxtHH+MTFxlFHbcTJxbRbHcQDRZYhXcfJxPLHsrLdxAHGXcR6xj3H3sUxRD3GFcS5RySwvcTtxKTz-cddx8xZA8R9xSNH3ccThYPEXsYDRkPE-cWQxWKzTcSQxcbGHccVxUP6VcSNxKPHJLGBRSPEHcWZxlcKgynDRkXEJIedxLnH48Wjxw3HPsRzR2ZLY8Xhx3TEEccxqNPHEccmRpHEM8QTxd3E5cW1xYzFEkelxE3E+YZ9xkSwc8XVxJNE9Yd5xdLG+cXjxipGi8bvR0XGk8ZLxAXE-MXzx4PGC8bNxcTHZYTzxh7FBcQNxIXHq8bexvHHQ8TZxUvHd0RjxEvFIkTrxYHFiMStxpvGG8fFxmvGpMWehZvFncVVxmPHCYQ7x7HEk8ZxxcvFE8Vkh7vEvsZ7xcXHNsfSRT3EkrMrxfXGlkXbxOpFe8fkhPvFU8Vbx8vFHUbbxMJE+kdbxAfHykUHxhkAh8bzxJ9H68RnxGvGTccFxwfGu8SZxznEe8bHxkfGaYXexSvGF8U5xObEx8RiRVfE+cRtxJvF18cnxS3EW8a2xfvGh4brxzHFa8QXxLfHo8ZTxydEd8fHhUPGScTnxXfEJceHxKpF98RTxy3Ht8aXxUKHj8Qnx-pH28cc+nPHUsdzxq-FC8RTRiGHvGgJxKDFCcdhhu-FBkYxxKfEfkfzx2vGb8SrxUzG8oUfx7PG38a9xEXEL8ebxLbENsc3x3HGU4RXx2fH38QDxAOycocgxJzEfsYfxl-Gh8eNRifEukcAJmfG8EdZxf-EUcYYx5jFACe-xixGf8aPx3-HA8alhqAkj8dAJGAlw8X6xSfGICeJxyAlYCRAJufGK8V-xxAmL8XnxPfHp8dgJpXG9USk8MAl78QAJB-GxofgJlnGECfnx1AnkCc-xgfHn8b3xrAmBcZQJk-FJcVwJjvHG8RdxTOj8waHReDGACdwhB26iCQPxEHHKwc+OI1FyCW7xTvFN8ckskgk+0VSxQLF9UcoJd3GTQVIJgnHIcaIhqglF8TXxg-FHcfFOV-FzMcYehgnaCXBR3XGA8Q1OOAlRsQjxLgm0Cc7RAOzTcUYJ+-EmCblBHglr8boJzglzrq4Jo3HlkYEJW-Es8RrKYFG+CUwJ-gkyyiJ2djGb4cNesQkOCSExlbEA7GkJyQkdUdpy2QmE8d+uQQlOCb-xsC45CbLRzxGlCcfxhQlRCaAxDmGVCXfxn242CSkJ9qH1CQ-xQ-EwbmEJzvF+YVQubQlIkT0JP-HTVsSRcQkPMcwJxqH9CWgJsRZDCekJ8rHocb-x4wmYCRwJLcBTCWUJE9HMEjHRIdHTCbqxZXF0EfWukAkpMWAJBxG7CSQJWfF-McHRbtGR0RMJweFnCb0JjLGhCZ4JRjHCcanRAwnmEU8Jlwn-4RnRwwmgseFxyLF3CUUJmrGf4a8JCwlUCddIHwmbCZgxeXHWsb8JNQl2sSyxUIlNCbkJk9GgiSsJUDEz4WvRnwk6Md8JjbFmCdXxP7G+8ViJ125-CZkJcQ5oiWCJlHF0CT-hJInIiVOxlFKrsYBuhIlDsRhxBm7mCbiJtfEIcUyJOIkccXiJCbGGLvSJswnEiTyJ0In08dXhlIllsQSJgonYccKJAonwieUJawkiiRkxHi6kiXAJrzHZMQqJVIn2cdxyQDHoib6xbgmIMaqJBTGJ0Z0JGgnkMXqJ8omNCSAJaNF1JpUx1QnSiasJyOJWiXSJ4omGcWExJok3CQfRLonPCUX8momKiWYxyol5EV6Jaon1cddW-okFCZyxp-HAUeDxAlGmMdIJowmJCRpeNvGCCQcJL5F8IlGJxgkqcaJRyYkBicLxSsqRiZmJ2-ExCRmJIYksoQ3xMvEl8ajxArFsMRKJMVEFiXdxOYmFiQLB8gmz8a-xWPHVia6JNXEtiR6Jg5K1iTWJ7YlvCcYeXYmtiWNxPYlAiUIJjSz9iR2JqnJDiYaJ4gnU8ZOJ9wnwCS1sY4m9iakJs4m8iRpxKTyLicOJiYmgUSuJjontcflxcYlhieoxknEbiVOJsvFSUQeJrfEv8fBxbYkXif3xjYnXie4JRl67iVzxIQnliSRxtQnwwbM6A4kRCU+JNokoiVVBX4njiZORv4nmiYrRUO4LcSmJfglpiW9BgElLicquEEm5idEJn4kgSXsJ8DFbiWcQCEkncaGJl4k8CeDxmEndiWK+FAmkCceJlxqMCSMJCQnpiYRJ3Amp8bwJAFH8CQrxJwnWcRjRsAk+iTIJVyzMSWRJXwlFcc2JVEkNiW3xTYk3ifRJ8fEJicvx24m8SWoJYglniWWJJ-E4STRJEYmkSXWJ--HkSdBJIVEKSQRJQkkI0cRJU3GDGpxJGIncSfGs03FKSVxJv3EGSTpJWEmpPkBJ3FFmSQYJ1knfiQuRA15zib6JfZEOSauJEImviTJJd4n8SQ+JP4kaSfXRWkmLCRDxvknH0VAJAUmGSSxJ0YkUSTBJLknPievxAInRSX+J1InDEZqadkkrEbnR4UmpiZiJtwlBSXAxS7Ejibyx8UmgSQAxFdEFSahJuUnoSQ+xnpqiiU-xfElXiQpx0bGVSdexCr6FSXOxO1bb0elJUEmZSWyJ2UlgkSFJwIm0iRZJcEkhEW1JuknaieEJLRHDSVVJTUmlSTpxeUkhcaCacZr7ge+x9CRHgWJQvJBXGGeBRnLEkfocl4Ev2BxBXXFWXNxBzj78wdYKgkGySWfxSNHPgUiM-kHWaO+JHkHo6F5BQOh2iabh6UHs6K9orkHvaIKxkWyJQXFo4UHQMWvRL0kZaJuo-sgMUL3I9UjwoAPIG4DygOKo0cjgSP0ACwBAAA";

    var gameRunner = /** @class */ (function () {
        function gameRunner(gameContainer, gameProperties, app) {
            var _this = this;
            this.tasker = new task();
            this.tileContainer = [];
            this.generateObjects = new objectGenerator();
            this.targetFps = 30;
            this.fpsLimiter = 0;
            this.frameDelay = 0;
            this.app = new PIXI$1.Application({
                antialias: false
            });
            this.objContainer = new objectContainer();
            gameProperties.applySettings(this.app);
            this.gameContainerElement = document.getElementById(gameContainer);
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
                    _this.logicModule.camera.moveCamera();
                }
                if (_this.fpsLimiter > 0) {
                    _this.fpsLimiter--;
                }
            });
            this.loadRoom(JSON.parse(LZString.decompressFromEncodedURIComponent(scene_home)));
        }
        gameRunner.prototype.loadRoom = function (layers) {
            this.objContainer.removeObjects();
            for (var _i = 0, layers_1 = layers; _i < layers_1.length; _i++) {
                var layer_1 = layers_1[_i];
                var pixiContainerLayer = new PIXI$1.Container();
                this.objContainer.addContainerForLayer(pixiContainerLayer, layer_1.zIndex, layer_1.layerName);
                for (var _a = 0, _b = layer_1.metaObjectsInLayer; _a < _b.length; _a++) {
                    var objMeta = _b[_a];
                    if (objMeta.isPartOfCombination == false) {
                        var genObj = this.generateObjects.generateObject(objMeta.name, Math.floor(objMeta.x), Math.floor(objMeta.y), objMeta.tile);
                        if (genObj != null) {
                            if (genObj.isTile == false) {
                                this.objContainer.addObjectDirectly(genObj, layer_1.zIndex, layer_1.hidden);
                            }
                            else {
                                this.tileContainer.push(genObj);
                                if (layer_1.hidden == false) {
                                    pixiContainerLayer.addChild(genObj.g);
                                }
                            }
                        }
                    }
                }
                this.app.stage.addChild(pixiContainerLayer);
            }
            this.app.stage.addChild(this.logicModule.interaction.inputContainer);
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
