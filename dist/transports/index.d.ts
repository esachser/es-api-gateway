import { IEsTranportConstructor } from '../core';
export declare function loadTransports(): void;
export declare function loadCustomTransports(): void;
export declare function getTransportConstructor(name: string): IEsTranportConstructor | undefined;
