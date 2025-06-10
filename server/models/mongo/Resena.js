import mongoose from 'mongoose';

const { Schema } = mongoose;

const ResenaSchema = new Schema({
  calificacion: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comentario: {
    type: String,
    required: true
  },
  tipo_visita: {
    type: String,
    enum: ['familiar', 'negocios', 'romantica', 'amigos', 'otro'],
    required: true
  },
  fecha_resena: {
    type: Date,
    default: Date.now
  },
  platos_consumidos: [{
    type: String
  }],
  cliente_id: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Add text index for full-text search
ResenaSchema.index({ comentario: 'text', platos_consumidos: 'text' });

export default mongoose.model('Resena', ResenaSchema);