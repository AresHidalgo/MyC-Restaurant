import { useState, useEffect } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { FiHeart, FiAlertCircle, FiCheck, FiArrowLeft } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'
import PageHeader from '../components/common/PageHeader'

const PreferenciasCliente = () => {
  const navigate = useNavigate()
  const { clienteId } = useParams()
  const [cliente, setCliente] = useState(null)
  const [preferencias, setPreferencias] = useState({
    intolerancias: [],
    estilos_preferidos: []
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const estilosDisponibles = [
    'vegetariano',
    'vegano',
    'sin_gluten',
    'bajo_en_calorias',
    'picante',
    'mediterraneo',
    'tradicional',
    'fusion',
    'internacional'
  ]

  const intoleranciasPosibles = [
    'lactosa',
    'gluten',
    'frutos_secos',
    'mariscos',
    'huevo',
    'soja'
  ]

  useEffect(() => {
    fetchData()
  }, [clienteId])

  const fetchData = async () => {
    try {
      const [clienteRes, preferenciasRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/clientes/${clienteId}`),
        axios.get(`http://localhost:5000/api/preferencias/cliente/${clienteId}`)
      ])

      setCliente(clienteRes.data)
      setPreferencias(preferenciasRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleIntolerancia = (intolerancia) => {
    setPreferencias(prev => ({
      ...prev,
      intolerancias: prev.intolerancias.includes(intolerancia)
        ? prev.intolerancias.filter(i => i !== intolerancia)
        : [...prev.intolerancias, intolerancia]
    }))
  }

  const handleToggleEstilo = (estilo) => {
    setPreferencias(prev => ({
      ...prev,
      estilos_preferidos: prev.estilos_preferidos.includes(estilo)
        ? prev.estilos_preferidos.filter(e => e !== estilo)
        : [...prev.estilos_preferidos, estilo]
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await axios.put(`http://localhost:5000/api/preferencias/cliente/${clienteId}`, preferencias)
      toast.success('Preferencias guardadas correctamente')
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast.error('Error al guardar las preferencias')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>

          <div className="space-y-6">
            <div>
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>

            <div>
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={cliente ? `Preferencias de ${cliente.nombre}` : 'Preferencias del Cliente'}
        description="Gestiona las preferencias alimentarias y estilos favoritos"
      />

      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Intolerancias */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FiAlertCircle className="mr-2 text-warning" />
            Intolerancias y Alergias
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {intoleranciasPosibles.map(intolerancia => (
              <button
                key={intolerancia}
                onClick={() => handleToggleIntolerancia(intolerancia)}
                className={`px-4 py-2 rounded-lg border ${preferencias.intolerancias.includes(intolerancia)
                  ? 'bg-red-500 hover:bg-red-400 text-white border-error'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <span className="capitalize">{intolerancia.replace('_', ' ')}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Estilos Preferidos */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FiHeart className="mr-2 text-primary" />
            Estilos de Cocina Preferidos
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {estilosDisponibles.map(estilo => (
              <button
                key={estilo}
                onClick={() => handleToggleEstilo(estilo)}
                className={`px-4 py-2 rounded-lg border ${preferencias.estilos_preferidos.includes(estilo)
                  ? 'bg-blue-500 hover:bg-blue-400 text-white border-primary'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <span className="capitalize">{estilo.replace('_', ' ')}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-between mt-8">
          <button
            type='button'
            onClick={() => navigate('/clientes')}
            className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50'>
            <FiArrowLeft className="mr-2 -ml-1 h-4 w-4" />
            Volver
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            <FiCheck className="mr-2 -ml-1 h-4 w-4" />
            {saving ? 'Guardando...' : 'Guardar Preferencias'}
          </button>

        </div>
      </div>
    </div>
  )
}

export default PreferenciasCliente