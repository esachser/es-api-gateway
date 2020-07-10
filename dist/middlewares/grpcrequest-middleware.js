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
exports.MiddlewareSchema = exports.MiddlewareCtor = exports.EsGrpcRequestMiddleware = void 0;
const core_1 = require("../core");
const lodash_1 = __importDefault(require("lodash"));
const errors_1 = require("../core/errors");
const tmp_1 = __importDefault(require("tmp"));
const promises_1 = __importDefault(require("fs/promises"));
const proto_loader_1 = require("@grpc/proto-loader");
const certs_1 = require("../util/certs");
const grpc = require('@grpc/grpc-js');
let EsGrpcRequestMiddleware = /** @class */ (() => {
    class EsGrpcRequestMiddleware extends core_1.EsMiddleware {
        /**
         * Constrói o middleware a partir dos parâmetros
         */
        constructor(values, after, api, nextMiddleware) {
            super(after, api, nextMiddleware);
            this._pkgProp = lodash_1.default.get(values, 'packageProp', 'request.package');
            this._serviceProp = lodash_1.default.get(values, 'serviceProp', 'request.service');
            this._methodProp = lodash_1.default.get(values, 'methodProp', 'request.method');
            this._bodyProp = lodash_1.default.get(values, 'bodyProp', 'request.body');
            this._headersProp = lodash_1.default.get(values, 'headersProp', 'request.headers');
            this._addrProp = lodash_1.default.get(values, 'addressProp', 'request.path');
            // this._credProp = _.get(values, 'headersProp', 'request.headers');
            this._resultProp = lodash_1.default.get(values, 'resultProp', 'response.body');
            this._keyFile = lodash_1.default.get(values, 'keyFile', 'server.key');
            this._keyPassProp = lodash_1.default.get(values, 'keyPassProp', 'keypass');
            this._certFile = lodash_1.default.get(values, 'certFile', 'server.crt');
            this._certChainFile = lodash_1.default.get(values, 'certChainFile', 'server.crt');
            this._enableSsl = lodash_1.default.get(values, 'enableSsl', false);
            if (!lodash_1.default.isString(this._pkgProp)) {
                throw new errors_1.EsMiddlewareError(EsGrpcRequestMiddleware.name, 'packageProp MUST be String');
            }
            if (!lodash_1.default.isString(this._serviceProp)) {
                throw new errors_1.EsMiddlewareError(EsGrpcRequestMiddleware.name, 'serviceProp MUST be String');
            }
            if (!lodash_1.default.isString(this._methodProp)) {
                throw new errors_1.EsMiddlewareError(EsGrpcRequestMiddleware.name, 'methodProp MUST be String');
            }
            if (!lodash_1.default.isString(this._bodyProp)) {
                throw new errors_1.EsMiddlewareError(EsGrpcRequestMiddleware.name, 'bodyProp MUST be String');
            }
            if (!lodash_1.default.isString(this._headersProp)) {
                throw new errors_1.EsMiddlewareError(EsGrpcRequestMiddleware.name, 'headersProp MUST be String');
            }
            if (!lodash_1.default.isString(this._addrProp)) {
                throw new errors_1.EsMiddlewareError(EsGrpcRequestMiddleware.name, 'addressProp MUST be String');
            }
            if (!lodash_1.default.isString(this._resultProp)) {
                throw new errors_1.EsMiddlewareError(EsGrpcRequestMiddleware.name, 'resultProp MUST be String');
            }
            if (!lodash_1.default.isString(this._keyFile)) {
                throw new errors_1.EsMiddlewareError(EsGrpcRequestMiddleware.name, 'keyFile MUST be String');
            }
            if (!lodash_1.default.isString(this._keyPassProp)) {
                throw new errors_1.EsMiddlewareError(EsGrpcRequestMiddleware.name, 'keyPassProp MUST be String');
            }
            if (!lodash_1.default.isString(this._certFile)) {
                throw new errors_1.EsMiddlewareError(EsGrpcRequestMiddleware.name, 'certFile MUST be String');
            }
            if (!lodash_1.default.isString(this._certChainFile)) {
                throw new errors_1.EsMiddlewareError(EsGrpcRequestMiddleware.name, 'certChainFile MUST be String');
            }
            if (!lodash_1.default.isBoolean(this._enableSsl)) {
                throw new errors_1.EsMiddlewareError(EsGrpcRequestMiddleware.name, 'enableSsl MUST be Boolean');
            }
        }
        loadAsync(values) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const protoObj = lodash_1.default.get(values, 'proto');
                    if (!lodash_1.default.isObjectLike(protoObj)) {
                        throw new errors_1.EsMiddlewareError(EsGrpcRequestMiddleware.name, 'Proto MUST be object like');
                    }
                    const ftmpname = yield new Promise((resolve, reject) => {
                        tmp_1.default.tmpName((err, name) => {
                            if (err)
                                return reject(err);
                            return resolve(`${name}.json`);
                        });
                    });
                    yield promises_1.default.writeFile(ftmpname, JSON.stringify(protoObj));
                    const proto = yield proto_loader_1.load(ftmpname);
                    this._grpcObj = grpc.loadPackageDefinition(proto);
                    yield promises_1.default.unlink(ftmpname);
                }
                catch (err) {
                    throw new errors_1.EsMiddlewareError(EsGrpcRequestMiddleware.name, 'Error loading proto', err);
                }
            });
        }
        runInternal(context) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!lodash_1.default.isUndefined(this._grpcObj)) {
                    const pkg = lodash_1.default.get(context.properties, this._pkgProp);
                    if (!lodash_1.default.isString(pkg)) {
                        throw new errors_1.EsMiddlewareError(EsGrpcRequestMiddleware.name, 'package MUST be string');
                    }
                    const service = lodash_1.default.get(context.properties, this._serviceProp);
                    if (!lodash_1.default.isString(service)) {
                        throw new errors_1.EsMiddlewareError(EsGrpcRequestMiddleware.name, 'service MUST be string');
                    }
                    const method = lodash_1.default.get(context.properties, this._methodProp);
                    if (!lodash_1.default.isString(method)) {
                        throw new errors_1.EsMiddlewareError(EsGrpcRequestMiddleware.name, 'method MUST be string');
                    }
                    let body = lodash_1.default.get(context.properties, this._bodyProp);
                    const headers = lodash_1.default.get(context.properties, this._headersProp);
                    if (!lodash_1.default.isUndefined(headers) && !lodash_1.default.isNull(headers) && !lodash_1.default.isObjectLike(headers)) {
                        throw new errors_1.EsMiddlewareError(EsGrpcRequestMiddleware.name, 'headers MUST be object like');
                    }
                    const addr = lodash_1.default.get(context.properties, this._addrProp);
                    if (!lodash_1.default.isString(addr)) {
                        throw new errors_1.EsMiddlewareError(EsGrpcRequestMiddleware.name, 'address MUST be string');
                    }
                    let cred = grpc.credentials.createInsecure();
                    if (this._enableSsl) {
                        const pass = lodash_1.default.get(context.properties, this._keyPassProp);
                        if (!lodash_1.default.isString(pass) && !lodash_1.default.isUndefined(pass)) {
                            throw new errors_1.EsMiddlewareError(EsGrpcRequestMiddleware.name, 'The key password MUST be string or undefined');
                        }
                        const keys = {
                            clientKey: yield certs_1.getPrivateKey(context.meta.api, this._keyFile, pass),
                            certificate: yield certs_1.getPublicCert(context.meta.api, this._certFile),
                            certChain: yield certs_1.getPublicCert(context.meta.api, this._certChainFile)
                        };
                        cred = grpc.credentials.createSsl(Buffer.from(keys.certificate), Buffer.from(keys.clientKey), Buffer.from(keys.certChain));
                    }
                    const ClientCtor = this._grpcObj[pkg][service];
                    const grpcClient = new ClientCtor(addr, cred);
                    const metadata = new grpc.Metadata();
                    if (lodash_1.default.isObjectLike(headers)) {
                        for (const key of Object.keys(headers)) {
                            const v = headers[key];
                            metadata.add(key, lodash_1.default.toString(v));
                        }
                    }
                    const res = yield new Promise((resolve, reject) => {
                        grpcClient[method](body, metadata, (err, res) => {
                            if (err)
                                return reject(err);
                            return resolve(res);
                        });
                    });
                    lodash_1.default.set(context.properties, this._resultProp, res);
                }
            });
        }
    }
    EsGrpcRequestMiddleware.isInOut = true;
    EsGrpcRequestMiddleware.middlewareName = 'EsGrpcRequestMiddleware';
    EsGrpcRequestMiddleware.meta = { middleware: EsGrpcRequestMiddleware.middlewareName };
    return EsGrpcRequestMiddleware;
})();
exports.EsGrpcRequestMiddleware = EsGrpcRequestMiddleware;
;
exports.MiddlewareCtor = EsGrpcRequestMiddleware;
exports.MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsGrpcRequestMiddleware",
    "title": "GrpcRequest Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "proto",
        "packageProp",
        "serviceProp",
        "methodProp",
        "addressProp"
    ],
    "properties": {
        "proto": {
            "type": "object"
        },
        "packageProp": {
            "type": "string",
            "minLegth": 1
        },
        "serviceProp": {
            "type": "string",
            "minLegth": 1
        },
        "methodProp": {
            "type": "string",
            "minLegth": 1
        },
        "bodyProp": {
            "type": "string",
            "minLegth": 1
        },
        "headersProp": {
            "type": "string",
            "minLegth": 1
        },
        "addressProp": {
            "type": "string",
            "minLegth": 1
        },
        "resultProp": {
            "type": "string",
            "minLegth": 1
        },
        "enableSsl": {
            "type": "boolean"
        },
        "keyFile": {
            "type": "string",
            "minLegth": 1
        },
        "keyPassProp": {
            "type": "string",
            "minLegth": 1
        },
        "certFile": {
            "type": "string",
            "minLegth": 1
        },
        "certChainFile": {
            "type": "string",
            "minLegth": 1
        }
    }
};
//# sourceMappingURL=grpcrequest-middleware.js.map