import { IEsMiddlewareConstructor } from ".";
import { logger } from "../util/logger";
import { addNewSchema } from "./schemas";

const mids: {[id:string]:IEsMiddlewareConstructor} = {};

export function addMiddleware(name: string, constructor: IEsMiddlewareConstructor, parameters: any) {
    logger.info('Loading Property Middleware');
    mids[name] = constructor;
    addNewSchema(name, parameters);
}

export function getMiddlewareConstructor(name: string): IEsMiddlewareConstructor | undefined {
    return mids[name];
}