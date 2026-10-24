/**
 * Controlador de autenticación: traduce las peticiones HTTP a llamadas al
 * servicio y arma las respuestas JSON. No contiene reglas de negocio.
 *
 * Formato de respuesta (todas las respuestas lo siguen):
 * { "exito": boolean, "mensaje": string, ...datos opcionales }
 */
const { validarRegistro, hayCredenciales } = require('../utils/validaciones');

/**
 * @param {object} servicio Servicio de autenticación (registrar, autenticar).
 */
const crearControladorAuth = (servicio) => {
  /**
   * POST /api/registro
   * Cuerpo: { "usuario": "...", "contrasena": "..." }
   * 201 si se registra, 400 si los datos no son válidos, 409 si ya existe.
   */
  const registrar = async (req, res, next) => {
    try {
      const datos = req.body || {};
      const errores = validarRegistro(datos);

      if (errores.length > 0) {
        return res.status(400).json({
          exito: false,
          mensaje: 'Datos de registro inválidos',
          errores,
        });
      }

      const usuario = await servicio.registrar(datos.usuario, datos.contrasena);
      return res.status(201).json({
        exito: true,
        mensaje: 'Usuario registrado correctamente',
        usuario,
      });
    } catch (error) {
      return next(error);
    }
  };

  /**
   * POST /api/login
   * Cuerpo: { "usuario": "...", "contrasena": "..." }
   * 200 con "Autenticación satisfactoria" si las credenciales son correctas;
   * 401 con "Error en la autenticación" si no lo son (mismo mensaje tanto si
   * el usuario no existe como si la contraseña es incorrecta).
   */
  const iniciarSesion = async (req, res, next) => {
    try {
      const datos = req.body || {};

      if (!hayCredenciales(datos)) {
        return res.status(400).json({
          exito: false,
          mensaje: 'Debe enviar usuario y contraseña',
        });
      }

      const autenticado = await servicio.autenticar(datos.usuario, datos.contrasena);

      if (!autenticado) {
        return res.status(401).json({
          exito: false,
          mensaje: 'Error en la autenticación',
        });
      }

      return res.status(200).json({
        exito: true,
        mensaje: 'Autenticación satisfactoria',
      });
    } catch (error) {
      return next(error);
    }
  };

  return { registrar, iniciarSesion };
};

module.exports = { crearControladorAuth };
