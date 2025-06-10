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

### 1. Clona el repositorio

```bash
git clone https://github.com/AresHidalgo/MyC-Restaurant.git
cd myc-restaurant-management
