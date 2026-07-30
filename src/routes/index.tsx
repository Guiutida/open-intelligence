import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import {
  Star,
  MapPin,
  Instagram,
  Facebook,
  MessageCircle,
  Sparkles,
  Clock,
  CalendarDays,
  User,
  ExternalLink,
  Navigation,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { brlExact } from "@/lib/mock-data";
import {
  getServices,
  getStudioSettings,
  getProfessionals,
  type Service,
  type StudioInfo,
  type Professional,
} from "@/lib/db-service";
import { waLink } from "@/lib/studio-settings";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Studio Júlia Gatti · Extensão de Cílios" },
      {
        name: "description",
        content:
          "Studio especializado em extensão de cílios. Agende online o seu horário em menos de um minuto.",
      },
      { property: "og:title", content: "Studio Júlia Gatti · Extensão de Cílios" },
      {
        property: "og:description",
        content:
          "Studio especializado em extensão de cílios. Agende online o seu horário em menos de um minuto.",
      },
      { property: "og:image", content: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=75" },
      { name: "twitter:image", content: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=75" },
    ],
  }),
  component: PublicPage,
});

const defaultInfo: StudioInfo = {
  studio_name: "Studio Júlia Gatti",
  tagline: "Extensão de Cílios",
  whatsapp: "(13) 99117-6958",
  instagram: "@studiojuliagatti",
  facebook: "",
  address: "Baixada Santista · São Paulo",
  maps_url: "https://maps.google.com/?q=Studio+Julia+Gatti",
  cover_url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600&q=75",
  logo_url: "",
  rating: "5.0",
  reviews: "0",
  hours: [
    { day: "Segunda", time: "09:00 – 19:00" },
    { day: "Terça", time: "09:00 – 19:00" },
    { day: "Quarta", time: "09:00 – 20:00" },
    { day: "Quinta", time: "09:00 – 20:00" },
    { day: "Sexta", time: "09:00 – 20:00" },
    { day: "Sábado", time: "09:00 – 16:00" },
    { day: "Domingo", time: "Fechado" },
  ],
};

function PublicPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loadingPros, setLoadingPros] = useState(true);
  const [info, setInfo] = useState<StudioInfo>(defaultInfo);

  useEffect(() => {
    getServices()
      .then((data) => setServices(data))
      .catch((err) => console.error("Erro ao buscar serviços:", err))
      .finally(() => setLoadingServices(false));

    getProfessionals()
      .then((data) => setProfessionals(data))
      .catch((err) => console.error("Erro ao buscar profissionais:", err))
      .finally(() => setLoadingPros(false));

    getStudioSettings()
      .then((data) => setInfo(data))
      .catch((err) => console.error("Erro ao buscar configurações:", err));
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <div>
        {/* Barra superior transparente */}
        <header className="absolute inset-x-0 top-0 z-40 bg-transparent text-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
            <span className="flex items-center gap-2 font-semibold tracking-wide text-sm drop-shadow-md">
              <Sparkles className="size-4 text-amber-300" /> {info.studio_name}
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="rounded-full text-white bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-medium gap-1.5 shadow-sm"
              asChild
            >
              <Link to="/login">
                <User className="size-4" /> Painel Administrativo
              </Link>
            </Button>
          </div>
        </header>

        {/* Hero Banner com Foto de Fundo e Card Flutuante Estilo Referência */}
        <section className="relative">
          <div className="relative h-[220px] sm:h-[280px] overflow-hidden">
            <img
              src={info.cover_url}
              alt="Background do Studio"
              className="size-full object-cover filter brightness-[0.9] blur-[2px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
          </div>

          <div className="mx-auto -mt-24 max-w-3xl px-4 sm:px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-3xl border bg-card p-6 sm:p-10 shadow-xl text-center relative pt-14"
            >
              {/* Logo Circular Centralizado Flutuando no Topo */}
              <div className="absolute -top-14 left-1/2 -translate-x-1/2">
                <div className="grid size-28 place-items-center rounded-full border-4 border-card bg-white shadow-xl overflow-hidden p-1">
                  <img
                    src={info.logo_url || "/julia-gatti-logo.svg"}
                    alt={`${info.studio_name} Logo`}
                    className="size-full object-contain"
                  />
                </div>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                {info.studio_name}
              </h1>
              <p className="mt-1 text-sm sm:text-base text-muted-foreground font-medium">
                {info.tagline} · Agende seu horário
              </p>

              {/* Botão de Destaque Agendar */}
              <div className="mt-5 flex justify-center">
                <Button
                  size="lg"
                  className="h-12 rounded-full bg-[#F87171] hover:bg-[#ef4444] text-[#FFFFFF] font-semibold px-8 shadow-md transition-transform hover:scale-105 gap-2"
                  asChild
                >
                  <Link to="/agendar">
                    <CalendarDays className="size-5" />
                    Agendar Horário
                  </Link>
                </Button>
              </div>

              {/* Redes Sociais & Contatos na Parte Superior (Estilo Pílulas com Ícones Coloridos) */}
              <div className="mt-6 pt-5 border-t">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Redes Sociais & Contato
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {/* Instagram Pill - só mostra se tiver */}
                  {info.instagram && (
                    <a
                      href={`https://instagram.com/${info.instagram.replace("@", "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-slate-800 shadow-sm transition-all hover:shadow-md hover:border-pink-300 hover:scale-105"
                    >
                      <span className="grid size-6 place-items-center rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 text-white">
                        <Instagram className="size-3.5" />
                      </span>
                      <span>{info.instagram}</span>
                    </a>
                  )}

                  {/* WhatsApp Pill */}
                  {info.whatsapp && (
                    <a
                      href={waLink(info.whatsapp, "Olá! Vim pelo site do studio ✨")}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-slate-800 shadow-sm transition-all hover:shadow-md hover:border-green-300 hover:scale-105"
                    >
                      <span className="grid size-6 place-items-center rounded-full bg-[#25D366] text-white">
                        <MessageCircle className="size-3.5 fill-white/20" />
                      </span>
                      <span>{info.whatsapp}</span>
                    </a>
                  )}

                  {/* Facebook Pill - só mostra se tiver */}
                  {info.facebook && (
                    <a
                      href={`https://facebook.com/${info.facebook.replace("@", "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-slate-800 shadow-sm transition-all hover:shadow-md hover:border-blue-300 hover:scale-105"
                    >
                      <span className="grid size-6 place-items-center rounded-full bg-[#1877F2] text-white">
                        <Facebook className="size-3.5 fill-white" />
                      </span>
                      <span>{info.facebook}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Avaliações e Endereço */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-muted-foreground border-t pt-4">
                <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  {info.rating} ({info.reviews} avaliações)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4 text-[#F87171]" /> {info.address}
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Nossos Serviços */}
        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Nossos Serviços
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Escolha o procedimento ideal e agende com nossas especialistas.
            </p>
          </div>

          {loadingServices ? (
            <div className="flex justify-center py-16">
              <Loader2 className="size-8 animate-spin text-[#F87171]" />
            </div>
          ) : services.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Sparkles className="size-10 text-[#F87171]/40" />
              <p className="text-lg font-semibold text-slate-700">Em breve!</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Os serviços estão sendo configurados. Entre em contato pelo WhatsApp para agendar.
              </p>
              <Button asChild className="mt-2 rounded-full bg-[#F87171] hover:bg-[#f05f5f] text-white">
                <a href={waLink(info.whatsapp, "Olá! Vim pelo site e gostaria de agendar ✨")} target="_blank" rel="noreferrer">
                  <MessageCircle className="size-4 mr-2" /> Falar pelo WhatsApp
                </a>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <Card
                  key={s.id}
                  className="group h-full rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md border"
                >
                  <CardContent className="flex flex-col justify-between h-full p-5">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-slate-900">{s.name}</h3>
                        <Badge variant="outline" className="shrink-0 rounded-full font-semibold border-[#F87171]/40 text-[#F87171]">
                          {brlExact(s.price)}
                        </Badge>
                      </div>
                      <p className="mt-2 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                        {s.description}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs">
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Clock className="size-3.5" /> {s.duration} min
                      </span>
                      <Button variant="ghost" size="sm" className="h-8 rounded-full text-[#F87171] hover:text-[#F87171] hover:bg-[#F87171]/10 font-semibold" asChild>
                        <Link to="/agendar" search={{ serviceId: s.id }}>Escolher &rarr;</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Nossa Equipe / Profissionais */}
        {!loadingPros && professionals.length > 0 && (
          <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 border-t">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {professionals.length === 1 ? "Atendimento Exclusivo" : "Nossa Equipe"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground max-w-lg mx-auto">
                {professionals.length === 1
                  ? `Procedimentos realizados exclusivamente por ${professionals[0].name}, garantindo atendimento personalizado e de alta precisão.`
                  : "Escolha a profissional de sua preferência para o seu procedimento."}
              </p>
            </div>

            {professionals.length === 1 ? (
              <div className="flex justify-center">
                <Card className="rounded-3xl border bg-white p-8 shadow-sm text-center max-w-md w-full transition-transform hover:scale-[1.01]">
                  <div className="mx-auto size-28 rounded-full bg-[#F87171]/15 p-1 border-2 border-[#F87171]/40 shadow-md">
                    <img
                      src={professionals[0].avatar}
                      alt={professionals[0].name}
                      className="size-full rounded-full object-cover"
                    />
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-slate-900">{professionals[0].name}</h3>
                  <p className="text-xs font-semibold text-[#F87171] uppercase tracking-wider mt-1">
                    {professionals[0].role}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-4 py-1.5 rounded-full border border-amber-200 shadow-sm">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    <span>{professionals[0].rating.toFixed(1)} · Especialista Master & Fundadora</span>
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="rounded-3xl border bg-white p-8 sm:p-10 shadow-sm">
                <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14">
                  {professionals.map((p) => (
                    <div key={p.id} className="flex flex-col items-center text-center group cursor-pointer">
                      <div className="size-28 sm:size-32 rounded-full bg-[#F87171]/15 p-1 border-2 border-[#F87171]/40 shadow-md transition-transform duration-300 group-hover:scale-105">
                        <img
                          src={p.avatar}
                          alt={p.name}
                          className="size-full rounded-full object-cover"
                        />
                      </div>
                      <h3 className="mt-4 font-bold text-slate-900 text-base group-hover:text-[#F87171] transition-colors">
                        {p.name}
                      </h3>
                      <p className="text-xs text-muted-foreground max-w-[150px] mt-1 font-medium">
                        {p.role}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </section>
        )}

        {/* Localização e Horários */}
        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 border-t">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Localização e horários
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Venha nos visitar.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 items-stretch">
            {/* Card com Foto da Cidade / Mapa e Endereço */}
            <Card className="group relative h-full min-h-[380px] overflow-hidden rounded-3xl p-0 border shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1200&q=75"
                alt="Vista urbana dos Jardins, São Paulo"
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6 text-white flex flex-col justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-300">
                    <MapPin className="size-4" /> Endereço
                  </span>
                  <h3 className="mt-1 text-lg sm:text-xl font-bold leading-tight">
                    {info.address}
                  </h3>
                </div>

                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/20 text-xs font-medium gap-1.5"
                    asChild
                  >
                    <a href={info.maps_url} target="_blank" rel="noreferrer">
                      Como chegar <ExternalLink className="size-3.5" />
                    </a>
                  </Button>
                </div>
              </div>
            </Card>

            {/* Card com Horários de Funcionamento */}
            <Card className="rounded-3xl border bg-card p-6 sm:p-8 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-5">
                  <Clock className="size-4 text-amber-500" />
                  <span>Horário de funcionamento</span>
                </div>

                <ul className="space-y-2 text-sm">
                  {info.hours.map((h, i) => {
                    const today = new Date().getDay();
                    const dayIndex = i === 6 ? 0 : i + 1;
                    const isToday = dayIndex === today;

                    return (
                      <li
                        key={h.day}
                        className={`flex items-center justify-between rounded-xl px-4 py-2.5 transition-colors ${
                          isToday
                            ? "bg-amber-500/10 font-bold text-amber-900 border border-amber-500/20"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span className="inline-flex items-center gap-2">
                          {isToday && <Navigation className="size-3.5 text-amber-600" />}
                          {h.day}
                        </span>
                        <span className={isToday ? "font-extrabold text-slate-900" : "font-medium"}>
                          {h.time}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  className="w-full rounded-full h-11 border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold gap-2"
                  asChild
                >
                  <a href={info.maps_url} target="_blank" rel="noreferrer">
                    <Navigation className="size-4 text-amber-600" />
                    Como chegar
                  </a>
                </Button>
              </div>
            </Card>
          </div>
        </section>
      </div>

      {/* Rodapé Escuro */}
      <footer className="w-full bg-neutral-900 py-6 text-center text-sm font-medium text-neutral-300 border-t border-neutral-800">
        <div className="mx-auto flex items-center justify-center gap-2">
          <span>Facilite agendamentos com</span>
          <a
            href="https://tecmash.com.br/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 font-extrabold text-white text-base tracking-tight hover:underline transition-all group"
          >
            <img src="/tecmash-logo.svg" alt="TecMash Logo" className="h-5 w-auto transition-transform group-hover:scale-110" />
            <span>TecMash</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
