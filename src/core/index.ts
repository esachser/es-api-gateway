// import workerpool from 'workerpool';
import lodash from 'lodash';
import { getMiddlewareConstructor } from '../middlewares';
import { getTransportConstructor } from '../transports';


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

export type EsObjectSchema = { type: 'object', optional: boolean, schema: EsObjectSchema, defaultValue?: any };
export type EsOtherSchema = { type: 'string' | 'number' | 'boolean' | 'any' | 'array', optional: boolean, defaultValue?: any };

export type EsSchema = EsObjectSchema | EsOtherSchema;
export type EsParameters = { [id:string] : EsSchema };

export interface IEsMiddlewareConstructor {
    new(values: any, nextMiddleware?: IEsMiddleware): IEsMiddleware
}

export interface IEsMiddleware {
    next?: IEsMiddleware
    execute(context: IEsContext): void
}

export interface IEsMiddlewareParams {
    parameters: EsParameters
    isInOut: boolean
}

export interface IEsTranportConstructor {
    new (params: any, middleware?: IEsMiddleware): IEsTransport
}

export interface IEsTransport {
    parameters: EsParameters
    middleware: IEsMiddleware | undefined
    clear(): void
}

// Rodar em um pool de trabalhadores os middlewares

// const pool = workerpool.pool();

// import workertr from 'worker_threads';

// export async function runMiddlewares(mid: IEsMiddleware | undefined, ctx: IEsContext) {
//     if (mid !== undefined) {
//         await pool.exec(mid.execute, [ctx]);
//     }
// }

export function createMiddleware(arr: any[], idx: number): IEsMiddleware | undefined {
    if (idx >= arr.length) {
        return undefined;
    }

    const type = lodash.get(arr[idx], 'type');
    const data = lodash.get(arr[idx], 'data');

    const ctor = getMiddlewareConstructor(type);

    if (ctor !== undefined) {
        return new ctor(data, createMiddleware(arr, idx + 1));
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

export function createTransport(type: string, parameters: any, middleware: IEsMiddleware | undefined) {
    const ctor = getTransportConstructor(type);

    if (ctor !== undefined) {
        return new ctor(parameters, middleware);
    }

    return undefined;
}