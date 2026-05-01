import { Candle, Signal } from "../types.js";

async function handleResponse(res: Response) {
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new TypeError("Expected JSON response");
  }
  return res.json();
}

export async function fetchCandles(symbol: string): Promise<Candle[]> {
  const res = await fetch(`/api/candles/${symbol}`);
  return handleResponse(res);
}

export async function fetchSignals(): Promise<Signal[]> {
  const res = await fetch("/api/signals");
  return handleResponse(res);
}

export async function uploadFutureSignals(text: string) {
  const res = await fetch("/api/future-signals/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return res.json();
}

export async function fetchTelegramChats(): Promise<any[]> {
  const res = await fetch("/api/telegram-chats");
  return res.json();
}

export async function saveTelegramChat(chat: any) {
  const res = await fetch("/api/telegram-chats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(chat),
  });
  return res.json();
}

export async function deleteTelegramChat(id: string) {
  const res = await fetch(`/api/telegram-chats/${id}`, { method: "DELETE" });
  return res.json();
}

export async function updateTelegramChat(id: string, chat: any) {
  const res = await fetch(`/api/telegram-chats/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(chat),
  });
  return res.json();
}

export async function fetchBotSources(): Promise<any[]> {
  const res = await fetch("/api/bot-sources");
  return res.json();
}

export async function addBotSource(source: any) {
  const res = await fetch("/api/bot-sources", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(source),
  });
  return res.json();
}

export async function deleteBotSource(id: string) {
  const res = await fetch(`/api/bot-sources/${id}`, { method: "DELETE" });
  return res.json();
}

export async function updateBotSource(id: string, source: any) {
  const res = await fetch(`/api/bot-sources/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(source),
  });
  return res.json();
}

export async function fetchSettings(): Promise<any> {
  const res = await fetch("/api/settings");
  return res.json();
}

export async function saveSettings(settings: any) {
  const res = await fetch("/api/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  return res.json();
}

export async function sendTestTelegramMessage(chatId: string) {
  const res = await fetch("/api/telegram/test-message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId }),
  });
  return res.json();
}

export async function login(credentials: any) {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  return res.json();
}

export async function fetchAuthSettings() {
  const res = await fetch("/api/settings/auth");
  return res.json();
}

export async function updateAuthSettings(settings: any) {
  const res = await fetch("/api/settings/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  return res.json();
}

export async function fetchFutureBatches() {
  const res = await fetch('/api/future-signals/batches');
  return res.json();
}

export async function deleteFutureBatch(id: string) {
  const res = await fetch(`/api/future-signals/batches/${id}`, { method: 'DELETE' });
  return res.json();
}
