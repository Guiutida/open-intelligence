import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Sparkles, Building2, User, Mail, Lock, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/cadastrar")({
  component: RegisterPage,
});

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [studioName, setStudioName] = useState("");
  const [slug, setSlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStudioNameChange = (val: string) => {
    setStudioName(val);
    // Auto-gera o slug a partir do nome
    const generatedSlug = val
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    setSlug(generatedSlug);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isSupabaseConfigured || !supabase) {
      toast.error("Supabase não configurado.");
      return;
    }

    if (!fullName || !studioName || !slug || !email || !password) {
      toast.error("Por favor, preencha todos os campos do formulário.");
      return;
    }

    setLoading(true);
    try {
      // 1. Registro de Usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, studio_name: studioName },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Não foi possível criar o usuário.");

      // 2. Registro do Estúdio na tabela public.studios
      const { error: studioError } = await supabase.from("studios").insert([
        {
          slug,
          name: studioName,
          owner_uid: authData.user.id,
          subscription_status: "active",
          subscription_plan: "pro",
        },
      ]);

      if (studioError) {
        console.warn("Aviso ao vincular estúdio:", studioError);
      }

      toast.success("Conta e Estúdio criados com sucesso!", {
        description: `Seu link de agendamento: /s/${slug}/agendar`,
      });

      // Redireciona para o painel do gestor
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Erro ao cadastrar estúdio.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-slate-50/50">
      <Card className="w-full max-w-lg rounded-3xl border shadow-sm bg-white">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-[#F87171]/10 text-[#F87171] mb-3">
              <Sparkles className="size-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Cadastre seu Estabelecimento</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Comece a receber agendamentos online e pagamentos PIX em minutos.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="size-3.5 text-slate-400" /> Seu Nome Completo
              </Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex: Júlia Gatti"
                className="h-11 rounded-xl"
                required
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Building2 className="size-3.5 text-slate-400" /> Nome do Estúdio / Salão
              </Label>
              <Input
                value={studioName}
                onChange={(e) => handleStudioNameChange(e.target.value)}
                placeholder="Ex: Studio Júlia Gatti"
                className="h-11 rounded-xl"
                required
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                Link do seu site de agendamento (Slug único):
              </Label>
              <div className="flex items-center rounded-xl border bg-slate-50 px-3 py-2 text-xs font-mono text-slate-600">
                <span className="text-slate-400">app.com/s/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  className="bg-transparent font-bold text-slate-900 focus:outline-none flex-1 ml-0.5"
                  required
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Mail className="size-3.5 text-slate-400" /> E-mail de Acesso
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="h-11 rounded-xl"
                required
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Lock className="size-3.5 text-slate-400" /> Criar Senha
              </Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 rounded-xl"
                minLength={6}
                required
              />
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl text-sm font-semibold mt-2" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" /> Criando seu estúdio...
                </>
              ) : (
                <>
                  Criar minha conta <ArrowRight className="size-4 ml-1.5" />
                </>
              )}
            </Button>

            <div className="text-center pt-4 border-t mt-4 text-xs text-muted-foreground">
              Já possui uma conta?{" "}
              <Link to="/login" className="font-semibold text-[#F87171] hover:underline">
                Fazer Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
