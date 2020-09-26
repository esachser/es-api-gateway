import { EsAuthenticator, IEsAuthenticatorConstructor } from "../core/authenticators";
export declare class EsBasicAuthenticator extends EsAuthenticator {
    private _db;
    private _findQuery;
    private _roleQuery;
    private _userColumn;
    private _roleColumn;
    constructor(name: string, id: string, params: any);
    loadAsync(): Promise<void>;
    protected verify(tokenStr: string): Promise<any>;
    validate(params: any): Promise<any>;
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
        findQuery: {
            type: string;
            minLength: number;
        };
        roleQuery: {
            type: string;
            minLength: number;
        };
        userColumn: {
            type: string;
            minLength: number;
        };
        roleColumn: {
            type: string;
            minLength: number;
        };
        dbId: {
            type: string;
            minLength: number;
        };
    };
};
