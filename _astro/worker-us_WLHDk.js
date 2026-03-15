(async ()=>{
    let o = null, p = null, r = null, d = null, l = null;
    async function m(e) {
        return o || (o = await import("./index-BDDcLt9O.js")), o.decode(e);
    }
    async function y(e) {
        return p || (p = await import("./index-B1wDQax6.js")), p.decode(e);
    }
    async function h(e) {
        return o || (o = await import("./index-BDDcLt9O.js")), o.encode(e);
    }
    async function w(e, n) {
        return r || (r = await import("./index-CT6H8cJb.js").then(async (m)=>{
            await m.__tla;
            return m;
        })), r.encode(e, {
            quality: n
        });
    }
    async function z(e, n) {
        return d || (d = await import("./index-K0HCr6x_.js").then(async (m)=>{
            await m.__tla;
            return m;
        })), d.encode(e, {
            quality: n
        });
    }
    async function M(e, n) {
        return l || (l = await import("./index-Bv7UyWnQ.js").then(async (m)=>{
            await m.__tla;
            return m;
        })), l.optimise(e, {
            level: n
        });
    }
    async function k(e, n, t) {
        const u = e.byteLength;
        t(5, "Đang đọc ảnh...");
        const s = n === "image/png" ? await m(e) : await y(e);
        t(10, "Đã đọc ảnh xong");
        const i = [];
        t(15, "Đang nén PNG...");
        const b = await h(s);
        t(30, "Đang tối ưu PNG...");
        const g = await M(b, 3);
        i.push({
            format: "png",
            buffer: g,
            size: g.byteLength
        }), t(45, "Đã nén PNG xong");
        try {
            t(50, "Đang tạo WebP...");
            const a = await w(s, 75);
            i.push({
                format: "webp",
                buffer: a,
                size: a.byteLength
            }), t(65, "Đã tạo WebP xong");
        } catch  {
            t(65, "WebP không khả dụng, bỏ qua...");
        }
        try {
            t(70, "Đang tạo AVIF...");
            const a = await z(s, 45);
            i.push({
                format: "avif",
                buffer: a,
                size: a.byteLength
            }), t(90, "Đã tạo AVIF xong");
        } catch  {
            t(90, "AVIF không khả dụng, bỏ qua...");
        }
        t(95, "Đang so sánh kết quả...");
        let c = i[0];
        for (const a of i)a.size < c.size && (c = a);
        return t(100, "Hoàn tất!"), {
            originalSize: u,
            results: i,
            bestFormat: c.format,
            bestBuffer: c.buffer,
            bestSize: c.size
        };
    }
    function f(e, n) {
        n ? self.postMessage(e, n) : self.postMessage(e);
    }
    self.onmessage = async (e)=>{
        const n = e.data;
        if (n.type === "init") {
            f({
                type: "ready"
            });
            return;
        }
        if (n.type === "compress") try {
            const t = await k(n.buffer, n.mimeType, (s, i)=>{
                f({
                    type: "progress",
                    id: n.id,
                    pct: s,
                    status: i
                });
            }), u = t.results.map((s)=>s.buffer);
            f({
                type: "result",
                id: n.id,
                originalSize: t.originalSize,
                results: t.results,
                bestFormat: t.bestFormat,
                bestBuffer: t.bestBuffer,
                bestSize: t.bestSize
            }, u);
        } catch (t) {
            f({
                type: "error",
                id: n.id,
                message: t?.message || "Lỗi không xác định"
            });
        }
    };
})();
