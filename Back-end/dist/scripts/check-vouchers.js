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
    const { data: vouchers, error } = await supabase
        .from('voucher')
        .select('*, doi_tac(*)');
    if (error) {
        console.error('Error fetching vouchers:', error);
        return;
    }
    console.log(`Total Vouchers found: ${vouchers?.length}`);
    console.log('--- All Vouchers ---');
    for (const v of vouchers || []) {
        console.log({
            ma_voucher: v.ma_voucher,
            ten_voucher: v.ten_voucher,
            trang_thai: v.trang_thai,
            ngay_bd: v.ngay_bd,
            ngay_kt: v.ngay_kt,
            gia_goc: v.gia_goc,
            gia_ban: v.gia_ban,
            so_luong_phat_hanh: v.so_luong_phat_hanh,
            so_luong_da_ban: v.so_luong_da_ban,
            ma_dt: v.ma_dt,
            doi_tac_id: v.doi_tac?.ma_dt,
            doi_tac_ten: v.doi_tac?.ten_doanh_nghiep,
            doi_tac_status: v.doi_tac?.trang_thai_hoat_dong
        });
    }
}
check();
//# sourceMappingURL=check-vouchers.js.map