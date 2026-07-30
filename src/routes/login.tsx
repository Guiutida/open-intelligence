import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, KeyRound, Mail, Lock, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isSupabaseConfigured || !supabase) {
      toast.error("Supabase não configurado.");
      return;
    }
    setLoading(true);
    try {
      if (resetMode) {
        // Redefinição de Senha
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        });
        if (error) throw error;
        setResetSent(true);
        toast.success("E-mail de redefinição enviado com sucesso!");
      } else {
        // Login com E-mail e Senha
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-slate-50/50">
      <Card className="w-full max-w-md rounded-3xl border shadow-sm bg-white">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-[#F87171]/10 text-[#F87171] mb-3">
              <KeyRound className="size-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              {resetMode ? "Redefinir Senha" : "Entrar no Painel"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {resetMode
                ? "Digite seu e-mail para receber as instruções de recuperação."
                : "Acesse a gestão do seu estúdio ou estabelecimento."}
            </p>
          </div>

          {resetSent ? (
            <div className="text-center py-6 space-y-3">
              <p className="text-sm font-medium text-emerald-600">
                Verifique sua caixa de entrada! Enviamos um link de redefinição para <strong>{email}</strong>.
              </p>
              <Button variant="outline" className="rounded-xl w-full" onClick={() => setResetMode(false)}>
                Voltar ao Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Mail className="size-3.5 text-slate-400" /> E-mail
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

              {!resetMode && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Lock className="size-3.5 text-slate-400" /> Senha
                    </Label>
                    <button
                      type="button"
                      onClick={() => setResetMode(true)}
                      className="text-xs font-medium text-[#F87171] hover:underline"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-11 rounded-xl"
                    required
                  />
                </div>
              )}

              <Button type="submit" className="w-full h-12 rounded-xl text-sm font-semibold mt-2" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" /> Processando...
                  </>
                ) : resetMode ? (
                  "Enviar Link de Recuperação"
                ) : (
                  <>
                    Entrar no Painel <ArrowRight className="size-4 ml-1.5" />
                  </>
                )}
              </Button>

              {resetMode && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full rounded-xl text-xs"
                  onClick={() => setResetMode(false)}
                >
                  Cancelar e voltar
                </Button>
              )}

              {!resetMode && (
                <div className="text-center pt-4 border-t mt-4 text-xs text-muted-foreground">
                  Não possui uma conta?{" "}
                  <Link to="/cadastrar" className="font-semibold text-[#F87171] hover:underline">
                    Cadastrar meu estúdio
                  </Link>
                </div>
              )}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
