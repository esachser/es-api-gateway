import { logger } from "../util/logger";
import { addNewSchema, validateObject } from "./schemas";
import { EsAuthenticatorError } from "./errors";

export interface IEsAuthenticator {
    name: string
    id: string

    loadAsync(params: any): Promise<void>

    validate(params: any): Promise<any>
}

export interface IEsAuthenticatorConstructor {
    new (name: string, id: string, params: any): IEsAuthenticator
}

export abstract class EsAuthenticator implements IEsAuthenticator {
    name: string
    id: string

    constructor(name: string, id: string) {
        this.name = name;
        this.id = id;
    }

    abstract async loadAsync(params: any): Promise<void>

    abstract validate(params: any): Promise<any>
}

const authenticators: { [id: string]: IEsAuthenticatorConstructor } = {};

export function addAuthenticatorConstructor(type: string, constructor: IEsAuthenticatorConstructor, parameters: any) {
    try {
        logger.info(`Loading ${type} Authenticator`);
        authenticators[type] = constructor;
        addNewSchema(type, parameters);
    }
    catch (err) {
        logger.error(`Error loading middleware ${type} -- `, err);
    }
}

export function getAuthenticatorConstructor(type: string): IEsAuthenticatorConstructor | undefined {
    return authenticators[type];
}

const authenticatorObjs: Map<string, IEsAuthenticator> = new Map;

export async function createAuthenticator(type: string, name: string, id: string, parameters: any) {
    if (authenticatorObjs.get(id) !== undefined) {
        throw new EsAuthenticatorError(type, `Id ${id} already in use`);
    }

    const ctor = getAuthenticatorConstructor(type);
    if (ctor === undefined) {
        throw new EsAuthenticatorError(type, `Constructor of ${type} doesnt exists`);
    }

    const v = await validateObject(type, parameters);

    if (!v) {
        throw new EsAuthenticatorError(type, `${type} parameters are invalid`);
    }

    const authenticator = new ctor(name, id, parameters);
    await authenticator.loadAsync(parameters);

    authenticatorObjs.set(id, authenticator);

    return authenticator;
}

export function getAuthenticator(id: string) {
    return authenticatorObjs.get(id);
}

export function removeAuthenticator(id: string) {
    authenticatorObjs.delete(id);
}

export function clearAuthenticators() {
    authenticatorObjs.clear();
}