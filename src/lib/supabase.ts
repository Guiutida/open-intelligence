import { createClient, SupabaseClient } from "@supabase/supabase-js";

function isValidHttpUrl(urlStr?: string): boolean {
  if (!urlStr || typeof urlStr !== "string") return false;
  try {
    const parsed = new URL(urlStr);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

// Lê variáveis de ambiente tanto do Vite (import.meta.env) quanto do Node/Docker (process.env)
const rawUrl =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== "undefined" && process.env?.VITE_SUPABASE_URL);

const rawKey =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== "undefined" && process.env?.VITE_SUPABASE_ANON_KEY);

const supabaseUrl = isValidHttpUrl(rawUrl) ? rawUrl : null;
const supabaseAnonKey = rawKey && typeof rawKey === "string" && rawKey.trim().length > 10 ? rawKey : null;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let clientInstance: SupabaseClient | null = null;

if (isSupabaseConfigured && supabaseUrl && supabaseAnonKey) {
  try {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.error("Falha ao inicializar o SupabaseClient:", err);
    clientInstance = null;
  }
}

export const supabase: SupabaseClient | null = clientInstance;

/**
 * Real Supabase Storage Upload
 * Uploads a file to 'studio-assets' bucket and returns its public URL.
 */
export async function uploadStudioAsset(file: File, folder: string = "uploads"): Promise<string> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase não está configurado nas variáveis de ambiente (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).");
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

  const { data, error } = await supabase.storage.from("studio-assets").upload(fileName, file, {
    cacheControl: "3600",
    upsert: true,
  });

  if (error) {
    console.error("Erro no upload para Supabase Storage:", error);
    throw new Error(`Falha no upload da imagem: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage.from("studio-assets").getPublicUrl(data.path);
  return publicUrlData.publicUrl;
}
