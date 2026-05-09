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
    openDays: [1,2,3,4,5,6,0],
    openTime: "17:00",
    closeTime: "23:00",
    courts: [
      { id: 1, name: "Cancha disponible", type: "Descubierta" }
    ]
  },
  extraComplexes: [
    { name: "La Terminal", sport: "futbol5", price: 70000, phone: "5493492658427" },
    { name: "La Gambeta", sport: "futbol5", price: 70000, phone: "5493492318184" }
  ],
  reservations: []
};

let appData = loadData();

expirePendingReservations();

function loadData() {
  const saved = localStorage.getItem("miTurnoV16");

  if(saved){
    return JSON.parse(saved);
  }

  localStorage.setItem(
    "miTurnoV16",
    JSON.stringify(appDataDefault)
  );

  return structuredClone(appDataDefault);
}

function saveData(){
  localStorage.setItem(
    "miTurnoV16",
    JSON.stringify(appData)
  );
}

function nowTimestamp(){
  return Date.now();
}

function expirePendingReservations(){

  let changed = false;

  appData.reservations.forEach(reservation => {

    if(
      reservation.status === "pendiente" &&
      reservation.expiresAt &&
      nowTimestamp() > reservation.expiresAt
    ){
      reservation.status = "expirada";
      changed = true;
    }

  });

  if(changed){
    saveData();
  }
}

setInterval(() => {

  expirePendingReservations();

  if(selectedSport && selectedDate){
    renderTimes();
  }

  if(
    $("ownerPanel")
    .classList
    .contains("active")
  ){
    renderPendingReservations();
  }

},10000);

function show(screen){
  screens.forEach(id =>
    $(id).classList.remove("active")
  );

  $(screen)
    .classList
    .add("active");
}

function normalizePhone(phone){

  const clean =
    phone.replace(/\D/g,"");

  if(clean.length < 10){
    return null;
  }

  if(clean.startsWith("54")){
    return clean;
  }

  return `549${clean}`;
}

function formatDate(dateString){

  return new Date(
    dateString+"T00:00:00"
  ).toLocaleDateString(
    "es-AR",
    {
      day:"2-digit",
      month:"2-digit"
    }
  );
}

function renderPendingReservations(){

  const pending =
    appData.reservations.filter(
      r =>
        r.complexName ===
        appData.complex.name &&
        r.status === "pendiente"
    );

  $("pendingList").innerHTML = "";

  pending.forEach(reservation => {

    const card =
      document.createElement("div");

    card.className =
      "owner-card";

    card.innerHTML = `
      <h4>Nueva solicitud</h4>
      <p>${reservation.name}</p>
      <p>${reservation.time}</p>

      <div class="owner-actions">
        <button class="success">
          Confirmar
        </button>

        <button class="danger">
          Rechazar
        </button>
      </div>
    `;

    card
      .querySelector(".success")
      .onclick = () => {

      reservation.status =
        "confirmada";

      saveData();

      renderPendingReservations();
      renderTimes();

    };

    card
      .querySelector(".danger")
      .onclick = () => {

      reservation.status =
        "rechazada";

      saveData();

      renderPendingReservations();
      renderTimes();

    };

    $("pendingList")
      .appendChild(card);

  });
}

$("reserveForm").onsubmit = e => {

  e.preventDefault();

  const name =
    $("clientName")
    .value
    .trim();

  const phone =
    normalizePhone(
      $("clientPhone")
      .value
    );

  const reservation = {

    id: Date.now(),

    name,
    phone,

    sport:
      selectedSport,

    complexName:
      selectedCourt
      .complexName,

    complexPhone:
      selectedCourt
      .phone,

    courtId:
      selectedCourt.id,

    courtName:
      selectedCourt.name,

    date:
      selectedDate,

    time:
      selectedTime,

    status:
      "pendiente",

    createdAt:
      nowTimestamp(),

    expiresAt:

      nowTimestamp()

      +

      (
        PENDING_MINUTES *
        60 *
        1000
      )

  };

  appData
    .reservations
    .push(
      reservation
    );

  saveData();

  $("statusEmoji")
    .textContent =
      "🟡";

  $("statusTitle")
    .textContent =
      "Solicitud enviada";

  $("statusText")
    .textContent =
      "Abrí WhatsApp para enviar.";

  show("status");
};
