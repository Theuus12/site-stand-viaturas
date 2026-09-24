const STORAGE_KEY = 'vertice_custom_vehicles';
const SESSION_KEY = 'vertice_admin_session';
const baseVehicles = [
  { id: 'base-bmw', brand: 'BMW', model: 'X3 xDrive20d Pack M', year: 2022, mileage: 45300, fuel: 'Diesel', price: 38900 },
  { id: 'base-mercedes', brand: 'Mercedes-Benz', model: 'Classe C 220 d AMG Line', year: 2023, mileage: 18200, fuel: 'Diesel', price: 42900 },
  { id: 'base-peugeot', brand: 'Peugeot', model: '3008 1.5 BlueHDi Allure', year: 2022, mileage: 32100, fuel: 'Diesel', price: 24900 },
  { id: 'base-volvo', brand: 'Volvo', model: 'XC40 Recharge Core', year: 2021, mileage: 28500, fuel: 'Elétrico', price: 36500 }
];

const getCustomVehicles = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
const saveCustomVehicles = vehicles => localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
const euros = value => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
const kilometers = value => new Intl.NumberFormat('pt-PT').format(value) + ' km';

const loginPanel = document.getElementById('login-panel');
const dashboard = document.getElementById('dashboard');

function openDashboard() {
  loginPanel.hidden = true;
  dashboard.hidden = false;
  showView('overview');
  renderStock();
}

function authenticate(email, password) {
  document.getElementById('login-error').hidden = true;
  if (email.trim().toLowerCase() === 'admin@vertice.pt' && password === '123456') {
    localStorage.setItem(SESSION_KEY, 'true');
    openDashboard();
    return;
  }
  document.getElementById('login-error').hidden = false;
}

document.getElementById('login-form').addEventListener('submit', event => {
  event.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  authenticate(email, password);
});

document.getElementById('demo-login').addEventListener('click', () => authenticate('admin@vertice.pt', '123456'));

if (localStorage.getItem(SESSION_KEY) === 'true') openDashboard();

document.getElementById('logout').addEventListener('click', () => {
  localStorage.removeItem(SESSION_KEY);
  dashboard.hidden = true;
  loginPanel.hidden = false;
  document.getElementById('login-form').reset();
});

function showView(viewId) {
  document.querySelectorAll('.view').forEach(view => view.classList.toggle('active', view.id === viewId));
  document.querySelectorAll('.nav-item[data-view]').forEach(item => item.classList.toggle('active', item.dataset.view === viewId));
  const titles = { overview: 'Bom dia, Vértice.', stock: 'Gestão de stock', 'new-car': 'Nova viatura' };
  document.getElementById('view-title').textContent = titles[viewId];
}

document.querySelectorAll('.nav-item[data-view], [data-go-new], [data-view-stock]').forEach(button => button.addEventListener('click', () => {
  showView(button.dataset.goNew !== undefined ? 'new-car' : button.dataset.viewStock !== undefined ? 'stock' : button.dataset.view);
}));

function renderStock() {
  const custom = getCustomVehicles();
  const all = [...custom, ...baseVehicles];
  document.getElementById('stock-count').textContent = all.length;
  const simpleRows = all.slice(0, 5).map(vehicle => `<tr><td><strong>${vehicle.brand} ${vehicle.model}</strong><small>${kilometers(vehicle.mileage)} · ${vehicle.fuel}</small></td><td>${vehicle.year}</td><td><strong>${euros(vehicle.price)}</strong></td><td><span class="status">Publicado</span></td></tr>`).join('');
  document.getElementById('recent-stock').innerHTML = simpleRows;
  document.getElementById('stock-table').innerHTML = all.map(vehicle => `<tr><td><strong>${vehicle.brand} ${vehicle.model}</strong></td><td>${vehicle.year} · ${kilometers(vehicle.mileage)}<small>${vehicle.fuel}</small></td><td><strong>${euros(vehicle.price)}</strong></td><td><span class="status">Publicado</span></td><td>${vehicle.id.startsWith('base-') ? '<small>Anúncio de exemplo</small>' : `<button class="delete-car" data-id="${vehicle.id}">Remover</button>`}</td></tr>`).join('');
  document.querySelectorAll('.delete-car').forEach(button => button.addEventListener('click', () => {
    saveCustomVehicles(getCustomVehicles().filter(vehicle => vehicle.id !== button.dataset.id));
    renderStock();
  }));
}

document.getElementById('car-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const vehicle = Object.fromEntries(form.entries());
  vehicle.id = `custom-${Date.now()}`;
  vehicle.year = Number(vehicle.year);
  vehicle.mileage = Number(vehicle.mileage);
  vehicle.price = Number(vehicle.price);
  saveCustomVehicles([vehicle, ...getCustomVehicles()]);
  event.currentTarget.reset();
  renderStock();
  showView('stock');
});
