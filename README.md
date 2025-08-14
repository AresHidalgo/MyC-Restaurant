# 🍽️ MyC Restaurant Management

**Sistema de gestión integral para el restaurante MyC**  
Proyecto académico para la asignatura **Bases de Datos II** — 2025-1

---

## 🚀 Descripción

Este sistema permite al restaurante MyC administrar de forma eficiente sus operaciones diarias a través de una aplicación web moderna. Incluye módulos de:

- 📅 Reservas con asignación automática de mesas
- 🍽️ Pedidos con control de estado (pendiente, en preparación, listo, entregado)
- 📋 Gestión de platos y menú (creación, edición, disponibilidad)
- 💬 Reseñas de clientes (calificación, comentario, tipo de visita)
- 📊 Dashboard con métricas (ventas por día, ingresos, platos más vendidos)
- 🪑 Estado de mesas en tiempo real

---

## 🧱 Arquitectura y Tecnologías

| Capa       | Tecnología             |
|------------|------------------------|
| Frontend   | React + TailwindCSS    |
| Backend    | Node.js + Express      |
| Base Relacional | PostgreSQL + Sequelize |
| Base NoSQL | MongoDB + Mongoose     |
| Visualización | Recharts             |
| Comunicación | Axios (REST API)     |
| Herramientas Dev | Vite, ESLint, Nodemon |

---

## 🗃️ Estructura de Bases de Datos

### 🔹 PostgreSQL

- `clientes`: datos personales
- `mesas`: ubicación, estado y capacidad
- `platos`: menú, precio, categoría, disponibilidad
- `pedidos`: cliente, mesa, platos, total, estado
- `reservas`: cliente, mesa, fecha y hora

### 🔸 MongoDB

- `reseñas`: comentario, calificación, tipo de visita, platos consumidos
- `historialPedidos`: detalle completo de cada pedido, útil para analytics
- `preferenciasClientes`: alimentación, alergias, favoritos

---

## 📦 Instalación del proyecto

### Clona el repositorio

```bash
git clone https://github.com/AresHidalgo/MyC-Restaurant.git
cd MyC-Restaurant
```

### Comandos de arranque

```bash
npm i # Instala las dependencias

npm run dev:all # Inicia el Backend y el Frontend en modo desarrollo

npm run server # Inicia el Backend en modo desarrollo
npm run dev # Inicia el Frontend en modo desarrollo
```

---

## ✅ Requisitos previos

- Node.js 18+ y npm
- PostgreSQL 13+ en ejecución y accesible
- MongoDB 5+ en ejecución
- psql (cliente de PostgreSQL) instalado para ejecutar el script SQL (opcional pero recomendado)

---

## 🔐 Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con:

```env
# API
PORT=5000

# PostgreSQL
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=myc_restaurant
PG_USERNAME=postgres
PG_PASSWORD=changeme

# MongoDB
MONGO_URI=mongodb://localhost:27017/myc_restaurant
```

---

## 🗃️ Configuración de bases de datos

### PostgreSQL

1) Asegúrate de que el servicio esté activo y que el usuario/clave (de `.env`) tengan permisos.

2) Ejecuta el esquema incluido para crear la base, tablas e índices:

```bash
# En Windows con Git Bash puedes exportar el password temporalmente
export PGPASSWORD=$PG_PASSWORD

# Ejecuta conectado a la BD postgres por defecto y corre el script
psql -h $PG_HOST -U $PG_USERNAME -p ${PG_PORT:-5432} -d postgres -f "server/structure DBs/Postgrest.sql"
```

Notas:
- El script contiene `CREATE DATABASE myc_restaurant;` y `\c myc_restaurant;`.
- Si cambias `PG_DATABASE` en `.env`, adapta también el SQL o crea esa base manualmente.
- El backend también ejecuta `sequelize.sync({ alter: true })` para mantener el esquema alineado con los modelos.

### MongoDB

1) Asegura que MongoDB esté corriendo y que `MONGO_URI` apunte a una instancia válida.

2) Los esquemas de Mongo se encuentran en `server/models/mongo/` y un resumen en `server/structure DBs/MongoDB.md`.

---

## 🧭 Estructura del proyecto

```text
server/
  config/
    postgres.js       # Conexión Sequelize a PostgreSQL
    mongodb.js        # Conexión Mongoose a MongoDB
  controllers/        # Lógica de negocio por recurso
  models/
    pg/               # Modelos Sequelize (clientes, mesas, platos, reservas, pedidos)
    mongo/            # Modelos Mongoose (resenas, preferencias, historial, recomendaciones)
  routes/             # Rutas Express por módulo
  structure DBs/
    Postgrest.sql     # Script SQL completo
    MongoDB.md        # Esquemas de ejemplo para colecciones

src/
  components/         # UI del frontend (layout, dashboard, comunes)
  pages/              # Páginas de la app (Clientes, Mesas, Menú, etc.)
  contexts/           # Contextos (tema oscuro/claro)
  main.jsx / App.jsx  # Bootstrap de React y router
```

---

## 🧪 Scripts útiles

```bash
npm run dev       # Frontend (Vite)
npm run server    # Backend (Node --watch)
npm run dev:all   # Frontend + Backend en paralelo
npm run build     # Build del frontend
npm run preview   # Previsualización del build
npm run lint      # Linter
```

---

## 🔗 Endpoints principales (REST)

Base URL: `http://localhost:5000/api`

- Clientes (`/clientes`)
  - GET `/` — listar
  - GET `/:id` — detalle
  - POST `/` — crear
  - PUT `/:id` — actualizar
  - DELETE `/:id` — eliminar

- Mesas (`/mesas`)
  - GET `/` — listar
  - GET `/disponibilidad?fecha=YYYY-MM-DD&hora=HH:MM:SS&num_personas=N` — consultar disponibilidad
  - GET `/:id` — detalle
  - POST `/` — crear
  - PUT `/:id` — actualizar
  - DELETE `/:id` — eliminar

- Platos (`/platos`)
  - GET `/?categoria=...&disponibilidad=true|false` — listar con filtros
  - GET `/search?nombre=...` — búsqueda por nombre
  - GET `/:id` — detalle
  - POST `/` — crear
  - PUT `/:id` — actualizar
  - PATCH `/:id/disponibilidad` — alternar disponibilidad
  - DELETE `/:id` — eliminar

- Reservas (`/reservas`)
  - GET `/?fecha=YYYY-MM-DD&cliente_id=...&estado=...` — listar
  - GET `/fecha/:fecha` — listar por fecha
  - GET `/:id` — detalle
  - POST `/` — crear
  - PUT `/:id` — actualizar
  - PATCH `/:id/estado` — cambiar estado
  - DELETE `/:id` — eliminar

- Pedidos (`/pedidos`)
  - GET `/?fecha=YYYY-MM-DD&cliente_id=...&estado=...&tipo_pedido=mesa|para_llevar|delivery`
  - GET `/:id` — detalle
  - GET `/cliente/:id` — pedidos por cliente
  - POST `/` — crear (con items)
  - PATCH `/:id/estado` — cambiar estado

- Reseñas (`/resenas`)
  - GET `/` — listar
  - GET `/filtrar?tipo_visita=...&calificacion_min=...&calificacion_max=...&plato=...`
  - GET `/buscar?query=...` — búsqueda full-text
  - GET `/stats` — estadísticas
  - GET `/cliente/:id` — por cliente
  - GET `/:id` — detalle
  - POST `/` — crear
  - PUT `/:id` — actualizar
  - DELETE `/:id` — eliminar

- Preferencias (`/preferencias`)
  - GET `/` — todas
  - GET `/cliente/:id` — obtener por cliente
  - POST `/cliente/:id` — crear/actualizar
  - PUT `/cliente/:id` — crear/actualizar
  - DELETE `/cliente/:id` — eliminar

- Historial (`/historial`)
  - GET `/cliente/:id?plato=...&fecha_inicio=YYYY-MM-DD&fecha_fin=YYYY-MM-DD`
  - GET `/cliente/:id/populares` — top platos del cliente
  - GET `/pedido/:id` — detalle enriquecido
  - PUT `/pedido/:id` — actualizar detalles de platos
  - GET `/estadisticas/platos` — top global

- Ventas (`/ventas`)
  - GET `/` — métricas y agregados

---

## 🛠️ Solución de problemas

- Error al iniciar: `SequelizeConnectionError: no existe la base de datos "myc_restaurant"`
  - Causa: falta crear la base y tablas.
  - Solución: ejecuta el script `server/structure DBs/Postgrest.sql` como se indica arriba y revisa tu `.env`.

- Error de conexión MongoDB
  - Revisa que `MONGO_URI` sea alcanzable y el servicio esté activo.

---

## 📚 Notas adicionales

- El SQL incluye datos de ejemplo (clientes, mesas y platos) para pruebas rápidas.
- Los modelos relacionales viven en `server/models/pg/` y los documentos en `server/models/mongo/`.
- El dashboard del frontend consume los endpoints anteriores y muestra KPIs, reservas del día, pedidos recientes y reseñas.
