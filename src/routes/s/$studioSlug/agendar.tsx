import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
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
  Copy,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { createRealPixCharge, subscribeToAppointmentStatus, type PixPaymentPayload } from "@/lib/payment-service";

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
import { brlExact } from "@/lib/mock-data";
import {
  getStudioBySlug,
  getServices,
  getProfessionals,
  getStudioSettings,
  createAppointment,
  type Professional,
  type Service,
  type Appointment,
  type StudioInfo,
  type StudioRecord,
} from "@/lib/db-service";

type BookingSearch = {
  serviceId?: string;
};

export const Route = createFileRoute("/s/$studioSlug/agendar")({
  validateSearch: (search: Record<string, unknown>): BookingSearch => ({
    serviceId: typeof search.serviceId === "string" ? search.serviceId : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Agendar horário online" },
      { name: "description", content: "Escolha serviço, profissional, data e horário e confirme seu agendamento." },
    ],
  }),
  component: StudioDynamicBookingPage,
});

const steps = ["Serviço", "Profissional", "Data", "Horário", "Seus dados", "Resumo", "Pagamento"];
const ALL_SLOTS = ["09:00", "10:30", "12:00", "14:00", "16:00", "17:30", "19:00"];

function formatPhoneMask(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function StudioDynamicBookingPage() {
  const { studioSlug } = Route.useParams();
  const search = Route.useSearch();

  const [studioRecord, setStudioRecord] = useState<StudioRecord | null>(null);
  const [studioInfo, setStudioInfo] = useState<StudioInfo | null>(null);
  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [prosList, setProsList] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState(0);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(search.serviceId || null);
  const [selectedProId, setSelectedProId] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });
  const [acceptTerms, setAcceptTerms] = useState(true);

  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);
  const [pendingAppt, setPendingAppt] = useState<Appointment | null>(null);
  const [pixData, setPixData] = useState<PixPaymentPayload | null>(null);
  const [loadingPix, setLoadingPix] = useState(false);

  useEffect(() => {
    async function loadStudioData() {
      setLoading(true);
      try {
        const studioRec = await getStudioBySlug(studioSlug);
        setStudioRecord(studioRec);

        const [svc, pros, settings] = await Promise.all([
          getServices(studioRec.id),
          getProfessionals(studioRec.id),
          getStudioSettings(studioRec.id),
        ]);

        setServicesList(svc);
        setProsList(pros);
        setStudioInfo(settings);

        if (search.serviceId && svc.some((s) => s.id === search.serviceId)) {
          setSelectedServiceId(search.serviceId);
        }
      } catch (err: any) {
        console.error("Erro ao carregar estúdio por slug:", err);
        toast.error(`Estúdio '${studioSlug}' não encontrado.`);
      } finally {
        setLoading(false);
      }
    }
    loadStudioData();
  }, [studioSlug, search.serviceId]);

  const service = useMemo(
    () => servicesList.find((s) => s.id === selectedServiceId) ?? null,
    [servicesList, selectedServiceId]
  );
  const pro = useMemo(
    () => prosList.find((p) => p.id === selectedProId) ?? null,
    [prosList, selectedProId]
  );

  const formattedSelectedDate = useMemo(() => {
    if (!date) return "";
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, [date]);

  const canAdvance = useMemo(() => {
    if (step === 0) return Boolean(service);
    if (step === 1) return Boolean(pro);
    if (step === 2) return Boolean(date);
    if (step === 3) return Boolean(time);
    if (step === 4) return Boolean(form.name.trim() && form.phone.replace(/\D/g, "").length >= 10);
    if (step === 5) return acceptTerms;
    return true;
  }, [step, service, pro, date, time, form, acceptTerms]);

  const confirm = async () => {
    if (!service || !pro || !date || !time) return;
    setConfirming(true);
    try {
      const appt = await createAppointment(
        {
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
          notes: form.notes,
          studioId: studioRecord?.id,
        },
        "pendente"
      );

      setPendingAppt(appt);
      setStep(steps.length - 1);

      setLoadingPix(true);
      try {
        const pix = await createRealPixCharge({
          appointmentId: appt.id,
          amount: service.price,
          description: `${service.name} - ${studioRecord?.name}`,
          clientName: form.name,
          clientEmail: form.email,
          clientPhone: form.phone,
        });
        setPixData(pix);
      } catch (err) {
        console.error("Erro ao gerar PIX:", err);
      } finally {
        setLoadingPix(false);
      }

      toast.success("Agendamento criado — faça o PIX para confirmar", {
        description: `${service?.name} · ${date?.toLocaleDateString("pt-BR")} às ${time}`,
      });
    } catch (error) {
      console.error("Erro ao confirmar agendamento:", error);
      toast.error("Erro ao salvar o agendamento. Tente novamente.");
    } finally {
      setConfirming(false);
    }
  };

  useEffect(() => {
    if (!pendingAppt || step !== steps.length - 1 || done) return;

    const unsubscribe = subscribeToAppointmentStatus(pendingAppt.id, (newStatus) => {
      if (newStatus === "confirmado") {
        setDone(true);
        toast.success("Pagamento confirmado automaticamente pelo banco!");
      }
    });

    return () => unsubscribe();
  }, [pendingAppt, step, done]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="size-8 animate-spin text-[#F87171] mb-2" />
        <p className="text-sm text-muted-foreground">Carregando informações do estúdio...</p>
      </div>
    );
  }

  const cleanPhone = (studioInfo?.whatsapp || "").replace(/\D/g, "");
  const whatsappMsg = encodeURIComponent(
    `Olá! Agendei pelo site:\n\n` +
      `• Serviço: ${service?.name ?? ""}\n` +
      `• Profissional: ${pro?.name ?? ""}\n` +
      `• Data: ${date ? date.toLocaleDateString("pt-BR") : ""}\n` +
      `• Horário: ${time ?? ""}\n` +
      `• Cliente: ${form.name}`
  );

  if (done) {
    return (
      <div className="min-h-screen bg-background py-10 px-4 flex items-center justify-center">
        <Card className="max-w-lg w-full rounded-3xl border shadow-sm">
          <CardContent className="p-8 text-center space-y-5">
            <div className="mx-auto size-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <PartyPopper className="size-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Agendamento Confirmado!</h1>
            <p className="text-sm text-muted-foreground">
              Seu horário em <strong>{studioRecord?.name}</strong> foi reservado e o pagamento PIX foi aprovado com sucesso.
            </p>

            <div className="rounded-2xl border bg-slate-50 p-4 text-left space-y-2 text-sm">
              <p><strong>Serviço:</strong> {service?.name}</p>
              <p><strong>Profissional:</strong> {pro?.name}</p>
              <p><strong>Data/Hora:</strong> {date?.toLocaleDateString("pt-BR")} às {time}</p>
              <p><strong>Valor Pago:</strong> {brlExact(service?.price ?? 0)}</p>
            </div>

            <div className="grid gap-2 pt-2">
              {cleanPhone && (
                <Button className="h-12 rounded-2xl bg-[#25D366] text-black hover:bg-[#20bd5a]" asChild>
                  <a href={`https://wa.me/55${cleanPhone}?text=${whatsappMsg}`} target="_blank" rel="noreferrer">
                    <MessageCircle className="size-4 mr-2" /> Enviar comprovante no WhatsApp
                  </a>
                </Button>
              )}
              <Button variant="outline" className="h-12 rounded-2xl" asChild>
                <Link to="/">Voltar ao início</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-[#F87171]/10 text-[#F87171] flex items-center justify-center font-bold">
              <Building2 className="size-5" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 leading-tight">{studioRecord?.name}</h1>
              <p className="text-xs text-muted-foreground">Agendamento Online</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            Passo {step + 1} de {steps.length}
          </span>
        </div>
        <Progress value={((step + 1) / steps.length) * 100} className="h-1 rounded-none bg-slate-100" />
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Selecione o Serviço</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {servicesList.map((s) => (
                <Card
                  key={s.id}
                  onClick={() => setSelectedServiceId(s.id)}
                  className={cn(
                    "cursor-pointer rounded-2xl transition-all border p-4",
                    selectedServiceId === s.id ? "border-[#F87171] bg-[#F87171]/5 ring-1 ring-[#F87171]" : "hover:border-slate-300"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-slate-900">{s.name}</h3>
                    <span className="font-bold text-[#F87171] text-sm">{brlExact(s.price)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{s.description}</p>
                  <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                    <Clock className="size-3" /> {s.duration} minutos
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Escolha o Profissional</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {prosList.map((p) => (
                <Card
                  key={p.id}
                  onClick={() => setSelectedProId(p.id)}
                  className={cn(
                    "cursor-pointer rounded-2xl transition-all border p-4 flex items-center gap-3",
                    selectedProId === p.id ? "border-[#F87171] bg-[#F87171]/5 ring-1 ring-[#F87171]" : "hover:border-slate-300"
                  )}
                >
                  <Avatar className="size-12 rounded-xl">
                    <AvatarImage src={p.avatar} alt={p.name} />
                    <AvatarFallback>{p.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">{p.name}</h3>
                    <p className="text-xs text-muted-foreground">{p.role}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 text-center">
            <h2 className="text-xl font-bold text-left">Escolha a Data</h2>
            <div className="inline-block border rounded-3xl p-3 bg-white shadow-sm">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                locale={ptBR}
                disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Escolha o Horário</h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {ALL_SLOTS.map((slot) => (
                <Button
                  key={slot}
                  variant={time === slot ? "default" : "outline"}
                  className={cn("h-12 rounded-xl text-sm font-semibold", time === slot && "bg-[#F87171] hover:bg-[#e05d5d]")}
                  onClick={() => setTime(slot)}
                >
                  {slot}
                </Button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Seus Dados de Contato</h2>
            <Card className="rounded-2xl p-5 space-y-4">
              <div>
                <Label className="text-xs font-semibold">Seu Nome Completo</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Maria Silva"
                  className="h-11 rounded-xl mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">WhatsApp (para confirmação)</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: formatPhoneMask(e.target.value) }))}
                  placeholder="(11) 99999-9999"
                  className="h-11 rounded-xl mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">E-mail (opcional)</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="maria@exemplo.com"
                  className="h-11 rounded-xl mt-1"
                />
              </div>
            </Card>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Resumo do Agendamento</h2>
            <Card className="rounded-2xl p-5 space-y-3">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Estúdio:</span><strong>{studioRecord?.name}</strong></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Serviço:</span><strong>{service?.name}</strong></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Profissional:</span><strong>{pro?.name}</strong></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Data/Hora:</span><strong>{date?.toLocaleDateString("pt-BR")} às {time}</strong></div>
              <Separator />
              <div className="flex justify-between text-base font-bold"><span>Total:</span><span className="text-[#F87171]">{brlExact(service?.price ?? 0)}</span></div>
            </Card>

            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
              <input type="checkbox" id="terms" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="rounded" />
              <label htmlFor="terms">Concordo com os <Link to="/termos" className="underline">Termos de Uso</Link> e <Link to="/privacidade" className="underline">Política de Privacidade</Link>.</label>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4 text-center">
            <h2 className="text-xl font-bold">Pagamento via PIX</h2>
            <p className="text-xs text-muted-foreground">Pague via PIX para confirmar automaticamente seu horário.</p>

            <Card className="rounded-2xl p-6">
              {loadingPix ? (
                <div className="py-10 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="size-8 animate-spin text-[#F87171]" />
                  <p className="text-xs text-muted-foreground">Gerando PIX dinâmico com o banco...</p>
                </div>
              ) : pixData ? (
                <>
                  <div className="mx-auto mb-4 w-48 h-48 rounded-2xl border bg-white p-2 flex items-center justify-center">
                    <img src={pixData.qrCodeBase64} alt="QR Code PIX" className="w-full h-full object-contain" />
                  </div>
                  <div className="mb-4 max-w-sm mx-auto">
                    <div className="flex items-center gap-2">
                      <Input readOnly value={pixData.pixCopiaECola} className="text-xs font-mono h-10 rounded-xl" />
                      <Button size="sm" className="h-10 rounded-xl" onClick={() => { navigator.clipboard.writeText(pixData.pixCopiaECola); toast.success("Chave PIX copiada!"); }}>
                        <Copy className="size-4" /> Copiar
                      </Button>
                    </div>
                  </div>
                </>
              ) : null}

              <div className="rounded-xl bg-amber-500/10 p-3 text-xs text-amber-600 flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin shrink-0" />
                <span>Aguardando baixa do pagamento no banco...</span>
              </div>
            </Card>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 inset-x-0 bg-background border-t p-4 z-20">
        <div className="max-w-3xl mx-auto flex gap-3">
          {step > 0 && (
            <Button variant="outline" className="h-12 rounded-xl" onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft className="size-4 mr-1" /> Voltar
            </Button>
          )}
          {step < steps.length - 1 ? (
            <Button className="h-12 flex-1 rounded-xl bg-[#F87171] hover:bg-[#e05d5d]" disabled={!canAdvance} onClick={() => setStep((s) => s + 1)}>
              Continuar <ArrowRight className="size-4 ml-1" />
            </Button>
          ) : (
            <Button className="h-12 flex-1 rounded-xl bg-[#F87171] hover:bg-[#e05d5d]" disabled={confirming} onClick={confirm}>
              {confirming ? <Loader2 className="size-4 animate-spin" /> : <><Check className="size-4 mr-1" /> Finalizar Agendamento</>}
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
