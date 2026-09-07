// ============================================================
// CONFIG — edit these two lines for your own restaurant
// ============================================================
const CONFIG = {
  // WhatsApp number in international format, digits only, no + or spaces.
  // Example: for +91 98000 00010 use "919800000010"
  restaurantWhatsApp: "919800000010",
  restaurantName: "Ember & Clay",
};

// ============================================================
// Header: solid background after scrolling past the hero
// ============================================================
const header = document.getElementById("siteHeader");
const onScroll = () => {
  header.classList.toggle("scrolled", window.scrollY > 40);
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// ============================================================
// Booking form -> WhatsApp automation
// Builds a formatted message from the form fields and opens
// wa.me with the text pre-filled, so the guest just taps Send.
// No backend, no API keys, works the moment the page loads.
// ============================================================
const form = document.getElementById("bookingForm");
const previewText = document.getElementById("previewText");

function formatDate(value) {
  if (!value) return "your chosen date";
  const d = new Date(value + "T00:00:00");
  if (isNaN(d)) return value;
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function formatTime(value) {
  if (!value) return "your chosen time";
  const [h, m] = value.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m);
  return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
}

function buildMessage(data) {
  const lines = [
    `Hi ${CONFIG.restaurantName}, I'd like to book a table.`,
    ``,
    `Name: ${data.name || "—"}`,
    `Phone: ${data.phone || "—"}`,
    `Date: ${formatDate(data.date)}`,
    `Time: ${formatTime(data.time)}`,
    `Guests: ${data.guests || "—"}`,
  ];
  if (data.occasion) lines.push(`Occasion: ${data.occasion}`);
  if (data.notes) lines.push(`Notes: ${data.notes}`);
  lines.push(``, `Please confirm availability. Thank you!`);
  return lines.join("\n");
}

function getFormData() {
  return {
    name: form.name.value.trim(),
    phone: form.phone.value.trim(),
    date: form.date.value,
    time: form.time.value,
    guests: form.guests.value,
    occasion: form.occasion.value.trim(),
    notes: form.notes.value.trim(),
  };
}

function updatePreview() {
  const data = getFormData();
  const guestLabel = data.guests ? data.guests : "2";
  previewText.innerHTML =
    `Hi ${CONFIG.restaurantName}, I'd like to book a table for ` +
    `<strong>${guestLabel}</strong> on <strong>${formatDate(data.date)}</strong> ` +
    `at <strong>${formatTime(data.time)}</strong>. Name: <strong>${data.name || "—"}</strong>.`;
}

form.addEventListener("input", updatePreview);
updatePreview();

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  const data = getFormData();
  const message = buildMessage(data);
  const url = `https://wa.me/${CONFIG.restaurantWhatsApp}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener");
});

// ============================================================
// Header / footer quick-chat buttons — general enquiry message
// ============================================================
function generalChatUrl() {
  const message = `Hi ${CONFIG.restaurantName}, I'd like to ask about a table booking.`;
  return `https://wa.me/${CONFIG.restaurantWhatsApp}?text=${encodeURIComponent(message)}`;
}

const footerBtn = document.getElementById("footerWhatsapp");
if (footerBtn) {
  footerBtn.addEventListener("click", (e) => {
    e.preventDefault();
    window.open(generalChatUrl(), "_blank", "noopener");
  });
}
