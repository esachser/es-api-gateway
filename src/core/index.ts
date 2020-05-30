// import workerpool from 'workerpool';


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
export type EsOtherSchema = { type: 'string' | 'number' | 'boolean' | 'any', optional: boolean, defaultValue?: any };

export type EsSchema = EsObjectSchema | EsOtherSchema;
export type EsParameters = { [id:string] : EsSchema };

export interface IEsMiddlewareConstructor {
    new(values: any, nextMiddleware?: IEsMiddleware): IEsMiddleware
}

export interface IEsMiddleware {
    parameters: EsParameters
    values: { [id: string]: any };
    isInOut: boolean
    next?: IEsMiddleware
    execute(context: IEsContext): void
}

export interface IEsTranportConstructor {
    new(params: any, middleware?: IEsMiddleware): IEsTransport
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