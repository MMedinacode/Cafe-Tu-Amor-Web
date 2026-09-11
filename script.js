/* ============================================================
   CAFÉ TU AMOR — datos y lógica
   ============================================================
   ⚠️ SIN PRECIOS. El local no publica carta. Google sí registra un rango
   de gasto ($5.000–10.000 por persona, informado por 10 clientes), pero
   eso es un dato agregado de Google, NO el precio de un producto: se
   cita como tal en la pestaña Carta y nunca se asigna a un ítem.

   Los productos listados salen de sus reseñas reales y de las fotos de
   su ficha. Ninguno inventado. Pedirle la carta al local.
   ============================================================ */

const MENU = {
  cafeteria: {
    label: 'Cafetería',
    items: [
      { n:'Café',            d:'De la barra del local' },
      { n:'Bebidas frías',   d:'Refrigerador a la vista en el salón' },
    ]
  },
  cocina: {
    label: 'Para comer',
    items: [
      { n:'Platos del día',  d:'"Creo que he comido de todo" — de una reseña real de clienta frecuente' },
      { n:'Salsa de ajo',    d:'Mencionada por nombre como lo mejor en una reseña real' },
    ]
  },
  vitrina: {
    label: 'Vitrina',
    items: [
      { n:'Pastelería',      d:'Vitrina refrigerada a la entrada del local', img:'fotos/local.jpg' },
      { n:'Dulces del día',  d:'"Los productos que ofrecen, todo muy rico y variado" — reseña real' },
    ]
  }
};

/* ---------- RENDER DE LA CARTA ---------- */
const tabsEl   = document.getElementById('menuTabs');
const panelsEl = document.getElementById('menuPanels');

Object.keys(MENU).forEach((key, i) => {
  const tab = document.createElement('button');
  tab.className = 'menu-tab' + (i === 0 ? ' active' : '');
  tab.type = 'button';
  tab.textContent = MENU[key].label;
  tab.dataset.key = key;
  tab.setAttribute('role', 'tab');
  tab.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
  tab.addEventListener('click', () => showTab(key));
  tabsEl.appendChild(tab);

  const panel = document.createElement('div');
  panel.className = 'menu-panel' + (i === 0 ? ' active' : '');
  panel.id = 'panel-' + key;

  const grid = document.createElement('div');
  grid.className = 'menu-grid';

  MENU[key].items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'menu-item reveal';

    if (item.img) {
      const foto = document.createElement('div');
      const im = document.createElement('img');
      im.src = item.img; im.alt = item.n; im.loading = 'lazy';
      im.style.cssText = 'width:58px;height:58px;object-fit:cover;border-radius:12px;';
      foto.appendChild(im);
      row.appendChild(foto);
    }

    const texto = document.createElement('div');
    texto.className = 'menu-item-text';
    const nombre = document.createElement('span');
    nombre.className = 'name';
    nombre.textContent = item.n;
    texto.appendChild(nombre);

    if (item.d) {
      const desc = document.createElement('div');
      desc.className = 'desc';
      desc.textContent = item.d;
      texto.appendChild(desc);
    }

    // Sin precio publicado: "Consultar", nunca un monto inventado.
    const precio = document.createElement('div');
    precio.className = 'price';
    precio.textContent = 'Consultar';

    row.appendChild(texto);
    row.appendChild(precio);
    grid.appendChild(row);
  });

  panel.appendChild(grid);
  panelsEl.appendChild(panel);
});

function showTab(key) {
  document.querySelectorAll('.menu-tab').forEach(t => {
    const activo = t.dataset.key === key;
    t.classList.toggle('active', activo);
    t.setAttribute('aria-selected', activo ? 'true' : 'false');
  });
  document.querySelectorAll('.menu-panel').forEach(p => {
    p.classList.toggle('active', p.id === 'panel-' + key);
  });
  initScrollReveal();
}

/* ---------- NAVEGACIÓN POR PESTAÑAS ---------- */
const navLinks = document.getElementById('navLinks');

function goToTab(tabId) {
  document.querySelectorAll('.tab-panel').forEach(p => {
    p.classList.toggle('active', p.dataset.tabPanel === tabId);
  });
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.tab === tabId);
  });
  navLinks.classList.remove('open');
  document.getElementById('navToggle').setAttribute('aria-expanded', 'false');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  initScrollReveal();
}

document.querySelectorAll('[data-tab]').forEach(el => {
  el.addEventListener('click', e => { e.preventDefault(); goToTab(el.dataset.tab); });
});

document.getElementById('navToggle').addEventListener('click', function () {
  const abierto = navLinks.classList.toggle('open');
  this.setAttribute('aria-expanded', abierto ? 'true' : 'false');
});

/* ---------- INDICADOR ABIERTO / CERRADO ----------
   Horario CONFIRMADO en la bio de su Instagram (@loicascafeteria):
   Lunes a jueves 14:00–20:00 · Viernes a domingo 14:00–21:00. */
function horarioDeHoy() {
  // ⚠️ Google solo confirma que CIERRA a las 21:00. La hora de apertura no
  // está publicada: se asume 09:00–21:00 como estimación y así se declara
  // en la pestaña Visítanos. Confirmar con el local.
  return [9 * 60, 21 * 60];
}

function actualizarEstado(dotId, textId) {
  const dot  = document.getElementById(dotId);
  const text = document.getElementById(textId);
  if (!dot || !text) return;
  const ahora   = new Date();
  const minutos = ahora.getHours() * 60 + ahora.getMinutes();
  const h       = horarioDeHoy();
  const abierto = minutos >= h[0] && minutos < h[1];
  text.textContent = abierto ? 'Abierto ahora' : 'Cerrado ahora';
  dot.classList.toggle('closed', !abierto);
}

actualizarEstado('statusDot', 'statusText');
actualizarEstado('statusDot2', 'statusText2');
actualizarEstado('statusDot3', 'statusText3');

/* ---------- SCROLL REVEAL (con red de seguridad) ---------- */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal:not(.in)');
  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach((el, i) => {
    el.style.transitionDelay = (Math.min(i % 6, 6) * 55) + 'ms';
    io.observe(el);
  });

  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.in)').forEach(el => el.classList.add('in'));
  }, 1200);
}
initScrollReveal();

/* ---------- PANTALLA DE CARGA ---------- */
window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('loader').classList.add('done'), 320);
});

// Marca en la lista de horario el día de hoy. La lista es estática en el
// HTML a propósito: si el JS falla, el horario igual se lee.
function marcarDiaDeHoy() {
  const hoy = new Date().getDay();
  document.querySelectorAll('.horario-semana li[data-dia]').forEach(function (li) {
    li.classList.toggle('hs-hoy', Number(li.dataset.dia) === hoy);
  });
}
marcarDiaDeHoy();
