import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('doi_tac').select('*').limit(1);
  console.log('doi_tac columns:', data ? Object.keys(data[0]) : null);
  console.log('doi_tac sample data:', data ? data[0] : null);
}
check();
