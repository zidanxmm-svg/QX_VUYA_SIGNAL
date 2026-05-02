import { supabase } from './src/lib/supabaseClient.js';
async function test() {
  const { data, error } = await supabase.from('bot_sources').insert({ id: '1' });
  console.log("ERROR:", error);
}
test();
