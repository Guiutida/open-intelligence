import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, KeyRound, Mail, Lock, ArrowRight, UserPlus } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "register" | "reset">("login");
  const [resetSent, setResetSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isSupabaseConfigured || !supabase) {
      toast.error("Serviço de autenticação temporariamente indisponível. Verifique a configuração do Supabase.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        });
        if (error) throw error;
        setResetSent(true);
        toast.success("E-mail de redefinição enviado com sucesso!");
      } else if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: "admin",
              full_name: "Júlia Gatti",
            },
          },
        });
        if (error) throw error;

        if (data.session) {
          toast.success("Conta do Studio cadastrada com sucesso!");
          window.location.href = "/dashboard";
        } else {
          toast.success("Conta criada! Verifique seu e-mail para confirmar a ativação ou faça login.");
          setMode("login");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Login realizado com sucesso!");
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      console.error("Erro na autenticação:", err);
      toast.error(err?.message || "Falha ao realizar autenticação.");
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
              {mode === "reset"
                ? "Redefinir Senha"
                : mode === "register"
                  ? "Criar Conta do Studio"
                  : "Painel Administrativo"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "reset"
                ? "Digite seu e-mail para receber as instruções de recuperação."
                : mode === "register"
                  ? "Cadastre o e-mail oficial da Júlia Gatti para gerenciar o estúdio."
                  : "Acesso exclusivo para a gestão e equipe do Studio Júlia Gatti."}
            </p>
          </div>

          {resetSent ? (
            <div className="text-center py-6 space-y-3">
              <p className="text-sm font-medium text-emerald-600">
                Verifique sua caixa de entrada! Enviamos um link de redefinição para <strong>{email}</strong>.
              </p>
              <Button variant="outline" className="rounded-xl w-full" onClick={() => { setMode("login"); setResetSent(false); }}>
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
                  placeholder="ex: julia@juliagatti.com.br"
                  className="h-11 rounded-xl"
                  required
                />
              </div>

              {mode !== "reset" && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Lock className="size-3.5 text-slate-400" /> Senha
                    </Label>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => setMode("reset")}
                        className="text-xs font-medium text-[#F87171] hover:underline"
                      >
                        Esqueci minha senha
                      </button>
                    )}
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

              <Button type="submit" className="w-full h-12 rounded-xl text-sm font-semibold mt-2 bg-[#F87171] hover:bg-[#ef4444]" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" /> Processando...
                  </>
                ) : mode === "reset" ? (
                  "Enviar Link de Recuperação"
                ) : mode === "register" ? (
                  <>
                    <UserPlus className="size-4 mr-2" /> Criar Conta
                  </>
                ) : (
                  <>
                    Entrar no Painel <ArrowRight className="size-4 ml-1.5" />
                  </>
                )}
              </Button>

              <div className="pt-2 text-center">
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => setMode("register")}
                    className="text-xs font-medium text-slate-600 hover:text-slate-900 hover:underline"
                  >
                    Ainda não tem conta? <strong>Criar conta para a Júlia</strong>
                  </button>
                )}
                {mode === "register" && (
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="text-xs font-medium text-slate-600 hover:text-slate-900 hover:underline"
                  >
                    Já possui conta? <strong>Fazer Login</strong>
                  </button>
                )}
                {mode === "reset" && (
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="text-xs font-medium text-slate-600 hover:text-slate-900 hover:underline"
                  >
                    Cancelar e voltar ao login
                  </button>
                )}
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
