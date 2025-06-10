import { Plato } from '../models/pg/index.js';

// Get all dishes
export const getPlatos = async (req, res) => {
  const { categoria, disponibilidad } = req.query;
  const where = {};
  
  if (categoria) {
    where.categoria = categoria;
  }
  
  if (disponibilidad !== undefined) {
    where.disponibilidad = disponibilidad === 'true';
  }
  
  try {
    const platos = await Plato.findAll({ where });
    return res.status(200).json(platos);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Search dishes by name
export const searchPlatos = async (req, res) => {
  const { nombre } = req.query;
  
  if (!nombre) {
    return res.status(400).json({ message: 'El parámetro de búsqueda es requerido' });
  }
  
  try {
    const platos = await Plato.findAll({
      where: {
        nombre: {
          [Op.iLike]: `%${nombre}%`
        }
      }
    });
    
    return res.status(200).json(platos);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get dish by id
export const getPlatoById = async (req, res) => {
  const { id } = req.params;
  try {
    const plato = await Plato.findByPk(id);
    
    if (!plato) {
      return res.status(404).json({ message: 'Plato no encontrado' });
    }
    
    return res.status(200).json(plato);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Create a new dish
export const createPlato = async (req, res) => {
  const { nombre, categoria, precio, disponibilidad, descripcion, imagen } = req.body;
  
  if (!nombre || !categoria || !precio) {
    return res.status(400).json({ message: 'Nombre, categoría y precio son requeridos' });
  }
  
  try {
    const newPlato = await Plato.create({
      nombre,
      categoria,
      precio,
      disponibilidad: disponibilidad !== undefined ? disponibilidad : true,
      descripcion,
      imagen
    });
    
    return res.status(201).json(newPlato);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update a dish
export const updatePlato = async (req, res) => {
  const { id } = req.params;
  const { nombre, categoria, precio, disponibilidad, descripcion, imagen } = req.body;
  
  try {
    const plato = await Plato.findByPk(id);
    
    if (!plato) {
      return res.status(404).json({ message: 'Plato no encontrado' });
    }
    
    await plato.update({
      nombre: nombre || plato.nombre,
      categoria: categoria || plato.categoria,
      precio: precio !== undefined ? precio : plato.precio,
      disponibilidad: disponibilidad !== undefined ? disponibilidad : plato.disponibilidad,
      descripcion: descripcion !== undefined ? descripcion : plato.descripcion,
      imagen: imagen || plato.imagen
    });
    
    return res.status(200).json(plato);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Delete a dish
export const deletePlato = async (req, res) => {
  const { id } = req.params;
  
  try {
    const plato = await Plato.findByPk(id);
    
    if (!plato) {
      return res.status(404).json({ message: 'Plato no encontrado' });
    }
    
    await plato.destroy();
    
    return res.status(200).json({ message: 'Plato eliminado correctamente' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Toggle dish availability
export const toggleDisponibilidad = async (req, res) => {
  const { id } = req.params;
  
  try {
    const plato = await Plato.findByPk(id);
    
    if (!plato) {
      return res.status(404).json({ message: 'Plato no encontrado' });
    }
    
    await plato.update({
      disponibilidad: !plato.disponibilidad
    });
    
    return res.status(200).json(plato);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};