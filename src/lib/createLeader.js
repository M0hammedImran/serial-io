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
exports.createLeaderNode = void 0;
var utils_1 = require("./utils");
// Master Key: 1234c0de1ab51234c0de1ab51234c0de
// Network Name: SleepyEFR32
// PAN ID: 08ae
/** @description Create a Leader Node */
function createLeaderNode(serial) {
    return __awaiter(this, void 0, void 0, function () {
        var retry, state, getDevices;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    retry = 0;
                    return [4 /*yield*/, serial.checkState('leader')];
                case 1:
                    state = _a.sent();
                    if (!!state.data.includes('leader')) return [3 /*break*/, 5];
                    return [4 /*yield*/, serial.startIfconfig()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, serial.startThread()];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, serial.ipaddr()];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    if (!!state.data.includes('leader')) return [3 /*break*/, 8];
                    console.log("\u2693\uFE0F | retry", retry);
                    if (retry > 5)
                        return [3 /*break*/, 8];
                    return [4 /*yield*/, (0, utils_1.sleep)(500 * retry)];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, serial.checkState('leader')];
                case 7:
                    state = _a.sent();
                    retry += 1;
                    return [3 /*break*/, 5];
                case 8:
                    if (state.data[0] !== 'leader') {
                        throw new Error('Serial port is not connected to a Leader Node');
                    }
                    getDevices = function () { return __awaiter(_this, void 0, void 0, function () {
                        var deviceData, output, devices, i, device, _a, res, ok, data;
                        var _b, _c, _d;
                        return __generator(this, function (_e) {
                            switch (_e.label) {
                                case 0:
                                    deviceData = [];
                                    return [4 /*yield*/, serial.writeToBuffer('childip')];
                                case 1:
                                    output = _e.sent();
                                    if (output.data.length < 2) {
                                        throw new Error('No Children connected');
                                    }
                                    devices = (_d = (_c = (_b = output.data) === null || _b === void 0 ? void 0 : _b.slice(0, output.data.length - 1)) === null || _c === void 0 ? void 0 : _c.map(function (device) { return device.split(' ')[1]; })) === null || _d === void 0 ? void 0 : _d.filter(Boolean);
                                    // .map((device) => ({ ip: device }));
                                    if (devices.length === 0) {
                                        throw new Error('No Children connected');
                                    }
                                    i = 0;
                                    _e.label = 2;
                                case 2:
                                    if (!(i < devices.length)) return [3 /*break*/, 5];
                                    device = devices[i];
                                    if (!device)
                                        return [3 /*break*/, 4];
                                    return [4 /*yield*/, serial.writeToBuffer("udp send ".concat(device, " 234 ").concat(utils_1.INFO))];
                                case 3:
                                    _a = _e.sent(), res = _a.data, ok = _a.ok;
                                    if (!ok)
                                        return [3 /*break*/, 4];
                                    data = { ip: device, type: '' };
                                    if (res.some(function (r) { return r.includes('mtd'); })) {
                                        data.type = 'target';
                                    }
                                    // const port = await serial?.getPort();
                                    // const inputBuffer = Buffer.alloc(256);
                                    // let counter = 0;
                                    // // eslint-disable-next-line no-constant-condition
                                    // while (true) {
                                    //     console.log(`⚓️ | counter`, counter);
                                    //     const databuffer = await port?.read(inputBuffer, 0, 256);
                                    //     const data = String(databuffer);
                                    //     console.log(`⚓️ | data`, data);
                                    //     if (data.includes('mtd')) {
                                    //         break;
                                    //     }
                                    //     if (counter > 10) {
                                    //         break;
                                    //     }
                                    //     counter++;
                                    // }    // }
                                    deviceData.push(data);
                                    _e.label = 4;
                                case 4:
                                    i++;
                                    return [3 /*break*/, 2];
                                case 5: return [2 /*return*/, deviceData];
                            }
                        });
                    }); };
                    return [2 /*return*/, { getDevices: getDevices }];
            }
        });
    });
}
exports.createLeaderNode = createLeaderNode;
