// Supabase Edge Function: Server-Side Cron Job de Lembretes de Agendamento (24h e 2h)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const todayStr = new Date().toISOString().split("T")[0];

    // Busca agendamentos confirmados para hoje e amanhã que ainda não receberam lembrete 24h/2h
    const { data: appointments, error } = await supabase
      .from("appointments")
      .select(`
        id,
        client_name,
        client_phone,
        client_email,
        date,
        time,
        price,
        reminder_24h_sent,
        reminder_2h_sent,
        services ( name ),
        professionals ( name )
      `)
      .eq("status", "confirmado")
      .gte("date", todayStr);

    if (error) throw error;

    let processedCount = 0;

    for (const appt of appointments || []) {
      const apptDateTimeStr = `${appt.date}T${appt.time}:00`;
      const apptTime = new Date(apptDateTimeStr).getTime();
      const now = Date.now();
      const diffHours = (apptTime - now) / (1000 * 60 * 60);

      // Lembrete 24h (entre 22h e 26h de antecedência)
      if (diffHours > 22 && diffHours <= 26 && !appt.reminder_24h_sent) {
        console.log(`Enviando lembrete 24h para agendamento ${appt.id}`);

        await supabase
          .from("appointments")
          .update({ reminder_24h_sent: true })
          .eq("id", appt.id);

        processedCount++;
      }

      // Lembrete 2h (entre 1h e 3h de antecedência)
      if (diffHours > 1 && diffHours <= 3 && !appt.reminder_2h_sent) {
        console.log(`Enviando lembrete 2h para agendamento ${appt.id}`);

        await supabase
          .from("appointments")
          .update({ reminder_2h_sent: true })
          .eq("id", appt.id);

        processedCount++;
      }
    }

    return new Response(
      JSON.stringify({ success: true, processedAppointments: processedCount }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Erro no processamento do Cron de Lembretes:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
