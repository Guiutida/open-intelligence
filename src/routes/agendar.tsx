import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
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
  MessageCircle,
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
  studio,
  type Professional,
  type Service,
  type Appointment,
} from "@/lib/mock-data";
import { getServices, getProfessionals, getAppointments, createAppointment } from "@/lib/db-service";

type BookingSearch = {
  serviceId?: string;
};

export const Route = createFileRoute("/agendar")({
  validateSearch: (search: Record<string, unknown>): BookingSearch => ({
    serviceId: typeof search.serviceId === "string" ? search.serviceId : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Agendar horário · Studio Júlia Gatti" },
      {
        name: "description",
        content:
          "Escolha serviço, profissional, data e horário e confirme seu agendamento em poucos cliques.",
      },
      { property: "og:title", content: "Agendar horário · Studio Júlia Gatti" },
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

function formatPhoneMask(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

const DAY_MAP = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

function generateSlotsForDay(hoursString?: string): string[] {
  if (!hoursString || hoursString === "Fechado" || !hoursString.includes("–")) {
    return [];
  }
  const parts = hoursString.split("–").map((s) => s.trim());
  if (parts.length < 2) return [];

  const [openH, openM] = parts[0].split(":").map(Number);
  const [closeH, closeM] = parts[1].split(":").map(Number);

  if (isNaN(openH) || isNaN(closeH)) return [];

  const slots: string[] = [];
  const start = openH * 60 + (openM || 0);
  const end = closeH * 60 + (closeM || 0);
  const interval = 90; // 1h30m de intervalo padrão por procedimento

  for (let minutes = start; minutes + 60 <= end; minutes += interval) {
    const h = String(Math.floor(minutes / 60)).padStart(2, "0");
    const m = String(minutes % 60).padStart(2, "0");
    slots.push(`${h}:${m}`);
  }

  return slots;
}

function BookingPage() {
  const { serviceId } = Route.useSearch();
  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [professionalsList, setProfessionalsList] = useState<Professional[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<Appointment[]>([]);
  const [studioInfo, setStudioInfo] = useState<StudioInfo | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  const [step, setStep] = useState(0);
  const [service, setService] = useState<Service | null>(null);
  const [pro, setPro] = useState<Professional | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [svcs, pros, appts, info] = await Promise.all([
          getServices(),
          getProfessionals(),
          getAppointments(),
          getStudioSettings(),
        ]);
        setServicesList(svcs);
        setProfessionalsList(pros);
        setExistingAppointments(appts);
        setStudioInfo(info);

        // Se só tem 1 profissional cadastrada, seleciona ela automaticamente
        if (pros.length === 1) {
          setPro(pros[0]);
        }

        // Se veio serviceId via URL (clique direto na Home)
        if (serviceId) {
          const found = svcs.find((s) => s.id === serviceId);
          if (found) {
            setService(found);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar dados do banco:", err);
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, [serviceId]);

  // Verificar se o dia está fechado no banco
  const getDayConfig = (d: Date) => {
    if (!studioInfo?.hours) return null;
    const dayName = DAY_MAP[d.getDay()];
    return studioInfo.hours.find((h) => h.day === dayName) || null;
  };

  const isDayClosed = (d: Date) => {
    const cfg = getDayConfig(d);
    return !cfg || cfg.time === "Fechado" || !cfg.time.includes("–");
  };

  // Gerar horários dinâmicos baseados no dia selecionado
  const rawSlots = useMemo(() => {
    if (!date) return [];
    const cfg = getDayConfig(date);
    return generateSlotsForDay(cfg?.time);
  }, [date, studioInfo]);

  // Filtrar horários ocupados para a data e profissional selecionados
  const formattedSelectedDate = date
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
    : "";

  const bookedSlotsOnDate = existingAppointments
    .filter(
      (a) =>
        a.date === formattedSelectedDate &&
        (a.professional === pro?.name || !pro) &&
        a.status !== "cancelado"
    )
    .map((a) => a.time);

  const available = rawSlots.filter((slot) => !bookedSlotsOnDate.includes(slot));

  const canAdvance = [
    !!service,
    !!pro,
    !!date,
    !!time,
    form.name.trim().length >= 3 && form.phone.replace(/\D/g, "").length >= 10,
    true,
  ][step];

  const goNext = () => {
    if (step === 2) {
      setLoadingSlots(true);
      setTimeout(() => setLoadingSlots(false), 500);
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const confirm = async () => {
    if (!service || !pro || !date || !time) return;
    setConfirming(true);
    try {
      await createAppointment({
        serviceId: service.id,
        serviceName: service.name,
        price: service.price,
        duration: service.duration,
        professionalId: pro.id,
        professionalName: pro.name,
        date: formattedSelectedDate,
        time,
        clientName: form.name,
        clientPhone: form.phone,
        clientEmail: form.email,
      });
      setDone(true);
      toast.success("Agendamento confirmado!", {
        description: `${service?.name} · ${date?.toLocaleDateString("pt-BR")} às ${time}`,
      });
    } catch (error) {
      console.error("Erro ao confirmar agendamento:", error);
      toast.error("Erro ao salvar o agendamento. Tente novamente.");
    } finally {
      setConfirming(false);
    }
  };

  const cleanPhone = studio.whatsapp.replace(/\D/g, "");
  const whatsappMsg = encodeURIComponent(
    `Olá, Studio Júlia Gatti! Agendei pelo site:\n\n` +
      `📌 *Serviço:* ${service?.name}\n` +
      `👤 *Profissional:* ${pro?.name}\n` +
      `📅 *Data:* ${date?.toLocaleDateString("pt-BR")} às ${time}\n` +
      `✍️ *Nome:* ${form.name}\n` +
      `📞 *Contato:* ${form.phone}`
  );
  const waUrl = `https://wa.me/55${cleanPhone}?text=${whatsappMsg}`;

  if (done) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md rounded-3xl border bg-card p-6 sm:p-8 text-center shadow-xl"
        >
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-600">
            <PartyPopper className="size-8" />
          </span>
          <h1 className="mt-5 text-2xl font-extrabold text-slate-900">
            Tudo certo, {form.name.split(" ")[0]}!
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Seu agendamento foi reservado com sucesso no **Studio Júlia Gatti**.
          </p>
          <div className="mt-6 space-y-2.5 rounded-2xl border bg-muted/40 p-4 text-left text-sm">
            <p className="flex justify-between">
              <span className="text-muted-foreground">Serviço</span>
              <span className="font-semibold text-slate-900">{service?.name}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-muted-foreground">Profissional</span>
              <span className="font-semibold text-slate-900">{pro?.name}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-muted-foreground">Data</span>
              <span className="font-semibold text-slate-900">{date?.toLocaleDateString("pt-BR")}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-muted-foreground">Horário</span>
              <span className="font-semibold text-slate-900">{time}</span>
            </p>
            <Separator />
            <p className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span className="text-[#F87171]">{brlExact(service?.price ?? 0)}</span>
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <Button
              className="h-12 w-full rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold gap-2 shadow-md"
              asChild
            >
              <a href={waUrl} target="_blank" rel="noreferrer">
                <MessageCircle className="size-5 fill-white/20" />
                Enviar confirmação por WhatsApp
              </a>
            </Button>

            <Button variant="outline" className="h-12 w-full rounded-2xl font-medium" asChild>
              <Link to="/">Voltar ao Studio</Link>
            </Button>
          </div>
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
                  {servicesList.map((s) => (
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
                  Selecione a profissional de sua preferência.
                </p>
                <div className="mt-5 grid gap-3">
                  {professionalsList.map((p) => (
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
                  Dias fechados e datas passadas ficam indisponíveis para agendamento.
                </p>
                <Card className="mt-5 rounded-2xl">
                  <CardContent className="flex justify-center p-3 sm:p-5">
                    <Calendar
                      mode="single"
                      locale={ptBR}
                      selected={date}
                      onSelect={setDate}
                      defaultMonth={new Date()}
                      disabled={(d) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return isDayClosed(d) || d < today;
                      }}
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
                        placeholder="(13) 99117-6958"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: formatPhoneMask(e.target.value) })}
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
