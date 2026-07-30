import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Search, Filter, Plus, Phone, Mail, Sparkles } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { clients, brlExact, formatDateBR, type Client } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes · Lumière Lash Studio" },
      {
        name: "description",
        content: "Base de clientes com histórico de procedimentos, fotos e observações.",
      },
      { property: "og:title", content: "Clientes · Lumière Lash Studio" },
      {
        property: "og:description",
        content: "Base de clientes com histórico de procedimentos, fotos e observações.",
      },
    ],
  }),
  component: ClientesPage,
});

const tags = ["VIP", "Recorrente", "Nova"] as const;

function ClientesPage() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string[]>([]);
  const [current, setCurrent] = useState<Client | null>(null);

  const rows = useMemo(
    () =>
      clients
        .filter((c) => (active.length ? active.includes(c.tag) : true))
        .filter((c) => `${c.name} ${c.phone}`.toLowerCase().includes(query.toLowerCase())),
    [query, active],
  );

  return (
    <PageShell
      title="Clientes"
      description={`${clients.length} clientes cadastradas no studio.`}
      actions={
        <Button className="rounded-xl">
          <Plus className="size-4" /> Nova cliente
        </Button>
      }
    >
      <Card className="rounded-2xl">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nome ou telefone"
                className="h-10 rounded-xl pl-9"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-xl">
                  <Filter className="size-4" /> Filtros
                  {active.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {active.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>Classificação</DropdownMenuLabel>
                {tags.map((t) => (
                  <DropdownMenuCheckboxItem
                    key={t}
                    checked={active.includes(t)}
                    onCheckedChange={(v) =>
                      setActive((prev) => (v ? [...prev, t] : prev.filter((x) => x !== t)))
                    }
                  >
                    {t}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden sm:table-cell">Telefone</TableHead>
                  <TableHead className="hidden lg:table-cell">Último atendimento</TableHead>
                  <TableHead className="hidden lg:table-cell">Próximo</TableHead>
                  <TableHead className="text-right">Total gasto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((c) => (
                  <TableRow
                    key={c.id}
                    onClick={() => setCurrent(c)}
                    className="cursor-pointer transition-colors hover:bg-muted/60"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9 ring-1 ring-border">
                          <AvatarImage src={c.avatar} alt={c.name} />
                          <AvatarFallback>{c.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{c.name}</p>
                          <span className="text-xs text-muted-foreground">{c.visits} visitas</span>
                        </div>
                        <Badge
                          variant={c.tag === "VIP" ? "default" : "secondary"}
                          className="ml-1 hidden shrink-0 sm:inline-flex"
                        >
                          {c.tag}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{c.phone}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {formatDateBR(c.lastVisit)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {c.nextVisit ? (
                        formatDateBR(c.nextVisit)
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {brlExact(c.totalSpent)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {rows.length === 0 && (
              <div className="py-16 text-center">
                <p className="font-medium">Nenhuma cliente encontrada</p>
                <p className="text-sm text-muted-foreground">Tente outro nome ou limpe os filtros.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Sheet open={!!current} onOpenChange={(v) => !v && setCurrent(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {current && (
            <>
              <SheetHeader>
                <SheetTitle className="text-xl">Perfil da cliente</SheetTitle>
                <SheetDescription>Histórico completo e preferências.</SheetDescription>
              </SheetHeader>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 pb-8"
              >
                <div className="flex items-center gap-4 rounded-2xl border bg-gradient-to-br from-blush/60 to-transparent p-4">
                  <Avatar className="size-16 ring-2 ring-gold/40">
                    <AvatarImage src={current.avatar} alt={current.name} />
                    <AvatarFallback>{current.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-display truncate text-xl font-semibold">{current.name}</p>
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Phone className="size-3.5" /> {current.phone}
                    </p>
                    <p className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                      <Mail className="size-3.5" /> {current.email}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    { label: "Visitas", value: String(current.visits) },
                    { label: "Total gasto", value: brlExact(current.totalSpent) },
                    { label: "Perfil", value: current.tag },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border p-3 text-center">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        {s.label}
                      </p>
                      <p className="mt-1 truncate text-sm font-semibold">{s.value}</p>
                    </div>
                  ))}
                </div>

                <Separator className="my-5" />

                <Tabs defaultValue="historico">
                  <TabsList className="w-full rounded-xl">
                    <TabsTrigger value="historico" className="flex-1 rounded-lg">
                      Histórico
                    </TabsTrigger>
                    <TabsTrigger value="fotos" className="flex-1 rounded-lg">
                      Antes/Depois
                    </TabsTrigger>
                    <TabsTrigger value="notas" className="flex-1 rounded-lg">
                      Observações
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="historico" className="mt-4 space-y-2">
                    {current.history.map((h, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/50"
                      >
                        <span className="grid size-9 place-items-center rounded-lg bg-blush">
                          <Sparkles className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{h.service}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateBR(h.date)} · {h.pro}
                          </p>
                        </div>
                        <span className="font-semibold">{brlExact(h.value)}</span>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="fotos" className="mt-4 space-y-4">
                    {current.gallery.length === 0 ? (
                      <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
                        Nenhuma foto registrada ainda.
                      </div>
                    ) : (
                      current.gallery.map((g, i) => (
                        <div key={i}>
                          <p className="mb-2 text-xs font-medium text-muted-foreground">{g.label}</p>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { src: g.before, tag: "Antes" },
                              { src: g.after, tag: "Depois" },
                            ].map((p) => (
                              <div key={p.tag} className="relative overflow-hidden rounded-xl border">
                                <img
                                  src={p.src}
                                  alt={`${p.tag} — ${g.label}`}
                                  loading="lazy"
                                  className="aspect-square w-full object-cover transition-transform duration-500 hover:scale-105"
                                />
                                <span className="absolute left-2 top-2 rounded-full bg-background/85 px-2 py-0.5 text-[11px] font-semibold backdrop-blur">
                                  {p.tag}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="notas" className="mt-4">
                    <div className="rounded-xl border bg-muted/40 p-4 text-sm leading-relaxed">
                      {current.notes}
                    </div>
                  </TabsContent>
                </Tabs>
              </motion.div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </PageShell>
  );
}
