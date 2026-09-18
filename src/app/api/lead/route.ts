import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const {
      companyName,
      contactName,
      email,
      phone,
      teamSize,
      toolName,
      notes
    } = data;

    console.log('--- [NOVO LEAD RECEBIDO APTIS] ---');
    console.log(`Empresa: ${companyName}`);
    console.log(`Contato: ${contactName}`);
    console.log(`E-mail: ${email}`);
    console.log(`Telefone/WhatsApp: ${phone}`);
    console.log(`Porte: ${teamSize}`);
    console.log(`Módulos de Interesse: ${toolName}`);
    console.log(`Notas: ${notes}`);
    console.log('----------------------------------');

    // 1. Envio por E-mail (via Resend se RESEND_API_KEY estiver presente)
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

    // 2. Notificação Webhook para WhatsApp (Se configurada a URL)
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

    return NextResponse.json({ success: true, message: 'Lead processado com sucesso.' });
  } catch (error) {
    console.error('Erro na API lead:', error);
    return NextResponse.json({ success: false, error: 'Falha no processamento' }, { status: 500 });
  }
}
