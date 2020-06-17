export declare abstract class EsError {
    innerError: any;
    stack?: string;
    error: string;
    errorDescription: string;
    statusCode: number;
    constructor(error?: string, errorDescription?: string, statusCode?: number, innerError?: any);
}
export declare class EsApiCreationError extends EsError {
    api: string;
    constructor(api: string, message: string, innerError?: any, errorDescription?: string, statusCode?: number);
}
export declare class EsTransportError extends EsError {
    transport: string;
    constructor(transport: string, message: string, innerError?: any, errorDescription?: string, statusCode?: number);
}
export declare class EsMiddlewareError extends EsError {
    middleware: string;
    constructor(middleware: string, message: string, innerError?: any, errorDescription?: string, statusCode?: number);
}
export declare class EsSchemaError extends EsError {
    schemaName: string;
    constructor(schemaName: string, message: string, innerError?: any, errorDescription?: string, statusCode?: number);
}
export declare class EsAuthenticatorError extends EsError {
    authenticator: string;
    constructor(authenticator: string, message: string, innerError?: any, errorDescription?: string, statusCode?: number);
}
