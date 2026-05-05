import { supabase } from "@/integrations/supabase/client";

export interface AppSettings {
  api_url: string;
  api_server: string;
}

let _settingsCache: AppSettings | null = null;

export async function getAppSettings(force = false): Promise<AppSettings> {
  if (_settingsCache && !force) return _settingsCache;
  const { data } = await supabase
    .from("app_settings")
    .select("api_url,api_server")
    .eq("id", 1)
    .maybeSingle();
  _settingsCache = (data as AppSettings) ?? { api_url: "https://api2.warera.io", api_server: "/trpc" };
  return _settingsCache;
}

export function clearSettingsCache() {
  _settingsCache = null;
}

export async function callWarEra<T = unknown>(
  endpoint: string,
  body: Record<string, unknown> = {},
  apiKey?: string | null,
): Promise<T> {
  const settings = await getAppSettings();
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${settings.api_url}${settings.api_server}${cleanEndpoint}`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (apiKey) headers["X-API-Key"] = apiKey;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`WarEra API ${res.status}: ${text || res.statusText}`);
  }
  const data = await res.json();
  // tRPC-style response often: { result: { data: ... } }
  if (data && typeof data === "object" && "result" in data) {
    const r = (data as { result: { data?: unknown } }).result;
    return (r?.data ?? r) as T;
  }
  return data as T;
}
