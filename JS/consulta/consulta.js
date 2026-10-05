import { exigirSesion, cerrarSesion } from '../auth/auth.js';
import { consultarNeon } from '../config/neon-config.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Proteger vista y verificar sesión activa
  const usuario = exigirSesion();

  if (usuario) {
    // Mostrar enlace a Panel de Control si es admin o empleado
    if (usuario.rol === 'administrador' || usuario.rol === 'empleado') {
      const navPanel = document.getElementById('nav-panel');
      if (navPanel) navPanel.style.display = 'inline-block';
    }

    // Cargar los pedidos del usuario
    cargarListaPedidos(usuario);
  }

  // Evento para cerrar sesión
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', cerrarSesion);
  }
});

// 2. Función para obtener y renderizar los pedidos
async function cargarListaPedidos(usuario) {
  const contenedor = document.getElementById('contenedor-pedidos');
  if (!contenedor) return;

  try {
    let pedidos = [];

    try {
      // Intento de consulta en BD Neon
      pedidos = await consultarNeon(
        'SELECT * FROM pedidos WHERE email_cliente = $1 OR cliente = $2 ORDER BY fecha DESC',
        [usuario.email, usuario.nombre]
      );
    } catch (err) {
      // Respaldo en LocalStorage si falla o está offline
      const locales = JSON.parse(localStorage.getItem('pedidos_crocanti') || '[]');
      pedidos = locales.filter(p => p.email_cliente === usuario.email || p.nombre_cliente === usuario.nombre);
    }

    if (!pedidos || pedidos.length === 0) {
      contenedor.innerHTML = '<p>Aún no has realizado ningún pedido en Crocanti Chicken.</p>';
      return;
    }

    // Renderizar lista de pedidos
    contenedor.innerHTML = pedidos.map(p => `
      <div class="tarjeta-pedido">
        <h3>Pedido #${p.id || p.codigo}</h3>
        <p><strong>Cliente:</strong> ${p.nombre_cliente || p.cliente}</p>
        <p><strong>Productos:</strong> ${p.productos}</p>
        <p><strong>Hora estimada:</strong> ${p.hora_recojo}</p>
        <p><strong>Estado:</strong> <span class="estado-${(p.estado || 'registrado').toLowerCase()}">${(p.estado || 'registrado').toUpperCase()}</span></p>
        
        <div class="acciones-pedido" style="margin-top: 10px;">
          ${
            (p.estado || 'registrado').toLowerCase() === 'registrado'
              ? `<a href="actualizar.html?id=${p.id || p.codigo}" class="btn-editar">✏️ Editar Pedido</a>`
              : `<small style="color: #888;">🍗 Este pedido ya está en preparación o finalizado y no se puede modificar.</small>`
          }
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error("Error al cargar pedidos:", error);
    contenedor.innerHTML = '<p style="color: red;">Error al consultar tus pedidos.</p>';
  }
}