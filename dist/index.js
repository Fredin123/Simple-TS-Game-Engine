(function (PIXI, filterAdjustment, filterGlow, particles, filterGodray) {
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
            PIXI.settings.ROUND_PIXELS = true;
            //PIXI.settings.TARGET_FPMS = 0.06;
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

    var tinyBlock32 = /** @class */ (function (_super) {
        __extends(tinyBlock32, _super);
        function tinyBlock32(xp, yp, input) {
            var _this = _super.call(this, xp, yp, tinyBlock32.objectName) || this;
            _this.switch = false;
            _this.friction = 0.986;
            _super.prototype.setCollision.call(_this, 0, 0, 32, 32);
            return _this;
            /*super.style((g: PIXI.Container) => {
                let newGraphics = new PIXI.Graphics();

                newGraphics.beginFill(0x000000);
                newGraphics.drawRect(0, 0, 32, 32);
                newGraphics.endFill();
                g.addChild(newGraphics);
                return g;
            });*/
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

    var r1_scene_lake1 = "N4IgxghgtgpgThAQgewK4DsAmBnAGiALgFoBGEgJgAYAacaeJNLbATUKIBZKa7YEUMOAOoBLTABcAFoS5dakPo0HYAEjBEBzSeMIkA7AGYeAIwhgA1hrhNMAYWQAbZHEIgAxADMv3kLQcQAT3gAEQhxCEIAbVBYcIB5YwArGDBxbABJdAAZQPgo0HERBxhCdFQHB1oRbHsoYxF0MJFkdDiPABUimGxCDwgHbBgqzDaAZXDCsE7i2vrGwpbXXxBqgAUIOHE22YamxYI+gaGQcQCABxKCHgaz1HFxuAaNJdoNGGQoVeQGtKiAXVoUGq2Ce6SgEDehGAAF9aAAPQjkcgcWgBRF6ci0RqwVzYcwBRBmSzWQQgaEAkBvD4wcSPbqZHJBFwESIUyRiTAwdC9fqDWiDcSFdAaHoEEDAAA6IGwYGsFVGFxgmFwUoIAAISNQ1VKZXKHAqYEqWKqNdDlv4mQA5eiuUwWKw2Ub45YAL0ynIRV1hMRpEASyVSGWyuWZ0ROXVK5UqKxqHzme1aHS6osOfJWIw84yaUy6O3mzW5YuWaw2Ww8eYTPKOtFOF0I13Qt3utKeL0p70+33QvxZFKB2BBwrBEMuMPhhAxPDRBAAbBisTaxbTDQBxLlk6gFCMEMoVKqxuq7BaJ6bdKtpsRjCYiHMzONHgttkubbb3-P7VPHWuXBtNh6totXg7L4flFVlAWBUFwUhAgxxAT0AFYOBREBpznTEQGxS4TjgVd129cNikjPcYwrY82lPFNeWOS9M2vW8YDIx9AJjdYX3LN9KwOaia3OH8qkbO5-2FNsqU7UD-gggcoJHKFYXgwgDAQ8gADpuHUjSNJnVFCHQhccSXXCYDXbkCMKIidyjfcmJaCjk3PGiMyzSZTxswsQGLbA2LLNyHN4usrgEv8WxElixJA7swL7SCh2g0d5M9fRtNQ3T50wxccLw0zN0Iy5d2jao3Ls4oqOrdMr2zVzOOPJ8vNLV9D3fQtP38-iVkE5tHlCjygI+CKe3AkB+0HDRhxguDPVIZK0LSrDXGXYz8Jy8y8qs0jqoLYqz24sraOcm8qsarietY+qOKOmqdrTb96yCoSQueMLgK7Abouk2LZNghL2BIabUowubDKyjctws-LrI22ykxKvzyroyrc0h9zPO8hr40ulqTj4272uCrrHpO8KXqiqSRrG+Lx2Icg0rQuR0oMzLFuy0HVpIwqka20qLyc+jDvR5iTufHykdhm7Atx+78dE56JN7UmZPG76qZp3S6cBxmTJB3LiIKg9+ahyjYb23nEYugWUbO3yrq-bHxZuSWAMJmXIskoaYtGuK5MpzgOAADh0ggEIATgBjKFs1szt3B9azYN+zreGCqXNN-Xkf3VHztT0Xbd-B3uuWInZcG4aFYphTiBnOnpwQih9Ow8OlpZnWIdjk948x42EbvVvaozq3MbF3POsdgvnde+WPsV73K6nQga9DhmG+Z7XLLZvWHzjmGE7h-aGKtwW6vY-ueKxgKh+EgnR764nXZLyey8m32DAw6cOEruv5qMiPlqjtb2dbzmRseZd0YiLFiQs0Yb2aifQed1h7516uJF2cs3bvQ9p9CaP1KC+39ilAgHBn4fyBkzMkFIxI0jpEGRkeQUHskwJyaBZUBRChFK4SU0pZSOH1IqZUJpNTag4XqA0Ro+Fmj8CGa0i8jI9FoG6LAMBEoEViH6JIKQ0gMhDPkFe0d-6p0AdvTuydu5Z3AYfYWPdt6wIlvAy+iD+ok1QWTT2X1vZkF9ihacJAQ5EJAJICAWBigACVkAfCzJsC+pDEEUJEPSYMTJXZ0IYbDZhTxRTih1Jw+UPCVSEA1FqDJQieHGlySQMRIALTwEkdhahcANSundAoxESjfT+jUVQzRKDyEtliTUhJHJ1zbxScKNJ7DdRcOEbwkp+TBHjKKaI80Eiw5GSyDACAAA3bo9huwQAaHkWRDTPQGGafEVRgYNHxM6R2aJPSOlhkmmQAwf0CAkAMMhRBogJDSHwZQIOyVC7IMiEHAwehqBApoCHbSIdNRBxICiIOPzqC+yBYi32mJfZ6AQoimcmp3Eol9l46gehfmEoxYShC2lDCYoxP7PQtcZxB39jOJF1AmWYiZSiJl2lOUst9ly3lPKg4Cp5Xyjl-LuVMsFayoV4r3E8o5USllegQVzklUqxVyqFVzg1ZilVLKOAgq4P7YFNBgWYqUpiam-svHaQoCiMgNBYWYpeVapl1ASCordYYN1vsHX6rdfoUFgqXmakdW6hCIL3WCqoJqcgBgDDUHIAhGg5AXluqDlG5ECaA3uqdaS-QIauB-HJLQRJAzMZDNYWKUZmTuGGkmeqfhBTZl1uKQ2spFS4BVNcA6Uk+z5Geg4MclRAZ1FxJoYNLplDznjrZP0xhaYK0jKbVkutOSG3TLGSukRJT22LIZiuAAqukXpfaPRz3JNCIAA";

    var gameStartController = /** @class */ (function (_super) {
        __extends(gameStartController, _super);
        function gameStartController(xp, yp, input) {
            var _this = _super.call(this, xp, yp, gameStartController.objectName) || this;
            _this.switch = false;
            _super.prototype.setCollision.call(_this, 0, 0, 32, 32);
            return _this;
        }
        gameStartController.prototype.afterInit = function (roomEvents) {
            roomEvents.loadRoom(r1_scene_lake1, ["dream_with_dad_1"]);
        };
        gameStartController.objectName = "gameStartController";
        return gameStartController;
    }(objectBase));

    var scene_home = "N4IgxghgtgpgThAQgewK4DsAmBnAGiALgFoAOAJgAYAacaeJNLbATUKLIEYLrbYEUMOAOoBLTABcAFoQDsMyjUh8Gg7AAkYIgOaTxhMgDYArDwBGEMAGstcRpgDCyADbI4hEAGIYJb95A0nCABPeAARCHEIQgBtUFhIgHlTACsYMHFsAEl0ABlg+BjQcREnGEJ0VCcnGhFsRyhTEXQIkWR0BIAzABUSmGxCDognbBgazE6AZUjisB7S+sbm4rb3fxBagAUIOHFOhaaWlYJB4dGQcSCABzKCHibL1HEpuCatVZotGGQoDeQmjJiAF0aFBathXpkoBBPoRgABfGgAD0IHHkJBoQTYAGYFCBmrB3NhLEFEBZrLZBCA4cCQJ9vjBxC8+tk8iE3ARojTJGJMDB0AMhiMaCNxMV0Fp+gQQMAADogbBgWxVCbXGCYXByggAAg4VC1coVSqcKpgauYmp1cLWgTZADk6O5zFYbHYJsS1gAvbK85G3BFxBkQJKpdJZXL5dmxc69cqVarrOrfRaHdrdXqSk5C9bjDpTFqzXr7JatflStabba7DpFlMC040C7XQh3dAPJ6M17vWlfH5-dAAjk00HYcHiyHQm7wpH6DgAFlnGJRHDINHxN3OcFNAHE+VSqEUYwQKlUaomGgdlqm5n061mxJNpiIC-MkxeS12Kzs9q-i0dM2dGxuFs22eTsyw+Htfn+SVORBMEIShGECCnEBfTIMh5EXAgOGXAA6bgCMIwiDFXB0pUZbdd39aNSljE8ExrS9OmvDNBTOe9c0fZ8YEY99wITLYv2rH9a2ONiGyuICalbR5QPFLs6V7aCgTgkcEInWEEVQlEAE4sRIkBMWw5dSIJcjNxgHd+Wo4paKPONT14tpmPTW92JzPMZmvJzSxActsEEqsfLciSm1uaSQI7eT+MUqD+xgod4LHRDJy030OD0gyjJwlc8TIjdKOs-caJuY941qHyXNKVj62zB9828kTLw-ALK2-c9f1Lf9Qqk9YZPbF5or8iDvjigdYJAYdRy0cckJQ9KDFndFDJRAy13cCjLKo4rbNKhyGKaksqpvMTao4zyn0ajrROGgS2uE67mtOrNAObCLZKit4YsgvtxsStTko05C0tWpasI4Nb8s2qy9wPOyyscw7nLTaqQrqziGsLJHfP8wL2uTJ7uvOSS3r6yLBq+27Yt+hLVOm2bUunbCDG4LCiDBvKzIKrairhvb6Iq7Hjpqu8PK4q6Cb427PyC7G0de8KyY+imFJ+5TBzp9S5pB7CsR03KjKIZdlvW8zCthkq6PKs9JeRli0fO8WsceqXcfu4LnoAknFfuZWwKptX4pUyakpmlLNKZ5cIbZ9CF059doe2vmrcRl27dcz2xnqrzndtnHTzxh68-l73gL9oa1mp9WJqmrXGe07CKBIZbDZxHhTe5mGbMPBGDrTq8M6Jx3MZffuWsLj2iYVsuBv9yvA7+zXAe1pmSBxNn5xNqGLK7nae-2wX++Fh2xZHni5f4mX8bfP9xOJsKZ7kyn59Gmng9r5f699GQSDjw2lvbtvc23d4YHxtjfAeqNM7owutxD20tWpCUnnfae71Z4VxGkpIOGsQ4AzDkDeahBFo8ENkYfWpkE47yTpbeyAtwGdWPtA4eOdR7F0vog2WY9oGoKVug5+mCxq01wfTcOwMmazmjitYg8hAFc0TrzGhvdD550YUPU+LDz5cIQRPC+U9S5oKfqrV+1d-oiIITrHKbMSCs3jhtKhCjdopz7iolGJ01HZ0urnCB493a6JQfo3hhjvrGOwTXUODMI4NyIFiX+bMuBNwoXY4Be9QF0Mqq4kW7kPFwIvto3xXC9EPwMZ9IxWDF7CLrpE30RAjBkBbmwHS85Elmx5hbRxtDrbpPtkw9RnjWHePYTogp-iimBJKcEspQiP74JXlEgwZA-4NPIbYlpu9k4dNTi47p7iMYaPgW7JBfjao8N9nw0pgj37hNEYQ4gRgZBZQaSzZpncqI0kUgyJkYZWQFBwdyTAvIup3xFGKCU7hZTykVM4Y0qp1QWl1PqCFRoTRmjhVaAIEZ7RcydOSOwnpvQwHStReIQYUhpAyCyCMwd3kdmZOGNkwc-kArRsC14kppQGkhcqGFGpCA6j1BypFMLzS8o4GikANp4CYvXN8uAOo8VYAJfoIlgZgxkq+ZSjk6ylH0JTKou+zC+maLYXkw5wzjkBNOUEgOITynTIiWIhunBlmt1yh3S4Eq3AgP5p0oWGST7ZIlgMk1nC2GFN6pa8Z1rJmXLwfam5GEDD1OINY55vIoBtAAIIiA4G0-eaTfXbP1b0nJWiDkhoGWG0mEaVYTIuTgu11ydYGB0iZKR7AEkrOjOgEkLgrA4lzakn1R8-U9IDV4zqPjTWhpGeG-qVqX7RvrVc8xTNm2tsNrHZ5Yoe3ID7WQAd3rNkQL1WdYtgaJ2DPydO81ozq1zwEW-JdsbG2rpbQbNgm7O3bsQL2yw-avVOOUcekdOzYHnpumW6+F7K0+znZGhddawnPpXQ3Nd77iCfo7t+39-6UmHuccBwtp6x39IvcGqDokYOP3gw+kxS8ZlfyIW+mOCyt1NB3Xug9gGdVMRA0WkjRqg2QaLhWmdVa4M1qjYh0xlSHW+jQyxuOWH2M-t3X+-dAGNkEYYXx4juzDX7ILle0TN7Z3k3vd2G1Uzl2zPk8xttmGoYqZwxpvD3GumD34-pktxrhPINM+J8zGDLOLqQ2Y2zTH10ftY1+5zancNarAR5qBoGnakYg0ZqdJmXoWokxZquoSZOfyqZF9D7AYvKe7apzjmntXJbcV5sD46Mt3Sy9BsTsGgv8JC9J+jcam32Y3RVpzVWXNca00BnTRHRYCcM618t7WAudfLt1grtqbOMYIAphzw25FxZq25ibPGjq6Zm958DT1yMicWzl29eXgtres8hiLW3BsfqMJDPbo34uucS-m4d02snnea5dvzRzbtmZW+cx9YXZM3O2xuj7bHvsHb+0OrZnm9NNfS6DzLC3KMdeo5JhDMOisMZK69qLGGkexZR+p8bdWC2Y7O9jwTZGwdmoh4FqHtbSd9Zfaht71PPsJ32-T2rSWmcpca2ltnLWr7XYJ0ton+WF5PfC5thH72RcbTFwlxRkuAfM6B6zubCv-Nc+W2c3ndGKnFbk6VmONPKscfF4dxnRvpdY9l2bjhFHCaE+KcT2jhX+cobs1T9gzuRuu-1+0j3GOvcs597kjn17Lcq4e2rmNGuKda+F8j2Pv2Df-cTw173Z9fdDPT17O7XXoe24beHx3Dno9faLwzw3ZfMlZ2Bzj12eP-d8So0H1XVmc9w4G5HupW92-Vbd2jo9U3je99N6nwfiuA-K9H1n8fT7c8O8p2Vmfhf59x7zejwjK+YEp9LRvi3tfIfW6k3zu35PD-5-YM3U-Y2Jel6v0nibrfr5vfuDo-tzs-iTo3htnnkLl-rPqLnTufoOkvrqqdkAZXuvvNkPrfNvmMsHj1q-k3i9p-ifrTh3n-pfsvoAavsAUJqAZzuAVbvOiHuts9prnAWQS7mfsXvHl3gAeXsnpgXftgZvsPoHvgWPqFmTv1q+tPt-uQTwZ3v-tQYIRgXslgebmAT1BASwYQdAewbAfIQgbrkgbwRfqgbxoDrQcISAaIQ-jocwTRvoaHm-rIYLsYT-j9soVQWgdYTfrYfQfYdoffE-noY9hPvbvDpwQodwb-u7vwaoT3gERoSIVoYwY4ZnqttnvvpPnIcfrETHkoZQZYSdv4Qaj5kEekTXpkTvtkXvrDlEVPgUSYeRHruYSgdpn4dfhURdgPsERkaEboc4REbkU0fkTHIUXPvEYvl0VYT0WeiDv0dUdlkwVkQ3q4cQRwZ4YoTMSXr4fMTQSkQZpoX7mIbgRnnURsWwQftEZHm3F4ajvsaUenEcb0UsUcFdg4UMU4QQaMY0e-ncWVg8bsd4SUXMWUQsbNqcdXqsbUZIbvtIWHiQXASCXEWCQkSod0W8Ysf3p8WnnCT8esTbpsTAR-qibiOiU8XwViYcWoTYakXYSsTdmsVcSSTcXkR4cCZSUUXsTSQcZCTidCWkWcd8ScvdvUUiW4QLhHtybIogRQZiQKa8fSccZUezgwTUUSWyS-gYbcc0WzGibyRibMZNtiaqe8XifnAMVqeKfXuyerpybKYaTydMSac8RCSqckZaXLrjjaYSXaTzrqaSYYeSfca6QqcUUqS8ZAhabib6csaKSEYGZAawY6eMVyS6fKaYYqaacdl6f6n3gmfiZqQGblvacGRyRmc6W2kaW6dSRYZ6bGd6fGVXsZiyfCXeoib1tKc3kflmY8Qvh6WaXSS2cKUyUmYMSmeETkQCe4TWS6tmW0WYT4TGSekIYyVUZObaeWUGVASGfqRMbWbUoOcgfhiOYKXGeOVubCR2dqQiZKT2VsUYcCSeaCQ2Z0ReQWaOkWW2W1krpcQ+dcemYCQacea6saR+eefmc2YWWviKbeQBayUBQ6ZEaBUea3G+VSUOfyWuegQyScQhe2UhZ2RKcBWhfOS3phRBfWThY2V+bBT+fBROYhVvoBV2Y+UQWSUCYaVhZBXRZ+TBeueoYRSxcRWxchRxeRWMehZmeBaeR0dBfVmOb+TCeJeIXgVJahTJZRf2fJe+QJUpVLleapURf+RJaRRWfuVWbJQudiHxbRWee5sZSpcxTeepRcZJWRdpXOTKVRdiLEgZU5UdspXBXQRqf6XedOSMbOTIX5Xpa3IFdhcFQngIa5eFfLtuWWXXnuWmRRfFZ-jEkpvxSlYkeaelYERFcySRfeVpZWSBbpYVUlSVYpc5Z7iZW5VVVlVFbuamS4TZY1aic1Y5a1SFS5WFZVZlaxRpexd5fVflX2U1cVSNauU2cJQReqVNR5YCppXNdZQ1QVUNctZGXyfRUJfhWqX0SWZFTVdFX8bFcidsWVhIjrsubmcOedeUa2WpeZTNV5VZXlTpYdZHi9QpatQxetZdR8dadVRZbVXtYDb5YtXAaDUFaNalUkRNZuV1dNZ5ZZblf1QdcjSDZIslejWVaOVjaJe5b9XjfDQDYTQtSiSTa9V2u9bhWtRdT6X+fjnDXdVIU+dxWBf-KTS1eDZ9VCaZWJbTTtbNQzf8XFcTc9aLSteCRDVzd9WZbzX9fjX1QrY9S+RvCrSde6RzerV9deTjdtSXDlXrQ9b2czcrazdhqbWdaFUxRlX6bDTrfTQTfrQ7U9Ubc7e0eLe7alpNV7d1bdb1TOQ0YrY7UHWDWrRLUKVLTTdrXTfzd2VxaGTxW2qjWTaHeNR7RHYmbjbLf9X7fbc+WGU7UndGZzRbWnVbTLTbWETFXHQbbXYnWjUXe1RVdjVta3dwjHR3VKTXXnSLcHSucnWHTLqXddd7ZnaPfdZ3QHYbfncbTmVGXmXPRXoPZHeXW3cMavePULRhWwAXWLbPcXeHQfWXdbSPbbbHWfbncLZfRzIXTff3VTZtYfY-SPihfNUDUrRvJ-dfQ3ebZLZ1UPRnRXbrS-YLW-RfcQJvPXbvbffPffYvVHXzSvQLTnYeXJf-OA6rZAynR1Z7Q-cPYA3VftUzYHfnaQybVBW1d3r-VdTDbgz7VnZxXqU6f5ag8w9vadYJXvRudTS3XA8fb8QQ-w9WYI+zMI29TvR9eIyJX-dQ9I0-e3afUg0Q3ZUI60Wzao2bRQwPZI7AzgfA77XbWvRPe-UY+g2o5g-vZY--TQxIXQ4jfHYwyQ8Yy7aw2NT-SXdg1w0fToyfXIweQIwlZfSmr3d-ew6E+41o9YzI8ScA0jQnfnQk1-eQ+oxtZw5Oto7QwjYzSAzk--HkxAxgyE3fakzgxE2U-LdXefcQ-E0uSY6I0ZfU1g40+EwA14+U-7Q4ygzUq2vk3U8kw05o000M7ta0-Y+04YxMzRSw4ZWw2lRw9DSU+k5E7I9nfI7ZYo0YJM7Uy430243M4M544s1Xcs8gx07ck0okwU64xIzc3s+cTY7w9Jdk342wEYK81M5czM-0185enc3LQ86-QY6cyCxc2Y4U1DVad82Kfg0czEwo3Ey88dSI67WIx8xo8U1C6U8M0s3C7E5-sC-iyoz01s5jSk5C18cmZi3w9iyc7izUoi2Q9M9s8y6S6y1Oey-874xvaQryxs6VbSZeRYyywST1c-WPfo9S3AXctPezW7cS0U7s2S-sy07C6qzizS-cs48izq6i8Wbc+S-c3Y1Sya+q2a28-y0y7M0K4q9Hcq3o4Q2q5Hhq+a9q1c58x66WUq7o9EwNcDWVgGy62CwK+63q8Kzud65G0TVU0C866Cxa8GyS0m563g6m1i1G6A22rG9m0G+C9c6GzdYWxG8W+m4C8QCzAEyHUkwmxCzW0vb86Kz5eK93W2i24G0S7m7q2i-qz8xkzqfQ5U020QEO3Gzm1WyG-m2G16-WxyyWxm82x2hWyO8u3m+O8m9lRu2K13ZPWwAu3u70we2O9a+i2y0W5u42xK5e7u0i5Wx29W6u7Wzw721k-2xezu62zPe86O1azzQaxS0a76465HsQsOze1+yu0ewW3+0+2e+vQO4bAh4u5+2652z+921O0AzOwC6+827OF04E5s8E7exBz9bazC-a8a1y5-rh9e4y+VTs6h2u3W1Ew2wwxR-O1R4h1x5TYK0R9w8vRh32+e44yJ9R222B-R9zYx1B3a4g7B2x3AQYJhHh-u8h4e-exOxi7JwB-J+M3p+swS0Exjdx5J7x7+zJ6e3J1h0B-O-p5x3R0Z3e5B5Owc5k2R4Bwp9Z2Jz5wR9+058R4F9Oz45Z8855zZ-S4S0h5FyhyZ8e+GwJ8+0J9h2wDIBQHS906l+J3Kzx5l2hy5zl5h2M4l4V8VzRzK8qYxYm9F9Jz2+Z8Fwl6sw1+F-ZxJ215V3x+h65xZ+5wp31wZ2lw50N-52Z2N91xN+M1N95wN+V458N85514t-F8t-V0V-1xTRt3N+pwF4ayx9p4NZHjIPpEd7K9+ad1rRp8x1p8c9d2Vrd5q6Y-h7N4R+1809B5d+99G2zF9-dy15DWp89+d0D295yx92D3d9N2V49-91tzFxd-D1u3O+DyjxF391Fxjx1yR94xU+Rx-s3CQgV4mhD3hU3TAx40x5XcDwjwVVT2D7T-j+t2j0T-N4+7t+TyF6uhz22vciB1q4Z+l8Z-zyK113t3V-JqL4bOL3T43dA1Q-M9Cyz9jy+5TxzCr1z2t8d7zxl7Lym4L6Mys0Qr-EmkQKr9zyb61+j+byezV254rzbwbzTxLz91L4T2b2dwt+7+N571trb5z77wywT4Ny70HwLyH0t2H4mt79Ikbx+-77H3z-H3L5b20080r5Iob1H6VzHyd3HzD8H4c7l7O3niQEXz72r1A6nYz2k7D5pyq1d+zw32nyX3Z071D5rdLczwg53yD4tfXw8r303+YxV679l9X7V9b+Hz3-b+n3y-G9L35znxb4nwr8v4mqvw78bw9879n5Xwn4vx7wf5P5HzPyi9D8Py9zr2P2zxP0f+v9K+Taf4P5bVY+3691f4486+H-PvrRx55n9A+F-XPnvyF49cbeoA+-pa0f7p1n+o-H1uPxIK38xen-WzuAIH4a0-+TPNAbY1155d4c2A4vkgPA4oCpGJAv5tfwL4ICp+a-MAc13p4a8F6Nregf+yT439EBjvH-oQObr-8q+QXffkwJX4sDj+GfGblnygFP8ABL-DAW-ywECCT+kPYQa3y14j9SBQAvXhQPUGyDUekAmXjvzd5X9Q+-A6QbgJS798hBDPTXtwKUHoC025AptJQMb6CDNBjgrgQ+xgGWC+Bkg0gItDiQUBdsX-PuqpyH6oCXBeglQcAMPwhDFkxALgBELwHsD1eLfJwf4N36BCJB8LZNKELbRpDGuynV1gHzMHQC8h4guAft2qQkBihhsUodQOiFEC2+YguLnULD7JCwhbeSIe2y34MdqhFg2oVb2CGNCUhRsCgP0IyHf8fBnAsJrkNGFdDxhhQ3oSUJmHfdo+EA3-iIOIFxCGBVgiYU0LYBcBZhdg-AQ4MWEDNlhC-MYfn3WGTC+h2w0vrsK0E5DTOl-B4Y8yeGnDUhWw1ob52GGKDOhpHAobEw2HNCm4bA+YRwOyF+CvhAQn4Q6y5ZQizhMIoEUMNoGiDvhqwx4ZCOeGbCpiAwlTsCJxEHCwRZPNYYSP+HTCSRcwqIeSJiF0DDhvAiETi3RGpDlwSnUDhUPkFVDQReI8Ed0OX5cijYPIrEZUO34jD7h+I34bSKmE5ReRkvOQeX3P5CjkR8o1EbpXFHKipRAomUZqJqHajWOuookc0I4AOVSR-I9UQoNiFUiRmBIzkRaLOFWjkuJXewQsIRFLCkRJokUTSJdF0icI1oxkYMOlEgiHRwo6kc6LRGujuRoYy4ZkOb6UNERWXddrAMDFxjgx7og0XaMFFRitRAY2MeaJzGJjPRVw70amN9Hpj+O+Q0UScKVG5jvB8I6sbcL9ErDixCooMU2PLFNc4RWQtsQqxG7Vd6xWY0sU2OGo2jN+EYikR0OjFOjux2YycWUL5EzjDRkY1kY6MpZmj4qeojgFOLDFkjsRLI3EUWJjFLiJxcSA8auNVEmC9h2g5wduJg6YDNs+4w8UmIHEpj5WXbEnrFy7E6i9x8YiUR+IrHJjZ+m3efhmLHEligJOY0Cf2KZEnj2hOgngfLwbF-CVxeY03gWK3ELidxXfPsu+NvF+81ROEo0YWP9EXjAJRE4CThAQnlD1x+YiiXhPPGLiaJL2YidhNMEsSzxVE9ibuNonwSSJOwggb4JrFVcdumY2CUJKwktjBxP4qToDw74JCDBOsLifJO-Fz9zBcogCYJM4l0TOArwr0a2MUkA8FmgA1Se4KZh6ijJ3Eh8Z8NrGjdpJl4uCUqLsmaSIJT3Y0Z2Oon6S3xhkrep+KQmzjTxlI-CS+NUEBTgxHkjQaZO0myjoJKI-yRTlsnKMwJX4ryRXx8m6S-JhEgyTFPSmITwxG4ucahLZHoTxxbkuJAslhEhTSpYU+cWxIImvjUphkoqYxKXbMiUJT4iKaz0SE3I0pdUkqcxM3F8TfJAk-KdFPck1MN+XU5CfsKan8SWpUUtqTFNmnTj5poUnqXcKSmmippa0maSqNIn3iPhaYySaT0mmtSkhhkjaUeNtHkSxp4U5qZFIGnqS6JWIc5nNN+4NSdpHY3KVdNWk3Tgxn0j0cVOPHbTFp5U58f1LUk2SPpUre6UxMellTepL02GdZKiQIyRJbwsSTcOHHbdLpK0t6fDJBmIzgpI0lGY1Ohl9SyBtfYGUqKxDkyMp9U0aajN2l1jkpB0hmXEiZk4yTJCkhKTlL2l6TuZg0j6Vm2MFl8qZf0pyaOK5nXTxZIMyWd9Mz5szqZaM5aa9LhlYzlZxkysfFMgk6SRZeUxWe9L1n2SzpEkkcVJJgmuTZJvMlWZtJ+nqzZZF0-8abKBlKzGZTspGVtN+lQzNZE04mTrIaEWzPJD-DWRzOcl2yOJ00uJFR2GkQyA5j46OfLP2lmzSZSoxOZbPEnti5ZtshWV7PNnZz32qssiTxKelLTg52szGWHNLlJyHplc9mf9JNmAySZushubnPxm-jlJlktwfTO9kJyy5zstWTLMDlpzC5Gc4uVnITmicI5yAqOa3M5nTyO59cuecdNEnXCfR+c92Vj30F1y2AdE+cJvNxnbyhxvciycoIHkU8h5JQk+d3J3kEzMecPA+YPJLkbzH5F8pSVfNcGCd35s8++fPLimCyjZiUleaLMzmdzP5C8mgUvILlEza5AC6BUAtPkCytJYC4WRAs9lryj5wYh+bAraETzl5McoubgqKHZzgFUs94XnOfl-j95Vk5BevPvledqFeMp+ZfO15-ya+t8j+SwrBmdSXZ481OSQvTmQKZ5KC5obOFYXlzTptCzhboKOFBDMJCcmRaPIrkOTzpNsxBRjKYV4KlRJgfmQbNAXeTKJNc3RbwsAXNDDFX8sycTz7nXz-5liyRWcJsWELupxChBR7Pbmhz9FcSNxSAowWmLWJWsixcLyxnrwShRgZHoEqykaizFAMkOYfOTSRLrFMSthefLsVQTsFPi5JaQFSWuL0lsi6Wc3PgV7zX5jC5xQ0IKWpDol+s8CZHLdnaLvFSSvRSkrKxWiil6iuRT3J-lcL4hN88JdUo6V1LbFQshJW3NaVVKj5NSo2KMvcULSRFXihhYMvgHtL-FXSv2UItKVNLCZLSpBdMuTQ2I0l9SzKY0s8XlKVJqy+oUfOOWFLTlrM4RY5MuX9ynFQy25dT1qWbKKZyc12RcuaUrK3lay0gHcq+UPLKZOy-5XssBU8L3lRyz5XMu+UsyIVmi62dCoqXXKeh1iBFZ0vBW-KnlWi9FVcqBU3Lp+USpFeDKbmord5AKjFSSp6EO8TlYyzBRMpyVTK4VrAjZXiqpVWyaVRK15bCuBWMr7lzK4JeNMSUHKOVePJlQsshlLKXljiwVaSvt7I8ZVsS85fKtpXEqlVDK1VSKtlUpznlWqgVUv2CHSr9V6qxebspfnarTV6w81WCtFXZTWVpC1eb4ukR6rHVBqv5Zqv5WKq7VkIh1Yiu5XIzIVvqm1SasYH2rPVwapOm8h7AfIRAtKGVAyh5C7hoELKcUGynBSGgoUyKWFCKn5SIo81QqVFNaAxT5QtApgHNDQC9AKpfQRgZVIkFJShgKU9KHBNSk+RtqfkUYBoanzIQcBcIOkYdSOtHUjrMEogCQNIAID19lk-xCGFaKoBWidIRgJdWQlXXLqN1dyHSEuoMBcBd1MwtdSQBkBrqjAW62cCRCtEnkrRZrCGBQBPV3rdQVo2njeqfXAt0QnSh9bUifVLQH1F6v9YYCXV6wd1c4cIUBrkBAbyEHAPWNQGg0yAFw0G2cFiCA1IagNWIZDdBrnBAaFA0GsgBhpxBPqsQh642A+sMArhlw6GpdRlEvUHiQNy6qjehCXVNwQNFAF9UV0vXhDyN3AEiDpBkCrqV1PGjCFQD0i6gW0O649SuBIBnqqA5AVdT-AXD3ISIfG6gLdzk1kAd1MgEyM2moDGAd1xgE9YtBIjzJV1ZCdEB9jM3rwTAO62cOQhs26gbNJ6mzeiBs0LgbN1AGzSuDc1UAbNq6uzd5p0juaW0-mzzY0n832bQtPm-za5qC1+alozm49VQBMAnrakJEaJQuGiUrhak1AEwO5pkDWbNN3m+voVtc1FbYtpW8gN5ry2VaSI0i5zVVtq2VbrNpWs1tIt80tb2t+WmrQVukX2b2tbWrrb1sG2VahtPWyrchtG0Tb2tvWtrb1s83db5tI2vjcNrG3LbJtvWrreNoW2ratta27bYtv217bDtDWpaCFuy2swrNiWg8YlvU2JaJEt2szfMkS3NpEtCWlmDpq01XaDA68YwMhoMCPawuiaFcImlXUp8qAoOxNCesK4qboNVAeQCuFU2w7pFsOu5LDue1yBIdCWvLchqx2w6gtP8OTVJu804a-tD6v7bBuMDkbFoGGvdbuqfU06F1tOqgDiEBDUgaAjKdNUTEzWgopQOazlNClNAFrtQ8KAVCWoF3CohdYqD1FKncAuhKQta-FPJibUkoQw5KOlD2p5XyK+lii9kRhNiaohnUukARWuP9k+qjVfq7hQGpxb670Md6p1fEpCXmK6Zhy63eDDqR277RDuiVWErWUu6pEOkENSboJVoqI1-qqNXrry3oZihlquBdavoV0qdVy-X3UZEiXR6iF4auPbarD1W6I9WENBcYqCXOrPdkyyVT7pz21kjdd4kpdSroUOKLdWerlknsvZGKGlVqqFSHrr3HDChje4gP7vd24TxVxe73aSu71Gw3d3qoPXyvb0DL6Viesvc0KeTj6w1ZuqfUoo5EN659Zw5ZKno8Xp7a90+hPZIIPExZmhW+jJVWKyXGy2VJe4fVJpYEZQK9J0qvbypr2-z99lurljEn07ZRfZPyjXb0vMn9LV9uunFp-pt1fTulT+zXQAe12VSZJL2UA1hDum-7Q11ehRWhLz72z4DEmrCB1ON3bLUDWu9Ay5LjkU4EDUiIKcivxVL7CVK+nXVVL7JkH59fe3ic9NCVO64VjB+Jswark0z0Z7BtZZwaOXcGW5yy+Pe-t0qCGJRD+reefvGVF6r9Q+sPpIbnDN6zlre3fa-qAP0GsDX+s4T-soN-6OFhBiqRgZIOH4YkNODdCPK2VjzqDwejPZGs72xMYkx+j9NYeQOB67Dk+hw6HqcMgGN9GGdwwYZQPP60DJh4gylPMPYHyDzMylSEagP2LNDdBuA5tidRJouAyGztB6kQAvBMAnwUkFYCpDxr6QNKdVO2omjs6bGXO7NSLq5QC6eUQuotbmrqMooRUkuitVzCrX7p5d9a2QErtVStq1dkYYo-EC7VDHCgDcI-SkLOZkB8IREeY7qBCyTqpA+gIrstH+JEaT1ZAaJVQG2Orq9jux2nmRt2M-xDjK4OpAuCI0rhPp6IHENcc4BM6sQJ6rECeX0g7qYktxxoUzoS0vHV1n06gIYC2PbHdjFAZDZQC2Mw6Fk5xnYxhABOxI6kO69TQCaq0n46k5xteLsdC3qbdQn0-Y9-nU23H71ux7-ERuQ2kmmdJkT6e8dYxUmmd6EFnVyDTVVGGQIKGo8WpaOC6+UCKZo-ztaMS7y1doStRSCwDdGQAdan0IQBID9GW1qulNR2oTWlHu1wxtnUyeZQsnWUYKWo7yc5PC72T2p8XZaAFOSogEMAHIDAAgAAA3PoI4H7AQAmgBQHoxKYIA6RpTKusoz2pGOJrk1GqCo6qYzXqms1mpvU-moaNcmtT+ag06KiNNwBpdUoGwBABHDyonTXAV02qiVNUoFTYxuU76f+Qc6gUAZ7neymDPco4UTRvnRGbLXopBTXMLcAAFVMgKax04qmMjUg4QQAA";

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
            this.delta = 0;
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
                    this.delta = this.movementVector.delta;
                    if (this._actionContainer.getDirection() == movementDirection.left) {
                        this.delta = calculations.PI + ((calculations.PI * 2) - this.delta);
                    }
                    user.addForceAngleMagnitude(this.delta, this.movementVector.magnitude);
                    if (this.objCreatorFunc != null) {
                        var newObj = new actionCreatedObject(this.objToCreateLife, this.objCreatorFunc(), this.objToCreateOffset[0], this.objToCreateOffset[1]);
                        this._actionContainer.objectsCreated.push(newObj);
                        this._actionContainer.positionCreatedObject(user, newObj);
                        l.addObject(newObj.obj(), user.layerIndex);
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
            this.i = 0;
        }
        actionContainer.prototype.playCurrent = function (user, l, direction) {
            this.direction = direction;
            for (this.i = this.objectsCreated.length - 1; this.i >= 0; this.i--) {
                var objMeta = this.objectsCreated[this.i];
                if (objMeta.life > 0) {
                    objMeta.life--;
                    this.positionCreatedObject(user, objMeta);
                }
                else {
                    l.deleteObject(objMeta.obj());
                    this.objectsCreated.splice(this.i, 1);
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
        function baseAttack(creator, direction, attackTargets) {
            this.attackSeries = new actionContainer();
            this.attackTargets = [];
            //private movementInformationPlayer: actionPlayer = new actionPlayer();
            this.done = false;
            this.attackDirection = movementDirection.right;
            this.attackDirection = direction;
            this.creator = creator;
            this.attackTargets = attackTargets;
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

    var dummySandbag = /** @class */ (function (_super) {
        __extends(dummySandbag, _super);
        function dummySandbag(xp, yp, input) {
            var _this = _super.call(this, xp, yp, dummySandbag.objectName) || this;
            _this.switch = false;
            _this.gravity = new vectorFixedDelta(calculations.degreesToRadians(270), 0);
            _this.friction = 0.78;
            _this.airFriction = 0.9947;
            _this.weight = 0.037;
            _this.life = 1000;
            _this.collidesWithPolygonGeometry = true;
            _this.sameLayerCollisionOnly = true;
            _super.prototype.setCollision.call(_this, 0, 0, 64, 98);
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI.Graphics();
                newGraphics.beginFill(0x0000FF);
                newGraphics.drawRect(0, 0, 64, 98);
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

    var threeHitNormal = /** @class */ (function (_super) {
        __extends(threeHitNormal, _super);
        function threeHitNormal(creator, direction, attackTargets) {
            var _this = _super.call(this, creator, direction, attackTargets) || this;
            var returnUserFacing = function () {
                return creator.facingRight;
            };
            _this.attackSeries
                .newAction().vector(0, 3).userStill(true)
                .create(function () { return hitbox.new([64, 80], 87, 1, attackTargets, returnUserFacing); }).objOffset([48, -5]).objLife(3)
                .startupWait(3)
                .newAction().vector(0, 3).userStill(true).continueWindow(15).removePrevObjsOnCreate()
                .create(function () { return hitbox.new([64, 80], 40, 5, attackTargets, returnUserFacing); }).objOffset([48, -5]).objLife(5)
                .startupWait(5)
                .newAction().vector(50, 6).userStill(true).continueWindow(19)
                .startupWait(5)
                .endWait(16)
                .newAction().userStill(true).removePrevObjsOnCreate()
                .create(function () { return hitbox.new([80, 80], 40, 5, attackTargets, returnUserFacing); }).objOffset([48, 8]).objLife(12)
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
        function slideKick(creator, direction, attackTargets) {
            var _this = _super.call(this, creator, direction, attackTargets) || this;
            var returnUserFacing = function () {
                return creator.facingRight;
            };
            _this.attackSeries
                .newAction().vector(0, 16).userStill(true)
                .create(function () { return hitbox.new([64, 48], 20, 3, attackTargets, returnUserFacing); }).objOffset([32, 5]).objLife(10)
                .startupWait(6)
                .endWait(20).userFriction(1)
                .newAction().vector(40, 12) //.continueWindow(19)
                .create(function () { return hitbox.new([80, 80], 80, 7, attackTargets, returnUserFacing); }).objOffset([48, -10]).objLife(20)
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
        function forwardAir(creator, direction, attackTargets) {
            var _this = _super.call(this, creator, direction, attackTargets) || this;
            var returnUserFacing = function () {
                return creator.facingRight;
            };
            _this.attackSeries
                .newAction().vector(90, 1).resetGravity()
                .startupWait(3)
                .endWait(3)
                .newAction().resetGravity().removePrevObjsOnCreate()
                .create(function () { return hitbox.new([55, 98], 280, 3, attackTargets, returnUserFacing); }).objOffset([41, 5]).objLife(4)
                .startupWait(2).repeat(2)
                .endWait(8)
                .newAction().resetGravity().removePrevObjsOnCreate()
                .create(function () { return hitbox.new([55, 98], 10, 4, attackTargets, returnUserFacing); }).objOffset([41, 5]).objLife(10)
                .startupWait(6)
                .endWait(10);
            return _this;
        }
        return forwardAir;
    }(baseAttack));

    var downAir = /** @class */ (function (_super) {
        __extends(downAir, _super);
        function downAir(creator, direction, attackTargets) {
            var _this = _super.call(this, creator, direction, attackTargets) || this;
            var returnUserFacing = function () {
                return creator.facingRight;
            };
            _this.attackSeries
                .newAction().vector(90, 7).resetGravity()
                .startupWait(2)
                .endWait(8)
                .newAction().vector(270, 16).resetGravity()
                .create(function () { return hitbox.new([90, 32], 80, 8.5, attackTargets, returnUserFacing); }).objOffset([0, 38]).objLife(60)
                .startupWait(3)
                .endWait(10);
            return _this;
        }
        return downAir;
    }(baseAttack));

    var neutralAir = /** @class */ (function (_super) {
        __extends(neutralAir, _super);
        function neutralAir(creator, direction, attackTargets) {
            var _this = _super.call(this, creator, direction, attackTargets) || this;
            var returnUserFacing = function () {
                return creator.facingRight;
            };
            _this.attackSeries
                .newAction().resetGravity()
                .create(function () { return hitbox.new([64, 75], 10, 4, attackTargets, returnUserFacing); }).objOffset([32, 0]).objLife(8)
                .startupWait(2)
                .endWait(4)
                .newAction().resetGravity()
                .create(function () { return hitbox.new([40, 75], 170, 4, attackTargets, returnUserFacing); }).objOffset([-32, 0]).objLife(8)
                .startupWait(4)
                .endWait(10);
            return _this;
        }
        return neutralAir;
    }(baseAttack));

    var layerBridgeBack = /** @class */ (function (_super) {
        __extends(layerBridgeBack, _super);
        function layerBridgeBack(xp, yp, input) {
            var _this = _super.call(this, xp, yp, layerBridgeBack.objectName) || this;
            _super.prototype.setCollision.call(_this, 0, 0, 64, 98);
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI.Graphics();
                newGraphics.beginFill(0x00BB50);
                newGraphics.drawRect(0, 0, 64, 98);
                newGraphics.endFill();
                g.addChild(newGraphics);
                g.calculateBounds();
                return g;
            });
            return _this;
        }
        layerBridgeBack.prototype.logic = function (l) {
            _super.prototype.logic.call(this, l);
        };
        layerBridgeBack.objectName = "layerBridgeBack";
        return layerBridgeBack;
    }(objectBase));

    var characterMoves = /** @class */ (function () {
        function characterMoves(ladderObject, groundAttacks, airAttacks) {
            if (ladderObject === void 0) { ladderObject = ""; }
            if (groundAttacks === void 0) { groundAttacks = null; }
            if (airAttacks === void 0) { airAttacks = null; }
            this.maxRunSpeed = 6;
            this.superRunSpeed = 8;
            this.normalRunSpeed = 5;
            this.jumpStrength = 9;
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
            if (this.walkingBridge == true) {
                if (l.isCollidingWith(character, character.collisionBox, [layerBridgeBack.objectName])) {
                    character.g.y -= 8;
                    character.force.Dy = 0;
                    character.force.Dx = 0;
                    character.gravity.magnitude = 0;
                }
                else {
                    character.g.y -= 8;
                    this.walkingBridge = false;
                    l.tryStepBetweenLayers(character, false);
                }
                return;
            }
            if (l.checkKeyHeld("Control")) {
                this.maxRunSpeed = this.superRunSpeed;
            }
            else {
                if (character.verticalCollision > 0) {
                    //REstore run speed only if we're on ground
                    this.maxRunSpeed = this.normalRunSpeed;
                }
            }
            if (l.checkKeyHeld("a") || l.checkKeyHeld("A")) {
                if (character.verticalCollision > 0) {
                    character.addForceAngleMagnitude(calculations.degreesToRadians(180), (1 / 13) * this.maxRunSpeed * l.deltaTime());
                }
                else {
                    character.addForceAngleMagnitude(calculations.degreesToRadians(180), (1 / 32) * this.maxRunSpeed * l.deltaTime());
                }
            }
            if (l.checkKeyHeld("d") || l.checkKeyHeld("D")) {
                if (character.verticalCollision > 0) {
                    character.addForceAngleMagnitude(calculations.degreesToRadians(0), (1 / 13) * this.maxRunSpeed * l.deltaTime());
                }
                else {
                    character.addForceAngleMagnitude(calculations.degreesToRadians(0), (1 / 32) * this.maxRunSpeed * l.deltaTime());
                }
            }
            if (l.checkKeyHeld("w") || l.checkKeyHeld("W")) {
                if (l.isCollidingWith(character, character.collisionBox, [layerBridgeBack.objectName])) {
                    this.walkingBridge = true;
                }
                else {
                    this.jumpButtonReleased = true;
                }
            }
            if (this.jumpButtonReleased == true) {
                if ((character.verticalCollision > 0 || ticker.getTicks() - character._collidingWithPolygonTick < ticker.shortWindow)) {
                    console.log("character._collidingWithPolygon: ", ticker.getTicks() - character._collidingWithPolygonTick);
                    character.addForceAngleMagnitude(calculations.degreesToRadians(90), this.jumpStrength * l.deltaTime());
                    character._collidingWithPolygonTick = 0;
                }
                this.jumpButtonReleased = false;
            }
            if ((l.checkKeyHeld("s") || l.checkKeyHeld("S")) && (l.checkKeyReleased("j") || l.checkKeyReleased("J"))) {
                l.tryStepBetweenLayers(character);
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

    var grassFilter = /** @class */ (function () {
        function grassFilter(polygonPosGlslAdapted, spacingConst, grassPerLine, minGrassHeight, aspectRatio, filterAreaWidth, filterAreaHeight, filterAreaX, filterAreaY, height, windowHeight, width, windowWidth, myLayerIndex) {
            this.grassShader = "\n    precision lowp float;\n    varying vec2 vTextureCoord;\n    uniform sampler2D uSampler;\n\n    uniform float yPolPos[{yPolPosArrayLength}];\n\n    uniform float time;\n    uniform float windWidth;\n    uniform float aspectRatio;\n    uniform float cameraPosition;\n    uniform float cameraSize;\n    uniform float grassWidth;\n    uniform float curveStrength;\n    uniform float extraCurveStrength;\n    uniform float fadeSize;\n    uniform float MINGRASSHEIGHT;    \n\n    uniform float grassMaxHeight;\n\n    uniform vec2 collisionPoints[2];\n\n    const int grassPerLine = {grassPerLine};\n    const float SPACING = {spacing};\n    const float SPACEBETWEENEACHBLADE = {SPACEBETWEENEACHBLADE};\n\n    float randFromVec(vec2 co){\n        return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);\n    }\n\n    float distSquared(vec2 A, vec2 B){\n        vec2 C = (A - B) * vec2(aspectRatio, 1.0);\n        return dot( C, C );\n    }\n\n    vec4 generateGrass(float polygonYPos, int lineIndex, float lineStart, float topYPos, float heightDifference){\n        if(abs(heightDifference) > 0.04){\n            return vec4(0.0, 0.0, 0.0, 0.0);\n        }\n        for(int b=0; b<grassPerLine; b++){\n            float grassBladeX = lineStart+(float(b)*SPACEBETWEENEACHBLADE);\n            if(vTextureCoord.x > grassBladeX-grassMaxHeight && vTextureCoord.x < grassBladeX+grassMaxHeight){\n                float grassBladeRandomVal = randFromVec(vec2(lineIndex, b));\n                float randomBladePosition = grassBladeRandomVal * SPACEBETWEENEACHBLADE;\n                grassBladeX += randomBladePosition;\n\n                float relativePosition = (grassBladeX - (float(lineIndex)*SPACING))/SPACING;\n                float grassBladeY = polygonYPos + (relativePosition*heightDifference);\n                \n                float collisionForce = 0.0;\n                for(int i=0; i<2; i++){\n                    \n                    float distanceFromGrassBladeToCollider = abs(grassBladeX - collisionPoints[i].x);\n                    \n                    //Alternative WIP formula for collision(go to desmos.com): 1-(cos(log((x+0.008)^3)*1)*0.5)-0.5\n                    if(distanceFromGrassBladeToCollider < grassMaxHeight/3.5){\n                        float distancePercentage = (distanceFromGrassBladeToCollider/(grassMaxHeight/3.5));\n                        float distanceToCollider = grassBladeX - collisionPoints[i].x;\n\n                        float distanceToColliderY = abs(grassBladeY - collisionPoints[i].y);\n                        float distanceToColliderYPercentage = 0.0;\n                        if(distanceToColliderY < 0.02){\n                            distanceToColliderYPercentage =  1.0-(distanceToColliderY / (0.02));\n                        }\n\n                        if(distanceToCollider < 0.0){\n                            collisionForce = -2.0*(1.0-(cos(distancePercentage*6.3)*0.5)-0.5);\n                        }else{\n                            collisionForce = 1.0*(1.0-(cos(distancePercentage*6.3)*0.5)-0.5);\n                        }\n                        collisionForce = collisionForce * distanceToColliderYPercentage * (1.0+abs(heightDifference)*75.0);\n                        break;\n                    }\n                }\n                \n                \n                float grassBladeHeight = grassMaxHeight * grassBladeRandomVal;\n                if(grassBladeHeight < MINGRASSHEIGHT){\n                    grassBladeHeight += 0.01;\n                }\n                float grassHeightStrengthModify = grassBladeHeight/grassMaxHeight;\n                float grassTop = polygonYPos - grassBladeHeight + topYPos;\n    \n                \n                float yPosOfGras = ((vTextureCoord.y - grassTop)/(grassBladeHeight));\n                \n                //Apply wind effect\n                //Wave from top to right\n                float windStrength = collisionForce + pow(cos(time), 2.0);\n                float steepSlopeSwayLimit = 1.0;\n                if(heightDifference > 0.01){\n                    steepSlopeSwayLimit = 0.3;\n                }\n                float offsetCurve = (1.0-yPosOfGras) * curveStrength * (0.9+windStrength);\n\n\n                \n                vec2 grassBladePoint = vec2(grassBladeX, grassBladeY);\n                    \n                float distanceToBladeStartSquared = distSquared(grassBladePoint, vec2(vTextureCoord.x, vTextureCoord.y));\n                float extraCurve = (distanceToBladeStartSquared/(grassBladeHeight*grassBladeHeight)) * extraCurveStrength * windStrength *  grassHeightStrengthModify * steepSlopeSwayLimit;\n                \n\n                \n                \n                float bladePosition = lineStart+(float(b)*SPACEBETWEENEACHBLADE) + randomBladePosition;\n\n                float grassBladeLeftSideStart = bladePosition + offsetCurve + extraCurve;\n                float grassBladeRightSideStart = bladePosition + offsetCurve + extraCurve;\n\n                float alpha = 0.0;\n                \n                if((vTextureCoord.x) > grassBladeLeftSideStart - grassWidth\n                && (vTextureCoord.x) < grassBladeRightSideStart + grassWidth\n                && distanceToBladeStartSquared < (grassBladeHeight*grassBladeHeight)){\n                    alpha = 1.0;\n                }\n\n\n                if(alpha != 0.0){\n                    if(grassBladeRandomVal < 0.2){\n                        return vec4(0.12, 0.42, 0.01568627, alpha);\n                    }else if(grassBladeRandomVal < 0.4){\n                        return vec4(0.4196, 0.6078, 0.1176, alpha);\n                    }else if(grassBladeRandomVal < 0.6){\n                        return vec4(0.5529, 0.749, 0.2235, alpha);\n                    }else if(grassBladeRandomVal < 0.8){\n                        return vec4(0.448, 0.5509, 0.2019, alpha);\n                    }else if(grassBladeRandomVal <= 1.0){\n                        return vec4(0.425, 0.6509, 0.1019, alpha);\n                    }\n                }\n\n                /*if(distanceToBladeStartSquared < 0.000001){\n                    return vec4(0.0, 0.0, 1.0, 1.0);\n                }*/\n                \n            }\n            \n            \n        }\n\n        return vec4(0.0, 0.0, 0.0, 0.0);\n    }\n\n    void main(void)\n    {\n        /*float distToPlayer = distSquared(vTextureCoord, collisionPoints[0]);\n        if(distToPlayer < 0.0001){\n            gl_FragColor = vec4(0.12, 0.42, 1.0, 1.0);\n        }\n\n        float distToPlayer2 = distSquared(vTextureCoord, collisionPoints[1]);\n        if(distToPlayer2 < 0.0001){\n            gl_FragColor = vec4(0.12, 0.42, 1.0, 1.0);\n        }\n\n        float distToPlayer3 = distSquared(vTextureCoord, collisionPoints[2]);\n        if(distToPlayer3 < 0.0001){\n            gl_FragColor = vec4(0.12, 0.42, 1.0, 1.0);\n        }*/\n\n        float distanceToCamera = abs(vTextureCoord.x - cameraPosition);\n        if(distanceToCamera < cameraSize){\n            for (int lineIndex = 0; lineIndex < {yPolPosArrayLength}-1; ++lineIndex){\n\n            \n                float heightDifference = yPolPos[lineIndex+1] - yPolPos[lineIndex];\n    \n                float relativePosition = (vTextureCoord.x - (float(lineIndex)*SPACING))/SPACING;\n    \n                float topYPos = (relativePosition*heightDifference);\n    \n                float grassTop = yPolPos[lineIndex] - grassMaxHeight - abs(heightDifference);\n                float groundY = yPolPos[lineIndex] + topYPos;\n                if(vTextureCoord.y > grassTop\n                && vTextureCoord.y < groundY){\n\n                    float lineStart = float(lineIndex)*SPACING;\n                    \n                    if(vTextureCoord.x > lineStart - SPACING && vTextureCoord.x < lineStart+SPACING*2.0){\n                        vec4 grassResult = generateGrass(yPolPos[lineIndex], lineIndex, lineStart, topYPos, heightDifference);\n\n                    \n                        if(grassResult != vec4(0.0, 0.0, 0.0, 0.0)){\n                            if(vTextureCoord.x < fadeSize){\n                                grassResult = vec4((grassResult.x), (grassResult.y), (grassResult.z), vTextureCoord.x/fadeSize);\n                            }\n                            gl_FragColor = grassResult;\n                        }else{\n                            //gl_FragColor = vec4(0.0, 0.0, 1.0, 0.5);\n                        }\n                    }\n                    \n                }\n\n            }\n        }\n        \n\n        \n        \n    }";
            this.grassFragment = { yPolPos: [1, 2, 3, 4], time: 1.0, windWidth: 0.4,
                MINGRASSHEIGHT: 0.005,
                aspectRatio: 4.0, cameraPosition: 0.0, cameraSize: 0.06,
                grassMaxHeight: 0.02,
                grassWidth: 0.00015,
                curveStrength: 0.00008,
                extraCurveStrength: 0.0015,
                fadeSize: 0.01,
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
            this.myLayerIndex = -1;
            this.polygonPosGlslAdapted = polygonPosGlslAdapted;
            this.filterAreaWidth = filterAreaWidth;
            this.filterAreaHeight = filterAreaHeight;
            this.filterAreaX = filterAreaX;
            this.filterAreaY = filterAreaY;
            this.myLayerIndex = myLayerIndex;
            var lineWidth = (width / polygonPosGlslAdapted.length) * 0.1;
            console.log("lineWidth: ", lineWidth);
            grassPerLine = Math.round(grassPerLine / lineWidth); ///Math.round(grassPerLine*(1-(windowWidth/width)));
            if (grassPerLine <= 0)
                grassPerLine = 1;
            console.log("grassPerLine: ", grassPerLine);
            var movingGrassFragShaderParamsFixed = this.grassShader.replace(/{yPolPosArrayLength}/g, "" + polygonPosGlslAdapted.length);
            movingGrassFragShaderParamsFixed = movingGrassFragShaderParamsFixed.replace(/{spacing}/g, spacingConst + "");
            movingGrassFragShaderParamsFixed = movingGrassFragShaderParamsFixed.replace(/{grassPerLine}/g, grassPerLine + "");
            movingGrassFragShaderParamsFixed = movingGrassFragShaderParamsFixed.replace(/{SPACEBETWEENEACHBLADE}/g, "" + (spacingConst / grassPerLine));
            //Moving grass
            this.grassFragment.MINGRASSHEIGHT = minGrassHeight * (windowHeight / height);
            this.grassFragment.yPolPos = polygonPosGlslAdapted;
            this.grassFragment.time = 0.0;
            this.grassFragment.aspectRatio = aspectRatio;
            this.grassFragment.cameraSize = 0.24 * (windowHeight / height); //0.078;//0.08;
            this.grassFragment.grassMaxHeight = 0.064 * (windowHeight / height); //0.0225;
            this.grassFragment.grassWidth = 0.0015 * (windowWidth / width);
            this.grassFragment.curveStrength = 0.0085 * (windowWidth / width);
            this.grassFragment.extraCurveStrength = 0.0105 * (windowWidth / width);
            this.grassFragment.fadeSize = 98 / width;
            /*console.log("movingGrassFragShaderParamsFixed: ",movingGrassFragShaderParamsFixed);
            console.log("grassFragment: ", this.grassFragment);*/
            this.myFilter = new PIXI.Filter(undefined, movingGrassFragShaderParamsFixed, this.grassFragment);
            //this.myFilter.resolution = 0.5;
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
            if (grassFilter.primaryCollider.layerIndex > this.myLayerIndex) {
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
            }
            else {
                this.mainCharacterFollow[0] = 0;
                this.mainCharacterFollow[1] = 0;
                this.myFilter.enabled = false;
            }
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

    var demonAi1 = /** @class */ (function (_super) {
        __extends(demonAi1, _super);
        function demonAi1(xp, yp, input) {
            var _this = _super.call(this, xp, yp, demonAi1.objectName) || this;
            _this.switch = false;
            _this.gravity = new vectorFixedDelta(calculations.degreesToRadians(270), 0);
            _this.friction = 0.88;
            _this.airFriction = 0.9947;
            _this.weight = 0.017;
            _this.life = 1000;
            _this.collidesWithPolygonGeometry = true;
            _this.sameLayerCollisionOnly = true;
            _this.attackTarget = null;
            _super.prototype.setCollision.call(_this, 0, 0, 64, 64);
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI.Graphics();
                newGraphics.beginFill(0xFF11BB);
                newGraphics.drawRect(0, 0, 64, 64);
                newGraphics.endFill();
                g.addChild(newGraphics);
                return g;
            });
            _super.prototype.addCollisionTarget.call(_this, player.objectName, block.objectName, block32x64.objectName, block64x32.objectName, movingBlockHori.objectName, movingBlockVert.objectName, "dummySandbag", tinyBlock32.objectName, wideBlock.objectName);
            return _this;
        }
        demonAi1.prototype.logic = function (l) {
            _super.prototype.logic.call(this, l);
            if (this.attackTarget == null) {
                var players = l.keepObjectsWithinArea(l.getSpecificObjects(player.objectName), this.g.x, this.g.y, 1000);
                if (players.length > 0) {
                    this.attackTarget = players[0];
                }
            }
        };
        demonAi1.objectName = "demonAi1";
        return demonAi1;
    }(objectBase));

    var upAir = /** @class */ (function (_super) {
        __extends(upAir, _super);
        function upAir(creator, direction, attackTargets) {
            var _this = _super.call(this, creator, direction, attackTargets) || this;
            var returnUserFacing = function () {
                return creator.facingRight;
            };
            _this.attackSeries
                .newAction().vector(90, 9)
                .create(function () { return hitbox.new([90, 48], 85, 14, attackTargets, returnUserFacing); }).objOffset([0, -38]).objLife(60)
                .startupWait(3)
                .endWait(10);
            return _this;
        }
        return upAir;
    }(baseAttack));

    var player = /** @class */ (function (_super) {
        __extends(player, _super);
        function player(xp, yp, input) {
            var _this = _super.call(this, xp, yp, player.objectName) || this;
            _this.airFriction = 0.9947;
            _this.friction = 0.85;
            _this.gravity = new vectorFixedDelta(calculations.degreesToRadians(270), 0); //vector.fromAngleAndMagnitude(calculations.degreesToRadians(270), 0.6);
            _this.weight = 0.05;
            _this.sameLayerCollisionOnly = true;
            _this.currentSprite = "warriorIdle";
            _this.currentSpriteObj = new spriteContainer();
            _this.collidesWithPolygonGeometry = true;
            _this.facingRight = true;
            _this.attackTargets = [dummySandbag.objectName, demonAi1.objectName];
            _super.prototype.setCollision.call(_this, 0, 0, 64, 98);
            //console.log(input);
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
            _super.prototype.addCollisionTarget.call(_this, demonAi1.objectName, block.objectName, block32x64.objectName, block64x32.objectName, movingBlockHori.objectName, movingBlockVert.objectName, "dummySandbag", tinyBlock32.objectName, wideBlock.objectName);
            _this.updateCurrentSprite();
            _this.characterMoveBase = new characterMoves(ladder.objectName, function (l) {
                //Ground attacks
                if (l.checkKeyHeld("s")) {
                    return new slideKick(_this, (_this.facingRight) ? movementDirection.right : movementDirection.left, _this.attackTargets);
                }
                else {
                    return new threeHitNormal(_this, (_this.facingRight) ? movementDirection.right : movementDirection.left, _this.attackTargets);
                }
            }, function (l) {
                //air attacks
                if (l.checkKeyHeld("d") || l.checkKeyHeld("a")) {
                    return new forwardAir(_this, (_this.facingRight) ? movementDirection.right : movementDirection.left, _this.attackTargets);
                }
                else if (l.checkKeyHeld("s")) {
                    return new downAir(_this, (_this.facingRight) ? movementDirection.right : movementDirection.left, _this.attackTargets);
                }
                else if (l.checkKeyHeld("w")) {
                    return new upAir(_this, (_this.facingRight) ? movementDirection.right : movementDirection.left, _this.attackTargets);
                }
                else if (!l.checkKeyHeld("d") && !l.checkKeyHeld("d") && !l.checkKeyHeld("d") && !l.checkKeyHeld("d")) {
                    return new neutralAir(_this, (_this.facingRight) ? movementDirection.right : movementDirection.left, _this.attackTargets);
                }
                return new baseAttackNull();
            });
            return _this;
        }
        player.prototype.init = function (roomEvents) {
            var _this = this;
            grassFilter.primaryCollider = this;
            if (roomEvents.getRoomStartString().indexOf("target_room") != -1) {
                var targetJson = roomEvents.getRoomStartString()[roomEvents.getRoomStartString().indexOf("target_room") + 1];
                var roomStartObj = JSON.parse(targetJson);
                if (roomStartObj.from != null) {
                    var from_1 = roomStartObj.from;
                    var roomChangers = roomEvents.getSpecificObjects("roomChanger");
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
            if (l.flags().has("freezeObjects")) {
                this.characterMoveBase.move(l, this);
            }
            l.setCameraTarget(this.g.x + this.collisionBox.x + (this.collisionBox.width / 2), this.g.y);
            if (this.verticalCollision > 0) {
                if (this.force.Dx > 0) {
                    if (l.checkKeyHeld("d") && l.checkKeyHeld("a") == false) {
                        this.facingRight = true;
                    }
                }
                else if (this.force.Dx < 0) {
                    if (l.checkKeyHeld("a") && l.checkKeyHeld("d") == false) {
                        this.facingRight = false;
                    }
                }
            }
        };
        player.prototype.playFootstepSounds = function () {
            resourcesHand.playRandomAudio(["footstepGrass1.wav", "footstepGrass2.wav", "footstepGrass3.wav", "footstepGrass4.wav"]);
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

    var textPromptBox = /** @class */ (function (_super) {
        __extends(textPromptBox, _super);
        function textPromptBox(xp, yp, input) {
            var _this = _super.call(this, xp, yp, textPromptBox.objectName) || this;
            _this.switch = false;
            _this.friction = 0.0;
            _this.textContainer = null;
            _this.blurrCharacters = 10;
            _this.blurredCharactersArray = [];
            _this.blurredCharactersFilterArray = [];
            _this.okButton = null;
            _this.okButtonGlow = null;
            _this.okButtonGlowStrength = 15;
            _this.promptWidth = 0;
            _this.promptHeight = 0;
            _this.FontStyle = null;
            _this.textPrompts = [];
            _this.currentPromptLines = [];
            _this.currentPrompt = "";
            _this.currentPromptIndex = 0;
            _this.displayedLengthOfPrompt = 0;
            _this.characterSpeed = 3;
            _this.characterSpeedCount = 10;
            _this.fontSize = 29;
            _this.boxPadding = 8;
            _this.promptDone = false;
            _this.promptAlpha = 1;
            _this.enterKeyHeld = false;
            _this.promptDoneCallback = function () { };
            _super.prototype.setCollision.call(_this, 0, 32, 64, 64);
            console.log("New text prompt: ", input);
            try {
                _this.textPrompts = JSON.parse(input);
            }
            catch (err) {
                console.log("promt could not parse: ", input);
            }
            //console.log(this.textPrompts);
            _this.currentPrompt = _this.textPrompts[0];
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI.Graphics();
                newGraphics.beginFill(0x003eff);
                newGraphics.drawRect(0, 32, 64, 64);
                newGraphics.endFill();
                g.addChild(newGraphics);
                return g;
            });
            return _this;
        }
        textPromptBox.prototype.afterInit = function (l) {
            var _this = this;
            this.okButtonGlow = new filterGlow.GlowFilter({ distance: 15, outerStrength: 0, color: 0xfffec1 });
            this.promptWidth = l.getWindowWidth() * 0.75;
            this.promptHeight = l.getWindowHeight() * 0.25;
            this.g.removeChildren();
            var newGraphics = new PIXI.Graphics();
            newGraphics.beginFill(0x000000, 0.4);
            newGraphics.drawRect(-this.boxPadding, -this.boxPadding, this.promptWidth + this.boxPadding * 2, this.promptHeight + this.boxPadding * 2);
            newGraphics.endFill();
            this.g.addChild(newGraphics);
            this.FontStyle = new PIXI.TextStyle({
                breakWords: false,
                /*dropShadowAlpha: 0.5,
                dropShadowAngle: 0.6,*/
                //dropShadowColor: "#46382b",
                fill: "white",
                fontFamily: "Inconsolata_ExtraCondensed-Light",
                fontSize: this.fontSize,
                lineHeight: 24,
                //lineJoin: "bevel",
                wordWrap: true,
                letterSpacing: 3,
                wordWrapWidth: this.promptWidth
            });
            this.currentPromptLines = PIXI.TextMetrics.measureText(this.currentPrompt, this.FontStyle).lines;
            this.currentPrompt = "";
            this.currentPromptLines.forEach(function (line) {
                //console.log("line: ",line);
                _this.currentPrompt += line.replace(/ /g, '_') + "\n";
            });
            for (var i = 0; i < this.blurrCharacters; i++) {
                var newText = new PIXI.Text("", this.FontStyle);
                var newFilter = new PIXI.filters.BlurFilter(6, 3 + 2 * ((this.blurrCharacters - i) / this.blurrCharacters));
                newText.filters = [newFilter];
                this.blurredCharactersArray.push(newText);
                this.blurredCharactersFilterArray.push(newFilter);
                this.g.addChild(newText);
            }
            this.textContainer = new PIXI.Text("", this.FontStyle);
            this.g.addChild(this.textContainer);
            this.okButton = new PIXI.Text("", this.FontStyle);
            var widthOfOk = PIXI.TextMetrics.measureText("O.K.", this.FontStyle).lineWidths[0];
            this.okButton.x = (this.promptWidth / 2) - (widthOfOk / 2);
            this.okButton.y = this.promptHeight - 40;
            this.okButton.filters = [this.okButtonGlow];
            this.g.addChild(this.okButton);
        };
        textPromptBox.prototype.setPromptCallback = function (callback) {
            this.promptDoneCallback = callback;
        };
        textPromptBox.prototype.logic = function (l) {
            var _this = this;
            this.g.x = l.getCameraX() - (this.promptWidth / 2);
            this.g.y = l.getCameraY() + (l.getWindowHeight() / 2) - (this.promptHeight) - 48;
            this.okButtonGlowStrength = Math.cos(ticker.getTicks() * 0.074) * 1.4;
            this.okButtonGlow.outerStrength = this.okButtonGlowStrength;
            if (this.promptDone) {
                this.g.alpha = this.promptAlpha;
                this.promptAlpha *= 0.928;
                if (this.promptAlpha < 0.004) {
                    console.log("Callback: ", this.promptDoneCallback);
                    //l.goToRoom(scene_home);
                    this.promptDoneCallback(l);
                    l.deleteObject(this);
                }
                return;
            }
            if (this.enterKeyHeld) {
                if (this.displayedLengthOfPrompt < this.currentPrompt.length - 9 + this.blurrCharacters) {
                    this.displayedLengthOfPrompt += 10;
                }
            }
            if (l.checkKeyPressed("Enter")) {
                this.enterKeyHeld = true;
                if (this.displayedLengthOfPrompt >= this.currentPrompt.length + this.blurrCharacters) {
                    this.textContainer.text = "";
                    if (this.currentPromptIndex < this.textPrompts.length - 1) {
                        this.currentPromptIndex++;
                        this.currentPrompt = this.textPrompts[this.currentPromptIndex];
                        this.currentPromptLines = PIXI.TextMetrics.measureText(this.currentPrompt, this.FontStyle).lines;
                        this.currentPrompt = "";
                        this.currentPromptLines.forEach(function (line) {
                            //console.log("line: ",line);
                            _this.currentPrompt += line.replace(/ /g, '_') + "\n";
                        });
                        this.displayedLengthOfPrompt = 0;
                        this.okButton.text = "";
                        this.enterKeyHeld = false;
                    }
                    else {
                        this.promptDone = true;
                    }
                }
            }
            if (l.checkKeyReleased("Enter")) {
                this.enterKeyHeld = false;
            }
            var maxBlur = 20;
            var bluePerIndex = maxBlur / this.blurrCharacters;
            if (this.characterSpeedCount > 0) {
                this.characterSpeedCount--;
                for (var i = 0; i < this.blurrCharacters; i++) {
                    this.blurredCharactersFilterArray[i].blur = (maxBlur - bluePerIndex - (i * bluePerIndex))
                        + (this.characterSpeedCount / this.characterSpeed) * bluePerIndex;
                }
            }
            else {
                this.characterSpeedCount = this.characterSpeed;
                var extraSpace = 0;
                if (this.displayedLengthOfPrompt - this.blurrCharacters + 1 > 0) {
                    this.textContainer.text = this.currentPrompt.substr(0, this.displayedLengthOfPrompt - this.blurrCharacters + 1).replace(/_/g, ' ');
                }
                for (var i = 0; i < this.blurrCharacters; i++) {
                    if (this.displayedLengthOfPrompt - i < this.currentPrompt.length) {
                        var targetChar = this.currentPrompt[this.displayedLengthOfPrompt - i];
                        if (targetChar == undefined) {
                            this.blurredCharactersArray[i].text = "";
                        }
                        else {
                            if (targetChar == "_") {
                                this.blurredCharactersArray[i].text = " ";
                            }
                            else {
                                this.blurredCharactersArray[i].text = targetChar;
                            }
                        }
                        var lines = PIXI.TextMetrics.measureText(this.currentPrompt.substr(0, this.displayedLengthOfPrompt - i), this.FontStyle).lines;
                        var textMetricsNoSpaces = PIXI.TextMetrics.measureText(this.currentPrompt.replace(/ /g, '_').substr(0, this.displayedLengthOfPrompt - i), this.FontStyle);
                        var textMetricsWithSpaces = PIXI.TextMetrics.measureText(this.currentPrompt.substr(0, this.displayedLengthOfPrompt - i), this.FontStyle);
                        textMetricsNoSpaces.lineWidths[textMetricsNoSpaces.lineWidths.length - 1] + extraSpace + 4;
                        textMetricsWithSpaces.lineWidths[textMetricsWithSpaces.lineWidths.length - 1] + extraSpace + 4;
                        var latestLine = lines[lines.length - 1];
                        //Check if last char should be a space
                        if (this.currentPrompt[lines[lines.length - 1].length] == " ") {
                            latestLine += " ";
                        }
                        var lineWidths = PIXI.TextMetrics.measureText(latestLine.replace(/ /g, '_'), this.FontStyle).lineWidths;
                        var xPosition = lineWidths[lineWidths.length - 1];
                        this.blurredCharactersArray[i].x = xPosition + 4; // - (textMetricsWithSpaces.lines.length-1)*lastLineWithSpaces;
                        this.blurredCharactersArray[i].y = textMetricsWithSpaces.lineHeight * (textMetricsWithSpaces.lineWidths.length - 1);
                        this.blurredCharactersFilterArray[i].blur = (maxBlur - bluePerIndex - (i * bluePerIndex))
                            + (this.characterSpeedCount / this.characterSpeed) * bluePerIndex;
                        //l.getRenderer().render(this.g);
                    }
                    else {
                        this.blurredCharactersArray[i].text = "";
                    }
                }
                if (this.displayedLengthOfPrompt < this.currentPrompt.length + this.blurrCharacters) {
                    this.displayedLengthOfPrompt++;
                }
                else {
                    this.okButton.text = "O.K.";
                }
            }
        };
        textPromptBox.objectName = "textPromptBox";
        return textPromptBox;
    }(objectBase));

    var handleRoomStartString = /** @class */ (function (_super) {
        __extends(handleRoomStartString, _super);
        function handleRoomStartString(xp, yp, input) {
            var _this = _super.call(this, xp, yp, handleRoomStartString.objectName) || this;
            _this.switch = false;
            return _this;
        }
        handleRoomStartString.prototype.afterInit = function (l) {
            var args = l.getRoomStartString();
            args.forEach(function (arg) {
                if (arg == "dream_with_dad_1") {
                    var p = new player(1187, 560, "");
                    l.addObjectLayerName(p, "Layer 1");
                    l.flags().add("freezeObjects");
                    var prompt_1 = new textPromptBox(0, 0, JSON.stringify([
                        "Hej och välkommen till denna demo! Jag kommer att gå igenom kontrollerna. Tryck enter för att gå vidare.",
                        "Använd [WASD] för att gå med din karaktär, [W] för att hoppa. Håll in [CONTROL] för att springa.",
                        "Håll ner [S] och tryck [J] för att gå ner till lägre mark. tryck [W] om du befinner dig på en grön rektangel för att gå upp högre mark.",
                        "Använd [K] för att attackera. Du Kan kombinera [K] med olika rörelser för att få olika attacker.\nProva attackera den rosa lådan."
                    ]));
                    prompt_1.setPromptCallback(function (l) {
                        l.flags().remove("freezeObjects");
                        l.flags().add("day");
                        l.goToRoom(scene_home, []);
                    });
                    l.addObjectLayerName(prompt_1, "GUILayer");
                }
            });
        };
        handleRoomStartString.objectName = "handleRoomStartString";
        return handleRoomStartString;
    }(objectBase));

    var fallingLeavesParticles = /** @class */ (function (_super) {
        __extends(fallingLeavesParticles, _super);
        function fallingLeavesParticles(xp, yp, input) {
            var _this = _super.call(this, xp, yp, fallingLeavesParticles.objectName) || this;
            _this.elapsed = Date.now();
            _super.prototype.setCollision.call(_this, 0, 0, 256, 256);
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI.Graphics();
                newGraphics.beginFill(0x223eFF, 0.1);
                newGraphics.drawRect(0, 0, 256, 256);
                newGraphics.endFill();
                g.addChild(newGraphics);
                g.calculateBounds();
                return g;
            });
            //PIXI.particle
            _this.emitter = new particles.Emitter(
            // The PIXI.Container to put the emitter in
            // if using blend modes, it's important to put this
            // on top of a bitmap, and not use the root stage Container
            _this.g, 
            // The collection of particle images to use
            [resourcesHand.getStaticTile("fallingLeaf.png").texture], 
            // Emitter configuration, edit this to change the look
            // of the emitter
            {
                "alpha": {
                    "start": 1,
                    "end": 0
                },
                "scale": {
                    "start": 0.45,
                    "end": 0.6,
                    "minimumScaleMultiplier": 0.5
                },
                "color": {
                    "start": "#ffffff",
                    "end": "#ffffff"
                },
                "speed": {
                    "start": 50,
                    "end": 100,
                    "minimumSpeedMultiplier": 1.03
                },
                "acceleration": {
                    "x": 2,
                    "y": 0
                },
                "maxSpeed": 0,
                "startRotation": {
                    "min": 50,
                    "max": 70
                },
                "noRotation": false,
                "rotationSpeed": {
                    "min": 0,
                    "max": 140
                },
                "lifetime": {
                    "min": 4,
                    "max": 6
                },
                "blendMode": "normal",
                "ease": [
                    {
                        "s": 0,
                        "cp": 0.379,
                        "e": 0.548
                    },
                    {
                        "s": 0.548,
                        "cp": 0.717,
                        "e": 0.676
                    },
                    {
                        "s": 0.676,
                        "cp": 0.635,
                        "e": 1
                    }
                ],
                "frequency": 0.5,
                "emitterLifetime": -1,
                "maxParticles": 32,
                "pos": {
                    "x": 0,
                    "y": 0
                },
                "addAtBack": false,
                "spawnType": "rect",
                "spawnRect": {
                    "x": 0,
                    "y": 0,
                    "w": 801,
                    "h": 20
                }
            });
            _this.emitter.emit = true;
            return _this;
        }
        fallingLeavesParticles.prototype.logic = function (l) {
            var now = Date.now();
            // The emitter requires the elapsed
            // number of seconds since the last update
            this.emitter.update((now - this.elapsed) * 0.001);
            this.elapsed = now;
        };
        fallingLeavesParticles.objectName = "fallingLeavesParticles";
        return fallingLeavesParticles;
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
        };
        textPrompt.objectName = "textPrompt";
        return textPrompt;
    }(objectBase));

    var gameStartRoom = "N4IgxghgtgpgThAQgewK4DsAmBnAGiALnVQBsSAacaeJNLbATUOLMslgRQxwHUBLTABcAFs1IUqHWt2wAJGHwDmwwWNYgARhDABrRXDqYAwshLI4hEAGIADHfshKJCAE94AEQiCIhANqhYbwB5DQArGDBBbABJdAAZV3g-UEE+Ehg1CT5sEygNPnQvPmR0IIAzABU0mGxCMogSbBhKAXKAZW9UsCr03PzC1JLLRxBsgAUIOEFyvoKioYJ6xuaQQRcABwyCGxb0ddRBDrgCxWHKRRhkKDHkAqi-AF1KKGzsE+ioCAvCYABfSgAHoQAIwATgATJQXCCIZRCrBLIpqB1JoITOhBAYyElfk8QBcrjBMXwarEEm4LARfHjhAJMDB0HUGk1KE1BKl0IpagQQMAADogbBgLEkNqbGCYXACggAAmB5BlAqFIrFMAlDGlct+I2cFIActRLOT4HKRgAvWL0oHbXG-IA";

    var roomIndex = {
        "gameStartRoom": gameStartRoom, "r1_scene_lake1": r1_scene_lake1, "scene_home": scene_home,
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
                l.loadRoom(roomIndex[inputJson.to], ["target_room", this.targetRoom]);
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
        skyBackground.prototype.afterInit = function (roomEvents) {
            if (roomEvents.flags().has("dawn")) {
                this.timeOfDay = 0;
            }
            else if (roomEvents.flags().has("sunrise")) {
                this.timeOfDay = 1;
            }
            else if (roomEvents.flags().has("morning")) {
                this.timeOfDay = 2;
            }
            else if (roomEvents.flags().has("afternoon")) {
                this.timeOfDay = 3;
            }
            else if (roomEvents.flags().has("sunset")) {
                this.timeOfDay = 4;
            }
            else if (roomEvents.flags().has("dusk")) {
                this.timeOfDay = 5;
            }
            else if (roomEvents.flags().has("night")) {
                this.timeOfDay = 6;
            }
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
                roomEvents.setLayerFilterExclude("GUILayer", [new filterAdjustment.AdjustmentFilter({
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
                roomEvents.setLayerFilterExclude("GUILayer", [new filterAdjustment.AdjustmentFilter({
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
                roomEvents.setLayerFilterExclude("GUILayer", [new filterAdjustment.AdjustmentFilter({
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
                roomEvents.setLayerFilterExclude("GUILayer", [new filterAdjustment.AdjustmentFilter({
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
                roomEvents.setLayerFilterExclude("GUILayer", [new filterAdjustment.AdjustmentFilter({
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
                roomEvents.setLayerFilterExclude("GUILayer", [new filterAdjustment.AdjustmentFilter({
                        red: 0.5688,
                        green: 0.415,
                        blue: 0.4244,
                        contrast: 1.0,
                        brightness: 1.0,
                    })]);
            }
            else if (this.timeOfDay == 6) { //night
                roomEvents.setLayerFilterExclude("GUILayer", [new filterAdjustment.AdjustmentFilter({
                        red: 0.1,
                        green: 0.1,
                        blue: 1.00,
                        contrast: 1.1,
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
            _this.myShaderFrag = "\n    varying vec2 vTextureCoord;\n    uniform sampler2D uSampler;\n    uniform float treeSeed;\n\n    uniform float aspectRatio;\n    uniform int treeDistanceAwayFrom;\n    uniform int renderLeaves;\n    uniform float trunkLean;\n    uniform float treeTop;\n    uniform float leavesGroupSize;\n\n    uniform vec4 filterArea;\n    uniform vec2 dimensions;\n\n    uniform vec3 closeTreeGroups[3];\n\n    float distSquared(vec2 A, vec2 B){\n        vec2 C = (A - B); //* vec2(aspectRatio, 1.0);\n        return dot( C, C );\n    }\n\n    float rand(vec2 co){\n        return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);\n    }\n\n    float det(vec2 a, vec2 b) { return a.x*b.y-b.x*a.y; }\n\n    vec2 closestPointInSegment( vec2 a, vec2 b )\n    {\n        vec2 ba = b - a;\n        return a + ba*clamp( -dot(a,ba)/dot(ba,ba), 0.0, 1.0 );\n    }\n\n    float getBezierT(vec2 b0, vec2 b1, vec2 b2) {\n            \n        float a=det(b0,b2), b=2.0*det(b1,b0), d=2.0*det(b2,b1); // \uD835\uDEFC,\uD835\uDEFD,\uD835\uDEFF(\uD835\uDC5D)\n        \n        //if( abs(2.0*a+b+d) < 1000.0 ) return closestPointInSegment(b0,b2);\n            \n        float f=b*d-a*a; // \uD835\uDC53(\uD835\uDC5D)\n        vec2 d21=b2-b1, d10=b1-b0, d20=b2-b0;\n        vec2 gf=2.0*(b*d21+d*d10+a*d20);\n        gf=vec2(gf.y,-gf.x); // \u2207\uD835\uDC53(\uD835\uDC5D)\n        vec2 pp=-f*gf/dot(gf,gf); // \uD835\uDC5D\u2032\n        vec2 d0p=b0-pp; // \uD835\uDC5D\u2032 to origin\n        float ap=det(d0p,d20), bp=2.0*det(d10,d0p); // \uD835\uDEFC,\uD835\uDEFD(\uD835\uDC5D\u2032)\n        // (note that 2*ap+bp+dp=2*a+b+d=4*area(b0,b1,b2))\n        float t=clamp((ap+bp)/(2.0*a+b+d), 0.0 ,1.0);\n\n        return t;\n    }\n\n\n    vec4 treeTrunk(float trunkCenter, float angle, vec2 normalizedCoord){\n        vec4 trunkColor = vec4(0.0, 0.0, 0.0, 1.0);\n        float grassBladeRandomVal = rand(vec2(treeSeed, treeSeed));\n        if(treeDistanceAwayFrom == 0/*grassBladeRandomVal < 0.25*/){\n            trunkColor = vec4(0.00039215686, 0.06039215686, 0.06392156862, 1.0);\n        }else if(treeDistanceAwayFrom == 1/*grassBladeRandomVal < 0.5*/){\n            trunkColor = vec4(0.06117647058, 0.22705882352, 0.19490196078, 1.0);\n        }else if(treeDistanceAwayFrom == 2/*grassBladeRandomVal < 0.75*/){\n            trunkColor = vec4(0.27137254902, 0.39568627451, 0.35490196078, 1.0);\n        }else if(treeDistanceAwayFrom == 3 /*grassBladeRandomVal <= 1.0*/){\n            trunkColor = vec4(0.66117647058, 0.73176470588, 0.66980392156, 1.0);\n        }\n\n        //Specks\n        float randomSpecks = rand(vec2(normalizedCoord.x+treeSeed, normalizedCoord.y+treeSeed)*vec2(0.1, 0.1));\n        if(randomSpecks < 0.1*normalizedCoord.y){\n            trunkColor = vec4(0.0, 0.10823529411, 0.08980392156, 1.0);\n        }\n        \n        float trunkThickness = clamp(rand(vec2(treeSeed, treeSeed)), 0.016, 0.025) / aspectRatio;\n        \n\n        float leftTrunkFootWidth = clamp(rand(vec2(treeSeed+0.2, treeSeed+0.2)),0.1, 0.3);\n        float leftTrunkFootHeight = clamp(rand(vec2(treeSeed+0.25, treeSeed+0.25)),0.1, 0.2);\n\n        float rightTrunkFootWidth = clamp(rand(vec2(treeSeed+0.69, treeSeed+0.69)),0.1, 0.3);\n        float rightTrunkFootHeight = clamp(rand(vec2(treeSeed+0.5, treeSeed-0.5)),0.1, 0.2);\n\n        float height = rand(vec2(treeSeed+0.3, treeSeed+0.3));\n\n        trunkThickness = trunkThickness * (normalizedCoord.y*0.5);\n\n        float leanFix = trunkLean * (1.0 - normalizedCoord.y);\n\n\n        \n        float extraPartOnRight = 0.0;\n        float randExtra = rand(normalizedCoord*vec2(1.0, 0.2));\n        if(randExtra < 0.5){\n            extraPartOnRight = 0.003;\n        }\n\n        float extraPartOnLeft = 0.0;\n        float randExtra2 = rand(vec2(normalizedCoord.x+5.0, normalizedCoord.y)*vec2(1.0, 0.2));\n        if(randExtra2 < 0.5){\n            extraPartOnLeft = 0.003;\n        }\n\n        if(normalizedCoord.x > trunkCenter - trunkThickness + leanFix - extraPartOnLeft && normalizedCoord.x < trunkCenter + trunkThickness + leanFix + extraPartOnRight\n            && normalizedCoord.y > treeTop){\n            return trunkColor;\n        }\n\n        float removeFooterEnd = 0.18;\n\n        //Left side trunk foot\n        /*float leftFootXStart = trunkCenter - trunkThickness - leftTrunkFootWidth;\n        float xInLeftFootPercentage = 0.0;\n        if(normalizedCoord.x > leftFootXStart+removeFooterEnd && normalizedCoord.x < leftFootXStart+leftTrunkFootWidth){\n            xInLeftFootPercentage = (normalizedCoord.x - leftFootXStart)/leftTrunkFootWidth;\n            xInLeftFootPercentage = pow(xInLeftFootPercentage, 6.0);\n            if(normalizedCoord.y > 1.0-(xInLeftFootPercentage*leftTrunkFootHeight)){\n                return trunkColor;\n            }\n        }\n\n        //right side trunk foot\n        float rightFootXStart = trunkCenter + trunkThickness;\n        if(normalizedCoord.x > rightFootXStart && normalizedCoord.x < rightFootXStart+rightTrunkFootWidth-removeFooterEnd){\n            float xInFootPercentage = 1.0-(normalizedCoord.x - rightFootXStart)/rightTrunkFootWidth;\n            xInFootPercentage = pow(xInFootPercentage, 6.0);\n            if(normalizedCoord.y > 1.0-(xInFootPercentage*rightTrunkFootHeight)){\n                return trunkColor;\n            }\n        }\n\n        //Fill space between feet right\n        if(normalizedCoord.x >= trunkCenter\n            && normalizedCoord.x <= rightFootXStart\n            && normalizedCoord.y > (1.0-rightTrunkFootHeight)){\n                return trunkColor;\n        }\n        //Fill space between feet left\n        if(normalizedCoord.x <= trunkCenter\n            && normalizedCoord.x >= leftFootXStart+leftTrunkFootWidth\n            && normalizedCoord.y > (1.0-leftTrunkFootHeight)){\n                return trunkColor;\n        }*/\n\n\n\n        //branches\n        float numberOfBranches = 3.0;\n        /*float bezierT = getBezierT(grassBladePoint-textureCoordAspect.xy, \n            grassForcePoint-textureCoordAspect.xy, \n            grassBladeEndPoint-textureCoordAspect.xy);*/\n\n\n        return vec4(0.0, 0.0, 0.0, 0.0);\n    }\n\n    vec4 leaf(vec2 position, vec2 normalizedCoord){\n\n        if(distSquared(normalizedCoord.xy, position) < 0.001){\n            float grassBladeRandomVal = rand(position);\n            if(grassBladeRandomVal < 0.2){\n                return vec4(0.12, 0.42, 0.01568627, 1.0);\n            }else if(grassBladeRandomVal < 0.4){\n                return vec4(0.4196, 0.6078, 0.1176, 1.0);\n            }else if(grassBladeRandomVal < 0.6){\n                return vec4(0.5529, 0.749, 0.2235, 1.0);\n            }else if(grassBladeRandomVal < 0.8){\n                return vec4(0.448, 0.5509, 0.2019, 1.0);\n            }else if(grassBladeRandomVal <= 1.0){\n                return vec4(0.425, 0.6509, 0.1019, 1.0);\n            }\n        }\n\n        return vec4(0.0, 0.0, 0.0, 0.0);\n    }\n\n\n    vec4 generateLeavesGroup(vec2 leavGroupOrigin, float groupSize, vec2 normalizedCoord){\n        float shadowRand = rand(vec2(treeSeed, 0));\n        float angleOfShadow = 0.785398163/*45 degrees*/ + shadowRand * 1.48352;\n        \n\n        float extraPoint = 0.0;\n        float randExtra = rand(vec2(normalizedCoord.x+5.0, normalizedCoord.y));\n        if(randExtra < 0.5){\n            extraPoint = 0.00168;\n        }\n\n        float distanceToorigin = distSquared(normalizedCoord, leavGroupOrigin);\n        if(distanceToorigin < groupSize*groupSize+extraPoint){\n            float randNumb = rand(normalizedCoord);\n\n\n            float darkSpotStartX = leavGroupOrigin.x + cos(angleOfShadow) * (groupSize*groupSize)*1.0;\n            float darkSpotStartY = leavGroupOrigin.y + sin(angleOfShadow) * (groupSize*groupSize)*1.0;\n\n            vec2 darkSpot = vec2(darkSpotStartX, darkSpotStartY);\n            float percentageToDarkSpotCenter = distSquared(normalizedCoord, darkSpot)/(groupSize*groupSize*2.0);\n            if(randNumb < 0.35*percentageToDarkSpotCenter){\n                return vec4(0.00039215686, 0.06039215686, 0.06392, 1.0);\n            }\n            \n            float percentageToCenter = distanceToorigin/(groupSize*groupSize);\n            if(randNumb < 0.07*percentageToCenter){\n                return vec4(0.996078, 0.996078, 0.965882, 1.0);\n            }else if(randNumb < 0.2*percentageToCenter){\n                return vec4(0.39, 0.49725, 0.452549, 1.0);\n            }else if(randNumb < 0.3*percentageToCenter){\n                return vec4(0.06117, 0.227, 0.19, 1.0);\n            }\n\n            if(distanceToorigin > groupSize*groupSize && distanceToorigin < groupSize*groupSize+extraPoint){\n                float randHalo = rand(normalizedCoord);\n                float distanceToCloseLeavesGroup = distSquared(normalizedCoord, closeTreeGroups[0].xy);\n                float distanceToCloseLeavesGroup2 = distSquared(normalizedCoord, closeTreeGroups[1].xy);\n                float distanceToCloseLeavesGroup3 = distSquared(normalizedCoord, closeTreeGroups[2].xy);\n                \n                if(randHalo < 0.5 && (\n                    distanceToCloseLeavesGroup < closeTreeGroups[0].z*closeTreeGroups[0].z ||\n                    distanceToCloseLeavesGroup2 < closeTreeGroups[1].z*closeTreeGroups[1].z ||\n                    distanceToCloseLeavesGroup3 < closeTreeGroups[2].z*closeTreeGroups[2].z\n                )){\n                    return vec4(0.8, 0.8, 0.8, 1.0);\n                }\n            }\n\n            return vec4(0.00039215686, 0.06039215686, 0.06392, 1.0);\n        }\n        \n        \n\n        return vec4(0.0, 0.0, 0.0, 0.0);\n    }\n\n\n    \n\n\n    void main(void)\n    {\n        vec2 normalizedCoord = vTextureCoord;\n        \n        //float trunkLean = (clamp(rand(vec2(treeSeed+2.1, treeSeed+1.53)), 0.0, 1.0) - 0.5)*0.25;\n        float trunkCenter = 0.5;\n        //float treeTop = clamp(rand(vec2(treeSeed+1.1, treeSeed)), 0.10, 0.22);\n\n        \n        //float leavesGroupSize = 0.2;\n        float leavesGroupY = treeTop + leavesGroupSize;\n        float leavesGroupX = trunkLean * (1.0 - leavesGroupY);\n\n        float angleToTop = 0.0;\n        vec2 deltaAngleToTop = ( vec2(trunkCenter, 1.0) - vec2(leavesGroupX, leavesGroupY));  \n        float angle = atan(deltaAngleToTop.y, deltaAngleToTop.x);\n\n        if(renderLeaves == 0){\n            vec4 trunk = treeTrunk(trunkCenter, angle, normalizedCoord);\n\n\n            if(trunk != vec4(0.0, 0.0, 0.0, 0.0)){\n                gl_FragColor = trunk;\n            }\n        }\n        \n\n        if(renderLeaves != 0){\n            vec4 topLeaves = generateLeavesGroup(vec2(trunkCenter + leavesGroupX, leavesGroupY), leavesGroupSize, normalizedCoord);\n            if(topLeaves != vec4(0.0, 0.0, 0.0, 0.0)){\n                gl_FragColor = topLeaves;\n            }else{\n                //gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);\n            }\n        }\n\n        /*if(distSquared(vec2(0.5, 0.5), normalizedCoord) < 0.00005){\n            gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);\n        }\n\n        if(distSquared(vec2(0.0, 0.0), normalizedCoord) < 0.0005){\n            gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);\n        }\n\n        if(distSquared(vec2(1.0, 0.0), normalizedCoord) < 0.0005){\n            gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);\n        }\n\n        if(distSquared(vec2(1.0, 1.0), normalizedCoord) < 0.0005){\n            gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);\n        }*/\n\n        \n\n\n    }\n    ";
            _this.treeUniforms = {
                aspectRatio: 1.0,
                treeSeed: 0.0,
                treeDistanceAwayFrom: -1,
                renderLeaves: 0,
                trunkLean: 0,
                treeTop: 0,
                leavesGroupSize: 0.0,
                closeTreeGroups: [
                    0.0, 0.0, 0.4,
                    -2, -2, 0.2,
                    -2, -2, 0.2
                ]
            };
            _this.leavesGroupY = 0;
            _this.leavesGroupX = 0;
            _this.elapsed = Date.now();
            _this.treeSquareSize = 0;
            _this.hasFallingLeaves = false;
            _this.now = 0;
            _super.prototype.setCollision.call(_this, 0, 0, 24, 24);
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI.Graphics();
                /*newGraphics.beginFill(0x00FF00);
                newGraphics.drawRect(-12, 0, 24,24);
                newGraphics.endFill();*/
                g.addChild(newGraphics);
                return g;
            });
            _this.treeTrunkFilterGraphics = new PIXI.Graphics();
            _this.treeLeavesFilterGraphics = new PIXI.Graphics();
            _this.fallingLeavesCon = new PIXI.Graphics();
            _this.leavesEmitter = new particles.Emitter(
            // The PIXI.Container to put the emitter in
            // if using blend modes, it's important to put this
            // on top of a bitmap, and not use the root stage Container
            _this.fallingLeavesCon, 
            // The collection of particle images to use
            [resourcesHand.getStaticTile("fallingLeaf.png").texture], 
            // Emitter configuration, edit this to change the look
            // of the emitter
            {
                "alpha": {
                    "start": 1,
                    "end": 0
                },
                "scale": {
                    "start": 0.45,
                    "end": 0.6,
                    "minimumScaleMultiplier": 0.5
                },
                "color": {
                    "start": "#ffffff",
                    "end": "#ffffff"
                },
                "speed": {
                    "start": 50,
                    "end": 100,
                    "minimumSpeedMultiplier": 1.03
                },
                "acceleration": {
                    "x": 0,
                    "y": 0
                },
                "maxSpeed": 0,
                "startRotation": {
                    "min": 50,
                    "max": 70
                },
                "noRotation": false,
                "rotationSpeed": {
                    "min": 0,
                    "max": 140
                },
                "lifetime": {
                    "min": 5,
                    "max": 14
                },
                "blendMode": "normal",
                "ease": [
                    {
                        "s": 0,
                        "cp": 0.379,
                        "e": 0.548
                    },
                    {
                        "s": 0.548,
                        "cp": 0.717,
                        "e": 0.676
                    },
                    {
                        "s": 0.676,
                        "cp": 0.635,
                        "e": 1
                    }
                ],
                "frequency": 3,
                "emitterLifetime": -1,
                "maxParticles": 2,
                "pos": {
                    "x": 0,
                    "y": 0
                },
                "addAtBack": false,
                "spawnType": "rect",
                "spawnRect": {
                    "x": 0,
                    "y": 0,
                    "w": 100,
                    "h": 5
                }
            });
            return _this;
        }
        treeGen.prototype.clamp = function (val, min, max) {
            return Math.max(min, Math.min(max, val));
        };
        treeGen.sfc32 = function (a, b, c, d) {
            return function () {
                a >>>= 0;
                b >>>= 0;
                c >>>= 0;
                d >>>= 0;
                var t = (a + b) | 0;
                a = b ^ b >>> 9;
                b = c + (c << 3) | 0;
                c = (c << 21 | c >>> 11);
                d = d + 1 | 0;
                t = t + d | 0;
                c = c + t | 0;
                return (t >>> 0) / 4294967296;
            };
        };
        treeGen.prototype.init = function (roomEvents) {
            if (Math.random() < 0.4) {
                this.hasFallingLeaves = true;
            }
            //this.g.removeChildren();
            treeGen.randomTreeGenerator(); //next
            treeGen.randomTreeGenerator(); //next
            if (treeGen.randomTreeGenerator() < 0.5) {
                treeGen.randomTreeGenerator();
                treeGen.randomTreeGenerator();
                treeGen.randomTreeGenerator();
                treeGen.randomTreeGenerator();
            }
            var randNumb = treeGen.randomTreeGenerator();
            //console.log("randNumb: ",randNumb);
            this.clamp(randNumb, 0.72, 1.0);
            this.treeSquareSize = 1024; //800*treeHeight;
            //this.g.x = this.g.x - (this.treeSquareWidth/2)-24;
            this.treeTrunkFilterGraphics.beginFill(0x000000);
            this.treeTrunkFilterGraphics.drawRect(0, -this.treeSquareSize, this.treeSquareSize, this.treeSquareSize);
            this.treeTrunkFilterGraphics.endFill();
            this.treeLeavesFilterGraphics.beginFill(0x000000);
            this.treeLeavesFilterGraphics.drawRect(0, -this.treeSquareSize, this.treeSquareSize, this.treeSquareSize);
            this.treeLeavesFilterGraphics.endFill();
            this.treeTrunkFilterGraphics.x = -this.treeSquareSize / 2;
            this.g.addChild(this.treeTrunkFilterGraphics);
            this.g.calculateBounds();
            this.treeUniforms.trunkLean = (this.clamp(treeGen.randomTreeGenerator(), 0.0, 1.0) - 0.5) * 0.25;
            this.treeUniforms.treeTop = this.clamp(treeGen.randomTreeGenerator(), 0.20, 0.44);
            this.treeUniforms.leavesGroupSize = this.clamp(treeGen.randomTreeGenerator(), 0.09, 0.12);
            this.treeUniforms.aspectRatio = 1.0; //this.treeTrunkFilterGraphics.width/this.treeTrunkFilterGraphics.height;
            this.treeUniforms.treeSeed = treeGen.randomTreeGenerator(); //this.g.x;
            var myFilter = new PIXI.Filter(undefined, this.myShaderFrag, this.treeUniforms);
            myFilter.autoFit = false;
            this.treeTrunkFilterGraphics.filters = [myFilter];
            this.treeTrunkFilterGraphics.cacheAsBitmap = true;
            //float leavesGroupX = trunkLean * (1.0 - leavesGroupY);
            this.leavesGroupX = this.g.x + this.treeUniforms.trunkLean * (this.treeSquareSize / 2);
            this.leavesGroupY = this.g.y - this.treeSquareSize + this.treeSquareSize * this.treeUniforms.treeTop + this.treeSquareSize * this.treeUniforms.leavesGroupSize;
            //console.log("this.leavesGroupX: ",this.leavesGroupX, "   this.leavesGroupY: ",this.leavesGroupY);
        };
        treeGen.prototype.afterInit = function (roomEvents) {
            var _this = this;
            //DETERMINE COLOR
            var closeTrees = roomEvents.keepObjectsWithinArea(roomEvents.getSpecificObjects(treeGen.objectName), this.g.x, this.g.y, this.treeSquareSize / 4);
            closeTrees.sort(function (a, b) {
                return a.layerIndex - b.layerIndex;
            });
            //ordered as index 0 is first tree in array
            //check if close tree leaves group are inside this tree square
            var pointsOfCloseTreeGroups = [];
            //console.log("My id: ",this.ID);
            //console.log("closeTrees: ",closeTrees);
            closeTrees.forEach(function (tree) {
                /*console.log("if ",tree.leavesGroupX ,">", this.g.x - (this.treeSquareSize/2),
                "&&", tree.leavesGroupX, "<", this.g.x - (this.treeSquareSize/2) + this.treeSquareSize,
                "&&", tree.leavesGroupY, ">", this.g.y - this.treeSquareSize,
                "&&", tree.leavesGroupY ,"<", this.g.y);*/
                if (tree.leavesGroupX > _this.g.x - (_this.treeSquareSize / 2)
                    && tree.leavesGroupX < _this.g.x - (_this.treeSquareSize / 2) + _this.treeSquareSize
                    && tree.leavesGroupY > _this.g.y - _this.treeSquareSize
                    && tree.leavesGroupY < _this.g.y
                    && tree.ID != _this.ID
                /*&& tree.layerIndex < this.layerIndex*/ ) {
                    pointsOfCloseTreeGroups.push(tree);
                }
            });
            //console.log("pointsOfCloseTreeGroups: ",pointsOfCloseTreeGroups);
            if (pointsOfCloseTreeGroups.length > 0) {
                for (var i = 0; i < pointsOfCloseTreeGroups.length; i++) {
                    var targetTree = pointsOfCloseTreeGroups[i];
                    var percentageOfRectangleX = (targetTree.leavesGroupX - (this.g.x - (this.treeSquareSize / 2))) / this.treeSquareSize;
                    var percentageOfRectangleY = (targetTree.leavesGroupY - (this.g.y - this.treeSquareSize)) / this.treeSquareSize;
                    this.treeUniforms.closeTreeGroups[0 + (i * 3)] = percentageOfRectangleX;
                    this.treeUniforms.closeTreeGroups[1 + (i * 3)] = percentageOfRectangleY;
                    this.treeUniforms.closeTreeGroups[2 + (i * 3)] = targetTree.treeUniforms.leavesGroupSize;
                    //console.log("this.treeUniforms.closeTreeGroups: ",this.treeUniforms.closeTreeGroups);
                }
            }
            if (closeTrees.length >= 4) {
                var treeType1Left = Math.floor(closeTrees.length * 0.5);
                var treeType2Left = Math.floor(closeTrees.length * 0.2);
                var treeType3Left = Math.floor(closeTrees.length * 0.2);
                for (var i = 0; i < closeTrees.length; i++) {
                    var tree = closeTrees[i];
                    if (treeType1Left > 0) {
                        treeType1Left--;
                        tree.treeUniforms.treeDistanceAwayFrom = 0;
                    }
                    else if (treeType2Left > 0) {
                        treeType2Left--;
                        tree.treeUniforms.treeDistanceAwayFrom = 1;
                    }
                    else if (treeType3Left > 0) {
                        treeType3Left--;
                        tree.treeUniforms.treeDistanceAwayFrom = 2;
                    }
                    else {
                        tree.treeUniforms.treeDistanceAwayFrom = 3;
                    }
                }
            }
            else if (closeTrees.length == 3 || closeTrees.length == 2) {
                var darkestTreeColor = treeGen.randomTreeGenerator();
                if (darkestTreeColor < 0.5) {
                    closeTrees[0].treeUniforms.treeDistanceAwayFrom = 0;
                }
                else {
                    closeTrees[0].treeUniforms.treeDistanceAwayFrom = 1;
                }
                var secondDarkest = treeGen.randomTreeGenerator();
                if (secondDarkest < 0.5) {
                    closeTrees[1].treeUniforms.treeDistanceAwayFrom = 2;
                }
                else {
                    closeTrees[1].treeUniforms.treeDistanceAwayFrom = 3;
                }
                if (closeTrees.length == 3) {
                    closeTrees[2].treeUniforms.treeDistanceAwayFrom = 3;
                }
            }
            else if (closeTrees.length == 1) {
                var darkestTreeColor = treeGen.randomTreeGenerator();
                if (darkestTreeColor < 0.25) {
                    closeTrees[0].treeUniforms.treeDistanceAwayFrom = 3;
                }
                else if (darkestTreeColor < 0.5) {
                    closeTrees[0].treeUniforms.treeDistanceAwayFrom = 2;
                }
                else if (darkestTreeColor < 0.75) {
                    closeTrees[0].treeUniforms.treeDistanceAwayFrom = 1;
                }
                else if (darkestTreeColor <= 1.0) {
                    closeTrees[0].treeUniforms.treeDistanceAwayFrom = 0;
                }
            }
            roomEvents.getRenderer().render(this.treeTrunkFilterGraphics);
            this.treeTrunkFilterGraphics.filters = [];
            //Leaves group
            this.treeUniforms.renderLeaves = 1;
            var myFilter = new PIXI.Filter(undefined, this.myShaderFrag, this.treeUniforms);
            this.treeLeavesFilterGraphics.filters = [myFilter];
            this.treeLeavesFilterGraphics.cacheAsBitmap = true;
            roomEvents.getRenderer().render(this.treeLeavesFilterGraphics);
            this.treeLeavesFilterGraphics.filters = [];
            //falling leavs container
            this.fallingLeavesCon.x = this.leavesGroupX; //this.g.x + (this.g.width/2) + this.treeUniforms.trunkLean * this.treeSquareSize + 32;
            this.fallingLeavesCon.y = this.leavesGroupY; //this.g.y - this.treeSquareSize + (this.treeSquareSize*0.4);
            //roomEvents.addGraphicsDirectlyToLayer(this.fallingLeavesCon, "treeLeavesContainer");
            //this.g.addChild(this.fallingLeavesCon);
            this.treeLeavesFilterGraphics.x = this.g.x;
            this.treeLeavesFilterGraphics.y = this.g.y;
            if (this.hasFallingLeaves) {
                roomEvents.addGraphicsDirectlyToLayer(this.fallingLeavesCon, "treeLeavesContainer");
            }
            this.treeLeavesFilterGraphics.x -= this.treeSquareSize / 2;
            roomEvents.addGraphicsDirectlyToLayer(this.treeLeavesFilterGraphics, "treeLeavesContainer");
            /*let newGraphics = new PIXI.Graphics();
            newGraphics.beginFill(0x00FF00);
            newGraphics.drawRect(-2, -2, 4,4);
            newGraphics.endFill();
            newGraphics.x = this.leavesGroupX;
            newGraphics.y = this.leavesGroupY;
            roomEvents.addGraphicsDirectlyToLayer(newGraphics, "treeLeavesContainer");*/
        };
        treeGen.prototype.logic = function (l) {
            if (this.hasFallingLeaves) {
                this.now = Date.now();
                this.leavesEmitter.update((this.now - this.elapsed) * 0.001);
                this.elapsed = this.now;
            }
        };
        treeGen.objectName = "treeGen";
        treeGen.randomTreeGenerator = treeGen.sfc32(0x9E3779B9, 0x243F6A88, 0xB7E15162, 440);
        return treeGen;
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
                function (xp, yp, input) { return new block(xp, yp, input); },
                function (xp, yp, input) { return new block32x64(xp, yp, input); },
                function (xp, yp, input) { return new block64x32(xp, yp, input); },
                function (xp, yp, input) { return new tinyBlock32(xp, yp, input); },
                function (xp, yp, input) { return new wideBlock(xp, yp, input); },
                function (xp, yp, input) { return new gameStartController(xp, yp, input); },
                function (xp, yp, input) { return new handleRoomStartString(xp, yp, input); },
                function (xp, yp, input) { return new demonAi1(xp, yp, input); },
                function (xp, yp, input) { return new dummySandbag(xp, yp, input); },
                function (xp, yp, input) { return new fallingLeavesParticles(xp, yp, input); },
                function (xp, yp, input) { return new ladder(xp, yp, input); },
                function (xp, yp, input) { return new textPrompt(xp, yp, input); },
                function (xp, yp, input) { return new layerBridgeBack(xp, yp, input); },
                function (xp, yp, input) { return new roomChanger(xp, yp, input); },
                function (xp, yp, input) { return new skyBackground(xp, yp, input); },
                function (xp, yp, input) { return new treeGen(xp, yp, input); },
                function (xp, yp, input) { return new mio(xp, yp, input); },
                function (xp, yp, input) { return new player(xp, yp, input); },
                function (xp, yp, input) { return new textPromptBox(xp, yp, input); },
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
            this.angle = 0;
            this.distance = 0;
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
            this.angle = calculations.angleBetweenPoints((this.cameraX - this.targetX), (this.cameraY - this.targetY));
            this.distance = calculations.distanceBetweenPoints(this.cameraX, this.cameraY, this.targetX, this.targetY);
            this.cameraX += Math.cos(this.angle) * this.distance * this.camMovementSpeedX;
            this.cameraY += Math.sin(this.angle) * this.distance * this.camMovementSpeedY;
            this.cameraX = Math.round(this.cameraX);
            this.cameraY = Math.round(this.cameraY);
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

    var groundGrassFilter = /** @class */ (function () {
        function groundGrassFilter(polygonPosGlslAdapted, height, width, windowHeight) {
            this.grassGroundFragement = "\n    varying vec2 vTextureCoord;\n    uniform sampler2D uSampler;\n\n    uniform float yPolPos[{yPolPosArrayLength}];\n\n    uniform float groundHeight;\n    uniform float fadeSize;\n\n    float randFromVec(vec2 co){\n        return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);\n    }\n\n\n\n    void main(void)\n    {\n        vec4 groundDarkColor = vec4(0.020607, 0.0245, 0.1204117, 1.0);\n\n        vec4 preColor = vec4(0.0, 0.0, 0.0, 0.0);\n        float spacing = 1.0/float({yPolPosArrayLength}-1);\n        for (int k = 0; k < {yPolPosArrayLength}; ++k){\n\n            \n            if(k+1 < {yPolPosArrayLength}){\n                float heightDifference = yPolPos[k+1] - yPolPos[k];\n\n                float relativePosition = (vTextureCoord.x - (float(k)*spacing))/spacing;\n\n                float topYPos = (relativePosition*heightDifference);\n\n                \n\n                if((vTextureCoord.x) > (float(k)*spacing) \n                && (vTextureCoord.x) < (float(k)*spacing) + spacing){\n\n                    if(vTextureCoord.y > yPolPos[k] + topYPos){\n                        if(vTextureCoord.y < yPolPos[k] + topYPos + groundHeight*4.0){\n                            float depth = (yPolPos[k] + topYPos + groundHeight) - (vTextureCoord.y);\n                            depth = (depth)/(groundHeight);\n\n\n\n                            if(randFromVec(vTextureCoord) < depth){\n                                preColor = vec4(0.5529, 0.749, 0.2235, 1.0);\n                            }else{\n                                float depth = (yPolPos[k] + topYPos + groundHeight*4.0) - (vTextureCoord.y);\n                                depth = (depth)/(groundHeight*4.0);\n\n                                if(randFromVec(vTextureCoord) < depth){\n                                    preColor = vec4(0.1294117647, 0.1294117647, 0.30196078431, 1.0);//vec4(0.07843, 0.07843, 0.180392, 1.0);\n                                }else{\n                                    float randomWhiteSpecks = randFromVec(vTextureCoord);\n                                    if(randomWhiteSpecks > 0.0997 && randomWhiteSpecks < 0.1){\n                                        preColor = vec4(1.0, 1.0, 1.0, 1.0);\n                                    }else{\n                                        preColor = groundDarkColor;\n                                    }\n                                }\n                            }\n\n                            \n                        }else{\n                            float randomWhiteSpecks = randFromVec(vTextureCoord);\n                            if(randomWhiteSpecks > 0.0997 && randomWhiteSpecks < 0.1){\n                                preColor = vec4(1.0, 1.0, 1.0, 1.0);\n                            }else{\n                                preColor = groundDarkColor;\n                            }\n                        }\n                    }\n                    \n                    \n                    \n                }\n            }\n            \n            \n        }\n\n\n        gl_FragColor = preColor;\n        /*if(vTextureCoord.x < fadeSize){\n            gl_FragColor = vec4((preColor.x), (preColor.y), (preColor.z), (vTextureCoord.x/fadeSize));\n        }else{\n            gl_FragColor = preColor;\n        }*/\n        \n    }";
            this.groundFragment = {
                yPolPos: [1, 2, 3, 4],
                groundHeight: 0.02,
                fadeSize: 0.01
            };
            var fragGroundShader = this.grassGroundFragement.replace(/{yPolPosArrayLength}/g, "" + polygonPosGlslAdapted.length);
            //Moving grass
            this.groundFragment.yPolPos = polygonPosGlslAdapted;
            console.log("windowHeight: ", windowHeight);
            console.log("height: ", height);
            this.groundFragment.groundHeight = 0.05 * (windowHeight / height);
            this.groundFragment.fadeSize = 98 / width;
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
            _this.currentTime = 0;
            _this.YFL_edgeIndex = 0;
            _this.YFL_xFirst = 0;
            _this.YFL_yFirst = 0;
            _this.YFL_xLast = 0;
            _this.YFL_yLast = 0;
            _this.YFL_steps = 0;
            _this.YFL_stepSize = 0;
            _this.CV_pointSpacing = 0;
            _this.CV_edgesPoints = [];
            _this.CV_pointY = 0;
            _this.CV_collisionVector = new nullVector();
            _this.CV_xFirst = 0;
            _this.CV_yFirst = 0;
            _this.CV_xLast = 0;
            _this.CV_yLast = 0;
            _this.CV_i = 0;
            _this.triSide1 = 0;
            _this.triSide2 = 0;
            _this.length = 0;
            _this.vectorAngle = 0;
            _this.dx = 0;
            _this.dy = 0;
            _this.CT_index = 0;
            _this.CT_spaceFromTop = 0;
            _this.CT_collisionTestY = 0;
            _this.CT_collisionLine = new nullVector();
            _this.CT_steepness = 0;
            return _this;
            //super.setCollision(0, 0, 32, 32);
        }
        polygonCollisionX.prototype.getWidth = function () {
            return this.width;
        };
        polygonCollisionX.prototype.setPolygon = function (polygon, width, objFuncs, app) {
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
                var groundGrassF = new groundGrassFilter(polygonPosGlslAdapted, _this.highestPoint, width, objFuncs.getWindowHeight());
                fullGroundContainer.addChild(polygonGraphics);
                fullGroundContainer.filters = [groundGrassF.filter()];
                fullGroundContainer.cacheAsBitmap = true;
                app.renderer.render(fullGroundContainer);
                fullGroundContainer.filters = [];
                //static grass
                var spacingConst = 1.0 / (polygonPosGlslAdapted.length - 1);
                var staticGrassContainer = new PIXI.Container();
                var staticGrass = new grassFilter(polygonPosGlslAdapted, spacingConst, 24, 0.0, _this.width / _this.highestPoint, _this.width, _this.highestPoint, _this.g.x, _this.g.y, _this.highestPoint, objFuncs.getWindowHeight(), _this.width, objFuncs.getWindowWidth(), _this.layerIndex);
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
                _this.filterGrass = new grassFilter(polygonPosGlslAdapted, spacingConst, 32, 0.001, _this.width / _this.highestPoint, _this.width, _this.highestPoint, _this.g.x, _this.g.y, _this.highestPoint, objFuncs.getWindowHeight(), _this.width, objFuncs.getWindowWidth(), _this.layerIndex);
                grassContainer.addChild(polygonGraphics);
                grassContainer.filters = [_this.filterGrass.filter()];
                g.addChild(fullGroundContainer);
                g.addChild(staticGrassContainer);
                g.addChild(grassContainer);
                /*let groundFade = new fadedSidesX(128, this.width);
                

                let overlayBlendFade = new PIXI.Graphics();
                //overlayBlendFade.blendMode = PIXI.BLEND_MODES.ADD;
                overlayBlendFade.beginFill(0x000000, 0); // use an alpha value of 1 to make it visible
                overlayBlendFade.drawRect(0, -this.highestPoint, this.width, this.highestPoint);

                overlayBlendFade.filters = [groundFade.filter()];
                overlayBlendFade.cacheAsBitmap = true;
                //overlayBlendFade.filters[0].blendMode = PIXI.BLEND_MODES.MULTIPLY;
                app.renderer.render(overlayBlendFade);
                overlayBlendFade.filters = [];
                //overlayBlendFade.blendMode = PIXI.BLEND_MODES.MULTIPLY;

                g.mask = overlayBlendFade;
                g.addChild(overlayBlendFade);*/
                return g;
            });
        };
        polygonCollisionX.prototype.logic = function (l) {
            var _a;
            _super.prototype.logic.call(this, l);
            this.currentTime = this.filterGrass.grassFragment.time;
            this.currentTime += 0.015;
            (_a = this.filterGrass) === null || _a === void 0 ? void 0 : _a.updateCollisionPositions(l);
        };
        polygonCollisionX.prototype.getYFromLine = function (xIndex) {
            this.YFL_edgeIndex = Math.floor((xIndex / this.pointSpacing)) * 2;
            this.YFL_xFirst = this.edgesPoints[this.YFL_edgeIndex];
            this.YFL_yFirst = this.edgesPoints[this.YFL_edgeIndex + 1];
            this.YFL_xLast = this.edgesPoints[this.YFL_edgeIndex + 2];
            this.YFL_yLast = this.edgesPoints[this.YFL_edgeIndex + 2 + 1];
            if (xIndex >= this.YFL_xFirst && xIndex <= this.YFL_xLast) {
                if (this.YFL_yFirst == this.YFL_yLast) {
                    return this.YFL_yFirst;
                }
                else {
                    this.YFL_steps = this.YFL_xLast - this.YFL_xFirst;
                    this.YFL_stepSize = (this.YFL_yFirst - this.YFL_yLast) / this.YFL_steps;
                    return this.YFL_yFirst + (this.YFL_stepSize * (this.YFL_xFirst - xIndex));
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
            this.CV_pointSpacing = this.width / (this.polygon.length - 1);
            this.CV_edgesPoints = [];
            for (this.CV_i = 0; this.CV_i < this.polygon.length; this.CV_i++) {
                this.CV_pointY = this.polygon[this.CV_i];
                this.CV_edgesPoints.push((this.CV_i * this.CV_pointSpacing), -this.CV_pointY);
            }
            this.CV_collisionVector = new nullVector();
            for (this.CV_i = 0; this.CV_i < this.CV_edgesPoints.length; this.CV_i += 2) {
                this.CV_xFirst = this.CV_edgesPoints[this.CV_i];
                this.CV_yFirst = this.CV_edgesPoints[this.CV_i + 1];
                this.CV_xLast = this.CV_edgesPoints[this.CV_i + 2];
                this.CV_yLast = this.CV_edgesPoints[this.CV_i + 2 + 1];
                if (xIndex >= this.CV_xFirst && xIndex <= this.CV_xLast) {
                    this.CV_collisionVector = this.createVectorFromPoints(this.CV_xFirst, this.CV_yFirst, this.CV_xLast, this.CV_yLast);
                }
            }
            if (xIndex < 0) {
                this.CV_collisionVector = this.createVectorFromPoints(this.CV_edgesPoints[0], this.CV_edgesPoints[1], this.CV_edgesPoints[2], this.CV_edgesPoints[3]);
            }
            else if (xIndex > (this.CV_edgesPoints.length - 1) * this.CV_pointSpacing) {
                this.CV_collisionVector = this.createVectorFromPoints(this.CV_edgesPoints[(this.CV_edgesPoints.length - 1)], this.CV_edgesPoints[(this.CV_edgesPoints.length - 1) + 1], this.CV_edgesPoints[(this.CV_edgesPoints.length - 1) + 2], this.CV_edgesPoints[(this.CV_edgesPoints.length - 1) + 3]);
            }
            return this.CV_collisionVector;
        };
        polygonCollisionX.prototype.createVectorFromPoints = function (x, y, x2, y2) {
            this.triSide1 = Math.abs(x) - Math.abs(x2);
            this.triSide2 = Math.abs(y) - Math.abs(y2);
            this.length = Math.sqrt(Math.pow(this.triSide1, 2) + Math.pow(this.triSide2, 2));
            this.vectorAngle = Math.atan2(x - x2, y - y2);
            this.dx = Math.cos(this.vectorAngle) * this.length;
            this.dy = Math.sin(this.vectorAngle) * this.length;
            return new vector(this.dx, this.dy);
        };
        polygonCollisionX.prototype.collisionTest = function (obj) {
            this.CT_index = (obj.g.x + obj.collisionBox.x + (obj.collisionBox.width / 2)) - this.g.x;
            this.CT_spaceFromTop = this.getYFromLine(this.CT_index);
            //console.log("index: ",index, "  spaceFromTop: ",spaceFromTop);
            this.CT_collisionTestY = obj.g.y + obj.collisionBox.y + obj.collisionBox.height;
            //console.log("if ",collisionWithPosition," > ",(this.g.y - (spaceFromTop)));
            if (obj.force.Dy >= 0 && this.CT_collisionTestY > this.g.y + (this.CT_spaceFromTop) - 5
            /*&& this.CT_collisionTestY < this.g.y + (this.CT_spaceFromTop)+obj.force.Dy+10*/ ) {
                obj.g.y = this.g.y + (this.CT_spaceFromTop) - obj.collisionBox.y - obj.collisionBox.height - 1;
                this.CT_collisionTestY = obj.g.y + obj.collisionBox.y + obj.collisionBox.height;
                this.CT_collisionLine = this.getCollisionVector(this.CT_index);
                //console.log("collisionLine: ",collisionLine.);
                //console.log("steepness: ",steepness);
                //console.log("collision angle: ",(360+90 + calculations.radiansToDegrees(collisionLine.delta))%360, "  dx: ",collisionLine.Dx);
                if (this.CT_collisionLine.Dx > 0) {
                    this.CT_steepness = 1 - ((this.CT_collisionLine.delta / (Math.PI / 2)) / -1);
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
                    this.CT_collisionLine.Dx = -this.CT_collisionLine.Dx;
                    this.CT_collisionLine.Dy = -this.CT_collisionLine.Dy;
                    this.CT_collisionLine.magnitude = -obj.gravity.magnitude * this.CT_steepness;
                    obj.force.Dy = 0;
                    obj.force.Dx *= this.friction;
                    if (obj.force.Dx > 0) {
                        obj.force.Dx *= (1 - (this.CT_steepness / 3));
                    }
                    else if (obj.force.Dx < 0) {
                        obj.force.Dx *= 1 + (this.CT_steepness / 3);
                    }
                    //obj.gravity = collisionLine;
                    obj.verticalCollision = 1;
                    return [true, this.CT_collisionLine];
                    //obj.gravity.magnitude = 0; 
                }
                else if (this.CT_collisionLine.Dx < 0) {
                    this.CT_steepness = 1 + ((this.CT_collisionLine.delta / (Math.PI / 2)) / -1);
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
                    this.CT_collisionLine.Dx = -this.CT_collisionLine.Dx;
                    this.CT_collisionLine.Dy = -this.CT_collisionLine.Dy;
                    this.CT_collisionLine.magnitude = obj.gravity.magnitude * this.CT_steepness;
                    obj.force.Dy = 0;
                    obj.force.Dx *= this.friction;
                    if (obj.force.Dx < 0) {
                        obj.force.Dx *= (1 - (this.CT_steepness / 3));
                    }
                    else if (obj.force.Dx > 0) {
                        obj.force.Dx *= 1 + (this.CT_steepness / 3);
                    }
                    //obj.gravity = collisionLine;
                    obj.verticalCollision = 1;
                    return [true, this.CT_collisionLine];
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

    var objectContainer = /** @class */ (function () {
        function objectContainer(roomEvents) {
            this.layerNames = {};
            this.layerKeysOrdered = [];
            this.objectToRemoveBuffer = [];
            this.objectToAddBuffer = [];
            this.PFL_addThis = [new nulliObject(0, 0), 0];
            this.PO_removeThis = new nulliObject(0, 0);
            this.PO_target = new nulliObject(0, 0);
            this.roomEvents = roomEvents;
            this.specificObjects = {};
            this.layers = {};
        }
        /*sortLayer(layerNum: number, sortFunc: (a: iObject, b: iObject) => number){
            this.layers[layerNum].objects.sort(sortFunc);
        }*/
        objectContainer.prototype.addGraphicsDirectlyToLayer = function (graphic, layerName) {
            var layerIndex = this.layerNames[layerName];
            this.layers[layerIndex].graphicsContainer.addChild(graphic);
        };
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
        objectContainer.prototype.addObjectDirectly = function (obj, targetlayer, hidden, functionsForObjects, init) {
            //Add specific classes
            if (hidden === void 0) { hidden = false; }
            obj.layerIndex = targetlayer;
            console.log("Set object layer: ", targetlayer);
            var objName = tools.getClassNameFromConstructorName(obj.constructor.toString());
            if (this.specificObjects[objName] == null) {
                this.specificObjects[objName] = new Array();
            }
            this.specificObjects[objName].push(obj);
            if (this.layers[targetlayer] != undefined) {
                obj.layerIndex = this.layers[targetlayer].objects.length;
                this.layers[targetlayer].objects.push(obj);
                if (hidden == false) {
                    this.layers[targetlayer].graphicsContainer.addChild(obj.g);
                }
            }
            if (init) {
                this.setTargetPolygonCollisionLayer(obj);
                obj.init(functionsForObjects);
            }
        };
        objectContainer.prototype.addObject = function (obj, layerIndex) {
            this.objectToAddBuffer.push([obj, layerIndex]);
        };
        objectContainer.prototype.addObjectLayerName = function (obj, layerString) {
            console.log("Created object for layer: ", layerString);
            console.log("we can  layers: ", this.layerNames);
            var layerIndex = this.layerNames[layerString];
            console.log("Target layer index: ", layerIndex);
            this.objectToAddBuffer.push([obj, layerIndex]);
        };
        objectContainer.prototype.getSpecificObjectsInLayer = function (layerName, objectType) {
            var foundObjects = [];
            //console.log("layerName: [",layerName,"]");
            if (layerName != "" && this.layerNames[layerName] != undefined) {
                /*console.log("this.layerNames[layerName] ",this.layerNames[layerName]);
                console.log("this.layers: ",this.layers);*/
                for (var _i = 0, _a = this.layers[this.layerNames[layerName]].objects; _i < _a.length; _i++) {
                    var obj = _a[_i];
                    if (obj.objectName == objectType) {
                        foundObjects.push(obj);
                    }
                }
            }
            return foundObjects;
        };
        objectContainer.prototype.getObjectsInLayer = function (layerName) {
            return this.layers[this.layerNames[layerName]].objects;
        };
        objectContainer.prototype.getObjectsInLayerFromIndex = function (layerName) {
            return this.layers[layerName].objects;
        };
        objectContainer.prototype.getLayerGraphicsContainerFromIndex = function (layerName) {
            return this.layers[layerName].graphicsContainer;
        };
        objectContainer.prototype.populateFromList = function (functionsForObjects) {
            for (var _i = 0, _a = this.objectToAddBuffer; _i < _a.length; _i++) {
                this.PFL_addThis = _a[_i];
                this.addObjectDirectly(this.PFL_addThis[0], this.PFL_addThis[1], false, functionsForObjects, true);
            }
            for (var _b = 0, _c = this.objectToAddBuffer; _b < _c.length; _b++) {
                this.PFL_addThis = _c[_b];
                this.PFL_addThis[0].afterInit(functionsForObjects);
            }
            this.objectToAddBuffer.length = 0;
        };
        objectContainer.prototype.deleteObject = function (id) {
            this.objectToRemoveBuffer.push(id);
        };
        objectContainer.prototype.purgeObjects = function () {
            var _this = this;
            for (var _i = 0, _a = this.objectToRemoveBuffer; _i < _a.length; _i++) {
                this.PO_removeThis = _a[_i];
                if (this.specificObjects[this.PO_removeThis.objectName] != undefined) {
                    for (var _b = 0, _c = this.specificObjects[this.PO_removeThis.objectName]; _b < _c.length; _b++) {
                        this.PO_target = _c[_b];
                        if (this.PO_target.ID == this.PO_removeThis.ID) {
                            this.specificObjects[this.PO_removeThis.objectName].splice(this.specificObjects[this.PO_removeThis.objectName].indexOf(this.PO_target), 1);
                            break;
                        }
                    }
                    this.layerKeysOrdered.forEach(function (layerNumber) {
                        for (var _i = 0, _a = _this.layers[layerNumber].objects; _i < _a.length; _i++) {
                            _this.PO_target = _a[_i];
                            if (_this.PO_target.ID == _this.PO_removeThis.ID) {
                                _this.PO_target.g.destroy();
                                _this.layers[layerNumber].objects.splice(_this.layers[layerNumber].objects.indexOf(_this.PO_target), 1);
                                break;
                            }
                        }
                    });
                }
            }
            this.objectToRemoveBuffer.length = 0;
        };
        objectContainer.prototype.loopThroughObjectsUntilCondition = function (targets, func) {
            if (targets == undefined)
                return objectGlobalData.null;
            var i = 0;
            for (; i < targets.length; i++) {
                if (this.specificObjects[targets[i]] != null) {
                    var j = 0;
                    for (; j < this.specificObjects[targets[i]].length; j++) {
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
            var i = 0;
            for (; i < targets.length; i++) {
                if (this.specificObjects[targets[i]] != null) {
                    var j = 0;
                    for (; j < this.specificObjects[targets[i]].length; j++) {
                        if (func(this.specificObjects[targets[i]][j])) {
                            foundObjects.push(this.specificObjects[targets[i]][j]);
                        }
                    }
                }
            }
            return foundObjects;
        };
        objectContainer.prototype.getLayerNames = function () {
            var _this = this;
            var layerNames = Object.keys(this.layerNames);
            var indexes = [];
            layerNames.forEach(function (x) {
                indexes.push([x, _this.layerNames[x]]);
            });
            indexes.sort(function (a, b) {
                return a[1] - b[1];
            });
            var layerNamesSorted = [];
            indexes.forEach(function (x) {
                layerNamesSorted.push(x[0]);
            });
            return layerNamesSorted;
        };
        objectContainer.prototype.getLayerNamesMap = function () {
            return this.layerNames;
        };
        objectContainer.prototype.getSpecificObjects = function (objName) {
            return this.specificObjects[objName];
        };
        objectContainer.prototype.loopThrough = function (logicModule, roomEvents) {
            var x = 0;
            for (; x < this.layerKeysOrdered.length; x++) {
                var key = this.layerKeysOrdered[x];
                var i = 0;
                for (; i < this.layers[key].objects.length; i++) {
                    this.layers[key].objects[i].preLogicMovement(roomEvents);
                    this.layers[key].objects[i].logic(logicModule);
                }
            }
        };
        objectContainer.prototype.forEveryObject = function (func) {
            var x = 0;
            for (; x < this.layerKeysOrdered.length; x++) {
                var key = this.layerKeysOrdered[x];
                var i = 0;
                for (; i < this.layers[key].objects.length; i++) {
                    func(this.layers[key].objects[i]);
                }
            }
        };
        objectContainer.prototype.getAllObjects = function () {
            var allObjectsContainer = [];
            var x = 0;
            for (; x < this.layerKeysOrdered.length; x++) {
                var key = this.layerKeysOrdered[x];
                var i = 0;
                for (; i < this.layers[key].objects.length; i++) {
                    allObjectsContainer.push(this.layers[key].objects[i]);
                }
            }
            return allObjectsContainer;
        };
        objectContainer.prototype.updateLayerOffsets = function (camera, app) {
            var x = 0;
            for (; x < this.layerKeysOrdered.length; x++) {
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
        objectContainer.prototype.boxIntersectionInLayerSpecific = function (initiator, boxData, targetObjects, inLayer) {
            return this.loopThroughObjectsUntilCondition(targetObjects, function (testCollisionWith) {
                //if(testCollisionWith.layerIndex == inLayer && internalFunction.intersecting(initiator, boxData, testCollisionWith)){
                if ((initiator.sameLayerCollisionOnly == false || (initiator.sameLayerCollisionOnly == true && initiator.layerIndex == testCollisionWith.layerIndex))
                    && internalFunction.intersecting(initiator, boxData, testCollisionWith)) {
                    return true;
                }
                return false;
            });
        };
        objectContainer.prototype.setTargetPolygonCollisionLayer = function (obj) {
            var allLayers = this.getLayerNames();
            var passedMyLayer = false;
            console.log("allLayers: ", allLayers);
            for (var i = 0; i < allLayers.length; i++) {
                var layer_1 = allLayers[i];
                //if((passedMyLayer && obj.sameLayerCollisionOnly == false) || (obj.sameLayerCollisionOnly && obj.layerIndex == this.layerNames[layer])){
                if (passedMyLayer) {
                    var foundPolygons = this.getSpecificObjectsInLayer(allLayers[i], polygonCollisionX.objectName);
                    if (foundPolygons.length > 0) {
                        obj._targetLayerForPolygonCollision = allLayers[i];
                        return;
                    }
                }
                if (obj.layerIndex == this.getLayerNamesMap()[layer_1]) {
                    passedMyLayer = true;
                }
            }
        };
        return objectContainer;
    }());

    var roomEventFlags = /** @class */ (function () {
        function roomEventFlags() {
            this.flags = [];
        }
        roomEventFlags.prototype.add = function (flag) {
            if (this.flags.indexOf(flag) == -1) {
                this.flags.push(flag);
            }
        };
        roomEventFlags.prototype.remove = function (flag) {
            if (this.flags.indexOf(flag) != -1) {
                this.flags.splice(this.flags.indexOf(flag), 1);
            }
        };
        roomEventFlags.prototype.has = function (flag) {
            if (this.flags.indexOf(flag) != -1) {
                return false;
            }
            return true;
        };
        return roomEventFlags;
    }());

    var objectFunctions = /** @class */ (function () {
        function objectFunctions(l) {
            this.roomEvents = l;
        }
        //Camera
        objectFunctions.prototype.getCameraBounds = function () {
            return this.roomEvents.getCameraBounds();
        };
        objectFunctions.prototype.isCameraInUse = function () {
            return this.roomEvents.isCameraInUse();
        };
        objectFunctions.prototype.getCameraX = function () {
            return this.roomEvents.getCameraX();
        };
        objectFunctions.prototype.getCameraY = function () {
            return this.roomEvents.getCameraY();
        };
        objectFunctions.prototype.setCameraTarget = function (targetX, targetT) {
            this.roomEvents.setCameraTarget(targetX, targetT);
        };
        objectFunctions.prototype.setCameraMoveSpeedX = function (val) {
            this.roomEvents.setCameraMoveSpeedX(val);
        };
        objectFunctions.prototype.setCameraMoveSpeedY = function (val) {
            this.roomEvents.setCameraMoveSpeedY(val);
        };
        objectFunctions.prototype.getCameraOffsetX = function () {
            return this.roomEvents.getCameraOffsetX();
        };
        objectFunctions.prototype.getCameraOffsetY = function () {
            return this.roomEvents.getCameraOffsetY();
        };
        objectFunctions.prototype.setCameraOffsetX = function (value) {
            this.roomEvents.setCameraOffsetX(value);
        };
        objectFunctions.prototype.setCameraOffsetY = function (value) {
            this.roomEvents.setCameraOffsetY(value);
        };
        objectFunctions.prototype.getWindowWidth = function () {
            return this.roomEvents.getWindowWidth();
        };
        objectFunctions.prototype.getWindowHeight = function () {
            return this.roomEvents.getWindowHeight();
        };
        objectFunctions.prototype.deleteObject = function (id) {
            this.roomEvents.deleteObject(id);
        };
        objectFunctions.prototype.addObject = function (obj, layerIndex) {
            this.roomEvents.addObject(obj, layerIndex);
        };
        objectFunctions.prototype.addObjectLayerName = function (obj, layerString) {
            this.roomEvents.addObjectLayerName(obj, layerString);
        };
        objectFunctions.prototype.foreachObjectTypeBoolean = function (type, func) {
            return this.roomEvents.foreachObjectTypeBoolean(type, func);
        };
        objectFunctions.prototype.foreachObjectType = function (type, func) {
            return this.roomEvents.foreachObjectType(type, func);
        };
        objectFunctions.prototype.loadRoom = function (loadRoomString, roomStartString) {
            this.roomEvents.loadRoom(loadRoomString, roomStartString);
        };
        objectFunctions.prototype.checkKeyPressed = function (keyCheck) {
            return this.roomEvents.checkKeyPressed(keyCheck);
        };
        objectFunctions.prototype.checkKeyReleased = function (keyCheck) {
            return this.roomEvents.checkKeyReleased(keyCheck);
        };
        objectFunctions.prototype.checkKeyHeld = function (keyCheck) {
            return this.roomEvents.checkKeyHeld(keyCheck);
        };
        objectFunctions.prototype.checkMouseDown = function () {
            return this.roomEvents.checkMouseDown();
        };
        objectFunctions.prototype.checkMouseUp = function () {
            return this.roomEvents.checkMouseUp();
        };
        objectFunctions.prototype.mouseX = function () {
            return this.roomEvents.mouseX();
        };
        objectFunctions.prototype.mouseY = function () {
            return this.roomEvents.mouseY();
        };
        objectFunctions.prototype.getRoomStartString = function () {
            return this.roomEvents.getRoomStartString();
        };
        objectFunctions.prototype.getSpecificObjects = function (type) {
            return this.roomEvents.getSpecificObjects(type);
        };
        objectFunctions.prototype.getLayerNamesSortedList = function () {
            return this.roomEvents.objContainer.getLayerNames();
        };
        objectFunctions.prototype.getLayerNamesMap = function () {
            return this.roomEvents.objContainer.getLayerNamesMap();
        };
        objectFunctions.prototype.deltaTime = function () {
            return this.roomEvents.deltaTime;
        };
        objectFunctions.prototype.flags = function () {
            return this.roomEvents.flags;
        };
        objectFunctions.prototype.keepObjectsWithinArea = function (objects, originX, originY, radius) {
            return this.roomEvents.keepObjectsWithinArea(objects, originX, originY, radius);
        };
        objectFunctions.prototype.getRenderer = function () {
            return this.roomEvents.getRenderer();
        };
        objectFunctions.prototype.addGraphicsDirectlyToLayer = function (graphic, layerName) {
            this.roomEvents.addGraphicsDirectlyToLayer(graphic, layerName);
        };
        objectFunctions.prototype.setLayerFilterExclude = function (excludeLayer, filters) {
            this.roomEvents.setLayerFilterExclude(excludeLayer, filters);
        };
        objectFunctions.prototype.goToRoom = function (loadRoomString, roomStartString) {
            this.roomEvents.goToRoom(loadRoomString, roomStartString);
        };
        objectFunctions.prototype.isCollidingWith = function (colSource, colSourceCollisionBox, colTargetType) {
            return this.roomEvents.isCollidingWith(colSource, colSourceCollisionBox, colTargetType);
        };
        objectFunctions.prototype.tryStepBetweenLayers = function (obj, forward) {
            if (forward === void 0) { forward = true; }
            var allLayers = this.getLayerNamesSortedList();
            if (forward == false) {
                allLayers = allLayers.reverse();
            }
            console.log("layerKeys: ", allLayers);
            var targetLayer = "";
            var targetLayerGroundPart = "";
            var passedMyLayer = false;
            for (var i = 0; i < allLayers.length; i++) {
                var layer = allLayers[i];
                if (passedMyLayer) {
                    var foundPolygons = this.roomEvents.objContainer.getSpecificObjectsInLayer(allLayers[i], polygonCollisionX.objectName);
                    if (foundPolygons.length > 0) {
                        if (forward) {
                            targetLayer = allLayers[i - 1];
                        }
                        else {
                            targetLayer = allLayers[i + 1];
                        }
                        targetLayerGroundPart = allLayers[i];
                        console.log("targetLayerGroundPart: ", targetLayerGroundPart);
                        break;
                    }
                }
                if (obj._targetLayerForPolygonCollision == layer) {
                    passedMyLayer = true;
                }
            }
            /*for(var i=0; i<allLayers.length; i++){
                let layer = allLayers[i];

                if(passedMyLayer){
                    let foundPolygons = this.roomEvents.objContainer.getSpecificObjectsInLayer(allLayers[i], polygonCollisionX.objectName) as polygonCollisionX[];
                    
                    if(foundPolygons.length > 0){
                        if(passedMyTargetpolygonLayer == false){
                            passedMyTargetpolygonLayer = true;
                        }else{
                            targetLayer = allLayers[i-1];
                            targetLayerGroundPart = allLayers[i];
                            break;
                        }
                    }
                }

                if(obj.layerIndex == this.getLayerNamesMap()[layer]){
                    passedMyLayer = true;
                }
            }*/
            console.log("targetLayer: ", targetLayer);
            if (targetLayer != "") {
                //Check if polygon collision is below character
                var foundPolygons = this.roomEvents.getSpecificObjectsInLayer(polygonCollisionX.objectName, targetLayerGroundPart);
                console.log("foundPolygons: ", foundPolygons);
                var targetPolygon = null;
                for (var _i = 0, foundPolygons_1 = foundPolygons; _i < foundPolygons_1.length; _i++) {
                    var polygon = foundPolygons_1[_i];
                    if (obj.g.x > polygon.g.x && obj.g.x < polygon.g.x + polygon.getWidth()) {
                        targetPolygon = polygon;
                        break;
                    }
                }
                console.log("targetPolygon: ", targetPolygon);
                if (targetPolygon != null) {
                    obj._targetLayerForPolygonCollision = targetLayerGroundPart;
                    //Move object to new layer
                    this.roomEvents.stageObjectForNewLayer(obj, targetLayer);
                }
            }
        };
        return objectFunctions;
    }());

    var roomEvent = /** @class */ (function () {
        function roomEvent(con, tasker, app) {
            this.mouseXPosition = 0;
            this.mouseYPosition = 0;
            this.bufferedMouseDown = false;
            this.bufferedMouseUp = false;
            this.mouseUp = false;
            this.mouseDown = false;
            this.keysDown = {};
            this.layerAndGraphicContainer = {};
            this.gameKeysPressed = {};
            this.gameKeysReleased = {};
            this.gameKeysHeld = {};
            this.deltaTime = 1;
            this.camera = new gameCamera();
            this.generateObjects = new objectGenerator();
            this.tileContainer = [];
            this.cameraBounds = [0, 0, 0, 0];
            this.roomStartString = [];
            this.flags = new roomEventFlags();
            this.storedTargetScene = ["", []];
            this.moveObjectToNewLayerBuffer = [];
            this.key = "";
            this.mouseXPre = 0;
            this.mouseYPre = 0;
            this.ICW_colliding = null;
            this.hoesIndex = 0;
            this.objContainer = new objectContainer(this);
            this.container = con;
            this.tasker = tasker;
            this.keysDown = {};
            this.app = app;
            this.functionsForObjects = new objectFunctions(this);
            this.container.addEventListener("mousemove", this.mouseMoveListener.bind(this));
            this.container.addEventListener("mousedown", this.mouseDownListener.bind(this));
            this.container.addEventListener("mouseup", this.mouseUpListener.bind(this));
            document.addEventListener("keydown", this.keyDownListener.bind(this), false);
            document.addEventListener("keyup", this.keyUpListener.bind(this), false);
        }
        roomEvent.prototype.getRenderer = function () {
            return this.app.renderer;
        };
        roomEvent.prototype.addStageFilter = function (addFilters) {
            this.app.stage.filters = addFilters;
        };
        roomEvent.prototype.setLayerFilter = function (layerNames, filters) {
            var keys = Object.keys(this.layerAndGraphicContainer);
            var pixiContainerForFilter = new PIXI.Container();
            this.app.stage.removeChildren();
            for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                var key = keys_1[_i];
                //this.layerAndGraphicContainer[key].parent.removeChild(this.layerAndGraphicContainer[key]);
                if (layerNames.length == 0 || layerNames.indexOf(key) == -1) {
                    this.app.stage.addChild(this.layerAndGraphicContainer[key]);
                }
                else {
                    pixiContainerForFilter.addChild(this.layerAndGraphicContainer[key]);
                    layerNames.splice(layerNames.indexOf(key), 1);
                    if (layerNames.length == 0) {
                        pixiContainerForFilter.filters = filters;
                        this.app.stage.addChild(pixiContainerForFilter);
                    }
                }
            }
        };
        roomEvent.prototype.setLayerFilterExclude = function (excludeLayer, filters) {
            var keys = Object.keys(this.layerAndGraphicContainer);
            for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
                var key = keys_2[_i];
                if (excludeLayer != key) {
                    this.layerAndGraphicContainer[key].filters = filters;
                }
            }
        };
        roomEvent.prototype.getStageFilters = function () {
            return this.app.stage.filters;
        };
        roomEvent.prototype.getWindowWidth = function () {
            return this.app.renderer.view.width;
        };
        roomEvent.prototype.getWindowHeight = function () {
            return this.app.renderer.view.height;
        };
        roomEvent.prototype.queryKey = function () {
            //Reset pressed keys
            for (this.key in this.gameKeysPressed) {
                if (this.gameKeysPressed.hasOwnProperty(this.key)) {
                    this.gameKeysPressed[this.key] = false;
                }
            }
            for (this.key in this.gameKeysReleased) {
                if (this.gameKeysReleased.hasOwnProperty(this.key)) {
                    this.gameKeysReleased[this.key] = false;
                }
            }
            for (this.key in this.keysDown) {
                if (this.keysDown.hasOwnProperty(this.key)) {
                    if (this.keysDown[this.key] && (this.gameKeysPressed[this.key] == undefined || this.gameKeysPressed[this.key] == false) && (this.gameKeysHeld[this.key] == undefined || this.gameKeysHeld[this.key] == false)) {
                        this.gameKeysPressed[this.key] = true;
                        this.gameKeysHeld[this.key] = true;
                    }
                    else if (this.keysDown[this.key] == false && this.gameKeysHeld[this.key] == true) {
                        this.gameKeysPressed[this.key] = false;
                        this.gameKeysHeld[this.key] = false;
                        this.gameKeysReleased[this.key] = true;
                    }
                }
            }
            if (this.bufferedMouseDown) {
                this.bufferedMouseDown = false;
                this.mouseDown = true;
            }
            else {
                this.mouseDown = false;
            }
            if (this.bufferedMouseUp) {
                this.bufferedMouseUp = false;
                this.mouseUp = true;
            }
            else {
                this.mouseUp = false;
            }
        };
        roomEvent.prototype.mouseMoveListener = function (e) {
            this.mouseXPre = e.clientX; //x position within the element.
            this.mouseYPre = e.clientY; //y position within the element.
            if (e.target instanceof Element) {
                var rect = e.target.getBoundingClientRect();
                this.mouseXPre -= rect.left;
                this.mouseYPre -= rect.top;
            }
            this.mouseXPosition = this.mouseXPre;
            this.mouseYPosition = this.mouseYPre;
        };
        roomEvent.prototype.mouseDownListener = function (e) {
            this.bufferedMouseDown = true;
        };
        roomEvent.prototype.mouseUpListener = function (e) {
            this.bufferedMouseUp = true;
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
        roomEvent.prototype.checkMouseDown = function () {
            return this.mouseDown;
        };
        roomEvent.prototype.checkMouseUp = function () {
            return this.mouseUp;
        };
        roomEvent.prototype.keepObjectsWithinArea = function (objects, originX, originY, radius) {
            var keptObjects = [];
            for (var _i = 0, objects_1 = objects; _i < objects_1.length; _i++) {
                var obj = objects_1[_i];
                if (calculations.distanceBetweenPoints(originX, originY, obj.g.x, obj.g.y) <= radius) {
                    keptObjects.push(obj);
                }
            }
            return keptObjects;
        };
        roomEvent.prototype.getObjectsInLayer = function (layerName) {
            return this.objContainer.getObjectsInLayer(layerName);
        };
        roomEvent.prototype.foreachObjectTypeBoolean = function (type, func) {
            this.objContainer.getSpecificObjects(type)
                .forEach(function (element) {
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
        /*sortLayer(layerNum: number, sortFunc: (a: iObject, b: iObject) => number){
            this.objContainer.sortLayer(layerNum, sortFunc);
        }*/
        roomEvent.prototype.getSpecificObjects = function (type) {
            return this.objContainer.getSpecificObjects(type);
        };
        roomEvent.prototype.isCollidingWith = function (colSource, colSourceCollisionBox, colTargetType) {
            var _this = this;
            this.ICW_colliding = null;
            this.objContainer.loopThroughObjectsUntilCondition(colTargetType, function (obj) {
                if (internalFunction.intersecting(colSource, colSourceCollisionBox, obj)) {
                    _this.ICW_colliding = obj;
                    return true;
                }
                return false;
            });
            return this.ICW_colliding;
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
        roomEvent.prototype.addGraphicsDirectlyToLayer = function (graphic, layerName) {
            this.objContainer.addGraphicsDirectlyToLayer(graphic, layerName);
        };
        roomEvent.prototype.addObject = function (obj, layerIndex) {
            this.objContainer.addObject(obj, layerIndex);
        };
        roomEvent.prototype.addObjectLayerName = function (obj, layerString) {
            this.objContainer.addObjectLayerName(obj, layerString);
        };
        roomEvent.prototype.deleteObject = function (id) {
            this.objContainer.deleteObject(id);
        };
        roomEvent.prototype.goToRoom = function (loadRoomString, roomStartString) {
            this.storedTargetScene = [loadRoomString, roomStartString];
        };
        roomEvent.prototype.handleObjectsEndStep = function () {
            //Move objects to new layers
            for (this.hoesIndex = 0; this.hoesIndex < this.moveObjectToNewLayerBuffer.length; this.hoesIndex++) {
                this.moveObjectToNewLayerBuffer[this.hoesIndex][0].changeLayer(this, this.moveObjectToNewLayerBuffer[this.hoesIndex][1]);
            }
            this.moveObjectToNewLayerBuffer = [];
            this.objContainer.populateFromList(this.functionsForObjects);
            this.objContainer.purgeObjects();
        };
        roomEvent.prototype.loopThrough = function () {
            this.objContainer.loopThrough(this.functionsForObjects, this);
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
            //console.log("import room: ",loadRoom);
            this.objContainer.removeObjects();
            this.moveObjectToNewLayerBuffer = [];
            this.cameraBounds[0] = (_a = loadRoom.cameraBoundsX) !== null && _a !== void 0 ? _a : 0;
            this.cameraBounds[1] = (_b = loadRoom.cameraBoundsY) !== null && _b !== void 0 ? _b : 0;
            this.cameraBounds[2] = (_c = loadRoom.cameraBoundsWidth) !== null && _c !== void 0 ? _c : 0;
            this.cameraBounds[3] = (_d = loadRoom.cameraBoundsHeight) !== null && _d !== void 0 ? _d : 0;
            while (this.app.stage.children[0]) {
                this.app.stage.removeChild(this.app.stage.children[0]);
            }
            this.app.renderer.backgroundColor = parseInt(loadRoom.backgroundColor.replace("#", "0x"));
            var _loop_1 = function (layer_1) {
                var pixiContainerLayer = new PIXI.Container();
                var objectsToAdd = [];
                var containsOnlyStaticTiles = true;
                var layerSettings = JSON.parse(layer_1.settings);
                this_1.objContainer.addContainerForLayer(pixiContainerLayer, layer_1.zIndex, layer_1.layerName, layerSettings.scrollSpeedX, layerSettings.scrollSpeedY);
                for (var _i = 0, _a = layer_1.metaObjectsInLayer; _i < _a.length; _i++) {
                    var objMeta = _a[_i];
                    if (objMeta.type == objectTypes.userObject) {
                        if (objMeta.isPartOfCombination == false) {
                            var genObj = this_1.generateObjects.generateObject(objMeta.name, Math.floor(objMeta.x), Math.floor(objMeta.y), objMeta.tile, objMeta.inputString);
                            genObj.layerIndex = layer_1.zIndex;
                            if (genObj != null) {
                                if (genObj.isTile == false) {
                                    containsOnlyStaticTiles = false;
                                    this_1.objContainer.addObjectDirectly(genObj, layer_1.zIndex, layer_1.hidden, this_1.functionsForObjects, false);
                                }
                                else {
                                    if (objMeta.tile.tiles.length > 1) {
                                        containsOnlyStaticTiles = false;
                                    }
                                    this_1.tileContainer.push(genObj);
                                    if (layer_1.hidden == false) {
                                        objectsToAdd.push(genObj.g);
                                    }
                                }
                            }
                        }
                    }
                }
                for (var _b = 0, _c = layer_1.geometriesInLayer; _b < _c.length; _b++) {
                    var geom = _c[_b];
                    var newPolygon = new polygonCollisionX(geom.x, geom.y, "");
                    geom.geomPoints = geom.geomPoints.map(function (yPoint) {
                        return Number(Math.round(yPoint));
                    });
                    newPolygon.setPolygon(geom.geomPoints, Math.round(geom.geomWidth), this_1.functionsForObjects, this_1.app);
                    this_1.objContainer.addObjectDirectly(newPolygon, layer_1.zIndex, layer_1.hidden, this_1.functionsForObjects, false);
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
                this_1.layerAndGraphicContainer[layer_1.layerName] = pixiContainerLayer;
                this_1.app.stage.addChild(pixiContainerLayer);
            };
            var this_1 = this, blurFilter1;
            for (var _i = 0, _e = loadRoom.layerData; _i < _e.length; _i++) {
                var layer_1 = _e[_i];
                _loop_1(layer_1);
            }
            var allObjects = this.objContainer.getAllObjects();
            allObjects.forEach(function (obj) {
                _this.objContainer.setTargetPolygonCollisionLayer(obj);
            });
            allObjects.forEach(function (obj) {
                obj.init(_this.functionsForObjects);
            });
            allObjects.forEach(function (obj) {
                obj.afterInit(_this.functionsForObjects);
            });
        };
        roomEvent.prototype.getSpecificObjectsInLayer = function (objectType, targetLayer) {
            var targetObjects = [];
            var objectsFound = this.getObjectsInLayer(targetLayer);
            console.log("objects in layer: ", objectsFound);
            for (var _i = 0, objectsFound_1 = objectsFound; _i < objectsFound_1.length; _i++) {
                var obj = objectsFound_1[_i];
                console.log("if ", obj.objectName, " == ", objectType);
                if (obj.objectName == objectType) {
                    targetObjects.push(obj);
                }
            }
            return targetObjects;
        };
        roomEvent.prototype.stageObjectForNewLayer = function (obj, layerName) {
            this.moveObjectToNewLayerBuffer.push([obj, layerName]);
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
            /*readonly targetFps: number = 60;
            private fpsLimiter: number = 0;
            private frameDelay: number = 0;*/
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
            /*this.app.renderer.view.style.width = 1280 + "px";
            this.app.renderer.view.style.height = 720 + "px"*/
            this.gameContainerElement.appendChild(this.app.view);
            //this.graphicsModule = new graphics(this.canvasContext);
            this.logicModule = new roomEvent(this.gameContainerElement, this.tasker, this.app);
            this.app.ticker.add(function (delta) {
                //if(this.fpsLimiter == 0){
                _this.logicModule.deltaTime = delta;
                ticker.tick();
                _this.tasker.tick(_this.logicModule);
                if (_this.logicModule.storedTargetScene[0] != "") {
                    var roomName = _this.logicModule.storedTargetScene[0];
                    _this.logicModule.storedTargetScene[0] = "";
                    _this.logicModule.loadRoom(roomName, _this.logicModule.storedTargetScene[1]);
                }
                _this.logicModule.queryKey();
                _this.logicModule.loopThrough();
                _this.logicModule.handleObjectsEndStep();
                //this.fpsLimiter = this.frameDelay;
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
                /*}
                if(this.fpsLimiter > 0){
                    this.fpsLimiter--;
                }*/
            });
            this.logicModule.loadRoom(gameStartRoom, []);
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

}(PIXI, PIXI.filters, PIXI.filters, PIXI.particles, PIXI.filters));
//# sourceMappingURL=index.js.map
