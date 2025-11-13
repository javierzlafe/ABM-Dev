/*****Bloque Jere  start*****/

const STORAGE_KEY = 'usuarios-abm';
let usuarios = [];
let editingId = null;

const form = document.getElementById('form-usuarios');
const inputNombre = document.getElementById('input-nombre');
const inputEdad = document.getElementById('input-edad');
const inputEmail = document.getElementById('input-email');

const btnAgregar = document.getElementById('btn-agregar');
const btnEditar = document.getElementById('btn-editar');
const btnEliminar = document.getElementById('btn-eliminar');

const listaUsuariosCont = document.getElementById('lista-usuarios');
const usuarioRegistradoP = document.getElementById('usuarioregistrado') || document.getElementById('usuarioregistrado');

function init() {
    if (window.INITIAL_USERS && Array.isArray(window.INITIAL_USERS) && window.INITIAL_USERS.length) {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
      usuarios = window.INITIAL_USERS.map(u => {
        const idStr = (typeof u.id !== 'undefined') ? `u_${u.id}` : generateId();
        return {
          id: idStr,
          nombre: u.nombreCompleto || u.nombre || u.email || 'Sin nombre',
          edad: (typeof u.edad !== 'undefined' && u.edad !== null) ? Number(u.edad) : null,
          email: u.email || ''
        };
      });
      saveToStorage();
    } else {
      usuarios = JSON.parse(stored);
    }
  } else {
    const raw = localStorage.getItem(STORAGE_KEY);
    usuarios = raw ? JSON.parse(raw) : [];
  }

  renderList();

  form.addEventListener('submit', onFormSubmit);
  btnEditar.addEventListener('click', onBtnEditar);
  btnEliminar.addEventListener('click', onBtnEliminar);

  setEditingState(false);
}

function generateId() {
    return 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2,6);
}

function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
}

function clearForm() {
    form.reset();
    editingId = null;
    setEditingState (false);    
}

  function setEditingState(isEditing){
    btnEditar.disabled = !isEditing;
    btnEliminar.disabled = !isEditing;

    if (isEditing){
        btnAgregar.textContent = 'Agregar Usuario';
    } else {
        btnAgregar.textContent = 'Agregar';
    }
  }

  
  
  function validateForm (){
    const nombre = inputNombre.value.trim();
    const edad = inputEdad.value.trim();
    const email = inputEmail.value.trim();

if (!nombre) return {ok: false, msg: 'El nombre es obligatorio.'};
if (!edad || isNaN(Number(edad)) || Number(edad) <= 0) return {ok: false, msg: 'Edad invalida'};
if (!email || !/^\S+@\S+\.\S+$/.test(email)) return {ok: false, msg: 'Email invalido'};
return {ok: true, data: {nombre, edad: Number(edad), email}};
}


function onFormSubmit(e) {
    e.preventDefault();
    addUser();
}

function onBtnEditar(e) {
    e.preventDefault();
    if (!editingId){
        alert ('Selecciona un usuario de la lista para editarlo.');
        return;
    }
    saveEdit();
}


function onBtnEliminar(e) {
    e.preventDefault();
if (!editingId){
    alert('Selecciona un usuario de la lista para eliminarlo.');
    return;
}
const confirmDelete = confirm('¿Vas a eliminar este usuario, estas seguro de hacerlo?');
if (confirmDelete){
deleteSelected();
}
}


function addUser(){
    const v = validateForm();
if (!v.ok){
    alert (v.msg);
    return;
}

const nuevo = {id: generateId(), ...v.data};

usuarios.push(nuevo);
saveToStorage();
renderList();
clearForm();
}


function renderList(){
    if (!listaUsuariosCont) return;
    if (!usuarios.length) {
        listaUsuariosCont.innerHTML = '<p class="empty-list">No hay usuarios registrados.</p>';
        usuarioRegistradoP.textContent = '0 usuarios'
        return;
    }

    if (usuarioRegistradoP) usuarioRegistradoP.textContent = `${usuarios.length} usuario(s) registrado(s)`;

    const table = document.createElement('table');
    table.className = 'tabla-usuarios';
    table.innerHTML = `
    <thead>
        <tr>
            <th>Nombre</th>
            <th>Edad</th>
            <th>Email</th>
            <th>Acciones</th>
        </tr>
    </thead>
    <tbody> </tbody>
`;

const tbody = table.querySelector('tbody');

usuarios.forEach(u => {
    const tr = document.createElement('tr');
    tr.dataset.id = u.id;
    tr.innerHtml = `
        <td>${escapeHtml(u.nombre)}</td>
        <td>${u.edad === null || typeof u.edad === 'undefined' || u.edad === '' ? '-' : escapeHtml(String(u.edad))}</td>
        <td>${escapeHtml(u.email)}</td>
        )
        <td>
            <button type="button" class="fila-editar" data-id="${u.id}">Seleccionar</button>
            <button type="button" class="fila-delete" data-id="${u.id}">Eliminar</button>
        </td>
    `;
    tbody.appendChild(tr);
     });

     listaUsuariosCont.innerHTML = '';
    listaUsuariosCont.appendChild(table);

    listaUsuariosCont.querySelectorAll('.fila-editar').forEach(btn => {
      btn.addEventListener('click', (ev) => {
        const id = ev.currentTarget.dataset.id;
        startEdit(id);
      });
    });
    listaUsuariosCont.querySelectorAll('.fila-delete').forEach(btn => {
      btn.addEventListener('click', (ev) => {
        const id = ev.currentTarget.dataset.id;
        const confirmed = confirm('¿Eliminar este usuario?');
        if (confirmed) {
          deleteUser(id);
        }
      });
    });
  }

 
    function startEdit(id) {
    const u = usuarios.find(x => x.id === id);
    if (!u) return alert('Usuario no encontrado.');

    inputNombre.value = u.nombre || '';
    inputEdad.value = (u.edad === null || typeof u.edad === 'undefined') ? '' : u.edad;
    inputEmail.value = u.email || '';

    editingId = id;
    setEditingState(true);
    inputNombre.focus();
  }

   function saveEdit() {
    if (!editingId) return alert('No hay usuario seleccionado para editar.');

    const v = validateForm();
    if (!v.ok) {
      alert(v.msg);
      return;
    }

    const idx = usuarios.findIndex(x => x.id === editingId);
    if (idx === -1) return alert('Usuario no encontrado (error interno).');

    usuarios[idx] = { id: editingId, ...v.data };
    saveToStorage();
    renderList();
    clearForm();
  }


  function deleteUser(id) {
    usuarios = usuarios.filter(u => u.id !== id);
    if (editingId === id) {
      clearForm();
    }
    saveToStorage();
    renderList();
  }

  function deleteSelected() {
    if (!editingId) return;
    deleteUser(editingId);
  }


   function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  document.addEventListener('DOMContentLoaded', init);

  window.ABMUsuarios = {
    addUserManual: addUser,
    startEdit,
    saveEdit,
    deleteUser,
    getUsuarios: () => usuarios.slice()
  };

/*******Bloque Jere end*******/