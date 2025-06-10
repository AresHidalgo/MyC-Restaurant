import { Mesa, Reserva } from '../models/pg/index.js';
import { Op } from 'sequelize';

export const getMesas = async (req, res) => {
  try {
    const mesas = await Mesa.findAll();
    return res.status(200).json(mesas);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMesaById = async (req, res) => {
  const { id } = req.params;
  try {
    const mesa = await Mesa.findByPk(id);
    if (!mesa) {
      return res.status(404).json({ message: 'Mesa no encontrada' });
    }
    return res.status(200).json(mesa);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createMesa = async (req, res) => {
  const { capacidad, ubicacion } = req.body;
  
  if (!capacidad || !ubicacion) {
    return res.status(400).json({ message: 'Capacidad y ubicación son requeridos' });
  }
  
  try {
    const newMesa = await Mesa.create({
      capacidad,
      ubicacion
    });
    return res.status(201).json(newMesa);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateMesa = async (req, res) => {
  const { id } = req.params;
  const { capacidad, ubicacion } = req.body;
  
  try {
    const mesa = await Mesa.findByPk(id);
    
    if (!mesa) {
      return res.status(404).json({ message: 'Mesa no encontrada' });
    }
    
    await mesa.update({
      capacidad: capacidad || mesa.capacidad,
      ubicacion: ubicacion || mesa.ubicacion
    });
    
    return res.status(200).json(mesa);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteMesa = async (req, res) => {
  const { id } = req.params;
  
  try {
    const mesa = await Mesa.findByPk(id);
    
    if (!mesa) {
      return res.status(404).json({ message: 'Mesa no encontrada' });
    }

    const hasReservations = await Reserva.findOne({
      where: {
        mesa_id: id,
        estado: {
          [Op.notIn]: ['cancelada', 'completada']
        },
        fecha: {
          [Op.gte]: new Date()
        }
      }
    });
    
    if (hasReservations) {
      return res.status(400).json({ 
        message: 'No se puede eliminar la mesa porque tiene reservas pendientes o confirmadas' 
      });
    }
    
    await mesa.destroy();
    
    return res.status(200).json({ message: 'Mesa eliminada correctamente' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Check table availability for a specific date and time
export const checkMesaAvailability = async (req, res) => {
  const { fecha, hora, num_personas } = req.query;
  
  if (!fecha || !hora || !num_personas) {
    return res.status(400).json({ 
      message: 'Fecha, hora y número de personas son requeridos' 
    });
  }
  
  try {
    // Find all tables with enough capacity
    const mesas = await Mesa.findAll({
      where: {
        capacidad: {
          [Op.gte]: num_personas
        }
      }
    });
    
    if (mesas.length === 0) {
      return res.status(404).json({ 
        message: 'No hay mesas disponibles con la capacidad solicitada' 
      });
    }
    
    // Get table IDs
    const mesasIds = mesas.map(mesa => mesa.id);
    
    // Check for existing reservations at the given time
    const reservedTables = await Reserva.findAll({
      where: {
        mesa_id: {
          [Op.in]: mesasIds
        },
        fecha,
        hora,
        estado: {
          [Op.notIn]: ['cancelada', 'completada']
        }
      }
    });
    
    const reservedTableIds = reservedTables.map(reserva => reserva.mesa_id);
    
    // Filter available tables
    const availableTables = mesas.filter(mesa => !reservedTableIds.includes(mesa.id));
    
    return res.status(200).json(availableTables);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};