const FAVORITES_KEY = 'vertice_favorites';
const customVehiclesKey = 'vertice_custom_vehicles';
const categoryCards = [...document.querySelectorAll('.category-card')];
const grid = document.getElementById('vehicle-grid');
const modal = document.getElementById('vehicle-modal');
const favoriteToggle = document.getElementById('favorites-toggle');
const favoriteCount = document.getElementById('favorites-count');
let currentCategory = 'Todos';
let favoritesOnly = false;

const readFavorites = () => {
  try { return new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]')); }
  catch { return new Set(); }
};
const vehicleKey = card => card.dataset.adminId || card.querySelector('h3').textContent;
const favorites = readFavorites();

function updateFavoriteUI() {
  document.querySelectorAll('.vehicle-card').forEach(card => {
    const button = card.querySelector('.heart');
    if (!button) return;
    const liked = favorites.has(vehicleKey(card));
    button.classList.toggle('liked', liked);
    button.textContent = liked ? '♥' : '♡';
    button.setAttribute('aria-pressed', String(liked));
    button.setAttribute('aria-label', `${liked ? 'Remover' : 'Adicionar'} ${card.querySelector('h3').textContent} ${liked ? 'dos' : 'aos'} favoritos`);
  });
  favoriteCount.textContent = favorites.size;
  favoriteCount.hidden = favorites.size === 0;
  favoriteToggle.setAttribute('aria-pressed', String(favoritesOnly));
  favoriteToggle.setAttribute('aria-label', favoritesOnly ? 'Mostrar todas as viaturas' : 'Mostrar favoritos');
  filterVehicles();
}

function updateCategoryCounts() {
  categoryCards.forEach(button => {
    const category = button.dataset.category;
    const count = [...document.querySelectorAll('.vehicle-card')]
      .filter(card => category === 'Todos' || card.dataset.category === category).length;
    button.querySelector('small').textContent = `${count} ${count === 1 ? 'viatura' : 'viaturas'}`;
  });
}

function filterVehicles() {
  const brand = document.getElementById('brand').value;
  const maxPrice = Number(document.getElementById('price').value || Infinity);
  const minYear = Number(document.getElementById('year').value || 0);
  const fuel = document.getElementById('fuel').value;
  const transmission = document.getElementById('transmission').value;
  let visible = 0;
  document.querySelectorAll('.vehicle-card').forEach(card => {
    const matches = (!brand || card.dataset.brand === brand)
      && Number(card.dataset.price) <= maxPrice
      && Number(card.dataset.year) >= minYear
      && (!fuel || card.dataset.fuel === fuel)
      && (!transmission || card.dataset.transmission === transmission)
      && (currentCategory === 'Todos' || card.dataset.category === currentCategory)
      && (!favoritesOnly || favorites.has(vehicleKey(card)));
    card.hidden = !matches;
    if (matches) visible++;
  });
  document.getElementById('no-results').hidden = visible > 0;
  document.getElementById('no-results').textContent = favoritesOnly && favorites.size === 0
    ? 'Ainda não guardou nenhuma viatura nos favoritos.'
    : 'Não encontrámos viaturas com estes filtros. Tente ajustar a pesquisa.';
}

function syncBrandOptions() {
  const select = document.getElementById('brand');
  const selected = select.value;
  const brands = [...new Set([...document.querySelectorAll('.vehicle-card')].map(card => card.dataset.brand))].sort();
  select.replaceChildren(new Option('Todas as marcas', ''));
  brands.forEach(brand => select.add(new Option(brand, brand)));
  select.value = brands.includes(selected) ? selected : '';
}

document.querySelector('.search-form').addEventListener('submit', event => {
  event.preventDefault();
  filterVehicles();
  document.getElementById('viaturas').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

document.querySelector('.tab').addEventListener('click', () => document.getElementById('brand').focus());

categoryCards.forEach(button => button.addEventListener('click', () => {
  currentCategory = button.dataset.category;
  categoryCards.forEach(item => item.classList.toggle('active', item === button));
  filterVehicles();
  document.getElementById('viaturas').scrollIntoView({ behavior: 'smooth', block: 'start' });
}));

document.querySelectorAll('#brand, #price, #year, #fuel, #transmission').forEach(select => {
  select.addEventListener('change', filterVehicles);
});

document.querySelector('.more-filters').addEventListener('click', event => {
  const button = event.currentTarget;
  const panel = document.getElementById('advanced-filters');
  const expanded = button.getAttribute('aria-expanded') !== 'true';
  button.setAttribute('aria-expanded', String(expanded));
  button.textContent = expanded ? '− Menos filtros' : '+ Mais filtros';
  panel.hidden = !expanded;
});

favoriteToggle.addEventListener('click', () => {
  favoritesOnly = !favoritesOnly;
  updateFavoriteUI();
  document.getElementById('viaturas').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

grid.addEventListener('click', event => {
  const button = event.target.closest('.heart');
  if (!button) return;
  event.stopPropagation();
  const card = button.closest('.vehicle-card');
  const key = vehicleKey(card);
  if (favorites.has(key)) favorites.delete(key); else favorites.add(key);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
  updateFavoriteUI();
});

document.querySelectorAll('[data-rotate]').forEach(button => button.addEventListener('click', () => {
  const visibleCards = [...grid.querySelectorAll('.vehicle-card:not([hidden])')];
  if (visibleCards.length < 2) return;
  if (button.dataset.rotate === '1') grid.append(visibleCards[0]);
  else grid.prepend(visibleCards[visibleCards.length - 1]);
}));

const detailsByTitle = {
  'X3 xDrive20d Pack M': { transmission: 'Automática', power: '190 cv', color: 'Cinzento', description: 'Um SUV elegante e dinâmico, equipado com Pack M, navegação, câmara traseira e sensores de estacionamento.' },
  'Classe C 220 d AMG Line': { transmission: 'Automática', power: '200 cv', color: 'Preto', description: 'Conforto, tecnologia e uma condução refinada. Inclui pack AMG Line, faróis LED e sistema MBUX.' },
  '3008 1.5 BlueHDi Allure': { transmission: 'Manual', power: '130 cv', color: 'Azul', description: 'SUV versátil e bem equipado, com i-Cockpit, Apple CarPlay, sensores dianteiros e traseiros e histórico completo.' },
  'XC40 Recharge Core': { transmission: 'Automática', power: '231 cv', color: 'Branco', description: 'A mobilidade elétrica Volvo com segurança de referência, autonomia para o dia a dia e carregamento rápido.' }
};

function openVehicleModal(card) {
  const title = card.querySelector('h3').textContent;
  const brand = card.querySelector('.vehicle-info p').textContent;
  const image = card.querySelector('img');
  const meta = [...card.querySelectorAll('.vehicle-meta span')].filter(item => item.textContent !== '•').map(item => item.textContent);
  const details = detailsByTitle[title] || {
    transmission: card.dataset.transmission || 'Sob consulta', power: 'Sob consulta', color: 'Sob consulta',
    description: card.dataset.description || 'Contacte-nos para obter mais informações sobre esta viatura.'
  };
  const badge = card.querySelector('.badge');
  document.getElementById('modal-image').src = image.src;
  document.getElementById('modal-image').alt = image.alt;
  document.getElementById('modal-brand').textContent = brand;
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-price').textContent = card.querySelector('.vehicle-price strong').textContent;
  document.getElementById('modal-description').textContent = details.description;
  const specs = [
    ['Ano', meta[0]], ['Quilometragem', meta[1]], ['Combustível', meta[2]],
    ['Caixa', details.transmission], ['Potência', details.power], ['Cor', details.color]
  ];
  const specsContainer = document.getElementById('modal-specs');
  specsContainer.replaceChildren(...specs.map(([label, value]) => {
    const item = document.createElement('span');
    const strong = document.createElement('strong');
    item.textContent = label;
    strong.textContent = value || 'Sob consulta';
    item.append(strong);
    return item;
  }));
  const modalBadge = document.getElementById('modal-badge');
  modalBadge.hidden = !badge;
  if (badge) { modalBadge.textContent = badge.textContent; modalBadge.className = badge.className; }
  const subject = encodeURIComponent(`Interesse: ${brand} ${title}`);
  const message = encodeURIComponent(`Olá, tenho interesse na viatura ${brand} ${title}. Pode enviar-me mais informações?`);
  document.getElementById('email-link').href = `mailto:geral@verticeautomoveis.pt?subject=${subject}&body=${message}`;
  document.getElementById('interest-button').onclick = () => { window.location.href = `mailto:geral@verticeautomoveis.pt?subject=${subject}&body=${message}`; };
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  modal.querySelector('.modal-close').focus();
}

grid.addEventListener('click', event => {
  const card = event.target.closest('.vehicle-card');
  if (card && !event.target.closest('.heart')) openVehicleModal(card);
});
grid.addEventListener('keydown', event => {
  const card = event.target.closest('.vehicle-card');
  if (card && !event.target.closest('button, a, input, select, textarea') && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    openVehicleModal(card);
  }
});

function closeVehicleModal() {
  modal.hidden = true;
  document.body.style.overflow = '';
}
document.querySelectorAll('[data-close-modal]').forEach(button => button.addEventListener('click', closeVehicleModal));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !modal.hidden) closeVehicleModal(); });

const menuButton = document.querySelector('.menu-button');
const mobileNav = document.getElementById('mobile-nav');
menuButton.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(expanded));
  menuButton.setAttribute('aria-label', expanded ? 'Fechar menu' : 'Abrir menu');
  mobileNav.hidden = !expanded;
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  mobileNav.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menu');
}));

const advancedPanel = document.getElementById('advanced-filters');
advancedPanel.hidden = true;

function renderAdminVehicles() {
  let vehicles = [];
  try { vehicles = JSON.parse(localStorage.getItem(customVehiclesKey) || '[]'); }
  catch { vehicles = []; }
  vehicles.forEach(vehicle => {
    if (grid.querySelector(`[data-admin-id="${CSS.escape(vehicle.id)}"]`)) return;
    const card = document.createElement('article');
    card.className = 'vehicle-card';
    card.tabIndex = 0;
    card.tabIndex = 0;
    card.dataset.adminId = vehicle.id;
    card.dataset.brand = vehicle.brand;
    card.dataset.price = vehicle.price;
    card.dataset.year = vehicle.year;
    card.dataset.category = vehicle.category;
    card.dataset.fuel = vehicle.fuel;
    card.dataset.transmission = vehicle.transmission;
    card.dataset.description = vehicle.description;
    const info = document.createElement('div');
    info.className = 'vehicle-info';
    info.innerHTML = `<p></p><h3></h3><div class="vehicle-meta"><span></span><span>•</span><span></span><span>•</span><span></span></div><div class="vehicle-price"><strong></strong></div>`;
    info.querySelector('p').textContent = vehicle.brand;
    info.querySelector('h3').textContent = vehicle.model;
    const meta = info.querySelectorAll('.vehicle-meta span');
    meta[0].textContent = vehicle.year;
    meta[2].textContent = `${new Intl.NumberFormat('pt-PT').format(vehicle.mileage)} km`;
    meta[4].textContent = vehicle.fuel;
    info.querySelector('.vehicle-price strong').textContent = `${new Intl.NumberFormat('pt-PT').format(vehicle.price)} €`;
    const imageWrap = document.createElement('div');
    imageWrap.className = 'car-image';
    const image = document.createElement('img');
    image.src = vehicle.image;
    image.alt = `${vehicle.brand} ${vehicle.model}`;
    const badge = document.createElement('span');
    badge.className = 'badge green';
    badge.textContent = 'Disponível';
    const heart = document.createElement('button');
    heart.className = 'heart';
    heart.type = 'button';
    heart.textContent = '♡';
    imageWrap.append(image, badge, heart);
    card.append(imageWrap, info);
    grid.prepend(card);
  });
  syncBrandOptions();
  updateCategoryCounts();
  updateFavoriteUI();
}

renderAdminVehicles();
