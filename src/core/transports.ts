import { IEsTranportConstructor } from ".";
import { logger } from "../util/logger";
import { addNewSchema } from "./schemas";

const transports: {[id:string]:IEsTranportConstructor} = {};

export function addTransport(name:string, constructor: IEsTranportConstructor, parameters: any) {
    logger.info('Loading Http Tranport');
    transports[name] = constructor;
    addNewSchema(name, parameters);
}

export function getTransportConstructor(name: string): IEsTranportConstructor | undefined {
    return transports[name];
}