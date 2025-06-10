import { Resena } from '../models/mongo/index.js';

// Get all reviews
export const getResenas = async (req, res) => {
  try {
    const resenas = await Resena.find().sort({ fecha_resena: -1 });
    return res.status(200).json(resenas);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get reviews with filters
export const getResenasFiltradas = async (req, res) => {
  const { tipo_visita, calificacion_min, calificacion_max, plato } = req.query;
  const filter = {};
  
  if (tipo_visita) {
    filter.tipo_visita = tipo_visita;
  }
  
  if (calificacion_min || calificacion_max) {
    filter.calificacion = {};
    if (calificacion_min) {
      filter.calificacion.$gte = parseInt(calificacion_min);
    }
    if (calificacion_max) {
      filter.calificacion.$lte = parseInt(calificacion_max);
    }
  }
  
  if (plato) {
    filter.platos_consumidos = { $in: [plato] };
  }
  
  try {
    const resenas = await Resena.find(filter).sort({ fecha_resena: -1 });
    return res.status(200).json(resenas);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Search reviews by text
export const searchResenas = async (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({ message: 'Término de búsqueda requerido' });
  }
  
  try {
    const resenas = await Resena.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } }
    ).sort({ score: { $meta: "textScore" } });
    
    return res.status(200).json(resenas);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get review by id
export const getResenaById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const resena = await Resena.findById(id);
    
    if (!resena) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }
    
    return res.status(200).json(resena);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Create a new review
export const createResena = async (req, res) => {
  const { calificacion, comentario, tipo_visita, platos_consumidos, cliente_id } = req.body;
  
  if (!calificacion || !comentario || !tipo_visita || !cliente_id) {
    return res.status(400).json({ 
      message: 'Calificación, comentario, tipo de visita y cliente son requeridos' 
    });
  }
  
  try {
    const newResena = await Resena.create({
      calificacion,
      comentario,
      tipo_visita,
      platos_consumidos: platos_consumidos || [],
      cliente_id,
      fecha_resena: new Date()
    });
    
    return res.status(201).json(newResena);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update a review
export const updateResena = async (req, res) => {
  const { id } = req.params;
  const { calificacion, comentario, tipo_visita, platos_consumidos } = req.body;
  
  try {
    const resena = await Resena.findById(id);
    
    if (!resena) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }
    
    const updatedResena = await Resena.findByIdAndUpdate(
      id,
      {
        calificacion: calificacion || resena.calificacion,
        comentario: comentario || resena.comentario,
        tipo_visita: tipo_visita || resena.tipo_visita,
        platos_consumidos: platos_consumidos || resena.platos_consumidos
      },
      { new: true }
    );
    
    return res.status(200).json(updatedResena);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Delete a review
export const deleteResena = async (req, res) => {
  const { id } = req.params;
  
  try {
    const resena = await Resena.findById(id);
    
    if (!resena) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }
    
    await Resena.findByIdAndDelete(id);
    
    return res.status(200).json({ message: 'Reseña eliminada correctamente' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get client reviews
export const getClienteResenas = async (req, res) => {
  const { id } = req.params;
  
  try {
    const resenas = await Resena.find({
      cliente_id: id
    }).sort({ fecha_resena: -1 });
    
    return res.status(200).json(resenas);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get review statistics
export const getResenaStats = async (req, res) => {
  try {
    const stats = await Resena.aggregate([
      {
        $group: {
          _id: null,
          avg_calificacion: { $avg: "$calificacion" },
          count: { $sum: 1 },
          calificacion_1: { $sum: { $cond: [{ $eq: ["$calificacion", 1] }, 1, 0] } },
          calificacion_2: { $sum: { $cond: [{ $eq: ["$calificacion", 2] }, 1, 0] } },
          calificacion_3: { $sum: { $cond: [{ $eq: ["$calificacion", 3] }, 1, 0] } },
          calificacion_4: { $sum: { $cond: [{ $eq: ["$calificacion", 4] }, 1, 0] } },
          calificacion_5: { $sum: { $cond: [{ $eq: ["$calificacion", 5] }, 1, 0] } }
        }
      }
    ]);
    
    const tipoVisitaStats = await Resena.aggregate([
      {
        $group: {
          _id: "$tipo_visita",
          count: { $sum: 1 }
        }
      }
    ]);
    
    return res.status(200).json({
      general: stats[0] || { avg_calificacion: 0, count: 0 },
      por_tipo_visita: tipoVisitaStats
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};