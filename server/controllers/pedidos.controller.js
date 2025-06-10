import { Pedido, PedidoPlato, Cliente, Plato, Mesa } from '../models/pg/index.js';
import { HistorialPedido } from '../models/mongo/index.js';
import { sequelize } from '../config/postgres.js';
import { Op } from 'sequelize';

export const getPedidos = async (req, res) => {
  const { fecha, cliente_id, estado, tipo_pedido } = req.query;
  const where = {};
  
  if (fecha) {
    const targetDate = new Date(fecha);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);
    
    where.fecha = {
      [Op.gte]: targetDate,
      [Op.lt]: nextDate
    };
  }
  
  if (cliente_id) {
    where.cliente_id = cliente_id;
  }
  
  if (estado) {
    where.estado = estado;
  }

  if (tipo_pedido) {
    where.tipo_pedido = tipo_pedido;
  }
  
  try {
    const pedidos = await Pedido.findAll({
      where,
      include: [
        { model: Cliente, attributes: ['id', 'nombre', 'telefono'] },
        { model: Mesa, attributes: ['id', 'capacidad', 'ubicacion'] },
        { model: Plato, through: { attributes: ['cantidad', 'precio_unitario', 'subtotal', 'observaciones'] } }
      ],
      order: [['fecha', 'DESC']]
    });
    
    return res.status(200).json(pedidos);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get order by id
export const getPedidoById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const pedido = await Pedido.findByPk(id, {
      include: [
        { model: Cliente, attributes: ['id', 'nombre', 'telefono'] },
        { model: Mesa, attributes: ['id', 'capacidad', 'ubicacion'] },
        { model: Plato, through: { attributes: ['cantidad', 'precio_unitario', 'subtotal', 'observaciones'] } }
      ]
    });
    
    if (!pedido) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    
    return res.status(200).json(pedido);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createPedido = async (req, res) => {
  const { cliente_id, mesa_id, tipo_pedido, observaciones, items } = req.body;
  
  if (!items || !items.length) {
    return res.status(400).json({ 
      message: 'Items del pedido son requeridos' 
    });
  }
  
  const t = await sequelize.transaction();
  
  try {
    if (cliente_id) {
      const cliente = await Cliente.findByPk(cliente_id);
      if (!cliente) {
        await t.rollback();
        return res.status(404).json({ message: 'Cliente no encontrado' });
      }
    }

    if (mesa_id) {
      const mesa = await Mesa.findByPk(mesa_id);
      if (!mesa) {
        await t.rollback();
        return res.status(404).json({ message: 'Mesa no encontrada' });
      }
      
      if (mesa.estado !== 'disponible') {
        await t.rollback();
        return res.status(400).json({ message: 'La mesa no está disponible' });
      }
    }
    
    const platoIds = items.map(item => item.plato_id);
    const platos = await Plato.findAll({
      where: {
        id: {
          [Op.in]: platoIds
        }
      }
    });
    
    if (platos.length !== platoIds.length) {
      await t.rollback();
      return res.status(404).json({ message: 'Uno o más platos no existen' });
    }
    
    const unavailablePlatos = platos.filter(plato => !plato.disponibilidad);
    if (unavailablePlatos.length > 0) {
      await t.rollback();
      return res.status(400).json({ 
        message: `Los siguientes platos no están disponibles: ${unavailablePlatos.map(p => p.nombre).join(', ')}` 
      });
    }

    let total = 0;
    let costoTotal = 0;
    const platoMap = {};
    platos.forEach(plato => {
      platoMap[plato.id] = plato;
    });
    
    items.forEach(item => {
      const plato = platoMap[item.plato_id];
      total += plato.precio * item.cantidad;
      costoTotal += (plato.costo || 0) * item.cantidad;
    });

    const newPedido = await Pedido.create({
      cliente_id: cliente_id || null,
      mesa_id: mesa_id || null,
      fecha: new Date(),
      total,
      costo_total: costoTotal,
      estado: 'pendiente',
      tipo_pedido: tipo_pedido || 'mesa',
      observaciones
    }, { transaction: t });

    for (const item of items) {
      const plato = platoMap[item.plato_id];
      await PedidoPlato.create({
        pedido_id: newPedido.id,
        plato_id: item.plato_id,
        cantidad: item.cantidad,
        precio_unitario: plato.precio,
        costo_unitario: plato.costo || 0,
        subtotal: plato.precio * item.cantidad,
        observaciones: item.observaciones || ''
      }, { transaction: t });
    }

    if (mesa_id && tipo_pedido === 'mesa') {
      await Mesa.update(
        { estado: 'ocupada' },
        { where: { id: mesa_id }, transaction: t }
      );
    }

    await t.commit();

    const detailsPlatos = items.map(item => {
      const plato = platoMap[item.plato_id];
      return {
        nombre_plato: plato.nombre,
        cantidad: item.cantidad,
        precio_unitario: plato.precio,
        observaciones: item.observaciones || ''
      };
    });
    
    await HistorialPedido.create({
      pedido_id: newPedido.id,
      cliente_id: cliente_id || null,
      detalles_platos: detailsPlatos,
      fecha_pedido: newPedido.fecha,
      total: newPedido.total,
      estado: newPedido.estado,
      mesa_id: mesa_id || null,
      tipo_pedido: newPedido.tipo_pedido
    });

    const pedidoCompleto = await Pedido.findByPk(newPedido.id, {
      include: [
        { model: Cliente, attributes: ['id', 'nombre', 'telefono'] },
        { model: Mesa, attributes: ['id', 'capacidad', 'ubicacion'] },
        { model: Plato, through: { attributes: ['cantidad', 'precio_unitario', 'subtotal', 'observaciones'] } }
      ]
    });
    
    return res.status(201).json(pedidoCompleto);
  } catch (error) {
    await t.rollback();
    return res.status(500).json({ message: error.message });
  }
};

export const updatePedidoStatus = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  
  if (!estado || !['pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado'].includes(estado)) {
    return res.status(400).json({ 
      message: 'Estado inválido. Los estados válidos son: pendiente, en_preparacion, listo, entregado, cancelado'
    });
  }
  
  const t = await sequelize.transaction();
  
  try {
    const pedido = await Pedido.findByPk(id, { include: [Mesa] });
    
    if (!pedido) {
      await t.rollback();
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    
    await pedido.update({ estado }, { transaction: t });

    if (pedido.mesa_id && (estado === 'entregado' || estado === 'cancelado')) {
      await Mesa.update(
        { estado: 'disponible' },
        { where: { id: pedido.mesa_id }, transaction: t }
      );
    }

    await HistorialPedido.findOneAndUpdate(
      { pedido_id: id },
      { $set: { estado } }
    );
    
    await t.commit();
    
    return res.status(200).json(pedido);
  } catch (error) {
    await t.rollback();
    return res.status(500).json({ message: error.message });
  }
};

export const getClientePedidos = async (req, res) => {
  const { id } = req.params;
  
  try {
    const cliente = await Cliente.findByPk(id);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    const pedidos = await Pedido.findAll({
      where: {
        cliente_id: id
      },
      include: [
        { model: Mesa, attributes: ['id', 'capacidad', 'ubicacion'] },
        { model: Plato, through: { attributes: ['cantidad', 'precio_unitario', 'subtotal', 'observaciones'] } }
      ],
      order: [['fecha', 'DESC']]
    });
    
    return res.status(200).json(pedidos);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};