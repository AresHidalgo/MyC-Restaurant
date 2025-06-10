-- Create database
CREATE DATABASE myc_restaurant;

-- Use the database
\c myc_restaurant;

-- Create tables
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    correo VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mesas (
    id SERIAL PRIMARY KEY,
    capacidad INTEGER NOT NULL CHECK (capacidad > 0),
    ubicacion VARCHAR(255) NOT NULL,
    estado VARCHAR(50) DEFAULT 'disponible' CHECK (estado IN ('disponible', 'ocupada', 'reservada', 'mantenimiento')),
    descripcion TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE platos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
    disponibilidad BOOLEAN DEFAULT true,
    descripcion TEXT,
    imagen VARCHAR(500),
    costo DECIMAL(10,2) DEFAULT 0 CHECK (costo >= 0),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reservas (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
    mesa_id INTEGER REFERENCES mesas(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    num_personas INTEGER NOT NULL CHECK (num_personas > 0),
    estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'cancelada', 'completada')),
    observaciones TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
    mesa_id INTEGER REFERENCES mesas(id) ON DELETE SET NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    costo_total DECIMAL(10,2) DEFAULT 0 CHECK (costo_total >= 0),
    ganancia DECIMAL(10,2) GENERATED ALWAYS AS (total - costo_total) STORED,
    estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado')),
    observaciones TEXT,
    tipo_pedido VARCHAR(50) DEFAULT 'mesa' CHECK (tipo_pedido IN ('mesa', 'para_llevar', 'delivery')),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pedido_plato (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
    plato_id INTEGER REFERENCES platos(id) ON DELETE CASCADE,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL,
    costo_unitario DECIMAL(10,2) DEFAULT 0,
    subtotal DECIMAL(10,2) NOT NULL,
    observaciones TEXT
);

-- Create indexes for better performance
CREATE INDEX idx_reservas_fecha ON reservas(fecha);
CREATE INDEX idx_reservas_mesa_fecha ON reservas(mesa_id, fecha);
CREATE INDEX idx_pedidos_fecha ON pedidos(fecha);
CREATE INDEX idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX idx_pedidos_mesa ON pedidos(mesa_id);
CREATE INDEX idx_platos_categoria ON platos(categoria);
CREATE INDEX idx_platos_disponibilidad ON platos(disponibilidad);

-- Insert sample data
INSERT INTO clientes (nombre, correo, telefono) VALUES
('Juan Pérez', 'juan@email.com', '+34 600 123 456'),
('María García', 'maria@email.com', '+34 600 234 567'),
('Carlos López', 'carlos@email.com', '+34 600 345 678');

INSERT INTO mesas (capacidad, ubicacion, descripcion) VALUES
(2, 'Terraza', 'Mesa para 2 personas en la terraza'),
(4, 'Salón Principal', 'Mesa familiar en el salón principal'),
(6, 'Salón VIP', 'Mesa grande en zona VIP'),
(2, 'Ventana', 'Mesa junto a la ventana'),
(4, 'Centro', 'Mesa central del restaurante');

INSERT INTO platos (nombre, categoria, precio, descripcion, costo) VALUES
('Paella Valenciana', 'Principales', 18.50, 'Paella tradicional con pollo y verduras', 8.00),
('Gazpacho Andaluz', 'Entrantes', 6.50, 'Sopa fría de tomate tradicional', 2.50),
('Tortilla Española', 'Principales', 12.00, 'Tortilla de patatas casera', 4.00),
('Crema Catalana', 'Postres', 5.50, 'Postre tradicional catalán', 2.00),
('Sangría', 'Bebidas', 8.00, 'Sangría de la casa', 3.00),
('Agua Mineral', 'Bebidas', 2.50, 'Agua mineral natural', 0.80);
