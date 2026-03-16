(async ()=>{
    let m = null, p = null, b = null, h = null, y = null, w = null;
    async function q(t) {
        return m || (m = await import("./index-BDDcLt9O.js")), m.decode(t);
    }
    async function x(t) {
        return p || (p = await import("./index-B1wDQax6.js")), p.decode(t);
    }
    async function v(t) {
        return m || (m = await import("./index-BDDcLt9O.js")), m.encode(t);
    }
    async function A(t, e) {
        return p || (p = await import("./index-B1wDQax6.js")), p.encode(t, e);
    }
    async function I(t, e) {
        return b || (b = await import("./index-CT6H8cJb.js").then(async (m)=>{
            await m.__tla;
            return m;
        })), b.encode(t, {
            quality: e
        });
    }
    async function N(t, e) {
        return h || (h = await import("./index-K0HCr6x_.js").then(async (m)=>{
            await m.__tla;
            return m;
        })), h.encode(t, {
            quality: e
        });
    }
    async function z(t, e) {
        return y || (y = await import("./index-Bv7UyWnQ.js").then(async (m)=>{
            await m.__tla;
            return m;
        })), y.optimise(t, {
            level: e
        });
    }
    async function B(t, e, i, a) {
        w || (w = await import("./imagequant-CVOhmW1I.js").then(async (m)=>{
            await m.__tla;
            return m;
        }));
        const { Imagequant: c, ImagequantImage: n } = w, l = new Uint8Array(t.data.buffer), o = new n(l, t.width, t.height, 0), u = new c;
        u.set_quality(e, i), u.set_speed(a);
        const s = u.process(o);
        return s.buffer.slice(s.byteOffset, s.byteOffset + s.byteLength);
    }
    const F = {
        balanced: [
            82,
            76,
            70,
            64
        ],
        smaller: [
            68,
            62,
            55,
            48
        ],
        maximum: [
            50,
            42,
            35,
            28
        ]
    }, G = .35, L = {
        balanced: 2,
        smaller: 3,
        maximum: 4
    }, M = {
        balanced: {
            min: 65,
            target: 80,
            speed: 3
        },
        smaller: {
            min: 45,
            target: 65,
            speed: 3
        },
        maximum: {
            min: 20,
            target: 45,
            speed: 1
        }
    }, T = {
        balanced: 80,
        smaller: 70,
        maximum: 60
    }, O = {
        balanced: 50,
        smaller: 40,
        maximum: 30
    };
    async function R(t, e, i, a) {
        const c = t.byteLength;
        a(5, "Đang đọc ảnh...");
        const n = e === "image/png" ? await q(t) : await x(t);
        return a(10, "Đã đọc ảnh xong"), i.mode === "reduce-size" ? U(n, e, i, c, t, a) : k(n, i, c, a);
    }
    async function U(t, e, i, a, c, n) {
        const l = [];
        if (e === "image/png") {
            let u;
            try {
                n(15, "Đang giảm màu PNG...");
                const s = M[i.level], r = await B(t, s.min, s.target, s.speed);
                n(55, "Đang tối ưu PNG...");
                const f = L[i.level];
                u = await z(r, f);
            } catch  {
                n(30, "Đang nén PNG...");
                const s = await v(t);
                n(60, "Đang tối ưu PNG...");
                const r = L[i.level];
                u = await z(s, r);
            }
            l.push({
                format: "png",
                buffer: u,
                size: u.byteLength
            }), n(90, "Đã nén PNG xong");
        } else {
            const u = F[i.level];
            let s = null, r = a;
            for(let f = 0; f < u.length; f++){
                const _ = u[f], E = 15 + Math.round((f + 1) / u.length * 70);
                n(E, `Đang thử chất lượng ${_}...`);
                const d = await A(t, {
                    quality: _,
                    progressive: !0,
                    optimize_coding: !0,
                    trellis_multipass: !0,
                    trellis_opt_zero: !0,
                    trellis_opt_table: !0,
                    trellis_loops: 1,
                    auto_subsample: !0,
                    chroma_subsample: 2
                });
                if (d.byteLength < r && (s = d, r = d.byteLength, (a - r) / a > G)) {
                    n(85, "Đã đạt mức nén tốt, dừng sớm");
                    break;
                }
            }
            s ? l.push({
                format: "jpeg",
                buffer: s,
                size: r
            }) : l.push({
                format: "jpeg",
                buffer: c,
                size: a
            }), n(90, "Đã nén JPEG xong");
        }
        n(100, "Hoàn tất!");
        const o = l[0];
        return {
            originalSize: a,
            results: l,
            bestFormat: o.format,
            bestBuffer: o.buffer,
            bestSize: o.size
        };
    }
    async function k(t, e, i, a) {
        const c = [], { targetFormat: n, level: l } = e;
        if (n === "webp" || n === "auto") try {
            a(20, "Đang tạo WebP...");
            const u = T[l], s = await I(t, u);
            c.push({
                format: "webp",
                buffer: s,
                size: s.byteLength
            }), a(n === "auto" ? 45 : 90, "Đã tạo WebP xong");
        } catch  {
            a(n === "auto" ? 45 : 90, "WebP không khả dụng, bỏ qua...");
        }
        if (n === "avif" || n === "auto") try {
            a(n === "auto" ? 50 : 20, "Đang tạo AVIF...");
            const u = O[l], s = await N(t, u);
            c.push({
                format: "avif",
                buffer: s,
                size: s.byteLength
            }), a(90, "Đã tạo AVIF xong");
        } catch  {
            a(90, "AVIF không khả dụng, bỏ qua...");
        }
        if (c.length === 0) throw new Error("Không thể tạo định dạng nào");
        a(95, "Đang so sánh kết quả...");
        let o = c[0];
        for (const u of c)u.size < o.size && (o = u);
        return a(100, "Hoàn tất!"), {
            originalSize: i,
            results: c,
            bestFormat: o.format,
            bestBuffer: o.buffer,
            bestSize: o.size
        };
    }
    function g(t, e) {
        e ? self.postMessage(t, e) : self.postMessage(t);
    }
    self.onmessage = async (t)=>{
        const e = t.data;
        if (e.type === "init") {
            g({
                type: "ready"
            });
            return;
        }
        if (e.type === "compress") try {
            const i = await R(e.buffer, e.mimeType, e.options, (c, n)=>{
                g({
                    type: "progress",
                    id: e.id,
                    pct: c,
                    status: n
                });
            }), a = i.results.map((c)=>c.buffer);
            g({
                type: "result",
                id: e.id,
                originalSize: i.originalSize,
                results: i.results,
                bestFormat: i.bestFormat,
                bestBuffer: i.bestBuffer,
                bestSize: i.bestSize
            }, a);
        } catch (i) {
            g({
                type: "error",
                id: e.id,
                message: i?.message || "Lỗi không xác định"
            });
        }
    };
})();
