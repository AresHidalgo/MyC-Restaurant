import React from 'react'

const PageHeader = ({ title, description, actions }) => {
  return (
    <div className="mb-6 pb-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      
      {actions && (
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          {actions}
        </div>
      )}
    </div>
  )
}

export default PageHeader