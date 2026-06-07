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
async function run() {
    console.log('--- PARTNERS & VOUCHERS COUNT ---');
    const { data: partners, error: pErr } = await supabase.from('doi_tac').select('*');
    if (pErr) {
        console.error(pErr);
        return;
    }
    for (const partner of partners || []) {
        const { data: tk } = await supabase.from('tai_khoan').select('*').eq('ma_tk', partner.ma_tk).single();
        const { data: vouchers } = await supabase.from('voucher').select('ma_voucher').eq('ma_dt', partner.ma_dt);
        console.log(`Partner: ${partner.ten_doanh_nghiep}`);
        console.log(`- Ma DT: ${partner.ma_dt}`);
        console.log(`- Email (Username): ${tk?.username || 'N/A'}`);
        console.log(`- Role: ${tk?.vai_tro || 'N/A'}`);
        console.log(`- Active Status: ${tk?.trang_thai_hoat_dong || 'N/A'}`);
        console.log(`- Vouchers Count: ${vouchers?.length || 0}`);
        console.log('-------------------------');
    }
}
run();
//# sourceMappingURL=check-partners.js.map