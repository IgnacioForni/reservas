const clientScreen = document.getElementById("clientScreen");
const ownerLoginScreen = document.getElementById("ownerLoginScreen");
const ownerScreen = document.getElementById("ownerScreen");

const ownerBtn = document.getElementById("ownerBtn");
const logoutOwnerBtn = document.getElementById("logoutOwnerBtn");

const navClient = document.getElementById("navClient");
const navOwner = document.getElementById("navOwner");

const daysContainer = document.getElementById("daysContainer");
const ownerDaysContainer = document.getElementById("ownerDaysContainer");

const hoursContainer = document.getElementById("hoursContainer");
const ownerReservations = document.getElementById("ownerReservations");

const bookingBox = document.getElementById("bookingBox");
const bookingSummary = document.getElementById("bookingSummary");
const nameInput = document.getElementById("nameInput");
const phoneInput = document.getElementById("phoneInput");
const requestBtn = document.getElementById("requestBtn");

const ownerComplexSelect = document.getElementById("ownerComplexSelect");
const ownerPinInput = document.getElementById("ownerPinInput");
const ownerLoginBtn = document.getElementById("ownerLoginBtn");

const ownerPanelTitle = document.getElementById("ownerPanelTitle");
const ownerPanelSubtitle = document.getElementById("ownerPanelSubtitle");
const ownerSummary = document.getElementById("ownerSummary");

const openTimeSelect = document.getElementById("openTimeSelect");
const closeTimeSelect = document.getElementById("closeTimeSelect");
const saveHoursBtn = document.getElementById("saveHoursBtn");

const courtsContainer = document.getElementById("courtsContainer");
const ownerCourtsContainer = document.getElementById("ownerCourtsContainer");
const addCourtBtn = document.getElementById("addCourtBtn");

const clearBtn = document.getElementById("clearBtn");

const TIME_OPTIONS = [
  15,
  16, 17, 18, 19, 20, 21, 22, 23, 24
];

const DEFAULT_OPEN_HOUR = 17;
const DEFAULT_CLOSE_HOUR = 24;

const COMPLEXES = [
  {
    id: "rafaela-futbol-5",
    name: "Rafaela Futbol 5",
    whatsapp: "5493492650767",
    pin: "1111"
  },
  {
    id: "la-terminal-futbol-5",
    name: "La Terminal - Futbol 5",
    whatsapp: "5493492650767",
    pin: "2222"
  },
  {
    id: "la-gambeta",
    name: "La Gambeta Fútbol 5 y Pádel",
    whatsapp: "5493492650767",
    pin: "3333"
  },
  {
    id: "la-terminal-2",
    name: "La Terminal 2 - Fútbol 5",
    whatsapp: "5493492650767",
    pin: "4444"
  },
  {
    id: "la-cantera",
    name: "La Cantera Fútbol 5",
    whatsapp: "5493492650767",
    pin: "5555"
  },
  {
    id: "la-masia",
    name: "La Masia",
    whatsapp: "5493492650767",
    pin: "6666"
  },
  {
    id: "la-cortada",
    name: "La Cortada",
    whatsapp: "5493492650767",
    pin: "7777"
  },
  {
    id: "el-cilindro",
    name: "El Cilindro Futbol 5",
    whatsapp: "5493492650767",
    pin: "8888"
  }
];

let selectedComplexId = "";
let selectedCourt = "";
let selectedDate = "";
let selectedHour = "";

let ownerLoggedComplexId = null;
let ownerSelectedCourt = "Cancha 1";
let ownerSelectedDate = "";
let ownerCurrentFilter = "all";

function numberToTime(hour) {
  if (hour === 24) return "00:00";
  return `${String(hour).padStart(2, "0")}:00`;
}

function timeToNumber(time) {
  if (time === "00:00") return 24;
  return Number(time.split(":")[0]);
}

function getReservations() {
  return JSON.parse(localStorage.getItem("reservations")) || [];
}

function saveReservations(reservations) {
  localStorage.setItem("reservations", JSON.stringify(reservations));
}

function getComplexSettings() {
  return JSON.parse(localStorage.getItem("complexSettings")) || {};
}

function saveComplexSettings(settings) {
  localStorage.setItem("complexSettings", JSON.stringify(settings));
}

function getSettingsForComplex(complexId) {
  const settings = getComplexSettings();

  return settings[complexId] || {
    openHour: DEFAULT_OPEN_HOUR,
    closeHour: DEFAULT_CLOSE_HOUR
  };
}

function saveSettingsForComplex(complexId, openHour, closeHour) {
  const settings = getComplexSettings();

  settings[complexId] = {
    openHour,
    closeHour
  };

  saveComplexSettings(settings);
}

function getCourtsData() {
  return JSON.parse(localStorage.getItem("complexCourts")) || {};
}

function saveCourtsData(courtsData) {
  localStorage.setItem("complexCourts", JSON.stringify(courtsData));
}

function getCourtsForComplex(complexId) {
  const courtsData = getCourtsData();

  if (!courtsData[complexId] || courtsData[complexId].length === 0) {
    courtsData[complexId] = ["Cancha 1"];
    saveCourtsData(courtsData);
  }

  return courtsData[complexId];
}

function addCourtForComplex(complexId) {
  const courtsData = getCourtsData();
  const currentCourts = getCourtsForComplex(complexId);

  const nextNumber = currentCourts.length + 1;
  const newCourt = `Cancha ${nextNumber}`;

  currentCourts.push(newCourt);
  courtsData[complexId] = currentCourts;

  saveCourtsData(courtsData);

  return newCourt;
}

function deleteCourtForComplex(complexId, courtToDelete) {
  const courtsData = getCourtsData();
  const currentCourts = getCourtsForComplex(complexId);

  if (currentCourts.length <= 1) {
    alert("El complejo tiene que tener al menos una cancha.");
    return;
  }

  const confirmDelete = confirm(
    `¿Seguro que querés eliminar ${courtToDelete}? También se borrarán sus reservas y bloqueos.`
  );

  if (!confirmDelete) return;

  const updatedCourts = currentCourts.filter((court) => court !== courtToDelete);

  courtsData[complexId] = updatedCourts;
  saveCourtsData(courtsData);

  const reservations = getReservations();

  const updatedReservations = reservations.filter((reservation) => {
    return !(
      reservation.complexId === complexId &&
      reservation.court === courtToDelete
    );
  });

  saveReservations(updatedReservations);

  if (ownerSelectedCourt === courtToDelete) {
    ownerSelectedCourt = updatedCourts[0];
  }

  if (selectedComplexId === complexId && selectedCourt === courtToDelete) {
    selectedComplexId = "";
    selectedCourt = "";
    bookingBox.classList.add("hidden");
  }

  renderClientComplexes();
  renderOwnerCourts();
  renderOwnerFilters();
  renderHours();
  renderOwnerReservations();
  renderOwnerSummary();
  renderOwnerHeader();

  alert(`${courtToDelete} eliminada correctamente.`);
}

function getHoursForComplex(complexId) {
  const settings = getSettingsForComplex(complexId);
  const hours = [];

  for (let hour = settings.openHour; hour < settings.closeHour; hour++) {
    hours.push(numberToTime(hour));
  }

  return hours;
}

function getComplexById(id) {
  return COMPLEXES.find((complex) => complex.id === id);
}

function getNextDays() {
  const days = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(today.getDate() + i);

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    const value = `${yyyy}-${mm}-${dd}`;

    const dayName = date.toLocaleDateString("es-AR", {
      weekday: "short"
    });

    const dayNumber = date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit"
    });

    days.push({
      value,
      name: i === 0 ? "Hoy" : dayName,
      number: dayNumber
    });
  }

  return days;
}

function formatDateForMessage(dateValue) {
  const date = new Date(`${dateValue}T12:00:00`);

  return date.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function isPastHour(dateValue, hour) {
  if (!dateValue || !hour) return false;

  const today = new Date();
  const selected = new Date(`${dateValue}T${hour}:00`);

  return selected < today;
}

function getReservationByComplexCourtDateHour(complexId, court, date, hour) {
  const reservations = getReservations();

  return reservations.find((reservation) => {
    return (
      reservation.complexId === complexId &&
      reservation.court === court &&
      reservation.date === date &&
      reservation.hour === hour
    );
  });
}

function getSlotStatus(complexId, court, date, hour) {
  const reservation = getReservationByComplexCourtDateHour(
    complexId,
    court,
    date,
    hour
  );

  if (!reservation) return "free";

  return reservation.status;
}

function shouldShowSlot(status) {
  if (ownerCurrentFilter === "all") return true;
  return ownerCurrentFilter === status;
}

function getAvailableCourtsForComplex(complexId, date, hour) {
  if (!date || !hour) return [];

  if (isPastHour(date, hour)) return [];

  const settings = getSettingsForComplex(complexId);
  const hourNumber = timeToNumber(hour);

  if (hourNumber < settings.openHour || hourNumber >= settings.closeHour) {
    return [];
  }

  const courts = getCourtsForComplex(complexId);

  return courts.filter((court) => {
    const status = getSlotStatus(complexId, court, date, hour);
    return status === "free";
  });
}

function openBookingForm(complex, court) {
  selectedComplexId = complex.id;
  selectedCourt = court;

  if (bookingSummary) {
    bookingSummary.innerHTML = `
      <strong>${complex.name}</strong><br>
      ${selectedCourt} · ${formatDateForMessage(selectedDate)} · ${selectedHour}
    `;
  }

  bookingBox.classList.remove("hidden");

  renderClientComplexes();

  setTimeout(() => {
    bookingBox.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }, 100);
}

function renderClientComplexes() {
  const container = document.getElementById("complexesContainer");
  container.innerHTML = "";

  if (!selectedDate || !selectedHour) {
    container.innerHTML = `
      <div class="empty-state">
        Primero elegí un día y un horario para ver complejos disponibles.
      </div>
    `;
    return;
  }

  let availableCount = 0;

  COMPLEXES.forEach((complex) => {
    const availableCourts = getAvailableCourtsForComplex(
      complex.id,
      selectedDate,
      selectedHour
    );

    if (availableCourts.length === 0) return;

    availableCount++;

    const settings = getSettingsForComplex(complex.id);
    const isThisComplexSelected = selectedComplexId === complex.id;
    const selectedCourtIsAvailable = availableCourts.includes(selectedCourt);
    const hasOnlyOneCourt = availableCourts.length === 1;

    const card = document.createElement("div");
    card.className = "available-complex-card";

    if (isThisComplexSelected) {
      card.classList.add("active");
    }

    const courtsHtml = availableCourts.map((court) => {
      const isActive =
        (isThisComplexSelected && selectedCourt === court) ||
        (hasOnlyOneCourt && !selectedComplexId);

      return `
        <button 
          class="available-court-btn ${isActive ? "active" : ""}" 
          data-complex-id="${complex.id}" 
          data-court="${court}"
          type="button"
        >
          ${court}
        </button>
      `;
    }).join("");

    const canReserve =
      hasOnlyOneCourt ||
      (isThisComplexSelected && selectedCourtIsAvailable);

    card.innerHTML = `
      <div class="available-top">
        <div>
          <h4>${complex.name}</h4>
          <p>${selectedHour} · Atiende de ${numberToTime(settings.openHour)} a ${numberToTime(settings.closeHour)}</p>
        </div>

        <span class="available-badge">
          ${availableCourts.length} libre${availableCourts.length > 1 ? "s" : ""}
        </span>
      </div>

      <div class="available-courts">
        <div class="available-courts-title">
          Elegí la cancha
        </div>

        <div class="available-court-options">
          ${courtsHtml}
        </div>
      </div>

      <button class="primary-btn reserve-card-btn" ${canReserve ? "" : "disabled"} type="button">
        ${canReserve ? "Reservar acá" : "Elegí una cancha"}
      </button>
    `;

    const courtButtons = card.querySelectorAll(".available-court-btn");

    courtButtons.forEach((button) => {
      button.addEventListener("click", () => {
        selectedComplexId = button.dataset.complexId;
        selectedCourt = button.dataset.court;
        bookingBox.classList.add("hidden");

        renderClientComplexes();
      });
    });

    const reserveButton = card.querySelector(".reserve-card-btn");

    reserveButton.addEventListener("click", () => {
      if (reserveButton.disabled) return;

      let courtToReserve = selectedCourt;

      if (hasOnlyOneCourt && !selectedCourtIsAvailable) {
        courtToReserve = availableCourts[0];
      }

      if (!courtToReserve) {
        alert("Elegí una cancha para reservar.");
        return;
      }

      openBookingForm(complex, courtToReserve);
    });

    container.appendChild(card);
  });

  if (availableCount === 0) {
    container.innerHTML = `
      <div class="empty-state">
        No hay complejos disponibles para ${formatDateForMessage(selectedDate)} a las ${selectedHour}.
        Probá con otro horario.
      </div>
    `;
  }
}

function renderClientCourts() {
  if (!courtsContainer) return;

  courtsContainer.innerHTML = "";

  if (!selectedComplexId) return;

  const courts = getCourtsForComplex(selectedComplexId);

  if (!selectedCourt || !courts.includes(selectedCourt)) {
    selectedCourt = courts[0];
  }

  courts.forEach((court) => {
    const button = document.createElement("button");
    button.className = "court-btn";
    button.textContent = court;

    if (court === selectedCourt) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      selectedCourt = court;
      selectedHour = "";

      bookingBox.classList.add("hidden");

      renderClientCourts();
      renderHours();
    });

    courtsContainer.appendChild(button);
  });
}

function renderOwnerCourts() {
  ownerCourtsContainer.innerHTML = "";

  if (!ownerLoggedComplexId) return;

  const courts = getCourtsForComplex(ownerLoggedComplexId);

  if (!ownerSelectedCourt || !courts.includes(ownerSelectedCourt)) {
    ownerSelectedCourt = courts[0];
  }

  courts.forEach((court) => {
    const item = document.createElement("div");
    item.className = "owner-court-item";

    const button = document.createElement("button");
    button.className = "court-btn";
    button.textContent = court;

    if (court === ownerSelectedCourt) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      ownerSelectedCourt = court;
      ownerCurrentFilter = "all";

      renderOwnerCourts();
      renderOwnerFilters();
      renderOwnerReservations();
      renderOwnerSummary();
      renderOwnerHeader();
    });

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-court-btn";
    deleteButton.textContent = "×";
    deleteButton.title = `Eliminar ${court}`;

    if (courts.length <= 1) {
      deleteButton.disabled = true;
    }

    deleteButton.addEventListener("click", (event) => {
      event.stopPropagation();
      deleteCourtForComplex(ownerLoggedComplexId, court);
    });

    item.appendChild(button);
    item.appendChild(deleteButton);

    ownerCourtsContainer.appendChild(item);
  });
}

function renderOwnerLoginOptions() {
  ownerComplexSelect.innerHTML = "";

  COMPLEXES.forEach((complex) => {
    const option = document.createElement("option");
    option.value = complex.id;
    option.textContent = complex.name;
    ownerComplexSelect.appendChild(option);
  });
}

function renderTimeOptions() {
  openTimeSelect.innerHTML = "";
  closeTimeSelect.innerHTML = "";

  TIME_OPTIONS.forEach((hour) => {
    const openOption = document.createElement("option");
    openOption.value = hour;
    openOption.textContent = numberToTime(hour);
    openTimeSelect.appendChild(openOption);

    const closeOption = document.createElement("option");
    closeOption.value = hour;
    closeOption.textContent = numberToTime(hour);
    closeTimeSelect.appendChild(closeOption);
  });
}

function renderOwnerHourSettings() {
  if (!ownerLoggedComplexId) return;

  const settings = getSettingsForComplex(ownerLoggedComplexId);

  openTimeSelect.value = settings.openHour;
  closeTimeSelect.value = settings.closeHour;
}

function saveOwnerHours() {
  if (!ownerLoggedComplexId) return;

  const openHour = Number(openTimeSelect.value);
  const closeHour = Number(closeTimeSelect.value);

  if (openHour >= closeHour) {
    alert("El horario de cierre tiene que ser mayor al de apertura.");
    return;
  }

  saveSettingsForComplex(ownerLoggedComplexId, openHour, closeHour);

  selectedHour = "";
  selectedComplexId = "";
  selectedCourt = "";
  bookingBox.classList.add("hidden");

  renderClientComplexes();
  renderHours();
  renderOwnerReservations();
  renderOwnerSummary();

  alert("Horarios guardados correctamente.");
}

function handleAddCourt() {
  if (!ownerLoggedComplexId) return;

  const newCourt = addCourtForComplex(ownerLoggedComplexId);

  ownerSelectedCourt = newCourt;
  ownerCurrentFilter = "all";

  renderClientComplexes();
  renderOwnerCourts();
  renderOwnerFilters();
  renderHours();
  renderOwnerReservations();
  renderOwnerSummary();
  renderOwnerHeader();

  alert(`${newCourt} agregada correctamente.`);
}

function renderDays() {
  const days = getNextDays();

  if (!selectedDate) {
    selectedDate = days[0].value;
  }

  daysContainer.innerHTML = "";

  days.forEach((day) => {
    const button = document.createElement("button");
    button.className = "day-btn";

    if (day.value === selectedDate) {
      button.classList.add("active");
    }

    button.innerHTML = `
      <strong>${day.name}</strong>
      <span>${day.number}</span>
    `;

    button.addEventListener("click", () => {
      selectedDate = day.value;
      selectedHour = "";
      selectedComplexId = "";
      selectedCourt = "";

      bookingBox.classList.add("hidden");

      renderDays();
      renderHours();
      renderClientComplexes();
    });

    daysContainer.appendChild(button);
  });
}

function renderOwnerDays() {
  const days = getNextDays();

  if (!ownerSelectedDate) {
    ownerSelectedDate = days[0].value;
  }

  ownerDaysContainer.innerHTML = "";

  days.forEach((day) => {
    const button = document.createElement("button");
    button.className = "day-btn";

    if (day.value === ownerSelectedDate) {
      button.classList.add("active");
    }

    button.innerHTML = `
      <strong>${day.name}</strong>
      <span>${day.number}</span>
    `;

    button.addEventListener("click", () => {
      ownerSelectedDate = day.value;
      ownerCurrentFilter = "all";

      renderOwnerDays();
      renderOwnerFilters();
      renderOwnerReservations();
      renderOwnerSummary();
      renderOwnerHeader();
    });

    ownerDaysContainer.appendChild(button);
  });
}

function renderHours() {
  hoursContainer.innerHTML = "";

  const hours = TIME_OPTIONS.filter((hour) => hour < 24).map(numberToTime);

  hours.forEach((hour) => {
    const button = document.createElement("button");
    button.className = "hour-btn";

    let statusText = "Buscar";
    let statusClass = "free";
    let isDisabled = false;

    if (isPastHour(selectedDate, hour)) {
      statusText = "Ya pasó";
      statusClass = "disabled";
      isDisabled = true;
    }

    if (hour === selectedHour && !isDisabled) {
      button.classList.add("active");
    }

    button.classList.add(statusClass);

    button.innerHTML = `
      <span class="hour-main">${hour}</span>
      <span class="hour-status">${statusText}</span>
    `;

    button.disabled = isDisabled;

    button.addEventListener("click", () => {
      if (button.disabled) return;

      selectedHour = hour;
      selectedComplexId = "";
      selectedCourt = "";

      bookingBox.classList.add("hidden");

      renderHours();
      renderClientComplexes();
    });

    hoursContainer.appendChild(button);
  });
}

function requestReservation() {
  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();

  if (!selectedComplexId || !selectedCourt || !selectedDate || !selectedHour) {
    alert("Elegí día, horario, complejo y cancha.");
    return;
  }

  if (!name || !phone) {
    alert("Completá nombre y WhatsApp.");
    return;
  }

  const existingReservation = getReservationByComplexCourtDateHour(
    selectedComplexId,
    selectedCourt,
    selectedDate,
    selectedHour
  );

  if (existingReservation) {
    alert("Ese horario ya tiene una reserva o está bloqueado.");
    return;
  }

  const complex = getComplexById(selectedComplexId);
  const reservations = getReservations();

  const newReservation = {
    id: Date.now(),
    sport: "Fútbol 5",
    complexId: selectedComplexId,
    complexName: complex.name,
    court: selectedCourt,
    date: selectedDate,
    hour: selectedHour,
    name,
    phone,
    status: "pending"
  };

  reservations.push(newReservation);
  saveReservations(reservations);

  const message = `
Hola! Quiero reservar un turno.

Complejo: ${complex.name}
Cancha: ${selectedCourt}
Día: ${formatDateForMessage(selectedDate)}
Horario: ${selectedHour}
Nombre: ${name}
WhatsApp: ${phone}

Para confirmar la reserva, respondé este mensaje.
`;

  const whatsappUrl = `https://wa.me/${complex.whatsapp}?text=${encodeURIComponent(message)}`;

  window.open(whatsappUrl, "_blank");

  nameInput.value = "";
  phoneInput.value = "";
  selectedComplexId = "";
  selectedCourt = "";
  bookingBox.classList.add("hidden");

  renderHours();
  renderClientComplexes();

  alert("Reserva solicitada. Se abrirá WhatsApp para enviar el mensaje al complejo.");
}

function loginOwner() {
  const selectedId = ownerComplexSelect.value;
  const pin = ownerPinInput.value.trim();

  const complex = getComplexById(selectedId);

  if (!complex) {
    alert("Elegí un complejo válido.");
    return;
  }

  if (pin !== complex.pin) {
    alert("Clave incorrecta.");
    return;
  }

  ownerLoggedComplexId = selectedId;
  ownerSelectedCourt = getCourtsForComplex(selectedId)[0];
  ownerCurrentFilter = "all";
  ownerPinInput.value = "";

  showOwnerPanel();
}

function logoutOwner() {
  ownerLoggedComplexId = null;
  ownerSelectedCourt = "Cancha 1";
  ownerCurrentFilter = "all";
  showOwnerLoginScreen();
}

function getStatusText(status) {
  if (status === "pending") return "Pendiente";
  if (status === "confirmed") return "Confirmada";
  if (status === "blocked") return "Bloqueado";
  return "Libre";
}

function renderOwnerHeader() {
  if (!ownerLoggedComplexId) return;

  const selectedComplex = getComplexById(ownerLoggedComplexId);

  ownerPanelTitle.textContent = selectedComplex.name;
  ownerPanelSubtitle.textContent = `${ownerSelectedCourt} · ${formatDateForMessage(ownerSelectedDate)}`;
}

function renderOwnerSummary() {
  if (!ownerLoggedComplexId || !ownerSelectedCourt) return;

  let free = 0;
  let pending = 0;
  let confirmed = 0;
  let blocked = 0;

  const hours = getHoursForComplex(ownerLoggedComplexId);

  hours.forEach((hour) => {
    const status = getSlotStatus(
      ownerLoggedComplexId,
      ownerSelectedCourt,
      ownerSelectedDate,
      hour
    );

    if (status === "free") free++;
    if (status === "pending") pending++;
    if (status === "confirmed") confirmed++;
    if (status === "blocked") blocked++;
  });

  ownerSummary.innerHTML = `
    <div class="summary-card free">
      <strong>${free}</strong>
      <span>Libres</span>
    </div>

    <div class="summary-card pending">
      <strong>${pending}</strong>
      <span>Pendientes</span>
    </div>

    <div class="summary-card confirmed">
      <strong>${confirmed}</strong>
      <span>Confirmados</span>
    </div>

    <div class="summary-card blocked">
      <strong>${blocked}</strong>
      <span>Bloqueados</span>
    </div>
  `;
}

function renderOwnerFilters() {
  const filterButtons = document.querySelectorAll(".filter-btn");

  filterButtons.forEach((button) => {
    const filter = button.dataset.filter;

    if (filter === ownerCurrentFilter) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  });
}

function renderOwnerReservations() {
  ownerReservations.innerHTML = "";

  if (!ownerLoggedComplexId || !ownerSelectedCourt) return;

  const selectedComplex = getComplexById(ownerLoggedComplexId);
  const hours = getHoursForComplex(ownerLoggedComplexId);

  let visibleCount = 0;

  hours.forEach((hour) => {
    const reservation = getReservationByComplexCourtDateHour(
      ownerLoggedComplexId,
      ownerSelectedCourt,
      ownerSelectedDate,
      hour
    );

    const status = reservation ? reservation.status : "free";

    if (!shouldShowSlot(status)) {
      return;
    }

    visibleCount++;

    const card = document.createElement("div");
    card.className = "owner-card";

    if (!reservation) {
      card.innerHTML = `
        <div class="owner-card-top">
          <div>
            <h4>${hour}</h4>
            <p>${selectedComplex.name}</p>
            <p>${ownerSelectedCourt}</p>
            <p>Horario disponible</p>
          </div>
          <span class="status free">Libre</span>
        </div>

        <div class="owner-actions">
          <button class="block-btn" onclick="blockHour('${ownerLoggedComplexId}', '${ownerSelectedCourt}', '${ownerSelectedDate}', '${hour}')">
            Bloquear
          </button>
          <button class="free-btn" disabled>
            Sin reserva
          </button>
        </div>
      `;
    } else {
      card.innerHTML = `
        <div class="owner-card-top">
          <div>
            <h4>${hour}</h4>
            <p>${reservation.complexName}</p>
            <p>${reservation.court}</p>
            <p>${reservation.name || "Sin nombre"}</p>
            <p>WhatsApp: ${reservation.phone || "-"}</p>
          </div>
          <span class="status ${reservation.status}">
            ${getStatusText(reservation.status)}
          </span>
        </div>

        <div class="owner-actions">
          ${
            reservation.status === "pending"
              ? `
                <button class="accept-btn" onclick="acceptReservation(${reservation.id})">
                  Aceptar
                </button>
                <button class="reject-btn" onclick="rejectReservation(${reservation.id})">
                  Rechazar
                </button>
                <button class="whatsapp-btn" onclick="openClientWhatsapp(${reservation.id})">
                  WhatsApp
                </button>
              `
              : `
                <button class="free-btn" onclick="freeHour(${reservation.id})">
                  Liberar
                </button>
                <button class="reject-btn" onclick="rejectReservation(${reservation.id})">
                  Eliminar
                </button>
                <button class="whatsapp-btn" onclick="openClientWhatsapp(${reservation.id})">
                  WhatsApp
                </button>
              `
          }
        </div>
      `;
    }

    ownerReservations.appendChild(card);
  });

  if (visibleCount === 0) {
    ownerReservations.innerHTML = `
      <div class="empty-state">
        No hay turnos para mostrar con este filtro.
      </div>
    `;
  }
}

function openClientWhatsapp(id) {
  const reservations = getReservations();

  const reservation = reservations.find((item) => {
    return item.id === id;
  });

  if (!reservation || !reservation.phone) {
    alert("Esta reserva no tiene WhatsApp cargado.");
    return;
  }

  let cleanPhone = reservation.phone.replace(/\D/g, "");

  if (cleanPhone.startsWith("0")) {
    cleanPhone = cleanPhone.substring(1);
  }

  if (!cleanPhone.startsWith("54")) {
    cleanPhone = `549${cleanPhone}`;
  }

  const message = `
Hola ${reservation.name || ""}! Te escribimos de ${reservation.complexName}.

Tu reserva:
Cancha: ${reservation.court}
Día: ${formatDateForMessage(reservation.date)}
Horario: ${reservation.hour}

¿Nos confirmás el turno?
`;

  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  window.open(whatsappUrl, "_blank");
}

function acceptReservation(id) {
  const reservations = getReservations();

  const updatedReservations = reservations.map((reservation) => {
    if (
      reservation.id === id &&
      reservation.complexId === ownerLoggedComplexId &&
      reservation.court === ownerSelectedCourt
    ) {
      return {
        ...reservation,
        status: "confirmed"
      };
    }

    return reservation;
  });

  saveReservations(updatedReservations);

  renderHours();
  renderClientComplexes();
  renderOwnerReservations();
  renderOwnerSummary();
}

function rejectReservation(id) {
  const reservations = getReservations();

  const updatedReservations = reservations.filter((reservation) => {
    if (reservation.id !== id) return true;

    const sameComplex = reservation.complexId === ownerLoggedComplexId;
    const sameCourt = reservation.court === ownerSelectedCourt;

    return !(sameComplex && sameCourt);
  });

  saveReservations(updatedReservations);

  renderHours();
  renderClientComplexes();
  renderOwnerReservations();
  renderOwnerSummary();
}

function freeHour(id) {
  rejectReservation(id);
}

function blockHour(complexId, court, date, hour) {
  if (complexId !== ownerLoggedComplexId) {
    alert("No podés administrar este complejo.");
    return;
  }

  if (court !== ownerSelectedCourt) {
    alert("No podés administrar esta cancha.");
    return;
  }

  const existingReservation = getReservationByComplexCourtDateHour(
    complexId,
    court,
    date,
    hour
  );

  if (existingReservation) {
    alert("Ese horario ya tiene una reserva.");
    return;
  }

  const complex = getComplexById(complexId);
  const reservations = getReservations();

  reservations.push({
    id: Date.now(),
    sport: "Fútbol 5",
    complexId,
    complexName: complex.name,
    court,
    date,
    hour,
    name: "Bloqueado por el dueño",
    phone: "-",
    status: "blocked"
  });

  saveReservations(reservations);

  renderHours();
  renderClientComplexes();
  renderOwnerReservations();
  renderOwnerSummary();
}

function clearOwnerReservations() {
  if (!ownerLoggedComplexId) return;

  const confirmDelete = confirm(
    `¿Seguro que querés borrar las reservas de ${ownerSelectedCourt}?`
  );

  if (!confirmDelete) return;

  const reservations = getReservations();

  const updatedReservations = reservations.filter((reservation) => {
    return !(
      reservation.complexId === ownerLoggedComplexId &&
      reservation.court === ownerSelectedCourt
    );
  });

  saveReservations(updatedReservations);

  renderHours();
  renderClientComplexes();
  renderOwnerReservations();
  renderOwnerSummary();
}

function hideAllScreens() {
  clientScreen.classList.remove("active");
  ownerLoginScreen.classList.remove("active");
  ownerScreen.classList.remove("active");
}

function showClientScreen() {
  hideAllScreens();

  clientScreen.classList.add("active");

  navClient.classList.add("active");
  navOwner.classList.remove("active");

  renderDays();
  renderHours();
  renderClientComplexes();
}

function showOwnerLoginScreen() {
  hideAllScreens();

  ownerLoginScreen.classList.add("active");

  navOwner.classList.add("active");
  navClient.classList.remove("active");

  renderOwnerLoginOptions();
}

function showOwnerPanel() {
  hideAllScreens();

  ownerScreen.classList.add("active");

  navOwner.classList.add("active");
  navClient.classList.remove("active");

  renderTimeOptions();
  renderOwnerHourSettings();
  renderOwnerCourts();
  renderOwnerDays();
  renderOwnerFilters();
  renderOwnerHeader();
  renderOwnerReservations();
  renderOwnerSummary();
}

function handleOwnerNavigation() {
  if (ownerLoggedComplexId) {
    showOwnerPanel();
  } else {
    showOwnerLoginScreen();
  }
}

requestBtn.addEventListener("click", requestReservation);

ownerBtn.addEventListener("click", handleOwnerNavigation);
navOwner.addEventListener("click", handleOwnerNavigation);
navClient.addEventListener("click", showClientScreen);

ownerLoginBtn.addEventListener("click", loginOwner);
logoutOwnerBtn.addEventListener("click", logoutOwner);

saveHoursBtn.addEventListener("click", saveOwnerHours);
addCourtBtn.addEventListener("click", handleAddCourt);

clearBtn.addEventListener("click", clearOwnerReservations);

document.querySelectorAll(".filter-btn").forEach((button) => {
  button.addEventListener("click", () => {
    ownerCurrentFilter = button.dataset.filter;

    renderOwnerFilters();
    renderOwnerReservations();
  });
});

renderDays();
renderHours();
renderClientComplexes();
renderOwnerLoginOptions();
