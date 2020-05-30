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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEnv = void 0;
var promises_1 = __importDefault(require("fs/promises"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var lodash_1 = __importDefault(require("lodash"));
var util_1 = require("../util");
var logger_1 = require("../util/logger");
var core_1 = require("../core");
var http_server_1 = require("../util/http-server");
var apis = {};
function loadApiFile(fname) {
    return __awaiter(this, void 0, void 0, function () {
        var apiJson, _a, _b, executionJs, centralMid, api, transports;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _b = (_a = JSON).parse;
                    return [4 /*yield*/, promises_1.default.readFile(fname)];
                case 1:
                    apiJson = _b.apply(_a, [(_c.sent()).toString()]);
                    logger_1.logger.debug(apiJson);
                    executionJs = lodash_1.default.get(apiJson, 'execution');
                    centralMid = core_1.createMiddleware(executionJs, 0);
                    api = apis[fname] || {
                        transports: [],
                        central: centralMid
                    };
                    transports = lodash_1.default.get(apiJson, 'transports');
                    if (transports !== undefined) {
                        transports.forEach(function (transport) {
                            var type = lodash_1.default.get(transport, 'type');
                            var id = lodash_1.default.get(transport, 'id');
                            var parameters = lodash_1.default.get(transport, 'parameters');
                            var mids = lodash_1.default.get(transport, 'mids');
                            var pre = core_1.createMiddleware(mids, 0);
                            var mid = core_1.connectMiddlewares(pre, centralMid);
                            var trp = core_1.createTransport(type, parameters, mid);
                            if (trp !== undefined) {
                                if (api.transports[id] !== undefined) {
                                    api.transports[id].clear();
                                }
                                api.transports[id] = trp;
                            }
                        });
                    }
                    apis[fname] = api;
                    return [2 /*return*/];
            }
        });
    });
}
function reloadEnv(dir) {
    return __awaiter(this, void 0, void 0, function () {
        var finfos;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, promises_1.default.readdir(dir, { withFileTypes: true })];
                case 1:
                    finfos = _a.sent();
                    finfos.filter(function (f) { return f.isFile() && f.name.endsWith('.json'); }).forEach(function (finfo) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    logger_1.logger.info("Loading API " + finfo.name);
                                    return [4 /*yield*/, loadApiFile(path_1.default.resolve(dir, finfo.name))];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
            }
        });
    });
}
var watcher = undefined;
function loadEnv(envName) {
    return __awaiter(this, void 0, void 0, function () {
        var envDir, envDirExists, envFinfo;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    envDir = path_1.default.resolve(util_1.baseDirectory, 'envs', envName);
                    envDirExists = fs_1.default.existsSync(envDir);
                    if (watcher !== undefined) {
                        watcher.close();
                        http_server_1.httpRouter.stack = [];
                    }
                    if (!envDirExists) return [3 /*break*/, 2];
                    return [4 /*yield*/, promises_1.default.stat(envDir)];
                case 1:
                    envFinfo = _a.sent();
                    if (envFinfo.isDirectory()) {
                        reloadEnv(envDir);
                        watcher = fs_1.default.watch(envDir, function (ev, fname) {
                            if (fname.endsWith('.json')) {
                                // reloadEnv(envDir);
                                logger_1.logger.info("Reloading " + fname + ".");
                                loadApiFile(path_1.default.resolve(envDir, fname));
                            }
                        });
                    }
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
exports.loadEnv = loadEnv;
;
//# sourceMappingURL=index.js.map