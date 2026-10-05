// JS/auth/auth.js

// Verificar sesión actual
export function verificarSesion() {
  const usuarioGuardado = localStorage.getItem('usuario_crocanti');
  return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
}

// Iniciar Sesión (Esta es la que faltaba y causaba el error en login.js)
export function iniciarSesion(usuario) {
  localStorage.setItem('usuario_crocanti', JSON.stringify(usuario));
}

// Cerrar Sesión
export function cerrarSesion() {
  localStorage.removeItem('usuario_crocanti');
  localStorage.removeItem('carrito_crocanti');
  window.location.href = 'login.html';
}

// Renderizar enlace 'Panel' para Administrador y Empleado
export function cargarMenuPanel() {
    const usuario = verificarSesion();
    if (!usuario) return;

    // Verificar si el rol es 'administrador' o 'empleado'
    if (usuario.rol === 'administrador' || usuario.rol === 'empleado') {
        const navUl = document.querySelector('header nav ul') || document.querySelector('.nav-links') || document.querySelector('nav');
        
        if (navUl && !document.querySelector('#link-panel-nav')) {
            const li = document.createElement('li');
            li.id = 'link-panel-nav';
            li.innerHTML = `<a href="panel.html" style="font-weight: bold; color: #ffeb3b;">Panel</a>`;
            
            // Insertar antes del botón de usuario o al final del menú
            const usuarioBtn = document.querySelector('.user-info') || document.querySelector('#cerrar-sesion') || navUl.lastElementChild;
            if (usuarioBtn && usuarioBtn.parentElement === navUl) {
                navUl.insertBefore(li, usuarioBtn);
            } else {
                navUl.appendChild(li);
            }
        }
    }
}