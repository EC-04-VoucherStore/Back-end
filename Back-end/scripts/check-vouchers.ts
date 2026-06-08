import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

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
