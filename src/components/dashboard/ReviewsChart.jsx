import React from 'react'

const ReviewsChart = ({ reviews, loading }) => {
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="h-32 w-full bg-gray-200 rounded"></div>
          <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const now = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const grouped = days.map(date => {
    const resenasDelDia = reviews.filter(r => {
      const reviewDate = new Date(r.fecha_resena).toISOString().split('T')[0];
      return reviewDate === date;
    });

    const promedio = resenasDelDia.length
      ? resenasDelDia.reduce((sum, r) => sum + r.calificacion, 0) / resenasDelDia.length
      : 0;




    return { fecha: date, promedio };
  });

  console.log("Reseñas recibidas:", reviews);
  console.log("Grouped data:", grouped);



  const maxRating = 5;

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="flex-1 flex items-end space-x-2">
        {grouped.map((item, index) => {
          const height = (item.promedio / maxRating) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center justify-end">
              <div
                className="w-full bg-primary-light rounded-t transition-all duration-300"
                style={{ height: `${height}%` }}
              ></div>
              <div className="mt-2 text-xs text-gray-500">
                {new Date(item.fecha).toLocaleDateString(undefined, { weekday: 'short' })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 text-center text-sm text-gray-500">
        Calificación promedio últimos 7 días
      </div>
    </div>
  );
};

export default ReviewsChart;
