import { logger } from "../util/logger";
import { addNewSchema, validateObject } from "./schemas";
import { Logger } from "winston";
import { EsTransportError } from "./errors";
import { IEsMiddleware } from "./middlewares";

export interface IEsTranportConstructor {
    new (params: any, api: string, tid: string, logger: Logger, middleware?: IEsMiddleware, initMiddleware?: IEsMiddleware): IEsTransport
}

export interface IEsTransport {
    middleware: IEsMiddleware | undefined
    loadAsync(params: any): Promise<void>
    clear(): void
}

const transports: { [id: string]: IEsTranportConstructor } = {};

export function addTransport(name: string, constructor: IEsTranportConstructor, parameters: any) {
    try {
        logger.info(`Loading ${name} Tranport`);
        transports[name] = constructor;
        addNewSchema(name, parameters);
    }
    catch (err) {
        logger.error(`Error loading transport ${name} -- `, err);
    }
}

export function getTransportConstructor(name: string): IEsTranportConstructor | undefined {
    return transports[name];
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