const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["_astro/jszip.min.CIaaoH_6.js","_astro/_commonjsHelpers.DsqdWQfm.js"])))=>i.map(i=>d[i]);
import { _ as Z } from "./preload-helper.CVfkMyKi.js";
(async ()=>{
    const J = 30 * 1024 * 1024, x = 20;
    function p(e) {
        return e < 1024 ? e + " B" : e < 1024 * 1024 ? (e / 1024).toFixed(1) + " KB" : (e / (1024 * 1024)).toFixed(2) + " MB";
    }
    const U = {
        png: "image/png",
        jpeg: "image/jpeg",
        webp: "image/webp",
        avif: "image/avif"
    }, M = {
        png: "png",
        jpeg: "jpg",
        webp: "webp",
        avif: "avif"
    }, c = new Map;
    let K = 0, a = !1;
    const g = [];
    let z = "reduce-size";
    const C = new Worker(new URL("/_astro/worker-_08ERztc.js", import.meta.url), {
        type: "module"
    }), d = document.getElementById("cimg-dropzone"), m = document.getElementById("cimg-file-input"), A = document.getElementById("cimg-select-btn"), V = document.getElementById("cimg-files-section"), W = document.getElementById("cimg-file-count"), L = document.getElementById("cimg-file-list"), H = document.getElementById("cimg-add-more"), T = document.getElementById("cimg-compress-all"), N = document.getElementById("cimg-download-all"), Q = document.getElementById("cimg-file-row-tpl"), E = document.querySelectorAll(".cimg-mode__tab"), F = document.getElementById("cimg-panel-reduce"), O = document.getElementById("cimg-panel-convert");
    document.getElementById("cimg-mode");
    const $ = document.getElementById("cimg-options"), j = document.getElementById("cimg-stats"), Y = document.getElementById("cimg-stats-count"), ee = document.getElementById("cimg-stats-original"), te = document.getElementById("cimg-stats-compressed"), ne = document.getElementById("cimg-stats-reduction");
    function se() {
        if (z === "reduce-size") return {
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
    E.forEach((e)=>{
        e.addEventListener("click", ()=>{
            if (a) return;
            const t = e.dataset.mode;
            t !== z && (z = t, E.forEach((n)=>n.classList.remove("cimg-mode__tab--active")), e.classList.add("cimg-mode__tab--active"), t === "reduce-size" ? (F.style.display = "", O.style.display = "none") : (F.style.display = "none", O.style.display = ""));
        });
    });
    function _() {
        const e = c.size;
        V.style.display = e > 0 ? "" : "none", d.style.display = e > 0 ? "none" : "", W.textContent = e + " ảnh";
        const t = [
            ...c.values()
        ].filter((s)=>s.results).length;
        N.disabled = t === 0;
        const n = [
            ...c.values()
        ].filter((s)=>!s.results).length;
        T.disabled = n === 0 || a, a ? (E.forEach((s)=>s.classList.add("cimg-mode__tab--disabled")), $.classList.add("cimg-options--disabled")) : (E.forEach((s)=>s.classList.remove("cimg-mode__tab--disabled")), $.classList.remove("cimg-options--disabled")), ie();
    }
    function ie() {
        const e = [
            ...c.values()
        ].filter((i)=>i.results);
        if (e.length === 0) {
            j.style.display = "none";
            return;
        }
        j.style.display = "";
        const t = e.reduce((i, o)=>i + o.originalSize, 0), n = e.reduce((i, o)=>i + (o.bestSize || 0), 0), s = t > 0 ? Math.round((t - n) / t * 100) : 0;
        Y.textContent = String(e.length), ee.textContent = p(t), te.textContent = p(n), ne.textContent = s + "%";
    }
    function oe(e) {
        const n = Q.content.cloneNode(!0).querySelector(".cimg-file");
        n.dataset.id = e.id;
        const s = n.querySelector(".cimg-file__img");
        s.src = URL.createObjectURL(e.file), s.alt = e.file.name, n.querySelector(".cimg-file__name").textContent = e.file.name, n.querySelector(".cimg-file__size").textContent = p(e.file.size);
        const i = n.querySelector(".cimg-file__status");
        i.textContent = "Chờ nén";
        const o = n.querySelector(".cimg-file__compress-one");
        return o.addEventListener("click", ()=>{
            e.results || (g.includes(e.id) || g.push(e.id), o.disabled = !0, v());
        }), n.querySelector(".cimg-file__remove").addEventListener("click", ()=>{
            const r = n.querySelector(".cimg-file__img");
            r?.src && URL.revokeObjectURL(r.src);
            const l = n.querySelector(".cimg-file__preview-original");
            l?.src && l.src !== location.href && URL.revokeObjectURL(l.src);
            const u = n.querySelector(".cimg-file__preview-compressed");
            u?.src && u.src !== location.href && URL.revokeObjectURL(u.src), c.delete(e.id), n.remove(), _();
        }), n;
    }
    function ce(e, t, n) {
        const s = L.querySelector(`[data-id="${e}"]`);
        if (!s) return;
        const i = s.querySelector(".cimg-file__bar-fill"), o = s.querySelector(".cimg-file__percent"), r = s.querySelector(".cimg-file__status"), l = s.querySelector(".cimg-file__progress");
        l.style.display = "", i.style.width = t + "%", o.textContent = t + "%", r.textContent = n, r.className = "cimg-file__status cimg-file__status--active";
    }
    function re(e, t) {
        const n = c.get(e);
        if (!n) return;
        n.results = t.results, n.bestFormat = t.bestFormat, n.bestBuffer = t.bestBuffer, n.bestSize = t.bestSize, n.originalSize = t.originalSize;
        const s = L.querySelector(`[data-id="${e}"]`);
        if (!s) return;
        const i = s.querySelector(".cimg-file__progress");
        i.style.display = "none";
        const o = s.querySelector(".cimg-file__result");
        o.style.display = "";
        const r = s.querySelector(".cimg-file__size-compare");
        r.textContent = `${p(t.originalSize)} → ${p(t.bestSize)}`;
        const l = s.querySelector(".cimg-file__reduction"), u = t.originalSize - t.bestSize, X = t.originalSize > 0 ? Math.round(u / t.originalSize * 100) : 0, h = t.bestFormat.toUpperCase();
        u > 0 ? l.textContent = `Giảm ${X}% — Định dạng: ${h}` : l.textContent = `Ảnh đã được tối ưu sẵn — Định dạng: ${h}`;
        const D = s.querySelector(".cimg-file__compress-one");
        D.hidden = !0;
        const w = s.querySelector(".cimg-file__download");
        w.disabled = !1, w.querySelector(".cimg-file__dl-label").textContent = `Tải ${h}`, w.addEventListener("click", ()=>{
            if (!n.bestBuffer || !n.bestFormat) return;
            const y = new Blob([
                n.bestBuffer
            ], {
                type: U[n.bestFormat] || "application/octet-stream"
            }), f = document.createElement("a");
            f.href = URL.createObjectURL(y);
            const k = n.file.name.replace(/\.\w+$/, ""), G = M[n.bestFormat] || n.bestFormat;
            f.download = `${k}-compressed.${G}`, f.click(), URL.revokeObjectURL(f.href);
        });
        const B = s.querySelector(".cimg-file__preview-btn");
        B.style.display = "";
        const R = s.querySelector(".cimg-file__preview"), I = s.querySelector(".cimg-file__preview-original"), q = s.querySelector(".cimg-file__preview-compressed");
        B.addEventListener("click", ()=>{
            const y = R.style.display !== "none";
            if (R.style.display = y ? "none" : "", B.classList.toggle("cimg-file__preview-btn--active", !y), !y && ((!I.src || I.src === location.href) && (I.src = URL.createObjectURL(n.file)), (!q.src || q.src === location.href) && n.bestBuffer && n.bestFormat)) {
                const f = U[n.bestFormat] || "application/octet-stream", k = new Blob([
                    n.bestBuffer
                ], {
                    type: f
                });
                q.src = URL.createObjectURL(k);
            }
        }), _();
    }
    function le(e, t) {
        const n = L.querySelector(`[data-id="${e}"]`);
        if (!n) return;
        const s = n.querySelector(".cimg-file__status");
        s.textContent = "Lỗi: " + t, s.className = "cimg-file__status cimg-file__status--error";
        const i = n.querySelector(".cimg-file__bar-fill");
        i.style.width = "0%";
        const o = n.querySelector(".cimg-file__percent");
        o.textContent = "";
    }
    function v() {
        if (a || g.length === 0) {
            !a && g.length === 0 && _();
            return;
        }
        const e = g.shift(), t = c.get(e);
        if (!t) {
            v();
            return;
        }
        a = !0, _();
        const n = se();
        t.file.arrayBuffer().then((s)=>{
            C.postMessage({
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
    C.onmessage = (e)=>{
        const t = e.data;
        switch(t.type){
            case "ready":
                break;
            case "progress":
                ce(t.id, t.pct, t.status);
                break;
            case "result":
                re(t.id, t), a = !1, v();
                break;
            case "error":
                le(t.id, t.message), a = !1, v();
                break;
        }
    };
    C.postMessage({
        type: "init"
    });
    function P(e) {
        for (const t of e){
            if (c.size >= x) {
                alert(`Chỉ được tải tối đa ${x} file.`);
                break;
            }
            if (!t.type.match(/^image\/(png|jpeg)$/)) continue;
            if (t.size > J) {
                alert(`"${t.name}" quá lớn (${p(t.size)}). Giới hạn tối đa là 30 MB.`);
                continue;
            }
            const n = String(K++), s = {
                id: n,
                file: t,
                results: null,
                bestFormat: null,
                bestBuffer: null,
                bestSize: null,
                originalSize: t.size
            };
            c.set(n, s);
            const i = oe(s);
            L.appendChild(i);
        }
        _();
    }
    A.addEventListener("click", (e)=>{
        e.stopPropagation(), m.click();
    });
    d.addEventListener("click", (e)=>{
        A.contains(e.target) || m.click();
    });
    m.addEventListener("change", ()=>{
        m.files && P(m.files), m.value = "";
    });
    H.addEventListener("click", ()=>m.click());
    d.addEventListener("dragover", (e)=>{
        e.preventDefault(), d.classList.add("dragover");
    });
    d.addEventListener("dragleave", ()=>d.classList.remove("dragover"));
    d.addEventListener("drop", (e)=>{
        e.preventDefault(), d.classList.remove("dragover"), e.dataTransfer?.files && P(e.dataTransfer.files);
    });
    T.addEventListener("click", ()=>{
        for (const [e, t] of c)t.results || g.push(e);
        v();
    });
    N.addEventListener("click", async ()=>{
        const e = (await Z(async ()=>{
            const { default: i } = await import("./jszip.min.CIaaoH_6.js").then((o)=>o.j);
            return {
                default: i
            };
        }, __vite__mapDeps([0,1]))).default, t = new e;
        for (const i of c.values()){
            if (!i.bestBuffer || !i.bestFormat) continue;
            const o = i.file.name.replace(/\.\w+$/, ""), r = M[i.bestFormat] || i.bestFormat;
            t.file(`${o}-compressed.${r}`, i.bestBuffer);
        }
        const n = await t.generateAsync({
            type: "blob"
        }), s = document.createElement("a");
        s.href = URL.createObjectURL(n), s.download = "images-compressed.zip", s.click(), URL.revokeObjectURL(s.href);
    });
    const b = document.getElementById("cimg-privacy-trigger"), S = document.getElementById("cimg-privacy-popover");
    b.addEventListener("click", (e)=>{
        e.stopPropagation();
        const t = S.classList.toggle("cimg-privacy-popover--open");
        b.setAttribute("aria-expanded", String(t));
    });
    document.addEventListener("click", (e)=>{
        !S.contains(e.target) && !b.contains(e.target) && (S.classList.remove("cimg-privacy-popover--open"), b.setAttribute("aria-expanded", "false"));
    });
    document.addEventListener("keydown", (e)=>{
        e.key === "Escape" && (S.classList.remove("cimg-privacy-popover--open"), b.setAttribute("aria-expanded", "false"));
    });
})();
