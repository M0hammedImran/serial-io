"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.SerialConnection = void 0;
var bindings_cpp_1 = require("@serialport/bindings-cpp");
var utils_1 = require("./utils");
/** @description Create Serial Connection.*/
var SerialConnection = /** @class */ (function () {
    function SerialConnection(_a) {
        var uartPort = _a.uartPort, _b = _a.baudRate, baudRate = _b === void 0 ? 115200 : _b;
        this.options = { path: uartPort, baudRate: baudRate, highWaterMark: 1024 * 128, autoOpen: false };
    }
    SerialConnection.prototype.getPort = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(!this.port || !this.port.isOpen)) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, bindings_cpp_1.LinuxBinding.open(this.options)];
                    case 1:
                        _a.port = _b.sent();
                        _b.label = 2;
                    case 2: return [2 /*return*/, this.port];
                }
            });
        });
    };
    SerialConnection.prototype.writeToBuffer = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var port, inputBuffer, data, stringBuffer, outputAsArray;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("\u2693\uFE0F | input", input);
                        return [4 /*yield*/, this.getPort()];
                    case 1:
                        port = _a.sent();
                        return [4 /*yield*/, port.write(Buffer.from(input + '\n'))];
                    case 2:
                        _a.sent();
                        inputBuffer = Buffer.alloc(Math.pow(2, 17));
                        return [4 /*yield*/, port.drain()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, (0, utils_1.sleep)(500)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, port.read(inputBuffer, 0, Math.pow(2, 15))];
                    case 5:
                        data = _a.sent();
                        stringBuffer = String(data.buffer).replaceAll('\x00', '').trim();
                        outputAsArray = stringBuffer
                            .split('\r\n')
                            .filter(function (val) { return !val.includes(input.trim()); })
                            .filter(function (val) { return val !== '>' && val !== '> '; });
                        return [2 /*return*/, { data: outputAsArray, ok: outputAsArray.includes('Done') }];
                }
            });
        });
    };
    /** @description Factory Reset the thread device. */
    SerialConnection.prototype.factoryReset = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.writeToBuffer('factoryreset')];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, (0, utils_1.sleep)(3000)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.writeToBuffer('')];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.writeToBuffer('')];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @description Check the state of the device.
     * @param {WriteDatasetProps} {masterKey, networkName, channel}
     */
    SerialConnection.prototype.writeDataset = function (_a) {
        var masterKey = _a.masterKey, networkName = _a.networkName, _b = _a.type, type = _b === void 0 ? 'leader' : _b, panid = _a.panid, CHANNEL = _a.CHANNEL, EXT_PAN_ID = _a.EXT_PAN_ID;
        return __awaiter(this, void 0, void 0, function () {
            var clear, init, setMasterKey, setNetworkName, setPanid, commitActive, checkActiveDataset;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.writeToBuffer('dataset clear')];
                    case 1:
                        clear = _c.sent();
                        if (!clear.ok)
                            throw new Error('Failed to clear dataset');
                        if (!(type === 'leader')) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.writeToBuffer("dataset init new")];
                    case 2:
                        init = _c.sent();
                        if (!init.ok)
                            throw new Error('Failed to init dataset');
                        _c.label = 3;
                    case 3: return [4 /*yield*/, this.writeToBuffer("dataset help")];
                    case 4:
                        _c.sent();
                        return [4 /*yield*/, this.writeToBuffer("dataset networkkey ".concat(masterKey))];
                    case 5:
                        setMasterKey = _c.sent();
                        if (!setMasterKey.ok)
                            throw new Error('Failed to set networkkey');
                        return [4 /*yield*/, this.writeToBuffer("dataset networkname ".concat(networkName))];
                    case 6:
                        setNetworkName = _c.sent();
                        if (!setNetworkName.ok)
                            throw new Error('Failed to set networkName');
                        return [4 /*yield*/, this.writeToBuffer("dataset panid ".concat(panid))];
                    case 7:
                        setPanid = _c.sent();
                        if (!setPanid.ok)
                            throw new Error('Failed to set networkName');
                        return [4 /*yield*/, this.writeToBuffer("dataset channel ".concat(CHANNEL))];
                    case 8:
                        _c.sent();
                        return [4 /*yield*/, this.writeToBuffer("dataset extpanid ".concat(EXT_PAN_ID))];
                    case 9:
                        _c.sent();
                        return [4 /*yield*/, this.writeToBuffer('dataset commit active')];
                    case 10:
                        commitActive = _c.sent();
                        if (!commitActive.ok)
                            throw new Error('Failed to commit active dataset');
                        return [4 /*yield*/, this.writeToBuffer('dataset active')];
                    case 11:
                        checkActiveDataset = _c.sent();
                        return [2 /*return*/, checkActiveDataset];
                }
            });
        });
    };
    /**
     * @description Check the state of the device.
     * @param {string} type - Type of device.
     * @default type 'leader'
     */
    SerialConnection.prototype.checkState = function (type) {
        return __awaiter(this, void 0, void 0, function () {
            var cmd, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cmd = 'state';
                        return [4 /*yield*/, this.writeToBuffer(cmd)];
                    case 1:
                        data = _a.sent();
                        if (!!data.data.includes(type)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.writeToBuffer(cmd)];
                    case 2:
                        data = _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, data];
                }
            });
        });
    };
    /** @description Start IPv6 interface. */
    SerialConnection.prototype.startIfconfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.writeToBuffer('ifconfig up')];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data.ok];
                }
            });
        });
    };
    /** @description Start Thread. */
    SerialConnection.prototype.startThread = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cmd, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cmd = 'thread start';
                        return [4 /*yield*/, this.writeToBuffer(cmd)];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data.ok];
                }
            });
        });
    };
    /** @description Check Ipv6 addresses. */
    SerialConnection.prototype.ipaddr = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cmd, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cmd = 'ipaddr';
                        return [4 /*yield*/, this.writeToBuffer(cmd)];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data];
                }
            });
        });
    };
    return SerialConnection;
}());
exports.SerialConnection = SerialConnection;
