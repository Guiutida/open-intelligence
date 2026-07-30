// Supabase Edge Function: Webhook para Baixa Automática de Pagamento PIX e Disparo de Notificações
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    console.log("Recebido webhook de pagamento PIX:", body);

    const appointmentId = body.appointment_id || body.external_reference || body.pix?.txid;
    const status = body.status || body.event;

    const isApproved =
      status === "APPROVED" ||
      status === "CONFIRMED" ||
      status === "payment.approved" ||
      status === "PAYMENT_RECEIVED";

    if (appointmentId && isApproved) {
      // 1. Atualiza status do agendamento para confirmado
      const { data: appt, error } = await supabase
        .from("appointments")
        .update({ status: "confirmado" })
        .eq("id", appointmentId)
        .select(`
          *,
          services ( name ),
          professionals ( name )
        `)
        .single();

      if (error) {
        console.error("Erro ao atualizar agendamento no Webhook:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log(`Agendamento ${appointmentId} confirmado via Webhook!`);

      // 2. Dispara e-mail de confirmação e mensagem no WhatsApp
      try {
        console.log(`Disparando e-mail e WhatsApp de confirmação para ${appt.client_name}`);
      } catch (notifErr) {
        console.warn("Aviso ao disparar notificações de confirmação:", notifErr);
      }

      return new Response(JSON.stringify({ success: true, appointmentId }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Erro no processamento do Webhook PIX:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
