import { useEffect, useState } from "react";
import { studio } from "@/lib/mock-data";

export type FabPosition = "right" | "left";
export type FabStyle = "whatsapp" | "gold" | "blush" | "dark";

export type StudioSettings = {
  fabEnabled: boolean;
  fabPhone: string;
  fabLabel: string;
  fabShowLabel: boolean;
  fabPosition: FabPosition;
  fabStyle: FabStyle;
  fabMessage: string;
};

export const defaultSettings: StudioSettings = {
  fabEnabled: true,
  fabPhone: studio.whatsapp,
  fabLabel: "Fale com a gente",
  fabShowLabel: true,
  fabPosition: "right",
  fabStyle: "whatsapp",
  fabMessage: "Oi! Vim pelo site e gostaria de agendar um horário ✨",
};

const KEY = "lumiere:studio-settings";
const EVENT = "lumiere:studio-settings-change";

export function readSettings(): StudioSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(next: StudioSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function useStudioSettings() {
  const [settings, setSettings] = useState<StudioSettings>(defaultSettings);

  useEffect(() => {
    const sync = () => setSettings(readSettings());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const update = (patch: Partial<StudioSettings>) => {
    const next = { ...readSettings(), ...patch };
    setSettings(next);
    saveSettings(next);
  };

  return { settings, update };
}

export const fabStyleClasses: Record<FabStyle, string> = {
  whatsapp: "bg-[#25D366] text-black hover:bg-[#1fbe5a]",
  gold: "bg-gold text-black hover:opacity-90",
  blush: "bg-blush text-foreground hover:opacity-90",
  dark: "bg-foreground text-background hover:opacity-90",
};

export const waLink = (phone: string, message: string) =>
  `https://wa.me/55${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
