import { Reserva, Cliente, Mesa } from '../models/pg/index.js'
import { Op } from 'sequelize'

// Get all reservations
export const getReservas = async (req, res) => {
  const { fecha, cliente_id, estado } = req.query
  const where = {}

  if (fecha) {
    where.fecha = fecha
  }

  if (cliente_id) {
    where.cliente_id = cliente_id
  }

  if (estado) {
    where.estado = estado
  }

  try {
    const reservas = await Reserva.findAll({
      where,
      include: [
        { model: Cliente, attributes: ['id', 'nombre', 'telefono'] },
        { model: Mesa, attributes: ['id', 'capacidad', 'ubicacion'] }
      ],
      order: [
        ['fecha', 'ASC'],
        ['hora', 'ASC']
      ]
    })

    return res.status(200).json(reservas)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

// Get reservation by id
export const getReservaById = async (req, res) => {
  const { id } = req.params

  try {
    const reserva = await Reserva.findByPk(id, {
      include: [
        { model: Cliente, attributes: ['id', 'nombre', 'telefono'] },
        { model: Mesa, attributes: ['id', 'capacidad', 'ubicacion'] }
      ]
    })

    if (!reserva) {
      return res.status(404).json({ message: 'Reserva no encontrada' })
    }

    return res.status(200).json(reserva)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

// Check if a table is available for a reservation
const isMesaAvailable = async (
  mesa_id,
  fecha,
  hora,
  excludeReservaId = null
) => {
  const where = {
    mesa_id,
    fecha,
    hora,
    estado: {
      [Op.notIn]: ['cancelada', 'completada']
    }
  }

  // Exclude the current reservation when updating
  if (excludeReservaId) {
    where.id = {
      [Op.ne]: excludeReservaId
    }
  }

  const existingReservation = await Reserva.findOne({
    where
  })

  return !existingReservation
}

// Create a new reservation
export const createReserva = async (req, res) => {
  const { cliente_id, mesa_id, fecha, hora, num_personas } = req.body

  if (!cliente_id || !mesa_id || !fecha || !hora || !num_personas) {
    return res.status(400).json({
      message: 'Cliente, mesa, fecha, hora y número de personas son requeridos'
    })
  }

  try {
    // Check if the client exists
    const cliente = await Cliente.findByPk(cliente_id)
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' })
    }

    // Check if the table exists and has enough capacity
    const mesa = await Mesa.findByPk(mesa_id)
    if (!mesa) {
      return res.status(404).json({ message: 'Mesa no encontrada' })
    }

    if (mesa.capacidad < num_personas) {
      return res.status(400).json({
        message:
          'La mesa no tiene suficiente capacidad para el número de personas'
      })
    }

    await Mesa.update(
      {
        estado: 'reservada',
        disponible: false
      },
      {
        where: { id: mesa_id }
      }
    )

    // Check if the table is available at the specified time
    const isAvailable = await isMesaAvailable(mesa_id, fecha, hora)
    if (!isAvailable) {
      return res.status(400).json({
        message: 'La mesa no está disponible en la fecha y hora seleccionada'
      })
    }

    // Create the reservation
    const newReserva = await Reserva.create({
      cliente_id,
      mesa_id,
      fecha,
      hora,
      num_personas,
      estado: 'pendiente'
    })

    const reservaWithDetails = await Reserva.findByPk(newReserva.id, {
      include: [
        { model: Cliente, attributes: ['id', 'nombre', 'telefono'] },
        { model: Mesa, attributes: ['id', 'capacidad', 'ubicacion'] }
      ]
    })

    return res.status(201).json(reservaWithDetails)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

// Update a reservation
export const updateReserva = async (req, res) => {
  const { id } = req.params
  const { cliente_id, mesa_id, fecha, hora, estado, num_personas } = req.body

  try {
    const reserva = await Reserva.findByPk(id)

    if (!reserva) {
      return res.status(404).json({ message: 'Reserva no encontrada' })
    }

    // Check table availability if changing date/time/table
    if (
      (mesa_id && mesa_id !== reserva.mesa_id) ||
      (fecha && fecha !== reserva.fecha) ||
      (hora && hora !== reserva.hora)
    ) {
      const targetMesaId = mesa_id || reserva.mesa_id
      const targetFecha = fecha || reserva.fecha
      const targetHora = hora || reserva.hora

      // Check if the table exists and has enough capacity
      if (mesa_id) {
        const mesa = await Mesa.findByPk(targetMesaId)
        if (!mesa) {
          return res.status(404).json({ message: 'Mesa no encontrada' })
        }

        const targetNumPersonas = num_personas || reserva.num_personas
        if (mesa.capacidad < targetNumPersonas) {
          return res.status(400).json({
            message:
              'La mesa no tiene suficiente capacidad para el número de personas'
          })
        }
      }

      const isAvailable = await isMesaAvailable(
        targetMesaId,
        targetFecha,
        targetHora,
        id
      )
      if (!isAvailable) {
        return res.status(400).json({
          message: 'La mesa no está disponible en la fecha y hora seleccionada'
        })
      }
    }

    // Update the reservation
    await reserva.update({
      cliente_id: cliente_id || reserva.cliente_id,
      mesa_id: mesa_id || reserva.mesa_id,
      fecha: fecha || reserva.fecha,
      hora: hora || reserva.hora,
      estado: estado || reserva.estado,
      num_personas: num_personas || reserva.num_personas
    })

    const updatedReserva = await Reserva.findByPk(id, {
      include: [
        { model: Cliente, attributes: ['id', 'nombre', 'telefono'] },
        { model: Mesa, attributes: ['id', 'capacidad', 'ubicacion'] }
      ]
    })

    return res.status(200).json(updatedReserva)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

// Delete a reservation
export const deleteReserva = async (req, res) => {
  const { id } = req.params

  try {
    const reserva = await Reserva.findByPk(id)

    if (!reserva) {
      return res.status(404).json({ message: 'Reserva no encontrada' })
    }

    await reserva.destroy()

    return res.status(200).json({ message: 'Reserva eliminada correctamente' })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

// Change reservation status
export const changeReservaStatus = async (req, res) => {
  const { id } = req.params
  const { estado } = req.body

  if (
    !estado ||
    !['pendiente', 'confirmada', 'cancelada', 'completada'].includes(estado)
  ) {
    return res.status(400).json({
      message:
        'Estado inválido. Los estados válidos son: pendiente, confirmada, cancelada, completada'
    })
  }

  try {
    const reserva = await Reserva.findByPk(id)

    if (!reserva) {
      return res.status(404).json({ message: 'Reserva no encontrada' })
    }

    await reserva.update({
      estado
    })

    return res.status(200).json(reserva)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

// Get reservations by date
export const getReservasByDate = async (req, res) => {
  const { fecha } = req.params

  if (!fecha) {
    return res.status(400).json({ message: 'Fecha es requerida' })
  }

  try {
    const reservas = await Reserva.findAll({
      where: {
        fecha,
        estado: {
          [Op.notIn]: ['cancelada']
        }
      },
      include: [
        { model: Cliente, attributes: ['id', 'nombre', 'telefono'] },
        { model: Mesa, attributes: ['id', 'capacidad', 'ubicacion'] }
      ],
      order: [['hora', 'ASC']]
    })

    return res.status(200).json(reservas)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}
