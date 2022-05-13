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
var cors_1 = require("@fastify/cors");
var etag_1 = require("@fastify/etag");
var helmet_1 = require("@fastify/helmet");
var fastify_1 = require("fastify");
var fastify_blipp_1 = require("fastify-blipp");
var createLeader_1 = require("./lib/createLeader");
var SerialConnection_1 = require("./lib/SerialConnection");
var utils_1 = require("./lib/utils");
var app = (0, fastify_1.fastify)();
app.register(cors_1["default"], {
    origin: '*',
    allowedHeaders: '*',
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    preflight: true
});
app.register(fastify_blipp_1["default"]);
app.register(etag_1["default"]);
app.register(helmet_1["default"]);
var LEADER_PORT = '/dev/ttyUSB0';
var BAUD_RATE = 115200;
var serial = null;
if (!serial) {
    console.log('init serial');
    serial = new SerialConnection_1.SerialConnection({ uartPort: LEADER_PORT, baudRate: 115200 });
}
// (async () => {
//     const port = new SerialPort({ baudRate: BAUD_RATE, path: LEADER_PORT });
//     port?.on('data', (data) => {
//         console.log(String(data));
//     });
// })();
app.get('/healthcheck', function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, { ok: true }];
    });
}); });
app.get('/gun', function () { return __awaiter(void 0, void 0, void 0, function () {
    var config, target, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                config = (0, utils_1.setGunAttributes)({ ammo_count: 500, mag_count: 10 });
                target = 'fdde:ad00:beef:0:b72c:ffff:8c18:cfa';
                _b = (_a = console).log;
                return [4 /*yield*/, (serial === null || serial === void 0 ? void 0 : serial.writeToBuffer("udp send ".concat(target, " 234 ").concat(config)))];
            case 1:
                _b.apply(_a, [_c.sent()]);
                return [2 /*return*/, { ok: true }];
        }
    });
}); });
app.get('/target', function () { return __awaiter(void 0, void 0, void 0, function () {
    var config, target, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                config = 'GC,start';
                target = 'fdde:ad00:beef:0:d526:a15c:d9ab:84ff';
                _b = (_a = console).log;
                return [4 /*yield*/, (serial === null || serial === void 0 ? void 0 : serial.writeToBuffer("udp send ".concat(target, " 234 ").concat(config)))];
            case 1:
                _b.apply(_a, [_c.sent()]);
                return [2 /*return*/, { ok: true }];
        }
    });
}); });
app.get('/devices', function () { return __awaiter(void 0, void 0, void 0, function () {
    var leader, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!serial) {
                    console.log('init serial');
                    serial = new SerialConnection_1.SerialConnection({ uartPort: LEADER_PORT, baudRate: 115200 });
                }
                return [4 /*yield*/, (0, createLeader_1.createLeaderNode)(serial)];
            case 1:
                leader = _a.sent();
                return [4 /*yield*/, leader.getDevices()];
            case 2:
                data = _a.sent();
                return [2 /*return*/, { data: data, ok: true, statusCode: 200 }];
        }
    });
}); });
app.get('/devices/:id', function (request) { return __awaiter(void 0, void 0, void 0, function () {
    var id;
    return __generator(this, function (_a) {
        id = request.params.id;
        // const leader = await createLeaderNode({ baudRate: BAUD_RATE, uartPort: LEADER_PORT });
        // const data = await leader.getDevice(id);
        return [2 /*return*/, { data: id, ok: true, statusCode: 200 }];
    });
}); });
app.post('/gun', function (request) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, target, gunConfig, config, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _a = request.body, target = _a.target, gunConfig = _a.config;
                if (!serial) {
                    serial = new SerialConnection_1.SerialConnection({ baudRate: BAUD_RATE, uartPort: LEADER_PORT });
                }
                config = (0, utils_1.setGunAttributes)(gunConfig);
                _c = (_b = console).log;
                return [4 /*yield*/, serial.writeToBuffer("udp send ".concat(target, " 234 ").concat(config))];
            case 1:
                _c.apply(_b, [_d.sent()]);
                return [2 /*return*/, { ok: true, statusCode: 200 }];
        }
    });
}); });
app.post('/target', function (request) { return __awaiter(void 0, void 0, void 0, function () {
    var target, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                target = request.body.target;
                if (!serial) {
                    serial = new SerialConnection_1.SerialConnection({ baudRate: BAUD_RATE, uartPort: LEADER_PORT });
                }
                _b = (_a = console).log;
                return [4 /*yield*/, serial.writeToBuffer("udp send ".concat(target, " 234 ").concat(utils_1.START_TARGET))];
            case 1:
                _b.apply(_a, [_c.sent()]);
                return [2 /*return*/, { ok: true, statusCode: 200 }];
        }
    });
}); });
/** entry function */
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    _b = (_a = console).log;
                    return [4 /*yield*/, app.listen(4337, '127.0.0.1')];
                case 1:
                    _b.apply(_a, [_c.sent()]);
                    // console.table(await getNodes());
                    app.blipp();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _c.sent();
                    app.log.error(error_1);
                    process.exit(1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
process.on('uncaughtException', function (error) {
    console.error(error);
});
process.on('unhandledRejection', function (error) {
    console.error(error);
});
main();
