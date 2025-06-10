import React from 'react'
import { FiClock, FiUsers, FiCheckCircle } from 'react-icons/fi'

const ReservationStatusBadge = ({ status }) => {
  const statusConfig = {
    confirmada: { color: 'bg-green-100 text-green-800', icon: FiCheckCircle },
    pendiente: { color: 'bg-yellow-100 text-yellow-800', icon: FiClock },
    cancelada: { color: 'bg-red-100 text-red-800', icon: FiClock },
  }

  const { color, icon: Icon } = statusConfig[status] || statusConfig.pendiente

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon className="mr-1 h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

const ReservationsList = ({ reservations, loading }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-200 w-1/3 mb-3 rounded"></div>
            <div className="flex justify-between mb-2">
              <div className="h-3 bg-gray-200 w-1/4 rounded"></div>
              <div className="h-3 bg-gray-200 w-1/5 rounded"></div>
            </div>
            <div className="h-3 bg-gray-200 w-3/5 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (reservations.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No hay reservas para hoy
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reservations.map((reservation) => (
        <div key={reservation.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <div className="flex justify-between mb-2">
            <h4 className="font-medium">{reservation.Cliente.nombre}</h4>
            <ReservationStatusBadge status={reservation.estado} />
          </div>

          <div className="flex items-center text-sm text-gray-500 space-x-4">
            <span className="flex items-center">
              <FiClock className="mr-1 h-4 w-4 text-gray-400" />
              {reservation.hora}
            </span>
            <span className="flex items-center">
              <FiUsers className="mr-1 h-4 w-4 text-gray-400" />
              {reservation.num_personas} personas
            </span>
            <span>Mesa {reservation.Mesa.id}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ReservationsList
