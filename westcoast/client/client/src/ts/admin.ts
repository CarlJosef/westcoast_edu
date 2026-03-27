type Course = {
  id: number | string;
  title: string;
  courseNumber: string;
  days: number;
  priceSek: number;
};

type Booking = {
  id: number | string;
  courseId: number | string;
  customerId: number | string;
  deliveryMode: string;
  date: string;
  createdAt: string;
};

type Customer = {
  id: number | string;
  email: string;
  name: string;
  billingAddress: string;
  mobile: string;
};

const BASE_URL = "http://localhost:3001";

function byId<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el as T;
}

async function httpGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

async function httpPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

function escapeHtml(value: unknown): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function loadCourses(): Promise<Course[]> {
  return httpGet<Course[]>("/courses");
}

function renderCustomerRow(customer: Customer, booking: Booking): string {
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

async function loadBookingsForCourse(courseId: string): Promise<Booking[]> {
  return httpGet<Booking[]>(`/bookings?courseId=${encodeURIComponent(courseId)}`);
}

async function loadCustomer(customerId: string): Promise<Customer> {
  return httpGet<Customer>(`/customers/${encodeURIComponent(customerId)}`);
}

async function refreshBookingList(): Promise<void> {
  const select = byId<HTMLSelectElement>("courseSelect");
  const list = byId<HTMLDivElement>("bookingsList");
  const status = byId<HTMLParagraphElement>("status");

  list.innerHTML = "";
  status.textContent = "Laddar bokningar...";

  const courseId = select.value;
  const bookings = await loadBookingsForCourse(courseId);

  if (!bookings.length) {
    status.textContent = "Inga bokningar för vald kurs.";
    return;
  }

  const customers = await Promise.all(bookings.map(b => loadCustomer(String(b.customerId))));
  const html = bookings.map((b, i) => renderCustomerRow(customers[i], b)).join("");
  list.innerHTML = html;
  status.textContent = "";
}

async function init(): Promise<void> {
  const select = byId<HTMLSelectElement>("courseSelect");
  const form = byId<HTMLFormElement>("createCourseForm");
  const createMsg = byId<HTMLParagraphElement>("createMsg");

  const courses = await loadCourses();

  select.innerHTML = courses
    .map(c => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.title)} (${escapeHtml(c.courseNumber)})</option>`)
    .join("");

  select.addEventListener("change", () => {
    refreshBookingList().catch(err => {
      console.error(err);
      byId<HTMLParagraphElement>("status").textContent = "Kunde inte hämta bokningar.";
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    createMsg.textContent = "";

    const title = (byId<HTMLInputElement>("title").value || "").trim();
    const courseNumber = (byId<HTMLInputElement>("courseNumber").value || "").trim();
    const days = Number(byId<HTMLInputElement>("days").value);
    const priceSek = Number(byId<HTMLInputElement>("priceSek").value);

    try {
      const created = await httpPost<Course>("/courses", { title, courseNumber, days, priceSek });
      createMsg.textContent = `Skapad: ${created.title}`;
      // reload list
      const updated = await loadCourses();
      select.innerHTML = updated
        .map(c => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.title)} (${escapeHtml(c.courseNumber)})</option>`)
        .join("");
    } catch (err) {
      console.error(err);
      createMsg.textContent = "Kunde inte skapa kurs.";
    }
  });

  await refreshBookingList();
}

init().catch(err => {
  console.error(err);
  const status = document.getElementById("status");
  if (status) status.textContent = "Admin kunde inte initiera. Är API:t igång?";
});
