const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["_astro/jszip.min.CIaaoH_6.js","_astro/_commonjsHelpers.DsqdWQfm.js"])))=>i.map(i=>d[i]);
import { _ as X } from "./preload-helper.CVfkMyKi.js";
(async ()=>{
    const Z = 30 * 1024 * 1024, C = 20;
    function p(e) {
        return e < 1024 ? e + " B" : e < 1024 * 1024 ? (e / 1024).toFixed(1) + " KB" : (e / (1024 * 1024)).toFixed(2) + " MB";
    }
    const R = {
        png: "image/png",
        jpeg: "image/jpeg",
        webp: "image/webp",
        avif: "image/avif"
    }, $ = {
        png: "png",
        jpeg: "jpg",
        webp: "webp",
        avif: "avif"
    }, c = new Map;
    let G = 0, a = !1;
    const g = [];
    let I = "reduce-size";
    const z = new Worker(new URL("/_astro/worker-s1lDZHVB.js", import.meta.url), {
        type: "module"
    }), d = document.getElementById("cimg-dropzone"), m = document.getElementById("cimg-file-input"), j = document.getElementById("cimg-select-btn"), V = document.getElementById("cimg-files-section"), H = document.getElementById("cimg-file-count"), E = document.getElementById("cimg-file-list"), J = document.getElementById("cimg-add-more"), M = document.getElementById("cimg-compress-all"), T = document.getElementById("cimg-download-all"), K = document.getElementById("cimg-file-row-tpl"), v = document.querySelectorAll(".cimg-mode__tab"), U = document.getElementById("cimg-panel-reduce"), x = document.getElementById("cimg-panel-convert");
    document.getElementById("cimg-mode");
    const F = document.getElementById("cimg-options"), O = document.getElementById("cimg-stats"), W = document.getElementById("cimg-stats-count"), Q = document.getElementById("cimg-stats-original"), Y = document.getElementById("cimg-stats-compressed"), ee = document.getElementById("cimg-stats-reduction");
    function te() {
        if (I === "reduce-size") return {
            mode: "reduce-size",
            level: document.querySelector('input[name="cimg-reduce-level"]:checked')?.value || "balanced",
            targetFormat: "webp"
        };
        const e = document.querySelector('input[name="cimg-format"]:checked');
        return {
            mode: "convert-format",
            level: document.querySelector('input[name="cimg-convert-level"]:checked')?.value || "balanced",
            targetFormat: e?.value || "webp"
        };
    }
    v.forEach((e)=>{
        e.addEventListener("click", ()=>{
            if (a) return;
            const t = e.dataset.mode;
            t !== I && (I = t, v.forEach((n)=>n.classList.remove("cimg-mode__tab--active")), e.classList.add("cimg-mode__tab--active"), t === "reduce-size" ? (U.style.display = "", x.style.display = "none") : (U.style.display = "none", x.style.display = ""));
        });
    });
    function _() {
        const e = c.size;
        V.style.display = e > 0 ? "" : "none", d.style.display = e > 0 ? "none" : "", H.textContent = e + " ảnh";
        const t = [
            ...c.values()
        ].filter((s)=>s.results).length;
        T.disabled = t === 0;
        const n = [
            ...c.values()
        ].filter((s)=>!s.results).length;
        M.disabled = n === 0 || a, a ? (v.forEach((s)=>s.classList.add("cimg-mode__tab--disabled")), F.classList.add("cimg-options--disabled")) : (v.forEach((s)=>s.classList.remove("cimg-mode__tab--disabled")), F.classList.remove("cimg-options--disabled")), ne();
    }
    function ne() {
        const e = [
            ...c.values()
        ].filter((o)=>o.results);
        if (e.length === 0) {
            O.style.display = "none";
            return;
        }
        O.style.display = "";
        const t = e.reduce((o, i)=>o + i.originalSize, 0), n = e.reduce((o, i)=>o + (i.bestSize || 0), 0), s = t > 0 ? Math.round((t - n) / t * 100) : 0;
        W.textContent = String(e.length), Q.textContent = p(t), Y.textContent = p(n), ee.textContent = s + "%";
    }
    function se(e) {
        const n = K.content.cloneNode(!0).querySelector(".cimg-file");
        n.dataset.id = e.id;
        const s = n.querySelector(".cimg-file__img");
        s.src = URL.createObjectURL(e.file), s.alt = e.file.name, n.querySelector(".cimg-file__name").textContent = e.file.name, n.querySelector(".cimg-file__size").textContent = p(e.file.size);
        const o = n.querySelector(".cimg-file__status");
        o.textContent = "Chờ nén";
        const i = n.querySelector(".cimg-file__compress-one");
        return i.addEventListener("click", ()=>{
            e.results || (g.includes(e.id) || g.push(e.id), i.disabled = !0, b());
        }), n.querySelector(".cimg-file__remove").addEventListener("click", ()=>{
            const r = n.querySelector(".cimg-file__img");
            r?.src && URL.revokeObjectURL(r.src);
            const l = n.querySelector(".cimg-file__preview-original");
            l?.src && l.src !== location.href && URL.revokeObjectURL(l.src);
            const u = n.querySelector(".cimg-file__preview-compressed");
            u?.src && u.src !== location.href && URL.revokeObjectURL(u.src), c.delete(e.id), n.remove(), _();
        }), n;
    }
    function oe(e, t, n) {
        const s = E.querySelector(`[data-id="${e}"]`);
        if (!s) return;
        const o = s.querySelector(".progress-bar__fill"), i = s.querySelector(".cimg-file__percent"), r = s.querySelector(".cimg-file__status"), l = s.querySelector(".cimg-file__progress");
        l.style.display = "", o.style.width = t + "%", i.textContent = t + "%", r.textContent = n, r.className = "cimg-file__status cimg-file__status--active";
    }
    function ie(e, t) {
        const n = c.get(e);
        if (!n) return;
        n.results = t.results, n.bestFormat = t.bestFormat, n.bestBuffer = t.bestBuffer, n.bestSize = t.bestSize, n.originalSize = t.originalSize;
        const s = E.querySelector(`[data-id="${e}"]`);
        if (!s) return;
        const o = s.querySelector(".cimg-file__progress");
        o.style.display = "none";
        const i = s.querySelector(".cimg-file__result");
        i.style.display = "";
        const r = s.querySelector(".cimg-file__size-compare");
        r.textContent = `${p(t.originalSize)} → ${p(t.bestSize)}`;
        const l = s.querySelector(".cimg-file__reduction"), u = t.originalSize - t.bestSize, N = t.originalSize > 0 ? Math.round(u / t.originalSize * 100) : 0, S = t.bestFormat.toUpperCase();
        u > 0 ? l.textContent = `Giảm ${N}% — Định dạng: ${S}` : l.textContent = `Ảnh đã được tối ưu sẵn — Định dạng: ${S}`;
        const P = s.querySelector(".cimg-file__compress-one");
        P.hidden = !0;
        const L = s.querySelector(".cimg-file__download");
        L.disabled = !1, L.querySelector(".cimg-file__dl-label").textContent = `Tải ${S}`, L.addEventListener("click", ()=>{
            if (!n.bestBuffer || !n.bestFormat) return;
            const y = new Blob([
                n.bestBuffer
            ], {
                type: R[n.bestFormat] || "application/octet-stream"
            }), f = document.createElement("a");
            f.href = URL.createObjectURL(y);
            const q = n.file.name.replace(/\.\w+$/, ""), D = $[n.bestFormat] || n.bestFormat;
            f.download = `${q}-compressed.${D}`, f.click(), URL.revokeObjectURL(f.href);
        });
        const h = s.querySelector(".cimg-file__preview-btn");
        h.style.display = "";
        const k = s.querySelector(".cimg-file__preview"), w = s.querySelector(".cimg-file__preview-original"), B = s.querySelector(".cimg-file__preview-compressed");
        h.addEventListener("click", ()=>{
            const y = k.style.display !== "none";
            if (k.style.display = y ? "none" : "", h.classList.toggle("cimg-file__preview-btn--active", !y), !y && ((!w.src || w.src === location.href) && (w.src = URL.createObjectURL(n.file)), (!B.src || B.src === location.href) && n.bestBuffer && n.bestFormat)) {
                const f = R[n.bestFormat] || "application/octet-stream", q = new Blob([
                    n.bestBuffer
                ], {
                    type: f
                });
                B.src = URL.createObjectURL(q);
            }
        }), _();
    }
    function ce(e, t) {
        const n = E.querySelector(`[data-id="${e}"]`);
        if (!n) return;
        const s = n.querySelector(".cimg-file__status");
        s.textContent = "Lỗi: " + t, s.className = "cimg-file__status cimg-file__status--error";
        const o = n.querySelector(".progress-bar__fill");
        o.style.width = "0%";
        const i = n.querySelector(".cimg-file__percent");
        i.textContent = "";
    }
    function b() {
        if (a || g.length === 0) {
            !a && g.length === 0 && _();
            return;
        }
        const e = g.shift(), t = c.get(e);
        if (!t) {
            b();
            return;
        }
        a = !0, _();
        const n = te();
        t.file.arrayBuffer().then((s)=>{
            z.postMessage({
                type: "compress",
                id: t.id,
                buffer: s,
                fileName: t.file.name,
                mimeType: t.file.type,
                options: n
            }, [
                s
            ]);
        });
    }
    z.onmessage = (e)=>{
        const t = e.data;
        switch(t.type){
            case "ready":
                break;
            case "progress":
                oe(t.id, t.pct, t.status);
                break;
            case "result":
                ie(t.id, t), a = !1, b();
                break;
            case "error":
                ce(t.id, t.message), a = !1, b();
                break;
        }
    };
    z.postMessage({
        type: "init"
    });
    function A(e) {
        for (const t of e){
            if (c.size >= C) {
                alert(`Chỉ được tải tối đa ${C} file.`);
                break;
            }
            if (!t.type.match(/^image\/(png|jpeg)$/)) continue;
            if (t.size > Z) {
                alert(`"${t.name}" quá lớn (${p(t.size)}). Giới hạn tối đa là 30 MB.`);
                continue;
            }
            const n = String(G++), s = {
                id: n,
                file: t,
                results: null,
                bestFormat: null,
                bestBuffer: null,
                bestSize: null,
                originalSize: t.size
            };
            c.set(n, s);
            const o = se(s);
            E.appendChild(o);
        }
        _();
    }
    j.addEventListener("click", (e)=>{
        e.stopPropagation(), m.click();
    });
    d.addEventListener("click", (e)=>{
        j.contains(e.target) || m.click();
    });
    m.addEventListener("change", ()=>{
        m.files && A(m.files), m.value = "";
    });
    J.addEventListener("click", ()=>m.click());
    d.addEventListener("dragover", (e)=>{
        e.preventDefault(), d.classList.add("upload-zone--dragover");
    });
    d.addEventListener("dragleave", ()=>d.classList.remove("upload-zone--dragover"));
    d.addEventListener("drop", (e)=>{
        e.preventDefault(), d.classList.remove("upload-zone--dragover"), e.dataTransfer?.files && A(e.dataTransfer.files);
    });
    M.addEventListener("click", ()=>{
        for (const [e, t] of c)t.results || g.push(e);
        b();
    });
    T.addEventListener("click", async ()=>{
        const e = (await X(async ()=>{
            const { default: o } = await import("./jszip.min.CIaaoH_6.js").then((i)=>i.j);
            return {
                default: o
            };
        }, __vite__mapDeps([0,1]))).default, t = new e;
        for (const o of c.values()){
            if (!o.bestBuffer || !o.bestFormat) continue;
            const i = o.file.name.replace(/\.\w+$/, ""), r = $[o.bestFormat] || o.bestFormat;
            t.file(`${i}-compressed.${r}`, o.bestBuffer);
        }
        const n = await t.generateAsync({
            type: "blob"
        }), s = document.createElement("a");
        s.href = URL.createObjectURL(n), s.download = "images-compressed.zip", s.click(), URL.revokeObjectURL(s.href);
    });
})();
