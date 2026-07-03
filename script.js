const MAX_MONTHS = 600;

function simulateMinimum(balance, monthlyRate, minPercent, minFloor) {
  let bal = balance;
  let months = 0;
  let totalInterest = 0;
  const series = [{ month: 0, balance: bal }];
  if (bal <= 0) return { neverPaysOff: false, months: 0, totalInterest: 0, series };
  while (bal > 0.5 && months < MAX_MONTHS) {
    const interest = bal * monthlyRate;
    let payment = Math.max(bal * (minPercent / 100), minFloor);
    if (payment <= interest) {
      return { neverPaysOff: true, months: null, totalInterest: null, series };
    }
    payment = Math.min(payment, bal + interest);
    const principal = payment - interest;
    bal -= principal;
    totalInterest += interest;
    months += 1;
    series.push({ month: months, balance: Math.max(bal, 0) });
  }
  return { neverPaysOff: bal > 0.5, months, totalInterest, series };
}

function simulateFixed(balance, monthlyRate, payment, lumpSum) {
  let bal = Math.max(balance - lumpSum, 0);
  let months = 0;
  let totalInterest = 0;
  const series = [{ month: 0, balance: bal }];
  if (bal <= 0) return { neverPaysOff: false, months: 0, totalInterest: 0, series };
  if (payment <= bal * monthlyRate) {
    return { neverPaysOff: true, months: null, totalInterest: null, series };
  }
  while (bal > 0.5 && months < MAX_MONTHS) {
    const interest = bal * monthlyRate;
    const pay = Math.min(payment, bal + interest);
    const principal = pay - interest;
    bal -= principal;
    totalInterest += interest;
    months += 1;
    series.push({ month: months, balance: Math.max(bal, 0) });
  }
  return { neverPaysOff: bal > 0.5, months, totalInterest, series };
}

function requiredPaymentForTarget(balance, monthlyRate, targetMonths) {
  if (targetMonths <= 0 || balance <= 0) return null;
  if (monthlyRate === 0) return balance / targetMonths;
  const r = monthlyRate;
  const n = targetMonths;
  const denom = 1 - Math.pow(1 + r, -n);
  if (denom <= 0) return null;
  return (balance * r) / denom;
}

function renderTimeComparison(remainingBalance, monthlyRate, plannedPayment) {
  const tbody = document.getElementById("timeCompareBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (remainingBalance <= 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="color:#5A666F;">Ingresa tu saldo para ver la comparación de plazos.</td></tr>`;
    return;
  }

  const horizons = [3, 6, 12, 18, 24, 36, 48];

  horizons.forEach((m) => {
    const payment = requiredPaymentForTarget(remainingBalance, monthlyRate, m);
    const totalInterest = payment ? payment * m - remainingBalance : null;
    const alcanzable = payment && plannedPayment >= payment;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${monthsToText(m)}</td>
      <td>${payment ? fmt(payment) : "—"}</td>
      <td>${totalInterest !== null ? fmt(totalInterest) : "—"}</td>
      <td>${alcanzable ? '<span class="tag ok">ya lo alcanzas</span>' : ""}</td>
    `;
    tbody.appendChild(tr);
  });
}

function fmt(n) {
  if (n === null || n === undefined || !isFinite(n)) return "—";
  return new Intl.NumberFormat("es-PA", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function monthsToText(months) {
  if (months === null || months === undefined) return "—";
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (years === 0) return `${rem} mes${rem === 1 ? "" : "es"}`;
  if (rem === 0) return `${years} año${years === 1 ? "" : "s"}`;
  return `${years} año${years === 1 ? "" : "s"} y ${rem} mes${rem === 1 ? "" : "es"}`;
}

let chart = null;

function num(id) {
  const v = parseFloat(document.getElementById(id).value);
  return isNaN(v) ? 0 : v;
}

function recalculate() {
  const balance = num("balance");
  const apr = num("apr");
  const monthlyRate = apr / 100 / 12;
  const minActual = num("minActual");
  const minPercent = balance > 0 ? (minActual / balance) * 100 : 2;
  const minFloor = 25; // piso de seguridad para saldos muy bajos, no se muestra al usuario
  const planned = num("plannedPayment");
  const lump = num("lumpSum");
  const targetMonths = parseInt(document.getElementById("targetMonths").value) || 0;

  const minResult = simulateMinimum(balance, monthlyRate, minPercent, minFloor);
  const planResult = simulateFixed(balance, monthlyRate, planned, lump);
  const required = requiredPaymentForTarget(balance - lump, monthlyRate, targetMonths);

  document.getElementById("minMonths").textContent = minResult.neverPaysOff ? "Nunca se paga" : monthsToText(minResult.months);
  document.getElementById("minInterest").textContent = "Interés total: " + (minResult.neverPaysOff ? "—" : fmt(minResult.totalInterest));
  document.getElementById("planMonths").textContent = planResult.neverPaysOff ? "Nunca se paga" : monthsToText(planResult.months);
  document.getElementById("planInterest").textContent = "Interés total: " + (planResult.neverPaysOff ? "—" : fmt(planResult.totalInterest));

  const warnBanner = document.getElementById("warnBanner");
  if (planResult.neverPaysOff) {
    warnBanner.textContent = `Con ${fmt(planned)} al mes no cubres ni los intereses. Sube el pago mensual o el saldo nunca bajará.`;
    warnBanner.classList.add("visible");
  } else {
    warnBanner.classList.remove("visible");
  }

  const savingsLine = document.getElementById("savingsLine");
  if (minResult.months !== null && planResult.months !== null) {
    const monthsSaved = minResult.months - planResult.months;
    const interestSaved = minResult.totalInterest - planResult.totalInterest;
    savingsLine.classList.toggle("negative", interestSaved < 0);
    savingsLine.textContent = interestSaved >= 0
      ? `Te ahorras ${fmt(interestSaved)} en intereses y sales ${monthsToText(Math.max(monthsSaved, 0))} antes.`
      : `Con estos números tu plan paga más lento o más caro que el mínimo — revisa el pago mensual.`;
  } else {
    savingsLine.textContent = "";
  }

  document.getElementById("requiredPayment").textContent = required && required > 0 ? fmt(required) : "—";
  renderTimeComparison(balance - lump, monthlyRate, planned);

  const chartSummary = document.getElementById("chartSrSummary");
  if (chartSummary) {
    chartSummary.textContent = `Gráfica: pagando solo el mínimo, tardas ${minResult.neverPaysOff ? "un tiempo indefinido (nunca se paga)" : monthsToText(minResult.months)} y pagas ${minResult.neverPaysOff ? "intereses sin fin" : fmt(minResult.totalInterest) + " de interés"}. Con tu plan actual, tardas ${planResult.neverPaysOff ? "un tiempo indefinido (nunca se paga)" : monthsToText(planResult.months)} y pagas ${planResult.neverPaysOff ? "intereses sin fin" : fmt(planResult.totalInterest) + " de interés"}.`;
  }

  // Chart data
  const chartCap = 180;
  const maxLen = Math.min(Math.max(minResult.series.length, planResult.series.length), chartCap);
  const labels = Array.from({ length: maxLen }, (_, i) => i);
  const minimoData = labels.map((i) => (i < minResult.series.length ? minResult.series[i].balance : null));
  const planData = labels.map((i) => (i < planResult.series.length ? planResult.series[i].balance : null));

  if (chart) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = minimoData;
    chart.data.datasets[1].data = planData;
    chart.update();
  } else {
    const ctx = document.getElementById("payoffChart").getContext("2d");
    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Solo mínimo",
            data: minimoData,
            borderColor: "#C05746",
            backgroundColor: "#C05746",
            borderWidth: 2,
            borderDash: [6, 4],
            pointRadius: 0,
            spanGaps: false,
            tension: 0.15,
          },
          {
            label: "Tu plan",
            data: planData,
            borderColor: "#3FA37A",
            backgroundColor: "#3FA37A",
            borderWidth: 2,
            pointRadius: 0,
            spanGaps: false,
            tension: 0.15,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => `Mes ${items[0].label}`,
              label: (item) => `${item.dataset.label}: ${fmt(item.raw)}`,
            },
            backgroundColor: "#FFFFFF",
            titleColor: "#16263B",
            bodyColor: "#16263B",
            borderColor: "#DCD3BD",
            borderWidth: 1,
          },
        },
        scales: {
          x: {
            title: { display: true, text: "Meses", color: "#5C6B78", font: { size: 11 } },
            ticks: { color: "#5C6B78", font: { size: 11 }, maxTicksLimit: 10 },
            grid: { color: "#EEE8D9" },
          },
          y: {
            ticks: {
              color: "#5C6B78",
              font: { size: 11 },
              callback: (v) => "$" + Math.round(v / 100) / 10 + "k",
            },
            grid: { color: "#EEE8D9" },
          },
        },
      },
    });
  }
}

document.querySelectorAll("#tab3 input").forEach((el) => el.addEventListener("input", recalculate));
recalculate();

// ---- Gastos del día a día / ciclo de corte ----

let gastos = [];

function pad(n) { return n.toString().padStart(2, "0"); }

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatFechaCorta(d) {
  return d.toLocaleDateString("es-PA", { day: "2-digit", month: "short", year: "numeric" });
}

// Dado un gasto y el día de corte, calcula a qué corte pertenece y cuándo vence
function getCicloInfo(fechaStr, diaCorte, diasGracia) {
  const d = new Date(fechaStr + "T00:00:00");
  const year = d.getFullYear();
  const month = d.getMonth();
  let corte = new Date(year, month, diaCorte);
  if (d > corte) {
    corte = new Date(year, month + 1, diaCorte);
  }
  const due = new Date(corte);
  due.setDate(due.getDate() + (parseInt(diasGracia) || 0));
  return { corte, due };
}

function addGasto() {
  const fecha = document.getElementById("gastoFecha").value;
  const desc = document.getElementById("gastoDesc").value.trim() || "Sin descripción";
  const monto = parseFloat(document.getElementById("gastoMonto").value);
  if (!fecha || !monto || monto <= 0) return;
  gastos.push({ id: Date.now(), fecha, desc, monto });
  document.getElementById("gastoDesc").value = "";
  document.getElementById("gastoMonto").value = "";
  renderGastos();
}

function deleteGasto(id) {
  gastos = gastos.filter((g) => g.id !== id);
  renderGastos();
}

function getDiaCorteYGracia() {
  const diaCorteRaw = document.getElementById("diaCorte").value;
  const diaPagoRaw = document.getElementById("diaPago").value;
  const hint = document.getElementById("cicloHint");

  if (diaCorteRaw === "" || diaPagoRaw === "") {
    hint.textContent = "Faltan datos: ingresa el día de corte y el día límite de pago para calcular los ciclos.";
    return { diaCorte: parseInt(diaCorteRaw) || 20, diasGracia: 20, incomplete: true };
  }

  const diaCorte = parseInt(diaCorteRaw);
  const diaPago = parseInt(diaPagoRaw);

  // Construimos una fecha de referencia este mes para medir cuántos días de plazo hay
  const now = new Date();
  const corteRef = new Date(now.getFullYear(), now.getMonth(), diaCorte);
  // Si el día de pago cae antes o igual que el de corte, el pago es al mes siguiente
  const pagoMonthOffset = diaPago <= diaCorte ? 1 : 0;
  const pagoRef = new Date(now.getFullYear(), now.getMonth() + pagoMonthOffset, diaPago);
  const diasGracia = Math.round((pagoRef - corteRef) / (1000 * 60 * 60 * 24));

  if (diasGracia > 0) {
    hint.textContent = `Tu corte cae el día ${diaCorte} de cada mes; tienes hasta el día ${diaPago} del mes ${pagoMonthOffset ? "siguiente" : "mismo"} para pagar (${diasGracia} días de plazo). Esto se repite solo cada mes, no hace falta volver a ponerlo.`;
  } else {
    hint.textContent = "Revisa los días: el plazo calculado no es válido.";
  }
  return { diaCorte, diasGracia: diasGracia > 0 ? diasGracia : 20 };
}

function renderGastos() {
  const { diaCorte, diasGracia, incomplete } = getDiaCorteYGracia();
  const tbody = document.getElementById("gastosBody");
  const emptyState = document.getElementById("emptyState");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (incomplete) {
    tbody.innerHTML = "";
    document.getElementById("cycleSummary").innerHTML = "";
    emptyState.style.display = "block";
    emptyState.textContent = "Completa el día de corte y el día límite de pago arriba para ver tus gastos organizados por ciclo.";
    return;
  }
  emptyState.textContent = "Aún no has agregado gastos.";

  const sorted = [...gastos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  tbody.innerHTML = "";
  emptyState.style.display = sorted.length ? "none" : "block";

  const cycleTotals = {};

  sorted.forEach((g) => {
    const { corte, due } = getCicloInfo(g.fecha, diaCorte, diasGracia);
    const key = corte.toISOString().slice(0, 10);
    if (!cycleTotals[key]) cycleTotals[key] = { corte, due, total: 0 };
    cycleTotals[key].total += g.monto;

    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    let tagClass = "ok";
    let tagText = `faltan ${diffDays}d`;
    if (diffDays < 0) {
      tagClass = "late";
      tagText = "vencido";
    } else if (diffDays <= 5) {
      tagClass = "due";
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${formatFechaCorta(new Date(g.fecha + "T00:00:00"))}</td>
      <td>${g.desc}</td>
      <td>${fmt(g.monto)}</td>
      <td>${formatFechaCorta(corte)}</td>
      <td>${formatFechaCorta(due)}<span class="tag ${tagClass}">${tagText}</span></td>
      <td><button class="btn-del" onclick="deleteGasto(${g.id})">Eliminar</button></td>
    `;
    tbody.appendChild(tr);
  });

  const summaryDiv = document.getElementById("cycleSummary");
  summaryDiv.innerHTML = "";
  const entries = Object.values(cycleTotals).sort((a, b) => a.corte - b.corte);
  entries.forEach((entry) => {
    const box = document.createElement("div");
    box.className = "result-box" + (entry.corte >= today ? " good" : "");
    box.style.minWidth = "200px";
    box.innerHTML = `
      <div class="result-label">Corte ${formatFechaCorta(entry.corte)}</div>
      <div class="result-number" style="font-size:1.2rem;">${fmt(entry.total)}</div>
      <div class="result-sub">Vence ${formatFechaCorta(entry.due)}</div>
    `;
    summaryDiv.appendChild(box);
  });
}

document.getElementById("gastoFecha").value = todayISO();

document.getElementById("diaCorte").addEventListener("input", renderGastos);
document.getElementById("diaPago").addEventListener("input", renderGastos);
renderGastos();

// ---- Tabs ----
function showTab(name) {
  document.querySelectorAll(".tab-panel").forEach((el) => el.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach((el) => {
    el.classList.remove("active");
    el.setAttribute("aria-selected", "false");
  });
  document.getElementById(name).classList.add("active");
  const btn = document.getElementById("btn-" + name);
  btn.classList.add("active");
  btn.setAttribute("aria-selected", "true");
  if (name === "tab3" && chart) {
    requestAnimationFrame(() => chart.resize());
  }
}
