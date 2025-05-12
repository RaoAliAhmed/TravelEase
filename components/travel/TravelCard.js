import React from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

const colorClasses = {
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    button: 'bg-blue-600 hover:bg-blue-700'
  },
  pink: {
    bg: 'bg-pink-100',
    text: 'text-pink-600',
    button: 'bg-pink-600 hover:bg-pink-700'
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-600',
    button: 'bg-green-600 hover:bg-green-700'
  }
};

export default function TravelCard({ 
  item, 
  type, 
  color = 'blue',
  showSeats = false,
  showCompany = true,
  companyField = 'airline'
}) {
  const router = useRouter();
  const { data: session } = useSession();
  
  // Handle different field naming conventions
  const from = item.from || item.origin;
  const to = item.to || item.destination;
  const companyName = item[companyField] || item.busCompany || item.name;
  const departureDate = item.departureDate || item.startDate;
  const arrivalDate = item.arrivalDate || item.endDate;
  const colors = colorClasses[color] || colorClasses.blue;

  const handleBookClick = (e) => {
    e.stopPropagation();
    if (session) {
      router.push(`/${type}s/book/${item._id}`);
    } else {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(`/${type}s/${item._id}`)}`);
    }
  };

  const handleCardClick = () => {
    if (item._id) {
      router.push(`/${type}s/${item._id}`);
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Image */}
      <div className="relative h-48 w-full">
        <Image
          src={item.image || `/images/${type}-placeholder.jpg`}
          alt={item.name || `${from} to ${to}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          {showCompany && (
            <span className={`${colors.bg} ${colors.text} px-2 py-1 rounded-full text-xs`}>
              {companyName}
            </span>
          )}
          <span className={`${colors.text} font-medium text-xl`}>
            ${item.price}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 my-2">
          {type === 'trip' ? item.name : `${from} → ${to}`}
        </h3>

        <p className="text-sm text-gray-500">
          {new Date(departureDate).toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' })} • {item.duration}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(item.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="ml-1 text-sm text-gray-500">
              {item.rating?.toFixed(1) || 'N/A'}
            </span>
          </div>
          {showSeats && (
            <span className="text-sm text-gray-500">
              {item.seats || 0} seats left
            </span>
          )}
        </div>

        <button 
          className={`mt-4 w-full ${colors.button} text-white py-2 px-4 rounded-lg text-sm font-medium transition`}
          onClick={handleBookClick}
        >
          {session ? 'Book Now' : 'Sign In to Book'}
        </button>
      </div>
    </div>
  );
} 