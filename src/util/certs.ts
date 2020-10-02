import forge from 'node-forge';
import fs from 'fs';
import path from 'path';
import { baseDirectory } from '.';
import { configuration } from './config';
import Keyv from 'keyv';
import util from 'util';

const fsasync = {
    stat: util.promisify(fs.stat),
    mkdir: util.promisify(fs.mkdir),
    writeFile: util.promisify(fs.writeFile),
    readFile: util.promisify(fs.readFile),
    unlink: util.promisify(fs.unlink)
}

const cacheFiles = new Keyv({
    ttl: 60 * 60 * 1000,
});

export async function getPublicCert(api: string, certName: string) {
    const fname = path.resolve(baseDirectory, 'resources', configuration.env, api, certName);
    const fcontents = await cacheFiles.get(fname);
    if (fcontents !== undefined) {
        return fcontents;
    }
    const fileContents = await fsasync.readFile(fname, 'binary');
    cacheFiles.set(fname, fileContents);
    return fileContents;
}

export async function getPrivateKey(api: string, certName: string, certPass?: string) {
    const fname = path.resolve(baseDirectory, 'resources', configuration.env, api, certName);
    const fcontents = await cacheFiles.get(`${certPass}::/::${fname}`);
    if (fcontents !== undefined) {
        return fcontents;
    }
    const fileContents = await fsasync.readFile(fname, 'binary');
    const pem = forge.pem.decode(fileContents)[0];
    if (!pem.type.includes('PRIVATE')) {
        return undefined;
    }
    let pkStr: string;
    if (pem.type.includes('ENCRYPTED') && certPass !== undefined) {
        const privateKey = forge.pki.decryptRsaPrivateKey(fileContents, certPass);
        pkStr = forge.pki.privateKeyToPem(privateKey);
    }
    else {
        pkStr = fileContents;
    }
    cacheFiles.set(`${certPass}::/::${fname}`, pkStr);
    return pkStr;
}
