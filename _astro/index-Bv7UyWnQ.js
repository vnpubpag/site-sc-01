import { t as r } from "./index-CWvpOmY5.js";
let u;
let __tla = (async ()=>{
    const s = {
        level: 2,
        interlace: !1,
        optimiseAlpha: !1
    };
    async function l(i) {
        const { default: t, initThreadPool: e, optimise: n, optimise_raw: o } = await import("./squoosh_oxipng-C11oA-ze.js");
        return await t(i), await e(globalThis.navigator.hardwareConcurrency), {
            optimise: n,
            optimise_raw: o
        };
    }
    async function c(i) {
        const { default: t, optimise: e, optimise_raw: n } = await import("./squoosh_oxipng-dICN29Ud.js");
        return await t(i), {
            optimise: e,
            optimise_raw: n
        };
    }
    let a;
    async function f(i) {
        var t;
        if (!a) {
            const e = ((t = globalThis.navigator) === null || t === void 0 ? void 0 : t.hardwareConcurrency) > 1;
            typeof self < "u" && typeof WorkerGlobalScope < "u" && self instanceof WorkerGlobalScope && e && await r() ? a = l(i) : a = c(i);
        }
        return a;
    }
    u = async function(i, t = {}) {
        const e = {
            ...s,
            ...t
        }, { optimise: n, optimise_raw: o } = await f();
        return i instanceof ImageData ? o(i.data, i.width, i.height, e.level, e.interlace, e.optimiseAlpha).buffer : n(new Uint8Array(i), e.level, e.interlace, e.optimiseAlpha).buffer;
    };
})();
export { u as optimise, __tla };
