# EdyOf Platform API
<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="380" alt="Nest Logo" /></a>
</p>

## Comandos a ejecutar
1. Copiar y renombrar el __.env.template__ a un __.env__ y cambiar los valores de las propiedades si es necesario.

2. Levantar el contenedor de docker
``` bash
docker compose up -d
```

3. Instala el manejador de paquetes __pnpm__
``` bash
npm install -g pnpm 
``` 

4. Instalar las dependencias del proyecto
``` bash
pnpm install 
``` 

5. Correr las migraciones para crear las entidades
``` bash
pnpm run migration:run
```

6. Ejecutar el Script inicial, con los datos iniciales y necesarios para el proyecto initial-data-postgres-script.sql

7. Correr el proyecto en modo desarrollo
``` bash
pnpm run start:dev 
``` 

