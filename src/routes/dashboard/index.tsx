import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  CalendarCheck,
  TrendingUp,
  UserPlus,
  Clock3,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useState } from "react";

import { PageShell, Stagger, item } from "@/components/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/status-badge";
import { AppointmentDrawer } from "@/components/appointment-drawer";
import {
  appointments,
  brl,
  brlExact,
  TODAY,
  weeklyRevenue,
  type Appointment,
} from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Dashboard · Lumière Lash Studio" },
      {
        name: "description",
        content: "Visão geral de agendamentos, faturamento e clientes do studio de lash.",
      },
      { property: "og:title", content: "Dashboard · Lumière Lash Studio" },
      {
        property: "og:description",
        content: "Visão geral de agendamentos, faturamento e clientes do studio de lash.",
      },
    ],
  }),
  component: DashboardPage,
});

const todays = appointments.filter((a) => a.date === TODAY);

const metrics = [
  {
    label: "Agendamentos hoje",
    value: String(todays.length),
    hint: "2 aguardando confirmação",
    delta: "+18%",
    icon: CalendarCheck,
  },
  {
    label: "Faturamento do dia",
    value: brl(todays.reduce((s, a) => s + a.price, 0)),
    hint: "Meta diária: R$ 900",
    delta: "+24%",
    icon: TrendingUp,
  },
  { label: "Clientes novas", value: "2", hint: "Nesta semana", delta: "+2", icon: UserPlus },
  {
    label: "Próximo atendimento",
    value: todays[0]?.time ?? "--:--",
    hint: `${todays[0]?.clientName ?? ""} · ${todays[0]?.service ?? ""}`,
    delta: "em 40 min",
    icon: Clock3,
  },
];

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border bg-popover px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{brlExact(payload[0].value)}</p>
      <p className="text-[11px] text-muted-foreground">
        {payload[0].payload.atendimentos} atendimentos
      </p>
    </div>
  );
}

function DashboardPage() {
  const [selected, setSelected] = useState<Appointment | null>(null);
  const total = weeklyRevenue.reduce((s, d) => s + d.value, 0);

  return (
    <PageShell
      title="Bom dia, Camila"
      description="Aqui está o resumo do seu studio hoje, 30 de julho."
      actions={
        <>
          <Button variant="outline" className="rounded-xl" asChild>
            <Link to="/dashboard/agenda">Ver agenda</Link>
          </Button>
          <Button className="rounded-xl" asChild>
            <Link to="/agendar">Novo agendamento</Link>
          </Button>
        </>
      }
    >
      <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => (
          <motion.div key={m.label} variants={item}>
            <Card className="group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
              <span className="absolute inset-x-0 top-0 h-px gold-line opacity-0 transition-opacity group-hover:opacity-100" />
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <span className="grid size-10 place-items-center rounded-xl bg-blush text-foreground transition-transform duration-300 group-hover:scale-110">
                    <m.icon className="size-4" />
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
                    <ArrowUpRight className="size-3" />
                    {m.delta}
                  </span>
                </div>
                <p className="mt-4 text-[11px] uppercase tracking-wider text-muted-foreground">
                  {m.label}
                </p>
                <p className="text-display mt-1 truncate text-2xl font-semibold">{m.value}</p>
                <p className="mt-1 truncate text-xs text-muted-foreground">{m.hint}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Stagger>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <Card className="rounded-2xl lg:col-span-3">
          <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
            <div>
              <CardTitle className="text-lg">Faturamento semanal</CardTitle>
              <CardDescription>Últimos 7 dias · total {brlExact(total)}</CardDescription>
            </div>
            <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-foreground">
              +32% vs. semana anterior
            </span>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyRevenue} margin={{ left: 8, right: 16, top: 8 }}>
                  <defs>
                    <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--gold)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={54}
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    tickFormatter={(v) => `R$${v}`}
                  />
                  <RTooltip content={<ChartTooltip />} cursor={{ stroke: "var(--border)" }} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--gold)"
                    strokeWidth={2.5}
                    fill="url(#goldFill)"
                    animationDuration={900}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-lg">Próximos agendamentos</CardTitle>
              <CardDescription>Hoje no studio</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="rounded-lg" asChild>
              <Link to="/dashboard/agendamentos">
                Ver todos <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {todays.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelected(a)}
                className="flex w-full items-center gap-3 rounded-xl border border-transparent p-2.5 text-left transition-all hover:border-border hover:bg-muted/50"
              >
                <span className="text-display w-12 shrink-0 text-sm font-semibold text-muted-foreground">
                  {a.time}
                </span>
                <Avatar className="size-9">
                  <AvatarImage src={a.avatar} alt={a.clientName} />
                  <AvatarFallback>{a.clientName.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.clientName}</p>
                  <p className="truncate text-xs text-muted-foreground">{a.service}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{brl(a.price)}</p>
                  <StatusBadge status={a.status} className="mt-1 hidden sm:inline-flex" />
                </div>
              </button>
            ))}
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
