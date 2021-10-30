(function (PIXI, filterAdjustment, filterGodray) {
    'use strict';

    var gameSettings = /** @class */ (function () {
        function gameSettings() {
            this.stretchToWindow = false;
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
            PIXI.settings.PRECISION_FRAGMENT = PIXI.PRECISION.LOW;
            PIXI.settings.TARGET_FPMS = 0.06;
            /*if(this.stretchToWindow){
                this.windowStretchListener();
                window.addEventListener("resize", this.windowStretchListener.bind(this));
            }*/
        };
        return gameSettings;
    }());

    var objectTypes;
    (function (objectTypes) {
        objectTypes[objectTypes["userObject"] = 0] = "userObject";
        objectTypes[objectTypes["geometry"] = 1] = "geometry";
    })(objectTypes || (objectTypes = {}));

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
            var angle = calculations.angleBetweenPoints((this.cameraX - this.targetX), (this.cameraY - this.targetY));
            var distance = calculations.distanceBetweenPoints(this.cameraX, this.cameraY, this.targetX, this.targetY);
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
            if (this.layers[targetlayer] != undefined) {
                this.layers[targetlayer].objects.push(obj);
                if (hidden == false) {
                    this.layers[targetlayer].graphicsContainer.addChild(obj.g);
                }
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
        objectContainer.prototype.loopThroughObjectsUntilCondition = function (targets, func) {
            for (var i = 0; i < targets.length; i++) {
                if (this.specificObjects[targets[i]] != null) {
                    for (var j = 0; j < this.specificObjects[targets[i]].length; j++) {
                        if (func(this.specificObjects[targets[i]][j])) {
                            return this.specificObjects[targets[i]][j];
                        }
                    }
                }
            }
            return objectGlobalData.null;
        };
        objectContainer.prototype.filterObjects = function (targets, func) {
            var foundObjects = [];
            for (var i = 0; i < targets.length; i++) {
                if (this.specificObjects[targets[i]] != null) {
                    for (var j = 0; j < this.specificObjects[targets[i]].length; j++) {
                        if (func(this.specificObjects[targets[i]][j])) {
                            foundObjects.push(this.specificObjects[targets[i]][j]);
                        }
                    }
                }
            }
            return foundObjects;
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
        objectContainer.prototype.forEveryObject = function (func) {
            for (var x = 0; x < this.layerKeysOrdered.length; x++) {
                var key = this.layerKeysOrdered[x];
                for (var i = 0; i < this.layers[key].objects.length; i++) {
                    func(this.layers[key].objects[i]);
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
        objectContainer.prototype.boxIntersectionSpecific = function (initiator, boxData, targetObjects) {
            return this.loopThroughObjectsUntilCondition(targetObjects, function (testCollisionWith) {
                if (internalFunction.intersecting(initiator, boxData, testCollisionWith)) {
                    return true;
                }
                return false;
            });
        };
        return objectContainer;
    }());

    var interaction = /** @class */ (function () {
        function interaction(inputContainer) {
            this.isInUse = false;
            this.inputContainer = inputContainer;
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

    var groundGrassFilter = /** @class */ (function () {
        function groundGrassFilter(polygonPosGlslAdapted) {
            this.groundFragment = { yPolPos: [1, 2, 3, 4] };
            this.grassGroundFragement = "\n    varying vec2 vTextureCoord;\n    uniform sampler2D uSampler;\n\n    uniform float yPolPos[{yPolPosArrayLength}];\n\n    const float groundHeight = 0.02;\n\n    float randFromVec(vec2 co){\n        return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);\n    }\n\n\n\n    void main(void)\n    {\n        vec4 groundDarkColor = vec4(0.020607, 0.0245, 0.1204117, 1.0);\n\n        float spacing = 1.0/float({yPolPosArrayLength}-1);\n        for (int k = 0; k < {yPolPosArrayLength}; ++k){\n\n            \n            if(k+1 < {yPolPosArrayLength}){\n                float heightDifference = yPolPos[k+1] - yPolPos[k];\n\n                float relativePosition = (vTextureCoord.x - (float(k)*spacing))/spacing;\n\n                float topYPos = (relativePosition*heightDifference);\n\n                \n\n                if((vTextureCoord.x) > (float(k)*spacing) \n                && (vTextureCoord.x) < (float(k)*spacing) + spacing){\n\n                    if(vTextureCoord.y > yPolPos[k] + topYPos){\n                        if(vTextureCoord.y < yPolPos[k] + topYPos + groundHeight*4.0){\n                            float depth = (yPolPos[k] + topYPos + groundHeight) - (vTextureCoord.y);\n                            depth = (depth)/(groundHeight);\n\n\n\n                            if(randFromVec(vTextureCoord) < depth){\n                                gl_FragColor = vec4(0.5529, 0.749, 0.2235, 1.0);\n                            }else{\n                                float depth = (yPolPos[k] + topYPos + groundHeight*4.0) - (vTextureCoord.y);\n                                depth = (depth)/(groundHeight*4.0);\n\n                                if(randFromVec(vTextureCoord) < depth){\n                                    gl_FragColor = vec4(0.07843, 0.07843, 0.180392, 1.0);\n                                }else{\n                                    gl_FragColor = groundDarkColor;\n                                }\n                            }\n\n                            \n                        }else{\n                            gl_FragColor = groundDarkColor;\n                        }\n                    }\n                    \n                    \n                    \n                }\n            }\n            \n            \n        }\n    }";
            var fragGroundShader = this.grassGroundFragement.replace(/{yPolPosArrayLength}/g, "" + polygonPosGlslAdapted.length);
            //Moving grass
            this.groundFragment.yPolPos = polygonPosGlslAdapted;
            this.myFilter = new PIXI.Filter(undefined, fragGroundShader, this.groundFragment);
            this.myFilter.autoFit = false;
        }
        groundGrassFilter.prototype.filter = function () {
            return this.myFilter;
        };
        return groundGrassFilter;
    }());

    var polygonCollisionX = /** @class */ (function (_super) {
        __extends(polygonCollisionX, _super);
        function polygonCollisionX(xp, yp, input) {
            var _this = _super.call(this, xp, yp, polygonCollisionX.objectName) || this;
            _this.friction = 0.916;
            _this.polygon = [];
            _this.width = 0;
            _this.edgesPoints = [];
            _this.pointSpacing = 0;
            _this.filterGrass = null;
            _this.groundFragment = { yPolPos: [1, 2, 3, 4] };
            _this.highestPoint = 0;
            return _this;
            //super.setCollision(0, 0, 32, 32);
        }
        polygonCollisionX.prototype.setPolygon = function (polygon, width, roomEvents, app) {
            var _this = this;
            //width = 4096;
            this.highestPoint = Math.max.apply(Math, polygon);
            this.highestPoint = this.closestPowerOf2(this.highestPoint);
            this.width = width;
            _super.prototype.setCollision.call(this, 0, -this.highestPoint, this.width, this.highestPoint);
            this.polygon = polygon;
            this.pointSpacing = this.width / (this.polygon.length - 1);
            for (var i = 0; i < this.polygon.length; i++) {
                var pointY = this.polygon[i];
                this.edgesPoints.push((i * this.pointSpacing), -pointY);
            }
            _super.prototype.style.call(this, function (g) {
                //Polygon create
                var polygonGraphics = new PIXI.Graphics();
                polygonGraphics.beginFill(0x000000, 0); // use an alpha value of 1 to make it visible
                polygonGraphics.drawRect(0, -_this.highestPoint, _this.width, _this.highestPoint);
                //polygonGraphics.beginFill(0x5d0015, 1);
                /*polygonGraphics.beginFill(0x0F2027, 1);
                
                polygonGraphics.drawPolygon(
                    ...this.edgesPoints,
                    this.edgesPoints[this.edgesPoints.length-2], 0,
                    0, 0
                );
                
                polygonGraphics.endFill();*/
                var polygonPosGlslAdapted = [];
                _this.polygon.forEach(function (pos) {
                    polygonPosGlslAdapted.push(1 - (pos / _this.highestPoint));
                });
                var fullGroundContainer = new PIXI.Container();
                var groundGrassF = new groundGrassFilter(polygonPosGlslAdapted);
                fullGroundContainer.addChild(polygonGraphics);
                fullGroundContainer.filters = [groundGrassF.filter()];
                fullGroundContainer.cacheAsBitmap = true;
                app.renderer.render(fullGroundContainer);
                fullGroundContainer.filters = [];
                //static grass
                var spacingConst = 1.0 / (polygonPosGlslAdapted.length - 1);
                var staticGrassContainer = new PIXI.Container();
                var staticGrass = new grassFilter(polygonPosGlslAdapted, spacingConst, 24, "0.0", _this.width / _this.highestPoint, _this.width, _this.highestPoint, _this.g.x, _this.g.y);
                staticGrass.grassFragment.grassMaxHeight = 0.0058;
                staticGrass.grassFragment.cameraSize = 100;
                staticGrass.grassFragment.time = 1.57;
                staticGrassContainer.addChild(polygonGraphics);
                staticGrassContainer.filters = [staticGrass.filter()];
                staticGrassContainer.cacheAsBitmap = true;
                app.renderer.render(staticGrassContainer);
                staticGrassContainer.filters = [];
                //Moving grass
                var grassContainer = new PIXI.Container();
                _this.filterGrass = new grassFilter(polygonPosGlslAdapted, spacingConst, 9, "0.001", _this.width / _this.highestPoint, _this.width, _this.highestPoint, _this.g.x, _this.g.y);
                grassContainer.addChild(polygonGraphics);
                grassContainer.filters = [_this.filterGrass.filter()];
                g.addChild(fullGroundContainer);
                g.addChild(staticGrassContainer);
                g.addChild(grassContainer);
                return g;
            });
        };
        polygonCollisionX.prototype.logic = function (l) {
            var _a;
            _super.prototype.logic.call(this, l);
            this.filterGrass.grassFragment.time;
            (_a = this.filterGrass) === null || _a === void 0 ? void 0 : _a.updateCollisionPositions(l);
        };
        polygonCollisionX.prototype.getYFromLine = function (xIndex) {
            var edgeIndex = Math.floor((xIndex / this.pointSpacing)) * 2;
            var xFirst = this.edgesPoints[edgeIndex];
            var yFirst = this.edgesPoints[edgeIndex + 1];
            var xLast = this.edgesPoints[edgeIndex + 2];
            var yLast = this.edgesPoints[edgeIndex + 2 + 1];
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
            if (xIndex < 0) {
                return this.edgesPoints[1];
            }
            else if (xIndex > this.edgesPoints.length - 1) {
                return this.edgesPoints[this.edgesPoints.length - 2];
            }
            return 32;
        };
        polygonCollisionX.prototype.getCollisionVector = function (xIndex) {
            var pointSpacing = this.width / (this.polygon.length - 1);
            var edgesPoints = [];
            for (var i_1 = 0; i_1 < this.polygon.length; i_1++) {
                var pointY = this.polygon[i_1];
                edgesPoints.push((i_1 * pointSpacing), -pointY);
            }
            var collisionVector = new nullVector();
            for (var i = 0; i < edgesPoints.length; i += 2) {
                var xFirst = edgesPoints[i];
                var yFirst = edgesPoints[i + 1];
                var xLast = edgesPoints[i + 2];
                var yLast = edgesPoints[i + 2 + 1];
                if (xIndex >= xFirst && xIndex <= xLast) {
                    collisionVector = this.createVectorFromPoints(xFirst, yFirst, xLast, yLast);
                }
            }
            if (xIndex < 0) {
                collisionVector = this.createVectorFromPoints(edgesPoints[0], edgesPoints[1], edgesPoints[2], edgesPoints[3]);
            }
            else if (xIndex > (edgesPoints.length - 1) * pointSpacing) {
                collisionVector = this.createVectorFromPoints(edgesPoints[(edgesPoints.length - 1)], edgesPoints[(edgesPoints.length - 1) + 1], edgesPoints[(edgesPoints.length - 1) + 2], edgesPoints[(edgesPoints.length - 1) + 3]);
            }
            return collisionVector;
        };
        polygonCollisionX.prototype.createVectorFromPoints = function (x, y, x2, y2) {
            var triSide1 = Math.abs(x) - Math.abs(x2);
            var triSide2 = Math.abs(y) - Math.abs(y2);
            var length = Math.sqrt(Math.pow(triSide1, 2) + Math.pow(triSide2, 2));
            var vectorAngle = Math.atan2(x - x2, y - y2);
            var dx = Math.cos(vectorAngle) * length;
            var dy = Math.sin(vectorAngle) * length;
            return new vector(dx, dy);
        };
        polygonCollisionX.prototype.collisionTest = function (obj) {
            var index = (obj.g.x + obj.collisionBox.x + (obj.collisionBox.width / 2)) - this.g.x;
            if (obj.force.Dx < -1) ;
            var spaceFromTop = this.getYFromLine(index);
            //console.log("index: ",index, "  spaceFromTop: ",spaceFromTop);
            var collisionTestY = obj.g.y + obj.collisionBox.y + obj.collisionBox.height;
            if (obj.force.Dy > 0 && collisionTestY > this.g.y + (spaceFromTop) - 5) {
                obj.g.y = this.g.y + (spaceFromTop) - obj.collisionBox.y - obj.collisionBox.height;
                collisionTestY = obj.g.y + obj.collisionBox.y + obj.collisionBox.height;
                var collisionLine = this.getCollisionVector(index);
                //console.log("collisionLine: ",collisionLine.);
                //console.log("steepness: ",steepness);
                //console.log("collision angle: ",(360+90 + calculations.radiansToDegrees(collisionLine.delta))%360, "  dx: ",collisionLine.Dx);
                if (collisionLine.Dx > 0) {
                    var steepness = 1 - ((collisionLine.delta / (Math.PI / 2)) / -1);
                    //vector going north (vector starts at west point)
                    //
                    //
                    //       end
                    //      /
                    //     /
                    //    /
                    //   / 
                    //start
                    //collisionLine.delta
                    //Make collision line point down
                    collisionLine.Dx = -collisionLine.Dx;
                    collisionLine.Dy = -collisionLine.Dy;
                    collisionLine.magnitude = -obj.gravity.magnitude * steepness;
                    obj.force.Dy = 0;
                    obj.force.Dx *= this.friction;
                    if (obj.force.Dx > 0) {
                        obj.force.Dx *= (1 - (steepness / 3));
                    }
                    else if (obj.force.Dx < 0) {
                        obj.force.Dx *= 1 + (steepness / 3);
                    }
                    //obj.gravity = collisionLine;
                    obj.verticalCollision = 1;
                    return [true, collisionLine];
                    //obj.gravity.magnitude = 0; 
                }
                else if (collisionLine.Dx < 0) {
                    var steepness = 1 + ((collisionLine.delta / (Math.PI / 2)) / -1);
                    //vector going north (vector starts at east point)
                    //
                    //
                    // start
                    //    \
                    //     \
                    //      \
                    //      end
                    //
                    //Make collision line point down
                    collisionLine.Dx = -collisionLine.Dx;
                    collisionLine.Dy = -collisionLine.Dy;
                    collisionLine.magnitude = obj.gravity.magnitude * steepness;
                    obj.force.Dy = 0;
                    obj.force.Dx *= this.friction;
                    if (obj.force.Dx < 0) {
                        obj.force.Dx *= (1 - (steepness / 3));
                    }
                    else if (obj.force.Dx > 0) {
                        obj.force.Dx *= 1 + (steepness / 3);
                    }
                    //obj.gravity = collisionLine;
                    obj.verticalCollision = 1;
                    return [true, collisionLine];
                }
                return [false, obj.gravity];
            }
            return [false, obj.gravity];
        };
        polygonCollisionX.prototype.closestPowerOf2 = function (numToRound) {
            var testNumber = 0;
            while (Math.pow(2, testNumber) < numToRound) {
                testNumber++;
            }
            return Math.pow(2, testNumber);
        };
        polygonCollisionX.objectName = "polygonCollisionX";
        return polygonCollisionX;
    }(objectBase));

    var roomEvent = /** @class */ (function () {
        function roomEvent(con, tasker, app) {
            this.mouseXPosition = 0;
            this.mouseYPosition = 0;
            this.keysDown = {};
            this.gameKeysPressed = {};
            this.gameKeysReleased = {};
            this.gameKeysHeld = {};
            this.deltaTime = 1;
            this.camera = new gameCamera();
            this.interactionGraphics = new PIXI.Container();
            this.generateObjects = new objectGenerator();
            this.tileContainer = [];
            this.cameraBounds = [0, 0, 0, 0];
            this.roomStartString = "";
            this.objContainer = new objectContainer();
            this.container = con;
            this.tasker = tasker;
            this.keysDown = {};
            this.app = app;
            this.interaction = new interaction(this.interactionGraphics);
            this.container.addEventListener("mousemove", this.mouseMoveListener.bind(this));
            document.addEventListener("keydown", this.keyDownListener.bind(this), false);
            document.addEventListener("keyup", this.keyUpListener.bind(this), false);
        }
        roomEvent.prototype.getRenderer = function () {
            return this.app.renderer;
        };
        roomEvent.prototype.addStageFilter = function (addFilters) {
            this.app.stage.filters = addFilters;
        };
        roomEvent.prototype.getStageFilters = function () {
            return this.app.stage.filters;
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
        /*loopThroughObjectsUntilCondition(targets: string[], func:(arg:iObject)=>boolean): iObject{
            for(var i=0; i<targets.length; i++){
                if(this.objContainer.getSpecificObjects(targets[i]) != null){
                    for(var j=0; j<this.objContainer.getSpecificObjects(targets[i]).length; j++){
                        if(func(this.objContainer.getSpecificObjects(targets[i])[j])){
                            return this.objContainer.getSpecificObjects(targets[i])[j];
                        }
                    }
                }
            }
            return objectGlobalData.null;
        }*/
        roomEvent.prototype.isCollidingWith = function (colSource, colSourceCollisionBox, colTargetType) {
            var colliding = null;
            this.objContainer.loopThroughObjectsUntilCondition(colTargetType, function (obj) {
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
            this.objContainer.loopThroughObjectsUntilCondition(colTargetType, function (obj) {
                if (internalFunction.intersecting(colSource, colSourceCollisionBox, obj)) {
                    colliding.push(obj);
                }
                return false;
            });
            return colliding;
        };
        roomEvent.prototype.addObject = function (obj, layerIndex) {
            this.objContainer.addObject(obj, layerIndex);
        };
        roomEvent.prototype.deleteObject = function (id) {
            this.objContainer.deleteObject(id);
        };
        roomEvent.prototype.goToRoom = function (roomName) {
        };
        roomEvent.prototype.handleObjectsEndStep = function () {
            this.objContainer.populateFromList();
            this.objContainer.purgeObjects();
        };
        roomEvent.prototype.loopThrough = function () {
            this.objContainer.loopThrough(this);
        };
        roomEvent.prototype.updateLayerOffsets = function () {
            this.objContainer.updateLayerOffsets(this.camera, this.app);
        };
        roomEvent.prototype.getCameraBounds = function () {
            return this.cameraBounds;
        };
        roomEvent.prototype.moveCamera = function () {
            this.camera.moveCamera(this.app, this.cameraBounds);
        };
        roomEvent.prototype.isCameraInUse = function () {
            return this.camera.getIsInUse();
        };
        roomEvent.prototype.getCameraX = function () {
            return this.camera.getX();
        };
        roomEvent.prototype.getCameraY = function () {
            return this.camera.getY();
        };
        roomEvent.prototype.setCameraTarget = function (targetX, targetT) {
            this.camera.setTarget(targetX, targetT);
        };
        roomEvent.prototype.setCameraMoveSpeedX = function (val) {
            this.camera.setMoveSpeedX(val);
        };
        roomEvent.prototype.setCameraMoveSpeedY = function (val) {
            this.camera.setMoveSpeedY(val);
        };
        roomEvent.prototype.getCameraOffsetX = function () {
            return this.camera.cameraOffsetX;
        };
        roomEvent.prototype.getCameraOffsetY = function () {
            return this.camera.cameraOffsetY;
        };
        roomEvent.prototype.setCameraOffsetX = function (value) {
            this.camera.cameraOffsetX = value;
        };
        roomEvent.prototype.setCameraOffsetY = function (value) {
            this.camera.cameraOffsetY = value;
        };
        roomEvent.prototype.animateTiles = function () {
            for (var _i = 0, _a = this.tileContainer; _i < _a.length; _i++) {
                var t = _a[_i];
                if (ticker.getTicks() % t.tileStepTime == 0) {
                    t.animate();
                }
            }
        };
        roomEvent.prototype.getRoomStartString = function () {
            return this.roomStartString;
        };
        roomEvent.prototype.loadRoom = function (loadRoomString, roomStartString) {
            var _this = this;
            var _a, _b, _c, _d;
            this.roomStartString = roomStartString;
            var loadRoom = JSON.parse(LZString.decompressFromEncodedURIComponent(loadRoomString));
            console.log("import room: ", loadRoom);
            this.objContainer.removeObjects();
            this.cameraBounds[0] = (_a = loadRoom.cameraBoundsX) !== null && _a !== void 0 ? _a : 0;
            this.cameraBounds[1] = (_b = loadRoom.cameraBoundsY) !== null && _b !== void 0 ? _b : 0;
            this.cameraBounds[2] = (_c = loadRoom.cameraBoundsWidth) !== null && _c !== void 0 ? _c : 0;
            this.cameraBounds[3] = (_d = loadRoom.cameraBoundsHeight) !== null && _d !== void 0 ? _d : 0;
            while (this.app.stage.children[0]) {
                this.app.stage.removeChild(this.app.stage.children[0]);
            }
            this.app.renderer.backgroundColor = parseInt(loadRoom.backgroundColor.replace("#", "0x"));
            var _loop_1 = function (layer) {
                var pixiContainerLayer = new PIXI.Container();
                var objectsToAdd = [];
                var containsOnlyStaticTiles = true;
                var layerSettings = JSON.parse(layer.settings);
                this_1.objContainer.addContainerForLayer(pixiContainerLayer, layer.zIndex, layer.layerName, layerSettings.scrollSpeedX, layerSettings.scrollSpeedY);
                for (var _i = 0, _a = layer.metaObjectsInLayer; _i < _a.length; _i++) {
                    var objMeta = _a[_i];
                    if (objMeta.type == objectTypes.userObject) {
                        if (objMeta.isPartOfCombination == false) {
                            var genObj = this_1.generateObjects.generateObject(objMeta.name, Math.floor(objMeta.x), Math.floor(objMeta.y), objMeta.tile, objMeta.inputString);
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
                }
                for (var _b = 0, _c = layer.geometriesInLayer; _b < _c.length; _b++) {
                    var geom = _c[_b];
                    var newPolygon = new polygonCollisionX(geom.x, geom.y, "");
                    geom.geomPoints = geom.geomPoints.map(function (yPoint) {
                        return Number(Math.round(yPoint));
                    });
                    newPolygon.setPolygon(geom.geomPoints, Math.round(geom.geomWidth), this_1, this_1.app);
                    this_1.objContainer.addObjectDirectly(newPolygon, layer.zIndex, layer.hidden);
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
                    if (pixiContainerLayer.filters == null) {
                        pixiContainerLayer.filters = [];
                    }
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
                ];
                this_1.app.stage.addChild(pixiContainerLayer);
            };
            var this_1 = this, blurFilter1;
            for (var _i = 0, _e = loadRoom.layerData; _i < _e.length; _i++) {
                var layer = _e[_i];
                _loop_1(layer);
            }
            this.objContainer.forEveryObject(function (obj) {
                obj.init(_this);
            });
            this.app.stage.addChild(this.interactionGraphics);
        };
        roomEvent.prototype.getInteractionObject = function () {
            return this.interaction;
        };
        return roomEvent;
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

    var gameRunner = /** @class */ (function () {
        function gameRunner(gameContainer, gameProperties, app) {
            var _this = this;
            this.tasker = new task();
            this.targetFps = 60;
            this.fpsLimiter = 0;
            this.frameDelay = 0;
            this.godrayFilter = new filterGodray.GodrayFilter({
                lacunarity: 2.5,
                gain: 0.5,
                time: 0,
                alpha: 0.8
            });
            this.gameContainerElement = document.getElementById(gameContainer);
            this.app = app;
            this.app.renderer.view.width = 1280;
            this.app.renderer.view.height = 720;
            this.app.renderer.view.style.width = 1280 + "px";
            this.app.renderer.view.style.height = 720 + "px";
            //PIXI.settings.PRECISION_FRAGMENT = PIXI.PRECISION.HIGH;
            PIXI.settings.ROUND_PIXELS = true;
            this.gameContainerElement.appendChild(this.app.view);
            //this.graphicsModule = new graphics(this.canvasContext);
            this.logicModule = new roomEvent(this.gameContainerElement, this.tasker, this.app);
            this.app.ticker.add(function (delta) {
                if (_this.fpsLimiter == 0) {
                    _this.logicModule.deltaTime = delta;
                    ticker.tick();
                    _this.tasker.tick(_this.logicModule);
                    _this.logicModule.queryKey();
                    _this.logicModule.loopThrough();
                    _this.logicModule.handleObjectsEndStep();
                    _this.fpsLimiter = _this.frameDelay;
                    if (_this.logicModule.isCameraInUse()) {
                        _this.app.stage.pivot.x = Math.floor(_this.logicModule.getCameraX() + _this.logicModule.getCameraOffsetX());
                        _this.app.stage.pivot.y = Math.floor(_this.logicModule.getCameraY() + _this.logicModule.getCameraOffsetX());
                        _this.app.stage.position.x = _this.app.renderer.width / 2;
                        _this.app.stage.position.y = _this.app.renderer.height / 2;
                    }
                    _this.logicModule.animateTiles();
                    _this.logicModule.moveCamera();
                    _this.logicModule.updateLayerOffsets();
                    //this.godrayFilter.time += 0.005 * delta;
                }
                if (_this.fpsLimiter > 0) {
                    _this.fpsLimiter--;
                }
            });
            this.logicModule.loadRoom(scene_home, "");
        }
        return gameRunner;
    }());

    (function () {
        var app = new PIXI.Application({
            antialias: true,
            autoDensity: false,
            width: 1280,
            height: 720
            //resolution: window.devicePixelRatio,
        });
        var gameProperties = new gameSettings();
        gameProperties.stretchToWindow = true;
        gameProperties.applySettings(app);
        new resourcesHand(app, function () {
            new gameRunner("game", gameProperties, app);
        });
        //logger.initialize();
    })();

}(PIXI, PIXI.filters, PIXI.filters));
