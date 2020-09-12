"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadCustomMiddlewares = exports.loadMiddlewares = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logger_1 = require("../util/logger");
const middlewares_1 = require("../core/middlewares");
const util_1 = require("../util");
const lodash_1 = __importDefault(require("lodash"));
const events_1 = require("events");
const errors_1 = require("../core/errors");
function readDirectoryProjects(dir) {
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function* () {
        const finfos = fs_1.default.readdirSync(dir, { withFileTypes: true });
        try {
            for (var finfos_1 = __asyncValues(finfos), finfos_1_1; finfos_1_1 = yield finfos_1.next(), !finfos_1_1.done;) {
                const finfo = finfos_1_1.value;
                if (path_1.default.extname(finfo.name) === '.js' && path_1.default.basename(finfo.name) !== 'index.js') {
                    try {
                        const f = path_1.default.basename(finfo.name);
                        const ipt = yield Promise.resolve().then(() => __importStar(require(path_1.default.resolve(dir, f))));
                        const ctor = lodash_1.default.get(ipt, 'MiddlewareCtor');
                        const schema = lodash_1.default.get(ipt, 'MiddlewareSchema');
                        if (ctor !== undefined && schema !== undefined) {
                            middlewares_1.addMiddleware(ctor.name, ctor, schema);
                        }
                    }
                    catch (err) {
                        logger_1.logger.error('Error loading middleware', err);
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (finfos_1_1 && !finfos_1_1.done && (_a = finfos_1.return)) yield _a.call(finfos_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    });
}
function loadMiddlewares() {
    return __awaiter(this, void 0, void 0, function* () {
        yield readDirectoryProjects(__dirname);
        // addMiddleware('EsPropertyMiddleware', EsPropertyMiddlewareContructor, EsPropertySchema);
        // addMiddleware('EsMetricsMiddleware', EsMetricsMiddlewareContructor, EsMetricsSchema);
        // addMiddleware('EsParallelMiddleware', EsParallelMiddlewareContructor, EsParallelSchema);
        // addMiddleware('EsSequenceMiddleware', EsSequenceMiddlewareContructor, EsSequenceSchema);
        // addMiddleware('EsConditionMiddleware', EsConditionMiddlewareContructor, EsConditionSchema);
        // addMiddleware('EsHttpRequestMiddleware', EsHttpRequestMiddlewareContructor, EsHttpRequestSchema);
        // addMiddleware('EsOpenApiVerifyMiddleware', EsOpenApiVerifyMiddlewareContructor, EsOpenApiVerifySchema);
        // addMiddleware('EsThrowMiddleware', EsThrowMiddlewareContructor, EsThrowSchema);
        // addMiddleware('EsCatchMiddleware', EsCatchMiddlewareContructor, EsCatchSchema);
        // addMiddleware('EsAuthenticateMiddleware', EsAuthenticateMiddlewareContructor, EsAuthenticateSchema);
        // addMiddleware('EsExecJsMiddleware', EsExecJsMiddlewareContructor, EsExecJsSchema);
        // addMiddleware('EsDecodeMiddleware', EsDecodeMiddlewareContructor, EsDecodeSchema);
        // addMiddleware('EsEncodeMiddleware', EsEncodeMiddlewareContructor, EsEncodeSchema);
        // addMiddleware('EsGrpcRequestMiddleware', EsGrpcRequestMiddlewareContructor, EsGrpcRequestSchema);
        // addMiddleware('EsLoadPrivateKeyMiddleware', EsLoadPrivateKeyMiddlewareContructor, EsLoadPrivateKeySchema);
        // addMiddleware('EsLoadPublicCertificateMiddleware', EsLoadPublicCertificateMiddlewareContructor, EsLoadPublicCertificateSchema);
        // addMiddleware('EsJwsGenerateMiddleware', EsJwsGenerateMiddlewareContructor, EsJwsGenerateSchema);
        // addMiddleware('EsJwsVerifyMiddleware', EsJwsVerifyMiddlewareContructor, EsJwsVerifySchema);
        // addMiddleware('EsJweGenerateMiddleware', EsJweGenerateMiddlewareContructor, EsJweGenerateSchema);
        // addMiddleware('EsJweVerifyMiddleware', EsJweVerifyMiddlewareContructor, EsJweVerifySchema);
        // addMiddleware('EsRedisSetMiddleware', EsRedisSetMiddlewareContructor, EsRedisSetSchema);
        // addMiddleware('EsRedisGetMiddleware', EsRedisGetMiddlewareContructor, EsRedisGetSchema);
        // addMiddleware('EsRateLimiterMiddleware', EsRateLimiterMiddlewareContructor, EsRateLimiterSchema);
        // addMiddleware('EsQuotaLimiterMiddleware', EsQuotaLimiterMiddlewareContructor, EsQuotaLimiterSchema);
        // addMiddleware('EsGetRawBodyMiddleware', EsGetRawBodyMiddlewareContructor, EsGetRawBodySchema);
        // addMiddleware('EsRedisPublishMiddleware', EsRedisPublishMiddlewareContructor, EsRedisPublishSchema);
        // addMiddleware('EsRedisXaddMiddleware', EsRedisXaddMiddlewareContructor, EsRedisXaddSchema);
        // addMiddleware('EsDelayMiddleware', EsDelayMiddlewareContructor, EsDelaySchema);
        // addMiddleware('EsTimeoutMiddleware', EsTimeoutMiddlewareContructor, EsTimeoutSchema);
    });
}
exports.loadMiddlewares = loadMiddlewares;
;
let apiReloader = {};
function loadCompoundMiddleware(fname) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (fname.endsWith('.json') || fname.endsWith('.yaml')) {
            logger_1.logger.info(`Loading compound middleware: ${fname}`);
            const midJson = yield util_1.readFileToObject(path_1.default.resolve(util_1.baseDirectory, 'custom', 'middlewares', 'compound', fname));
            if (!lodash_1.default.isString(midJson === null || midJson === void 0 ? void 0 : midJson.id)) {
                throw new errors_1.EsMiddlewareError(`loadCompoundMiddleware ${fname}`, 'id MUST be string');
            }
            if (!lodash_1.default.isArray(midJson === null || midJson === void 0 ? void 0 : midJson.mids)) {
                throw new errors_1.EsMiddlewareError(`loadCompoundMiddleware ${fname}`, 'mids MUST be array');
            }
            apiReloader[fname] = (_a = apiReloader[fname]) !== null && _a !== void 0 ? _a : new events_1.EventEmitter();
            apiReloader[fname].emit('change');
            middlewares_1.addMiddleware(`Custom-${midJson.id}`, middlewares_1.getCustomConstructor(midJson.mids, apiReloader[fname]), middlewares_1.getCustomSchema(midJson.id), true);
        }
    });
}
function loadCompoundMiddlewareWithCare(fname) {
    loadCompoundMiddleware(fname)
        .then(() => logger_1.logger.info(`Compound mid loaded: ${fname}`))
        .catch(err => logger_1.logger.error(`Error loading compound mid: ${fname}`, err));
}
let cpWatcher = undefined;
function loadCustomMiddlewares() {
    return __awaiter(this, void 0, void 0, function* () {
        // Limpa cache dos custom
        logger_1.logger.info('Loading compound middlewares');
        const cpdir = path_1.default.resolve(util_1.baseDirectory, 'custom', 'middlewares', 'compound');
        if (cpWatcher !== undefined) {
            middlewares_1.removeAllCustomMiddlewares();
        }
        const dstat = yield fs_1.default.promises.stat(cpdir);
        if (dstat.isDirectory()) {
            cpWatcher = cpWatcher !== null && cpWatcher !== void 0 ? cpWatcher : fs_1.default.watch(cpdir, (ev, fname) => loadCompoundMiddlewareWithCare(fname));
            const finfos = yield fs_1.default.promises.readdir(cpdir, { withFileTypes: true });
            finfos.filter(f => f.isFile()).forEach(f => loadCompoundMiddlewareWithCare(f.name));
        }
    });
}
exports.loadCustomMiddlewares = loadCustomMiddlewares;
;
//# sourceMappingURL=index.js.map