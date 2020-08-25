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
