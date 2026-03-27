const BASE_URL = "http://localhost:3001";

function byId(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el;
}

async function httpGet(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

async function httpPost(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function loadCourses() {
  return httpGet("/courses");
}

async function loadBookingsForCourse(courseId) {
  return httpGet(`/bookings?courseId_like=${encodeURIComponent(courseId)}`);
}

async function loadCustomer(customerId) {
  try {
    return await httpGet(`/customers/${encodeURIComponent(customerId)}`);
  } catch (err) {
    // Customer might have been deleted or not created in this db
    return {
      id: String(customerId),
      email: "(saknas)",
      name: "Okänd kund",
      billingAddress: "",
      mobile: "",
    };
  }
}

function renderCustomerRow(customer, booking) {
  return `
    <div class="card" style="border-radius:12px;">
      <div class="content">
        <div class="title">${escapeHtml(customer.name || "(saknar namn)")} <span class="muted">(${escapeHtml(customer.email)})</span></div>
        <div class="muted">Mobil: ${escapeHtml(customer.mobile)} • Adress: ${escapeHtml(customer.billingAddress)}</div>
        <div class="muted">Bokning: ${escapeHtml(booking.deliveryMode)} • Datum: ${escapeHtml(booking.date)}</div>
      </div>
    </div>
  `;
}

async function refreshBookingList() {
  const select = byId("courseSelect");
  const list = byId("bookingsList");
  const status = byId("status");

  list.innerHTML = "";
  status.textContent = "Laddar bokningar...";

  const courseId = select.value;
  const bookings = await loadBookingsForCourseLocal(courseId);

  if (!bookings.length) {
    status.textContent = "Inga bokningar för vald kurs.";
    return;
  }

  const customers = await Promise.all(
    bookings.map((b) => loadCustomer(String(b.customerId))),
  );
  list.innerHTML = bookings
    .map((b, i) => renderCustomerRow(customers[i], b))
    .join("");
  status.textContent = "";
}

async function init() {
  const select = byId("courseSelect");
  const form = byId("createCourseForm");
  const createMsg = byId("createMsg");

  const courses = await loadCourses();

  select.innerHTML = courses
    .map(
      (c) =>
        `<option value="${escapeHtml(c.id)}">${escapeHtml(c.title)} (${escapeHtml(c.courseNumber)})</option>`,
    )
    .join("");

  select.addEventListener("change", () => {
    refreshBookingList().catch((err) => {
      console.error(err);
      byId("status").textContent = "Kunde inte hämta bokningar.";
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    createMsg.textContent = "";

    const title = (byId("title").value || "").trim();
    const courseNumber = (byId("courseNumber").value || "").trim();
    const days = Number(byId("days").value);
    const priceSek = Number(byId("priceSek").value);

    try {
      const created = await httpPost("/courses", {
        title,
        courseNumber,
        days,
        priceSek,
      });
      createMsg.textContent = `Skapad: ${created.title}`;

      const updated = await loadCourses();
      select.innerHTML = updated
        .map(
          (c) =>
            `<option value="${escapeHtml(c.id)}">${escapeHtml(c.title)} (${escapeHtml(c.courseNumber)})</option>`,
        )
        .join("");
    } catch (err) {
      console.error(err);
      createMsg.textContent = "Kunde inte skapa kurs.";
    }
  });

  await refreshBookingList();
}

init().catch((err) => {
  console.error(err);
  const status = document.getElementById("status");
  if (status) status.textContent = "Admin kunde inte initiera. Är API:t igång?";
});

async function loadBookingsForCourseLocal(courseId) {
  const all = await httpGet("/bookings");
  const wanted = String(courseId);
  return all.filter((b) => String(b.courseId) === wanted);
}
