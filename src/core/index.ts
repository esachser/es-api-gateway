// import workerpool from 'workerpool';
import _ from 'lodash';
import { getMiddlewareConstructor } from './middlewares';
import { getTransportConstructor } from './transports';
import { validateObject } from './schemas';
import { Logger } from 'winston';
import { EsTransportError, EsMiddlewareError } from './errors';
import events from 'events';

export function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            const desc = Object.getOwnPropertyDescriptor(baseCtor.prototype, name);
            const derivedDesc = Object.getOwnPropertyDescriptor(derivedCtor.prototype, name);
            if (desc !== undefined && derivedDesc === undefined) {
                Object.defineProperty(
                    derivedCtor.prototype,
                    name,
                    desc
                );
            }
        });
    });
};

export interface IEsContext {
    properties: { [id:string] : any }
    body?: string
    logger: Logger,
    meta: {
        api:string,
        transport:string,
        uid:string
    }
}

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

export interface IEsTranportConstructor {
    new (params: any, api: string, tid: string, logger: Logger, middleware?: IEsMiddleware, initMiddleware?: IEsMiddleware): IEsTransport
}

export interface IEsTransport {
    middleware: IEsMiddleware | undefined
    loadAsync(params: any): Promise<void>
    clear(): void
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

export function connect2Mids(mid1: IEsMiddleware, mid2: IEsMiddleware) {
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

export async function createTransport(type: string, api: string, tid: string, logger: Logger, parameters: any, middleware: IEsMiddleware | undefined, initialMid?: IEsMiddleware) {
    const ctor = getTransportConstructor(type);
    if (ctor === undefined) {
        throw new EsTransportError(type, `Constructor of ${type} doesnt exists`);
    }

    const v = await validateObject(type, parameters);

    if (!v) {
        throw new EsTransportError(type, `${type} parameters are invalid`);
    }

    const transport = new ctor(parameters, api, tid, logger, middleware, initialMid);
    await transport.loadAsync(parameters);
    return transport;
}
