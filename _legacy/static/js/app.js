let predictionData = null;
let metricsChart = null;
let predictionChart = null;
let activeModel = "default";

const MODEL_KEYS = {
  default: "default",
  grid_search: "grid_search",
  sca_lstm: "sca_lstm",
};

const CARD_MAP = {
  default: "card-default",
  grid_search: "card-grid",
  sca_lstm: "card-sca",
};

async function fetchResults(refresh = false) {
  const url = refresh ? "/api/refresh" : "/api/predict";
  const res = await fetch(url);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Gagal memuat data");
  return json.data;
}

function formatParams(params) {
  const parts = [];
  if (params.units !== undefined) parts.push(`Units: ${params.units}`);
  if (params.lr !== undefined) parts.push(`LR: ${params.lr}`);
  if (params.epochs !== undefined) parts.push(`Epochs: ${params.epochs}`);
  if (params.sca_rmse !== undefined) parts.push(`SCA RMSE: ${params.sca_rmse}`);
  return parts.join(" · ");
}

function updateMetricCards(models) {
  for (const [key, cardId] of Object.entries(CARD_MAP)) {
    const model = models[key];
    const card = document.getElementById(cardId);
    if (!card || !model) continue;

    card.querySelector(".rmse").textContent = model.metrics.rmse;
    card.querySelector(".mape").textContent = model.metrics.mape;
    card.querySelector(".r2").textContent = model.metrics.r2;
    card.querySelector(".params-info").textContent = formatParams(model.params);
  }
}

function renderMetricsChart(models) {
  const ctx = document.getElementById("metricsChart");
  if (!ctx) return;

  const labels = ["LSTM Default", "Grid Search", "SCA-LSTM"];
  const rmse = [
    models.default.metrics.rmse,
    models.grid_search.metrics.rmse,
    models.sca_lstm.metrics.rmse,
  ];
  const mape = [
    models.default.metrics.mape,
    models.grid_search.metrics.mape,
    models.sca_lstm.metrics.mape,
  ];
  const r2 = [
    models.default.metrics.r2,
    models.grid_search.metrics.r2,
    models.sca_lstm.metrics.r2,
  ];

  if (metricsChart) metricsChart.destroy();

  metricsChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "RMSE",
          data: rmse,
          backgroundColor: "rgba(14, 165, 233, 0.7)",
          borderRadius: 6,
        },
        {
          label: "MAPE",
          data: mape,
          backgroundColor: "rgba(16, 185, 129, 0.7)",
          borderRadius: 6,
        },
        {
          label: "R²",
          data: r2,
          backgroundColor: "rgba(249, 115, 22, 0.7)",
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: "#94a3b8" },
        },
      },
      scales: {
        x: {
          ticks: { color: "#94a3b8" },
          grid: { color: "rgba(51, 65, 85, 0.5)" },
        },
        y: {
          ticks: { color: "#94a3b8" },
          grid: { color: "rgba(51, 65, 85, 0.5)" },
        },
      },
    },
  });
}

function renderPredictionChart(modelKey) {
  if (!predictionData) return;

  const ctx = document.getElementById("predictionChart");
  const model = predictionData.models[modelKey];
  const actual = predictionData.actual;
  const labels = actual.map((_, i) => i + 1);

  if (predictionChart) predictionChart.destroy();

  predictionChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Nilai Aktual",
          data: actual,
          borderColor: "#0ea5e9",
          backgroundColor: "rgba(14, 165, 233, 0.1)",
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.3,
        },
        {
          label: `Prediksi — ${model.name}`,
          data: model.predictions,
          borderColor: "#f97316",
          backgroundColor: "rgba(249, 115, 22, 0.1)",
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          labels: { color: "#94a3b8" },
        },
      },
      scales: {
        x: {
          title: { display: true, text: "Sampel Data Uji", color: "#94a3b8" },
          ticks: { color: "#94a3b8", maxTicksLimit: 15 },
          grid: { color: "rgba(51, 65, 85, 0.5)" },
        },
        y: {
          title: { display: true, text: "PM2.5 (µg/m³)", color: "#94a3b8" },
          ticks: { color: "#94a3b8" },
          grid: { color: "rgba(51, 65, 85, 0.5)" },
        },
      },
    },
  });

  document.getElementById("sample-info").textContent =
    `${predictionData.sample_count} sampel data uji`;
}

function showDatasetInfo(dataset) {
  if (!dataset) return;
  document.getElementById("dataset-file").textContent = dataset.file;
  document.getElementById("dataset-col").textContent = dataset.column;
  document.getElementById("dataset-rows").textContent = dataset.rows;
  document.getElementById("dataset-info").classList.remove("hidden");
}

function showResults(data) {
  predictionData = data;
  document.getElementById("loading").classList.add("hidden");
  document.getElementById("results").classList.remove("hidden");
  document.getElementById("demo-content").classList.remove("hidden");

  showDatasetInfo(data.dataset);
  updateMetricCards(data.models);
  renderMetricsChart(data.models);
  renderPredictionChart(activeModel);
}

function showLoading() {
  document.getElementById("loading").classList.remove("hidden");
  document.getElementById("results").classList.add("hidden");
  document.getElementById("demo-content").classList.add("hidden");
}

async function loadData(refresh = false) {
  showLoading();
  try {
    const data = await fetchResults(refresh);
    showResults(data);
  } catch (err) {
    document.getElementById("loading").innerHTML = `
      <p style="color:#ef4444">Error: ${err.message}</p>
      <button class="btn btn-primary" onclick="loadData()">Coba Lagi</button>
    `;
  }
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    activeModel = tab.dataset.model;
    renderPredictionChart(activeModel);
  });
});

document.getElementById("btn-refresh").addEventListener("click", () => {
  loadData(true);
});

loadData();
