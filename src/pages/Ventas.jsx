import { useState, useEffect } from 'react'
import {
  FiTrendingUp, FiDollarSign, FiShoppingBag, FiCalendar,
  FiFilter, FiDownload, FiBarChart2, FiPieChart
} from 'react-icons/fi'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import axios from 'axios'
import toast from 'react-hot-toast'
import PageHeader from '../components/common/PageHeader'

const Ventas = () => {
  const [ventasData, setVentasData] = useState({
    totalVentas: 0,
    totalPedidos: 0,
    gananciaNeta: 0,
    ventasHoy: 0,
    ventasSemana: [],
    ventasMes: [],
    ventasPorCategoria: [],
    platosPopulares: []
  })
  const totalVentasCategoria = ventasData.ventasPorCategoria.reduce(
    (sum, item) => sum + parseFloat(item.ventas), 0
  );

  const chartData = ventasData.ventasPorCategoria.map(item => ({
    ...item,
    ventas: parseFloat(item.ventas),
    porcentaje: Math.round((parseFloat(item.ventas) / totalVentasCategoria) * 100)
  }));

  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState({
    fechaInicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    fechaFin: new Date().toISOString().split('T')[0],
    tipoGrafico: 'linea'
  })
  const [chartType, setChartType] = useState('ventas')

  useEffect(() => {
    fetchVentasData()
  }, [filtros.fechaInicio, filtros.fechaFin])

  const fetchVentasData = async () => {
    try {
      setLoading(true)

      const params = {
        fechaInicio: filtros.fechaInicio,
        fechaFin: filtros.fechaFin
      }

      const response = await axios.get('http://localhost:5000/api/ventas', { params })
      setVentasData(response.data)
    } catch (error) {
      console.error('Error fetching ventas data:', error)
      toast.error('Error al cargar los datos de ventas')
    } finally {
      setLoading(false)
    }
  }

  const exportarDatos = () => {
    // Implement export functionality
    toast.success('Datos exportados correctamente')
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6384', '#AA46BE']

  const renderChart = () => {
    if (loading) {
      return (
        <div className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      )
    }

    const data = chartType === 'ventas' ? ventasData.ventasSemana : ventasData.ventasMes

    switch (filtros.tipoGrafico) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey={chartType === 'ventas' ? 'dia' : 'mes'} />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  `€${value.toLocaleString()}`,
                  name === 'ventas' ? 'Ventas' : 'Ganancia'
                ]}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="ventas"
                stackId="1"
                stroke="#b9412e"
                fill="#b9412e"
                fillOpacity={0.6}
                name="Ventas"
              />
              <Area
                type="monotone"
                dataKey="ganancia"
                stackId="1"
                stroke="#2e8a44"
                fill="#2e8a44"
                fillOpacity={0.6}
                name="Ganancia"
              />
            </AreaChart>
          </ResponsiveContainer>
        )

      case 'barras':
        return (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey={chartType === 'ventas' ? 'dia' : 'mes'} />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  `€${value.toLocaleString()}`,
                  name === 'ventas' ? 'Ventas' : 'Ganancia'
                ]}
              />
              <Legend />
              <Bar dataKey="ventas" fill="#b9412e" name="Ventas" />
              <Bar dataKey="ganancia" fill="#2e8a44" name="Ganancia" />
            </BarChart>
          </ResponsiveContainer>
        )

      default:
        return (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey={chartType === 'ventas' ? 'dia' : 'mes'} />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  `€${value.toLocaleString()}`,
                  name === 'ventas' ? 'Ventas' : 'Ganancia'
                ]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="ventas"
                stroke="#b9412e"
                strokeWidth={3}
                dot={{ fill: '#b9412e', strokeWidth: 2, r: 4 }}
                name="Ventas"
              />
              <Line
                type="monotone"
                dataKey="ganancia"
                stroke="#2e8a44"
                strokeWidth={3}
                dot={{ fill: '#2e8a44', strokeWidth: 2, r: 4 }}
                name="Ganancia"
              />
            </LineChart>
          </ResponsiveContainer>
        )
    }
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Análisis de Ventas"
        description="Monitorea el rendimiento financiero del restaurante"
        actions={
          <button
            onClick={exportarDatos}
            className="btn-secondary"
          >
            <FiDownload className="mr-2 -ml-1 h-4 w-4" />
            Exportar Datos
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ventas Totales</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                €{loading ? '---' : ventasData.totalVentas.toLocaleString()}
              </p>
            </div>
            <div className="h-12 w-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <FiDollarSign className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pedidos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? '---' : ventasData.totalPedidos.toLocaleString()}
              </p>
            </div>
            <div className="h-12 w-12 bg-secondary-100 dark:bg-secondary-900 rounded-lg flex items-center justify-center">
              <FiShoppingBag className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ganancia Neta</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                €{loading ? '---' : ventasData.gananciaNeta.toLocaleString()}
              </p>
            </div>
            <div className="h-12 w-12 bg-success-100 dark:bg-success-900 rounded-lg flex items-center justify-center">
              <FiTrendingUp className="h-6 w-6 text-success-600 dark:text-success-400" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ventas Hoy</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                €{loading ? '---' : ventasData.ventasHoy.toLocaleString()}
              </p>
            </div>
            <div className="h-12 w-12 bg-accent-100 dark:bg-accent-900 rounded-lg flex items-center justify-center">
              <FiCalendar className="h-6 w-6 text-accent-600 dark:text-accent-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Chart Controls */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={filtros.fechaInicio}
                onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha Fin
              </label>
              <input
                type="date"
                value={filtros.fechaFin}
                onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Período
              </label>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="select-field"
              >
                <option value="ventas">Semanal</option>
                <option value="mes">Mensual</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFiltros({ ...filtros, tipoGrafico: 'linea' })}
              className={`p-2 rounded-lg transition-colors ${filtros.tipoGrafico === 'linea'
                ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              title="Gráfico de líneas"
            >
              <FiTrendingUp className="h-5 w-5" />
            </button>
            <button
              onClick={() => setFiltros({ ...filtros, tipoGrafico: 'barras' })}
              className={`p-2 rounded-lg transition-colors ${filtros.tipoGrafico === 'barras'
                ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              title="Gráfico de barras"
            >
              <FiBarChart2 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setFiltros({ ...filtros, tipoGrafico: 'area' })}
              className={`p-2 rounded-lg transition-colors ${filtros.tipoGrafico === 'area'
                ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              title="Gráfico de área"
            >
              <FiPieChart className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="h-80">
          {renderChart()}
        </div>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ventas por Categoría */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Ventas por Categoría
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ categoria, porcentaje }) => `${categoria} ${porcentaje}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="ventas"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`€${value.toLocaleString()}`, 'Ventas']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platos Más Populares */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Platos Más Populares
          </h3>
          <div className="space-y-4">
            {ventasData.platosPopulares.map((plato, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{plato.nombre}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{plato.ventas} vendidos</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    €{plato.ingresos.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Ventas
