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
exports.setGunAttributes = exports.setActiveDuration = exports.START_TARGET = exports.STOP_TARGET = exports.STOP_GUN = exports.START_GUN = exports.INFO = exports.getNodes = exports.hex2str = exports.sleep = void 0;
var bindings_cpp_1 = require("@serialport/bindings-cpp");
/**
 * @param {number} ms
 * @description sleep for a given time
 * @return {Promise<void>} Promise<void>
 */
function sleep(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
exports.sleep = sleep;
/**
 * @description convert hexadecimal to string
 * @param {string} hex string
 * @return {string} string
 */
function hex2str(hex) {
    var str = (hex.match(/[\s\S]{1,2}/g) || []).filter(function (v) { return v !== '00'; });
    return str.map(function (v) { return String.fromCharCode(parseInt(v, 16)); }).join('');
}
exports.hex2str = hex2str;
function getNodes() {
    return __awaiter(this, void 0, void 0, function () {
        var list;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, bindings_cpp_1.LinuxBinding.list()];
                case 1:
                    list = _a.sent();
                    return [2 /*return*/, list
                            .filter(function (device) { return Boolean(device.vendorId); })
                            .map(function (device) { return ({ path: device.path, pnpId: device.pnpId }); })];
            }
        });
    });
}
exports.getNodes = getNodes;
exports.INFO = "type";
exports.START_GUN = "GC,start";
exports.STOP_GUN = "GC,stop";
exports.STOP_TARGET = "HC,stop";
exports.START_TARGET = "HC,start";
// export const ACTIVATE_TARGET = `{HC:activate}`;
var setActiveDuration = function (duration) { return "HC:".concat(duration); };
exports.setActiveDuration = setActiveDuration;
var setGunAttributes = function (_a) {
    var _b = _a.ammo_count, ammo_count = _b === void 0 ? '' : _b, _c = _a.mag_count, mag_count = _c === void 0 ? '' : _c, _d = _a.trigger_rate, trigger_rate = _d === void 0 ? '' : _d, _e = _a.reload_delay, reload_delay = _e === void 0 ? '' : _e, _f = _a.range, range = _f === void 0 ? '' : _f, _g = _a.bullet_id, bullet_id = _g === void 0 ? '' : _g, _h = _a.respawn_count, respawn_count = _h === void 0 ? '' : _h, _j = _a.respawn_delay, respawn_delay = _j === void 0 ? '' : _j, _k = _a.haptic_level, haptic_level = _k === void 0 ? '' : _k;
    return "GC,".concat(ammo_count, ",").concat(mag_count, ",").concat(trigger_rate, ",").concat(reload_delay, ",").concat(range, ",").concat(bullet_id, ",").concat(respawn_count, ",").concat(respawn_delay, ",").concat(haptic_level);
};
exports.setGunAttributes = setGunAttributes;
/*
    const setGunAttributes = ({
        ammo_count = '',
        mag_count = '',
        trigger_rate = '',
        reload_delay = '',
        range = '',
        bullet_id = '',
        respawn_count = '',
        respawn_delay = '',
        haptic_level = '',
    }) =>
    `GV:${ammo_count},${mag_count},${trigger_rate},${reload_delay},${range},${bullet_id},${respawn_count},${respawn_delay},${haptic_level}`;

    setGunAttributes({ammo_count:15,haptic_level: 3})
*/
