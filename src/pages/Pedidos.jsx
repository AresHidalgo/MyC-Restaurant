import { useState, useEffect } from 'react'
import { FiShoppingBag, FiFilter, FiCalendar } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'
import PageHeader from '../components/common/PageHeader'
import { useNavigate } from 'react-router-dom'

const OrderStatusBadge = ({ status }) => {
  const statusConfig = {
    pendiente: { color: 'bg-yellow-100 text-yellow-800' },
    en_preparacion: { color: 'bg-blue-100 text-blue-800' },
    listo: { color: 'bg-purple-100 text-purple-800' },
    entregado: { color: 'bg-green-100 text-green-800' },
    cancelado: { color: 'bg-red-100 text-red-800' },
  }

  const { color } = statusConfig[status] || statusConfig.pendiente

  const formattedStatus = status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {formattedStatus}
    </span>
  )
}

const Pedidos = () => {
  const navigate = useNavigate()
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [todosLosPedidos, setTodosLosPedidos] = useState([])
  const [verTodos, setVerTodos] = useState(false)
  const [filters, setFilters] = useState({
    fecha: new Date().toISOString().split('T')[0],
    estado: '',
    cliente_id: ''
  })

  useEffect(() => {
    fetchPedidos()
    fetchTodosLosPedidos()
  }, [filters])

  const fetchPedidos = async () => {
    try {
      const params = new URLSearchParams(filters)
      const response = await axios.get(`http://localhost:5000/api/pedidos?${params}`)
      setPedidos(response.data)
    } catch (error) {
      console.error('Error fetching pedidos:', error)
      toast.error('Error al cargar los pedidos')
    } finally {
      setLoading(false)
    }
  }

  const fetchTodosLosPedidos = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/pedidos')
      setTodosLosPedidos(res.data)
      setVerTodos(true)
    } catch (error) {
      console.error('Error al cargar todos los pedidos:', error)
      toast.error('No se pudieron cargar todos los pedidos')
    }
  }


  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/pedidos/${id}/estado`, { estado: newStatus })
      setPedidos(pedidos.map(pedido =>
        pedido.id === id
          ? { ...pedido, estado: newStatus }
          : pedido
      ))
      toast.success('Estado del pedido actualizado')
    } catch (error) {
      console.error('Error updating pedido status:', error)
      toast.error('Error al actualizar el estado')
    }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Pedidos"
        description="Gestiona los pedidos del restaurante"
        actions={
          <button
            onClick={() => navigate('/pedidos/crear')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <FiShoppingBag className="mr-2 -ml-1 h-4 w-4" />
            Nuevo Pedido
          </button>

        }

      />
      {!verTodos && (
        <div className="px-6 py-4 text-center">
          <button
            onClick={fetchTodosLosPedidos}
            className="text-primary bg-orange-500 hover:underline font-medium"
          >
            Ver todos los pedidos
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCalendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                value={filters.fecha}
                onChange={(e) => setFilters({ ...filters, fecha: e.target.value })}
                className="focus:ring-primary focus:border-primary text-black block w-full pl-10 sm:text-sm border-gray-600 rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filters.estado}
              onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_preparacion">En Preparación</option>
              <option value="listo">Listo</option>
              <option value="entregado">Entregado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mesa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Platos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-12"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-48"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-48"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-48"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </td>
                  </tr>
                ))
              ) : pedidos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No se encontraron pedidos
                  </td>
                </tr>
              ) : (
                pedidos.map(pedido => (
                  <tr key={pedido.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{pedido.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {pedido.Cliente.nombre}
                      </div>
                      <div className="text-sm text-gray-500">
                        {pedido.Cliente.telefono}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {pedido.Mesa
                          ? `${pedido.Mesa.ubicacion} - Mesa ${pedido.mesa_id}`
                          : 'Sin mesa'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {pedido.tipo_pedido}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {pedido.Platos.map(plato => (
                          <div key={plato.id}>
                            {plato.PedidoPlato.cantidad}x {plato.nombre}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      €{Number(pedido.total).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <OrderStatusBadge status={pedido.estado} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {pedido.estado === 'pendiente' && (
                        <button
                          onClick={() => handleStatusChange(pedido.id, 'en_preparacion')}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Iniciar Preparación
                        </button>
                      )}
                      {pedido.estado === 'en_preparacion' && (
                        <button
                          onClick={() => handleStatusChange(pedido.id, 'listo')}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          Marcar como Listo
                        </button>
                      )}
                      {pedido.estado === 'listo' && (
                        <button
                          onClick={() => handleStatusChange(pedido.id, 'entregado')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Marcar como Entregado
                        </button>
                      )}
                      {pedido.estado !== 'entregado' && pedido.estado !== 'cancelado' && (
                        <button
                          onClick={() => handleStatusChange(pedido.id, 'cancelado')}
                          className="text-red-600 px-4 hover:text-red-800"
                        >
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {verTodos && (
            <div className="mt-8 bg-white shadow-md rounded-lg overflow-hidden">
              <div className="p-4 font-semibold text-lg">Todos los Pedidos</div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mesa</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platos</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha y Hora</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {todosLosPedidos.map(pedido => (
                      <tr key={pedido.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{pedido.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{pedido.Cliente?.nombre}</div>
                          <div className="text-sm text-gray-500">{pedido.Cliente?.telefono}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {pedido.Mesa
                              ? `${pedido.Mesa.ubicacion} - Mesa ${pedido.mesa_id}`
                              : 'Sin mesa'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {pedido.tipo_pedido}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {pedido.Platos?.map(plato => (
                              <div key={plato.id}>
                                {plato.PedidoPlato?.cantidad}x {plato.nombre}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">€{Number(pedido.total).toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <OrderStatusBadge status={pedido.estado} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(pedido.fecha).toLocaleDateString('es-ES')} - {new Date(pedido.fecha).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default Pedidos