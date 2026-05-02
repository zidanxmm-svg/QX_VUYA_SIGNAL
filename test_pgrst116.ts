import { SupabaseDB } from './src/lib/SupabaseDB.js';
const db = new SupabaseDB();
db.get("SELECT * FROM bot_sources WHERE chatId = ?", ["idontexist"], (err, row) => {
  console.log("ERR:", err);
  console.log("ROW:", row);
});
