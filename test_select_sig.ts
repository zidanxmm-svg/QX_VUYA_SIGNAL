import { supabase } from './src/lib/supabaseClient.js';
async function test() {
  const { data: d2 } = await supabase.from('signals').select('*').limit(1);
  console.log("DATA signals:", d2);
  const { data: d3 } = await supabase.from('future_signals').select('*').limit(1);
  console.log("DATA future_signals:", d3);
}
test();
