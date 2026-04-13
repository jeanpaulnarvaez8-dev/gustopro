import nodemailer from "nodemailer";
import { prisma } from "./db";

// ─── Transport ──────────────────────────────────────────────────────────────

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@gustopro.it";
const FROM_NAME = process.env.FROM_NAME || "Riva Beach Salento";

const smtpConfigured = SMTP_HOST && SMTP_USER && SMTP_PASS;

const transporter = smtpConfigured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  : null;

// ─── Service labels ─────────────────────────────────────────────────────────

const SERVICE_NAMES: Record<string, string> = {
  BEACH_BAR: "Beach Bar",
  RESTAURANT: "Ristorante",
  APERITIVO: "Aperitivo",
  VIP_CABANA: "VIP Cabana",
  VIP_BOTTLE: "VIP Bottle Service",
  TAKEAWAY: "Takeaway",
  EVENTS: "Eventi",
};

// ─── Email templates ────────────────────────────────────────────────────────

function bookingConfirmationHtml(data: {
  customerName: string;
  serviceType: string;
  date?: string;
  timeSlot?: string;
  guests?: number;
  orderNumber?: string;
  totalAmount?: string;
  eventType?: string;
  eventGuests?: number;
  pickupTime?: string;
  locationCode?: string;
}) {
  const serviceName = SERVICE_NAMES[data.serviceType] || data.serviceType;

  const details: string[] = [];
  if (data.date) details.push(`<strong>Data:</strong> ${new Date(data.date).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`);
  if (data.timeSlot) details.push(`<strong>Orario:</strong> ${data.timeSlot}`);
  if (data.guests) details.push(`<strong>Ospiti:</strong> ${data.guests}`);
  if (data.eventType) details.push(`<strong>Tipo Evento:</strong> ${data.eventType}`);
  if (data.eventGuests) details.push(`<strong>Invitati:</strong> ${data.eventGuests}`);
  if (data.orderNumber) details.push(`<strong>Ordine:</strong> #${data.orderNumber}`);
  if (data.pickupTime) details.push(`<strong>Ritiro:</strong> ${data.pickupTime}`);
  if (data.locationCode) details.push(`<strong>Postazione:</strong> ${data.locationCode}`);
  if (data.totalAmount) details.push(`<strong>Totale:</strong> €${Number(data.totalAmount).toFixed(2)}`);

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:'Helvetica Neue',Arial,sans-serif;background:#FAF9F6;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="font-family:Georgia,serif;color:#8B1D23;font-size:28px;margin:0;">Riva Beach</h1>
      <p style="color:#C5A059;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:4px 0 0;">Salento</p>
    </div>
    <div style="background:#fff;border-radius:16px;padding:32px;border:1px solid rgba(197,160,89,0.15);box-shadow:0 2px 12px rgba(0,0,0,0.04);">
      <h2 style="font-family:Georgia,serif;color:#8B1D23;font-size:22px;margin:0 0 8px;font-style:italic;">Prenotazione Confermata</h2>
      <p style="color:#666;font-size:13px;margin:0 0 24px;">Grazie, ${data.customerName}!</p>
      <div style="background:#FAF9F6;border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="color:#C5A059;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-weight:700;margin:0 0 12px;">${serviceName}</p>
        ${details.map(d => `<p style="color:#1A1A1A;font-size:14px;margin:6px 0;">${d}</p>`).join("")}
      </div>
      <p style="color:#999;font-size:12px;line-height:1.6;margin:0;">
        La tua prenotazione è stata ricevuta con successo. Riceverai aggiornamenti sullo stato della prenotazione.
      </p>
    </div>
    <p style="text-align:center;color:#C5A059;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-top:24px;">
      Riva Beach · Punta Prosciutto · Salento
    </p>
  </div>
</body>
</html>`;
}

// ─── Send functions ─────────────────────────────────────────────────────────

export async function sendBookingConfirmation(bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { customer: true },
    });

    if (!booking) return;

    const html = bookingConfirmationHtml({
      customerName: booking.customer.name,
      serviceType: booking.serviceType,
      date: booking.date?.toISOString(),
      timeSlot: booking.timeSlot ?? undefined,
      guests: booking.guests ?? undefined,
      orderNumber: booking.orderNumber ?? undefined,
      totalAmount: booking.totalAmount?.toString(),
      eventType: booking.eventType ?? undefined,
      eventGuests: booking.eventGuests ?? undefined,
      pickupTime: booking.pickupTime ?? undefined,
      locationCode: booking.locationCode ?? undefined,
    });

    const subject = `Conferma Prenotazione – ${SERVICE_NAMES[booking.serviceType] || booking.serviceType}`;

    if (transporter) {
      await transporter.sendMail({
        from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
        to: booking.customer.email,
        subject,
        html,
      });

      await prisma.notificationLog.create({
        data: {
          bookingId,
          channel: "EMAIL",
          type: "BOOKING_CONFIRMATION",
          recipient: booking.customer.email,
          subject,
          body: html,
          status: "SENT",
          sentAt: new Date(),
        },
      });

      console.log(`📧 Confirmation email sent to ${booking.customer.email}`);
    } else {
      // Dev mode: log and save as pending
      await prisma.notificationLog.create({
        data: {
          bookingId,
          channel: "EMAIL",
          type: "BOOKING_CONFIRMATION",
          recipient: booking.customer.email,
          subject,
          body: html,
          status: "PENDING",
        },
      });

      console.log(`📧 [DEV] Email queued for ${booking.customer.email} (SMTP not configured)`);
    }
  } catch (err) {
    console.error("Email send error:", err);

    // Log the failure
    try {
      await prisma.notificationLog.create({
        data: {
          bookingId,
          channel: "EMAIL",
          type: "BOOKING_CONFIRMATION",
          recipient: "unknown",
          status: "FAILED",
          error: String(err),
        },
      });
    } catch {
      // ignore logging failure
    }
  }
}

export async function sendStatusUpdateEmail(bookingId: string, newStatus: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { customer: true },
    });

    if (!booking) return;

    const serviceName = SERVICE_NAMES[booking.serviceType] || booking.serviceType;
    const statusLabels: Record<string, string> = {
      CONFIRMED: "Confermata",
      COMPLETED: "Completata",
      CANCELLED: "Cancellata",
    };
    const statusLabel = statusLabels[newStatus] || newStatus;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:'Helvetica Neue',Arial,sans-serif;background:#FAF9F6;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="font-family:Georgia,serif;color:#8B1D23;font-size:28px;margin:0;">Riva Beach</h1>
      <p style="color:#C5A059;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:4px 0 0;">Salento</p>
    </div>
    <div style="background:#fff;border-radius:16px;padding:32px;border:1px solid rgba(197,160,89,0.15);box-shadow:0 2px 12px rgba(0,0,0,0.04);">
      <h2 style="font-family:Georgia,serif;color:#8B1D23;font-size:22px;margin:0 0 8px;font-style:italic;">Aggiornamento Prenotazione</h2>
      <p style="color:#666;font-size:13px;margin:0 0 24px;">Ciao ${booking.customer.name},</p>
      <div style="background:#FAF9F6;border-radius:12px;padding:20px;text-align:center;">
        <p style="color:#C5A059;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-weight:700;margin:0 0 8px;">${serviceName}</p>
        <p style="font-family:Georgia,serif;color:#1A1A1A;font-size:20px;font-weight:700;margin:0;">Stato: ${statusLabel}</p>
      </div>
      ${newStatus === "CANCELLED" ? `<p style="color:#999;font-size:12px;line-height:1.6;margin:16px 0 0;">Se hai domande sulla cancellazione, contattaci direttamente.</p>` : ""}
    </div>
    <p style="text-align:center;color:#C5A059;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-top:24px;">
      Riva Beach · Punta Prosciutto · Salento
    </p>
  </div>
</body>
</html>`;

    const subject = `${serviceName} – Prenotazione ${statusLabel}`;

    if (transporter) {
      await transporter.sendMail({
        from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
        to: booking.customer.email,
        subject,
        html,
      });

      await prisma.notificationLog.create({
        data: {
          bookingId,
          channel: "EMAIL",
          type: newStatus === "CANCELLED" ? "BOOKING_CANCELLATION" : "BOOKING_CONFIRMATION",
          recipient: booking.customer.email,
          subject,
          body: html,
          status: "SENT",
          sentAt: new Date(),
        },
      });

      console.log(`📧 Status update email sent to ${booking.customer.email}`);
    } else {
      await prisma.notificationLog.create({
        data: {
          bookingId,
          channel: "EMAIL",
          type: newStatus === "CANCELLED" ? "BOOKING_CANCELLATION" : "BOOKING_CONFIRMATION",
          recipient: booking.customer.email,
          subject,
          body: html,
          status: "PENDING",
        },
      });

      console.log(`📧 [DEV] Status update email queued for ${booking.customer.email}`);
    }
  } catch (err) {
    console.error("Status email error:", err);
  }
}
