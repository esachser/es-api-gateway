export declare const MIDDLEWARE_SCHEMA: {
    $schema: string;
    $id: string;
    title: string;
    type: string;
    additionalProperties: boolean;
    required: string[];
    properties: {
        type: {
            type: string;
        };
        data: {
            type: string;
        };
        after: {
            type: string;
        };
    };
};
export declare const TRANSPORT_SCHEMA: {
    $schema: string;
    $id: string;
    additionalProperties: boolean;
    title: string;
    type: string;
    required: string[];
    properties: {
        type: {
            type: string;
        };
        id: {
            type: string;
        };
        parameters: {
            type: string;
        };
        mids: {
            type: string;
            items: {
                $ref: string;
            };
        };
    };
};
export declare const API_SCHEMA: {
    $schema: string;
    $id: string;
    title: string;
    type: string;
    required: string[];
    properties: {
        transports: {
            type: string;
            items: {
                $ref: string;
            };
        };
        execution: {
            type: string;
            items: {
                $ref: string;
            };
        };
    };
};
export declare function loadJsonSchemaValidator(): void;
export declare function addNewSchema(name: string, schema: any): void;
export declare function validateObject(schemaName: string, obj: any): Promise<boolean>;
