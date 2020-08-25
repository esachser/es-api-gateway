import _ from 'lodash';
import { EsMiddlewareError } from '../core/errors';
import Redis from 'ioredis';
import { configuration } from '../util/config';
import ETCD_CLIENT from '../util/etdc';
import { EsMiddleware, IEsMiddleware, IEsMiddlewareConstructor } from '../core/middlewares';
import { IEsContext } from '../core';

export class EsQuotaLimiterMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = 'EsQuotaLimiterMiddleware';
    static readonly meta = { middleware: EsQuotaLimiterMiddleware.middlewareName };
    static readonly QUOTA_TYPES = ['DAY', 'WEEK', 'MONTH', 'YEAR'];
    static readonly QUOTA_VALIDITIES = [24 * 60 * 60, 7 * 24 * 60 * 60, 31 * 24 * 60 * 60, 366 * 24 * 60 * 60];
    static readonly QUOTA_FUNCTIONS = [
        (dt: Date) => {
            return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + 1);
        },
        (dt: Date) => {
            return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + 7 - dt.getDay());
        },
        (dt: Date) => {
            return new Date(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
        },
        (dt: Date) => {
            return new Date(dt.getFullYear() + 1, dt.getMonth(), dt.getDate());
        }
    ];

    static PREFETCH = _.flatten(EsQuotaLimiterMiddleware.QUOTA_TYPES.map(t => [`/${t}`, `/${t}/exp`]));

    //static LEASES: Lease[];

    private _etcdKey: string;
    private _destProp: string;
    private _sourceProp: string;
    private _quotaId: string;
    private _quotaTypeProp: string;
    private _quotaProp: string;
    private _strictProp: string;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, api: string, nextMiddleware?: IEsMiddleware) {
        super(after, api, nextMiddleware);

        this._destProp = _.get(values, 'destProp', 'ratelimitres');
        if (!_.isString(this._destProp)) {
            throw new EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'destProp MUST be string');
        }

        this._sourceProp = _.get(values, 'sourceProp');
        if (!_.isString(this._sourceProp)) {
            throw new EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'sourceProp MUST be string');
        }

        this._quotaId = _.get(values, 'quotaId');
        if (!_.isString(this._quotaId)) {
            throw new EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'quotaId MUST be string');
        }

        this._quotaTypeProp = _.get(values, 'quotaTypeProp');
        if (!_.isString(this._quotaTypeProp)) {
            throw new EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'quotaTypeProp MUST be string');
        }

        this._quotaProp = _.get(values, 'quotaProp');
        if (!_.isString(this._quotaProp)) {
            throw new EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'quotaProp MUST be string');
        }

        this._strictProp = _.get(values, 'strictProp');
        if (!_.isString(this._strictProp)) {
            throw new EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'strictProp MUST be string');
        }

        this._etcdKey = `esgateway/runtime/apis/${configuration.env}/${api}/quotas/${this._quotaId}`;
        // this._etcdKey = `esgateway:runtime:apis:${configuration.env}:${api}:quotas:${this._quotaType}:${this._quotaId}`;

        const dt = new Date(Date.now());
        //EsQuotaLimiterMiddleware.LEASES = EsQuotaLimiterMiddleware.QUOTA_FUNCTIONS.map(f => ETCD_CLIENT.lease(Math.floor((f(dt).valueOf() - Date.now())/1000)));
    }

    async loadAsync() { }

    async runInternal(context: IEsContext) {
        const key = _.get(context.properties, this._sourceProp);
        if (!_.isString(key) && !_.isNumber(key)) {
            throw new EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'key MUST be either string or number');
        }

        let quotaType = _.get(context.properties, this._quotaTypeProp);
        if (!_.isString(quotaType)) {
            throw new EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'quotaType MUST be string');
        }
        quotaType = _.toUpper(quotaType);
        const quotaTypeId = EsQuotaLimiterMiddleware.QUOTA_TYPES.indexOf(quotaType);
        if (quotaTypeId < 0) {
            throw new EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'quotaType INVALID');
        }

        const quotaValue = _.get(context.properties, this._quotaProp);
        if (!_.isInteger(quotaValue) || quotaValue <= 0) {
            throw new EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'quota MUST be integer greater than 0');
        }

        const strict = Boolean(_.get(context.properties, this._strictProp, false));

        const now = new Date(Date.now());
        // Calcula chave a partir da data
        const dtExps = EsQuotaLimiterMiddleware.QUOTA_FUNCTIONS.map(f => f(now).valueOf());

        const rKey = `${this._etcdKey}/${key}`;

        let error = false;
        let excp = undefined;

        const func = async () => {
            try {
                let quotas: number[] = [];
                let exps: number[] = [];
                const allKeys = await ns.getAll().numbers();

                quotas = EsQuotaLimiterMiddleware.QUOTA_TYPES.map(t => allKeys[`/${t}`] ?? 0);
                exps = EsQuotaLimiterMiddleware.QUOTA_TYPES.map(t => allKeys[`/${t}/exp`] ?? 0);

                error = now.valueOf() <= exps[quotaTypeId] && quotas[quotaTypeId] >= quotaValue;

                await ns.stm({ retries: 0 }).transact(tx => Promise.all([
                    Promise.all(EsQuotaLimiterMiddleware.QUOTA_TYPES.map(async (t, i) => {
                        if (!error){
                            let val = (await tx.get(`/${t}`).number()) ?? 0;
                            if (now.valueOf() > exps[i]) val = 0;
                            await tx.put(`/${t}`).value(val+1);
                        }
                        else if (now.valueOf() > exps[i]) {
                            await tx.put(`/${t}`).value(1);
                        }
                        await tx.put(`/${t}/exp`).value(dtExps[i]);
                    }))
                ]));
            }
            catch (err) {
                excp = err;
            }
        }

        const ns = ETCD_CLIENT.namespace(rKey);
        if (strict) await ns.lock(`/mutex`).ttl(5).do(func);
        else await func();

        if (excp !== undefined) {
            throw new EsMiddlewareError(EsQuotaLimiterMiddleware.name, `Error updating quotas`, excp);
        }

        if (error) {
            throw new EsMiddlewareError(EsQuotaLimiterMiddleware.name, `Maximum quota reached`, undefined, `Quota: ${quotaValue} per ${quotaType}`, 429);
        }
    }
};

export const MiddlewareCtor: IEsMiddlewareConstructor = EsQuotaLimiterMiddleware;

export const MiddlewareSchema = {
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
