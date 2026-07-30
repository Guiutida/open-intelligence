import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ptBR } from "date-fns/locale";
import { CalendarX2, Clock } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/status-badge";
import { AppointmentDrawer } from "@/components/appointment-drawer";
import { appointments, brl, type Appointment } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/agenda")({
  head: () => ({
    meta: [
      { title: "Agenda · Lumière Lash Studio" },
      {
        name: "description",
        content: "Calendário mensal e timeline diária dos atendimentos do studio.",
      },
      { property: "og:title", content: "Agenda · Lumière Lash Studio" },
      {
        property: "og:description",
        content: "Calendário mensal e timeline diária dos atendimentos do studio.",
      },
    ],
  }),
  component: AgendaPage,
});

const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const SLOTS = ["09:00", "10:30", "12:00", "14:00", "16:00"];

function AgendaPage() {
  const [date, setDate] = useState<Date>(new Date(2026, 6, 30));
  const [selected, setSelected] = useState<Appointment | null>(null);

  const iso = toISO(date);
  const dayAppointments = useMemo(
    () => appointments.filter((a) => a.date === iso),
    [iso],
  );

  const booked = useMemo(
    () => new Set(appointments.map((a) => a.date)),
    [],
  );

  return (
    <PageShell
      title="Agenda"
      description="Selecione um dia para visualizar a timeline de atendimentos."
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <Card className="h-fit rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg">Calendário</CardTitle>
            <CardDescription>Dias com pontinho dourado possuem agendamentos.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center px-2 pb-4">
            <Calendar
              mode="single"
              locale={ptBR}
              selected={date}
              onSelect={(d) => d && setDate(d)}
              defaultMonth={date}
              modifiers={{ booked: (d) => booked.has(toISO(d)) }}
              modifiersClassNames={{
                booked:
                  "relative after:absolute after:bottom-1 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-gold",
              }}
              className={cn("pointer-events-auto rounded-xl p-3")}
            />
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg">
              {date.toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "2-digit",
                month: "long",
              })}
            </CardTitle>
            <CardDescription>
              {dayAppointments.length} atendimento(s) ·{" "}
              {brl(dayAppointments.reduce((s, a) => s + a.price, 0))} previstos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dayAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed py-16 text-center">
                <CalendarX2 className="size-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">Nenhum atendimento neste dia</p>
                  <p className="text-sm text-muted-foreground">
                    Aproveite para descansar ou abrir novos horários.
                  </p>
                </div>
                <Button variant="outline" className="rounded-xl">
                  Abrir horários
                </Button>
              </div>
            ) : (
              <div className="relative pl-16 sm:pl-20">
                <span className="absolute left-[3.6rem] top-2 bottom-2 w-px bg-border sm:left-[4.6rem]" />
                <AnimatePresence mode="popLayout">
                  {SLOTS.map((slot, i) => {
                    const a = dayAppointments.find((x) => x.time === slot);
                    return (
                      <motion.div
                        key={iso + slot}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                        className="relative mb-3"
                      >
                        <span className="text-display absolute -left-16 top-3 text-sm font-semibold text-muted-foreground sm:-left-20">
                          {slot}
                        </span>
                        <span
                          className={cn(
                            "absolute -left-[1.15rem] top-4 size-2.5 rounded-full border-2 border-background sm:-left-[1.15rem]",
                            a ? "bg-gold" : "bg-border",
                          )}
                        />
                        {a ? (
                          <button
                            onClick={() => setSelected(a)}
                            className="group flex w-full items-center gap-3 rounded-2xl border bg-card p-3.5 text-left shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-[var(--shadow-lift)]"
                          >
                            <Avatar className="size-10 shrink-0">
                              <AvatarImage src={a.avatar} alt={a.clientName} />
                              <AvatarFallback>{a.clientName.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium">{a.clientName}</p>
                              <p className="truncate text-sm text-muted-foreground">
                                {a.service} · {a.duration} min
                              </p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="font-semibold">{brl(a.price)}</p>
                              <StatusBadge status={a.status} className="mt-1" />
                            </div>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 rounded-2xl border border-dashed p-3.5 text-sm text-muted-foreground transition-colors hover:border-gold/50 hover:text-foreground">
                            <Clock className="size-4" /> Horário livre
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AppointmentDrawer
        appointment={selected}
        open={!!selected}
        onOpenChange={(v) => !v && setSelected(null)}
      />
    </PageShell>
  );
}
