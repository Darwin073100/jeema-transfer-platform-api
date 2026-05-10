/**
 * Punto de entrada principal de la aplicación NestJS.
 * Configura globalmente validaciones, filtros y CORS.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './shared/presentation/http/filters/all-exceptions.filter';

/**
 * Inicializa la aplicación NestJS y configura middlewares globales.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Definir un prefijo global para todas las rutas de la API (ej. /api/v1)
  app.setGlobalPrefix('api/v1')

  // REGISTRAR EL FILTRO DE EXCEPCIONES GLOBAL
  app.useGlobalFilters(new AllExceptionsFilter());

  // Configurar el pipe de validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Ignora propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // Lanza un error si se envían propiedades no definidas
      transform: true, // Transforma el payload a una instancia del DTO
      transformOptions:{
        enableImplicitConversion: false // Permite la conversión implícita de tipos (ej. string a number en parámetros de ruta)
      }
    })
  );

  // Configurar CORS 
  // Permitir el acceso a la API desde cualquier origen
  // Puedes restringirlo a dominios específicos si es necesario
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  //  // Configurar Swagger
  // const config = new DocumentBuilder()
  //   .setTitle('Educational Center Management API')
  //   .setDescription('API for managing educational centers within the system.')
  //   .setVersion('1.0')
  //   .addTag('Educational Centers')
  //   .build();
  // const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('api', app, document); // La interfaz de Swagger estará en /api
  

  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();
