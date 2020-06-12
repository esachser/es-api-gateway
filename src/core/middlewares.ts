import { IEsMiddlewareConstructor } from ".";
import { logger } from "../util/logger";
import { addNewSchema } from "./schemas";

const mids: {[id:string]:IEsMiddlewareConstructor} = {};

export function addMiddleware(name: string, constructor: IEsMiddlewareConstructor, parameters: any) {
    try {
        logger.info(`Loading ${name} Middleware`);
        addNewSchema(name, parameters);
        mids[name] = constructor;
    }
    catch (err) {
        logger.error(`Error loading middleware ${name} -- `, err);
    }
}

export function getMiddlewareConstructor(name: string): IEsMiddlewareConstructor | undefined {
    return mids[name];
}