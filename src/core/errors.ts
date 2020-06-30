

export abstract class EsError {

    innerError: any
    stack?: string
    error: string
    errorDescription: string
    statusCode: number

    constructor(error?:string, errorDescription?:string, statusCode?:number, innerError?:any) {
        this.error = error || 'Error';
        this.errorDescription = errorDescription || 'Contact administrator for more details';
        this.statusCode = statusCode || 500;
        this.innerError = { message: innerError?.message, stack: innerError?.stack, code: innerError?.code, ...innerError };
        Error.captureStackTrace(this);
    }
}

export class EsApiCreationError extends EsError {
    
    api: string

    constructor(api:string, message: string, innerError?:any, errorDescription?:string, statusCode?:number) {
        super(message, errorDescription, statusCode, innerError);
        this.api = api;
    }
};

export class EsTransportError extends EsError {
    
    transport: string;
    
    constructor(transport: string, message: string, innerError?:any, errorDescription?:string, statusCode?:number) {
        super(message, errorDescription, statusCode, innerError);
        this.transport = transport;
    }
};

export class EsMiddlewareError extends EsError {
    
    middleware: string;

    constructor(middleware: string, message: string, innerError?:any, errorDescription?:string, statusCode?:number) {
        super(message, errorDescription, statusCode, innerError);
        this.middleware = middleware;
    }
};

export class EsSchemaError extends EsError {
    
    schemaName: string;
    
    constructor(schemaName: string, message: string, innerError?:any, errorDescription?:string, statusCode?:number) {
        super(message, errorDescription, statusCode, innerError);
        this.schemaName = schemaName;
    }
};

export class EsAuthenticatorError extends EsError {
    
    authenticator: string;
    
    constructor(authenticator: string, message: string, innerError?:any, errorDescription?:string, statusCode?:number) {
        super(message, errorDescription, statusCode, innerError);
        this.authenticator = authenticator;
    }
};
