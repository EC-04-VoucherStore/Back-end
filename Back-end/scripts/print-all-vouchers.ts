import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase
    .from('voucher')
    .select('ma_voucher, ten_voucher, trang_thai');
  
  if (error) {
    console.error(error);
    return;
  }

  console.log('List of all 35 Vouchers:');
  for (const v of data || []) {
    console.log(`- ID: ${v.ma_voucher} | Title: "${v.ten_voucher}" | Status: ${v.trang_thai}`);
  }
}
check();
