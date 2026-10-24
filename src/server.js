/**
 * Punto de entrada: crea el repositorio, la aplicación y pone el servidor a
 * escuchar. Se configura con variables de entorno opcionales:
 *   PORT       -> puerto (por defecto 3000)
 *   DATA_FILE  -> archivo JSON de usuarios (por defecto data/usuarios.json)
 */
const path = require('path');
const { crearApp } = require('./app');
const { crearRepositorio } = require('./repositories/usuario.repository');

const PUERTO = process.env.PORT || 3000;
const ARCHIVO_DATOS = process.env.DATA_FILE
  || path.join(__dirname, '..', 'data', 'usuarios.json');

const app = crearApp(crearRepositorio(ARCHIVO_DATOS));

app.listen(PUERTO, () => {
  console.log(`Servicio de autenticación TechShop escuchando en http://localhost:${PUERTO}`);
});
