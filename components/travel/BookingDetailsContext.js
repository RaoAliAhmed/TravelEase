import React from 'react';
import Image from 'next/image';
import { useBus } from '@/context/BusContext';
import { useFlight } from '@/context/FlightContext';
import { useTrip } from '@/context/TripContext';

const colorClasses = {
  blue: {
    badge: 'bg-blue-100 text-blue-800',
    border: 'border-blue-200',
    text: 'text-blue-600'
  },
  pink: {
    badge: 'bg-pink-100 text-pink-800',
    border: 'border-pink-200',
    text: 'text-pink-600'
  },
  green: {
    badge: 'bg-green-100 text-green-800',
    border: 'border-green-200',
    text: 'text-green-600'
  }
};

const formatDateTime = (dateValue) => {
  if (!dateValue) return 'Not specified';
  
  const parsedDate = new Date(dateValue);
  
  if (isNaN(parsedDate.getTime())) {
    return 'Not specified';
  }
  
  return parsedDate.toLocaleString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

export default function BookingSummary({
  item,
  type,
  color = 'blue',
  showClass = false,
  selectedClass = null,
  companyField = 'company'
}) {
  const busContext = useBus();
  const flightContext = useFlight();
  const tripContext = useTrip();
  const context = { bus: busContext, flight: flightContext, trip: tripContext }[type] || {};


  const {
    passengerCount = 1,
    selectedClass: contextSelectedClass = null,
    basePrice,
    totalPrice
  } = context;

  const colors = colorClasses[color] || colorClasses.blue;
  const from = item.from || item.origin;
  const to = item.to || item.destination;
  const companyName = item[companyField]?.name || item[companyField];
  const departureDate = item.departureDate || item.date;
  const arrivalDate = item.arrivalDate;
  
  
  
  return (
    <div className={`bg-white rounded-lg shadow-sm border ${colors.border} p-6 mb-8`}>
      <div className="flex flex-col md:flex-row gap-6">

        <div className="w-full md:w-1/3">
          <div className="relative h-48 rounded-lg overflow-hidden">
            {item.image ? (
              <Image
                src={item.image}
                alt={`${from} to ${to}`}
                fill
                className="object-cover"
              />
            ) : (
              <div className={`w-full h-full ${colors.badge} flex items-center justify-center`}>
                <span className="text-2xl font-bold">{type.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {from} to {to}
              </h2>
              {companyName && (
                <div className={`inline-block ${colors.badge} px-3 py-1 rounded-full text-sm font-medium mb-4`}>
                  {companyName}
                </div>
              )}
            </div>
            {item.rating && (
              <div className="flex items-center">
                <span className="text-yellow-400 mr-1">★</span>
                <span className="text-gray-600">{item.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-sm text-gray-500">Departure</p>
              <p className="font-medium text-gray-800">
                {formatDateTime(departureDate)}
              </p>
            </div>
            {arrivalDate && (
              <div>
                <p className="text-sm text-gray-500">Arrival</p>
                <p className="font-medium text-gray-800">
                  {formatDateTime(arrivalDate)}
                </p>
              </div>
            )}
            {item.duration && (
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium text-gray-800">{item.duration}</p>
              </div>
            )}
            {showClass && contextSelectedClass && (
              <div>
                <p className="text-sm text-gray-500">Class</p>
                <p className="font-medium text-gray-800">{contextSelectedClass.name}</p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Base Price</span>
              <span className="font-medium text-black">${Number(basePrice || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Passengers</span>
              <span className="font-medium text-black">x{passengerCount}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="font-semibold text-gray-800">Total</span>
              <span className={`text-xl font-bold ${colorClasses[color]?.text || colorClasses.blue.text}`}>
                ${Number(totalPrice || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 