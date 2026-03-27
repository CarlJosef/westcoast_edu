const BASE_URL = "http://localhost:3001";

function getCourseIdFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  return id ? String(id) : null;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function modeBadge(mode) {
  const safe = escapeHtml(mode);
  return `<span class="badge">${safe}</span>`;
}

async function getCourseById(id) {
  const res = await fetch(`${BASE_URL}/courses/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(`GET /courses/${id} failed: ${res.status}`);
  return res.json();
}

async function init() {
  const status = document.querySelector("#status");
  const titleEl = document.querySelector("#title");
  const metaEl = document.querySelector("#meta");
  const imgEl = document.querySelector("#image");
  const modesEl = document.querySelector("#modes");
  const startEl = document.querySelector("#startDate");
  const priceEl = document.querySelector("#price");
  const bookLink = document.querySelector("#bookLink");

  const id = getCourseIdFromQuery();
  if (!id) {
    status.textContent = "Saknar id i URL (ex: course.html?id=1).";
    return;
  }

  status.textContent = "Laddar kurs...";
  try {
    const c = await getCourseById(id);

    titleEl.textContent = c.title ?? "Kurs";
    metaEl.textContent = `${c.courseNumber ?? ""} • ${c.days ?? ""} dagar`.trim();

    imgEl.src = c.imageUrl ?? "";
    imgEl.alt = c.title ?? "Kurs";

    const modes = Array.isArray(c.deliveryModes) ? c.deliveryModes : [];
    modesEl.innerHTML = modes.map(modeBadge).join("");

    startEl.textContent = `Start: ${c.plannedStartDate ?? "-"}`;
    priceEl.textContent = `Pris: ${c.priceSek ?? "-"} SEK`;

    bookLink.href = `./book.html?courseId=${encodeURIComponent(c.id)}`;

    status.textContent = "";
  } catch (err) {
    console.error(err);
    status.textContent = "Kunde inte hämta kurs. Är API:t igång och finns id?";
  }
}

init();
