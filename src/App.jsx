import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Clientes from './pages/Clientes'
import Mesas from './pages/Mesas'
import Menu from './pages/Menu'
import Reservas from './pages/Reservas'
import Pedidos from './pages/Pedidos'
import CrearPedido from './pages/CrearPedido'
import Resenas from './pages/Resenas'
import Ventas from './pages/Ventas'
import HistorialCliente from './pages/HistorialCliente'
import PreferenciasCliente from './pages/PreferenciasCliente'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="mesas" element={<Mesas />} />
        <Route path="menu" element={<Menu />} />
        <Route path="reservas" element={<Reservas />} />
        <Route path="pedidos" element={<Pedidos />} />
        <Route path="pedidos/crear" element={<CrearPedido />} />
        <Route path="resenas" element={<Resenas />} />
        <Route path="ventas" element={<Ventas />} />
        <Route path="historial/:clienteId" element={<HistorialCliente />} />
        <Route path="preferencias/:clienteId" element={<PreferenciasCliente />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App