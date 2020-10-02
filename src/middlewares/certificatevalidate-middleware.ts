import _ from 'lodash';
import { EsMiddlewareError } from '../core/errors';
import { EsMiddleware, IEsMiddleware, IEsMiddlewareConstructor } from '../core/middlewares';
import { IEsContext } from '../core';
import forge from 'node-forge';

export class EsCertificateValidateMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = 'EsCertificateValidateMiddleware';
    static readonly meta = { middleware: EsCertificateValidateMiddleware.middlewareName };

    private _certProp: string;
    private _caStoreProp: string;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, api:string, nextMiddleware?: IEsMiddleware) {
        super(after, api, nextMiddleware);

        this._certProp = _.get(values, 'certProp', 'request.clientCertificate');
        if (!_.isString(this._certProp)){
            throw new EsMiddlewareError(EsCertificateValidateMiddleware.name, 'certProp MUST be string');
        }

        this._caStoreProp = _.get(values, 'caStoreProp', 'castore');
        if (!_.isString(this._caStoreProp)){
            throw new EsMiddlewareError(EsCertificateValidateMiddleware.name, 'caStoreProp MUST be string');
        }
    }

    async loadAsync() { }

    async runInternal(context: IEsContext) {
        const certificate = _.get(context.properties, this._certProp);
        if (!_.isString(certificate)) {
            throw new EsMiddlewareError(EsCertificateValidateMiddleware.name, `Cerficate (prop ${this._certProp}) MUST be string`);
        }

        const caStoreStr = _.get(context.properties, this._caStoreProp);
        if (!_.isString(caStoreStr)) {
            throw new EsMiddlewareError(EsCertificateValidateMiddleware.name, `CAStore (prop ${this._caStoreProp}) MUST be string`);
        }

        try {
            const cert = forge.pki.certificateFromPem(certificate);
            const caStore = forge.pki.createCaStore([caStoreStr]);

            const valid = await forge.pki.verifyCertificateChain(caStore, [cert]);
            if (!valid) {
                throw new EsMiddlewareError(EsCertificateValidateMiddleware.name, `Error verfifying certificate`, undefined, undefined, 403); 
            }
        }
        catch (err) {
            throw new EsMiddlewareError(EsCertificateValidateMiddleware.name, `Error verfifying certificate`, err);            
        }
    }
}

export const MiddlewareCtor: IEsMiddlewareConstructor = EsCertificateValidateMiddleware;

export const MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsCertificateValidateMiddleware",
    "title": "CertificateValidate Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "caStoreProp"
    ],
    "properties": {
        "certProp": {
            "type": "string",
            "minLength": 1
        },
        "caStoreProp": {
            "type": "string",
            "minLength": 1
        }
    }
};
