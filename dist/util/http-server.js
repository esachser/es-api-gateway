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
exports.loadHttpServer = exports.httpRouter = void 0;
var koa_1 = __importDefault(require("koa"));
var koa_router_1 = __importDefault(require("koa-router"));
var koa_helmet_1 = __importDefault(require("koa-helmet"));
var koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
var config_1 = require("./config");
var logger_1 = require("./logger");
exports.httpRouter = new koa_router_1.default();
function loadHttpServer() {
    var _this = this;
    var app = new koa_1.default();
    app.use(function (ctx, next) { return __awaiter(_this, void 0, void 0, function () {
        var init, diff;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    init = Date.now();
                    return [4 /*yield*/, next()];
                case 1:
                    _a.sent();
                    diff = Date.now() - init;
                    logger_1.logger.debug("Total app process time: " + diff + "ms");
                    return [2 /*return*/];
            }
        });
    }); });
    app.use(koa_helmet_1.default());
    app.use(function (ctx, next) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, next()];
                case 1:
                    _a.sent();
                    if (ctx.status === 404 && ctx.body === undefined) {
                        ctx.body = {
                            error: 'Not Found'
                        };
                    }
                    return [2 /*return*/];
            }
        });
    }); });
    app.use(koa_bodyparser_1.default());
    app.use(exports.httpRouter.routes()).use(exports.httpRouter.allowedMethods());
    var server = app.listen(config_1.configuration.httpPort || 3000, function () {
        var port = server.address().port;
        logger_1.logger.info("Http Server running on port " + port);
    });
    app.on('error', function (err, ctx) {
        logger_1.logger.error('Erro no servidor HTTP', err);
    });
}
exports.loadHttpServer = loadHttpServer;
//# sourceMappingURL=http-server.js.map