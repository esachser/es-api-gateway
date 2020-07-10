import { IEsMiddleware, EsMiddleware, IEsContext, IEsMiddlewareConstructor } from '../core';
import _ from 'lodash';
import { EsMiddlewareError } from '../core/errors';
import tmp from 'tmp';
import fsasync from 'fs/promises';
import { load as protoLoad } from '@grpc/proto-loader';
import { GrpcObject } from '@grpc/grpc-js';
import { ServiceClientConstructor } from '@grpc/grpc-js/build/src/make-client';
import { getPrivateKey, getPublicCert } from '../util/certs';
import { logger } from '../util/logger';

const grpc = require('@grpc/grpc-js');

export class EsGrpcRequestMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = 'EsGrpcRequestMiddleware';
    static readonly meta = { middleware: EsGrpcRequestMiddleware.middlewareName };

    private _grpcObj: GrpcObject | undefined;
    private _pkgProp: string;
    private _serviceProp: string;
    private _methodProp: string;
    private _bodyProp: string;
    private _headersProp: string;
    private _addrProp: string;
    // private _credProp: string;
    private _resultProp: string;
    private _keyFile: string;
    private _keyPassProp: string;
    private _certFile: string;
    private _certChainFile: string;
    private _enableSsl: boolean;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, api:string, nextMiddleware?: IEsMiddleware) {
        super(after, api, nextMiddleware);

        this._pkgProp = _.get(values, 'packageProp', 'request.package');
        this._serviceProp = _.get(values, 'serviceProp', 'request.service');
        this._methodProp = _.get(values, 'methodProp', 'request.method');
        this._bodyProp = _.get(values, 'bodyProp', 'request.body');
        this._headersProp = _.get(values, 'headersProp', 'request.headers');
        this._addrProp = _.get(values, 'addressProp', 'request.path');
        // this._credProp = _.get(values, 'headersProp', 'request.headers');
        this._resultProp = _.get(values, 'resultProp', 'response.body');
        this._keyFile = _.get(values, 'keyFile', 'server.key');
        this._keyPassProp = _.get(values, 'keyPassProp', 'keypass');
        this._certFile = _.get(values, 'certFile', 'server.crt');
        this._certChainFile = _.get(values, 'certChainFile', 'server.crt');
        this._enableSsl = _.get(values, 'enableSsl', false);


        if (!_.isString(this._pkgProp)) {
            throw new EsMiddlewareError(EsGrpcRequestMiddleware.name, 'packageProp MUST be String');
        }
        if (!_.isString(this._serviceProp)) {
            throw new EsMiddlewareError(EsGrpcRequestMiddleware.name, 'serviceProp MUST be String');
        }
        if (!_.isString(this._methodProp)) {
            throw new EsMiddlewareError(EsGrpcRequestMiddleware.name, 'methodProp MUST be String');
        }
        if (!_.isString(this._bodyProp)) {
            throw new EsMiddlewareError(EsGrpcRequestMiddleware.name, 'bodyProp MUST be String');
        }
        if (!_.isString(this._headersProp)) {
            throw new EsMiddlewareError(EsGrpcRequestMiddleware.name, 'headersProp MUST be String');
        }
        if (!_.isString(this._addrProp)) {
            throw new EsMiddlewareError(EsGrpcRequestMiddleware.name, 'addressProp MUST be String');
        }
        if (!_.isString(this._resultProp)) {
            throw new EsMiddlewareError(EsGrpcRequestMiddleware.name, 'resultProp MUST be String');
        }
        if (!_.isString(this._keyFile)) {
            throw new EsMiddlewareError(EsGrpcRequestMiddleware.name, 'keyFile MUST be String');
        }
        if (!_.isString(this._keyPassProp)) {
            throw new EsMiddlewareError(EsGrpcRequestMiddleware.name, 'keyPassProp MUST be String');
        }
        if (!_.isString(this._certFile)) {
            throw new EsMiddlewareError(EsGrpcRequestMiddleware.name, 'certFile MUST be String');
        }
        if (!_.isString(this._certChainFile)) {
            throw new EsMiddlewareError(EsGrpcRequestMiddleware.name, 'certChainFile MUST be String');
        }
        if (!_.isBoolean(this._enableSsl)) {
            throw new EsMiddlewareError(EsGrpcRequestMiddleware.name, 'enableSsl MUST be Boolean');
        }
    }

    async loadAsync(values: any) {
        try {
            const protoObj = _.get(values, 'proto');

            if (!_.isObjectLike(protoObj)) {
                throw new EsMiddlewareError(EsGrpcRequestMiddleware.name, 'Proto MUST be object like')
            }

            const ftmpname = await new Promise<string>((resolve, reject) => {
                tmp.tmpName((err, name) => {
                    if (err) return reject(err);
                    return resolve(`${name}.json`);
                });
            });

            await fsasync.writeFile(ftmpname, JSON.stringify(protoObj));

            const proto = await protoLoad(ftmpname);
            this._grpcObj = grpc.loadPackageDefinition(proto);
            await fsasync.unlink(ftmpname);
        }
        catch (err) {
            throw new EsMiddlewareError(EsGrpcRequestMiddleware.name, 'Error loading proto', err);
        }
    }

    async runInternal(context: IEsContext) {
        if (!_.isUndefined(this._grpcObj)) {
            const pkg = _.get(context.properties, this._pkgProp);
            if (!_.isString(pkg)) {
                throw new EsMiddlewareError(EsGrpcRequestMiddleware.name, 'package MUST be string');
            }
            const service = _.get(context.properties, this._serviceProp);
            if (!_.isString(service)) {
                throw new EsMiddlewareError(EsGrpcRequestMiddleware.name, 'service MUST be string');
            }
            const method = _.get(context.properties, this._methodProp);
            if (!_.isString(method)) {
                throw new EsMiddlewareError(EsGrpcRequestMiddleware.name, 'method MUST be string');
            }
            let body = _.get(context.properties, this._bodyProp);
            const headers = _.get(context.properties, this._headersProp);
            if (!_.isUndefined(headers) && !_.isNull(headers) && !_.isObjectLike(headers)){
                throw new EsMiddlewareError(EsGrpcRequestMiddleware.name, 'headers MUST be object like');
            }
            const addr = _.get(context.properties, this._addrProp);

            if (!_.isString(addr)) {
                throw new EsMiddlewareError(EsGrpcRequestMiddleware.name, 'address MUST be string');
            }

            let cred = grpc.credentials.createInsecure();
            if (this._enableSsl) {
                const pass = _.get(context.properties, this._keyPassProp);
                if (!_.isString(pass) && !_.isUndefined(pass)) {
                    throw new EsMiddlewareError(EsGrpcRequestMiddleware.name, 'The key password MUST be string or undefined');
                }
                const keys = {
                    clientKey: await getPrivateKey(context.meta.api, this._keyFile, pass),
                    certificate: await getPublicCert(context.meta.api, this._certFile),
                    certChain: await getPublicCert(context.meta.api, this._certChainFile)
                };

                cred = grpc.credentials.createSsl(Buffer.from(keys.certificate), Buffer.from(keys.clientKey), Buffer.from(keys.certChain));
            }

            const ClientCtor = (this._grpcObj[pkg] as GrpcObject)[service] as ServiceClientConstructor;
            const grpcClient = new ClientCtor(addr, cred);

            const metadata = new grpc.Metadata();
            if (_.isObjectLike(headers)) {
                for (const key of Object.keys(headers)) {
                    const v = headers[key];
                    metadata.add(key, _.toString(v));
                }
            }

            const res = await new Promise((resolve, reject) => {
                grpcClient[method](body, metadata, (err: any, res: any) => {
                    if (err) return reject(err);
                    return resolve(res);
                });
            });

            _.set(context.properties, this._resultProp, res);
        }
    }
};

export const MiddlewareCtor: IEsMiddlewareConstructor = EsGrpcRequestMiddleware;

export const MiddlewareSchema = {
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