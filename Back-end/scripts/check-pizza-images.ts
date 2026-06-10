import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase
    .from('voucher')
    .select('ma_voucher, ten_voucher, link_voucher_banner')
    .ilike('ten_voucher', '%pizza%');
  
  if (error) {
    console.error(error);
    return;
  }

  console.log('Pizza Vouchers:');
  for (const v of data || []) {
    console.log(`- ID: ${v.ma_voucher} | Title: "${v.ten_voucher}" | Banner: "${v.link_voucher_banner}"`);
  }
}
check();
