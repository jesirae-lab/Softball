import nodemailer from "nodemailer";
import { Team, EmailRequest } from "./types";

interface SendResult {
  preview: boolean;
  recipients: string[];
  previewContent?: string;
}

export async function sendLeagueEmail(
  req: EmailRequest,
  teams: Team[]
): Promise<SendResult> {
  const smtpConfigured =
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS;

  // Determine recipients
  let recipients: { name: string; email: string }[] = [];
  if (req.to === "all") {
    recipients = teams.map((t) => ({ name: t.name, email: t.contactEmail }));
  } else {
    const team = teams.find((t) => t.id === req.to);
    if (team) {
      recipients = [{ name: team.name, email: team.contactEmail }];
    }
  }

  const recipientEmails = recipients.map((r) => r.email);

  if (!smtpConfigured) {
    // Preview mode — log to console
    const preview = [
      `--- EMAIL PREVIEW (SMTP not configured) ---`,
      `To: ${recipients.map((r) => `${r.name} <${r.email}>`).join(", ")}`,
      `Subject: ${req.subject}`,
      ``,
      req.message,
      `-------------------------------------------`,
    ].join("\n");
    console.log(preview);
    return { preview: true, recipients: recipientEmails, previewContent: preview };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to: recipientEmails.join(", "),
    subject: req.subject,
    text: req.message,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1e3a5f;color:white;padding:20px;border-radius:8px 8px 0 0;">
        <h2 style="margin:0;">⚾ Softball League</h2>
      </div>
      <div style="padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
        <pre style="font-family:sans-serif;white-space:pre-wrap;">${req.message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
      </div>
    </div>`,
  });

  return { preview: false, recipients: recipientEmails };
}
