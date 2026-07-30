import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Download, TrendingUp, Wallet, CalendarRange, PiggyBank } from "lucide-react";
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
import { brl, brlExact, formatDateBR, monthlyRevenue, transactions } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/financeiro")({
  head: () => ({
    meta: [
      { title: "Financeiro · Lumière Lash Studio" },
      {
        name: "description",
        content: "Faturamento diário, semanal, mensal e anual com extrato de transações.",
      },
      { property: "og:title", content: "Financeiro · Lumière Lash Studio" },
      {
        property: "og:description",
        content: "Faturamento diário, semanal, mensal e anual com extrato de transações.",
      },
    ],
  }),
  component: FinanceiroPage,
});

const cards = [
  { label: "Hoje", value: 750, hint: "5 atendimentos", icon: Wallet, delta: "+12%" },
  { label: "Semana", value: 5300, hint: "31 atendimentos", icon: CalendarRange, delta: "+8%" },
  { label: "Mês", value: 18400, hint: "112 atendimentos", icon: TrendingUp, delta: "+21%" },
  { label: "Ano", value: 102400, hint: "Meta: R$ 150.000", icon: PiggyBank, delta: "+34%" },
];

const statusStyle: Record<string, string> = {
  pago: "bg-success/10 text-success border-success/25",
  pendente: "bg-warning/15 text-warning-foreground border-warning/40",
  estornado: "bg-destructive/10 text-destructive border-destructive/25",
};

function Tip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border bg-popover px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{brlExact(payload[0].value)}</p>
    </div>
  );
}

function FinanceiroPage() {
  return (
    <PageShell
      title="Financeiro"
      description="Acompanhe o faturamento e o extrato do studio."
      actions={
        <Button variant="outline" className="rounded-xl">
          <Download className="size-4" /> Exportar relatório
        </Button>
      }
    >
      <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <motion.div key={c.label} variants={item}>
            <Card className="group rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-xl bg-gold/15 transition-transform duration-300 group-hover:scale-110">
                    <c.icon className="size-4 text-foreground" />
                  </span>
                  <span className="text-xs font-semibold text-success">{c.delta}</span>
                </div>
                <p className="mt-4 text-[11px] uppercase tracking-wider text-muted-foreground">
                  {c.label}
                </p>
                <p className="text-display mt-1 text-2xl font-semibold">{brl(c.value)}</p>
                <p className="mt-1 text-xs text-muted-foreground">{c.hint}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Stagger>

      <Card className="mt-6 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Faturamento por mês</CardTitle>
          <CardDescription>Janeiro a julho de 2026</CardDescription>
        </CardHeader>
        <CardContent className="pl-0">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue} margin={{ left: 8, right: 16, top: 8 }}>
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
                  width={62}
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  tickFormatter={(v) => `R$${v / 1000}k`}
                />
                <RTooltip content={<Tip />} cursor={{ fill: "var(--muted)" }} />
                <Bar
                  dataKey="value"
                  fill="var(--gold)"
                  radius={[8, 8, 0, 0]}
                  animationDuration={900}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Extrato de transações</CardTitle>
          <CardDescription>Últimos lançamentos registrados</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden md:table-cell">Serviço</TableHead>
                <TableHead className="hidden sm:table-cell">Pagamento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => (
                <TableRow key={t.id} className="transition-colors hover:bg-muted/60">
                  <TableCell>{formatDateBR(t.date)}</TableCell>
                  <TableCell className="font-medium">{t.client}</TableCell>
                  <TableCell className="hidden md:table-cell">{t.service}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="secondary">{t.payment}</Badge>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${statusStyle[t.status]}`}
                    >
                      {t.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{brlExact(t.value)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageShell>
  );
}
