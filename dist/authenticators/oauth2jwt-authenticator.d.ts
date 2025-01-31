import { IEsAuthenticatorConstructor } from "../core/authenticators";
import { EsOAuth2Authenticator } from './oauth2-authenticator';
export declare class EsOAuth2JwtAuthenticator extends EsOAuth2Authenticator {
    private _issuer;
    private _audience?;
    private _jwksClient;
    constructor(name: string, id: string, params: any);
    loadAsync(): Promise<void>;
    private getKey;
    protected verify(jwtStr: string): Promise<any>;
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
        scopesScript: {
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
