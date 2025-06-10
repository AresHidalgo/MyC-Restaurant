import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/postgres.js';

const Plato = sequelize.define('Plato', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: false
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  costo: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  disponibilidad: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  descripcion: {
    type: DataTypes.TEXT
  },
  imagen: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'platos',
  timestamps: true
});

export default Plato;