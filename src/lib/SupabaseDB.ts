import { supabase } from "./supabaseClient.js";

export class SupabaseDB {
  serialize(callback: () => void) {
    callback();
  }

  async run(sql: string, a?: any[] | ((err: any) => void), b?: (err: any) => void) {
    const params = Array.isArray(a) ? a : [];
    const callback = typeof a === 'function' ? a : b;
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
      } else if (sql.includes("INSERT OR REPLACE INTO telegram_chats") || sql.includes("INSERT INTO telegram_chats")) {
          const [id, chatId, name, permissions] = params;
          const { error } = await supabase.from('telegram_chats').upsert({ id, chatid: chatId, name, permissions: typeof permissions === 'string' ? JSON.parse(permissions) : permissions });
          if (error) throw error;
      } else if (sql.includes("UPDATE telegram_chats SET status = 'active'")) {
          const [id] = params;
          const { error } = await supabase.from('telegram_chats').update({ status: 'active' }).eq('id', id);
          if (error) throw error;
      } else if (sql.includes("UPDATE telegram_chats SET status = 'error'")) {
          const [id] = params;
          const { error } = await supabase.from('telegram_chats').update({ status: 'error' }).eq('id', id);
          if (error) throw error;
      } else if (sql.includes("UPDATE telegram_chats SET status")) {
          const [status, id] = params;
          const { error } = await supabase.from('telegram_chats').update({ status }).eq('id', id);
          if (error) throw error;
      } else if (sql.includes("DELETE FROM telegram_chats")) {
          const { error } = await supabase.from('telegram_chats').delete().eq('id', params[0]);
          if (error) throw error;
      } else if (sql.includes("UPDATE telegram_chats SET chatId")) {
          const [chatId, name, permissions, id] = params;
          const { error } = await supabase.from('telegram_chats').update({ chatid: chatId, name, permissions: typeof permissions === 'string' ? JSON.parse(permissions) : permissions }).eq('id', id);
          if (error) throw error;
      } else if (sql.includes("INSERT OR REPLACE INTO bot_sources")) {
          const [id, chatId, name, permissions] = params;
          const { error } = await supabase.from('bot_sources').upsert({ id, chatid: chatId, name, permissions: typeof permissions === 'string' ? JSON.parse(permissions) : permissions });
          if (error) throw error;
      } else if (sql.includes("INSERT INTO bot_sources")) {
          const [id, chatId, name, permissions] = params;
          const { error } = await supabase.from('bot_sources').insert({ id, chatid: chatId, name, permissions: typeof permissions === 'string' ? JSON.parse(permissions) : permissions });
          if (error) throw error;
      } else if (sql.includes("UPDATE bot_sources SET chatId")) {
          const [chatId, name, permissions, id] = params;
          const { error } = await supabase.from('bot_sources').update({ chatid: chatId, name, permissions: typeof permissions === 'string' ? JSON.parse(permissions) : permissions }).eq('id', id);
          if (error) throw error;
      } else if (sql.includes("DELETE FROM bot_sources")) {
          const { error } = await supabase.from('bot_sources').delete().eq('id', params[0]);
          if (error) throw error;
      } else if (sql.includes("DELETE FROM future_signals WHERE batchId = ?")) {
          const { error } = await supabase.from('future_signals').delete().eq('batchId', params[0]);
          if (error) throw error;
      } else if (sql.includes("DELETE FROM future_signal_batches WHERE id = ?")) {
          const { error } = await supabase.from('future_signal_batches').delete().eq('id', params[0]);
          if (error) throw error;
      } else if (sql.includes("INSERT INTO future_signal_batches")) {
          const [id, uploadTime, source, signalCount] = params;
          const { error } = await supabase.from('future_signal_batches').insert({ id, uploadTime, source, signalCount });
          if (error) throw error;
      } else if (sql.includes("INSERT INTO future_signals")) {
          const [id, batchId, symbol, time, timestamp, direction] = params;
          const { error } = await supabase.from('future_signals').insert({ id, batchId, symbol, time, timestamp, direction });
          if (error) throw error;
      } else if (sql.includes("UPDATE auth_settings")) {
          const [username, password] = params;
          const { error } = await supabase.from('auth_settings').update({ username, password }).eq('id', 'admin');
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
        if (sql.includes("FROM telegram_chats WHERE chatId = ?")) {
            const { data, error } = await supabase.from('telegram_chats').select('*').eq('chatid', params[0]).single();
            if (error && error.code !== 'PGRST116') throw error;
            if (data) {
                callback(null, { 
                    ...data, 
                    chatId: data.chatid,
                    permissions: typeof data.permissions === 'object' ? JSON.stringify(data.permissions || {}) : data.permissions
                });
            } else {
                callback(null, null);
            }
        } else if (sql.includes("FROM bot_sources WHERE chatId = ?")) {
            const { data, error } = await supabase.from('bot_sources').select('*').eq('chatid', params[0]).single();
            if (error && error.code !== 'PGRST116') throw error;
            if (data) {
                callback(null, { 
                    ...data, 
                    chatId: data.chatid,
                    permissions: typeof data.permissions === 'object' ? JSON.stringify(data.permissions || {}) : data.permissions
                });
            } else {
                callback(null, null);
            }
        } else if (sql.includes("FROM auth_settings") && sql.includes("id = 'admin'")) {
            const { data, error } = await supabase.from('auth_settings').select('*').eq('id', 'admin').single();
            if (error && error.code !== 'PGRST116') throw error;
            callback(null, data || { username: 'admin', password: 'admin123' });
        } else if (sql.includes("FROM auth_settings") || sql.includes("auth_settings WHERE username = ?")) {
            const { data, error } = await supabase.from('auth_settings').select('*').eq('username', params[0]).eq('password', params[1]).single();
            if (error && error.code !== 'PGRST116') throw error;
            callback(null, data);
        } else if (sql.includes("COUNT(*) as count FROM auth_settings")) {
            const { count, error } = await supabase.from('auth_settings').select('*', { count: 'exact', head: true });
            if (error) throw error;
            callback(null, { count: count || 0 });
        } else if (sql.includes("COUNT(*) as count FROM telegram_chats")) {
            const { count, error } = await supabase.from('telegram_chats').select('*', { count: 'exact', head: true });
            if (error) throw error;
            callback(null, { count: count || 0 });
        } else if (sql.includes("FROM settings") && sql.includes("id = ?")) {
            const { data, error } = await supabase.from('settings').select('data').eq('id', params[0]).single();
            if (error && error.code !== 'PGRST116') throw error;
            callback(null, data);
        } else if (sql.includes("settings") && sql.includes("id = 'global'")) {
            const { data, error } = await supabase.from('settings').select('data').eq('id', 'global').single();
            if (error) throw error;
            callback(null, data);
        } else {
            callback(null, null);
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
        if (sql.includes("FROM telegram_chats")) {
            let query = supabase.from('telegram_chats').select('*');
            if (sql.includes("WHERE status = 'active'")) {
                query = query.eq('status', 'active');
            }
            const { data, error } = await query;
            if (error) throw error;
            callback(null, (data || []).map((row: any) => ({ 
                ...row, 
                chatId: row.chatid,
                permissions: typeof row.permissions === 'object' ? JSON.stringify(row.permissions || {}) : row.permissions
            })));
        } else if (sql.includes("FROM bot_sources")) {
            const { data, error } = await supabase.from('bot_sources').select('*');
            if (error) throw error;
            callback(null, (data || []).map((row: any) => ({ 
                ...row, 
                chatId: row.chatid,
                permissions: typeof row.permissions === 'object' ? JSON.stringify(row.permissions || {}) : row.permissions
            })));
        } else if (sql.includes("COUNT(*) as count FROM telegram_chats")) {
            const { count, error } = await supabase.from('telegram_chats').select('*', { count: 'exact', head: true });
            if (error) throw error;
            callback(null, [{ count: count || 0 }]);
        } else if (sql.includes("FROM candles WHERE symbol = ?")) {
            const { data, error } = await supabase.from('candles').select('*').eq('symbol', params[0]).order('timestamp', { ascending: false }).limit(params[1]);
            if (error) throw error;
            callback(null, data);
        } else if (sql.includes("FROM future_signal_batches")) {
            const { data, error } = await supabase.from('future_signal_batches').select('*').order('uploadTime', { ascending: false });
            if (error) throw error;
            callback(null, data);
        } else if (sql.includes("FROM future_signals")) {
            let query = supabase.from('future_signals').select('*');
            if (sql.includes("WHERE timestamp > ?")) {
                query = query.gt('timestamp', params[0]).order('timestamp', { ascending: true });
                if (sql.includes("LIMIT")) query = query.limit(params[1] || 15);
            }
            const { data, error } = await query;
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
