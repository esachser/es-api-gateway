import { EsAuthenticator, IEsAuthenticatorConstructor } from "../core/authenticators";
export declare class EsOAuth2JwtAuthenticator extends EsAuthenticator {
    private _scopesProp;
    private _jwksClient;
    constructor(name: string, id: string, params: any);
    loadAsync(): Promise<void>;
    validate(params: any): Promise<{}>;
}
export declare const AuthenticatorContructor: IEsAuthenticatorConstructor;
export declare const AuthenticatorSchema: {
    $schema: string;
    $id: string;
    title: string;
    type: string;
    additionalProperties: boolean;
    required: string[];
    properties: {
        jwksUri: {
            type: string;
            format: string;
        };
        scopesProp: {
            type: string;
            minLength: number;
        };
    };
};
