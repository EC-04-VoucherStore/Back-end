import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

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
