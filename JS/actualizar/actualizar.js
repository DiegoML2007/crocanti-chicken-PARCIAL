import { exigirSesion, cerrarSesion } from '../auth/auth.js';
import { consultarNeon } from '../config/neon-config.js';

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Verificar inicio de sesión
  const usuario = exigirSesion();

  if (usuario) {
    if (usuario.rol === 'administrador' || usuario.rol === 'empleado') {
      const navPanel = document.getElementById('nav-panel');
      if (navPanel) navPanel.style.display = 'inline-block';
    }
  }

  // Evento Cerrar Sesión
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', cerrarSesion);
  }

  // 2. Obtener ID del pedido desde la URL (?id=...)
  const urlParams = new URLSearchParams(window.location.search);
  const idPedido = urlParams.get('id');

  if (!idPedido) {
    alert('No se especificó un pedido válido para modificar.');
    window.location.href = 'consulta.html';
    return;
  }

  // Cargar información previa en el formulario
  await cargarDatosPedido(idPedido);

  // 3. Manejar la actualización
  const formActualizar = document.getElementById('form-actualizar');
  if (formActualizar) {
    formActualizar.addEventListener('submit', async (e) => {
      e.preventDefault();
      await actualizarPedido(idPedido);
    });
  }
});

// Función para obtener los datos del pedido e insertarlos en el formulario
async function cargarDatosPedido(idPedido) {
  let pedido = null;

  try {
    // Intento desde la BD Neon
    const res = await consultarNeon('SELECT * FROM pedidos WHERE id = $1', [idPedido]);
    if (res && res.length > 0) pedido = res[0];
  } catch (err) {
    // Respaldo en LocalStorage
    const pedidos = JSON.parse(localStorage.getItem('pedidos_crocanti') || '[]');
    pedido = pedidos.find(p => p.id === idPedido);
  }

  if (!pedido) {
    alert('El pedido especificado no existe.');
    window.location.href = 'consulta.html';
    return;
  }

  // Verificar que siga en estado 'registrado'
  if ((pedido.estado || 'registrado').toLowerCase() !== 'registrado') {
    alert('🍗 Este pedido ya se encuentra en preparación o finalizado y no puede ser modificado.');
    window.location.href = 'consulta.html';
    return;
  }

  // Llenar campos
  if (document.getElementById('pedido-id')) document.getElementById('pedido-id').value = pedido.id;
  if (document.getElementById('nombre_cliente')) document.getElementById('nombre_cliente').value = pedido.nombre_cliente || pedido.cliente || '';
  if (document.getElementById('productos')) document.getElementById('productos').value = pedido.productos || '';
  if (document.getElementById('hora_recojo')) document.getElementById('hora_recojo').value = pedido.hora_recojo || '';
}

// Función para guardar los datos modificados
async function actualizarPedido(idPedido) {
  const btn = document.getElementById('btn-guardar-cambios');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Guardando cambios...';
  }

  const nombreCliente = document.getElementById('nombre_cliente').value;
  const productos = document.getElementById('productos').value;
  const horaRecojo = document.getElementById('hora_recojo').value;

  try {
    // Intento en BD Neon
    await consultarNeon(
      'UPDATE pedidos SET cliente = $1, productos = $2, hora_recojo = $3 WHERE id = $4',
      [nombreCliente, productos, horaRecojo, idPedido]
    );
  } catch (err) {
    // Respaldo en LocalStorage
    let pedidos = JSON.parse(localStorage.getItem('pedidos_crocanti') || '[]');
    const index = pedidos.findIndex(p => p.id === idPedido);

    if (index !== -1) {
      pedidos[index].nombre_cliente = nombreCliente;
      pedidos[index].productos = productos;
      pedidos[index].hora_recojo = horaRecojo;
      localStorage.setItem('pedidos_crocanti', JSON.stringify(pedidos));
    }
  } finally {
    alert('¡Tu pedido de Crocanti Chicken ha sido actualizado con éxito!');
    window.location.href = 'consulta.html';
  }
}