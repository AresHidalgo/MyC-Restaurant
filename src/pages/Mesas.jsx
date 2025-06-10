import { useState, useEffect } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiGrid } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'
import PageHeader from '../components/common/PageHeader'

const Mesas = () => {
  const [mesas, setMesas] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentMesa, setCurrentMesa] = useState(null)
  const [formData, setFormData] = useState({
    capacidad: '',
    ubicacion: ''
  })

  useEffect(() => {
    fetchMesas()
  }, [])

  const fetchMesas = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/mesas')
      setMesas(response.data)
    } catch (error) {
      console.error('Error fetching mesas:', error)
      toast.error('Error al cargar las mesas')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (mesa = null) => {
    setCurrentMesa(mesa)
    setFormData(mesa ? {
      capacidad: mesa.capacidad,
      ubicacion: mesa.ubicacion
    } : {
      capacidad: '',
      ubicacion: ''
    })
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setCurrentMesa(null)
    setFormData({ capacidad: '', ubicacion: '' })
    setIsModalOpen(false)
  }

  const handleSaveMesa = async (e) => {
    e.preventDefault()

    if (!formData.capacidad || !formData.ubicacion) {
      toast.error('Todos los campos son requeridos')
      return
    }

    try {
      let response

      if (currentMesa) {
        // Update existing mesa
        response = await axios.put(`http://localhost:5000/api/mesas/${currentMesa.id}`, formData)
        setMesas(mesas.map(m => m.id === currentMesa.id ? response.data : m))
        toast.success('Mesa actualizada correctamente')
      } else {
        // Create new mesa
        response = await axios.post('http://localhost:5000/api/mesas', formData)
        setMesas([...mesas, response.data])
        toast.success('Mesa creada correctamente')
      }

      handleCloseModal()
    } catch (error) {
      console.error('Error saving mesa:', error)
      toast.error('Error al guardar la mesa')
    }
  }

  const handleDeleteMesa = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta mesa?')) {
      try {
        await axios.delete(`http://localhost:5000/api/mesas/${id}`)
        setMesas(mesas.filter(m => m.id !== id))
        toast.success('Mesa eliminada correctamente')
      } catch (error) {
        console.error('Error deleting mesa:', error)
        toast.error('Error al eliminar la mesa')
      }
    }
  }

  const filteredMesas = mesas.filter(mesa =>
    mesa.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mesa.capacidad.toString().includes(searchTerm)
  )

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Mesas"
        description="Gestiona las mesas del restaurante"
        actions={
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <FiPlus className="mr-2 -ml-1 h-4 w-4" />
            Nueva Mesa
          </button>
        }
      />

      {/* Search */}
      <div className="mb-6">
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
            placeholder="Buscar por ubicación o capacidad..."
          />
        </div>
      </div>

      {/* Mesas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Loading placeholders
          [...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))
        ) : filteredMesas.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No se encontraron mesas
          </div>
        ) : (
          filteredMesas.map(mesa => (
            <div key={mesa.id} className={`rounded-xl shadow p-5 border transition duration-300 ${mesa.estado === 'ocupada' ? 'bg-red-50 border-red-200' :
              mesa.estado === 'reservada' ? 'bg-yellow-50 border-yellow-200' :
                'bg-green-50 border-green-200'
              }`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Mesa {mesa.id}</h3>
                <span className="text-xs text-gray-500">{mesa.ubicacion}</span>
              </div>

              <div className="text-sm text-gray-700 mb-2">
                Capacidad: <span className="font-medium">{mesa.capacidad} personas</span>
              </div>

              <div className="mb-3">
                <span className="text-sm text-gray-600">Estado: </span>
                <span className={`font-medium px-2 py-1 rounded-full text-xs ${mesa.estado === 'ocupada' ? 'bg-red-100 text-red-800' :
                  mesa.estado === 'reservada' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                  {mesa.estado.charAt(0).toUpperCase() + mesa.estado.slice(1)}
                </span>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => handleOpenModal(mesa)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <FiEdit2 />
                </button>
                <button
                  onClick={() => handleDeleteMesa(mesa.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Mesa Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={handleCloseModal}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200 mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {currentMesa ? 'Editar Mesa' : 'Nueva Mesa'}
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSaveMesa}>
                  <div className="mb-4">
                    <label htmlFor="capacidad" className="block text-sm font-medium text-gray-700">
                      Capacidad
                    </label>
                    <input
                      type="number"
                      id="capacidad"
                      value={formData.capacidad}
                      onChange={(e) => setFormData({ ...formData, capacidad: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      required
                      min="1"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="ubicacion" className="block text-sm font-medium text-gray-700">
                      Ubicación
                    </label>
                    <input
                      type="text"
                      id="ubicacion"
                      value={formData.ubicacion}
                      onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Mesas