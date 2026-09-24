const tabs = document.querySelectorAll('.tab');
const categoryCards = document.querySelectorAll('.category-card');
const cards = document.querySelectorAll('.vehicle-card');
let currentCategory = 'Todos';

tabs.forEach(tab => tab.addEventListener('click', () => {
  tabs.forEach(item => { item.classList.remove('active'); item.setAttribute('aria-selected', 'false'); });
  tab.classList.add('active');
  tab.setAttribute('aria-selected', 'true');
}));

document.querySelectorAll('.heart').forEach(button => button.addEventListener('click', () => {
  button.classList.toggle('liked');
  button.textContent = button.classList.contains('liked') ? '♥' : '♡';
}));

categoryCards.forEach(card => card.addEventListener('click', () => {
  currentCategory = card.dataset.category;
  categoryCards.forEach(item => item.classList.remove('active'));
  card.classList.add('active');
  filterVehicles();
}));

document.getElementById('vehicle-search').addEventListener('submit', event => {
  event.preventDefault();
  filterVehicles();
  document.getElementById('viaturas').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

function filterVehicles() {
  const visibleCards = document.querySelectorAll('.vehicle-card');
  const brand = document.getElementById('brand').value;
  const maxPrice = Number(document.getElementById('price').value || Infinity);
  const minYear = Number(document.getElementById('year').value || 0);
  let visible = 0;
  visibleCards.forEach(card => {
    const matches = (!brand || card.dataset.brand === brand) && Number(card.dataset.price) <= maxPrice && Number(card.dataset.year) >= minYear && (currentCategory === 'Todos' || card.dataset.category === currentCategory);
    card.hidden = !matches;
    if (matches) visible++;
  });
  document.getElementById('no-results').hidden = visible !== 0;
}

const modal = document.getElementById('vehicle-modal');
const vehicleDetails = {
  'X3 xDrive20d Pack M': { transmission: 'Automática', power: '190 cv', color: 'Cinzento', description: 'Um SUV elegante e dinâmico, equipado com Pack M, navegação, câmara traseira e sensores de estacionamento.' },
  'Classe C 220 d AMG Line': { transmission: 'Automática', power: '200 cv', color: 'Preto', description: 'Conforto, tecnologia e uma condução refinada. Inclui pack AMG Line, faróis LED e sistema MBUX.' },
  '3008 1.5 BlueHDi Allure': { transmission: 'Manual', power: '130 cv', color: 'Azul', description: 'SUV versátil e bem equipado, com i-Cockpit, Apple CarPlay, sensores dianteiros e traseiros e histórico completo.' },
  'XC40 Recharge Core': { transmission: 'Automática', power: '231 cv', color: 'Branco', description: 'A mobilidade elétrica Volvo com segurança de referência, autonomia para o dia a dia e carregamento rápido.' }
};

cards.forEach(card => card.addEventListener('click', event => {
  if (event.target.closest('.heart')) return;
  openVehicleModal(card);
}));

function openVehicleModal(card) {
  const title = card.querySelector('h3').textContent;
  const brand = card.querySelector('.vehicle-info p').textContent;
  const image = card.querySelector('img');
  const meta = [...card.querySelectorAll('.vehicle-meta span')].filter(item => item.textContent !== '•').map(item => item.textContent);
  const details = vehicleDetails[title];
  const price = card.querySelector('.vehicle-price strong').textContent;
  const badge = card.querySelector('.badge');

  document.getElementById('modal-image').src = image.src;
  document.getElementById('modal-image').alt = image.alt;
  document.getElementById('modal-brand').textContent = brand;
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-price').textContent = price;
  document.getElementById('modal-description').textContent = details.description;
  document.getElementById('modal-specs').innerHTML = [
    ['Ano', meta[0]], ['Quilometragem', meta[1]], ['Combustível', meta[2]],
    ['Caixa', details.transmission], ['Potência', details.power], ['Cor', details.color]
  ].map(([label, value]) => `<span>${label}<strong>${value}</strong></span>`).join('');

  const modalBadge = document.getElementById('modal-badge');
  modalBadge.hidden = !badge;
  if (badge) { modalBadge.textContent = badge.textContent; modalBadge.className = badge.className; }
  const message = encodeURIComponent(`Olá, tenho interesse na viatura ${brand} ${title}. Pode enviar-me mais informações?`);
  document.getElementById('whatsapp-link').href = `https://wa.me/351210000000?text=${message}`;
  document.getElementById('interest-button').onclick = () => { window.location.href = `mailto:geral@verticeautomoveis.pt?subject=${encodeURIComponent(`Interesse: ${brand} ${title}`)}`; };
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  modal.querySelector('.modal-close').focus();
}

function closeVehicleModal() {
  modal.hidden = true;
  document.body.style.overflow = '';
}

document.querySelectorAll('[data-close-modal]').forEach(button => button.addEventListener('click', closeVehicleModal));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !modal.hidden) closeVehicleModal(); });

function renderAdminVehicles() {
  const customVehicles = JSON.parse(localStorage.getItem('vertice_custom_vehicles') || '[]');
  const grid = document.getElementById('vehicle-grid');
  customVehicles.forEach(vehicle => {
    if (document.querySelector(`[data-admin-id="${vehicle.id}"]`)) return;
    const card = document.createElement('article');
    card.className = 'vehicle-card';
    card.dataset.adminId = vehicle.id;
    card.dataset.brand = vehicle.brand;
    card.dataset.price = vehicle.price;
    card.dataset.year = vehicle.year;
    card.dataset.category = vehicle.category;
    card.innerHTML = `<div class="car-image"><img src="${vehicle.image}" alt="${vehicle.brand} ${vehicle.model}" /><span class="badge green">Disponível</span><button class="heart" aria-label="Adicionar aos favoritos">♡</button></div><div class="vehicle-info"><p>${vehicle.brand}</p><h3>${vehicle.model}</h3><div class="vehicle-meta"><span>${vehicle.year}</span><span>•</span><span>${new Intl.NumberFormat('pt-PT').format(vehicle.mileage)} km</span><span>•</span><span>${vehicle.fuel}</span></div><div class="vehicle-price"><strong>${new Intl.NumberFormat('pt-PT').format(vehicle.price)} €</strong></div></div>`;
    card.addEventListener('click', event => { if (!event.target.closest('.heart')) openVehicleModal(card); });
    card.querySelector('.heart').addEventListener('click', event => { event.stopPropagation(); event.currentTarget.classList.toggle('liked'); event.currentTarget.textContent = event.currentTarget.classList.contains('liked') ? '♥' : '♡'; });
    grid.prepend(card);
    vehicleDetails[vehicle.model] = { transmission: vehicle.transmission, power: vehicle.power, color: vehicle.color, description: vehicle.description };
  });
}

renderAdminVehicles();
