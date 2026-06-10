import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase
    .from('voucher')
    .select('ma_voucher, ten_voucher, trang_thai, ngay_bd, ngay_kt');
  
  if (error) {
    console.error(error);
    return;
  }

  console.log('Total Vouchers:', data?.length);
  // Find duplicate titles
  const counts = new Map<string, number>();
  for (const v of data || []) {
    counts.set(v.ten_voucher, (counts.get(v.ten_voucher) || 0) + 1);
  }

  console.log('--- Duplicated Titles ---');
  for (const [title, count] of counts.entries()) {
    if (count > 1) {
      console.log(`Title: "${title}" is duplicated ${count} times:`);
      const matched = data!.filter(v => v.ten_voucher === title);
      for (const m of matched) {
        console.log(`  - ma_voucher: ${m.ma_voucher}, trang_thai: ${m.trang_thai}, ngay_bd: ${m.ngay_bd}, ngay_kt: ${m.ngay_kt}`);
      }
    }
  }
}
check();
