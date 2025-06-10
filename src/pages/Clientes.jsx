import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiUser } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'
import PageHeader from '../components/common/PageHeader'
import ClienteModal from '../components/clientes/ClienteModal'

const Clientes = () => {
  const [clientes, setClientes] = useState([])
  const [filteredClientes, setFilteredClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentCliente, setCurrentCliente] = useState(null)

  // Fetch clientes
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/clientes')
        setClientes(response.data)
        setFilteredClientes(response.data)
      } catch (error) {
        console.error('Error fetching clientes:', error)
        toast.error('Error al cargar los clientes')
      } finally {
        setLoading(false)
      }
    }

    fetchClientes()
  }, [])

  // Filter clientes based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredClientes(clientes)
    } else {
      const term = searchTerm.toLowerCase()
      setFilteredClientes(
        clientes.filter(
          cliente =>
            cliente.nombre.toLowerCase().includes(term) ||
            cliente.correo.toLowerCase().includes(term) ||
            cliente.telefono.includes(term)
        )
      )
    }
  }, [searchTerm, clientes])

  const handleOpenModal = (cliente = null) => {
    setCurrentCliente(cliente)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setCurrentCliente(null)
    setIsModalOpen(false)
  }

  const handleSaveCliente = async (cliente) => {
    try {
      let response

      if (cliente.id) {
        // Update existing cliente
        response = await axios.put(`http://localhost:5000/api/clientes/${cliente.id}`, cliente)

        setClientes(clientes.map(c => c.id === cliente.id ? response.data : c))
        toast.success('Cliente actualizado correctamente')
      } else {
        // Create new cliente
        response = await axios.post('http://localhost:5000/api/clientes', cliente)

        setClientes([...clientes, response.data])
        toast.success('Cliente creado correctamente')
      }

      handleCloseModal()
    } catch (error) {
      console.error('Error saving cliente:', error)
      toast.error('Error al guardar el cliente')
    }
  }

  const handleDeleteCliente = async (id) => {

    if (window.confirm('¿Estás seguro de que deseas eliminar este cliente?') || false) {
      try {
        await axios.delete(`http://localhost:5000/api/clientes/${id}`)

        setClientes(clientes.filter(c => c.id !== id))
        toast.success('Cliente eliminado correctamente')
      } catch (error) {
        console.error('Error deleting cliente:', error)
        toast.error('Error al eliminar el cliente')
      }
    }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Clientes"
        description="Gestiona la información de tus clientes"
        actions={
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <FiPlus className="mr-2 -ml-1 h-4 w-4" />
            Nuevo Cliente
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
            placeholder="Buscar por nombre, correo o teléfono..."
          />
        </div>
      </div>

      {/* Clientes List */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Correo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preferencias
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                // Loading placeholders
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="h-4 bg-gray-200 rounded w-1/3 ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : filteredClientes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No se encontraron clientes
                  </td>
                </tr>
              ) : (
                filteredClientes.map(cliente => (
                  <tr key={cliente.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary-light flex items-center justify-center text-white">
                          <FiUser className="h-4 w-4" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{cliente.nombre}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{cliente.correo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{cliente.telefono}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/preferencias/${cliente.id}`}
                        className="text-secondary hover:text-secondary-dark transition-colors"
                      >
                        Ver preferencias
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(cliente)}
                        className="text-primary hover:text-primary-dark mr-4"
                      >
                        <FiEdit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCliente(cliente.id)}
                        className="text-error hover:text-red-900"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cliente Modal */}
      {isModalOpen && (
        <ClienteModal
          cliente={currentCliente}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveCliente}
        />
      )}
    </div>
  )
}

export default Clientes