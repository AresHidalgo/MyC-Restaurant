import { useState, useEffect } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiToggleLeft, FiToggleRight } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'
import PageHeader from '../components/common/PageHeader'

const Menu = () => {
  const [platos, setPlatos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoriaFilter, setCategoriaFilter] = useState('')
  const [disponibilidadFilter, setDisponibilidadFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editPlato, setEditPlato] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [platoAEliminar, setPlatoAEliminar] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    precio: '',
    costo: '',
    descripcion: '',
    imagen: '',
    disponibilidad: true
  })


  const categorias = ['Entrantes', 'Principales', 'Postres', 'Bebidas']

  useEffect(() => {
    fetchPlatos()
  }, [])

  const fetchPlatos = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/platos')
      setPlatos(response.data)
    } catch (error) {
      console.error('Error fetching platos:', error)
      toast.error('Error al cargar el menú')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: '',
      categoria: '',
      precio: '',
      costo: '',
      descripcion: '',
      imagen: '',
      disponibilidad: true
    })
  }

  const handleSubmitPlato = async (e) => {
    e.preventDefault()

    try {
      if (editPlato) {
        const res = await axios.put(`http://localhost:5000/api/platos/${editPlato.id}`, formData)
        setPlatos(platos.map(p => (p.id === editPlato.id ? res.data : p)))
        toast.success('Plato actualizado')
      } else {
        const res = await axios.post('http://localhost:5000/api/platos', formData)
        setPlatos([...platos, res.data])
        toast.success('Plato creado')
      }
      setIsModalOpen(false)
      setEditPlato(null)
      resetForm()
    } catch (error) {
      console.error('Error al guardar plato:', error)
      toast.error('Error al guardar plato')
    }
  }

  const handleDeleteClick = (plato) => {
    setPlatoAEliminar(plato)
    setShowDeleteModal(true)
  }

  const confirmDeletePlato = async () => {
    if (!platoAEliminar) return
    try {
      await axios.delete(`http://localhost:5000/api/platos/${platoAEliminar.id}`)
      setPlatos(platos.filter(p => p.id !== platoAEliminar.id))
      toast.success('Plato eliminado')
    } catch (error) {
      console.error('Error al eliminar plato:', error)
      toast.error('Error al eliminar plato')
    } finally {
      setShowDeleteModal(false)
      setPlatoAEliminar(null)
    }
  }


  const handleToggleDisponibilidad = async (id, disponibilidad) => {
    try {
      await axios.patch(`http://localhost:5000/api/platos/${id}/disponibilidad`)
      setPlatos(platos.map(plato =>
        plato.id === id
          ? { ...plato, disponibilidad: !disponibilidad }
          : plato
      ))
      toast.success('Disponibilidad actualizada')
    } catch (error) {
      console.error('Error toggling disponibilidad:', error)
      toast.error('Error al actualizar disponibilidad')
    }
  }

  const filteredPlatos = platos.filter(plato => {
    const matchesSearch = plato.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plato.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategoria = !categoriaFilter || plato.categoria === categoriaFilter
    const matchesDisponibilidad = disponibilidadFilter === '' ||
      plato.disponibilidad === (disponibilidadFilter === 'true')

    return matchesSearch && matchesCategoria && matchesDisponibilidad
  })

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Menú"
        description="Gestiona los platos y su disponibilidad"
        actions={
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            onClick={() => {
              setEditPlato(null)
              resetForm()
              setIsModalOpen(true)
            }}

          >
            <FiPlus className="mr-2 -ml-1 h-4 w-4" />
            Nuevo Plato
          </button>
        }
      />

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buscar
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Buscar por nombre o descripción..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoría
          </label>
          <select
            value={categoriaFilter}
            onChange={(e) => setCategoriaFilter(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
          >
            <option value="">Todas las categorías</option>
            {categorias.map(categoria => (
              <option key={categoria} value={categoria}>{categoria}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Disponibilidad
          </label>
          <select
            value={disponibilidadFilter}
            onChange={(e) => setDisponibilidadFilter(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
          >
            <option value="">Todos</option>
            <option value="true">Disponible</option>
            <option value="false">No disponible</option>
          </select>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Loading placeholders
          [...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          ))
        ) : filteredPlatos.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No se encontraron platos
          </div>
        ) : (
          filteredPlatos.map(plato => (
            <div key={plato.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {plato.imagen && (
                <img
                  src={plato.imagen}
                  alt={plato.nombre}
                  className="w-full h-48 object-cover"
                />
              )}

              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{plato.nombre}</h3>
                  <span className="text-lg font-bold text-primary">€{Number(plato.precio).toFixed(2)}</span>
                </div>

                <p className="text-sm text-gray-600 mb-4">{plato.descripcion}</p>

                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {plato.categoria}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleDisponibilidad(plato.id, plato.disponibilidad)}
                      className={`text-2xl ${plato.disponibilidad ? 'text-success' : 'text-error'}`}
                    >
                      {plato.disponibilidad ? <FiToggleRight /> : <FiToggleLeft />}
                    </button>

                    <button
                      onClick={() => {
                        setEditPlato(plato)
                        setFormData({
                          nombre: plato.nombre,
                          categoria: plato.categoria,
                          precio: plato.precio,
                          costo: plato.costo,
                          descripcion: plato.descripcion,
                          imagen: plato.imagen || '',
                          disponibilidad: plato.disponibilidad
                        })
                        setIsModalOpen(true)
                      }}
                      className="text-primary hover:text-primary-dark"
                    >
                      <FiEdit2 className="h-5 w-5" />
                    </button>

                    <button
                      onClick={() => handleDeleteClick(plato)}
                      className="text-error hover:text-red-900"
                    >
                      <FiTrash2 className="h-5 w-5" />
                    </button>

                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editPlato ? 'Editar Plato' : 'Nuevo Plato'}
            </h2>

            <form onSubmit={handleSubmitPlato} className="space-y-4">
              {['nombre', 'categoria', 'precio', 'costo', 'descripcion', 'imagen'].map(field => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 capitalize">{field}</label>
                  <input
                    type={field === 'precio' || field === 'costo' ? 'number' : 'text'}
                    step="0.01"
                    value={formData[field]}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    required={field !== 'imagen' && field !== 'descripcion'}
                  />
                </div>
              ))}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setEditPlato(null)
                    resetForm()
                  }}
                  className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-white bg-orange-500 hover:bg-orange-600 rounded-md hover:bg-primary-dark"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              ¿Eliminar este plato?
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Estás por eliminar <strong>{platoAEliminar?.nombre}</strong>. Esta acción no se puede deshacer.
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setPlatoAEliminar(null)
                }}
                className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeletePlato}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>

  )
}

export default Menu