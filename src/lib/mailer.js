import nodemailer from 'nodemailer';

// Reads SMTP config from env. Any normal SMTP account works here — Gmail
// with an "app password", Zoho, Brevo, etc. Nothing is hardcoded so you can
// swap providers just by changing .env.
//
// Required env vars:
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
// Optional:
//   ADMIN_EMAILS   comma-separated fallback list of admin emails to notify
//                  (used only if there are no role="admin" users in the DB,
//                  which shouldn't normally happen — belt and suspenders).
//
// If SMTP isn't configured yet, send() just logs a warning and resolves —
// it never throws, so a missing/broken mail setup can't break enrollment
// or payment-confirmation flows.

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465, // true for 465, false for 587/25 (STARTTLS)
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  return transporter;
}

export async function sendMail({ to, subject, html, text }) {
  const t = getTransporter();
  if (!t) {
    console.warn('[mailer] SMTP not configured — skipping email:', subject);
    return { sent: false, reason: 'not_configured' };
  }

  try {
    await t.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
      text: text || html?.replace(/<[^>]+>/g, ' '),
    });
    return { sent: true };
  } catch (error) {
    // Never let a mail failure break the caller's request.
    console.error('[mailer] Failed to send email:', error);
    return { sent: false, reason: 'send_error' };
  }
}
