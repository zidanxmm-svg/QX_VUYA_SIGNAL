import { supabase } from "./supabaseClient.js";

export class SupabaseDB {
  serialize(callback: () => void) {
    callback();
  }

  async run(sql: string, params: any[] = [], callback?: (err: any) => void) {
    console.log("[SupabaseDB] Run:", sql, params);

    try {
      if (sql.includes("INSERT OR REPLACE INTO candles")) {
          const [symbol, timestamp, open, high, low, close, volume] = params;
          const { error } = await supabase.from('candles').upsert({ symbol, timestamp, open, high, low, close, volume });
          if (error) throw error;
      } else if (sql.includes("DELETE FROM candles")) {
          const { error } = await supabase.from('candles').delete().lt('timestamp', params[0]);
          if (error) throw error;
      } else if (sql.includes("DELETE FROM signals")) {
          const { error } = await supabase.from('signals').delete().lt('entryTime', params[0]);
          if (error) throw error;
      } else if (sql.includes("INSERT INTO signals")) {
           const [id, symbol, direction, entryTime, expiryTime, strategy, confidence] = params;
           const { error } = await supabase.from('signals').insert({ id, symbol, direction, entryTime, expiryTime, strategy, confidence });
           if (error) throw error;
      } else if (sql.trim().toUpperCase().startsWith("INSERT") && sql.includes("settings")) {
          let id, dataToUpsert;
          if (params.length === 1) {
            id = 'global';
            dataToUpsert = params[0];
          } else {
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
          // Prevent saving error messages to settings
          if (typeof dataToUpsert === 'object' && dataToUpsert !== null && 'error' in dataToUpsert) {
            console.warn("[SupabaseDB] Ignoring upsert with error data:", dataToUpsert);
            return;
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
          // Prevent saving error messages to settings
          if (typeof dataToUpdate === 'object' && dataToUpdate !== null && 'error' in dataToUpdate) {
            console.warn("[SupabaseDB] Ignoring update with error data:", dataToUpdate);
            return;
          }
          console.log("[SupabaseDB] Updating settings:", { id: 'global', data: dataToUpdate}, "Params:", params);
          await supabase.from('settings').update({ data: typeof dataToUpdate === 'object' ? JSON.stringify(dataToUpdate) : dataToUpdate }).eq('id', 'global');
      }
      if (callback) callback(null);
    } catch (err: any) {
      console.error("[SupabaseDB] Run error:", err);
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
    
    try {
        if (sql.includes("FROM candles WHERE symbol = ?")) {
            const { data, error } = await supabase.from('candles').select('*').eq('symbol', params[0]).order('timestamp', { ascending: false }).limit(params[1]);
            if (error) throw error;
            callback(null, data);
        } else if (sql.includes("FROM signals")) {
            const { data, error } = await supabase.from('signals').select('*').order('entryTime', { ascending: false }).limit(params[0] || 100);
            if (error) throw error;
            callback(null, data);
        } else {
            callback(null, []);
        }
    } catch (err) {
        console.error("[SupabaseDB] All error:", err);
        callback(err, []);
    }
  }
}
