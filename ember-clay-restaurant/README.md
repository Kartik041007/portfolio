# Ember & Clay — Restaurant Website + WhatsApp Booking Automation

A portfolio-ready restaurant site with a working WhatsApp reservation
system built in. No backend is required for the core booking flow — it
works the moment you open `index.html`.

## What's inside

```
ember-clay-restaurant/
├── index.html              Website (hero, menu, story, gallery, reservations)
├── style.css                All styling — charcoal/ember palette, Fraunces + Inter
├── script.js                 WhatsApp booking automation (client-side, no server)
└── whatsapp-backend/         Optional: Twilio-powered two-way automation
    ├── server.js
    ├── package.json
    ├── .env.example
    └── README.md
```

## How the WhatsApp automation works (no setup needed)

The reservation form on the site doesn't submit to a server. When a guest
fills it in and taps **Send booking on WhatsApp**, JavaScript:

1. Reads the name, phone, date, time, guests, occasion, and notes.
2. Formats them into a clean message.
3. Opens `https://wa.me/<restaurant-number>?text=<the message>` —
   WhatsApp opens (app or web) with the message already typed into the
   chat with the restaurant. The guest just taps send.

This is the same trick used by most real restaurant sites for WhatsApp
bookings — it's instant, free, and needs no API keys or backend. The
live preview panel next to the form shows exactly what will be sent
before the guest clicks anything.

### To make this live for a real client

Open `script.js` and edit the two lines at the top:

```js
const CONFIG = {
  restaurantWhatsApp: "919800000010", // their number, country code + number, no + or spaces
  restaurantName: "Ember & Clay",
};
```

Everything else — copy, menu, prices, address — is plain text in
`index.html`; there's no build step or dependency to install.

## Going further: real two-way automation

If a client wants the bot to also **auto-reply** to guests, notify staff
instantly, or let people book by messaging the WhatsApp number directly
(no website visit at all), use the optional backend in
`whatsapp-backend/`. It uses the Twilio WhatsApp API. Full setup steps
are in `whatsapp-backend/README.md`.

## Customizing the design

- **Colors, type, spacing:** all in `style.css` under `:root` at the top —
  change the CSS variables once and it updates everywhere.
- **Menu / prices:** plain HTML lists in `index.html`, inside `#menu`.
- **Copy:** every section is readable HTML — no CMS, no placeholders to
  decode.
- **Logo / name:** search-and-replace "Ember & Clay" across the three
  files.

## Running it locally

It's static — just open `index.html` in a browser, or serve it:

```bash
npx serve .
```

## Browser support

Built with standard CSS Grid, Flexbox, and vanilla JS — works in all
current browsers. Respects `prefers-reduced-motion` and keeps visible
focus states for keyboard users.
