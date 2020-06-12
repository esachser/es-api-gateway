// import workerpool from 'workerpool';
import lodash from 'lodash';
import { getMiddlewareConstructor } from './middlewares';
import { getTransportConstructor } from './transports';
import { validateObject } from './schemas';

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
    rawbody: string
    parsedbody?: any
}

export interface IEsMiddlewareConstructor {
    new(values: any, after: boolean, nextMiddleware?: IEsMiddleware): IEsMiddleware
}

export interface IEsMiddleware {
    next?: IEsMiddleware
    execute(context: IEsContext): Promise<void>
    loadAsync(values:any): Promise<void>
}

export abstract class EsMiddleware implements IEsMiddleware {
    next?: IEsMiddleware

    after: boolean

    abstract async loadAsync(values:any): Promise<void>

    abstract async runInternal(context: IEsContext): Promise<void>

    constructor(after: boolean, nextMiddleware: IEsMiddleware | undefined) {
        this.after = after;
        this.next = nextMiddleware;
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
    new (params: any, middleware?: IEsMiddleware): IEsTransport
}

export interface IEsTransport {
    middleware: IEsMiddleware | undefined
    loadAsync(params: any): Promise<void>
    clear(): void
}

export async function createMiddleware(arr: any[], idx: number): Promise<IEsMiddleware | undefined> {
    if (idx >= arr.length) {
        return undefined;
    }

    const type = lodash.get(arr[idx], 'type');
    const data = lodash.get(arr[idx], 'data');
    const after = lodash.get(arr[idx], 'after', false);

    const ctor = getMiddlewareConstructor(type);

    const v = await validateObject(type, data);

    if (ctor !== undefined && v) {
        const mid = new ctor(data, Boolean(after), await createMiddleware(arr, idx + 1));
        await mid.loadAsync(data);
        return mid;
    }
    return createMiddleware(arr, idx + 1);
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

export async function createTransport(type: string, parameters: any, middleware: IEsMiddleware | undefined) {
    const ctor = getTransportConstructor(type);

    const v = await validateObject(type, parameters);

    if (ctor !== undefined && v) {
        const transport = new ctor(parameters, middleware);
        await transport.loadAsync(parameters);
        return transport;
    }

    return undefined;
}