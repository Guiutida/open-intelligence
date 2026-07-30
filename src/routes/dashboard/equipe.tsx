import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Plus, Pencil, Trash2, Star, UserCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { PageShell, Stagger, item } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageUpload } from "@/components/ui/image-upload";
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
import { type Professional } from "@/lib/mock-data";
import {
  getProfessionals,
  createProfessional,
  updateProfessional,
  deleteProfessional,
} from "@/lib/db-service";

export const Route = createFileRoute("/dashboard/equipe")({
  head: () => ({
    meta: [
      { title: "Nossa Equipe · Studio Júlia Gatti" },
      {
        name: "description",
        content: "Gerencie a equipe de profissionais do studio.",
      },
    ],
  }),
  component: EquipePage,
});

export function EquipePage() {
  const [list, setList] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Professional | null>(null);
  const [removing, setRemoving] = useState<Professional | null>(null);
  const [creating, setCreating] = useState(false);

  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newAvatar, setNewAvatar] = useState("");
  const [newRating, setNewRating] = useState("5.0");

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getProfessionals();
      setList(data);
    } catch (err) {
      console.error("Erro ao carregar profissionais:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim() || !newRole.trim()) {
      toast.error("Preencha o nome e o cargo da profissional");
      return;
    }

    try {
      const created = await createProfessional({
        name: newName,
        role: newRole,
        avatar: newAvatar.trim() || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80",
        rating: Number(newRating) || 5.0,
      });

      setList((prev) => [...prev, created]);
      setCreating(false);
      setNewName("");
      setNewRole("");
      setNewAvatar("");
      setNewRating("5.0");
      toast.success("Profissional cadastrada com sucesso!", { description: created.name });
    } catch (e) {
      console.error("Erro ao cadastrar profissional:", e);
      toast.error("Erro ao salvar profissional.");
    }
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    try {
      await updateProfessional(editing.id, {
        name: editing.name,
        role: editing.role,
        avatar: editing.avatar,
        rating: editing.rating,
      });

      setList((prev) => prev.map((x) => (x.id === editing.id ? editing : x)));
      setEditing(null);
      toast.success("Dados da profissional atualizados", { description: editing.name });
    } catch (e) {
      console.error("Erro ao atualizar profissional:", e);
      toast.error("Erro ao atualizar.");
    }
  };

  const handleDelete = async () => {
    if (!removing) return;
    try {
      await deleteProfessional(removing.id);
      setList((prev) => prev.filter((x) => x.id !== removing.id));
      toast.error("Profissional removida", { description: removing.name });
      setRemoving(null);
    } catch (e) {
      console.error("Erro ao remover profissional:", e);
      toast.error("Erro ao remover.");
    }
  };

  return (
    <PageShell
      title="Nossa Equipe"
      description="Gerencie os profissionais que atendem no studio. Essas informações aparecem na página inicial e na área de agendamento."
      actions={
        <Dialog open={creating} onOpenChange={setCreating}>
          <DialogTrigger asChild>
            <Button className="rounded-xl">
              <Plus className="size-4" /> Nova profissional
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nova profissional</DialogTitle>
              <DialogDescription>Cadastre um novo membro para a equipe do studio.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label>Nome completo</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Júlia Gatti"
                  className="rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <Label>Cargo / Especialidade</Label>
                <Input
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="Ex: Master Lash Designer & Fundadora"
                  className="rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <Label>Foto do perfil (PNG/JPG/WebP)</Label>
                <ImageUpload
                  value={newAvatar}
                  onChange={setNewAvatar}
                  label="Selecionar foto da profissional"
                />
              </div>
              <div className="grid gap-2">
                <Label>Nota / Avaliação (0 a 5)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={newRating}
                  onChange={(e) => setNewRating(e.target.value)}
                  placeholder="5.0"
                  className="rounded-xl"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="rounded-xl" onClick={() => setCreating(false)}>
                Cancelar
              </Button>
              <Button className="rounded-xl" onClick={handleCreate}>
                Salvar profissional
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-8 animate-spin text-[#F87171]" />
        </div>
      ) : list.length === 0 ? (
        <Card className="rounded-2xl p-12 text-center">
          <UserCheck className="mx-auto size-12 text-muted-foreground/40" />
          <h3 className="mt-4 text-lg font-semibold">Nenhuma profissional cadastrada</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Cadastre as profissionais do studio para que apareçam na página pública e no agendamento.
          </p>
          <Button className="mt-6 rounded-xl" onClick={() => setCreating(true)}>
            <Plus className="size-4 mr-2" /> Cadastrar profissional
          </Button>
        </Card>
      ) : (
        <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((p) => (
            <motion.div key={p.id} variants={item}>
              <Card className="group relative h-full overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md border">
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <Avatar className="size-24 ring-4 ring-[#F87171]/20 shadow-md">
                    <AvatarImage src={p.avatar} alt={p.name} className="object-cover" />
                    <AvatarFallback className="text-xl font-bold bg-[#F87171]/10 text-[#F87171]">
                      {p.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <h3 className="mt-4 text-lg font-bold text-slate-900">{p.name}</h3>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">{p.role}</p>

                  <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    <span>{p.rating.toFixed(1)}</span>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-2 w-full border-t pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      onClick={() => setEditing(p)}
                    >
                      <Pencil className="size-3.5 mr-1" /> Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setRemoving(p)}
                    >
                      <Trash2 className="size-3.5 mr-1" /> Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Stagger>
      )}

      {/* Modal Editar */}
      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          {editing && (
            <>
              <DialogHeader>
                <DialogTitle>Editar profissional</DialogTitle>
                <DialogDescription>Altere as informações da integrante da equipe.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label>Nome completo</Label>
                  <Input
                    className="rounded-xl"
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Cargo / Especialidade</Label>
                  <Input
                    className="rounded-xl"
                    value={editing.role}
                    onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Foto do perfil (PNG/JPG/WebP)</Label>
                  <ImageUpload
                    value={editing.avatar}
                    onChange={(url) => setEditing({ ...editing, avatar: url })}
                    label="Alterar foto da profissional"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Nota / Avaliação</Label>
                  <Input
                    type="number"
                    step="0.1"
                    className="rounded-xl"
                    value={editing.rating}
                    onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" className="rounded-xl" onClick={() => setEditing(null)}>
                  Cancelar
                </Button>
                <Button className="rounded-xl" onClick={handleSaveEdit}>
                  Salvar alterações
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Confirmar Exclusão */}
      <AlertDialog open={!!removing} onOpenChange={(v) => !v && setRemoving(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir “{removing?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A profissional deixará de aparecer na lista pública de agendamento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}
