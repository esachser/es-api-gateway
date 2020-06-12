

export class EsApiCreationError extends Error {
    
    readonly api: string

    constructor(api:string, message: string) {
        super(message);
        this.api = api;
    }
};

export class EsTransportError extends Error {
    
    readonly transport: string
    
    constructor(transport: string, message: string) {
        super(message);
        this.transport = transport;
    }
};

export class EsMiddlewareError extends Error {
    
    readonly middleware: string
    
    constructor(middleware: string, message: string) {
        super(message);
        this.middleware = middleware;
    }
};
