import mongoose from 'mongoose';

const { Schema } = mongoose;

const PreferenciaSchema = new Schema({
  cliente_id: {
    type: Number,
    required: true,
    unique: true
  },
  intolerancias: [{
    type: String
  }],
  estilos_preferidos: [{
    type: String
  }],
  ultima_actualizacion: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('Preferencia', PreferenciaSchema);