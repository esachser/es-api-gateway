import path from 'path';
import YAML from 'yaml';
import fs from 'fs';
import util from 'util';

const fsasync = {
    stat: util.promisify(fs.stat),
    mkdir: util.promisify(fs.mkdir),
    writeFile: util.promisify(fs.writeFile),
    readFile: util.promisify(fs.readFile),
    unlink: util.promisify(fs.unlink)
}

export const baseDirectory =  path.resolve('.');

export async function readFileToObject(fname: string) {
    const fileContents = (await fsasync.readFile(fname)).toString();
    const ext = path.extname(fname);

    if (ext === '.json') {
        return JSON.parse(fileContents);
    }
    else if (ext === '.yaml') {
        return YAML.parse(fileContents);
    }
}

export function delay(ms: number): Promise<NodeJS.Timeout> {
    return new Promise(resolve => setTimeout(() => resolve(), ms));
}
