

export class EsApiCreationError extends Error {
    
    readonly api: string

    constructor(api:string, message: string) {
        super(message);
        this.api = api;
    }
};

export class EsTransportError extends Error {
    
    readonly transport: string;
    readonly error: any;
    
    constructor(transport: string, message: string, error?: any) {
        super(message);
        this.transport = transport;
        this.error = error;
    }
};

export class EsMiddlewareError extends Error {
    
    readonly middleware: string
    readonly error: any;
    
    constructor(middleware: string, message: string, error?: any) {
        super(message);
        this.middleware = middleware;
        this.error = error;
    }
};

export class EsSchemaError extends Error {
    
    readonly schemaName: string
    readonly error: any;
    
    constructor(schemaName: string, message: string, error?: any) {
        super(message);
        this.schemaName = schemaName;
        this.error = error;
    }
};
