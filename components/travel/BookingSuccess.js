import React from 'react';
import Link from 'next/link';

const colorClasses = {
  blue: {
    button: 'bg-blue-600 hover:bg-blue-700',
    text: 'text-blue-600',
    border: 'border-blue-200',
    bg: 'bg-blue-50'
  },
  pink: {
    button: 'bg-pink-600 hover:bg-pink-700',
    text: 'text-pink-600',
    border: 'border-pink-200',
    bg: 'bg-pink-50'
  },
  green: {
    button: 'bg-green-600 hover:bg-green-700',
    text: 'text-green-600',
    border: 'border-green-200',
    bg: 'bg-green-50'
  }
};

export default function BookingSuccess({
  type,
  color = 'blue',
  bookingId,
  from,
  to,
  date,
  companyName,
  totalPrice,
  onViewBookings
}) {
  const colors = colorClasses[color] || colorClasses.blue;
  const typeTitle = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-lg p-8 text-center`}>
      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className={`w-8 h-8 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Booking Confirmed!
      </h2>

      <p className="text-gray-600 mb-6">
        Your {type} from {from} to {to} has been successfully booked.
      </p>

      <div className="bg-white rounded-lg p-6 mb-8 max-w-md mx-auto">
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Booking ID</span>
            <span className="font-medium">{bookingId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date</span>
            <span className="font-medium">{new Date(date).toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
          </div>
          {companyName && (
            <div className="flex justify-between">
              <span className="text-gray-600">Company</span>
              <span className="font-medium">{companyName}</span>
            </div>
          )}
          <div className="flex justify-between pt-4 border-t">
            <span className="font-semibold">Total Amount</span>
            <span className={`font-bold ${colors.text}`}>
              ${totalPrice.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={onViewBookings}
          className={`${colors.button} text-white px-6 py-2 rounded-lg font-medium transition w-full md:w-auto`}
        >
          View My Bookings
        </button>
        <Link
          href={`/${type}s`}
          className={`block ${colors.text} hover:underline`}
        >
          Book Another {typeTitle}
        </Link>
      </div>
    </div>
  );
} 