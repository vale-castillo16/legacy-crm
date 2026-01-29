/* =========================================
   LegacyCRM — Core Logic (Productivo)
   ========================================= */

// Estado inicial
const state = {
  clients: JSON.parse(localStorage.getItem('legacy_clients')) || []
};

// --- ROUTING SIMPLE ---
function initRouter() {
  const links = document.querySelectorAll('.menu-item');
  const views = document.querySelectorAll('.view');
  const title = document.getElementById('pageTitle');

  function navigate() {
    const hash = window.location.hash.slice(1) || 'dashboard';
    
    // Actualizar menú
    links.forEach(link => {
      const isActive = link.dataset.target === hash;
      link.classList.toggle('active', isActive);
      if (isActive) title.textContent = link.innerText.trim();
    });

    // Mostrar vista
    views.forEach(view => {
      view.style.display = (view.id === `view-${hash}`) ? 'block' : 'none';
    });

    // Acciones específicas por vista
    if(hash === 'dashboard') updateDashboard();
    if(hash === 'clientes') renderClientsTable();
  }

  window.addEventListener('hashchange', navigate);
  navigate(); // Cargar al inicio
}

// --- GESTIÓN DE CLIENTES ---
function saveClient(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);

  const newClient = {
    id: Date.now(),
    name: formData.get('name'),
    tax: formData.get('tax'),
    email: formData.get('email'),
    industry: formData.get('industry'),
    date: new Date().toLocaleDateString()
  };

  // Guardar en Estado y LocalStorage
  state.clients.unshift(newClient);
  localStorage.setItem('legacy_clients', JSON.stringify(state.clients));

  showToast('Cliente guardado exitosamente');
  form.reset();
  renderClientsTable();
}

function deleteClient(id) {
  if(confirm('¿Seguro que deseas eliminar este cliente?')) {
    state.clients = state.clients.filter(c => c.id !== id);
    localStorage.setItem('legacy_clients', JSON.stringify(state.clients));
    renderClientsTable();
    showToast('Cliente eliminado');
  }
}

function renderClientsTable() {
  const tbody = document.getElementById('clientsTableBody');
  tbody.innerHTML = '';

  if (state.clients.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px; color:#6b7280">No hay clientes registrados.</td></tr>';
    return;
  }

  state.clients.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight:600">${c.name}</td>
      <td>${c.tax}</td>
      <td>${c.email}</td>
      <td>
        <button class="btn-danger-text" onclick="deleteClient(${c.id})">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// --- DASHBOARD INTELIGENTE ---
function updateDashboard() {
  // KPI: Total Clientes
  document.getElementById('kpi-clients').textContent = state.clients.length;

  // Tabla Resumen (Últimos 3)
  const dashboardTable = document.getElementById('dashboard-table');
  dashboardTable.innerHTML = '';
  
  const recent = state.clients.slice(0, 3);
  
  if (recent.length === 0) {
      dashboardTable.innerHTML = '<tr><td colspan="3" style="text-align:center;color:#6b7280">Sin actividad reciente</td></tr>';
  } else {
      recent.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${c.name}</td><td>${c.email}</td><td>${c.date}</td>`;
        dashboardTable.appendChild(tr);
      });
  }
}

// --- UTILIDADES ---
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

function resetSystem() {
    if(confirm("ESTO BORRARÁ TODOS LOS DATOS. ¿Continuar?")){
        localStorage.removeItem('legacy_clients');
        state.clients = [];
        location.reload();
    }
}

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
  initRouter();
  document.getElementById('clientForm').addEventListener('submit', saveClient);
});