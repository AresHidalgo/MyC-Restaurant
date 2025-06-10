import { Cliente } from '../models/pg/index.js';

export const getClientes = async (req, res) => {
  try {
    const clientes = await Cliente.findAll();
    return res.status(200).json(clientes);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getClienteById = async (req, res) => {
  const { id } = req.params;
  try {
    const cliente = await Cliente.findByPk(id);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    return res.status(200).json(cliente);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createCliente = async (req, res) => {
  const { nombre, correo, telefono } = req.body;
  
  if (!nombre || !correo || !telefono) {
    return res.status(400).json({ message: 'Nombre, correo y teléfono son requeridos' });
  }
  
  try {
    const newCliente = await Cliente.create({
      nombre,
      correo,
      telefono
    });
    return res.status(201).json(newCliente);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateCliente = async (req, res) => {
  const { id } = req.params;
  const { nombre, correo, telefono } = req.body;
  
  try {
    const cliente = await Cliente.findByPk(id);
    
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    await cliente.update({
      nombre: nombre || cliente.nombre,
      correo: correo || cliente.correo,
      telefono: telefono || cliente.telefono
    });
    
    return res.status(200).json(cliente);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteCliente = async (req, res) => {
  const { id } = req.params;
  
  try {
    const cliente = await Cliente.findByPk(id);
    
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    await cliente.destroy();
    
    return res.status(200).json({ message: 'Cliente eliminado correctamente' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};