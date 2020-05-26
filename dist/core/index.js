"use strict";
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
//# sourceMappingURL=index.js.map