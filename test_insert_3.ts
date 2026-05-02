import { supabase } from './src/lib/supabaseClient.js';
async function test() {
  const { data, error } = await supabase.from('bot_sources').insert({});
  console.log("ERROR:", error);
}
test();
