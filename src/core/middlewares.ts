import { logger } from "../util/logger";
import { addNewSchema, validateObject } from "./schemas";
import { EventEmitter } from 'events';
import { reloadApi } from "../envs";
import events from 'events';
import { IEsContext, applyMixins } from ".";
import { EsMiddlewareError } from "./errors";
import _ from "lodash";

export interface IEsMiddlewareConstructor {
    new(values: any, after: boolean, api: string, nextMiddleware?: IEsMiddleware): IEsMiddleware
}

export interface IEsMiddleware extends events.EventEmitter{
    next?: IEsMiddleware
    execute(context: IEsContext): Promise<void>
    loadAsync(values:any): Promise<void>
}
export class IEsMiddleware { }
applyMixins(IEsMiddleware, [events.EventEmitter]);

export abstract class EsMiddleware extends IEsMiddleware {
    next?: IEsMiddleware

    after: boolean

    api: string

    abstract async loadAsync(values:any): Promise<void>

    abstract async runInternal(context: IEsContext): Promise<void>

    constructor(after: boolean, api: string, nextMiddleware: IEsMiddleware | undefined) {
        super();
        this.after = after;
        this.next = nextMiddleware;
        this.api = api;
    }

    async execute(context: IEsContext): Promise<void> {
        if (context.logger.level === 'debug') {
            context.logger.debug({ properties: context.properties, middleware: this.constructor.name });
        }
        if (this.after) {
            await this.next?.execute(context);
            await this.runInternal(context);
        }
        else {
            await this.runInternal(context);
            await this.next?.execute(context);
        }
    }
}

export async function createMiddleware(arr: any[], idx: number, api: string): Promise<IEsMiddleware | undefined> {
    if (idx >= arr.length) {
        return undefined;
    }

    const type = _.get(arr[idx], 'type');
    const data = _.get(arr[idx], 'data');
    const after = _.get(arr[idx], 'after', false);

    const ctor = getMiddlewareConstructor(type);

    if (ctor === undefined) {
        throw new EsMiddlewareError(type, `Constructor of ${type} doesnt exists`);
    }

    const v = await validateObject(type, data);

    if (!v) {
        throw new EsMiddlewareError(type, `${type} parameters are invalid`);
    }

    const mid = new ctor(data, Boolean(after), api, await createMiddleware(arr, idx + 1, api));
    await mid.loadAsync(data);
    return mid;
}

function connect2Mids(mid1: IEsMiddleware, mid2: IEsMiddleware) {
    let mid = mid1;

    while (mid.next !== undefined) mid = mid.next;

    mid.next = mid2;
}

export function connectMiddlewares(...middlewares: (IEsMiddleware | undefined)[]) {
    let mid = undefined;

    if (middlewares.length > 0) {

        mid = middlewares[0];

        let i = 1;

        while (mid === undefined) {
            mid = middlewares[i];
            i++;
        }

        for (; i < middlewares.length; i++) {
            let md = middlewares[i];
            if (md !== undefined) {
                connect2Mids(mid, md);
            }
        }
    }

    return mid;
}

export function copyMiddleware(mid?: IEsMiddleware): IEsMiddleware | undefined {
    if (mid === undefined) {
        return undefined;
    }
    const nmid = _.clone(mid);
    nmid.next = copyMiddleware(mid.next);
    return nmid;
}

const mids: {[id:string]:{mc:IEsMiddlewareConstructor, custom:boolean}} = {};

export function addMiddleware(name: string, constructor: IEsMiddlewareConstructor, parameters: any, custom=false) {
    try {
        logger.info(`Loading ${name} Middleware`);
        addNewSchema(name, parameters);
        mids[name] = {
            mc: constructor,
            custom
        };
    }
    catch (err) {
        logger.error(`Error loading middleware ${name} -- `, err);
    }
}

export function getMiddlewareConstructor(name: string): IEsMiddlewareConstructor | undefined {
    return mids[name]?.mc;
}

export function removeAllCustomMiddlewares() {
    for(const k of Object.keys(mids)) {
        if (mids[k].custom) {
            delete mids[k];
        }
    }
}

export function removeMiddleware(name: string) {
    if (mids[name] !== undefined) {
        delete mids[name];
    }
}

export function getCustomConstructor(mids: any[], changeEmitter: EventEmitter): IEsMiddlewareConstructor {
    return class C extends EsMiddleware {
        private static emitters: {[id:string]:boolean} = {};
        private _mid?: IEsMiddleware;

        constructor(_values: any, after: boolean, api:string, nextMiddleware?: IEsMiddleware) {
            super(after, api, nextMiddleware);
            if (!Boolean(C.emitters[api])){
                changeEmitter.once('change', () => setImmediate(() => {
                    reloadApi(this.api).catch(err => logger.error(`Error reloading API ${this.api}`, err));
                }));
                C.emitters[this.api] = true;
            }
        }

        async loadAsync() {
            this._mid = await createMiddleware(mids, 0, this.api);
        }

        async runInternal(context: IEsContext) {
            if (this._mid !== undefined) {
                await this._mid.execute(context);
            }
        }
    };
}

export function getCustomSchema(name: string) {
    return {
        "$schema": "http://json-schema.org/draft-07/schema",
        "$id": `https://esachser.github.io/es-apigw/v1/schemas/Custom-${name}`,
        "title": `Custom Middleware (${name})`,
        "type": "object",
        "additionalProperties": true
    };
}