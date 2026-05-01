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
          let id, dataToUpsert;
          if (params.length === 1) {
            // INSERT INTO settings (id, data) VALUES ('global', ?)
            id = 'global';
            dataToUpsert = params[0];
          } else {
            // INSERT INTO settings (id, data) VALUES (?, ?)
            id = params[0];
            dataToUpsert = params[1];
          }

          if (typeof dataToUpsert === "string") {
            try {
              dataToUpsert = JSON.parse(dataToUpsert);
            } catch (e) {
              console.warn("Failed to parse data as JSON, wrapping in an object", e);
              dataToUpsert = { value: dataToUpsert };
            }
          }
          console.log("[SupabaseDB] Upserting to settings:", { id, data: dataToUpsert }, "Params:", params);
          if (typeof id !== "string") {
            console.error("[SupabaseDB] Invalid ID type:", typeof id, id);
          }
          await supabase.from('settings').upsert({ id: id, data: typeof dataToUpsert === 'object' ? JSON.stringify(dataToUpsert) : dataToUpsert });
      } else if (sql.trim().toUpperCase().startsWith("UPDATE") && sql.includes("settings")) {
          let dataToUpdate = params[0];
          if (typeof dataToUpdate === "string") {
            try {
              dataToUpdate = JSON.parse(dataToUpdate);
            } catch (e) {
              console.warn("Failed to parse data as JSON, wrapping in an object", e);
              dataToUpdate = { value: dataToUpdate };
            }
          }
          console.log("[SupabaseDB] Updating settings:", { id: 'global', data: dataToUpdate}, "Params:", params);
          await supabase.from('settings').update({ data: typeof dataToUpdate === 'object' ? JSON.stringify(dataToUpdate) : dataToUpdate }).eq('id', 'global');
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
