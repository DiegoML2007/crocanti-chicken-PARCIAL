// JS/auth/login.js
import { consultarNeon } from '../config/neon-config.js';
import { iniciarSesion } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
  const formLogin = document.getElementById('form-login');
  const formRegistro = document.getElementById('form-registro-usuario');

  // REGISTRO DE USUARIOS
  if (formRegistro) {
    formRegistro.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nombre = document.getElementById('reg-nombre').value.trim();
      const correo = document.getElementById('reg-correo').value.trim();
      const password = document.getElementById('reg-pass').value.trim();

      try {
        const resultado = await consultarNeon(
          `INSERT INTO usuarios (nombre, correo, password, rol) 
           VALUES ($1, $2, $3, 'cliente') 
           RETURNING id, nombre, correo, rol;`,
          [nombre, correo, password]
        );

        if (resultado && resultado.length > 0) {
          alert('¡Cuenta registrada exitosamente!');
          iniciarSesion(resultado[0]);
          window.location.href = 'index.html';
        }
      } catch (error) {
        console.error('Error en el registro:', error);
        alert('No se pudo registrar la cuenta. Comprueba si el correo ya existe.');
      }
    });
  }

  // INICIO DE SESIÓN
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();

      const correo = document.getElementById('login-correo').value.trim();
      const password = document.getElementById('login-pass').value.trim();

      try {
        const usuarios = await consultarNeon(
          `SELECT id, nombre, correo, rol FROM usuarios WHERE correo = $1 AND password = $2;`,
          [correo, password]
        );

        if (usuarios.length > 0) {
          alert(`¡Bienvenido ${usuarios[0].nombre}!`);
          iniciarSesion(usuarios[0]);
          window.location.href = (usuarios[0].rol === 'administrador') ? 'panel.html' : 'index.html';
        } else {
          alert('Correo o contraseña incorrectos.');
        }
      } catch (error) {
        console.error('Error en el login:', error);
        alert('Error al conectar con la base de datos.');
      }
    });
  }
});