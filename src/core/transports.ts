import { IEsTranportConstructor } from ".";
import { logger } from "../util/logger";
import { addNewSchema } from "./schemas";

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