import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase, isSupabaseConfigured, uploadStudioAsset } from "@/lib/supabase";

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
  aspectRatio?: "square" | "cover";
}

export function ImageUpload({
  value,
  onChange,
  disabled,
  label = "Escolher imagem ou soltar arquivo aqui",
  aspectRatio = "square",
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione apenas arquivos de imagem (PNG, JPG, WebP, SVG).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem selecionada deve ter no máximo 5MB.");
      return;
    }

    setLoading(true);

    // When Supabase storage is configured, upload the file and return the public URL
    if (isSupabaseConfigured && supabase) {
      try {
        const publicUrl = await uploadStudioAsset(file, "studio-media");
        if (publicUrl) onChange(publicUrl);
      } catch (e: any) {
        console.error("Erro ao enviar imagem para storage:", e);
        alert(e?.message || "Erro ao enviar imagem. Tente novamente.");
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(false);
    alert("Supabase não está configurado. Configure VITE_SUPABASE_URL para enviar imagens.");
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative group overflow-hidden rounded-2xl border bg-muted">
          <div
            className={`w-full overflow-hidden flex items-center justify-center bg-slate-100 ${
              aspectRatio === "cover" ? "h-36 sm:h-44" : "h-32 sm:h-36"
            }`}
          >
            <img
              src={value}
              alt="Preview"
              className={`size-full ${aspectRatio === "cover" ? "object-cover" : "object-contain p-2"}`}
            />
          </div>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="rounded-xl bg-white/90 text-slate-900 hover:bg-white text-xs font-semibold"
              onClick={() => inputRef.current?.click()}
              disabled={disabled || loading}
            >
              Trocar foto
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="rounded-xl text-xs font-semibold"
              onClick={() => onChange("")}
              disabled={disabled || loading}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${
            isDragging
              ? "border-[#F87171] bg-[#F87171]/5"
              : "border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50"
          }`}
        >
          {loading ? (
            <Loader2 className="size-8 animate-spin text-[#F87171]" />
          ) : (
            <>
              <div className="size-10 rounded-full bg-[#F87171]/10 flex items-center justify-center text-[#F87171] mb-2">
                <Upload className="size-5" />
              </div>
              <p className="text-xs font-semibold text-slate-700 text-center">{label}</p>
              <p className="text-[11px] text-muted-foreground text-center mt-0.5">
                PNG, JPG, WebP ou SVG (máx. 5MB)
              </p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || loading}
      />
    </div>
  );
}
