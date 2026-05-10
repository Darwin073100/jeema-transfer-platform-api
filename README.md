<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

## Comandos a ejecutar
### Crear la base de datos 
Crea la base de datos para el sistema, asegurate de escribir el nombre de la base de datos como `jeema_transfer_platform_db`.

### Configurar variables de entorno 
Copiar y renombrar el __.env.template__ a un __.env__ y cambiar los valores de las propiedades si es necesario.

### Ejecutar las migraciones de la base de batos
``` bash
# Este script corre las migraciones
pnpm run migration:run
# Este script crea una migración despues de haber modificado una entidad de TypeOrm
pnpm run migration:generate <migration_name>
# Este script revierte la ultima migración
pnpm run migration:revert
``` 

### Instala el manejador de paquetes __pnpm__
``` bash
npm install -g pnpm 
``` 

### Instalar las dependencias del proyecto
``` bash
pnpm install 
``` 

### Inicia el proyecto
``` bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```