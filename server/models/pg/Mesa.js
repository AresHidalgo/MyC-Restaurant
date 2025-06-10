import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/postgres.js';

const Mesa = sequelize.define('Mesa', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  capacidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  ubicacion: {
    type: DataTypes.STRING,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('disponible', 'ocupada', 'reservada', 'mantenimiento'),
    defaultValue: 'disponible'
  },
  descripcion: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'mesas',
  timestamps: true
});

export default Mesa;