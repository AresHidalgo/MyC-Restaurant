import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiMenu, FiBell, FiCalendar, FiUser, FiSun, FiMoon } from 'react-icons/fi'
import { useTheme } from '../../contexts/ThemeContext'

const Navbar = ({ onMenuClick }) => {
  const [currentDate, setCurrentDate] = useState('')
  const [currentTime, setCurrentTime] = useState('')
  const [notifications, setNotifications] = useState([])
  const { theme, toggleTheme, isDark } = useTheme()

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      setCurrentDate(now.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }))
      setCurrentTime(now.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      }))
    }

    updateDateTime()
    const intervalId = setInterval(updateDateTime, 60000)

    return () => clearInterval(intervalId)
  }, [])

  return (
    <header className="bg-white dark:bg-dark-800 shadow-soft dark:shadow-none border-b border-gray-100 dark:border-dark-700 z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center">
            <button
              type="button"
              className="md:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none transition-transform duration-200 transform active:scale-90"
              onClick={onMenuClick}
            >
              <FiMenu className="h-6 w-6" />
            </button>

            <div className="ml-4 md:ml-0 px-24">
              <Link to="/" className="flex items-center group">
                <div className="bg-gradient-primary text-white font-bold text-xl px-3 py-1 rounded-lg">
                  MyC
                </div>
                <span className="ml-3 text-gray-700 dark:text-gray-200 font-semibold hidden sm:block group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  Restaurant
                </span>
              </Link>
            </div>
          </div>

          {/* Center */}
          <div className="hidden md:flex flex-col items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
              {currentDate}
            </span>
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              {currentTime}
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-all duration-200"
              title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {isDark ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
            </button>

            <Link
              to="/reservas"
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-all duration-200"
              title="Ver reservas"
            >
              <FiCalendar className="h-5 w-5" />
            </Link>

            <div className="relative">
              <button
                type="button"
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-all duration-200"
                title="Notificaciones"
              >
                <FiBell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-error-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce-soft">
                    {notifications.length}
                  </span>
                )}
              </button>
            </div>

            <div className="hidden md:block h-6 w-px bg-gray-300 dark:bg-dark-600"></div>

            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-white shadow-medium">
                <FiUser className="h-4 w-4" />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-200 hidden md:block">
                Admin
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar