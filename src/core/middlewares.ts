import { IEsMiddlewareConstructor, EsMiddleware, IEsMiddleware, IEsContext, createMiddleware } from ".";
import { logger } from "../util/logger";
import { addNewSchema } from "./schemas";
import { EventEmitter } from 'events';
import { reloadApi } from "../envs";

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