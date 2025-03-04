# Nombre del Proyecto
 Cita back

## Descripción

Este proyecto es una API REST desarrollada en Node.js que permite gestionar citas médicas, usuarios, modulo de autenticacion, middlewares para manejar y capturar loggers.
En cuanto al login se maneja jwt, para la base de datos se manejo oracle sin ORM, se integro un pool de Conexion, se manejo una arquitectura por capas.


## Características

- Funcionalidad 1 (CRUD de citas)
- Funcionalidad 2 (CRUD de usuarios)
- Funcionalidad 3 (autenticación y autorización)


## Tecnologías

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Oracle] Base de datos
- [TypeScript]

## Instalación

1. Clona el repositorio:
   https://github.com/GermanDev7/cita-prueba-back.git
2. Cambia el contenido del .env.example a .env con tus especificaciones para acceder a una base de datos Oracle
3. Instala dependencias con npm i

## Scripts disponible

1. Para iniciar el proyecto en modo desarrollo:
npm run dev

2. Compila el proyecto TypeScript (genera la carpeta dist). 
npm run build

3. Ejecuta el servidor en modo producción, leyendo el archivo dist/server.js. 
npm start

## Uso 

1. Ejecutar en modo desarrollo

npm run dev

## Estructura del proyexcto

cita-prueba-back/
src/
controllers/      # Controladores para manejar la lógica de la API
models/           # Modelos y esquemas de datos
routes/           # Definición de rutas de la API
services/         # Lógica de negocio y comunicación con la base de datos
middlewares/      # Middleware para autenticación, validación, etc.
db/               # Conexion a la base de datos
app.ts            # Configuración general de la aplicación
server.ts         # Punto de entrada del servidor
.env.example          # Archivo de ejemplo para las variables de entorno
 package.json
README.md

## Licencia

Sin licencia

## Contacto
German Rodriguez
Correo: germandev7@gmail.com
Repositorio: https://github.com/GermanDev7/cita-prueba-back