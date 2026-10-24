/**
 * Error con código de estado HTTP.
 *
 * Los servicios lo lanzan cuando ocurre una situación esperada del negocio
 * (por ejemplo, un usuario duplicado) y el middleware de errores de app.js
 * lo convierte en una respuesta JSON con ese código.
 */
class ErrorHttp extends Error {
  /**
   * @param {number} estado Código de estado HTTP (400, 409, etc.).
   * @param {string} mensaje Mensaje que verá el cliente de la API.
   * @param {string[]} [errores] Detalle opcional de los problemas encontrados.
   */
  constructor(estado, mensaje, errores = []) {
    super(mensaje);
    this.name = 'ErrorHttp';
    this.estado = estado;
    this.errores = errores;
  }
}

module.exports = { ErrorHttp };
