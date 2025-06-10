import { useState, useEffect } from 'react'
import axios from 'axios'
import { FiUsers, FiBookOpen, FiCalendar, FiShoppingBag, FiTrendingUp } from 'react-icons/fi'
import PageHeader from '../components/common/PageHeader'
import StatsCard from '../components/dashboard/StatsCard'
import RecentOrdersList from '../components/dashboard/RecentOrdersList'
import ReservationsList from '../components/dashboard/ReservationsList'
import ReviewsChart from '../components/dashboard/ReviewsChart'


const OrderStatusBadge = ({ status }) => {
  const statusColors = {
    entregado: 'bg-green-500',
    en_preparacion: 'bg-yellow-500',
    listo: 'bg-blue-500',
    pendiente: 'bg-red-500'
  };
  return <span className={`text-white font-semibold py-1 px-2 rounded ${statusColors[status]}`}>{status.replace('_', ' ')}</span>;
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    clientesCount: 0,
    platosCount: 0,
    reservasHoy: 0,
    pedidosHoy: 0,
    ingresosSemana: 0
  });

  const [loading, setLoading] = useState(true);
  const [reseñas, setReseñas] = useState([]);
  const [reservasHoy, setReservasHoy] = useState([]);
  const [pedidosRecientes, setPedidosRecientes] = useState([]);
  const [pedidosEnPreparacion, setPedidosEnPreparacion] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch reservas
        const reservasRes = await axios.get('http://localhost:5000/api/reservas');
        const hoy = new Date().toISOString().split('T')[0];
        const reservasDeHoy = reservasRes.data.filter(r => r.fecha.startsWith(hoy));
        setReservasHoy(reservasDeHoy);

        const clientes = await axios.get('http://localhost:5000/api/clientes');
        const clientesCount = clientes.data.length;

        const ingresos = await axios.get('http://localhost:5000/api/ventas');
        const ingresosSemana = ingresos.data.ventasHoy

        const platos = await axios.get('http://localhost:5000/api/platos');
        const platosCount = platos.data.length
        setStats({ ...stats, platosCount, clientesCount, ingresosSemana });

        // Fetch pedidos
        const pedidosRes = await axios.get('http://localhost:5000/api/pedidos');
        const pedidos = pedidosRes.data;


        // Fetch reseñas
        const reseñasRes = await axios.get('http://localhost:5000/api/resenas');
        setReseñas(reseñasRes.data);


        const pedidosFormateados = pedidos.map(pedido => ({
          id: pedido.id,
          cliente: pedido.Cliente?.nombre || 'Sin nombre',
          mesa: pedido.Mesa?.id || 'N/A',
          items: pedido.Platos?.reduce((sum, p) => sum + (p.PedidoPlato?.cantidad || 0), 0) || 0,
          total: parseFloat(pedido.total),
          estado: pedido.estado
        }));

        setPedidosRecientes(pedidosFormateados);
        setStats(prev => ({
          ...prev,
          reservasHoy: reservasDeHoy.length,
          pedidosHoy: pedidosFormateados.length
        }));

      } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  const formatTime = (time) => {
    const date = new Date(time);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="dashboard-container">
      <div className="animate-fade-in">
        <PageHeader
          title="Panel de Control"
          description="Resumen del día y estadísticas del restaurante"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Clientes Totales" value={stats.clientesCount}
            icon={FiUsers}
            color="bg-blue-500"
            loading={loading}
          />
          <StatsCard
            title="Platos en Menú"
            value={stats.platosCount}
            icon={FiBookOpen}
            color="bg-green-500"
            loading={loading}
          />
          <StatsCard
            title="Reservas Hoy"
            value={stats.reservasHoy}
            icon={FiCalendar}
            color="bg-purple-500"
            loading={loading}
          />
          <StatsCard
            title="Pedidos Hoy"
            value={stats.pedidosHoy}
            icon={FiShoppingBag}
            color="bg-yellow-500"
            loading={loading}
          />
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <ReservationsList reservations={reservasHoy} loading={loading} />
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FiTrendingUp className="mr-2 text-accent" />
              Ingresos
            </h2>
            <div className="text-3xl font-bold mb-2">€{stats.ingresosSemana.toFixed(2)}</div>
            <div className="text-sm text-gray-500 mb-6">Esta semana</div>

          </div>
          <div className="bg-white lg:col-span-2 rounded-lg shadow-md p-6">
            <RecentOrdersList orders={pedidosRecientes} loading={loading} />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Reseñas recientes</h2>
            <div className="h-48">
              <ReviewsChart reviews={reseñas} loading={loading} />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Dashboard
