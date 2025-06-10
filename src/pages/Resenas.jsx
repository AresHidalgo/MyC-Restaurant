import { useState, useEffect } from 'react'
import { FiStar, FiFilter, FiCalendar } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'
import PageHeader from '../components/common/PageHeader'

const StarRating = ({ rating }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, index) => (
        <FiStar
          key={index}
          className={`h-5 w-5 ${
            index < rating
              ? 'text-yellow-400 fill-current'
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  )
}

const Resenas = () => {
  const [resenas, setResenas] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    tipo_visita: '',
    calificacion_min: '',
    calificacion_max: '',
    plato: ''
  })
  const [stats, setStats] = useState(null)
  
  useEffect(() => {
    fetchResenas()
    fetchStats()
  }, [filters])
  
  const fetchResenas = async () => {
    try {
      const params = new URLSearchParams(filters)
      const response = await axios.get(`http://localhost:5000/api/resenas/filtrar?${params}`)
      setResenas(response.data)
    } catch (error) {
      console.error('Error fetching resenas:', error)
      toast.error('Error al cargar las reseñas')
    } finally {
      setLoading(false)
    }
  }
  
  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/resenas/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }
  
  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Reseñas" 
        description="Gestiona las reseñas de los clientes"
      />
      
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Calificación Promedio
            </h3>
            <div className="flex items-center">
              <span className="text-3xl font-bold text-primary mr-2">
                {stats.general.avg_calificacion.toFixed(1)}
              </span>
              <StarRating rating={Math.round(stats.general.avg_calificacion)} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Total Reseñas
            </h3>
            <span className="text-3xl font-bold text-primary">
              {stats.general.count}
            </span>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Distribución por Tipo
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {stats.por_tipo_visita.map(tipo => (
                <div key={tipo._id} className="flex justify-between items-center">
                  <span className="text-gray-600 capitalize">{tipo._id}</span>
                  <span className="font-medium">{tipo.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Visita
            </label>
            <select
              value={filters.tipo_visita}
              onChange={(e) => setFilters({ ...filters, tipo_visita: e.target.value })}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            >
              <option value="">Todos los tipos</option>
              <option value="familiar">Familiar</option>
              <option value="negocios">Negocios</option>
              <option value="romantica">Romántica</option>
              <option value="amigos">Amigos</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calificación Mínima
            </label>
            <select
              value={filters.calificacion_min}
              onChange={(e) => setFilters({ ...filters, calificacion_min: e.target.value })}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            >
              <option value="">Cualquiera</option>
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>{num} estrellas</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calificación Máxima
            </label>
            <select
              value={filters.calificacion_max}
              onChange={(e) => setFilters({ ...filters, calificacion_max: e.target.value })}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            >
              <option value="">Cualquiera</option>
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>{num} estrellas</option>
              ))}
            </select>
          </div>
          
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
        </div>
      </div>
      
      {/* Reviews List */}
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
              <div className="h-16 bg-gray-200 rounded w-full"></div>
            </div>
          ))
        ) : resenas.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-sm">
            No se encontraron reseñas
          </div>
        ) : (
          resenas.map(resena => (
            <div key={resena._id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <StarRating rating={resena.calificacion} />
                  <div className="mt-2 text-sm text-gray-500">
                    {new Date(resena.fecha_resena).toLocaleDateString()}
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                  {resena.tipo_visita}
                </span>
              </div>
              
              <p className="text-gray-700 mb-4">{resena.comentario}</p>
              
              {resena.platos_consumidos.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Platos consumidos:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {resena.platos_consumidos.map((plato, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light text-white"
                      >
                        {plato}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Resenas