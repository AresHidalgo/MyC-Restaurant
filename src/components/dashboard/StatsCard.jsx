import React from 'react'

const StatsCard = ({ title, value, icon: Icon, color, loading }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 transform transition duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <div className={`${color} h-10 w-10 rounded-full flex items-center justify-center text-white`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      
      {loading ? (
        <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
      ) : (
        <div className="text-2xl font-bold">{value}</div>
      )}
    </div>
  )
}

export default StatsCard