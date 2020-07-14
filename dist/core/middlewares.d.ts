import { IEsMiddlewareConstructor } from ".";
export declare function addMiddleware(name: string, constructor: IEsMiddlewareConstructor, parameters: any, custom?: boolean): void;
export declare function getMiddlewareConstructor(name: string): IEsMiddlewareConstructor | undefined;
export declare function removeAllCustomMiddlewares(): void;
export declare function removeMiddleware(name: string): void;
export declare function getCustomConstructor(mids: any[]): IEsMiddlewareConstructor;
export declare function getCustomSchema(name: string): {
    $schema: string;
    $id: string;
    title: string;
    type: string;
    additionalProperties: boolean;
};
