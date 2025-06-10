import mongoose from 'mongoose';

const { Schema } = mongoose;

const DetallePlatoSchema = new Schema({
  nombre_plato: {
    type: String,
    required: true
  },
  cantidad: {
    type: Number,
    required: true,
    min: 1
  },
  precio_unitario: {
    type: Number,
    required: true
  },
  observaciones: {
    type: String
  }
});

const HistorialPedidoSchema = new Schema({
  pedido_id: {
    type: Number,
    required: true,
    unique: true
  },
  cliente_id: {
    type: Number,
    required: true
  },
  detalles_platos: [DetallePlatoSchema],
  fecha_pedido: {
    type: Date,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  estado: {
    type: String,
    enum: ['pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado'],
    default: 'pendiente'
  }
}, {
  timestamps: true
});

export default mongoose.model('HistorialPedido', HistorialPedidoSchema);