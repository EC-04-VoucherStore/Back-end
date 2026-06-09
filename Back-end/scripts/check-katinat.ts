import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: partner } = await supabase
    .from('doi_tac')
    .select('*, tai_khoan(*)')
    .eq('ma_dt', 'DT-6DD55D8F')
    .single();
  
  console.log('Partner details:', partner);
}
check();
