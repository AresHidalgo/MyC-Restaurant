import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { FiShoppingBag, FiTrendingUp, FiCalendar } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'
import PageHeader from '../components/common/PageHeader'

const HistorialCliente = () => {
  const { clienteId } = useParams()
  const [historial, setHistorial] = useState([])
  const [platosPopulares, setPlatosPopulares] = useState([])
  const [cliente, setCliente] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    plato: '',
    fecha_inicio: '',
    fecha_fin: ''
  })
  
  useEffect(() => {
    fetchClienteData()
    fetchHistorial()
    fetchPlatosPopulares()
  }, [clienteId, filters])
  
  const fetchClienteData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/clientes/${clienteId}`)
      setCliente(response.data)
    } catch (error) {
      console.error('Error fetching cliente:', error)
      toast.error('Error al cargar los datos del cliente')
    }
  }
  
  const fetchHistorial = async () => {
    try {
      const params = new URLSearchParams(filters)
      const response = await axios.get(`http://localhost:5000/api/historial/cliente/${clienteId}?${params}`)
      setHistorial(response.data)
    } catch (error) {
      console.error('Error fetching historial:', error)
      toast.error('Error al cargar el historial')
    } finally {
      setLoading(false)
    }
  }
  
  const fetchPlatosPopulares = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/historial/cliente/${clienteId}/populares`)
      setPlatosPopulares(response.data)
    } catch (error) {
      console.error('Error fetching platos populares:', error)
    }
  }
  
  return (
    <div className="animate-fade-in">
      <PageHeader 
        title={cliente ? `Historial de ${cliente.nombre}` : 'Historial del Cliente'}
        description="Historial detallado de pedidos y preferencias"
      />
      
      {/* Popular Dishes */}
      <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <FiTrendingUp className="mr-2 text-primary" />
          Platos más ordenados
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platosPopulares.map(plato => (
            <div key={plato._id} className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900">{plato.nombre}</h3>
              <div className="mt-2 text-sm text-gray-500">
                <div>Ordenado {plato.veces_ordenado} veces</div>
                <div>Total gastado: €{plato.total_gastado.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plato
            </label>
            <input
              type="text"
              value={filters.plato}
              onChange={(e) => setFilters({ ...filters, plato: e.target.value })}
              placeholder="Buscar por plato..."
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={filters.fecha_inicio}
              onChange={(e) => setFilters({ ...filters, fecha_inicio: e.target.value })}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              value={filters.fecha_fin}
              onChange={(e) => setFilters({ ...filters, fecha_fin: e.target.value })}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            />
          </div>
        </div>
      </div>
      
      {/* Order History */}
      <div className="space-y-6">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="space-y-2">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded w-full"></div>
                ))}
              </div>
            </div>
          ))
        ) : historial.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-sm">
            No se encontraron pedidos en el historial
          </div>
        ) : (
          historial.map(pedido => (
            <div key={pedido._id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-lg font-medium text-gray-900">
                    Pedido #{pedido.pedido_id}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(pedido.fecha_pedido).toLocaleDateString()}
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                  {pedido.estado}
                </span>
              </div>
              
              <div className="space-y-4">
                {pedido.detalles_platos.map((detalle, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{detalle.nombre_plato}</div>
                      {detalle.observaciones && (
                        <div className="text-sm text-gray-500">
                          Nota: {detalle.observaciones}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div>{detalle.cantidad}x €{detalle.precio_unitario.toFixed(2)}</div>
                      <div className="text-sm text-gray-500">
                        €{(detalle.cantidad * detalle.precio_unitario).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center font-medium">
                    <span>Total</span>
                    <span>€{pedido.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default HistorialCliente