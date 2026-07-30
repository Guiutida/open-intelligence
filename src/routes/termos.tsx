import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/termos")({
  component: TermsPage,
});

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-3xl border shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b pb-6">
          <div className="size-12 rounded-2xl bg-[#F87171]/10 text-[#F87171] flex items-center justify-center shrink-0">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Termos de Uso do Serviço</h1>
            <p className="text-xs text-muted-foreground">Última atualização: Julho de 2026</p>
          </div>
        </div>

        <section className="space-y-4 text-sm text-slate-700 leading-relaxed">
          <h2 className="text-base font-semibold text-slate-900">1. Aceitação dos Termos</h2>
          <p>
            Ao utilizar a nossa plataforma de agendamentos e gestão SaaS, você concorda expressamente em cumprir estes Termos de Uso e todas as leis e regulamentos aplicáveis.
          </p>

          <h2 className="text-base font-semibold text-slate-900">2. Serviços Prestados</h2>
          <p>
            A plataforma disponibiliza um sistema Multi-Tenant de agendamento online de horários, pagamento prévio via PIX, envio de lembretes e gestão de clientes para estúdios, salões e profissionais da beleza.
          </p>

          <h2 className="text-base font-semibold text-slate-900">3. Política de Agendamento e Cancelamento</h2>
          <p>
            Os agendamentos realizados pelos clientes dependem da confirmação do pagamento via PIX. O cancelamento ou reagendamento deve ser efetuado com a antecedência mínima estabelecida pelo estúdio responsável.
          </p>

          <h2 className="text-base font-semibold text-slate-900">4. Responsabilidade dos Estabelecimentos</h2>
          <p>
            Cada estúdio é inteiramente responsável pela exatidão dos valores cobrados, pela prestação do serviço contratado no horário marcado e pela gestão dos seus profissionais cadastrados.
          </p>

          <h2 className="text-base font-semibold text-slate-900">5. Assinaturas e Pagamentos do SaaS</h2>
          <p>
            Os donos de estúdio contratam a utilização da plataforma mediante planos de assinatura recorrentes. A inadimplência na mensalidade poderá acarretar a suspensão temporária do acesso ao painel de gestão.
          </p>
        </section>

        <div className="pt-6 border-t flex justify-between items-center">
          <Button variant="outline" className="rounded-xl" asChild>
            <Link to="/">
              <ArrowLeft className="size-4 mr-2" /> Voltar ao Início
            </Link>
          </Button>
          <Link to="/privacidade" className="text-xs font-semibold text-[#F87171] hover:underline">
            Ver Política de Privacidade →
          </Link>
        </div>
      </div>
    </div>
  );
}
