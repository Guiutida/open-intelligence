import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/privacidade")({
  component: PrivacyPage,
});

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-3xl border shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b pb-6">
          <div className="size-12 rounded-2xl bg-[#F87171]/10 text-[#F87171] flex items-center justify-center shrink-0">
            <Lock className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Política de Privacidade (LGPD)</h1>
            <p className="text-xs text-muted-foreground">Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</p>
          </div>
        </div>

        <section className="space-y-4 text-sm text-slate-700 leading-relaxed">
          <h2 className="text-base font-semibold text-slate-900">1. Coleta de Dados Pessoais</h2>
          <p>
            Coletamos informações pessoais necessárias para a prestação do serviço de agendamento, como nome completo, telefone (WhatsApp), endereço de e-mail e histórico de reservas efetuadas.
          </p>

          <h2 className="text-base font-semibold text-slate-900">2. Finalidade do Tratamento dos Dados</h2>
          <p>
            Seus dados são utilizados exclusivamente para a confirmação do horário agendado, envio de comprovantes de pagamento PIX, notificações de lembrete da consulta e comunicação direta do estúdio contratado.
          </p>

          <h2 className="text-base font-semibold text-slate-900">3. Armazenamento e Segurança</h2>
          <p>
            Todos os dados são armazenados em banco de dados seguro (Supabase) com encriptação em trânsito (SSL/TLS) e repouso, protegidos por políticas rigorosas de Row Level Security (RLS) que isolam as informações de cada estabelecimento.
          </p>

          <h2 className="text-base font-semibold text-slate-900">4. Compartilhamento de Dados</h2>
          <p>
            Não vendemos nem compartilhamos seus dados pessoais com terceiros para fins de marketing. O compartilhamento ocorre estritamente com os provedores de infraestrutura e gateways de pagamento necessários para a conclusão do agendamento.
          </p>

          <h2 className="text-base font-semibold text-slate-900">5. Seus Direitos (LGPD)</h2>
          <p>
            Você pode solicitar a qualquer momento a confirmação da existência de tratamento, o acesso aos seus dados ou a exclusão definitiva do seu cadastro entrando em contato com o suporte do estúdio ou da plataforma.
          </p>
        </section>

        <div className="pt-6 border-t flex justify-between items-center">
          <Button variant="outline" className="rounded-xl" asChild>
            <Link to="/">
              <ArrowLeft className="size-4 mr-2" /> Voltar ao Início
            </Link>
          </Button>
          <Link to="/termos" className="text-xs font-semibold text-[#F87171] hover:underline">
            Ver Termos de Uso →
          </Link>
        </div>
      </div>
    </div>
  );
}
