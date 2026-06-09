import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const now = new Date().toISOString();
  console.log('Current UTC Time (now):', now);

  const { data: featuredVouchers, error } = await supabase
    .from('voucher')
    .select(`
      ma_voucher, ten_voucher, mo_ta, gia_goc, gia_ban,
      so_luong_phat_hanh, so_luong_da_ban, ngay_bd, ngay_kt, link_voucher_banner,
      doi_tac ( ten_doanh_nghiep )
    `)
    .eq('trang_thai', 'active')
    .gte('ngay_kt', now)
    .lte('ngay_bd', now)
    .order('ngay_bd', { ascending: false })
    .limit(12);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Featured Vouchers count:', featuredVouchers?.length);
  console.log('Vouchers in Featured:');
  for (const v of featuredVouchers || []) {
    console.log(`- ${v.ma_voucher}: ${v.ten_voucher} (ngay_bd: ${v.ngay_bd})`);
  }
}
check();
