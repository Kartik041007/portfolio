// ============================================================
// CONFIG — edit these for the real studio
// ============================================================
const CONFIG = {
  // WhatsApp number in international format, digits only, no + or spaces.
  // Example: for +91 98000 00010 use "919800000010"
  // PLACEHOLDER BELOW — replace with Ori Studio's real WhatsApp number.
  studioWhatsApp: "919800000010",
  studioName: "Ori Studio",
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
    `Hi ${CONFIG.studioName}, I'd like to book a slot.`,
    ``,
    `Name: ${data.name || "—"}`,
    `Phone: ${data.phone || "—"}`,
    `Service: ${data.service || "—"}`,
    `Date: ${formatDate(data.date)}`,
    `Time: ${formatTime(data.time)}`,
  ];
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
    service: form.service.value,
    notes: form.notes.value.trim(),
  };
}

function updatePreview() {
  const data = getFormData();
  const serviceLabel = data.service || "a service";
  previewText.innerHTML =
    `Hi ${CONFIG.studioName}, I'd like to book <strong>${serviceLabel}</strong> on ` +
    `<strong>${formatDate(data.date)}</strong> at <strong>${formatTime(data.time)}</strong>. ` +
    `Name: <strong>${data.name || "—"}</strong>.`;
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
  const url = `https://wa.me/${CONFIG.studioWhatsApp}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener");
});

// ============================================================
// Footer quick-chat button — general enquiry message
// ============================================================
const footerBtn = document.getElementById("footerWhatsapp");
if (footerBtn) {
  footerBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const message = `Hi ${CONFIG.studioName}, I'd like to ask about booking a slot.`;
    const url = `https://wa.me/${CONFIG.studioWhatsApp}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener");
  });
}
