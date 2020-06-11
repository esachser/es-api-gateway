import { IEsTranportConstructor } from ".";
export declare function addTransport(name: string, constructor: IEsTranportConstructor, parameters: any): void;
export declare function getTransportConstructor(name: string): IEsTranportConstructor | undefined;
