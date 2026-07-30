import { cn } from "@/lib/utils";
import type { Status } from "@/lib/mock-data";
import { statusLabel } from "@/lib/mock-data";

const styles: Record<Status, string> = {
  confirmado: "bg-success/10 text-success border-success/25",
  pendente: "bg-warning/15 text-warning-foreground border-warning/40",
  concluido: "bg-primary/8 text-foreground border-border",
  cancelado: "bg-destructive/10 text-destructive border-destructive/25",
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide",
        styles[status],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {statusLabel[status]}
    </span>
  );
}
