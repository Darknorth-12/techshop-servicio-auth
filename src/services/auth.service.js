/**
 * Servicio de autenticación: reglas de negocio de registro e inicio de sesión.
 *
 * Las contraseñas NUNCA se guardan en texto plano: se almacena únicamente el
 * hash generado con bcrypt (algoritmo lento y con "sal" aleatoria, diseñado
 * para proteger contraseñas).
 */
const bcrypt = require('bcryptjs');
const { ErrorHttp } = require('../utils/errores');

const RONDAS_POR_DEFECTO = 10;

/**
 * @param {object} repositorio Repositorio de usuarios (buscarPorUsuario, guardar).
 * @param {number} [rondas] Costo de bcrypt; las pruebas usan un valor bajo para ir rápido.
 */
const crearServicioAuth = (repositorio, rondas = RONDAS_POR_DEFECTO) => {
  // Hash de relleno: permite comparar contra algo aunque el usuario no exista,
  // de modo que la respuesta tarde parecido y no delate qué usuarios existen.
  const hashRelleno = bcrypt.hashSync('relleno-no-valido', rondas);

  /**
   * Registra un usuario nuevo.
   * @throws {ErrorHttp} 409 si el nombre de usuario ya existe.
   * @returns {Promise<{id: number, usuario: string}>} Datos públicos del usuario creado.
   */
  const registrar = async (usuario, contrasena) => {
    if (repositorio.buscarPorUsuario(usuario)) {
      throw new ErrorHttp(409, 'El usuario ya está registrado');
    }

    const contrasenaHash = await bcrypt.hash(contrasena, rondas);
    const creado = repositorio.guardar({ usuario, contrasenaHash });

    // Se devuelven solo los datos públicos: nunca el hash
    return { id: creado.id, usuario: creado.usuario };
  };

  /**
   * Verifica las credenciales.
   * @returns {Promise<boolean>} true si el usuario existe y la contraseña coincide.
   */
  const autenticar = async (usuario, contrasena) => {
    const encontrado = repositorio.buscarPorUsuario(usuario);
    const hash = encontrado ? encontrado.contrasenaHash : hashRelleno;
    const coincide = await bcrypt.compare(contrasena, hash);

    return Boolean(encontrado) && coincide;
  };

  return { registrar, autenticar };
};

module.exports = { crearServicioAuth };
