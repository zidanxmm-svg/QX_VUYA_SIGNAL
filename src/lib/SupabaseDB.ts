import { supabase } from "./supabaseClient.js";

export class SupabaseDB {
  serialize(callback: () => void) {
    callback();
  }

  async run(sql: string, params: any[] = [], callback?: (err: any) => void) {
    console.log("[SupabaseDB] Run:", sql, params);

    try {
      if (sql.trim().toUpperCase().startsWith("INSERT") && sql.includes("settings")) {
          // INSERT INTO settings (id, data) VALUES (?, ?)
          await supabase.from('settings').upsert({ id: params[0], data: params[1] });
      } else if (sql.trim().toUpperCase().startsWith("UPDATE") && sql.includes("settings")) {
          await supabase.from('settings').update({ data: params[0] }).eq('id', 'global');
      }
      if (callback) callback(null);
    } catch (err: any) {
      if (callback) callback(err);
    }
  }

  async get(sql: string, a?: any[] | ((err: any, row: any) => void), b?: (err: any, row: any) => void) {
    const params = Array.isArray(a) ? a : [];
    const callback = typeof a === 'function' ? a : b;
    console.log("[SupabaseDB] Get:", sql, params);
    
    if (!callback) return;

    try {
        if (sql.includes("settings") && sql.includes("id = 'global'")) {
            const { data, error } = await supabase.from('settings').select('data').eq('id', 'global').single();
            if (error) throw error;
            callback(null, data);
        } else {
            callback(null, {});
        }
    } catch (err) {
        callback(err, null);
    }
  }

  async all(sql: string, a?: any[] | ((err: any, rows: any[]) => void), b?: (err: any, rows: any[]) => void) {
    const params = Array.isArray(a) ? a : [];
    const callback = typeof a === 'function' ? a : b;
    console.log("[SupabaseDB] All:", sql, params);
    if (!callback) return;
    
    // Minimal implementation for now
    callback(null, []);
  }
}
