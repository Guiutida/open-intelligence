import { supabase, isSupabaseConfigured } from "./supabase";

export type SaaSPlan = {
  id: "starter" | "pro" | "enterprise";
  name: string;
  price: number;
  description: string;
  features: string[];
};

export const SAAS_PLANS: SaaSPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 89,
    description: "Ideal para estúdios individuais ou profissionais autônomos.",
    features: ["Até 1 Profissional", "Agendamentos ilimitados", "Pagamento PIX automático", "Suporte via e-mail"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 149,
    description: "Para estúdios em crescimento com equipe e lembretes automáticos.",
    features: [
      "Até 5 Profissionais",
      "Agendamentos ilimitados",
      "Pagamento PIX automático",
      "Lembretes de WhatsApp e E-mail",
      "Relatórios financeiros avançados",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 249,
    description: "Para clínicas e redes de beleza de alto volume.",
    features: [
      "Profissionais ilimitados",
      "Múltiplos locais/filiais",
      "Domínio personalizado",
      "Gerente de conta dedicado",
      "API de integração customizada",
    ],
  },
];

export type StudioSubscriptionInfo = {
  status: "active" | "trialing" | "past_due" | "canceled";
  plan: "starter" | "pro" | "enterprise";
  isPastDue: boolean;
};

/**
 * Busca o status da assinatura do estúdio do usuário atualmente autenticado
 */
export async function getCurrentStudioSubscription(): Promise<StudioSubscriptionInfo> {
  if (!isSupabaseConfigured || !supabase) {
    return { status: "active", plan: "pro", isPastDue: false };
  }

  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return { status: "active", plan: "pro", isPastDue: false };
    }

    const { data: studio } = await supabase
      .from("studios")
      .select("subscription_status, subscription_plan")
      .eq("owner_uid", userData.user.id)
      .single();

    if (studio) {
      const status = (studio.subscription_status as any) || "active";
      const plan = (studio.subscription_plan as any) || "pro";
      return {
        status,
        plan,
        isPastDue: status === "past_due" || status === "canceled",
      };
    }
  } catch (e) {
    console.warn("Aviso ao buscar assinatura do estúdio:", e);
  }

  return { status: "active", plan: "pro", isPastDue: false };
}
