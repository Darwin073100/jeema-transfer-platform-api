// src/shared/presentation/http/filters/all-exceptions.filter.ts

import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';

/**
 * Filtro global que captura y transforma todas las excepciones en respuestas HTTP estándar.
 */
@Catch() // Atrapa todas las excepciones
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  /**
   * Maneja cualquier excepción lanzada en la app y responde con JSON estándar.
   */
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    
    let status: HttpStatus;
    let message: string | string[]; // Puede ser un string o un array de strings
    let errorName: string;
    let details: any | null = null; // Para capturar detalles adicionales, como errores de validación

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse(); // Obtiene el objeto de respuesta de la excepción

      // Verifica si la excepción tiene un cuerpo de respuesta con mensajes de validación
      if (typeof responseBody === 'object' && responseBody !== null && 'message' in responseBody) {
        message = (responseBody as any).message; // Accede a la propiedad 'message' del cuerpo de respuesta
        if (!Array.isArray(message)) {
          message = [message]
        }
        errorName = (responseBody as any).error || exception.name; // Usa el nombre de error si está presente
      } else {
        // Para otras HttpExceptions que no son de validación
        message = exception.message;
        errorName = exception.name;
      }
    } else {
      // Para errores no HTTP (ej. DomainException, errores de TypeORM, errores inesperados)
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception instanceof Error ? exception.message : 'Internal server error';
      errorName = exception instanceof Error ? exception.name : 'UnknownError';
    }

    // Registra el error en el log
    this.logger.error(
      `HTTP Status: ${status} - Error Name: ${errorName} - Message: ${JSON.stringify(message)} - Path: ${request.url}`,
      (exception instanceof Error ? exception.stack : 'No stack trace'),
      'ExceptionCaught',
    );


    // Envía la respuesta JSON al cliente
    response.status(status).json({
      statusCode: status,
      message: message,
      path: request.url,
      error: errorName, // Incluye el nombre de la excepción para depuración
      timestamp: new Date().toISOString(),
    });
  }
}