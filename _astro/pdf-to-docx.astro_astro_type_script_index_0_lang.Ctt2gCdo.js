import { _ as U } from "./preload-helper.CVfkMyKi.js";
(async ()=>{
    const $ = 50 * 1024 * 1024, b = 50;
    async function V() {
        const e = await U(()=>import("./pdf.C_7zF4kU.js").then(async (m)=>{
                await m.__tla;
                return m;
            }), []);
        return e.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${e.version}/build/pdf.worker.min.mjs`, e;
    }
    async function W(e, s) {
        return await e.getDocument({
            data: s
        }).promise;
    }
    function f(e) {
        return e < 1024 ? e + " B" : e < 1024 * 1024 ? (e / 1024).toFixed(1) + " KB" : (e / (1024 * 1024)).toFixed(2) + " MB";
    }
    function G() {
        const e = document.getElementById("p2d-dropzone"), s = document.getElementById("p2d-file-input"), B = document.getElementById("p2d-select-btn"), k = document.getElementById("p2d-workspace"), C = document.getElementById("p2d-filename"), P = document.getElementById("p2d-filesize"), F = document.getElementById("p2d-remove"), g = document.getElementById("p2d-pages"), z = document.getElementById("p2d-size-info"), v = document.getElementById("p2d-warning"), D = document.getElementById("p2d-warning-text"), _ = document.getElementById("p2d-preserve"), O = document.getElementById("p2d-images"), R = document.getElementById("p2d-ocr"), o = document.getElementById("p2d-convert"), l = document.getElementById("p2d-action"), p = document.getElementById("p2d-progress"), j = document.getElementById("p2d-progress-status"), A = document.getElementById("p2d-progress-pct"), I = document.getElementById("p2d-progress-fill"), y = document.getElementById("p2d-result"), S = document.getElementById("p2d-result-desc"), T = document.getElementById("p2d-download"), M = document.getElementById("p2d-reset");
        let a = null, h = "", u = null;
        function L() {
            e.style.display = "", k.style.display = "none", p.style.display = "none", y.style.display = "none", l.style.display = "", v.style.display = "none", o.disabled = !1, a = null, h = "", u = null, I.style.width = "0%";
        }
        function c(t) {
            D.textContent = t, v.style.display = "";
        }
        async function w(t) {
            if (t.type !== "application/pdf") {
                alert("Vui lòng chọn file PDF.");
                return;
            }
            if (t.size > $) {
                alert(`File quá lớn (${f(t.size)}). Giới hạn tối đa là 50 MB.`);
                return;
            }
            h = t.name, a = await t.arrayBuffer(), e.style.display = "none", k.style.display = "", y.style.display = "none", l.style.display = "", v.style.display = "none", o.disabled = !0, C.textContent = t.name, P.textContent = f(t.size), g.textContent = "...", z.textContent = f(t.size);
            try {
                const n = await V(), r = await W(n, a.slice(0)), d = r.numPages;
                g.textContent = String(d), d > b && c(`File có ${d} trang, vượt giới hạn ${b} trang. Quá trình chuyển đổi có thể chậm.`), (await (await r.getPage(1)).getTextContent()).items.some((x)=>x.str && x.str.trim()) || c("File PDF có vẻ là bản scan hoặc không chứa văn bản. Bật OCR để trích xuất nội dung."), o.disabled = !1;
            } catch (n) {
                const r = (n?.message || "").toLowerCase();
                if (r.includes("encrypt") || r.includes("password")) {
                    g.textContent = "—", c("File PDF được bảo vệ bằng mật khẩu. Không thể chuyển đổi.");
                    return;
                }
                c("Không thể đọc file PDF. Vui lòng thử file khác."), g.textContent = "—";
            }
        }
        B.addEventListener("click", (t)=>{
            t.stopPropagation(), s.click();
        }), e.addEventListener("click", (t)=>{
            B.contains(t.target) || s.click();
        }), s.addEventListener("change", ()=>{
            const t = s.files?.[0];
            t && (w(t), s.value = "");
        }), e.addEventListener("dragover", (t)=>{
            t.preventDefault(), e.classList.add("dragover");
        }), e.addEventListener("dragleave", ()=>e.classList.remove("dragover")), e.addEventListener("drop", (t)=>{
            t.preventDefault(), e.classList.remove("dragover");
            const n = t.dataTransfer?.files[0];
            n && w(n);
        }), F.addEventListener("click", L), o.addEventListener("click", ()=>{
            if (!a) return;
            o.disabled = !0, l.style.display = "none", p.style.display = "", y.style.display = "none";
            const t = {
                preserveLayout: _.checked,
                includeImages: O.checked,
                enableOCR: R?.checked ?? !1
            }, n = new Worker(new URL("/_astro/worker-B2ZRLIQ-.js", import.meta.url), {
                type: "module"
            }), r = {
                type: "convert",
                buffer: a,
                options: t
            };
            n.postMessage(r, [
                a
            ]), n.onmessage = (d)=>{
                const i = d.data;
                switch(i.type){
                    case "progress":
                        I.style.width = i.pct + "%", A.textContent = i.pct + "%", j.textContent = i.status;
                        break;
                    case "result":
                        u = i.blob, p.style.display = "none", y.style.display = "", S.textContent = `File DOCX (${f(u.size)}) đã sẵn sàng để tải về.`, n.terminate();
                        break;
                    case "error":
                        console.error("Worker error:", i.message), p.style.display = "none", l.style.display = "", o.disabled = !1, c("Đã xảy ra lỗi khi chuyển đổi. Vui lòng thử lại."), n.terminate();
                        break;
                }
            }, n.onerror = (d)=>{
                console.error("Worker crashed:", d), p.style.display = "none", l.style.display = "", o.disabled = !1, c("Đã xảy ra lỗi khi chuyển đổi. Vui lòng thử lại."), n.terminate();
            };
        }), T.addEventListener("click", ()=>{
            if (!u) return;
            const t = document.createElement("a"), n = URL.createObjectURL(u);
            t.href = n, t.download = h.replace(/\.pdf$/i, "") + ".docx", t.click(), setTimeout(()=>URL.revokeObjectURL(n), 2e3);
        }), M.addEventListener("click", L);
    }
    document.addEventListener("DOMContentLoaded", G);
    const m = document.getElementById("p2d-privacy-trigger"), E = document.getElementById("p2d-privacy-popover");
    m.addEventListener("click", (e)=>{
        e.stopPropagation();
        const s = E.classList.toggle("p2d-privacy-popover--open");
        m.setAttribute("aria-expanded", String(s));
    });
    document.addEventListener("click", (e)=>{
        !E.contains(e.target) && !m.contains(e.target) && (E.classList.remove("p2d-privacy-popover--open"), m.setAttribute("aria-expanded", "false"));
    });
    document.addEventListener("keydown", (e)=>{
        e.key === "Escape" && (E.classList.remove("p2d-privacy-popover--open"), m.setAttribute("aria-expanded", "false"));
    });
})();
