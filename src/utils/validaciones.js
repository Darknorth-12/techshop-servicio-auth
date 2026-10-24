/**
 * Reglas de validación de las credenciales que recibe el servicio.
 *
 * Se aplican solo al REGISTRO. En el inicio de sesión no se exigen estas
 * reglas para no revelar, a quien intenta adivinar credenciales, qué formato
 * tienen las contraseñas válidas.
 */

const USUARIO_MIN = 3;
const USUARIO_MAX = 20;
const CONTRASENA_MIN = 8;
const CONTRASENA_MAX = 64;

// Letras, números, punto y guion bajo
const PATRON_USUARIO = /^[A-Za-z0-9._]+$/;

/**
 * Valida los datos de registro.
 * @param {{usuario: *, contrasena: *}} datos Cuerpo recibido en la petición.
 * @returns {string[]} Lista de errores; vacía si los datos son válidos.
 */
const validarRegistro = ({ usuario, contrasena }) => {
  const errores = [];

  if (typeof usuario !== 'string' || usuario.trim() === '') {
    errores.push('El usuario es obligatorio y debe ser texto');
  } else {
    const nombre = usuario.trim();
    if (nombre.length < USUARIO_MIN || nombre.length > USUARIO_MAX) {
      errores.push(`El usuario debe tener entre ${USUARIO_MIN} y ${USUARIO_MAX} caracteres`);
    }
    if (!PATRON_USUARIO.test(nombre)) {
      errores.push('El usuario solo admite letras, números, punto y guion bajo');
    }
  }

  if (typeof contrasena !== 'string' || contrasena === '') {
    errores.push('La contraseña es obligatoria y debe ser texto');
  } else {
    if (contrasena.length < CONTRASENA_MIN || contrasena.length > CONTRASENA_MAX) {
      errores.push(`La contraseña debe tener entre ${CONTRASENA_MIN} y ${CONTRASENA_MAX} caracteres`);
    }
    if (!/[A-Za-z]/.test(contrasena) || !/\d/.test(contrasena)) {
      errores.push('La contraseña debe incluir al menos una letra y un número');
    }
  }

  return errores;
};

/**
 * Comprueba que el inicio de sesión traiga usuario y contraseña con texto.
 * @param {{usuario: *, contrasena: *}} datos Cuerpo recibido en la petición.
 * @returns {boolean} true si ambos datos fueron enviados.
 */
const hayCredenciales = ({ usuario, contrasena }) => (
  typeof usuario === 'string' && usuario.trim() !== ''
  && typeof contrasena === 'string' && contrasena !== ''
);

module.exports = { validarRegistro, hayCredenciales };
