(function (PIXI, filterAdjustment, socket_ioClient, filterGodray) {
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

    var block1 = /** @class */ (function (_super) {
        __extends(block1, _super);
        function block1(xp, yp, input) {
            var _this = _super.call(this, xp, yp, block1.objectName) || this;
            _super.prototype.setCollision.call(_this, 0, 0, 64, 64);
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI.Graphics();
                newGraphics.beginFill(0x000000);
                newGraphics.drawRect(0, 0, 64, 64);
                newGraphics.endFill();
                g.addChild(newGraphics);
                g.calculateBounds();
                return g;
            });
            return _this;
        }
        block1.prototype.logic = function (l) {
        };
        block1.objectName = "block1";
        return block1;
    }(objectBase));

    var normalBullet = /** @class */ (function (_super) {
        __extends(normalBullet, _super);
        function normalBullet(xp, yp, input) {
            var _this = _super.call(this, xp, yp, normalBullet.objectName) || this;
            _super.prototype.setCollision.call(_this, 0, 0, 8, 8);
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI.Graphics();
                newGraphics.beginFill(0xFF0000);
                newGraphics.drawRect(0, 0, 8, 8);
                newGraphics.endFill();
                g.addChild(newGraphics);
                g.calculateBounds();
                return g;
            });
            return _this;
        }
        normalBullet.prototype.logic = function (l) {
        };
        normalBullet.objectName = "normalBullet";
        return normalBullet;
    }(objectBase));

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

    var characterMoves = /** @class */ (function () {
        function characterMoves(ladderObject, groundAttacks, airAttacks) {
            if (ladderObject === void 0) { ladderObject = ""; }
            if (groundAttacks === void 0) { groundAttacks = null; }
            if (airAttacks === void 0) { airAttacks = null; }
            this.maxRunSpeed = 6;
            this.superRunSpeed = 6;
            this.normalRunSpeed = 4;
            this.jumpStrength = 8;
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
            if (l.checkKeyHeld("Control")) {
                this.maxRunSpeed = this.superRunSpeed;
            }
            else {
                this.maxRunSpeed = this.normalRunSpeed;
            }
            if (l.checkKeyHeld("a") || l.checkKeyHeld("A")) {
                character.addForceAngleMagnitude(calculations.degreesToRadians(180), (10 / 13) * this.maxRunSpeed * l.deltaTime());
            }
            if (l.checkKeyHeld("d") || l.checkKeyHeld("D")) {
                character.addForceAngleMagnitude(calculations.degreesToRadians(0), (10 / 13) * this.maxRunSpeed * l.deltaTime());
            }
            if (l.checkKeyHeld("w") || l.checkKeyHeld("W")) {
                character.addForceAngleMagnitude(calculations.degreesToRadians(90), (10 / 13) * this.maxRunSpeed * l.deltaTime());
            }
            if (l.checkKeyHeld("s") || l.checkKeyHeld("S")) {
                character.addForceAngleMagnitude(calculations.degreesToRadians(270), (10 / 13) * this.maxRunSpeed * l.deltaTime());
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

    var socketHandler = /** @class */ (function (_super) {
        __extends(socketHandler, _super);
        function socketHandler(xp, yp, input) {
            var _this = _super.call(this, xp, yp, socketHandler.objectName) || this;
            _this.gameId = "";
            _this.socketId = "";
            _this.localPlayerId = "";
            _this.socket = socket_ioClient.io("ws://localhost:3000");
            return _this;
        }
        socketHandler.prototype.init = function (roomEvents) {
            var _this = this;
            this.socket.on("connect", function () {
                _this.socket.emit("startGame");
            });
            this.socket.on("gameRoomFound", function (data) {
                _this.gameId = data.gameId;
                _this.socketId = data.mySocketId;
                var playerNew = new human(_this.g.x, _this.g.y, "true");
                roomEvents.addObjectLayerName(playerNew, "main");
                _this.localPlayerId = playerNew.ID;
                _this.socket.on("playerPositions", function (playerPositions) {
                    console.log("playerPositions: ", playerPositions);
                    var objectIds = Object.keys(playerPositions);
                    objectIds.forEach(function (plPosition) {
                        var positionData = playerPositions[plPosition];
                        /**gravity: [pl.gravity.Dx, pl.gravity.Dy],
                        force: [pl.force.Dx, pl.force.Dy, pl.force.delta, pl.force.magnitude] */
                        if (positionData.id != _this.localPlayerId) {
                            var allHumans = roomEvents.getSpecificObjects(human.objectName);
                            var humanUpdated_1 = false;
                            allHumans.forEach(function (h) {
                                if (h.ID == positionData.id) {
                                    h.force.Dx = positionData.force[0];
                                    h.force.Dy = positionData.force[1];
                                    h.setPersistentForce(positionData.force[2], positionData.force[3]);
                                    //h.addForceAngleMagnitude(positionData.force[0], (1/13)*positionData.force[1]);
                                    h.gravity.Dx = positionData.gravity[0];
                                    h.gravity.Dy = positionData.gravity[1];
                                    h.g.x = positionData.x;
                                    h.g.y = positionData.y;
                                    humanUpdated_1 = true;
                                }
                            });
                            if (humanUpdated_1 == false) {
                                var playerNew_1 = new human(positionData.x, positionData.y, "false");
                                playerNew_1.ID = positionData.id;
                                roomEvents.addObjectLayerName(playerNew_1, "main");
                            }
                        }
                    });
                });
            });
        };
        socketHandler.prototype.logic = function (l) {
            _super.prototype.logic.call(this, l);
        };
        socketHandler.prototype.updatePlayerPosition = function (pl) {
            var sendPlData = {
                id: pl.ID,
                x: pl.g.x,
                y: pl.g.y,
                gravity: [pl.gravity.Dx, pl.gravity.Dy],
                force: [pl.force.Dx, pl.force.Dy, pl.force.delta, pl.force.magnitude],
                gameId: this.gameId,
                socketId: this.socketId,
            };
            //console.log("Send pl data: ",sendPlData);
            this.socket.emit("position", sendPlData);
        };
        socketHandler.objectName = "socketHandler";
        return socketHandler;
    }(objectBase));

    var weaponEmpty = /** @class */ (function () {
        function weaponEmpty() {
        }
        weaponEmpty.prototype.activate = function () {
        };
        weaponEmpty.prototype.deactivate = function () {
        };
        weaponEmpty.prototype.poll = function (l, x, y, angle) {
        };
        return weaponEmpty;
    }());

    var nw1 = /** @class */ (function () {
        function nw1() {
            this.active = false;
            this.timer = 10;
            this.timerNumber = 10;
        }
        nw1.prototype.activate = function () {
            if (this.active == false) {
                this.active = true;
            }
        };
        nw1.prototype.deactivate = function () {
            if (this.active) {
                this.active = false;
            }
        };
        nw1.prototype.poll = function (l, x, y, angle) {
            if (this.timer == 0) {
                var bullet = new normalBullet(x, y, "");
                l.addObjectLayerName(bullet, "main");
                this.timer = this.timerNumber;
            }
            else {
                this.timer--;
            }
        };
        return nw1;
    }());

    var human = /** @class */ (function (_super) {
        __extends(human, _super);
        function human(xp, yp, input) {
            var _this = _super.call(this, xp, yp, human.objectName) || this;
            _this.sameLayerCollisionOnly = true;
            _this.collidesWithPolygonGeometry = true;
            _this.airFriction = 0.80;
            _this.friction = 0.7;
            _this.gravity = new vectorFixedDelta(calculations.degreesToRadians(270), 0); //vector.fromAngleAndMagnitude(calculations.degreesToRadians(270), 0.6);
            _this.weight = 0.0;
            _this.socketHandler = null;
            _this.isCurrentPlayer = false;
            _this.online_persistentForceDelta = 0;
            _this.online_persistentForceMagnitude = 0;
            _this.currentWeapon = new weaponEmpty();
            _super.prototype.setCollision.call(_this, 0, 0, 58, 58);
            if (input == "true") {
                _this.isCurrentPlayer = true;
            }
            _super.prototype.style.call(_this, function (g) {
                var newGraphics = new PIXI.Graphics();
                newGraphics.beginFill(0xFF3e50);
                newGraphics.drawRect(0, 0, 58, 58);
                newGraphics.endFill();
                g.addChild(newGraphics);
                g.calculateBounds();
                return g;
            });
            _this.characterMoveBase = new characterMoves("", function (l) {
                //Ground attacks
                return new baseAttackNull();
            }, function (l) {
                //air attacks
                return new baseAttackNull();
            });
            _this.addCollisionTarget(block1.objectName);
            _this.currentWeapon = new nw1();
            return _this;
        }
        human.prototype.afterInit = function (roomEvents) {
            this.socketHandler = roomEvents.getSpecificObjects(socketHandler.objectName)[0];
        };
        human.prototype.logic = function (l) {
            _super.prototype.logic.call(this, l);
            if (this.isCurrentPlayer && this.socketHandler != null) {
                if (l.flags().has("freezeObjects")) {
                    this.characterMoveBase.move(l, this);
                }
                if (l.checkMouseClick()) {
                    this.currentWeapon.activate();
                }
                else {
                    this.currentWeapon.deactivate();
                }
                this.currentWeapon.poll(l, this.g.x, this.g.y, 0);
                l.setCameraTarget(this.g.x + this.collisionBox.x + (this.collisionBox.width / 2), this.g.y);
                this.socketHandler.updatePlayerPosition(this);
            }
            else {
                //Is online player
                //persistent force
                this.addForceAngleMagnitude(this.online_persistentForceDelta, (1 / 13) * this.online_persistentForceMagnitude);
                this.online_persistentForceMagnitude *= 0.9;
            }
        };
        human.prototype.setPersistentForce = function (delta, magnitude) {
            this.online_persistentForceDelta = delta;
            this.online_persistentForceMagnitude = magnitude;
        };
        human.objectName = "human";
        return human;
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
                function (xp, yp, input) { return new block1(xp, yp, input); },
                function (xp, yp, input) { return new normalBullet(xp, yp, input); },
                function (xp, yp, input) { return new human(xp, yp, input); },
                function (xp, yp, input) { return new socketHandler(xp, yp, input); },
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

    var grassFilter = /** @class */ (function () {
        function grassFilter(polygonPosGlslAdapted, spacingConst, grassPerLine, minGrassHeight, aspectRatio, filterAreaWidth, filterAreaHeight, filterAreaX, filterAreaY, height, windowHeight, width, windowWidth, myLayerIndex) {
            this.grassShader = "\n    precision lowp float;\n    varying vec2 vTextureCoord;\n    uniform sampler2D uSampler;\n\n    uniform float yPolPos[{yPolPosArrayLength}];\n\n    uniform float time;\n    uniform float windWidth;\n    uniform float aspectRatio;\n    uniform float cameraPosition;\n    uniform float cameraSize;\n    uniform float grassWidth;\n    uniform float curveStrength;\n    uniform float extraCurveStrength;\n    uniform float fadeSize;\n    uniform float MINGRASSHEIGHT;    \n\n    uniform float grassMaxHeight;\n\n    uniform vec2 collisionPoints[2];\n\n    const int grassPerLine = {grassPerLine};\n    const float SPACING = {spacing};\n    const float SPACEBETWEENEACHBLADE = {SPACEBETWEENEACHBLADE};\n\n    float randFromVec(vec2 co){\n        return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);\n    }\n\n    float distSquared(vec2 A, vec2 B){\n        vec2 C = (A - B) * vec2(aspectRatio, 1.0);\n        return dot( C, C );\n    }\n\n    vec4 generateGrass(float polygonYPos, int lineIndex, float lineStart, float topYPos, float heightDifference){\n        if(abs(heightDifference) > 0.04){\n            return vec4(0.0, 0.0, 0.0, 0.0);\n        }\n        for(int b=0; b<grassPerLine; b++){\n            float grassBladeX = lineStart+(float(b)*SPACEBETWEENEACHBLADE);\n            if(vTextureCoord.x > grassBladeX-grassMaxHeight && vTextureCoord.x < grassBladeX+grassMaxHeight){\n                float grassBladeRandomVal = randFromVec(vec2(lineIndex, b));\n                float randomBladePosition = grassBladeRandomVal * SPACEBETWEENEACHBLADE;\n                grassBladeX += randomBladePosition;\n\n                float relativePosition = (grassBladeX - (float(lineIndex)*SPACING))/SPACING;\n                float grassBladeY = polygonYPos + (relativePosition*heightDifference);\n                \n                float collisionForce = 0.0;\n                for(int i=0; i<2; i++){\n                    \n                    float distanceFromGrassBladeToCollider = abs(grassBladeX - collisionPoints[i].x);\n                    \n                    //Alternative WIP formula for collision(go to desmos.com): 1-(cos(log((x+0.008)^3)*1)*0.5)-0.5\n                    if(distanceFromGrassBladeToCollider < grassMaxHeight/3.5){\n                        float distancePercentage = (distanceFromGrassBladeToCollider/(grassMaxHeight/3.5));\n                        float distanceToCollider = grassBladeX - collisionPoints[i].x;\n\n                        float distanceToColliderY = abs(grassBladeY - collisionPoints[i].y);\n                        float distanceToColliderYPercentage = 0.0;\n                        if(distanceToColliderY < 0.02){\n                            distanceToColliderYPercentage =  1.0-(distanceToColliderY / (0.02));\n                        }\n\n                        if(distanceToCollider < 0.0){\n                            collisionForce = -2.0*(1.0-(cos(distancePercentage*6.3)*0.5)-0.5);\n                        }else{\n                            collisionForce = 1.0*(1.0-(cos(distancePercentage*6.3)*0.5)-0.5);\n                        }\n                        collisionForce = collisionForce * distanceToColliderYPercentage * (1.0+abs(heightDifference)*75.0);\n                        break;\n                    }\n                }\n                \n                \n                float grassBladeHeight = grassMaxHeight * grassBladeRandomVal;\n                if(grassBladeHeight < MINGRASSHEIGHT){\n                    grassBladeHeight += 0.01;\n                }\n                float grassHeightStrengthModify = grassBladeHeight/grassMaxHeight;\n                float grassTop = polygonYPos - grassBladeHeight + topYPos;\n    \n                \n                float yPosOfGras = ((vTextureCoord.y - grassTop)/(grassBladeHeight));\n                \n                //Apply wind effect\n                //Wave from top to right\n                float windStrength = collisionForce + pow(cos(time), 2.0);\n                float steepSlopeSwayLimit = 1.0;\n                if(heightDifference > 0.01){\n                    steepSlopeSwayLimit = 0.3;\n                }\n                float offsetCurve = (1.0-yPosOfGras) * curveStrength * (0.9+windStrength);\n\n\n                \n                vec2 grassBladePoint = vec2(grassBladeX, grassBladeY);\n                    \n                float distanceToBladeStartSquared = distSquared(grassBladePoint, vec2(vTextureCoord.x, vTextureCoord.y));\n                float extraCurve = (distanceToBladeStartSquared/(grassBladeHeight*grassBladeHeight)) * extraCurveStrength * windStrength *  grassHeightStrengthModify * steepSlopeSwayLimit;\n                \n\n                \n                \n                float bladePosition = lineStart+(float(b)*SPACEBETWEENEACHBLADE) + randomBladePosition;\n\n                float grassBladeLeftSideStart = bladePosition + offsetCurve + extraCurve;\n                float grassBladeRightSideStart = bladePosition + offsetCurve + extraCurve;\n\n                float alpha = 0.0;\n                \n                if((vTextureCoord.x) > grassBladeLeftSideStart - grassWidth\n                && (vTextureCoord.x) < grassBladeRightSideStart + grassWidth\n                && distanceToBladeStartSquared < (grassBladeHeight*grassBladeHeight)){\n                    alpha = 1.0;\n                }\n\n\n                if(alpha != 0.0){\n                    if(grassBladeRandomVal < 0.2){\n                        return vec4(0.12, 0.42, 0.01568627, alpha);\n                    }else if(grassBladeRandomVal < 0.4){\n                        return vec4(0.4196, 0.6078, 0.1176, alpha);\n                    }else if(grassBladeRandomVal < 0.6){\n                        return vec4(0.5529, 0.749, 0.2235, alpha);\n                    }else if(grassBladeRandomVal < 0.8){\n                        return vec4(0.448, 0.5509, 0.2019, alpha);\n                    }else if(grassBladeRandomVal <= 1.0){\n                        return vec4(0.425, 0.6509, 0.1019, alpha);\n                    }\n                }\n\n                /*if(distanceToBladeStartSquared < 0.000001){\n                    return vec4(0.0, 0.0, 1.0, 1.0);\n                }*/\n                \n            }\n            \n            \n        }\n\n        return vec4(0.0, 0.0, 0.0, 0.0);\n    }\n\n    void main(void)\n    {\n        /*float distToPlayer = distSquared(vTextureCoord, collisionPoints[0]);\n        if(distToPlayer < 0.0001){\n            gl_FragColor = vec4(0.12, 0.42, 1.0, 1.0);\n        }\n\n        float distToPlayer2 = distSquared(vTextureCoord, collisionPoints[1]);\n        if(distToPlayer2 < 0.0001){\n            gl_FragColor = vec4(0.12, 0.42, 1.0, 1.0);\n        }\n\n        float distToPlayer3 = distSquared(vTextureCoord, collisionPoints[2]);\n        if(distToPlayer3 < 0.0001){\n            gl_FragColor = vec4(0.12, 0.42, 1.0, 1.0);\n        }*/\n\n        float distanceToCamera = abs(vTextureCoord.x - cameraPosition);\n        if(distanceToCamera < cameraSize){\n            for (int lineIndex = 0; lineIndex < {yPolPosArrayLength}; ++lineIndex){\n\n            \n                float heightDifference = yPolPos[lineIndex+1] - yPolPos[lineIndex];\n    \n                float relativePosition = (vTextureCoord.x - (float(lineIndex)*SPACING))/SPACING;\n    \n                float topYPos = (relativePosition*heightDifference);\n    \n                float grassTop = yPolPos[lineIndex] - grassMaxHeight - abs(heightDifference);\n                float groundY = yPolPos[lineIndex] + topYPos;\n                if(vTextureCoord.y > grassTop\n                && vTextureCoord.y < groundY){\n\n                    float lineStart = float(lineIndex)*SPACING;\n                    \n                    if(vTextureCoord.x > lineStart - SPACING && vTextureCoord.x < lineStart+SPACING*2.0){\n                        vec4 grassResult = generateGrass(yPolPos[lineIndex], lineIndex, lineStart, topYPos, heightDifference);\n\n                    \n                        if(grassResult != vec4(0.0, 0.0, 0.0, 0.0)){\n                            if(vTextureCoord.x < fadeSize){\n                                grassResult = vec4((grassResult.x), (grassResult.y), (grassResult.z), vTextureCoord.x/fadeSize);\n                            }\n                            gl_FragColor = grassResult;\n                        }else{\n                            //gl_FragColor = vec4(0.0, 0.0, 1.0, 0.5);\n                        }\n                    }\n                    \n                }\n\n            }\n        }\n        \n\n        \n        \n    }";
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
                console.log("obj.sameLayerCollisionOnly: ", obj.sameLayerCollisionOnly);
                console.log("if ", obj.layerIndex, " == ", this.layerNames[layer_1]);
                if ((passedMyLayer && obj.sameLayerCollisionOnly == false) || (obj.sameLayerCollisionOnly && obj.layerIndex == this.layerNames[layer_1])) {
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
        objectFunctions.prototype.checkMouseClick = function () {
            return this.roomEvents.checkMouseClick();
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
            this.bufferedClick = true;
            this.mouseClick = false;
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
            this.container.addEventListener("mousedown", this.mouseClickListener.bind(this));
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
            if (this.bufferedClick) {
                this.bufferedClick = false;
                this.mouseClick = true;
            }
            else {
                this.mouseClick = false;
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
        roomEvent.prototype.mouseClickListener = function (e) {
            this.bufferedClick = true;
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
        roomEvent.prototype.checkMouseClick = function () {
            return this.mouseClick;
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

    var gameStartRoom = "N4IgxghgtgpgThAQgewK4DsAmBnAGiALnVQBsSAacaeJNLbATUOLMslgRQxwHUBLTABcAFs1IUqHWt2wAJGHwDmwwWNYgARhDABrRXDqYAwshLI4hEAGIYADjt2QlEhACe8ACIRBEQgG1QWB8AeQ0AKxgwQWwASXQAGTd4f1BBPhIYNQk+bBMoDT50bz5kdGCAMwAVdJhsQnKIEmwYSgEKgGUfNLBqjLyCorTSyycQHIAFCDhBCv7C4uGCBqaWkEFXAAdMggAGVvQN1EFOuELFEcpFGGQoceRC6P8AXUooHOwzmKgIK8JgAF9KAAPQgAWgATABWABslFcYOhABZKEVYJYNGZdABGECA1I1LKtXI3AYLMpVGp1JaNZqtTAdLp8Ho1OaDEroC5jbCTaazEnzIYc6krSjrLaEPZjA5HE5nTlXG53B5UvwvEBvbAfdCKL4-bYA4FgqGwkDwgigpEo6jozE6HF4tYEojiImsskVXq1eo01ZtcqdYrMvr8tmLECjCZTGblN2C70itabbaSwqHY6CU7a+XXW73dCPAiq17vT7fX4EA0gEHm41whHIkCo7aaW328j4jKErmx9keynx2ljen+xlBmA9sMR7lRvn5AXsgerMXJ-Zp2VZgjhy45pX5lVqjVanVl-WAqtGmF182WxvWzcY5DY3Htx2d53qHIT8meqnLQd+gNuk9L9OUjXkYxDMlF1FJMJVXGUMzlTdRgVXNlWeYtNVLPU-jPasIUvU16ytNF71bZ8O22FhsmJOdQ2-fthX-YdAKZYDILjZCiR5aMQKYpdYN2eD00zc4uJAVDdwLIt1RLbVdXLSt8NrIjrwbJsbUfO0KNfKiXW7DjewpDJfx9OkGUDdi6Kg8SwN4wzFj-ATxSEqU10Qjctwknc82kg85OPHCKzwi8TTNC11LvFstLbSiu0-ByGJM6ChwsoCWUS0Dp3AvinJglyU2lESkK8yTfP3TCjwU09DRrQjwpvDSyJinS0jfajXUSvtkv48yR0sjLrM4ry7NnUlOLyxMCuE9cxNKnz0MLfysPkk9cNqgiwrg29SOip8HTavSP1o8ajJ-FKANHKzTsnbiZwgoaF16qaVzchDROzRVyow2SVsCxSQrqrbXKavbtIOp0OoMx7Sm6r1nsugbgxhoURuy+yUZS5dttTd6SpQha9x+w9sIBjaVLNSVQYffaX0O+KTvnWHjPhybEfS5GbtRqceLGpmhUm7HXNx4rPIJr7FpkknVqCpTQqvKmopp8G6ch-SEpRuHTITdm2MGrmst5h6DeeoXCvcj7xLKyXlqqtbgvJ+rtup8iIfa9XGforWLpYq79f5w37tysyXpxorZs+tCiaWyrSZq88gYVkjm2V2LdIZr9vYR32kfHTLbPRvn6KxwTzbxsXtwl6OpYC6r1oTzak52lPXdV93jszlnteYtK9c5gOC6N4OEzNmaPLm8Wo782OZbJhuKedpXW7i98aM787s97sc+LRof88F0ux8t+aq+n367dlwHG9UxXdtT1q1Y7rqu59rfroH3eg-3kPR7e0WJ8rlPCq584712Uk7EGS8WpuyOmvZ+G82Y5w5nnTGg8v6oIPtNP+EcraEzPtLf68dwHA1vi3aBbdYGdU1i-Te-VkE7x5ugk2mDXoixwSfIBxNa72zlonG+ydNK0xXlDDWXMs6ILfv7YuaCcrfxHofbB49I5SWAQQuuDt54QNIYIlWwiPbr0YhIuhfcUEm0-rIjBP8FFsKUbg0+qjuGX0dsDRqUChHp1XlQsRNCjGsW3vncxGNmFWKwTY4+k8VFcL+uo3h18zSuLvsvDxIjPbuh8SHXW-jUGBKLjZFhYcLb40AZEmOIDZ5EPlqpBJZD3H008dDbxCCMlIJMQwu6FjgnyNCeHWxHCSk12iTwq+C8CDVJ0WnOpKSDE9V8X7fu0icnGwHvk4WPTwnFO+qUtRQznFXjGc1Wpj84HUKaTrFpWSzGMI6cskJrC1lFO8vYqJF857EL2ZFRJ5C9FPxOYY5pkj5k2UWcPQcv8wkPOttXW2oCNFvKqR8mpujkn6PgX8s5ALTEfyuUEm5XS7mFIro8zhWzHGvMqfEhF4yH7t2OY0tFPdjEXKxe0nF0iVll3-sozZAyXkVL4RSgRBykWTJRb8mZ-zGXvwWdi3JE1bkFPLgAol-ToXlLAeSwg+ywYTKOV4-m4iJV+KlUCmVSy2XytWQSpVkL8Gkr5XEzVlKhU6ppXqr26T0WSqkSallsqnrsqPhCvBDjBlOM0S4p12rqWUIafqj1DKjXeuGqakFzl8WKq5TbGehD1X8sdYKqNMCM6ovFZ6xNgLk2+rNXki1HL2ERO5aqnNsKNWjMjffIt9TRFxtOQmuZmLpVVtTfldNnK7HEp5TC2JIytUdoocWsVrNDX9raVyPeli8UKrHX0xt2aYnDIgbOpJIqfl0tLX23Oq7RrVrlZuy1Gbx0qr3Ts8N7yC1zu+bSnt9LfTnONZWtdTDcWgusfcwlNqQ28tzQ6tt77j26tje63tv6MVXsLje-1tbA3geDc8qdB7gZYnBLYODXzkWnu-eelDXqK1PWBXIkD3SrWZqhc+sNcKzREZI83KlnapklqXWWldASU0MbTVu+tGys1lObdOiBXHSOHNdYhtJyG+rloHT6wD1zzV3rrb0ht0ntnsdbQpnjzro0LrPYJi99CRNDrEyOiTBmpOsZk-u3ZqkzMuzIyer9SGf3qeE9k0TG7GOjsk8q3d7mX0ccIN5txwqEPdoC1RoLl77PadZTWvT2HrW4ZJaGsleaCAJc+UpmNKXVOBdSjRzTAHr3DtDve7dhm3PGeKzBsriKXWVdSYKA1QmMshYc2F8TLXIsQbw2qltJXuu8fnV2-rZ0auZP-XR0LnTwvOfWVFozdroMjPmxZvjorrPd2oxptD66tvjf07tqbhWoOza68RxTSXlNVYG-Gy7wXLmjdu05ibLm9vtYOy9o7b3zOFsW-xxdF30t2ZG1lv1jksOKIewVydM25OEahz5irVnKM2d+8N-7KOMNo9yxjoNTynv4c85x-HiXetE9SyTxHrTMuNcc81+7tOJ1No86+rzzPysfb69MjntWrvc-Q01sFYH8t0+x7JgjV5jsw8-W66raWZd-eZRThXoHmOPuix1+1kPuME4l2z3X0u1tJo2wD4Dd28ssdtUVy38mxc9cs0tqXCP9dk8NzzsbQP+c4ZV0L2LpnfcLe1yp77ang9I-J2HwHfP3dm-217w7Pvrcs-93D87r86vXaA7p7bwPMfR7Y51q373WcB4E0Hx3tHbpG954r03O7c-Pdxxr+PJ3YdneJ23v9TvO8Z9dxH7Pfewd54hwXpvxex-s4n6huXN3Z9Z5p1HwX9fvd48L+L5vJfx9l9l8jmfVe3f7+V4fmLJm5vD61+R-z9vN-l+35XnL1fI9H8n1n8G8V9ocP0P8ddk9VtJ8O9uYXc7858H8PdIMGcRcmdT8-dTsKMN8r8DdB0u9w899wUD9gCLd89CMABOcEVfbAz-aAvXdverZ3QgzPHvB9BfT3AfdXLzag2g0fHAr-PAkPAg2-f-e-EgoA83cHQfXgmg8A+DT7ZbZmFPJgivHTcQpAyQlA6bNXRneLPghQ3zZLZQpKB3WA5g6feXbvE3DgtrLgtAuLUrQwm3c-dfIQ2ha-dPawog9g1rVzBwnHQGG8AVIwwnFveHYQtPUPHwtg2w-w0HQIvQhOEI-NMI23CI0vTw-ArTMQ29AA+few1AoI2qVI2DdItwwQhg8wrfG-WI3fPwybLHGPF-Moo9YwpQwPKIrnOonfRA4gpXHQ+nEolIhsUI1wtfKolbRgiw9Q7LfIiQwYnPRfbg2qMzcYovOgqA6Ymon-Xov-BYrQpYzg4o5I6sMozXCAvzbYlQmA2o7wvozQgY3vIo3Q4XfCdYwgAAZlsHbUUMl1b26KZVEPqP6MaJB0e1V3eLBE+IIB+L+I6IBMiOyJENyNBKePBNryf3IJe1hPhP4MTy+x2O-y8JiMeMOOeLsICNOOhPNDxN+IJMgKT2JKBPWysPJMw2p20OWKSNpNBHpIRPCIv1wJROiJBI5KpwKOQJ5JpNjzpKhzNHxIqMmPoJZNFJ6IeIOM5KlO5JOLeLlP5IVO+IZOVK2OZNuJmPuLJK1MlMWJeOpP1Jf0NO40VJNImLNKJItN2NJPFJtIFnR11NeOGLOJhKNLhLdM2IENVK9JJJyIa3RIpMxIFzIJkKvjKKVPdKjJuLMNjNRPjIlP9K5OOKDKhINPTIjLPxVOzMG1sw1OtI0MTPiKaLrxAPtXLMFIyOFI8NmTzJYLyO1LtKpMSNlKdPbMZOuPNJzNZKn3gNYIaKbIhOaKP2gzHNNKzMnJrNJzFLRILJLiYyHMhJaM61XMzMJNMM3M52BJ3L9L3Ii0XJbJxNiRPMjLPK6PVKvPzJvNNgXKxJTKXyfLGONI7MqOjKnPfLZNnP7NtKOPtOHMdOPMAvDOAqrI3J+0vIgsDgbIHJgoPKXNbNzUlFdOQo9PPLQtTzrN9KwugspISMPOXNm0IqAvHJMLfJ7O3M-KosLJ1OLIdODNpMYqQuYs6MBPApnMwvmOwpoubOxNTNqgEozJfKZM9LArYoouvM4tvJ22TOkP-MBnkorKwPXOUovPIo-L7ITMkqTNIJ0tWNGKvAUsrJItYuXV7PZK-IDWlL1L4rlOfMcqMtItUNmN-w0u-P3NorwsfMBgFKEqRKyNUrMrcpCo8sDN4tLJf2irXNfJEviowpkQkuoqsqkP70cPizDIcsMqyuRJyrErytRy4sHPCofNkoTgytPKUoCruL2M1KSoDJ4rgu8vSrKoMoT3aucqG3YvMt3NCrvN-JspKtKyGuIv8rGtrISsgosoKp-O0uKpGOrCxEMKIpirt2qNzImsSvyvqpwsapkt0rWIOqYsytGuypcrOvWqmuSr6rovwtm32vkMOseonOMrIrUOCous0pr22pWPmt+vsuGpH0qriperUo4rBumq0usp2pDOcL+oerasBo6stK6vrNRo+tgq+sitqhGXKpGvxpWq3ORsmvct6rJoiuaurCprhvf1puevGoZvOrqvBsAKGLSuKw5qWoRsv1ErgPEoFrRohoxqht2sIDFqOsyMluqultqsp0uqkvvJutsvZogWpvhqeqqqRrWplu1sFsKNSqPL5S+PBH0vFtNsRt5otq1uNzCukr-INu+Mdthudu5rNrdtyvo18K2oVt5LlIdqdtVq7JOunM1rDriK9r1p9vmpjoDrjvcITqlssLeqZqLJZqatuoTkztUmNq5pYp5tWtDs23nNTtmsxtpPLv+rxuruDtrpquTobpmshqjpf1btxsUqDtdq7qTvrrBIjqKsVqxqVLbpHo7rHvpvdp7qnsbv7pHOK3nuHr8olpFI1vzsts9r7sjq3vtpNIXr3pdvVvNrroQIxOnuFrttzR3sEoBqXtvpDu7snsfo3rPvgovsQsrquM-oPrvp-ofsbP-pnoHu3svt3oqpvvAe-onqgcsqfplMAdfoQffvbuEs7pXvvrnPXtPtgfPpweAc5tAYIeXvQsgZIb-rIefvot4URERBdMQZprAe7IgbQcYegeYawYGuK3Yc4bwcXtoa-vHqPo9psJgZYe+rYY4azo-qkZQZkbmNltJtwpLt9oIDEdUfwdiukaIYYagp1sKsUYpoTkMYruof+OOrVMPq0atrlqFuEZFr5TsavqQdHtMfof4Ysets8pLJftmx8a4ZNv8Y0bMaCY2sscwa8q8dzUiYkevpid4dQdkbXqYfRvIewYiZUfscDp4dzpcdBu0eZt0f1vmrSZAccbVticCZyd-sEfyesbZsIHqYccRKcZjMTtafQc2oUc8fCd4UhCIyMckZMeadMuIeCfcZtv6pSdm0mZxvSb8bKecb4aGYEYwdGeSfGcBnWemYye2YGbztcZPo6bGdYeCMRAEpUmMf6ZUt2eufkaEaOfudKMeavGeZmdeZMpBv2J6qLpqfTqVrbSecIheaaayc0cqbcZ0eushaxqRAEphrUdmYRbib2cWZRe9rmqhYxY1xcMBfhfKfeaRZufloKZEb5VJbkOzqmMuYqdBZJuqdReJfRb+eZexaBeBqCo5aqfBe5ebp8r5YwJZdAuBeFe6s5bFaJYldaKldKswO4fUdxZaY+fDsObCZ+dGMxbfxoZxapeyd1ZTq+YNaUYeYEvaKFJzp2YtZpc+due+dtd+ftdKa1fNcRZFeRa5eVdntpKZY2POd9edf9YVdFe4uLtqZJbVcgQjbNajbxctd7vdZtZsfOKTe0WiYubeZdYDdpY8Y9ZzcdQEoihlerKFatMosVbjYhZ5dDaTerYFcpbTZ1ddb1etdtsNdzarYdc7KdbZepZLbdbpc6dLsHavHbbhfjq7fmfMYSZCZSpWeOa9bneHZAtrcCvrfUsbYauDbgcZbbZ3ZQqBv3aJobdjePbTpbclaHZ9dTbHeLZjcDaVYfZVeKzDeIg7cXbfejeJrvaupPYodmz-bUhrdQuvZ9MPdA91qbpDafbncuMacA6LeA9vc-abfFZQ9VarfQ76c7aA-TZ7atazf7c9aNbQ5NYw9Haw-I4nd7ao43YHcrbo41YLcjbI+7ZY8o6nbuZo9ndUmdJg6vc6vg5RsQ6seE4reha44k4Ju9LjMZrBbw-A8KYmYAHZgZr4F3GO5WD2ZPcP73kPT3c1IQ9O52AWU3BW4O1P+azOwPv2CPitrP9O7OtneOmP+OP3S3lnyaumCBPPbPYWKXMPjOb2EOXOkPN7tOTmbOxPvPNXX2-Pl34n3qg23PLO1nkvwpUueP0vovpP1Oj3XOLOIPdOvOIv7PSOMuQWAvJ2y3s2QuwuUu6ufOSu62YvTPAvQnqOFOOvCuuu0uHOpOnOC6NPzOEuGWrOCvKlDPWXGv5WQO4u5Py32vFu+FlvZXeuyvnOBv13guZ3CARulvIujODupvj6WugvWazvQuduDOruVvSvbu5HWOhOtunuLvdu3v9vHPXLpuKv4uAH5v8vauTQ9u93JuQe7vvvWuhvtvoflO6b-P1vjvPrHv9H-vXv6uoubuEevvBPkf2ORPOPOuYfAe4fCbDvQfZOkm2unuoOCfuuJv6fPvcn2mfuWf9G2eiuq7fOPuSeeeDm+2KeFPBexvivOfVOxe2mJe2PTuBe22hfTX5fTq+bGeNvmeUfWf1fZfheevgfXrEeyeHu9H5qZeafCfruzedeLfM2+eDe1eq2NeGP3vifzfSeXfyfVf5qdOdhEL2fxuGvRfffxeRnJfA+oXg-Q-PeSOifHfV6leY+Vfceg+Q-wu7eOeI+fene-fSHM-rf4+c-qf0ea7mPmukereE2saE-c+q-CHMecPsf420XaSm-K+AOHf4eo-0-En9W3fs-E-jfNeC-U+FnV2lnBupeQue-Ru8-w+U+B+i-o-h-Y+s-y-x+V+5ep-1+0-hmt-S+G-u+K-l+W+6HMv8XZ-CXcvqvAYl-Lv7fvfp+V3suv2qvEvaoX+Ae3+QPI-jPy-6adH+v-BOHp3EZh8D+a-LnorxP5rsceZfRvtCGgFJ9HW7-YAZ-0LpgCf+kPXhFAOb598sB8AwfogLn4ncd+qA9ARPy95ACyBG-IfkgM76PsX8RA3vrD1g7YCsuuA2bhD1WaEC0BxArgZJ0YHH99mGfV3gvye4cCr+JAhgQr3IGSDT+0guPjQJEG09uB4gkAXwMq5zdBBgMWwA7U0GAC6eSgpgRQIf74DDBtUYwRsxgEm8tegzDNiXzUHUDaS9g0wfnzgEWCJBBLHLjYM3YJwvBnArQWIL8G6CZu+ggQcEOrChD5BoglTtr38H39AhBguIYQASGv8fB-fHQTgOiHg96WtgkISYLCFmDtBkQgoWD027895q2QgAbkNIFVDeBhQ2oaPyhYNDHBk-XwSkKiE1D9eMg-Rl0KxZJCMet-VwXk3cEoDPBZQ8KKMPCHJCXBFHf3vXy75ykRh5LCoREL6HVCmeI-IYfULmEwkthTQxQbsNaEDCDh6g2YQ4IWHbClhVzFYW4ID4eCNhxwukqcNX55CWhd-UAfwOKGZCCAmw+QmMOr5t9YuHfZtj+z5Qgjr+ATCYc8KmGvCZh7wu4V8NgE-CLhfwvQUUOnbDCPh-JDEU4MP75DLh+w7fqiJfxwiFB5g7EZMN54ojz+aItDsSJ6FYjlhAnVYfPxuEsixO9ws4XSM5G19LePIt4dSMJHEdMB5w4UVj3u5iiqRxWEYfR2T4cinhXIl4WsLYFKjJRKo6UUKPVEijuRVAxUbCN1HccSRvQ2Ue33lEmjmREou4XqJHbND6RSIxkVqJhG5plRFo9kS6OtGQjbRyA+0TqMdE+j6BBo9lkaM1EKjgxZo0MfCLmZNc5RdfGMesIdFKdaRlQ10RqOREej3OcYjMWCNb6Iicx7o1MdqILH8inRu7LMf6P66BjWBno2bN6ITHasSxUY3MeWKbG8IWxmYnYXWPK4Uiz+aYkMduxfbODDRyY0UXaJHGViGo440kb8IZHK9phsYr0YSIvZOVwR7YqccaKDGzj1xDgzcctW3FJibRKYmcRWMPFjjWxfrGvruOjGXjuxRgjcQuKtGTjzx04-cVeObGvjbxS7M8QGIvHfjnxdgv8X2MeGRiHxnYp8fmOvH8IIJ4wwCfWOAmNi4Jv4jZvm0tFqioJn4vcWhLy49iPhWE30TKI-FASvxBEp-mBMwn-i+OO4vCY+JAnoSiJGzY8fvTbHITBxeva4eKNHHwo6Jq3EztxKhH4dCJL4tiW+JwnjsOxZY2CeJJolvpEJp4tboxJgnMSFJpQySYJMj6WCVBLA6ESxIklKSixN-LiUdwbGGTNJ8Qj4VKOdFkTcJFE-CVZOolaSh8YY1UX6PIkoTKJLkiATZI2Z2Sax-Y7ySJMsliTXJAU9yTpML6pD-hMQwERx2BG2Tqxl7SCTJOglySNJkUrISlI8n6jaxoUiyahL8kEDjJ-LUyQiPMm69RJWnMqYpIqmLCkJqkpyUxKon+TcpgUtkeGMKmOSfJzkiKR1OSldTQRTUlScJOKm+TBp9UtyY1IeHNSJpNU8KXVJKFRS5pgo3qRlLUlZT2pM0taZxm6meSHJW01qepN2mrTOpZLUafNPGl9cwpJU6aRdOGlXSYpH-ckTxMpFriMJ-zOgUdIjEnT+pbU0qU9IaEYD7J-099plJXFMiDx301SGDOCnpTIZ206GXmOsmXT4Zv0gqSFL6n3SppK0oEaDKxngzNpyM06TtOBmEyPhCMtKQtLumTSBpBMpKUTP37YSvJuMhmUDMelUyNmNMrccWOqnO8uZTMyns9MxmszSJEM7DuTNRldijJDUs0HzJPECyWpgMs6ZTOZnUziZiMumQzyFnqzuZms3mdrNpm3S9ZxfA2SLIU4NDy6lUxMarLxmMzwBe0jGYqX9rKSVZi0-WRTMNmiybZ7su2ZxIdmczLZzskGR8NtljTPZ9MpaQ9Ktkhd-ZJEnqTjIBmOzhZYcnmfZQDlRyzJwc2OfjIzlGys5Scv6aTOllqyfZ8cp7onNek8CcRbQwYbyPTEV1s5N06OebM34GTfZ1siOa3I2kpyyZFc2WfJJyliy3ZJc7GUjPLlpzQ5QQouS3InkkyB508kOZXMLl+ze5i8nWWbO57MDKB2UoaTXI9m5yvZFsteXPI3kbNI5bck+THO9nDyD5LsseX7S3mmz25u8qwekNiHzzx5tcskfXKuGfTYZrE4uX-KXFuiH550zOQvLAXZjZJkCjWZfNAXHyqpec++VIJhk-iQFMClBfbNPmdz95UCn+VEzZnHTB5M88+RkOIWbNvh7M1OavIQXdyE5Ec3ppPN1kfz9JhCxBT3KvmsKl5U8+8SjIwVozR5NsvhdvPfkIDOF1gqhUgpKawKBxDC4RXLPRnPyaFmIuheQqUWqDMFoEhuGkwFG0KyFK8-OU7IvkKdQQBiw6Wwp3lSKAh3-WRRYqsXXT+5AiiEUPOUUjyhpli4pgdJcVGKpZgimWZ4sflPSfF4jQxRouMVBKPFOikRd4rSZKyOJd49xRQsYVVz9G4Sn6RLOTluKGJwSuJSotHlZLxZCioqaYvTnmKQuJSxWSbP5m3yO5e8mRd-NFk1LladS5WQ0o4X2K8Bji6pYko6XJKAJaCs+ekvXlOLfF7SnJaXOXkxK0lISoha0oGXTKbFki5QT0oBH4j5qbSggEkuQZBz8FTSr+YlKWWTLdlgy-ZSkvyWxKu5GS7ZcsrKUcyKls8vpU9x2V7LMmVywWaMoWXcL+lZyj5YW10lxTcR7Qw4VC3eUXLPlwyw5Z-IcUtKJl4jQFSL1in9Chxq44BVfAeW4KDld8n5YUq8VPydl181xewrsVpD4VJyxFcgsDlfKRlBC5pVSv+XiMSVASsuXMu0W3LxlzKmlTnNQWwrpFxyrZRCvqZ9y2Vsy1JZyq4VMK3loq1+fUv5V4qGVQq+TjypwW0qYVSqo5ZSuFVY1iVYqqJYEslXPLKFCKtVb-JxV0qBVGyhKbqr5JyrHl9Ck1WMqqWyqzlrKw1eyuNXoKCVoSoEfqvlWdLFVjSuFb0rNVuqWVBq0hUauuXzLfViyixW-VOaWrNVIawVTqtVVvKk1UzFNfRO+XKqM1v3TJdmv8WeqJVsaqVYyrtUGkS1jqrRc6t+Uyri1uDZNRqrzX0rtVYaplVmvdlmhW1fKvBVqtDWbLM1mSkZP2pvnBrulFKrtdWqdLjqc1baoSUOvTWzrR12yhdaWujVeqK1Da+NX8reWbq61Jin1VytdWZKsWfaxdQOtxVpqbVeI9dRCsvXndr1k6wdXepnUjqi12y59aF1fWkrbF6yz9basfV6rYSE6gDWsr0n3qwVTczrOBv-Xiq8l+aztV+rqFPqwyEGpDWSqA3xSH136jDeIyw1lrkNHa4dSBoI16qyixG7deWpQ3kb8N6GqjYhRo2Syd19G1dWho6F6qh66i2jaRutXAbGN3G2krCSJFbq2NdGsjZxoo1MbRNYZcTceo5V7qz1ry-RmJsiX8acN0GoTbBr4l8oNN1i-hdppBUNzeJpo3NIZok25KTNaKj6cOKwVRUFNmmyTQJpXUwbG5+myzc5qM0SKul5KvDXpos0-UfN1mmZW5o-WBbPNwW3hBptSkKr3106qLeZq+mxbnN8WoNYloC2grotqWpzdAKClvz-NuGnLSlsxVrEFN7Ey5amqS2lagFjmirdAKq3Qr21gm5LfVr0V7VKtUkzRSevxWqbw16m7rUpu9X9bpVdyqFmJua1ArUVew+zRioa0tV7q0HXNcusi11aHNnWgwkeJ63RLRtBatdZRtE3Lb52N6q1e5t025bytS2nbSNt3Wnrxt3Kp7r+tO1vrb1tWszR1vlkJwRkr2yDcVp03tbNt32w2vp2m0oq3pAC9FbopB1TKbxq24FXZtqlPb9Gv28HabzrnLjG1E2uer2v-ZLrEdc25Heeozq4M-t2GwDYDo20Latt79ecXdo40eayti26sG-XJ0kbbNRO5aSjtJ2h90dE4p5Q9qrWgaW6ZO-nYuLgVQzsdPOqFmzvF3vjBdY24XUdujpi7dtMaxnZduZ2065d6u9jdJqZ1fbVFuuhnQbq11G7R5JuhHbNvenE61NvO+HQTpt1Q75tMO43WrtN1tbqdbuy3WTsK0Jb3t2Wz7cDvd2h9-dmWwPSVuD007YddO0MvlOM2U7TNgCkPb7rD0ZahlrWi7UDpj2h7CxZ2mrUHpT25609+et7edvW3R6fdQ0tneHsz1raPtxe6vU-Nr0Z7qtWeyvU3viUt6-dbelrQ3qL3Q7u9T01vQnr81TrB9ru4fUCNH2e7s93u6fUlNn3W7IdWO-dU2od1Vix9RWifVHq71FKa9ve7fQHor2N6h9B+nvenuP0R7T9k+u3YNs33zC+9M21fRAul0k7ZdR+ufZ3vP2EqR9X+lfZjrf3r6cdouq-d-rP1T6L9-+sPb5p31Za99v+v1Uvr91wGT9hexA1Ab-0z7UDYW1ZQDuT1IGE1IXWvWgZv0YGqdVexfaLNIN4HE9UGwg1geQM0HcDEBu-dzo-16rftyKjHf-LX0Dbu1Y6iBN0Js1J6kdHB+3U+pO0eqtNYhrnXHJl1cHhDMh1zZztt0SGH9EK5NfMLIP17Cd6hhQ5wb5LaGThdB8fQgcoP77sDSU0ECYc+FmH4Dkeyw0QYPWZK7DimwA3weAMCG51nWdwy5tEMMHxDhhyQ3qv8O6H29A+zA-fsEPbLwjDh9Ax3sgMxHfD9qeI2weiMaHYjWhnNToYSPkGkj7BkI5obCO5H49GR5w0weINvL-Dz+iHUAdLEurQjxhso-KWv16Hnd-Bx7UYYNK1H2jkR-Qy7pSMi7ejrR8Tp4fAWNH39zR0Y-GImOS6hFIBxQy0bmNO7X9UxpYz0adJ9GKjjB4YyrtVZztWNgRgg8EYLlbHisYmuxmsYaPwLpjJR47Q4Iabha1DQxrI6kdfp46CAPfG414Y2M+GRjg9L4z8YL2FHMjxR7I3PVwZMtfjkxu45sZmMv40mHXWEwsYKUAmDjHnVoyidBNRHKj+xuTXKTsM4ny9FBvY+8cBMecduJJ-7bvvxMUnMTfKf7jSYp1BH5D5xxE7+yTYsmOdchgwxyYeNykE+AAOh2BinxTEpsU1iCvA8nZDbJ-k2Ys5N8ooBopyU2qelPwpA1HR9Y-CYxOEmHRqptUxKY1NmgQTpJsE-SYhMfGXsbPWU6ob5NvGrTlJtsm2ztMnG6T5Jp04yZXKunkuqJxRSpu6NKmfTVbN0y8YdNdHld+phCqGb9O4nBjkZlVd6ZtO+mVl9B04+ycVOCnRyrpxDbyflOOmBTkJvkrabzNymMzCpypcGZTOhmyz9pgs4mcLXRmXTtZ-I9qduNS6ET2ZmM0cbrPumLDnpos9aYApVtrj8Zzo94aDPdmWzc7Mc+abxODmszxZssm2znO0mBzZxpc8ObTKrnim-p8pULqTPNmQzs5vc+OZ1Odm9TImlc6ObPPzmEzk5qM9eZzNVtnj+Bj05uarPTmTzYnN8+mY-OZmvzy5l83Oz-PmGnDi5oC9uY2hs8VD-ZiC5+ZeXfmazoFqNfWYrOFmtzzpn84kPPMdnFjV58Fcxo95QqX9+F9E1OeAs9nyh65hC4BaQtUWZzNF1kxhcbOHbjzKF-kREf70Pn-jlF6Cw3DZ4BHwzDZx80eefPUW8juxxC6asYs4Xyj8xgM4eabMSWmL9OxSweaV3iWiLJZvNtJfouyWBL+EKDvLukn1rlL7F1S-JfKL7nFdB2rjTpZvMmS8Lfx3U-xewucWmcOnYU5QV8t+X-Lvl2wJQX0uVmGLRl+sMa28sBXorlBIKyFcwtQWPLI5ofFFZiv+W4rGluy6htk1WXPLBhLED5bSv+X4rbFhy3BrUv5XCrRV3yyVbEsqXHLIF3ggVeqt+XarfFp8w1ckuVWWrNVzK06ostlWvNeV85ZCCqvVW2rbljq+VestQhRrPV4K31fMtaX6r014a7NbGtFWJrl59y8meSuYy5rPVrawRZ2scW9ripfahtbStHWKLU1oa2de+IXX5r11m5Sddyv3XwyXxS6zFeetxrCLq196z8U+tPXFrfW+yzlc6sVWPrX16Kz9crXaX-rO5-SkDcOsg3lNA18GwjZgtJtAb0NgK7DcDO3WYtiNq8GuZYsAXQrhlpK8TdUik38zrFuq5ZYhvWXab5Z8mwlbCtU2sbAlFm+hbZulWMbd16m2aB5vwXb94Joc5zcEtJsRbIl+m+1fhuC2ubMpvs7Lb5sM3BrRNpW6pGOOq2NzBlpo8hfethn3zetimwbbkvDWYTLluE9tcJt5atbFKLUwMYnPy2VritqW96yds8WXbk1hW5rY9tXgzTtFsW5aYlu7WhbhAIO2TdNvs3Kb4dh25HeEGo39t2V4TUzeGscDbL-V5a4zcxsB3VIoQrO0tbBtp287xlpNoXettomXrdt67eXYEqV37zPt2237ftv52zQjd4O2SZkvm3wrakBu5QTTPgWQ7kFjm-HfbtZDB7+N9G6Xfdv12rwQVoe44ZHs937jFt964vens52Nbbd+ewXanvJ37t29gW-7b3sd2D7Rd0G6naC272IrC9i+1XaUvH3Z7p9u+-vaXuJGFzq9rs+vavj-dN7h9zXTnub1hL-7D9puxeeOu12WdYIMBx-YKNf39ba9vu7YZ24APL7aN5+zfbruwPWj6Dx+5pZLvYOYH5oOw-g4gfkWa7rdnB+aDSbkOu7Fp0e3HdOtYqzl9D6O3RbNvIPJb+EN+uw7ptq3Xbudue2CF438PWbMd-my-dvvmgxH4Dhh4g64c-2UHIycR7zckfq2T7MjmDGo9Fvd2kHyjnh62l0e63OHsd3u0Y-sP334H7Z1yy3bduv2rH79re0Q6u0kPxj59mx87cgc3XqH7j2EiY5NtmOpHxD2ne208cuPr7bjsJ2UUCf-mNHQjnezQ4HtePvbPjqhw45kexP5HHDlewY7+siPyiETwB2buAfUHpeiFOJ8Pf0dKOCnjjgJzk4EcJPfbmTmhw09SdkW7HUDvx7TvaeROGNoT2Pb+qqfL2an5j7h+Pb2rLaRnn93iy0+Ef1PpnjTiR8E80fSOaHqj5Z+o9WeJOtHGziBDM4QdzP7HCzmR5s46f1Gunvj1pyQ-Of9OZN6zkh3I4ue8Gbb3Tm5zrq+OHPbHbz656c5od0Otnejxh9-bqcyPAXLzgXdndcfa7Y9ZDoF6Y7ye1PXr6diZng4RdBOkX4zwx5M-O5oOMX8TnZ-M6SckOoO3z7x5Q9+souy7VPYpxg5TsDPonse--uS7SeUu4bHz5l0nbpcEOsrjL2F6ooaGsvOnvzjJ-85IdCuCX1TkF-k+peFOAHPLih1c7FckvadlBSEJQVxvFXnHJTr3VQegNAj1Xmr4G4q4UfHP3n4rtVxq61etWdX9Lo+zC4t1DSsQOwcEMjZavWP7nhu1Pc69dfuvxrdr3l9C6icCvR5Lrt1za96umvcnYzkJ0y9UXhv-Xm1wN0q9FdUvoHvTv15G4WvRumnRLk56q9j18OpXozmV8i4zdDPXXlTsofa6AcL6DXSU8N9W7bMUvlX6bnp5W-BDNuvX5un10-KbcL2a3Qb4uyG6df9uq3gdpO7W9Kf1vrDosgd6pEzvDur7-Lsd09IXemmK+07vV1YeYMKcN3kdrd8u8weOu+367id4u6Pepvq77bzlwm4vebu9dUmndy4Y32TaH3VPbd-Pv1dzv93H7xTrq+-e7vqj6m-98bcJdYu43ob31125lNxnr3T909yXpg8sb4PZr5uxa8Lf3vYP2ttDzG7LfYuwXbTsD3h7zeQe1ngz7DyxpVuYvY3FH+N2G7A80eIPdH3Z488zc4er1Lbtl2245eWvO3iFGW7R4I9Qe13QIg9wYzvPof0nt7-j1R7ObSf2XBNjt-J-kWAef9VR1w9DX-dwXEXrH4l3s5IcSfdPwnxR4R7lf1P-3PBqFyO9XdnvxPVn0i5c7Td8esPjHzj3DvU-JGGTLDtYv++EumfzXfztzyh5eleeijYd3zy1X891HXnN71z4Z44+IU69rblz8p7vfufkvsXmzyu4eeUfMvzlhD4Q9Hf2fG3-70y71pPclfkP47jzzZePcMu8vDH0LwJPC-i2sLuL0rP+69siv4v6XuTwV4QlfuNPBJt61FX-fs6Vn5Htj-l5a9P7+jPHtLzPdm+1fwDbX0Ox16i97UJvKXxb31+W-NfVvrI7j718Q-VeQHDnurx4eG-eevTW3+LDt+4unfivdnmr+e6u8BeWPIn+j9B6O9cWTvzn-b1g8O-ve9+Pbspw2-ncTfrPEus7694u9lervMPhXcG-h-lOQuEnkQ3p++8zeQfl3sH+t6YcWPOvmPkz197M+ifSvUPq72BdLcU+fvYnxH6H1p+zOMPwXxLwJ9PMLfnvfLpr799B9c-wfs7vdxj4m863AvbPlVxz9U-hRxf5PoL1L-Y+c+xOcv6V-T9x-8--V+PK20V95-eu3vWvl7jr8U+8f+vIXolWzyjtkf9PBb6X8Ust9XuTfS34H5r5sMO+n3EW275F7G8J3zQVvqbzb8w92-vFbPY3-h-V8GelfqiiKM+x6+A+4ffPxn60tD98sbvEXzbz74nv92hfP7kX28pT9x+4vCf-Xwj+T-ntU-DXh1+d-R81Gxj-v7Z9N8j8rfQHdfx3+H4V+yfzfLfhwfX+BcR-bfUf4pe4d7-Y-+-Qfwf94vx4j+JfMnhLxP6JVT+2-1vnH037x82HF-Hv145T4N-r+Xu0-+X5L87-B+F-e-pfwH5X8D-m--qtJqCH39q+O-c-q-zYZv93+6fD-s38f7CUv+z-DfwP+z-n9f+Zyrf4-+ffu-4Hervq0ps6r-qz6z+H-gAH+qUASAGj+YAS75J+iamTrQBRzof6P+a-pAFfGwAZv4RmDPlT6Jq+AZgE-OQPkh6l+Fir9rkBqXpQHV+kPjQHCGdAXt7F+vbjv6tKL2qwE8+qPon4kB1StwFIBM-kp7gBaAYIEnaPAfH4ve-AZwEWKQgYQGiWGvuIFvKYmlIFF+MgSX41+F6gprqBOXlV5o+TAYIG6BwgQf6wBYgQIGqBJgYoFy2q-hAEKcVbHoGw+mgRwHUBIXI4GmB9-tgFwBT-qLIeBNgYI52BKgfoz+BOfsB5aeULKEGE+oLhZ5ZOofE4Eo+tnrIFuBhvHOwJBZlrl5aBRgakFic6QZV6NeWQb+4Y+1gWEGvuoBnKQKBpQZp5vuWNLQGeBb-t4EWBcgSQZkB9QTAGiBqAZYH6MvGgQFVBo3qi47maQW0FYB5gZ0HNBT3IgEBBzTpf64BCnJMF9BPnpn7Vg3-lMH5u4-r4HDcrfqsGN+MwfYGo8QwdsF-+ivhsHMKPfsMEUB7ARD5FB1coSJ5Be2lX6GB1wcMIH24UHcEa6M7rn4ge9Qi8Fggbwfrovu1QeUHUiPwX77nB9AZcHC+XwVCyD2UQWn7teiVp14whBwQsF3eSwYQBIhuQWCFsBLgVcF5++jBiGvBWIbwFJBhQXiHzUBIb8FEh0gXr6uB2gdp5Xefwc+5AeZQcsYVBE3oyGe+6fgiH3eXXgyFUhGgTSG4hUIVjSY+HIVv7EB4waB58hhwRf7rBswaL5XeYfsv5j+--icHPaE3kqHn+KoccHyh6oYqEV+uvnwGkhwoaJoahBoU74MBjwWSHvuV3uB5eBowVQF0hNoaHx2hDQQ6GMBTwfSEuhpHlqEoBjodkFSh3oZC7OBgoZCERBIoWL4+hv-rKGqhuoYGFHGUYaAGNBYwSkHxhKvomHIByYf6GehzoQmHBhiQZkG0hAYUHzculITKHahR-vAFJScgmWEoh3vgMF-8pYaCHlhfoR6HWhGgpiEthWYW2EmhQppfy1h0QbK4Vuqiu751hGfg2G0cnYWOHchaIQB6EhXYe6FWhvYYRzIhg4eW4qeo8qOFrh5nsOGbhbbGKFEBygV0E28+4fyH6BBQUWE5hYRmg5DuhoSSGXh7YXyQgh-JNCBYS2AFpAwAggLIAQAWABkAWA-wGqCoQn4acC1AcQIkDuAFgKUjCAAgJgAwAOtM0CCAaQNqBUgIAMAAAAOiADYAYAAYBkA7QFsAwAmALgAYRBAAAAE0piREYRWEThEkAeETAAERDAMRFkR-wKMAuAEEQAByUUN8CFAowAABecQLBF7UAEf8BAAA";

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

}(PIXI, PIXI.filters, io, PIXI.filters));
//# sourceMappingURL=index.js.map
