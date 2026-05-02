import { supabase } from './src/lib/supabaseClient.js';
async function test() {
  const { data, error } = await supabase.from('bot_sources').select('*');
  console.log("DATA:", data);
}
test();
