import { HistorialPedido } from '../models/mongo/index.js';
import { Cliente, Pedido } from '../models/pg/index.js';
import { Op } from 'sequelize';

export const getHistorialCliente = async (req, res) => {
  const { id } = req.params;
  const { plato, fecha_inicio, fecha_fin } = req.query;
  
  try {
    const cliente = await Cliente.findByPk(id);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    const filter = { cliente_id: id };
    
    if (plato) {
      filter['detalles_platos.nombre_plato'] = { $regex: plato, $options: 'i' };
    }
    
    if (fecha_inicio || fecha_fin) {
      filter.fecha_pedido = {};
      
      if (fecha_inicio) {
        filter.fecha_pedido.$gte = new Date(fecha_inicio);
      }
      
      if (fecha_fin) {
        const endDate = new Date(fecha_fin);
        endDate.setDate(endDate.getDate() + 1);
        filter.fecha_pedido.$lt = endDate;
      }
    }
    

    const historial = await HistorialPedido.find(filter)
      .sort({ fecha_pedido: -1 });
    
    return res.status(200).json(historial);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getHistorialPedidoById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const pedido = await Pedido.findByPk(id);
    if (!pedido) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    
    const historial = await HistorialPedido.findOne({ pedido_id: id });
    
    if (!historial) {
      return res.status(404).json({ message: 'Historial detallado no encontrado' });
    }
    
    return res.status(200).json(historial);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateHistorialPedido = async (req, res) => {
  const { id } = req.params;
  const { detalles_platos } = req.body;
  
  if (!detalles_platos) {
    return res.status(400).json({ message: 'Detalles de platos son requeridos' });
  }
  
  try {
    const pedido = await Pedido.findByPk(id);
    if (!pedido) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    const historial = await HistorialPedido.findOneAndUpdate(
      { pedido_id: id },
      { $set: { detalles_platos } },
      { new: true }
    );
    
    if (!historial) {
      return res.status(404).json({ message: 'Historial detallado no encontrado' });
    }
    
    return res.status(200).json(historial);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMasOrdenadosPorCliente = async (req, res) => {
  const { id } = req.params;
  
  try {
    const cliente = await Cliente.findByPk(id);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    const platosPopulares = await HistorialPedido.aggregate([
      { $match: { cliente_id: parseInt(id) } },
      { $unwind: '$detalles_platos' },
      {
        $group: {
          _id: '$detalles_platos.nombre_plato',
          nombre: { $first: '$detalles_platos.nombre_plato' },
          veces_ordenado: { $sum: '$detalles_platos.cantidad' },
          total_gastado: { $sum: { $multiply: ['$detalles_platos.cantidad', '$detalles_platos.precio_unitario'] } }
        }
      },
      { $sort: { veces_ordenado: -1 } },
      { $limit: 5 }
    ]);
    
    return res.status(200).json(platosPopulares);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getEstadisticasPlatoGlobal = async (req, res) => {
  try {
    const estadisticasGlobales = await HistorialPedido.aggregate([
      { $unwind: '$detalles_platos' },
      {
        $group: {
          _id: '$detalles_platos.nombre_plato',
          nombre: { $first: '$detalles_platos.nombre_plato' },
          veces_ordenado: { $sum: '$detalles_platos.cantidad' },
          ingresos_totales: { $sum: { $multiply: ['$detalles_platos.cantidad', '$detalles_platos.precio_unitario'] } }
        }
      },
      { $sort: { veces_ordenado: -1 } },
      { $limit: 10 }
    ]);
    
    return res.status(200).json(estadisticasGlobales);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};