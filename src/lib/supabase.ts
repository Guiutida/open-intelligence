import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Lê variáveis de ambiente tanto do Vite (import.meta.env) quanto do Node/Docker (process.env)
const supabaseUrl =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== "undefined" && process.env?.VITE_SUPABASE_URL);

const supabaseAnonKey =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== "undefined" && process.env?.VITE_SUPABASE_ANON_KEY);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

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
