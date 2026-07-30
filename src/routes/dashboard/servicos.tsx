import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { Plus, Pencil, Trash2, Clock, Tag } from "lucide-react";
import { toast } from "sonner";

import { PageShell, Stagger, item } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { services as initialServices, brlExact, type Service } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/servicos")({
  head: () => ({
    meta: [
      { title: "Serviços · Lumière Lash Studio" },
      {
        name: "description",
        content: "Catálogo de serviços do studio com preço, duração e identidade de cor.",
      },
      { property: "og:title", content: "Serviços · Lumière Lash Studio" },
      {
        property: "og:description",
        content: "Catálogo de serviços do studio com preço, duração e identidade de cor.",
      },
    ],
  }),
  component: ServicosPage,
});

function ServicosPage() {
  const [list, setList] = useState<Service[]>(initialServices);
  const [editing, setEditing] = useState<Service | null>(null);
  const [removing, setRemoving] = useState<Service | null>(null);
  const [creating, setCreating] = useState(false);

  const save = (s: Service) => {
    setList((prev) => prev.map((x) => (x.id === s.id ? s : x)));
    setEditing(null);
    toast.success("Serviço atualizado", { description: s.name });
  };

  return (
    <PageShell
      title="Serviços"
      description="Gerencie o catálogo, preços e duração de cada procedimento."
      actions={
        <Dialog open={creating} onOpenChange={setCreating}>
          <DialogTrigger asChild>
            <Button className="rounded-xl">
              <Plus className="size-4" /> Novo serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Novo serviço</DialogTitle>
              <DialogDescription>Cadastre um novo procedimento do studio.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label>Nome</Label>
                <Input placeholder="Ex: Volume Egípcio" className="rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Preço (R$)</Label>
                  <Input type="number" placeholder="200" className="rounded-xl" />
                </div>
                <div className="grid gap-2">
                  <Label>Duração (min)</Label>
                  <Input type="number" placeholder="120" className="rounded-xl" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Descrição</Label>
                <Textarea placeholder="Breve descrição do procedimento" className="rounded-xl" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="rounded-xl" onClick={() => setCreating(false)}>
                Cancelar
              </Button>
              <Button
                className="rounded-xl"
                onClick={() => {
                  setCreating(false);
                  toast.success("Serviço criado com sucesso!");
                }}
              >
                Salvar serviço
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((s) => (
          <motion.div key={s.id} variants={item}>
            <Card className="group relative h-full overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
              <span
                className="absolute inset-x-0 top-0 h-1.5"
                style={{ backgroundColor: s.color }}
              />
              <CardContent className="flex h-full flex-col p-5 pt-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold">{s.name}</h3>
                  <span
                    className="mt-1 size-3 shrink-0 rounded-full ring-2 ring-background"
                    style={{ backgroundColor: s.color }}
                  />
                </div>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {s.description}
                </p>
                <div className="mt-4 flex items-center gap-4 text-sm">
                  <span className="inline-flex items-center gap-1.5 font-semibold">
                    <Tag className="size-3.5 text-gold" /> {brlExact(s.price)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="size-3.5" /> {s.duration} min
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => setEditing(s)}
                  >
                    <Pencil className="size-3.5" /> Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setRemoving(s)}
                  >
                    <Trash2 className="size-3.5" /> Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Stagger>

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          {editing && (
            <>
              <DialogHeader>
                <DialogTitle>Editar serviço</DialogTitle>
                <DialogDescription>Altere as informações do procedimento.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label>Nome</Label>
                  <Input
                    className="rounded-xl"
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label>Preço (R$)</Label>
                    <Input
                      type="number"
                      className="rounded-xl"
                      value={editing.price}
                      onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Duração (min)</Label>
                    <Input
                      type="number"
                      className="rounded-xl"
                      value={editing.duration}
                      onChange={(e) => setEditing({ ...editing, duration: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Descrição</Label>
                  <Textarea
                    className="rounded-xl"
                    value={editing.description}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" className="rounded-xl" onClick={() => setEditing(null)}>
                  Cancelar
                </Button>
                <Button className="rounded-xl" onClick={() => save(editing)}>
                  Salvar alterações
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!removing} onOpenChange={(v) => !v && setRemoving(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir “{removing?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O serviço deixará de aparecer na área pública.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (removing) {
                  setList((prev) => prev.filter((x) => x.id !== removing.id));
                  toast.error("Serviço excluído", { description: removing.name });
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}
