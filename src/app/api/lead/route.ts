import { NextResponse } from 'next/server';

// Rate Limiter em memória por IP (Token bucket simplificado)
const ipRequestHistory = new Map<string, { count: number; firstRequestTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minuto
const MAX_REQUESTS_PER_WINDOW = 3; // Máximo 3 envios por minuto por IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = ipRequestHistory.get(ip);

  if (!record) {
    ipRequestHistory.set(ip, { count: 1, firstRequestTime: now });
    return false;
  }

  if (now - record.firstRequestTime > RATE_LIMIT_WINDOW_MS) {
    ipRequestHistory.set(ip, { count: 1, firstRequestTime: now });
    return false;
  }

  record.count += 1;
  return record.count > MAX_REQUESTS_PER_WINDOW;
}

export async function POST(request: Request) {
  try {
    // 1. Identificação de IP para mitigação de spam e DoS
    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { success: false, error: 'Muitas solicitações em curto intervalo. Aguarde 1 minuto.' },
        { status: 429 }
      );
    }

    const data = await request.json();

    const companyName = String(data.companyName || '').trim().slice(0, 100);
    const contactName = String(data.contactName || '').trim().slice(0, 80);
    const email = String(data.email || '').trim().toLowerCase().slice(0, 100);
    const phone = String(data.phone || '').trim().slice(0, 30);
    const teamSize = String(data.teamSize || 'Não informado').slice(0, 50);
    const toolName = String(data.toolName || 'Plataforma Geral').slice(0, 80);
    const notes = String(data.notes || '').slice(0, 500);

    // 2. Validações estritas de entrada
    if (!companyName || !contactName || !email || !phone) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios incompletos (Empresa, Nome, E-mail e Telefone).' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Endereço de e-mail inválido.' },
        { status: 400 }
      );
    }

    console.log('--- [NOVO LEAD AUDITADO APTIS] ---');
    console.log(`IP: ${clientIp}`);
    console.log(`Empresa: ${companyName}`);
    console.log(`Contato: ${contactName}`);
    console.log(`E-mail: ${email}`);
    console.log(`Telefone/WhatsApp: ${phone}`);
    console.log(`Porte: ${teamSize}`);
    console.log(`Módulos de Interesse: ${toolName}`);
    console.log(`Notas: ${notes}`);
    console.log('----------------------------------');

    // 3. Envio por E-mail (via Resend se RESEND_API_KEY estiver configurado)
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`
          },
          body: JSON.stringify({
            from: 'Aptis Alertas <onboarding@resend.dev>',
            to: ['danilohenrique120@gmail.com'],
            subject: `🚨 Novo Lead Aptis: ${companyName} (${toolName})`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                <h2 style="color: #0284c7; margin-bottom: 8px;">🚨 Nova Solicitação de Demonstração & Orçamento</h2>
                <p style="color: #64748b; font-size: 14px;">Um decisor industrial acabou de preencher a proposta no portal da Aptis.</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <table style="width: 100%; font-size: 14px; line-height: 1.6;">
                  <tr><td style="font-weight: bold; width: 140px; color: #334155;">Empresa / Planta:</td><td style="color: #0f172a;"><strong>${companyName}</strong></td></tr>
                  <tr><td style="font-weight: bold; color: #334155;">Decisor / Contato:</td><td style="color: #0f172a;">${contactName}</td></tr>
                  <tr><td style="font-weight: bold; color: #334155;">E-mail:</td><td style="color: #0284c7;"><a href="mailto:${email}">${email}</a></td></tr>
                  <tr><td style="font-weight: bold; color: #334155;">WhatsApp / Fone:</td><td style="color: #059669;"><strong>${phone}</strong></td></tr>
                  <tr><td style="font-weight: bold; color: #334155;">Porte da Fábrica:</td><td style="color: #0f172a;">${teamSize}</td></tr>
                  <tr><td style="font-weight: bold; color: #334155;">Módulos:</td><td style="color: #7c3aed;"><strong>${toolName}</strong></td></tr>
                </table>
                ${notes ? `<div style="background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 12px; margin-top: 20px; font-size: 13px; color: #475569;"><strong>Observações:</strong><br/>${notes}</div>` : ''}
              </div>
            `
          })
        });
      } catch (err) {
        console.error('Erro no envio de e-mail Resend:', err);
      }
    }

    // 4. Notificação Webhook para WhatsApp
    const whatsappWebhookUrl = process.env.WHATSAPP_WEBHOOK_URL;
    if (whatsappWebhookUrl) {
      try {
        await fetch(whatsappWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetPhone: '5519991284152',
            message: `🚨 *NOVO LEAD APTIS RECEBIDO!*\n\n🏢 *Empresa:* ${companyName}\n👤 *Contato:* ${contactName}\n📞 *WhatsApp:* ${phone}\n✉️ *E-mail:* ${email}\n⚙️ *Módulos:* ${toolName}\n👥 *Porte:* ${teamSize}\n\n👉 Atender: https://wa.me/55${phone.replace(/\D/g, '')}`
          })
        });
      } catch (err) {
        console.error('Erro no webhook WhatsApp:', err);
      }
    }

    return NextResponse.json({ success: true, message: 'Lead processado e recebido com sucesso.' });
  } catch (error) {
    console.error('Erro na API lead:', error);
    return NextResponse.json({ success: false, error: 'Falha no processamento do lead.' }, { status: 500 });
  }
}
