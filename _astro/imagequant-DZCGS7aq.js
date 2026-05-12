let w, u, z, M, B;
let __tla = (async ()=>{
    var v = "/_astro/imagequant_bg-BcMVf2Ny.wasm", x = async (_ = {}, e)=>{
        let n;
        if (e.startsWith("data:")) {
            const l = e.replace(/^data:.*?base64,/, "");
            let t;
            if (typeof Buffer == "function" && typeof Buffer.from == "function") t = Buffer.from(l, "base64");
            else if (typeof atob == "function") {
                const a = atob(l);
                t = new Uint8Array(a.length);
                for(let r = 0; r < a.length; r++)t[r] = a.charCodeAt(r);
            } else throw new Error("Cannot decode base64-encoded data URL");
            n = await WebAssembly.instantiate(t, _);
        } else {
            const l = await fetch(e), t = l.headers.get("Content-Type") || "";
            if ("instantiateStreaming" in WebAssembly && t.startsWith("application/wasm")) n = await WebAssembly.instantiateStreaming(l, _);
            else {
                const a = await l.arrayBuffer();
                n = await WebAssembly.instantiate(a, _);
            }
        }
        return n.instance.exports;
    };
    let o;
    z = function(_) {
        o = _;
    };
    const A = typeof TextDecoder > "u" ? (0, module.require)("util").TextDecoder : TextDecoder;
    let y = new A("utf-8", {
        ignoreBOM: !0,
        fatal: !0
    });
    y.decode();
    let f = null;
    function b() {
        return (f === null || f.byteLength === 0) && (f = new Uint8Array(o.memory.buffer)), f;
    }
    function k(_, e) {
        return _ = _ >>> 0, y.decode(b().subarray(_, _ + e));
    }
    const p = new Array(128).fill(void 0);
    p.push(void 0, null, !0, !1);
    let s = p.length;
    function W(_) {
        s === p.length && p.push(p.length + 1);
        const e = s;
        return s = p[e], p[e] = _, e;
    }
    let h = 0;
    function q(_, e) {
        const n = e(_.length * 1, 1) >>> 0;
        return b().set(_, n / 1), h = _.length, n;
    }
    let m = null;
    function d() {
        return (m === null || m.byteLength === 0) && (m = new Int32Array(o.memory.buffer)), m;
    }
    function j(_) {
        return p[_];
    }
    function T(_) {
        _ < 132 || (p[_] = s, s = _);
    }
    function c(_) {
        const e = j(_);
        return T(_), e;
    }
    function O(_, e) {
        if (!(_ instanceof e)) throw new Error(`expected instance of ${e.name}`);
        return _.ptr;
    }
    function U(_, e) {
        return _ = _ >>> 0, b().subarray(_ / 1, _ / 1 + e);
    }
    w = class {
        static __wrap(e) {
            e = e >>> 0;
            const n = Object.create(w.prototype);
            return n.__wbg_ptr = e, n;
        }
        __destroy_into_raw() {
            const e = this.__wbg_ptr;
            return this.__wbg_ptr = 0, e;
        }
        free() {
            const e = this.__destroy_into_raw();
            o.__wbg_imagequant_free(e);
        }
        constructor(){
            const e = o.imagequant_new();
            return w.__wrap(e);
        }
        static new_image(e, n, l, t) {
            const a = q(e, o.__wbindgen_malloc), r = h, i = o.imagequant_new_image(a, r, n, l, t);
            return u.__wrap(i);
        }
        set_max_colors(e) {
            try {
                const t = o.__wbindgen_add_to_stack_pointer(-16);
                o.imagequant_set_max_colors(t, this.__wbg_ptr, e);
                var n = d()[t / 4 + 0], l = d()[t / 4 + 1];
                if (l) throw c(n);
            } finally{
                o.__wbindgen_add_to_stack_pointer(16);
            }
        }
        set_quality(e, n) {
            try {
                const a = o.__wbindgen_add_to_stack_pointer(-16);
                o.imagequant_set_quality(a, this.__wbg_ptr, e, n);
                var l = d()[a / 4 + 0], t = d()[a / 4 + 1];
                if (t) throw c(l);
            } finally{
                o.__wbindgen_add_to_stack_pointer(16);
            }
        }
        set_speed(e) {
            try {
                const t = o.__wbindgen_add_to_stack_pointer(-16);
                o.imagequant_set_speed(t, this.__wbg_ptr, e);
                var n = d()[t / 4 + 0], l = d()[t / 4 + 1];
                if (l) throw c(n);
            } finally{
                o.__wbindgen_add_to_stack_pointer(16);
            }
        }
        set_min_posterization(e) {
            try {
                const t = o.__wbindgen_add_to_stack_pointer(-16);
                o.imagequant_set_min_posterization(t, this.__wbg_ptr, e);
                var n = d()[t / 4 + 0], l = d()[t / 4 + 1];
                if (l) throw c(n);
            } finally{
                o.__wbindgen_add_to_stack_pointer(16);
            }
        }
        process(e) {
            try {
                const g = o.__wbindgen_add_to_stack_pointer(-16);
                O(e, u);
                var n = e.__destroy_into_raw();
                o.imagequant_process(g, this.__wbg_ptr, n);
                var l = d()[g / 4 + 0], t = d()[g / 4 + 1], a = d()[g / 4 + 2], r = d()[g / 4 + 3];
                if (r) throw c(a);
                var i = U(l, t).slice();
                return o.__wbindgen_free(l, t * 1), i;
            } finally{
                o.__wbindgen_add_to_stack_pointer(16);
            }
        }
    };
    u = class {
        static __wrap(e) {
            e = e >>> 0;
            const n = Object.create(u.prototype);
            return n.__wbg_ptr = e, n;
        }
        __destroy_into_raw() {
            const e = this.__wbg_ptr;
            return this.__wbg_ptr = 0, e;
        }
        free() {
            const e = this.__destroy_into_raw();
            o.__wbg_imagequantimage_free(e);
        }
        constructor(e, n, l, t){
            const a = q(e, o.__wbindgen_malloc), r = h, i = o.imagequantimage_new(a, r, n, l, t);
            return u.__wrap(i);
        }
    };
    M = function(_, e) {
        const n = new Error(k(_, e));
        return W(n);
    };
    B = function(_, e) {
        throw new Error(k(_, e));
    };
    URL = globalThis.URL;
    const C = await x({
        "./imagequant_bg.js": {
            __wbindgen_error_new: M,
            __wbindgen_throw: B
        }
    }, v), { memory: E, __wbg_imagequantimage_free: L, imagequantimage_new: D, __wbg_imagequant_free: S, imagequant_new: R, imagequant_new_image: F, imagequant_set_max_colors: N, imagequant_set_quality: V, imagequant_set_speed: $, imagequant_set_min_posterization: H, imagequant_process: G, lodepng_malloc: I, lodepng_realloc: J, lodepng_free: K, lodepng_state_init: P, lodepng_state_cleanup: Q, lodepng_state_copy: X, lodepng_error_text: Y, lodepng_encode32: Z, lodepng_encode24: ee, lodepng_encode_file: _e, lodepng_encode32_file: ne, lodepng_encode24_file: te, lodepng_get_bpp_lct: oe, lodepng_get_bpp: le, lodepng_get_channels: ae, lodepng_is_greyscale_type: de, lodepng_is_alpha_type: re, lodepng_is_palette_type: pe, lodepng_has_palette_alpha: ie, lodepng_can_have_alpha: ge, lodepng_get_raw_size: ce, lodepng_get_raw_size_lct: se, lodepng_palette_clear: ue, lodepng_palette_add: fe, lodepng_clear_text: me, lodepng_add_text: we, lodepng_clear_itext: be, lodepng_add_itext: he, lodepng_chunk_create: ye, lodepng_chunk_length: ke, lodepng_chunk_type: qe, lodepng_chunk_type_equals: ve, lodepng_chunk_data_const: xe, lodepng_chunk_next: ze, lodepng_chunk_ancillary: Ae, lodepng_chunk_private: We, lodepng_chunk_safetocopy: je, lodepng_chunk_data: Te, lodepng_chunk_check_crc: Oe, lodepng_chunk_generate_crc: Ue, lodepng_chunk_append: Me, lodepng_color_mode_init: Be, lodepng_color_mode_cleanup: Ce, lodepng_color_mode_equal: Ee, lodepng_color_mode_copy: Le, lodepng_zlib_decompress: De, zlib_decompress: Se, lodepng_zlib_compress: Re, zlib_compress: Fe, lodepng_compress_settings_init: Ne, lodepng_decompress_settings_init: Ve, lodepng_crc32: $e, lodepng_info_init: He, lodepng_info_cleanup: Ge, lodepng_info_copy: Ie, lodepng_info_swap: Je, lodepng_convert: Ke, lodepng_inspect: Pe, lodepng_decode: Qe, lodepng_decode_memory: Xe, lodepng_decode32: Ye, lodepng_decode24: Ze, lodepng_decode_file: e_, lodepng_decode32_file: __, lodepng_decode24_file: n_, lodepng_decoder_settings_init: t_, lodepng_buffer_file: o_, lodepng_load_file: l_, lodepng_save_file: a_, lodepng_encode: d_, lodepng_get_color_profile: r_, lodepng_auto_choose_color: p_, lodepng_filesize: i_, lodepng_encode_memory: g_, lodepng_encoder_settings_init: c_, lodepng_color_profile_init: s_, lodepng_default_compress_settings: u_, lodepng_default_decompress_settings: f_, lodepng_chunk_next_const: m_, __wbindgen_malloc: w_, __wbindgen_add_to_stack_pointer: b_, __wbindgen_free: h_ } = C;
    var y_ = Object.freeze({
        __proto__: null,
        __wbg_imagequant_free: S,
        __wbg_imagequantimage_free: L,
        __wbindgen_add_to_stack_pointer: b_,
        __wbindgen_free: h_,
        __wbindgen_malloc: w_,
        imagequant_new: R,
        imagequant_new_image: F,
        imagequant_process: G,
        imagequant_set_max_colors: N,
        imagequant_set_min_posterization: H,
        imagequant_set_quality: V,
        imagequant_set_speed: $,
        imagequantimage_new: D,
        lodepng_add_itext: he,
        lodepng_add_text: we,
        lodepng_auto_choose_color: p_,
        lodepng_buffer_file: o_,
        lodepng_can_have_alpha: ge,
        lodepng_chunk_ancillary: Ae,
        lodepng_chunk_append: Me,
        lodepng_chunk_check_crc: Oe,
        lodepng_chunk_create: ye,
        lodepng_chunk_data: Te,
        lodepng_chunk_data_const: xe,
        lodepng_chunk_generate_crc: Ue,
        lodepng_chunk_length: ke,
        lodepng_chunk_next: ze,
        lodepng_chunk_next_const: m_,
        lodepng_chunk_private: We,
        lodepng_chunk_safetocopy: je,
        lodepng_chunk_type: qe,
        lodepng_chunk_type_equals: ve,
        lodepng_clear_itext: be,
        lodepng_clear_text: me,
        lodepng_color_mode_cleanup: Ce,
        lodepng_color_mode_copy: Le,
        lodepng_color_mode_equal: Ee,
        lodepng_color_mode_init: Be,
        lodepng_color_profile_init: s_,
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
        lodepng_decoder_settings_init: t_,
        lodepng_decompress_settings_init: Ve,
        lodepng_default_compress_settings: u_,
        lodepng_default_decompress_settings: f_,
        lodepng_encode: d_,
        lodepng_encode24: ee,
        lodepng_encode24_file: te,
        lodepng_encode32: Z,
        lodepng_encode32_file: ne,
        lodepng_encode_file: _e,
        lodepng_encode_memory: g_,
        lodepng_encoder_settings_init: c_,
        lodepng_error_text: Y,
        lodepng_filesize: i_,
        lodepng_free: K,
        lodepng_get_bpp: le,
        lodepng_get_bpp_lct: oe,
        lodepng_get_channels: ae,
        lodepng_get_color_profile: r_,
        lodepng_get_raw_size: ce,
        lodepng_get_raw_size_lct: se,
        lodepng_has_palette_alpha: ie,
        lodepng_info_cleanup: Ge,
        lodepng_info_copy: Ie,
        lodepng_info_init: He,
        lodepng_info_swap: Je,
        lodepng_inspect: Pe,
        lodepng_is_alpha_type: re,
        lodepng_is_greyscale_type: de,
        lodepng_is_palette_type: pe,
        lodepng_load_file: l_,
        lodepng_malloc: I,
        lodepng_palette_add: fe,
        lodepng_palette_clear: ue,
        lodepng_realloc: J,
        lodepng_save_file: a_,
        lodepng_state_cleanup: Q,
        lodepng_state_copy: X,
        lodepng_state_init: P,
        lodepng_zlib_compress: Re,
        lodepng_zlib_decompress: De,
        memory: E,
        zlib_compress: Fe,
        zlib_decompress: Se
    });
    z(y_);
})();
export { w as Imagequant, u as ImagequantImage, z as __wbg_set_wasm, M as __wbindgen_error_new, B as __wbindgen_throw, __tla };
