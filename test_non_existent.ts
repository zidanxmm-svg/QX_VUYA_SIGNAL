import { supabase } from './src/lib/supabaseClient.js';
async function test() {
  const { error } = await supabase.from('nonexistent_table_123').select('*');
  console.log("ERROR:", error);
}
test();
