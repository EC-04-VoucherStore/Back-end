import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('--- PARTNERS & VOUCHERS COUNT ---');
  // Get all doi_tac
  const { data: partners, error: pErr } = await supabase.from('doi_tac').select('*');
  if (pErr) {
    console.error(pErr);
    return;
  }

  for (const partner of partners || []) {
    // Get account info
    const { data: tk } = await supabase.from('tai_khoan').select('*').eq('ma_tk', partner.ma_tk).single();
    // Count vouchers
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
