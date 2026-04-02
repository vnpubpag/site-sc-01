(async ()=>{
    function k(t, e, n) {
        return Math.max(e, Math.min(n, t));
    }
    function Tt(t) {
        let e = Number.POSITIVE_INFINITY, n = Number.POSITIVE_INFINITY, o = Number.NEGATIVE_INFINITY, r = Number.NEGATIVE_INFINITY;
        for (const a of t)e = Math.min(e, a.x), n = Math.min(n, a.y), o = Math.max(o, a.x), r = Math.max(r, a.y);
        return {
            x: e,
            y: n,
            width: Math.max(1, o - e),
            height: Math.max(1, r - n)
        };
    }
    function Ot(t, e = 5) {
        if (t.length < 4) return t.slice();
        const n = [];
        for(let o = 0; o < t.length; o++){
            const r = t[(o - 1 + t.length) % t.length], a = t[o], c = t[(o + 1) % t.length], s = t[(o + 2) % t.length];
            for(let h = 0; h < e; h++){
                const i = h / e, l = i * i, u = l * i;
                n.push({
                    x: .5 * (2 * a.x + (-r.x + c.x) * i + (2 * r.x - 5 * a.x + 4 * c.x - s.x) * l + (-r.x + 3 * a.x - 3 * c.x + s.x) * u),
                    y: .5 * (2 * a.y + (-r.y + c.y) * i + (2 * r.y - 5 * a.y + 4 * c.y - s.y) * l + (-r.y + 3 * a.y - 3 * c.y + s.y) * u)
                });
            }
        }
        return n;
    }
    function v(t) {
        const e = Math.sin(t * 12.9898) * 43758.5453;
        return e - Math.floor(e);
    }
    function H(t) {
        const e = t.replace("#", ""), n = e.length === 3 ? e.split("").map((c)=>c + c).join("") : e, o = parseInt(n.slice(0, 2), 16), r = parseInt(n.slice(2, 4), 16), a = parseInt(n.slice(4, 6), 16);
        return `${o}, ${r}, ${a}`;
    }
    function j(t, e) {
        if (e.length !== 0) {
            t.beginPath(), t.moveTo(e[0].x, e[0].y);
            for(let n = 1; n < e.length; n++){
                const o = e[n], r = e[(n + 1) % e.length], a = (o.x + r.x) * .5, c = (o.y + r.y) * .5;
                t.quadraticCurveTo(o.x, o.y, a, c);
            }
            t.closePath();
        }
    }
    function X(t, e, n) {
        t.beginPath(), t.moveTo(e.start.x, e.start.y), t.lineTo(e.end.x, e.end.y), t.lineWidth = e.width, t.strokeStyle = n, t.stroke();
    }
    function Lt(t, e, n) {
        t.save();
        for(let o = 0; o < 260; o++){
            const r = v(o * .71) * e, a = v(o * 1.11 + 17) * n, c = 4 + v(o * .39 + 3) * 12, s = -.4 + v(o * .87 + 9) * .8, h = .01 + v(o * .49 + 5) * .012;
            t.strokeStyle = `rgba(84, 78, 72, ${h})`, t.lineWidth = .5, t.beginPath(), t.moveTo(r, a), t.lineTo(r + Math.cos(s) * c, a + Math.sin(s) * c), t.stroke();
        }
        t.restore();
    }
    function _t(t, e) {
        const n = t.getContext("2d");
        if (!n) throw new Error("Canvas 2D context is unavailable");
        n.clearRect(0, 0, t.width, t.height), n.fillStyle = e.palette.background, n.fillRect(0, 0, t.width, t.height), Lt(n, t.width, t.height), n.lineCap = "round", n.lineJoin = "round", n.globalCompositeOperation = "multiply";
        for (const o of e.backgroundStrokes)X(n, o, `rgba(${H(o.color)}, ${o.alpha.toFixed(3)})`);
        n.globalCompositeOperation = "source-over", n.save(), j(n, e.outline), n.clip(), n.lineCap = "round", n.lineJoin = "round", n.globalCompositeOperation = "multiply";
        for (const o of e.strokes)X(n, o, `rgba(${H(o.color)}, ${o.alpha.toFixed(3)})`);
        for (const o of e.edges)X(n, o, `rgba(${H(o.color)}, ${o.alpha.toFixed(3)})`);
        n.globalCompositeOperation = "source-over", n.restore(), n.lineCap = "round", n.lineJoin = "round", n.strokeStyle = "rgba(24, 21, 19, 0.16)", n.lineWidth = e.outlineWidth + 1.2, j(n, e.outline), n.stroke(), n.strokeStyle = e.palette.outline, n.lineWidth = e.outlineWidth, j(n, e.outline), n.stroke();
    }
    const Nt = "/models/cat-segmentation.onnx", Pt = "/libs/catSketchWorker.js", Rt = "cat-sketch-model-cache", D = "models", ut = "cat-segmentation-v1", Dt = "/libs/onnxruntime/ort.wasm.min.mjs", Bt = "/libs/onnxruntime/ort-wasm-simd-threaded.mjs", At = "/libs/onnxruntime/ort-wasm-simd-threaded.wasm", I = 640, A = 32, G = 15, zt = .25, $t = .5;
    let b = null, at = !1, R = null, dt = 0;
    const Q = new Map;
    let q = null, K = null;
    function ft() {
        return typeof window < "u";
    }
    function tt(t) {
        return ft() ? new URL(t, window.location.origin).href : t;
    }
    function Wt(t) {
        const e = document.createElement("canvas");
        e.width = t.width, e.height = t.height;
        const n = e.getContext("2d");
        if (!n) throw new Error("Canvas 2D context is unavailable");
        return n.drawImage(t, 0, 0), n.getImageData(0, 0, e.width, e.height);
    }
    function gt() {
        return new Promise((t, e)=>{
            const n = indexedDB.open(Rt, 1);
            n.onupgradeneeded = ()=>{
                const o = n.result;
                o.objectStoreNames.contains(D) || o.createObjectStore(D);
            }, n.onsuccess = ()=>t(n.result), n.onerror = ()=>e(n.error ?? new Error("IndexedDB open failed"));
        });
    }
    async function Ft() {
        if (!("indexedDB" in globalThis)) return null;
        const t = await gt();
        return await new Promise((e, n)=>{
            const a = t.transaction(D, "readonly").objectStore(D).get(ut);
            a.onsuccess = ()=>{
                e(a.result instanceof ArrayBuffer ? a.result : null), t.close();
            }, a.onerror = ()=>{
                n(a.error ?? new Error("IndexedDB read failed")), t.close();
            };
        });
    }
    async function Yt(t) {
        if (!("indexedDB" in globalThis)) return;
        const e = await gt();
        await new Promise((n, o)=>{
            const c = e.transaction(D, "readwrite").objectStore(D).put(t, ut);
            c.onsuccess = ()=>{
                n(), e.close();
            }, c.onerror = ()=>{
                o(c.error ?? new Error("IndexedDB write failed")), e.close();
            };
        });
    }
    async function Ut() {
        const t = await Ft().catch(()=>null);
        if (t) return t;
        const e = await fetch(Nt, {
            cache: "force-cache"
        });
        if (!e.ok) return null;
        const n = await e.arrayBuffer();
        return await Yt(n).catch(()=>{}), n;
    }
    async function xt() {
        const t = tt(Dt);
        return q ??= import(t).then(async (m)=>{
            await m.__tla;
            return m;
        }).catch((e)=>{
            throw q = null, e;
        }), q;
    }
    async function Ht() {
        return K ??= (async ()=>{
            const t = await Ut().catch(()=>null);
            if (!t) return null;
            const e = await xt();
            return e.env.wasm.wasmPaths = {
                mjs: tt(Bt),
                wasm: tt(At)
            }, e.env.wasm.numThreads = 1, e.env.wasm.proxy = !1, await e.InferenceSession.create(t, {
                executionProviders: [
                    "wasm"
                ],
                graphOptimizationLevel: "all"
            });
        })().catch((t)=>{
            throw K = null, t;
        }), K;
    }
    async function mt() {
        if (!at) return R || (R = new Promise((t, e)=>{
            b = new Worker(Pt), b.onmessage = (n)=>{
                if (n.data.type === "ready") {
                    at = !0, b.onmessage = jt, t();
                    return;
                }
                R = null, b?.terminate(), b = null, e(new Error(n.data.message));
            }, b.onerror = ()=>{
                R = null, b?.terminate(), b = null, e(new Error("Cat sketch worker failed to start"));
            }, b.postMessage({
                type: "init"
            });
        }), R);
    }
    function jt(t) {
        const e = t.data, n = Q.get(e.id);
        if (n) {
            if (Q.delete(e.id), e.type === "segmentError") {
                n.reject(new Error(e.message));
                return;
            }
            n.resolve({
                bbox: e.bbox,
                contour: e.contour,
                mask: {
                    width: e.mask.width,
                    height: e.mask.height,
                    data: new Uint8ClampedArray(e.mask.data)
                }
            });
        }
    }
    async function wt(t) {
        return await mt(), await new Promise((e, n)=>{
            if (Q.set(t.id, {
                resolve: e,
                reject: n
            }), t.type === "segment") {
                b.postMessage(t, [
                    t.imageData.data.buffer
                ]);
                return;
            }
            b.postMessage(t, [
                t.maskData.buffer
            ]);
        });
    }
    function yt(t) {
        return 1 / (1 + Math.exp(-t));
    }
    function Xt(t, e) {
        const n = Math.max(t.x1, e.x1), o = Math.max(t.y1, e.y1), r = Math.min(t.x2, e.x2), a = Math.min(t.y2, e.y2), c = Math.max(0, r - n), s = Math.max(0, a - o), h = c * s;
        if (h <= 0) return 0;
        const i = Math.max(0, t.x2 - t.x1) * Math.max(0, t.y2 - t.y1), l = Math.max(0, e.x2 - e.x1) * Math.max(0, e.y2 - e.y1), u = i + l - h;
        return u <= 0 ? 0 : h / u;
    }
    function Gt(t) {
        const e = [
            ...t
        ].sort((o, r)=>r.score - o.score), n = [];
        for(; e.length > 0;){
            const o = e.shift();
            n.push(o);
            for(let r = e.length - 1; r >= 0; r--)o.classIndex === e[r].classIndex && Xt(o, e[r]) > $t && e.splice(r, 1);
        }
        return n;
    }
    function qt(t) {
        const e = t.data, n = t.dims;
        if (n.length !== 3 || n[0] !== 1) return [];
        const o = n[1], r = n[2], a = o - 4 - A;
        if (a <= 0) return [];
        const c = [];
        for(let s = 0; s < r; s++){
            let h = -1, i = 0;
            for(let w = 0; w < a; w++){
                const y = e[(4 + w) * r + s], L = y <= 1 && y >= 0 ? y : yt(y);
                L > i && (i = L, h = w);
            }
            if (i < zt) continue;
            const l = e[s], u = e[r + s], d = e[r * 2 + s], g = e[r * 3 + s], m = Math.max(0, l - d / 2), x = Math.max(0, u - g / 2), E = Math.min(I, l + d / 2), N = Math.min(I, u + g / 2);
            if (E - m < 4 || N - x < 4) continue;
            const O = new Float32Array(A);
            for(let w = 0; w < A; w++)O[w] = e[(4 + a + w) * r + s];
            c.push({
                x1: m,
                y1: x,
                x2: E,
                y2: N,
                score: i,
                classIndex: h,
                maskCoefficients: O
            });
        }
        return Gt(c);
    }
    function Kt(t, e) {
        const n = e.data, o = e.dims;
        if (o.length !== 4 || o[0] !== 1 || o[1] !== A) return null;
        const r = o[2], a = o[3], c = new Uint8ClampedArray(I * I), s = a / I, h = r / I;
        for(let i = 0; i < I; i++){
            const l = Math.min(r - 1, Math.floor(i * h));
            for(let u = 0; u < I; u++){
                if (u < t.x1 || u > t.x2 || i < t.y1 || i > t.y2) {
                    c[i * I + u] = 0;
                    continue;
                }
                const d = Math.min(a - 1, Math.floor(u * s)), g = l * a + d;
                let m = 0;
                for(let x = 0; x < A; x++)m += t.maskCoefficients[x] * n[x * a * r + g];
                c[i * I + u] = yt(m) >= .5 ? 255 : 0;
            }
        }
        return {
            width: I,
            height: I,
            data: c
        };
    }
    async function Jt(t) {
        const e = await Ht();
        if (!e) return null;
        const n = e.inputNames[0], r = e.inputMetadata[n]?.dimensions ?? [], a = typeof r[2] == "number" ? r[2] : I, c = typeof r[3] == "number" ? r[3] : I, s = document.createElement("canvas");
        s.width = c, s.height = a;
        const h = s.getContext("2d");
        if (!h) return null;
        const i = document.createElement("canvas");
        i.width = t.width, i.height = t.height;
        const l = i.getContext("2d");
        if (!l) return null;
        l.putImageData(t, 0, 0), h.drawImage(i, 0, 0, c, a);
        const u = h.getImageData(0, 0, c, a), d = new Float32Array(c * a * 3);
        for(let p = 0; p < c * a; p++)d[p] = u.data[p * 4] / 255, d[p + c * a] = u.data[p * 4 + 1] / 255, d[p + c * a * 2] = u.data[p * 4 + 2] / 255;
        const g = await xt(), m = new g.Tensor("float32", d, [
            1,
            3,
            a,
            c
        ]), x = await e.run({
            [n]: m
        }), E = x.output0 ?? x[e.outputNames[0]] ?? Object.values(x)[0], N = x.output1 ?? x[e.outputNames[1]] ?? Object.values(x)[1];
        if (!E || !N) return null;
        const O = qt(E).sort((p, P)=>{
            const St = p.classIndex === G ? 1 : 0;
            return (P.classIndex === G ? 1 : 0) - St || P.score - p.score;
        }), w = O.find((p)=>p.classIndex === G) ?? O[0];
        if (!w) return null;
        const y = Kt(w, N);
        if (!y) return null;
        const L = `m${dt++}`;
        return await wt({
            type: "traceMask",
            id: L,
            width: y.width,
            height: y.height,
            maskData: y.data
        });
    }
    async function Vt(t) {
        const e = `s${dt++}`;
        return await wt({
            type: "segment",
            id: e,
            imageData: t
        });
    }
    async function pt() {
        ft() && await mt().catch(()=>{});
    }
    async function Zt(t) {
        const e = Wt(t);
        let n = null;
        const o = await Jt(e).catch((r)=>(n = r instanceof Error ? r : new Error(String(r)), null));
        if (o) return {
            ...o,
            source: "onnx"
        };
        try {
            return {
                ...await Vt(e),
                source: "fallback"
            };
        } catch (r) {
            if (n) {
                const a = r instanceof Error ? r.message : String(r);
                throw new Error(`ONNX runtime failed: ${n.message}. Fallback failed: ${a}`);
            }
            throw r;
        }
    }
    const nt = 0, ot = 1, $ = 2, Mt = 3;
    function et(t, e, n) {
        return t * .299 + e * .587 + n * .114;
    }
    function Qt(t) {
        return "#" + t.map((e)=>Math.round(k(e, 0, 255)).toString(16).padStart(2, "0")).join("");
    }
    function It(t, e, n) {
        return [
            t[0] + (e[0] - t[0]) * n,
            t[1] + (e[1] - t[1]) * n,
            t[2] + (e[2] - t[2]) * n
        ];
    }
    function te(t, e) {
        return It(t, [
            35,
            30,
            27
        ], e);
    }
    function _(t, e, n, o, r) {
        const a = Math.round(k(o, 0, e - 1)), c = Math.round(k(r, 0, n - 1));
        return t[c * e + a];
    }
    function st(t, e, n = !0) {
        const o = new Float32Array(t.width * t.height);
        let r = 255, a = 0;
        for(let s = 0; s < o.length; s++){
            if (e) {
                const l = e.data[s] >= 127;
                if (n ? !l : l) {
                    o[s] = n ? 255 : et(t.data[s * 4], t.data[s * 4 + 1], t.data[s * 4 + 2]);
                    continue;
                }
            }
            const h = s * 4, i = et(t.data[h], t.data[h + 1], t.data[h + 2]);
            o[s] = i, r = Math.min(r, i), a = Math.max(a, i);
        }
        const c = a - r;
        if (c < 8) return o;
        for(let s = 0; s < o.length; s++){
            if (e) {
                const h = e.data[s] >= 127;
                if (n ? !h : h) continue;
            }
            o[s] = (o[s] - r) / c * 255;
        }
        return o;
    }
    function ee(t) {
        return t >= 192 ? nt : t >= 128 ? ot : t >= 64 ? $ : Mt;
    }
    function vt(t, e, n, o, r, a, c) {
        let s = 0, h = 0, i = 0, l = 0, u = 0, d = 0, g = 0, m = 0;
        for(let w = r; w < r + a; w += 2)if (!(w < 0 || w >= n.height)) for(let y = o; y < o + a; y += 2){
            if (y < 0 || y >= n.width) continue;
            h++;
            const L = w * n.width + y, p = n.data[L] >= 127;
            if (c === "foreground" ? !p : p) continue;
            s++, i += t[L], l += _(t, n.width, n.height, y + 1, w) - _(t, n.width, n.height, y - 1, w), u += _(t, n.width, n.height, y, w + 1) - _(t, n.width, n.height, y, w - 1);
            const P = L * 4;
            d += e.data[P], g += e.data[P + 1], m += e.data[P + 2];
        }
        const x = c === "foreground" ? .28 : .52;
        if (s === 0 || s / Math.max(1, h) < x) return null;
        const E = Math.hypot(l, u), N = (Math.floor(o / a) + Math.floor(r / a)) % 2 === 0 ? Math.PI / 6 : Math.PI / 3, O = i / s;
        return {
            center: {
                x: o + a * .5,
                y: r + a * .5
            },
            tone: ee(O),
            angle: E > 12 ? Math.atan2(u, l) : N,
            darkness: 1 - O / 255,
            cellSize: a,
            gradientStrength: E / Math.max(1, s),
            color: {
                rgb: [
                    d / s,
                    g / s,
                    m / s
                ],
                luma: et(d / s, g / s, m / s)
            }
        };
    }
    function C(t, e, n, o, r, a, c) {
        const s = Math.cos(e) * n * .5, h = Math.sin(e) * n * .5, i = Math.cos(e + Math.PI / 2) * o, l = Math.sin(e + Math.PI / 2) * o;
        return {
            start: {
                x: t.x - s + i,
                y: t.y - h + l
            },
            end: {
                x: t.x + s + i,
                y: t.y + h + l
            },
            width: r,
            alpha: a,
            color: c
        };
    }
    function Ct(t, e, n = !1) {
        const o = n ? .58 : .32, r = n ? .07 : .08 + e * .07, a = It(t, [
            255,
            250,
            244
        ], o);
        return Qt(te(a, r));
    }
    function ne(t, e, n, o, r, a) {
        const c = Math.round(k(15 - r * 5, 8, 14)), s = [];
        for(let h = Math.floor(o.y); h < o.y + o.height; h += c)for(let i = Math.floor(o.x); i < o.x + o.width; i += c){
            const l = vt(t, e, n, i, h, c, "foreground");
            if (!l || l.tone === nt) continue;
            const u = l.center.x * .17 + l.center.y * .31, d = l.angle + (v(u) - .5) * (Math.PI / 36), g = l.cellSize * (.72 + r * .16) * (.8 + v(u + 13) * .4), m = Math.max(1.8, a * 1.25), x = Ct(l.color.rgb, l.darkness);
            if (l.tone === ot) {
                s.push(C(l.center, d, g, 0, a * .85, .24 + l.darkness * .12, x));
                continue;
            }
            if (l.tone === $) {
                s.push(C(l.center, d, g, -m * .45, a * .9, .32 + l.darkness * .12, x), C(l.center, d, g, m * .45, a * .9, .32 + l.darkness * .12, x));
                continue;
            }
            s.push(C(l.center, d, g, -m, a * .95, .4 + l.darkness * .1, x), C(l.center, d, g, 0, a * .95, .4 + l.darkness * .1, x), C(l.center, d, g, m, a * .95, .4 + l.darkness * .1, x), C(l.center, d + Math.PI / 2, g * .9, -m * .35, a * .82, .28 + l.darkness * .1, x), C(l.center, d + Math.PI / 2, g * .9, m * .35, a * .82, .28 + l.darkness * .1, x));
        }
        return s;
    }
    function oe(t, e, n, o, r) {
        const a = Math.round(k(17 - o * 3.8, 10, 17)), c = [];
        for(let s = 0; s < n.height; s += a)for(let h = 0; h < n.width; h += a){
            const i = vt(t, e, n, h, s, a, "background");
            if (!i || i.tone === nt && i.darkness < .025 && i.gradientStrength < 6) continue;
            const l = i.center.x * .11 + i.center.y * .07 + 13, u = i.angle + (v(l) - .5) * (Math.PI / 28), d = i.cellSize * (.72 + v(l + 3) * .34), g = Ct(i.color.rgb, i.darkness, !0), m = i.tone === Mt ? .18 : i.tone === $ ? .135 : .085;
            c.push(C(i.center, u, d, 0, Math.max(.75, r * .68), m + i.darkness * .06 + Math.min(.05, i.gradientStrength / 180), g)), (i.tone >= ot || i.gradientStrength > 12) && c.push(C(i.center, u + Math.PI / 2, d * .74, (v(l + 8) - .5) * Math.max(1.2, r), Math.max(.68, r * .56), .06 + i.darkness * .04, g)), (i.tone >= $ || i.gradientStrength > 20) && c.push(C(i.center, u, d * .82, (v(l + 21) - .5) * Math.max(1.5, r * 1.25), Math.max(.62, r * .48), .045 + i.darkness * .03, g));
        }
        return c;
    }
    function re(t, e, n, o, r) {
        const a = Math.round(k(15 - o * 5, 8, 14)), c = Math.max(6, a - 2), s = [];
        for(let h = Math.floor(n.y); h < n.y + n.height; h += c)for(let i = Math.floor(n.x); i < n.x + n.width; i += c){
            const l = Math.round(k(i, 0, e.width - 1)), u = Math.round(k(h, 0, e.height - 1));
            if (e.data[u * e.width + l] < 127) continue;
            const d = _(t, e.width, e.height, l + 1, u) - _(t, e.width, e.height, l - 1, u), g = _(t, e.width, e.height, l, u + 1) - _(t, e.width, e.height, l, u - 1), m = Math.hypot(d, g);
            if (m < 56) continue;
            const x = Math.atan2(g, d) + Math.PI / 2, E = k(a * (.75 + m / 180), a * .7, a * 1.5);
            s.push(C({
                x: l,
                y: u
            }, x, E, 0, r * .72, .34 + Math.min(.18, m / 255), "#221d19"));
        }
        return s;
    }
    function ae(t) {
        return Ot(t, 4).map((e, n)=>({
                x: e.x + (v(n * .93 + 11) - .5) * 1.1,
                y: e.y + (v(n * 1.21 + 29) - .5) * 1.1
            }));
    }
    function se(t, e, n, o, r, a) {
        const c = k(Number.isFinite(r) ? r : .9, .45, 1.6), s = k(Number.isFinite(a) ? a : 2.1, .8, 4), h = st(n, o, !0), i = st(n), l = ae(t);
        return {
            outline: l,
            bbox: Tt(l),
            backgroundStrokes: oe(i, n, o, c, s),
            strokes: ne(h, n, o, e, c, s),
            edges: re(h, o, e, c, s),
            palette: {
                background: "#fdfaf5",
                stroke: "#4b4138",
                edge: "#2a231e",
                outline: "#181513"
            },
            outlineWidth: k(s + .7, 2, 3.2),
            strokeSize: s,
            density: c
        };
    }
    const it = 1024, B = 640, kt = 120;
    let S = null, Y = !1, M = null, W = null, z = null, T = null, J = null;
    function f(t) {
        return document.getElementById(t);
    }
    function ie(t, e) {
        if (t <= it) return {
            width: t,
            height: e
        };
        const n = it / t;
        return {
            width: Math.round(t * n),
            height: Math.round(e * n)
        };
    }
    function V(t, e, n) {
        return Math.max(e, Math.min(n, t));
    }
    function bt() {
        return {
            stage: f("cat-sketch-crop-stage"),
            box: f("cat-sketch-crop-box"),
            size: f("cat-sketch-crop-size")
        };
    }
    function Et() {
        const t = f("cat-sketch-original"), e = t.clientWidth || t.width || 1, n = t.clientHeight || t.height || 1;
        return {
            scaleX: e / Math.max(1, t.width),
            scaleY: n / Math.max(1, t.height)
        };
    }
    function ce(t) {
        const e = Math.max(kt, Math.round(Math.min(t.width, t.height) * .7));
        return {
            x: Math.round((t.width - e) / 2),
            y: Math.round((t.height - e) / 2),
            size: e
        };
    }
    function ct(t, e) {
        const n = Math.min(e.width, e.height), o = V(t.size, kt, n), r = V(t.x, 0, e.width - o), a = V(t.y, 0, e.height - o);
        return {
            x: r,
            y: a,
            size: o
        };
    }
    function U() {
        if (!S || !M) return;
        const { box: t, size: e } = bt(), { scaleX: n, scaleY: o } = Et(), r = M.x * n, a = M.y * o, c = M.size * n, s = M.size * o;
        t.style.display = "", t.style.left = `${r}px`, t.style.top = `${a}px`, t.style.width = `${c}px`, t.style.height = `${s}px`, e.textContent = `${M.size}px -> ${B}px`;
    }
    async function le(t) {
        const e = await createImageBitmap(t), n = ie(e.width, e.height);
        if (n.width === e.width) return e;
        const o = document.createElement("canvas");
        o.width = n.width, o.height = n.height;
        const r = o.getContext("2d");
        if (!r) throw e.close(), new Error("Canvas 2D context is unavailable");
        return r.drawImage(e, 0, 0, n.width, n.height), e.close(), await createImageBitmap(o);
    }
    function he(t) {
        const e = f("cat-sketch-original"), n = e.getContext("2d");
        n && (e.width = t.width, e.height = t.height, n.clearRect(0, 0, e.width, e.height), n.drawImage(t, 0, 0), U());
    }
    function rt() {
        const t = f("cat-sketch-result"), e = t.getContext("2d");
        e && (t.width = 900, t.height = 900, e.clearRect(0, 0, t.width, t.height), e.fillStyle = "#fffdf9", e.fillRect(0, 0, t.width, t.height), e.strokeStyle = "rgba(23, 23, 23, 0.12)", e.setLineDash([
            8,
            8
        ]), e.strokeRect(28, 28, t.width - 56, t.height - 56), e.setLineDash([]), e.fillStyle = "#6b7280", e.font = "600 28px Inter, system-ui, sans-serif", e.textAlign = "center", e.fillText("Bản phác họa sẽ xuất hiện ở đây", t.width / 2, t.height / 2 - 10), e.font = "400 18px Inter, system-ui, sans-serif", e.fillText("Tải ảnh lên, khoanh vùng vuông, rồi bấm Tạo phác họa", t.width / 2, t.height / 2 + 28), Y = !1, f("cat-sketch-download").disabled = !0);
    }
    let Z = null;
    function ue() {
        const t = f("cat-sketch-check");
        Z && clearTimeout(Z), t.classList.add("is-visible"), Z = setTimeout(()=>t.classList.remove("is-visible"), 2500);
    }
    function de() {
        f("cat-sketch-workspace").style.display = "";
    }
    function F(t) {
        f("cat-sketch-generate").disabled = t || !S || !M, f("cat-sketch-download").disabled = t || !Y, f("cat-sketch-file-input").disabled = t, f("cat-sketch-density").disabled = t, f("cat-sketch-stroke-size").disabled = t;
    }
    async function lt(t) {
        if (t.type.startsWith("image/")) {
            F(!0);
            try {
                S?.bitmap.close();
                const e = await le(t);
                S = {
                    file: t,
                    bitmap: e
                }, M = ce(e), he(e), rt(), de(), f("cat-sketch-generate").disabled = !1;
                const n = `${t.name} • ${e.width} x ${e.height}px`;
                f("cat-sketch-meta").textContent = n, U();
            } catch (e) {
                console.error(e);
            } finally{
                F(!1);
            }
        }
    }
    function fe(t, e) {
        const n = document.createElement("canvas");
        n.width = B, n.height = B;
        const o = n.getContext("2d");
        if (!o) throw new Error("Canvas 2D context is unavailable");
        return o.imageSmoothingEnabled = !0, o.imageSmoothingQuality = "high", o.drawImage(t, e.x, e.y, e.size, e.size, 0, 0, B, B), createImageBitmap(n);
    }
    function ge(t) {
        const e = f("cat-sketch-result"), n = Math.max(t.width, t.height), o = 780 / Math.max(1, n);
        return e.width = Math.max(640, Math.round(t.width * o + 120)), e.height = Math.max(680, Math.round(t.height * o + 140)), e;
    }
    function xe(t, e, n) {
        return {
            ...t,
            outline: t.outline.map((o)=>({
                    x: o.x + e,
                    y: o.y + n
                })),
            strokes: t.strokes.map((o)=>({
                    ...o,
                    start: {
                        x: o.start.x + e,
                        y: o.start.y + n
                    },
                    end: {
                        x: o.end.x + e,
                        y: o.end.y + n
                    }
                })),
            edges: t.edges.map((o)=>({
                    ...o,
                    start: {
                        x: o.start.x + e,
                        y: o.start.y + n
                    },
                    end: {
                        x: o.end.x + e,
                        y: o.end.y + n
                    }
                })),
            bbox: {
                ...t.bbox,
                x: t.bbox.x + e,
                y: t.bbox.y + n
            }
        };
    }
    async function me() {
        if (!S || !M) return;
        const t = f("cat-sketch-density"), e = f("cat-sketch-stroke-size"), n = Number(t.value), o = Number(e.value);
        F(!0), rt();
        let r = null;
        try {
            await pt(), r = await fe(S.bitmap, M);
            const a = await Zt(r), c = ge(r), s = document.createElement("canvas");
            s.width = r.width, s.height = r.height;
            const h = s.getContext("2d");
            if (!h) throw new Error("Canvas 2D context is unavailable");
            h.drawImage(r, 0, 0);
            const i = h.getImageData(0, 0, s.width, s.height), l = se(a.contour, a.bbox, i, a.mask, n, o), u = (c.width - r.width) / 2, d = (c.height - r.height) / 2 + 12, g = xe(l, u, d);
            _t(c, g), Y = !0, f("cat-sketch-download").disabled = !1, ue();
        } catch (a) {
            console.error(a);
        } finally{
            r?.close(), F(!1);
        }
    }
    function we() {
        if (!Y) return;
        const t = f("cat-sketch-result"), e = document.createElement("a");
        e.href = t.toDataURL("image/png"), e.download = "cat-sketch-chitiet.png", e.click();
    }
    function ye(t) {
        if (!S || !M) return;
        const e = t.target.closest("[data-crop-handle]"), n = t.target.closest("#cat-sketch-crop-box");
        !e && !n || (W = e ? "resize" : "move", z = {
            x: t.clientX,
            y: t.clientY
        }, T = {
            ...M
        }, t.currentTarget.setPointerCapture(t.pointerId), t.preventDefault());
    }
    function pe(t) {
        if (!S || !M || !W || !z || !T) return;
        const { scaleX: e, scaleY: n } = Et(), o = (t.clientX - z.x) / Math.max(e, 1e-4), r = (t.clientY - z.y) / Math.max(n, 1e-4);
        if (W === "move") M = ct({
            x: Math.round(T.x + o),
            y: Math.round(T.y + r),
            size: T.size
        }, S.bitmap);
        else {
            const a = Math.round(T.size + Math.max(o, r));
            M = ct({
                x: T.x,
                y: T.y,
                size: a
            }, S.bitmap);
        }
        U();
    }
    function ht(t) {
        if (t) try {
            t.currentTarget.releasePointerCapture(t.pointerId);
        } catch  {}
        W = null, z = null, T = null;
    }
    function Me() {
        const { stage: t } = bt();
        t.addEventListener("pointerdown", ye), t.addEventListener("pointermove", pe), t.addEventListener("pointerup", ht), t.addEventListener("pointercancel", ht), J?.disconnect(), J = new ResizeObserver(()=>U()), J.observe(t);
    }
    function Ie() {
        const t = f("cat-sketch-file-input"), e = f("cat-sketch-dropzone"), n = f("cat-sketch-select"), o = f("cat-sketch-generate"), r = f("cat-sketch-download"), a = f("cat-sketch-density"), c = f("cat-sketch-density-value"), s = f("cat-sketch-stroke-size"), h = f("cat-sketch-stroke-size-value");
        rt(), Me(), n.addEventListener("click", ()=>t.click()), o.addEventListener("click", ()=>{
            me();
        }), r.addEventListener("click", we), t.addEventListener("change", ()=>{
            const [i] = Array.from(t.files ?? []);
            i && (lt(i), t.value = "");
        }), a.addEventListener("input", ()=>{
            c.textContent = Number(a.value).toFixed(2);
        }), s.addEventListener("input", ()=>{
            h.textContent = Number(s.value).toFixed(2);
        }), e.addEventListener("dragover", (i)=>{
            i.preventDefault(), e.classList.add("is-dragover");
        }), e.addEventListener("dragleave", ()=>{
            e.classList.remove("is-dragover");
        }), e.addEventListener("drop", (i)=>{
            i.preventDefault(), e.classList.remove("is-dragover");
            const [l] = Array.from(i.dataTransfer?.files ?? []);
            l && lt(l);
        }), pt();
    }
    document.addEventListener("DOMContentLoaded", ()=>Ie());
})();
