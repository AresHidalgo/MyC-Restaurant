import { Preferencia } from '../models/mongo/index.js';
import { Cliente } from '../models/pg/index.js';

// Get client preferences
export const getClientePreferencias = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if client exists
    const cliente = await Cliente.findByPk(id);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    // Get or create preferences
    let preferencias = await Preferencia.findOne({ cliente_id: id });
    
    if (!preferencias) {
      preferencias = {
        cliente_id: id,
        intolerancias: [],
        estilos_preferidos: [],
        ultima_actualizacion: new Date()
      };
    }
    
    return res.status(200).json(preferencias);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Create or update client preferences
export const upsertClientePreferencias = async (req, res) => {
  const { id } = req.params;
  const { intolerancias, estilos_preferidos } = req.body;
  
  if (!intolerancias && !estilos_preferidos) {
    return res.status(400).json({ 
      message: 'Se requiere al menos intolerancias o estilos preferidos' 
    });
  }
  
  try {
    // Check if client exists
    const cliente = await Cliente.findByPk(id);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    // Update or create preferences
    const update = {
      ultima_actualizacion: new Date()
    };
    
    if (intolerancias) {
      update.intolerancias = intolerancias;
    }
    
    if (estilos_preferidos) {
      update.estilos_preferidos = estilos_preferidos;
    }
    
    const preferencias = await Preferencia.findOneAndUpdate(
      { cliente_id: id },
      { $set: update },
      { new: true, upsert: true }
    );
    
    return res.status(200).json(preferencias);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get all clients with preferences
export const getClientesConPreferencias = async (req, res) => {
  try {
    const preferencias = await Preferencia.find();
    
    return res.status(200).json(preferencias);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Delete client preferences
export const deleteClientePreferencias = async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await Preferencia.findOneAndDelete({ cliente_id: id });
    
    if (!result) {
      return res.status(404).json({ message: 'Preferencias no encontradas para este cliente' });
    }
    
    return res.status(200).json({ message: 'Preferencias eliminadas correctamente' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};