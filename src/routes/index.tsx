import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Star,
  MapPin,
  Instagram,
  MessageCircle,
  Sparkles,
  Clock,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  Navigation,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { brlExact, professionals, services, studio } from "@/lib/mock-data";
import { WhatsappFab } from "@/components/whatsapp-fab";
import { waLink } from "@/lib/studio-settings";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lumière Lash Studio · Agende seu olhar" },
      {
        name: "description",
        content:
          "Studio boutique de extensão de cílios nos Jardins, São Paulo. Agende online em menos de um minuto.",
      },
      { property: "og:title", content: "Lumière Lash Studio · Agende seu olhar" },
      {
        property: "og:description",
        content:
          "Studio boutique de extensão de cílios nos Jardins, São Paulo. Agende online em menos de um minuto.",
      },
      { property: "og:image", content: studio.cover },
      { name: "twitter:image", content: studio.cover },
    ],
  }),
  component: PublicPage,
});

function PublicPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-transparent">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <span className="flex items-center gap-2 rounded-full bg-background/70 px-3 py-1.5 backdrop-blur-md">
            <Sparkles className="size-4 text-gold" />
            <span className="text-display text-sm font-semibold">Lumière</span>
          </span>
          <Button size="sm" variant="secondary" className="rounded-full" asChild>
            <Link to="/dashboard">Área da profissional</Link>
          </Button>
        </div>
      </header>

      <section className="relative">
        <div className="relative h-[300px] overflow-hidden sm:h-[380px]">
          <img
            src={studio.cover}
            alt="Interior do Lumière Lash Studio"
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/20" />
        </div>

        <div className="mx-auto -mt-24 max-w-6xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl border bg-card p-6 shadow-[var(--shadow-lift)] sm:p-8"
          >
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
              <span className="grid size-20 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg sm:size-24">
                <Sparkles className="size-8 text-gold" />
              </span>
              <div className="min-w-0 flex-1">
                <Badge className="mb-2 rounded-full bg-gold/15 text-foreground hover:bg-gold/20">
                  Studio boutique
                </Badge>
                <h1 className="text-3xl font-semibold sm:text-4xl">{studio.name}</h1>
                <p className="mt-1 text-muted-foreground">{studio.tagline}</p>

                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                  <span className="inline-flex items-center gap-1.5 font-semibold">
                    <Star className="size-4 fill-gold text-gold" />
                    {studio.rating}
                    <span className="font-normal text-muted-foreground">
                      ({studio.reviews} avaliações)
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="size-4" /> {studio.address}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="rounded-full" asChild>
                    <a
                      href={`https://instagram.com/${studio.instagram.replace("@", "")}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Instagram className="size-4" /> {studio.instagram}
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full" asChild>
                    <a
                      href={waLink(studio.whatsapp, "Oi! Vim pelo site do studio ✨")}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MessageCircle className="size-4" /> {studio.whatsapp}
                    </a>
                  </Button>
                </div>
              </div>

              <Button
                size="lg"
                className="group h-14 w-full rounded-2xl text-base shadow-lg transition-all hover:-translate-y-0.5 sm:w-auto"
                asChild
              >
                <Link to="/agendar">
                  Agendar agora
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Nossos serviços</h2>
            <p className="text-sm text-muted-foreground">
              Técnicas premium com materiais hipoalergênicos importados.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Card className="group h-full overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
                <span className="block h-1.5" style={{ backgroundColor: s.color }} />
                <CardContent className="flex h-full flex-col p-5">
                  <h3 className="text-lg font-semibold">{s.name}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {s.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-display text-lg font-semibold">{brlExact(s.price)}</span>
                    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="size-3.5" /> {s.duration} min
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="text-2xl font-semibold">Quem vai cuidar de você</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {professionals.map((p) => (
              <Card
                key={p.id}
                className="rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
              >
                <CardContent className="flex items-center gap-4 p-5">
                  <Avatar className="size-14 ring-2 ring-gold/40">
                    <AvatarImage src={p.avatar} alt={p.name} />
                    <AvatarFallback>{p.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{p.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{p.role}</p>
                    <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold">
                      <Star className="size-3 fill-gold text-gold" /> {p.rating}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Localização e horários</h2>
          <p className="text-sm text-muted-foreground">Venha nos visitar no coração dos Jardins.</p>
        </div>

        <div className="grid items-stretch gap-4 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4 }}
            className="h-full"
          >
            <Card className="group relative h-full overflow-hidden rounded-2xl p-0">
              <a
                href={studio.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="absolute inset-0 z-10"
                aria-label="Abrir localização no Google Maps"
              />
                <div className="relative h-full min-h-[420px] w-full overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1200&q=75"
                    alt="Vista urbana da região dos Jardins, São Paulo"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="inline-flex items-center gap-1.5 text-sm font-semibold">
                        <MapPin className="size-4 text-gold" />
                        Endereço
                      </p>
                      <p className="mt-1 text-lg font-semibold">{studio.address}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">Estacionamento conveniado ao lado.</p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-foreground transition-colors group-hover:bg-gold/25">
                      Como chegar <ExternalLink className="size-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="h-full"
          >
            <Card className="h-full rounded-2xl">
              <CardContent className="flex h-full flex-col p-5">
                <p className="inline-flex items-center gap-1.5 text-sm font-semibold">
                  <Clock className="size-4 text-gold" />
                  Horário de funcionamento
                </p>
                <ul className="mt-4 flex-1 space-y-2">
                  {studio.hours.map((h, i) => {
                    const today = new Date().getDay();
                    const dayIndex = i === 6 ? 0 : i + 1;
                    const isToday = dayIndex === today;
                    return (
                      <li
                        key={h.day}
                        className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm ${
                          isToday ? "bg-gold/10 font-medium text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        <span className="inline-flex items-center gap-2">
                          {isToday && <Navigation className="size-3 text-gold" />}
                          {h.day}
                        </span>
                        <span className={isToday ? "font-semibold text-foreground" : ""}>{h.time}</span>
                      </li>
                    );
                  })}
                </ul>
                <Button variant="outline" className="mt-4 w-full rounded-xl" asChild>
                  <a href={studio.mapsUrl} target="_blank" rel="noreferrer">
                    <Navigation className="size-4" /> Como chegar
                  </a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* 1. Hero */}
      <section className="mx-auto max-w-2xl px-6 pt-24 pb-20 text-center sm:pt-28 sm:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <ShieldCheck className="mx-auto size-7 text-gold" strokeWidth={1.6} />
          <h2 className="text-display mt-6 text-[28px] leading-tight font-bold tracking-tight sm:text-[32px]">
            Seu olhar merece o melhor
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            Agende em menos de um minuto e receba a confirmação no{" "}
            <span className="font-medium text-link-blue">WhatsApp</span> na hora.
          </p>
          <Button
            size="lg"
            className="mt-8 h-12 rounded-full bg-foreground px-8 text-background transition-transform hover:-translate-y-0.5 hover:bg-foreground/90"
            asChild
          >
            <Link to="/agendar">Agendar agora</Link>
          </Button>
        </motion.div>
      </section>

      {/* 2. Divisor */}
      <div className="mx-auto max-w-3xl border-t border-border/70" />

      {/* 3. Selo da marca + 4. Banner azul */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center sm:py-24">
        <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.14em] uppercase text-muted-foreground">
          <Sparkles className="size-3.5 text-gold" /> TecMash
        </span>

        <div className="mt-8 overflow-hidden rounded-3xl bg-brand-blue px-7 py-10 text-left text-brand-blue-foreground sm:px-12 sm:py-14">
          <h2 className="text-display max-w-xl text-[28px] leading-tight font-bold sm:text-[34px]">
            Facilite agendamento com a TecMash
          </h2>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-brand-blue-foreground/80">
            Sistemas de agendamento online sob medida para studios, clínicas e salões. Sua agenda
            cheia, sem trabalho manual.
          </p>
        </div>

        <p className="mx-auto mt-8 max-w-md text-[15px] leading-relaxed text-muted-foreground">
          Fale com a TecMash e tenha a sua página de agendamentos no ar em poucos dias.
        </p>

        <Button
          size="lg"
          className="group mt-6 h-12 rounded-full bg-foreground px-8 text-background transition-transform hover:-translate-y-0.5 hover:bg-foreground/90"
          asChild
        >
          <a
            href={waLink("(11) 90000-0000", "Olá TecMash! Quero um sistema de agendamento.")}
            target="_blank"
            rel="noreferrer"
          >
            Quero para o meu negócio
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </a>
        </Button>
      </section>

      {/* 5. Divisor */}
      <div className="mx-auto max-w-3xl border-t border-border/70" />

      {/* 6. Rodapé */}
      <footer className="px-6 py-12 text-center text-xs leading-relaxed text-muted-foreground">
        <p>© 2026 {studio.name} · {studio.address}</p>
        <p className="mt-1">Feito com ♥ pela TecMash</p>
      </footer>


      <WhatsappFab />
    </div>
  );
}
