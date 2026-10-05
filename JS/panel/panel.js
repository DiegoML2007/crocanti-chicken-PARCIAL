import * as AuthModule from '../auth/auth.js';
import { consultarNeon } from '../config/neon-config.js';

let tablaCorrecta = 'pedidos'; // Nombre por defecto

document.addEventListener('DOMContentLoaded', async () => {
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout && typeof AuthModule.cerrarSesion === 'function') {
    btnLogout.addEventListener('click', AuthModule.cerrarSesion);
  }

  await cargarTodosLosPedidos();
});

export async function cargarTodosLosPedidos() {
  const tbody = document.getElementById('tbody-pedidos') || document.querySelector('tbody');
  if (!tbody) return;

  const posiblesTablas = ['pedidos', 'pedidos_recojo', 'pedido'];
  let pedidos = null;
  let ultimoError = null;

  // Intenta consultar automáticamente el nombre de tabla correcto
  for (const nombreTabla of posiblesTablas) {
    try {
      console.log(`Probrando consulta en tabla: ${nombreTabla}...`);
      pedidos = await consultarNeon(`SELECT * FROM ${nombreTabla} ORDER BY id DESC`);
      tablaCorrecta = nombreTabla;
      console.log(`¡Éxito! La tabla real es '${tablaCorrecta}'`, pedidos);
      break;
    } catch (err) {
      ultimoError = err;
    }
  }

  // Si ninguna tabla funcionó, muestra el error de Neon DB
  if (!pedidos) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: red; padding: 20px;">
          ❌ Error en Neon DB: ${ultimoError ? ultimoError.message : 'No se encontró la tabla de pedidos'}
        </td>
      </tr>
    `;
    return;
  }

  if (pedidos.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 20px;">
          No hay pedidos registrados en la tabla '${tablaCorrecta}'.
        </td>
      </tr>
    `;
    return;
  }

  // Renderiza los pedidos encontrados
  tbody.innerHTML = pedidos.map(p => {
    const id = p.id || p.codigo || p.id_pedido || 'S/C';
    const cliente = p.cliente || p.nombre_cliente || p.nombre || 'Cliente';
    const productos = p.productos || p.detalle || p.pedido || 'Combo Crocanti';
    const hora = p.hora_recojo || p.hora || 'Por coordinar';
    const estado = (p.estado || 'registrado').toLowerCase();

    return `
      <tr>
        <td><strong>#${id}</strong></td>
        <td>${cliente}</td>
        <td>${productos}</td>
        <td>${hora}</td>
        <td>
          <span class="estado-badge estado-${estado}" style="padding: 4px 8px; border-radius: 4px; font-weight: bold; background: #e0f2fe; color: #0369a1;">
            ${estado.toUpperCase()}
          </span>
        </td>
        <td>
          <select class="select-estado" data-id="${id}">
            <option value="registrado" ${estado === 'registrado' ? 'selected' : ''}>Registrado</option>
            <option value="en preparacion" ${estado === 'en preparacion' ? 'selected' : ''}>En Preparación</option>
            <option value="listo para recojo" ${estado === 'listo para recojo' ? 'selected' : ''}>Listo para Recojo</option>
            <option value="entregado" ${estado === 'entregado' ? 'selected' : ''}>Entregado</option>
            <option value="cancelado" ${estado === 'cancelado' ? 'selected' : ''}>Cancelado</option>
          </select>
          <button class="btn-eliminar" data-id="${id}" style="cursor:pointer; margin-left: 5px;">🗑️</button>
        </td>
      </tr>
    `;
  }).join('');

  asignarEventosAcciones();
}

function asignarEventosAcciones() {
  document.querySelectorAll('.select-estado').forEach(select => {
    select.addEventListener('change', async (e) => {
      const idPedido = e.target.getAttribute('data-id');
      const nuevoEstado = e.target.value;

      try {
        await consultarNeon(`UPDATE ${tablaCorrecta} SET estado = $1 WHERE id = $2`, [nuevoEstado, idPedido]);
        alert(`Estado del pedido #${idPedido} actualizado a "${nuevoEstado.toUpperCase()}".`);
        cargarTodosLosPedidos();
      } catch (err) {
        alert("Error al actualizar estado: " + err.message);
      }
    });
  });

  document.querySelectorAll('.btn-eliminar').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const idPedido = e.target.getAttribute('data-id');
      if (!confirm(`¿Está seguro de eliminar el pedido #${idPedido}?`)) return;

      try {
        await consultarNeon(`DELETE FROM ${tablaCorrecta} WHERE id = $1`, [idPedido]);
        alert(`Pedido #${idPedido} eliminado con éxito.`);
        cargarTodosLosPedidos();
      } catch (err) {
        alert("Error al eliminar: " + err.message);
      }
    });
  });
}