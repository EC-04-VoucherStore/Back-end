"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
async function check() {
    const now = new Date().toISOString();
    let query = supabase
        .from('voucher')
        .select(`
      ma_voucher, ten_voucher, mo_ta, gia_goc, gia_ban,
      so_luong_phat_hanh, so_luong_da_ban, ngay_bd, ngay_kt, link_voucher_banner,
      doi_tac ( ma_dt, ten_doanh_nghiep ),
      danh_muc ( ma_taxon, ten_taxon )
    `)
        .eq('trang_thai', 'active')
        .gte('ngay_kt', now)
        .lte('ngay_bd', now)
        .gt('so_luong_phat_hanh', 0);
    const { data, error } = await query;
    if (error) {
        console.error('Error:', error);
        return;
    }
    console.log('Search API count:', data?.length);
    for (const v of data || []) {
        if (v.ma_voucher === 'VC-EF331424') {
            console.log('Found VC-EF331424 in Search API list:', v);
        }
    }
}
check();
//# sourceMappingURL=check-search.js.map