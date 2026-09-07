/**
 * Ember & Clay — WhatsApp booking backend (optional, advanced)
 * ---------------------------------------------------------------
 * This is the "real automation" layer for clients who outgrow the
 * simple wa.me click-to-chat flow on the website. It uses Twilio's
 * WhatsApp API to:
 *
 *   1. Accept bookings from the website form (POST /api/bookings)
 *      and send the guest an instant WhatsApp confirmation.
 *   2. Listen for incoming WhatsApp messages (POST /webhook/whatsapp)
 *      and run a tiny conversational flow so a guest can book a
 *      table by just messaging the restaurant's WhatsApp number
 *      directly — no website needed.
 *
 * Requires a Twilio account with WhatsApp enabled (sandbox for
 * testing, a Twilio-hosted or BYO WhatsApp Business number for
 * production). See README.md in this folder for full setup.
 */

const express = require("express");
const bodyParser = require("body-parser");
const twilio = require("twilio");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_WHATSAPP_NUMBER, // e.g. "whatsapp:+14155238886"
  RESTAURANT_NAME = "Ember & Clay",
  RESTAURANT_WHATSAPP_ADMIN, // e.g. "whatsapp:+919800000010" — where staff get notified
  PORT = 3000,
} = process.env;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
  console.warn(
    "[warn] Twilio env vars are missing. Copy .env.example to .env and fill them in before going live."
  );
}

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const DB_FILE = path.join(__dirname, "bookings.json");
function readBookings() {
  if (!fs.existsSync(DB_FILE)) return [];
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}
function saveBooking(entry) {
  const bookings = readBookings();
  bookings.push(entry);
  fs.writeFileSync(DB_FILE, JSON.stringify(bookings, null, 2));
}

function toWhatsApp(number) {
  const digits = number.replace(/[^\d+]/g, "");
  return digits.startsWith("whatsapp:") ? digits : `whatsapp:${digits.startsWith("+") ? digits : "+" + digits}`;
}

// ---------------------------------------------------------------
// 1. Website form -> instant WhatsApp confirmation to the guest
// ---------------------------------------------------------------
app.post("/api/bookings", async (req, res) => {
  const { name, phone, date, time, guests, occasion, notes } = req.body;

  if (!name || !phone || !date || !time || !guests) {
    return res.status(400).json({ ok: false, error: "Missing required booking fields." });
  }

  const booking = {
    id: Date.now().toString(36),
    name,
    phone,
    date,
    time,
    guests,
    occasion: occasion || null,
    notes: notes || null,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  saveBooking(booking);

  const guestMessage =
    `Hi ${name}! Thanks for booking a table at ${RESTAURANT_NAME}.\n\n` +
    `Date: ${date}\nTime: ${time}\nGuests: ${guests}\n` +
    (occasion ? `Occasion: ${occasion}\n` : "") +
    `\nWe'll confirm shortly. Reply here any time if plans change.`;

  try {
    await client.messages.create({
      from: TWILIO_WHATSAPP_NUMBER,
      to: toWhatsApp(phone),
      body: guestMessage,
    });

    if (RESTAURANT_WHATSAPP_ADMIN) {
      await client.messages.create({
        from: TWILIO_WHATSAPP_NUMBER,
        to: toWhatsApp(RESTAURANT_WHATSAPP_ADMIN),
        body: `New booking (${booking.id}): ${name}, ${guests} guests, ${date} ${time}. Phone: ${phone}.`,
      });
    }

    res.json({ ok: true, bookingId: booking.id });
  } catch (err) {
    console.error("Twilio send failed:", err.message);
    res.status(502).json({ ok: false, error: "Could not send WhatsApp confirmation." });
  }
});

// ---------------------------------------------------------------
// 2. Incoming WhatsApp messages -> a tiny booking conversation
//    Point your Twilio WhatsApp sender's "when a message comes in"
//    webhook at POST https://your-domain.com/webhook/whatsapp
// ---------------------------------------------------------------
const sessions = new Map(); // phone -> { step, data }

function startSession(phone) {
  const session = { step: "ask_date", data: {} };
  sessions.set(phone, session);
  return session;
}

app.post("/webhook/whatsapp", (req, res) => {
  const from = req.body.From; // "whatsapp:+91..."
  const body = (req.body.Body || "").trim();
  const twiml = new twilio.twiml.MessagingResponse();

  let session = sessions.get(from);
  const lower = body.toLowerCase();

  if (!session || lower === "book" || lower === "start") {
    session = startSession(from);
    twiml.message(
      `Hi! Let's book your table at ${RESTAURANT_NAME}. What date would you like? (e.g. 20 Sept)`
    );
    return res.type("text/xml").send(twiml.toString());
  }

  switch (session.step) {
    case "ask_date":
      session.data.date = body;
      session.step = "ask_time";
      twiml.message("Great — what time?");
      break;

    case "ask_time":
      session.data.time = body;
      session.step = "ask_guests";
      twiml.message("How many guests?");
      break;

    case "ask_guests":
      session.data.guests = body;
      session.step = "ask_name";
      twiml.message("And the name for the reservation?");
      break;

    case "ask_name":
      session.data.name = body;
      session.step = "done";
      saveBooking({
        id: Date.now().toString(36),
        name: session.data.name,
        phone: from.replace("whatsapp:", ""),
        date: session.data.date,
        time: session.data.time,
        guests: session.data.guests,
        status: "pending",
        source: "whatsapp-chat",
        createdAt: new Date().toISOString(),
      });
      twiml.message(
        `Thanks ${session.data.name}! Booked for ${session.data.guests} on ${session.data.date} at ${session.data.time}. ` +
          `We'll confirm shortly. Reply "book" any time to make another reservation.`
      );
      if (RESTAURANT_WHATSAPP_ADMIN) {
        client.messages
          .create({
            from: TWILIO_WHATSAPP_NUMBER,
            to: toWhatsApp(RESTAURANT_WHATSAPP_ADMIN),
            body: `New WhatsApp booking: ${session.data.name}, ${session.data.guests} guests, ${session.data.date} ${session.data.time}.`,
          })
          .catch((e) => console.error("Admin notify failed:", e.message));
      }
      sessions.delete(from);
      break;

    default:
      twiml.message('Reply "book" to start a new reservation.');
  }

  res.type("text/xml").send(twiml.toString());
});

app.get("/api/bookings", (req, res) => {
  res.json(readBookings());
});

app.listen(PORT, () => {
  console.log(`Ember & Clay WhatsApp backend running on port ${PORT}`);
});
