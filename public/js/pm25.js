/* ── UI polish ── */
function initNavbar() {
  const navbar = document.getElementById("navbar");
  const links = document.querySelectorAll(".nav-links a");
  const navLinks = document.getElementById("nav-links");
  const navToggle = document.getElementById("nav-toggle");
  const sections = [...links].map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);

  const closeMobileNav = () => {
    navLinks?.classList.remove("open");
    navToggle?.classList.remove("open");
    navToggle?.setAttribute("aria-expanded", "false");
  };

  navToggle?.addEventListener("click", () => {
    const isOpen = navLinks?.classList.toggle("open");
    navToggle.classList.toggle("open", isOpen);
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  links.forEach((link) => link.addEventListener("click", closeMobileNav));

  const onScroll = () => {
    navbar?.classList.toggle("scrolled", window.scrollY > 40);
    const pos = window.scrollY + 120;
    let current = sections[0];
    sections.forEach((sec) => { if (sec.offsetTop <= pos) current = sec; });
    links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${current?.id}`));
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function initReveal() {
  const els = document.querySelectorAll(".reveal");
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  els.forEach((el) => obs.observe(el));
}

initNavbar();
initReveal();

async function loadOverview() {
  try {
    const res = await fetch(window.PM25_API.overview);
    const json = await res.json();
    if (!json.success) return;
    const ov = json.data.overview;
    document.getElementById("ov-countries").textContent = ov.countries + " negara";
    document.getElementById("ov-cities").textContent = ov.cities + " kota";
    document.getElementById("ov-years").textContent = ov.date_range;
  } catch (_) {}
}

async function loadCountries() {
  const select = document.getElementById("select-country");
  try {
    const res = await fetch(window.PM25_API.countries);
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    select.innerHTML = '<option value="">-- Pilih Negara --</option>';
    json.data.countries.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      select.appendChild(opt);
    });
  } catch (err) {
    select.innerHTML = `<option value="">Error: ${err.message}</option>`;
  }
}

async function loadCities(country) {
  const select = document.getElementById("select-city");
  const yearSelect = document.getElementById("select-year");
  select.disabled = true;
  yearSelect.disabled = true;
  yearSelect.innerHTML = '<option value="">Pilih kota terlebih dahulu</option>';
  select.innerHTML = '<option value="">Memuat kota...</option>';
  try {
    const res = await fetch(`${window.PM25_API.cities}?country=${encodeURIComponent(country)}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    select.innerHTML = '<option value="">-- Pilih Kota --</option>';
    json.data.cities.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      select.appendChild(opt);
    });
    select.disabled = false;
    if (json.data.cities.length === 1) {
      select.value = json.data.cities[0];
      loadYears(country, json.data.cities[0]);
    }
  } catch (err) {
    select.innerHTML = `<option value="">Error: ${err.message}</option>`;
  }
}

async function loadYears(country, city) {
  const select = document.getElementById("select-year");
  const hint = document.getElementById("year-hint");
  select.disabled = true;
  select.innerHTML = '<option value="">Memuat tahun...</option>';
  try {
    const res = await fetch(`${window.PM25_API.years}?country=${encodeURIComponent(country)}&city=${encodeURIComponent(city)}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    select.innerHTML = '<option value="">-- Pilih Tahun --</option>';
    json.data.years.forEach((y) => {
      const opt = document.createElement("option");
      opt.value = y.year;
      opt.textContent = y.label;
      opt.dataset.type = y.type;
      select.appendChild(opt);
    });
    select.disabled = false;
    hint.textContent = "Pilih tahun historis atau tahun prediksi (forecast)";
  } catch (err) {
    select.innerHTML = `<option value="">Error: ${err.message}</option>`;
  }
}

function showUserResult(data) {
  const card = document.getElementById("result-card");
  document.getElementById("result-placeholder").classList.add("hidden");
  document.getElementById("result-loading").classList.add("hidden");
  document.getElementById("result-content").classList.remove("hidden");

  card.className = "dashboard-result-card status-" + data.color;
  document.getElementById("result-emoji").textContent = data.emoji;
  const statusEl = document.getElementById("result-status");
  statusEl.textContent = data.status;
  statusEl.className = "result-status " + data.color;

  const yearBadge = document.getElementById("result-year-badge");
  yearBadge.textContent = data.year_type === "forecast" ? "Prediksi" : "Historis";
  yearBadge.className = "year-badge" + (data.year_type === "forecast" ? " forecast" : "");

  document.getElementById("result-country").textContent = data.country;
  document.getElementById("result-city").textContent = data.city;
  document.getElementById("result-year").textContent = data.year + " (" + (data.year_type === "forecast" ? "Prediksi" : "Historis") + ")";
  document.getElementById("result-pm25").textContent = `${data.prediction} ${data.unit}`;
  document.getElementById("result-historical").textContent = data.historical_avg + " µg/m³";
  document.getElementById("result-datapoints").textContent = data.data_points + " titik";
  document.getElementById("result-range").textContent = `${data.min_pm25} – ${data.max_pm25} µg/m³`;
  document.getElementById("result-message").textContent = data.message;
  document.getElementById("result-note").textContent = data.prediction_note || "";
}

async function runUserPredict(country, city, year) {
  document.getElementById("result-placeholder").classList.add("hidden");
  document.getElementById("result-content").classList.add("hidden");
  document.getElementById("result-loading").classList.remove("hidden");
  document.getElementById("btn-predict").disabled = true;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 180000);

  try {
    const csrf = document.querySelector('meta[name="csrf-token"]')?.content || "";
    const res = await fetch(window.PM25_API.userPredict, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": csrf, Accept: "application/json" },
      body: JSON.stringify({ country, city, year: parseInt(year) }),
      signal: controller.signal,
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Prediksi gagal");
    showUserResult(json.data);
  } catch (err) {
    document.getElementById("result-loading").classList.add("hidden");
    document.getElementById("result-content").classList.add("hidden");
    document.getElementById("result-placeholder").classList.remove("hidden");
    const message = err.name === "AbortError"
      ? "Prediksi membutuhkan waktu terlalu lama. Silakan coba lagi."
      : (err.message || "Terjadi kesalahan saat memprediksi.");
    document.getElementById("result-placeholder").innerHTML = `
      <div class="placeholder-visual">⚠️</div>
      <p style="color:var(--very-unhealthy);margin-bottom:0.75rem">${message}</p>
      <p style="color:var(--text-muted);font-size:0.85rem">Klik <strong>Prediksi Sekarang</strong> untuk mencoba lagi.</p>`;
  } finally {
    clearTimeout(timeoutId);
    document.getElementById("btn-predict").disabled = false;
  }
}

document.getElementById("select-country").addEventListener("change", (e) => {
  if (e.target.value) loadCities(e.target.value);
  else {
    document.getElementById("select-city").disabled = true;
    document.getElementById("select-city").innerHTML = '<option value="">Pilih negara terlebih dahulu</option>';
    document.getElementById("select-year").disabled = true;
    document.getElementById("select-year").innerHTML = '<option value="">Pilih kota terlebih dahulu</option>';
  }
});

document.getElementById("select-city").addEventListener("change", (e) => {
  const country = document.getElementById("select-country").value;
  if (country && e.target.value) loadYears(country, e.target.value);
});

document.getElementById("user-predict-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const country = document.getElementById("select-country").value;
  const city = document.getElementById("select-city").value;
  const year = document.getElementById("select-year").value;
  if (country && city && year) runUserPredict(country, city, year);
});

loadOverview();
loadCountries();
