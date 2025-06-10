import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiPlus, FiMinus, FiTrash2, FiSearch, FiUser,
  FiMapPin, FiShoppingCart, FiDollarSign
} from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'
import PageHeader from '../components/common/PageHeader'

const CrearPedido = () => {
  const navigate = useNavigate()
  const [clientes, setClientes] = useState([])
  const [mesas, setMesas] = useState([])
  const [platos, setPlatos] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [pedido, setPedido] = useState({
    cliente_id: '',
    mesa_id: '',
    tipo_pedido: 'mesa',
    observaciones: '',
    items: []
  })

  const [filtros, setFiltros] = useState({
    categoria: '',
    busqueda: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [clientesRes, mesasRes, platosRes] = await Promise.all([
        axios.get('http://localhost:5000/api/clientes'),
        axios.get('http://localhost:5000/api/mesas'),
        axios.get('http://localhost:5000/api/platos?disponibilidad=true')
      ])

      setClientes(clientesRes.data)
      setMesas(mesasRes.data.filter(mesa => mesa.estado === 'disponible'))
      setPlatos(platosRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const platosFiltrados = platos.filter(plato => {
    const matchesCategoria = !filtros.categoria || plato.categoria === filtros.categoria
    const matchesBusqueda = !filtros.busqueda ||
      plato.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase())
    return matchesCategoria && matchesBusqueda
  })

  const agregarPlato = (plato) => {
    const existingItem = pedido.items.find(item => item.plato_id === plato.id)

    if (existingItem) {
      setPedido({
        ...pedido,
        items: pedido.items.map(item =>
          item.plato_id === plato.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      })
    } else {
      setPedido({
        ...pedido,
        items: [...pedido.items, {
          plato_id: plato.id,
          nombre: plato.nombre,
          precio: plato.precio,
          costo: plato.costo || 0,
          cantidad: 1,
          observaciones: ''
        }]
      })
    }
  }

  const actualizarCantidad = (platoId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      eliminarPlato(platoId)
      return
    }

    setPedido({
      ...pedido,
      items: pedido.items.map(item =>
        item.plato_id === platoId
          ? { ...item, cantidad: nuevaCantidad }
          : item
      )
    })
  }

  const eliminarPlato = (platoId) => {
    setPedido({
      ...pedido,
      items: pedido.items.filter(item => item.plato_id !== platoId)
    })
  }

  const actualizarObservaciones = (platoId, observaciones) => {
    setPedido({
      ...pedido,
      items: pedido.items.map(item =>
        item.plato_id === platoId
          ? { ...item, observaciones }
          : item
      )
    })
  }

  const calcularTotales = () => {
    const subtotal = pedido.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
    const costoTotal = pedido.items.reduce((sum, item) => sum + (item.costo * item.cantidad), 0)
    const ganancia = subtotal - costoTotal

    return { subtotal, costoTotal, ganancia }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (pedido.items.length === 0) {
      toast.error('Debe agregar al menos un plato al pedido')
      return
    }

    if (pedido.tipo_pedido === 'mesa' && !pedido.mesa_id) {
      toast.error('Debe seleccionar una mesa para pedidos en el restaurante')
      return
    }

    setSaving(true)

    try {
      const { subtotal } = calcularTotales()

      const pedidoData = {
        cliente_id: pedido.cliente_id || null,
        mesa_id: pedido.tipo_pedido === 'mesa' ? pedido.mesa_id : null,
        tipo_pedido: pedido.tipo_pedido,
        observaciones: pedido.observaciones,
        items: pedido.items.map(item => ({
          plato_id: item.plato_id,
          cantidad: item.cantidad,
          observaciones: item.observaciones
        }))
      }

      await axios.post('http://localhost:5000/api/pedidos', pedidoData)
      toast.success('Pedido creado correctamente')
      navigate('/pedidos')
    } catch (error) {
      console.error('Error creating pedido:', error)
      toast.error('Error al crear el pedido')
    } finally {
      setSaving(false)
    }
  }

  const { subtotal, costoTotal, ganancia } = calcularTotales()
  const categorias = [...new Set(platos.map(plato => plato.categoria))]

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="card p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Crear Nuevo Pedido"
        description="Registra un nuevo pedido en el sistema"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información del Pedido */}
          <div className="lg:col-span-2 space-y-6">
            {/* Datos Básicos */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Información del Pedido
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cliente (Opcional)
                  </label>
                  <select
                    value={pedido.cliente_id}
                    onChange={(e) => setPedido({ ...pedido, cliente_id: e.target.value })}
                    className="select-field"
                  >
                    <option value="">Seleccionar cliente...</option>
                    {clientes.map(cliente => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de Pedido
                  </label>
                  <select
                    value={pedido.tipo_pedido}
                    onChange={(e) => setPedido({ ...pedido, tipo_pedido: e.target.value })}
                    className="select-field"
                    required
                  >
                    <option value="mesa">Mesa</option>
                    <option value="para_llevar">Para Llevar</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </div>

                {pedido.tipo_pedido === 'mesa' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mesa
                    </label>
                    <select
                      value={pedido.mesa_id}
                      onChange={(e) => setPedido({ ...pedido, mesa_id: e.target.value })}
                      className="select-field"
                      required={pedido.tipo_pedido === 'mesa'}
                    >
                      <option value="">Seleccionar mesa...</option>
                      {mesas.map(mesa => (
                        <option key={mesa.id} value={mesa.id}>
                          Mesa {mesa.id} - {mesa.ubicacion} (Cap: {mesa.capacidad})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Observaciones
                  </label>
                  <textarea
                    value={pedido.observaciones}
                    onChange={(e) => setPedido({ ...pedido, observaciones: e.target.value })}
                    rows={3}
                    className="input-field"
                    placeholder="Observaciones especiales del pedido..."
                  />
                </div>
              </div>
            </div>

            {/* Selección de Platos */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Seleccionar Platos
              </h3>

              {/* Filtros */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Categoría
                  </label>
                  <select
                    value={filtros.categoria}
                    onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
                    className="select-field"
                  >
                    <option value="">Todas las categorías</option>
                    {categorias.map(categoria => (
                      <option key={categoria} value={categoria}>{categoria}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Buscar
                  </label>
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      value={filtros.busqueda}
                      onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                      className="input-field pl-10"
                      placeholder="Buscar platos..."
                    />
                  </div>
                </div>
              </div>

              {/* Lista de Platos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {platosFiltrados.map(plato => (
                  <div
                    key={plato.id}
                    className="border border-gray-200 dark:border-dark-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors cursor-pointer"
                    onClick={() => agregarPlato(plato)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{plato.nombre}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{plato.descripcion}</p>
                        <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-dark-600 text-gray-800 dark:text-gray-200 rounded">
                          {plato.categoria}
                        </span>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold text-primary-600 dark:text-primary-400">
                          €{Number(plato.precio).toFixed(2)}
                        </p>
                        <button
                          type="button"
                          className="mt-2 btn-primary text-xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            agregarPlato(plato)
                          }}
                        >
                          <FiPlus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resumen del Pedido */}
          <div className="space-y-6">
            <div className="card p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FiShoppingCart className="mr-2" />
                Resumen del Pedido
              </h3>

              {pedido.items.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No hay platos seleccionados
                </p>
              ) : (
                <div className="space-y-4">
                  {pedido.items.map(item => (
                    <div key={item.plato_id} className="border-b border-gray-200 dark:border-dark-600 pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          {item.nombre}
                        </h4>
                        <button
                          type="button"
                          onClick={() => eliminarPlato(item.plato_id)}
                          className="text-error-500 hover:text-error-700 transition-colors"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => actualizarCantidad(item.plato_id, item.cantidad - 1)}
                            className="w-6 h-6 rounded-full bg-gray-200 dark:bg-dark-600 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-dark-500 transition-colors"
                          >
                            <FiMinus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.cantidad}</span>
                          <button
                            type="button"
                            onClick={() => actualizarCantidad(item.plato_id, item.cantidad + 1)}
                            className="w-6 h-6 rounded-full bg-gray-200 dark:bg-dark-600 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-dark-500 transition-colors"
                          >
                            <FiPlus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          €{(item.precio * item.cantidad).toFixed(2)}
                        </span>
                      </div>

                      <textarea
                        value={item.observaciones}
                        onChange={(e) => actualizarObservaciones(item.plato_id, e.target.value)}
                        placeholder="Observaciones del plato..."
                        rows={2}
                        className="w-full text-xs input-field"
                      />
                    </div>
                  ))}

                  {/* Totales */}
                  <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-dark-600">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                      <span className="font-medium">€{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Costo:</span>
                      <span className="font-medium text-error-600">€{costoTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-dark-600 pt-2">
                      <span>Total:</span>
                      <span className="text-primary-600 dark:text-primary-400">€{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-success-600 dark:text-success-400">Ganancia:</span>
                      <span className="font-medium text-success-600 dark:text-success-400">
                        €{ganancia.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Botones de Acción */}
                  <div className="space-y-3 pt-4">
                    <button
                      type="submit"
                      disabled={saving || pedido.items.length === 0}
                      className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Creando...' : 'Crear Pedido'}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/pedidos')}
                      className="w-full btn-secondary"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default CrearPedido