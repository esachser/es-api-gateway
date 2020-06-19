import { IEsAuthenticatorConstructor } from "../core/authenticators";
import { EsOAuth2Authenticator } from './oauth2-authenticator';
export declare class EsOAuth2InspectAuthenticator extends EsOAuth2Authenticator {
    private _issuer?;
    private _audience?;
    private _inspectUri;
    private _credentialHeader;
    private _credentialValue;
    private _cache;
    constructor(name: string, id: string, params: any);
    loadAsync(): Promise<void>;
    protected verify(tokenStr: string): Promise<any>;
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
        inspectUri: {
            type: string;
            format: string;
        };
        credHeader: {
            type: string;
            minLength: number;
        };
        credValue: {
            type: string;
            minLength: number;
        };
        issuer: {
            type: string;
            minLength: number;
        };
        audience: {
            type: string;
            minLength: number;
        };
    };
};
