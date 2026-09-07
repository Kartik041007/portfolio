# Ember & Clay — WhatsApp Backend (optional, advanced automation)

The website itself already "automates" booking with a zero-setup trick: the
reservation form builds a WhatsApp message and opens `wa.me` with it
pre-filled, so the guest just taps **Send**. That needs no server, no API
keys, and works today.

This folder is the **next tier up**, for a client who wants real two-way
automation:

- Instant auto-confirmation sent back to the guest the moment they book.
- Staff get pinged on WhatsApp for every new booking.
- Guests can book by messaging the restaurant's WhatsApp number directly,
  with the bot walking them through date → time → guests → name.

It uses [Twilio's WhatsApp API](https://www.twilio.com/docs/whatsapp).

## 1. Get a Twilio WhatsApp sender

1. Create a free Twilio account at twilio.com.
2. In the console, open **Messaging → Try it out → Send a WhatsApp message**
   to activate the **sandbox** number for testing (instant, no approval).
3. For production, apply for a WhatsApp Business sender through Twilio —
   this needs Meta Business verification and takes a few days. Until then,
   the sandbox is fine for demos and testing.

## 2. Configure

```bash
cp .env.example .env
# then edit .env with your Account SID, Auth Token, and numbers
```

## 3. Install and run

```bash
npm install
npm start
```

The server starts on `http://localhost:3000` (or your `PORT`).

## 4. Point Twilio at your webhook

For incoming messages (the "book by chatting" flow), your server needs a
public URL. For local testing, use a tunnel:

```bash
npx ngrok http 3000
```

Then in the Twilio console, under your WhatsApp sender's settings, set
**"When a message comes in"** to:

```
https://YOUR-NGROK-OR-DOMAIN/webhook/whatsapp
```

## 5. Wire up the website form (optional)

Right now the website's `script.js` opens `wa.me` directly — that already
works without this backend. If you'd rather route bookings through this
server instead (e.g. to also log them and auto-reply), change the form
submit handler in `script.js` to `POST` to `/api/bookings` with the same
fields, instead of building the `wa.me` URL.

## Endpoints

| Method | Path                  | Purpose                                      |
|--------|-----------------------|-----------------------------------------------|
| POST   | `/api/bookings`       | Create a booking, auto-confirm on WhatsApp   |
| GET    | `/api/bookings`       | List saved bookings (demo storage, JSON file)|
| POST   | `/webhook/whatsapp`   | Twilio inbound-message webhook               |

## Notes for production

- Swap the `bookings.json` file for a real database (Postgres, etc.).
- Add basic auth or a signature check on `/api/bookings` if it's public.
- Twilio signs inbound webhook requests — validate with
  `twilio.validateRequest()` before trusting `/webhook/whatsapp` payloads.
- WhatsApp Business API pricing is per conversation — check Twilio's
  current WhatsApp pricing before estimating costs for a client.
