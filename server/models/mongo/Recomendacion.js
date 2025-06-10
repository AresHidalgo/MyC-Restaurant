import mongoose from 'mongoose';

const { Schema } = mongoose;

const RecomendacionSchema = new Schema({
  cliente_id: {
    type: Number,
    required: true
  },
  recomendaciones: [{
    plato_id: {
      type: Number
    },
    nombre_plato: {
      type: String
    },
    razon: {
      type: String
    },
    score: {
      type: Number,
      min: 0,
      max: 1
    }
  }],
  fecha_generacion: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('Recomendacion', RecomendacionSchema);