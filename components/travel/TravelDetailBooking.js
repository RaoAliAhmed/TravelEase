import React from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useBus } from '@/context/BusContext';
import { useFlight } from '@/context/FlightContext';
import { useTrip } from '@/context/TripContext';

const colorClasses = {
  blue: {
    button: 'bg-blue-600 hover:bg-blue-700',
    text: 'text-blue-600'
  },
  pink: {
    button: 'bg-pink-600 hover:bg-pink-700',
    text: 'text-pink-600'
  },
  green: {
    button: 'bg-green-600 hover:bg-green-700',
    text: 'text-green-600'
  }
};

export default function TravelDetailBooking({
  item,
  type,
  color = 'blue',
  showClass = true,
  classes = ['Economy', 'Business', 'First Class']
}) {
  const router = useRouter();
  const { data: session } = useSession();
  
  // Get the appropriate context based on type
  const busContext = useBus();
  const flightContext = useFlight();
  const tripContext = useTrip();
  
  // Select the context based on type
  const context = {
    bus: busContext,
    flight: flightContext,
    trip: tripContext
  }[type];

  const { passengerCount, setPassengerCount, selectedClass, setSelectedClass } = context;

  
  const colors = colorClasses[color] || colorClasses.blue;

  const getClassMultiplier = (className) => {
    switch (className) {
      case 'Business':
        return type === 'flight' ? 2.5 : 2;
      case 'First Class':
        return type === 'flight' ? 4 : 3;
      default:
        return 1;
    }
  };

  const totalPrice = (item.price * passengerCount * getClassMultiplier(selectedClass)).toFixed(2);

  const handleBookClick = () => {
    if (session) {
      router.push(`/${type}s/book/${item._id}`);
    } else {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(`/${type}s/${item._id}`)}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Book This {type.charAt(0).toUpperCase() + type.slice(1)}</h3>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Passengers
          </label>
          <select
            className="w-full px-3 text-black py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            value={passengerCount}
            onChange={(e) => setPassengerCount(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'Passenger' : 'Passengers'}
              </option>
            ))}
          </select>
        </div>

        {showClass && type !== 'trip' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class
            </label>
            <select
              className="w-full px-3 text-black py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              {classes.map((className) => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-200 pt-4 mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Price per {type === 'trip' ? 'Person' : 'Seat'}</span>
          <span className="text-gray-800">${item.price}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Passengers</span>
          <span className="text-gray-800">× {passengerCount}</span>
          {console.log(passengerCount)}
        </div>
        {showClass && type !== 'trip' && (
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Class</span>
            <span className="text-gray-800">× {getClassMultiplier(selectedClass)}</span>
          </div>
        )}
        <div className="flex justify-between pt-2 border-t border-gray-200">
          <span className="text-lg font-semibold text-gray-800">Total</span>
          <span className={`text-lg font-semibold ${colors.text}`}>${totalPrice}</span>
        </div>
      </div>
      
      <button
        className={`w-full ${colors.button} text-white py-3 rounded-lg font-medium transition`}
        onClick={handleBookClick}
      >
        {session ? 'Book Now' : 'Sign in to Book'}
      </button>
      
      {!session && (
        <p className="text-sm text-gray-500 text-center mt-2">
          You need to be signed in to book this {type}
        </p>
      )}
    </div>
  );
} 