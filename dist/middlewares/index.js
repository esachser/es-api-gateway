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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadCustomMiddlewares = exports.loadMiddlewares = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logger_1 = require("../util/logger");
const property_middleware_1 = require("./property-middleware");
const metrics_middleware_1 = require("./metrics-middleware");
const parallel_middleware_1 = require("./parallel-middleware");
const sequence_middleware_1 = require("./sequence-middleware");
const condition_middleware_1 = require("./condition-middleware");
const httprequest_middleware_1 = require("./httprequest-middleware");
const openapiverify_middleware_1 = require("./openapiverify-middleware");
const throw_middleware_1 = require("./throw-middleware");
const catch_middleware_1 = require("./catch-middleware");
const authenticate_middleware_1 = require("./authenticate-middleware");
const execjs_middleware_1 = require("./execjs-middleware");
const decode_middleware_1 = require("./decode-middleware");
const encode_middleware_1 = require("./encode-middleware");
const grpcrequest_middleware_1 = require("./grpcrequest-middleware");
const loadprivatekey_middleware_1 = require("./loadprivatekey-middleware");
const loadpubliccertificate_middleware_1 = require("./loadpubliccertificate-middleware");
const jwsgenerate_middleware_1 = require("./jwsgenerate-middleware");
const jwsverify_middleware_1 = require("./jwsverify-middleware");
const jwegenerate_middleware_1 = require("./jwegenerate-middleware");
const jweverify_middleware_1 = require("./jweverify-middleware");
const redisset_middleware_1 = require("./redisset-middleware");
const redisget_middleware_1 = require("./redisget-middleware");
const ratelimiter_middleware_1 = require("./ratelimiter-middleware");
const quotalimiter_middleware_1 = require("./quotalimiter-middleware");
const getrawbody_middleware_1 = require("./getrawbody-middleware");
const redispublish_middleware_1 = require("./redispublish-middleware");
const middlewares_1 = require("../core/middlewares");
const util_1 = require("../util");
const lodash_1 = __importDefault(require("lodash"));
const events_1 = require("events");
const errors_1 = require("../core/errors");
function readDirectoryProjects(dir) {
    const finfos = fs_1.default.readdirSync(dir, { withFileTypes: true });
    finfos.forEach(finfo => {
        if (finfo.isDirectory()) {
            logger_1.logger.info(`Loading middleware ${finfo.name}`);
        }
    });
}
function loadMiddlewares() {
    //readDirectoryProjects(path.resolve(baseDirectory, 'middlewares'));
    middlewares_1.addMiddleware('EsPropertyMiddleware', property_middleware_1.MiddlewareCtor, property_middleware_1.MiddlewareSchema);
    middlewares_1.addMiddleware('EsMetricsMiddleware', metrics_middleware_1.MiddlewareCtor, metrics_middleware_1.MiddlewareSchema);
    middlewares_1.addMiddleware('EsParallelMiddleware', parallel_middleware_1.MiddlewareCtor, parallel_middleware_1.MiddlewareSchema);
    middlewares_1.addMiddleware('EsSequenceMiddleware', sequence_middleware_1.MiddlewareCtor, sequence_middleware_1.MiddlewareSchema);
    middlewares_1.addMiddleware('EsConditionMiddleware', condition_middleware_1.MiddlewareCtor, condition_middleware_1.MiddlewareSchema);
    middlewares_1.addMiddleware('EsHttpRequestMiddleware', httprequest_middleware_1.MiddlewareCtor, httprequest_middleware_1.MiddlewareSchema);
    middlewares_1.addMiddleware('EsOpenApiVerifyMiddleware', openapiverify_middleware_1.MiddlewareCtor, openapiverify_middleware_1.MiddlewareSchema);
    middlewares_1.addMiddleware('EsThrowMiddleware', throw_middleware_1.MiddlewareCtor, throw_middleware_1.MiddlewareSchema);
    middlewares_1.addMiddleware('EsCatchMiddleware', catch_middleware_1.MiddlewareCtor, catch_middleware_1.MiddlewareSchema);
    middlewares_1.addMiddleware('EsAuthenticateMiddleware', authenticate_middleware_1.MiddlewareCtor, authenticate_middleware_1.MiddlewareSchema);
    middlewares_1.addMiddleware('EsExecJsMiddleware', execjs_middleware_1.MiddlewareCtor, execjs_middleware_1.MiddlewareSchema);
    middlewares_1.addMiddleware('EsDecodeMiddleware', decode_middleware_1.MiddlewareCtor, decode_middleware_1.MiddlewareSchema);
    middlewares_1.addMiddleware('EsEncodeMiddleware', encode_middleware_1.MiddlewareCtor, encode_middleware_1.MiddlewareSchema);
    middlewares_1.addMiddleware('EsGrpcRequestMiddleware', grpcrequest_middleware_1.MiddlewareCtor, grpcrequest_middleware_1.MiddlewareSchema);
    middlewares_1.addMiddleware('EsLoadPrivateKeyMiddleware', loadprivatekey_middleware_1.MiddlewareCtor, loadprivatekey_middleware_1.MiddlewareSchema);
    middlewares_1.addMiddleware('EsLoadPublicCertificateMiddleware', loadpubliccertificate_middleware_1.MiddlewareCtor, loadpubliccertificate_middleware_1.MiddlewareSchema);
    middlewares_1.addMiddleware('EsJwsGenerateMiddleware', jwsgenerate_middleware_1.MiddlewareCtor, jwsgenerate_middleware_1.MiddlewareSchema);
    middlewares_1.addMiddleware('EsJwsVerifyMiddleware', jwsverify_middleware_1.MiddlewareCtor, jwsverify_middleware_1.MiddlewareSchema);
    middlewares_1.addMiddleware('EsJweGenerateMiddleware', jwegenerate_middleware_1.MiddlewareCtor, jwegenerate_middleware_1.MiddlewareSchema);
    middlewares_1.addMiddleware('EsJweVerifyMiddleware', jweverify_middleware_1.MiddlewareCtor, jweverify_middleware_1.MiddlewareSchema);
    middlewares_1.addMiddleware('EsRedisSetMiddleware', redisset_middleware_1.MiddlewareCtor, redisset_middleware_1.MiddlewareSchema);
    middlewares_1.addMiddleware('EsRedisGetMiddleware', redisget_middleware_1.MiddlewareCtor, redisget_middleware_1.MiddlewareSchema);
    middlewares_1.addMiddleware('EsRateLimiterMiddleware', ratelimiter_middleware_1.MiddlewareCtor, ratelimiter_middleware_1.MiddlewareSchema);
    middlewares_1.addMiddleware('EsQuotaLimiterMiddleware', quotalimiter_middleware_1.MiddlewareCtor, quotalimiter_middleware_1.MiddlewareSchema);
    middlewares_1.addMiddleware('EsGetRawBodyMiddleware', getrawbody_middleware_1.MiddlewareCtor, getrawbody_middleware_1.MiddlewareSchema);
    middlewares_1.addMiddleware('EsRedisPublishMiddleware', redispublish_middleware_1.MiddlewareCtor, redispublish_middleware_1.MiddlewareSchema);
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