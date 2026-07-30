import { motion } from "motion/react";
import { Phone, CalendarDays, Clock, Scissors, StickyNote, User } from "lucide-react";
import { toast } from "sonner";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/status-badge";
import { brlExact, formatDateBR, type Appointment } from "@/lib/mock-data";

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm font-medium break-words">{value}</p>
      </div>
    </div>
  );
}

export function AppointmentDrawer({
  appointment,
  open,
  onOpenChange,
}: {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  if (!appointment) return null;
  const a = appointment;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-xl">Detalhes do atendimento</SheetTitle>
          <SheetDescription>Informações completas do agendamento selecionado.</SheetDescription>
        </SheetHeader>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="px-4 pb-6"
        >
          <div className="flex items-center gap-3 rounded-2xl border bg-gradient-to-br from-blush/60 to-transparent p-4">
            <Avatar className="size-12 ring-2 ring-gold/40">
              <AvatarImage src={a.avatar} alt={a.clientName} />
              <AvatarFallback>{a.clientName.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-display text-lg font-semibold">{a.clientName}</p>
              <StatusBadge status={a.status} className="mt-1" />
            </div>
            <p className="ml-auto text-right text-lg font-semibold">{brlExact(a.price)}</p>
          </div>

          <div className="mt-2 divide-y">
            <Row icon={Phone} label="Telefone" value={a.phone} />
            <Row icon={Scissors} label="Serviço" value={`${a.service} · ${a.duration} min`} />
            <Row icon={User} label="Profissional" value={a.professional} />
            <Row icon={CalendarDays} label="Data" value={formatDateBR(a.date)} />
            <Row icon={Clock} label="Horário" value={a.time} />
            <Row
              icon={StickyNote}
              label="Observações"
              value={a.notes || "Sem observações registradas."}
            />
          </div>

          <Separator className="my-5" />

          <div className="grid gap-2">
            <Button
              className="h-11 rounded-xl"
              onClick={() => {
                toast.success("Atendimento concluído", {
                  description: `${a.clientName} · ${a.service}`,
                });
                onOpenChange(false);
              }}
            >
              Concluir atendimento
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="h-11 rounded-xl"
                onClick={() => toast.info("Modo de edição aberto (demonstração).")}
              >
                Editar
              </Button>
              <Button
                variant="outline"
                className="h-11 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => {
                  toast.error("Agendamento cancelado", { description: a.clientName });
                  onOpenChange(false);
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}
