import React from 'react'
import { Link } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl md:text-6xl font-bold text-primary mb-2">404</h1>
      <h2 className="text-2xl md:text-3xl font-semibold mb-4">Página no encontrada</h2>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        Lo sentimos, la página que buscas no existe o ha sido movida a otra ubicación.
      </p>
      <Link 
        to="/"
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        <FiArrowLeft className="mr-2 -ml-1 h-4 w-4" />
        Volver al Inicio
      </Link>
    </div>
  )
}

export default NotFound