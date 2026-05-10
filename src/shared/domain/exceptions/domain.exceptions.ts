/**
 * Clase base abstracta para todas las excepciones de Dominio.
 * Estas excepciones representan violaciones de reglas de negocio o invariantes del dominio.
 * Son agnósticas a la infraestructura y al framework.
 */
export abstract class DomainException extends Error {
    protected constructor(message: string) {
      super(message);
      this.name = this.constructor.name; // Asegura que el nombre de la excepción sea el nombre de la clase
      // Captura el stack trace, excluyendo el constructor del error
      Error.captureStackTrace(this, this.constructor);
    }
  }