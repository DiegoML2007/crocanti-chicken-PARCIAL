import { consultarNeon } from '../config/neon-config.js';
import { verificarSesion } from '../auth/auth.js';

document.addEventListener('DOMContentLoaded', () => {
  const clienteActivoSpan = document.getElementById('cliente-activo') || document.querySelector('main p span');
  const formPedido = document.getElementById('form-pedido') || document.querySelector('form');
  
  // Captura de inputs
  const inputNombre = document.getElementById('nombre_cliente') || document.querySelector('input[type="text"]');
  const inputProductos = document.getElementById('productos') || document.querySelector('textarea');
  const inputHora = document.getElementById('hora_recojo') || document.querySelector('input[type="time"]');

  // 1. VERIFICAR SESIÓN
  const usuario = verificarSesion();

  if (usuario) {
    if (clienteActivoSpan) clienteActivoSpan.textContent = usuario.nombre || 'Cliente';
    if (inputNombre && !inputNombre.value) {
      inputNombre.value = usuario.nombre || 'Cliente';
    }
  } else {
    alert('Debes iniciar sesión para realizar un pedido.');
    window.location.href = 'login.html';
    return;
  }

  // 2. GUARDAR PEDIDO EN NEON DB
  if (formPedido) {
    formPedido.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Garantizar que 'nombreCliente' NUNCA sea null/vacío
      const valorNombreInput = inputNombre ? inputNombre.value.trim() : '';
      const nombreCliente = valorNombreInput || usuario.nombre || 'Cliente Crocanti';
      
      const productos = inputProductos ? inputProductos.value.trim() : '';
      const horaRecojo = inputHora ? inputHora.value : '';

      if (!productos || !horaRecojo) {
        alert('Por favor completa los productos y la hora estimada de recojo.');
        return;
      }

      // Obtener el ID del usuario logueado
      const idUsuario = usuario.id || usuario.id_usuario;

      try {
        // Enviar todos los campos NOT NULL a pedidos_recojo
        await consultarNeon(
          `INSERT INTO pedidos_recojo (id_usuario, nombre_cliente, productos, hora_recojo, estado)
           VALUES ($1, $2, $3, $4, 'pendiente');`,
          [idUsuario, nombreCliente, productos, horaRecojo]
        );

        alert('¡Pedido registrado con éxito en Crocanti Chicken!');
        window.location.href = 'consulta.html';

      } catch (error) {
        console.error('Error detallado al guardar el pedido:', error);
        alert('Ocurrió un error al registrar el pedido en la base de datos.');
      }
    });
  }
});