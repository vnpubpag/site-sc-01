import { _ as t } from "./preload-helper.CVfkMyKi.js";
let l;
let __tla = (async ()=>{
    let r = null;
    l = function() {
        return r || (r = (async ()=>{
            const [o, e] = await Promise.all([
                t(()=>import("./pdf.B9xD6m9y.js").then(async (m)=>{
                        await m.__tla;
                        return m;
                    }), []),
                t(()=>import("./pdf.worker.min.C0m-uwZX.js"), []).then((_)=>_.default)
            ]);
            return o.GlobalWorkerOptions.workerSrc = e, o;
        })()), r;
    };
})();
export { l as g, __tla };
