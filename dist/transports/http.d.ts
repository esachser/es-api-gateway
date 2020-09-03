export declare const TransportContructor: import("../core/transports").IEsTranportConstructor;
export declare const TransportSchema: {
    $schema: string;
    $id: string;
    title: string;
    type: string;
    additionalProperties: boolean;
    required: string[];
    properties: {
        routes: {
            type: string;
            additionalProperties: boolean;
            patternProperties: {
                ".*": {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            method: {
                                type: string;
                                enum: string[];
                            };
                            mids: {
                                type: string;
                                items: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        routeContext: {
            type: string;
        };
    };
};
