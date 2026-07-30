import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Sparkles,
  CalendarDays,
  PartyPopper,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  brlExact,
  professionals,
  services,
  studio,
  type Professional,
  type Service,
} from "@/lib/mock-data";

export const Route = createFileRoute("/agendar")({
  head: () => ({
    meta: [
      { title: "Agendar horário · Lumière Lash Studio" },
      {
        name: "description",
        content:
          "Escolha serviço, profissional, data e horário e confirme seu agendamento em poucos cliques.",
      },
      { property: "og:title", content: "Agendar horário · Lumière Lash Studio" },
      {
        property: "og:description",
        content:
          "Escolha serviço, profissional, data e horário e confirme seu agendamento em poucos cliques.",
      },
    ],
  }),
  component: BookingPage,
});

const steps = ["Serviço", "Profissional", "Data", "Horário", "Seus dados", "Resumo"];
const ALL_SLOTS = ["09:00", "10:30", "12:00", "14:00", "16:00", "17:30", "19:00"];

function BookingPage() {
  const [step, setStep] = useState(0);
  const [service, setService] = useState<Service | null>(null);
  const [pro, setPro] = useState<Professional | null>(null);
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  const available = date
    ? ALL_SLOTS.filter((_, i) => (date.getDate() + i) % 4 !== 0)
    : [];

  const canAdvance = [
    !!service,
    !!pro,
    !!date,
    !!time,
    form.name.trim().length > 2 && form.phone.trim().length >= 8,
    true,
  ][step];

  const goNext = () => {
    if (step === 2) {
      setLoadingSlots(true);
      setTimeout(() => setLoadingSlots(false), 700);
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const confirm = () => {
    setConfirming(true);
    setTimeout(() => {
      setConfirming(false);
      setDone(true);
      toast.success("Agendamento confirmado!", {
        description: `${service?.name} · ${date?.toLocaleDateString("pt-BR")} às ${time}`,
      });
    }, 1200);
  };

  if (done) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md rounded-3xl border bg-card p-8 text-center shadow-[var(--shadow-lift)]"
        >
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-success/12">
            <PartyPopper className="size-7 text-success" />
          </span>
          <h1 className="mt-5 text-2xl font-semibold">Tudo certo, {form.name.split(" ")[0]}!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Seu horário foi reservado. Você receberá a confirmação no WhatsApp.
          </p>
          <div className="mt-6 space-y-2 rounded-2xl border bg-muted/40 p-4 text-left text-sm">
            <p className="flex justify-between">
              <span className="text-muted-foreground">Serviço</span>
              <span className="font-medium">{service?.name}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-muted-foreground">Profissional</span>
              <span className="font-medium">{pro?.name}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-muted-foreground">Data</span>
              <span className="font-medium">{date?.toLocaleDateString("pt-BR")}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-muted-foreground">Horário</span>
              <span className="font-medium">{time}</span>
            </p>
            <Separator />
            <p className="flex justify-between text-base">
              <span>Total</span>
              <span className="font-semibold">{brlExact(service?.price ?? 0)}</span>
            </p>
          </div>
          <Button className="mt-6 h-12 w-full rounded-2xl" asChild>
            <Link to="/">Voltar ao studio</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-xl" asChild>
              <Link to="/">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div className="min-w-0 flex-1">
              <p className="text-display truncate text-sm font-semibold">{studio.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                Etapa {step + 1} de {steps.length} · {steps[step]}
              </p>
            </div>
            <Sparkles className="size-4 text-gold" />
          </div>
          <Progress value={((step + 1) / steps.length) * 100} className="mt-3 h-1.5" />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === 0 && (
              <>
                <h1 className="text-2xl font-semibold">Escolha o serviço</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Selecione o procedimento desejado.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {services.map((s) => (
                    <button key={s.id} onClick={() => setService(s)} className="text-left">
                      <Card
                        className={cn(
                          "h-full rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]",
                          service?.id === s.id && "border-gold ring-2 ring-gold/30",
                        )}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <h2 className="font-semibold">{s.name}</h2>
                            {service?.id === s.id && (
                              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-gold text-background">
                                <Check className="size-3" />
                              </span>
                            )}
                          </div>
                          <p className="mt-1.5 text-sm text-muted-foreground">{s.description}</p>
                          <div className="mt-3 flex items-center justify-between text-sm">
                            <span className="font-semibold">{brlExact(s.price)}</span>
                            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                              <Clock className="size-3.5" /> {s.duration} min
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <h1 className="text-2xl font-semibold">Escolha a profissional</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Todas são especialistas certificadas.
                </p>
                <div className="mt-5 grid gap-3">
                  {professionals.map((p) => (
                    <button key={p.id} onClick={() => setPro(p)} className="text-left">
                      <Card
                        className={cn(
                          "rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]",
                          pro?.id === p.id && "border-gold ring-2 ring-gold/30",
                        )}
                      >
                        <CardContent className="flex items-center gap-4 p-4">
                          <Avatar className="size-12">
                            <AvatarImage src={p.avatar} alt={p.name} />
                            <AvatarFallback>{p.name.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold">{p.name}</p>
                            <p className="truncate text-sm text-muted-foreground">{p.role}</p>
                          </div>
                          {pro?.id === p.id && (
                            <span className="grid size-6 place-items-center rounded-full bg-gold text-background">
                              <Check className="size-3.5" />
                            </span>
                          )}
                        </CardContent>
                      </Card>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h1 className="text-2xl font-semibold">Escolha a data</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Domingos e datas passadas estão indisponíveis.
                </p>
                <Card className="mt-5 rounded-2xl">
                  <CardContent className="flex justify-center p-3 sm:p-5">
                    <Calendar
                      mode="single"
                      locale={ptBR}
                      selected={date}
                      onSelect={setDate}
                      defaultMonth={new Date(2026, 6, 1)}
                      disabled={(d) => d.getDay() === 0 || d < new Date(2026, 6, 30)}
                      className={cn("pointer-events-auto rounded-xl")}
                    />
                  </CardContent>
                </Card>
              </>
            )}

            {step === 3 && (
              <>
                <h1 className="text-2xl font-semibold">Escolha o horário</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Disponibilidade para {date?.toLocaleDateString("pt-BR")}.
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {loadingSlots
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-14 rounded-2xl" />
                      ))
                    : available.map((t) => (
                        <button
                          key={t}
                          onClick={() => setTime(t)}
                          className={cn(
                            "h-14 rounded-2xl border text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:border-gold",
                            time === t
                              ? "border-gold bg-gold/15 ring-2 ring-gold/30"
                              : "bg-card",
                          )}
                        >
                          {t}
                        </button>
                      ))}
                </div>
                {!loadingSlots && available.length === 0 && (
                  <div className="mt-6 rounded-2xl border border-dashed py-14 text-center">
                    <CalendarDays className="mx-auto size-7 text-muted-foreground" />
                    <p className="mt-3 font-medium">Sem horários neste dia</p>
                    <p className="text-sm text-muted-foreground">Escolha outra data.</p>
                  </div>
                )}
              </>
            )}

            {step === 4 && (
              <>
                <h1 className="text-2xl font-semibold">Seus dados</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Usamos apenas para confirmar seu horário.
                </p>
                <Card className="mt-5 rounded-2xl">
                  <CardContent className="grid gap-4 p-5">
                    <div className="grid gap-2">
                      <Label>Nome completo</Label>
                      <Input
                        className="h-12 rounded-xl"
                        placeholder="Como podemos te chamar?"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Telefone / WhatsApp</Label>
                      <Input
                        className="h-12 rounded-xl"
                        placeholder="(11) 90000-0000"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>E-mail (opcional)</Label>
                      <Input
                        className="h-12 rounded-xl"
                        placeholder="voce@email.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {step === 5 && (
              <>
                <h1 className="text-2xl font-semibold">Confirme seu agendamento</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Revise os detalhes antes de finalizar.
                </p>
                <Card className="mt-5 overflow-hidden rounded-2xl">
                  <span className="block h-1.5 bg-gold" />
                  <CardContent className="space-y-3 p-5 text-sm">
                    {[
                      ["Serviço", service?.name ?? ""],
                      ["Profissional", pro?.name ?? ""],
                      ["Data", date?.toLocaleDateString("pt-BR") ?? ""],
                      ["Horário", time ?? ""],
                      ["Duração", `${service?.duration} min`],
                      ["Cliente", form.name],
                      ["Telefone", form.phone],
                    ].map(([k, v]) => (
                      <p key={k} className="flex justify-between gap-4">
                        <span className="text-muted-foreground">{k}</span>
                        <span className="text-right font-medium">{v}</span>
                      </p>
                    ))}
                    <Separator />
                    <p className="flex items-center justify-between text-lg">
                      <span className="font-medium">Total</span>
                      <span className="text-display font-semibold">
                        {brlExact(service?.price ?? 0)}
                      </span>
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4 sm:px-6">
          {step > 0 && (
            <Button
              variant="outline"
              className="h-12 rounded-2xl"
              onClick={() => setStep((s) => s - 1)}
            >
              <ArrowLeft className="size-4" /> Voltar
            </Button>
          )}
          {step < steps.length - 1 ? (
            <Button
              className="h-12 flex-1 rounded-2xl"
              disabled={!canAdvance}
              onClick={goNext}
            >
              Continuar <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button
              className="h-12 flex-1 rounded-2xl"
              disabled={confirming}
              onClick={confirm}
            >
              {confirming ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Confirmando...
                </>
              ) : (
                <>
                  <Check className="size-4" /> Confirmar agendamento
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
