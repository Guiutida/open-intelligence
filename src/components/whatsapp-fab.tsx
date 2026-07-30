import { motion, AnimatePresence } from "motion/react";
import { MessageCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  fabStyleClasses,
  useStudioSettings,
  waLink,
  type StudioSettings,
} from "@/lib/studio-settings";

export function WhatsappFabView({
  settings,
  preview = false,
}: {
  settings: StudioSettings;
  preview?: boolean;
}) {
  return (
    <a
      href={preview ? undefined : waLink(settings.fabPhone, settings.fabMessage)}
      target="_blank"
      rel="noreferrer"
      aria-label={settings.fabLabel || "Conversar no WhatsApp"}
      className={cn(
        "group inline-flex items-center gap-2 rounded-full px-4 py-3 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl",
        fabStyleClasses[settings.fabStyle],
        preview && "pointer-events-none",
      )}
    >
      <MessageCircle className="size-5 shrink-0" />
      {settings.fabShowLabel && settings.fabLabel ? (
        <span className="text-sm font-medium">{settings.fabLabel}</span>
      ) : null}
    </a>
  );
}

export function WhatsappFab() {
  const { settings } = useStudioSettings();

  return (
    <AnimatePresence>
      {settings.fabEnabled ? (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className={cn(
            "fixed bottom-5 z-50 sm:bottom-6",
            settings.fabPosition === "right" ? "right-4 sm:right-6" : "left-4 sm:left-6",
          )}
        >
          <WhatsappFabView settings={settings} />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
