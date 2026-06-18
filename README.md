# Synthesis

Sistema centralizado para la gestión, distribución y control de software en entornos institucionales.

## Objetivo

Synthesis busca proporcionar una plataforma que permita administrar qué aplicaciones pueden instalarse y ejecutarse dentro de una organización, aplicando políticas de seguridad centralizadas y validando la identidad de los archivos mediante hashes criptográficos.

El proyecto está orientado a laboratorios académicos, salas de informática y entornos administrados donde se requiere controlar el software disponible para los usuarios.

---

# Arquitectura

## Servidor Central

Responsable de:

* Gestión de usuarios.
* Gestión de roles y permisos.
* Catálogo de aplicaciones.
* Almacenamiento de hashes autorizados y bloqueados.
* Distribución de políticas.
* Registro de eventos.
* Administración centralizada.

## Cliente Local

Responsable de:

* Consultar el catálogo disponible.
* Descargar aplicaciones autorizadas.
* Aplicar políticas recibidas.
* Reportar eventos al servidor.
* Comunicarse con servicios privilegiados de instalación.

---

# Roles

## Student

* Consultar aplicaciones disponibles.
* Solicitar instalaciones.

## Monitor

* Supervisar equipos.
* Gestionar restricciones.
* Consultar eventos.

## Administrator

* Control total del sistema.
* Gestión de usuarios.
* Gestión de aplicaciones.
* Gestión de políticas.

---

# Clasificación de Aplicaciones

La clasificación es administrada por el servidor y no depende del nombre del ejecutable.

Categorías previstas:

* Education
* Productivity
* Development
* Communication
* Multimedia
* Gaming
* Utilities

---

# Validación de Aplicaciones

La identificación de software se realiza mediante:

* SHA-256
* Firma digital
* Información del editor

Esto evita que un ejecutable pueda evadir restricciones simplemente cambiando su nombre.

---

# Componentes Principales

## Users

Representa los usuarios del sistema.

## Applications

Catálogo centralizado de software.

## Hashes

Lista de identificadores autorizados o bloqueados.

## Policies

Reglas distribuidas a los clientes.

## Events

Registro de actividad del sistema.

---

# API Actual

## Health Check

```http
GET /
```

## Users

```http
GET /api/users
```

## Applications

```http
GET /api/apps
POST /api/apps
```

## Policies

```http
GET /api/policies
```

## Events

```http
GET /api/events
```

---

# Estructura del Proyecto

```text
backend/
├── app.py
├── db/
│   ├── database.py
│   └── models.py
├── routes/
│   ├── apps.py
│   ├── users.py
│   ├── policies.py
│   └── events.py
├── middleware/
└── requirements.txt
```

---

# Estado Actual

Implementado:

* Estructura inicial de Flask.
* Organización modular por rutas.
* Endpoints base.
* Diseño preliminar de entidades.

Pendiente:

* Persistencia en base de datos.
* Autenticación JWT.
* Sistema de permisos.
* Gestión de hashes.
* Distribución de políticas.
* Cliente local.
* Servicio de instalación privilegiada.
* Panel administrativo.

---

# Roadmap

## Fase 1

* API Flask
* Base de datos
* CRUD de entidades principales

## Fase 2

* Autenticación y autorización
* Gestión de roles
* Auditoría de eventos

## Fase 3

* Cliente local
* Validación de hashes
* Distribución de políticas

## Fase 4

* Panel web administrativo
* Sincronización en tiempo real
* Gestión avanzada de seguridad

```
