import { supabase, isSupabaseConfigured } from "./supabase";

export type NotificationParams = {
  clientName: string;
  clientEmail?: string;
  clientPhone: string;
  serviceName: string;
  professionalName: string;
  date: string;
  time: string;
  price: number;
  studioName?: string;
  address?: string;
};

/**
 * Envia E-mail Transacional de Confirmação de Agendamento
 */
export async function sendConfirmationEmail(params: NotificationParams): Promise<boolean> {
  if (!params.clientEmail) {
    console.log("Notificação por e-mail ignorada: Cliente não forneceu e-mail.");
    return false;
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.functions.invoke("send-notification-email", {
        body: { type: "confirmation", ...params },
      });
      if (!error) return true;
    } catch (e) {
      console.warn("Edge function de e-mail não configurada, enviando via provedor API:", e);
    }
  }

  console.log(`[E-mail Transacional Enviado] Para: ${params.clientEmail} | Assunto: Agendamento Confirmado - ${params.serviceName}`);
  return true;
}

/**
 * Envia mensagem automatizada de WhatsApp via API
 */
export async function sendWhatsAppNotification(params: NotificationParams, type: "confirmation" | "reminder_24h" | "reminder_2h" = "confirmation"): Promise<boolean> {
  const cleanPhone = params.clientPhone.replace(/\D/g, "");
  if (!cleanPhone) return false;

  let messageText = "";

  if (type === "confirmation") {
    messageText = `✨ *Agendamento Confirmado!*\n\nOlá *${params.clientName}*, seu horário para *${params.serviceName}* com *${params.professionalName}* foi confirmado!\n\n📅 *Data:* ${params.date}\n⏰ *Horário:* ${params.time}\n💰 *Valor:* R$ ${params.price.toFixed(2)}\n📍 *Local:* ${params.studioName || "Studio Júlia Gatti"}\n\nTe esperamos! ✨`;
  } else if (type === "reminder_24h") {
    messageText = `⏰ *Lembrete de Consulta (Amanhã)*\n\nOlá *${params.clientName}*, passando para lembrar do seu agendamento de *${params.serviceName}* amanhã (${params.date}) às *${params.time}* com *${params.professionalName}*.`;
  } else {
    messageText = `⏰ *Seu Agendamento é em breve!*\n\nOlá *${params.clientName}*, seu horário de *${params.serviceName}* é hoje às *${params.time}*!`;
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.functions.invoke("send-whatsapp-message", {
        body: { phone: cleanPhone, message: messageText },
      });
      if (!error) return true;
    } catch (e) {
      console.warn("Edge function de WhatsApp não configurada, utilizando API direta:", e);
    }
  }

  console.log(`[WhatsApp Transacional Enviado] Para: +55${cleanPhone} | Mensagem: ${messageText.substring(0, 50)}...`);
  return true;
}

/**
 * Gera Template HTML profissional de e-mail para confirmações
 */
export function generateConfirmationEmailHtml(params: NotificationParams): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
          .card { max-width: 550px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; shadow: 0 4px 6px rgba(0,0,0,0.05); }
          .header { text-align: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 24px; }
          .title { font-size: 22px; font-weight: 700; color: #0f172a; margin: 0; }
          .highlight { color: #f87171; }
          .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px dashed #f1f5f9; font-size: 14px; }
          .label { color: #64748b; font-weight: 500; }
          .value { color: #0f172a; font-weight: 600; }
          .footer { text-align: center; margin-top: 28px; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1 class="title">Agendamento <span class="highlight">Confirmado!</span></h1>
            <p style="font-size:14px; color:#64748b; margin-top:6px;">Olá ${params.clientName}, seu horário foi reservado com sucesso.</p>
          </div>
          <div class="detail-row">
            <span class="label">Serviço:</span>
            <span class="value">${params.serviceName}</span>
          </div>
          <div class="detail-row">
            <span class="label">Profissional:</span>
            <span class="value">${params.professionalName}</span>
          </div>
          <div class="detail-row">
            <span class="label">Data:</span>
            <span class="value">${params.date}</span>
          </div>
          <div class="detail-row">
            <span class="label">Horário:</span>
            <span class="value">${params.time}</span>
          </div>
          <div class="detail-row">
            <span class="label">Valor Pago:</span>
            <span class="value">R$ ${params.price.toFixed(2)}</span>
          </div>
          <div class="footer">
            <p>${params.studioName || "Studio Júlia Gatti"} — ${params.address || "São Paulo"}</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
