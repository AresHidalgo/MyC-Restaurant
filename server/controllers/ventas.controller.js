import { Pedido, PedidoPlato, Plato } from '../models/pg/index.js'
import { HistorialPedido } from '../models/mongo/index.js'
import { sequelize } from '../config/postgres.js'
import { Op } from 'sequelize'

export const getVentasData = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query

    const where = {}
    if (fechaInicio || fechaFin) {
      where.fecha = {}
      if (fechaInicio) where.fecha[Op.gte] = new Date(fechaInicio)
      if (fechaFin) {
        const end = new Date(fechaFin)
        end.setDate(end.getDate() + 1)
        where.fecha[Op.lt] = end
      }
    }

    // 1. Total de ventas y pedidos
    const totalVentas = (await Pedido.sum('total', { where })) || 0
    const totalPedidos = (await Pedido.count({ where })) || 0
    const [gananciaResult] = await sequelize.query(
      `SELECT SUM(total - costo_total) AS ganancia
   FROM pedidos
   ${where.fecha ? `WHERE fecha >= :start AND fecha < :end` : ''}`,
      {
        replacements: where.fecha
          ? { start: where.fecha[Op.gte], end: where.fecha[Op.lt] }
          : {},
        type: sequelize.QueryTypes.SELECT
      }
    )

    const gananciaNeta = parseFloat(gananciaResult.ganancia || 0)

    // 2. Ventas hoy
    const hoy = new Date()
    const startToday = new Date(hoy.setHours(0, 0, 0, 0))
    const endToday = new Date(hoy.setHours(23, 59, 59, 999))

    const ventasHoy =
      (await Pedido.sum('total', {
        where: {
          fecha: {
            [Op.gte]: startToday,
            [Op.lt]: endToday
          }
        }
      })) || 0

    // 3. Ventas por semana (últimos 7 días)
    const startOfWeek = new Date()
    startOfWeek.setDate(startOfWeek.getDate() - 6)
    startOfWeek.setHours(0, 0, 0, 0)

    const ventasSemana = await sequelize.query(
      `SELECT TO_CHAR(fecha, 'Dy') AS dia,
          SUM(total) AS ventas,
          COUNT(id) AS pedidos
   FROM pedidos
   WHERE fecha >= :inicio
   GROUP BY dia
   ORDER BY dia`,
      {
        replacements: { inicio: startOfWeek },
        type: sequelize.QueryTypes.SELECT
      }
    )

    // 4. Ventas por mes (año actual)
    const startYear = new Date(new Date().getFullYear(), 0, 1)
    const ventasMes = await sequelize.query(
      `SELECT TO_CHAR(fecha, 'Mon') AS mes,
          SUM(total) AS ventas
   FROM pedidos
   WHERE fecha >= :inicio
   GROUP BY mes
   ORDER BY mes`,
      {
        replacements: { inicio: startYear },
        type: sequelize.QueryTypes.SELECT
      }
    )

    // 5. Ventas por categoría
    const ventasPorCategoria = await sequelize.query(
      `
      SELECT p.categoria, SUM(pp.subtotal) AS ventas
      FROM pedido_plato pp
      JOIN platos p ON pp.plato_id = p.id
      GROUP BY p.categoria
      `,
      { type: sequelize.QueryTypes.SELECT }
    )

    // 6. Platos más populares desde Mongo
    let platosPopulares = []
    if (fechaInicio && fechaFin) {
      platosPopulares = await HistorialPedido.aggregate([
        {
          $match: {
            fecha_pedido: {
              $gte: new Date(fechaInicio),
              $lt: new Date(fechaFin)
            }
          }
        },
        { $unwind: '$detalles_platos' },
        {
          $group: {
            _id: '$detalles_platos.nombre_plato',
            nombre: { $first: '$detalles_platos.nombre_plato' },
            ventas: { $sum: '$detalles_platos.cantidad' },
            ingresos: {
              $sum: {
                $multiply: [
                  '$detalles_platos.cantidad',
                  '$detalles_platos.precio_unitario'
                ]
              }
            }
          }
        },
        { $sort: { ventas: -1 } },
        { $limit: 5 }
      ])
    }

    return res.status(200).json({
      totalVentas,
      totalPedidos,
      gananciaNeta,
      ventasHoy,
      ventasSemana,
      ventasMes,
      ventasPorCategoria,
      platosPopulares
    })
  } catch (error) {
    console.error('Error en getVentasData:', error)
    return res.status(500).json({ message: error.message })
  }
}
