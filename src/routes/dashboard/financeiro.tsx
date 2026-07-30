import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Download, TrendingUp, Wallet, CalendarRange, PiggyBank, Loader2 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageShell, Stagger, item } from "@/components/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { brl, brlExact, formatDateBR, type Appointment } from "@/lib/mock-data";
import { getAppointments } from "@/lib/db-service";

export const Route = createFileRoute("/dashboard/financeiro")({
  head: () => ({
    meta: [
      { title: "Financeiro · Studio Júlia Gatti" },
      {
        name: "description",
        content: "Faturamento diário, semanal, mensal e anual com extrato de transações.",
      },
    ],
  }),
  component: FinanceiroPage,
});

const statusStyle: Record<string, string> = {
  pago: "bg-success/10 text-success border-success/25",
  pendente: "bg-warning/15 text-warning-foreground border-warning/40",
  estornado: "bg-destructive/10 text-destructive border-destructive/25",
};

function Tip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border bg-popover px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{brlExact(payload[0].value)}</p>
    </div>
  );
}

function FinanceiroPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAppointments().then((data) => {
      setAppointments(data);
      setLoading(false);
    });
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayAppts = appointments.filter((a) => a.date === todayStr);
  const todayTotal = todayAppts.reduce((acc, curr) => acc + curr.price, 0);

  // Calcula últimos 7 dias
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  const weekAppts = appointments.filter((a) => {
    const d = new Date(a.date);
    return d >= sevenDaysAgo && d <= now;
  });
  const weekTotal = weekAppts.reduce((acc, curr) => acc + curr.price, 0);

  // Mês atual
  const monthAppts = appointments.filter((a) => {
    const d = new Date(a.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthTotal = monthAppts.reduce((acc, curr) => acc + curr.price, 0);

  // Ano atual
  const yearAppts = appointments.filter((a) => {
    const d = new Date(a.date);
    return d.getFullYear() === now.getFullYear();
  });
  const yearTotal = yearAppts.reduce((acc, curr) => acc + curr.price, 0);

  const cards = [
    { label: "Hoje", value: todayTotal, hint: `${todayAppts.length} atendimentos`, icon: Wallet },
    { label: "Semana", value: weekTotal, hint: `${weekAppts.length} atendimentos`, icon: CalendarRange },
    { label: "Mês", value: monthTotal, hint: `${monthAppts.length} atendimentos`, icon: TrendingUp },
    { label: "Ano", value: yearTotal, hint: `${yearAppts.length} atendimentos`, icon: PiggyBank },
  ];

  // Gráfico mensal real
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const monthlyRevenueData = months.map((m, idx) => {
    const totalMonth = appointments
      .filter((a) => {
        const d = new Date(a.date);
        return d.getMonth() === idx && d.getFullYear() === now.getFullYear();
      })
      .reduce((acc, curr) => acc + curr.price, 0);

    return { month: m, value: totalMonth };
  });

  return (
    <PageShell
      title="Financeiro"
      description="Acompanhe entradas, métricas e o fluxo financeiro do studio."
      actions={
        <Button variant="outline" className="rounded-xl">
          <Download className="size-4" /> Exportar relatório
        </Button>
      }
    >
      <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <motion.div key={c.label} variants={item}>
            <Card className="group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <span className="grid size-10 place-items-center rounded-xl bg-blush text-foreground transition-transform duration-300 group-hover:scale-110">
                    <c.icon className="size-4" />
                  </span>
                </div>
                <p className="mt-4 text-[11px] uppercase tracking-wider text-muted-foreground">
                  {c.label}
                </p>
                <p className="text-display mt-1 text-2xl font-semibold">
                  {loading ? "—" : brl(c.value)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{c.hint}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Stagger>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <Card className="rounded-2xl lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Faturamento mensal ({now.getFullYear()})</CardTitle>
            <CardDescription>Evolução das receitas acumuladas mês a mês</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            {loading ? (
              <div className="flex h-[280px] items-center justify-center">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyRevenueData} margin={{ left: 8, right: 16, top: 8 }}>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border)" />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={60}
                      tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                      tickFormatter={(v) => `R$${v}`}
                    />
                    <RTooltip content={<Tip />} cursor={{ fill: "var(--muted)/40" }} />
                    <Bar
                      dataKey="value"
                      fill="var(--gold)"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Extrato recente</CardTitle>
            <CardDescription>Agendamentos e lançamentos do banco</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : appointments.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                Nenhum lançamento no banco de dados.
              </div>
            ) : (
              <div className="max-h-[300px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.slice(0, 10).map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">
                          <div>{t.clientName}</div>
                          <div className="text-[11px] text-muted-foreground">{formatDateBR(t.date)}</div>
                        </TableCell>
                        <TableCell>{brlExact(t.price)}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className={`rounded-full capitalize ${statusStyle[t.status] || ""}`}>
                            {t.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
