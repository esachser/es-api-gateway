"use strict";
// import workerpool from 'workerpool';
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyMixins = void 0;
function applyMixins(derivedCtor, baseCtors) {
    baseCtors.forEach(function (baseCtor) {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(function (name) {
            var desc = Object.getOwnPropertyDescriptor(baseCtor.prototype, name);
            var derivedDesc = Object.getOwnPropertyDescriptor(derivedCtor.prototype, name);
            if (desc !== undefined && derivedDesc === undefined) {
                Object.defineProperty(derivedCtor.prototype, name, desc);
            }
        });
    });
}
exports.applyMixins = applyMixins;
;
// Rodar em um pool de trabalhadores os middlewares
// const pool = workerpool.pool();
// import workertr from 'worker_threads';
// export async function runMiddlewares(mid: IEsMiddleware | undefined, ctx: IEsContext) {
//     if (mid !== undefined) {
//         await pool.exec(mid.execute, [ctx]);
//     }
// }
//# sourceMappingURL=index.js.map