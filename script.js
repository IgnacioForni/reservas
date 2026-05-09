const $ = id => document.getElementById(id);

const screens = [
  "home",
  "booking",
  "reserve",
  "status",
  "ownerLogin",
  "ownerPanel"
];

let selectedSport = null;
let selectedDate = null;
let selectedTime = null;
let selectedCourt = null;

const PENDING_MINUTES = 15;

const days = [
  { key: 1, label: "Lunes" },
  { key: 2, label: "Martes" },
  { key: 3, label: "Miércoles" },
  { key: 4, label: "Jueves" },
  { key: 5, label: "Viernes" },
  { key: 6, label: "Sábado" },
  { key: 0, label: "Domingo" }
];

const sportLabels = {
  futbol5: "Fútbol 5",
  padel: "Pádel"
};

const appDataDefault = {
  owner: {
    user: "dueño",
    pass: "1234"
  },
  complex: {
    name: "Rafaela Fútbol 5",
    price: 70000,
    phone: "5493492594829",
    sports: ["futbol5"],
    openDays: [1, 2, 3, 4, 5, 6, 0],
    openTime: "17:00",
    closeTime: "23:00",
    courts: [
      { id: 1, name: "Cancha disponible", type: "Descubierta" }
    ]
  },
  extraComplexes: [
    { name: "La Terminal", sport: "futbol5", price: 70000, phone: "5493492658427" },
    { name: "La Gambeta", sport: "futbol5", price: 70000, phone: "5493492318184" },
    { name: "La Cantera", sport: "futbol5", price: 70000, phone: "5493492610338" },
    { name: "La Terminal 2", sport: "futbol5", price: 70000, phone: "5493492413526" },
    { name: "La Masia", sport: "futbol5", price: 70000, phone: "5493492330350" },
    { name: "Soccer 5", sport: "futbol5", price: 70000, phone: "5493492437979" },
    { name: "La Cortada", sport: "futbol5", price: 70000, phone: "5493492437227" },
    { name: "Abran Cancha", sport: "futbol5", price: 70000, phone: "5493492575298" }
  ],
  reservations: []
};

let appData = loadData();
expirePendingReservations();

function loadData() {
  const saved = localStorage.getItem("miTurnoV16");

  if (saved) {
    return JSON.parse(saved);
  }

  localStorage.setItem("miTurnoV16", JSON.stringify(appDataDefault));
  return structuredClone(appDataDefault);
}

function saveData() {
  localStorage.setItem("miTurnoV16", JSON.stringify(appData));
}

function nowTimestamp() {
  return Date.now();
}

function expirePendingReservations() {
  let changed = false;

  appData.reservations.forEach(reservation => {
    if (
      reservation.status === "pendiente" &&
      reservation.expiresAt &&
      nowTimestamp() > reservation.expiresAt
    ) {
      reservation.status = "expirada";
      changed = true;
    }
  });

  if (changed) {
    saveData();
  }
}

setInterval(() => {
  expirePendingReservations();

  if (selectedSport && selectedDate) {
    renderTimes();
  }

  if ($("ownerPanel").classList.contains("active")) {
    renderPendingReservations();
  }
}, 10000);

function show(screen) {
  screens.forEach(id => $(id).classList.remove("active"));
  $(screen).classList.add("active");
}

function normalizePhone(phone) {
  const clean = phone.replace(/\D/g, "");
  if (clean.length < 10) return null;
  if (clean.startsWith("54")) return clean;
  return `549${clean}`;
}

function formatDate(dateString) {
  return new Date(dateString + "T00:00:00").toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit"
  });
}

function getDayNumber(dateString) {
  return new Date(dateString + "T00:00:00").getDay();
}

function timeToMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(total) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function generateTimes(sport, openTime, closeTime) {
  const duration = sport === "padel" ? 90 : 60;
  const start = timeToMinutes(openTime);
  const end = timeToMinutes(closeTime);
  const times = [];

  for (let t = start; t + duration <= end; t += duration) {
    times.push(minutesToTime(t));
  }

  return times;
}

function getAllComplexes() {
  const ownerComplex = appData.complex.sports.map(sport => ({
    id: "owner",
    name: appData.complex.name,
    sport,
    price: appData.complex.price,
    phone: appData.complex.phone,
    openDays: appData.complex.openDays,
    openTime: appData.complex.openTime,
    closeTime: appData.complex.closeTime,
    courts: appData.complex.courts
  }));

  const extras = appData.extraComplexes.map((complex, index) => ({
    id: `extra-${index}`,
    name: complex.name,
    sport: complex.sport,
    price: complex.price,
    phone: complex.phone,
    openDays: [1, 2, 3, 4, 5, 6, 0],
    openTime: "17:00",
    closeTime: "23:00",
    courts: [
      { id: `extra-${index}-court`, name: "Cancha disponible", type: "Disponible" }
    ]
  }));

  return [...ownerComplex, ...extras];
}

function createQuickDays() {
  $("quickDays").innerHTML = "";

  for (let i = 0; i < 5; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);

    const iso = date.toISOString().split("T")[0];

    let label = formatDate(iso);
    if (i === 0) label = "Hoy";
    if (i === 1) label = "Mañana";

    const btn = document.createElement("button");
    btn.className = "day-btn";
    btn.textContent = label;

    if (i === 0) {
      btn.classList.add("active");
      selectedDate = iso;
      $("dateInput").value = iso;
    }

    btn.onclick = () => {
      document.querySelectorAll(".day-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedDate = iso;
      $("dateInput").value = iso;
      renderTimes();
    };

    $("quickDays").appendChild(btn);
  }
}

function getAvailableComplexes(time) {
  expirePendingReservations();

  const day = getDayNumber(selectedDate);

  return getAllComplexes()
    .filter(complex => complex.sport === selectedSport)
    .filter(complex => complex.openDays.includes(day))
    .filter(complex => generateTimes(selectedSport, complex.openTime, complex.closeTime).includes(time))
    .map(complex => {
      const freeCourts = complex.courts.filter(court => {
        return !appData.reservations.some(reservation => {
          return (
            reservation.complexName === complex.name &&
            reservation.courtId === court.id &&
            reservation.date === selectedDate &&
            reservation.time === time &&
            ["pendiente", "confirmada"].includes(reservation.status)
          );
        });
      });

      return { ...complex, courts: freeCourts };
    })
    .filter(complex => complex.courts.length > 0);
}

function getTimesForSelectedSport() {
  const complexes = getAllComplexes().filter(c => c.sport === selectedSport);
  const times = new Set();

  complexes.forEach(complex => {
    generateTimes(selectedSport, complex.openTime, complex.closeTime).forEach(time => {
      times.add(time);
    });
  });

  return [...times].sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
}

function renderTimes() {
  $("timeGrid").innerHTML = "";
  $("resultsArea").classList.add("hidden");

  getTimesForSelectedSport().forEach(time => {
    const btn = document.createElement("button");
    btn.className = "time-btn";

    const available = getAvailableComplexes(time);

    if (!available.length) {
      btn.classList.add("full");
      btn.textContent = `${time} Completo`;
    } else {
      btn.textContent = time;
    }

    btn.onclick = () => {
      if (!available.length) return;

      selectedTime = time;

      document.querySelectorAll(".time-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      renderResults();
    };

    $("timeGrid").appendChild(btn);
  });
}

function renderResults() {
  $("resultsArea").classList.remove("hidden");
  $("resultsList").innerHTML = "";

  const results = getAvailableComplexes(selectedTime);

  results.forEach(complex => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h4>${complex.name}</h4>
      <p>💰 $${Number(complex.price).toLocaleString("es-AR")}</p>
    `;

    complex.courts.forEach(court => {
      const btn = document.createElement("button");
      btn.className = "court-btn";

      btn.textContent = court.type === "Disponible"
        ? "⚽ Reservar cancha"
        : `${court.name} (${court.type})`;

      btn.onclick = () => {
        selectedCourt = {
          ...court,
          complexId: complex.id,
          complexName: complex.name,
          price: complex.price,
          phone: complex.phone
        };

        renderSummary();
        show("reserve");
      };

      card.appendChild(btn);
    });

    $("resultsList").appendChild(card);
  });
}

function renderSummary() {
  $("summaryCard").innerHTML = `
    <h4>${selectedCourt.complexName}</h4>
    <p>${selectedCourt.name}</p>
    <p>📅 ${formatDate(selectedDate)}</p>
    <p>⏰ ${selectedTime}</p>
    <p>💰 $${Number(selectedCourt.price).toLocaleString("es-AR")}</p>
  `;
}

function openComplexWhatsapp(reservation) {
  const message = `
Hola, quiero solicitar una reserva desde MI TURNO.

Nombre: ${reservation.name}
Deporte: ${sportLabels[reservation.sport]}
Fecha: ${formatDate(reservation.date)}
Horario: ${reservation.time}
Complejo: ${reservation.complexName}
Cancha: ${reservation.courtName}

Mi WhatsApp: ${reservation.phone}

La solicitud queda pendiente por 15 minutos hasta que el complejo la confirme.
  `.trim();

  const url = `https://wa.me/${reservation.complexPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

$("reserveForm").onsubmit = (e) => {
  e.preventDefault();

  const name = $("clientName").value.trim();
  const phone = normalizePhone($("clientPhone").value);

  if (!name) return alert("Ingresá tu nombre.");
  if (!phone) return alert("Ingresá un WhatsApp válido.");

  const stillAvailable = getAvailableComplexes(selectedTime).some(complex => {
    return complex.name === selectedCourt.complexName &&
      complex.courts.some(court => court.id === selectedCourt.id);
  });

  if (!stillAvailable) {
    alert("Ese turno acaba de dejar de estar disponible. Elegí otro horario.");
    show("booking");
    renderTimes();
    return;
  }

  const reservation = {
    id: Date.now(),
    name,
    phone,
    sport: selectedSport,
    complexName: selectedCourt.complexName,
    complexPhone: selectedCourt.phone,
    courtId: selectedCourt.id,
    courtName: selectedCourt.name,
    date: selectedDate,
    time: selectedTime,
    status: "pendiente",
    createdAt: nowTimestamp(),
    expiresAt: nowTimestamp() + (PENDING_MINUTES * 60 * 1000)
  };

  appData.reservations.push(reservation);
  saveData();

  openComplexWhatsapp(reservation);

  $("statusEmoji").textContent = "🟡";
  $("statusTitle").textContent = "Solicitud enviada";
  $("statusText").textContent = "Se abrió WhatsApp con el mensaje listo. Tocá enviar para que el complejo reciba tu solicitud. El turno queda pendiente por 15 minutos.";

  $("clientName").value = "";
  $("clientPhone").value = "";

  show("status");
};

function getMinutesLeft(reservation) {
  if (!reservation.expiresAt) return 0;

  const diff = reservation.expiresAt - nowTimestamp();
  return Math.max(0, Math.ceil(diff / 60000));
}

function renderPendingReservations() {
  expirePendingReservations();

  const pending = appData.reservations.filter(r =>
    r.complexName === appData.complex.name &&
    r.status === "pendiente"
  );

  $("pendingList").innerHTML = "";

  if (!pending.length) {
    $("pendingList").innerHTML = `
      <div class="big-card">
        <div class="emoji">✅</div>
        <h2>No tenés solicitudes pendientes</h2>
        <p>Cuando alguien reserve tu complejo, aparece acá.</p>
      </div>
    `;
    return;
  }

  pending.forEach(reservation => {
    const card = document.createElement("div");
    card.className = "owner-card";

    const minutesLeft = getMinutesLeft(reservation);

    card.innerHTML = `
      <h4>Nueva solicitud</h4>
      <p>👤 ${reservation.name}</p>
      <p>📱 ${reservation.phone}</p>
      <p>📅 ${formatDate(reservation.date)}</p>
      <p>⏰ ${reservation.time}</p>
      <p>🏟 ${reservation.courtName}</p>
      <p>⏳ Vence en ${minutesLeft} min</p>
      <div class="owner-actions">
        <button class="success">Confirmar</button>
        <button class="danger">Rechazar</button>
      </div>
    `;

    card.querySelector(".success").onclick = () => {
      reservation.status = "confirmada";
      saveData();
      renderPendingReservations();
      renderTimes();
    };

    card.querySelector(".danger").onclick = () => {
      reservation.status = "rechazada";
      saveData();
      renderPendingReservations();
      renderTimes();
    };

    $("pendingList").appendChild(card);
  });
}

function renderOwnerConfig() {
  $("complexName").value = appData.complex.name;
  $("complexPrice").value = appData.complex.price;
  $("complexPhone").value = appData.complex.phone;
  $("sportFutbol").checked = appData.complex.sports.includes("futbol5");
  $("sportPadel").checked = appData.complex.sports.includes("padel");
  $("openTime").value = appData.complex.openTime;
  $("closeTime").value = appData.complex.closeTime;

  $("daysChecks").innerHTML = "";

  days.forEach(day => {
    $("daysChecks").innerHTML += `
      <label class="check-item">
        <input type="checkbox" value="${day.key}" ${appData.complex.openDays.includes(day.key) ? "checked" : ""}>
        ${day.label}
      </label>
    `;
  });
}

function renderOwnerCourts() {
  $("courtsListOwner").innerHTML = "";

  if (!appData.complex.courts.length) {
    $("courtsListOwner").innerHTML = `<p class="hint">Todavía no cargaste canchas.</p>`;
    return;
  }

  appData.complex.courts.forEach(court => {
    const card = document.createElement("div");
    card.className = "owner-card";

    card.innerHTML = `
      <h4>${court.name}</h4>
      <p>${court.type}</p>
      <div class="owner-actions">
        <button class="secondary">Editar</button>
        <button class="danger">Eliminar</button>
      </div>
    `;

    card.querySelector(".secondary").onclick = () => {
      const newName = prompt("Nuevo nombre:", court.name);
      if (!newName) return;

      const newType = prompt("Tipo: Techada o Descubierta", court.type);
      if (!newType) return;

      court.name = newName;
      court.type = newType;

      saveData();
      renderOwnerCourts();
      renderTimes();
    };

    card.querySelector(".danger").onclick = () => {
      if (!confirm("¿Eliminar esta cancha?")) return;

      appData.complex.courts = appData.complex.courts.filter(c => c.id !== court.id);

      saveData();
      renderOwnerCourts();
      renderTimes();
    };

    $("courtsListOwner").appendChild(card);
  });
}

$("complexForm").onsubmit = (e) => {
  e.preventDefault();

  const sports = [];

  if ($("sportFutbol").checked) sports.push("futbol5");
  if ($("sportPadel").checked) sports.push("padel");

  if (!sports.length) return alert("Elegí al menos un deporte.");

  const phone = normalizePhone($("complexPhone").value);
  if (!phone) return alert("Ingresá un WhatsApp válido.");

  const openDays = [...$("daysChecks").querySelectorAll("input:checked")]
    .map(input => Number(input.value));

  if (!openDays.length) return alert("Elegí al menos un día abierto.");

  appData.complex.name = $("complexName").value.trim();
  appData.complex.price = Number($("complexPrice").value);
  appData.complex.phone = phone;
  appData.complex.sports = sports;
  appData.complex.openDays = openDays;
  appData.complex.openTime = $("openTime").value;
  appData.complex.closeTime = $("closeTime").value;

  saveData();

  alert("Complejo actualizado.");
  renderTimes();
};

$("courtForm").onsubmit = (e) => {
  e.preventDefault();

  appData.complex.courts.push({
    id: Date.now(),
    name: $("courtName").value.trim(),
    type: $("courtType").value
  });

  $("courtName").value = "";

  saveData();
  renderOwnerCourts();
  renderTimes();
};

document.querySelectorAll(".sport").forEach(btn => {
  btn.onclick = () => {
    selectedSport = btn.dataset.sport;
    selectedTime = null;
    selectedCourt = null;

    $("bookingTitle").textContent = `Reservar ${sportLabels[selectedSport]}`;

    createQuickDays();
    renderTimes();
    show("booking");
  };
});

$("calendarToggle").onclick = () => {
  if ($("dateInput").showPicker) {
    $("dateInput").showPicker();
  } else {
    $("dateInput").click();
  }
};

$("dateInput").onchange = () => {
  selectedDate = $("dateInput").value;

  document.querySelectorAll(".day-btn").forEach(btn => {
    btn.classList.remove("active");
  });

  renderTimes();
};

document.querySelectorAll("[data-go]").forEach(btn => {
  btn.onclick = () => show(btn.dataset.go);
});

$("newSearchBtn").onclick = () => {
  selectedSport = null;
  selectedDate = null;
  selectedTime = null;
  selectedCourt = null;
  show("home");
};

$("ownerBtn").onclick = () => show("ownerLogin");

$("ownerLoginForm").onsubmit = (e) => {
  e.preventDefault();

  if (
    $("ownerUser").value === appData.owner.user &&
    $("ownerPass").value === appData.owner.pass
  ) {
    renderPendingReservations();
    renderOwnerConfig();
    renderOwnerCourts();
    show("ownerPanel");
  } else {
    alert("Usuario o contraseña incorrectos.");
  }
};

$("ownerLogout").onclick = () => show("home");

document.querySelectorAll("[data-owner-tab]").forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".owner-tab").forEach(t => t.classList.remove("active"));

    tab.classList.add("active");

    if (tab.dataset.ownerTab === "pending") $("ownerPending").classList.add("active");
    if (tab.dataset.ownerTab === "config") $("ownerConfig").classList.add("active");
    if (tab.dataset.ownerTab === "courts") $("ownerCourts").classList.add("active");

    renderPendingReservations();
    renderOwnerConfig();
    renderOwnerCourts();
  };
});
