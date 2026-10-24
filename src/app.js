/**
 * Construcción de la aplicación Express (sin arrancar el servidor).
 *
 * Se separa de server.js para poder crear la app con un repositorio de prueba
 * y ejecutar las pruebas automáticas sin ocupar un puerto fijo.
 *
 * Endpoints:
 *   GET  /api/salud     -> comprueba que el servicio está activo
 *   POST /api/registro  -> registra un usuario
 *   POST /api/login     -> inicia sesión
 */
const express = require('express');
const { crearControladorAuth } = require('./controllers/auth.controller');
const { crearServicioAuth } = require('./services/auth.service');

/**
 * @param {object} repositorio Repositorio de usuarios.
 * @param {number} [rondas] Costo de bcrypt (opcional).
 * @returns {import('express').Express} Aplicación lista para escuchar.
 */
const crearApp = (repositorio, rondas) => {
  const app = express();
  const servicio = crearServicioAuth(repositorio, rondas);
  const controlador = crearControladorAuth(servicio);

  // Lee cuerpos JSON; se limita el tamaño para evitar peticiones gigantes
  app.use(express.json({ limit: '10kb' }));

  app.get('/api/salud', (req, res) => {
    res.status(200).json({ exito: true, mensaje: 'Servicio activo' });
  });

  app.post('/api/registro', controlador.registrar);
  app.post('/api/login', controlador.iniciarSesion);

  // Ruta no encontrada
  app.use((req, res) => {
    res.status(404).json({ exito: false, mensaje: 'Ruta no encontrada' });
  });

  // Manejo central de errores (el cuarto parámetro identifica este middleware)
  // eslint-disable-next-line no-unused-vars
  app.use((error, req, res, next) => {
    // JSON mal formado en el cuerpo de la petición
    if (error.type === 'entity.parse.failed') {
      return res.status(400).json({ exito: false, mensaje: 'El cuerpo no es un JSON válido' });
    }

    // Errores esperados del negocio (usuario duplicado, etc.)
    if (error.estado) {
      return res.status(error.estado).json({
        exito: false,
        mensaje: error.message,
        ...(error.errores && error.errores.length > 0 ? { errores: error.errores } : {}),
      });
    }

    // Error inesperado: se registra en el servidor pero no se detalla al cliente
    console.error(error);
    return res.status(500).json({ exito: false, mensaje: 'Error interno del servidor' });
  });

  return app;
};

module.exports = { crearApp };
