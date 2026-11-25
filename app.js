// Diario de EStudio: versión 1, sin frameworks ni librerías.

const CLAVE_GUARDADO = "diarioDeEStudio.sesiones";

// Buscamos los elementos de la página que vamos a usar.
const formulario = document.getElementById("formulario");
const campoFecha = document.getElementById("fecha");
const campoTema = document.getElementById("tema");
const campoMinutos = document.getElementById("minutos");
const lista = document.getElementById("lista");
const rachaNumero = document.getElementById("racha-numero");
const rachaMasLargaNumero = document.getElementById("racha-mas-larga-numero");

// Cargamos las sesiones guardadas antes de dibujar nada.
let sesiones = cargarSesiones();

// La fecha por defecto es hoy, pero el usuario puede cambiarla.
campoFecha.value = fechaComoTexto(new Date());

dibujarRacha();
dibujarRachaMasLarga();
dibujarLista();

formulario.addEventListener("submit", function (evento) {
  // Evitamos que el formulario recargue la página.
  evento.preventDefault();

  const fecha = campoFecha.value;
  const tema = campoTema.value.trim();
  const minutos = Number(campoMinutos.value);

  // Comprobamos los datos obligatorios.
  if (fecha === "" || tema === "" || !Number.isFinite(minutos) || minutos <= 0) {
    return;
  }

  // Añadimos la sesión al principio: así la más nueva va primero.
  sesiones.unshift({ fecha: fecha, tema: tema, minutos: minutos });

  guardarSesiones();
  dibujarRacha();
  dibujarRachaMasLarga();
  dibujarLista();

  // Dejamos el formulario listo para la siguiente sesión.
  campoTema.value = "";
  campoMinutos.value = "";
  campoFecha.value = fechaComoTexto(new Date());
  campoTema.focus();
});

// ---------- Fechas locales (nunca UTC) ----------

// Convierte una fecha en texto "AAAA-MM-DD" usando la hora del usuario.
function fechaComoTexto(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return anio + "-" + mes + "-" + dia;
}

// Avanza o retrocede un día sin líos de horarios de verano.
// Ponemos la hora a mediodía para que cambiar el día sea siempre seguro.
function diaSiguiente(fecha, cuantosDias) {
  const copia = new Date(fecha);
  copia.setHours(12, 0, 0, 0);
  copia.setDate(copia.getDate() + cuantosDias);
  return copia;
}

// ---------- Racha ----------

function calcularRacha() {
  // Un conjunto guarda solo las fechas que tienen al menos una sesión.
  const diasConSesion = new Set();
  for (const sesion of sesiones) {
    diasConSesion.add(sesion.fecha);
  }

  let dia = new Date();

  // Si hoy aún no ha estudiado, empezamos por ayer:
  // la racha no se rompe hasta que termine el día de hoy.
  if (!diasConSesion.has(fechaComoTexto(dia))) {
    dia = diaSiguiente(dia, -1);
  }

  let racha = 0;
  while (diasConSesion.has(fechaComoTexto(dia))) {
    racha++;
    dia = diaSiguiente(dia, -1);
  }

  return racha;
}

function dibujarRacha() {
  rachaNumero.textContent = calcularRacha();
}

// La mejor racha es el tramo consecutivo más largo de toda la historia.
function calcularRachaMasLarga() {
  const diasConSesion = Array.from(new Set(sesiones.map(function (sesion) {
    return sesion.fecha;
  }))).sort();

  let mejor = 0;
  let actual = 0;
  let diaAnterior = null;

  for (const dia of diasConSesion) {
    // "AAAA-MM-DD" se convierte con hora local: new Date("AAAA-MM-DD") sería UTC.
    const siguienteDelAnterior = diaAnterior === null
      ? null
      : fechaComoTexto(diaSiguiente(new Date(diaAnterior + "T12:00:00"), 1));

    actual = siguienteDelAnterior === dia ? actual + 1 : 1;
    if (actual > mejor) mejor = actual;
    diaAnterior = dia;
  }

  return mejor;
}

function dibujarRachaMasLarga() {
  rachaMasLargaNumero.textContent = calcularRachaMasLarga();
}

// ---------- Lista ----------

function dibujarLista() {
  lista.textContent = "";

  if (sesiones.length === 0) {
    const mensaje = document.createElement("p");
    mensaje.className = "vacio";
    mensaje.textContent = "Todavía no hay sesiones. ¡Anota la primera!";
    lista.appendChild(mensaje);
    return;
  }

  // Ordenamos por fecha: primero la más reciente.
  // Como las nuevas se añaden al principio, las de un mismo día
  // también se muestran de la más reciente a la más antigua.
  const ordenadas = sesiones.slice().sort(function (a, b) {
    if (a.fecha > b.fecha) return -1;
    if (a.fecha < b.fecha) return 1;
    return 0;
  });

  for (const sesion of ordenadas) {
    const item = document.createElement("li");
    item.className = "elemento";

    const tema = document.createElement("span");
    tema.className = "tema";
    tema.textContent = sesion.tema;

    const detalles = document.createElement("span");
    detalles.className = "detalles";

    // "AAAA-MM-DD" se muestra como "DD/MM/AAAA", más familiar en español.
    const partes = sesion.fecha.split("-");
    detalles.textContent = partes[2] + "/" + partes[1] + "/" + partes[0] + " · " + sesion.minutos + " min";

    item.appendChild(tema);
    item.appendChild(detalles);
    lista.appendChild(item);
  }
}

// ---------- Guardado en el navegador ----------

function cargarSesiones() {
  try {
    const guardado = localStorage.getItem(CLAVE_GUARDADO);
    return guardado ? JSON.parse(guardado) : [];
  } catch (error) {
    // Si el navegador no permite leer, seguimos con una lista vacía.
    return [];
  }
}

function guardarSesiones() {
  try {
    localStorage.setItem(CLAVE_GUARDADO, JSON.stringify(sesiones));
  } catch (error) {
    // Si no se puede guardar, la web sigue funcionando mientras esté abierta.
  }
}
