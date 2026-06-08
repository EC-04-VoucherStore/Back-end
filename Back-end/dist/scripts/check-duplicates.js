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
    const { data, error } = await supabase
        .from('voucher')
        .select('ma_voucher, ten_voucher, trang_thai, ngay_bd, ngay_kt');
    if (error) {
        console.error(error);
        return;
    }
    console.log('Total Vouchers:', data?.length);
    const counts = new Map();
    for (const v of data || []) {
        counts.set(v.ten_voucher, (counts.get(v.ten_voucher) || 0) + 1);
    }
    console.log('--- Duplicated Titles ---');
    for (const [title, count] of counts.entries()) {
        if (count > 1) {
            console.log(`Title: "${title}" is duplicated ${count} times:`);
            const matched = data.filter(v => v.ten_voucher === title);
            for (const m of matched) {
                console.log(`  - ma_voucher: ${m.ma_voucher}, trang_thai: ${m.trang_thai}, ngay_bd: ${m.ngay_bd}, ngay_kt: ${m.ngay_kt}`);
            }
        }
    }
}
check();
//# sourceMappingURL=check-duplicates.js.map