import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/postgres.js';
import Cliente from './Cliente.js';
import Mesa from './Mesa.js';
import Plato from './Plato.js';

const Pedido = sequelize.define('Pedido', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Cliente,
      key: 'id'
    }
  },
  mesa_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Mesa,
      key: 'id'
    }
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  costo_total: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado'),
    defaultValue: 'pendiente'
  },
  tipo_pedido: {
    type: DataTypes.ENUM('mesa', 'para_llevar', 'delivery'),
    defaultValue: 'mesa'
  },
  observaciones: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'pedidos',
  timestamps: true
});

// Define associations
Pedido.belongsTo(Cliente, { foreignKey: 'cliente_id' });
Pedido.belongsTo(Mesa, { foreignKey: 'mesa_id' });
Cliente.hasMany(Pedido, { foreignKey: 'cliente_id' });
Mesa.hasMany(Pedido, { foreignKey: 'mesa_id' });

// Define the join table for Pedidos and Platos (many-to-many)
const PedidoPlato = sequelize.define('PedidoPlato', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  pedido_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Pedido,
      key: 'id'
    }
  },
  plato_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Plato,
      key: 'id'
    }
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  precio_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  costo_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  observaciones: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'pedido_plato',
  timestamps: false
});

Pedido.belongsToMany(Plato, { through: PedidoPlato, foreignKey: 'pedido_id' });
Plato.belongsToMany(Pedido, { through: PedidoPlato, foreignKey: 'plato_id' });

export { Pedido, PedidoPlato };