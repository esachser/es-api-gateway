/// <reference types="node" />
import fs from 'fs';
export declare function getResourceFileStream(filename: string, api?: string): Promise<fs.ReadStream>;
export declare function getResourceStat(filename: string, api?: string): Promise<fs.Stats>;
