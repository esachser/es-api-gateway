"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EsStringTo = {
    transformBufferToAny(input, opts) {
        var _a;
        const encoding = (_a = opts === null || opts === void 0 ? void 0 : opts.encoding) !== null && _a !== void 0 ? _a : 'utf8';
        return Promise.resolve(input.toString(encoding));
    }
};
exports.default = EsStringTo;
//# sourceMappingURL=to.js.map