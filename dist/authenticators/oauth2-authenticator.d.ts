/// <reference types="node" />
import vm from 'vm';
import { EsAuthenticator } from '../core/authenticators';
export declare abstract class EsOAuth2Authenticator extends EsAuthenticator {
    protected _scopesScript: vm.Script;
    constructor(name: string, id: string, scopesScript: string);
    protected abstract verify(token: string): Promise<any>;
    validate(params: any): Promise<any>;
}
