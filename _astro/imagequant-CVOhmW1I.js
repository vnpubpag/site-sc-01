let w, m, A, B, C;
let __tla = (async ()=>{
    var v = "/_astro/imagequant_bg-BcMVf2Ny.wasm", z = async (n = {}, _)=>{
        let o;
        if (_.startsWith("data:")) {
            const d = _.replace(/^data:.*?base64,/, "");
            let t;
            if (typeof Buffer == "function" && typeof Buffer.from == "function") t = Buffer.from(d, "base64");
            else if (typeof atob == "function") {
                const c = atob(d);
                t = new Uint8Array(c.length);
                for(let a = 0; a < c.length; a++)t[a] = c.charCodeAt(a);
            } else throw new Error("Cannot decode base64-encoded data URL");
            o = await WebAssembly.instantiate(t, n);
        } else {
            const d = await fetch(_), t = d.headers.get("Content-Type") || "";
            if ("instantiateStreaming" in WebAssembly && t.startsWith("application/wasm")) o = await WebAssembly.instantiateStreaming(d, n);
            else {
                const c = await d.arrayBuffer();
                o = await WebAssembly.instantiate(c, n);
            }
        }
        return o.instance.exports;
    };
    let l;
    A = function(n) {
        l = n;
    };
    const W = typeof TextDecoder > "u" ? (0, module.require)("util").TextDecoder : TextDecoder;
    let k = new W("utf-8", {
        ignoreBOM: !0,
        fatal: !0
    });
    k.decode();
    let f = null;
    function b() {
        return (f === null || f.byteLength === 0) && (f = new Uint8Array(l.memory.buffer)), f;
    }
    function q(n, _) {
        return n = n >>> 0, k.decode(b().subarray(n, n + _));
    }
    const s = new Array(128).fill(void 0);
    s.push(void 0, null, !0, !1);
    let u = s.length;
    function j(n) {
        u === s.length && s.push(s.length + 1);
        const _ = u;
        return u = s[_], s[_] = n, _;
    }
    let y = 0;
    function x(n, _) {
        const o = _(n.length * 1, 1) >>> 0;
        return b().set(n, o / 1), y = n.length, o;
    }
    let h = null;
    function p() {
        return (h === null || h.byteLength === 0) && (h = new Int32Array(l.memory.buffer)), h;
    }
    function T(n) {
        return s[n];
    }
    function O(n) {
        n < 132 || (s[n] = u, u = n);
    }
    function r(n) {
        const _ = T(n);
        return O(n), _;
    }
    function U(n, _) {
        if (!(n instanceof _)) throw new Error(`expected instance of ${_.name}`);
        return n.ptr;
    }
    function M(n, _) {
        return n = n >>> 0, b().subarray(n / 1, n / 1 + _);
    }
    w = class {
        static __wrap(_) {
            _ = _ >>> 0;
            const o = Object.create(w.prototype);
            return o.__wbg_ptr = _, o;
        }
        __destroy_into_raw() {
            const _ = this.__wbg_ptr;
            return this.__wbg_ptr = 0, _;
        }
        free() {
            const _ = this.__destroy_into_raw();
            l.__wbg_imagequant_free(_);
        }
        constructor(){
            const _ = l.imagequant_new();
            return w.__wrap(_);
        }
        static new_image(_, o, d, t) {
            const c = x(_, l.__wbindgen_malloc), a = y, g = l.imagequant_new_image(c, a, o, d, t);
            return m.__wrap(g);
        }
        set_max_colors(_) {
            try {
                const t = l.__wbindgen_add_to_stack_pointer(-16);
                l.imagequant_set_max_colors(t, this.__wbg_ptr, _);
                var o = p()[t / 4 + 0], d = p()[t / 4 + 1];
                if (d) throw r(o);
            } finally{
                l.__wbindgen_add_to_stack_pointer(16);
            }
        }
        set_quality(_, o) {
            try {
                const c = l.__wbindgen_add_to_stack_pointer(-16);
                l.imagequant_set_quality(c, this.__wbg_ptr, _, o);
                var d = p()[c / 4 + 0], t = p()[c / 4 + 1];
                if (t) throw r(d);
            } finally{
                l.__wbindgen_add_to_stack_pointer(16);
            }
        }
        set_speed(_) {
            try {
                const t = l.__wbindgen_add_to_stack_pointer(-16);
                l.imagequant_set_speed(t, this.__wbg_ptr, _);
                var o = p()[t / 4 + 0], d = p()[t / 4 + 1];
                if (d) throw r(o);
            } finally{
                l.__wbindgen_add_to_stack_pointer(16);
            }
        }
        set_min_posterization(_) {
            try {
                const t = l.__wbindgen_add_to_stack_pointer(-16);
                l.imagequant_set_min_posterization(t, this.__wbg_ptr, _);
                var o = p()[t / 4 + 0], d = p()[t / 4 + 1];
                if (d) throw r(o);
            } finally{
                l.__wbindgen_add_to_stack_pointer(16);
            }
        }
        process(_) {
            try {
                const i = l.__wbindgen_add_to_stack_pointer(-16);
                U(_, m);
                var o = _.__destroy_into_raw();
                l.imagequant_process(i, this.__wbg_ptr, o);
                var d = p()[i / 4 + 0], t = p()[i / 4 + 1], c = p()[i / 4 + 2], a = p()[i / 4 + 3];
                if (a) throw r(c);
                var g = M(d, t).slice();
                return l.__wbindgen_free(d, t * 1), g;
            } finally{
                l.__wbindgen_add_to_stack_pointer(16);
            }
        }
    };
    m = class {
        static __wrap(_) {
            _ = _ >>> 0;
            const o = Object.create(m.prototype);
            return o.__wbg_ptr = _, o;
        }
        __destroy_into_raw() {
            const _ = this.__wbg_ptr;
            return this.__wbg_ptr = 0, _;
        }
        free() {
            const _ = this.__destroy_into_raw();
            l.__wbg_imagequantimage_free(_);
        }
        constructor(_, o, d, t){
            const c = x(_, l.__wbindgen_malloc), a = y, g = l.imagequantimage_new(c, a, o, d, t);
            return m.__wrap(g);
        }
    };
    B = function(n, _) {
        const o = new Error(q(n, _));
        return j(o);
    };
    C = function(n, _) {
        throw new Error(q(n, _));
    };
    URL = globalThis.URL;
    const e = await z({
        "./imagequant_bg.js": {
            __wbindgen_error_new: B,
            __wbindgen_throw: C
        }
    }, v), E = e.memory, L = e.__wbg_imagequantimage_free, D = e.imagequantimage_new, S = e.__wbg_imagequant_free, R = e.imagequant_new, F = e.imagequant_new_image, N = e.imagequant_set_max_colors, V = e.imagequant_set_quality, $ = e.imagequant_set_speed, H = e.imagequant_set_min_posterization, G = e.imagequant_process, I = e.lodepng_malloc, J = e.lodepng_realloc, K = e.lodepng_free, P = e.lodepng_state_init, Q = e.lodepng_state_cleanup, X = e.lodepng_state_copy, Y = e.lodepng_error_text, Z = e.lodepng_encode32, ee = e.lodepng_encode24, _e = e.lodepng_encode_file, ne = e.lodepng_encode32_file, oe = e.lodepng_encode24_file, te = e.lodepng_get_bpp_lct, le = e.lodepng_get_bpp, de = e.lodepng_get_channels, ce = e.lodepng_is_greyscale_type, pe = e.lodepng_is_alpha_type, ae = e.lodepng_is_palette_type, se = e.lodepng_has_palette_alpha, ge = e.lodepng_can_have_alpha, ie = e.lodepng_get_raw_size, re = e.lodepng_get_raw_size_lct, ue = e.lodepng_palette_clear, me = e.lodepng_palette_add, fe = e.lodepng_clear_text, he = e.lodepng_add_text, we = e.lodepng_clear_itext, be = e.lodepng_add_itext, ye = e.lodepng_chunk_create, ke = e.lodepng_chunk_length, qe = e.lodepng_chunk_type, xe = e.lodepng_chunk_type_equals, ve = e.lodepng_chunk_data_const, ze = e.lodepng_chunk_next, Ae = e.lodepng_chunk_ancillary, We = e.lodepng_chunk_private, je = e.lodepng_chunk_safetocopy, Te = e.lodepng_chunk_data, Oe = e.lodepng_chunk_check_crc, Ue = e.lodepng_chunk_generate_crc, Me = e.lodepng_chunk_append, Be = e.lodepng_color_mode_init, Ce = e.lodepng_color_mode_cleanup, Ee = e.lodepng_color_mode_equal, Le = e.lodepng_color_mode_copy, De = e.lodepng_zlib_decompress, Se = e.zlib_decompress, Re = e.lodepng_zlib_compress, Fe = e.zlib_compress, Ne = e.lodepng_compress_settings_init, Ve = e.lodepng_decompress_settings_init, $e = e.lodepng_crc32, He = e.lodepng_info_init, Ge = e.lodepng_info_cleanup, Ie = e.lodepng_info_copy, Je = e.lodepng_info_swap, Ke = e.lodepng_convert, Pe = e.lodepng_inspect, Qe = e.lodepng_decode, Xe = e.lodepng_decode_memory, Ye = e.lodepng_decode32, Ze = e.lodepng_decode24, e_ = e.lodepng_decode_file, __ = e.lodepng_decode32_file, n_ = e.lodepng_decode24_file, o_ = e.lodepng_decoder_settings_init, t_ = e.lodepng_buffer_file, l_ = e.lodepng_load_file, d_ = e.lodepng_save_file, c_ = e.lodepng_encode, p_ = e.lodepng_get_color_profile, a_ = e.lodepng_auto_choose_color, s_ = e.lodepng_filesize, g_ = e.lodepng_encode_memory, i_ = e.lodepng_encoder_settings_init, r_ = e.lodepng_color_profile_init, u_ = e.lodepng_default_compress_settings, m_ = e.lodepng_default_decompress_settings, f_ = e.lodepng_chunk_next_const, h_ = e.__wbindgen_malloc, w_ = e.__wbindgen_add_to_stack_pointer, b_ = e.__wbindgen_free;
    var y_ = Object.freeze({
        __proto__: null,
        __wbg_imagequant_free: S,
        __wbg_imagequantimage_free: L,
        __wbindgen_add_to_stack_pointer: w_,
        __wbindgen_free: b_,
        __wbindgen_malloc: h_,
        imagequant_new: R,
        imagequant_new_image: F,
        imagequant_process: G,
        imagequant_set_max_colors: N,
        imagequant_set_min_posterization: H,
        imagequant_set_quality: V,
        imagequant_set_speed: $,
        imagequantimage_new: D,
        lodepng_add_itext: be,
        lodepng_add_text: he,
        lodepng_auto_choose_color: a_,
        lodepng_buffer_file: t_,
        lodepng_can_have_alpha: ge,
        lodepng_chunk_ancillary: Ae,
        lodepng_chunk_append: Me,
        lodepng_chunk_check_crc: Oe,
        lodepng_chunk_create: ye,
        lodepng_chunk_data: Te,
        lodepng_chunk_data_const: ve,
        lodepng_chunk_generate_crc: Ue,
        lodepng_chunk_length: ke,
        lodepng_chunk_next: ze,
        lodepng_chunk_next_const: f_,
        lodepng_chunk_private: We,
        lodepng_chunk_safetocopy: je,
        lodepng_chunk_type: qe,
        lodepng_chunk_type_equals: xe,
        lodepng_clear_itext: we,
        lodepng_clear_text: fe,
        lodepng_color_mode_cleanup: Ce,
        lodepng_color_mode_copy: Le,
        lodepng_color_mode_equal: Ee,
        lodepng_color_mode_init: Be,
        lodepng_color_profile_init: r_,
        lodepng_compress_settings_init: Ne,
        lodepng_convert: Ke,
        lodepng_crc32: $e,
        lodepng_decode: Qe,
        lodepng_decode24: Ze,
        lodepng_decode24_file: n_,
        lodepng_decode32: Ye,
        lodepng_decode32_file: __,
        lodepng_decode_file: e_,
        lodepng_decode_memory: Xe,
        lodepng_decoder_settings_init: o_,
        lodepng_decompress_settings_init: Ve,
        lodepng_default_compress_settings: u_,
        lodepng_default_decompress_settings: m_,
        lodepng_encode: c_,
        lodepng_encode24: ee,
        lodepng_encode24_file: oe,
        lodepng_encode32: Z,
        lodepng_encode32_file: ne,
        lodepng_encode_file: _e,
        lodepng_encode_memory: g_,
        lodepng_encoder_settings_init: i_,
        lodepng_error_text: Y,
        lodepng_filesize: s_,
        lodepng_free: K,
        lodepng_get_bpp: le,
        lodepng_get_bpp_lct: te,
        lodepng_get_channels: de,
        lodepng_get_color_profile: p_,
        lodepng_get_raw_size: ie,
        lodepng_get_raw_size_lct: re,
        lodepng_has_palette_alpha: se,
        lodepng_info_cleanup: Ge,
        lodepng_info_copy: Ie,
        lodepng_info_init: He,
        lodepng_info_swap: Je,
        lodepng_inspect: Pe,
        lodepng_is_alpha_type: pe,
        lodepng_is_greyscale_type: ce,
        lodepng_is_palette_type: ae,
        lodepng_load_file: l_,
        lodepng_malloc: I,
        lodepng_palette_add: me,
        lodepng_palette_clear: ue,
        lodepng_realloc: J,
        lodepng_save_file: d_,
        lodepng_state_cleanup: Q,
        lodepng_state_copy: X,
        lodepng_state_init: P,
        lodepng_zlib_compress: Re,
        lodepng_zlib_decompress: De,
        memory: E,
        zlib_compress: Fe,
        zlib_decompress: Se
    });
    A(y_);
})();
export { w as Imagequant, m as ImagequantImage, A as __wbg_set_wasm, B as __wbindgen_error_new, C as __wbindgen_throw, __tla };
