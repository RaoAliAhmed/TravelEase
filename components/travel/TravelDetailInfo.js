import React from 'react';

const colorClasses = {
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    border: 'border-blue-600'
  },
  pink: {
    bg: 'bg-pink-100',
    text: 'text-pink-600',
    border: 'border-pink-600'
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-600',
    border: 'border-green-600'
  }
};

export default function TravelDetailInfo({
  item,
  type,
  color = 'blue',
  showSeats = false,
  showCompany = true,
  companyField = 'airline'
}) {
  const colors = colorClasses[color] || colorClasses.blue;
  const companyName = item[companyField] || item.busCompany || item.name;
  
  // Handle different field naming conventions
  const from = item.from || item.origin;
  const to = item.to || item.destination;
  const departureDate = new Date(item.departureDate || item.startDate);
  const arrivalDate = new Date(item.arrivalDate || item.endDate);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="mb-4 md:mb-0">
            {showCompany && (
              <span className={`${colors.bg} ${colors.text} px-2 py-1 rounded-full text-xs`}>
                {companyName}
              </span>
            )}
            <h2 className="text-2xl font-bold text-gray-800 mt-2">
              {from} → {to}
            </h2>
          </div>
          <div className="flex items-center">
            <div className="flex mr-2">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-5 h-5 ${i < Math.floor(item.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-gray-600">
              {item.rating?.toFixed(1) || 'N/A'}
            </span>
          </div>
        </div>
        
        <div className="border-t border-b border-gray-200 py-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Departure</h3>
              <p className="text-lg font-semibold text-gray-800">
                {departureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-sm text-gray-600">
                {departureDate.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500 mb-1">Duration</p>
                <p className="text-lg font-semibold text-gray-800">{item.duration}</p>
                <div className="flex items-center justify-center mt-1">
                  <div className={`w-2 h-2 rounded-full ${colors.border}`}></div>
                  <div className={`w-20 h-0.5 ${colors.border}`}></div>
                  <div className={`w-2 h-2 rounded-full ${colors.border}`}></div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Arrival</h3>
              <p className="text-lg font-semibold text-gray-800">
                {arrivalDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-sm text-gray-600">
                {arrivalDate.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {type !== 'trip' && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600">{type === 'bus' ? 'Bus Number' : 'Flight Number'}</span>
                <span className="text-gray-800 font-medium">{item[`${type}Number`]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{type === 'bus' ? 'Bus Company' : 'Airline'}</span>
                <span className="text-gray-800 font-medium">{companyName}</span>
              </div>
            </>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Price per {type === 'trip' ? 'Person' : 'Seat'}</span>
            <span className="text-gray-800 font-medium">${item.price}</span>
          </div>
          {showSeats && (
            <div className="flex justify-between">
              <span className="text-gray-600">Available Seats</span>
              <span className="text-gray-800 font-medium">{item.seats || 0}</span>
            </div>
          )}
          {type === 'trip' && item.description && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 