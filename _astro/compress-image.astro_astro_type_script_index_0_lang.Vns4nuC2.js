const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["_astro/jszip.min.CIaaoH_6.js","_astro/_commonjsHelpers.DsqdWQfm.js"])))=>i.map(i=>d[i]);
import { _ as N } from "./preload-helper.CVfkMyKi.js";
(async ()=>{
    const P = 30 * 1024 * 1024, I = 20;
    function u(e) {
        return e < 1024 ? e + " B" : e < 1024 * 1024 ? (e / 1024).toFixed(1) + " KB" : (e / (1024 * 1024)).toFixed(2) + " MB";
    }
    const D = {
        png: "image/png",
        jpeg: "image/jpeg",
        webp: "image/webp",
        avif: "image/avif"
    }, x = {
        png: "png",
        jpeg: "jpg",
        webp: "webp",
        avif: "avif"
    }, c = new Map;
    let X = 0, r = !1;
    const m = [];
    let h = "reduce-size";
    const B = new Worker(new URL("/_astro/worker-DewtJklK.js", import.meta.url), {
        type: "module"
    }), l = document.getElementById("cimg-dropzone"), a = document.getElementById("cimg-file-input"), F = document.getElementById("cimg-select-btn"), G = document.getElementById("cimg-files-section"), J = document.getElementById("cimg-file-count"), E = document.getElementById("cimg-file-list"), K = document.getElementById("cimg-add-more"), $ = document.getElementById("cimg-compress-all"), R = document.getElementById("cimg-download-all"), Z = document.getElementById("cimg-file-row-tpl"), v = document.querySelectorAll(".cimg-mode__tab"), k = document.getElementById("cimg-panel-reduce"), z = document.getElementById("cimg-panel-convert");
    document.getElementById("cimg-mode");
    const q = document.getElementById("cimg-options"), C = document.getElementById("cimg-stats"), V = document.getElementById("cimg-stats-count"), W = document.getElementById("cimg-stats-original"), H = document.getElementById("cimg-stats-compressed"), Q = document.getElementById("cimg-stats-reduction");
    function Y() {
        if (h === "reduce-size") return {
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
            if (r) return;
            const t = e.dataset.mode;
            t !== h && (h = t, v.forEach((n)=>n.classList.remove("cimg-mode__tab--active")), e.classList.add("cimg-mode__tab--active"), t === "reduce-size" ? (k.style.display = "", z.style.display = "none") : (k.style.display = "none", z.style.display = ""));
        });
    });
    function g() {
        const e = c.size;
        G.style.display = e > 0 ? "" : "none", l.style.display = e > 0 ? "none" : "", J.textContent = e + " ảnh";
        const t = [
            ...c.values()
        ].filter((s)=>s.results).length;
        R.disabled = t === 0;
        const n = [
            ...c.values()
        ].filter((s)=>!s.results).length;
        $.disabled = n === 0 || r, r ? (v.forEach((s)=>s.classList.add("cimg-mode__tab--disabled")), q.classList.add("cimg-options--disabled")) : (v.forEach((s)=>s.classList.remove("cimg-mode__tab--disabled")), q.classList.remove("cimg-options--disabled")), ee();
    }
    function ee() {
        const e = [
            ...c.values()
        ].filter((i)=>i.results);
        if (e.length === 0) {
            C.style.display = "none";
            return;
        }
        C.style.display = "";
        const t = e.reduce((i, o)=>i + o.originalSize, 0), n = e.reduce((i, o)=>i + (o.bestSize || 0), 0), s = t > 0 ? Math.round((t - n) / t * 100) : 0;
        V.textContent = String(e.length), W.textContent = u(t), H.textContent = u(n), Q.textContent = s + "%";
    }
    function te(e) {
        const n = Z.content.cloneNode(!0).querySelector(".cimg-file");
        n.dataset.id = e.id;
        const s = n.querySelector(".cimg-file__img");
        s.src = URL.createObjectURL(e.file), s.alt = e.file.name, n.querySelector(".cimg-file__name").textContent = e.file.name, n.querySelector(".cimg-file__size").textContent = u(e.file.size);
        const i = n.querySelector(".cimg-file__status");
        i.textContent = "Chờ nén";
        const o = n.querySelector(".cimg-file__compress-one");
        return o.addEventListener("click", ()=>{
            e.results || (m.includes(e.id) || m.push(e.id), o.disabled = !0, f());
        }), n.querySelector(".cimg-file__remove").addEventListener("click", ()=>{
            c.delete(e.id), n.remove(), g();
        }), n;
    }
    function ne(e, t, n) {
        const s = E.querySelector(`[data-id="${e}"]`);
        if (!s) return;
        const i = s.querySelector(".cimg-file__bar-fill"), o = s.querySelector(".cimg-file__percent"), d = s.querySelector(".cimg-file__status"), y = s.querySelector(".cimg-file__progress");
        y.style.display = "", i.style.width = t + "%", o.textContent = t + "%", d.textContent = n, d.className = "cimg-file__status cimg-file__status--active";
    }
    function se(e, t) {
        const n = c.get(e);
        if (!n) return;
        n.results = t.results, n.bestFormat = t.bestFormat, n.bestBuffer = t.bestBuffer, n.bestSize = t.bestSize, n.originalSize = t.originalSize;
        const s = E.querySelector(`[data-id="${e}"]`);
        if (!s) return;
        const i = s.querySelector(".cimg-file__progress");
        i.style.display = "none";
        const o = s.querySelector(".cimg-file__result");
        o.style.display = "";
        const d = s.querySelector(".cimg-file__size-compare");
        d.textContent = `${u(t.originalSize)} → ${u(t.bestSize)}`;
        const y = s.querySelector(".cimg-file__reduction"), w = t.originalSize - t.bestSize, O = t.originalSize > 0 ? Math.round(w / t.originalSize * 100) : 0, S = t.bestFormat.toUpperCase();
        w > 0 ? y.textContent = `Giảm ${O}% — Định dạng: ${S}` : y.textContent = `Ảnh đã được tối ưu sẵn — Định dạng: ${S}`;
        const U = s.querySelector(".cimg-file__compress-one");
        U.hidden = !0;
        const L = s.querySelector(".cimg-file__download");
        L.disabled = !1, L.querySelector(".cimg-file__dl-label").textContent = `Tải ${S}`, L.addEventListener("click", ()=>{
            if (!n.bestBuffer || !n.bestFormat) return;
            const j = new Blob([
                n.bestBuffer
            ], {
                type: D[n.bestFormat] || "application/octet-stream"
            }), _ = document.createElement("a");
            _.href = URL.createObjectURL(j);
            const A = n.file.name.replace(/\.\w+$/, ""), T = x[n.bestFormat] || n.bestFormat;
            _.download = `${A}-compressed.${T}`, _.click(), URL.revokeObjectURL(_.href);
        }), g();
    }
    function ie(e, t) {
        const n = E.querySelector(`[data-id="${e}"]`);
        if (!n) return;
        const s = n.querySelector(".cimg-file__status");
        s.textContent = "Lỗi: " + t, s.className = "cimg-file__status cimg-file__status--error";
        const i = n.querySelector(".cimg-file__bar-fill");
        i.style.width = "0%";
        const o = n.querySelector(".cimg-file__percent");
        o.textContent = "";
    }
    function f() {
        if (r || m.length === 0) {
            !r && m.length === 0 && g();
            return;
        }
        const e = m.shift(), t = c.get(e);
        if (!t) {
            f();
            return;
        }
        r = !0, g();
        const n = Y();
        t.file.arrayBuffer().then((s)=>{
            B.postMessage({
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
    B.onmessage = (e)=>{
        const t = e.data;
        switch(t.type){
            case "ready":
                break;
            case "progress":
                ne(t.id, t.pct, t.status);
                break;
            case "result":
                se(t.id, t), r = !1, f();
                break;
            case "error":
                ie(t.id, t.message), r = !1, f();
                break;
        }
    };
    B.postMessage({
        type: "init"
    });
    function M(e) {
        for (const t of e){
            if (c.size >= I) {
                alert(`Chỉ được tải tối đa ${I} file.`);
                break;
            }
            if (!t.type.match(/^image\/(png|jpeg)$/)) continue;
            if (t.size > P) {
                alert(`"${t.name}" quá lớn (${u(t.size)}). Giới hạn tối đa là 30 MB.`);
                continue;
            }
            const n = String(X++), s = {
                id: n,
                file: t,
                results: null,
                bestFormat: null,
                bestBuffer: null,
                bestSize: null,
                originalSize: t.size
            };
            c.set(n, s);
            const i = te(s);
            E.appendChild(i);
        }
        g();
    }
    F.addEventListener("click", (e)=>{
        e.stopPropagation(), a.click();
    });
    l.addEventListener("click", (e)=>{
        F.contains(e.target) || a.click();
    });
    a.addEventListener("change", ()=>{
        a.files && M(a.files), a.value = "";
    });
    K.addEventListener("click", ()=>a.click());
    l.addEventListener("dragover", (e)=>{
        e.preventDefault(), l.classList.add("dragover");
    });
    l.addEventListener("dragleave", ()=>l.classList.remove("dragover"));
    l.addEventListener("drop", (e)=>{
        e.preventDefault(), l.classList.remove("dragover"), e.dataTransfer?.files && M(e.dataTransfer.files);
    });
    $.addEventListener("click", ()=>{
        for (const [e, t] of c)t.results || m.push(e);
        f();
    });
    R.addEventListener("click", async ()=>{
        const e = (await N(async ()=>{
            const { default: i } = await import("./jszip.min.CIaaoH_6.js").then((o)=>o.j);
            return {
                default: i
            };
        }, __vite__mapDeps([0,1]))).default, t = new e;
        for (const i of c.values()){
            if (!i.bestBuffer || !i.bestFormat) continue;
            const o = i.file.name.replace(/\.\w+$/, ""), d = x[i.bestFormat] || i.bestFormat;
            t.file(`${o}-compressed.${d}`, i.bestBuffer);
        }
        const n = await t.generateAsync({
            type: "blob"
        }), s = document.createElement("a");
        s.href = URL.createObjectURL(n), s.download = "images-compressed.zip", s.click(), URL.revokeObjectURL(s.href);
    });
    const p = document.getElementById("cimg-privacy-trigger"), b = document.getElementById("cimg-privacy-popover");
    p.addEventListener("click", (e)=>{
        e.stopPropagation();
        const t = b.classList.toggle("cimg-privacy-popover--open");
        p.setAttribute("aria-expanded", String(t));
    });
    document.addEventListener("click", (e)=>{
        !b.contains(e.target) && !p.contains(e.target) && (b.classList.remove("cimg-privacy-popover--open"), p.setAttribute("aria-expanded", "false"));
    });
    document.addEventListener("keydown", (e)=>{
        e.key === "Escape" && (b.classList.remove("cimg-privacy-popover--open"), p.setAttribute("aria-expanded", "false"));
    });
})();
