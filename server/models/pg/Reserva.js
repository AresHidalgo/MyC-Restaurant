import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/postgres.js';
import Cliente from './Cliente.js';
import Mesa from './Mesa.js';

const Reserva = sequelize.define('Reserva', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Cliente,
      key: 'id'
    }
  },
  mesa_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Mesa,
      key: 'id'
    }
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  hora: {
    type: DataTypes.TIME,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'confirmada', 'cancelada', 'completada'),
    defaultValue: 'pendiente'
  },
  num_personas: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  }
}, {
  tableName: 'reservas',
  timestamps: true
});

// Define associations
Reserva.belongsTo(Cliente, { foreignKey: 'cliente_id' });
Reserva.belongsTo(Mesa, { foreignKey: 'mesa_id' });
Cliente.hasMany(Reserva, { foreignKey: 'cliente_id' });
Mesa.hasMany(Reserva, { foreignKey: 'mesa_id' });

export default Reserva;