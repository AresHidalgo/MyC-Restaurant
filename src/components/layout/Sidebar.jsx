import { NavLink } from 'react-router-dom'
import {
  FiMenu, FiHome, FiUsers, FiGrid, FiBookOpen,
  FiCalendar, FiShoppingBag, FiMessageSquare,
  FiTrendingUp, FiSettings, FiPlus
} from 'react-icons/fi'

const Sidebar = ({ isOpen, setIsOpen, collapsed, setCollapsed }) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: FiHome },
    { name: 'Clientes', path: '/clientes', icon: FiUsers },
    { name: 'Mesas', path: '/mesas', icon: FiGrid },
    { name: 'Menú', path: '/menu', icon: FiBookOpen },
    { name: 'Reservas', path: '/reservas', icon: FiCalendar },
    { name: 'Pedidos', path: '/pedidos', icon: FiShoppingBag },
    { name: 'Reseñas', path: '/resenas', icon: FiMessageSquare },
    { name: 'Ventas', path: '/ventas', icon: FiTrendingUp },
  ]

  const quickActions = [
    { name: 'Nuevo Pedido', path: '/pedidos/crear', icon: FiPlus, color: 'text-primary-600 dark:text-primary-400' },
  ]

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 md:hidden transition-opacity duration-300 ease-in-out"
          onClick={() => setIsOpen(false)}
        ></div>

      )}

      <aside
        className={`fixed inset-y-0 left-0 ${collapsed ? 'w-20' : 'w-64'} bg-white dark:bg-dark-800 shadow-large dark:shadow-none border-r border-gray-100 dark:border-dark-700 transform z-30 transition-all duration-300 ease-in-out
        ${isOpen ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}
      >
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 dark:border-dark-700">
            <div className="flex items-center">
              <div className="bg-gradient-primary text-white font-bold text-xl px-3 py-1 rounded-lg">
                MC
              </div>
              {!collapsed && (
                <span className="ml-3 text-gray-700 dark:text-gray-200 font-semibold">Restaurant</span>
              )}
            </div>
            <button
              className="text-gray-500 px-3 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none transition-transform transform hover:rotate-180 duration-300 hidden md:inline-flex"
              onClick={() => setCollapsed(!collapsed)}
            >
              <FiMenu className={`h-6 w-6 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {!collapsed && (
            <div className="px-4 py-4 border-b border-gray-100 dark:border-dark-700">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Acciones Rápidas
              </h3>
              <ul className="space-y-1">
                {quickActions.map((item, index) => (
                  <li key={index}>
                    <NavLink
                      to={item.path}
                      className="flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 hover:bg-primary-50 dark:hover:bg-primary-900/20 group"
                      onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                    >
                      <item.icon className={`h-4 w-4 mr-3 ${item.color} group-hover:scale-110 transition-transform`} />
                      <span className="font-medium text-gray-700 dark:text-gray-200">{item.name}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <nav className="flex-1 px-4 py-4 overflow-y-auto">
            {!collapsed && (
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Navegación
              </h3>
            )}
            <ul className="space-y-1">
              {navItems.map((item, index) => (
                <li key={index}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 group ${isActive
                        ? 'bg-primary-600 text-white shadow-medium'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-700'
                      }`
                    }
                    onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                  >
                    <item.icon className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                    {!collapsed && item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t border-gray-100 dark:border-dark-700">
            <NavLink
              to="/configuracion"
              className="flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-700 group"
              onClick={() => window.innerWidth < 768 && setIsOpen(false)}
            >
              <FiSettings className="h-5 w-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
              {!collapsed && 'Configuración'}
            </NavLink>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-700">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-white shadow-medium">
                  <span className="font-bold text-sm">MC</span>
                </div>
                {!collapsed && (
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">MyC Restaurant</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">AresDev</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
