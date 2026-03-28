const BASE_URL = "http://localhost:3001";
const LS_USER_ID = "westcoast.userId";
const DEMO_EMAIL = "demo@westcoast.se";
const DEMO_PASSWORD = "demo123"; // Lösenord för demo-kontot (för snabbtestning)
const DEMO_NAME = "Bo Bov";

function qs(id) {
  return document.querySelector(id);
}

function getCourseIdFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const courseId = params.get("courseId");
  return courseId ? String(courseId) : null;
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

async function findCustomerByEmail(email) {
  const customers = await httpGet(
    `/customers?email=${encodeURIComponent(email)}`,
  );
  return customers[0] ?? null;
}

async function getCustomerById(id) {
  return httpGet(`/customers/${encodeURIComponent(id)}`);
}

function setLoggedInUserId(idOrNull) {
  if (idOrNull) localStorage.setItem(LS_USER_ID, String(idOrNull));
  else localStorage.removeItem(LS_USER_ID);
}

function getLoggedInUserId() {
  return localStorage.getItem(LS_USER_ID);
}

function prefillDemoAuthInputs() {
  const regEmail = qs("#regEmail");
  const regPassword = qs("#regPassword");
  const loginEmail = qs("#loginEmail");
  const loginPassword = qs("#loginPassword");

  if (regEmail) regEmail.value = DEMO_EMAIL;
  if (loginEmail) loginEmail.value = DEMO_EMAIL;

  if (regPassword) {
    regPassword.value = DEMO_PASSWORD;
    regPassword.readOnly = true;
  }
  if (loginPassword) {
    loginPassword.value = DEMO_PASSWORD;
    loginPassword.readOnly = true;
  }
}

function setAuthUiState(isLoggedIn, emailText = "") {
  const logoutBtn = qs("#logoutBtn");
  const authStatus = qs("#authStatus");

  if (logoutBtn) logoutBtn.style.display = isLoggedIn ? "inline-block" : "none";
  if (authStatus) {
    authStatus.textContent = isLoggedIn
      ? `Inloggad som: ${emailText}`
      : "Inte inloggad.";
  }
}

function showPanel(panel) {
  const pRegister = qs("#panelRegister");
  const pLogin = qs("#panelLogin");
  const pBooking = qs("#panelBooking");
  const lockedMsg = qs("#bookingLockedMsg");

  if (pRegister)
    pRegister.style.display = panel === "register" ? "block" : "none";
  if (pLogin) pLogin.style.display = panel === "login" ? "block" : "none";
  if (pBooking) pBooking.style.display = panel === "booking" ? "block" : "none";
  if (lockedMsg)
    lockedMsg.style.display = panel === "booking" ? "none" : "block";
}

function fillDeliveryModes(modes) {
  const select = qs("#deliveryMode");
  select.innerHTML = "";
  for (const m of modes) {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    select.appendChild(opt);
  }
}

async function init() {
  const status = qs("#status");
  status.textContent = "Laddar...";
  prefillDemoAuthInputs();

  const courseId = getCourseIdFromQuery();
  if (!courseId) {
    status.textContent = "Saknar courseId i URL (ex: book.html?courseId=1).";
    return;
  }

  const course = await httpGet(`/courses/${encodeURIComponent(courseId)}`);
  qs("#courseTitle").textContent = `${course.title} (${course.courseNumber})`;

  const modes = Array.isArray(course.deliveryModes)
    ? course.deliveryModes
    : typeof course.deliveryModes === "string" && course.deliveryModes.trim()
      ? [course.deliveryModes.trim()]
      : ["distance"];

  fillDeliveryModes(modes);

  qs("#plannedDate").value = course.plannedStartDate ?? "";
  qs("#plannedDate").readOnly = true;

  // Panel buttons (new UI)
  qs("#btnShowRegister")?.addEventListener("click", () => {
    qs("#authMsg").textContent = "";
    showPanel("register");
  });

  qs("#btnShowLogin")?.addEventListener("click", () => {
    qs("#authMsg").textContent = "";
    showPanel("login");
  });

  qs("#btnShowBooking")?.addEventListener("click", () => {
    qs("#authMsg").textContent = "";
    const uid = getLoggedInUserId();
    if (!uid) {
      qs("#authMsg").textContent = "Logga in eller skapa konto innan bokning.";
      showPanel("login");
      return;
    }
    showPanel("booking");
  });

  // Auth init
  const userId = getLoggedInUserId();
  if (userId) {
    try {
      const customer = await getCustomerById(userId);
      setAuthUiState(true, customer.email);

      showPanel("booking");

      qs("#customerName").value =
        customer.name && customer.name.trim() ? customer.name : DEMO_NAME;
      qs("#billingAddress").value = customer.billingAddress ?? "";
      qs("#customerEmail").value = customer.email ?? DEMO_EMAIL;
      qs("#mobile").value = customer.mobile ?? "";
    } catch {
      // Stored user id is stale (customer deleted) --> reset session
      setLoggedInUserId(null);
      setAuthUiState(false);
      showPanel("login");
    }
  } else {
    setAuthUiState(false);
    showPanel("login");
  }

  // Login
  qs("#loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    qs("#loginMsg").textContent = "";
    const email = DEMO_EMAIL;
    const password = DEMO_PASSWORD;

    try {
      const customer = await findCustomerByEmail(email);
      if (customer && customer.password !== password) {
        qs("#loginMsg").textContent = "Fel e-post eller lösenord.";
        return;
      }
      {
        const created = await httpPost("/customers", {
          email: DEMO_EMAIL,
          password: DEMO_PASSWORD,
          name: DEMO_NAME,
          billingAddress: "",
          mobile: "",
        });
        setLoggedInUserId(created.id);
        setAuthUiState(true, created.email);

        qs("#customerName").value = created.name ?? "";
        qs("#billingAddress").value = created.billingAddress ?? "";
        qs("#customerEmail").value = created.email ?? "";
        qs("#mobile").value = created.mobile ?? "";

        showPanel("booking");
        return;
      }
      setLoggedInUserId(customer.id);
      setAuthUiState(true, customer.email);

      // Prefill booking fields
      qs("#customerName").value = customer.name ?? "";
      qs("#billingAddress").value = customer.billingAddress ?? "";
      qs("#customerEmail").value = customer.email ?? "";
      qs("#mobile").value = customer.mobile ?? "";

      showPanel("booking");
    } catch (err) {
      console.error(err);
      qs("#loginMsg").textContent = "Login misslyckades.";
    }
  });

  // Register
  qs("#registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    qs("#registerMsg").textContent = "";
    const email = DEMO_EMAIL;
    const password = DEMO_PASSWORD;

    try {
      const existing = await findCustomerByEmail(email);
      if (existing) {
        setLoggedInUserId(existing.id);
        setAuthUiState(true, existing.email);

        qs("#customerName").value =
          existing.name && existing.name.trim() ? existing.name : DEMO_NAME;
        qs("#billingAddress").value = existing.billingAddress ?? "";
        qs("#customerEmail").value = existing.email ?? DEMO_EMAIL;
        qs("#mobile").value = existing.mobile ?? "";

        qs("#registerMsg").textContent =
          "Konto finns redan. Du är nu inloggad.";
        showPanel("booking");
        return;
      }

      // Create minimal customer; remaining fields filled on booking submit
      const created = await httpPost("/customers", {
        email,
        password,
        name: DEMO_NAME,
        billingAddress: "",
        mobile: "",
      });

      setLoggedInUserId(created.id);
      setAuthUiState(true, created.email);
      qs("#customerEmail").value = created.email;

      qs("#registerMsg").textContent =
        "Konto skapat. Fyll i kunduppgifter och boka.";
      showPanel("booking");
    } catch (err) {
      console.error(err);
      qs("#registerMsg").textContent = "Registrering misslyckades.";
    }
  });

  // Logout
  qs("#logoutBtn").addEventListener("click", () => {
    setLoggedInUserId(null);
    setAuthUiState(false);
    showPanel("login");
  });

  // Booking submit
  qs("#bookingForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    qs("#bookingMsg").textContent = "";

    const uid = getLoggedInUserId();
    if (!uid) {
      qs("#bookingMsg").textContent =
        "Du måste logga in eller skapa konto innan bokning.";
      return;
    }

    const customerPayload = {
      name: qs("#customerName").value.trim(),
      billingAddress: qs("#billingAddress").value.trim(),
      email: qs("#customerEmail").value.trim().toLowerCase(),
      mobile: qs("#mobile").value.trim(),
    };

    const deliveryMode = qs("#deliveryMode").value;
    const plannedDate = qs("#plannedDate").value;

    try {
      // Patch customer by simple PUT, (json-server supports PUT)
      await fetch(`${BASE_URL}/customers/${encodeURIComponent(uid)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerPayload),
      });

      await httpPost("/bookings", {
        courseId: String(course.id),
        customerId: String(uid),
        deliveryMode,
        date: plannedDate,
        createdAt: new Date().toISOString(),
      });

      qs("#bookingMsg").textContent = "Bokning genomförd ✅";
    } catch (err) {
      console.error(err);
      qs("#bookingMsg").textContent = "Bokning misslyckades.";
    }
  });

  status.textContent = "";
}

init().catch((err) => {
  console.error(err);
  const status = qs("#status");
  status.textContent = "Fel vid init. Är API:t igång?";
});
