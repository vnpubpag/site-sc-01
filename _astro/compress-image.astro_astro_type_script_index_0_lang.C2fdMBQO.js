const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["_astro/jszip.min.CIaaoH_6.js","_astro/_commonjsHelpers.DsqdWQfm.js"])))=>i.map(i=>d[i]);
import { _ as C } from "./preload-helper.CVfkMyKi.js";
(async ()=>{
    const z = 30 * 1024 * 1024;
    function E(t) {
        return t < 1024 ? t + " B" : t < 1024 * 1024 ? (t / 1024).toFixed(1) + " KB" : (t / (1024 * 1024)).toFixed(2) + " MB";
    }
    const I = {
        png: "image/png",
        webp: "image/webp",
        avif: "image/avif"
    }, c = new Map;
    let $ = 0, u = !1;
    const b = [], v = new Worker(new URL("/_astro/worker-us_WLHDk.js", import.meta.url), {
        type: "module"
    }), l = document.getElementById("cimg-dropzone"), a = document.getElementById("cimg-file-input"), w = document.getElementById("cimg-select-btn"), x = document.getElementById("cimg-files-section"), F = document.getElementById("cimg-file-count"), p = document.getElementById("cimg-file-list"), U = document.getElementById("cimg-add-more"), S = document.getElementById("cimg-compress-all"), B = document.getElementById("cimg-download-all"), R = document.getElementById("cimg-file-row-tpl");
    function _() {
        const t = c.size;
        x.style.display = t > 0 ? "" : "none", l.style.display = t > 0 ? "none" : "", F.textContent = t + " ảnh";
        const e = [
            ...c.values()
        ].filter((n)=>n.results).length;
        B.disabled = e === 0;
        const s = [
            ...c.values()
        ].filter((n)=>!n.results).length;
        S.disabled = s === 0 || u;
    }
    function M(t) {
        const s = R.content.cloneNode(!0).querySelector(".cimg-file");
        s.dataset.id = t.id;
        const n = s.querySelector(".cimg-file__img");
        n.src = URL.createObjectURL(t.file), n.alt = t.file.name, s.querySelector(".cimg-file__name").textContent = t.file.name, s.querySelector(".cimg-file__size").textContent = E(t.file.size);
        const r = s.querySelector(".cimg-file__status");
        return r.textContent = "Chờ nén", s.querySelector(".cimg-file__remove").addEventListener("click", ()=>{
            c.delete(t.id), s.remove(), _();
        }), s;
    }
    function j(t, e, s) {
        const n = p.querySelector(`[data-id="${t}"]`);
        if (!n) return;
        const r = n.querySelector(".cimg-file__bar-fill"), i = n.querySelector(".cimg-file__percent"), f = n.querySelector(".cimg-file__status"), m = n.querySelector(".cimg-file__progress");
        m.style.display = "", r.style.width = e + "%", i.textContent = e + "%", f.textContent = s, f.className = "cimg-file__status cimg-file__status--active";
    }
    function N(t, e) {
        const s = c.get(t);
        if (!s) return;
        s.results = e.results, s.bestFormat = e.bestFormat, s.bestBuffer = e.bestBuffer;
        const n = p.querySelector(`[data-id="${t}"]`);
        if (!n) return;
        const r = n.querySelector(".cimg-file__progress");
        r.style.display = "none";
        const i = n.querySelector(".cimg-file__result");
        i.style.display = "";
        const f = n.querySelector(".cimg-file__sizes");
        f.innerHTML = "";
        for (const d of e.results){
            const o = document.createElement("span");
            o.className = "cimg-file__format-tag", d.format === e.bestFormat && o.classList.add("cimg-file__format-tag--best"), o.textContent = `${d.format.toUpperCase()}: ${E(d.size)}`, f.appendChild(o);
        }
        const m = n.querySelector(".cimg-file__reduction"), L = e.originalSize - e.bestSize, q = e.originalSize > 0 ? Math.round(L / e.originalSize * 100) : 0;
        L > 0 ? m.textContent = `Tốt nhất: ${e.bestFormat.toUpperCase()} — giảm ${q}%` : m.textContent = "Ảnh đã được tối ưu sẵn";
        const y = n.querySelector(".cimg-file__download");
        y.disabled = !1, y.querySelector(".cimg-file__dl-label").textContent = `Tải ${e.bestFormat.toUpperCase()}`, y.addEventListener("click", ()=>{
            if (!s.bestBuffer || !s.bestFormat) return;
            const d = new Blob([
                s.bestBuffer
            ], {
                type: I[s.bestFormat] || "application/octet-stream"
            }), o = document.createElement("a");
            o.href = URL.createObjectURL(d);
            const k = s.file.name.replace(/\.\w+$/, "");
            o.download = `${k}-compressed.${s.bestFormat}`, o.click(), URL.revokeObjectURL(o.href);
        }), _();
    }
    function T(t, e) {
        const s = p.querySelector(`[data-id="${t}"]`);
        if (!s) return;
        const n = s.querySelector(".cimg-file__status");
        n.textContent = "Lỗi: " + e, n.className = "cimg-file__status cimg-file__status--error";
        const r = s.querySelector(".cimg-file__bar-fill");
        r.style.width = "0%";
        const i = s.querySelector(".cimg-file__percent");
        i.textContent = "";
    }
    function g() {
        if (u || b.length === 0) return;
        const t = b.shift(), e = c.get(t);
        if (!e) {
            g();
            return;
        }
        u = !0, _(), e.file.arrayBuffer().then((s)=>{
            v.postMessage({
                type: "compress",
                id: e.id,
                buffer: s,
                fileName: e.file.name,
                mimeType: e.file.type
            }, [
                s
            ]);
        });
    }
    v.onmessage = (t)=>{
        const e = t.data;
        switch(e.type){
            case "ready":
                break;
            case "progress":
                j(e.id, e.pct, e.status);
                break;
            case "result":
                N(e.id, e), u = !1, g();
                break;
            case "error":
                T(e.id, e.message), u = !1, g();
                break;
        }
    };
    v.postMessage({
        type: "init"
    });
    function h(t) {
        for (const e of t){
            if (!e.type.match(/^image\/(png|jpeg)$/)) continue;
            if (e.size > z) {
                alert(`"${e.name}" quá lớn (${E(e.size)}). Giới hạn tối đa là 30 MB.`);
                continue;
            }
            const s = String($++), n = {
                id: s,
                file: e,
                results: null,
                bestFormat: null,
                bestBuffer: null
            };
            c.set(s, n);
            const r = M(n);
            p.appendChild(r);
        }
        _();
    }
    w.addEventListener("click", (t)=>{
        t.stopPropagation(), a.click();
    });
    l.addEventListener("click", (t)=>{
        w.contains(t.target) || a.click();
    });
    a.addEventListener("change", ()=>{
        a.files && h(a.files), a.value = "";
    });
    U.addEventListener("click", ()=>a.click());
    l.addEventListener("dragover", (t)=>{
        t.preventDefault(), l.classList.add("dragover");
    });
    l.addEventListener("dragleave", ()=>l.classList.remove("dragover"));
    l.addEventListener("drop", (t)=>{
        t.preventDefault(), l.classList.remove("dragover"), t.dataTransfer?.files && h(t.dataTransfer.files);
    });
    S.addEventListener("click", ()=>{
        for (const [t, e] of c)e.results || b.push(t);
        g();
    });
    B.addEventListener("click", async ()=>{
        const t = (await C(async ()=>{
            const { default: r } = await import("./jszip.min.CIaaoH_6.js").then((i)=>i.j);
            return {
                default: r
            };
        }, __vite__mapDeps([0,1]))).default, e = new t;
        for (const r of c.values()){
            if (!r.bestBuffer || !r.bestFormat) continue;
            const i = r.file.name.replace(/\.\w+$/, "");
            e.file(`${i}-compressed.${r.bestFormat}`, r.bestBuffer);
        }
        const s = await e.generateAsync({
            type: "blob"
        }), n = document.createElement("a");
        n.href = URL.createObjectURL(s), n.download = "images-compressed.zip", n.click(), URL.revokeObjectURL(n.href);
    });
})();
