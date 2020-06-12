export declare class EsApiCreationError extends Error {
    readonly api: string;
    constructor(api: string, message: string);
}
export declare class EsTransportError extends Error {
    readonly transport: string;
    constructor(transport: string, message: string);
}
export declare class EsMiddlewareError extends Error {
    readonly middleware: string;
    constructor(middleware: string, message: string);
}
