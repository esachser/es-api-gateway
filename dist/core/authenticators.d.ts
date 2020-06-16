export interface IEsAuthenticator {
    name: string;
    id: string;
    loadAsync(params: any): Promise<void>;
    validate(params: any): Promise<any>;
}
export interface IEsAuthenticatorConstructor {
    new (name: string, id: string, params: any): IEsAuthenticator;
}
export declare abstract class EsAuthenticator implements IEsAuthenticator {
    name: string;
    id: string;
    constructor(name: string, id: string);
    abstract loadAsync(params: any): Promise<void>;
    abstract validate(params: any): Promise<any>;
}
export declare function addAuthenticatorConstructor(type: string, constructor: IEsAuthenticatorConstructor, parameters: any): void;
export declare function getAuthenticatorConstructor(type: string): IEsAuthenticatorConstructor | undefined;
export declare function createAuthenticator(type: string, name: string, id: string, parameters: any): Promise<IEsAuthenticator>;
export declare function getAuthenticator(id: string): IEsAuthenticator | undefined;
export declare function removeAuthenticator(id: string): void;
export declare function clearAuthenticators(): void;
