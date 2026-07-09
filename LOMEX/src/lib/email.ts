type EmailPayload = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
};

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.RESEND_FROM ?? "LomExpress <noreply@lomexpress.tg>";

export async function sendEmail(payload: EmailPayload): Promise<{ ok: boolean; reason?: string }> {
  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.info("[email:dev]", payload.subject, "→", payload.to);
    }
    return { ok: false, reason: "RESEND_API_KEY missing" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      }),
    });
    if (!response.ok) {
      const data = await response.text();
      console.error("[email] resend error", response.status, data);
      return { ok: false, reason: `HTTP ${response.status}` };
    }
    return { ok: true };
  } catch (error) {
    console.error("[email] network error", error);
    return { ok: false, reason: "network" };
  }
}

export async function notifyAdminNewOrder(args: {
  reference: string;
  total: number;
  customerName: string;
  customerPhone: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return { ok: false, reason: "ADMIN_EMAIL missing" };
  return sendEmail({
    to: adminEmail,
    subject: `🛒 Nouvelle commande ${args.reference}`,
    html: `
      <h2>Nouvelle commande LomExpress</h2>
      <p><strong>Référence :</strong> ${args.reference}</p>
      <p><strong>Client :</strong> ${args.customerName} (${args.customerPhone})</p>
      <p><strong>Total :</strong> ${args.total.toLocaleString("fr-FR")} FCFA</p>
    `,
  });
}
