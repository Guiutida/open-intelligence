import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, Plus, MessageCircle } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { AppointmentDrawer } from "@/components/appointment-drawer";
import {
  brl,
  formatDateBR,
  type Appointment,
  type Status,
} from "@/lib/mock-data";
import { getAppointments } from "@/lib/db-service";

export const Route = createFileRoute("/dashboard/agendamentos")({
  head: () => ({
    meta: [
      { title: "Agendamentos · Lumière Lash Studio" },
      {
        name: "description",
        content: "Lista completa de agendamentos com filtros por status e busca por cliente.",
      },
      { property: "og:title", content: "Agendamentos · Lumière Lash Studio" },
      {
        property: "og:description",
        content: "Lista completa de agendamentos com filtros por status e busca por cliente.",
      },
    ],
  }),
  component: AgendamentosPage,
});

const filters: { key: Status | "todos"; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "confirmado", label: "Confirmados" },
  { key: "pendente", label: "Pendentes" },
  { key: "concluido", label: "Concluídos" },
  { key: "cancelado", label: "Cancelados" },
];

function AgendamentosPage() {
  const [appointmentsList, setAppointmentsList] = useState<Appointment[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status | "todos">("todos");
  const [selected, setSelected] = useState<Appointment | null>(null);

  const loadData = async () => {
    try {
      const data = await getAppointments();
      setAppointmentsList(data);
    } catch (err) {
      console.error("Erro ao carregar agendamentos:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = (id: string, newStatus: Status) => {
    setAppointmentsList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const rows = useMemo(
    () =>
      appointmentsList
        .filter((a) => (status === "todos" ? true : a.status === status))
        .filter((a) =>
          `${a.clientName} ${a.service} ${a.professional}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
        .sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1)),
    [appointmentsList, query, status],
  );

  return (
    <PageShell
      title="Agendamentos"
      description="Todos os atendimentos do studio em um só lugar."
      actions={
        <Button className="rounded-xl">
          <Plus className="size-4" /> Novo agendamento
        </Button>
      }
    >
      <Card className="rounded-2xl">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-xs">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar cliente ou serviço"
                className="h-10 rounded-xl pl-9"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
              <Tabs value={status} onValueChange={(v) => setStatus(v as Status | "todos")}>
                <TabsList className="rounded-xl">
                  {filters.map((f) => (
                    <TabsTrigger key={f.key} value={f.key} className="rounded-lg text-xs">
                      {f.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <Button variant="outline" size="icon" className="shrink-0 rounded-xl">
                <SlidersHorizontal className="size-4" />
              </Button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden md:table-cell">Serviço</TableHead>
                  <TableHead className="hidden lg:table-cell">Profissional</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="hidden sm:table-cell">Hora</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Notificar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((a) => (
                  <TableRow
                    key={a.id}
                    onClick={() => setSelected(a)}
                    className="cursor-pointer transition-colors hover:bg-muted/60"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-8">
                          <AvatarImage src={a.avatar} alt={a.clientName} />
                          <AvatarFallback>{a.clientName.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{a.clientName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{a.service}</TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {a.professional}
                    </TableCell>
                    <TableCell>{formatDateBR(a.date)}</TableCell>
                    <TableCell className="hidden sm:table-cell">{a.time}</TableCell>
                    <TableCell>
                      <StatusBadge status={a.status} />
                    </TableCell>
                    <TableCell className="text-right font-semibold">{brl(a.price)}</TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full h-8 text-emerald-600 border-emerald-300 hover:bg-emerald-50 gap-1 text-xs"
                        asChild
                      >
                        <a
                          href={`https://wa.me/55${a.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                            `Olá, ${a.clientName}! Confirmando seu horário de ${a.service} no Studio Júlia Gatti para ${formatDateBR(a.date)} às ${a.time} ✨`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <MessageCircle className="size-3.5 fill-emerald-500/20" /> WhatsApp
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {rows.length === 0 && (
              <div className="py-16 text-center">
                <p className="font-medium">Nenhum agendamento encontrado</p>
                <p className="text-sm text-muted-foreground">
                  Ajuste os filtros ou tente outra busca.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AppointmentDrawer
        appointment={selected}
        open={!!selected}
        onOpenChange={(v) => !v && setSelected(null)}
        onStatusChange={handleStatusChange}
      />
    </PageShell>
  );
}
