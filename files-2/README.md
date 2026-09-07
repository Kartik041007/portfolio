# Ori Studio — Salon Website + WhatsApp Booking Automation

A site built from Ori Studio's real Google Business listing (Deen Dayal
Nagar, Gwalior — 4.8★, 311 reviews), with a working WhatsApp booking
system. No backend needed for the core flow.

## What's inside

```
ori-studio-salon/
├── index.html              Website (hero, services, bridal, gallery, reviews, booking)
├── style.css                 Styling — blush/plum/gold palette, Cormorant Garamond + Work Sans
├── script.js                  WhatsApp booking automation (client-side, no server)
└── whatsapp-backend/          Optional: Twilio-powered two-way automation
    ├── server.js
    ├── package.json
    ├── .env.example
    └── README.md
```

## How the booking automation works (no setup needed)

When a client fills in the booking form and taps **Send request on
WhatsApp**, JavaScript formats their name, phone, service, date and time
into a message and opens `https://wa.me/<studio-number>?text=...` —
WhatsApp opens with it pre-filled, ready to send. The preview panel next
to the form shows exactly what will be sent.

### Before this goes live for the real studio

Open `script.js` and set the real WhatsApp number:

```js
const CONFIG = {
  studioWhatsApp: "919800000010", // replace with Ori Studio's real number
  studioName: "Ori Studio",
};
```

The number currently in there is a **placeholder** — it is not a real
number for this business.

## What came from the real listing, and what's placeholder

Pulled directly from the Google listing you shared:
- Name, address (Patel Plaza, Pinto Park Rd, above Burger Buddy, Deen
  Dayal Nagar, Gwalior), and the 4.8★ / 311-review rating.
- The service list, grouped into six categories instead of the raw
  (heavily SEO-repeated) list from the listing.
- Three review blurbs, paraphrased from the themes in the real reviews
  (product range, brow service, bridal accuracy) rather than quoted
  verbatim.

Still placeholder, and worth confirming before this goes to the client:
- **WhatsApp number** — no phone number was in the data you pasted.
- **Opening hours** — the listing only showed "Closes 8pm"; I've set
  10am–8pm daily as a reasonable placeholder. Confirm the real hours
  and opening time.
- **Bridal package pricing/details** — not in the listing, so the bridal
  section describes the process rather than quoting prices.

## Going further: real two-way automation

For auto-replies, staff notifications, or letting clients book by
messaging the WhatsApp number directly (no website visit), see
`whatsapp-backend/README.md` — it uses the Twilio WhatsApp API.

## Running it locally

It's static — open `index.html` directly, or serve it:

```bash
npx serve .
```
