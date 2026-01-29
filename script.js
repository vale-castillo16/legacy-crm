/* =========================================
   LegacyCRM — Core Logic (Con Edición)
   ========================================= */

// Estado inicial
const state = {
  clients: JSON.parse(localStorage.getItem('legacy_clients')) || [],
  editingId: null // Variable para saber si estamos editando
};

// --- ROUTING SIMPLE ---
function initRouter() {
  const links = document.querySelectorAll('.menu-item');
  const views = document.querySelectorAll('.view');
  const title = document.getElementById('pageTitle');

  function navigate() {
    const hash = window.location.hash.slice(1) || 'dashboard';
    
    links.forEach(link => {
      const isActive = link.dataset.target === hash;
      link.classList.toggle('active', isActive);
      if (isActive) title.textContent = link.innerText.trim();
    });

    views.forEach(view => {
      view.style.display = (view.id === `view-${hash}`) ? 'block' : 'none';
    });

    if(hash === 'dashboard') updateDashboard();
    if(hash === 'clientes') renderClientsTable();
  }

  window.addEventListener('hashchange', navigate);
  navigate();
}

// --- GESTIÓN DE CLIENTES (GUARDAR / EDITAR) ---
function saveClient(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const submitBtn = form.querySelector('button[type="submit"]');

  // Datos del formulario
  const clientData = {
    name: formData.get('name'),
    tax: formData.get('tax'),
    email: formData.get('email'),
    industry: formData.get('industry'),
    date: new Date().toLocaleDateString()
  };

  if (state.editingId) {
    // === MODO EDICIÓN ===
    // Buscamos el cliente y actualizamos sus datos
    const index = state.clients.findIndex(c => c.id === state.editingId);
    if (index !== -1) {
      // Mantenemos el ID y la fecha original, actualizamos el resto
      state.clients[index] = { 
        ...state.clients[index], 
        ...clientData 
      };
      showToast('Cliente actualizado correctamente');
    }
    
    // Resetear estado de edición
    state.editingId = null;
    submitBtn.textContent = "Guardar Cliente"; // Volver texto a normal
    
  } else {
    // === MODO CREACIÓN ===
    const newClient = {
      id: Date.now(),
      ...clientData
    };
    state.clients.unshift(newClient);
    showToast('Cliente guardado exitosamente');
  }

  // Guardar en LocalStorage y limpiar
  localStorage.setItem('legacy_clients', JSON.stringify(state.clients));
  form.reset();
  renderClientsTable();
  updateDashboard();
}

// --- FUNCIÓN PARA CARGAR DATOS EN EL FORMULARIO ---
window.editClient = function(id) {
  const client = state.clients.find(c => c.id === id);
  if (!client) return;

  // Llenar el formulario con los datos del cliente
  const form = document.getElementById('clientForm');
  form.querySelector('[name="name"]').value = client.name;
  form.querySelector('[name="tax"]').value = client.tax;
  form.querySelector('[name="email"]').value = client.email;
  form.querySelector('[name="industry"]').value = client.industry;

  // Cambiar estado a "Editando"
  state.editingId = id;
  
  // Cambiar el texto del botón para que el usuario sepa que está editando
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.textContent = "Actualizar Cambios";

  // Scrollear hacia arriba para ver el formulario
  form.scrollIntoView({ behavior: 'smooth' });
};

// --- ELIMINAR CLIENTE ---
window.deleteClient = function(id) {
  if(confirm('¿Seguro que deseas eliminar este cliente?')) {
    state.clients = state.clients.filter(c => c.id !== id);
    localStorage.setItem('legacy_clients', JSON.stringify(state.clients));
    
    // Si estábamos editando este cliente, cancelamos la edición
    if (state.editingId === id) {
      state.editingId = null;
      document.getElementById('clientForm').reset();
      document.querySelector('#clientForm button[type="submit"]').textContent = "Guardar Cliente";
    }

    renderClientsTable();
    showToast('Cliente eliminado');
    updateDashboard();
  }
};

// --- RENDERIZAR TABLA (CON BOTÓN EDITAR) ---
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
        <button class="btn-edit-text" onclick="editClient(${c.id})">Editar</button>
        <button class="btn-danger-text" onclick="deleteClient(${c.id})">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// --- DASHBOARD ---
function updateDashboard() {
  document.getElementById('kpi-clients').textContent = state.clients.length;
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