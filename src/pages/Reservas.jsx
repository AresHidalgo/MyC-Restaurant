import { useState, useEffect } from 'react'
import { FiCalendar, FiClock, FiUsers, FiCheckCircle, FiXCircle } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'
import PageHeader from '../components/common/PageHeader'

const Reservas = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [clienteId, setClienteId] = useState('');
  const [mesaId, setMesaId] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [numPersonas, setNumPersonas] = useState('');

  useEffect(() => {
    fetchClientes();
    fetchMesas();
  }, []);

  useEffect(() => {
    fetchReservas();
  }, [selectedDate]);

  const fetchClientes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/clientes');
      setClientes(response.data);
    } catch (error) {
      console.error('Error fetching clientes:', error);
      toast.error('Error al cargar los clientes');
    }
  };

  const fetchMesas = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/mesas');
      setMesas(response.data);
    } catch (error) {
      console.error('Error fetching mesas:', error);
      toast.error('Error al cargar las mesas');
    }
  };

  useEffect(() => {
    fetchReservas();
  }, [selectedDate]);

  const fetchReservas = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/reservas/fecha/${selectedDate}`)
      setReservas(response.data)
    } catch (error) {
      console.error('Error fetching reservas:', error)
      toast.error('Error al cargar las reservas')
    } finally {
      setLoading(false)
    }
  }

  const handleChangeStatus = async (id, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/reservas/${id}/estado`, { estado: newStatus })
      setReservas(reservas.map(reserva =>
        reserva.id === id
          ? { ...reserva, estado: newStatus }
          : reserva
      ))
      toast.success('Estado de reserva actualizado')
    } catch (error) {
      console.error('Error updating reserva status:', error)
      toast.error('Error al actualizar el estado')
    }
  }

  const getStatusColor = (status) => {
    const statusColors = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      confirmada: 'bg-green-100 text-green-800',
      cancelada: 'bg-red-100 text-red-800',
      completada: 'bg-gray-100 text-gray-800'
    }
    return statusColors[status] || statusColors.pendiente
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Reservas"
        description="Gestiona las reservas del restaurante"
        actions={
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            onClick={() => setIsModalOpen(true)}>
            <FiCalendar className="mr-2 -ml-1 h-4 w-4" />
            Nueva Reserva
          </button>
        }
      />

      {/* Modal for creating new reservation */}
      {isModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Crear Nueva Reserva
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Completa el siguiente formulario para crear una nueva reserva.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <form className="space-y-4" onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      console.log('Creating reserva...', {
                        clienteId,
                        mesaId,
                        fecha,
                        hora,
                        numPersonas
                      });
                      const response = await axios.post('http://localhost:5000/api/reservas', {
                        cliente_id: clienteId,
                        mesa_id: mesaId,
                        fecha: fecha,
                        hora: hora,
                        num_personas: numPersonas
                      });

                      console.log('Reserva created:', response.data);
                      toast.success('Reserva creada correctamente');
                      setIsModalOpen(false);
                      fetchReservas(); // Refresh reservations
                    } catch (error) {
                      console.error('Error creating reserva:', error);
                      toast.error('Error al crear la reserva');
                    }
                  }}>
                    <div>
                      <label htmlFor="cliente" className="block text-sm font-medium text-gray-700">Cliente</label>
                      <select id="cliente" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={clienteId}
                        onChange={(e) => setClienteId(e.target.value)}
                        required
                      >
                        <option value="">Seleccionar cliente</option>
                        {clientes.length > 0 ? (
                          clientes.map(cliente => (
                            <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>
                          ))
                        ) : (
                          <option>Cargando clientes...</option>
                        )}
                      </select>

                      <label htmlFor="mesa" className="block text-sm font-medium text-gray-700">Mesa</label>
                      <select id="mesa" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={mesaId}
                        onChange={(e) => setMesaId(e.target.value)}
                        required
                      >
                        <option value="">Seleccionar mesa</option>
                        {mesas.length > 0 ? (
                          mesas.map(mesa => (
                            <option key={mesa.id} value={mesa.id}>{mesa.ubicacion}</option>
                          ))
                        ) : (
                          <option>Cargando mesas...</option>
                        )}
                      </select>

                      <label htmlFor="fecha" className="block text-sm font-medium text-gray-700">Fecha</label>
                      <input type="date" id="fecha" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        required
                      />

                      <label htmlFor="hora" className="block text-sm font-medium text-gray-700">Hora</label>
                      <input type="time" id="hora" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={hora}
                        onChange={(e) => setHora(e.target.value)}
                        required
                      />

                      <label htmlFor="num_personas" className="block text-sm font-medium text-gray-700">Número de personas</label>
                      <input type="number" id="num_personas" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={numPersonas}
                        onChange={(e) => setNumPersonas(e.target.value)}
                        required
                      />
                      <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          Crear
                        </button>
                        <button
                          type="button"
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                          onClick={() => setIsModalOpen(false)}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Date Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Seleccionar Fecha
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
        />
      </div>

      {/* Reservations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Loading placeholders
          [...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))
        ) : reservas.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No hay reservas para esta fecha
          </div>
        ) : (
          reservas.map(reserva => (
            <div key={reserva.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {reserva.Cliente.nombre}
                </h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(reserva.estado)}`}>
                  {reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-600">
                  <FiClock className="h-4 w-4 mr-2" />
                  <span>{reserva.hora}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <FiUsers className="h-4 w-4 mr-2" />
                  <span>{reserva.num_personas} personas</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <FiCalendar className="h-4 w-4 mr-2" />
                  <span>Mesa {reserva.Mesa.id} ({reserva.Mesa.ubicacion})</span>
                </div>
              </div>

              {reserva.estado === 'pendiente' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleChangeStatus(reserva.id, 'confirmada')}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success"
                  >
                    <FiCheckCircle className="mr-2 -ml-1 h-4 w-4" />
                    Confirmar
                  </button>

                  <button
                    onClick={() => handleChangeStatus(reserva.id, 'cancelada')}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error"
                  >
                    <FiXCircle className="mr-2 -ml-1 h-4 w-4" />
                    Cancelar
                  </button>
                </div>
              )}

              {reserva.estado === 'confirmada' && (
                <button
                  onClick={() => handleChangeStatus(reserva.id, 'completada')}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-secondary hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
                >
                  <FiCheckCircle className="mr-2 -ml-1 h-4 w-4" />
                  Marcar como Completada
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Reservas
