/**
 * Repositorio de usuarios (capa de acceso a datos).
 *
 * Guarda los usuarios en un archivo JSON, lo que evita instalar una base de
 * datos para esta evidencia. Es el equivalente al DAO de los módulos Java del
 * proyecto: si más adelante se usa MySQL o MongoDB, solo se reemplaza este
 * archivo y el resto de la API no cambia.
 *
 * Cada usuario tiene la forma:
 * { id, usuario, contrasenaHash, fechaRegistro }
 *
 * Limitación conocida: las lecturas y escrituras son síncronas y sin bloqueo,
 * suficiente para un servicio formativo de un solo proceso.
 */
const fs = require('fs');
const path = require('path');

/**
 * Crea un repositorio que guarda los datos en el archivo indicado.
 * @param {string} rutaArchivo Ruta del archivo JSON (se crea si no existe).
 */
const crearRepositorio = (rutaArchivo) => {
  // Lee todos los usuarios; si el archivo no existe o está dañado devuelve []
  const leer = () => {
    try {
      const lista = JSON.parse(fs.readFileSync(rutaArchivo, 'utf8'));
      return Array.isArray(lista) ? lista : [];
    } catch (error) {
      return [];
    }
  };

  const escribir = (lista) => {
    fs.mkdirSync(path.dirname(rutaArchivo), { recursive: true });
    fs.writeFileSync(rutaArchivo, JSON.stringify(lista, null, 2));
  };

  /** Busca por nombre de usuario sin distinguir mayúsculas de minúsculas. */
  const buscarPorUsuario = (usuario) => {
    const buscado = usuario.trim().toLowerCase();
    return leer().find((u) => u.usuario.toLowerCase() === buscado) || null;
  };

  /**
   * Guarda un usuario nuevo y le asigna id y fecha de registro.
   * @returns {object} El usuario guardado (incluye el hash de la contraseña).
   */
  const guardar = ({ usuario, contrasenaHash }) => {
    const lista = leer();
    const mayorId = lista.reduce((mayor, actual) => Math.max(mayor, actual.id), 0);
    const nuevo = {
      id: mayorId + 1,
      usuario: usuario.trim(),
      contrasenaHash,
      fechaRegistro: new Date().toISOString(),
    };
    escribir([...lista, nuevo]);
    return nuevo;
  };

  return { buscarPorUsuario, guardar };
};

module.exports = { crearRepositorio };
