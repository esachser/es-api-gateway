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
exports.MiddlewareSchema = exports.MiddlewareCtor = exports.EsQuotaLimiterMiddleware = void 0;
const lodash_1 = __importDefault(require("lodash"));
const errors_1 = require("../core/errors");
const config_1 = require("../util/config");
const etdc_1 = __importDefault(require("../util/etdc"));
const middlewares_1 = require("../core/middlewares");
let EsQuotaLimiterMiddleware = /** @class */ (() => {
    class EsQuotaLimiterMiddleware extends middlewares_1.EsMiddleware {
        /**
         * Constrói o middleware a partir dos parâmetros
         */
        constructor(values, after, api, nextMiddleware) {
            super(after, api, nextMiddleware);
            this._destProp = lodash_1.default.get(values, 'destProp', 'ratelimitres');
            if (!lodash_1.default.isString(this._destProp)) {
                throw new errors_1.EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'destProp MUST be string');
            }
            this._sourceProp = lodash_1.default.get(values, 'sourceProp');
            if (!lodash_1.default.isString(this._sourceProp)) {
                throw new errors_1.EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'sourceProp MUST be string');
            }
            this._quotaId = lodash_1.default.get(values, 'quotaId');
            if (!lodash_1.default.isString(this._quotaId)) {
                throw new errors_1.EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'quotaId MUST be string');
            }
            this._quotaTypeProp = lodash_1.default.get(values, 'quotaTypeProp');
            if (!lodash_1.default.isString(this._quotaTypeProp)) {
                throw new errors_1.EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'quotaTypeProp MUST be string');
            }
            this._quotaProp = lodash_1.default.get(values, 'quotaProp');
            if (!lodash_1.default.isString(this._quotaProp)) {
                throw new errors_1.EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'quotaProp MUST be string');
            }
            this._strictProp = lodash_1.default.get(values, 'strictProp');
            if (!lodash_1.default.isString(this._strictProp)) {
                throw new errors_1.EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'strictProp MUST be string');
            }
            this._etcdKey = `esgateway/runtime/apis/${config_1.configuration.env}/${api}/quotas/${this._quotaId}`;
            // this._etcdKey = `esgateway:runtime:apis:${configuration.env}:${api}:quotas:${this._quotaType}:${this._quotaId}`;
            const dt = new Date(Date.now());
            //EsQuotaLimiterMiddleware.LEASES = EsQuotaLimiterMiddleware.QUOTA_FUNCTIONS.map(f => ETCD_CLIENT.lease(Math.floor((f(dt).valueOf() - Date.now())/1000)));
        }
        loadAsync() {
            return __awaiter(this, void 0, void 0, function* () { });
        }
        runInternal(context) {
            return __awaiter(this, void 0, void 0, function* () {
                const key = lodash_1.default.get(context.properties, this._sourceProp);
                if (!lodash_1.default.isString(key) && !lodash_1.default.isNumber(key)) {
                    throw new errors_1.EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'key MUST be either string or number');
                }
                let quotaType = lodash_1.default.get(context.properties, this._quotaTypeProp);
                if (!lodash_1.default.isString(quotaType)) {
                    throw new errors_1.EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'quotaType MUST be string');
                }
                quotaType = lodash_1.default.toUpper(quotaType);
                const quotaTypeId = EsQuotaLimiterMiddleware.QUOTA_TYPES.indexOf(quotaType);
                if (quotaTypeId < 0) {
                    throw new errors_1.EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'quotaType INVALID');
                }
                const quotaValue = lodash_1.default.get(context.properties, this._quotaProp);
                if (!lodash_1.default.isInteger(quotaValue) || quotaValue <= 0) {
                    throw new errors_1.EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'quota MUST be integer greater than 0');
                }
                const strict = Boolean(lodash_1.default.get(context.properties, this._strictProp, false));
                const now = new Date(Date.now());
                // Calcula chave a partir da data
                const dtExps = EsQuotaLimiterMiddleware.QUOTA_FUNCTIONS.map(f => f(now).valueOf());
                const rKey = `${this._etcdKey}/${key}`;
                let error = false;
                let excp = undefined;
                const func = () => __awaiter(this, void 0, void 0, function* () {
                    try {
                        let quotas = [];
                        let exps = [];
                        const allKeys = yield ns.getAll().numbers();
                        quotas = EsQuotaLimiterMiddleware.QUOTA_TYPES.map(t => { var _a; return (_a = allKeys[`/${t}`]) !== null && _a !== void 0 ? _a : 0; });
                        exps = EsQuotaLimiterMiddleware.QUOTA_TYPES.map(t => { var _a; return (_a = allKeys[`/${t}/exp`]) !== null && _a !== void 0 ? _a : 0; });
                        error = now.valueOf() <= exps[quotaTypeId] && quotas[quotaTypeId] >= quotaValue;
                        yield ns.stm({ retries: 0 }).transact(tx => Promise.all([
                            Promise.all(EsQuotaLimiterMiddleware.QUOTA_TYPES.map((t, i) => __awaiter(this, void 0, void 0, function* () {
                                var _a;
                                if (!error) {
                                    let val = (_a = (yield tx.get(`/${t}`).number())) !== null && _a !== void 0 ? _a : 0;
                                    if (now.valueOf() > exps[i])
                                        val = 0;
                                    yield tx.put(`/${t}`).value(val + 1);
                                }
                                else if (now.valueOf() > exps[i]) {
                                    yield tx.put(`/${t}`).value(1);
                                }
                                yield tx.put(`/${t}/exp`).value(dtExps[i]);
                            })))
                        ]));
                    }
                    catch (err) {
                        excp = err;
                    }
                });
                const ns = etdc_1.default.namespace(rKey);
                if (strict)
                    yield ns.lock(`/mutex`).ttl(5).do(func);
                else
                    yield func();
                if (excp !== undefined) {
                    throw new errors_1.EsMiddlewareError(EsQuotaLimiterMiddleware.name, `Error updating quotas`, excp);
                }
                if (error) {
                    throw new errors_1.EsMiddlewareError(EsQuotaLimiterMiddleware.name, `Maximum quota reached`, undefined, `Quota: ${quotaValue} per ${quotaType}`, 429);
                }
            });
        }
    }
    EsQuotaLimiterMiddleware.isInOut = true;
    EsQuotaLimiterMiddleware.middlewareName = 'EsQuotaLimiterMiddleware';
    EsQuotaLimiterMiddleware.meta = { middleware: EsQuotaLimiterMiddleware.middlewareName };
    EsQuotaLimiterMiddleware.QUOTA_TYPES = ['DAY', 'WEEK', 'MONTH', 'YEAR'];
    EsQuotaLimiterMiddleware.QUOTA_VALIDITIES = [24 * 60 * 60, 7 * 24 * 60 * 60, 31 * 24 * 60 * 60, 366 * 24 * 60 * 60];
    EsQuotaLimiterMiddleware.QUOTA_FUNCTIONS = [
        (dt) => {
            return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + 1);
        },
        (dt) => {
            return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + 7 - dt.getDay());
        },
        (dt) => {
            return new Date(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
        },
        (dt) => {
            return new Date(dt.getFullYear() + 1, dt.getMonth(), dt.getDate());
        }
    ];
    EsQuotaLimiterMiddleware.PREFETCH = lodash_1.default.flatten(EsQuotaLimiterMiddleware.QUOTA_TYPES.map(t => [`/${t}`, `/${t}/exp`]));
    return EsQuotaLimiterMiddleware;
})();
exports.EsQuotaLimiterMiddleware = EsQuotaLimiterMiddleware;
;
exports.MiddlewareCtor = EsQuotaLimiterMiddleware;
exports.MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsQuotaLimiterMiddleware",
    "title": "QuotaLimiter Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "quotaId",
        "quotaTypeProp",
        "quotaProp",
        "sourceProp",
        "strictProp"
    ],
    "properties": {
        "sourceProp": {
            "type": "string",
            "minLength": 1
        },
        "quotaProp": {
            "type": "string",
            "minLength": 1
        },
        "quotaTypeProp": {
            "type": "string",
            "minLength": 1
        },
        "quotaId": {
            "type": "string",
            "minLength": 1
        },
        "destProp": {
            "type": "string",
            "minLength": 1
        },
        "strictProp": {
            "type": "string",
            "minLength": 1
        }
    }
};
//# sourceMappingURL=quotalimiter-middleware.js.map