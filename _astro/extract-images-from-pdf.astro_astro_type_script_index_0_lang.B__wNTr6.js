import { _ as N } from "./preload-helper.CVfkMyKi.js";
import { J as j } from "./jszip.min.CIaaoH_6.js";
(async ()=>{
    function d(t) {
        const e = document.getElementById(t);
        if (!e) throw new Error(`[extract-images] missing element #${t}`);
        return e;
    }
    function U() {
        return {
            dropzone: d("eip-dropzone"),
            fileInput: d("eip-file-input"),
            selectBtn: d("eip-select-btn"),
            workspace: d("eip-workspace"),
            filename: d("eip-filename"),
            filesize: d("eip-filesize"),
            removeBtn: d("eip-remove"),
            scanSection: d("eip-scan"),
            scanStatus: d("eip-scan-status"),
            readBtn: d("eip-read-btn"),
            summary: d("eip-summary"),
            pagesCount: d("eip-pages-count"),
            imagesCount: d("eip-images-count"),
            pagesSection: d("eip-pages-section"),
            pagesList: d("eip-pages-list"),
            extractedCounter: d("eip-extracted-counter"),
            pageCardTpl: d("eip-page-card-tpl"),
            actions: d("eip-actions"),
            extractAllBtn: d("eip-extract-all"),
            downloadZipBtn: d("eip-download-zip"),
            empty: d("eip-empty"),
            renderFallbackBtn: d("eip-render-fallback"),
            progress: d("eip-progress"),
            progressStatus: d("eip-progress-status"),
            progressPct: d("eip-progress-pct"),
            progressFill: d("eip-progress-fill"),
            privacyTrigger: d("eip-privacy-trigger"),
            privacyPopover: d("eip-privacy-popover")
        };
    }
    function Z(t) {
        return !Number.isFinite(t) || t < 0 ? "—" : t < 1024 ? `${t} B` : t < 1024 * 1024 ? `${(t / 1024).toFixed(1)} KB` : `${(t / (1024 * 1024)).toFixed(2)} MB`;
    }
    function G(t, e) {
        return `${t} ${e}`;
    }
    function H(t, e) {
        t.dropzone.style.display = "none", t.workspace.style.display = "", t.filename.textContent = e.name, t.filesize.textContent = Z(e.size), t.summary.style.display = "none", t.pagesSection.style.display = "none", t.actions.style.display = "none", t.empty.style.display = "none", t.progress.style.display = "none", t.scanStatus.textContent = "Sẵn sàng đọc file", t.readBtn.disabled = !1;
    }
    function q(t) {
        t.scanStatus.textContent = "Đang quét cấu trúc PDF...", t.scanStatus.classList.add("is-loading"), t.readBtn.disabled = !0, t.summary.style.display = "none", t.pagesSection.style.display = "none", t.actions.style.display = "none";
    }
    function V(t, e, n) {
        t.scanStatus.textContent = "Đã đọc xong file", t.scanStatus.classList.remove("is-loading"), t.scanStatus.classList.add("is-ready"), t.readBtn.style.display = "none", t.summary.style.display = "", t.pagesCount.textContent = String(n.length);
        const a = n.reduce((r, i)=>r + i.imageCount, 0);
        t.imagesCount.textContent = String(a), J(t, e, n), t.pagesSection.style.display = "", t.actions.style.display = "", t.extractAllBtn.disabled = !1, t.downloadZipBtn.disabled = !0, b(t, 0), a === 0 ? t.empty.style.display = "" : t.empty.style.display = "none";
    }
    function J(t, e, n) {
        t.pagesList.replaceChildren(), e.cards.clear();
        for (const a of n){
            const r = W(t, a);
            t.pagesList.appendChild(r.root), e.cards.set(a.pageIndex, r);
        }
    }
    function W(t, e) {
        const n = t.pageCardTpl.content.firstElementChild?.cloneNode(!0);
        if (!(n instanceof HTMLElement)) throw new Error("[extract-images] invalid page card template");
        n.dataset.pageIndex = String(e.pageIndex);
        const a = n.querySelector(".eip-page__num"), r = n.querySelector(".eip-page__count"), i = n.querySelector(".eip-page__hint"), o = n.querySelector(".eip-page__status"), s = n.querySelector(".eip-page__extract");
        if (!a || !r || !i || !o || !s) throw new Error("[extract-images] page card template missing slots");
        return a.textContent = String(e.pageIndex + 1), r.textContent = G(e.imageCount, "ảnh"), i.textContent = e.hasRawImageHint ? "Có thể có ảnh gốc" : "Hình ảnh hiển thị", i.classList.toggle("badge--info", e.hasRawImageHint), i.classList.toggle("badge--default", !e.hasRawImageHint), o.textContent = "Sẵn sàng", {
            root: n,
            count: r,
            hint: i,
            status: o,
            button: s
        };
    }
    function R(t) {
        t && (t.status.textContent = "Đang xử lý…", t.status.dataset.state = "processing", t.button.disabled = !0);
    }
    function T(t, e) {
        t && (t.status.textContent = `Đã tách: ${e.length} ảnh`, t.status.dataset.state = "done", t.button.disabled = !1, t.button.textContent = "Tách lại");
    }
    function K(t) {
        t && (t.status.textContent = "Không tách được", t.status.dataset.state = "error", t.button.disabled = !1);
    }
    function b(t, e) {
        t.extractedCounter.textContent = e === 0 ? "Chưa có ảnh" : `Đã có sẵn: ${e} ảnh`, t.downloadZipBtn.disabled = e === 0;
    }
    function v(t, e) {
        t.progress.style.display = e ? "" : "none", e || (t.progressFill.style.width = "0%", t.progressPct.textContent = "0%", t.progressStatus.textContent = "");
    }
    function M(t, e, n, a) {
        const r = n > 0 ? Math.round(e / n * 100) : 0;
        t.progressFill.style.width = `${r}%`, t.progressPct.textContent = `${r}%`, t.progressStatus.textContent = a;
    }
    function Y(t) {
        t.dropzone.style.display = "", t.workspace.style.display = "none", t.fileInput.value = "", t.scanStatus.textContent = "Sẵn sàng đọc file", t.scanStatus.classList.remove("is-loading", "is-ready"), t.readBtn.disabled = !1, t.readBtn.style.display = "", t.summary.style.display = "none", t.pagesSection.style.display = "none", t.actions.style.display = "none", t.empty.style.display = "none", t.progress.style.display = "none", t.progressFill.style.width = "0%", t.progressPct.textContent = "0%", t.progressStatus.textContent = "", t.pagesList.replaceChildren(), t.extractAllBtn.disabled = !1, t.downloadZipBtn.disabled = !0;
    }
    const z = 200 * 1024 * 1024, E = 4e7, Q = 2;
    let I = null;
    function tt() {
        return I || (I = (async ()=>{
            const t = await N(()=>import("./pdf.C_7zF4kU.js").then(async (m)=>{
                    await m.__tla;
                    return m;
                }), []);
            return t.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${t.version}/build/pdf.worker.min.mjs`, t;
        })()), I;
    }
    async function et(t) {
        if (t instanceof Blob) {
            const e = await t.arrayBuffer();
            return {
                buffer: e,
                size: e.byteLength
            };
        }
        if (t instanceof Uint8Array) {
            const e = t.slice();
            return {
                buffer: e.buffer,
                size: e.byteLength
            };
        }
        return {
            buffer: t,
            size: t.byteLength
        };
    }
    async function nt(t) {
        const { buffer: e, size: n } = await et(t);
        if (n > z) throw new Error(`PDF quá lớn (${Math.round(n / 1024 / 1024)}MB). Tối đa ${Math.round(z / 1024 / 1024)}MB.`);
        const a = await tt();
        let r;
        try {
            r = await a.getDocument({
                data: e,
                disableFontFace: !0,
                isEvalSupported: !1
            }).promise;
        } catch (i) {
            const o = i instanceof Error ? i.message : String(i);
            throw new Error(`Không thể mở PDF: ${o}`);
        }
        return {
            numPages: r.numPages,
            sizeBytes: n,
            document: r,
            pdfjsLib: a,
            getPage: async (i)=>{
                if (i < 0 || i >= r.numPages) throw new RangeError(`pageIndex out of range: ${i} (0..${r.numPages - 1})`);
                return r.getPage(i + 1);
            }
        };
    }
    async function at(t) {
        try {
            await t.document.destroy();
        } catch  {}
    }
    const rt = [
        "paintImageXObject",
        "paintImageXObjectRepeat",
        "paintJpegXObject"
    ], it = [
        "paintInlineImageXObject",
        "paintInlineImageXObjectGroup"
    ];
    function ot(t) {
        const e = t.OPS, n = new Set;
        for (const o of rt){
            const s = e[o];
            typeof s == "number" && n.add(s);
        }
        const a = e.paintInlineImageXObject, r = e.paintInlineImageXObjectGroup, i = new Set(n);
        for (const o of it){
            const s = e[o];
            typeof s == "number" && i.add(s);
        }
        return {
            named: n,
            inlineSingle: typeof a == "number" ? a : void 0,
            inlineGroup: typeof r == "number" ? r : void 0,
            anyImage: i
        };
    }
    async function $(t, e) {
        const n = ot(t.pdfjsLib);
        let a = null;
        try {
            a = await t.getPage(e);
            const r = await a.getOperatorList();
            let i = 0, o = !1;
            const s = new Set;
            for(let l = 0; l < r.fnArray.length; l++){
                const u = r.fnArray[l];
                if (n.named.has(u)) {
                    const c = r.argsArray[l], g = c && c[0] != null ? String(c[0]) : "";
                    if (g) {
                        if (s.has(g)) continue;
                        s.add(g);
                    }
                    o = !0, i++;
                    continue;
                }
                if (n.inlineSingle !== void 0 && u === n.inlineSingle) {
                    i++;
                    continue;
                }
                if (n.inlineGroup !== void 0 && u === n.inlineGroup) {
                    const c = r.argsArray[l], g = c ? c[0] : void 0;
                    i += Array.isArray(g) ? g.length : 1;
                    continue;
                }
            }
            return {
                pageIndex: e,
                imageCount: i,
                hasRawImageHint: o
            };
        } catch  {
            return {
                pageIndex: e,
                imageCount: 0,
                hasRawImageHint: !1
            };
        } finally{
            if (a && typeof a.cleanup == "function") try {
                a.cleanup();
            } catch  {}
        }
    }
    async function st(t, e, n) {
        const a = t.numPages, r = new Array(a);
        for(let i = 0; i < a; i++){
            if (n?.aborted) throw new DOMException("Aborted", "AbortError");
            r[i] = await $(t, i), e?.(i + 1, a), await new Promise((o)=>setTimeout(o, 0));
        }
        return r;
    }
    function C(t, e) {
        if (t < 1 || e < 1) return null;
        if (typeof OffscreenCanvas < "u") {
            const n = new OffscreenCanvas(t, e), a = n.getContext("2d");
            return a ? {
                canvas: n,
                ctx: a
            } : null;
        }
        if (typeof document < "u") {
            const n = document.createElement("canvas");
            n.width = t, n.height = e;
            const a = n.getContext("2d");
            return a ? {
                canvas: n,
                ctx: a
            } : null;
        }
        return null;
    }
    async function k(t, e = "image/png", n) {
        return typeof OffscreenCanvas < "u" && t instanceof OffscreenCanvas ? await t.convertToBlob({
            type: e,
            quality: n
        }) : new Promise((a)=>{
            t.toBlob((r)=>a(r), e, n);
        });
    }
    function m(t) {
        try {
            t.width = 0, t.height = 0;
        } catch  {}
    }
    function ct(t) {
        return t.length >= 3 && t[0] === 255 && t[1] === 216 && t[2] === 255 ? "jpeg" : t.length >= 8 && t[0] === 137 && t[1] === 80 && t[2] === 78 && t[3] === 71 && t[4] === 13 && t[5] === 10 && t[6] === 26 && t[7] === 10 ? "png" : "unknown";
    }
    function lt(t) {
        return t === "jpeg" ? "jpg" : "png";
    }
    function dt(t) {
        return t === "jpeg" ? "image/jpeg" : "image/png";
    }
    async function P(t, e, n) {
        if (e < 1 || n < 1) return null;
        const a = C(e, n);
        if (!a) return null;
        const { canvas: r, ctx: i } = a;
        try {
            i.drawImage(t, 0, 0);
        } catch  {
            return m(r), null;
        }
        const o = await k(r, "image/png");
        return m(r), o ? {
            data: new Uint8Array(await o.arrayBuffer()),
            width: e,
            height: n
        } : null;
    }
    async function ut(t) {
        const { width: e, height: n } = t;
        if (!e || !n) return null;
        const a = C(e, n);
        if (!a) return null;
        const { canvas: r, ctx: i } = a, o = t.data instanceof Uint8ClampedArray ? t.data : new Uint8ClampedArray(t.data), s = e * n;
        let l = null;
        if (o.length === s * 4) l = o;
        else if (o.length === s * 3) {
            l = new Uint8ClampedArray(s * 4);
            for(let c = 0; c < s; c++)l[c * 4] = o[c * 3], l[c * 4 + 1] = o[c * 3 + 1], l[c * 4 + 2] = o[c * 3 + 2], l[c * 4 + 3] = 255;
        } else if (o.length === s) {
            l = new Uint8ClampedArray(s * 4);
            for(let c = 0; c < s; c++)l[c * 4] = o[c], l[c * 4 + 1] = o[c], l[c * 4 + 2] = o[c], l[c * 4 + 3] = 255;
        } else if (o.length === s * 2) {
            l = new Uint8ClampedArray(s * 4);
            for(let c = 0; c < s; c++)l[c * 4] = o[c * 2], l[c * 4 + 1] = o[c * 2], l[c * 4 + 2] = o[c * 2], l[c * 4 + 3] = o[c * 2 + 1];
        } else return m(r), null;
        try {
            const c = new ImageData(l, e, n);
            i.putImageData(c, 0, 0);
        } catch  {
            return m(r), null;
        }
        const u = await k(r, "image/png");
        return m(r), u ? {
            data: new Uint8Array(await u.arrayBuffer()),
            width: e,
            height: n
        } : null;
    }
    async function A(t) {
        if (!t) return null;
        const e = t;
        if (e?.data instanceof Uint8Array && typeof e.width == "number" && typeof e.height == "number") {
            const o = ct(e.data);
            if (o !== "unknown") return {
                data: e.data,
                width: e.width,
                height: e.height,
                format: o
            };
        }
        if (typeof ImageBitmap < "u" && t instanceof ImageBitmap) {
            const o = await P(t, t.width, t.height);
            return o ? {
                ...o,
                format: "png"
            } : null;
        }
        const n = t;
        if (typeof ImageBitmap < "u" && n.bitmap instanceof ImageBitmap) {
            const o = await P(n.bitmap, n.bitmap.width, n.bitmap.height);
            return o ? {
                ...o,
                format: "png"
            } : null;
        }
        if (typeof HTMLImageElement < "u" && t instanceof HTMLImageElement) {
            const o = t.naturalWidth || t.width || 0, s = t.naturalHeight || t.height || 0, l = await P(t, o, s);
            return l ? {
                ...l,
                format: "png"
            } : null;
        }
        if (typeof HTMLCanvasElement < "u" && t instanceof HTMLCanvasElement) {
            const o = await P(t, t.width, t.height);
            return o ? {
                ...o,
                format: "png"
            } : null;
        }
        const r = t.imgData ?? t;
        if (!r?.data || !r.width || !r.height) return null;
        const i = await ut({
            data: r.data,
            width: r.width,
            height: r.height,
            kind: r.kind
        });
        return i ? {
            ...i,
            format: "png"
        } : null;
    }
    function gt(t, e) {
        const n = t.objs;
        try {
            const a = n.get(e);
            if (a != null) return Promise.resolve(a);
        } catch  {}
        return new Promise((a)=>{
            const r = setTimeout(()=>a(null), 1e4);
            try {
                n.get(e, (i)=>{
                    clearTimeout(r), a(i);
                });
            } catch  {
                clearTimeout(r), a(null);
            }
        });
    }
    async function pt(t, e) {
        let n = e, a = t.getViewport({
            scale: n
        });
        if (a.width * a.height > E) {
            const s = Math.sqrt(E / (a.width * a.height));
            n = Math.max(.25, e * s), a = t.getViewport({
                scale: n
            });
        }
        const r = C(Math.ceil(a.width), Math.ceil(a.height));
        if (!r) return;
        const { canvas: i, ctx: o } = r;
        try {
            await t.render({
                canvasContext: o,
                viewport: a
            }).promise;
        } catch  {}
        m(i);
    }
    async function ft(t, e, n) {
        let a = n, r = t.getViewport({
            scale: a
        });
        if (r.width * r.height > E) {
            const x = Math.sqrt(E / (r.width * r.height));
            a = Math.max(.5, n * x), r = t.getViewport({
                scale: a
            });
        }
        const i = Math.ceil(r.width), o = Math.ceil(r.height), s = C(i, o);
        if (!s) return null;
        const { canvas: l, ctx: u } = s;
        try {
            await t.render({
                canvasContext: u,
                viewport: r
            }).promise;
        } catch  {
            return m(l), null;
        }
        const c = await k(l, "image/png");
        if (m(l), !c) return null;
        const g = new Uint8Array(await c.arrayBuffer());
        return {
            pageIndex: e,
            imageIndex: 0,
            data: g,
            width: i,
            height: o,
            format: "png",
            extension: "png",
            mime: "image/png",
            source: "rendered"
        };
    }
    async function ht(t, e, n = {}) {
        const { fallbackToRender: a = !0, renderScale: r = Q, signal: i } = n;
        if (i?.aborted) throw new DOMException("Aborted", "AbortError");
        const { pdfjsLib: o } = t, s = o.OPS, l = await t.getPage(e), u = [], c = new Set;
        try {
            const g = await l.getOperatorList();
            if (mt(o, g.fnArray)) {
                await pt(l, r);
                for(let h = 0; h < g.fnArray.length; h++){
                    if (i?.aborted) throw new DOMException("Aborted", "AbortError");
                    const y = g.fnArray[h], f = g.argsArray[h];
                    try {
                        if (y === s.paintImageXObject || y === s.paintImageXObjectRepeat || y === s.paintJpegXObject) {
                            const p = f && f[0] != null ? String(f[0]) : "";
                            if (!p || c.has(p)) continue;
                            c.add(p);
                            const S = await gt(l, p), w = await A(S);
                            w && u.push(L(e, u.length, w, "raw", p));
                            continue;
                        }
                        if (y === s.paintInlineImageXObject) {
                            const p = await A(f ? f[0] : null);
                            p && u.push(L(e, u.length, p, "raw"));
                            continue;
                        }
                        if (y === s.paintInlineImageXObjectGroup) {
                            const p = Array.isArray(f?.[0]) ? f[0] : f ? [
                                f[0]
                            ] : [];
                            for (const S of p){
                                const w = await A(S);
                                w && u.push(L(e, u.length, w, "raw"));
                            }
                            continue;
                        }
                    } catch  {}
                }
            }
            if (u.length === 0 && a) {
                const h = await ft(l, e, r);
                h && u.push(h);
            }
        } finally{
            if (typeof l.cleanup == "function") try {
                l.cleanup();
            } catch  {}
        }
        return u;
    }
    function L(t, e, n, a, r) {
        return {
            pageIndex: t,
            imageIndex: e,
            data: n.data,
            width: n.width,
            height: n.height,
            format: n.format,
            extension: lt(n.format),
            mime: dt(n.format),
            source: a,
            objectId: r
        };
    }
    function mt(t, e) {
        const n = t.OPS, a = [];
        for (const i of [
            "paintImageXObject",
            "paintImageXObjectRepeat",
            "paintJpegXObject",
            "paintInlineImageXObject",
            "paintInlineImageXObjectGroup"
        ]){
            const o = n[i];
            typeof o == "number" && a.push(o);
        }
        const r = new Set(a);
        for(let i = 0; i < e.length; i++)if (r.has(e[i])) return !0;
        return !1;
    }
    class yt {
        byPage = new Map;
        set(e, n) {
            this.byPage.set(e, n.slice());
        }
        add(e, n) {
            if (n.length === 0) {
                this.byPage.has(e) || this.byPage.set(e, []);
                return;
            }
            const a = this.byPage.get(e);
            a ? a.push(...n) : this.byPage.set(e, n.slice());
        }
        get(e) {
            const n = this.byPage.get(e);
            return n ? n.slice() : void 0;
        }
        has(e) {
            return this.byPage.has(e);
        }
        pages() {
            return [
                ...this.byPage.keys()
            ].sort((e, n)=>e - n);
        }
        all() {
            const e = [];
            for (const n of this.pages()){
                const a = this.byPage.get(n);
                a && e.push(...a);
            }
            return e;
        }
        size() {
            let e = 0;
            for (const n of this.byPage.values())e += n.length;
            return e;
        }
        deletePage(e) {
            this.byPage.delete(e);
        }
        clear() {
            this.byPage.clear();
        }
    }
    class wt {
        parsed;
        cache = new yt;
        inflight = new Map;
        analysis = null;
        state;
        constructor(e){
            this.parsed = e, this.state = {
                status: "idle",
                totalPages: e.numPages,
                processedPages: 0,
                totalImages: 0
            };
        }
        getState() {
            return {
                ...this.state
            };
        }
        getCache() {
            return this.cache;
        }
        async analyze(e, n) {
            if (this.analysis) return this.analysis;
            this.transition({
                status: "analyzing",
                processedPages: 0
            }, e);
            try {
                const a = await st(this.parsed, (r)=>{
                    this.transition({
                        processedPages: r,
                        currentPageIndex: r - 1
                    }, e);
                }, n);
                return this.analysis = a, this.transition({
                    status: "idle",
                    processedPages: a.length
                }, e), a;
            } catch (a) {
                throw this.failOrAbort(a, e), a;
            }
        }
        async analyzeOne(e) {
            return this.analysis?.[e] ? this.analysis[e] : $(this.parsed, e);
        }
        async extractPage(e, n = {}) {
            if (this.assertPageIndex(e), this.cache.has(e)) {
                const i = this.cache.get(e);
                if (i) return i;
            }
            const a = this.inflight.get(e);
            if (a) return a;
            const r = (async ()=>{
                try {
                    const i = await ht(this.parsed, e, n);
                    return this.cache.set(e, i), i;
                } finally{
                    this.inflight.delete(e);
                }
            })();
            return this.inflight.set(e, r), r;
        }
        async extractAll(e = {}) {
            const { signal: n, onProgress: a } = e;
            this.transition({
                status: "extracting",
                processedPages: 0,
                totalImages: 0
            }, a);
            try {
                if (!this.analysis) try {
                    await this.analyze(void 0, n), this.transition({
                        status: "extracting",
                        processedPages: 0,
                        totalImages: 0
                    }, a);
                } catch  {}
                for(let r = 0; r < this.parsed.numPages; r++){
                    if (n?.aborted) throw this.transition({
                        status: "aborted"
                    }, a), new DOMException("Aborted", "AbortError");
                    await this.extractPage(r, e), this.transition({
                        processedPages: r + 1,
                        currentPageIndex: r,
                        totalImages: this.cache.size()
                    }, a), await new Promise((i)=>setTimeout(i, 0));
                }
                return this.transition({
                    status: "done"
                }, a), this.cache.all();
            } catch (r) {
                throw this.failOrAbort(r, a), r;
            }
        }
        resetCache() {
            this.cache.clear(), this.inflight.clear(), this.state = {
                ...this.state,
                status: "idle",
                processedPages: 0,
                totalImages: 0,
                currentPageIndex: void 0,
                error: void 0
            };
        }
        transition(e, n) {
            this.state = {
                ...this.state,
                ...e
            }, n?.(this.state);
        }
        failOrAbort(e, n) {
            if (e instanceof DOMException && e.name === "AbortError") {
                this.transition({
                    status: "aborted"
                }, n);
                return;
            }
            const a = e instanceof Error ? e.message : String(e);
            console.error("[extract-images-from-pdf] extraction failed:", e), this.transition({
                status: "error",
                error: a
            }, n);
        }
        assertPageIndex(e) {
            if (!Number.isInteger(e) || e < 0 || e >= this.parsed.numPages) throw new RangeError(`pageIndex out of range: ${e} (0..${this.parsed.numPages - 1})`);
        }
    }
    function O(t, e) {
        const n = String(t);
        return n.length >= e ? n : "0".repeat(e - n.length) + n;
    }
    function bt(t, e = {}) {
        const n = e.rootFolder ?? "images";
        if (t.length === 0) return [];
        const a = t.reduce((s, l)=>Math.max(s, l.pageIndex), 0), r = Math.max(2, String(a + 1).length), i = new Map;
        for (const s of t)i.set(s.pageIndex, (i.get(s.pageIndex) ?? 0) + 1);
        const o = new Map;
        return t.map((s)=>{
            const l = o.get(s.pageIndex) ?? 0;
            o.set(s.pageIndex, l + 1);
            const u = i.get(s.pageIndex) ?? 1, c = Math.max(2, String(u).length), g = O(s.pageIndex + 1, r), x = O(l + 1, c);
            return {
                path: `${n}/trang_${g}_${x}.${s.extension}`,
                image: s
            };
        });
    }
    async function xt(t, e = {}) {
        const n = new j, a = bt(t, e);
        for (const { path: r, image: i } of a)n.file(r, i.data);
        if (e.includeManifest) {
            const r = a.map(({ path: i, image: o })=>({
                    path: i,
                    pageIndex: o.pageIndex,
                    imageIndex: o.imageIndex,
                    width: o.width,
                    height: o.height,
                    format: o.format,
                    source: o.source,
                    bytes: o.data.byteLength,
                    objectId: o.objectId
                }));
            n.file(`${e.rootFolder ?? "images"}/manifest.json`, JSON.stringify({
                generatedAt: new Date().toISOString(),
                count: r.length,
                images: r
            }, null, 2));
        }
        return n.generateAsync({
            type: "blob",
            compression: "DEFLATE",
            compressionOptions: {
                level: Pt(e.compressionLevel ?? 6)
            }
        });
    }
    function Pt(t) {
        return Number.isFinite(t) ? Math.min(9, Math.max(0, Math.round(t))) : 6;
    }
    const vt = 200 * 1024 * 1024, Et = "Dữ liệu xử lý sẽ bị mất. Bạn có chắc muốn xóa file này?";
    async function _(t, e, n) {
        if (n.type && n.type !== "application/pdf") {
            alert("Vui lòng chọn file PDF.");
            return;
        }
        if (n.size > vt) {
            alert(`File quá lớn (${Math.round(n.size / 1024 / 1024)} MB). Giới hạn tối đa 200 MB.`);
            return;
        }
        await X(e), e.file = n, e.phase = "idle", H(t, n);
    }
    async function Ct(t, e) {
        if (!(!e.file || e.phase === "reading")) {
            e.phase = "reading", q(t);
            try {
                const n = await nt(e.file);
                e.parsed = n;
                const a = new wt(n);
                e.controller = a;
                const r = await a.analyze();
                e.analysis = r, e.phase = "ready", V(t, e, r);
            } catch (n) {
                e.phase = "idle";
                const a = n instanceof Error ? n.message : String(n);
                t.scanStatus.textContent = `Đọc file thất bại: ${a}`, t.scanStatus.classList.remove("is-loading"), t.scanStatus.dataset.state = "error", t.readBtn.disabled = !1;
            }
        }
    }
    async function St(t, e, n, a = {}) {
        if (!e.controller) return;
        const r = e.cards.get(n);
        R(r);
        try {
            const i = await e.controller.extractPage(n, {
                fallbackToRender: a.fallbackToRender ?? !1
            });
            T(r, i), r && (r.count.textContent = `${i.length} ảnh`), b(t, e.controller.getCache().size());
        } catch (i) {
            console.error("[extract-images] page extract failed:", i), K(r);
        }
    }
    async function D(t, e, n = {}) {
        if (!e.controller || !e.parsed || e.phase === "extracting") return;
        const a = new AbortController;
        e.abort = a, e.phase = "extracting", t.extractAllBtn.disabled = !0, t.empty.style.display = "none", v(t, !0), M(t, 0, e.parsed.numPages, "Đang chuẩn bị...");
        const r = n.fallbackToRender ?? !1;
        try {
            await e.controller.extractAll({
                fallbackToRender: r,
                signal: a.signal,
                onProgress: (s)=>{
                    typeof s.currentPageIndex == "number" && R(e.cards.get(s.currentPageIndex)), M(t, s.processedPages, s.totalPages, `Đã xử lý ${s.processedPages}/${s.totalPages} trang`), b(t, s.totalImages);
                }
            });
            const i = e.controller.getCache();
            let o = !1;
            for (const [s, l] of e.cards){
                const u = i.get(s) ?? [];
                u.length > 0 && (o = !0), T(l, u), l.count.textContent = `${u.length} ảnh`;
            }
            b(t, i.size()), !o && !r && (t.empty.style.display = "");
        } catch (i) {
            i instanceof DOMException && i.name === "AbortError" ? console.info("[extract-images] extraction aborted") : (console.error("[extract-images] extract-all failed:", i), alert("Đã xảy ra lỗi khi tách ảnh. Bạn có thể thử lại trên từng trang."));
        } finally{
            v(t, !1), e.phase = "ready", t.extractAllBtn.disabled = !1, e.abort = null;
        }
    }
    async function It(t, e) {
        if (e.controller) {
            e.controller.resetCache(), b(t, 0);
            for (const n of e.cards.values())n.status.textContent = "Sẵn sàng", n.status.dataset.state = "", n.button.disabled = !1, n.button.textContent = "Tách ảnh trang này", n.count.textContent = "0 ảnh";
            await D(t, e, {
                fallbackToRender: !0
            });
        }
    }
    async function At(t, e) {
        if (!e.controller) return;
        const n = e.controller.getCache().all();
        if (n.length !== 0) {
            t.downloadZipBtn.disabled = !0, v(t, !0), M(t, 0, 1, "Đang tạo file ZIP...");
            try {
                const a = await xt(n, {
                    rootFolder: "images",
                    compressionLevel: 6,
                    includeManifest: !0
                });
                Mt(a, kt(e.file?.name ?? "pdf"));
            } catch (a) {
                console.error("[extract-images] zip build failed:", a), alert("Không tạo được file ZIP. Vui lòng thử lại.");
            } finally{
                v(t, !1), t.downloadZipBtn.disabled = !1;
            }
        }
    }
    async function Lt(t, e) {
        Bt(e) && !confirm(Et) || (await X(e), Y(t));
    }
    function Bt(t) {
        return !!(t.phase === "extracting" || t.analysis !== null || t.controller && t.controller.getCache().size() > 0);
    }
    async function X(t) {
        t.abort && (t.abort.abort(), t.abort = null), t.parsed && await at(t.parsed), t.parsed = null, t.controller = null, t.analysis = null, t.cards.clear(), t.file = null, t.phase = "idle";
    }
    function Mt(t, e) {
        const n = URL.createObjectURL(t), a = document.createElement("a");
        a.href = n, a.download = e, document.body.appendChild(a), a.click(), a.remove(), URL.revokeObjectURL(n);
    }
    function kt(t) {
        return `${t.replace(/\.pdf$/i, "") || "pdf-images"}-images.zip`;
    }
    const B = "eip-privacy-popover--open";
    function zt(t, e) {
        t.addEventListener("click", (n)=>{
            n.stopPropagation();
            const a = e.classList.toggle(B);
            t.setAttribute("aria-expanded", String(a));
        }), document.addEventListener("click", (n)=>{
            e.contains(n.target) || t.contains(n.target) || (e.classList.remove(B), t.setAttribute("aria-expanded", "false"));
        }), document.addEventListener("keydown", (n)=>{
            n.key === "Escape" && (e.classList.remove(B), t.setAttribute("aria-expanded", "false"));
        });
    }
    function Ot() {
        return {
            file: null,
            parsed: null,
            controller: null,
            analysis: null,
            cards: new Map,
            phase: "idle",
            abort: null
        };
    }
    function F() {
        const t = U(), e = Ot();
        zt(t.privacyTrigger, t.privacyPopover), t.selectBtn.addEventListener("click", (n)=>{
            n.stopPropagation(), t.fileInput.click();
        }), t.dropzone.addEventListener("click", (n)=>{
            t.selectBtn.contains(n.target) || t.fileInput.click();
        }), t.fileInput.addEventListener("change", ()=>{
            const n = t.fileInput.files?.[0];
            n && _(t, e, n);
        }), t.dropzone.addEventListener("dragover", (n)=>{
            n.preventDefault(), t.dropzone.classList.add("is-dragover");
        }), t.dropzone.addEventListener("dragleave", ()=>t.dropzone.classList.remove("is-dragover")), t.dropzone.addEventListener("drop", (n)=>{
            n.preventDefault(), t.dropzone.classList.remove("is-dragover");
            const a = n.dataTransfer?.files[0];
            a && _(t, e, a);
        }), t.readBtn.addEventListener("click", ()=>{
            Ct(t, e);
        }), t.extractAllBtn.addEventListener("click", ()=>{
            D(t, e);
        }), t.downloadZipBtn.addEventListener("click", ()=>{
            At(t, e);
        }), t.renderFallbackBtn.addEventListener("click", ()=>{
            It(t, e);
        }), t.removeBtn.addEventListener("click", ()=>{
            Lt(t, e);
        }), t.pagesList.addEventListener("click", (n)=>{
            const r = n.target?.closest(".eip-page__extract");
            if (!r) return;
            const i = r.closest(".eip-page");
            if (!i) return;
            const o = i.dataset.pageIndex;
            if (o == null) return;
            const s = Number.parseInt(o, 10);
            Number.isInteger(s) && St(t, e, s);
        });
    }
    document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", F, {
        once: !0
    }) : F();
})();
