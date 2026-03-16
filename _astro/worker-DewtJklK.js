(async ()=>{
    let r = null, l = null, p = null, d = null, b = null;
    async function g(t) {
        return r || (r = await import("./index-BDDcLt9O.js")), r.decode(t);
    }
    async function y(t) {
        return l || (l = await import("./index-B1wDQax6.js")), l.decode(t);
    }
    async function h(t) {
        return r || (r = await import("./index-BDDcLt9O.js")), r.encode(t);
    }
    async function w(t, e) {
        return l || (l = await import("./index-B1wDQax6.js")), l.encode(t, {
            quality: e
        });
    }
    async function z(t, e) {
        return p || (p = await import("./index-CT6H8cJb.js").then(async (m)=>{
            await m.__tla;
            return m;
        })), p.encode(t, {
            quality: e
        });
    }
    async function E(t, e) {
        return d || (d = await import("./index-K0HCr6x_.js").then(async (m)=>{
            await m.__tla;
            return m;
        })), d.encode(t, {
            quality: e
        });
    }
    async function L(t, e) {
        return b || (b = await import("./index-Bv7UyWnQ.js").then(async (m)=>{
            await m.__tla;
            return m;
        })), b.optimise(t, {
            level: e
        });
    }
    const x = {
        balanced: 80,
        smaller: 65,
        maximum: 50
    }, v = {
        balanced: 2,
        smaller: 3,
        maximum: 4
    }, F = {
        balanced: 80,
        smaller: 70,
        maximum: 60
    }, A = {
        balanced: 50,
        smaller: 40,
        maximum: 30
    };
    async function B(t, e, a, i) {
        const n = t.byteLength;
        i(5, "Đang đọc ảnh...");
        const o = e === "image/png" ? await g(t) : await y(t);
        return i(10, "Đã đọc ảnh xong"), a.mode === "reduce-size" ? I(o, e, a, n, i) : S(o, a, n, i);
    }
    async function I(t, e, a, i, n) {
        const o = [];
        if (e === "image/png") {
            n(20, "Đang nén PNG...");
            const u = await h(t);
            n(50, "Đang tối ưu PNG...");
            const c = v[a.level], s = await L(u, c);
            o.push({
                format: "png",
                buffer: s,
                size: s.byteLength
            }), n(90, "Đã nén PNG xong");
        } else {
            n(20, "Đang nén JPEG...");
            const u = x[a.level], c = await w(t, u);
            o.push({
                format: "jpeg",
                buffer: c,
                size: c.byteLength
            }), n(90, "Đã nén JPEG xong");
        }
        n(100, "Hoàn tất!");
        const f = o[0];
        return {
            originalSize: i,
            results: o,
            bestFormat: f.format,
            bestBuffer: f.buffer,
            bestSize: f.size
        };
    }
    async function S(t, e, a, i) {
        const n = [], { targetFormat: o, level: f } = e;
        if (o === "webp" || o === "auto") try {
            i(20, "Đang tạo WebP...");
            const c = F[f], s = await z(t, c);
            n.push({
                format: "webp",
                buffer: s,
                size: s.byteLength
            }), i(o === "auto" ? 45 : 90, "Đã tạo WebP xong");
        } catch  {
            i(o === "auto" ? 45 : 90, "WebP không khả dụng, bỏ qua...");
        }
        if (o === "avif" || o === "auto") try {
            i(o === "auto" ? 50 : 20, "Đang tạo AVIF...");
            const c = A[f], s = await E(t, c);
            n.push({
                format: "avif",
                buffer: s,
                size: s.byteLength
            }), i(90, "Đã tạo AVIF xong");
        } catch  {
            i(90, "AVIF không khả dụng, bỏ qua...");
        }
        if (n.length === 0) throw new Error("Không thể tạo định dạng nào");
        i(95, "Đang so sánh kết quả...");
        let u = n[0];
        for (const c of n)c.size < u.size && (u = c);
        return i(100, "Hoàn tất!"), {
            originalSize: a,
            results: n,
            bestFormat: u.format,
            bestBuffer: u.buffer,
            bestSize: u.size
        };
    }
    function m(t, e) {
        e ? self.postMessage(t, e) : self.postMessage(t);
    }
    self.onmessage = async (t)=>{
        const e = t.data;
        if (e.type === "init") {
            m({
                type: "ready"
            });
            return;
        }
        if (e.type === "compress") try {
            const a = await B(e.buffer, e.mimeType, e.options, (n, o)=>{
                m({
                    type: "progress",
                    id: e.id,
                    pct: n,
                    status: o
                });
            }), i = a.results.map((n)=>n.buffer);
            m({
                type: "result",
                id: e.id,
                originalSize: a.originalSize,
                results: a.results,
                bestFormat: a.bestFormat,
                bestBuffer: a.bestBuffer,
                bestSize: a.bestSize
            }, i);
        } catch (a) {
            m({
                type: "error",
                id: e.id,
                message: a?.message || "Lỗi không xác định"
            });
        }
    };
})();
